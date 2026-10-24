import {trackClub} from './club-analytics.mjs';
import {memberLinkedInURL} from './profile-links.mjs';
import {prepareChessSurfaces} from './chess-materials.mjs';
import {siteMotion} from './site-motion.mjs';
import * as T from './vendor/three/three.module.min.js';
import {RoomEnvironment} from './vendor/three/RoomEnvironment.js';
import {CouncilFocus} from './chess-focus.mjs';
import {departments,councilPieces,pieceNames,associatePlaceholders} from './chess-roster.mjs';
import {squarePosition} from './chess-state.mjs';
const section=document.querySelector('#chessboard'),mount=section?.querySelector('#chess-mount'),reduced=siteMotion;
let renderer,scene,camera,model,focus,environment,profileAnimation,profileOpener,overlayOpen=false,ready=false,failed=false,initializing=false,visible=false,raf=0,last=0,paused=false,selectedId=null,hoveredId=null,roster=[],content,angle=-.12,targetAngle=-.12,painted=false,shadowDirty=true;
const ray=new T.Raycaster(),pointer=new T.Vector2(),$=id=>section.querySelector('#'+id);
const profileDialog=section?.querySelector('#chess-profile-dialog'),mountHome=mount?.parentNode;
const loading=mount?.querySelector('.chess-loading')||document.createElement('span');loading.className='chess-loading';loading.textContent='Preparing the board…';loading.setAttribute('role','status');if(mount){mount.classList.add('chess-live-pending');if(!loading.parentNode)mount.append(loading);}
const placeholder=document.createElement('div');placeholder.className='chess-mount chess-scene-placeholder';placeholder.hidden=true;placeholder.setAttribute('aria-hidden','true');mount?.before(placeholder);
function syncModalLock(){document.body.classList.toggle('modal-open',!!document.querySelector('dialog[open]'));}
function openProfile(){
 if(overlayOpen)return;
 profileOpener=document.activeElement;overlayOpen=true;placeholder.hidden=false;$('chess-overlay-scene').append(mount);
 profileDialog.showModal();syncModalLock();$('chess-reset').focus({preventScroll:true});resize();wake();
}
function closeProfile({restoreFocus=true}={}){
 if(!overlayOpen)return;overlayOpen=false;profileAnimation?.cancel();
 if(profileDialog.open)profileDialog.close();mountHome.insertBefore(mount,placeholder.nextSibling);placeholder.hidden=true;
 selectedId=null;preview(null);section.dataset.focus='board';$('chess-profile').hidden=true;
 for(const button of section.querySelectorAll('[data-council-member]'))button.setAttribute('aria-pressed','false');
 $('chess-position-caption').textContent='The full council / Select a piece';$('chess-status').textContent='The full council is back on the board.';
 mount.setAttribute('aria-label','Interactive council chessboard. Select a council piece or use the names below. New council introductions are marked Coming soon.');
 targetAngle=-.12;focus?.select(null,{immediate:reduced.matches||paused});resize();syncModalLock();last=0;wake();
 if(restoreFocus&&profileOpener?.isConnected)profileOpener.focus({preventScroll:true});profileOpener=null;
}

