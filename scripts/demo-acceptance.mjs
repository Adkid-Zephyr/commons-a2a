// Explicit live synthetic demo acceptance. Approvals are simulated by this local
// test operator, NEVER real community members; no external messages are sent.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:3402',url=base+'/api?dataset=synthetic';
async function get(){const r=await fetch(url);const d=await r.json();if(!r.ok)throw Error(d.error);return d;}
async function post(body){const r=await fetch(url,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error);return d;}
const before=await get();assert(before.configured,'Model must be configured');
assert(before.members.filter(m=>['leo','amina'].includes(m.id)).every(m=>m.synthetic&&m.representation!=='source_replay'));
const request=await post({action:'demo',scenario:'collaborator',mode:'live',idempotencyKey:crypto.randomUUID()});
console.log('Live repeatable demo:',request.id);
let state,run;const deadline=Date.now()+180000;
while(Date.now()<deadline){state=await get();run=state.requests.find(r=>r.id===request.id);if(!['queued','running'].includes(run.status))break;await new Promise(r=>setTimeout(r,1500));}
const session=state.sessions.find(s=>s.requestId===request.id&&s.candidateId==='amina');
assert.equal(run.status,'completed');assert.equal(session?.status,'awaiting_approval');
const brief=await(await fetch(`${url}&view=attention&ownerId=leo`)).json();assert(brief.items.some(i=>i.sessionId===session.id&&i.kind==='decision'));
await post({action:'approve',sessionId:session.id,ownerId:'leo',decision:'approved'});
assert(!(await get()).connections.some(c=>c.sessionId===session.id));
await post({action:'approve',sessionId:session.id,ownerId:'amina',decision:'approved'});
state=await get();const connection=state.connections.find(c=>c.sessionId===session.id);assert(connection);
await post({action:'message',connectionId:connection.id,ownerId:'leo',message:'Synthetic demo QA: let’s review the keyboard-navigation scope together.'});
state=await get();assert.equal(state.connections.find(c=>c.id===connection.id).messages.length,1);
const events=state.events.filter(e=>e.requestId===request.id);const calls=events.filter(e=>e.call);
assert(calls.length>=2&&calls.every(e=>e.mode==='live'&&e.model!=='deterministic-rehearsal'));
const report={checkedAt:new Date().toISOString(),request,session:state.sessions.find(s=>s.id===session.id),events,connection:state.connections.find(c=>c.id===connection.id),checks:{liveModelCalls:calls.length,attentionDecision:true,oneApprovalBlockedHandoff:true,twoTestApprovalsCreatedRoom:true,localHumanMessage:true,externalCommunityWrites:0,realMemberApproval:false}};
await mkdir('docs/evidence',{recursive:true});const path=`docs/evidence/demo-acceptance-${request.id}.json`;await writeFile(path,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({path,checks:report.checks},null,2));
