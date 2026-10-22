'use client';
import {PersonGlyph} from './brand';
export default function Network({members,sessions,events,ownerId,selected,onSelect,onSession,playing,requestRunning}:{members:any[];sessions:any[];events:any[];ownerId:string;selected:string;onSelect:(id:string)=>void;onSession:(id:string)=>void;playing:boolean;requestRunning:boolean}){
 const dense=members.length>8;
 const center=members.find(m=>m.id===ownerId)??members[0];
 const others=members.filter(m=>m.id!==center?.id);
 const positions=new Map<string,{x:number;y:number}>();
 if(center)positions.set(center.id,{x:370,y:215});
 others.forEach((m,i)=>{const angle=(-145+i*360/Math.max(others.length,1))*Math.PI/180;positions.set(m.id,{x:370+Math.cos(angle)*245,y:215+Math.sin(angle)*140});});
 if(dense){
  const cols=members.length>24?8:6;const rows=Math.ceil(members.length/cols);
  members.forEach((m,i)=>positions.set(m.id,{x:65+(i%cols)*(670/(cols-1)),y:55+Math.floor(i/cols)*(315/Math.max(rows-1,1))}));
 }
 const current=events.at(-1);
 const isMoving=playing||requestRunning;
 return <div className={`network-canvas ${dense?'dense-network':''}`}><svg viewBox="0 0 800 440" role="group" aria-label="Member network from recorded agent events">
 <defs><pattern id="network-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#2a2a2a"/></pattern><radialGradient id="network-halo"><stop stopColor="#fff" stopOpacity=".035"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs>
 <rect width="800" height="440" fill="url(#network-dots)"/><ellipse cx="370" cy="215" rx="300" ry="200" fill="url(#network-halo)"/>
 <path d="M18 34V18H34M766 18H782V34M18 406V422H34M766 422H782V406" stroke="#4a4a4a" fill="none"/>
 {sessions.map(s=>{const a=positions.get(s.ownerId),b=positions.get(s.candidateId);if(!a||!b)return null;const seen=events.filter(e=>e.sessionId===s.id);if(!seen.length)return null;const hot=isMoving&&current?.sessionId===s.id;const last=seen.at(-1);const declined=['decline','declined'].includes(last?.type);return <g key={s.id} role="button" tabIndex={0} aria-label={`Inspect exchange with ${members.find(m=>m.id===s.candidateId)?.name}`} onClick={()=>onSession(s.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')onSession(s.id)}} className={`network-link ${hot?'hot':''} ${declined?'declined':''}`}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="link-hit"/><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="link-line"/>{hot&&<circle r="3" fill="#ededed"><animateMotion dur="1.7s" repeatCount="indefinite" path={current?.from===s.candidateId?`M${b.x},${b.y} L${a.x},${a.y}`:`M${a.x},${a.y} L${b.x},${b.y}`}/></circle>}</g>})}
 {members.map(m=>{const p=positions.get(m.id);if(!p)return null;const active=isMoving&&[current?.from,current?.to].includes(m.id);const chosen=selected===m.id;return <g key={m.id} transform={`translate(${p.x} ${p.y})`} role="button" tabIndex={0} aria-label={`Inspect ${m.name}`} onClick={()=>onSelect(m.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')onSelect(m.id)}} className={`person-node ${chosen?'chosen':''} ${active?'talking':''}`}><circle className="node-ring" r={dense?17:m.id===center?.id?36:29}/>{active&&<circle className="signal-ring" r="38"/>}<g className="person-symbol" style={dense?{transform:'scale(.8)'}:undefined}><PersonGlyph/></g><text y={dense?32:58} className="node-name">{m.name}</text>{!dense&&<text y="75" className="node-role">{m.role.length>30?m.role.slice(0,27)+'…':m.role}</text>}</g>})}
 </svg><div className="canvas-caption"><span>02 / KNOW YOUR MEMBERS</span><span>{members.length} PEOPLE · {sessions.filter(s=>events.some(e=>e.sessionId===s.id)).length} EXCHANGES</span></div></div>;
}
