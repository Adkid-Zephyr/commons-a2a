import {SpiderNetwork} from './network.js';
import {selectedRun,runEvents,metrics,playbackSlice,isReplayDataset,memberLabel} from './adapter.js';

const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>{try{const p=new URL(u);return ['https:','http:'].includes(p.protocol)?p.href:'#';}catch{return '#';}};
const titleCase=s=>(s??'').replaceAll('_',' ');
const state={data:null,dataset:new URLSearchParams(location.search).get('dataset')??'synthetic',owner:'',focus:'',requestId:'',view:'network',brief:null,briefMode:'live',offset:0,busy:false,replayCursor:null,replayTimer:null,polling:false};
const chatDrafts={};let editingProfile=null;
const graph=new SpiderNetwork($('#web'),id=>{state.focus=id;renderNetwork();});
$('#motion').textContent=graph.paused?'Resume motion':'Pause motion';$('#motion').setAttribute('aria-pressed',String(graph.paused));
function html(el,value){if(el._html!==value){el.innerHTML=value;el._html=value;}}
function member(id){return state.data?.members.find(m=>m.id===id);}
function activeRun(){return selectedRun(state.data,state.requestId);}
function selectedEvents(){const r=activeRun();return r?playbackSlice(runEvents(state.data,r.id),state.replayCursor):[];}
function error(e){$('#error').textContent=e.message??String(e);$('#error').hidden=false;}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;setTimeout(()=>$('#toast').hidden=true,3500);}
async function api(body,query=''){
 const url=`/api?dataset=${encodeURIComponent(state.dataset)}${query}`;
 const r=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);
 const d=await r.json();if(!r.ok)throw Error(d.error??`Request failed (${r.status})`);return d;
}
async function action(fn){if(state.busy)return;state.busy=true;$('#error').hidden=true;try{await fn();await refresh();}catch(e){if($('#modal').open){$('#modal-error').textContent=e.message;$('#modal-error').hidden=false;}else error(e);}finally{state.busy=false;render();}}
async function refresh(){
 if(state.polling)return;state.polling=true;const ds=state.dataset;
 try{
  const d=await api();if(ds!==state.dataset)return;state.data=d;
  if(!d.members.some(m=>m.id===state.owner))state.owner=activeRun()?.ownerId??d.members[0]?.id??'';
  const r=activeRun();if(!state.focus)state.focus=r?.ownerId??state.owner;
  if(!d.members.some(m=>m.id===state.focus))state.focus=state.owner;
  if(state.owner){const b=await api(null,`&view=attention&ownerId=${encodeURIComponent(state.owner)}&mode=${state.briefMode}&offset=${state.offset}&limit=6`);if(ds!==state.dataset)return;state.brief=b;}
  render();
 }catch(e){error(e);}finally{state.polling=false;}
}
function render(){
 const d=state.data;if(!d)return;
 html($('#dataset'),(d.datasets??[{id:'synthetic',label:'Synthetic fixtures'}]).map(x=>`<option value="${esc(x.id)}">${esc(x.label)}</option>`).join(''));$('#dataset').value=state.dataset;
 html($('#owner'),d.members.map(m=>`<option value="${esc(m.id)}">Viewing as ${esc(m.name)}</option>`).join(''));$('#owner').value=state.owner;
 $('#data-label').textContent=isReplayDataset(d)?'HISTORICAL SOURCE REPLAY · anonymous test delegates · approvals disabled':'FICTIONAL MEMBERS · isolated demonstration · operator perspective';
 $('#model-label').textContent=d.configured?`MODEL / ${d.model?.name??'configured'}`:'MODEL / not configured · choose offline rehearsal';
 $('#inbox-count').textContent=state.brief?.stats.decisionsPending??0;
 $('#add-member').disabled=isReplayDataset(d);$('#demo').disabled=isReplayDataset(d)||d.requests.some(r=>['running','queued'].includes(r.status))||state.busy;
 $('#demo').textContent=d.requests.some(r=>['running','queued'].includes(r.status))?'◌ Agents at work…':'↗ Run live demo';
 $('#new-request').disabled=state.busy;
 renderNetwork();if(state.view==='attention')renderBrief();if(state.view==='people')renderPeople();if(state.view==='chat')renderChat();
}
function renderNetwork(){
 const d=state.data;if(!d)return;const r=activeRun(),events=selectedEvents(),focus=member(state.focus);
 html($('#request'),d.requests.length?d.requests.map(q=>`<option value="${esc(q.id)}">${esc(q.title.slice(0,40))} · ${esc(q.mode)}</option>`).join(''):'<option value="">No runs yet</option>');$('#request').value=r?.id??'';
 $('#member-count').textContent=String(d.members.length).padStart(2,'0');
 html($('#member-list'),d.members.map(m=>`<button class="member-button ${m.id===state.focus?'selected':''}" data-focus="${esc(m.id)}"><span class="avatar">${esc(m.name[0])}</span><span><strong>${esc(m.name)}</strong><small>${esc(m.role)}</small></span><i class="mini-dot"></i></button>`).join(''));
 $('#focus-name').textContent=focus?`FOLLOWING / ${focus.name.toUpperCase()}`:'';
 $('#run-badge').textContent=!r?'WAITING FOR A REQUEST':state.replayCursor!==null?`RECORDED ${r.mode==='live'?'LIVE RUN':'REHEARSAL'} · PLAYBACK`:r.status==='running'?`${r.mode==='live'?'LIVE MODEL':'OFFLINE REHEARSAL'} · RUNNING`:`${r.mode==='live'?'LIVE MODEL RECORD':'OFFLINE REHEARSAL'} · ${titleCase(r.status).toUpperCase()}`;
 const m=r?metrics(d,r.id,state.owner):{handled:0,calls:0,decisions:0};$('#handled').textContent=m.handled;$('#calls').textContent=m.calls;$('#decisions').textContent=m.decisions;
 $('#replay').disabled=!r||r.status==='running';$('#follow').hidden=state.replayCursor===null;
 $('#progress').textContent=state.replayCursor===null?'':`${events.length} / ${runEvents(d,r.id).length} records`;
 const latest=events.at(-1);
 $('#stage-title').textContent=latest?latest.type==='executing'?`${member(latest.from)?.name??'An agent'} is working with its own context.`:latest.type==='human_handoff'?'A connection is ready for people.':latest.type==='needs_info'?'A good question is better than a bad match.':`${member(latest.from)?.name??'The network'} · ${titleCase(latest.type)}`:'A little less noise. A little more connection.';
 $('#stage-message').textContent=latest?(latest.message.length>160?latest.message.slice(0,157)+'…':latest.message):'Give your agent a goal, then watch the network find common ground.';
 graph.update(d,state.focus,events);
 const meaningful=events.filter(e=>e.type!=='executing');$('#event-count').textContent=`${meaningful.length} RECORDS`;
 html($('#transcript'),meaningful.length?meaningful.map(e=>`<article class="exchange"><span class="avatar">${esc(member(e.from)?.name[0]??'↗')}</span><div><div class="exchange-head"><b>${esc(member(e.from)?.name??'Coordinator')}${e.to&&e.to!==e.from?' → '+esc(member(e.to)?.name??'Agent'):''}${e.actor?' · test owner':''}</b><span class="pill ${['proposal','awaiting_approval','needs_info'].includes(e.type)?'cream':''}">${esc(titleCase(e.type))}</span><time>${new Date(e.at).toLocaleTimeString('en-GB',{timeZone:'Europe/London'})}</time></div><p>${esc(e.message)}</p>${e.reason?`<details><summary>Why this step · inspect evidence</summary><p>${esc(e.reason)}</p>${(e.evidenceIds??[]).map(id=>{const ev=member(e.from)?.evidence.find(x=>x.id===id);return ev?evidenceLink(ev):'';}).join('')}${e.call?`<div class="call">${esc(e.model)} · ${(e.call.durationMs/1000).toFixed(1)}s · ${e.usage?.total_tokens??'Unknown'} tokens<br>Call ${esc(e.call.id.slice(0,8))} · ${esc(e.mode)} · signed record</div>`:''}</details>`:''}</div></article>`).join(''):empty('The room is quiet.','Start a request. Your agents will have a reason to talk.'));
 if(focus)html($('#focus-profile'),`<div class="focus-profile-name"><span class="avatar">${esc(focus.name[0])}</span><div><h3>${esc(focus.name)}</h3><small>${esc(focus.role)}</small></div></div><span class="pill">${esc(memberLabel(focus))}</span><h4>HERE TO</h4><p>${esc(focus.goals)}</p><div class="chips">${focus.skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div><h4>SHARED CONTEXT</h4><p>${esc(focus.context)}</p><h4>EVIDENCE</h4>${focus.evidence.length?focus.evidence.map(evidenceLink).join(''):'<p>No evidence supplied.</p>'}<h4>BOUNDARIES</h4><p>${focus.participation==='information_only'?'Information only. No outreach.':`Availability: ${esc(focus.availability)}. Meetings require owner approval.`}</p>`);
}
function evidenceLink(e){return `<a class="evidence" href="${esc(safeUrl(e.url))}" target="_blank" rel="noreferrer">↗ ${esc(e.title)}<br><small>${e.kind==='synthetic'?'Fictional fixture evidence':'Supplied source · not independently verified'}</small></a>`;}
function empty(title,text){return `<div class="empty"><span class="empty-mark">✳</span><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;}
function renderBrief(){
 const b=state.brief;if(!b)return;
 html($('#brief-stats'),[[b.stats.conversationsReviewed,'conversations reviewed'],[b.stats.agentTurns,'agent turns'],[b.stats.decisionsPending,'decisions for you'],[b.stats.outcomesWithoutAction,'outcomes needing no action']].map(([n,t])=>`<div><strong>${n}</strong><small>${t}</small></div>`).join(''));
 html($('#brief-list'),b.items.length?b.items.map(i=>`<article class="brief-card"><span class="pill ${i.kind==='decision'?'cream':''}">${esc(titleCase(i.kind))} · ${esc(i.mode)}</span><h3>${esc(i.title)}</h3><p>${esc(i.summary)}${i.summary.length>=500?'…':''}</p>${i.sourceReplay?'<p class="source-note">Historical source only. No real-member approval can be given here.</p>':''}${i.evidence.map(evidenceLink).join('')}<div class="card-actions">${i.actions.map(a=>`<button class="${a==='approve'?'approve':''}" data-brief-action="${esc(a)}" data-session="${esc(i.sessionId??'')}" data-request="${esc(i.requestId)}" data-connection="${esc(i.connectionId??'')}">${({inspect_session:'See the exchange',inspect_request:'See the request',approve:'Make the connection ↗',decline:'Not this time',open_conversation:'Continue the conversation',clarify_request:'Add a little context'})[a]??esc(a)}</button>`).join('')}</div></article>`).join(''):empty('Nothing needs you right now.','Your agent brings back useful decisions, not another endless feed.'));
 $('#prev-brief').disabled=state.offset===0;$('#next-brief').disabled=!b.hasMore;$('#brief-page').textContent=b.totalItems?`${state.offset+1}–${Math.min(state.offset+b.items.length,b.totalItems)} of ${b.totalItems}`:'All caught up';
}
function renderPeople(){html($('#people-grid'),state.data.members.map(m=>`<article class="person-card"><div class="focus-profile-name"><span class="avatar">${esc(m.name[0])}</span><div><h3>${esc(m.name)}</h3><small>${esc(m.role)}</small></div></div><span class="pill">${esc(memberLabel(m))}</span><p>${esc(m.goals)}</p><div class="chips">${m.skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div><small>${m.participation==='information_only'?'Listening only':`Availability: ${esc(m.availability)}`} · ${m.evidence.length} evidence items</small><button data-edit="${esc(m.id)}" ${isReplayDataset(state.data)?'disabled':''}>Review context & boundaries →</button><button data-inspect="${esc(m.id)}">Follow this agent</button></article>`).join(''));}
function renderChat(){
 const rooms=state.data.connections.filter(c=>c.members.includes(state.owner)).slice().reverse();
 html($('#connections'),rooms.length?rooms.map(c=>`<section class="panel conversation"><span class="eyebrow">BOTH TEST OWNERS APPROVED · LOCAL CONVERSATION</span><h2>${c.members.map(id=>esc(member(id)?.name)).join(' & ')}</h2><p class="summary">${esc(c.summary)}</p>${c.messages.map(m=>`<article class="chat-message"><b>${esc(member(m.ownerId)?.name)}</b><p>${esc(m.message)}</p><small>${new Date(m.at).toLocaleTimeString('en-GB')}</small></article>`).join('')}<form data-chat="${esc(c.id)}"><input name="message" aria-label="Message in local conversation" required maxlength="3000" placeholder="A real conversation starts with you." value="${esc(chatDrafts[c.id]??'')}"><button class="button primary">Send locally ↗</button></form></section>`).join(''):empty('Some things deserve a person.','After both owners approve, the local conversation appears here. No message is sent to Discord.'));
}
function showView(view){state.view=view;document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==view+'-view');document.querySelectorAll('nav [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));render();if(view==='attention')refresh();}
function openModal(title,content){$('#modal-title').textContent=title;$('#modal-content').innerHTML=content;$('#modal-error').hidden=true;$('#modal').showModal();}
function closeModal(){$('#modal').close();editingProfile=null;}
function modeOptions(){return `<option value="live" ${state.data.configured?'':'disabled'}>${state.data.configured?'Real model · '+esc(state.data.model?.name):'Real model · not configured'}</option><option value="rehearsal" ${state.data.configured?'':'selected'}>Offline rehearsal · simulated decisions</option>`;}
function requestModal(demo=false){
 const sample=isReplayDataset(state.data)?state.data.sourceInfo?.requests?.[0]:null;
 openModal(demo?'Let the room do the work.':'What would make this community useful to you?',`<form id="request-form"><label>What are you looking for?<select name="kind"><option value="collaborator">A collaborator</option><option value="speaker">A speaker</option></select></label>${demo?'<p class="source-note">A fresh synthetic-member run, using real independent model calls. Earlier runs stay available. No external messages.</p>':`<label>Your request<input name="title" required minlength="4" maxlength="160" value="${esc(sample?.title??'Find a collaborator for an agent project')}"/></label><label>Scope, timing, and what matters<textarea name="details" required minlength="10" maxlength="3000">${esc(sample?.details??'I would like two hours of help improving an agent demo. Please check fit and discuss a narrow scope before asking either owner to commit.')}</textarea></label><label>Topics · comma separated<input name="topics" required value="${esc(sample?.topics.join(', ')??'agents, frontend')}"/></label>`}<label>Execution<select name="mode">${modeOptions()}</select></label><p class="connection-hint">${demo?'The selected demo sets the appropriate fixture owner.':'Acting in the test perspective of '+esc(member(state.owner)?.name)+'.'}</p><div class="form-actions"><button type="button" data-close>Cancel</button><button class="button primary" type="submit">${demo?'Start a fresh demo':'Let my agent explore'} ↗</button></div></form>`);
 $('#request-form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);action(async()=>{const mode=f.get('mode');const req=await api(demo?{action:'demo',scenario:f.get('kind'),mode,idempotencyKey:crypto.randomUUID()}:{action:'request',request:{ownerId:sample?.ownerId??state.owner,kind:f.get('kind'),title:f.get('title'),details:f.get('details'),topics:String(f.get('topics')).split(',').map(s=>s.trim()).filter(Boolean),mode,idempotencyKey:crypto.randomUUID(),authorized:true}});if(!state.data.requests.some(x=>x.id===req.id))state.data.requests.push(req);state.requestId=req.id;state.focus=req.ownerId;state.owner=req.ownerId;state.briefMode=mode;$('#brief-mode').value=mode;stopReplay();closeModal();showView('network');toast('Your agent has a goal. Watch the room come alive.');});});
}
async function profileModal(id){
 try{editingProfile=id?await api(null,`&profile=${encodeURIComponent(id)}`):{name:'',role:'',context:'',goals:'',skills:[],availability:'unknown',participation:'connect',privateNote:'',evidence:[]};const m=editingProfile;
 openModal(id?'A little context. Your kind of connection.':'Meet your agent.',`<form id="profile-form"><div class="form-grid"><label>Name<input required name="name" maxlength="60" value="${esc(m.name)}"></label><label>Your role<input required name="role" maxlength="100" value="${esc(m.role)}"></label></div><label>Context you want your agent to share<textarea required name="context" maxlength="4000" placeholder="What do you build, know, or enjoy?">${esc(m.context)}</textarea></label><label>What are you here for?<textarea required name="goals" maxlength="1200">${esc(m.goals)}</textarea></label><label>Skills and interests · comma separated<input required name="skills" value="${esc(m.skills.join(', '))}"></label><div class="form-grid"><label>Availability<select name="availability">${['unknown','available','unavailable'].map(v=>`<option ${v===m.availability?'selected':''} value="${v}">${({unknown:'Ask me first',available:'Open to proposals',unavailable:'Not available'})[v]}</option>`).join('')}</select></label><label>Participation<select name="participation"><option value="connect">Explore connections</option><option value="information_only" ${m.participation==='information_only'?'selected':''}>Information only · no outreach</option></select></label></div><details><summary>Evidence & private note</summary>${m.evidence.map(ev=>`<div class="profile-evidence" data-evidence="${esc(ev.id)}"><span>${esc(ev.title)}</span><button type="button" data-remove-evidence="${esc(ev.id)}">Remove</button></div>`).join('')}<label>New public evidence title<input name="eTitle"></label><label>HTTPS evidence link<input type="url" name="eUrl" placeholder="https://github.com/…"></label><label>What does it demonstrate?<input name="eSummary"></label><label>Private note · kept local, never sent to models<textarea name="privateNote" maxlength="2000">${esc(m.privateNote)}</textarea></label></details><label class="check-label"><input type="checkbox" required name="consent">I am using fictional data or have permission to process this profile and share its approved context with the configured model. Meetings still require both owners’ approval.</label><div class="form-actions"><button type="button" data-close>Cancel</button><button class="button primary">Save my agent ↗</button></div></form>`);
 $('#profile-form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);action(async()=>{const ev=[...editingProfile.evidence];if(f.get('eUrl'))ev.push({id:crypto.randomUUID(),title:f.get('eTitle'),url:f.get('eUrl'),summary:f.get('eSummary'),kind:'member_provided'});const profile={name:f.get('name'),role:f.get('role'),context:f.get('context'),goals:f.get('goals'),skills:String(f.get('skills')).split(',').map(x=>x.trim()).filter(Boolean),availability:f.get('availability'),participation:f.get('participation'),privateNote:f.get('privateNote'),evidence:ev,consent:f.get('consent')==='on'};const result=await api({action:'member',...(id?{id}:{}),profile});state.owner=result.id;state.focus=result.id;state.offset=0;closeModal();toast('Your context is ready. Your agent knows what matters.');});});
 }catch(e){error(e);}
}
function clarifyModal(sessionId){openModal('A little more context can move this forward.',`<form id="clarify-form"><label>What should your agent know?<textarea name="details" required minlength="10" maxlength="1500" placeholder="Clarify the scope, timing, or role you need…"></textarea></label><p class="source-note">Only the original candidate is contacted again. The earlier exchange is retained and both approvals start fresh.</p><div class="form-actions"><button type="button" data-close>Cancel</button><button class="button primary">Continue the exchange ↗</button></div></form>`);$('#clarify-form').addEventListener('submit',e=>{e.preventDefault();action(async()=>{const r=await api({action:'clarify',sessionId,ownerId:state.owner,details:new FormData(e.target).get('details'),idempotencyKey:crypto.randomUUID()});state.requestId=r.id;state.focus=r.ownerId;stopReplay();closeModal();showView('network');});});}
function stopReplay(){clearInterval(state.replayTimer);state.replayTimer=null;state.replayCursor=null;graph.reset();}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.view)showView(b.dataset.view);
 if(b.dataset.close!==undefined)closeModal();
 if(b.dataset.focus){state.focus=b.dataset.focus;renderNetwork();}
 if(b.dataset.inspect){state.focus=b.dataset.inspect;showView('network');}
 if(b.dataset.edit)profileModal(b.dataset.edit);
 if(b.dataset.removeEvidence){editingProfile.evidence=editingProfile.evidence.filter(x=>x.id!==b.dataset.removeEvidence);b.closest('.profile-evidence').remove();}
 const a=b.dataset.briefAction;if(!a)return;
 if(a.startsWith('inspect_')){state.requestId=b.dataset.request;state.focus=state.owner;stopReplay();showView('network');}
 else if(a==='open_conversation')showView('chat');
 else if(a==='clarify_request')clarifyModal(b.dataset.session);
 else if(['approve','decline'].includes(a))action(async()=>{await api({action:'approve',sessionId:b.dataset.session,ownerId:state.owner,decision:a==='approve'?'approved':'declined'});toast(a==='approve'?'Your approval is recorded. Both people get a say.':'Not this time. Your agent has recorded the decision.');});
});
document.addEventListener('input',e=>{const form=e.target.closest('[data-chat]');if(form)chatDrafts[form.dataset.chat]=e.target.value;});
document.addEventListener('submit',e=>{const id=e.target.dataset.chat;if(!id)return;e.preventDefault();const message=new FormData(e.target).get('message');action(async()=>{await api({action:'message',connectionId:id,ownerId:state.owner,message});chatDrafts[id]='';toast('Sent in the local conversation.');});});
$('#dataset').addEventListener('change',e=>{stopReplay();location.assign('?dataset='+encodeURIComponent(e.target.value));});
$('#owner').addEventListener('change',e=>{state.owner=e.target.value;state.focus=state.owner;state.offset=0;refresh();render();});
$('#request').addEventListener('change',e=>{state.requestId=e.target.value;state.focus=activeRun()?.ownerId??state.owner;stopReplay();renderNetwork();});
$('#brief-mode').addEventListener('change',e=>{state.briefMode=e.target.value;state.offset=0;refresh();});
$('#prev-brief').onclick=()=>{state.offset=Math.max(0,state.offset-6);refresh();};$('#next-brief').onclick=()=>{state.offset+=6;refresh();};
$('#new-request').onclick=()=>state.data&&requestModal(false);$('#demo').onclick=()=>requestModal(true);$('#add-member').onclick=()=>profileModal();$('#close-modal').onclick=closeModal;
$('#motion').onclick=()=>{graph.paused=!graph.paused;$('#motion').textContent=graph.paused?'Resume motion':'Pause motion';$('#motion').setAttribute('aria-pressed',String(graph.paused));};
$('#replay').onclick=()=>{stopReplay();state.replayCursor=0;graph.reset();state.replayTimer=setInterval(()=>{const n=runEvents(state.data,activeRun()?.id).length;state.replayCursor=Math.min(n,state.replayCursor+1);renderNetwork();if(state.replayCursor===n)clearInterval(state.replayTimer);},700);renderNetwork();};
$('#follow').onclick=()=>{stopReplay();renderNetwork();};
window.addEventListener('beforeunload',()=>{graph.destroy();clearInterval(state.replayTimer);});
refresh();setInterval(refresh,1300);
