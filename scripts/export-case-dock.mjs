// Export a lid insert through the same camera and crop as the original rendered papers.
import fs from 'node:fs';
import * as T from '../dist/vendor/three/three.module.min.js';
import {createBriefcase} from '../dist/briefcase-model.mjs';
const file=new URL('../dist/assets/case-briefing/manifest.json',import.meta.url),manifest=JSON.parse(fs.readFileSync(file));
const {group,hinge}=createBriefcase(),lid=group.getObjectByName('Lid with document pocket');
const smooth=(p,a,b)=>{const t=Math.max(0,Math.min(1,(p-a)/(b-a)));return t*t*(3-2*t);};
const C=new T.Matrix4().makeRotationX(Math.PI/2),camera=new T.OrthographicCamera();camera.up.set(0,0,1);
const rotation=(x,y,z)=>new T.Matrix4().makeRotationX(x).multiply(new T.Matrix4().makeRotationY(y)).multiply(new T.Matrix4().makeRotationZ(z));
let worst=0;
manifest.docks=Array.from({length:manifest.count},(_,i)=>{
 const p=i/(manifest.count-1),opening=smooth(p,.015,.36),network=smooth(p,.36,.65),succeed=smooth(p,.66,1);
 group.quaternion.setFromRotationMatrix(rotation(.025+.075*network-.10*succeed,-.19-.28*network+.62*succeed,-.015-.05*network+.08*succeed));hinge.rotation.x=-(.13+opening*1.79);group.updateMatrixWorld(true);
 const scale=10.8-.35*network-.35*succeed;camera.left=-scale/2;camera.right=scale/2;camera.top=scale/2;camera.bottom=-scale/2;camera.near=.1;camera.far=100;
 camera.position.set(-3.6+9.4*network-7.6*succeed,-11+1.2*network+1.4*succeed,8+1.8*network+2.7*succeed);camera.lookAt(-.08+.18*succeed,0,1.52+.32*succeed);camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
 const project=point=>{const v=point.applyMatrix4(C).project(camera);return[(v.x+1)*612,(1-v.y)*612];};
 // Original first paper is a Blender-local rectangle at (-1.2,-.5,-.065).
 const paper=[[-.71,.46,.012],[.71,.46,.012],[.71,-.46,.012],[-.71,-.46,.012]].map(([x,y,z])=>project(new T.Vector3(x-1.2,z-.065,-(y-.5)).applyMatrix4(group.matrixWorld)));
 const offset=paper[0].map((v,j)=>v-manifest.papers[i][0][0][j]);
 paper.forEach((point,k)=>point.forEach((v,j)=>{worst=Math.max(worst,Math.abs(v-offset[j]-manifest.papers[i][0][k][j]));}));
 return [[-2.13,-.042,1.25],[2.13,-.042,1.25],[2.13,-.042,-1.25],[-2.13,-.042,-1.25]].map(point=>project(new T.Vector3(...point).applyMatrix4(lid.matrixWorld)).map((v,j)=>v-offset[j]));
});
if(worst>.001)throw Error(`Camera registration mismatch: ${worst}`);
manifest.description='Matched clamshell case with a permanent printed briefing insert inside the lid';
fs.writeFileSync(file,JSON.stringify(manifest)+'\n');fs.writeFileSync(new URL('../dist/assets/case-briefing/manifest-insert-v2.json',import.meta.url),JSON.stringify(manifest)+'\n');
console.log(`Exported ${manifest.docks.length} lid quads; source camera error ${worst.toExponential(2)}px.`);
