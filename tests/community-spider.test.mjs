import test from 'node:test';
import assert from 'node:assert/strict';
import {communityRun,communityState,sourceFromState} from '../public/spider/community-model.js';
test('community spider routes actual names, signals, keywords and event mentions without scores',()=>{
 const run=communityRun('Maya: Looking for a React collaborator at our Thursday meetup.\n\nLeo: I can help with payments.',[{id:'m',name:'Maya',skills:['React']},{id:'l',name:'Leo',skills:['payments']}]);
 assert(run.decisions.some(d=>d.memberId==='m'&&d.route==='code'));
 assert(run.decisions.some(d=>d.word==='React'&&d.route==='topic'));
 assert(run.decisions.some(d=>d.word==='Looking'&&d.route==='model'));
 assert(run.decisions.some(d=>d.word==='Thursday'&&d.route==='you'));
 assert(run.decisions.every(d=>!('score' in d)));
 const done=communityState(run,24),start=communityState(run,0);
 assert.equal(start.decisions.length,0);assert.equal(done.decisions.length,run.decisions.length);
 assert.equal(Object.values(done.counts).reduce((a,b)=>a+b,0),done.decisions.length);
 assert.notEqual(done.total,195);assert.notEqual(done.decisions.length,175);
});
test('clicked extraction retains its actual source and replay seeks deterministically',()=>{
 const run=communityRun('A: Need Python help.\n\nB: Workshop tomorrow.',[]);
 for(const d of run.decisions)assert(run.sources[d.messageIndex].text.includes(d.word));
 assert.deepEqual(communityState(run,12),communityState(run,12));assert.equal(communityRun('').decisions.length,0);
});
test('community source adapter excludes fake rehearsal exchanges and private fields',()=>{
 const data={dataset:'synthetic',members:[{id:'a',name:'A',context:'Public',goals:'Help',skills:[],privateNote:'PRIVATE_SENTINEL'}],requests:[{id:'r',ownerId:'a',details:'A request',mode:'live'}],events:[{id:'e1',requestId:'r',from:'a',type:'reply',mode:'live',model:'real',message:'A live reply'},{id:'e2',requestId:'r',from:'a',type:'reply',mode:'rehearsal',model:'deterministic-rehearsal',message:'FAKE_SENTINEL'}]};
 const source=sourceFromState(data,'r');assert(source.text.includes('A live reply'));assert(!source.text.includes('FAKE_SENTINEL'));assert(!source.text.includes('PRIVATE_SENTINEL'));
});
