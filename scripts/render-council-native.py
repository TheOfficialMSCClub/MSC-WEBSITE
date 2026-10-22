"""Render the actual detailed council meshes to a transparent still with native Mesa EGL.
Used for the browser's non-WebGL fallback and native visual checks; does not claim browser QA.
"""
from pathlib import Path
from PIL import Image
import moderngl,numpy as np,json,sys
source,out=map(Path,sys.argv[1:3]);D=json.loads(source.read_text());ctx=moderngl.create_standalone_context(backend='egl');ctx.enable(moderngl.DEPTH_TEST);size=(1200,1000)
vertex='''#version 330
in vec3 position;in vec3 normal;in vec2 uv;uniform mat4 model;uniform mat4 vp;uniform mat4 light;out vec3 world;out vec3 n;out vec2 textureUV;out vec4 shadow;
void main(){vec4 p=model*vec4(position,1);world=p.xyz;n=normalize(transpose(inverse(mat3(model)))*normal);textureUV=uv;shadow=light*p;gl_Position=vp*p;}'''
fragment='''#version 330
in vec3 world;in vec3 n;in vec2 textureUV;in vec4 shadow;uniform vec3 color;uniform float rough;uniform float metal;uniform float coat;uniform bool mapped;uniform sampler2D surface;uniform sampler2D shadowMap;uniform vec3 eye;out vec4 result;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0,1);}
void main(){vec3 N=normalize(n),V=normalize(eye-world),L=normalize(vec3(-3,9,7)-world),H=normalize(L+V),C=color;if(mapped)C*=pow(texture(surface,textureUV).rgb,vec3(2.2));vec3 s=shadow.xyz/shadow.w*.5+.5;float visibility=0;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){float d=texture(shadowMap,s.xy+vec2(x,y)/1536.0).r;visibility+=s.z-.0015<=d?1.0:.24;}visibility/=9.0;float diffuse=max(0,dot(N,L));float ambient=.24+.20*max(0,N.y);vec3 light=C*(ambient+diffuse*1.5*visibility)*vec3(1,.96,.88);float exponent=clamp(3.0/(rough*rough),12,180);vec3 f0=mix(vec3(.045),C,metal);light+=f0*pow(max(0,dot(N,H)),exponent)*(1.8+coat)*visibility;vec3 rim=normalize(vec3(-5,5,-7)-world);float edge=pow(1.0-max(0,dot(N,V)),3.0);light+=C*max(0,dot(N,rim))*.45*vec3(.8,.94,1)+edge*max(0,dot(N,rim))*.12;result=vec4(pow(aces(light),vec3(1.0/2.2)),1);}'''
program=ctx.program(vertex_shader=vertex,fragment_shader=fragment);depth_program=ctx.program(vertex_shader='''#version 330
in vec3 position;uniform mat4 model;uniform mat4 vp;void main(){gl_Position=vp*model*vec4(position,1);}''',fragment_shader='''#version 330
void main(){}''')
program['vp'].write(np.array(D['camera']['matrix'],dtype='f4').tobytes());program['light'].write(np.array(D['light'],dtype='f4').tobytes());program['eye'].value=D['camera']['position'];program['surface'].value=0;program['shadowMap'].value=1;depth_program['vp'].write(np.array(D['light'],dtype='f4').tobytes())
geos={}
for key,g in D['geometry'].items():
 p=np.array(g['position'],dtype='f4').reshape(-1,3);n=np.array(g['normal'],dtype='f4').reshape(-1,3);uv=np.array(g['uv'],dtype='f4').reshape(-1,2)if g['uv']else np.zeros((len(p),2),'f4');vbo=ctx.buffer(np.concatenate([p,n,uv],axis=1).astype('f4').tobytes());ibo=ctx.buffer(np.array(g['index'],dtype='u4').tobytes())if g['index']else None;geos[key]=(ctx.vertex_array(program,[(vbo,'3f 3f 2f','position','normal','uv')],ibo),ctx.vertex_array(depth_program,[(vbo,'3f 20x','position')],ibo))
textures={}
for key,t in D['textures'].items():
 tex=ctx.texture((t['width'],t['height']),4,bytes(t['data']));tex.build_mipmaps();tex.filter=(moderngl.LINEAR_MIPMAP_LINEAR,moderngl.LINEAR);textures[key]=tex
neutral=ctx.texture((1,1),4,bytes([255,255,255,255]));shadow=ctx.depth_texture((1536,1536));shadow.compare_func='';shadow.repeat_x=shadow.repeat_y=False;shadow_fbo=ctx.framebuffer(depth_attachment=shadow);shadow_fbo.use();shadow_fbo.clear(depth=1)
for node in D['nodes']:
 depth_program['model'].write(np.array(node['matrix'],dtype='f4').tobytes());geos[node['geometry']][1].render()
shadow.use(1);fbo=ctx.simple_framebuffer(size,components=4,samples=4);fbo.use();fbo.clear(0,0,0,0,depth=1)
for node in D['nodes']:
 m=D['materials'][node['material']];program['model'].write(np.array(node['matrix'],dtype='f4').tobytes());program['color'].value=m['color'];program['metal'].value=m['metalness'];program['rough'].value=m['roughness'];program['coat'].value=m['coat'];program['mapped'].value=bool(m['map']);(textures[m['map']]if m['map']else neutral).use(0);geos[node['geometry']][0].render()
resolved=ctx.simple_framebuffer(size,components=4);ctx.copy_framebuffer(resolved,fbo);image=Image.frombytes('RGBA',size,resolved.read(components=4)).transpose(Image.Transpose.FLIP_TOP_BOTTOM);image.save(out,quality=93,method=6)
bg=Image.new('RGBA',size,'#251d22');bg.alpha_composite(image);bg.convert('RGB').save(out.with_suffix('.jpg'));print('Rendered refined council board and material study:',out)
