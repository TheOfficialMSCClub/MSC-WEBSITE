"""Higher fidelity studio film: 141 poses, directional metal grain and sewn lining."""
from pathlib import Path
# Reuse the same exact shell, mechanical pivot and interior props.
base=Path(__file__).with_name('render-cinematic-case.py').read_text()
exec(compile(base.split("world=bpy.data.worlds.new('Photographic studio')")[0],str(Path(__file__).with_name('render-cinematic-case.py')),'exec'))
for key,mat in materials.items():
 spec=D['materials'][key];nodes=mat.node_tree.nodes;links=mat.node_tree.links;bs=nodes.get('Principled BSDF')
 if spec['metalness']>.8:
  bs.inputs['Anisotropic'].default_value=.62
  coord=nodes.new('ShaderNodeTexCoord');stretch=nodes.new('ShaderNodeVectorMath');stretch.operation='MULTIPLY';stretch.inputs[1].default_value=(8,1200,8);links.new(coord.outputs['Generated'],stretch.inputs[0])
  noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=2;noise.inputs['Detail'].default_value=3;links.new(stretch.outputs['Vector'],noise.inputs['Vector'])
  bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.10;bump.inputs['Distance'].default_value=.002;links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bs.inputs['Normal'])
  ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(.20,.20,.20,1);ramp.color_ramp.elements[1].color=(.38,.38,.38,1);links.new(noise.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs['Color'],bs.inputs['Roughness'])
 if spec['sheen']:
  bs.inputs['Base Color'].default_value=(.095,.007,.019,1);bs.inputs['Sheen Weight'].default_value=.32;bs.inputs['Sheen Roughness'].default_value=.68
  coord=nodes.new('ShaderNodeTexCoord');wave=nodes.new('ShaderNodeTexWave');wave.wave_type='BANDS';wave.bands_direction='DIAGONAL';wave.inputs['Scale'].default_value=195;wave.inputs['Distortion'].default_value=1.2;links.new(coord.outputs['Generated'],wave.inputs['Vector'])
  bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.15;bump.inputs['Distance'].default_value=.004;links.new(wave.outputs['Color'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bs.inputs['Normal'])
threadmat=material('Saddle stitch pale burgundy',(.26,.067,.083),0,.95)
# Stitching follows the actual underside of the lid, including the pocket returns.
for x in [-2.38+i*.075 for i in range(65)]:
 for y in [-1.32,1.34]:line('Individual lid saddle stitch',[(x,y,-.038),(x+.029,y,-.038)],threadmat,.0024,lid)
for y in [-1.28+i*.075 for i in range(35)]:
 for x in [-2.40,2.40]:line('Stitched lining side return',[(x,y,-.038),(x,y+.029,-.038)],threadmat,.0024,lid)
# Reinforced leather pen sleeve and a fine engraved clip plate.
cube('Leather pen sleeve',(.31,.62,.035),(2.05,-.55,-.185),foldermat,bevel=.018)
for x in [1.91,2.19]:
 for y in [-.81+i*.065 for i in range(9)]:line('Pen sleeve stitching',[(x,y,-.161),(x,y+.024,-.161)],threadmat,.002)
# Sharper, raised letterpress uses the same authored words and positions.
for o in bpy.data.objects:
 if o.type=='FONT' and o.name not in ['Maker mark']:
  if o.data.size>.13:o.data.font=bpy.data.fonts.load('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf')
# Broad warm/cool photographic reflections give the metal its form.
world=bpy.data.worlds.new('Premium studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.52,.54,.57,1);world.node_tree.nodes['Background'].inputs[1].default_value=.17;bpy.context.scene.world=world

def area(name,pos,power,size,color=(1,1,1),size_y=None):
 l=bpy.data.lights.new(name,'AREA');l.energy=power;l.color=color;l.shape='RECTANGLE';l.size=size;l.size_y=size_y or size;o=bpy.data.objects.new(name,l);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,.6))-o.location).to_track_quat('-Z','Y').to_euler()
area('Silk key',(-4,-5,7),730,5,(1,.94,.85),2.4)
area('Window reflection',(1,4,7),1250,5,(.94,.97,1),1.1)
area('Vertical edge strip',(5,-1,3),820,.8,(.85,.92,1),4.5)
area('Soft front fill',(-2,-7,2),120,4,(1,.95,.9),2)
area('Warm edge separation',(-5,2,3),350,.7,(1,.87,.76),3)
cam=bpy.data.cameras.new('Premium camera');camera=bpy.data.objects.new('Premium camera',cam);bpy.context.collection.objects.link(camera);cam.type='ORTHO';bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=22;scene.cycles.use_denoising=True;scene.cycles.max_bounces=7;scene.cycles.transparent_max_bounces=4
scene.render.resolution_x=1440;scene.render.resolution_y=1200;scene.render.resolution_percentage=85;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.threads_mode='FIXED';scene.render.threads=8
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.25

def smooth(v,a,b):
 t=max(0,min(1,(v-a)/(b-a)));return t*t*(3-2*t)
os.makedirs(out,exist_ok=True)
frames=[0,48,92,140] if preview else range(141)
for i in frames:
 p=i/140;opening=smooth(p,.015,.36);orbit=smooth(p,.36,.66);close=smooth(p,.58,.91);reveal=smooth(p,.69,1)
 yaw=-.19+.46*orbit-.25*reveal
 root.rotation_euler=(C@Matrix.Rotation(.025,4,'X')@Matrix.Rotation(yaw,4,'Y')@Matrix.Rotation(-.015+.035*reveal,4,'Z')@C.inverted()).to_euler()
 hinge.rotation_euler=(C@Matrix.Rotation(-(.13+opening*1.79),4,'X')@C.inverted()).to_euler()
 camera.location=(-3.6+7.2*orbit,-11+1.4*close,8+2.1*close)
 target=Vector((-.08+.18*reveal,0,1.52+.32*reveal));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();cam.ortho_scale=10.8-.20*close
 for g,start,j in cards:
  t=smooth(p,.70+j*.035,.94+j*.025);g.location=start+Vector(((-.95+j*.65)*t,(-.20+j*.15)*t,(1.25+j*.30)*t));g.rotation_euler=(math.radians(7)*t,math.radians(-8+j*7)*t,math.radians(-14+j*15)*t)
 scene.render.filepath=os.path.join(out,f'{i:03}.png');bpy.ops.render.render(write_still=True);print('FRAME_DONE',i,flush=True)
