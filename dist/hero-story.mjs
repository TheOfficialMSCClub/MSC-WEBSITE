import {heroState,chapterStops,advanceStory} from './hero-timeline.mjs';
import {readingCamera} from './film-framing.mjs';
import {paperFlights,paperReveal,paperProgress,projectedPaper,projectedDock,quadMatrix,flightQuad} from './paper-flight.mjs';

export function createHeroStory({hero,stage,mount,reduced,onChange,gateProgress=p=>p}) {
 const briefing=hero.querySelector('.hero-briefing'),chapters=[...briefing.querySelectorAll('.briefing-chapter')],buttons=[...stage.querySelectorAll('[data-hero-step]')];
 const heading=stage.querySelector('.object-heading'),foot=stage.querySelector('.object-foot'),navigation=stage.querySelector('.briefing-navigation'),progressLine=stage.querySelector('.briefing-progress-fill'),note=stage.querySelector('.object-note'),count=stage.querySelector('.briefing-count');
 const camera=document.createElement('div');camera.className='case-camera';stage.append(camera);camera.append(mount,briefing);
 const sheets=chapters.map((chapter,index)=>{const sheet=document.createElement('div');sheet.className='briefing-sheet';sheet.dataset.briefingPage=index;sheet.style.zIndex=index+1;sheet.append(chapter);briefing.append(sheet);return sheet;});
 let current=0,velocity=0,frame=0,last=0,active=-2,staticMode=false,visible=true,film,paused=false;
 const setInteractive=(el,enabled)=>{el.inert=!enabled;if(enabled)el.removeAttribute('aria-hidden');else el.setAttribute('aria-hidden','true');};
 function progress(){const travel=hero.offsetHeight-stage.offsetHeight;return travel>0?Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/travel)):0;}
 function render(p){
  if(staticMode||reduced.matches)return;
  const state=heroState(p),enhanced=film?.docks&&!staticMode&&!reduced.matches;
  stage.style.setProperty('--story-intro',state.intro.toFixed(4));stage.style.setProperty('--story-navigation',state.navigation.toFixed(4));stage.style.setProperty('--hero-progress',state.opening.toFixed(4));
  const shot=stage.querySelector('.hero-shot-label');if(shot)shot.textContent=state.active<0?'01 / Open the brief':['02 / Open your perspective','03 / Find your people','04 / Put ideas into practice'][state.active];
  heading.style.opacity=state.intro;foot.style.opacity=state.intro;setInteractive(foot,state.intro>.55);setInteractive(navigation,state.navigation>.5);
  if(enhanced){
   const dock=projectedDock(film,state.film,state.push,mount.clientWidth,mount.clientHeight,innerWidth);
   const placements=sheets.map((sheet,index)=>{const flight=paperProgress(p,index),source=flight<1?projectedPaper(film,index,state.film,state.push,mount.clientWidth,mount.clientHeight,innerWidth):dock;return{flight,quad:flightQuad(source,dock,flight,stage.clientHeight)};});
   const view=readingCamera(dock,mount.clientWidth,mount.clientHeight,state.zoom,placements[Math.max(0,state.active)].quad);
   camera.style.transform=`translate3d(${view.x.toFixed(3)}px,${view.y.toFixed(3)}px,0) scale(${view.scale.toFixed(6)})`;
   sheets.forEach((sheet,index)=>{
    const {flight,quad}=placements[index];
    const matrix=quadMatrix(quad,520,310);
    sheet.style.transform=`matrix3d(${matrix.map(v=>Number(v.toFixed(9))).join(',')})`;
    const opacity=paperReveal(p,index,film.count);sheet.style.opacity=opacity.toFixed(4);sheet.classList.toggle('paper-landed',flight>=1);
    sheet.style.setProperty('--paper-lift',Math.sin(Math.PI*flight).toFixed(4));
    chapters[index].style.opacity=1;setInteractive(chapters[index],index===state.active&&opacity>.5&&flight>.92);
   });
  }else{camera.style.transform='none';chapters.forEach((el,index)=>{el.style.opacity=state.chapters[index];setInteractive(el,index===state.active&&state.chapters[index]>.5);});}
  mount.style.transform='none';progressLine.style.transform=`scaleX(${p})`;
  if(active!==state.active){active=state.active;buttons.forEach((button,index)=>{if(index===active+1)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});count.textContent=active<0?'Inside MSC':`${String(active+1).padStart(2,'0')} / 03`;note.textContent=active<0?'Scroll to open a new perspective.':['Ideas worth exploring.','People worth meeting.','Your next move starts here.'][active];}
  onChange(state);
 }
 function tick(time){
  frame=0;if(staticMode||reduced.matches||paused||document.hidden||!visible){last=0;return;}
  const target=progress(),dt=last?Math.min((time-last)/1000,.05):1/60;last=time;
  const next=advanceStory(current,velocity,target,dt),candidate=next.position;
  const allowed=gateProgress(candidate,current);velocity=allowed===candidate?next.velocity:0;current=allowed;render(current);
  if((Math.abs(target-current)>.00003||Math.abs(velocity)>.0002)&&allowed===candidate)wake();else last=0;
 }
 function wake(){if(!frame&&!staticMode&&!reduced.matches&&!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
 function accessibilityMode(){
  const plain=staticMode||reduced.matches;hero.classList.toggle('story-enhanced',!plain);sheets.forEach(sheet=>sheet.hidden=plain);
  if(plain){stage.append(mount);camera.style.transform='none';hero.append(briefing);chapters.forEach(el=>{briefing.append(el);el.style.opacity='';el.style.transform='';setInteractive(el,true);});cancelAnimationFrame(frame);frame=0;heading.style.opacity='';foot.style.opacity='';mount.style.transform='';setInteractive(foot,true);setInteractive(navigation,false);onChange(heroState(0));}
  else{camera.append(mount,briefing);chapters.forEach((el,index)=>sheets[index].append(el));render(current);wake();}
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{const start=hero.getBoundingClientRect().top+scrollY;scrollTo({top:start+chapterStops[Number(button.dataset.heroStep)]*Math.max(0,hero.offsetHeight-stage.offsetHeight),behavior:'smooth'});}));
 addEventListener('scroll',wake,{passive:true});addEventListener('resize',()=>{render(current);wake();},{passive:true});document.addEventListener('visibilitychange',()=>{last=0;wake();});
 document.addEventListener('msc:hero-motion',event=>{paused=!!event.detail?.paused;last=0;wake();});reduced.addEventListener('change',accessibilityMode);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}},{rootMargin:'80px'}).observe(hero);
 accessibilityMode();
 return {wake,setFilm(manifest){film=manifest;render(current);wake();},fallback(){staticMode=true;hero.classList.add('static-hero');accessibilityMode();}};
}
