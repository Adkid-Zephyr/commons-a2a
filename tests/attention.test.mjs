import test from 'node:test';
import assert from 'node:assert/strict';
import {attentionBrief} from '../lib/attention.mjs';
const state=()=>({dataset:'synthetic',members:[{id:'a',name:'A',privateNote:'PRIVATE-SENTINEL'},{id:'b',name:'B',evidence:[{id:'e1',title:'Evidence'}]},{id:'c',name:'C'}],requests:[{id:'r1',ownerId:'a',mode:'live'},{id:'r2',ownerId:'a',mode:'rehearsal'}],sessions:[],connections:[],events:[]});
const session=(id,more={})=>({id,requestId:'r1',ownerId:'a',candidateId:'b',status:'awaiting_approval',summary:'A useful connection',approvals:{a:'pending',b:'pending'},createdAt:'2026-10-22T18:00:00Z',evidenceIds:['e1'],...more});
test('brief prioritizes decisions, excludes other pairs and rehearsal, and keeps evidence',()=>{
 const s=state();s.sessions=[session('one'),session('other',{ownerId:'b',candidateId:'c'}),session('fake',{requestId:'r2'}),session('decline',{status:'declined'}),session('waiting',{approvals:{a:'approved',b:'pending'}})];
 s.events=[{id:'t',sessionId:'one',requestId:'r1',model:'real',type:'proposal',message:'hello'}];
 const result=attentionBrief(s,'a');assert.equal(result.items.length,2);assert.equal(result.items[0].kind,'decision');assert.deepEqual(result.items[0].actions,['inspect_session','approve','decline']);assert.equal(result.items[0].evidence[0].id,'e1');
 assert.equal(result.items[1].kind,'waiting');assert.equal(result.stats.outcomesWithoutAction,1);assert.equal(result.stats.agentTurns,1);assert(!JSON.stringify(result).includes('PRIVATE-SENTINEL'));assert(!result.items.some(i=>['other','fake'].includes(i.sessionId)));
});
test('read projection never mutates state and paginates without losing total count',()=>{
 const s=state();s.sessions=[session('one'),session('two'),session('three')];const old=JSON.stringify(s);
 const result=attentionBrief(s,'a',{limit:1,offset:1});assert.equal(result.totalItems,3);assert.equal(result.items.length,1);assert(result.hasMore);assert.equal(JSON.stringify(s),old);
 assert.throws(()=>attentionBrief(s,'a',{limit:0}));assert.throws(()=>attentionBrief(s,'missing'));
});
test('source replay cannot offer approve actions even for an anomalous pending session',()=>{
 const s=state();s.members[1].representation='source_replay';s.sessions=[session('one')];const b=attentionBrief(s,'a');assert.equal(b.items[0].kind,'waiting');assert.deepEqual(b.items[0].actions,['inspect_session']);assert.equal(b.stats.decisionsPending,0);
});
test('information-only member sees own digest but not another member updates',()=>{
 const s=state();s.events=[{id:'e1',requestId:'r1',type:'digest',to:'a',message:'Relevant update'},{id:'e2',requestId:'r1',type:'digest',to:'b',message:'Someone else'}];
 const b=attentionBrief(s,'a');assert.equal(b.items.length,1);assert.equal(b.items[0].summary,'Relevant update');assert.equal(b.stats.agentTurns,0);
});
