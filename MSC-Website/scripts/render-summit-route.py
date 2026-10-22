"""Render six stabilized routes with 0.75 seconds of continuous travel each.
Requires Python moderngl, numpy, Pillow, plus ffmpeg. Run export-summit-route.mjs first.
"""
from pathlib import Path
import argparse,json,subprocess,hashlib,shutil
import moderngl,numpy as np
from PIL import Image
parser=argparse.ArgumentParser();parser.add_argument('world');parser.add_argument('output');parser.add_argument('--samples',action='store_true');args=parser.parse_args()
D=json.loads(Path(args.world).read_text());out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
ctx=moderngl.create_standalone_context(backend='egl');ctx.enable(moderngl.DEPTH_TEST)
vertex='''#version 330
in vec3 position;in vec3 normal;in vec2 uv;in vec3 color;in float snow;
uniform mat4 model;uniform mat4 vp;out vec3 vWorld;out vec3 vNormal;out vec2 vUV;out vec3 vColor;out float vSnow;
void main(){vec4 p=model*vec4(position,1);vWorld=p.xyz;vNormal=normalize(transpose(inverse(mat3(model)))*normal);vUV=uv;vColor=color;vSnow=snow;gl_Position=vp*p;}
'''
fragment='''#version 330
uniform sampler2D rock;uniform sampler2D fir;uniform sampler2D horizon;uniform sampler2DShadow shadowMap;uniform mat4 shadowMatrix;uniform int kind;uniform vec3 base;uniform vec3 eye;uniform float snowCover;
in vec3 vWorld;in vec3 vNormal;in vec2 vUV;in vec3 vColor;in float vSnow;out vec4 result;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0,1);}
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=mix(hash(i),hash(i+vec3(1,0,0)),f.x),b=mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),c=mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),d=mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x);return mix(mix(a,b,f.y),mix(c,d,f.y),f.z);}
vec3 triTexture(vec3 p,vec3 w){return texture(rock,p.zy).rgb*w.x+texture(rock,p.xz).rgb*w.y+texture(rock,p.xy).rgb*w.z;}
void main(){
 if(kind==2){float angle=atan(vWorld.x,-vWorld.z);vec2 uv=vec2(.5-angle/4.18879,.47+atan(vWorld.y,length(vWorld.xz))/1.8)+vUV*.0000001;vec3 sky=texture(horizon,clamp(uv,vec2(.001),vec2(.999))).rgb;float gray=dot(sky,vec3(.22,.7,.08));sky=mix(sky,vec3(gray)*vec3(.79,.94,1.13),.65);sky=mix(sky,vec3(.23,.31,.4),smoothstep(.78,1.0,uv.y));result=vec4(sky,1);return;}
 vec4 needles=vec4(1);if(kind==4){needles=texture(fir,vUV);if(needles.a<.42)discard;}
 vec3 N=normalize(vNormal),w=pow(abs(N),vec3(5));w/=w.x+w.y+w.z;
 vec3 tex=triTexture(vWorld*.43,w),macro=triTexture(vWorld*.067,w);
 float grain=noise(vWorld*24.),drift=noise(vWorld*2.4),strata=sin(vWorld.y*4.7+noise(vWorld*.38)*7.)*.5+.5;
 float powder=smoothstep(.16,.8,(kind==0?vSnow:snowCover)*smoothstep(.18,.72,N.y)+(tex.r-.5)*.22);
 if(kind==5){if(N.y<.82+noise(vWorld*3.)*.07)discard;powder=1.;}
 vec3 albedo=mix(pow(tex,vec3(2.2))*vColor*base*(.86+macro*.36),vec3(.68,.78,.88)*(.94+drift*.06),powder);
 if(kind==3)albedo=vColor*base;
 if(kind==4){powder=0.;albedo=pow(needles.rgb,vec3(2.2))*vColor;}
 if(kind==6){powder=0.;float bark=noise(vec3(vWorld.x*20.,vWorld.y*2.,vWorld.z*20.));albedo=mix(vec3(.055,.043,.028),vec3(.18,.14,.095),bark);}
 // Multi-scale surface-gradient relief for fractured strata and wind-worked snow.
 float height=mix(dot(tex,vec3(.3,.5,.2))*.014+grain*.0003,drift*.035+grain*.0008+sin(vWorld.x*7.+noise(vWorld*.5)*5.)*.003,powder);
 if(kind==4||kind==3)height=0.;
 vec3 q0=dFdx(vWorld),q1=dFdy(vWorld),q1perp=cross(q1,N),q0perp=cross(N,q0);float determinant=dot(q0,q1perp);
 if(abs(determinant)>.00000001)N=normalize(N-sign(determinant)*(dFdx(height)*q1perp+dFdy(height)*q0perp)/max(abs(determinant),.00000001));
 vec3 L=normalize(vec3(-.686,.515,.515)),V=normalize(eye-vWorld),H=normalize(L+V);
 vec4 projected=shadowMatrix*vec4(vWorld+vNormal*.10,1.);vec3 shadow=projected.xyz/projected.w*.5+.5;float light=1.;
 if(all(greaterThan(shadow,vec3(0)))&&all(lessThan(shadow,vec3(1)))){light=0.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++)light+=texture(shadowMap,vec3(shadow.xy+vec2(x,y)/4096.,shadow.z-.0003));light/=9.;}
 float diffuse=max(0,dot(N,L)),ao=mix(.85,1.,smoothstep(.05,.95,N.y));
 // Rough dielectric BRDF: small mineral and ice highlights, with a cool sky fill.
 float rough=mix(.82,.48,powder),a2=pow(rough,4.),nh=max(dot(N,H),0.),nv=max(dot(N,V),.001),nl=max(dot(N,L),.001),hv=max(dot(H,V),0.);
 float distribution=a2/(3.141593*pow(nh*nh*(a2-1.)+1.,2.));float k=pow(rough+1.,2.)/8.;float visibility=(nv/(nv*(1.-k)+k))*(nl/(nl*(1.-k)+k));vec3 fresnel=vec3(.035)+(1.-.035)*pow(1.-hv,5.);
 vec3 spec=distribution*visibility*fresnel/(4.*nv*nl+.001);
 vec3 ambient=mix(vec3(.21,.26,.32),vec3(.42,.51,.64),clamp(N.y*.5+.5,0,1));
 vec3 lit=albedo*(ambient*ao+diffuse*light*1.85*vec3(1.06,.98,.86))+spec*diffuse*light*.45;
 if(kind==4){float wrap=clamp((dot(N,L)+.5)/1.5,0,1);lit=albedo*(vec3(.75,.85,.96)*.65+wrap*light*1.2*vec3(1.05,.98,.88));}
 vec3 tone=pow(aces(lit),vec3(1./2.2));float dist=length(eye-vWorld),fog=1.-exp(-.0035*.0035*dist*dist);tone=mix(tone,vec3(.48,.58,.65),fog);
 result=vec4(tone,1);
}'''
program=ctx.program(vertex_shader=vertex,fragment_shader=fragment);program['rock'].value=0;program['fir'].value=3;program['horizon'].value=1;program['shadowMap'].value=2;program['shadowMatrix'].write(np.array(D['shadowMatrix'],dtype='f4').tobytes())
assets=Path(__file__).resolve().parents[1]/'public/assets/summit-route-v8'
for unit,name in [(0,'granite.webp'),(1,'horizon.webp'),(3,'branch.png')]:
 image=Image.open(assets/name).convert('RGBA' if unit==3 else 'RGB').transpose(Image.Transpose.FLIP_TOP_BOTTOM);tex=ctx.texture(image.size,4 if unit==3 else 3,image.tobytes());tex.build_mipmaps();tex.anisotropy=min(16.,ctx.max_anisotropy);tex.filter=(moderngl.LINEAR_MIPMAP_LINEAR,moderngl.LINEAR);tex.repeat_x=tex.repeat_y=(unit==0);tex.use(unit)
