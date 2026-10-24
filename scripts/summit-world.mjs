// Original continuous alpine route. Video frames and stop stills share this world.
import * as T from '../public/vendor/three/three.module.min.js';
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const random=n=>{const v=Math.sin(n*127.1+71.7)*43758.5453;return v-Math.floor(v);};
const smooth=t=>t*t*(3-2*t),lerp=T.MathUtils.lerp;
function noise(x,z){const a=Math.floor(x),b=Math.floor(z),u=smooth(x-a),v=smooth(z-b),h=(i,j)=>random(i+j*311.7);return lerp(lerp(h(a,b),h(a+1,b),u),lerp(h(a,b+1),h(a+1,b+1),u),v);}
const fbm=(x,z)=>noise(x,z)*.56+noise(x*2.1+7,z*2.1+11)*.26+noise(x*4.2+23,z*4.2+29)*.12+noise(x*8.3+4,z*8.3+21)*.06;
export const trailX=z=>{const u=(55-z)/120;return 6*Math.sin(u*Math.PI*2)*Math.sin(u*Math.PI)-18*smooth(clamp((u-.6)/.4));};
const routeGround=z=>{const q=(55-z)/120;return -2+56*clamp(q)-Math.max(0,q-1)*60;};
function rawHeight(x,z){
 const q=clamp((55-z)/120),ridge=(routeGround(z)+4)*Math.exp(-Math.pow(Math.abs(x)/65,1.6));
 const folds=(fbm(x*.06+40,z*.055+20)-.5)*(5+q*8);
 const crags=(1-Math.abs(noise(x*.12+z*.04,z*.10)*2-1))*(1+q*2.5);
 const rightWall=42*Math.exp(-Math.pow((x-40)/18,2)-Math.pow((z+15)/34,2))*(.55+fbm(x*.13,z*.12));
 return -4+ridge+folds+crags+rightWall+(noise(x*1.1,z*.9)-.5)*.13;
}
export function terrainHeight(x,z){const tx=trailX(z),d=Math.abs(x-tx),flat=Math.exp(-Math.pow(d/4.5,4));return lerp(rawHeight(x,z),routeGround(z)+d*d*.025,flat*.999);}
// Spatial filtering removes footstep-height jitter; yaw/pitch follow broad curves.
const groundAt=u=>{const z=55-clamp(u)*120;return terrainHeight(trailX(z),z);};
const filteredGround=u=>{let y=0,w=0;for(let i=-6;i<=6;i++){const weight=Math.exp(-i*i/8);y+=groundAt(u+i*.006)*weight;w+=weight;}return y/w;};
const clearance=(()=>{let d=0;for(let i=0;i<=600;i++)d=Math.max(d,groundAt(i/600)-filteredGround(i/600));return d+1.85;})();
export function routePose(u){
 u=clamp(u);const z=55-u*120,x=trailX(z),position=new T.Vector3(x,filteredGround(u)+clearance,z);
 const yaw=.05*Math.sin(Math.PI*u)+.55*smooth(clamp((u-.50)/.50)),pitch=lerp(.38,-.10,smooth(clamp((u-.62)/.38))),forward=new T.Vector3(0,0,-1).applyAxisAngle(new T.Vector3(0,1,0),yaw),look=position.clone().add(new T.Vector3(forward.x*18,pitch*18,forward.z*18));
 return {position,look,u};
}

