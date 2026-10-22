import { z } from 'zod';
import { seeds } from './seed.mjs';

const DemoInput=z.object({scenario:z.enum(['speaker','collaborator']),mode:z.enum(['live','rehearsal']),idempotencyKey:z.string().min(8).max(100)});
const FollowupInput=z.object({sessionId:z.string(),ownerId:z.string(),details:z.string().trim().min(10).max(1500),idempotencyKey:z.string().min(8).max(100)});
function existing(app,key){return app.state.requests.find(r=>r.idempotencyKey===key);}
export function createDemo(app,input){
 const d=DemoInput.parse(input);
 if(app.state.dataset!=='synthetic')throw new Error('Repeatable demo is only available in the synthetic fixture dataset');
 if(seeds.some(s=>!app.state.members.some(m=>m.id===s.id&&m.synthetic&&m.representation!=='source_replay')))throw new Error('Original synthetic fixture members are required');
 const prior=existing(app,d.idempotencyKey);
 if(prior){if(!prior.demoRun||prior.demoScenario!==d.scenario||prior.mode!==d.mode)throw new Error('Idempotency key belongs to a different operation');return prior;}
 const speaker=d.scenario==='speaker';
 const r=app.createRequest({ownerId:speaker?'maya':'leo',kind:d.scenario,
   title:speaker?'Demo: find a practical agent payments speaker':'Demo: find a React accessibility collaborator',
   details:speaker?'A London builder meetup needs a 20-minute practical talk on agent payment authorization and receipts, using a testnet demo, then 10 minutes of questions. Date and participation require both owners to confirm.':'A two-hour collaboration to improve keyboard navigation and screen-reader labels on the existing authorization and receipt screens of an agent payment demo. No backend changes, no new payment features, no ongoing maintenance. Time and participation require both owners to confirm.',
   topics:speaker?['payments','agents']:['frontend','react'],mode:d.mode,authorized:true,idempotencyKey:d.idempotencyKey});
 r.demoRun=true;r.demoScenario=d.scenario;app.save();return r;
}

export function createFollowup(app,input){
 const d=FollowupInput.parse(input);
 const s=app.state.sessions.find(s=>s.id===d.sessionId);if(!s)throw new Error('Unknown session');
 if(s.ownerId!==d.ownerId)throw new Error('Only the request owner can clarify the request');
 if(app.state.dataset!=='synthetic'||[s.ownerId,s.candidateId].some(id=>app.member(id).representation==='source_replay'))throw new Error('Source replay cannot accept invented owner clarification');
 const prior=existing(app,d.idempotencyKey);
 if(prior){if(prior.parentSessionId!==s.id||prior.ownerId!==d.ownerId||prior.ownerClarification!==d.details)throw new Error('Idempotency key belongs to a different operation');return prior;}
 if(!['needs_info','error'].includes(s.status))throw new Error('Only incomplete or failed exchanges can be continued');
 if(s.followupRequestId)throw new Error('This exchange already has a follow-up');
 const original=app.state.requests.find(r=>r.id===s.requestId);
 const depth=(original.followupDepth??0)+1;if(depth>2)throw new Error('Follow-up limit reached; review this conversation directly');
 const r=app.createRequest({ownerId:d.ownerId,kind:original.kind,title:original.title,details:`${original.details}\n\nRequest owner clarification: ${d.details}`,topics:original.topics,mode:original.mode,authorized:true,idempotencyKey:d.idempotencyKey});
 Object.assign(r,{parentSessionId:s.id,targetCandidateId:s.candidateId,followupDepth:depth,ownerClarification:d.details});
 s.followupRequestId=r.id;
 app.event({requestId:r.id,from:d.ownerId,to:s.candidateId,type:'owner_clarification',message:d.details,actor:'human-test-operator',parentSessionId:s.id,mode:r.mode});
 app.save();return r;
}