geos={};buffers={}
for key,g in D['geometry'].items():
 p=np.array(g['position'],dtype='f4').reshape(-1,3);n=np.array(g['normal'],dtype='f4').reshape(-1,3);uv=np.array(g['uv'],dtype='f4').reshape(-1,2)if g['uv']else np.zeros((len(p),2),'f4');color=np.array(g['color'],dtype='f4').reshape(-1,3)if g['color']else np.ones((len(p),3),'f4');snow=np.array(g['snow'],dtype='f4').reshape(-1,1)if g['snow']else np.zeros((len(p),1),'f4');vbo=ctx.buffer(np.concatenate([p,n,uv,color,snow],axis=1).tobytes());ibo=ctx.buffer(np.array(g['index'],dtype='u4').tobytes())if g['index']else None
 buffers[key]=(vbo,ibo)
 geos[key]=ctx.vertex_array(program,[(vbo,'3f 3f 2f 3f 1f','position','normal','uv','color','snow')],ibo)
# A continuous slope-and-grain mask avoids hard-edged snow fragments on rocks.
for node in D['nodes']:
 if node['type']=='rock'and max(abs(node['matrix'][i])for i in[0,5,10])>1.25:node['snow']=max(node.get('snow',0),.56)
# Render physical sunlight and contact shadows once for the fixed world.
shadow_program=ctx.program(vertex_shader="""#version 330
in vec3 position;in vec2 uv;out vec2 vUV;uniform mat4 model;uniform mat4 vp;void main(){vUV=uv;gl_Position=vp*model*vec4(position,1);}
""",fragment_shader="""#version 330
in vec2 vUV;uniform sampler2D fir;uniform int isFir;void main(){if(isFir==1&&texture(fir,vUV).a<.45)discard;}
""")
shadow_program['fir'].value=3;shadow_program['vp'].write(np.array(D['shadowMatrix'],dtype='f4').tobytes());depth=ctx.depth_texture((4096,4096));depth.compare_func='<=';depth.repeat_x=depth.repeat_y=False;depth.use(2);shadow_fbo=ctx.framebuffer(depth_attachment=depth);shadow_fbo.use();shadow_fbo.clear(depth=1)
shadow_geos={key:ctx.vertex_array(shadow_program,[(vbo,'3f 12x 2f 16x','position','uv')],ibo)for key,(vbo,ibo)in buffers.items()}
for node in D['nodes']:
 if node['type'] in ['background','snow']:continue
 shadow_program['isFir'].value=int(node['type']=='branch');shadow_program['model'].write(np.array(node['matrix'],dtype='f4').tobytes());shadow_geos[node['geometry']].render()