export function createSummitWorld(){
 const group=new T.Group(),nx=900,nz=750,p=[],n=[],uv=[],c=[],masks=[],index=[];
 const surface=(x,z)=>{const d=Math.abs(x-trailX(z)),edge=smooth(clamp((d-1.1)/1.6));return terrainHeight(x,z)+(fbm(x*2.8,z*2.8)-.5)*.095+(noise(x*1.1,z*1.1)-.5)*.46*edge+Math.pow(noise(x*.8+43,z*.8),3)*.22*edge;};
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  const x=-150+300*i/nx,z=-175+250*j/nz,y=surface(x,z),dx=(surface(x+.04,z)-surface(x-.04,z))/.08,dz=(surface(x,z+.04)-surface(x,z-.04))/.08,normal=new T.Vector3(-dx,1,-dz).normalize(),d=Math.abs(x-trailX(z)),path=Math.exp(-Math.pow(d/1.15,4));
  const snow=clamp(.25+(y-12)*.022+(normal.y-.65)*1.7+(fbm(x*.15+10,z*.15+20)-.5)*1.5)*(1-path*.96);
  const tint=new T.Color('#879193').lerp(new T.Color('#777269'),path*.7);p.push(x,y,z);n.push(normal.x,normal.y,normal.z);uv.push(x-trailX(z),z);c.push(tint.r,tint.g,tint.b);masks.push(snow);
 }
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;index.push(a,c,b,b,c,d);}
 const geo=new T.BufferGeometry();for(const [key,data,size]of[['position',p,3],['normal',n,3],['uv',uv,2],['color',c,3],['snow',masks,1]])geo.setAttribute(key,new T.Float32BufferAttribute(data,size));geo.setIndex(index);
 const terrain=new T.Mesh(geo,new T.MeshStandardMaterial({color:'#ffffff',roughness:1}));terrain.userData={type:'ground',texture:'granite.webp'};terrain.name='Continuous granite and snow mountain';group.add(terrain);
 // Twelve fractured geological meshes, each with its own intersecting planes.
 const stoneGeos=Array.from({length:12},(_,seed)=>{
  const g=new T.SphereGeometry(1,80,56),a=g.attributes.position,planes=[];
  for(const axis of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])planes.push({n:new T.Vector3(...axis),d:.58+random(seed*123+planes.length)*.36});
  for(let k=0;k<12;k++){const n=new T.Vector3(random(seed*71+k*3)-.5,random(seed*73+k*3+1)-.5,random(seed*79+k*3+2)-.5).normalize();planes.push({n,d:.67+random(seed*59+k)*.3});}
  for(let i=0;i<a.count;i++){
   const v=new T.Vector3().fromBufferAttribute(a,i).normalize();let r=10;
   for(const plane of planes){const dot=plane.n.dot(v);if(dot>.001)r=Math.min(r,plane.d/dot);}
   const relief=(fbm(v.x*5+seed,v.z*5+v.y*3)-.5)*.10+Math.sin(v.y*23+v.x*4)*.013+(fbm(v.x*38+seed,v.z*38+v.y*9)-.5)*.014;
   a.setXYZ(i,v.x*(r+relief),v.y*(r+relief)*(.8+seed%3*.14),v.z*(r+relief));
  }g.computeVertexNormals();return g;
 });
 const stoneGeo=stoneGeos[0];
 const stoneMat=new T.MeshStandardMaterial({color:'#9da4a7',roughness:1});
 for(let i=0;i<700;i++){
  const z=66-random(i+90)*165,side=i%2?-1:1,d=2.3+Math.pow(random(i+100),1.5)*34,x=trailX(z)+side*d,s=.16+Math.pow(random(i+101),3)*2.3;
  const mesh=new T.Mesh(stoneGeos[i%stoneGeos.length],stoneMat);mesh.position.set(x,surface(x,z)-s*.15,z);mesh.scale.set(s,s*(.65+random(i+103)*.6),s*(.7+random(i+107)*.6));mesh.rotation.set(random(i+109)*.5,random(i+113)*6.28,random(i+117)*.25);mesh.userData={type:'rock',snow:clamp(.18+(mesh.position.y-15)*.015),variant:i%12};group.add(mesh);
 }
 // Split, weathered towers on the right form a tangible cliff along the trail.
 for(let i=0;i<28;i++){
  const z=30-random(i+3000)*135,x=trailX(z)+9+random(i+3010)*43,s=2+random(i+3020)*4,mesh=new T.Mesh(stoneGeos[i%stoneGeos.length],stoneMat);
  mesh.position.set(x,surface(x,z)+s*.4,z);mesh.scale.set(s*.9,s*(1.0+random(i+3030)*.5),s*.65);mesh.rotation.set(0,random(i+3040)*3,.12*(random(i+3050)-.5));mesh.userData={type:'rock',snow:.35,variant:i%12};group.add(mesh);
 }
 for(let i=0;i<440;i++){
  const z=56-random(i+900)*122,x=trailX(z)+(random(i+910)-.5)*3.5,s=.025+random(i+920)*.12,mesh=new T.Mesh(stoneGeos[i%stoneGeos.length],stoneMat);mesh.position.set(x,surface(x,z)+s*.2,z);mesh.scale.set(s,s*.5,s*.8);mesh.rotation.y=random(i+930)*6.28;mesh.userData={type:'rock',snow:0};group.add(mesh);
 }
 // Real three-dimensional conifers with radial, irregular needle boughs.
 const trees=[];
 for(let variant=0;variant<5;variant++){
  const points=[],uvs=[],colors=[];
  const push=(v,uv,color)=>{points.push(...v);uvs.push(...uv);colors.push(...color);};
  for(let ring=0;ring<12;ring++)for(let branch=0;branch<6;branch++){
   if(random(variant*839+ring*11+branch)<.10)continue;
   const y=.8+ring*.72+(random(variant*137+ring)-.5)*.18,angle=branch/6*Math.PI*2+ring*1.17+variant*.36+(random(ring*71+branch)-.5)*.45,len=Math.pow(1-ring/13,.85)*(2.1+random(variant*71+ring*11+branch)*.7)*(.7+random(ring*73+branch+variant)*.5),width=len*.43,tipY=y-.15-.16*len;
   const out=new T.Vector3(Math.cos(angle),0,Math.sin(angle)),side=new T.Vector3(-out.z,0,out.x),shade=.76+random(ring*59+branch+variant*107)*.27;
   // Two bent cards give each bough real depth from both walking directions.
   for(let tilt=0;tilt<2;tilt++){
    const corners=[[-.21,0], [.21,0],[-width,len],[width,len]].map(([w,l])=>out.clone().multiplyScalar(l).addScaledVector(side,w).add(new T.Vector3(0,y+(l/len)*(tipY-y)+(tilt?l*.45:0),0)).toArray());
    for(const [idx,uv]of[[0,[0,0]],[1,[1,0]],[2,[0,1]],[1,[1,0]],[3,[1,1]],[2,[0,1]]])push(corners[idx],uv,[shade,shade,shade]);
   }
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();trees.push(g);
 }
 const firMat=new T.MeshStandardMaterial({color:'#ffffff',side:T.DoubleSide}),trunkGeo=new T.CylinderGeometry(.055,.2,9.3,20,12),trunkMat=new T.MeshStandardMaterial({color:'#605547'});
 const trunkPositions=trunkGeo.attributes.position;
 for(let i=0;i<trunkPositions.count;i++){const x=trunkPositions.getX(i),z=trunkPositions.getZ(i),y=trunkPositions.getY(i),angle=Math.atan2(z,x),factor=1+Math.sin(angle*7+y*.4)*.085+Math.sin(angle*13-y*2)*.035+Math.exp(-(y+4.65)*2)*(.20+.25*Math.sin(angle*5));trunkPositions.setXYZ(i,x*factor,y,z*factor);}trunkGeo.computeVertexNormals();
 for(let i=0;i<155;i++){
  const z=80-random(i+5100)*115,x=trailX(z)+(i%2?-1:1)*(8+random(i+5110)*60),scale=.75+random(i+5120)*.64;
  if(z<-12&&random(i+5130)<.75)continue;
  const tree=new T.Mesh(trees[i%5],firMat);tree.position.set(x,surface(x,z)-.13,z);tree.rotation.y=random(i+5140)*6.28;tree.scale.set(scale,scale*(.86+random(i+5150)*.25),scale);tree.userData={type:'branch'};group.add(tree);
  const trunk=new T.Mesh(trunkGeo,trunkMat);trunk.position.copy(tree.position).add(new T.Vector3(0,4.65*tree.scale.y,0));trunk.scale.copy(tree.scale);trunk.userData={type:'bark'};group.add(trunk);
 }
 // Curved, segmented winter grasses: actual blade silhouettes and seed stalks.
 const grassP=[],grassC=[];
 const triangle=(a,b,c,color)=>{for(const v of[a,b,c]){grassP.push(...v);grassC.push(...color);}};
 for(let i=0;i<430;i++){
  const z=65-random(i+7100)*120,x=trailX(z)+(i%2?-1:1)*(1.25+Math.pow(random(i+7110),1.8)*8),y=surface(x,z)-.018,h=.18+random(i+7120)*.32;
  for(let blade=0;blade<17;blade++){
   const seed=i*23+blade,angle=random(seed+7200)*Math.PI*2,spread=random(seed+7290)*.14,bx=x+Math.sin(angle)*spread,bz=z+Math.cos(angle)*spread,lean=.13+random(seed+7300)*.3,height=h*(.35+random(seed+7310)*.75),width=.0025+random(seed+7320)*.0035;
   const point=(t,side)=>[bx+Math.sin(angle)*lean*t*t+Math.cos(angle)*width*side*(1-t),y+height*Math.sin(t*1.55),bz+Math.cos(angle)*lean*t*t-Math.sin(angle)*width*side*(1-t)];
   const tint=new T.Color('#94866a').lerp(new T.Color('#535b43'),random(seed+7380)*.65).toArray();
   for(let k=0;k<7;k++){const t=k/7,u=(k+1)/7;triangle(point(t,-1),point(t,1),point(u,-1),tint);triangle(point(t,1),point(u,1),point(u,-1),tint);}
   if(blade%7===0){const tip=point(.94,0);for(let k=0;k<5;k++){const q=k/5,stem=[tip[0],tip[1]+q*.045,tip[2]],tip2=[tip[0]+.013*(1-q),tip[1]+q*.045+.015,tip[2]+.008];triangle(stem,tip2,[tip2[0]-.005,tip2[1]-.002,tip2[2]+.004],tint);}}
  }
 }
 const grassG=new T.BufferGeometry();grassG.setAttribute('position',new T.Float32BufferAttribute(grassP,3));grassG.setAttribute('color',new T.Float32BufferAttribute(grassC,3));grassG.computeVertexNormals();const grass=new T.Mesh(grassG,firMat);grass.userData={type:'plain'};group.add(grass);
 // A continuous, fully modeled mountain range, not a magnified skyline image.
 const ridge=(x,z)=>{
  const wx=x+(fbm(x*.003+13,z*.003+9)-.5)*110,wz=z+(fbm(x*.003+65,z*.003+47)-.5)*75;
  let massif=-100;
  for(let layer=0;layer<3;layer++){
   const center=-430-layer*265+(noise(wx*.003+layer*13,layer*27)-.5)*150;
   const silhouette=.36+.42*noise(wx*.006+layer*31,layer*19)+.22*(1-Math.abs(noise(wx*.018+layer*71,layer*43)*2-1));
   const cross=Math.max(0,1-Math.abs(wz-center)/(175+layer*22));
   massif=Math.max(massif,-100+(210+layer*100)*silhouette*Math.pow(cross,1.15));
  }
  const ridgeNoise=(f,ox,oz)=>1-Math.abs(noise(wx*f+ox,wz*f+oz)*2-1);
  const relief=(ridgeNoise(.013,19,37)-.5)*42+(ridgeNoise(.034,91,7)-.5)*17+(ridgeNoise(.082,43,27)-.5)*5;
  return lerp(-90+(fbm(x*.018,z*.018)-.5)*35,massif+relief,smooth(clamp((-z-170)/100)));
 };
 const farP=[],farN=[],farC=[],farUV=[],farSnow=[],farI=[],fx=1000,fz=600;
 for(let j=0;j<=fz;j++)for(let i=0;i<=fx;i++){
  const x=-1200+2400*i/fx,z=-1250+1400*j/fz,y=ridge(x,z),dx=(ridge(x+.7,z)-ridge(x-.7,z))/1.4,dz=(ridge(x,z+.7)-ridge(x,z-.7))/1.4,N=new T.Vector3(-dx,1,-dz).normalize();
  farP.push(x,y,z);farN.push(N.x,N.y,N.z);farUV.push(x,z);farC.push(.61,.65,.70);
  const catchment=fbm(x*.026+61,z*.026+25);farSnow.push(clamp(.10+(y-30)*.0014+(N.y-.78)*1.9+(catchment-.5)*.85));
 }
 for(let j=0;j<fz;j++)for(let i=0;i<fx;i++){const a=j*(fx+1)+i,b=a+1,c=a+fx+1,d=c+1;farI.push(a,c,b,b,c,d);}
 const farGeo=new T.BufferGeometry();for(const [key,data,size]of[['position',farP,3],['normal',farN,3],['uv',farUV,2],['color',farC,3],['snow',farSnow,1]])farGeo.setAttribute(key,new T.Float32BufferAttribute(data,size));farGeo.setIndex(farI);farGeo.computeVertexNormals();
 const distant=new T.Mesh(farGeo,new T.MeshStandardMaterial({color:'#ffffff',roughness:1}));distant.userData={type:'distant'};distant.name='Native alpine ridgelines and snow gullies';group.add(distant);
 // Only atmosphere lives on the sky dome; every visible mountain is geometry.
 const backdrop=new T.SphereGeometry(900,96,48);const sky=new T.Mesh(backdrop,new T.MeshBasicMaterial({color:'#ffffff',side:T.DoubleSide}));sky.userData={type:'background'};sky.name='Procedural alpine atmosphere';group.add(sky);
 group.updateMatrixWorld(true);return group;
}
