import bpy,json,math,sys
from mathutils import Matrix,Vector
source,out=sys.argv[sys.argv.index('--')+1:][:2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
D=json.load(open(source));C=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)));mats={};geos={}
for key,m in D['materials'].items():
 mat=bpy.data.materials.new('Chess finish');mat.use_nodes=True;n=mat.node_tree.nodes['Principled BSDF'];n.inputs['Base Color'].default_value=(*m['color'],1);n.inputs['Metallic'].default_value=m['metalness'];n.inputs['Roughness'].default_value=m['roughness'];n.inputs['Coat Weight'].default_value=.22;mats[key]=mat
for key,g in D['geometry'].items():
 p=g['position'];verts=[(p[i],-p[i+2],p[i+1]) for i in range(0,len(p),3)];ids=g['index'] or list(range(len(verts)));mesh=bpy.data.meshes.new('Manufactured chess form');mesh.from_pydata(verts,[],[ids[i:i+3] for i in range(0,len(ids),3)]);mesh.update();normals=g['normal'];ns=[(normals[i],-normals[i+2],normals[i+1]) for i in range(0,len(normals),3)];mesh.normals_split_custom_set([ns[l.vertex_index] for l in mesh.loops]);geos[key]=mesh
for n in D['nodes']:
 mesh=geos[n['geometry']].copy();mesh.materials.append(mats[n['material']]);o=bpy.data.objects.new(n['name'],mesh);bpy.context.collection.objects.link(o);raw=n['matrix'];matrix=Matrix([[raw[col*4+row] for col in range(4)] for row in range(4)]);o.matrix_world=C@matrix@C.inverted()
world=bpy.data.worlds.new('Studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[1].default_value=.25;bpy.context.scene.world=world
for pos,power,size in [((-3,-5,9),1600,6),((6,3,6),1200,5)]:
 l=bpy.data.lights.new('Softbox','AREA');l.energy=power;l.size=size;o=bpy.data.objects.new('Softbox',l);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
c=bpy.data.cameras.new('Board camera');o=bpy.data.objects.new('Board camera',c);bpy.context.collection.objects.link(o);o.location=(8.9,-13.1,10.85);o.rotation_euler=(Vector((0,0,.3))-o.location).to_track_quat('-Z','Y').to_euler();c.type='ORTHO';c.ortho_scale=13.8
scene=bpy.context.scene;scene.camera=o;scene.render.engine='CYCLES';scene.cycles.samples=20;scene.cycles.use_denoising=True;scene.render.threads_mode='FIXED';scene.render.threads=2;scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=90;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=out;bpy.ops.render.render(write_still=True)
