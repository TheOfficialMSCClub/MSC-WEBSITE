import assert from 'node:assert/strict';
import fs from 'node:fs';
import {paperFlights,paperReveal,paperProgress,projectedPaper,quadMatrix,flightQuad,projectedDock} from '../dist/paper-flight.mjs';
import {heroState} from '../dist/hero-timeline.mjs';
import {createBriefcase} from '../dist/briefcase-model.mjs';
import * as T from '../dist/vendor/three/three.module.min.js';
const model=createBriefcase(),base=model.group.getObjectByName('Recessed felt-lined base'),lid=model.group.getObjectByName('Lid with document pocket');
const boxFor=mesh=>{mesh.geometry.computeBoundingBox();return mesh.geometry.boundingBox;};
const baseShell=boxFor(base.children[0]),lidShell=boxFor(lid.children[0]);
assert(Math.abs(baseShell.max.x-lidShell.max.x)<1e-7);assert(Math.abs(baseShell.min.x-lidShell.min.x)<1e-7);
assert(Math.abs(baseShell.getSize(new T.Vector3()).y-lidShell.getSize(new T.Vector3()).y)<1e-6,'Both shell extrusions must have equal depth.');
const manifest=JSON.parse(fs.readFileSync(new URL('../dist/assets/case-briefing/manifest-insert-v2.json',import.meta.url)));
const transform=(m,x,y)=>{const w=m[3]*x+m[7]*y+m[15];return[(m[0]*x+m[4]*y+m[12])/w,(m[1]*x+m[5]*y+m[13])/w];};
assert.equal(manifest.docks.length,manifest.count);
for(const [width,height]of[[1440,900],[1920,1080],[835,740],[390,844],[360,720]]){
 for(let step=0;step<=300;step++){
  const p=.15+step/300*.85,state=heroState(p),t=paperProgress(p,0),source=projectedPaper(manifest,0,state.film,state.push,width,height,width),dock=projectedDock(manifest,state.film,state.push,width,height,width),quad=flightQuad(source,dock,t,height),matrix=quadMatrix(quad,520,310);
  assert(matrix.every(Number.isFinite));
  for(const [i,[x,y]]of [[0,[0,0]],[1,[520,0]],[2,[520,310]],[3,[0,310]]]){
   const projected=transform(matrix,x,y);assert(Math.hypot(projected[0]-quad[i][0],projected[1]-quad[i][1])<1e-6);
   if(step===0)assert(Math.hypot(projected[0]-source[i][0],projected[1]-source[i][1])<1e-6,'Exact four-corner takeoff.');
   if(t===1)assert(Math.hypot(projected[0]-dock[i][0],projected[1]-dock[i][1])<1e-6,'Paper remains docked inside the lid.');
  }
  if(t===1){assert.equal(paperReveal(p,0,manifest.count),1,'Permanent paper surface.');assert(Math.min(...dock.map(p=>p[1]))>=110,'Reading stays clear of the navigation.');assert(Math.max(...dock.map(p=>p[0]))<width);assert(Math.min(...dock.map(p=>p[0]))>0);assert(state.film<=.423,'Reading retains a frontal case pose.');}
 }
}
const missing=Math.ceil(paperFlights[0].start*(manifest.count-1)-1e-7);
for(let step=0;step<=20;step++){
 const value=missing-1.5+step*.1,p=value/(manifest.count-1),lo=Math.floor(value),hi=lo+1,blend=value-lo,baked=(lo<missing?1-blend:0)+(hi<missing?blend:0);
 assert(Math.abs(baked+paperReveal(p,0,manifest.count)-1)<1e-8,'Rendered and printed sheets transfer exactly.');
}
console.log('PASS: matched shells, exact paper takeoff, permanent in-lid landing, registered perspective and readable framing on desktop, tablet and phone.');
