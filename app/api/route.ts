import { NextRequest, NextResponse, after } from 'next/server';
// @ts-ignore local runtime modules are validated with executable tests
import { engine } from '../../lib/runtime.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';

function localOnly(req:NextRequest){
  const host=req.headers.get('host')??'';
  if(!/^(localhost|127\.0\.0\.1):3402$/.test(host))throw new Error('Local sandbox only');
  const origin=req.headers.get('origin');
  if(req.method!=='GET'&&origin!==`http://${host}`)throw new Error('Same-origin request required');
}
export async function GET(req:NextRequest){
  try {localOnly(req);const id=req.nextUrl.searchParams.get('profile');return NextResponse.json(id?engine().profile(id):engine().snapshot(),{headers:{'Cache-Control':'no-store'}});}
  catch(e:any){return NextResponse.json({error:e.message},{status:400});}
}
export async function POST(req:NextRequest){
  try {
    localOnly(req);
    if(Number(req.headers.get('content-length')??0)>100000)throw new Error('Input too large');
    const text=await req.text();if(text.length>100000)throw new Error('Input too large');
    const {action,...body}=JSON.parse(text);const app=engine();
    if(action==='member')return NextResponse.json(body.id?app.updateMember(body.id,body.profile):app.addMember(body.profile));
    if(action==='request'){const r=app.createRequest(body.request);after(()=>app.run(r.id));return NextResponse.json(r);}
    if(action==='approve')return NextResponse.json(app.approve(body.sessionId,body.ownerId,body.decision));
    if(action==='message')return NextResponse.json(app.humanMessage(body.connectionId,body.ownerId,body.message));
    throw new Error('Unknown action');
  }catch(e:any){return NextResponse.json({error:e.message},{status:400});}
}
