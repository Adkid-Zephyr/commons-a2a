import {workspaceHref,demoHref} from './navigation.js';
import {CommunityRenderer} from './community-renderer.js';
import {communityRun,communityState,sourceFromState,LABELS,COLORS} from './community-model.js';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let data=null,brief=null,dataset=new URLSearchParams(location.search).get('dataset')??'synthetic',owner=new URLSearchParams(location.search).get('owner')??'',requestId=new URLSearchParams(location.search).get('request')??'',run=communityRun(''),elapsed=0,playing=!reduced,speed=1,filter='all',selected=null,open=false,lastFrame=null,dirty=false,toastTimer,polling=false,waitingRequest=null;
const renderer=new CommunityRenderer($('#scene'),{onSelect:index=>{selected=index;updateSelection();drawer(true);}});
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
async function api(body,query=''){const r=await fetch(`/api?dataset=${encodeURIComponent(dataset)}${query}`,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);const d=await r.json();if(!r.ok)throw Error(d.error??r.status);return d;}
function workspace(tab='network',id=requestId,mode=current()?.mode){return workspaceHref({dataset,owner,requestId:id,mode,tab});}
function syncLinks(){document.querySelectorAll('[data-workspace]').forEach(a=>a.href=workspace());}
function current(){return data?.requests.find(r=>r.id===requestId)??data?.requests.at(-1);}
function realCalls(){const r=current();return(data?.events??[]).filter(e=>e.requestId===r?.id&&e.call&&e.type!=='error');}
function getState(){return communityState(run,elapsed,{routeFilter:filter,selectedIndex:selected,reducedMotion:reduced,allDecisions:run.decisions,realCalls:realCalls(),callHistory:(data?.events??[]).filter(e=>e.mode==='live'&&e.call&&e.type!=='error'),attentionStats:brief?.stats??{}});}
function render(){const s=getState();renderer.render(s);$('#timeline').value=elapsed;$('#timeText').textContent=`${elapsed.toFixed(2).padStart(5,'0')} / ${run.duration.toFixed(2)}`;$('#playBtn').textContent=playing?'Pause':'Play';$('#frameStatus').textContent=`Local extraction replay · ${s.decisions.length}/${run.decisions.length} mentions · ${realCalls().length} recorded model calls`;}
function frame(now){if(lastFrame!==null&&playing){elapsed+=Math.min(.15,(now-lastFrame)/1000)*speed;if(elapsed>=run.duration){if($('#loop').checked){elapsed=0;selected=null;}else{elapsed=run.duration;playing=false;}}}lastFrame=now;if(playing)render();requestAnimationFrame(frame);}
function scan(){const text=$('#chatInput').value;run=communityRun(text,data?.members??[],{sourceLabel:dirty?'USER-SUPPLIED CHAT TEXT':data?.dataset==='synthetic'?'SYNTHETIC CONTEXT':'ANONYMIZED SOURCE REPLAY'});elapsed=0;selected=null;playing=!reduced;$('#inputCount').textContent=`${text.length} chars · ${run.sources.length} messages`;updateSelection();render();}
function loadSnapshot(){if(!data)return;const source=sourceFromState(data,current()?.id);$('#chatInput').value=source.text.slice(0,12000);dirty=false;scan();}
function drawer(value){open=value&&!document.body.classList.contains('immersive');document.body.classList.toggle('drawer-open',open);$('#inspector').inert=!open;$('#inspector').setAttribute('aria-hidden',String(!open));$('#inspectorToggle').setAttribute('aria-expanded',String(open));$('#inspectorBackdrop').hidden=!open;}
function updateSelection(){
 const d=run.decisions.find(d=>d.index===selected),token=run.tokens[selected];
 if(!token){$('#selection').innerHTML='<strong>Select a term to inspect its source.</strong><span class="muted">Every extracted mention links back to the supplied text. No probability scores are invented.</span>';return;}
 const source=run.sources[token.messageIndex],m=d?.memberId?data?.members.find(m=>m.id===d.memberId):null;
 $('#selection').innerHTML=`<strong class="selected-word">${esc(token.word)}</strong><span class="category" style="color:${d?COLORS[d.route]:'#aaa'}">${d?esc(LABELS[d.route])+' · '+esc(d.question):'No matching extraction rule'}</span><span class="muted">Source ${token.messageIndex+1} · ${esc(source.author)}</span><p>${esc(source.text)}</p>${m?`<strong>${esc(m.name)} · ${esc(m.role)}</strong><p>${esc(m.goals)}</p><a class="source-link" href="${esc(workspace())}">Inspect members and connections in the workspace ↗</a>`:''}`;
}
async function refresh(reload=false){if(polling)return;polling=true;try{
 data=await api();const r=current();if(!owner||!data.members.some(m=>m.id===owner))owner=r?.ownerId??data.members[0]?.id;requestId=r?.id??'';syncLinks();
 const opts=(id,items,value)=>{const el=$(id),html=items.map(([v,label])=>`<option value="${esc(v)}">${esc(label)}</option>`).join('');if(el._html!==html){el.innerHTML=html;el._html=html;}el.value=value;};
 opts('#dataset',(data.datasets??[]).map(d=>[d.id,d.label]),dataset);opts('#owner',data.members.map(m=>[m.id,m.name]),owner);opts('#runSelect',data.requests.map(r=>[r.id,r.title.slice(0,34)+' · '+r.mode]),requestId);
 if(owner)brief=await api(null,`&view=attention&ownerId=${encodeURIComponent(owner)}&mode=live&limit=5`);
 $('#sourceStatus').textContent=dataset==='synthetic'?'Fictional profiles and recorded A2A exchanges. Not original community messages.':'Anonymized historical source replay. Current availability and owner consent are unknown.';
 $('#agentStatus').textContent=data.configured?`${data.model?.name} · ${r?`Selected request ${r.status} · ${r.mode}`:'No requests yet'} · ${realCalls().length} recorded calls`:'Live model is not configured. Local extraction remains available.';
 $('#agentStatus').classList.remove('error-status');$('#runAgentBtn').disabled=dataset!=='synthetic'||!data.configured||data.requests.some(r=>['running','queued'].includes(r.status));
 const attentionHTML=(brief?.items??[]).map(i=>`<div class="attention-item"><strong>${esc(i.title)}</strong><small>${esc(i.kind)} · ${esc(i.mode)}</small><p>${esc(i.summary.slice(0,200))}${i.summary.length>200?'…':''}</p><a class="source-link" href="${esc(workspace('inbox',i.requestId,i.mode))}">Review evidence & decisions ↗</a></div>`).join('')||'<p class="muted">Nothing needs your attention right now.</p>';
 if($('#attentionList')._html!==attentionHTML){$('#attentionList').innerHTML=attentionHTML;$('#attentionList')._html=attentionHTML;}
 if(reload||(!run.tokens.length&&!dirty))loadSnapshot();
 if(waitingRequest){const q=data.requests.find(r=>r.id===waitingRequest);if(q&&!['running','queued'].includes(q.status)){requestId=q.id;waitingRequest=null;if(!dirty)loadSnapshot();toast('A2A completed. Spider now scans the recorded exchanges.');}}
 if(!playing)render();
 }catch(e){$('#agentStatus').textContent=e.message;$('#agentStatus').classList.add('error-status');toast(e.message);}finally{polling=false;}}
