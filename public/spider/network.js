import {drawSpider} from './vendor/spider.js';
import {probePose} from './vendor/probes.js';

const mint='#88d4bc',pink='#ec8fac',cream='#e7d7ae';
const color=type=>['proposal','awaiting_approval','owner_decision','needs_info'].includes(type)?cream:['decline','declined','error'].includes(type)?'#9b818a':pink;
export class SpiderNetwork{
 constructor(canvas,onSelect){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.regions=[];this.events=[];this.arrivals=new Map();this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.tick=0;this.clock=0;this.last=performance.now();this.onClick=e=>{const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*1000/r.width,y=(e.clientY-r.top)*470/r.height;const hit=this.regions.find(a=>Math.hypot(a.x-x,a.y-y)<35);if(hit)onSelect(hit.id);};canvas.addEventListener('click',this.onClick);this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);}
 update(state,focus,events){this.state=state;this.focus=focus;this.events=events;for(const e of events.slice(-12))if(!this.arrivals.has(e.id))this.arrivals.set(e.id,this.clock);if(this.arrivals.size>300){const keep=new Set(events.slice(-30).map(e=>e.id));for(const k of this.arrivals.keys())if(!keep.has(k))this.arrivals.delete(k);}}
 reset(){this.arrivals.clear();}
 frame(now){this.raf=requestAnimationFrame(this.frame);if(now-this.last<32)return;const dt=Math.min(.1,(now-this.last)/1000);this.last=now;if(!this.paused)this.clock+=dt;this.render();}
 text(s,x,y,c=mint,size=12,align='left'){const a=this.ctx;a.font=`${size}px monospace`;a.fillStyle=c;a.textAlign=align;a.fillText(String(s),x,y);a.textAlign='left';}
 short(s,n=30){return s.length>n?s.slice(0,n-1)+'…':s;}
 curve(a,b,col,width=1){const c=this.ctx;c.beginPath();c.moveTo(a.x,a.y);c.bezierCurveTo(a.x+(b.x-a.x)*.55,a.y,b.x-(b.x-a.x)*.4,b.y,b.x,b.y);c.strokeStyle=col;c.lineWidth=width;c.stroke();}
 render(){
  const c=this.ctx,rect=this.canvas.getBoundingClientRect();if(!rect.width)return;
  const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
  c.setTransform(w/1000,0,0,h/470,0,0);c.clearRect(0,0,1000,470);const t=this.clock,center={x:490+Math.sin(t*.25)*9,y:235+Math.sin(t*.4)*7};
  for(let x=25;x<1000;x+=25)for(let y=20;y<470;y+=25){c.fillStyle='#39514933';c.fillRect(x,y,1,1);}
  const members=this.state?.members??[],self=members.find(m=>m.id===this.focus);
  const relevant=this.events.filter(e=>e.from===this.focus||e.to===this.focus);
  const pairIds=[...new Set(relevant.flatMap(e=>[e.from,e.to]).filter(id=>id&&id!==this.focus))];
  const peers=(pairIds.length?pairIds.map(id=>members.find(m=>m.id===id)).filter(Boolean):members.filter(m=>m.id!==this.focus)).slice(0,5);
  this.regions=peers.map((m,i)=>({id:m.id,x:810+Math.sin(i*1.2)*25,y:60+i*(350/Math.max(1,peers.length-1)),member:m}));
  for(let i=0;i<28;i++){const source={x:100,y:35+i*15},dest=this.regions[i%Math.max(1,this.regions.length)]??{x:840,y:235};this.curve(source,center,'#78b39d0b',.7);this.curve(center,dest,'#78b39d0e',.7);}
  const msgs=relevant.filter(e=>e.message&&e.type!=='executing'&&e.from).slice(-5);
  msgs.forEach((e,i)=>{const pos={x:62,y:76+i*69},col=color(e.type);c.fillStyle='#13211c';c.strokeStyle='#2b4237';c.lineWidth=.8;c.beginPath();c.roundRect(pos.x,pos.y-20,215,48,5);c.fill();c.stroke();this.text(this.short((members.find(m=>m.id===e.from)?.name??'Community')+' · '+e.type.replaceAll('_',' '),29),pos.x+10,pos.y-3,col,10);this.text(this.short(e.message,31),pos.x+10,pos.y+14,'#809b8c',9);this.curve({x:pos.x+215,y:pos.y},center,col+'30',.8);
    const age=t-(this.arrivals.get(e.id)??-99);if(age>=0&&age<2.8&&!this.paused){const body=center;const pose=probePose({index:e.seq,word:e.type,target:{x:pos.x+150,y:pos.y},launchTime:(this.arrivals.get(e.id)??0)+.3},t,body,false);if(pose.visible){c.beginPath();c.moveTo(pose.root.x,pose.root.y);c.bezierCurveTo(pose.joints[0].x,pose.joints[0].y,pose.joints[1].x,pose.joints[1].y,pose.tip.x,pose.tip.y);c.strokeStyle=mint;c.lineWidth=1.2;c.setLineDash([2,4]);c.stroke();c.setLineDash([]);}
     const p=Math.min(1,age/1.8),x=(pos.x+215)*(1-p)+center.x*p,y=pos.y*(1-p)+center.y*p;c.fillStyle=col;c.shadowColor=col;c.shadowBlur=8;c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill();c.shadowBlur=0;}
  });
  if(!msgs.length){this.text('COMMUNITY SIGNALS',62,100,'#526e60',11);this.text('A goal starts the conversation.',62,124,'#6d8a79',10);}
  for(const peer of this.regions){const last=[...relevant].reverse().find(e=>e.from===peer.id||e.to===peer.id),col=last?color(last.type):'#647c70';this.curve(center,peer,col+'48',1);const age=last?t-(this.arrivals.get(last.id)??-99):999;if(age<3&&!this.paused){const fraction=Math.min(1,age/2),p=last.to===this.focus?1-fraction:fraction,x=center.x*(1-p)+peer.x*p,y=center.y*(1-p)+peer.y*p;c.fillStyle=col;c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fill();}c.fillStyle='#17241f';c.strokeStyle=col;c.lineWidth=1;c.beginPath();c.arc(peer.x,peer.y,24,0,Math.PI*2);c.fill();c.stroke();this.text(peer.member.name.slice(0,2).toUpperCase(),peer.x,peer.y+4,col,12,'center');this.text(this.short(peer.member.name,18),peer.x+37,peer.y-3,'#c0d0c4',11);this.text(peer.member.participation==='information_only'?'listening only':last?last.type.replaceAll('_',' '):'ready',peer.x+37,peer.y+13,'#728e7c',9);}
  const glow=c.createRadialGradient(center.x,center.y,10,center.x,center.y,125);glow.addColorStop(0,'#76d8b51d');glow.addColorStop(1,'#76d8b500');c.fillStyle=glow;c.fillRect(center.x-125,center.y-125,250,250);
  c.save();c.translate(center.x,center.y);c.scale(1.7,1.7);drawSpider(c,{x:0,y:0,time:t,vx:Math.cos(t*.25)*2,vy:Math.cos(t*.4)*3,reducedMotion:this.paused,activeProbes:msgs.length});c.restore();
  this.text(self?`${self.name.toUpperCase()}'S AGENT`:'YOUR PERSONAL AGENT',center.x,center.y+130,mint,12,'center');this.text(self?this.short(self.goals,48):'A little context. A lot of possibility.',center.x,center.y+149,'#708c7b',9,'center');
 }
 destroy(){cancelAnimationFrame(this.raf);this.canvas.removeEventListener('click',this.onClick);}
}
