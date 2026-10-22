"""Original detailed studio case. 101 transparent, camera-orbited contents frames."""
from pathlib import Path
# Keep the authored hollow shell and its exact mechanical geometry.
base=Path(__file__).with_name('render-case.py').read_text()
exec(compile(base.split('# True transparent studio render.')[0],str(Path(__file__).with_name('render-case.py')),'exec'))
from mathutils import Euler

def material(name,color,metal=0,rough=.5):
 mat=bpy.data.materials.new(name);mat.use_nodes=True;n=mat.node_tree.nodes['Principled BSDF'];n.inputs['Base Color'].default_value=(*color,1);n.inputs['Metallic'].default_value=metal;n.inputs['Roughness'].default_value=rough;return mat
paper=material('Warm uncoated paper',(.64,.59,.49),0,.91)
paperedge=material('Cut paper edges',(.52,.48,.39),0,.95)
printink=material('Printed maroon',(.022,.001,.004),0,.86)
mutedink=material('Printed fine rules',(.27,.22,.18),0,.9)
foldermat=material('Burgundy leather folio',(.07,.008,.018),0,.79)
steel=material('Pen brushed steel',(.47,.49,.51),1,.24)
black=material('Pen dark lacquer',(.018,.014,.012),.25,.22)
# Fine fibre bump catches the light without looking like a smooth plastic card.
for mat in [paper,foldermat]:
 nodes=mat.node_tree.nodes;links=mat.node_tree.links;bs=nodes.get('Principled BSDF');noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=280;noise.inputs['Detail'].default_value=2;bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.12;bump.inputs['Distance'].default_value=.003;links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bs.inputs['Normal'])
font=bpy.data.fonts.load('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf')
mono=bpy.data.fonts.load('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf')

def cube(name,dim,pos,mat,parent=root,bevel=.008):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=name;o.parent=parent;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.location=pos;o.data.materials.append(mat)
 if bevel:
  b=o.modifiers.new('Manufactured edge','BEVEL');b.width=bevel;b.segments=3;n=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return o

def text(body,size,pos,mat=printink,parent=root,typeface=font):
 d=bpy.data.curves.new('Letterpress '+body[:24],'FONT');d.body=body;d.size=size;d.font=typeface;d.extrude=.0001
 o=bpy.data.objects.new(body[:24],d);bpy.context.collection.objects.link(o);o.parent=parent;o.location=pos;d.materials.append(mat);return o

def line(name,points,mat=mutedink,width=.003,parent=root):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.bevel_depth=width;d.bevel_resolution=2;s=d.splines.new('POLY');s.points.add(len(points)-1)
 for p,v in zip(s.points,points):p.co=(*v,1)
 o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.parent=parent;d.materials.append(mat);return o

# Leather edge, layered paper fibres, fasteners, printed routes and physical cards.
folio=cube('Stitched leather field notebook',(3.68,2.61,.056),(-.36,.04,-.174),foldermat,bevel=.04)
for i in range(7):cube('Notebook paper layer',(3.50,2.43,.005),(-.36,.04,-.141+i*.006),paper if i%2 else paperedge,bevel=.012)
cube('Notebook cover sheet',(3.51,2.44,.009),(-.36,.04,-.095),paper,bevel=.012)
text('MSC / FIELD NOTES',.093,(-1.96,1.03,-.087),typeface=mono)
text('The next move.',.24,(-1.94,.63,-.087))
text('QUESTIONS. EVIDENCE. DIRECTION.',.059,(-1.94,.39,-.087),mutedink,typeface=mono)
for y in [-.05,-.23,-.41,-.59,-.77]:line('Ruled notebook line',[(-1.94,y,-.087),(1.22,y,-.087)],width=.0018)
for x in [-1.92+i*.083 for i in range(38)]:line('Leather saddle stitch',[(x,-1.20,-.139),(x+.034,-1.20,-.139)],materials[next(k for k,v in D['materials'].items() if v['sheen'])],.003)
# Pen with separate lacquer barrel, ferrules, nib, end cap and spring clip.
for y,length,radius,mat in [(-.28,1.66,.063,black),(.64,.19,.068,steel),(-1.14,.09,.065,steel)]:
 bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=radius,depth=length);o=bpy.context.object;o.name='Fountain pen component';o.parent=root;o.rotation_euler.x=math.pi/2;o.location=(2.05,y,-.10);o.data.materials.append(mat)