# A depth/normal pass supplies contact occlusion in camera space.
normal_fragment="""#version 330
uniform mat4 view;uniform sampler2D fir;uniform int kind;in vec3 vNormal;in vec3 vWorld;in vec2 vUV;out vec4 result;
void main(){if(kind==4&&texture(fir,vUV).a<.42)discard;if(kind==5&&normalize(vNormal).y<.82)discard;if(kind==2){result=vec4(0,0,0,10000);return;}result=vec4(normalize(mat3(view)*vNormal),-(view*vec4(vWorld,1)).z);}
"""
normal_program=ctx.program(vertex_shader=vertex,fragment_shader=normal_fragment);normal_program['fir'].value=3
normal_geos={key:ctx.vertex_array(normal_program,[(vbo,'3f 3f 2f 16x','position','normal','uv')],ibo)for key,(vbo,ibo)in buffers.items()}
post_vertex="""#version 330
in vec2 position;out vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0,1);}
"""
post_fragment="""#version 330
uniform sampler2D beauty;uniform sampler2D geometry;uniform vec2 resolution;in vec2 uv;out vec4 result;
const float focal=1.600334529;const vec3 kernels[12]=vec3[12](vec3(.1,.2,.3),vec3(-.3,.1,.25),vec3(.2,-.4,.35),vec3(.45,.35,.3),vec3(-.5,-.2,.5),vec3(.1,.6,.45),vec3(-.2,-.65,.6),vec3(.7,-.15,.5),vec3(-.7,.4,.55),vec3(.4,.6,.7),vec3(-.3,.1,.95),vec3(.15,-.45,.9));
vec3 reconstruct(vec2 t,float depth){return vec3((t*2.-1.)*vec2(16./9.,1.)*depth/focal,-depth);}
void main(){vec3 color=texture(beauty,uv).rgb;vec4 data=texture(geometry,uv);float depth=data.a;
 if(depth<1000.&&depth>0.){vec3 N=normalize(data.xyz),P=reconstruct(uv,depth),tangent=normalize(vec3(.37,.72,.56)-N*dot(N,vec3(.37,.72,.56))),bitangent=cross(N,tangent);mat3 basis=mat3(tangent,bitangent,N);float occ=0.;
 for(int i=0;i<12;i++){vec3 point=P+basis*kernels[i]*1.3;vec2 at=(point.xy/(-point.z))*vec2(focal/(16./9.),focal)*.5+.5;if(any(lessThan(at,vec2(0)))||any(greaterThan(at,vec2(1))))continue;float scene=texture(geometry,at).a;float range=smoothstep(0.,1.,1.25/(abs(depth-scene)+.001));occ+=(scene<-point.z-.035?1.:0.)*range;}
 color*=1.-occ/12.*.42;
 }
 // A small edge-aware resolve keeps thin needles and distant scree clean.
 vec2 d=1./resolution;vec3 a=texture(beauty,uv+vec2(d.x,0)).rgb,b=texture(beauty,uv-vec2(d.x,0)).rgb,c=texture(beauty,uv+vec2(0,d.y)).rgb,e=texture(beauty,uv-vec2(0,d.y)).rgb;float edge=length(a-b)+length(c-e);color=mix(color,(a+b+c+e)*.25*color/max(texture(beauty,uv).rgb,vec3(.001)),smoothstep(.35,1.,edge)*.25);result=vec4(color,1);}
"""
post_program=ctx.program(vertex_shader=post_vertex,fragment_shader=post_fragment);post_program['beauty'].value=4;post_program['geometry'].value=5
quad=ctx.buffer(np.array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1],dtype='f4').tobytes());post=ctx.vertex_array(post_program,[(quad,'2f','position')])
kinds={'ground':0,'rock':1,'background':2,'plain':3,'branch':4,'snow':5,'bark':6}
def targets(size):
 beauty=ctx.simple_framebuffer(size,components=3,samples=4);resolved=ctx.framebuffer([ctx.texture(size,3)]);geometry=ctx.texture(size,4,dtype='f4');geometry.filter=(moderngl.NEAREST,moderngl.NEAREST);normal=ctx.framebuffer([geometry],ctx.depth_renderbuffer(size));final=ctx.simple_framebuffer(size,components=3);return beauty,resolved,geometry,normal,final
