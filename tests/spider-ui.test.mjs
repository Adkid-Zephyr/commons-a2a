import test from 'node:test';
import assert from 'node:assert/strict';
import {selectedRun,runEvents,metrics,playbackSlice,isReplayDataset,memberLabel} from '../public/spider/adapter.js';

test('spider UI derives counts only from the selected run and current owner',()=>{
 const s={requests:[{id:'old',mode:'rehearsal'},{id:'new',mode:'live'}],sessions:[{requestId:'new',status:'awaiting_approval',ownerId:'a',candidateId:'b',approvals:{a:'pending',b:'approved'}},{requestId:'new',status:'declined'},{requestId:'old',status:'declined'}],events:[{requestId:'new',seq:2,call:{id:'2'}},{requestId:'old',seq:1,call:{id:'1'}},{requestId:'new',seq:3,type:'error',call:{id:'3'}},{requestId:'new',seq:1,type:'executing'}]};
 assert.equal(selectedRun(s,'new').mode,'live');assert.equal(selectedRun(s,'missing').id,'new');
 assert.deepEqual(metrics(s,'new','a'),{calls:1,handled:1,decisions:1});assert.equal(metrics(s,'new','b').decisions,0);assert.equal(metrics(s,'new','outsider').decisions,0);
 assert.deepEqual(runEvents(s,'new').map(e=>e.seq),[1,2,3]);
});
test('recorded playback is a bounded view, leaves actual records untouched',()=>{
 const events=[{id:'a'},{id:'b'}];assert.equal(playbackSlice(events,null),events);assert.deepEqual(playbackSlice(events,0),[]);assert.equal(playbackSlice(events,1).length,1);assert.equal(playbackSlice(events,99).length,2);assert.equal(events.length,2);
});
test('source replay is labelled separately from fictional or imported members',()=>{
 assert.equal(isReplayDataset({dataset:'synthetic'}),false);assert.equal(isReplayDataset({dataset:'discord-replay'}),true);
 assert.match(memberLabel({representation:'source_replay',synthetic:false}),/no owner consent/);assert.match(memberLabel({synthetic:true}),/Fictional/);
});
