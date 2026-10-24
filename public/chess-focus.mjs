import * as T from './vendor/three/three.module.min.js';
import {squarePosition} from './chess-state.mjs';
import {smooth} from './motion-math.mjs';
import {pieceHeights as heights} from './chess-dimensions.mjs';
export const portraitAngle=70*Math.PI/180;
const nearestAngle=(start,end)=>start+T.MathUtils.euclideanModulo(end-start+Math.PI,Math.PI*2)-Math.PI;
const home=piece=>{const p=squarePosition(piece.square);return new T.Vector3(p.x,.055,p.z);};
export class CouncilFocus{
 constructor(model,camera){this.model=model;this.camera=camera;this.activeId=null;this.look=new T.Vector3(0,.3,0);this.animation=null;this.applyOverview();}
 overview(){const d=17.5*Math.max(1,.95/this.camera.aspect);return {position:new T.Vector3(d*.51,d*.62,d*.75),look:new T.Vector3(0,.3,0)};}
 focused(piece){const h=heights[piece.type],look=new T.Vector3(0,h*.52,5.6).applyAxisAngle(new T.Vector3(0,1,0),-.12);const k=h*Math.max(1,.9/this.camera.aspect);return {look,position:look.clone().add(new T.Vector3(1.1,.85,1.85).multiplyScalar(k))};}
 facingYaw(piece,pose=this.focused(piece)){const direction=pose.position.clone().sub(pose.look);return Math.atan2(direction.x,direction.z)+.12+portraitAngle-(piece.mesh.userData.frontYaw||0);}
 applyOverview(){const pose=this.overview();this.camera.position.copy(pose.position);this.look.copy(pose.look);this.camera.lookAt(this.look);}
 select(id,{immediate=false}={}){
  const selected=id?this.model.pieces.find(p=>p.id===id):null;
  if(id&&!selected)return false;
  const previous=this.activeId,switching=!!selected&&!!previous&&selected.id!==previous;
  this.activeId=selected?.id||null;
  const pose=selected?this.focused(selected):this.overview();
  this.animation={elapsed:0,duration:switching?2.15:selected?1.65:1.25,switching,overview:this.overview(),cameraStart:this.camera.position.clone(),lookStart:this.look.clone(),pose,targets:this.model.pieces.map(piece=>({piece,incoming:selected===piece,start:piece.mesh.position.clone(),end:selected===piece?new T.Vector3(0,.16,5.6):home(piece),rotationStart:piece.mesh.rotation.y,rotationEnd:nearestAngle(piece.mesh.rotation.y,selected===piece?this.facingYaw(piece,pose):(piece.mesh.userData.homeYaw||0))}))};
  if(immediate)this.finish();return true;
 }
 resize(aspect){
  this.camera.aspect=aspect;this.camera.updateProjectionMatrix();
  const selected=this.model.pieces.find(p=>p.id===this.activeId),pose=selected?this.focused(selected):this.overview();
  if(this.animation){this.animation.pose=pose;this.animation.overview=this.overview();}
  else{this.camera.position.copy(pose.position);this.look.copy(pose.look);this.camera.lookAt(this.look);}
 }
 finish(){if(!this.animation)return;const a=this.animation;for(const t of a.targets){t.piece.mesh.position.copy(t.end);t.piece.mesh.rotation.y=t.rotationEnd;}this.camera.position.copy(a.pose.position);this.look.copy(a.pose.look);this.camera.lookAt(this.look);this.animation=null;}
 tick(dt){
  if(!this.animation)return false;
  const a=this.animation;a.elapsed+=Math.min(dt,.05);const p=Math.min(1,a.elapsed/a.duration),move=smooth(Math.min(1,p/ .86)),zoom=smooth(Math.max(0,(p-.10)/.90));
  for(const t of a.targets){const progress=a.switching?smooth(t.incoming?(p-.28)/.72:p/.48):move;t.piece.mesh.position.lerpVectors(t.start,t.end,progress);if(t.start.distanceTo(t.end)>.01)t.piece.mesh.position.y+=Math.sin(Math.PI*progress)*1.15;t.piece.mesh.rotation.y=T.MathUtils.lerp(t.rotationStart,t.rotationEnd,progress);}
  if(a.switching){const outgoing=p<.4,progress=smooth(outgoing?p/.4:(p-.4)/.6);this.camera.position.lerpVectors(outgoing?a.cameraStart:a.overview.position,outgoing?a.overview.position:a.pose.position,progress);this.look.lerpVectors(outgoing?a.lookStart:a.overview.look,outgoing?a.overview.look:a.pose.look,progress);}
  else{this.camera.position.lerpVectors(a.cameraStart,a.pose.position,zoom);this.look.lerpVectors(a.lookStart,a.pose.look,zoom);}
  this.camera.lookAt(this.look);if(p===1)this.finish();return true;
 }
}