$('#inspectorToggle').onclick=()=>drawer(!open);$('#inspectorClose').onclick=()=>drawer(false);$('#inspectorBackdrop').onclick=()=>drawer(false);
$('#playBtn').onclick=()=>{if(!playing&&elapsed>=run.duration)elapsed=0;playing=!playing;render();};$('#restartBtn').onclick=()=>{elapsed=0;playing=!reduced;render();};$('#speed').onchange=e=>speed=Number(e.target.value);$('#timeline').oninput=e=>{elapsed=Number(e.target.value);render();};
$('#fitBtn').onclick=()=>{const value=document.body.classList.toggle('zoom');$('#fitBtn').setAttribute('aria-pressed',String(value));$('#fitBtn').textContent=value?'Fit canvas':'Zoom canvas';};
function immersive(){document.body.classList.toggle('immersive');drawer(false);}$('#fullscreenBtn').onclick=immersive;
$('#chatInput').oninput=()=>{dirty=true;$('#inputCount').textContent=$('#chatInput').value.length+' characters';};$('#scanBtn').onclick=scan;$('#loadSnapshotBtn').onclick=loadSnapshot;$('#reloadBtn').onclick=()=>refresh(true);
$('#dataset').onchange=e=>location.assign(demoHref({dataset:e.target.value}));$('#owner').onchange=e=>{owner=e.target.value;refresh();};$('#runSelect').onchange=e=>{requestId=e.target.value;refresh(true);};
document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{filter=b.dataset.route;document.querySelectorAll('[data-route]').forEach(x=>x.classList.toggle('active',x===b));render();});
$('#runAgentBtn').onclick=async()=>{try{if(dataset!=='synthetic')throw Error('Source replay cannot authorize demonstrations for real members.');$('#runAgentBtn').disabled=true;const q=await api({action:'demo',scenario:$('#scenario').value,mode:'live',idempotencyKey:crypto.randomUUID()});data.requests.push(q);requestId=q.id;waitingRequest=q.id;owner=q.ownerId;toast('Live A2A started. The extraction animation is not model reasoning.');await refresh();}catch(e){toast(e.message);$('#runAgentBtn').disabled=false;}};
$('#exportBtn').onclick=()=>{const s=getState();const body={sourceLabel:run.sourceLabel,provenance:run.provenance,sourceText:$('#chatInput').value,elapsed:s.elapsed,counts:s.counts,items:s.decisions,modelCallsForExtraction:0,recordedA2ACalls:realCalls().length,externalActions:0};const url=URL.createObjectURL(new Blob([JSON.stringify(body,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='commons-community-extraction.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#aboutBtn').onclick=()=>$('#aboutDialog').showModal();$('#closeAbout').onclick=()=>$('#aboutDialog').close();
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select')||$('#aboutDialog').open)return;if(e.code==='Space'){e.preventDefault();$('#playBtn').click();}if(e.key.toLowerCase()==='r')$('#restartBtn').click();if(e.key.toLowerCase()==='f')immersive();if(e.key==='Escape'){document.body.classList.remove('immersive');drawer(false);}});
render();refresh(true);setInterval(()=>refresh(),2500);requestAnimationFrame(frame);
