import bpy,json,math,os,sys
from mathutils import Matrix,Vector
args=sys.argv[sys.argv.index('--')+1:]
source,out=args[:2]
preview='--preview' in args
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
D=json.load(open(source));C=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
materials={}
for key,m in D['materials'].items():
 mat=bpy.data.materials.new('Aluminium' if m['metalness']>.8 else 'Felt' if m['sheen'] else 'Hardware');mat.use_nodes=True
 nodes=mat.node_tree.nodes;links=mat.node_tree.links;bsdf=nodes.get('Principled BSDF')
 bsdf.inputs['Base Color'].default_value=(*m['color'],1);bsdf.inputs['Metallic'].default_value=m['metalness'];bsdf.inputs['Roughness'].default_value=m['roughness']
 if m['anisotropy']:bsdf.inputs['Anisotropic'].default_value=.55
 if m['sheen']:
  bsdf.inputs['Sheen Weight'].default_value=.20;bsdf.inputs['Sheen Roughness'].default_value=.85;bsdf.inputs['Sheen Tint'].default_value=(*m['color'],1)
 if m['anisotropy'] or m['sheen'] or m['metalness']<.2:
  coord=nodes.new('ShaderNodeTexCoord');mult=nodes.new('ShaderNodeVectorMath');mult.operation='MULTIPLY';mult.inputs[1].default_value=(3,320,3) if m['anisotropy'] else (220,220,220)
  links.new(coord.outputs['Generated'],mult.inputs[0]);noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=2;noise.inputs['Detail'].default_value=2;links.new(mult.outputs['Vector'],noise.inputs['Vector'])
  bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.16 if m['sheen'] else .075;bump.inputs['Distance'].default_value=.009 if m['sheen'] else .004;links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
  if m['anisotropy']:
   ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(.22,.22,.22,1);ramp.color_ramp.elements[1].color=(.40,.40,.40,1);links.new(noise.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs['Color'],bsdf.inputs['Roughness'])
 materials[key]=mat
meshes={}
for key,g in D['geometry'].items():
 verts=[(g['position'][i],-g['position'][i+2],g['position'][i+1]) for i in range(0,len(g['position']),3)]
 ids=g['index'] or list(range(len(verts)));faces=[ids[i:i+3] for i in range(0,len(ids),3)]
 mesh=bpy.data.meshes.new(key);mesh.from_pydata(verts,[],faces);mesh.update()
 for poly in mesh.polygons:poly.use_smooth=True
 normal=g['normal'];ns=[(normal[i],-normal[i+2],normal[i+1]) for i in range(0,len(normal),3)]
 mesh.normals_split_custom_set([ns[l.vertex_index] for l in mesh.loops])
 if g['uv']:
  uv=mesh.uv_layers.new(name='UVMap')
  for i,loop in enumerate(mesh.loops):uv.data[i].uv=g['uv'][loop.vertex_index*2:loop.vertex_index*2+2]
 meshes[key]=mesh
objects=[];byid={}
for entry in D['nodes']:
 data=meshes.get(entry.get('geometry'));obj=bpy.data.objects.new(entry['name'],data);bpy.context.collection.objects.link(obj)
 if entry['parent']>=0:obj.parent=objects[entry['parent']]
 raw=entry['matrix'];mat=Matrix([[raw[col*4+row] for col in range(4)] for row in range(4)])
 obj.matrix_local=C@mat@C.inverted()
 if entry.get('material'):
  obj.data=obj.data.copy();obj.data.materials.append(materials[entry['material']])
 objects.append(obj);byid[entry['id']]=obj
root=byid[D['rootId']];hinge=byid[D['hingeId']]
lid=next(o for o in objects if o.name.startswith('Lid with document'))
ink=bpy.data.materials.new('Etched maker mark');ink.diffuse_color=(.025,.025,.025,1)
def lettering(text,size,loc,mat,reverse=False):
 curve=bpy.data.curves.new('Maker mark','FONT');curve.body=text;curve.align_x='CENTER';curve.size=size;curve.extrude=.0002
 obj=bpy.data.objects.new('Maker mark',curve);bpy.context.collection.objects.link(obj);obj.parent=lid;obj.location=loc
 if reverse:obj.rotation_euler=(math.pi,0,0)
 curve.materials.append(mat)
lettering('MSC',.28,(0,.025,.423),ink)
lettering('MANAGEMENT STRATEGY COUNCIL',.034,(0,-.08,.423),ink)

# True transparent studio render. A Cycles shadow catcher introduced a low-alpha
# black matte over the entire image, visible as a rectangle on the hero gradient.
# Self-shadowing stays physical; no ground plane is composited into the asset.
world=bpy.data.worlds.new('Studio world');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.65,.65,1);world.node_tree.nodes['Background'].inputs[1].default_value=.18;bpy.context.scene.world=world

def area(name,pos,power,size,color=(1,1,1),size_y=None):
 light=bpy.data.lights.new(name,'AREA');light.energy=power;light.color=color;light.shape='RECTANGLE';light.size=size;light.size_y=size_y or size
 obj=bpy.data.objects.new(name,light);bpy.context.collection.objects.link(obj);obj.location=pos;obj.rotation_euler=(Vector((0,0,.6))-obj.location).to_track_quat('-Z','Y').to_euler()
area('Large photographic key',(-3,-4,7),850,5,(1,.96,.89),3)
area('Long top reflection',(1,3,6),1100,5,(1,1,1),1.4)
area('Vertical edge strip',(5,-1,3),700,1.2,(.94,.97,1),5)
area('Front bounce',(-2,-7,2),130,4,(1,1,1),2)
cam=bpy.data.cameras.new('Product camera');camera=bpy.data.objects.new('Product camera',cam);bpy.context.collection.objects.link(camera);camera.location=(-3.5,-11,8);target=Vector((0,0,1.85));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();cam.type='ORTHO';cam.ortho_scale=11.3;bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.cycles.max_bounces=7;scene.cycles.transparent_max_bounces=4
scene.render.resolution_x=1200;scene.render.resolution_y=800;scene.render.resolution_percentage=75;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.threads_mode='FIXED';scene.render.threads=8
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.20
os.makedirs(out,exist_ok=True)
frames=[40] if preview else range(41)
for i in frames:
 p=i/40
 root.rotation_euler=(C@Matrix.Rotation(.035,4,'X')@Matrix.Rotation(-.12+p*.16,4,'Y')@Matrix.Rotation(-.015+p*.025,4,'Z')@C.inverted()).to_euler()
 root.location=(0,0,0)
 # Smooth physical hinge movement, without changing the shell between frames.
 t=max(0,min(1,(p-.08)/(.85-.08)));opening=t*t*(3-2*t)
 hinge.rotation_euler=(C@Matrix.Rotation(-(.13+opening*1.72),4,'X')@C.inverted()).to_euler()
 scene.render.filepath=os.path.join(out,f'{i:03}.png');bpy.ops.render.render(write_still=True)
 print('FRAME_DONE',i,flush=True)
