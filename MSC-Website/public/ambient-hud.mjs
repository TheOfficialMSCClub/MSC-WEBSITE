import {siteMotion} from './site-motion.mjs';
import {seeded} from './motion-math.mjs';
const reduced=siteMotion;let paused=false,heroPaused=false;
const fields=[];
export function drawAmbient(ctx,w,h,time,pointer={x:0,y:0},hero=false){
 ctx.clearRect(0,0,w,h);
 const cx=w*(hero?.66:.64)+pointer.x*12,cy=h*.53+pointer.y*9,r=Math.min(w*.37,h*.48),t=time;
 const path=(pts,color,width=.6)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
 const arc=(radius,a,b,color,width=.8)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(cx,cy,radius,a,b);ctx.stroke();};
 // Full-bleed instrument field: nested interrupted traces, light ticks, and moving scans.
 for(let i=0;i<120;i++){
  const a=i/120*Math.PI*2,len=i%10===0?13:i%5===0?7:2;
  path([[cx+Math.cos(a)*r*1.16,cy+Math.sin(a)*r*1.16],[cx+Math.cos(a)*(r*1.16+len),cy+Math.sin(a)*(r*1.16+len)]],i%10===0?'#d6b7a4a0':'#c2a59066');
 }
 for(let i=0;i<4;i++){
  const a=t*(i%2?.055:-.035)+i*1.7;arc(r*(.68+i*.105),a,a+Math.PI*(.29+i*.04),'#c6a39c88',i===2?1:.5);
  arc(r*(.68+i*.105),a+Math.PI,a+Math.PI*1.19,'#d8beb499',.65);
 }
 const scan=t*.32;path([[cx-Math.cos(scan)*r,cy-Math.sin(scan)*r],[cx+Math.cos(scan)*r,cy+Math.sin(scan)*r]],'#d5aea34a',.6);
 // Dense rotating circuit/neuronal lattice stays behind the club copy.
 const points=[],angle=t*.035+pointer.x*.07,ca=Math.cos(angle),sa=Math.sin(angle);
 for(let i=0;i<180;i++){
  const u=seeded(i+31)*Math.PI*2,v=Math.acos(2*seeded(i+811)-1),side=i%2?1:-1;
  const x=side*(.04+Math.abs(Math.sin(v)*Math.cos(u))*.70),y=Math.cos(v)*.76,z=Math.sin(v)*Math.sin(u)*.42;
  points.push({x:cx+(x*ca+z*sa)*r*.92,y:cy-y*r*.92,z:-x*sa+z*ca});
 }
 for(let i=0;i<points.length;i++){
  const p=points[i];for(let j=i+1;j<Math.min(i+10,points.length);j++){
   const q=points[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<r*.28){path([[p.x,p.y],[q.x,q.y]],'#c2b69a55',.5);if((i+j)%23===0){const k=(t*.17+seeded(i))%1;ctx.fillStyle='#e0beb1b0';ctx.beginPath();ctx.arc(p.x+(q.x-p.x)*k,p.y+(q.y-p.y)*k,1.1,0,Math.PI*2);ctx.fill();}}
  }
  ctx.fillStyle=p.z>0?'#ccb8a38c':'#c3b8a052';ctx.beginPath();ctx.arc(p.x,p.y,i%11===0?1.7:.7,0,Math.PI*2);ctx.fill();
 }
 // Margin annotations, traced circuits and tiny registers are part of the environment.
 ctx.font=`${Math.max(7,Math.min(9,w/125))}px "Courier New",monospace`;ctx.fillStyle='#c4b39aaa';ctx.textAlign='left';
 const labels=['PERSPECTIVE','CONNECTIONS','PRACTICE','MSC / UTSC'];
 for(let i=0;i<4;i++){
  const x=i%2?w*.88:w*.14,y=h*(.20+Math.floor(i/2)*.59),direction=i%2?-1:1;
  path([[x,y],[x+direction*w*.06,y],[x+direction*w*.10,y+direction*h*.055]],'#c2a99e88',.7);
  ctx.textAlign=i%2?'right':'left';ctx.fillText(labels[i],x,y-10);
  for(let k=0;k<16;k++){ctx.fillStyle=k%4?'#c7b8a166':'#d7aba199';ctx.fillRect(x+direction*k*3,y+12,1,3+seeded(k+i*21)*9);}
 }
 ctx.textAlign='left';ctx.fillStyle='#c4b39a80';ctx.fillText('MANAGEMENT STRATEGY COUNCIL',w*.57,h*.91);
 for(let i=0;i<7;i++){const y=h*(.26+i*.068);path([[w*.04,y],[w*.065,y],[w*.075,y+7],[w*.11,y+7]],'#b29e9560');}
 // Peripheral interface traces are deliberately unframed background instruments.
 const panelX=w*.79,panelY=h*.30,panelW=w*.16,panelH=h*.15;
 path([[panelX,panelY+10],[panelX,panelY],[panelX+panelW,panelY],[panelX+panelW,panelY+panelH],[panelX+panelW-12,panelY+panelH]],'#c9ad9d66',.7);
 ctx.textAlign='left';ctx.fillStyle='#cfbba18c';ctx.fillText('COUNCIL / CONNECTIONS',panelX+9,panelY+17);
 for(let row=0;row<3;row++){
  const y=panelY+34+row*18,pts=[];for(let n=0;n<38;n++){const x=panelX+9+n*(panelW-18)/37,signal=Math.sin(n*.50+t*(.65+row*.12)+row)*Math.sin(n*.14+row);pts.push([x,y+signal*4]);}path(pts,row===1?'#d2b3a37c':'#bfae9552',.7);
 }
 const codes=['CP','CR','FN','OP','EV','MK'],baseX=w*.08,baseY=h*.77;
 ctx.fillStyle='#c4b39a88';ctx.fillText('THE COUNCIL / 2026–27',baseX,baseY-24);
 for(let i=0;i<6;i++){const x=baseX+i*w*.034,y=baseY+(i%2?9:-5);path([[x,baseY-10],[x,y+15]],'#c2a99e77',.6);ctx.textAlign='center';ctx.fillStyle='#d0b6a281';ctx.fillText(codes[i],x,y+30);if(i<5)path([[x,y],[x+w*.017,y],[x+w*.017,baseY+(i%2?-5:9)],[x+w*.034,baseY+(i%2?-5:9)]],'#c2a99e66',.6);}
 if(pointer.x||pointer.y){const px=w*(pointer.x+1)/2,py=h*(pointer.y+1)/2;path([[px-10,py],[px+10,py]],'#dfb7a953');path([[px,py-10],[px,py+10]],'#dfb7a953');}
}
function initialize(canvas){
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const host=canvas.parentElement,hero=canvas.dataset.ambient==='hero';let visible=false,raf=0,last=0,time=0,w=1,h=1,ratio=1,pointer={x:0,y:0};
 const still=()=>paused||reduced.matches||(hero&&heroPaused);
 function draw(stamp){raf=0;if(!visible||document.hidden)return;if(last&&stamp-last<32&&!still()){wake();return;}const dt=last?Math.min((stamp-last)/1000,.06):0;last=stamp;if(!still())time+=dt;ctx.setTransform(ratio,0,0,ratio,0,0);drawAmbient(ctx,w,h,time,still()?{x:0,y:0}:pointer,hero);if(!still())wake();}
 function wake(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
 function resize(){w=host.clientWidth;h=host.clientHeight;ratio=Math.min(devicePixelRatio||1,innerWidth<=760?1:1.5);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);last=0;wake();}
 host.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||still())return;const box=host.getBoundingClientRect();pointer={x:(event.clientX-box.left)/box.width*2-1,y:(event.clientY-box.top)/box.height*2-1};wake();},{passive:true});host.addEventListener('pointerleave',()=>{pointer={x:0,y:0};wake();});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;wake();}else{cancelAnimationFrame(raf);raf=0;last=0;}},{rootMargin:'40px'}).observe(host);
 new ResizeObserver(resize).observe(host);fields.push({wake,reset(){last=0;wake();}});resize();
}
for(const canvas of document.querySelectorAll('.ambient-hud'))initialize(canvas);
const button=document.querySelector('#ambient-motion');
function controls(){if(button){button.disabled=reduced.matches;button.textContent=reduced.matches?'Still background':paused?'Resume background ▶':'Pause background Ⅱ';button.setAttribute('aria-pressed',String(paused||reduced.matches));button.setAttribute('aria-label',paused?'Resume animated background':'Pause animated background');}for(const field of fields)field.reset();}
button?.addEventListener('click',()=>{paused=!paused;controls();});
document.addEventListener('msc:hero-motion',event=>{heroPaused=!!event.detail?.paused;for(const field of fields)field.reset();});
reduced.addEventListener('change',controls);document.addEventListener('visibilitychange',()=>{for(const field of fields)field.reset();});controls();
