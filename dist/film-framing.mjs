import {smooth} from './motion-math.mjs';
export function interpolateBounds(a,b,t){return a.map((v,i)=>v+(b[i]-v)*t);}
// Preserve the approved opening composition inside a full-stage canvas.
// Once the lid opens, retain the physical render scale rather than fitting a taller silhouette.
export function introComposition(viewportWidth,stageHeight){
 const mobile=viewportWidth<=760,tablet=viewportWidth<=1000,shortPhone=mobile&&stageHeight<=760;
 const top=mobile?(shortPhone?285:315):stageHeight*(tablet?.33:.25);
 const bottom=mobile?(shortPhone?110:125):stageHeight*(tablet?.06:.04);
 const height=Math.max(1,stageHeight-top-bottom),short=height<600;
 return {height,short,centerY:top+height*(short?.58:.48)};
}
export function frameRectangle({width,height,imageWidth,imageHeight,bounds,referenceBounds=bounds,push,progress,viewportWidth,pixelRatio,compact,fullStage=true,dock}){
 if(!fullStage){const bw=Math.max(1,bounds[2]-bounds[0]),bh=Math.max(1,bounds[3]-bounds[1]),short=height/pixelRatio<600,scale=Math.min(viewportWidth*pixelRatio*(compact?1:.70)/bw,height*(short?.68:.85)/bh);return{x:width*.5-(bounds[0]+bounds[2])*.5*scale,y:height*(short?.58:.48)-(bounds[1]+bounds[3])*.5*scale,width:imageWidth*scale,height:imageHeight*scale};}
 const stageHeight=height/pixelRatio,intro=introComposition(viewportWidth,stageHeight);
 const bw=Math.max(1,referenceBounds[2]-referenceBounds[0]),bh=Math.max(1,referenceBounds[3]-referenceBounds[1]);
 const scale=Math.min(viewportWidth*pixelRatio*(compact?1:.70)/bw,intro.height*pixelRatio*(intro.short?.68:.85)/bh)*(1+.035*smooth(progress,.58,.91));
 const cx=width*(.5+.02*push),cy=intro.centerY*pixelRatio+(height*.49-intro.centerY*pixelRatio)*push;
 let y=cy-(bounds[1]+bounds[3])*.5*scale;
 if(dock&&viewportWidth>1000){const top=Math.min(...dock.map(point=>point[1]))*scale+y;y+=Math.max(0,112*pixelRatio-top)*smooth(progress,.15,.28);}
 return {x:cx-(bounds[0]+bounds[2])*.5*scale,y,width:imageWidth*scale,height:imageHeight*scale};
}

// One compositor transform moves the rendered case and registered HTML paper together.
export function readingCamera(dock,width,height,amount,focus=dock){
 const xs=dock.map(p=>p[0]),ys=dock.map(p=>p[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
 const safeTop=width<=760?140:134,safeBottom=height-(width<=760?160:155),available=Math.max(200,safeBottom-safeTop);
 const targetScale=Math.max(1.12,Math.min(1.8,width*(width<=760?.9:.86)/Math.max(1,right-left),available*.88/Math.max(1,bottom-top)));
 const centerX=focus.reduce((sum,p)=>sum+p[0],0)/4,centerY=focus.reduce((sum,p)=>sum+p[1],0)/4;
 return{scale:1+(targetScale-1)*amount,x:(width*.5-centerX*targetScale)*amount,y:((safeTop+safeBottom)*.5-centerY*targetScale)*amount};
}
