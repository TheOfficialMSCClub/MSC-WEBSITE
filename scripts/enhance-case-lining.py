"""Author a physically registered button-tufted leather material over the existing case renders.
The unchanged case geometry depth-tests a procedural lining shader; original paper and metal pixels are excluded.
"""
from pathlib import Path
from PIL import Image
import numpy as np,moderngl,json,subprocess,tempfile,shutil,sys
root=Path(__file__).resolve().parents[1]/'dist/assets';source=root/'case-continuous-v1';dest=root/'case-tufted-v3';dest.mkdir(exist_ok=True)
m=json.loads((source/'manifest.json').read_text());side=896;preview='--preview' in sys.argv
with tempfile.TemporaryDirectory(prefix='msc-leather-')as work:
 subprocess.run(['node',str(Path(__file__).with_name('export-case-motion.mjs')),work],check=True)
 matrices=json.loads((Path(work)/'motion.json').read_text());ctx=moderngl.create_standalone_context(backend='egl');ctx.enable(moderngl.DEPTH_TEST)
 solid=ctx.program(vertex_shader='''#version 330
 in vec3 position;uniform mat4 projection;void main(){gl_Position=projection*vec4(position,1.0);}''',fragment_shader='''#version 330
 out vec4 color;void main(){color=vec4(0);}''')
 textile=ctx.program(vertex_shader='''#version 330
 in vec3 position;in vec2 fabric;uniform mat4 projection;out vec2 uv;void main(){uv=fabric;gl_Position=projection*vec4(position,1.0);}''',fragment_shader='''#version 330
 in vec2 uv;out vec4 material;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 vec2 quilting(vec2 p){return vec2(p.x+p.y,p.x-p.y)*1.20;}
 float cushion(vec2 p){
  vec2 q=quilting(p),cell=abs(sin(q*3.14159265));
  float puff=pow(max(cell.x*cell.y,0.0),.52)*.105*(.94+hash(floor(q))*.12);
  vec2 nearest=(fract(q+.5)-.5)/1.697;
  float d=length(nearest);
  float draw=exp(-pow(d/.10,2.0))*.055;
  float wrinkles=sin(atan(nearest.y,nearest.x)*8.0+d*75.0)*exp(-pow(d/.15,2.0))*.0025;
  return puff-draw+wrinkles;
 }
 void main(){
  vec2 q=quilting(uv),cell=abs(sin(q*3.14159265));float seam=min(cell.x,cell.y);
  vec2 pin=(fract(q+.5)-.5)/1.697;float d=length(pin);
  float dx=(cushion(uv+vec2(.002,0))-cushion(uv-vec2(.002,0)))/.004;
  float dy=(cushion(uv+vec2(0,.002))-cushion(uv-vec2(0,.002)))/.004;
  vec3 n=normalize(vec3(-dx,-dy,1.0)),light=normalize(vec3(-.65,-.45,1.0)),halfway=normalize(light+vec3(0,0,1));
  float diffuse=max(0.0,dot(n,light)),spec=pow(max(0.0,dot(n,halfway)),24.0)*.26;
  float crease=exp(-pow(seam/.10,2.0));
  float aa=1.0-smoothstep(.6,2.0,max(fwidth(uv.x*180.0),fwidth(uv.y*180.0)));
  float grain=(hash(floor(uv*350.0))-.5)*.026*aa;
  float pores=pow(hash(floor(uv*230.0)),18.0)*.035*aa;
  float shade=.34+diffuse*.83-crease*.14+grain-pores;
  vec3 color=vec3(.36,.063,.117)*shade+vec3(.35,.20,.24)*spec;
  // Leather-covered buttons sit down in gathered dimples, rather than bright studs.
  float button=1.0-smoothstep(.026,.033,d),rim=exp(-pow((d-.033)/.008,2.0));
  vec3 bn=normalize(vec3(pin/.032,.65));float bl=max(0.0,dot(bn,light));
  vec3 bc=vec3(.33,.065,.115)*(.60+bl*.65)+vec3(.3,.12,.16)*pow(max(0.0,dot(bn,halfway)),20.0)*.25;
  color=mix(color,bc,button)-rim*vec3(.065,.012,.020);
  material=vec4(color,1);
 }''')
 all_vaos={};fabric_vaos={}
 for name in ['base','lid']:
  buffer=ctx.buffer((Path(work)/(name+'.bin')).read_bytes());all_vaos[name]=ctx.vertex_array(solid,[(buffer,'3f','position')]);buffer=ctx.buffer((Path(work)/('fabric-'+name+'.bin')).read_bytes());fabric_vaos[name]=ctx.vertex_array(textile,[(buffer,'3f 2f','position','fabric')])
 texture=ctx.texture((side,side),4,dtype='f4');depth=ctx.depth_renderbuffer((side,side));fbo=ctx.framebuffer([texture],depth);fbo.use()
 for i in ([25,50]if preview else range(52)):
  fbo.clear(0,0,0,0,depth=1);ctx.depth_func='<='
  for name in ['base','lid']:
   solid['projection'].write(np.array(matrices[i][name],dtype='f4').tobytes());all_vaos[name].render()
  for name in ['base','lid']:
   textile['projection'].write(np.array(matrices[i][name],dtype='f4').tobytes());fabric_vaos[name].render()
  field=np.frombuffer(fbo.read(components=4,dtype='f4'),dtype='f4').reshape(side,side,4)[::-1].copy();image=Image.open(source/f'{i:03}.webp').convert('RGBA');rgba=np.array(image);rgb=rgba[:,:,:3].astype('f4');maroon=(rgb[:,:,0]>rgb[:,:,1]*1.45)&(rgb[:,:,0]>rgb[:,:,2]*1.12)&(rgba[:,:,3]>235);mask=(field[:,:,3]>.9)&maroon
  lighting=np.clip(rgb[:,:,0:1]/120.0,.60,1.12);shaded=field[:,:,:3]*255.0*lighting;rgba[:,:,:3]=np.where(mask[:,:,None],np.clip(shaded,0,255),rgb).astype('uint8');image=Image.fromarray(rgba,'RGBA')
  if preview:image.save(f'/workspace/scratch/ffd1d2c559bf/tufted-{i}.png')
  else:image.save(dest/f'{i:03}.webp',quality=95,method=5)
  if i%10==0:print('TEXTILE',i,'fabric pixels',int(mask.sum()),flush=True)
if not preview:
 for i in range(51):shutil.copyfile(source/f'flow-{i:03}.png',dest/f'flow-{i:03}.png')
 original=json.loads((root/'case-briefing/manifest.json').read_text());b=original['bounds'][0];dx=448-round((b[0]+b[2])/2);dy=448-round((b[1]+b[3])/2);w,h=original['dimensions'][0];Image.open(dest/'000.webp').crop((dx,dy,dx+w,dy+h)).save(dest/'poster.webp',quality=95,method=6)
 m['poster']='assets/'+dest.name+'/poster.webp';m['directory']='assets/'+dest.name;m['flow']['directory']=m['directory'];m['description']='Original detailed case with button-tufted burgundy leather, deep padded diamonds, gathered creases, fine pores and satin highlights';(dest/'manifest.json').write_text(json.dumps(m,separators=(',',':'))+'\n');print('DONE',sum(p.stat().st_size for p in dest.iterdir()),flush=True)
