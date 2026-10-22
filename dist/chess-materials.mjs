import * as T from './vendor/three/three.module.min.js';
let surfaces;
function texture(kind){
 const size=256,pixels=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,n=Math.sin(x*127.1+y*311.7)*43758.5453,noise=(n-Math.floor(n))-.5;
  let value;if(kind==='ivory')value=250+noise*5+Math.sin(u*21+Math.sin(v*17))*.8;
  else{const grain=Math.sin(u*85+Math.sin(v*6)*3+Math.sin(v*21)*.7),fine=Math.sin(u*360+Math.sin(v*17)*8);value=kind==='wood'?244+grain*4+fine*1.5+noise*1.2:245+grain*4+fine*1.2+noise*1.5;}
  const i=(y*size+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=Math.round(value);pixels[i+3]=255;
 }
 const map=new T.DataTexture(pixels,size,size,T.RGBAFormat);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.anisotropy=4;map.needsUpdate=true;return map;
}
export function chessSurfaces(){return surfaces??=( {ivory:texture('ivory'),lacquer:texture('lacquer'),wood:texture('wood')} );}
