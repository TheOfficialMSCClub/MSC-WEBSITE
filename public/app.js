import {trackClub} from './club-analytics.mjs';
import {memberLinkedInURL} from './profile-links.mjs';
import {siteMotion as reducedMotion} from './site-motion.mjs';
import {openLetter} from './envelope.mjs';
'use strict';
const $ = (s,root=document) => root.querySelector(s);
const $$ = (s,root=document) => [...root.querySelectorAll(s)];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const menu = $('#menu-dialog');
const detail = $('#detail-dialog');
let content;
let activeFilter='All';
let lastOpener=null;
let closingMenu=false;
let toastTimer;

function setModalLock(){ document.body.classList.toggle('modal-open',!!document.querySelector('dialog[open]')); }
function openMenu(){ lastOpener=document.activeElement;menu.showModal();setModalLock(); }
function closeMenu(destination){
  if(!menu.open||closingMenu)return;
  closingMenu=true;
  const finish=()=>{menu.classList.remove('closing');menu.close();closingMenu=false;setModalLock();if(destination){$(destination)?.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});history.replaceState(null,'',destination);}else lastOpener?.focus();};
  if(reducedMotion.matches){finish();return;}
  menu.classList.add('closing');
  menu.addEventListener('animationend',finish,{once:true});
}
$('#menu-toggle').addEventListener('click',openMenu);
$('.close-menu').addEventListener('click',()=>closeMenu());
menu.addEventListener('cancel',event=>{event.preventDefault();closeMenu();});
$$('.menu-links a').forEach((link,index)=>{link.style.setProperty('--i',index);link.addEventListener('click',event=>{event.preventDefault();closeMenu(link.getAttribute('href'));});});
menu.addEventListener('close',setModalLock);
$('.dialog-close').addEventListener('click',()=>detail.close());
detail.addEventListener('close',()=>{setModalLock();lastOpener?.focus();});
detail.addEventListener('click',event=>{if(event.target!==detail)return;const r=detail.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)detail.close();});
function showDetail(html){ detail.classList.remove('summit-dialog');lastOpener=document.activeElement;$('#detail-body').innerHTML=html;detail.showModal();setModalLock(); }
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4000);}
function instagramButton(label='Visit @msc.uoft'){return `<a class="pill-button" href="https://www.instagram.com/msc.uoft/" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true">↗</span><span class="sr-only"> (opens Instagram in a new tab)</span></a>`;}
function openJoin(){openLetter('member',content?.letters);}
function openPartner(){openLetter('partner',content?.letters);}
$$('[data-open]').forEach(button=>button.addEventListener('click',()=>button.dataset.open==='join'?openJoin():openPartner()));
let ribbonPaused=reducedMotion.matches;
function updateRibbon(){const button=$('#ribbon-pause');$('.ribbon').classList.toggle('paused',ribbonPaused);button.setAttribute('aria-pressed',String(ribbonPaused));button.setAttribute('aria-label',ribbonPaused?'Resume moving text':'Pause moving text');button.textContent=ribbonPaused?'▶':'Ⅱ';button.hidden=reducedMotion.matches;}
$('#ribbon-pause').addEventListener('click',()=>{ribbonPaused=!ribbonPaused;updateRibbon();});
reducedMotion.addEventListener('change',()=>{ribbonPaused=reducedMotion.matches;updateRibbon();document.documentElement.classList.toggle('js-motion',!reducedMotion.matches);});
updateRibbon();
if('IntersectionObserver' in window){
 document.documentElement.classList.toggle('js-motion',!reducedMotion.matches);
 const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}});},{threshold:.12});
 $$('.reveal').forEach(el=>revealObserver.observe(el));

}
let scrollPending=false;
function updateScroll(){const hero=$('.object-hero');$('.site-header').classList.toggle('past-hero',!!hero&&window.scrollY>hero.offsetHeight-90);const total=document.documentElement.scrollHeight-window.innerHeight;$('.scroll-progress').style.transform=`scaleX(${total>0?window.scrollY/total:0})`;scrollPending=false;}
window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateScroll);}},{passive:true});
window.addEventListener('resize',updateScroll);
updateScroll();
function renderEvents(){
 $$('a[href="/strategy-summit"]').forEach(link=>link.addEventListener('click',()=>trackClub('event_view','summit')));
}
async function init(){try{content=JSON.parse($('#site-content').textContent);setupPortraitEdition();renderEvents();}catch(error){console.warn('MSC content is unavailable.',error);$('#members-grid').innerHTML='<p>The portraits are temporarily unavailable. Please refresh the page.</p>';document.documentElement.classList.remove('js-motion');}}
// Exact view-box crops display the supplied raster photographs without redrawing or regenerating faces.
function photoSVG(key,crop,label,extraClass=''){
 const asset=content.assets[key];if(!asset)return '';
 const [x,y,w,h]=crop.map((value,index)=>value*(index%2===0?asset.width:asset.height));
 return `<svg class="photo-svg ${extraClass}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMin slice" role="img" aria-label="${escapeHTML(label)}"><image href="${escapeHTML(asset.src)}" x="0" y="0" width="${asset.width}" height="${asset.height}"/></svg>`;
}
let currentDepartment='All';
let brandLogo='';