function makePortrait(member){
 const asset=content.assets[member.asset],[x,y,w,h]=member.crop,ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`${asset.width*x} ${asset.height*y} ${asset.width*w} ${asset.height*h}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',member.name);svg.setAttribute('preserveAspectRatio','xMidYMin slice');
 const image=document.createElementNS(ns,'image');image.setAttribute('href',asset.src);image.setAttribute('width',asset.width);image.setAttribute('height',asset.height);svg.append(image);$('chess-profile-portrait').replaceChildren(svg);
}
function select(id){
 if(!id){closeProfile();return;}
 const member=roster.find(m=>m.id===id);if(id&&!member)return;
 if(member?.id===selectedId)return;
 selectedId=member?.id||null;trackClub('profile_view',member.id);preview(null);section.dataset.focus=member?'person':'board';profileAnimation?.cancel();
 $('chess-profile').hidden=!member;
 for(const button of section.querySelectorAll('[data-council-member]'))button.setAttribute('aria-pressed',String(button.dataset.councilMember===selectedId));
 if(member){
  const department=departments.find(d=>d.name===member.group);makePortrait(member);$('chess-profile-piece').textContent=`${pieceNames[member.type]} / ${member.department}`;$('chess-profile-name').textContent=member.name;$('chess-profile-role').textContent=member.role;$('chess-full-profile').textContent=member.placeholder?'Introduction coming soon ↗':'View full introduction ↗';$('chess-profile-meaning').textContent=department.meaning;
  const linkedin=$('chess-profile-linkedin'),url=memberLinkedInURL(member);linkedin.hidden=!url;if(url){linkedin.href=url;linkedin.setAttribute('aria-label',`${member.name} on LinkedIn (opens in a new tab)`);}else{linkedin.removeAttribute('href');linkedin.removeAttribute('aria-label');}
  $('chess-position-caption').textContent=`${member.name} / ${pieceNames[member.type]}`;
  mount.setAttribute('aria-label',`Close-up of ${member.name}’s ${pieceNames[member.type].toLowerCase()}. Use the profile arrows to meet another council member.`);
  $('chess-person-count').textContent=`${String(roster.indexOf(member)+1).padStart(2,'0')} / ${roster.length}`;
  $('chess-prev').setAttribute('aria-label',`Meet ${roster[(roster.indexOf(member)-1+roster.length)%roster.length].name}, previous person`);
  $('chess-forward').setAttribute('aria-label',`Meet ${roster[(roster.indexOf(member)+1)%roster.length].name}, next person`);
  openProfile();
  if(!reduced.matches&&!paused)profileAnimation=$('chess-profile').animate?.([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,delay:ready?480:0,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
  $('chess-status').textContent=`${member.name}, ${member.role}. ${pieceNames[member.type]} selected. Profile overlay opened with the enlarged portrait and chess piece.`;
 }else{$('chess-position-caption').textContent='The full council / Select a piece';$('chess-status').textContent='The full council is back on the board.';}
 shadowDirty=true;targetAngle=-.12;focus?.select(selectedId,{immediate:reduced.matches||paused});updateHalos();last=0;wake();

}
function stepPerson(direction){if(!roster.length)return;const index=selectedId?roster.findIndex(m=>m.id===selectedId):direction>0?-1:0;select(roster[(index+direction+roster.length)%roster.length].id);}
function preview(id){hoveredId=id;model?.setHoveredPiece(id,reduced.matches||paused);const member=roster.find(m=>m.id===id),el=$('chess-piece-label');const reserved=associatePlaceholders.some(p=>p.id===id);el.hidden=(!member&&!reserved)||!ready;if(reserved)el.textContent='Council introduction · Coming soon';if(member)el.textContent=`${member.name} · ${pieceNames[member.type]}`;mount.style.cursor=member&&ready?'pointer':'';for(const button of section.querySelectorAll('[data-council-member]'))button.classList.toggle('chess-preview',button.dataset.councilMember===id);updateHalos();wake();}
function updateHalos(){
 if(!model)return;[selectedId,hoveredId].forEach((id,i)=>{const piece=roster.find(m=>m.id===id),halo=model.halos[i];halo.visible=!!piece&&i===0;if(piece){const p=squarePosition(piece.square);halo.position.set(p.x,.057,p.z);}});
}
function pick(event){
 if(!ready)return null;const box=mount.getBoundingClientRect();pointer.set((event.clientX-box.left)/box.width*2-1,1-(event.clientY-box.top)/box.height*2);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);
 const hit=ray.intersectObjects(model.pieces.map(p=>p.mesh),true)[0];let object=hit?.object;while(object&&!object.userData.id)object=object.parent;return object?.userData.id||null;
}
function wake(){if(ready&&(visible||overlayOpen||!painted)&&!document.hidden&&!raf)raf=requestAnimationFrame(draw);}
function draw(time){
 raf=0;if(!ready||(!visible&&!overlayOpen&&painted)||document.hidden)return;const dt=last?Math.min((time-last)/1000,.04):1/60;last=time;
 const poseMoving=!!focus.animation;if(reduced.matches)focus.finish();if(!paused)focus.tick(dt);
 if(!paused&&!reduced.matches)angle+=(targetAngle-angle)*Math.min(1,dt*7);
 const hoverMoving=model.tickHover(dt,paused||reduced.matches);model.group.rotation.y=angle;renderer.shadowMap.needsUpdate=shadowDirty||poseMoving||!painted;shadowDirty=false;renderer.render(scene,camera);
 if(!painted){painted=true;section.classList.add('chess-ready');mount.classList.remove('chess-live-pending');loading.hidden=true;}
 if(hoverMoving||(!paused&&(focus.animation||(!reduced.matches&&Math.abs(targetAngle-angle)>.0001))))wake();else last=0;
}
function resize(){if(!renderer||!focus)return;const w=Math.max(1,mount.clientWidth),h=Math.max(1,mount.clientHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,3,Math.sqrt(7000000/(w*h))));renderer.setSize(w,h,false);focus.resize(w/h);wake();}
function motion(){shadowDirty=true;const still=paused||reduced.matches;for(const b of [$('chess-motion'),$('chess-overlay-motion')]){b.hidden=failed;b.disabled=reduced.matches;b.textContent=reduced.matches?'Still view':paused?'Resume ▶':'Pause Ⅱ';b.setAttribute('aria-pressed',String(still));b.setAttribute('aria-label',paused?'Resume chessboard motion':'Pause chessboard motion');}if(still)profileAnimation?.cancel();if(reduced.matches){focus?.finish();angle=targetAngle=-.12;}last=0;wake();}
function fallback(message){ready=false;failed=true;section.classList.remove('chess-ready');mount.classList.remove('chess-live-pending');loading.hidden=true;cancelAnimationFrame(raf);raf=0;focus?.finish();preview(null);$('chess-motion').hidden=true;$('chess-overlay-motion').hidden=true;$('chess-board-hint').textContent='Explore the council by name below.';$('chess-status').textContent=message;}
async function init(){
 if(ready||failed||initializing)return;initializing=true;await loaded;if(!roster.length){initializing=false;return;}
 try{
  const {createChessModel}=await import('./chess-model.mjs');
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance',precision:'highp'});renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=T.PCFShadowMap;
  await prepareChessSurfaces(renderer);
  scene=new T.Scene();camera=new T.PerspectiveCamera(36,1,.1,90);model=createChessModel(roster);model.group.rotation.y=angle;scene.add(model.group);focus=new CouncilFocus(model,camera);
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.05);scene.environment=environment.texture;scene.environmentIntensity=.30;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xfff3e5,0x393035,.65));const key=new T.DirectionalLight(0xfff0de,2.4);key.position.set(-3,10,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.radius=3.5;key.shadow.camera.left=-6.5;key.shadow.camera.right=6.5;key.shadow.camera.top=6.5;key.shadow.camera.bottom=-6.5;key.shadow.camera.near=.5;key.shadow.camera.far=35;key.shadow.normalBias=.025;key.shadow.bias=-.00008;scene.add(key);const fill=new T.DirectionalLight(0xece7ed,.75);fill.position.set(5,4,-3);scene.add(fill);const rim=new T.DirectionalLight(0xffe6ce,.65);rim.position.set(-5,5,-7);scene.add(rim);const floor=new T.Mesh(new T.PlaneGeometry(38,38),new T.ShadowMaterial({color:0x070d13,opacity:.20}));floor.rotation.x=-Math.PI/2;floor.position.y=-.445;floor.receiveShadow=true;scene.add(floor);
  renderer.domElement.setAttribute('aria-hidden','true');mount.append(renderer.domElement);renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback('The 3D view is unavailable. Select any name below to meet the council.');});
  ready=true;resize();focus.select(selectedId,{immediate:true});model.setHoveredPiece(hoveredId,true);updateHalos();new ResizeObserver(resize).observe(mount);motion();
 }catch(error){renderer?.dispose();fallback('The board is shown as a still. Select any name below to meet the council.');console.warn('The council directory remains available without 3D.',error);}
 initializing=false;
}
async function loadRoster(){
 try{
  content=JSON.parse(document.querySelector('#site-content').textContent);roster=[...councilPieces(content.members),...associatePlaceholders];
  const groups=departments.map(department=>{const group=document.createElement('div');group.className='chess-department';const heading=document.createElement('h3'),symbol=document.createElement('span');symbol.textContent=department.symbol;symbol.setAttribute('aria-hidden','true');heading.append(symbol,document.createTextNode(department.plural));group.dataset.pieceType=department.type;const type=document.createElement('p');type.textContent=department.name;group.append(heading);if(department.type!=='bishop')group.append(type);const subgroups=new Map();if(department.type==='bishop')for(const name of ['Finance','Operations']){const subgroup=document.createElement('div');subgroup.className='chess-subdepartment';const label=document.createElement('h4');label.textContent=name;subgroup.append(label);subgroups.set(name,subgroup);group.append(subgroup);}
   for(const member of roster.filter(m=>m.group===department.name)){const button=document.createElement('button');button.type='button';button.dataset.councilMember=member.id;button.textContent=member.placeholder?`Coming soon · ${String(member.slot).padStart(2,'0')}`:member.name;button.setAttribute('aria-label',`Meet ${member.name}, ${member.role}, ${pieceNames[member.type]}`);button.setAttribute('aria-pressed','false');button.setAttribute('aria-controls','chess-profile-dialog');button.setAttribute('aria-haspopup','dialog');button.addEventListener('click',()=>select(member.id));button.addEventListener('pointerenter',()=>{if(!selectedId)preview(member.id);});button.addEventListener('pointerleave',()=>preview(null));button.addEventListener('focus',()=>{if(!selectedId)preview(member.id);});button.addEventListener('blur',()=>preview(null));(subgroups.get(member.department)||group).append(button);}
   if(department.type==='pawn'){const note=document.createElement('p');note.className='chess-associate-reserved';note.textContent='15 new council profiles · Coming soon';group.append(note);}return group;});
  $('chess-roster').replaceChildren(...groups);$('chess-next').disabled=false;
 }catch(error){$('chess-roster').innerHTML='<p>The council directory could not load. <a href="#team">Meet the team below →</a></p>';$('chess-status').textContent='The council directory could not load.';}
}
let loaded;
if(section){
 $('chess-next').disabled=true;loaded=loadRoster();
 $('chess-next').addEventListener('click',()=>stepPerson(1));$('chess-prev').addEventListener('click',()=>stepPerson(-1));$('chess-forward').addEventListener('click',()=>stepPerson(1));$('chess-reset').addEventListener('click',()=>select(null));for(const button of [$('chess-motion'),$('chess-overlay-motion')])button.addEventListener('click',()=>{paused=!paused;motion();});
 profileDialog.addEventListener('cancel',event=>{event.preventDefault();closeProfile();});profileDialog.addEventListener('close',()=>closeProfile());profileDialog.addEventListener('click',event=>{if(event.target!==profileDialog)return;const box=profileDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeProfile();});
 $('chess-full-profile').addEventListener('click',()=>{if(!selectedId)return;const id=selectedId;closeProfile();document.dispatchEvent(new CustomEvent('msc:inspect-member',{detail:{id}}));});
 section.addEventListener('keydown',event=>{
  if(document.querySelector('dialog[open]:not(#chess-profile-dialog)')||event.altKey||event.ctrlKey||event.metaKey||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))return;
  if(event.key==='Escape'&&selectedId){event.preventDefault();select(null);return;}
  const direction=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0;if(!direction&&event.key!=='Home'&&event.key!=='End')return;
  if(event.target.dataset.councilMember){event.preventDefault();const buttons=[...section.querySelectorAll('[data-council-member]')],index=buttons.indexOf(event.target),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+direction+buttons.length)%buttons.length;buttons[next].focus();}
  else if(direction){event.preventDefault();stepPerson(direction);}
 });
 mount.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const id=pick(event);if(id!==hoveredId)preview(id);wake();},{passive:true});mount.addEventListener('pointerleave',()=>{targetAngle=-.12;preview(null);});
 mount.addEventListener('click',event=>{const id=pick(event);if(id)select(id);});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){if(!ready&&!failed)init();else{last=0;wake();}}else if(!overlayOpen){cancelAnimationFrame(raf);raf=0;last=0;}},{rootMargin:'650px'}).observe(section);
 document.addEventListener('visibilitychange',()=>{last=0;wake();});reduced.addEventListener('change',motion);motion();
 // Build textures, geometry and the first GPU frame while the visitor is above the board.
 // Keep the renderer for subsequent visits; offscreen animation stays asleep after this frame.
 if('requestIdleCallback' in window)window.requestIdleCallback(()=>init(),{timeout:1200});
 else window.setTimeout(()=>init(),250);
}
