"""Prepare registered texture pairs and bidirectional motion for GPU subframe interpolation.
Original rendered case geometry, materials, lighting and initial physical scale are retained.
"""
from pathlib import Path
from PIL import Image
import numpy as np
import cv2,json,moderngl,subprocess,tempfile
cv2.setNumThreads(2)
root=Path(__file__).resolve().parents[1]/'dist/assets';source=root/'case-briefing';dest=root/'case-continuous-v1';dest.mkdir(exist_ok=True)
m=json.loads((source/'manifest-insert-v2.json').read_text());side=896;last=51;flow_side=448
bounds=[];papers=[];docks=[]
for i in range(m['count']):
 b=m['bounds'][i];dx=side//2-round((b[0]+b[2])/2);dy=side//2-round((b[1]+b[3])/2)
 bounds.append([b[0]+dx,b[1]+dy,b[2]+dx,b[3]+dy]);papers.append([[[x+dx,y+dy]for x,y in corners]for corners in m['papers'][i]]);docks.append([[x+dx,y+dy]for x,y in m['docks'][i]])
 if i>last:continue
 image=Image.new('RGBA',(side,side));image.paste(Image.open(source/f'{i:03}.webp'),(dx,dy))
 try:
  existing=Image.open(dest/f'{i:03}.webp');existing.load();assert existing.size==(side,side)
 except (OSError,AssertionError):image.save(dest/f'{i:03}.webp',quality=94,method=6)
print('Registered all 52 source poses.',flush=True)
# Depth-test the exact case meshes and project each visible surface into its next pose.
# This avoids the unstable edge guesses that feature-based optical flow can produce on metal.
with tempfile.TemporaryDirectory(prefix='msc-motion-')as work:
 subprocess.run(['node',str(Path(__file__).with_name('export-case-motion.mjs')),work],check=True)
 matrices=json.loads((Path(work)/'motion.json').read_text());ctx=moderngl.create_standalone_context(backend='egl')
 program=ctx.program(vertex_shader='#version 330\n in vec3 position;uniform mat4 now;uniform mat4 next;out vec4 destination;\n void main(){gl_Position=now*vec4(position,1.0);destination=next*vec4(position,1.0);}',fragment_shader='#version 330\n in vec4 destination;out vec3 motion;\n void main(){vec2 pixel=(destination.xy/destination.w+1.0)*448.0;vec2 delta=pixel-gl_FragCoord.xy;motion=vec3(delta.x,-delta.y,1.0);}')
 vaos={}
 for name in ['base','lid']:
  buffer=ctx.buffer((Path(work)/(name+'.bin')).read_bytes());vaos[name]=ctx.vertex_array(program,[(buffer,'3f','position')])
 texture=ctx.texture((side,side),3,dtype='f4');depth=ctx.depth_renderbuffer((side,side));fbo=ctx.framebuffer([texture],depth);fbo.use();ctx.enable(moderngl.DEPTH_TEST)
 def direction(now,next):
  fbo.clear(0,0,0,depth=1)
  for name in ['base','lid']:
   program['now'].write(np.array(matrices[now][name],dtype='f4').tobytes());program['next'].write(np.array(matrices[next][name],dtype='f4').tobytes());vaos[name].render()
  data=np.frombuffer(fbo.read(components=3,dtype='f4'),dtype='f4').reshape(side,side,3)[::-1].copy();mask=data[:,:,2]>.5
  # Extend the nearest physical surface beyond its silhouette for inverse texture sampling.
  _,labels=cv2.distanceTransformWithLabels((~mask).astype('uint8'),cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
  lookup=data[mask,:2];motion=lookup[np.maximum(labels-1,0)]
  return cv2.resize(motion,(flow_side,flow_side),interpolation=cv2.INTER_AREA)
 for i in range(last):
  packed=np.concatenate((direction(i,i+1),direction(i+1,i)),axis=2);peak=float(np.max(np.abs(packed)))
  if peak>31.5:raise ValueError(f'Unencodable physical motion {i}: {peak}')
  encoded=np.clip(np.rint(packed*4+128),0,255).astype(np.uint8);Image.fromarray(encoded,'RGBA').save(dest/f'flow-{i:03}.png',compress_level=9)
  if i%10==0:print('SURFACE_MOTION',i,'peak',round(peak,2),flush=True)
manifest={**m,'directory':'assets/'+dest.name,'poster':'assets/case-briefing/poster.webp','width':side,'height':side,'dimensions':[[side,side]]*m['count'],'bounds':bounds,'papers':papers,'docks':docks,'frameLimit':last,'flow':{'directory':'assets/'+dest.name,'width':flow_side,'height':flow_side,'step':.25,'zero':128},'description':'Registered original case renders with bidirectional physical-surface motion fields for continuous GPU interpolation'}
(dest/'manifest.json').write_text(json.dumps(manifest,separators=(',',':'))+'\n')
print('DONE',sum(p.stat().st_size for p in dest.iterdir()),'bytes',flush=True)
