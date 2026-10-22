import { NextRequest, NextResponse, after } from 'next/server';
// @ts-ignore local runtime modules are validated with executable tests
import { engine, datasets } from '../../lib/runtime.mjs';
import { attentionBrief } from '../../lib/attention.mjs';
import { createDemo, createFollowup } from '../../lib/demo.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';

function localOnly(req:NextRequest){
  const host=req.headers.get('host')??'';
  if(!/^(localhost|127\.0\.0\.1):3402$/.test(host))throw new Error('Local sandbox only');
  const origin=req.headers.get('origin');
  if(req.method!=='GET'&&origin!==`http://${host}`)throw new Error('Same-origin request required');
}
export async function GET(req:NextRequest){
  try {
    localOnly(req);
    const params=req.nextUrl.searchParams;
    const app=engine(params.get('dataset')??'synthetic');
    const profile=params.get('profile');
    const data=params.get('view')==='attention'
      ? attentionBrief(app.state,params.get('ownerId'),{mode:params.get('mode')??'live',limit:Number(params.get('limit')??5),offset:Number(params.get('offset')??0)})
      : profile?app.profile(profile):{...app.snapshot(),datasets:datasets()};
    return NextResponse.json(data,{headers:{'Cache-Control':'no-store'}});
  }
  catch(e:any){return NextResponse.json({error:e.message},{status:400});}
}
export async function POST(req:NextRequest){
  try {
    localOnly(req);
    if(Number(req.headers.get('content-length')??0)>100000)throw new Error('Input too large');
    const text=await req.text();if(text.length>100000)throw new Error('Input too large');
    const {action,...body}=JSON.parse(text);const app=engine(req.nextUrl.searchParams.get('dataset')??'synthetic');
    if(app.state.dataset!=='synthetic'&&['member','approve','message','demo','clarify'].includes(action))throw new Error('Source replay is immutable; real owner actions are disabled.');
    if(action==='demo'){const r=createDemo(app,body);after(()=>app.run(r.id));return NextResponse.json(r);}
    if(action==='clarify'){const r=createFollowup(app,body);after(()=>app.run(r.id));return NextResponse.json(r);}
    if(action==='member')return NextResponse.json(body.id?app.updateMember(body.id,body.profile):app.addMember(body.profile));
    if(action==='request'){const r=app.createRequest(body.request);after(()=>app.run(r.id));return NextResponse.json(r);}
    if(action==='approve')return NextResponse.json(app.approve(body.sessionId,body.ownerId,body.decision));
    if(action==='message')return NextResponse.json(app.humanMessage(body.connectionId,body.ownerId,body.message));
    throw new Error('Unknown action');
  }catch(e:any){return NextResponse.json({error:e.message},{status:400});}
}