size=(1280,720)if args.samples else tuple(D['size']);frame_targets=targets(size)
def render(camera,targets=frame_targets):
 target,readback,geometry,normal,final=targets;ctx.enable(moderngl.DEPTH_TEST);target.use();target.clear(.48,.58,.65,1,depth=1);vp=np.array(camera['matrix'],dtype='f4').tobytes();program['vp'].write(vp);program['eye'].value=camera['position']
 for node in D['nodes']:
  program['model'].write(np.array(node['matrix'],dtype='f4').tobytes());program['base'].value=node['color'];program['kind'].value=kinds[node['type']];program['snowCover'].value=node.get('snow',0);geos[node['geometry']].render()
 ctx.copy_framebuffer(readback,target)
 eye=np.array(camera['position']);forward=np.array(camera['look'])-eye;forward/=np.linalg.norm(forward);right=np.cross(forward,[0,1,0]);right/=np.linalg.norm(right);up=np.cross(right,forward);view=np.eye(4);view[:3,:3]=np.array([right,up,-forward]);view[:3,3]=-view[:3,:3]@eye
 normal.use();normal.clear(0,0,0,10000,depth=1);normal_program['view'].write(view.astype('f4').T.tobytes());normal_program['vp'].write(vp)
 for node in D['nodes']:
  normal_program['model'].write(np.array(node['matrix'],dtype='f4').tobytes());normal_program['kind'].value=kinds[node['type']];normal_geos[node['geometry']].render()
 readback.color_attachments[0].use(4);geometry.use(5);final.use();ctx.disable(moderngl.DEPTH_TEST);post_program['resolution'].value=target.size;post.render()
 return Image.frombytes('RGB',target.size,final.read(components=3,alignment=1)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
jobs=[('samples',[(i,D['cameras'][i])for i in [0,120,240]])]if args.samples else [(name,list(enumerate(cameras)))for name,cameras in D['clips'].items()]
cache={}
for clip,jobs_frames in jobs:
 clip_dir=out/clip;clip_dir.mkdir(parents=True,exist_ok=True)
 for frame,camera in jobs_frames:
  key=tuple(round(x,6)for x in camera['matrix']);destination=clip_dir/f'{frame:04d}.jpg'
  if key in cache:shutil.copyfile(cache[key],destination)
  else:
   image=render(camera);image.save(destination,quality=97,subsampling=0);cache[key]=destination
  if frame%15==0:print('Rendered',clip,frame,flush=True)
 if not args.samples:
  movie=assets/f'{clip}.mp4';command=['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','60','-i',str(clip_dir/'%04d.jpg'),'-c:v','libx264','-preset','fast','-crf','19','-maxrate','24M','-bufsize','24M','-g','15','-pix_fmt','yuv420p','-movflags','+faststart',str(movie)];subprocess.run(command,check=True);print('Encoded',movie,movie.stat().st_size,flush=True)
if not args.samples:
 still_targets=targets((3840,2160))
 for stop in range(3):render(D['cameras'][stop*120],still_targets).save(assets/f'stop-{stop}.webp',quality=94,method=6);print('4K destination',stop,flush=True)
