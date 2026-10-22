// Actual local extraction from supplied messages. No probabilities or fabricated counts.
// The animation is a seekable presentation of extraction results, not model reasoning.
import {routeSlot} from './reference/motion.js';
export const ROUTES=['code','model','topic','you'];
export const LABELS={code:'people',model:'signals',topic:'keywords',you:'events'};
export const COLORS={code:'#b5c8bd',model:'#d5afa2',topic:'#b7add5',you:'#d8c8a3'};
const STOP=new Set('a an the is are was were be been of for to in on at and or but with it this that i we you my our your have has can do not only from as by into all'.split(' '));
const clean=s=>s.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
function wrap(text,width=36){const out=[];let row='';for(const word of text.split(/\s+/)){if(row&&row.length+word.length+1>width){out.push(row);row='';}row+=(row?' ':'')+word;}if(row)out.push(row);return out;}
export function sourceFromState(data,requestId){
 const run=data.requests.find(r=>r.id===requestId)??data.requests.at(-1);
 const messages=data.members.map(m=>({author:m.name.replaceAll(' ','_'),memberId:m.id,kind:m.representation==='source_replay'?'source excerpt':'profile context',text:`${m.context} Goal: ${m.goals}`,sourceRef:m.sourceRef??m.id}));
 for(const q of data.requests.slice(-3))messages.push({author:data.members.find(m=>m.id===q.ownerId)?.name.replaceAll(' ','_')??'Request',memberId:q.ownerId,kind:`request ${q.mode}`,text:q.details,sourceRef:q.id});
 for(const e of data.events.filter(e=>e.mode==='live'&&e.model&&e.type!=='error').slice(-12))messages.push({author:(data.members.find(m=>m.id===e.from)?.name??'Agent').replaceAll(' ','_'),memberId:e.from,kind:`agent live ${e.type}`,text:e.message,sourceRef:e.id});
 return {messages,request:run,text:messages.map(m=>`${m.author}: [${m.kind}] ${m.text}`).join('\n\n'),sourceLabel:data.dataset==='synthetic'?'FICTIONAL COMMUNITY + ACTUAL A2A RECORDS':'ANONYMIZED SOURCE REPLAY / NO OWNER CONSENT'};
}
export function communityRun(text,members=[],meta={}){
 const sourceLines=[],sources=[],tokens=[];
 const blocks=text.replace(/\r\n?/g,'\n').split(/\n\s*\n/).filter(x=>x.trim());
 const names=new Map(members.flatMap(m=>[[clean(m.name.replaceAll(' ','_')),m.id],[clean(m.name),m.id]]));
 const keywords=new Set(['ai','agents','agent','a2a','api','llm','react','python','typescript','payments','accessibility','robotics','data','sql','pytorch',...members.flatMap(m=>m.skills.map(clean))]);
 blocks.forEach((block,messageIndex)=>{
   const author=block.match(/^([^:\n]{1,45}):/)?.[1]?.trim();if(author&&!names.has(clean(author)))names.set(clean(author),null);
   const message={id:messageIndex,author:author??'Community',text:block};sources.push(message);
   for(const line of wrap(block)){const lineIndex=sourceLines.length;sourceLines.push(line);for(const word of line.match(/\S+/gu)??[])tokens.push({word,line:lineIndex,messageIndex});}
   sourceLines.push('');
 });
 const decisions=[];
 tokens.forEach((token,index)=>{
  const word=clean(token.word);let route=null,reason='',memberId=null;
  if(names.has(word)){route='code';reason='speaker / member mention';memberId=names.get(word);}
  else if(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|meetup|workshop|hackathon|event|events|talk|session|tonight|tomorrow|\d{1,2}:\d{2}|\d{4}-\d{2}-\d{2})$/.test(word)){route='you';reason='event or time mention';}
  else if(keywords.has(word)){route='topic';reason='matches community vocabulary';}
  else if(/^(looking|seeking|need|needs|help|join|collaborator|collaboration|available|unavailable|team|teammates|hiring|offer|built|experience|goal|scope|hours|two-hour|deadline|confirm|approval|evidence|clarify|interested|propose|share|learn|learning|contribute|working|requirements|frontend|backend)$/.test(word)){route='model';reason='need, offer or constraint';}
  if(route&&!STOP.has(word)&&decisions.length<280)decisions.push({...token,index,route,question:reason,memberId,ordinal:decisions.length});
 });
 const duration=24,total=tokens.length,slots=Math.max(1,Math.min(280,total));
 decisions.forEach((d,i)=>Object.assign(d,{slot:routeSlot(i,slots),launchTime:.3+i/Math.max(1,decisions.length-1)*22,flightDuration:1.08,time:1.38+i/Math.max(1,decisions.length-1)*22}));
 return {sourceLines,tokens,decisions,sources,total,duration,mode:'community',...meta,provenance:'Local exact-name, topic-vocabulary and pattern extraction. Categories are candidates, not verified facts. Animation replays these results; live A2A calls are reported separately.'};
}
export function communityState(run,elapsed,extra={}){
 const time=Math.max(0,Math.min(run.duration,elapsed)),decisions=run.decisions.filter(d=>d.time<=time),scanned=run.decisions.filter(d=>d.launchTime<=time);
 const counts={code:0,model:0,topic:0,you:0};for(const d of decisions)counts[d.route]++;
 return {...run,elapsed:time,decisions,scanned,flights:run.decisions.filter(d=>d.launchTime<=time&&d.launchTime+d.flightDuration>time),probeEvents:run.decisions.filter(d=>d.launchTime-.26<=time&&d.launchTime+.52>=time),counts,read:Math.floor(time/run.duration*run.total),routeFilter:'all',selectedIndex:null,reducedMotion:false,...extra};
}
