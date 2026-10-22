// Import an operator-reviewed, redacted bundle; never fetches or posts Discord data.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {validateReplay} from '../lib/replay.mjs';
const path=process.argv[2];if(!path)throw new Error('Usage: node scripts/import-replay.mjs <private bundle.json>');
const bundle=validateReplay(JSON.parse(await readFile(path,'utf8')));
await mkdir('.data',{recursive:true,mode:0o700});
await writeFile(`.data/${bundle.dataset}-seed.json`,JSON.stringify(bundle,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({dataset:bundle.dataset,members:bundle.members.length,requests:bundle.requests.length,ownerConsent:false,externalWrites:0}));
