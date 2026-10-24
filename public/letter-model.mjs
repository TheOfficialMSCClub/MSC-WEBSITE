export const memberInterests=['Strategy Summit','Exec openings','Workshops','Networking'];
export const partnerInterests=['Workshop','Case for Summit','Sponsorship','Speaking','Other'];
export function validateLetter(type,data){
 const required=type==='partner'?['name','role','organization','kind','idea','email']:['name','year','program','email'];
 const labels={name:'full name',role:'your role',organization:'organization',kind:'partnership type',idea:'your idea',email:'email address',year:'year of study',program:'program'};
 for(const field of required){
  if(!String(data[field]||'').trim())return {field,message:`Please fill in ${labels[field]}.`};
 }
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))return {field:'email',message:'Please enter a valid email address.'};
 return null;
}
export function formatLetter(type,data){
 if(type==='partner')return `To Corporate Relations, Management Strategy Council,\n\nMy name is ${data.name}, and I’m ${data.role} at ${data.organization}.\n\nI’d like to discuss: ${data.kind}.\n${data.idea}\n\nYou can reach me at ${data.email}.\n\nYours,\n${data.name}`;
 return `To the Management Strategy Council,\n\nMy name is ${data.name}, and I’m in ${data.year} year, studying ${data.program}. You can reach me at ${data.email}.\n\nI’d like to hear about: ${(data.interests||[]).join(', ')||'MSC membership'}.${data.note?`\n\nOne thing you should know about me: ${data.note}`:''}\n\nYours,\n${data.name}`;
}
export async function deliverLetter(endpoint,payload,{fetchImpl=fetch,signal}={}){
 if(!endpoint)return {mode:'copy'};
 const url=new URL(endpoint,globalThis.location?.href||'https://msc.example/');
 if(url.protocol!=='https:'||url.username||url.password)throw Error('Letter delivery is not configured correctly.');
 const response=await fetchImpl(url.href,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal,credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw Error('Your letter could not be delivered. Please try again or copy it to send by Instagram.');
 const data=typeof response.json==='function'?await response.json().catch(()=>({})):{};return {mode:'sent',emailUpdates:data.emailUpdates||'not_active'};
}
