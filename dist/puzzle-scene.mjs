import * as T from './vendor/three/three.module.min.js';
import {RoomEnvironment} from './vendor/three/RoomEnvironment.js';
import {createPuzzleBatches} from './puzzle-geometry.mjs';
import {puzzlePose,smooth,sceneProgress} from './motion-math.mjs';
const section=document.querySelector('#perspectives'),stage=section?.querySelector('.puzzle-stage'),mount=section?.querySelector('#puzzle-mount');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,scene,camera,environment,pmrem,texture,observer,resizeObserver,disposed=false,contextLost=false;
let ready=false,visible=false,paused=false,raf=0,last=0,current=0,target=0,manual=null,anchor=0,phase=-1;
let pointer={x:99,y:99},hovered=-1,lastHover=-1,clock=0;
const pieces=[],batches=[],dummy=new T.Object3D(),raycaster=new T.Raycaster(),mouse=new T.Vector2();
const compact=innerWidth<=760,columns=compact?18:36,rows=compact?40:25;
const count=columns*rows;
function announce(p){
 const next=p<.3?0:p<.83?1:2;if(next===phase)return;phase=next;
 section.querySelector('#puzzle-phase').textContent=['01 / A different perspective','02 / Connections take shape','03 / The bigger picture'][next];
 section.querySelector('#puzzle-caption').textContent=['The value is in how the pieces fit.','Ideas gain meaning when they connect.','Different perspectives. One council.'][next];
 section.querySelector('#puzzle-replay').textContent=next===2?'Scatter ↗':'Assemble ↗';
}
function wake(){if(!raf&&ready&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
function tick(time){
 raf=0;if(!ready||!visible||document.hidden)return;
 if(compact&&last&&time-last<30&&!paused&&!reduced.matches){wake();return;}
 const dt=last?Math.min((time-last)/1000,.04):1/60;last=time;
 if(!paused&&!reduced.matches){clock+=dt;target=manual===null?sceneProgress(section,stage):manual;current+=(target-current)*(1-Math.exp(-dt*6.5));if(Math.abs(target-current)<.0001)current=target;}
 if(reduced.matches)current=1;
 const allowPointer=current>.91&&!reduced.matches&&!paused;
 if(allowPointer&&pointer.x!==99){mouse.set(pointer.x,pointer.y);raycaster.setFromCamera(mouse,camera);const hit=raycaster.intersectObjects(batches,false)[0];hovered=hit?hit.object.userData.pieceIndices[hit.instanceId]:-1;}else hovered=-1;
 let settling=false;
 for(let i=0;i<pieces.length;i++){
  const item=pieces[i],pose=puzzlePose(i,item.column,item.row,columns,rows,current,clock);
  const desired=i===hovered?.30:0;item.hover+=(desired-item.hover)*Math.min(1,dt*9);if(Math.abs(desired-item.hover)>.001)settling=true;
  dummy.position.set(pose.x,pose.y,pose.z+item.hover);dummy.rotation.set(pose.rx+item.hover*.23,pose.ry-item.hover*.18,pose.rz);dummy.scale.set(.994,.994,1);dummy.updateMatrix();item.batch.setMatrixAt(item.slot,dummy.matrix);
 }
 for(const batch of batches)batch.instanceMatrix.needsUpdate=true;
 section.style.setProperty("--puzzle-heading",(1-smooth(current,.55,.85)).toFixed(4));
 scene.rotation.x=-.12+.075*smooth(current,.65,1);scene.rotation.y=.09-.06*smooth(current,.5,.95);
 renderer.render(scene,camera);announce(current);
 section.querySelector('.puzzle-scroll-meter>span').style.transform=`scaleX(${current})`;
 section.querySelector('#puzzle-progress-label').textContent=current>.97?'HOVER TO EXPLORE THE PIECES':'SCROLL TO CONNECT';
 const moving=!paused&&!reduced.matches&&(current<.96||Math.abs(target-current)>.0001);
 if(moving||settling||hovered!==lastHover)wake();else last=0;lastHover=hovered;
}
function resize(){if(!renderer)return;const w=mount.clientWidth,h=mount.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);const tan=Math.tan(T.MathUtils.degToRad(20));camera.position.z=Math.min((columns*.82/2)/(tan*camera.aspect),(rows*.82/2)/tan)*.98;camera.updateProjectionMatrix();wake();}
function motionPreference(){
 section.classList.toggle('puzzle-enhanced',ready&&!reduced.matches);
 if(reduced.matches){manual=null;target=1;current=1;clock=0;}
 const toggle=section.querySelector('#puzzle-motion');toggle.disabled=reduced.matches;toggle.textContent=reduced.matches?'Still view':paused?'Resume ▶':'Pause Ⅱ';toggle.setAttribute('aria-pressed',String(paused||reduced.matches));wake();
}
async function init(){
 if(ready||disposed||contextLost)return;
 try{
  renderer=new T.WebGLRenderer({alpha:true,antialias:!compact,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,compact?1.35:1.75));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  scene=new T.Scene();camera=new T.PerspectiveCamera(40,1,.1,80);camera.position.set(0,0,12);
  pmrem=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0x4a2632,.8));const key=new T.DirectionalLight(0xfff3de,2);key.position.set(-3,5,8);scene.add(key);
  texture=await new T.TextureLoader().loadAsync(compact?'assets/strategy-mind-portrait.svg':'assets/strategy-mind.svg');if(disposed){texture.dispose();return;}
  texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const front=new T.MeshStandardMaterial({map:texture,roughness:.79,metalness:.02,side:T.FrontSide});const edge=new T.MeshStandardMaterial({color:0x713242,roughness:.65,metalness:.12});
  const built=createPuzzleBatches(columns,rows,front,edge);pieces.push(...built.pieces);batches.push(...built.batches);for(const batch of batches)scene.add(batch);
  renderer.domElement.setAttribute('aria-hidden','true');mount.append(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;contextLost=true;section.classList.remove('puzzle-ready','puzzle-enhanced');section.querySelector('.puzzle-controls').hidden=true;cancelAnimationFrame(raf);raf=0;});
  ready=true;section.classList.add('puzzle-ready');section.querySelector('.puzzle-controls').hidden=false;motionPreference();resize();
  resizeObserver=new ResizeObserver(resize);resizeObserver.observe(mount);wake();
 }catch(error){renderer?.dispose();environment?.dispose();section.classList.remove('puzzle-enhanced');console.warn('The printed puzzle remains available as a still.',error);}
}
if(section){
 // Reduced motion uses the finished printed study without allocating a WebGL context.
 if(!reduced.matches){observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){if(!ready)init();else wake();}else{cancelAnimationFrame(raf);raf=0;last=0;}},{rootMargin:'180px'});observer.observe(section);}
 else{announce(1);section.querySelector('#puzzle-progress-label').textContent='THE BIGGER PICTURE';}
 addEventListener('scroll',()=>{if(manual!==null&&Math.abs(scrollY-anchor)>80)manual=null;wake();},{passive:true});
 document.addEventListener('visibilitychange',()=>{last=0;wake();});
 mount.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const r=mount.getBoundingClientRect();pointer={x:((event.clientX-r.left)/r.width)*2-1,y:1-((event.clientY-r.top)/r.height)*2};wake();},{passive:true});
 mount.addEventListener('pointerleave',()=>{pointer={x:99,y:99};wake();});
 section.querySelector('#puzzle-replay').addEventListener('click',()=>{manual=current>.5?0:1;anchor=scrollY;paused=false;motionPreference();wake();});
 section.querySelector('#puzzle-motion').addEventListener('click',()=>{paused=!paused;section.querySelector('#puzzle-motion').setAttribute('aria-label',paused?'Resume puzzle animation':'Pause puzzle animation');motionPreference();});
 reduced.addEventListener('change',()=>{if(!ready&&!reduced.matches){visible=true;init();if(!observer){observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'180px'});observer.observe(section);}}else motionPreference();});
 addEventListener('pageshow',wake);
 addEventListener('pagehide',event=>{if(event.persisted){cancelAnimationFrame(raf);raf=0;last=0;return;}disposed=true;cancelAnimationFrame(raf);observer?.disconnect();resizeObserver?.disconnect();for(const batch of batches)batch.geometry.dispose();if(batches.length)for(const mat of batches[0].material)mat.dispose();texture?.dispose();environment?.dispose();renderer?.dispose();},{once:true});
}
