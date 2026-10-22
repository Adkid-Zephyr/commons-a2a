import {mkdir,writeFile} from 'node:fs/promises';
import {readChannelMessages} from '../lib/discord-readonly.mjs';
const channelId=process.argv[2];
const messages=await readChannelMessages({token:process.env.DISCORD_BOT_TOKEN,channelId,allowedChannelIds:(process.env.DISCORD_ALLOWED_CHANNEL_IDS??'').split(',').map(s=>s.trim()),limit:30});
await mkdir('private-data/discord',{recursive:true,mode:0o700});
const path=`private-data/discord/api-${channelId}-${Date.now()}.json`;
await writeFile(path,JSON.stringify({capturedAt:new Date().toISOString(),sourceKind:'official_bot_get_only',messages},null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({path,messages:messages.length,requests:1,method:'GET',importedIntoModel:false}));
