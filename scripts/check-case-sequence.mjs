import assert from'node:assert/strict';import fs from'node:fs';
import{heroState,chapterStops,advanceStory,readingShots}from'../dist/hero-timeline.mjs';
import{paperFlights,paperProgress,paperReveal,projectedPaper,projectedDock,flightQuad,quadMatrix}from'../dist/paper-flight.mjs';
import{readingCamera}from'../dist/film-framing.mjs';
const m=JSON.parse(fs.readFileSync(new URL('../dist/assets/case-recessed-v4/manifest.json',import.meta.url)));
const transform=(matrix,x,y)=>{const w=matrix[3]*x+matrix[7]*y+matrix[15];return[(matrix[0]*x+matrix[4]*y+matrix[12])/w,(matrix[1]*x+matrix[5]*y+matrix[13])/w];};
for(const [width,height]of[[1440,900],[1920,1080],[835,740],[390,844],[360,720]]){
 for(let index=0;index<3;index++){
  const flight=paperFlights[index],shot=readingShots[index];assert.equal(shot.in[0],flight.start,'Camera approaches during ascent.');assert.equal(shot.in[1],flight.end);if(index>0)assert(paperFlights[index-1].returnEnd<flight.start,'Return the previous page before the next card rises.');if(flight.returnEnd){assert.equal(shot.out[0],flight.returnStart);assert.equal(shot.out[1],flight.returnEnd);assert.equal(paperProgress(flight.returnEnd,index),0,'Card returns all the way into the tray.');assert.equal(heroState(flight.returnEnd).zoom,0);}
  for(let step=0;step<=100;step++){
   const p=flight.start+(flight.end-flight.start)*step/100,s=heroState(p),t=paperProgress(p,index),source=projectedPaper(m,index,s.film,s.push,width,height,width),dock=projectedDock(m,s.film,s.push,width,height,width),quad=flightQuad(source,dock,t,height),matrix=quadMatrix(quad,520,310);assert(matrix.every(Number.isFinite));
   for(const [i,point]of[[0,[0,0]],[1,[520,0]],[2,[520,310]],[3,[0,310]]]){const result=transform(matrix,...point);assert(Math.hypot(result[0]-quad[i][0],result[1]-quad[i][1])<1e-6);if(step===0)assert(Math.hypot(result[0]-source[i][0],result[1]-source[i][1])<1e-6);if(step===100)assert(Math.hypot(result[0]-dock[i][0],result[1]-dock[i][1])<1e-6);}
  }
  const s=heroState(chapterStops[index+1]);assert.equal(s.zoom,1);const dock=projectedDock(m,s.film,s.push,width,height,width),camera=readingCamera(dock,width,height,s.zoom);assert(camera.scale>1.12,'A visible camera approach.');
  const final=dock.map(([x,y])=>[x*camera.scale+camera.x,y*camera.scale+camera.y]);for(const [x,y]of final){assert(x>width*.035&&x<width*.965);assert(y>130&&y<height-130,'Printed card fits between the header and chapter navigation.');}
  assert.equal(paperReveal(chapterStops[index+1],index,m.count),1);
 }
}
for(const hz of[30,60,120]){
 let position=0,velocity=0,peak=0;
 for(let frame=0;frame<hz*12;frame++){const next=advanceStory(position,velocity,.97,1/hz);assert(next.position>=position&&next.position<=.97);peak=Math.max(peak,Math.abs(next.position-position));position=next.position;velocity=next.velocity;}
 assert.equal(position,.97);assert.equal(velocity,0);assert(peak<=.231/hz);
}
for(let i=0;i<=m.frameLimit;i++){assert(fs.existsSync(new URL(`../dist/${m.directory}/${String(i).padStart(3,'0')}.webp`,import.meta.url)));if(i<m.frameLimit)assert(fs.existsSync(new URL(`../dist/${m.directory}/flow-${String(i).padStart(3,'0')}.png`,import.meta.url)));}
assert.equal(heroState(.49).zoom,0);assert.equal(heroState(.79).zoom,0);assert.equal(heroState(1).zoom,1);assert.equal(heroState(1).film,.36);
console.log('PASS: three registered card flights; synchronized ascent/zoom and descent/pull-back; pages return to the tray before switching; readable crops at five sizes; bounded response at 30/60/120Hz; all GPU texture pairs.');
