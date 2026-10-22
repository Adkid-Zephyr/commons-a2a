// Explicit opt-in real-model acceptance run. Uses only built-in fictional people.
// Run once with the local application already running; never runs under npm test.
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { makePacket } from '../lib/model.mjs';
import { verifyEvent } from '../lib/engine.mjs';

const base='http://127.0.0.1:3402';
async function get(){const r=await fetch(`${base}/api`);if(!r.ok)throw Error(`API ${r.status}`);return r.json();}
async function post(body){const r=await fetch(`${base}/api`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error);return d;}
const initial=await get();
assert(initial.configured,'Live model configuration required');
assert(initial.members.filter(m=>['maya','leo','amina','oscar','jin'].includes(m.id)).every(m=>m.synthetic),'Only synthetic seed profiles permitted for this check');
const scenario=process.argv[2]??'speaker';
assert(['speaker','collaborator'].includes(scenario));
const input=scenario==='speaker'?{
 ownerId:'maya',kind:'speaker',title:'Live test: a practical agent payments speaker',
 details:'London builders meetup, Thursday 29 October 2026, 18:30 London time. A 20-minute practical talk on authorization and payment receipts, then 10 minutes of questions. We need a testnet demo, not investment advice. Final date and participation require both owners to approve.',topics:['payments','agents'],
}:{
 ownerId:'leo',kind:'collaborator',title:'Live test: frontend help for a payment demo',
 details:'I want to improve the accessibility of an agent-payment demo. Need a React collaborator for two hours this week; no ongoing maintenance. Please suggest a narrow deliverable and clarify the scope if necessary. Final commitment requires both owners to approve.',topics:['frontend','react'],
};
const req=await post({action:'request',request:{...input,mode:'live',authorized:true,idempotencyKey:randomUUID()}});
console.log(`Started ${scenario}: ${req.id}`);
let data,request;const deadline=Date.now()+240000;let lastCount=-1;
while(Date.now()<deadline){
 data=await get();request=data.requests.find(r=>r.id===req.id);
 const calls=data.events.filter(e=>e.requestId===req.id&&e.call);
 if(calls.length!==lastCount){console.log(`${calls.length} live model calls; status=${request.status}`);lastCount=calls.length;}
 if(!['queued','running'].includes(request.status))break;
 await new Promise(resolve=>setTimeout(resolve,1500));
}
const events=data.events.filter(e=>e.requestId===req.id);
const sessions=data.sessions.filter(s=>s.requestId===req.id);
const calls=events.filter(e=>e.call);
const contextChecks=calls.filter(e=>e.type!=='error').map(e=>{
 const m=data.members.find(m=>m.id===e.from),other=data.members.find(m=>m.id===e.to);
 const history=events.filter(h=>h.sessionId===e.sessionId&&h.seq<e.seq&&h.type!=='executing');
 const packet=makePacket(m,other,request,history,e.call.phase);
 return {callId:e.call.id,agentId:e.from,scopedInputHashMatches:createHash('sha256').update(JSON.stringify(packet)).digest('hex')===e.call.inputHash,signatureValid:verifyEvent(e,m)};
});
const report={checkedAt:new Date().toISOString(),scenario,request,model:data.model,sessions,events,
 contextChecks,summary:{status:request.status,calls:calls.length,agents:[...new Set(calls.map(e=>e.from))],providerReportedTokens:calls.reduce((n,e)=>n+(e.usage?.total_tokens??0),0),unknownUsageCalls:calls.filter(e=>e.usage?.total_tokens==null).length,externalCommunityWrites:0}};
await mkdir('docs/evidence',{recursive:true});
const path=`docs/evidence/live-${scenario}-${req.id}.json`;
await writeFile(path,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({path,summary:report.summary,outcomes:sessions.map(s=>({member:s.candidateId,status:s.status,turns:s.turns,error:s.error}))},null,2));
assert.equal(request.status,'completed','Request failed or did not finish; inspect saved evidence');
assert(calls.length>=2,'No actual multi-agent model exchange');
assert.equal(new Set(calls.map(e=>e.call.id)).size,calls.length,'Each turn must have its own call');
assert(calls.every(e=>e.mode==='live'&&e.model!=='deterministic-rehearsal'&&e.call.agentId===e.from));
assert(new Set(calls.map(e=>e.from)).size>=2);
assert(contextChecks.every(c=>c.scopedInputHashMatches&&c.signatureValid),'Scoped context hashes and agent signatures must match');
assert(events.every(e=>e.model!=='deterministic-rehearsal'),'No offline fallback allowed');
assert(!data.connections.some(c=>sessions.some(s=>s.id===c.sessionId)),'No owner approvals were performed by the test');
console.log('PASS: real per-agent calls, no rehearsal fallback, no automatic human handoff.');
