// Explicit live model test; all outputs remain in ignored private-data/.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dataset=process.argv[2]??'discord-replay';
assert(['discord-replay','organizer-replay'].includes(dataset));
const base='http://127.0.0.1:3402',url=`${base}/api?dataset=${dataset}`;
async function read(){const r=await fetch(url);const d=await r.json();if(!r.ok)throw Error(d.error);return d;}
const before=await read();assert(before.configured);
assert(before.members.every(m=>m.representation==='source_replay'&&m.ownerConsent===false&&m.availability==='unknown'));
const sample=before.sourceInfo.requests[0];assert(sample);
const {sourceRef,...fields}=sample;
const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({action:'request',request:{...fields,mode:'live',authorized:true,idempotencyKey:crypto.randomUUID()}})});
const request=await res.json();if(!res.ok)throw Error(request.error);
console.log(JSON.stringify({dataset,requestId:request.id,sourceMembers:before.members.length}));
let data,run;const deadline=Date.now()+240000;let last=-1;
while(Date.now()<deadline){data=await read();run=data.requests.find(r=>r.id===request.id);const n=data.events.filter(e=>e.requestId===request.id&&e.call).length;if(n!==last){console.log(`${n} model calls; ${run.status}`);last=n;}if(!['queued','running'].includes(run.status))break;await new Promise(r=>setTimeout(r,1500));}
const events=data.events.filter(e=>e.requestId===request.id),sessions=data.sessions.filter(s=>s.requestId===request.id);
const calls=events.filter(e=>e.call);
const summary={dataset,requestId:run.id,status:run.status,modelCalls:calls.length,sourceMembers:data.members.length,sourceKind:data.sourceInfo.sourceKind,ownerConsent:false,externalCommunityWrites:0,connections:data.connections.length,outcomes:sessions.map(s=>({candidate:s.candidateId,status:s.status,turns:s.turns,error:s.error}))};
await mkdir(`private-data/${dataset}`,{recursive:true,mode:0o700});
await writeFile(`private-data/${dataset}/run-${run.id}.json`,JSON.stringify({checkedAt:new Date().toISOString(),sourceInfo:data.sourceInfo,request:run,events,sessions,summary},null,2)+'\n',{mode:0o600});
console.log(JSON.stringify(summary,null,2));
assert.equal(run.status,'completed');assert(calls.length>=2);assert(calls.every(e=>e.mode==='live'&&e.model!=='deterministic-rehearsal'));assert.equal(data.connections.length,0);
assert(sessions.every(s=>['needs_info','declined'].includes(s.status)),'Unknown source consent must not become an accepted introduction');
console.log('PASS: real-source replay with live model calls; no inferred consent or external action.');
