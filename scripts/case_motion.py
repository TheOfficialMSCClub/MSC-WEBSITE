"""Physical camera, shell and card choreography; the approved opening is unchanged."""
import math

def smooth(value, start, end):
 t=max(0,min(1,(value-start)/(end-start)))
 return t*t*(3-2*t)

def case_pose(progress):
 p=max(0,min(1,progress));opening=smooth(p,.015,.36);network=smooth(p,.36,.65);succeed=smooth(p,.66,1)
 cards=[]
 for j in range(3):
  t=smooth(p,.48+j*.035,.87+j*.04)
  cards.append({'offset':(([-1.25,.85,.10][j])*t+math.sin(math.pi*t)*(.25-j*.12),(-.60+j*.38)*t,(2.60+j*.55)*t+math.sin(math.pi*t)*.5),'rotation':(math.radians(-18+j*10)*t,math.radians(-24+j*19)*t,math.radians(-32+j*34)*t)})
 return {'rotation':(.025+.075*network-.10*succeed,-.19-.28*network+.62*succeed,-.015-.05*network+.08*succeed),'hinge':-(.13+opening*1.79),'camera':(-3.6+9.4*network-7.6*succeed,-11+1.2*network+1.4*succeed,8+1.8*network+2.7*succeed),'target':(-.08+.18*succeed,0,1.52+.32*succeed),'scale':10.8-.35*network-.35*succeed,'cards':cards}
