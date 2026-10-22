import * as T from './vendor/three/three.module.min.js';
import {sculptedKnightGeometry} from './knight-sculpture.mjs';
const geometryCache=new Map(),TAU=Math.PI*2;
const geometry=(key,build)=>{if(!geometryCache.has(key))geometryCache.set(key,build());return geometryCache.get(key);};
export const pieceHeights={pawn:1,rook:1.18,knight:1.55,bishop:1.54,queen:1.51,king:1.66};
function turned(type){
 const p=new T.Shape();p.moveTo(0,.025);p.lineTo(.23,.025);p.bezierCurveTo(.28,.025,.313,.04,.315,.085);p.bezierCurveTo(.32,.12,.30,.151,.276,.165);p.quadraticCurveTo(.266,.173,.248,.175);p.lineTo(.238,.185);p.quadraticCurveTo(.23,.197,.246,.205);p.quadraticCurveTo(.273,.212,.26,.232);p.quadraticCurveTo(.246,.254,.205,.267);
 if(type==='knight'){p.bezierCurveTo(.187,.28,.187,.30,.211,.318);p.quadraticCurveTo(.252,.34,.246,.367);p.quadraticCurveTo(.24,.399,.18,.414);p.lineTo(0,.414);}
 else{
  const top={pawn:.67,rook:.90,bishop:1.04,queen:1.12,king:1.24}[type];
  p.bezierCurveTo(.133,.32,.092,top-.23,.128,top-.13);p.bezierCurveTo(.139,top-.095,.211,top-.095,.218,top-.059);p.bezierCurveTo(.225,top-.028,.199,top-.006,.158,top+.005);p.quadraticCurveTo(.12,top+.02,.1,top+.042);p.lineTo(0,top+.042);
 }
 const g=new T.LatheGeometry(p.getPoints(16),112);const pos=g.attributes.position;
 // Very shallow carved flutes taper smoothly into the turned shoulders.
 if(type!=='pawn'&&type!=='knight'){const end={rook:.76,bishop:.90,queen:.98,king:1.10}[type];for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),r=Math.hypot(x,z);if(y>.28&&y<end&&r>.04){const weight=Math.pow(Math.sin((y-.28)/(end-.28)*Math.PI),2),factor=1+.12*weight*Math.cos(Math.atan2(x,z)*10);pos.setXYZ(i,x*factor,y,z*factor);}}g.computeVertexNormals();}
 return g;
}
function revolution(rows,segments=144){
 const positions=[],uv=[],indices=[];
 rows.forEach((row,j)=>{for(let i=0;i<=segments;i++){const angle=i/segments*TAU,[r,y]=row(angle);positions.push(Math.sin(angle)*r,y,Math.cos(angle)*r);uv.push(i/segments,j/(rows.length-1));if(j<rows.length-1&&i<segments){const k=j*(segments+1)+i;indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function crown(type){
 const rook=type==='rook',bottom=rook?.90:1.12,top=a=>rook?1.095+.068*T.MathUtils.smoothstep(Math.cos(a*6),-.2,.35):1.35+.055*Math.cos(a*7),r=rook?.238:.224;
 return revolution([()=>[.12,bottom],()=>[r-.025,bottom+.014],a=>[r+.008*Math.cos(a*(rook?12:14)),bottom+.045],a=>[r,top(a)-.012],a=>[r-.009,top(a)],a=>[r-.047,top(a)],a=>[r-.057,top(a)-.012],()=>[r-.057,bottom+.075],()=>[0,bottom+.075]],192);
}
// Petal relief, turned edges and tiny incised channels are modeled into continuous bands.
function carvedBand(radius,y,height,count,depth=.013){
 return revolution(Array.from({length:33},(_,j)=>angle=>{const t=j/32,u=Math.abs(T.MathUtils.euclideanModulo(angle*count/TAU+.5,1)-.5)*2,outline=Math.pow(Math.max(.00001,Math.sin(t*Math.PI)),.72),leaf=Math.sqrt(Math.max(0,1-(u/outline)**2))*Math.pow(Math.sin(t*Math.PI),.7),vein=Math.exp(-(u*u)/.006)*Math.pow(Math.sin(t*Math.PI),2),edge=Math.exp(-(((t-.08)/.06)**2))+Math.exp(-(((t-.92)/.06)**2));return[radius+Math.sin(t*Math.PI)*.008+depth*(leaf-.35*vein)+edge*.004,y+t*height];}),192);
}
function royalCap(){
 return revolution(Array.from({length:49},(_,i)=>angle=>{const t=i/48,y=1.235+t*.26,bulb=.10+.13*Math.sin(Math.PI*t),petal=Math.pow(Math.max(0,Math.cos(angle*10)),2)*Math.pow(Math.sin(Math.PI*t),.8);return[bulb+.025*petal,y];}),192);
}
function carvedFinial(){
 const p=new T.Shape();p.moveTo(0,1.455);p.lineTo(.075,1.455);p.quadraticCurveTo(.095,1.474,.064,1.495);p.bezierCurveTo(.05,1.51,.09,1.535,.073,1.56);p.quadraticCurveTo(.06,1.58,.035,1.59);p.quadraticCurveTo(.08,1.63,.025,1.65);p.quadraticCurveTo(0,1.66,0,1.66);return new T.LatheGeometry(p.getPoints(12),112);
}
function bishopHead(){
 const head=new T.LatheGeometry(Array.from({length:65},(_,i)=>{const t=i/64;return new T.Vector2(.184*Math.pow(Math.sin(t*Math.PI),.85)*(1-.24*t),1.055+t*.415);}),112).toNonIndexed(),p=head.attributes.position,n=head.attributes.normal,uv=head.attributes.uv,positions=[],normals=[],uvs=[];
 const clip=(polygon,fn)=>{const out=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],da=fn(a.p),db=fn(b.p),inside=da>=0;if(inside)out.push(a);if(inside!==(db>=0)){const t=da/(da-db);out.push({p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize(),uv:a.uv.clone().lerp(b.uv,t)});}}return out;};
 const append=poly=>{for(let j=1;j<poly.length-1;j++)for(const v of[poly[0],poly[j],poly[j+1]]){positions.push(...v.p.toArray());normals.push(...v.n.toArray());uvs.push(...v.uv.toArray());}};
 for(let i=0;i<p.count;i+=3){const tri=[0,1,2].map(j=>({p:new T.Vector3().fromBufferAttribute(p,i+j),n:new T.Vector3().fromBufferAttribute(n,i+j),uv:new T.Vector2().fromBufferAttribute(uv,i+j)}));append(clip(tri,v=>1.22-v.y));const upper=clip(tri,v=>v.y-1.22);for(const side of[-1,1])append(clip(upper,v=>side*(v.x-.64*(v.y-1.27))-.024));}
 // Actual same-material cut walls make a recessed mitre slit, rather than a painted stripe.
 const radius=y=>{const t=(y-1.055)/.415;return t<0||t>1?0:.184*Math.pow(Math.sin(t*Math.PI),.85)*(1-.24*t);};
 for(const side of[-1,1]){let lo=1.30,hi=1.47;for(let i=0;i<35;i++){const mid=(lo+hi)/2;if(radius(mid)>Math.abs(.64*(mid-1.27)+side*.024))lo=mid;else hi=mid;}const end=(lo+hi)/2;for(let j=0;j<70;j++){const wall=[];for(const [dy,dz]of[[0,-1],[1,-1],[1,1],[0,1]]){const y=1.22+(j+dy)/70*(end-1.22),x=.64*(y-1.27)+side*.024,z=dz*Math.sqrt(Math.max(0,radius(y)**2-x*x));wall.push({p:new T.Vector3(x,y,z),n:new T.Vector3(-side,.64*side,0).normalize(),uv:new T.Vector2((z+.16)*3,y)});}append(side>0?wall.reverse():wall);}}
 for(let j=0;j<32;j++){const floor=[];for(const[dx,dz]of[[0,-1],[1,-1],[1,1],[0,1]]){const y=1.22,x=.64*(y-1.27)-.024+(j+dx)/32*.048,z=dz*Math.sqrt(radius(y)**2-x*x);floor.push({p:new T.Vector3(x,y,z),n:new T.Vector3(0,1,0),uv:new T.Vector2(x,z)});}append(floor.reverse());}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));return g;
}
export function createCarvedPiece(type,material,cut){
 const group=new T.Group();group.name=`Sculpted ${type}`;const add=(parent,key,build,mat=material,x=0,y=0,z=0)=>{const mesh=new T.Mesh(geometry(key,build),mat);mesh.name=key;mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 add(group,`turned-${type}`,()=>turned(type));add(group,'base-leaf-relief',()=>carvedBand(.307,.055,.103,18,.025));add(group,'lower-guilloche',()=>carvedBand(.253,.205,.035,24,.007));add(group,'felt',()=>new T.CylinderGeometry(.263,.263,.018,80),cut,0,.022,0);
 const shoulder={pawn:.67,rook:.90,bishop:1.04,queen:1.12,king:1.24,knight:.36}[type];add(group,`shoulder-petals-${type}`,()=>carvedBand(type==='knight'?.231:.205,shoulder-.065,.043,18,.012));
 if(type==='pawn')add(group,'pawn-orb',()=>new T.SphereGeometry(.16,64,40),material,0,.831,0);
 if(type==='king'){add(group,'king-petal-dome',royalCap);add(group,'king-carved-finial',carvedFinial);}
 if(type==='queen'){add(group,'queen-coronet',()=>crown('queen'));add(group,'queen-finial',()=>new T.SphereGeometry(.062,48,32),material,0,1.44,0);}
 if(type==='rook')add(group,'rook-battlement',()=>crown('rook'));
 if(type==='bishop'){const mitre=add(group,'bishop-cut-mitre',bishopHead);mitre.rotation.y=-Math.PI*70/180;add(group,'bishop-finial',()=>new T.SphereGeometry(.031,40,28),material,0,1.501,0);}
 if(type==='knight'){
  const horse=new T.Group();horse.rotation.y=Math.PI/2;group.add(horse);add(horse,'knight-anatomical-sculpture',sculptedKnightGeometry);
  for(const side of[-1,1]){const eye=add(horse,'knight-eye',()=>new T.SphereGeometry(.009,24,16),cut,-.125,1.288,side*.104);eye.scale.z=.5;}
 }
 return group;
}
