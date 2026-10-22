"""Offline sculpt: blend anatomical volumes, carve details and extract one smooth watertight horse mesh."""
from pathlib import Path
import numpy as np,base64,json
bounds=np.array([[-.49,.35,-.225],[.40,1.56,.225]],dtype='f4');shape=np.array([90,122,48]);axes=[np.linspace(bounds[0,i],bounds[1,i],shape[i],dtype='f4')for i in range(3)];grid=np.stack(np.meshgrid(*axes,indexing='ij'),axis=-1)
def ell(p,center,radii,angle=0):
 q=p-np.array(center);c,s=np.cos(angle),np.sin(angle);x=q[...,0]*c+q[...,1]*s;y=-q[...,0]*s+q[...,1]*c;q=np.stack([x,y,q[...,2]],axis=-1);r=np.array(radii);k0=np.linalg.norm(q/r,axis=-1);k1=np.linalg.norm(q/(r*r),axis=-1);return k0*(k0-1)/np.maximum(k1,1e-8)
def union(a,b,k=.035):
 h=np.maximum(k-np.abs(a-b),0)/k;return np.minimum(a,b)-h*h*k*.25
def capsule(p,a,b,r):
 a=np.array(a);ab=np.array(b)-a;q=p-a;t=np.clip(np.sum(q*ab,axis=-1)/np.dot(ab,ab),0,1);return np.linalg.norm(q-t[...,None]*ab,axis=-1)-r
def field(p):
 d=ell(p,(.025,.49,0),(.215,.16,.145));
 for center,radii,angle in [((.08,.67,0),(.18,.255,.135),-.18),((.12,.88,0),(.145,.28,.12),-.20),((.10,1.10,0),(.14,.235,.12),.18),((-.045,1.275,0),(.16,.17,.114),.1),((-.085,1.19,0),(.155,.145,.128),.18),((-.23,1.175,0),(.205,.071,.097),.60),((-.335,1.095,0),(.105,.079,.101),.24),((-.245,1.075,0),(.12,.061,.10),.12)]:d=union(d,ell(p,center,radii,angle))
 # A broad continuous mane follows the arched neck, with relief cut into its surfaces.
 for center,radii,angle in [((.165,1.25,0),(.065,.12,.073),.35),((.245,1.06,0),(.063,.18,.077),.12),((.255,.83,0),(.06,.16,.077),-.12),((.185,.63,0),(.065,.13,.079),-.38)]:d=union(d,ell(p,center,radii,angle),.025)
 for side in [-1,1]:
  d=union(d,ell(p,(-.022,1.438,side*.059),(.033,.091,.029),-.24),.012)
  d=union(d,ell(p,(-.119,1.315,side*.105),(.052,.023,.025),.20),.012)
  for center,radii,angle in [((-.047,1.458,side*.059),(.021,.060,.018),-.24),((-.125,1.287,side*.115),(.024,.018,.023),0),((-.383,1.114,side*.075),(.024,.017,.029),-.3)]:d=np.maximum(d,-ell(p,center,radii,angle))
  for a,b in [((-.411,1.06,side*.047),(-.35,1.043,side*.088)),((-.35,1.043,side*.088),(-.26,1.059,side*.099))]:d=np.maximum(d,-capsule(p,a,b,.0045))
 # Flowing incised locks on both sides, confined to the mane rather than floating spikes.
 X,Y,Z=p[...,0],p[...,1],p[...,2];mane=np.exp(-((X-.244)/.060)**2)*np.exp(-((np.abs(Z)-.067)/.027)**2)*np.clip((Y-.54)/.12,0,1)*np.clip((1.35-Y)/.12,0,1);d+=mane*.012*np.maximum(0,np.cos(Y*71+X*18))**12
 d=np.maximum(d,-capsule(p,(-.12,1.38,0),(-.20,1.285,0),.005))
 return np.maximum(d,.37-Y)
