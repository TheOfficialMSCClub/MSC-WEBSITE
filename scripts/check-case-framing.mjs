import assert from 'node:assert/strict';
import fs from 'node:fs';
import {frameRectangle} from '../dist/film-framing.mjs';
import {heroState} from '../dist/hero-timeline.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../dist/assets/case-briefing/manifest.json',import.meta.url)));
for(const [width,height,top,bottom]of [[1440,900,225,36],[835,674,674*.33,674*.06],[390,844,315,125],[360,640,285,110],[1920,1080,270,43.2]]){
 const referenceBounds=manifest.bounds[0],bw=referenceBounds[2]-referenceBounds[0],bh=referenceBounds[3]-referenceBounds[1],oldHeight=height-top-bottom,short=oldHeight<600,oldScale=Math.min(width*(width<=1000?1:.7)/bw,oldHeight*(short?.68:.85)/bh);
 for(const ratio of[1,2]){
  let introScale;
  for(let i=0;i<manifest.count;i++){
   const progress=i/(manifest.count-1),bounds=manifest.bounds[i],state=heroState(progress),rect=frameRectangle({width:width*ratio,height:height*ratio,imageWidth:manifest.dimensions?.[i]?.[0]||manifest.width,imageHeight:manifest.dimensions?.[i]?.[1]||manifest.height,bounds,referenceBounds,push:state.push,progress,viewportWidth:width,pixelRatio:ratio,compact:width<=1000});
   const scale=rect.width/(manifest.dimensions?.[i]?.[0]||manifest.width)/ratio;
   if(i===0){introScale=scale;assert(Math.abs(scale-oldScale)<1e-8,'Opening size must match the approved size.');const center=(rect.y+(bounds[1]+bounds[3])*.5*scale*ratio)/ratio;assert(Math.abs(center-(top+oldHeight*(short?.58:.48)))<1e-7,'Opening position must stay the same.');}
   assert(scale>=introScale*.999999,'Opening the case must not shrink its render scale.');assert(scale<=introScale*1.036,'Only a subtle final approach is needed.');assert((bounds[2]-bounds[0])*scale>=bw*introScale*.94,'Orbiting should preserve the case visual width.');
   assert(Object.values(rect).every(Number.isFinite));
   const left=rect.x/ratio+bounds[0]*scale,right=rect.x/ratio+bounds[2]*scale;assert(left>=-width*.25&&right<=width*1.25,'The full-stage case may crop softly at the edges, without leaving the composition.');
  }
 }
}
console.log('PASS: approved opening size/position, no shrinking across all 141 frames, subtle approach, phone/desktop framing and DPR 1/2.');
