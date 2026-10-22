export function selectedRun(state,id){return state?.requests.find(r=>r.id===id)??state?.requests.at(-1)??null;}
export function runEvents(state,requestId){return (state?.events??[]).filter(e=>e.requestId===requestId).sort((a,b)=>a.seq-b.seq);}
export function metrics(state,requestId,ownerId){
 const sessions=(state?.sessions??[]).filter(s=>s.requestId===requestId);
 return {handled:sessions.filter(s=>['declined','withdrawn'].includes(s.status)).length,calls:runEvents(state,requestId).filter(e=>e.call&&e.type!=='error').length,decisions:sessions.filter(s=>s.status==='awaiting_approval'&&s.approvals[ownerId]==='pending'&&[s.ownerId,s.candidateId].includes(ownerId)).length};
}
export function playbackSlice(events,cursor){return cursor==null?events:events.slice(0,Math.max(0,Math.min(events.length,cursor)));}
export function isReplayDataset(state){return Boolean(state&&state.dataset!=='synthetic');}
export function memberLabel(member){return member?.representation==='source_replay'?'Historical source · no owner consent':member?.synthetic?'Fictional member':'Operator-provided member';}
