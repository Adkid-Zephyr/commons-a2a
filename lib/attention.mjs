// A read-only projection of actual outcomes, not a second model or fabricated digest.
export function attentionBrief(state, ownerId, {mode='live',limit=5,offset=0}={}) {
 const owner=state.members.find(m=>m.id===ownerId);
 if(!owner)throw new Error('Unknown member');
 if(!['live','rehearsal'].includes(mode))throw new Error('Unknown execution mode');
 if(!Number.isInteger(limit)||limit<1||limit>50||!Number.isInteger(offset)||offset<0||offset>10000)throw new Error('Invalid attention pagination');
 const requests=new Map(state.requests.filter(r=>r.mode===mode).map(r=>[r.id,r]));
 const sessions=state.sessions.filter(s=>requests.has(s.requestId)&&[s.ownerId,s.candidateId].includes(ownerId));
 const sessionIds=new Set(sessions.map(s=>s.id));
 const events=state.events.filter(e=>requests.has(e.requestId)&&(sessionIds.has(e.sessionId)||(e.type==='digest'&&e.to===ownerId)||(!e.sessionId&&['error','no_match'].includes(e.type)&&requests.get(e.requestId)?.ownerId===ownerId)));
 const replay=owner.representation==='source_replay';
 const items=[];
 for(const s of sessions){
   const other=state.members.find(m=>m.id===(s.ownerId===ownerId?s.candidateId:s.ownerId));
   const pairReplay=replay||other?.representation==='source_replay';
   const needsApproval=s.status==='awaiting_approval'&&s.approvals[ownerId]==='pending'&&!pairReplay;
   const types={awaiting_approval:needsApproval?'decision':'waiting',needs_info:'missing_information',error:'failure',connected:'human_connection'};
   if(!types[s.status])continue;
   const last=events.filter(e=>e.sessionId===s.id).at(-1);
   const candidate=state.members.find(m=>m.id===s.candidateId);
   const c=state.connections.find(c=>c.sessionId===s.id);
   items.push({id:`session:${s.id}`,kind:types[s.status],priority:needsApproval?0:s.status==='error'?1:s.status==='needs_info'?2:s.status==='connected'?3:4,
     title:needsApproval?`Decide whether to connect with ${other.name}`:s.status==='connected'?`Continue with ${other.name}`:s.status==='error'?`An exchange with ${other.name} failed`:s.status==='needs_info'?`Missing information for ${other.name}`:`Waiting for the other owner: ${other.name}`,
     summary:(s.error||s.summary||'Inspect the exchange for details.').slice(0,500),
     requestId:s.requestId,sessionId:s.id,connectionId:c?.id??null,mode,at:last?.at??s.createdAt,
     counterpart:{id:other.id,name:other.name},sourceReplay:pairReplay,
     evidence:(candidate?.evidence??[]).filter(e=>(s.evidenceIds??[]).includes(e.id)),
     actions:needsApproval?['inspect_session','approve','decline']:s.status==='connected'&&!pairReplay&&c?['open_conversation']:['inspect_session']});
 }
 for(const e of events.filter(e=>e.type==='digest'||(e.type==='error'&&!e.sessionId)||e.type==='no_match')) {
   items.push({id:`event:${e.id}`,kind:e.type==='error'?'failure':'update',priority:e.type==='error'?1:5,
     title:e.type==='error'?'A request failed':e.type==='no_match'?'No new match this time':'A relevant community update',summary:e.message,
     requestId:e.requestId,eventId:e.id,mode,at:e.at,sourceReplay:replay,actions:['inspect_request'],evidence:[]});
 }
 items.sort((a,b)=>a.priority-b.priority||new Date(b.at)-new Date(a.at)||a.id.localeCompare(b.id));
 return {ownerId,dataset:state.dataset??'synthetic',mode,sourceReplay:replay,generatedAt:new Date().toISOString(),
   items:items.slice(offset,offset+limit),totalItems:items.length,offset,limit,hasMore:offset+limit<items.length,
   stats:{conversationsReviewed:sessions.length,agentTurns:events.filter(e=>e.model&&e.type!=='error').length,
     decisionsPending:items.filter(i=>i.kind==='decision').length,
     outcomesWithoutAction:sessions.filter(s=>['declined','withdrawn'].includes(s.status)).length},
   note:replay?'Historical source replay only. No real owner approval or representation.':'Only existing outcomes are summarized. No time-saved claim is inferred.'};
}
