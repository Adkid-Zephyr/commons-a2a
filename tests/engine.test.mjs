import test from 'node:test';
import assert from 'node:assert/strict';
import { Engine, verifyEvent } from '../lib/engine.mjs';
import { createStore } from '../lib/store.mjs';
import { modelTurn, makePacket } from '../lib/model.mjs';

function setup(turn){const store=createStore(':memory:');return {app:new Engine(store,turn),store};}
function req(overrides={}){return {ownerId:'maya',kind:'speaker',title:'Agent payment speaker',details:'A 20 minute talk next Thursday. Ask about availability.',topics:['payments','agents'],mode:'rehearsal',idempotencyKey:crypto.randomUUID(),authorized:true,...overrides};}

test('real engine routes independent contexts, clarifies, records decline, and honors information-only',async()=>{
 const calls=[];const {app,store}=setup(async(p,m)=>{calls.push(structuredClone(p));return modelTurn(p,m);});
 app.member('leo').privateNote='DO NOT SHARE PRIVATE TOKEN';
 const r=app.createRequest(req());await app.run(r.id);
 assert.equal(r.status,'completed');
 const leo=app.state.sessions.find(s=>s.candidateId==='leo');
 assert.equal(leo.status,'awaiting_approval');assert.equal(leo.turns,4);
 assert.equal(app.state.sessions.find(s=>s.candidateId==='oscar').status,'declined');
 assert.equal(app.state.sessions.find(s=>s.candidateId==='amina').status,'declined');
 assert(!app.state.sessions.some(s=>s.candidateId==='jin'));
 // Jin must still get a digest even if the outreach cap was reached.
 assert(app.state.events.some(e=>e.type==='digest'&&e.to==='jin'));
 assert(calls.some(c=>c.member.id==='maya'));assert(calls.some(c=>c.member.id==='leo'));
 assert(!JSON.stringify(calls).includes('DO NOT SHARE PRIVATE TOKEN'));
 for(const c of calls){assert(!('context' in c.counterpart));assert(c.history.every(h=>[c.member.id,c.counterpart.id].includes(h.from)));}
 for(const e of app.state.events.filter(e=>e.signature))assert(verifyEvent(e,app.member(e.from)));
 assert(!JSON.stringify(app.snapshot()).includes('PRIVATE TOKEN'));assert(!JSON.stringify(app.snapshot()).includes('PRIVATE KEY'));
 store.close();
});

test('both owners must approve, outsider rejected, repeated approval does not duplicate handoff',async()=>{
 const {app,store}=setup();const r=app.createRequest(req({topics:['payments']}));await app.run(r.id);
 const s=app.state.sessions.find(s=>s.candidateId==='leo');
 assert.throws(()=>app.approve(s.id,'jin','approved'),/Only/);
 app.approve(s.id,'maya','approved');assert.equal(app.state.connections.length,0);
 app.approve(s.id,'leo','approved');app.approve(s.id,'leo','approved');
 assert.equal(app.state.connections.length,1);
 const c=app.state.connections[0];assert.throws(()=>app.humanMessage(c.id,'jin','hello'),/participant/);
 app.humanMessage(c.id,'leo','Hello, happy to discuss.');assert.equal(c.messages.length,1);
 store.close();
});

test('rejection is terminal and recent pairs are suppressed in weekly recommendations',async()=>{
 const {app,store}=setup();const r=app.createRequest(req({topics:['payments']}));await app.run(r.id);
 const s=app.state.sessions.find(s=>s.candidateId==='leo');app.approve(s.id,'leo','declined');
 assert.throws(()=>app.approve(s.id,'maya','approved'),/not awaiting/);
 const r2=app.createRequest(req({topics:['payments']}));await app.run(r2.id);
 assert(!app.state.sessions.some(s=>s.requestId===r2.id));assert(app.state.events.some(e=>e.requestId===r2.id&&e.type==='no_match'));
 assert.equal(app.state.connections.length,0);store.close();
});

test('unknown evidence is rejected and provider failure never becomes a fabricated proposal',async()=>{
 const {app,store}=setup(async()=>{throw new Error('provider unavailable');});const r=app.createRequest(req());await app.run(r.id);
 assert.equal(r.status,'completed_with_errors');assert(app.state.sessions.every(s=>s.status==='error'));assert.equal(app.state.connections.length,0);store.close();
 const b=setup(async(p)=>({reply:{action:p.phase==='inquire'?'inquiry':'proposal',message:'I own another member’s repo.',reason:'test',evidenceIds:['invented-id']},usage:null}));
 const q=b.app.createRequest(req());await b.app.run(q.id);assert(b.app.state.sessions.every(s=>s.status==='error'));b.store.close();
});

