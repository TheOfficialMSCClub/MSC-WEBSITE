import * as T from './vendor/three/three.module.min.js';
import {RoundedBoxGeometry} from './vendor/three/RoundedBoxGeometry.js';
import {chessSurfaces} from './chess-materials.mjs';
import {createCarvedPiece} from './chess-pieces.mjs';
import {initialPieces,squarePosition} from './chess-state.mjs';
export function createChessModel(descriptors=initialPieces()){
 const group=new T.Group();group.name='MSC open board';
 const textures=chessSurfaces();
 const ivory=new T.MeshPhysicalMaterial({color:0xede2c9,map:textures.ivory.color,bumpMap:textures.ivory.bump,roughnessMap:textures.ivory.roughness,bumpScale:.00065,roughness:.37,metalness:0,clearcoat:.48,clearcoatRoughness:.23});
 const burgundy=new T.MeshPhysicalMaterial({color:0x702b3e,map:textures.lacquer.color,bumpMap:textures.lacquer.bump,roughnessMap:textures.lacquer.roughness,bumpScale:.00075,roughness:.36,metalness:0,clearcoat:.52,clearcoatRoughness:.22});
 const pale=new T.MeshPhysicalMaterial({color:0xb4a08a,map:textures.wood.color,bumpMap:textures.wood.bump,roughnessMap:textures.wood.roughness,bumpScale:.0006,roughness:.53,metalness:0,clearcoat:.18,clearcoatRoughness:.40,envMapIntensity:.38});
 const dark=new T.MeshPhysicalMaterial({color:0x4c2b32,map:textures.wood.color,bumpMap:textures.wood.bump,roughnessMap:textures.wood.roughness,bumpScale:.0006,roughness:.51,metalness:0,clearcoat:.18,clearcoatRoughness:.40,envMapIntensity:.38});
 const frame=new T.MeshPhysicalMaterial({color:0x392922,map:textures.wood.color,bumpMap:textures.wood.bump,roughnessMap:textures.wood.roughness,bumpScale:.0008,roughness:.48,metalness:.015,clearcoat:.23,clearcoatRoughness:.36,envMapIntensity:.5});
 const trim=new T.MeshStandardMaterial({color:0xa88b5e,roughness:.38,metalness:.65});
 const cut=new T.MeshStandardMaterial({color:0x201d1b,roughness:.93});
 function mesh(parent,geometry,material,x=0,y=0,z=0){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 // A slim satin cabinet edge and clean continuous inlay; no dotted marquetry.
 mesh(group,new RoundedBoxGeometry(8.85,.22,8.85,3,.055),frame,0,-.15,0);
 mesh(group,new RoundedBoxGeometry(8.72,.045,8.72,3,.018),frame,0,-.018,0);
 for(const side of[-1,1]){
  for(const edge of[4.025,4.31]){mesh(group,new RoundedBoxGeometry(edge*2,.009,.012,1,.002),trim,0,.009,side*edge);mesh(group,new RoundedBoxGeometry(.012,.009,edge*2,1,.002),trim,side*edge,.009,0);}

 }

 mesh(group,new RoundedBoxGeometry(8.86,.035,8.86,3,.015),trim,0,-.245,0);
 mesh(group,new RoundedBoxGeometry(8.78,.045,8.78,3,.018),frame,0,-.28,0);
 mesh(group,new RoundedBoxGeometry(8.56,.018,8.56,2,.015),cut,0,-.312,0);
 const squares=[];for(let rank=1;rank<=8;rank++)for(let file=0;file<8;file++){
  const square=String.fromCharCode(97+file)+rank,pos=squarePosition(square),o=mesh(group,new RoundedBoxGeometry(.998,.055,.998,1,.003),((file+rank)%2===0)?pale:dark,pos.x,.015,pos.z);o.castShadow=false;o.userData.square=square;const uv=o.geometry.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,((file+rank)%2?uv.getX(j):uv.getY(j))*.32+file*.173,((file+rank)%2?uv.getY(j):uv.getX(j))*.32+rank*.137);uv.needsUpdate=true;squares.push(o);
 }
 const pieces=[];
 for(const data of descriptors){
  // Share textures, but isolate each piece's finish so a hover cannot tint its neighbours.
  const mat=(data.color==='white'?ivory:burgundy).clone(),baseColor=mat.color.clone(),hoverColor=new T.Color(data.color==='white'?0xfff8ec:0xab5b74),piece=createCarvedPiece(data.type,mat,cut),pos=squarePosition(data.square),homeYaw=data.color==='white'?0:Math.PI;
  // Soft cast shadows ground the set; avoid self-shadow speckling on fine turned details.
  piece.traverse(o=>{if(o.isMesh)o.receiveShadow=false;});
  piece.name=data.id;piece.userData={...data,homeYaw,frontYaw:0};piece.position.set(pos.x,.055,pos.z);piece.rotation.y=homeYaw;group.add(piece);pieces.push({mesh:piece,...data,material:mat,baseColor,hoverColor,hover:0,hoverTarget:0});
 }
 const haloMat=new T.MeshBasicMaterial({color:0xc7999d,transparent:true,opacity:.7,side:T.DoubleSide,depthWrite:false});
 const halos=[0,1].map(()=>{const o=new T.Mesh(new T.RingGeometry(.30,.37,48),haloMat);o.rotation.x=-Math.PI/2;o.position.y=.052;group.add(o);return o;});
 function tickHover(dt,immediate=false){let moving=false;for(const piece of pieces){piece.hover=immediate?piece.hoverTarget:T.MathUtils.lerp(piece.hover,piece.hoverTarget,1-Math.exp(-Math.min(dt,.05)*15));if(Math.abs(piece.hover-piece.hoverTarget)<.001)piece.hover=piece.hoverTarget;else moving=true;piece.material.color.lerpColors(piece.baseColor,piece.hoverColor,piece.hover);}return moving;}
 function setHoveredPiece(id,immediate=false){for(const piece of pieces)piece.hoverTarget=piece.id===id?1:0;if(immediate)tickHover(0,true);}
 return {group,pieces,squares,halos,setHoveredPiece,tickHover,materials:[ivory,burgundy,pale,dark,frame,trim,cut,haloMat,...pieces.map(p=>p.material)]};
}