line('Pen pocket clip',[(2.05,.54,-.03),(2.05,.01,-.023),(2.05,-.03,-.065)],steel,.013)
for y in [.58,.61,.64]:line('Machined pen ring',[(2.0,y,-.05),(2.1,y,-.05)],steel,.004)
# Content cards lift out along staggered curved paths. The silhouette stays the same case.
cards=[]
for j,(label,sub,pos) in enumerate([
 ('LEARN','01 / OPEN YOUR PERSPECTIVE',(-1.20,-.50,-.065)),
 ('NETWORK','02 / FIND YOUR PEOPLE',(.38,-.58,-.045)),
 ('SUCCEED','03 / IDEAS INTO PRACTICE',(-.38,.35,-.025))]):
 g=bpy.data.objects.new('Briefing card '+label,None);bpy.context.collection.objects.link(g);g.parent=root;g.location=pos
 cube('Cotton briefing card',(1.42,.92,.018),(0,0,0),paper,parent=g,bevel=.018)
 cube('Paper edge',(1.415,.915,.006),(0,0,-.01),paperedge,parent=g,bevel=.012)
 text('MANAGEMENT STRATEGY COUNCIL',.029,(-.61,.32,.012),mutedink,g,mono)
 text(label,.155,(-.61,.09,.012),printink,g)
 text(sub,.036,(-.61,-.08,.012),mutedink,g,mono)
 line('Briefing rule',[(-.61,-.16,.012),(.61,-.16,.012)],printink,.003,g)
 for k in range(3):line('Briefing content',[(-.61,-.24-k*.06,.012),(.39-k*.12,-.24-k*.06,.012)],mutedink,.0018,g)
 cards.append((g,Vector(pos),j))
# More visible perimeter screws and subtly varied anisotropic metal surfaces.
for mat in materials.values():
 n=mat.node_tree.nodes.get('Principled BSDF')
 if n and n.inputs['Metallic'].default_value>.8:
  n.inputs['Coat Weight'].default_value=.08;n.inputs['Coat Roughness'].default_value=.28

world=bpy.data.worlds.new('Photographic studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.65,.65,1);world.node_tree.nodes['Background'].inputs[1].default_value=.18;bpy.context.scene.world=world

def area(name,pos,power,size,color=(1,1,1),size_y=None):
 l=bpy.data.lights.new(name,'AREA');l.energy=power;l.color=color;l.shape='RECTANGLE';l.size=size;l.size_y=size_y or size;o=bpy.data.objects.new(name,l);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,.6))-o.location).to_track_quat('-Z','Y').to_euler()
area('Soft photographic key',(-3,-4,7),900,5,(1,.96,.9),3)
area('Long silver reflection',(1,3,6),1150,5,(1,1,1),1.4)
area('Edge strip',(5,-1,3),760,1.2,(.94,.97,1),5)
area('Front bounce',(-2,-7,2),180,4,(1,1,1),2)
cam=bpy.data.cameras.new('Moving product camera');camera=bpy.data.objects.new('Moving product camera',cam);bpy.context.collection.objects.link(camera);cam.type='ORTHO';bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=28;scene.cycles.use_denoising=True;scene.cycles.max_bounces=7;scene.cycles.transparent_max_bounces=4
scene.render.resolution_x=1320;scene.render.resolution_y=1100;scene.render.resolution_percentage=80;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.threads_mode='FIXED';scene.render.threads=8
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.16

def smooth(v,a,b):
 t=max(0,min(1,(v-a)/(b-a)));return t*t*(3-2*t)
os.makedirs(out,exist_ok=True)
frames=[0,34,66,100] if preview else range(101)
for i in frames:
 p=i/100;opening=smooth(p,.015,.36);orbit=smooth(p,.36,.66);close=smooth(p,.58,.91);reveal=smooth(p,.69,1)
 yaw=-.19+.46*orbit-.25*reveal
 root.rotation_euler=(C@Matrix.Rotation(.025,4,'X')@Matrix.Rotation(yaw,4,'Y')@Matrix.Rotation(-.015+.035*reveal,4,'Z')@C.inverted()).to_euler()
 hinge.rotation_euler=(C@Matrix.Rotation(-(.13+opening*1.79),4,'X')@C.inverted()).to_euler()
 # Orbit to the opposite side and move higher over the contents, then approach.
 camera.location=(-3.6+7.2*orbit,-11+1.4*close,8+2.1*close)
 target=Vector((-.08+.18*reveal,0,1.52+.32*reveal));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();cam.ortho_scale=10.8-.20*close
 for g,start,j in cards:
  t=smooth(p,.70+j*.035,.94+j*.025)
  g.location=start+Vector(((-.95+j*.65)*t,(-.20+j*.15)*t,(1.25+j*.30)*t))
  g.rotation_euler=(math.radians(7)*t,math.radians(-8+j*7)*t,math.radians(-14+j*15)*t)
 scene.render.filepath=os.path.join(out,f'{i:03}.png');bpy.ops.render.render(write_still=True);print('FRAME_DONE',i,flush=True)
