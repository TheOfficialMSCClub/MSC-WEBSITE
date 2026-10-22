"""Checks the retained physical shell and camera choreography. Paper handoff is checked in JS."""
import math
from case_motion import case_pose
for progress in [0,.1,.2,.35]:
 pose=case_pose(progress)
 assert pose['camera']==(-3.6,-11.,8.)
 assert pose['rotation']==(.025,-.19,-.015)
 assert pose['scale']==10.8
relative=lambda v:math.degrees(math.atan2(v['camera'][0],-v['camera'][1])-v['rotation'][1])
assert abs(relative(case_pose(.65))-relative(case_pose(.36)))>60
assert abs(relative(case_pose(1))-relative(case_pose(.65)))>70
for i in range(141):
 pose=case_pose(i/140)
 assert all(math.isfinite(x)for x in pose['camera']+pose['rotation']+pose['target'])
print('PASS: retained opening camera movement, pronounced orbit and return, finite poses.')
