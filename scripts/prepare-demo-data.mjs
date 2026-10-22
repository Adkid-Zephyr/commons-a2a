import {mkdir,writeFile} from 'node:fs/promises';
import {connect} from 'node:net';
import {Engine} from '../lib/engine.mjs';
import {createStore} from '../lib/store.mjs';
import {seeds} from '../lib/seed.mjs';
import {extraMembers,demoScenarios} from '../fixtures/expanded-community.mjs';

await mkdir('public/demo',{recursive:true});
await writeFile('public/demo/community-fixtures.json',JSON.stringify({version:1,provenance:'Wholly fictional synthetic fixture data; not organizer or Discord records',members:[...seeds,...extraMembers],scenarios:demoScenarios},null,2)+'\n');
await writeFile('public/demo/community-brief.txt',['SYNTHETIC COMMUNITY — ALL 40 PEOPLE AND PROJECTS ARE FICTIONAL.','No messages below came from Discord.','',...[...seeds,...extraMembers].map(m=>`${m.name} | ${m.role}\nContext: ${m.context}\nGoal: ${m.goals}\nSkills: ${m.skills.join(', ')}\nAvailability: ${m.availability}; participation: ${m.participation}\n`)].join('\n'));
if(!process.argv.includes('--install')){console.log('Generated 40 fictional profiles and 14 scenarios. Stop the local server, then run with --install to append to existing synthetic history.');process.exit(0)}
const listening=await new Promise(resolve=>{const s=connect({host:'127.0.0.1',port:3402});s.on('connect',()=>{s.destroy();resolve(true)});s.on('error',()=>resolve(false))});
if(listening)throw Error('Stop Commons on port 3402 before installing; never overwrite an active in-memory store.');
const store=createStore();const old=store.load();if(old?.requests.some(r=>['running','queued'].includes(r.status)))throw Error('Unfinished requests exist; review before installing.');
await mkdir('.data/backups',{recursive:true,mode:0o700});
const stamp=new Date().toISOString().replaceAll(':','-');
if(old)await writeFile(`.data/backups/synthetic-before-expansion-${stamp}.json`,JSON.stringify(old),{mode:0o600,flag:'wx'});
const app=new Engine(store);const scratch=createStore(':memory:');const staged=new Engine(scratch,undefined,{members:extraMembers});
const added=staged.state.members.filter(m=>!app.state.members.some(x=>x.id===m.id));app.state.members.push(...added);app.save();scratch.close();
let runs=0;
for(const s of demoScenarios){if(app.state.requests.some(r=>r.idempotencyKey===s.key))continue;const r=app.createRequest({...s,mode:'rehearsal',authorized:true,idempotencyKey:s.key});await app.run(r.id);runs++}
const ids=new Set(app.state.requests.filter(r=>r.idempotencyKey.startsWith('expanded-v1-')).map(r=>r.id));
const sessions=app.state.sessions.filter(s=>ids.has(s.requestId));
const report={addedMembers:added.length,totalMembers:app.state.members.length,newRuns:runs,expandedRequests:ids.size,expandedSessions:sessions.length,expandedEvents:app.state.events.filter(e=>ids.has(e.requestId)).length,outcomes:Object.fromEntries([...new Set(sessions.map(s=>s.status))].map(k=>[k,sessions.filter(s=>s.status===k).length])),realModelCalls:0,externalMessages:0};
await writeFile('public/demo/expansion-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));store.close();
