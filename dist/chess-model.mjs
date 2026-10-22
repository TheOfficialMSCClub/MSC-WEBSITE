import * as T from './vendor/three/three.module.min.js';
import {RoundedBoxGeometry} from './vendor/three/RoundedBoxGeometry.js';
import {chessSurfaces} from './chess-materials.mjs';
import {createCarvedPiece} from './chess-pieces.mjs';
import {initialPieces,squarePosition} from './chess-state.mjs';
export function createChessModel(descriptors=initialPieces()){
 const group=new T.Group();group.name='MSC open board';
 const textures=chessSurfaces();
 const ivory=new T.MeshPhysicalMaterial({color:0xede2c9,map:textures.ivory,bumpMap:textures.ivory,bumpScale:.0018,roughness:.34,metalness:0,clearcoat:.22,clearcoatRoughness:.28});
 const burgundy=new T.MeshPhysicalMaterial({color:0x702b3e,map:textures.lacquer,bumpMap:textures.lacquer,bumpScale:.002,roughness:.32,metalness:0,clearcoat:.25,clearcoatRoughness:.28});
 const pale=new T.MeshPhysicalMaterial({color:0x756767,map:textures.wood,bumpMap:textures.wood,bumpScale:.003,roughness:.72,metalness:0,clearcoat:.045,clearcoatRoughness:.65,envMapIntensity:.38});
 const dark=new T.MeshPhysicalMaterial({color:0x421d2d,map:textures.wood,bumpMap:textures.wood,bumpScale:.003,roughness:.70,metalness:0,clearcoat:.045,clearcoatRoughness:.65,envMapIntensity:.38});
 const frame=new T.MeshPhysicalMaterial({color:0x3a2025,map:textures.wood,bumpMap:textures.wood,bumpScale:.004,roughness:.6,metalness:.015,clearcoat:.1,clearcoatRoughness:.5,envMapIntensity:.5});
 const trim=new T.MeshStandardMaterial({color:0xc5a267,roughness:.25,metalness:.82});
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
  const square=String.fromCharCode(97+file)+rank,pos=squarePosition(square),o=mesh(group,new RoundedBoxGeometry(.998,.055,.998,1,.003),((file+rank)%2===0)?pale:dark,pos.x,.015,pos.z);o.userData.square=square;const uv=o.geometry.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.24+file*.19,uv.getY(j)*.24+rank*.13);uv.needsUpdate=true;squares.push(o);
 }
 const pieces=[];
 for(const data of descriptors){
  const mat=data.color==='white'?ivory:burgundy,piece=createCarvedPiece(data.type,mat,cut),pos=squarePosition(data.square),homeYaw=data.color==='white'?0:Math.PI;
  piece.name=data.id;piece.userData={...data,homeYaw,frontYaw:0};piece.position.set(pos.x,.055,pos.z);piece.rotation.y=homeYaw;group.add(piece);pieces.push({mesh:piece,...data});
 }
 const haloMat=new T.MeshBasicMaterial({color:0xc7999d,transparent:true,opacity:.7,side:T.DoubleSide,depthWrite:false});
 const halos=[0,1].map(()=>{const o=new T.Mesh(new T.RingGeometry(.30,.37,48),haloMat);o.rotation.x=-Math.PI/2;o.position.y=.052;group.add(o);return o;});
 return {group,pieces,squares,halos,materials:[ivory,burgundy,pale,dark,frame,trim,cut,haloMat]};
}
