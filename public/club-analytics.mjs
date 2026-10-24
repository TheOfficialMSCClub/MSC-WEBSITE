const allowed=new Set(['home','about','story','events','chessboard','team','words','partners','join','welcome','instagram','linkedin','club','summit','weekly-word','iteration','joe-kuang','billy-batsaikhan','amy-kang','geser-ganbold','meghana-kuchipudi','nicholas-mok','jayden-li','joshua-chan','kimberly-sutjiono','jacob-lee','eren-ehli','laila-yick-lewis','angelina-bell','melissa-vu','anudari-esen','jayden-lee','angelie-samlal']);
const key='msc-visit-v1',preference='msc-analytics-optout';let visit,seen=new Set(),queue=[],timer;
const tag=value=>/^[a-zA-Z0-9_. -]{1,70}$/.test(value||'')?value:'';
const privateBrowser=()=>navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true;
const supported=()=>typeof globalThis.crypto?.randomUUID==='function';
function enabled(){try{return supported()&&!privateBrowser()&&localStorage.getItem(preference)!=='yes';}catch{return false;}}
function context(){
 const now=Date.now();let stored;try{stored=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}
 if(!visit)visit=stored;
 if(!visit||now-visit.at>1800000){const params=new URLSearchParams(location.search);visit={sessionId:crypto.randomUUID(),source:tag(params.get('utm_source'))||'direct',medium:tag(params.get('utm_medium'))||'none',campaign:tag(params.get('utm_campaign')),at:now};seen.clear();}
 visit.at=now;try{sessionStorage.setItem(key,JSON.stringify(visit));}catch{}return visit;
}
export function getAttribution(){if(!enabled())return {};const {source,medium,campaign,sessionId}=context();return {source,medium,campaign,sessionId};}
export function trackClub(event,target){if(!enabled()||!allowed.has(target))return;context();const id=event+':'+target;if(seen.has(id))return;seen.add(id);queue.push({event,target});if(queue.length>=12)flush();else if(!timer)timer=setTimeout(flush,1600);}
function flush(){clearTimeout(timer);timer=null;if(!enabled()||!queue.length){queue=[];return;}const events=queue.splice(0,20);let referrer='';try{referrer=new URL(document.referrer).hostname;}catch{}fetch('/api/club/activity',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({...getAttribution(),events,referrer,device:window.innerWidth<=760?'mobile':'desktop'})}).catch(()=>{});}
function preferences(){const button=document.querySelector('#analytics-preference');if(!button)return;const update=()=>{button.textContent=enabled()?'Anonymous analytics: on':'Anonymous analytics: off';button.setAttribute('aria-pressed',String(enabled()));button.disabled=privateBrowser()||!supported();};button.addEventListener('click',()=>{try{localStorage.setItem(preference,enabled()?'yes':'no');}catch{}queue=[];seen.clear();update();if(enabled())trackClub('page_view','home');});update();}
if(typeof document!=='undefined'){
 const home=location.pathname==='/welcome'?'welcome':location.pathname.replace(/\/$/,'')==='/strategy-summit'?'summit':'home';trackClub('page_view',home);preferences();
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){trackClub('section_view',e.target.id);observer.unobserve(e.target);}},{threshold:.3});for(const el of document.querySelectorAll('main section[id]'))observer.observe(el);}
 document.addEventListener('click',event=>{const anchor=event.target.closest?.('a[href]');if(!anchor)return;try{const url=new URL(anchor.href);if(url.hostname.includes('instagram.com'))trackClub('outbound_click','instagram');if(/(^|\.)linkedin\.com$/.test(url.hostname))trackClub('outbound_click','linkedin');}catch{}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
}