test('idempotency survives persistence and rerunning a completed job does not resend messages',async()=>{
 const {app,store}=setup();const input=req();const r=app.createRequest(input);assert.equal(app.createRequest(input).id,r.id);
 await app.run(r.id);const count=app.state.events.length;await app.run(r.id);assert.equal(app.state.events.length,count);
 const restored=new Engine(store);assert.equal(restored.state.events.length,count);assert.equal(restored.createRequest(input).id,r.id);store.close();
});

test('availability policy overrides model proposal and missing evidence requires owner input',async()=>{
 const {app,store}=setup(async(p)=>({reply:{action:p.phase==='inquire'?'inquiry':'proposal',message:'Please confirm.',reason:'test',evidenceIds:[]},usage:null,model:'test'}));
 const r=app.createRequest(req());await app.run(r.id);
 assert.equal(app.state.sessions.find(s=>s.candidateId==='oscar').status,'declined');
 assert.equal(app.state.sessions.find(s=>s.candidateId==='leo').status,'needs_info');store.close();
});

test('tampering with a signed message fails verification',async()=>{
 const {app,store}=setup();const e=app.event({from:'leo',type:'reply',message:'Original'});
 assert(verifyEvent(e,app.member('leo')));assert(!verifyEvent({...e,message:'Changed'},app.member('leo')));store.close();
});

test('member onboarding requires consent and secure evidence links',()=>{
 const {app,store}=setup();const m={name:'Test',role:'builder',context:'Public intro',goals:'Find a collaborator',skills:['react'],availability:'unknown',participation:'connect',evidence:[],consent:true};
 assert.throws(()=>app.addMember({...m,consent:false}));
 assert.throws(()=>app.addMember({...m,evidence:[{id:'a',title:'bad',url:'javascript:alert(1)',summary:'bad'}]}));
 const added=app.addMember(m);assert(added.id);assert.equal(added.synthetic,false);store.close();
});

test('profile changes withdraw pending approvals so outdated context cannot be approved',async()=>{
 const {app,store}=setup();const r=app.createRequest(req());await app.run(r.id);
 const s=app.state.sessions.find(s=>s.candidateId==='leo');
 app.updateMember('leo',{...app.member('leo'),availability:'unavailable'});
 assert.equal(s.status,'withdrawn');assert.throws(()=>app.approve(s.id,'maya','approved'));
 store.close();
});

test('rehearsal contacts do not suppress live runs, while same-mode cooldown still applies',async()=>{
 const {app,store}=setup((p)=>modelTurn(p,'rehearsal'));
 const simulated=app.createRequest(req({topics:['payments']}));await app.run(simulated.id);
 const live=app.createRequest(req({topics:['payments'],mode:'live'}));await app.run(live.id);
 assert(app.state.sessions.some(s=>s.requestId===live.id&&s.candidateId==='leo'));
 const again=app.createRequest(req({topics:['payments'],mode:'live'}));await app.run(again.id);
 assert(!app.state.sessions.some(s=>s.requestId===again.id));store.close();
});

test('queued requests cannot overlap and interrupted queues are marked on restart',()=>{
 const {app,store}=setup();app.createRequest(req());
 assert.throws(()=>app.createRequest(req()),/queued or running/);
 const restored=new Engine(store);assert.equal(restored.state.requests[0].status,'interrupted');store.close();
});

test('invalid phase actions retain model-call diagnostics and do not create proposals',async()=>{
 const {app,store}=setup(async(p)=>({reply:{action:'inquiry',message:'A question',reason:'Test only',evidenceIds:[]},usage:{total_tokens:100},model:'stub',call:{id:'stub-'+p.member.id,agentId:p.member.id}}));
 const r=app.createRequest(req({topics:['frontend']}));await app.run(r.id);
 const failure=app.state.events.find(e=>e.type==='error');
 assert.equal(failure.rejectedAction,'inquiry');assert.equal(failure.usage.total_tokens,100);
 assert.equal(failure.call.agentId,'amina');assert.equal(app.state.connections.length,0);
 assert(app.state.sessions.every(s=>s.status==='error'));store.close();
});
