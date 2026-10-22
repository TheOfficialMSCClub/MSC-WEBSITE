import fs from 'node:fs';
import * as T from '../dist/vendor/three/three.module.min.js';
import {createBriefcase} from '../dist/briefcase-model.mjs';
const {group,hinge}=createBriefcase();group.updateMatrixWorld(true);
const nodes=[],geometry={},materials={};
function add(o,parent=-1,override=null){
 const index=nodes.length;
 const entry={id:o.uuid,name:o.name||o.type,parent,matrix:(override||o.matrix).toArray()};
 if(o.isMesh){
  entry.geometry=o.geometry.uuid;entry.material=o.material.uuid;
  if(!geometry[entry.geometry])geometry[entry.geometry]={position:Array.from(o.geometry.attributes.position.array),normal:Array.from(o.geometry.attributes.normal.array),uv:o.geometry.attributes.uv?Array.from(o.geometry.attributes.uv.array):[],index:o.geometry.index?Array.from(o.geometry.index.array):null};
  if(!materials[entry.material]){const m=o.material;materials[entry.material]={color:m.color.toArray(),metalness:m.metalness,roughness:m.roughness,anisotropy:m.anisotropy||0,sheen:m.sheen||0};}
 }
 nodes.push(entry);
 if(o.isInstancedMesh){entry.geometry=null;entry.material=null;for(let i=0;i<o.count;i++){const matrix=new T.Matrix4();o.getMatrixAt(i,matrix);const mesh=new T.Mesh(o.geometry,o.material);mesh.name='Instanced detail';add(mesh,index,matrix);}}
 for(const c of o.children)add(c,index);return index;
}
add(group);
fs.writeFileSync(process.argv[2],JSON.stringify({nodes,geometry,materials,rootId:group.uuid,hingeId:hinge.uuid}));
console.log(`Exported ${nodes.length} model components.`);
