import {frameRectangle} from './film-framing.mjs';
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>{const t=clamp(value);return t*t*t*(t*(t*6-15)+10);};
export const paperFlights=[{start:.15,end:.28,returnStart:.405,returnEnd:.475},{start:.49,end:.575,returnStart:.705,returnEnd:.775},{start:.79,end:.875}];
export function paperReveal(progress,index,count=141){
 if(index>0)return smooth((progress-paperFlights[index].start)/.014);
 const firstMissing=Math.ceil(paperFlights[index].start*(count-1)-1e-7);
 return clamp(progress*(count-1)-(firstMissing-1));
}
export function paperProgress(progress,index){const {start,end,returnStart,returnEnd}=paperFlights[index];if(returnStart&&progress>returnStart)return 1-clamp((progress-returnStart)/(returnEnd-returnStart));return clamp((progress-start)/(end-start));}
// Recover a paper's screen-space corners from the same cropped source and scale as the film.
export function projectedQuad(manifest,kind,index,pose,push,width,height,viewportWidth){
 const value=clamp(pose)*(manifest.count-1),lo=Math.floor(value),hi=Math.min(manifest.count-1,lo+1),mix=value-lo;
 const project=i=>{
  const [imageWidth,imageHeight]=manifest.dimensions[i];
  const rect=frameRectangle({width,height,imageWidth,imageHeight,bounds:manifest.bounds[i],referenceBounds:manifest.bounds[0],dock:manifest.docks[i],push,progress:pose,viewportWidth,pixelRatio:1,compact:viewportWidth<=1000});
  const corners=kind==='docks'?manifest.docks[i]:manifest.papers[i][index];
  return corners.map(([x,y])=>[rect.x+x*rect.width/imageWidth,rect.y+y*rect.height/imageHeight]);
 };
 const a=project(lo),b=project(hi);return a.map((point,i)=>point.map((v,j)=>v+(b[i][j]-v)*mix));
}
export const projectedPaper=(manifest,index,pose,...args)=>projectedQuad(manifest,'papers',index,pose,...args);
export const projectedDock=(manifest,pose,...args)=>projectedQuad(manifest,'docks',0,pose,...args);
// A homography keeps the paper registered to its four physical corners at takeoff.
export function quadMatrix(points,width,height){
 const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=points;
 const dx1=x1-x2,dx2=x3-x2,dy1=y1-y2,dy2=y3-y2,sx=x0-x1+x2-x3,sy=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1;
 const g=Math.abs(den)<1e-9?0:(sx*dy2-dx2*sy)/den,h=Math.abs(den)<1e-9?0:(dx1*sy-sx*dy1)/den;
 return [(x1-x0+g*x1)/width,(y1-y0+g*y1)/width,0,g/width,(x3-x0+h*x3)/height,(y3-y0+h*y3)/height,0,h/height,0,0,1,0,x0,y0,0,1];
}
export function flightQuad(source,destination,progress,stageHeight){
 const t=smooth(progress),arc=Math.sin(Math.PI*t);
 return source.map((point,i)=>[point[0]+(destination[i][0]-point[0])*t,point[1]+(destination[i][1]-point[1])*t-stageHeight*.045*arc]);
}
