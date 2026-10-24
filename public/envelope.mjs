import {getAttribution,trackClub} from './club-analytics.mjs';
import {siteMotion} from './site-motion.mjs';
import {memberInterests,partnerInterests,validateLetter,formatLetter,deliverLetter} from './letter-model.mjs';
const dialog=document.querySelector('#letter-dialog'),scene=document.querySelector('#letter-scene'),body=document.querySelector('#letter-content'),status=document.querySelector('#letter-status');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let opener,run=0,busy=false,phase='',deliveryController;
function lock(){document.body.classList.toggle('modal-open',!!document.querySelector('dialog[open]'));}
function input(name,label,extra=''){
 return `<label class="letter-blank"><span class="sr-only">${label}</span><input name="${name}" aria-label="${label}" placeholder="${label}" ${extra}></label>`;
}
function formMarkup(type,endpoint){
 const partner=type==='partner';
 const memberText=`<p>My name is ${input('name','full name','autocomplete="name" required maxlength="100"')}, and I’m in <label class="letter-blank"><span class="sr-only">Year of study</span><select name="year" aria-label="Year of study" required><option value="">year of study</option>${['1st','2nd','3rd','4th','5th or later','graduate'].map(y=>`<option>${y}</option>`).join('')}</select></label> year, studying ${input('program','program','required maxlength="140" autocomplete="organization-title"')}. You can reach me at ${input('email','email address','type="email" required autocomplete="email" maxlength="254"')}.</p><fieldset><legend>I’d like to hear about:</legend><div class="letter-interests">${memberInterests.map((v,i)=>`<label><input type="checkbox" name="interests" value="${v}" ${i===0?'checked':''}><span>${v}</span></label>`).join('')}</div></fieldset><label class="letter-note">One thing you should know about me <span>(optional)</span><textarea name="note" rows="2" maxlength="1000" placeholder="A question, an interest, or a quick hello."></textarea></label>`;
 const partnerText=`<p>My name is ${input('name','full name','autocomplete="name" required maxlength="100"')}, and I’m ${input('role','your role','autocomplete="organization-title" required maxlength="120"')} at ${input('organization','organization','autocomplete="organization" required maxlength="160"')}. You can reach me at ${input('email','email address','type="email" required autocomplete="email" maxlength="254"')}.</p><label class="letter-kind">I’d like to discuss <select name="kind" aria-label="Partnership type" required><option value="">a partnership</option>${partnerInterests.map(v=>`<option>${v}</option>`).join('')}</select>.</label><label class="letter-note">Here’s my idea:<textarea name="idea" rows="3" required maxlength="2000" placeholder="Tell Corporate Relations what you have in mind."></textarea></label>`;
 return `<form id="letter-form" class="letter-paper" novalidate><p class="letter-kicker">MSC / ${partner?'Corporate Relations':'An introduction'} · 2026–27</p><h2 id="letter-title">${partner?'To Corporate Relations,':'To the Management Strategy Council,'}</h2>${partner?partnerText:memberText}${!partner?'<label class="letter-email-optin"><input type="checkbox" name="emailConsent"><span>Send me MSC events and opportunities by email. I can unsubscribe at any time.</span></label>':''}<p class="letter-signoff">Yours,<span id="letter-signature" class="letter-signature">Your name</span></p><div class="letter-trap" aria-hidden="true"><label>Leave this blank<input name="website" tabindex="-1" autocomplete="off"></label></div><p class="letter-error" id="letter-error" role="alert"></p><p class="letter-delivery">${endpoint?'Sending saves this introduction and your email for MSC to review. Email updates are optional and require email confirmation. Contact managementstrategycouncil@gmail.com to request deletion.':'Prepare your letter here, then copy it to send to @msc.uoft on Instagram. This page won’t send or store your details.'}</p><button class="pill-button letter-submit" type="submit">${endpoint?'Seal & send letter':'Fold my letter'} <span aria-hidden="true">→</span></button></form>`;
}
async function beat(name,duration,token){
 if(token!==run)return false;
 phase=name;scene.dataset.beat=name;
 if(!siteMotion.matches)await new Promise(resolve=>setTimeout(resolve,duration));
 return token===run&&dialog.open;
}
function closeLetter(){
 if(busy&&phase==='seal'){status.textContent='Finishing the seal…';return;}
 run++;deliveryController?.abort();busy=false;phase='';dialog.close();lock();opener?.focus({preventScroll:true});
}
dialog.querySelector('.letter-close').addEventListener('click',closeLetter);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeLetter();});
dialog.addEventListener('close',lock);
export async function openLetter(type='member',settings={}){
 if(dialog.open)return;
 const endpoint=settings?.endpoint||'';trackClub(type==='partner'?'partner_open':'join_open','join');opener=document.activeElement;const token=++run;busy=false;phase='';status.textContent='';
 body.innerHTML=formMarkup(type,endpoint);scene.dataset.beat='arrive';dialog.showModal();lock();
 const form=body.querySelector('form');
 form.elements.name.addEventListener('input',()=>{body.querySelector('#letter-signature').textContent=form.elements.name.value.trim()||'Your name';});
 form.addEventListener('input',event=>{event.target.removeAttribute('aria-invalid');form.querySelector('#letter-error').textContent='';});
 form.addEventListener('submit',event=>{event.preventDefault();submitLetter(form,type,endpoint,token);});
 if(await beat('arrive',750,token)&&await beat('open',420,token)&&await beat('rise',1050,token)){
  phase='write';scene.dataset.beat='write';form.elements.name.focus({preventScroll:true});
 }
}
async function submitLetter(form,type,endpoint,token){
 if(busy||phase!=='write')return;
 const fields=new FormData(form),data=Object.fromEntries(fields);data.interests=fields.getAll('interests');data.emailConsent=fields.has('emailConsent');data.attribution=getAttribution();
 for(const key of Object.keys(data))if(typeof data[key]==='string')data[key]=data[key].trim();
 if(data.website){form.querySelector('#letter-error').textContent='Please leave the extra website field blank.';return;}
 const error=validateLetter(type,data);
 if(error){const field=form.elements[error.field];field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','letter-error');form.querySelector('#letter-error').textContent=error.message;field.focus();return;}
 const message=formatLetter(type,data);busy=true;
 for(const control of form.elements)control.disabled=true;
 let result;
 try{
  phase='delivery';status.textContent=endpoint?'Delivering your letter…':'Folding your letter…';
  deliveryController=new AbortController();const timeout=setTimeout(()=>deliveryController?.abort(),12000);
  try{result=await deliverLetter(endpoint,{type,...data,message},{signal:deliveryController.signal});}finally{clearTimeout(timeout);}
  if(token!==run)return;
 }catch(error){
  if(token!==run)return;
  busy=false;phase='write';for(const control of form.elements)control.disabled=false;
  form.querySelector('#letter-error').textContent=error.name==='AbortError'?'Delivery took too long. Please try again, or copy your letter to send by Instagram.':error.message;
  status.textContent='Your letter has not been sent.';
  let copy=form.querySelector('.letter-copy-fallback');
  if(!copy){copy=document.createElement('button');copy.type='button';copy.className='underlined letter-copy-fallback';copy.textContent='Prepare a copy instead →';form.append(copy);}
  copy.onclick=()=>finishLetter(message,'copy');copy.focus();return;
 }
 if(!(await beat('fold',1360,token)))return;
 if(!(await beat('insert',1170,token)))return;
 if(!(await beat('seal',1200,token)))return;
 if(!(await beat('fly',1250,token)))return;
 finishLetter(message,result.mode,type,result.emailUpdates);
}
function finishLetter(message,mode,type='member',emailUpdates='not_active'){
 busy=false;phase='done';scene.dataset.beat='done';
 const sent=mode==='sent';
 body.innerHTML=`<article class="letter-paper letter-result"><p class="letter-kicker">MSC / ${sent?'Delivered':'Ready for you'}</p><h2 id="letter-title">${sent?'Your introduction is saved.':'One last step.'}</h2><p>${sent?`MSC can now review your introduction. ${type==='member'?(emailUpdates==='confirmation_required'?'If you requested email updates, check your inbox for a confirmation link.':'Email updates are not active yet; your interest is saved for MSC to follow up.'):'The Corporate Relations team can follow up using the email you provided.'} Keep a copy below.`:'Your letter is ready. Copy it below and send it to @msc.uoft on Instagram. Nothing has been submitted yet.'}</p>${sent&&type==='member'?'<div class="onboarding-next"><h3>Your next move</h3><a href="/welcome">A quick guide to getting involved →</a><a href="/#events">Explore MSC experiences →</a></div>':''}<label class="letter-copy-label">Your letter<textarea id="letter-copy" readonly rows="9">${escape(message)}</textarea></label><div class="letter-result-actions"><button id="copy-letter" class="pill-button">Copy letter →</button><a class="underlined" href="https://www.instagram.com/msc.uoft/" target="_blank" rel="noopener noreferrer">Open Instagram ↗</a></div></article>`;
 status.textContent=sent?'Introduction saved for MSC.':'Letter prepared. Copy and send it to MSC to finish.';
 const copyButton=body.querySelector('#copy-letter');copyButton.focus({preventScroll:true});
 copyButton.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(message);status.textContent='Copied. Paste your letter into a DM to @msc.uoft.';copyButton.textContent='Copied ✓';}catch{const text=body.querySelector('#letter-copy');text.focus();text.select();status.textContent='Your letter is selected. Use your device’s Copy command, then send it to @msc.uoft.';}});
 document.dispatchEvent(new CustomEvent('msc:letter-prepared',{detail:{delivered:sent}}));
}
