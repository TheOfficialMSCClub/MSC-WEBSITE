// One preference shared by every scene. Device reduced motion always wins.
const device=matchMedia('(prefers-reduced-motion: reduce)');
const listeners=new Set();
let paused=false;
try{paused=localStorage.getItem('msc-motion-paused')==='true';}catch{}
export const siteMotion={
 get matches(){return device.matches||paused;},
 addEventListener(type,listener){if(type==='change')listeners.add(listener);},
 removeEventListener(type,listener){if(type==='change')listeners.delete(listener);}
};
function update(){
 const reduced=siteMotion.matches;
 document.documentElement.dataset.motion=reduced?'reduced':'on';
 const button=document.querySelector('#site-motion');
 if(button){button.textContent=device.matches?'Motion reduced':paused?'Motion off':'Motion on';button.disabled=device.matches;button.setAttribute('aria-pressed',String(reduced));button.setAttribute('aria-label',device.matches?'Motion reduced by your device setting':paused?'Enable site motion':'Pause site motion');}
 for(const listener of listeners)listener({matches:reduced,media:device.media});
}
document.querySelector('#site-motion')?.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('msc-motion-paused',String(paused));}catch{}update();});
device.addEventListener('change',update);
update();
