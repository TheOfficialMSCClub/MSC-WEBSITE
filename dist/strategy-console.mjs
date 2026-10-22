import {seeded,clamp,smooth} from './motion-math.mjs';
const section=document.querySelector('.strategy-console'),shell=section?.querySelector('.console-shell'),canvas=section?.querySelector('#console-canvas');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let ctx=canvas?.getContext('2d',{alpha:true}),visible=false,paused=false,raf=0,last=0,clock=0,boot=0,w=1,h=1,ratio=1,selected=0,departments=[],members=[],pointer={x:0,y:0},yaw=0,pitch=0;

const nodes=Array.from({length:228},(_,i)=>{
 const side=i%2?-1:1,u=seeded(i)*Math.PI*2,v=Math.acos(2*seeded(i+500)-1);
 return {x:side*(.045+Math.abs(Math.sin(v)*Math.cos(u))*.715),y:Math.cos(v)*.76,z:Math.sin(v)*Math.sin(u)*.55,group:i%6};
});
const edges=[];
for(let i=0;i<nodes.length;i++){
 const nearest=nodes.map((p,j)=>({j,d:Math.hypot(nodes[i].x-p.x,nodes[i].y-p.y,nodes[i].z-p.z)})).filter(p=>p.j>i&&p.d<.29).sort((a,b)=>a.d-b.d).slice(0,3);
 for(const item of nearest)edges.push([i,item.j]);
}
function line(x1,y1,x2,y2,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function ring(x,y,r,a,b,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,r,a,b);ctx.stroke();}
function draw(time){
 raf=0;if(!ctx||!visible||document.hidden)return;
 const dt=last?Math.min((time-last)/1000,.045):1/60;last=time;
 const moving=!paused&&!reduced.matches;
 if(moving){clock+=dt;boot=Math.min(1,boot+dt*.8);yaw+=(pointer.x*.23-yaw)*Math.min(1,dt*5);pitch+=(pointer.y*.12-pitch)*Math.min(1,dt*5);}else if(reduced.matches)boot=1;
 ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
 const cx=w/2,cy=h*.49,r=Math.min(w*.35,h*.35),reveal=smooth(boot,0,.65),spin=moving?clock*.045:clock*.045;
 // Instrument ticks, segmented arcs and a scanning sweep are drawn at pixel precision.
 for(let i=0;i<96;i++){
  const a=i/96*Math.PI*2,ra=r*1.28,rb=ra+(i%8===0?9:i%4===0?5:2);
  line(cx+Math.cos(a)*ra,cy+Math.sin(a)*ra,cx+Math.cos(a)*rb,cy+Math.sin(a)*rb,i%8===0?'#9c8e7c80':'#b6b5a328',.75);
 }
 ring(cx,cy,r*1.12,-Math.PI*.76,-Math.PI*.23,'#bc8f9560');ring(cx,cy,r*1.12,Math.PI*.24,Math.PI*.78,'#bc8f9560');
 ring(cx,cy,r*1.37,spin,spin+.28,'#dbc1b6b0',1.5);ring(cx,cy,r*1.37,spin+Math.PI,spin+Math.PI+.44,'#dbc1b675',1);
 const count=members.filter(m=>m.department===departments[selected]?.name).length||2;
 ring(cx,cy,r*1.18,-Math.PI/2,-Math.PI/2+Math.PI*2*(count/Math.max(17,members.length))*reveal,'#c08a95',2);
 const sweep=clock*.58-Math.PI*.5;
 if(moving){const gradient=ctx.createConicGradient(sweep,cx,cy);gradient.addColorStop(0,'#d1a1ab14');gradient.addColorStop(.10,'#d1a1ab00');gradient.addColorStop(1,'#d1a1ab00');ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(cx,cy,r*1.27,0,Math.PI*2);ctx.fill();line(cx,cy,cx+Math.cos(sweep)*r*1.25,cy+Math.sin(sweep)*r*1.25,'#d2aba923',.7);}
 const angle=clock*.075+yaw,ca=Math.cos(angle),sa=Math.sin(angle),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const projected=nodes.map(p=>{const x=p.x*ca+p.z*sa,z=-p.x*sa+p.z*ca,y=p.y*cp-z*sp,zz=p.y*sp+z*cp;return {x:cx+x*r*1.15,y:cy-y*r*1.15,z:zz,group:p.group};});
 let e=0;
 for(const [a,b]of edges){
  if(e++/edges.length>reveal)break;
  const p=projected[a],q=projected[b],focused=p.group===selected||q.group===selected;
  line(p.x,p.y,q.x,q.y,focused?'#c898a56b':'#c7c8b522',focused?.8:.55);
  if(focused&&(a+b)%17===0&&moving){const t=(clock*.26+seeded(a))%1;ctx.fillStyle='#f0d3cb';ctx.beginPath();ctx.arc(p.x+(q.x-p.x)*t,p.y+(q.y-p.y)*t,1.6,0,Math.PI*2);ctx.fill();}
 }
 for(let i=0;i<projected.length*reveal;i++){
  const p=projected[i],focus=p.group===selected;ctx.fillStyle=focus?'#dfb7b5':p.z>0?'#b9bca670':'#87947e30';ctx.beginPath();ctx.arc(p.x,p.y,focus?1.65:1,0,Math.PI*2);ctx.fill();
 }
 // Six indexed department anchors. Their focus follows the actual directory selection.
 for(let i=0;i<6;i++){
  const a=-Math.PI/2+i*Math.PI/3,x=cx+Math.cos(a)*r*1.35,y=cy+Math.sin(a)*r*1.18,focus=i===selected;
  const nx=cx+Math.cos(a)*r*.6,ny=cy+Math.sin(a)*r*.6;
  line(nx,ny,x,y,focus?'#d0a3a79a':'#89937c36',.65);ring(x,y,focus?5:3,0,Math.PI*2,focus?'#f3c4c0':'#89937c80',1);
  ctx.font=`${Math.max(7,Math.min(9,w/60))}px "Courier New",monospace`;ctx.fillStyle=focus?'#ead6c9':'#8e9a83';ctx.textAlign=Math.cos(a)<-.2?'right':Math.cos(a)>.2?'left':'center';ctx.fillText(departments[i]?.code||['CP','CR','FN','OP','EV','MK'][i],x+(Math.cos(a)<-.2?-12:Math.cos(a)>.2?12:0),y+(Math.abs(Math.cos(a))<.2?-11:3));
 }
 const bars=48,bw=Math.max(1,(w-64)/bars);
 for(let i=0;i<bars;i++){const bh=3+(Math.sin(i*.7+clock*1.4)*.5+.5)*(i%7===0?17:8);ctx.fillStyle=i%8===selected?'#caa3a0a0':'#74816b40';ctx.fillRect(32+i*bw,h-21-bh,Math.max(1,bw-3),bh);}
 if(moving)wake();else last=0;
}
function wake(){if(ctx&&!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
function resize(){if(!ctx)return;const r=canvas.getBoundingClientRect();w=r.width;h=r.height;ratio=Math.min(devicePixelRatio||1,innerWidth<760?1.5:2);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);wake();}
function setMotion(){const still=paused||reduced.matches;shell.dataset.paused=String(still);const button=section.querySelector('#console-motion');button.disabled=reduced.matches;button.textContent=reduced.matches?'Still view':paused?'Resume motion ▶':'Pause motion Ⅱ';button.setAttribute('aria-pressed',String(still));button.setAttribute('aria-label',paused?'Resume strategy desk animation':'Pause strategy desk animation');if(still)boot=1;wake();}
function report(message){
 const el=section.querySelector('#console-terminal-text');
 // Update the live message once; the visual typing strip is a CSS reveal.
 el.textContent=message;el.classList.remove('terminal-reveal');if(!reduced.matches&&!paused){void el.offsetWidth;el.classList.add('terminal-reveal');}
}
function select(index){
 const department=departments[index];if(!department)return;selected=index;
 for(const [i,button]of [...section.querySelectorAll('[data-console-dept]')].entries())button.setAttribute('aria-pressed',String(i===index));
 const group=members.filter(m=>m.department===department.name);
 section.querySelector('#console-focus-label').textContent=department.name;
 section.querySelector('#console-focus-count').textContent=`${String(group.length).padStart(2,'0')} / ${members.length} people`;
 section.querySelector('#console-department-title').textContent=department.name;
 section.querySelector('#console-department-description').textContent=department.description;
 section.querySelector('#console-member-count').textContent=String(group.length).padStart(2,'0');
 const list=section.querySelector('#console-member-list');list.replaceChildren();
 for(const member of group){
  const button=document.createElement('button');button.className='console-person';button.setAttribute('aria-label',`Open ${member.name}’s council profile`);
  const name=document.createElement('span');name.textContent=member.name;const role=document.createElement('small');role.textContent=member.role;const arrow=document.createElement('i');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');button.append(name,role,arrow);
  button.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('msc:inspect-member',{detail:{id:member.id}})));list.append(button);
 }
 report(`${department.code} / ${department.name} selected. ${group.map(m=>m.name).join(' · ')}.`);shell.dataset.focus=department.code;wake();
}
async function init(){
 try{
  const response=await fetch('content.json');if(!response.ok)throw Error('Directory unavailable');const data=await response.json();departments=data.departments;members=data.members;
  const list=section.querySelector('#console-departments');list.replaceChildren();
  for(let i=0;i<departments.length;i++){
   const dept=departments[i],button=document.createElement('button');button.dataset.consoleDept=String(i);button.setAttribute('aria-pressed',String(i===0));
   const code=document.createElement('span');code.textContent=dept.code;const name=document.createElement('strong');name.textContent=dept.name;const number=document.createElement('small');number.textContent=String(members.filter(m=>m.department===dept.name).length).padStart(2,'0');button.append(code,name,number);button.addEventListener('click',()=>select(i));list.append(button);
  }
  select(0);if(ctx){shell.classList.add('console-ready');resize();new ResizeObserver(resize).observe(canvas);}
  setMotion();
 }catch(error){section.querySelector('#console-departments').textContent='Visit the portrait directory below.';section.querySelector('#console-motion').hidden=true;console.warn('Council desk directory unavailable.',error);}
}
if(section){
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;shell.dataset.visible=String(visible);if(visible)wake();else{cancelAnimationFrame(raf);raf=0;last=0;}},{rootMargin:'80px'}).observe(section);
 section.querySelector('#console-motion').addEventListener('click',()=>{paused=!paused;setMotion();});
 section.querySelector('.console-neural').addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const r=canvas.getBoundingClientRect();pointer={x:clamp((event.clientX-r.left)/r.width)*2-1,y:clamp((event.clientY-r.top)/r.height)*2-1};wake();},{passive:true});
 section.querySelector('.console-neural').addEventListener('pointerleave',()=>{pointer={x:0,y:0};wake();});
 document.addEventListener('visibilitychange',()=>{last=0;wake();});reduced.addEventListener('change',setMotion);init();
}
