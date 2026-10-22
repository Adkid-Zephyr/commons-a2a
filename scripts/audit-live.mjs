// Read-only audit of saved synthetic runs against current, unchanged profiles.
// Does not make model calls or approve any connection.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {makePacket} from '../lib/model.mjs';
import {verifyEvent} from '../lib/engine.mjs';
const data=await (await fetch('http://127.0.0.1:3402/api')).json();
const reports=[];
for(const path of process.argv.slice(2)){
 const r=JSON.parse(await readFile(path,'utf8'));
 const checks=r.events.filter(e=>e.call&&e.type!=='error').map(e=>{
  const self=data.members.find(m=>m.id===e.from),other=data.members.find(m=>m.id===e.to);
  assert(self.synthetic&&other.synthetic,'Audit only fixture profiles');
  const history=r.events.filter(h=>h.sessionId===e.sessionId&&h.seq<e.seq&&h.type!=='executing');
  const packet=makePacket(self,other,r.request,history,e.call.phase);
  return {callId:e.call.id,agentId:e.from,phase:e.call.phase,
    scopedInputHashMatches:createHash('sha256').update(JSON.stringify(packet)).digest('hex')===e.call.inputHash,
    signatureValid:verifyEvent(e,self),durationMs:e.call.durationMs};
 });
 assert(checks.length>0&&checks.every(c=>c.scopedInputHashMatches&&c.signatureValid));
 reports.push({path,requestId:r.request.id,checks});
}
assert(reports.length>0);
await writeFile('docs/evidence/live-context-audit.json',JSON.stringify({checkedAt:new Date().toISOString(),note:'Reconstructed from unchanged synthetic public profiles and each pair history. No model calls.',reports},null,2)+'\n');
console.log(`PASS: ${reports.reduce((n,r)=>n+r.checks.length,0)} scoped input hashes and agent signatures verified across ${reports.length} runs.`);
