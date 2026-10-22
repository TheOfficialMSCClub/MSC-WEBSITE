import * as T from './vendor/three/three.module.min.js';
let surfaces;
const TAU=Math.PI*2;
const hash=(x,y,seed)=>{const n=Math.sin(x*127.1+y*311.7+seed*71.3)*43758.5453;return n-Math.floor(n);};
const smooth=t=>t*t*(3-2*t),mix=(a,b,t)=>a+(b-a)*t;
// Periodic, elongated noise gives continuous grain without regular corrugated stripes.
function noise(u,v,nx,ny,seed){
 const x=u*nx,y=v*ny,ix=Math.floor(x),iy=Math.floor(y),tx=smooth(x-ix),ty=smooth(y-iy),at=(x,y)=>hash((x%nx+nx)%nx,(y%ny+ny)%ny,seed);
 return mix(mix(at(ix,iy),at(ix+1,iy),tx),mix(at(ix,iy+1),at(ix+1,iy+1),tx),ty);
}
function configure(map,color=false){map.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.flipY=false;map.generateMipmaps=true;map.anisotropy=8;map.needsUpdate=true;return map;}
function dataTexture(pixels,size,color=false){return configure(new T.DataTexture(pixels,size,size,T.RGBAFormat),color);}
function surface(kind,size){
 const color=new Uint8Array(size*size*4),bump=new Uint8Array(color.length),roughness=new Uint8Array(color.length),seed=kind==='ivory'?2:kind==='lacquer'?7:13;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,wood=kind==='wood',ivory=kind==='ivory';
  const warp=noise(u,v,4,4,seed)-.5,flow=u+warp*.055+.009*Math.sin(v*TAU*2);
  const broad=noise(flow,v,12,3,seed+1),fibres=noise(flow,v,150,5,seed+2),fine=noise(flow,v,320,16,seed+3),pores=Math.pow(noise(flow,v,110,35,seed+4),14);
  const growth=flow*20+(broad-.5)*2.1+.55*noise(u,v,6,3,seed+5),vein=Math.pow(.5+.5*Math.sin(growth*TAU),12);
  const grain=.40*broad+.22*fibres+.12*fine+.26*vein,streak=Math.pow(1-fibres,5);
  const value=ivory?250-44*grain-7*streak:wood?250-85*grain-12*streak:250-65*grain-10*streak;
  const height=.5+(fibres-.5)*.055+(fine-.5)*.018-pores*.035;
  const rough=ivory?.91+(grain-.5)*.06:wood?.92+(grain-.5)*.08:.89+(grain-.5)*.08;
  const i=(y*size+x)*4;for(let c=0;c<3;c++){
   color[i+c]=Math.round(T.MathUtils.clamp(value-c*(ivory?1.3:wood?2.5:1.0),0,255));
   bump[i+c]=Math.round(T.MathUtils.clamp(height,0,1)*255);roughness[i+c]=Math.round(T.MathUtils.clamp(rough,0,1)*255);
  }
  color[i+3]=bump[i+3]=roughness[i+3]=255;
 }
 return {color:dataTexture(color,size,true),bump:dataTexture(bump,size),roughness:dataTexture(roughness,size)};
}
export function createChessSurfaces(size=512){return {ivory:surface('ivory',size),lacquer:surface('lacquer',size),wood:surface('wood',size)};}
export function chessSurfaces(){return surfaces??=createChessSurfaces();}
// Baked 1K maps avoid running procedural generation on a visitor's phone.
export async function prepareChessSurfaces(renderer){
 if(surfaces)return surfaces;
 const loader=new T.TextureLoader(),loaded={};
 try{
  const results=await Promise.allSettled(['ivory','lacquer','wood'].flatMap(kind=>{loaded[kind]={};return ['color','bump','roughness'].map(async channel=>{const map=await loader.loadAsync(new URL(`./assets/chess-wood-v11/${kind}-${channel}.png`,import.meta.url).href);configure(map,channel==='color');map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());loaded[kind][channel]=map;});}));
  if(results.some(result=>result.status==='rejected'))throw new Error('Wood maps unavailable');
  surfaces=loaded;
 }catch(error){for(const maps of Object.values(loaded))for(const map of Object.values(maps))map.dispose();surfaces=createChessSurfaces(256);}
 return surfaces;
}
