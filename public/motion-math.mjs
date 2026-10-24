export const clamp=v=>Math.max(0,Math.min(1,v));
export const smooth=(v,a=0,b=1)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
export function seeded(index){let x=(index+1)*2654435761;x^=x>>>16;x=Math.imul(x,2246822519);x^=x>>>13;return (x>>>0)/4294967295;}
export function puzzlePose(index,column,row,columns,rows,progress,time=0){
 const seed=seeded(index),s2=seeded(index+200),s3=seeded(index+600);
 const x=(column-(columns-1)/2)*.82,y=((rows-1)/2-row)*.82;
 const delay=.02+seed*.21,t=smooth(progress,delay,.77+delay),loose=1-t;
 const extent=Math.max(columns,rows)/15;
 const angle=seed*Math.PI*2,rad=(5+s2*7)*extent,drift=Math.sin(time*.55+seed*10)*.18*extent;
 return {x:x+Math.cos(angle)*rad*loose,y:y+Math.sin(angle)*rad*.65*loose+drift*loose,z:((s3*12-3)*loose+Math.sin(t*Math.PI)*(1+seed*2))*extent,rx:(seed-.5)*Math.PI*3*loose,ry:(s2-.5)*Math.PI*4*loose,rz:(s3-.5)*Math.PI*5*loose,settled:t};
}
export function sceneProgress(section,stage){const travel=section.offsetHeight-stage.offsetHeight;return travel>0?clamp(-section.getBoundingClientRect().top/travel):1;}
