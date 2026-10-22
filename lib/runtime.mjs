import { Engine } from './engine.mjs';
import { createStore } from './store.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { validateReplay } from './replay.mjs';
const key=Symbol.for('commons.datasets.v1');
export function datasets(){return [{id:'synthetic',label:'Synthetic fixtures'},...['discord-replay','organizer-replay'].filter(id=>existsSync(`.data/${id}-seed.json`)).map(id=>({id,label:id==='discord-replay'?'Discord · read-only replay':'Organizer · isolated replay'}))];}
export function engine(dataset='synthetic'){
 if(!['synthetic','discord-replay','organizer-replay'].includes(dataset))throw new Error('Unknown dataset');
 const engines=globalThis[key]??=new Map();
 if(engines.has(dataset))return engines.get(dataset);
 let options={};
 if(dataset!=='synthetic'){
   if(!existsSync(`.data/${dataset}-seed.json`))throw new Error('Source dataset has not been provided');
   const bundle=validateReplay(JSON.parse(readFileSync(`.data/${dataset}-seed.json`,'utf8')));
   if(bundle.dataset!==dataset)throw new Error('Dataset mismatch');
   options={members:bundle.members,dataset,sourceInfo:{label:bundle.label,capturedAt:bundle.capturedAt,sourceKind:bundle.sourceKind,sourceDigest:bundle.sourceDigest,messageCount:bundle.members.length,ownerConsent:false,requests:bundle.requests}};
 }
 const app=new Engine(createStore(dataset==='synthetic'?'.data/commons.sqlite':`.data/${dataset}.sqlite`),undefined,options);
 engines.set(dataset,app);return app;
}
