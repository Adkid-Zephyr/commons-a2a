import { randomUUID, generateKeyPairSync, sign, verify } from 'node:crypto';
import { MemberInput, RequestInput, AgentReply } from './schema.mjs';
import { seeds } from './seed.mjs';
import { makePacket, modelTurn, modelConfigured, modelInfo, phaseActions } from './model.mjs';

function identity() {
  const pair=generateKeyPairSync('ed25519');
  return {publicKey:pair.publicKey.export({type:'spki',format:'pem'}),secretKey:pair.privateKey.export({type:'pkcs8',format:'pem'})};
}
export function verifyEvent(event, member) {
  if (!event.signature) return false;
  const {signature,...payload}=event;
  return verify(null,Buffer.from(JSON.stringify(payload)),member.publicKey,Buffer.from(signature,'base64'));
}
export class Engine {
  constructor(store, turn=modelTurn) {
    this.store=store; this.turn=turn; this.running=new Set();
    this.state=store.load()??{members:seeds.map(m=>({...m,privateNote:'',consent:true,synthetic:true,...identity()})),requests:[],sessions:[],events:[],connections:[]};
    // Jobs are not silently resumed after process restart.
    for(const r of this.state.requests) if(['running','queued'].includes(r.status)) r.status='interrupted';
    for(const s of this.state.sessions) if(s.status==='running') {s.status='error';s.error='Execution interrupted. Start a fresh request after reviewing history.';}
    this.save();
  }
  save(){this.store.save(this.state);}
  member(id){const m=this.state.members.find(m=>m.id===id);if(!m) throw new Error('Unknown member');return m;}
  publicMember(m){const {secretKey,privateNote,...publicFields}=m;return publicFields;}
  snapshot(){return {...this.state,members:this.state.members.map(m=>this.publicMember(m)),configured:modelConfigured(),model:modelInfo(),sandbox:true};}
  profile(id){const {secretKey,...m}=this.member(id);return m;}
  addMember(input){const data=MemberInput.parse(input);const m={...data,id:randomUUID(),synthetic:false,...identity()};this.state.members.push(m);this.save();return this.publicMember(m);}
  updateMember(id,input){const data=MemberInput.parse(input);const m=this.member(id);if(this.state.requests.some(r=>r.status==='running'))throw new Error('Wait for running requests before changing profiles.');Object.assign(m,data);for(const s of this.state.sessions){if(s.status==='awaiting_approval'&&[s.ownerId,s.candidateId].includes(id)){s.status='withdrawn';this.event({requestId:s.requestId,sessionId:s.id,type:'withdrawn',message:'A member changed their profile. This proposal is withdrawn; fresh evaluation is required.'});}}this.save();return this.publicMember(m);}
  event(fields){
    const event={id:randomUUID(),seq:this.state.events.length+1,at:new Date().toISOString(),...fields};
    if(event.from && this.state.members.some(m=>m.id===event.from)) event.signature=sign(null,Buffer.from(JSON.stringify(event)),this.member(event.from).secretKey).toString('base64');
    this.state.events.push(event);this.save();return event;
  }
  createRequest(input){
    const data=RequestInput.parse(input);this.member(data.ownerId);
    const prior=this.state.requests.find(r=>r.idempotencyKey===data.idempotencyKey);
    if(prior)return prior;
    if(this.state.requests.some(r=>['running','queued'].includes(r.status))) throw new Error('Another request is queued or running. Wait for completion.');
    if(data.mode==='live'&&!modelConfigured()&&this.turn===modelTurn)throw new Error('Configure a model before starting live mode.');
    const r={...data,id:randomUUID(),createdAt:new Date().toISOString(),status:'queued'};
    this.state.requests.push(r);this.save();return r;
  }
  pairHistory(session){return this.state.events.filter(e=>e.sessionId===session.id&&e.type!=='executing');}
  async send(session,fromId,toId,phase){
    const request=this.state.requests.find(r=>r.id===session.requestId);
    const member=this.member(fromId),other=this.member(toId);
    this.event({requestId:request.id,sessionId:session.id,from:fromId,to:toId,type:'executing',message:`${member.name}'s agent is processing its own context.`,mode:request.mode});
    const packet=makePacket(member,other,request,this.pairHistory(session),phase);
    const result=await this.turn(packet,request.mode);
    const reply=AgentReply.parse(result.reply);
    const reject=(message)=>{const error=new Error(message);Object.assign(error,{call:result.call??null,model:result.model,usage:result.usage??null,reportedModel:result.reportedModel??null,rejectedAction:reply.action});throw error;};
    if(reply.evidenceIds.some(id=>!member.evidence.some(e=>e.id===id))) reject('Agent cited evidence it does not own; response rejected.');
    if(!phaseActions[phase].includes(reply.action))reject(`Agent returned ${reply.action} during ${phase}; expected ${phaseActions[phase].join(', ')}. Response rejected.`);
    const e=this.event({requestId:request.id,sessionId:session.id,from:fromId,to:toId,type:reply.action,message:reply.message,reason:reply.reason,evidenceIds:reply.evidenceIds,mode:request.mode,model:result.model,reportedModel:result.reportedModel??null,call:result.call??null,usage:result.usage??null});
    session.turns++;this.save();return e;
  }
  async run(id){
    const r=this.state.requests.find(r=>r.id===id);if(!r)throw new Error('Unknown request');
    if(this.running.has(id)||r.status!=='queued')return;
    this.running.add(id);r.status='running';this.save();
    try {
      const recent=Date.now()-7*24*3600*1000;
      const eligible=this.state.members.filter(m=>m.id!==r.ownerId&&m.consent&&m.skills.some(s=>r.topics.some(t=>s.toLowerCase().includes(t.toLowerCase())||t.toLowerCase().includes(s.toLowerCase()))));
      let contacted=0;
      for(const m of eligible){
        if(m.participation==='information_only'){
          this.event({requestId:id,from:m.id,to:m.id,type:'digest',message:`Saved “${r.title}” for ${m.name}. Information-only preference respected; no outreach.`,mode:r.mode});continue;
        }
        const recentPair=this.state.sessions.some(s=>this.state.requests.find(q=>q.id===s.requestId)?.mode===r.mode&&[s.ownerId,s.candidateId].includes(r.ownerId)&&[s.ownerId,s.candidateId].includes(m.id)&&new Date(s.createdAt).getTime()>recent&&s.status!=='error');
        if(recentPair){this.event({requestId:id,type:'skipped',message:`${m.name}: already contacted in the past 7 days.`,mode:r.mode});continue;}
        if(contacted>=3)continue;
        contacted++;
        const session={id:randomUUID(),requestId:id,ownerId:r.ownerId,candidateId:m.id,createdAt:new Date().toISOString(),status:'running',turns:0,approvals:{[r.ownerId]:'pending',[m.id]:'pending'},evidenceIds:[]};
        this.state.sessions.push(session);this.save();
        try {
          await this.send(session,r.ownerId,m.id,'inquire');
          let response=await this.send(session,m.id,r.ownerId,'respond');
          if(response.type==='clarification'){
            await this.send(session,r.ownerId,m.id,'answer');
            response=await this.send(session,m.id,r.ownerId,'conclude');
          }
          session.evidenceIds=response.evidenceIds;
          session.summary=response.message;
          // Server policy wins over model-generated commitments.
          if(m.availability==='unavailable')session.status='declined';
          else if(response.type==='proposal'&&(m.availability==='unknown'||!response.evidenceIds.length))session.status='needs_info';
          else session.status={proposal:'awaiting_approval',decline:'declined',needs_info:'needs_info'}[response.type]??'needs_info';
          this.event({requestId:id,sessionId:session.id,type:session.status,message:`Outcome: ${session.status}. ${session.status==='awaiting_approval'?'Both owners must approve the exact proposal.':'No introduction created.'}`,mode:r.mode});
        }catch(error){session.status='error';session.error=error.message;this.event({requestId:id,sessionId:session.id,type:'error',message:error.message,mode:r.mode,call:error.call??null,model:error.model??null,usage:error.usage??null,reportedModel:error.reportedModel??null,rejectedAction:error.rejectedAction??null});}
        this.save();
      }
      r.status=this.state.sessions.some(s=>s.requestId===id&&s.status==='error')?'completed_with_errors':'completed';
      if(!contacted)this.event({requestId:id,type:'no_match',message:'No eligible new introduction. Expand the topic or add consenting members; no candidates were invented.',mode:r.mode});
    }catch(error){r.status='error';this.event({requestId:id,type:'error',message:error.message,mode:r.mode});}
    finally{this.running.delete(id);this.save();}
  }
  approve(sessionId,ownerId,decision){
    if(!['approved','declined'].includes(decision))throw new Error('Invalid decision');
    const s=this.state.sessions.find(s=>s.id===sessionId);if(!s)throw new Error('Unknown session');
    if(![s.ownerId,s.candidateId].includes(ownerId))throw new Error('Only the two owners can decide');
    if(s.status==='connected'&&decision==='approved')return s;
    if(s.status!=='awaiting_approval')throw new Error('This proposal is not awaiting approval');
    s.approvals[ownerId]=decision;
    if(decision==='declined')s.status='declined';
    this.event({requestId:s.requestId,sessionId:s.id,from:ownerId,type:'owner_decision',message:`${this.member(ownerId).name} ${decision} this test proposal.`,actor:'human-test-operator'});
    if(Object.values(s.approvals).every(a=>a==='approved')){
      s.status='connected';
      if(!this.state.connections.some(c=>c.sessionId===s.id))this.state.connections.push({id:randomUUID(),sessionId:s.id,members:[s.ownerId,s.candidateId],summary:s.summary,messages:[]});
      this.event({requestId:s.requestId,sessionId:s.id,type:'human_handoff',message:'Both approvals recorded. A local human conversation is ready; no external message sent.'});
    }
    this.save();return s;
  }
  humanMessage(connectionId,ownerId,message){
    const c=this.state.connections.find(c=>c.id===connectionId);if(!c||!c.members.includes(ownerId))throw new Error('Not a participant');
    if(typeof message!=='string'||!message.trim()||message.length>3000)throw new Error('Invalid message');
    c.messages.push({id:randomUUID(),ownerId,message:message.trim(),at:new Date().toISOString()});this.save();return c;
  }
}
