// Physical-surface motion compensation between original transparent product renders.
export const vertexSource=`
attribute vec2 a_uv;
uniform vec4 u_rect;
uniform vec2 u_viewport;
varying vec2 v_uv;
void main(){v_uv=a_uv;vec2 p=(u_rect.xy+a_uv*u_rect.zw)/u_viewport;gl_Position=vec4(p.x*2.0-1.0,1.0-p.y*2.0,0.0,1.0);}`;
export const fragmentSource=`
precision highp float;
uniform sampler2D u_first;
uniform sampler2D u_second;
uniform sampler2D u_motion;
uniform float u_mix;
uniform float u_size;
varying vec2 v_uv;
vec2 forwardAt(vec2 p){return (texture2D(u_motion,p).rg*255.0-128.0)*0.25/u_size;}
vec2 backwardAt(vec2 p){return (texture2D(u_motion,p).ba*255.0-128.0)*0.25/u_size;}
void main(){
 vec2 first=v_uv-forwardAt(v_uv)*u_mix;
 first=v_uv-forwardAt(first)*u_mix;
 vec2 second=v_uv-backwardAt(v_uv)*(1.0-u_mix);
 second=v_uv-backwardAt(second)*(1.0-u_mix);
 vec4 a=texture2D(u_first,first),b=texture2D(u_second,second);
 a.rgb*=a.a;b.rgb*=b.a;
 gl_FragColor=mix(a,b,u_mix);
}`;
export function createCaseRenderer(canvas,{motion=true}={}){
 const gl=motion?canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'}):null;
 if(!gl){
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw Error('No case renderer');
  return{kind:'blend',drop(){},render(a,b,flow,t,ra,rb){ctx.clearRect(0,0,canvas.width,canvas.height);for(const [image,alpha,r,index]of[[a,1-t,ra,0],[b,t,rb,1]]){if(alpha===0)continue;ctx.globalAlpha=alpha;ctx.globalCompositeOperation=index?'lighter':'source-over';ctx.drawImage(image,r.x,r.y,r.width,r.height);}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}};
 }
 const shader=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertexSource),fs=shader(gl.FRAGMENT_SHADER,fragmentSource);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),gl.STATIC_DRAW);const uv=gl.getAttribLocation(program,'a_uv');gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
 const rect=gl.getUniformLocation(program,'u_rect'),viewport=gl.getUniformLocation(program,'u_viewport'),mix=gl.getUniformLocation(program,'u_mix'),size=gl.getUniformLocation(program,'u_size');
 for(const [name,unit]of[['u_first',0],['u_second',1],['u_motion',2]])gl.uniform1i(gl.getUniformLocation(program,name),unit);
 gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);
 const textures=new Map();
 function texture(image,unit){gl.activeTexture(gl.TEXTURE0+unit);if(textures.has(image)){gl.bindTexture(gl.TEXTURE_2D,textures.get(image));return;}
  const tex=gl.createTexture();textures.set(image,tex);gl.bindTexture(gl.TEXTURE_2D,tex);for(const axis of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,axis,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  if(image)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([128,128,128,128]));
 }
 return{kind:'flow',drop(image){if(textures.has(image)){gl.deleteTexture(textures.get(image));textures.delete(image);}},render(a,b,flow,t,ra,rb){
  gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT);texture(a,0);texture(b,1);texture(flow,2);
  const lerp=(a,b)=>a+(b-a)*t;gl.uniform4f(rect,lerp(ra.x,rb.x),lerp(ra.y,rb.y),lerp(ra.width,rb.width),lerp(ra.height,rb.height));gl.uniform2f(viewport,canvas.width,canvas.height);gl.uniform1f(mix,t);gl.uniform1f(size,896);gl.drawArrays(gl.TRIANGLES,0,6);
 }};
}
