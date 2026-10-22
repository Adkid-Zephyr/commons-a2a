// Intentionally no generic request method, webhook, send, reaction or DM API.
export async function readChannelMessages({token,channelId,allowedChannelIds,limit=30},fetcher=fetch){
 if(!token)throw new Error('DISCORD_BOT_TOKEN is not configured. Use an official bot token, not a user token.');
 if(!/^\d{17,20}$/.test(channelId)||!allowedChannelIds.includes(channelId))throw new Error('Channel is not explicitly allowlisted');
 if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('Limit must be 1–100');
 const res=await fetcher(`https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,{
  method:'GET',redirect:'error',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bot ${token}`},
 });
 if(res.status===429)throw new Error(`Discord rate limit; wait ${res.headers.get('retry-after')??'the indicated'} seconds before retrying. No automatic crawl.`);
 if(!res.ok)throw new Error(`Discord read failed: HTTP ${res.status}. Check bot membership and VIEW_CHANNEL / READ_MESSAGE_HISTORY.`);
 const data=await res.json();if(!Array.isArray(data))throw new Error('Unexpected Discord response');
 const visible=data.filter(m=>!m.author?.bot&&!m.webhook_id&&!(Number(m.flags??0)&64));
 if(visible.length&&visible.every(m=>!m.content))throw new Error('Message content unavailable; check MESSAGE_CONTENT intent. No empty import created.');
 return visible.map(m=>({id:m.id,channelId:m.channel_id,timestamp:m.timestamp,content:m.content,authorId:m.author?.id,authorName:m.author?.global_name??m.author?.username}));
}
