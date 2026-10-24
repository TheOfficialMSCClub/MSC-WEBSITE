import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../public/vendor/three/three.module.min.js';
import {councilPieces,departments,associatePlaceholders} from '../public/chess-roster.mjs';
import {createChessModel} from '../public/chess-model.mjs';
import {CouncilFocus,portraitAngle} from '../public/chess-focus.mjs';
import {squarePosition} from '../public/chess-state.mjs';
const root=new URL('../public/',import.meta.url),data=JSON.parse(fs.readFileSync(new URL('content.json',root))),roster=councilPieces(data.members),model=createChessModel([...roster,...associatePlaceholders]),camera=new T.PerspectiveCamera(36,1.3,.1,90),focus=new CouncilFocus(model,camera);
assert.equal(roster.length,17);assert.equal(new Set(roster.map(p=>p.id)).size,17);assert.equal(new Set(roster.map(p=>p.square)).size,17);assert.deepEqual(new Set(roster.map(p=>p.id)),new Set(data.members.map(m=>m.id)));
for(const p of roster)assert.equal(p.type,departments.find(d=>d.name===p.group).type);
assert.deepEqual(departments.map(d=>d.type),['king','queen','rook','bishop','knight','pawn']);
assert.equal(roster.filter(p=>p.type==='pawn').length,0);
assert.equal(roster.filter(p=>p.type==='bishop').length,4);
assert(roster.filter(p=>p.department==='Events').every(p=>p.type==='rook'));
assert(roster.filter(p=>['Finance','Operations'].includes(p.department)).every(p=>p.type==='bishop'&&p.group==='Finance & Operations'));
assert.equal(associatePlaceholders.length,15);assert(associatePlaceholders.every(p=>p.placeholder&&p.type==='pawn'&&p.name==='Coming soon'));assert.deepEqual(associatePlaceholders.map(p=>p.id),data.pendingMembers.map(p=>p.id));
assert.equal(new Set([...roster,...associatePlaceholders].map(p=>p.square)).size,32);
const settle=()=>{for(let i=0;i<180;i++)focus.tick(1/60);assert.equal(focus.animation,null);};
const overview=camera.position.clone();focus.select('joe-kuang');focus.tick(.04);assert(focus.animation);const joe=model.pieces.find(p=>p.id==='joe-kuang');assert(joe.mesh.position.y>.055);settle();assert(joe.mesh.position.z>5);assert(camera.position.distanceTo(focus.look)<5);assert(camera.position.distanceTo(overview)>8);
// Interrupting a move safely returns the previous member while bringing the next forward.
focus.select('amy-kang');focus.tick(.04);focus.select('jayden-li');settle();for(const p of model.pieces){if(p.id==='jayden-li')continue;const home=squarePosition(p.square);assert(p.mesh.position.distanceTo(new T.Vector3(home.x,.055,home.z))<1e-7);}
// Every department and all 17 profiles can be selected; portrait assets are real files.
for(const member of roster){focus.select(member.id,{immediate:true});assert.equal(focus.activeId,member.id);assert.equal(focus.animation,null);assert(fs.existsSync(new URL(data.assets[member.asset].src,root)));}
focus.resize(.83);assert.equal(camera.aspect,.83);assert.equal(focus.activeId,roster.at(-1).id);focus.select(null);settle();assert.equal(focus.activeId,null);for(const p of model.pieces){const pos=squarePosition(p.square);assert(p.mesh.position.distanceTo(new T.Vector3(pos.x,.055,pos.z))<1e-7);}
// Actual raycasting resolves the selected mesh back to its member, including child geometry.
model.group.rotation.y=-.12;model.group.updateMatrixWorld(true);focus.select('meghana-kuchipudi',{immediate:true});model.group.updateMatrixWorld(true);camera.updateMatrixWorld(true);const person=model.pieces.find(p=>p.id==='meghana-kuchipudi'),world=person.mesh.localToWorld(new T.Vector3(0,.8,0)),point=world.clone().project(camera),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(point.x,point.y),camera);let object=ray.intersectObjects(model.pieces.map(p=>p.mesh),true)[0]?.object;while(object&&!object.userData.id)object=object.parent;assert.equal(object?.userData.id,'meghana-kuchipudi');
console.log('PASS: all 17 member assignments, interruption, close-up, reset, resize, reduced-motion poses, assets and actual piece raycast.');
// Close-up silhouettes stay inside the viewport on desktop and phone aspect ratios.
for(const aspect of [.78,1.25,1.65]){
 focus.resize(aspect);
 for(const member of roster){focus.select(member.id,{immediate:true});model.group.updateMatrixWorld(true);camera.updateMatrixWorld(true);const mesh=model.pieces.find(p=>p.id===member.id).mesh,min=new T.Vector2(Infinity,Infinity),max=new T.Vector2(-Infinity,-Infinity);mesh.traverse(o=>{if(!o.isMesh)return;const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i++){const p=new T.Vector3().fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld).project(camera);min.x=Math.min(min.x,p.x);min.y=Math.min(min.y,p.y);max.x=Math.max(max.x,p.x);max.y=Math.max(max.y,p.y);}});assert(min.x>-.96&&min.y>-.96&&max.x<.96&&max.y<.96,`${member.id} clipping at ${aspect}: ${JSON.stringify({min,max})}`);assert(max.y-min.y>.75,`${member.id} close-up too small`);}
}
console.log('PASS: all 17 actual mesh silhouettes fit and fill the close-up at phone and desktop ratios.');

