// Adapted layout from Kirito14IT/prompt-spider-ui. MIT notice: vendor/LICENSE.
// Original dense editor, mesh, flight geometry, transport and lower chart layout retained.
import {Renderer} from './reference/renderer.js';
import {drawSpider} from './reference/spider.js';
import {probePose} from './reference/probes.js';
import {arcX} from './reference/motion.js';
import {ROUTES,LABELS,COLORS} from './community-model.js';
const PINK='#dedbd5',GRAY='#85818a';
export class CommunityRenderer extends Renderer{
 drawHeader(s,decisions,counts){
  this.text('COMMONS',16,30,'#f4f4f4',22,700);this.text('// AGENTS AT WORK',180,30,PINK,18,700);
  this.text('Save your attention. Make meaningful connections.',16,49,GRAY,11);
  this.text('chat extraction replay / real A2A data kept separate / no external writes',16,63,GRAY,9.5);
  [['messages',s.sources.length,'#eee'],...ROUTES.map(r=>[LABELS[r],counts[r],COLORS[r]])].forEach(([label,n,color],i)=>{const x=699+i*77;this.text(label,x,20,GRAY,9);this.text(n,x,44,color,20,700);});
 }
 drawSpider(s,pose,decision,layout,tokenPoint){
  const c=this.ctx;c.save();c.beginPath();c.rect(17,95,342,735);c.clip();
  let count=0;
  for(const d of s.probeEvents){const p=layout.placements[d.index],point=tokenPoint(p);if(point.y<110||point.y>809||Math.hypot(point.x-pose.x,point.y-pose.y)>240)continue;const arm=probePose({...d,target:{x:point.x,y:point.y-4},width:p?.w},s.elapsed,pose,s.reducedMotion);if(!arm.visible)continue;count++;c.globalAlpha=arm.opacity;c.beginPath();c.moveTo(arm.root.x,arm.root.y);c.bezierCurveTo(arm.joints[0].x,arm.joints[0].y,arm.joints[1].x,arm.joints[1].y,arm.tip.x,arm.tip.y);c.setLineDash([2,4]);c.strokeStyle='#eadbe6';c.lineWidth=1.1;c.stroke();c.setLineDash([]);if(arm.contact){c.strokeStyle=COLORS[d.route];c.strokeRect(point.x-(p?.w??20)/2-3,point.y-16,(p?.w??20)+6,19);this.text(LABELS[d.route],point.x,point.y-20,COLORS[d.route],9);}}
  c.globalAlpha=1;drawSpider(c,{...pose,time:s.elapsed,activeProbes:count,reducedMotion:s.reducedMotion});c.restore();
 }
 drawRouteCards(s,counts){const c=this.ctx;const descriptions=['member mentions','needs / offers / limits','shared topic mentions','event / time mentions'];ROUTES.forEach((r,i)=>{const x=905,y=105+i*180,w=160,h=137,col=COLORS[r];c.fillStyle='#09090b';c.fillRect(x,y,w,h);c.strokeStyle=col;c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);c.fillStyle=col;c.fillRect(x+1,y+1,w-2,18);this.text(['CONNECT','INFORMATION','INTERESTS','EVENTS'][i],x+7,y+13,'#0b1110',9,700);this.text('→ '+LABELS[r],x+11,y+43,'#eee',16,700);this.text(counts[r],x+w-11,y+91,col,38,700,'right');this.text(descriptions[i],x+10,y+124,GRAY,9);});}
 drawRoutingParticles(s){const c=this.ctx,total=Math.max(1,Math.min(280,s.total));for(const d of s.decisions){const age=s.elapsed-d.time;if(age<0||age>.7||(s.routeFilter!=='all'&&s.routeFilter!==d.route))continue;const sy=70+(d.slot+.5)/total*778,sx=arcX(sy)+52,ty=174+ROUTES.indexOf(d.route)*180,p=age/.7;c.fillStyle=COLORS[d.route];c.fillRect(sx+(905-sx)*p-2,sy+(ty-sy)*p-2,4,4);}}
 drawStream(s,decisions){this.panel(16,858,680,212,'community signal stream','source · extracted item · category');const list=decisions.filter(d=>s.routeFilter==='all'||d.route===s.routeFilter).slice(-9);list.forEach((d,i)=>{const y=896+i*19.4;if(i===list.length-1){this.ctx.fillStyle='#dedbd512';this.ctx.fillRect(18,y-14,676,19);}this.text('msg '+String(d.messageIndex+1).padStart(2,'0'),26,y,GRAY,10);const label=d.word.slice(0,19);this.font(11);this.ctx.fillStyle=PINK;this.ctx.fillRect(96,y-12,this.ctx.measureText(label).width+7,15);this.text(label,99,y,'#140a11',11);this.text(d.question.slice(0,30),260,y,'#ddd',10);this.text('→ '+LABELS[d.route],565,y,COLORS[d.route],11);this.regions.push({index:d.index,x:18,y:y-15,w:676,h:19});});if(!list.length)this.text('awaiting the first extracted signal_',26,905,GRAY,11);}
 drawStats(s,decisions,counts){this.panel(712,858,352,212,'extracted mentions / replay');this.text(decisions.length,730,930,PINK,52,700);this.text(`from ${s.sources.length} source messages · not unique people`,730,951,GRAY,9.5);ROUTES.forEach((r,i)=>{const y=976+i*23;this.text(LABELS[r],730,y,'#ddd',10);this.ctx.fillStyle='#29282e';this.ctx.fillRect(817,y-7,184,6);this.ctx.fillStyle=COLORS[r];this.ctx.fillRect(817,y-7,184*counts[r]/Math.max(1,decisions.length),6);this.text(counts[r],1050,y,COLORS[r],11,400,'right');});}
 drawConfidence(s){
  this.panel(16,1080,256,236,'recent real A2A latency','seconds');const values=(s.callHistory??s.realCalls??[]).filter(e=>e.call?.durationMs!=null).slice(-30),max=Math.max(1,...values.map(e=>e.call.durationMs/1000)),c=this.ctx;
  for(let i=0;i<4;i++)this.line(26,1111+i*48,262,1111+i*48,'#24222a',.65);
  if(values.length){c.beginPath();values.forEach((e,i)=>{const x=26+i/Math.max(1,values.length-1)*236,y=1253-e.call.durationMs/1000/max*135;i?c.lineTo(x,y):c.moveTo(x,y);});c.strokeStyle=PINK;c.lineWidth=1.4;c.stroke();values.forEach((e,i)=>{c.fillStyle='#d5afa2';c.fillRect(24+i/Math.max(1,values.length-1)*236,1251-e.call.durationMs/1000/max*135,4,4);});}else this.text('No recorded model calls',26,1175,GRAY,10);
  const avg=values.length?values.reduce((n,e)=>n+e.call.durationMs/1000,0)/values.length:0;this.text(values.length?`avg ${avg.toFixed(1)}s · ${values.length} calls`:'latency: not reported',26,1301,'#eee',10,700);
 }
 drawWordGrid(s){const c=this.ctx;this.panel(282,1080,256,236,'extracted signal map','one dot = one mention');const all=s.allDecisions??[],done=new Set(s.decisions.map(d=>d.index)),cols=16,space=Math.min(15,160/Math.max(1,Math.ceil(all.length/cols)-1));all.forEach((d,i)=>{const x=298+i%cols*14.5,y=1113+Math.floor(i/cols)*space;c.fillStyle=done.has(d.index)?COLORS[d.route]:'#29292f';c.globalAlpha=s.routeFilter==='all'||s.routeFilter===d.route?1:.18;c.beginPath();c.arc(x,y,Math.min(3.6,space*.38),0,Math.PI*2);c.fill();this.regions.push({index:d.index,x:x-6,y:y-6,w:12,h:12});});c.globalAlpha=1;this.text(`${s.decisions.length} / ${all.length} mentions revealed`,292,1301,'#eee',10,700);}
 drawSphere(s){
  const c=this.ctx;this.panel(548,1080,256,236,'community topic constellation','geometry');const items=[...new Set((s.allDecisions??[]).filter(d=>['code','topic'].includes(d.route)).map(d=>d.word.replace(/[:.,]/g,'')))].slice(0,100),n=items.length,t=s.reducedMotion?0:s.elapsed*.12,points=[];
  // Decorative sphere lattice, not additional members or measured relationships.
  for(let i=0;i<486;i++){const yy=1-(i+.5)/486*2,a=i*2.399963,ring=Math.sqrt(1-yy*yy),xx=Math.cos(a)*ring,zz=Math.sin(a)*ring,x=xx*Math.cos(t)+zz*Math.sin(t),z=-xx*Math.sin(t)+zz*Math.cos(t);c.globalAlpha=.12+(z+1)*.22;c.fillStyle='#a3a1af';c.fillRect(676+x*85,1197+yy*85,1.7,1.1);}c.globalAlpha=1;
  for(let i=0;i<n;i++){const yy=1-(i+.5)/Math.max(1,n)*2,a=i*2.399963,ring=Math.sqrt(1-yy*yy),xx=Math.cos(a)*ring,zz=Math.sin(a)*ring;points.push({x:xx*Math.cos(t)+zz*Math.sin(t),y:yy,z:-xx*Math.sin(t)+zz*Math.cos(t),label:items[i]});}
  points.sort((a,b)=>a.z-b.z);points.forEach((p,i)=>{const x=676+p.x*85,y=1197+p.y*85;c.globalAlpha=.3+(p.z+1)*.3;c.fillStyle=i%2?'#b7add5':'#b5c8bd';c.fillRect(x-1.5,y-1.5,3,3);if(p.z>.4&&i%3===0)this.text(p.label.slice(0,13),x+5,y+3,'#c4c3cb',8);});c.globalAlpha=1;this.text(`${n} distinct people / topic labels`,558,1301,'#eee',10,700);
 }
 drawThink(s){this.panel(814,1080,250,236,'attention returned to people');const stats=s.attentionStats??{};[[stats.conversationsReviewed??0,'conversations reviewed','#b5c8bd'],[stats.decisionsPending??0,'decisions waiting for you','#d8c8a3'],[stats.outcomesWithoutAction??0,'outcomes needing no action','#d5afa2']].forEach(([n,label,col],i)=>{const y=1120+i*49;this.ctx.fillStyle=col;this.ctx.fillRect(826,y-11,4,35);this.text(n,838,y,col,18,700);this.text(label,838,y+18,'#ddd',9.5);});this.text('Agents coordinate.',826,1285,'#eee',11,700);this.text('People make it matter.',826,1303,PINK,11,700);}
 drawStatus(s,counts,forks,scroll){const c=this.ctx;c.fillStyle='#161619';c.fillRect(0,1326,1080,24);this.text(`commons / ${s.sourceLabel??'community'} / ln ${Math.floor(scroll)+1}`,15,1342,GRAY,9);this.text(`local extraction replay · ${forks} mentions · no probability scores`,1065,1342,PINK,9,400,'right');}
}
