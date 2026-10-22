const seed=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
export const evidencePins=[
 [.08,.15,'PERSPECTIVE'],[.32,.07,'QUESTIONS'],[.61,.09,'CO-PRESIDENTS'],[.91,.13,'CORPORATE RELATIONS'],
 [.96,.40,'MARKETING'],[.91,.72,'EVENTS'],[.74,.91,'OPERATIONS'],[.48,.93,'FINANCE'],
 [.20,.88,'CONNECTIONS'],[.04,.66,'FIELD NOTES'],[.06,.38,'IDEAS'],[.51,.56,'THE COUNCIL']
];
export function drawSuspectBoard(ctx,w,h,point={x:.72,y:.23}){
 ctx.clearRect(0,0,w,h);const mobile=w<760,cx=point.x*w,cy=point.y*h,scale=mobile?.72:1,pins=evidencePins.map(([x,y,label],i)=>({x:x*w,y:y*h,label,angle:(seed(i)-.5)*.18}));
 const thread=(path,alpha=1,width=1)=>{ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=`rgba(15,6,9,${.55*alpha})`;ctx.lineWidth=3*width*scale;ctx.translate(1,2);ctx.beginPath();path();ctx.stroke();ctx.translate(-1,-2);ctx.beginPath();path();ctx.strokeStyle=`rgba(177,48,59,${.8*alpha})`;ctx.lineWidth=1.35*width*scale;ctx.stroke();ctx.strokeStyle=`rgba(232,130,117,${.32*alpha})`;ctx.lineWidth=.35*width*scale;ctx.stroke();ctx.restore();};
 // Existing pin-to-pin connections give the board a readable network even at rest.
 for(const [a,b]of[[0,2],[2,4],[3,6],[4,7],[5,8],[6,9],[7,10],[8,11],[1,3],[10,1]]){
  const p=pins[a],q=pins[b];thread(()=>{ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo((p.x+q.x)/2,(p.y+q.y)/2+12*scale,q.x,q.y);},.34,.75);
 }
 // Every strand is tied to one moving pin, with only natural thread sag.
 pins.forEach((pin,i)=>{
  thread(()=>{ctx.moveTo(pin.x,pin.y);const sag=(6+seed(i+12)*13)*scale;ctx.bezierCurveTo(pin.x+(cx-pin.x)*.32,pin.y+(cy-pin.y)*.32+sag,pin.x+(cx-pin.x)*.78,pin.y+(cy-pin.y)*.78+sag*.25,cx,cy);},.65+(i%3)*.12);
 });
 // Small, physically pinned working notes stay in the margins, leaving the club copy clear.
 pins.forEach((pin,i)=>{
  if(i!==11){ctx.save();ctx.translate(pin.x,pin.y);ctx.rotate(pin.angle);const pw=(pin.label.length>15?140:104)*scale,ph=43*scale;ctx.fillStyle='#08060840';ctx.fillRect(-pw/2+3,4,pw,ph);ctx.fillStyle=i%3===0?'#b5a28a':'#d3c4aa';ctx.beginPath();ctx.moveTo(-pw/2,-3);ctx.lineTo(pw/2-3,-4);ctx.lineTo(pw/2+1,ph-1);ctx.lineTo(pw*.13,ph);ctx.lineTo(-pw/2+2,ph-2);ctx.closePath();ctx.fill();ctx.fillStyle='#594638';ctx.font=`${8.5*scale}px "Courier New",monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(pin.label,0,ph*.52);ctx.strokeStyle='#7b685755';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-pw*.35,ph*.78);ctx.lineTo(pw*.32,ph*.78);ctx.stroke();ctx.restore();}
  const shadow=ctx.createRadialGradient(pin.x+1,pin.y+2,0,pin.x+1,pin.y+2,6*scale);shadow.addColorStop(0,'#070306c9');shadow.addColorStop(1,'#07030600');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(pin.x+1,pin.y+2,6*scale,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7b202c';ctx.beginPath();ctx.arc(pin.x,pin.y,3.4*scale,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ecaba1';ctx.beginPath();ctx.arc(pin.x-scale,pin.y-scale,.85*scale,0,Math.PI*2);ctx.fill();
 });
 // A single dimensional red pushpin caps every thread endpoint.
 ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);
 const pinShadow=ctx.createRadialGradient(3,6,1,3,6,13);pinShadow.addColorStop(0,'#060205c0');pinShadow.addColorStop(1,'#06020500');ctx.fillStyle=pinShadow;ctx.beginPath();ctx.arc(3,6,13,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#a89685';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-2,6);ctx.stroke();
 ctx.fillStyle='#681722';ctx.beginPath();ctx.ellipse(0,1,6.2,5,0,0,Math.PI*2);ctx.fill();
 const enamel=ctx.createRadialGradient(-2,-3,.3,0,-1,6);enamel.addColorStop(0,'#f7afa0');enamel.addColorStop(.25,'#c84950');enamel.addColorStop(.7,'#982533');enamel.addColorStop(1,'#57101f');ctx.fillStyle=enamel;ctx.beginPath();ctx.arc(0,-1,5.5,0,Math.PI*2);ctx.fill();ctx.restore();

}
const scene=typeof document!=='undefined'?document.querySelector('[data-detective-scene]'):null;
if(scene){
 const canvas=scene.querySelector('.suspect-threads'),ctx=canvas.getContext('2d',{alpha:true}),button=scene.querySelector('.detective-motion'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer: fine)');
 let x=.72,y=.23,targetX=x,targetY=y,frame=0,last=0,visible=true,paused=false,w=1,h=1,ratio=1;
 const enabled=()=>!reduced.matches&&fine.matches&&!paused;
 function paint(){if(ctx){ctx.setTransform(ratio,0,0,ratio,0,0);drawSuspectBoard(ctx,w,h,{x,y});}scene.style.setProperty('--thread-x',x.toFixed(5));scene.style.setProperty('--thread-y',y.toFixed(5));}
 function tick(time){frame=0;if(!visible||document.hidden)return;const dt=last?Math.min((time-last)/1000,.05):1/60;last=time;const amount=1-Math.exp(-dt*8);x+=(targetX-x)*amount;y+=(targetY-y)*amount;if(Math.abs(targetX-x)<.00015)x=targetX;if(Math.abs(targetY-y)<.00015)y=targetY;paint();if(x!==targetX||y!==targetY)wake();else last=0;}
 function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
 function home(){targetX=.72;targetY=.23;wake();}
 function resize(){const box=scene.getBoundingClientRect();w=Math.max(1,box.width);h=Math.max(1,box.height);ratio=Math.min(devicePixelRatio||1,w<760?1.25:1.5);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);paint();}
 function controls(){button.disabled=reduced.matches;button.hidden=!fine.matches;button.setAttribute('aria-pressed',String(paused||reduced.matches));button.setAttribute('aria-label',paused?'Resume red-string movement':'Pause red-string movement');button.textContent=reduced.matches?'Still board':paused?'Resume threads ▶':'Pause threads Ⅱ';if(reduced.matches||!fine.matches){x=targetX=.72;y=targetY=.23;cancelAnimationFrame(frame);frame=0;paint();}else if(paused){targetX=x;targetY=y;cancelAnimationFrame(frame);frame=0;}}
 scene.addEventListener('pointermove',event=>{if(!enabled()||event.pointerType==='touch')return;const box=scene.getBoundingClientRect();targetX=Math.max(0,Math.min(1,(event.clientX-box.left)/box.width));targetY=Math.max(0,Math.min(1,(event.clientY-box.top)/box.height));wake();},{passive:true});scene.addEventListener('pointerleave',()=>{if(!paused)home();});button.addEventListener('click',()=>{paused=!paused;controls();});reduced.addEventListener('change',controls);fine.addEventListener('change',controls);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;wake();}else{cancelAnimationFrame(frame);frame=0;last=0;}},{rootMargin:'80px'}).observe(scene);
 new ResizeObserver(resize).observe(scene);document.addEventListener('visibilitychange',()=>{last=0;wake();});resize();controls();
}
