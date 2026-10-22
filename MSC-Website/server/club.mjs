import {backupResponse} from './backup.mjs';
const MEMBER_INTERESTS=['Strategy Summit','Exec openings','Workshops','Networking'];
const PARTNER_INTERESTS=['Workshop','Case for Summit','Sponsorship','Speaking','Other'];
const EVENTS=new Set(['page_view','section_view','profile_view','event_view','word_view','join_open','partner_open','outbound_click']);
const SAFE_TARGETS=new Set(['home','about','story','events','chessboard','team','words','partners','join','welcome','instagram','linkedin','club','summit','weekly-word','iteration','joe-kuang','billy-batsaikhan','amy-kang','geser-ganbold','meghana-kuchipudi','nicholas-mok','jayden-li','joshua-chan','kimberly-sutjiono','jacob-lee','eren-ehli','laila-yick-lewis','angelina-bell','melissa-vu','anudari-esen','jayden-lee','angelie-samlal']);
export const CONSENT_VERSION='msc-updates-2026-10-17';
const mail='managementstrategycouncil@gmail.com';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=(value,max=100)=>typeof value==='string'?value.trim().replace(/[\u0000-\u001f]/g,' ').slice(0,max):'';
const tag=value=>{const s=clean(value,70);return /^[a-zA-Z0-9_. -]*$/.test(s)?s:'';};
const session=value=>/^[a-f0-9-]{36}$/.test(value||'')?value:'';
export function attribution(data={}){return {source:tag(data.source)||'unattributed',medium:tag(data.medium)||'none',campaign:tag(data.campaign),sessionId:session(data.sessionId)};}
const result=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export function adminIdentity(request,env){const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');const allowed=String(env.MSC_ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);return id&&email&&allowed.includes(email.toLowerCase())?{id,email}:null;}
export function emailReady(env){return !!(env.RESEND_API_KEY&&env.MSC_EMAIL_FROM&&env.MSC_EMAIL_ENABLED==='true');}
async function body(request,max=12000){if(Number(request.headers.get('content-length'))>max)throw Object.assign(Error('Request is too large.'),{status:413});const text=await request.text();if(text.length>max)throw Object.assign(Error('Request is too large.'),{status:413});try{return JSON.parse(text);}catch{throw Object.assign(Error('Please submit valid form data.'),{status:400});}}
function originOK(request){return request.headers.get('origin')===new URL(request.url).origin;}
async function hmac(value,key){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);return [...new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(value)))].map(v=>v.toString(16).padStart(2,'0')).join('');}
async function rate(request,env,scope,max,now){
 if(!env.MSC_RATE_SALT)throw Object.assign(Error('The form is temporarily unavailable. Please contact MSC.'),{status:503});
 const ip=request.headers.get('cf-connecting-ip')||'local',bucket=Math.floor(now/3600000),key=await hmac(`${scope}:${ip}:${bucket}`,env.MSC_RATE_SALT);
 const row=await env.DB.prepare('INSERT INTO club_rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+7200000).first();
 if(row.count>max)throw Object.assign(Error('Too many requests. Please try again later.'),{status:429});
}
export function validateSubmission(data){
 const type=data.type==='partner'?'partner':data.type==='member'?'member':null;if(!type)return {error:'Choose a member or partnership enquiry.'};
 const name=clean(data.name),email=clean(data.email,254).toLowerCase();if(!name||!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {error:'Please provide your name and a valid email address.'};
 if(data.website)return {error:'Please leave the extra website field blank.'};
 const details={};for(const key of type==='partner'?['role','organization','kind','idea']:['year','program','note'])details[key]=clean(data[key],key==='idea'?2000:key==='note'?1000:160);
 if((type==='partner'?['role','organization','kind','idea']:['year','program']).some(key=>!details[key]))return {error:'Please fill in all required fields.'};
 if(type==='member'&&!['1st','2nd','3rd','4th','5th or later','graduate'].includes(details.year))return {error:'Please choose a year of study.'};
 if(type==='partner'&&!PARTNER_INTERESTS.includes(details.kind))return {error:'Please choose a partnership type.'};
 const interests=Array.isArray(data.interests)?[...new Set(data.interests.filter(v=>MEMBER_INTERESTS.includes(v)))]:[];
 return {value:{type,name,email,details,interests,consent:type==='member'&&data.emailConsent===true?1:0,...attribution(data.attribution)}};
}
function emailPayload(kind,row,origin,token){
 const confirm=`${origin}/confirm?token=${encodeURIComponent(token)}`,unsubscribe=`${origin}/unsubscribe?token=${encodeURIComponent(row.unsubscribe_token)}`;
 const welcome=kind==='welcome',heading=welcome?'Your next move with MSC.':'Confirm your MSC email updates.';
 const copy=welcome?'Thanks for joining the conversation. Explore our experiences, meet the council and follow MSC for confirmed dates.':'You asked to receive MSC events and opportunities by email. Confirm below to finish subscribing. If this was not you, ignore this email.';
 const action=welcome?`${origin}/welcome`:confirm,label=welcome?'Start here':'Confirm my email';
 return {from:null,to:[row.email],reply_to:mail,subject:welcome?'Welcome to the Management Strategy Council':'Confirm your MSC email updates',text:`Hi ${row.name},\n\n${heading}\n${copy}\n\n${label}: ${action}\n\nUnsubscribe: ${unsubscribe}\n\nManagement Strategy Council, University of Toronto Scarborough\n1265 Military Trail, Toronto, ON M1C 1A4\n${mail}`,html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#282126;background:#f8f6f1;padding:32px"><p style="color:#571020">MANAGEMENT STRATEGY COUNCIL / UTSC</p><h1 style="font-family:Georgia,serif;font-weight:400">${heading}</h1><p>Hi ${esc(row.name)},</p><p style="line-height:1.7">${copy}</p><p><a href="${esc(action)}" style="display:inline-block;background:#571020;color:white;padding:14px 22px">${label}</a></p><p style="font-size:12px">${welcome?'You confirmed that you would like MSC email updates.':'This confirmation link expires in seven days.'}</p><hr><p style="font-size:12px">Management Strategy Council · University of Toronto Scarborough<br>1265 Military Trail, Toronto, ON M1C 1A4<br><a href="mailto:${mail}">${mail}</a> · <a href="${esc(unsubscribe)}">Unsubscribe</a></p></div>`};
}
async function sendEmail(row,kind,request,env,now,fetchImpl){
 if(!emailReady(env))return {status:'not_configured'};
 if(!row.consent||row.email_status==='unsubscribed'||(kind==='welcome'&&row.email_status!=='confirmed'))return {status:'not_eligible'};
 let job=await env.DB.prepare('SELECT * FROM club_email_jobs WHERE submission_id=? AND kind=?').bind(row.id,kind).first();
 if(!job){
  const token=crypto.randomUUID();const payload=emailPayload(kind,row,new URL(request.url).origin,token);payload.from=env.MSC_EMAIL_FROM;
  await env.DB.prepare('INSERT INTO club_email_jobs (id,submission_id,kind,token,payload,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(submission_id,kind) DO NOTHING').bind(crypto.randomUUID(),row.id,kind,kind==='confirmation'?token:null,JSON.stringify(payload),'pending',now,now).run();
  job=await env.DB.prepare('SELECT * FROM club_email_jobs WHERE submission_id=? AND kind=?').bind(row.id,kind).first();
 }
 if(kind==='confirmation')await env.DB.prepare("UPDATE club_submissions SET confirm_token=?,confirm_expires=?,email_status='pending' WHERE id=? AND email_status IN ('waiting_setup','pending')").bind(job.token,job.created_at+7*86400000,row.id).run();
 const current=await env.DB.prepare('SELECT consent,email_status FROM club_submissions WHERE id=?').bind(row.id).first();if(!current?.consent||current.email_status==='unsubscribed')return {status:'not_eligible'};
 if(job.status==='sent'||job.status==='sending'||job.status==='uncertain')return {status:job.status};
 const claimed=await env.DB.prepare("UPDATE club_email_jobs SET status='sending',updated_at=? WHERE id=? AND status IN ('pending','failed') RETURNING id").bind(now,job.id).first();if(!claimed)return {status:'sending'};
 try{
  const response=await fetchImpl('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`msc/${job.id}`},body:job.payload,signal:AbortSignal.timeout(10000)});
  const output=await response.json().catch(()=>({}));
  const status=response.ok&&typeof output.id==='string'?'sent':response.ok||response.status>=500?'uncertain':'failed';
  await env.DB.prepare('UPDATE club_email_jobs SET status=?,provider_id=?,error=?,updated_at=? WHERE id=?').bind(status,typeof output.id==='string'?output.id:null,status==='sent'?null:`Provider HTTP ${response.status}`,now,job.id).run();return {status};
 }catch{await env.DB.prepare("UPDATE club_email_jobs SET status='uncertain',error='Delivery outcome unknown; inspect provider before retrying.',updated_at=? WHERE id=?").bind(now,job.id).run();return {status:'uncertain'};}
}
async function enquire(request,env,now,fetchImpl){
 await rate(request,env,'enquiry',60,now);const input=await body(request),validation=validateSubmission(input);if(validation.error)return result({error:validation.error},400);const v=validation.value,id=crypto.randomUUID();
 const saved=await env.DB.prepare('INSERT INTO club_submissions (id,type,email,name,details,interests,consent,consent_version,status,email_status,unsubscribe_token,created_at,updated_at,source,medium,campaign,session_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(email,type) DO NOTHING').bind(id,v.type,v.email,v.name,JSON.stringify(v.details),JSON.stringify(v.interests),v.consent,CONSENT_VERSION,'new',v.consent?(emailReady(env)?'pending':'waiting_setup'):'not_requested',crypto.randomUUID(),now,now,v.source,v.medium,v.campaign,v.sessionId).run();
 if(saved.meta.changes&&v.consent){const row=await env.DB.prepare('SELECT * FROM club_submissions WHERE id=?').bind(id).first();await sendEmail(row,'confirmation',request,env,now,fetchImpl);}
 return result({ok:true,emailUpdates:emailReady(env)?'confirmation_required':'not_active',message:'Your introduction is saved for MSC. If you have already submitted, your existing details and preferences are kept.'},201);
}
async function collect(request,env,now){
 if(request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1'||/bot|crawler|spider|preview/i.test(request.headers.get('user-agent')||''))return result({ok:true});
 await rate(request,env,'analytics',2000,now);const data=await body(request,9000);if(!session(data.sessionId)||!Array.isArray(data.events)||data.events.length>20)return result({error:'Invalid activity batch.'},400);const a=attribution(data),ref=clean(data.referrer,120);const referrer=/^[a-z0-9.-]+$/i.test(ref)?ref:'direct';
 const statements=[];for(const item of data.events){if(!EVENTS.has(item.event)||!SAFE_TARGETS.has(item.target))continue;statements.push(env.DB.prepare('INSERT INTO club_activity (id,session,event,target,source,medium,campaign,referrer,device,created_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session,event,target) DO NOTHING').bind(crypto.randomUUID(),data.sessionId,item.event,item.target,a.source,a.medium,a.campaign,referrer,['mobile','desktop'].includes(data.device)?data.device:'unknown',now));}
 if(statements.length)await env.DB.batch(statements);
 // Bound cleanup work and keep only 90 days of anonymous activity.
 await env.DB.batch([env.DB.prepare('DELETE FROM club_activity WHERE id IN (SELECT id FROM club_activity WHERE created_at<? LIMIT 1000)').bind(now-90*86400000),env.DB.prepare('DELETE FROM club_rate_limits WHERE key IN (SELECT key FROM club_rate_limits WHERE expires_at<? LIMIT 500)').bind(now)]);
 return result({ok:true});
}
function csv(rows,columns){const cell=value=>{let s=String(value??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};return [columns.map(cell).join(','),...rows.map(row=>columns.map(key=>cell(row[key])).join(','))].join('\r\n');}
async function dashboard(request,env,now){
 const days=[7,30,90].includes(Number(new URL(request.url).searchParams.get('days')))?Number(new URL(request.url).searchParams.get('days')):30,since=now-days*86400000;
 const q=(sql,...params)=>env.DB.prepare(sql).bind(...params).all();
 const [daily,activity,traffic,totals,inbox,jobs,conversion]=await Promise.all([
 q("SELECT date(created_at/1000,'unixepoch') day,count(DISTINCT session) sessions FROM club_activity WHERE event='page_view' AND created_at>=? GROUP BY day ORDER BY day",since),
 q('SELECT event,target,count(*) count FROM club_activity WHERE created_at>=? GROUP BY event,target ORDER BY count DESC LIMIT 100',since),
 q("SELECT source,medium,campaign,count(DISTINCT session) sessions FROM club_activity WHERE event='page_view' AND created_at>=? GROUP BY source,medium,campaign ORDER BY sessions DESC LIMIT 30",since),
 q("SELECT type,email_status,count(*) count FROM club_submissions WHERE created_at>=? GROUP BY type,email_status",since),
 q('SELECT id,type,name,email,details,interests,status,email_status,consent,source,medium,campaign,created_at FROM club_submissions ORDER BY created_at DESC LIMIT 250'),
 q('SELECT id,submission_id,kind,status,error,created_at FROM club_email_jobs ORDER BY created_at DESC LIMIT 100'),
 q("SELECT count(DISTINCT s.session_id) submitted FROM club_submissions s JOIN club_activity a ON a.session=s.session_id AND a.event='page_view' WHERE s.type='member' AND s.created_at>=? AND a.created_at>=?",since,since)]);
 return result({days,daily:daily.results,activity:activity.results,traffic:traffic.results,totals:totals.results,inbox:inbox.results,jobs:jobs.results,conversion:conversion.results[0],emailEnabled:emailReady(env),emailFrom:env.MSC_EMAIL_FROM||'',retentionDays:90});
}
export async function handleClub(request,env,{now=Date.now(),fetchImpl=fetch,authenticate=adminIdentity,authUI={}}={}){
 const path=new URL(request.url).pathname.replace(/^\/api\/club\/?/,'');
 try{
  if(path==='session'&&request.method==='GET'){
   const identity=await authenticate(request,env);
   return result({admin:!!identity,signedIn:authenticate===adminIdentity?!!request.headers.get('oai-authenticated-user-id'):!!identity,provider:'chatgpt',loginUrl:'/signin-with-chatgpt?return_to=%2Fadmin',logoutUrl:'/signout-with-chatgpt?return_to=%2Fadmin',loginLabel:'Sign in with ChatGPT',loginDescription:'Sign in with ChatGPT using the approved MSC account to open the club inbox and analytics.',...authUI});
  }
  if(path==='config'&&request.method==='GET')return result({emailEnabled:emailReady(env)});
  if(!env.DB)return result({error:'MSC services are temporarily unavailable. Please try again.'},503);
  if(request.method==='POST'&&env.MSC_WRITES_PAUSED==='true')return result({error:'MSC is moving its system. Please try again shortly.'},503);
  if(request.method==='POST'&&!originOK(request))return result({error:'Please submit from the MSC website.'},403);
  if(path==='enquiry'&&request.method==='POST')return await enquire(request,env,now,fetchImpl);
  if(path==='activity'&&request.method==='POST')return await collect(request,env,now);
  if(['confirm','unsubscribe'].includes(path)&&request.method==='POST'){
   await rate(request,env,'preferences',30,now);const data=await body(request,500);if(!/^[a-f0-9-]{36}$/.test(data.token||''))return result({error:'This link is invalid.'},400);
   if(path==='unsubscribe'){await env.DB.prepare("UPDATE club_submissions SET consent=0,email_status='unsubscribed',confirm_token=NULL,updated_at=? WHERE unsubscribe_token=?").bind(now,data.token).run();return result({ok:true,message:'You will no longer receive MSC email updates.'});}
   const row=await env.DB.prepare("SELECT * FROM club_submissions WHERE confirm_token=? AND confirm_expires>=? AND consent=1 AND email_status='pending'").bind(data.token,now).first();if(!row)return result({error:'This link has expired or has already been used. Contact MSC if you need help.'},400);
   const updated=await env.DB.prepare("UPDATE club_submissions SET email_status='confirmed',confirm_token=NULL,updated_at=? WHERE id=? AND email_status='pending' AND confirm_token=?").bind(now,row.id,data.token).run();if(updated.meta.changes)await sendEmail({...row,email_status:'confirmed'},'welcome',request,env,now,fetchImpl);
   return result({ok:true,message:'Your MSC email updates are confirmed.'});
  }
  if(path.startsWith('admin/')){
   if(!await authenticate(request,env))return result({error:'Sign in with the approved MSC account to continue.'},request.headers.get('oai-authenticated-user-id')?403:401);
   if(path==='admin/backup'&&request.method==='GET')return await backupResponse(env,now);
   if(path==='admin/dashboard'&&request.method==='GET')return await dashboard(request,env,now);
   if(path==='admin/export'&&request.method==='GET'){
    const confirmed=new URL(request.url).searchParams.get('list')==='confirmed',rows=await env.DB.prepare('SELECT name,email,type,interests,status,email_status,source,campaign,created_at FROM club_submissions'+(confirmed?" WHERE consent=1 AND email_status='confirmed'":'')+' ORDER BY created_at DESC LIMIT 10000').all();
    return new Response(csv(rows.results,['name','email','type','interests','status','email_status','source','campaign','created_at']),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="msc-${confirmed?'confirmed-email-list':'enquiries'}.csv"`,'Cache-Control':'private, no-store'}});
   }
   if(path==='admin/update'&&request.method==='POST'){
    const data=await body(request,700);if(!/^[a-f0-9-]{36}$/.test(data.id||'')||!['new','contacted','resolved'].includes(data.status))return result({error:'Invalid update.'},400);
    await env.DB.prepare('UPDATE club_submissions SET status=?,updated_at=? WHERE id=?').bind(data.status,now,data.id).run();return result({ok:true});
   }
   if(path==='admin/delete'&&request.method==='POST'){
    const data=await body(request,500);if(!/^[a-f0-9-]{36}$/.test(data.id||''))return result({error:'Invalid record.'},400);await env.DB.batch([env.DB.prepare('DELETE FROM club_email_jobs WHERE submission_id=?').bind(data.id),env.DB.prepare('DELETE FROM club_submissions WHERE id=?').bind(data.id)]);return result({ok:true});
   }
   if(path==='admin/email'&&request.method==='POST'){
    if(!emailReady(env))return result({error:'Email sending is not connected yet.'},409);
    const data=await body(request,500);if(!/^[a-f0-9-]{36}$/.test(data.id||''))return result({error:'Invalid record.'},400);const row=await env.DB.prepare('SELECT * FROM club_submissions WHERE id=?').bind(data.id).first();if(!row||!row.consent||!['waiting_setup','pending','confirmed'].includes(row.email_status))return result({error:'This person is not eligible for this email.'},409);
    const outcome=await sendEmail(row,row.email_status==='confirmed'?'welcome':'confirmation',request,env,now,fetchImpl);return result({ok:outcome.status==='sent',status:outcome.status},outcome.status==='sent'?200:409);
   }
  }
  return result({error:'Not found.'},404);
 }catch(error){return result({error:error.status?error.message:'MSC could not complete this request. Please try again.'},error.status||500);}
}
