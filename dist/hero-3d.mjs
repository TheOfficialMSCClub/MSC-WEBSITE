import {createHeroStory} from './hero-story.mjs';
import {heroState} from './hero-timeline.mjs';
const hero = document.querySelector('.object-hero');
const stage = document.querySelector('.object-stage');
const mount = document.querySelector('#briefcase-scene');
const toggle = document.querySelector('#object-motion');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let paused = false;
let visible = true;
let frame = 0;
let draw;
let narrative=heroState(0);
const story=createHeroStory({hero,stage,mount,reduced,onChange(state){narrative=state;wake();}});

function updateToggle() {
  const still = paused || reduced.matches;
  toggle.setAttribute('aria-pressed',String(still));
  toggle.setAttribute('aria-label',still?'Enable 3D motion':'Pause 3D motion');
  toggle.innerHTML = `<span aria-hidden="true">${still?'▶':'Ⅱ'}</span><span>${still?'Motion off':'Motion on'}</span>`;
  toggle.disabled = reduced.matches;
}
toggle.addEventListener('click',()=>{paused=!paused;updateToggle();wake();});
reduced.addEventListener('change',()=>{updateToggle();wake();});
updateToggle();
function wake() { if(draw && !frame && visible && !document.hidden) frame=requestAnimationFrame(draw); }

