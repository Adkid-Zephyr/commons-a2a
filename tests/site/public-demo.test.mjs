import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createDemoService} from '../../.sites/commons-judges/src/browser-service.mjs';
const service=()=>{const m=new Map();return createDemoService({getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)});};
const get=async(s,q='')=>(await s('/api?dataset=synthetic'+q)).json();
const post=async(s,body)=>s('/api?dataset=synthetic',{method:'POST',body:JSON.stringify(body)});

test('public visitors are isolated, live calls are blocked, rehearsal completes both-owner handoff',async()=>{
  const a=service(),b=service();const original=await get(a);
  assert.equal(original.members.length,40);assert.equal(original.configured,false);
  assert.equal(original.events.filter(e=>e.call).length,8);
  assert.equal((await post(a,{action:'demo',scenario:'collaborator',mode:'live',idempotencyKey:'blocked-live-demo'})).status,400);
  assert.equal((await a('/api?dataset=discord-replay')).status,400);
  const r=await (await post(a,{action:'demo',scenario:'collaborator',mode:'rehearsal',idempotencyKey:'test-public-rehearsal'})).json();
  let state;
  for(let i=0;i<40;i++){state=await get(a);if(state.requests.find(q=>q.id===r.id).status==='completed')break;await new Promise(r=>setTimeout(r,100));}
  assert.equal(state.requests.find(q=>q.id===r.id).status,'completed');
  const session=state.sessions.find(s=>s.requestId===r.id&&s.status==='awaiting_approval');assert(session);
  assert.equal((await post(a,{action:'approve',sessionId:session.id,ownerId:session.ownerId,decision:'approved'})).status,200);
  assert.equal((await get(a)).connections.length,0);
  await post(a,{action:'approve',sessionId:session.id,ownerId:session.candidateId,decision:'approved'});
  const connection=(await get(a)).connections[0];assert(connection);
  await post(a,{action:'message',connectionId:connection.id,ownerId:session.ownerId,message:'Browser-only hello'});
  assert.equal((await get(a)).connections[0].messages[0].message,'Browser-only hello');
  assert.equal((await get(b)).requests.length,original.requests.length);
  assert.equal((await get(b)).connections.length,0);
  const brief=await get(a,'&view=attention&ownerId=maya&mode=live');
  assert(brief.items.every(i=>!i.actions.some(a=>['approve','decline','clarify_request'].includes(a))));
  assert((await get(a)).events.filter(e=>e.requestId===r.id).every(e=>!e.call&&!e.signature));
});
test('Spider public interface is English-only and artifact contains no model credentials or Node server',async()=>{
  for(const path of ['dist/demo/index.html','dist/spider/community-main.js']){
    const text=await readFile(new URL('../../.sites/commons-judges/'+path,import.meta.url),'utf8');
    assert(!/\p{Script=Han}/u.test(text),path);
  }
  const model=await readFile(new URL('../../.sites/commons-judges/src/lib/model.mjs',import.meta.url),'utf8');
  assert(!/MODEL_API_KEY|chat\/completions|node:crypto/.test(model));
});
