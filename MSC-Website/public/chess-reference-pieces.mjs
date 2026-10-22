import * as T from './vendor/three/three.module.min.js';
import {sculptedKnightGeometry} from './knight-sculpture.mjs';
export {pieceHeights} from './chess-dimensions.mjs';
const cache=new Map(),TAU=2*Math.PI;
const geometry=(key,build)=>{if(!cache.has(key))cache.set(key,build());return cache.get(key);};
const dimensions={pawn:{r:.275,b:.245,neck:.555,c:.17},rook:{r:.30,b:.29,neck:.73,c:.185},knight:{r:.34,b:.30},bishop:{r:.31,b:.31,neck:.685,c:.185},queen:{r:.33,b:.33,neck:.84,c:.205},king:{r:.36,b:.355,neck:.85,c:.215}};
// Tiny rounded corners preserve the crisp turned steps without faceted edges.
function profile(points,round=.003){
 points=points.filter((p,i)=>i===0||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>1e-9);
 const result=[new T.Vector2(...points[0])];
 for(let i=1;i<points.length-1;i++){
  const a=new T.Vector2(...points[i-1]),b=new T.Vector2(...points[i]),c=new T.Vector2(...points[i+1]);
  const cut=Math.min(round,a.distanceTo(b)*.23,b.distanceTo(c)*.23),start=b.clone().lerp(a,cut/a.distanceTo(b)),end=b.clone().lerp(c,cut/b.distanceTo(c));
  result.push(start);for(let j=1;j<=3;j++){const t=j/3;result.push(start.clone().multiplyScalar((1-t)**2).addScaledVector(b,2*(1-t)*t).addScaledVector(end,t*t));}
 }
 result.push(new T.Vector2(...points.at(-1)));return result;
}
const lathe=(points,round=.003)=>new T.LatheGeometry(profile(points,round),128);
function turnedBase(type){
 const {r,b,neck,c}=dimensions[type];
 const points=[[0,.014],[r*.86,.014],[r*.965,.022],[r,.035],[r,.052],[r*.965,.068],[r*.80,.082],[r*.775,.105],[r*.85,.128],[r*.90,.145],[r*.90,.163],[r*.85,.177],[r*.69,.197],[r*.69,b*.72],[r*.79,b*.76],[r*.79,b*.80],[r*.68,b*.84],[r*.78,b*.87],[r*.78,b*.91],[r*.67,b*.94],[r*.69,b*.98],[r*.60,b*1.025]];
 const knee=.197;for(let i=13;i<points.length;i++)points[i][1]=knee+(points[i][1]-b*.72)*((b-knee)/(b*.305));
 const shape=new T.Shape();for(const [i,p]of profile(points).entries())i?shape.lineTo(p.x,p.y):shape.moveTo(p.x,p.y);
 if(type==='knight'){shape.quadraticCurveTo(.19,.315,.17,.33);shape.lineTo(0,.33);}
 else{
  const thin=type==='pawn'?.071:type==='rook'?.105:type==='bishop'?.080:.093;
  shape.bezierCurveTo(r*.33,b+.09,thin,neck-.18,thin,neck-.055);
  shape.quadraticCurveTo(thin,neck-.022,c*.82,neck-.022);
  shape.quadraticCurveTo(c*1.025,neck-.020,c,neck+.003);
  shape.quadraticCurveTo(c*.96,neck+.020,c*.68,neck+.027);shape.lineTo(0,neck+.027);
 }
 return new T.LatheGeometry(shape.getPoints(24),96);
}
function collar(y,r){return lathe([[0,y],[r*.65,y],[r*.94,y+.007],[r,y+.016],[r,y+.029],[r*.94,y+.038],[r*.64,y+.045],[0,y+.045]],.0025);}
function royalCup(type){
 if(type==='king')return lathe([[0,.91],[.105,.91],[.18,.925],[.182,.945],[.15,.96],[.13,.98],[.14,1.015],[.18,1.08],[.205,1.14],[.214,1.18],[.206,1.215],[.18,1.24],[.125,1.25],[.125,1.266],[0,1.266]],.008);
 return lathe([[0,.90],[.10,.90],[.145,.925],[.13,.95],[.12,.985],[.13,1.05],[.16,1.10],[.18,1.13],[.18,1.15],[0,1.15]],.005);
}
function radialSurface(rows,segments=160){
 const positions=[],uv=[],indices=[];
 for(let j=0;j<rows.length;j++)for(let i=0;i<=segments;i++){
  const angle=i/segments*TAU,[r,y]=rows[j](angle);positions.push(Math.sin(angle)*r,y,Math.cos(angle)*r);uv.push(i/segments,j/(rows.length-1));
  if(j<rows.length-1&&i<segments){const k=j*(segments+1)+i;indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function queenCoronet(){
 const top=a=>1.185+.026*Math.cos(a*10),radius=a=>.208+.018*Math.cos(a*10);
 return radialSurface([()=>[.13,1.105],a=>[radius(a)-.02,1.13],a=>[radius(a),top(a)-.012],a=>[radius(a),top(a)],a=>[radius(a)-.023,top(a)+.002],a=>[radius(a)-.035,top(a)-.015],()=>[.09,1.145],()=>[0,1.145]],200);
}
function rookCrown(){
 const rows=[[0,.76],[.12,.76],[.19,.77],[.218,.79],[.228,.82],[.23,.915],[.173,.915],[.16,.86],[.12,.85],[0,.85]];
 const result=new T.Group();result.add(new T.Mesh(lathe(rows,.003)));const n=8,span=TAU/n*.66;
 for(let i=0;i<n;i++){
  const points=[];for(let j=0;j<=12;j++){const a=-span/2+j/12*span;points.push(new T.Vector2(Math.sin(a)*.23,Math.cos(a)*.23));}for(let j=12;j>=0;j--){const a=-span/2+j/12*span;points.push(new T.Vector2(Math.sin(a)*.173,Math.cos(a)*.173));}
  const shape=new T.Shape(points),g=new T.ExtrudeGeometry(shape,{depth:.070,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:.003,bevelThickness:.003,curveSegments:12});g.rotateX(-Math.PI/2);g.translate(0,.912,0);g.rotateY(i*TAU/n);result.add(new T.Mesh(g));
 }
 return result;
}
const bishopProfile=(()=>{const p=new T.Shape();p.moveTo(0,.796);p.lineTo(.078,.796);p.bezierCurveTo(.166,.798,.195,.844,.166,.899);p.bezierCurveTo(.144,.946,.074,1.015,.042,1.103);p.bezierCurveTo(.031,1.143,.025,1.168,.025,1.188);p.lineTo(0,1.188);return p.getPoints(36).map(p=>[p.x,p.y]);})();
function bishopRadius(y){for(let i=1;i<bishopProfile.length;i++){const a=bishopProfile[i-1],b=bishopProfile[i];if(y>=a[1]&&y<=b[1]&&a[1]!==b[1])return T.MathUtils.lerp(a[0],b[0],(y-a[1])/(b[1]-a[1]));}return 0;}
function bishopHead(){
 const head=new T.LatheGeometry(bishopProfile.map(p=>new T.Vector2(...p)),112).toNonIndexed(),p=head.attributes.position,n=head.attributes.normal,uv=head.attributes.uv,positions=[],normals=[],uvs=[];
 const bottom=.946,slope=.36,half=.0105,line=y=>.012+slope*(y-.96);
 const clip=(poly,fn)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=fn(a.p),db=fn(b.p);if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push({p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize(),uv:a.uv.clone().lerp(b.uv,t)});}}return out;};
 const append=poly=>{for(let j=1;j<poly.length-1;j++)for(const v of[poly[0],poly[j],poly[j+1]]){positions.push(...v.p.toArray());normals.push(...v.n.toArray());uvs.push(...v.uv.toArray());}};
 for(let i=0;i<p.count;i+=3){const tri=[0,1,2].map(j=>({p:new T.Vector3().fromBufferAttribute(p,i+j),n:new T.Vector3().fromBufferAttribute(n,i+j),uv:new T.Vector2().fromBufferAttribute(uv,i+j)}));append(clip(tri,v=>bottom-v.y));const upper=clip(tri,v=>v.y-bottom);for(const side of[-1,1])append(clip(upper,v=>side*(v.x-line(v.y))-half));}
 for(const side of[-1,1]){let lo=1.02,hi=1.188;for(let k=0;k<40;k++){const y=(lo+hi)/2;if(bishopRadius(y)>Math.abs(line(y)+side*half))lo=y;else hi=y;}const end=(lo+hi)/2;
  for(let j=0;j<90;j++){const wall=[];for(const [dy,dz]of[[0,-1],[1,-1],[1,1],[0,1]]){const y=bottom+(j+dy)/90*(end-bottom),x=line(y)+side*half,z=dz*Math.sqrt(Math.max(0,bishopRadius(y)**2-x*x));wall.push({p:new T.Vector3(x,y,z),n:new T.Vector3(-side,slope*side,0).normalize(),uv:new T.Vector2(z*3,y)});}append(side>0?wall.reverse():wall);}
 }
 const floor=[];for(const[dx,dz]of[[0,-1],[1,-1],[1,1],[0,1]]){const x=line(bottom)+(dx*2-1)*half,z=dz*Math.sqrt(Math.max(0,bishopRadius(bottom)**2-x*x));floor.push({p:new T.Vector3(x,bottom,z),n:new T.Vector3(0,1,0),uv:new T.Vector2(x,z)});}append(floor.reverse());
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));return g;
}
function kingCross(){
 const s=new T.Shape();s.moveTo(-.079,1.374);s.quadraticCurveTo(-.041,1.414,-.039,1.452);s.lineTo(-.039,1.493);s.quadraticCurveTo(-.048,1.535,-.081,1.562);s.quadraticCurveTo(0,1.587,.081,1.562);s.quadraticCurveTo(.048,1.535,.039,1.493);s.lineTo(.039,1.452);s.quadraticCurveTo(.041,1.414,.079,1.374);s.quadraticCurveTo(0,1.346,-.079,1.374);
 const g=new T.ExtrudeGeometry(s,{depth:.067,bevelEnabled:true,bevelSegments:5,bevelThickness:.006,bevelSize:.006,curveSegments:18});g.translate(0,0,-.0335);return g;
}
const horsePoint=(x,y,z=0)=>new T.Vector3((x-1020)*.00396,(375-y)*.00396+.30,z);
function tube(points,r=.008){return new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(24,points.length*10),r,8,false);}
export function createCarvedPiece(type,material,cut){
 if(!dimensions[type])throw Error(`Unknown chess piece: ${type}`);
 const group=new T.Group();group.name=`Reference Staunton ${type}`;
 const add=(parent,key,build,mat=material,x=0,y=0,z=0)=>{const mesh=new T.Mesh(geometry(key,build),mat);mesh.name=key;mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 add(group,`staunton-turned-${type}`,()=>turnedBase(type));const d=dimensions[type];add(group,`felt-${type}`,()=>new T.CylinderGeometry(d.r*.88,d.r*.88,.012,80),cut,0,.012,0);
 if(type==='pawn'){add(group,'pawn-round-head',()=>new T.SphereGeometry(.139,64,40),material,0,.755,0);add(group,'pawn-head-seat',()=>collar(.585,.144));}
 if(type==='rook'){const crown=rookCrown();crown.traverse(o=>{if(o.isMesh){o.material=material;o.name='rook-eight-crenel-crown';o.castShadow=o.receiveShadow=true;}});group.add(crown);}
 if(type==='bishop'){
  add(group,'bishop-double-collar',()=>collar(.718,.19));add(group,'bishop-neck-ring',()=>collar(.763,.125));const head=add(group,'bishop-slotted-teardrop',bishopHead);head.rotation.y=-70*Math.PI/180;add(group,'bishop-rounded-finial',()=>new T.SphereGeometry(.037,48,32),material,0,1.222,0);
 }
 if(type==='queen'||type==='king'){
  add(group,`${type}-lower-collar`,()=>collar(d.neck+.035,d.c));add(group,`${type}-upper-collar`,()=>collar(d.neck+.083,d.c*.91));add(group,`${type}-sculpted-cup`,()=>royalCup(type));
  if(type==='queen'){
   add(group,'queen-ten-petal-coronet',queenCoronet);add(group,'queen-domed-cap',()=>lathe([[0,1.145],[.115,1.145],[.104,1.18],[.078,1.207],[.047,1.225],[0,1.225]],.005));add(group,'queen-top-orb',()=>new T.SphereGeometry(.042,48,32),material,0,1.269,0);add(group,'queen-pointed-finial',()=>lathe([[0,1.30],[.026,1.30],[.029,1.315],[.016,1.35],[.009,1.39],[0,1.416]],.003));
  }else{
   add(group,'king-neck-rings',()=>collar(1.266,.13));add(group,'king-cross-seat',()=>collar(1.312,.094));const cross=new T.Group();cross.rotation.y=-70*Math.PI/180;group.add(cross);add(cross,'king-scalloped-cross',kingCross);const bar=add(cross,'king-crossbar',()=>new T.CylinderGeometry(.022,.022,.19,32),material,0,1.472,0);bar.rotation.z=Math.PI/2;for(const side of[-1,1])add(cross,'king-rounded-cross-arm',()=>new T.SphereGeometry(.041,48,32),material,side*.095,1.472,0);add(group,'king-cross-top',()=>collar(1.573,.05));add(group,'king-top-finial',()=>new T.SphereGeometry(.025,40,28),material,0,1.638,0);
  }
 }
 if(type==='knight'){
  const horse=new T.Group();horse.name='Carved arched horse with bridle';horse.rotation.y=-Math.PI/2;group.add(horse);add(horse,'knight-reference-sculpture',sculptedKnightGeometry);
  for(const side of[-1,1]){
   const strap=[[1063,184,.050],[1064,202,.085],[1071,226,.111],[1083,253,.079],[1093,273,.050]].map(([x,y,z])=>horsePoint(x,y,z*side));add(horse,`knight-cheek-bridle-${side}`,()=>tube(strap,.007));
   const nose=[[1082,259,.073],[1092,260,.060],[1102,266,.048]].map(([x,y,z])=>horsePoint(x,y,z*side));add(horse,`knight-noseband-${side}`,()=>tube(nose,.0075));
   const rein=[[1093,274,.050],[1061,295,.075],[1028,318,.117],[990,342,.103],[956,361,.065]].map(([x,y,z])=>horsePoint(x,y,z*side));add(horse,`knight-sweeping-rein-${side}`,()=>tube(rein,.007));
  }
 }
 return group;
}