async function init() {
  try {
    const [THREE,{createBriefcase},{RoomEnvironment}] = await Promise.all([
      import('./vendor/three/three.module.min.js'),import('./briefcase-model.mjs'),import('./vendor/three/RoomEnvironment.js')
    ]);
    const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.12;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(33,1,.1,90);
    const pmrem=new THREE.PMREMGenerator(renderer);
    const room=new RoomEnvironment();
    const environment=pmrem.fromScene(room,.06);
    scene.environment=environment.texture;
    room.dispose();pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xfff9ee,0x351018,1.5));
    const key=new THREE.DirectionalLight(0xfff7e9,2.8);key.position.set(-4,8,6);scene.add(key);
    const rim=new THREE.DirectionalLight(0xf2f3f4,2.3);rim.position.set(4,2,-5);scene.add(rim);

    function canvasTexture(width,height,paint,isColor=true) {
      const c=document.createElement('canvas');c.width=width;c.height=height;
      paint(c.getContext('2d'),width,height);
      const texture=new THREE.CanvasTexture(c);texture.colorSpace=isColor?THREE.SRGBColorSpace:THREE.NoColorSpace;return texture;
    }
    let seed=71;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const grain=canvasTexture(512,512,(ctx,w,h)=>{
      const pixels=ctx.createImageData(w,h);
      for(let y=0;y<h;y++){const line=114+random()*30;
        for(let x=0;x<w;x++){const i=(y*w+x)*4,v=line+random()*8;pixels.data.set([v,v,v,255],i);}}
      ctx.putImageData(pixels,0,0);
    },false);
    const roughness=canvasTexture(256,256,(ctx,w,h)=>{
      ctx.fillStyle='#d0d0d0';ctx.fillRect(0,0,w,h);
      for(let y=0;y<h;y++){const v=187+random()*45;ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(0,y,w,1);}
    },false);
    const fabric=canvasTexture(128,128,(ctx,w,h)=>{
      const pixels=ctx.createImageData(w,h);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=100+random()*65+((x+y)%3===0?20:0);pixels.data.set([v,v,v,255],i);}
      ctx.putImageData(pixels,0,0);
    },false);
    const leather=canvasTexture(128,128,(ctx,w,h)=>{
      ctx.fillStyle='#999';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#777';ctx.lineWidth=.8;
      for(let i=0;i<900;i++){const x=random()*w,y=random()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*4,y+random()*3);ctx.stroke();}
    },false);
    for(const texture of [grain,roughness,fabric,leather]){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}
    grain.repeat.set(3,3);fabric.repeat.set(20,14);leather.repeat.set(3,3);
    const insignia=canvasTexture(768,256,(ctx,w,h)=>{
      ctx.fillStyle='#29272b';ctx.textAlign='center';ctx.font='102px "Times New Roman",serif';ctx.fillText('MSC',w/2,139);
      ctx.font='17px Arial,sans-serif';ctx.fillText('MANAGEMENT STRATEGY COUNCIL',w/2,195);
    });
    const liningMark=canvasTexture(1024,300,(ctx,w,h)=>{
      ctx.fillStyle='#e4d5ce';ctx.textAlign='center';ctx.font='italic 74px "Times New Roman",serif';
      ctx.fillText('Learn. Network. Succeed.',w/2,160);ctx.font='19px Arial,sans-serif';ctx.fillText('MANAGEMENT STRATEGY COUNCIL · UTSC',w/2,226);
    });
    const {group,hinge,updateDetails}=createBriefcase({grain,roughness,fabric,leather,insignia,liningMark});scene.add(group);
    const shadowTexture=canvasTexture(128,128,(ctx,w,h)=>{
      const gradient=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
      gradient.addColorStop(0,'rgba(0,0,0,.52)');gradient.addColorStop(.4,'rgba(0,0,0,.30)');gradient.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    });
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(10,6.5),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.1;scene.add(shadow);
    let cameraDistance=14.2;
    function resize() {
      const width=mount.clientWidth,height=mount.clientHeight;if(!width||!height)return;
      camera.aspect=width/height;camera.updateProjectionMatrix();
      cameraDistance=Math.max(14.2,7.6/(2*Math.tan(THREE.MathUtils.degToRad(16.5))*camera.aspect));
      camera.position.set(.46,.57,.70).normalize().multiplyScalar(cameraDistance);
      camera.lookAt(0,.8,0);renderer.setSize(width,height,false);wake();
    }
    let targetX=0,targetY=0,x=0,y=0,progress=0,last=0,elapsed=0;
    const clamp=THREE.MathUtils.clamp;
    draw=(time)=>{
      frame=0;if(!visible||document.hidden)return;
      if(document.body.classList.contains('modal-open')){last=0;return;}
      if(paused&&!reduced.matches){renderer.render(scene,camera);last=0;return;}
      const dt=Math.min((time-(last||time))/1000,.05);last=time;
      const still=paused||reduced.matches;
      if(!still)elapsed+=dt;
      const damping=1-Math.exp(-dt*7);
      const targetProgress=still?0:narrative.opening;
      progress=still?0:THREE.MathUtils.lerp(progress,targetProgress,damping);
      x=still?0:THREE.MathUtils.lerp(x,targetX,damping);
      y=still?0:THREE.MathUtils.lerp(y,targetY,damping);
      group.rotation.set(.035+y*.065,-.38+progress*.65+x*.12,-.05+progress*.09);
      group.position.y=-.08-progress*.38+(still?0:Math.sin(elapsed*.65)*.045);
      hinge.rotation.x=-(.13+THREE.MathUtils.smoothstep(progress,.08,.85)*1.72);
      updateDetails(THREE.MathUtils.smoothstep(progress,.0,.45));
      camera.position.set(.46,.57,.70).normalize().multiplyScalar(cameraDistance*(1-(still?0:narrative.push)*.035));
      camera.lookAt(0,.8,0);
      renderer.render(scene,camera);
      if(!still)wake();
    };
    stage.addEventListener('pointermove',event=>{
      if(!finePointer.matches)return;const rect=stage.getBoundingClientRect();
      targetX=clamp((event.clientX-rect.left)/rect.width*2-1,-1,1);
      targetY=clamp((event.clientY-rect.top)/rect.height*2-1,-1,1);wake();
    },{passive:true});
    stage.addEventListener('pointerleave',()=>{targetX=targetY=0;wake();});
    window.addEventListener('scroll',wake,{passive:true});
    document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
    new MutationObserver(wake).observe(document.body,{attributes:true,attributeFilter:['class']});
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;last=0;
      if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}
    },{rootMargin:'80px'}).observe(hero);
    new ResizeObserver(resize).observe(mount);
    renderer.domElement.setAttribute('aria-hidden','true');
    renderer.domElement.addEventListener('webglcontextlost',event=>{
      event.preventDefault();cancelAnimationFrame(frame);frame=0;draw=null;mount.classList.remove('scene-ready');
      toggle.hidden=true;hero.classList.add('static-hero');
      story.fallback();
    });
    mount.append(renderer.domElement);resize();
    renderer.render(scene,camera);mount.classList.add('scene-ready');hero.classList.add('object-ready');
    wake();
  } catch(error) {
    // Keep the supplied briefcase artwork and all page navigation usable.
    toggle.hidden=true;hero.classList.add('static-hero');
    story.fallback();
    console.warn('MSC interactive hero is unavailable; the still artwork is displayed.',error);
  }
}
// Defer the scene so navigation and the first text paint have priority.
if('requestIdleCallback' in window)requestIdleCallback(init,{timeout:900});else setTimeout(init,150);
