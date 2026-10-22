import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../lib/engine.mjs';
import {createStore} from '../lib/store.mjs';
import {createDemo,createFollowup} from '../lib/demo.mjs';
import {attentionBrief} from '../lib/attention.mjs';
import {modelTurn} from '../lib/model.mjs';
const key=()=>crypto.randomUUID();
test('repeatable fixture demo preserves history and normal cooldown still applies',async()=>{
 const db=createStore(':memory:'),app=new Engine(db);
 for(let i=0;i<2;i++){const r=createDemo(app,{scenario:'collaborator',mode:'rehearsal',idempotencyKey:key()});await app.run(r.id);assert(app.state.sessions.some(s=>s.requestId===r.id&&s.candidateId==='amina'));}
 assert.equal(app.state.sessions.length,2);
 const normal=app.createRequest({ownerId:'leo',kind:'collaborator',title:'Normal request',details:'Need help with frontend accessibility.',topics:['frontend'],mode:'rehearsal',authorized:true,idempotencyKey:key()});await app.run(normal.id);assert(!app.state.sessions.some(s=>s.requestId===normal.id));db.close();
});
test('owner clarification continues only the selected incomplete pair with fresh approvals',async()=>{
 const db=createStore(':memory:');let needsInfo=true;
 const app=new Engine(db,async(p,m)=>p.phase==='respond'&&needsInfo?{reply:{action:'needs_info',message:'Which screen needs work?',reason:'Missing scope.',evidenceIds:[]},model:'test'}:modelTurn(p,m));
 const r=createDemo(app,{scenario:'collaborator',mode:'rehearsal',idempotencyKey:key()});await app.run(r.id);
 const s=app.state.sessions[0];assert.equal(s.status,'needs_info');
 assert(attentionBrief(app.state,'leo',{mode:'rehearsal'}).items[0].actions.includes('clarify_request'));
 assert.throws(()=>createFollowup(app,{sessionId:s.id,ownerId:'maya',details:'Focus on the authorization screen.',idempotencyKey:key()}),/Only the request owner/);
 needsInfo=false;
 const args={sessionId:s.id,ownerId:'leo',details:'Focus on labels and keyboard navigation in the authorization screen.',idempotencyKey:key()};
 const next=createFollowup(app,args);assert.equal(createFollowup(app,args).id,next.id);await app.run(next.id);
 const active=app.state.sessions.filter(x=>x.requestId===next.id);assert.equal(active.length,1);assert.equal(active[0].candidateId,'amina');assert.equal(active[0].status,'awaiting_approval');assert(Object.values(active[0].approvals).every(v=>v==='pending'));
 assert.equal(s.status,'needs_info');assert(!attentionBrief(app.state,'leo',{mode:'rehearsal'}).items.some(i=>i.sessionId===s.id));
 assert.throws(()=>createFollowup(app,{...args,idempotencyKey:key()}),/already has/);db.close();
});
test('source replay cannot run demo or owner clarification and idempotency cannot change scenario',async()=>{
 const db=createStore(':memory:'),app=new Engine(db);const k=key();createDemo(app,{scenario:'speaker',mode:'rehearsal',idempotencyKey:k});
 assert.throws(()=>createDemo(app,{scenario:'collaborator',mode:'rehearsal',idempotencyKey:k}),/different operation/);
 app.state.dataset='discord-replay';assert.throws(()=>createDemo(app,{scenario:'speaker',mode:'rehearsal',idempotencyKey:key()}),/only available/);
 app.state.sessions.push({id:'s',ownerId:'leo',candidateId:'amina',status:'needs_info'});
 assert.throws(()=>createFollowup(app,{sessionId:'s',ownerId:'leo',details:'Updated information for the test.',idempotencyKey:key()}),/Source replay/);db.close();
});
