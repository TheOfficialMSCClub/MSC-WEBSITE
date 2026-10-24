import {siteMotion} from './site-motion.mjs';
import {createHeroStory} from './hero-story.mjs';
import {heroState} from './hero-timeline.mjs';
import {frameRectangle} from './film-framing.mjs';
import {createCaseRenderer} from './case-renderer.mjs';
const hero=document.querySelector('.object-hero'),stage=document.querySelector('.object-stage'),mount=document.querySelector('#briefcase-scene'),toggle=document.querySelector('#object-motion');
const reduced=siteMotion;
let state=heroState(0),paused=false,frame=0,manifest,canvas,renderer,visible=true,desired=0,busy=0,lastRequested=-1,lastPaintKey='',announced=false,bootstrapped=false,broken=false;
const images=new Map(),flows=new Map(),encoded=new Map(),pending=new Set();let queue=[];
const isMobile=()=>innerWidth<=760;
const story=createHeroStory({hero,stage,mount,reduced,gateProgress(candidate,current){
 if(!manifest||broken||!announced)return current;
 const value=heroState(candidate).film*(manifest.count-1),lo=Math.floor(value),hi=Math.ceil(value);requestWindow(value);
 return images.has(lo)&&images.has(hi)&&(renderer.kind!=='flow'||lo===hi||flows.has(lo))?candidate:current;
},onChange(next){state=next;if(renderer&&announced)draw();else wake();}});
function filmValue(){return reduced.matches?0:state.film*(manifest?.count-1||0);}
function updateToggle(){const still=paused||reduced.matches;toggle.disabled=reduced.matches;toggle.setAttribute('aria-pressed',String(still));toggle.setAttribute('aria-label',still?'Resume case film':'Pause case film');toggle.innerHTML=`<span aria-hidden="true">${still?'▶':'Ⅱ'}</span><span>${still?'Motion off':'Motion on'}</span>`;}
toggle.addEventListener('click',()=>{paused=!paused;updateToggle();document.dispatchEvent(new CustomEvent('msc:hero-motion',{detail:{paused}}));wake();});reduced.addEventListener('change',()=>{lastRequested=-1;updateToggle();wake();});updateToggle();
function wake(){if(renderer&&!frame&&visible&&!document.hidden&&!broken)frame=requestAnimationFrame(draw);}
function dispose(image){renderer?.drop(image);if(image.close)image.close();else image.src='';}
function trim(){for(const [cache,capacity]of[[images,isMobile()?12:20],[flows,isMobile()?8:12]]){const removable=[...cache.keys()].filter(i=>i!==0&&Math.abs(i-desired)>2).sort((a,b)=>Math.abs(b-desired)-Math.abs(a-desired));while(cache.size>capacity&&removable.length){const key=removable.shift();dispose(cache.get(key));cache.delete(key);}}}
function blobFor(index,flow=false){const key=(flow?'flow-':'')+index;if(!encoded.has(key))encoded.set(key,fetch(`${manifest.directory}/${flow?'flow-':''}${String(index).padStart(3,'0')}.${flow?'png':'webp'}`).then(response=>{if(!response.ok)throw Error(`Missing case ${key}`);return response.blob();}));return encoded.get(key);}
async function load(index,flow=false){
 const blob=await blobFor(index,flow);let image;
 if(typeof createImageBitmap==='function'){const options={premultiplyAlpha:'none',colorSpaceConversion:flow?'none':'default'};if(!flow&&isMobile()){options.resizeWidth=672;options.resizeHeight=672;options.resizeQuality='high';}image=await createImageBitmap(blob,options);}
 else{image=new Image();image.decoding='async';const url=URL.createObjectURL(blob);try{image.src=url;await image.decode();}finally{URL.revokeObjectURL(url);}}
 if(broken){dispose(image);return;}(flow?flows:images).set(index,image);trim();wake();story.wake();
}
function fallback(error){if(broken)return;broken=true;queue=[];cancelAnimationFrame(frame);frame=0;toggle.hidden=true;mount.classList.remove('scene-ready');story.fallback();for(const cache of[images,flows]){for(const image of cache.values())dispose(image);cache.clear();}console.warn('MSC case film is using its readable still fallback.',error);}
function pump(){if(!visible||document.hidden||broken)return;while(busy<3&&queue.length){const [index,flow]=queue.shift(),key=(flow?'f':'i')+index;if((flow?flows:images).has(index)||pending.has(key))continue;busy++;pending.add(key);load(index,flow).catch(fallback).finally(()=>{busy--;pending.delete(key);pump();});}}
function requestWindow(value){
 if(!manifest||broken)return;desired=Math.round(value);if(lastRequested===desired){pump();return;}lastRequested=desired;
 const lo=Math.floor(value),hi=Math.ceil(value),order=[lo,hi];if(!reduced.matches)for(let i=1;i<=6;i++)order.push(hi+i,lo-i);
 queue=[];for(const index of new Set(order)){if(index<0||index>manifest.frameLimit)continue;if(!images.has(index)&&!pending.has('i'+index))queue.push([index,false]);if(renderer?.kind==='flow'&&index<manifest.frameLimit&&!flows.has(index)&&!pending.has('f'+index))queue.push([index,true]);}pump();
}
function draw(){
 if(frame){cancelAnimationFrame(frame);frame=0;}if(!renderer||!manifest||!bootstrapped||broken||!visible||document.hidden)return;
 const value=filmValue(),lo=Math.floor(value),hi=Math.ceil(value),blend=value-lo;requestWindow(value);
 if(!images.has(lo)||!images.has(hi)||(renderer.kind==='flow'&&lo!==hi&&!flows.has(lo)))return;
 const key=[value.toFixed(5),state.push.toFixed(5),canvas.width,canvas.height].join(':');if(key===lastPaintKey)return;lastPaintKey=key;
 const rectangle=index=>frameRectangle({width:canvas.width,height:canvas.height,imageWidth:manifest.dimensions[index][0],imageHeight:manifest.dimensions[index][1],bounds:manifest.bounds[index],referenceBounds:manifest.bounds[0],dock:manifest.docks[index],push:state.push,progress:value/(manifest.count-1),viewportWidth:innerWidth,pixelRatio:canvas.width/Math.max(mount.clientWidth,1),compact:innerWidth<=1000,fullStage:hero.classList.contains('story-enhanced')});
 renderer.render(images.get(lo),images.get(hi),lo===hi?null:flows.get(lo),blend,rectangle(lo),rectangle(hi));
 if(!announced){announced=true;mount.classList.add('scene-ready');hero.classList.add('object-ready');hero.dataset.caseRenderer=renderer.kind;story.setFilm(manifest);}
}
function resize(){if(!canvas)return;lastPaintKey='';lastRequested=-1;trim();const ratio=Math.min(devicePixelRatio||1,isMobile()?1.35:1.65);canvas.width=Math.round(mount.clientWidth*ratio);canvas.height=Math.round(mount.clientHeight*ratio);wake();}
async function prefetch(){const order=[];for(let i=0;i<=manifest.frameLimit;i++){order.push([i,false]);if(renderer.kind==='flow'&&i<manifest.frameLimit)order.push([i,true]);}let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<order.length&&!broken){const [i,flow]=order[next++];try{await blobFor(i,flow);}catch{return;}}}));}
async function init(){try{
 const response=await fetch('assets/case-recessed-v4/manifest.json');if(!response.ok)throw Error('Missing film');manifest=await response.json();canvas=document.createElement('canvas');try{renderer=createCaseRenderer(canvas,{motion:typeof createImageBitmap==='function'});}catch{canvas=document.createElement('canvas');renderer=createCaseRenderer(canvas,{motion:false});}canvas.setAttribute('aria-hidden','true');mount.append(canvas);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback(Error('Case renderer context lost'));});
 // A short decoded runway prevents the first wheel gesture from outrunning image decoding.
 const runway=reduced.matches?0:7;for(let i=0;i<=runway;i++){await load(i);if(renderer.kind==='flow'&&i<runway)await load(i,true);}bootstrapped=true;resize();draw();new ResizeObserver(resize).observe(mount);if(!reduced.matches)prefetch();
 }catch(error){fallback(error);}}
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){pump();wake();story.wake();}},{rootMargin:'100px'}).observe(hero);document.addEventListener('visibilitychange',()=>{pump();wake();story.wake();});
if('requestIdleCallback' in window)requestIdleCallback(init,{timeout:400});else setTimeout(init,50);
