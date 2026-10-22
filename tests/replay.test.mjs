import test from 'node:test';
import assert from 'node:assert/strict';
import {validateReplay} from '../lib/replay.mjs';
import {Engine} from '../lib/engine.mjs';
import {createStore} from '../lib/store.mjs';
import {readChannelMessages} from '../lib/discord-readonly.mjs';
const profile={name:'Member',role:'Builder',context:'Self-reported source context',goals:'Find teammates',skills:['agents'],availability:'available',participation:'connect',consent:true,evidence:[],privateNote:''};
const fixture=()=>({dataset:'discord-replay',label:'test',capturedAt:new Date().toISOString(),sourceKind:'discord_readonly',sourceDigest:'a'.repeat(64),operatorAuthorized:true,members:[{...profile,id:'replay-a',sourceRef:'message-a'},{...profile,id:'replay-b',sourceRef:'message-b'}],requests:[]});

test('source replay does not infer owner consent or present-day availability',()=>{
 const b=validateReplay(fixture());assert(b.members.every(m=>!m.ownerConsent&&m.availability==='unknown'&&m.representation==='source_replay'));
 const store=createStore(':memory:');const app=new Engine(store,undefined,{members:b.members,dataset:b.dataset});
 app.state.sessions.push({id:'s',ownerId:'replay-a',candidateId:'replay-b',status:'awaiting_approval',approvals:{'replay-a':'pending','replay-b':'pending'}});
 assert.throws(()=>app.approve('s','replay-a','approved'),/no actual owner authorization/);assert.equal(app.state.connections.length,0);store.close();
});
test('fixture and source datasets have disjoint state',()=>{
 const a=createStore(':memory:'),b=createStore(':memory:');const original=new Engine(a),replay=new Engine(b,undefined,{members:validateReplay(fixture()).members,dataset:'discord-replay'});
 assert.equal(original.member('maya').name,'Maya');assert.throws(()=>replay.member('maya'));assert.throws(()=>original.member('replay-a'));
 replay.event({type:'test',message:'only here'});assert.equal(original.state.events.length,0);a.close();b.close();
});
test('unknown replay request owner and non-authorized import are rejected',()=>{
 assert.throws(()=>validateReplay({...fixture(),operatorAuthorized:false}));
 assert.throws(()=>validateReplay({...fixture(),requests:[{ownerId:'missing',kind:'speaker',title:'test',details:'test detail here',topics:['agents'],sourceRef:'ref'}]}),/Unknown replay request owner/);
});
test('Discord client only GETs one allowlisted history page and omits bot/ephemeral messages',async()=>{
 const id='1562246478049710100';const seen=[];
 const fake=async(url,opts)=>{seen.push({url,opts});return new Response(JSON.stringify([{id:'1',channel_id:id,content:'hello',author:{id:'a',username:'user'}},{id:'2',content:'private reply',flags:64},{id:'3',content:'bot',author:{bot:true}}]),{status:200});};
 const rows=await readChannelMessages({token:'test-only',channelId:id,allowedChannelIds:[id],limit:10},fake);
 assert.equal(rows.length,1);assert.equal(seen.length,1);assert.equal(seen[0].opts.method,'GET');assert.equal(seen[0].opts.redirect,'error');assert.equal(seen[0].opts.headers.Authorization,'Bot test-only');
 await assert.rejects(()=>readChannelMessages({token:'test-only',channelId:'1562207012375236670',allowedChannelIds:[id]},fake),/allowlisted/);
 assert.equal(seen.length,1);
});
test('Discord read failures and empty message-content access are explicit',async()=>{
 const args={token:'test-only',channelId:'1562246478049710100',allowedChannelIds:['1562246478049710100']};
 await assert.rejects(()=>readChannelMessages(args,async()=>new Response('',{status:403})),/HTTP 403/);
 await assert.rejects(()=>readChannelMessages(args,async()=>new Response('',{status:429,headers:{'retry-after':'5'}})),/rate limit/);
 await assert.rejects(()=>readChannelMessages(args,async()=>new Response(JSON.stringify([{id:'1',content:'',author:{}}]),{status:200})),/MESSAGE_CONTENT/);
});