// Member handoffs reveal the board; resizing and rapid choices keep current poses continuous.
focus.resize(1.25);focus.select('joe-kuang',{immediate:true});focus.select('amy-kang');
for(let i=0;i<50;i++)focus.tick(1/60);
assert(camera.position.distanceTo(focus.look)>12,'The handoff should pull back to show the board.');
const pieceSnapshot=model.pieces.map(p=>p.mesh.position.clone()),cameraSnapshot=camera.position.clone();
focus.resize(.8);assert(camera.position.equals(cameraSnapshot),'Resize must not finish the camera transition.');
model.pieces.forEach((p,i)=>assert(p.mesh.position.equals(pieceSnapshot[i]),'Resize must not teleport a piece.'));
focus.select('jayden-li');model.pieces.forEach((p,i)=>assert(p.mesh.position.equals(pieceSnapshot[i]),'Rapid choice must begin at the current pose.'));settle();
assert.equal(focus.activeId,'jayden-li');
console.log('PASS: board-visible member handoff, continuous resize, and rapid reselection.');

// The local front of every selected sculpture points toward the close-up camera.
model.group.rotation.y=-.12;
for(const member of roster){focus.select(member.id,{immediate:true});model.group.updateMatrixWorld(true);const piece=model.pieces.find(p=>p.id===member.id),front=new T.Vector3(0,0,1).transformDirection(piece.mesh.matrixWorld),toward=camera.position.clone().sub(piece.mesh.getWorldPosition(new T.Vector3()));front.y=toward.y=0;assert(front.normalize().dot(toward.normalize())>Math.cos(portraitAngle)-1e-8&&front.dot(toward)<Math.cos(portraitAngle)+1e-8,`${member.id} must present the near-sideways portrait angle`);}
focus.select(null,{immediate:true});for(const piece of model.pieces)assert(Math.abs(Math.sin((piece.mesh.rotation.y-piece.mesh.userData.homeYaw)/2))<1e-7,'Return to the authored board orientation.');
console.log('PASS: all 17 ivory/maroon sculptures present the near-sideways view and restore their board orientations.');

// New positions support the same camera, crop and reset behavior as announced members.
for(const pending of associatePlaceholders){focus.select(pending.id,{immediate:true});assert.equal(focus.activeId,pending.id);assert(fs.existsSync(new URL(data.assets[pending.asset].src,root)));}
focus.select(null,{immediate:true});
assert.equal(model.pieces.length,32);assert.equal(model.pieces.filter(p=>p.color==='white').length,16);
console.log('PASS: 32 distinct pieces, 16 of each finish, all 15 Coming soon portraits and close-up selection.');
