import {siteMotion} from './site-motion.mjs';
import {trackClub} from './club-analytics.mjs';

// Every short movie follows the same stabilized 3D trail between two stops.
// Changing direction seeks to the same world position, never to another image.
const ROUTE_SECONDS=8,CLIP_SECONDS=.75,STOPS=[0,4,8];
const ease=t=>t*t*t*(t*(t*6-15)+10);
function inverseEase(p){let a=0,b=1;for(let i=0;i<32;i++){const m=(a+b)/2;if(ease(m)<p)a=m;else b=m;}return (a+b)/2;}
for(const root of document.querySelectorAll('[data-summit-scene]')){
 const slides=[...root.querySelectorAll('[data-summit-slide]')],videos=[...root.querySelectorAll('[data-route-video]')],stills=[...root.querySelectorAll('[data-route-still]')];
 const label=root.querySelector('.ascent-current-label'),status=root.querySelector('.ascent-status'),ready=new Map();
 let chosen=0,arrived=0,worldTime=0,active=null,direction='up',moving=false,pending=false,visible=false,focused=false,failed=false,timer=0,raf=0,limitTimer=0,mediaUpdate=null,operation=0;
 const clamp=t=>Math.max(0,Math.min(ROUTE_SECONDS,t));
 const position=()=>{if(!moving||!active)return worldTime;const from=STOPS[Number(active.dataset.routeFrom)],to=STOPS[Number(active.dataset.routeTo)];return clamp(from+(to-from)*ease(Math.min(1,active.currentTime/CLIP_SECONDS)));};
 function pause(){worldTime=position();active?.pause();if(mediaUpdate)active?.removeEventListener('timeupdate',mediaUpdate);mediaUpdate=null;moving=false;cancelAnimationFrame(raf);clearTimeout(limitTimer);raf=limitTimer=0;}
 function schedule(){
  clearTimeout(timer);timer=0;
  root.dataset.sceneVisible=String(visible&&!document.hidden);
  const playing=visible&&!document.hidden&&!siteMotion.matches&&!focused&&!moving&&!pending&&!failed;
  root.dataset.playing=String(playing);
  if(playing)timer=setTimeout(()=>go(chosen+1),10000);
 }
 function textAt(index,announce){
  arrived=chosen=index;root.dataset.ascent=String(index);root.dataset.routePosition=String(worldTime);root.dataset.journey='rest';root.removeAttribute('data-ascent-target');root.removeAttribute('data-travel');root.setAttribute('aria-busy','false');root.classList.remove('is-travelling');
  slides.forEach((slide,i)=>{const selected=i===index;slide.classList.toggle('active',selected);slide.setAttribute('aria-hidden',String(!selected));slide.toggleAttribute('inert',!selected);});
  if(label)label.textContent=slides[index].dataset.stageLabel;
  if(status)status.textContent=announce?`${slides[index].dataset.stageLabel}: ${slides[index].getAttribute('aria-label')}.`:'';
  schedule();
 }
 function showStill(index,announce=false){
  pause();pending=false;worldTime=STOPS[index];root.classList.remove('has-route-video');for(const video of videos)video.classList.remove('current');stills.forEach(still=>still.classList.toggle('current',Number(still.dataset.routeStill)===index));textAt(index,announce);
 }
 function mediaReady(video){
  if(video.readyState>=2)return Promise.resolve();
  if(ready.has(video))return ready.get(video);
  const promise=new Promise((resolve,reject)=>{
   const cleanup=()=>{clearTimeout(timeout);video.removeEventListener('loadeddata',loaded);video.removeEventListener('error',error);};
   const loaded=()=>{cleanup();resolve();},error=()=>{cleanup();reject(Error('Mountain route media unavailable.'));};
   const timeout=setTimeout(error,12000);video.addEventListener('loadeddata',loaded);video.addEventListener('error',error);video.muted=true;video.playsInline=true;video.preload='auto';if(!video.getAttribute('src'))video.src=video.dataset.src;video.load();
  });ready.set(video,promise);return promise;
 }
 async function destinationReady(index){
  const still=stills.find(image=>Number(image.dataset.routeStill)===index);
  if(!still)return;still.loading='eager';
  try{await still.decode?.();}catch{/* Keep native image loading available after a decode rejection. */}
 }
 function seek(video,time){
  if(Math.abs(video.currentTime-time)<.005&&video.readyState>=2)return Promise.resolve();
  return new Promise((resolve,reject)=>{
   const cleanup=()=>{clearTimeout(timeout);video.removeEventListener('seeked',done);video.removeEventListener('error',error);};
   const done=()=>{cleanup();resolve();},error=()=>{cleanup();reject(Error('Mountain route seeking unavailable.'));};
   const timeout=setTimeout(error,8000);video.addEventListener('seeked',done);video.addEventListener('error',error);video.currentTime=time;
  });
 }
 async function go(index,announce=false){
  index=(index+slides.length)%slides.length;
  if(index===arrived&&!pending&&!moving){schedule();return;}
  pause();clearTimeout(timer);timer=0;const ticket=++operation;chosen=index;pending=true;root.dataset.ascentTarget=String(index);root.dataset.journey='loading';root.dataset.playing='false';
  if(siteMotion.matches||failed||!visible||document.hidden){showStill(index,announce);return;}
  const destination=STOPS[index],travelDirection=destination>=worldTime?'up':'down',video=videos.filter(v=>Number(v.dataset.routeTo)===index&&worldTime>=Math.min(STOPS[Number(v.dataset.routeFrom)],destination)-.01&&worldTime<=Math.max(STOPS[Number(v.dataset.routeFrom)],destination)+.01).sort((a,b)=>Math.abs(Number(a.dataset.routeFrom)-index)-Math.abs(Number(b.dataset.routeFrom)-index))[0],start=worldTime;
  if(Math.abs(destination-start)<.025){showStill(index,announce);return;}
  try{
   await Promise.all([mediaReady(video),destinationReady(index)]);if(ticket!==operation)return;
   const from=STOPS[Number(video.dataset.routeFrom)],fraction=Math.max(0,Math.min(1,(start-from)/(destination-from)));
   await seek(video,inverseEase(fraction)*CLIP_SECONDS);if(ticket!==operation)return;
   if(!visible||document.hidden||siteMotion.matches){showStill(index,announce);return;}
   active=video;direction=travelDirection;for(const other of videos){if(other!==video)other.pause();other.classList.toggle('current',other===video);}root.classList.add('has-route-video','is-travelling');root.dataset.journey='travelling';root.dataset.travel=direction;root.setAttribute('aria-busy','true');moving=true;video.playbackRate=1;
   await video.play();if(ticket!==operation){if(active!==video)video.pause();return;}
   const check=()=>{
    if(ticket!==operation||!moving)return false;
    const t=position();root.dataset.routePosition=t.toFixed(3);
    if(video.currentTime>=CLIP_SECONDS-1/240||video.ended){
     // A paused video's decoded frame can lag its currentTime. Always hand off
     // to the exact destination still; never seek a visible video on arrival.
     showStill(index,announce);return false;
    }
    // Acceleration is rendered into the clip; playback stays steady at 60 fps.
    // A native timer also bounds the stop when a browser throttles visual frames.
    clearTimeout(limitTimer);limitTimer=setTimeout(check,Math.max(8,(CLIP_SECONDS-video.currentTime)*1000));return true;
   };
   const draw=()=>{raf=0;if(check())raf=requestAnimationFrame(draw);};mediaUpdate=check;video.addEventListener('timeupdate',mediaUpdate);check();raf=requestAnimationFrame(draw);
  }catch(error){
   if(ticket!==operation)return;failed=true;root.dataset.routeUnavailable='true';showStill(index,announce);
  }
 }
 function visibilityChanged(){
  if(!visible||document.hidden){operation++;pause();if(pending)root.dataset.journey='paused';schedule();}
  else if(pending&&!siteMotion.matches)go(chosen);
  else schedule();
 }
 root.querySelector('[data-ascent-prev]')?.addEventListener('click',()=>go(chosen-1,true));root.querySelector('[data-ascent-next]')?.addEventListener('click',()=>go(chosen+1,true));
 root.addEventListener('keydown',event=>{if(event.target.closest('a,input,textarea,select'))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();go(chosen+(event.key==='ArrowRight'?1:-1),true);}});
 root.addEventListener('focusin',()=>{focused=true;schedule();});root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget)){focused=false;schedule();}});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
  visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.2);visibilityChanged();
  if(visible)for(const still of stills){still.loading='eager';still.decode?.().catch(()=>{});}
  if(visible&&!siteMotion.matches&&!failed)for(const video of videos)mediaReady(video).catch(()=>{});
 },{threshold:[0,.2]}).observe(root);else{visible=true;schedule();}
 document.addEventListener('visibilitychange',visibilityChanged);
 siteMotion.addEventListener('change',()=>{if(siteMotion.matches&&pending){operation++;showStill(chosen);}schedule();});
 textAt(0,false);
}
for(const item of document.querySelectorAll('.summit-experience-guide details'))item.addEventListener('toggle',()=>{if(item.open)for(const other of document.querySelectorAll('.summit-experience-guide details'))if(other!==item)other.open=false;});
if(document.body.classList.contains('summit-page'))trackClub('event_view','summit');
