"""Matched clamshell halves and projected briefing-paper handoff anchors."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
from case_motion import case_pose
base=Path(__file__).with_name('render-premium-case.py').read_text()
exec(compile(base.split('frames=[0,48,92,140]')[0],str(Path(__file__).with_name('render-premium-case.py')),'exec'))
# A square transparent source frame gives the stronger orbit room above the lid.
# The horizontal pixel scale matches the approved film.
scene.render.resolution_y=1440
from bpy_extras.object_utils import world_to_camera_view
import json
frames=[0,27,35,60,75,96,115,140] if preview else range(141)
launches=[.15,.43,.68]
for i in frames:
 existing=Path(out)/f'{i:03}.png'
 if '--resume' in args and existing.is_file() and existing.read_bytes()[-12:-4]==b'\x00\x00\x00\x00IEND':continue
 pose=case_pose(i/140);rx,ry,rz=pose['rotation']
 root.rotation_euler=(C@Matrix.Rotation(rx,4,'X')@Matrix.Rotation(ry,4,'Y')@Matrix.Rotation(rz,4,'Z')@C.inverted()).to_euler()
 hinge.rotation_euler=(C@Matrix.Rotation(pose['hinge'],4,'X')@C.inverted()).to_euler()
 camera.location=pose['camera'];target=Vector(pose['target']);camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();cam.ortho_scale=pose['scale']
 for g,start,j in cards:
  g.location=start;g.rotation_euler=(0,0,0)
  # The DOM takes over this exact projected sheet at liftoff, including its typography.
  for child in g.children:child.hide_render=i/140>=launches[j]
 bpy.context.view_layer.update()
 anchors=[]
 for g,start,j in cards:
  points=[]
  for corner in [(-.71,.46,.012),(.71,.46,.012),(.71,-.46,.012),(-.71,-.46,.012)]:
   point=world_to_camera_view(scene,camera,g.matrix_world@Vector(corner));points.append([point.x*1224,(1-point.y)*1224])
  anchors.append(points)
 (Path(out)/f'{i:03}.json').write_text(json.dumps({'papers':anchors}))
 scene.render.filepath=os.path.join(out,f'{i:03}.png');bpy.ops.render.render(write_still=True);print('FRAME_DONE',i,flush=True)