values=field(grid).astype('f4');corner=np.array([[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]]);slices=[values[c[0]:shape[0]-1+c[0],c[1]:shape[1]-1+c[1],c[2]:shape[2]-1+c[2]]for c in corner];low=np.minimum.reduce(slices);high=np.maximum.reduce(slices);active=np.argwhere((low<0)&(high>=0));points=grid[tuple((active[:,None,:]+corner).transpose(2,0,1))];v=values[tuple((active[:,None,:]+corner).transpose(2,0,1))];triangles=[]
for tetra in [[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]]:
 tp=points[:,tetra];tv=v[:,tetra];code=np.sum((tv<0)*(1<<np.arange(4)),axis=1)
 for case in range(1,15):
  selected=code==case
  if not np.any(selected):continue
  P=tp[selected];V=tv[selected];inside=[i for i in range(4)if case&(1<<i)];outside=[i for i in range(4)if not case&(1<<i)]
  def edge(i,j):
   t=V[:,i]/(V[:,i]-V[:,j]);return P[:,i]+t[:,None]*(P[:,j]-P[:,i])
  if len(inside)==1:triangles.append(np.stack([edge(inside[0],j)for j in outside],axis=1))
  elif len(inside)==3:triangles.append(np.stack([edge(outside[0],j)for j in inside],axis=1))
  else:
   a,b=inside;c,e=outside;q=[edge(a,c),edge(a,e),edge(b,e),edge(b,c)];triangles.extend([np.stack([q[0],q[1],q[2]],axis=1),np.stack([q[0],q[2],q[3]],axis=1)])
tri=np.concatenate(triangles).astype('f4');flat=tri.reshape(-1,3);quant=np.rint((flat-bounds[0])/(bounds[1]-bounds[0])*65535).clip(0,65535).astype('u2');unique,index=np.unique(quant,axis=0,return_inverse=True);pos=unique/65535*(bounds[1]-bounds[0])+bounds[0];norm=np.zeros_like(pos)
for i in range(3):
 delta=np.zeros(3);delta[i]=.00035;norm[:,i]=field(pos+delta)-field(pos-delta)
norm/=np.maximum(np.linalg.norm(norm,axis=1,keepdims=True),1e-8);index=index.reshape(-1,3);geo=pos[index];face=np.cross(geo[:,1]-geo[:,0],geo[:,2]-geo[:,0]);flip=np.sum(face*norm[index].mean(axis=1),axis=1)<0;index[flip]=index[flip][:,[0,2,1]];kind='Uint16Array'if len(unique)<65536 else'Uint32Array';index=index.astype('u2'if len(unique)<65536 else'u4');n=np.rint(norm*127).clip(-127,127).astype('i1')
def b64(a):return base64.b64encode(a.tobytes()).decode()
source="""// Original continuous anatomical horse sculpture, generated offline by scripts/sculpt-knight.py.
import * as T from './vendor/three/three.module.min.js';
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer;
export function sculptedKnightGeometry(){
"""+f"const q=new Uint16Array(bytes('{b64(unique)}')),n=new Int8Array(bytes('{b64(n)}')),index=new {kind}(bytes('{b64(index)}'));\n"+f"const min={json.dumps(bounds[0].tolist())},size={json.dumps((bounds[1]-bounds[0]).tolist())};\n"+"""const p=new Float32Array(q.length),normal=new Float32Array(n.length),uv=new Float32Array(q.length/3*2);for(let i=0;i<q.length;i++){p[i]=min[i%3]+q[i]/65535*size[i%3];normal[i]=n[i]/127;}for(let i=0;i<q.length/3;i++){uv[i*2]=(p[i*3]+.49)/.89;uv[i*2+1]=(p[i*3+1]-.35)/1.21;}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(normal,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(new T.BufferAttribute(index,1));return g;
}
""";out=Path(__file__).resolve().parents[1]/'dist/knight-sculpture.mjs';out.write_text(source);print('SCULPTED',len(pos),'vertices,',len(index),'triangles,',out.stat().st_size,'module bytes',flush=True)
