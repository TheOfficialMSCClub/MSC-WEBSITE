import * as T from './vendor/three/three.module.min.js';
import {seeded} from './motion-math.mjs';
// Adjacent pieces share one boundary. Reverse traversal reverses the tab sign.
export function edgeSigns(column,row,columns,rows){
 const h=(c,r)=>seeded(r*columns+c+41)>.5?1:-1;
 const v=(c,r)=>seeded(r*(columns+1)+c+481)>.5?1:-1;
 return [row===0?0:h(column,row),column===columns-1?0:v(column+1,row),row===rows-1?0:-h(column,row+1),column===0?0:-v(column,row)];
}
export function puzzleShape(column,row,columns,rows,size=.82){
 const s=new T.Shape(),half=size/2,edges=edgeSigns(column,row,columns,rows);
 const points=[[-half,half],[half,half],[half,-half],[-half,-half],[-half,half]];
 s.moveTo(...points[0]);
 for(let e=0;e<4;e++){
  const [x,y]=points[e],[ex,ey]=points[e+1],dx=ex-x,dy=ey-y,nx=-dy,ny=dx,k=edges[e];
  const p=(t,n=0)=>[x+dx*t+nx*n*k,y+dy*t+ny*n*k];
  if(!k){s.lineTo(ex,ey);continue;}
  s.lineTo(...p(.34));s.bezierCurveTo(...p(.43,0),...p(.33,.18),...p(.5,.18));s.bezierCurveTo(...p(.67,.18),...p(.57,0),...p(.66));s.lineTo(ex,ey);
 }
 return s;
}
export function createPuzzleGeometry(column,row,columns,rows,dense=false){
 const g=new T.ExtrudeGeometry(puzzleShape(column,row,columns,rows),{depth:.055,bevelEnabled:true,bevelSegments:dense?1:2,steps:1,bevelSize:.009,bevelThickness:.009,curveSegments:dense?4:8});
 const position=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<position.count;i++)uv.setXY(i,(position.getX(i)+.82/2+column*.82)/(columns*.82),(position.getY(i)+.82/2+(rows-1-row)*.82)/(rows*.82));
 uv.needsUpdate=true;return g;
}

// 900 printed pieces use only a few dozen draw batches. Matching tab patterns
// share one bevelled shape; a per-instance atlas offset keeps the image seamless.
export function createPuzzleBatches(columns,rows,front,edge){
 const groups=new Map(),pieces=[];
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const key=edgeSigns(column,row,columns,rows).join(',');
  if(!groups.has(key))groups.set(key,[]);
  const item={index:row*columns+column,column,row,hover:0};groups.get(key).push(item);pieces.push(item);
 }
 front.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 instanceAtlas;');
  shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv=(vMapUv+instanceAtlas)/vec2(${columns.toFixed(1)},${rows.toFixed(1)});\n#endif`);
 };
 front.customProgramCacheKey=()=>`msc-puzzle-atlas-${columns}-${rows}`;
 const batches=[];
 for(const items of groups.values()){
  const first=items[0],g=createPuzzleGeometry(first.column,first.row,columns,rows,true),position=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<position.count;i++)uv.setXY(i,(position.getX(i)+.41)/.82,(position.getY(i)+.41)/.82);
  const atlas=new Float32Array(items.length*2);
  for(let i=0;i<items.length;i++){atlas[i*2]=items[i].column;atlas[i*2+1]=rows-1-items[i].row;}
  g.setAttribute('instanceAtlas',new T.InstancedBufferAttribute(atlas,2));
  const batch=new T.InstancedMesh(g,[front,edge],items.length);batch.instanceMatrix.setUsage(T.DynamicDrawUsage);batch.frustumCulled=false;batch.userData.pieceIndices=items.map(p=>p.index);
  for(let i=0;i<items.length;i++){items[i].batch=batch;items[i].slot=i;}
  batches.push(batch);
 }
 return {batches,pieces:pieces.sort((a,b)=>a.index-b.index)};
}
