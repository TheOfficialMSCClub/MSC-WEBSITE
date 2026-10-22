import fs from 'node:fs';
import * as T from '../public/vendor/three/three.module.min.js';
import {createSummitWorld,routePose} from './summit-world.mjs';
const output=process.argv[2];if(!output)throw Error('Pass an absolute JSON output path.');
const group=createSummitWorld(),geometry={},nodes=[];
group.traverse(o=>{
 if(!o.isMesh)return;const g=o.geometry,id=g.uuid;
 if(!geometry[id])geometry[id]={position:[...g.attributes.position.array],normal:[...g.attributes.normal.array],uv:g.attributes.uv?[...g.attributes.uv.array]:null,color:g.attributes.color?[...g.attributes.color.array]:null,snow:g.attributes.snow?[...g.attributes.snow.array]:null,index:g.index?[...g.index.array]:null};
 nodes.push({geometry:id,matrix:o.matrixWorld.toArray(),color:o.material.color.toArray(),...o.userData});
});
const size=[2560,1440],cameras=[],clips={},ease=t=>t*t*t*(t*(t*6-15)+10);
const makeCamera=u=>{const pose=routePose(u),camera=new T.PerspectiveCamera(64,16/9,.08,1100);camera.position.copy(pose.position);camera.lookAt(pose.look);camera.updateMatrixWorld(true);return {position:camera.position.toArray(),look:pose.look.toArray(),matrix:camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse).toArray()};};
for(let frame=0;frame<=240;frame++)cameras.push(makeCamera(frame/240));
for(const from of [0,1,2])for(const to of [0,1,2])if(from!==to){clips[`${from}-${to}`]=Array.from({length:46},(_,i)=>makeCamera(from/2+(to-from)/2*ease(i/45)));}
const sun=new T.OrthographicCamera(-230,230,230,-230,1,1000);sun.position.set(-260,220,140);sun.lookAt(0,25,-55);sun.updateMatrixWorld(true);const shadowMatrix=sun.projectionMatrix.clone().multiply(sun.matrixWorldInverse).toArray();
fs.writeFileSync(output,JSON.stringify({size,geometry,nodes,cameras,clips,shadowMatrix}));console.log('Exported stabilized world and six 0.75-second continuous routes.');