function setLogos(){
 const defaultMarkup=photoSVG('010939',[.048,.093,.137,.112],'MSC logo from the supplied club graphic');
 $$('.logo-slot').forEach(slot=>{
  slot.replaceChildren();
  if(brandLogo){const image=document.createElement('img');image.src=brandLogo;image.alt='MSC logo';slot.append(image);}
  else slot.innerHTML=defaultMarkup;
 });
}
function setupPortraitEdition(){
 try{brandLogo=new URLSearchParams(location.search).has('dev')?(localStorage.getItem('msc-preview-logo-v1')||''):'';}catch{}
 setLogos();
 $('#branding-open').hidden=!new URLSearchParams(location.search).has('dev');
 const order=['All','Co-Presidents','Operations','Marketing','Finance','Events','Corporate Relations'];
 $('#team-filters').innerHTML=order.map(dept=>`<button data-department="${escapeHTML(dept)}" aria-pressed="${dept==='All'}" class="${dept==='All'?'active':''}">${dept==='All'?'Everyone':escapeHTML(dept)}</button>`).join('');
 $$('[data-department]').forEach(button=>button.addEventListener('click',()=>{currentDepartment=button.dataset.department;$$('[data-department]').forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));});renderMembers();}));
 $('#team-search').addEventListener('input',renderMembers);
 renderMembers();
 const feature=$('#council-feature-image');
 if(feature)feature.innerHTML=photoSVG('011005',[.04,.254,.92,.66],'Amy Kang and Geser Ganbold, MSC Operations, in the council photoshoot');
 const menuAside=$('.menu-aside');menuAside.insertAdjacentHTML('afterbegin',`<div class="menu-portrait">${photoSVG('011828',[.05,.36,.91,.48],'MSC Corporate Relations team')}</div>`);
 renderGallery();
 $('#gallery-prev').addEventListener('click',()=>$('#gallery-rail').scrollBy({left:-540,behavior:reducedMotion.matches?'instant':'smooth'}));
 $('#gallery-next').addEventListener('click',()=>$('#gallery-rail').scrollBy({left:540,behavior:reducedMotion.matches?'instant':'smooth'}));
 $('#branding-open').addEventListener('click',openBranding);
 $('#logo-file').addEventListener('change',importLogo);
}
function renderMembers(){
 const search=$('#team-search').value.toLowerCase().trim();
 const allMembers=[...content.members,...(content.pendingMembers||[])];
 const matches=allMembers.filter(member=>(currentDepartment==='All'||member.department===currentDepartment)&&`${member.name} ${member.role} ${member.department}`.toLowerCase().includes(search));
 $('#members-grid').classList.toggle('filtered',currentDepartment!=='All'||search!=='');
 $('#members-grid').innerHTML=matches.length?matches.map(member=>`<button class="member-card" data-member="${escapeHTML(member.id)}" aria-label="Meet ${escapeHTML(member.name)}, ${escapeHTML(member.role)}"><div class="portrait-frame"><div class="member-portrait">${photoSVG(member.asset,member.crop,member.name+' in the MSC photoshoot')}<span class="member-view" aria-hidden="true">→</span></div><span class="portrait-frame-caption" aria-hidden="true"><span>MSC / 26–27</span><span>${String(allMembers.indexOf(member)+1).padStart(2,'0')}</span></span></div><span class="member-department">${escapeHTML(member.department)}</span><h3>${escapeHTML(member.name)}</h3><p>${escapeHTML(member.role)}</p></button>`).join(''):'<p class="team-empty">No members match that search. Try another name or select Everyone.</p>';
 $('#team-result-count').textContent=`${matches.length} ${matches.length===1?'member':'members'}${currentDepartment==='All'?' across the council':' in '+currentDepartment}`;
 $$('[data-member]').forEach(button=>button.addEventListener('click',()=>openMember(button.dataset.member)));
}
function openMember(id){
 const member=[...content.members,...(content.pendingMembers||[])].find(item=>item.id===id);if(!member)return;trackClub('profile_view',id);
 if(member.placeholder){showDetail(`<div class="member-detail-top"><div class="member-detail-photo framed-detail">${photoSVG(member.asset,member.crop,'Council introduction coming soon')}</div><div><p class="detail-kicker">The council / 2026–27</p><h2 id="detail-title">Coming soon</h2><p>We’re preparing this council member’s introduction. Check back to meet them.</p></div></div>`);return;}
 const asset=content.assets[member.asset],linkedin=memberLinkedInURL(member);
 const social=linkedin?`<a class="member-linkedin" href="${escapeHTML(linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(member.name)} on LinkedIn (opens in a new tab)">LinkedIn <span aria-hidden="true">↗</span></a>`:'';
 showDetail(`<div class="member-detail-top"><div class="member-detail-photo framed-detail">${photoSVG(member.asset,member.crop,member.name)}</div><div><p class="detail-kicker">${escapeHTML(member.department)} · 2026–27</p><h2 id="detail-title">${escapeHTML(member.name)}</h2><p>${escapeHTML(member.role)}</p>${social}</div></div><p class="member-detail-note">From the supplied MSC executive introduction series. Explore the original graphic below.</p><img class="poster-modal" src="${escapeHTML(asset.src)}" width="${asset.width}" height="${asset.height}" alt="Original MSC introduction graphic for ${escapeHTML(member.name)}, showing their portrait, club role, and experience.">`);
}
function renderGallery(){
 $('#gallery-rail').innerHTML=content.gallery.map((item,index)=>{const asset=content.assets[item.asset];return `<button class="gallery-card" data-graphic="${index}" aria-label="View original graphic: ${escapeHTML(item.title)}"><img src="${escapeHTML(asset.src)}" width="${asset.width}" height="${asset.height}" loading="lazy" alt="${escapeHTML(item.title)} — original MSC graphic"><span>${escapeHTML(item.title)}</span><small>View original →</small></button>`;}).join('');
 $$('[data-graphic]').forEach(button=>button.addEventListener('click',()=>{const item=content.gallery[Number(button.dataset.graphic)];const asset=content.assets[item.asset];showDetail(`<p class="detail-kicker">The council in print · 2026–27</p><h2 id="detail-title">${escapeHTML(item.title)}</h2><img class="poster-modal" src="${escapeHTML(asset.src)}" width="${asset.width}" height="${asset.height}" alt="Original MSC editorial graphic: ${escapeHTML(item.title)}">`);}));
}
function openBranding(){
 showDetail(`<p class="detail-kicker">Website preview</p><h2 id="detail-title">Bring your<br><em>logo.</em></h2><div class="branding-preview logo-slot" aria-hidden="true"></div><p>The current seal comes directly from your supplied MSC graphic. Import a clean logo file to try it across the website.</p><p class="branding-note">This changes the preview in this browser only. Attach the final logo in our chat when you want it included in the published website for everyone.</p><div class="branding-actions"><button id="choose-logo" class="pill-button">Choose logo file <span aria-hidden="true">→</span></button><button id="reset-logo" class="underlined">Use supplied seal</button></div><p class="branding-note">PNG, SVG, WebP or JPG · maximum 2 MB.</p>`);
 setLogos();$('#choose-logo').addEventListener('click',()=>$('#logo-file').click());
 $('#reset-logo').addEventListener('click',()=>{brandLogo='';try{localStorage.removeItem('msc-preview-logo-v1');}catch{}setLogos();toast('Restored the seal from your supplied MSC graphic.');});
}
async function importLogo(event){
 const file=event.target.files?.[0];if(!file)return;
 if(!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)){toast('Please choose a PNG, SVG, WebP, or JPG logo.');event.target.value='';return;}
 if(file.size>2*1024*1024){toast('Please choose a logo smaller than 2 MB.');event.target.value='';return;}
 const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{brandLogo=String(reader.result);try{localStorage.setItem('msc-preview-logo-v1',brandLogo);toast('Logo updated for this browser preview.');}catch{toast('Logo updated for this visit. Browser storage is unavailable.');}setLogos();};image.onerror=()=>toast('That file could not be loaded as an image.');image.src=String(reader.result);};reader.onerror=()=>toast('The logo file could not be read.');reader.readAsDataURL(file);event.target.value='';
}

init();
function openHashLetter(){if(location.hash==='#join')openJoin();}
window.addEventListener('hashchange',openHashLetter);
openHashLetter();

// The strategy desk uses the same original member profiles as the portrait grid.
document.addEventListener("msc:inspect-member",event=>{if(content&&typeof event.detail?.id==="string")openMember(event.detail.id);});
