const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=(value,start,end)=>{const t=clamp((value-start)/(end-start));return t*t*t*(t*(t*6-15)+10);};
export const chapterStops=[0,.35,.65,.94];
// The camera accompanies each page up to the lid and back into the tray.
export const readingShots=[
 {in:[.15,.28],out:[.405,.475]},
 {in:[.49,.575],out:[.705,.775]},
 {in:[.79,.875],out:null}
];
export function heroState(value){
 const p=clamp(value),active=p<.205?-1:p<.49?0:p<.79?1:2;
 const zoom=Math.max(...readingShots.map(shot=>smooth(p,...shot.in)*(shot.out?1-smooth(p,...shot.out):1)));
 return{progress:p,opening:smooth(p,.015,.36),film:Math.min(p,.36),push:smooth(p,.15,.36),intro:1-smooth(p,.08,.21),chapters:[smooth(p,.15,.26)*(1-smooth(p,.49,.51)),smooth(p,.49,.51)*(1-smooth(p,.79,.81)),smooth(p,.79,.81)],active,navigation:smooth(p,.10,.21),zoom};
}
// Velocity itself eases, so a mouse-wheel notch never starts with an abrupt pose jump.
export function advanceStory(position,velocity,target,dt){
 const difference=target-position,wanted=Math.max(-.23,Math.min(.23,difference*5.5));
 let nextVelocity=velocity+(wanted-velocity)*(1-Math.exp(-dt*9));
 let next=position+nextVelocity*dt;
 if((target-position)*(target-next)<=0){next=target;nextVelocity=0;}
 if(Math.abs(target-next)<.00003&&Math.abs(nextVelocity)<.0002){next=target;nextVelocity=0;}
 return{position:next,velocity:nextVelocity};
}
