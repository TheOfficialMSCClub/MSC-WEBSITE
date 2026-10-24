import * as THREE from './vendor/three/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/three/RoundedBoxGeometry.js';

// Hollow construction, separate material finishes and instanced small hardware.
export function createBriefcase({grain,roughness,fabric,leather,insignia,liningMark}={}) {
  const group=new THREE.Group();group.name='MSC aluminium attaché';
  const metal=new THREE.MeshPhysicalMaterial({color:0xbfc2c4,metalness:1,roughness:.37,anisotropy:.62,anisotropyRotation:Math.PI/2,bumpMap:grain||null,bumpScale:.0035,roughnessMap:roughness||null,envMapIntensity:1.05});
  const edge=new THREE.MeshStandardMaterial({color:0xd6d8d8,metalness:1,roughness:.22,envMapIntensity:1.15});
  const recess=new THREE.MeshStandardMaterial({color:0x6d7174,metalness:.96,roughness:.43});
  const rubber=new THREE.MeshStandardMaterial({color:0x141313,roughness:.86,bumpMap:leather||null,bumpScale:.008});
  const velvet=new THREE.MeshPhysicalMaterial({color:0x571020,roughness:.97,metalness:0,sheen:.55,sheenColor:0x8d3346,sheenRoughness:.88,bumpMap:fabric||null,bumpScale:.006});
  const pocketMaterial=new THREE.MeshStandardMaterial({color:0x450d19,roughness:.97,bumpMap:fabric||null,bumpScale:.004});
  const thread=new THREE.MeshStandardMaterial({color:0x9a5b62,roughness:1});
  const box=(parent,w,h,d,material,x=0,y=0,z=0,r=.035)=>{
    const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),material);
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  };
  function contour(w,d,r){
    const p=new THREE.Shape(),x=-w/2,y=-d/2;
    p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);
    p.lineTo(x+w,y+d-r);p.quadraticCurveTo(x+w,y+d,x+w-r,y+d);
    p.lineTo(x+r,y+d);p.quadraticCurveTo(x,y+d,x,y+d-r);
    p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);return p;
  }
  function frame(parent,w,d,h,wall,material,y,r=.14){
    const shape=contour(w,d,r),hole=contour(w-wall*2,d-wall*2,Math.max(.02,r-wall*.6));
    shape.holes.push(new THREE.Path(hole.getPoints(7).reverse()));
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:h,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.006,bevelThickness:.004,curveSegments:7});
    geometry.rotateX(-Math.PI/2);geometry.translate(0,y-h/2,0);
    const mesh=new THREE.Mesh(geometry,material);parent.add(mesh);return mesh;
  }
  function instances(parent,geometry,material,points,normalOffset=0){
    const mesh=new THREE.InstancedMesh(geometry,material,points.length),dummy=new THREE.Object3D();
    for(let i=0;i<points.length;i++){
      const item=points[i],position=Array.isArray(item)?item:item.position;
      dummy.position.fromArray(position);dummy.rotation.set(...(item.rotation||[0,0,0]));
      dummy.translateY(normalOffset);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;parent.add(mesh);return mesh;
  }
  // Both halves share the same extrusion and rim footprint.
  const shellWidth=5.8,shellDepth=3.75,shellThickness=.50,rimWidth=5.84,rimDepth=3.79;
  const base=new THREE.Group();base.name='Recessed felt-lined base';group.add(base);
  frame(base,shellWidth,shellDepth,shellThickness,.13,metal,-.13);
  box(base,5.58,.075,3.53,metal,0,-.35,0,.025);
  box(base,5.49,.09,3.44,velvet,0,-.267,0,.025);
  frame(base,5.54,3.49,.33,.055,velvet,-.065,.09);
  frame(base,rimWidth,rimDepth,.065,.105,edge,.13);
  frame(base,5.77,3.72,.027,.042,rubber,.175);
  for(const y of [-.08,-.145,-.21])frame(base,5.812,3.762,.009,.018,recess,y);
  const hinge=new THREE.Group();hinge.name='Mechanical lid pivot';hinge.position.set(0,.205,-1.84);group.add(hinge);
  const lid=new THREE.Group();lid.position.set(0,.12,1.84);lid.name='Lid with document pocket';hinge.add(lid);
  frame(lid,shellWidth,shellDepth,shellThickness,.13,metal,.14);
  box(lid,5.59,.06,3.54,metal,0,.365,0,.025);
  frame(lid,rimWidth,rimDepth,.047,.105,edge,-.103);
  frame(lid,5.54,3.49,.10,.045,velvet,-.05,.08);
  box(lid,5.46,.026,3.41,velvet,0,.034,0,.012);
  box(lid,4.80,.034,.67,pocketMaterial,0,-.009,.99,.015);
  box(lid,4.81,.018,.025,thread,0,-.03,.665,.006);
  const channelPositions=[];for(let i=-11;i<=11;i++)if(Math.abs(i)>3)channelPositions.push([i*.228,.40,0]);
  instances(lid,new RoundedBoxGeometry(.015,.009,3.07,1,.003),edge,channelPositions);
  box(lid,1.8,.017,.66,edge,0,.408,-.06,.006);
  function label(texture,parent,w,d,y,z=0,underside=false){
    if(!texture)return;
    const material=new THREE.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,roughness:.65,metalness:underside?.1:.55});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material);
    mesh.rotation.x=underside?Math.PI/2:-Math.PI/2;mesh.position.set(0,y,z);parent.add(mesh);
  }
  label(insignia,lid,1.6,.53,.419,-.06);
  label(liningMark,lid,2.95,.78,.018,-.35,true);
  const screwHead=new THREE.CylinderGeometry(.023,.026,.014,10);
  const washerGeometry=new THREE.CylinderGeometry(.038,.038,.005,12);
  const slotGeometry=new THREE.BoxGeometry(.029,.0015,.005);
  const fasteners={base:[],lid:[]};
  const screw=(part,x,y,z,rx=0,rz=0)=>fasteners[part].push({position:[x,y,z],rotation:[rx,0,rz]});
  for(const x of [-2.73,2.73])for(const z of [-1.70,1.70]){
    box(base,.31,.19,.31,edge,x,-.29,z,.062);box(lid,.30,.10,.30,edge,x,.355,z,.035);
    screw('lid',x,.411,z);screw('base',x,-.184,z);
  }
  for(const x of [-2.56,-2.22,-1.4,-.92,.92,1.4,2.22,2.56]){
    screw('base',x,-.18,1.885,Math.PI/2);screw('base',x,-.18,-1.885,-Math.PI/2);screw('lid',x,.015,1.885,Math.PI/2);
  }
  for(const z of [-1.40,-.72,0,.72,1.40])for(const x of [-2.91,2.91])screw('base',x,-.19,z,0,x>0?-Math.PI/2:Math.PI/2);
  const levers=[];
  for(const x of [-1.76,1.76]){
    box(base,.37,.30,.052,recess,x,-.048,1.896,.025);box(base,.31,.25,.057,edge,x,-.04,1.924,.025);
    const lever=new THREE.Group();lever.position.set(x,.06,1.968);base.add(lever);levers.push(lever);
    box(lever,.20,.21,.044,edge,0,-.087,.012,.02);box(lever,.12,.11,.008,recess,0,-.09,.037,.014);
    const cylinder=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.018,18),edge);cylinder.rotation.x=Math.PI/2;cylinder.position.set(0,-.085,.05);lever.add(cylinder);
    box(lever,.008,.033,.002,rubber,0,-.085,.06,.001);
    box(lid,.30,.08,.067,edge,x,-.055,1.92,.02);box(lid,.18,.025,.025,recess,x,-.105,1.956,.008);
    for(const dx of [-.12,.12])screw('base',x+dx,-.13,1.96,Math.PI/2);
  }
  for(const x of [-.66,.66]){
    box(base,.25,.23,.065,edge,x,-.11,1.928,.035);box(base,.13,.11,.12,recess,x,-.11,1.993,.025);screw('base',x,-.16,1.973,Math.PI/2);
  }
  const handlePath=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.66,-.11,2.0),new THREE.Vector3(-.66,-.11,2.29),new THREE.Vector3(-.47,-.11,2.43),
    new THREE.Vector3(.47,-.11,2.43),new THREE.Vector3(.66,-.11,2.29),new THREE.Vector3(.66,-.11,2.0)
  ]);
  base.add(new THREE.Mesh(new THREE.TubeGeometry(handlePath,36,.059,8,false),recess));
  box(base,.96,.154,.17,rubber,0,-.11,2.43,.065);
  const gripPositions=[];for(let i=-6;i<=6;i++)gripPositions.push([i*.062,-.11,2.43]);
  instances(base,new RoundedBoxGeometry(.008,.159,.176,1,.003),recess,gripPositions);
  for(const x of [-1.70,1.70]){
    box(base,.70,.19,.045,recess,x,-.002,-1.90,.02);
    for(let i=-2;i<=2;i++){
      const cylinder=new THREE.Mesh(new THREE.CylinderGeometry(.073,.073,.112,12),i%2?recess:edge);
      cylinder.rotation.z=Math.PI/2;cylinder.position.set(x+i*.12,.205,-1.90);group.add(cylinder);
    }
    const pin=new THREE.Mesh(new THREE.CylinderGeometry(.027,.027,.68,10),edge);pin.rotation.z=Math.PI/2;pin.position.set(x,.205,-1.90);group.add(pin);
  }
  for(const x of [-2.4,2.4])for(const z of [-1.42,1.42])box(base,.27,.08,.27,rubber,x,-.414,z,.035);
  const baseStitches=[],lidStitches=[];
  for(let x=-2.48;x<2.5;x+=.11){baseStitches.push([x,-.218,-1.45],[x,-.218,1.45]);lidStitches.push([x,.017,-1.47],[x,.017,1.47]);}
  instances(base,new THREE.BoxGeometry(.047,.002,.007),thread,baseStitches);instances(lid,new THREE.BoxGeometry(.047,.002,.007),thread,lidStitches);
  for(const [part,parent]of[['base',base],['lid',lid]]){
    instances(parent,washerGeometry,recess,fasteners[part]);instances(parent,screwHead,edge,fasteners[part],.006);instances(parent,slotGeometry,rubber,fasteners[part],.014);
  }
  return {group,hinge,updateDetails(opening){for(const lever of levers)lever.rotation.x=opening*.38;}};
}
