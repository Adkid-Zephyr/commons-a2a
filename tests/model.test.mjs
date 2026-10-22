import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { makePacket, modelTurn } from '../lib/model.mjs';
import { seeds } from '../lib/seed.mjs';

test('live adapter uses scoped separate HTTP calls, keeps provider metadata, and fails closed',async()=>{
 const old={...process.env};let behavior='valid';const received=[];
 const server=createServer(async(req,res)=>{
  let text='';for await(const chunk of req)text+=chunk;const body=JSON.parse(text);received.push(body);
  if(behavior==='error'){res.writeHead(503);res.end('unavailable');return;}
  if(behavior==='redirect'){res.writeHead(302,{Location:'http://127.0.0.1:1/'});res.end();return;}
  const result={id:'stub-'+received.length,model:'provider-reported-model',choices:[{finish_reason:'stop',message:{content:JSON.stringify({action:'inquiry',message:'Specific stub inquiry',reason:'Test only',evidenceIds:[]})}}],usage:{prompt_tokens:10,completion_tokens:8,total_tokens:18}};
  if(behavior==='invalid')result.choices[0].message.content='not json';
  if(behavior==='length')result.choices[0].finish_reason='length';
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  process.env.MODEL_BASE_URL=`http://127.0.0.1:${server.address().port}/v1`;
  process.env.MODEL_NAME='test-adapter-only';process.env.MODEL_API_KEY='local-stub-key';
  const request={kind:'speaker',title:'Specific topic',details:'Specific time constraint',topics:['payments']};
  const owner={...seeds[0],privateNote:'PRIVATE_SENTINEL',secretKey:'SECRET_SENTINEL',newSensitiveField:'FUTURE_SECRET'};
  const first=makePacket(owner,seeds[1],request,[],'inquire');
  assert(!JSON.stringify(first).includes('SENTINEL'));assert(!JSON.stringify(first).includes('FUTURE_SECRET'));
  const a=await modelTurn(first,'live');const b=await modelTurn(makePacket(seeds[1],owner,request,[],'inquire'),'live');
  assert.notEqual(a.call.id,b.call.id);assert.notEqual(a.call.inputHash,b.call.inputHash);
  assert.equal(a.call.agentId,'maya');assert.equal(b.call.agentId,'leo');assert.equal(a.reportedModel,'provider-reported-model');assert.equal(a.usage.total_tokens,18);
  assert.equal(JSON.parse(received[0].messages[1].content).member.id,'maya');
  assert.equal(JSON.parse(received[1].messages[1].content).member.id,'leo');
  assert(!JSON.stringify(received).includes('SENTINEL'));
  behavior='error';await assert.rejects(()=>modelTurn(first,'live'),/503.*no simulated fallback/);
  behavior='invalid';await assert.rejects(()=>modelTurn(first,'live'),/invalid structured output/);
  behavior='length';await assert.rejects(()=>modelTurn(first,'live'),/truncated/);
  behavior='redirect';await assert.rejects(()=>modelTurn(first,'live'));
 }finally{
  for(const key of ['MODEL_BASE_URL','MODEL_NAME','MODEL_API_KEY']){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}
  await new Promise(resolve=>server.close(resolve));
 }
});
