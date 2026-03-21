function tt(r,t,e,i){const o=Math.max(1,Math.min(r,t)),n=Math.min(e,20),T=Math.min(n+i,o),g=Math.min(T,Math.floor(r/2)),m=Math.min(T,Math.floor(t/2)),a=$=>$/r*2-1,h=$=>$/t*2-1,I=0,S=r,B=0,E=t,R=g,F=r-g,G=m,O=t-m,l=a(I),d=a(S),D=h(B),W=h(E),N=a(R),V=a(F),w=h(G),v=h(O),b=0,z=0,_=1,Y=1,Q=g/r,X=1-g/r,L=m/t,A=1-m/t,lt=new Float32Array([l,D,d,D,l,w,l,w,d,D,d,w,l,v,d,v,l,W,l,W,d,v,d,W,l,w,N,w,l,v,l,v,N,w,N,v,V,w,d,w,V,v,V,v,d,w,d,v]),ht=new Float32Array([b,z,_,z,b,L,b,L,_,z,_,L,b,A,_,A,b,Y,b,Y,_,A,_,Y,b,L,Q,L,b,A,b,A,Q,L,Q,A,X,L,_,L,X,A,X,A,_,L,_,A]);return{positions:lt,uvs:ht}}function et(r,t,e){const i=r.createShader(t);if(!i)throw new Error("Failed to create shader");if(r.shaderSource(i,e),r.compileShader(i),!r.getShaderParameter(i,r.COMPILE_STATUS)){const o=r.getShaderInfoLog(i)||"Unknown shader error";throw r.deleteShader(i),new Error(o)}return i}function ut(r,t,e){const i=et(r,r.VERTEX_SHADER,t),o=et(r,r.FRAGMENT_SHADER,e),n=r.createProgram();if(!n)throw new Error("Failed to create program");if(r.attachShader(n,i),r.attachShader(n,o),r.linkProgram(n),!r.getProgramParameter(n,r.LINK_STATUS)){const k=r.getProgramInfoLog(n)||"Unknown link error";throw r.deleteProgram(n),r.deleteShader(i),r.deleteShader(o),new Error(k)}return r.deleteShader(i),r.deleteShader(o),n}const ft=`#version 300 es
precision lowp float;
in vec2 vUV;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uBorderWidth;
uniform float uGlowWidth;
uniform float uBorderRadius;
uniform vec3 uColors[4];
uniform float uGlowExponent;
uniform float uGlowFactor;
const float PI = 3.14159265359;
const float TWO_PI = 2.0 * PI;
const float HALF_PI = 0.5 * PI;
const vec4 startPositions = vec4(0.0, PI, HALF_PI, 1.5 * PI);
const vec4 speeds = vec4(-1.9, -1.9, -1.5, 2.1);
const vec4 innerRadius = vec4(PI * 0.8, PI * 0.7, PI * 0.3, PI * 0.1);
const vec4 outerRadius = vec4(PI * 1.2, PI * 0.9, PI * 0.6, PI * 0.4);
float random(vec2 st) {
return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
vec2 random2(vec2 st) {
return vec2(random(st), random(st + 1.0));
}
float aaStep(float edge, float d) {
float width = fwidth(d);
return smoothstep(edge - width * 0.5, edge + width * 0.5, d);
}
float aaFract(float x) {
float f = fract(x);
float w = fwidth(x);
float smooth_f = f * (1.0 - smoothstep(1.0 - w, 1.0, f));
return smooth_f;
}
float sdRoundedBox(in vec2 p, in vec2 b, in float r) {
vec2 q = abs(p) - b + r;
return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}
float getInnerGlow(vec2 p, vec2 b, float radius) {
float dist_x = b.x - abs(p.x);
float dist_y = b.y - abs(p.y);
float glow_x = smoothstep(radius, 0.0, dist_x);
float glow_y = smoothstep(radius, 0.0, dist_y);
return 1.0 - (1.0 - glow_x) * (1.0 - glow_y);
}
float getVignette(vec2 uv) {
vec2 vignetteUv = uv;
vignetteUv = vignetteUv * (1.0 - vignetteUv);
float vignette = vignetteUv.x * vignetteUv.y * 25.0;
vignette = pow(vignette, 0.16);
vignette = 1.0 - vignette;
return vignette;
}
float uvToAngle(vec2 uv) {
vec2 center = vec2(0.5);
vec2 dir = uv - center;
return atan(dir.y, dir.x) + PI;
}
void main() {
vec2 uv = vUV;
vec2 pos = uv * uResolution;
vec2 centeredPos = pos - uResolution * 0.5;
vec2 size = uResolution - uBorderWidth;
vec2 halfSize = size * 0.5;
float dBorderBox = sdRoundedBox(centeredPos, halfSize, uBorderRadius);
float border = aaStep(0.0, dBorderBox);
float glow = getInnerGlow(centeredPos, halfSize, uGlowWidth);
float vignette = getVignette(uv);
glow *= vignette;
float posAngle = uvToAngle(uv);
vec4 lightCenter = mod(startPositions + speeds * uTime, TWO_PI);
vec4 angleDist = abs(posAngle - lightCenter);
vec4 disToLight = min(angleDist, TWO_PI - angleDist) / TWO_PI;
float intensityBorder[4];
intensityBorder[0] = 1.0;
intensityBorder[1] = smoothstep(0.4, 0.0, disToLight.y);
intensityBorder[2] = smoothstep(0.4, 0.0, disToLight.z);
intensityBorder[3] = smoothstep(0.2, 0.0, disToLight.w) * 0.5;
vec3 borderColor = vec3(0.0);
for(int i = 0; i < 4; i++) {
borderColor = mix(borderColor, uColors[i], intensityBorder[i]);
}
borderColor *= 1.1;
borderColor = clamp(borderColor, 0.0, 1.0);
float intensityGlow[4];
intensityGlow[0] = smoothstep(0.9, 0.0, disToLight.x);
intensityGlow[1] = smoothstep(0.7, 0.0, disToLight.y);
intensityGlow[2] = smoothstep(0.4, 0.0, disToLight.z);
intensityGlow[3] = smoothstep(0.1, 0.0, disToLight.w) * 0.7;
vec4 breath = smoothstep(0.0, 1.0, sin(uTime * 1.0 + startPositions * PI) * 0.2 + 0.8);
vec3 glowColor = vec3(0.0);
glowColor += uColors[0] * intensityGlow[0] * breath.x;
glowColor += uColors[1] * intensityGlow[1] * breath.y;
glowColor += uColors[2] * intensityGlow[2] * breath.z;
glowColor += uColors[3] * intensityGlow[3] * breath.w * glow;
glow = pow(glow, uGlowExponent);
glow *= random(pos + uTime) * 0.1 + 1.0;
glowColor *= glow * uGlowFactor;
glowColor = clamp(glowColor, 0.0, 1.0);
vec3 color = mix(glowColor, borderColor + glowColor * 0.2, border);
float alpha = mix(glow, 1.0, border);
outColor = vec4(color, alpha);
}`,pt=`#version 300 es
in vec2 aPosition;
in vec2 aUV;
out vec2 vUV;
void main() {
vUV = aUV;
gl_Position = vec4(aPosition, 0.0, 1.0);
}`;const gt=["rgb(57, 182, 255)","rgb(189, 69, 251)","rgb(255, 87, 51)","rgb(255, 214, 0)"];function mt(r){const t=r.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);if(!t)throw new Error(`Invalid color format: ${r}`);const[,e,i,o]=t;return[parseInt(e)/255,parseInt(i)/255,parseInt(o)/255]}class wt{element;canvas;options;running=!1;disposed=!1;startTime=0;lastTime=0;rafId=null;glr;observer;constructor(t={}){this.options={width:t.width??600,height:t.height??600,ratio:t.ratio??window.devicePixelRatio??1,borderWidth:t.borderWidth??8,glowWidth:t.glowWidth??200,borderRadius:t.borderRadius??8,mode:t.mode??"light",...t},this.canvas=document.createElement("canvas"),this.options.classNames&&(this.canvas.className=this.options.classNames),this.options.styles&&Object.assign(this.canvas.style,this.options.styles),this.canvas.style.display="block",this.canvas.style.transformOrigin="center",this.canvas.style.pointerEvents="none",this.element=this.canvas,this.setupGL(),this.options.skipGreeting||this.greet()}start(){if(this.disposed)throw new Error("Motion instance has been disposed.");if(this.running)return;if(!this.glr){console.error("WebGL resources are not initialized.");return}this.running=!0,this.startTime=performance.now(),this.resize(this.options.width??600,this.options.height??600,this.options.ratio),this.glr.gl.viewport(0,0,this.canvas.width,this.canvas.height),this.glr.gl.useProgram(this.glr.program),this.glr.gl.uniform2f(this.glr.uResolution,this.canvas.width,this.canvas.height),this.checkGLError(this.glr.gl,"start: after initial setup");const t=()=>{if(!this.running||!this.glr)return;this.rafId=requestAnimationFrame(t);const e=performance.now();if(e-this.lastTime<1e3/32)return;this.lastTime=e;const o=(e-this.startTime)*.001;this.render(o)};this.rafId=requestAnimationFrame(t)}pause(){if(this.disposed)throw new Error("Motion instance has been disposed.");this.running=!1,this.rafId!==null&&cancelAnimationFrame(this.rafId)}dispose(){if(this.disposed)return;this.disposed=!0,this.running=!1,this.rafId!==null&&cancelAnimationFrame(this.rafId);const{gl:t,vao:e,positionBuffer:i,uvBuffer:o,program:n}=this.glr;e&&t.deleteVertexArray(e),i&&t.deleteBuffer(i),o&&t.deleteBuffer(o),t.deleteProgram(n),this.observer&&this.observer.disconnect(),this.canvas.remove()}resize(t,e,i){if(this.disposed)throw new Error("Motion instance has been disposed.");if(this.options.width=t,this.options.height=e,i&&(this.options.ratio=i),!this.running)return;const{gl:o,program:n,vao:k,positionBuffer:T,uvBuffer:g,uResolution:m}=this.glr,a=i??this.options.ratio??window.devicePixelRatio??1,h=Math.max(1,Math.floor(t*a)),I=Math.max(1,Math.floor(e*a));this.canvas.style.width=`${t}px`,this.canvas.style.height=`${e}px`,(this.canvas.width!==h||this.canvas.height!==I)&&(this.canvas.width=h,this.canvas.height=I),o.viewport(0,0,this.canvas.width,this.canvas.height),this.checkGLError(o,"resize: after viewport setup");const{positions:S,uvs:B}=tt(this.canvas.width,this.canvas.height,this.options.borderWidth*a,this.options.glowWidth*a);o.bindVertexArray(k),o.bindBuffer(o.ARRAY_BUFFER,T),o.bufferData(o.ARRAY_BUFFER,S,o.STATIC_DRAW);const E=o.getAttribLocation(n,"aPosition");o.enableVertexAttribArray(E),o.vertexAttribPointer(E,2,o.FLOAT,!1,0,0),this.checkGLError(o,"resize: after position buffer update"),o.bindBuffer(o.ARRAY_BUFFER,g),o.bufferData(o.ARRAY_BUFFER,B,o.STATIC_DRAW);const R=o.getAttribLocation(n,"aUV");o.enableVertexAttribArray(R),o.vertexAttribPointer(R,2,o.FLOAT,!1,0,0),this.checkGLError(o,"resize: after UV buffer update"),o.useProgram(n),o.uniform2f(m,this.canvas.width,this.canvas.height),o.uniform1f(this.glr.uBorderWidth,this.options.borderWidth*a),o.uniform1f(this.glr.uGlowWidth,this.options.glowWidth*a),o.uniform1f(this.glr.uBorderRadius,this.options.borderRadius*a),this.checkGLError(o,"resize: after uniform updates");const F=performance.now();this.lastTime=F;const G=(F-this.startTime)*.001;this.render(G)}autoResize(t){this.observer&&this.observer.disconnect(),this.observer=new ResizeObserver(()=>{const e=t.getBoundingClientRect();this.resize(e.width,e.height)}),this.observer.observe(t)}fadeIn(){if(this.disposed)throw new Error("Motion instance has been disposed.");return new Promise((t,e)=>{const i=this.canvas.animate([{opacity:0,transform:"scale(1.2)"},{opacity:1,transform:"scale(1)"}],{duration:300,easing:"ease-out",fill:"forwards"});i.onfinish=()=>t(),i.oncancel=()=>e("canceled")})}fadeOut(){if(this.disposed)throw new Error("Motion instance has been disposed.");return new Promise((t,e)=>{const i=this.canvas.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(1.2)"}],{duration:300,easing:"ease-in",fill:"forwards"});i.onfinish=()=>t(),i.oncancel=()=>e("canceled")})}checkGLError(t,e){let i=t.getError();if(i!==t.NO_ERROR){for(console.group(`🔴 WebGL Error in ${e}`);i!==t.NO_ERROR;){const o=this.getGLErrorName(t,i);console.error(`${o} (0x${i.toString(16)})`),i=t.getError()}console.groupEnd()}}getGLErrorName(t,e){switch(e){case t.INVALID_ENUM:return"INVALID_ENUM";case t.INVALID_VALUE:return"INVALID_VALUE";case t.INVALID_OPERATION:return"INVALID_OPERATION";case t.INVALID_FRAMEBUFFER_OPERATION:return"INVALID_FRAMEBUFFER_OPERATION";case t.OUT_OF_MEMORY:return"OUT_OF_MEMORY";case t.CONTEXT_LOST_WEBGL:return"CONTEXT_LOST_WEBGL";default:return"UNKNOWN_ERROR"}}setupGL(){const t=this.canvas.getContext("webgl2",{antialias:!1,alpha:!0});if(!t)throw new Error("WebGL2 is required but not available.");const e=ut(t,pt,ft);this.checkGLError(t,"setupGL: after createProgram");const i=t.createVertexArray();t.bindVertexArray(i),this.checkGLError(t,"setupGL: after VAO creation");const o=this.canvas.width||2,n=this.canvas.height||2,{positions:k,uvs:T}=tt(o,n,this.options.borderWidth,this.options.glowWidth),g=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,g),t.bufferData(t.ARRAY_BUFFER,k,t.STATIC_DRAW);const m=t.getAttribLocation(e,"aPosition");t.enableVertexAttribArray(m),t.vertexAttribPointer(m,2,t.FLOAT,!1,0,0),this.checkGLError(t,"setupGL: after position buffer setup");const a=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,a),t.bufferData(t.ARRAY_BUFFER,T,t.STATIC_DRAW);const h=t.getAttribLocation(e,"aUV");t.enableVertexAttribArray(h),t.vertexAttribPointer(h,2,t.FLOAT,!1,0,0),this.checkGLError(t,"setupGL: after UV buffer setup");const I=t.getUniformLocation(e,"uResolution"),S=t.getUniformLocation(e,"uTime"),B=t.getUniformLocation(e,"uBorderWidth"),E=t.getUniformLocation(e,"uGlowWidth"),R=t.getUniformLocation(e,"uBorderRadius"),F=t.getUniformLocation(e,"uColors"),G=t.getUniformLocation(e,"uGlowExponent"),O=t.getUniformLocation(e,"uGlowFactor");t.useProgram(e),t.uniform1f(B,this.options.borderWidth),t.uniform1f(E,this.options.glowWidth),t.uniform1f(R,this.options.borderRadius),this.options.mode==="dark"?(t.uniform1f(G,2),t.uniform1f(O,1.8)):(t.uniform1f(G,1),t.uniform1f(O,1));const l=(this.options.colors||gt).map(mt);for(let d=0;d<l.length;d++)t.uniform3f(t.getUniformLocation(e,`uColors[${d}]`),...l[d]);this.checkGLError(t,"setupGL: after uniform setup"),t.bindVertexArray(null),t.bindBuffer(t.ARRAY_BUFFER,null),this.glr={gl:t,program:e,vao:i,positionBuffer:g,uvBuffer:a,uResolution:I,uTime:S,uBorderWidth:B,uGlowWidth:E,uBorderRadius:R,uColors:F}}render(t){if(!this.glr)return;const{gl:e,program:i,vao:o,uTime:n}=this.glr;e.useProgram(i),e.bindVertexArray(o),e.uniform1f(n,t),e.disable(e.DEPTH_TEST),e.disable(e.CULL_FACE),e.disable(e.BLEND),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,24),this.checkGLError(e,"render: after draw call"),e.bindVertexArray(null)}greet(){console.log("%c🌈 ai-motion 0.4.8 🌈","background: linear-gradient(90deg, #39b6ff, #bd45fb, #ff5733, #ffd600); color: white; text-shadow: 0 0 2px rgba(0, 0, 0, 0.2); font-weight: bold; font-size: 1em; padding: 2px 12px; border-radius: 6px;")}}(function(){try{if(typeof document<"u"){var r=document.createElement("style");r.appendChild(document.createTextNode(`._wrapper_1ooyb_1 {
	position: fixed;
	inset: 0;
	z-index: 2147483641; /* 确保在所有元素之上，除了 panel */
	cursor: wait;
	overflow: hidden;

	display: none;
}

._wrapper_1ooyb_1._visible_1ooyb_11 {
	display: block;
}
/* AI 光标样式 */
._cursor_1dgwb_2 {
	position: absolute;
	width: var(--cursor-size, 75px);
	height: var(--cursor-size, 75px);
	pointer-events: none;
	z-index: 10000;
}

._cursorBorder_1dgwb_10 {
	position: absolute;
	width: 100%;
	height: 100%;
	background: linear-gradient(45deg, rgb(57, 182, 255), rgb(189, 69, 251));
	mask-image: url("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20fill='none'%3e%3cg%3e%3cpath%20d='M%2015%2042%20L%2015%2036.99%20Q%2015%2031.99%2023.7%2031.99%20L%2028.05%2031.99%20Q%2032.41%2031.99%2032.41%2021.99%20L%2032.41%2017%20Q%2032.41%2012%2041.09%2016.95%20L%2076.31%2037.05%20Q%2085%2042%2076.31%2046.95%20L%2041.09%2067.05%20Q%2032.41%2072%2032.41%2062.01%20L%2032.41%2057.01%20Q%2032.41%2052.01%2023.7%2052.01%20L%2019.35%2052.01%20Q%2015%2052.01%2015%2047.01%20Z'%20fill='none'%20stroke='%23000000'%20stroke-width='6'%20stroke-miterlimit='10'%20style='stroke:%20light-dark(rgb(0,%200,%200),%20rgb(255,%20255,%20255));'/%3e%3c/g%3e%3c/svg%3e");
	mask-size: 100% 100%;
	mask-repeat: no-repeat;

	transform-origin: center;
	transform: rotate(-135deg) scale(1.2);
	margin-left: -10px;
	margin-top: -18px;
}

._cursorFilling_1dgwb_25 {
	position: absolute;
	width: 100%;
	height: 100%;
	background: url("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3e%3cdefs%3e%3c/defs%3e%3cg%20xmlns='http://www.w3.org/2000/svg'%20style='filter:%20drop-shadow(light-dark(rgba(0,%200,%200,%200.4),%20rgba(237,%20237,%20237,%200.4))%203px%204px%204px);'%3e%3cpath%20d='M%2015%2042%20L%2015%2036.99%20Q%2015%2031.99%2023.7%2031.99%20L%2028.05%2031.99%20Q%2032.41%2031.99%2032.41%2021.99%20L%2032.41%2017%20Q%2032.41%2012%2041.09%2016.95%20L%2076.31%2037.05%20Q%2085%2042%2076.31%2046.95%20L%2041.09%2067.05%20Q%2032.41%2072%2032.41%2062.01%20L%2032.41%2057.01%20Q%2032.41%2052.01%2023.7%2052.01%20L%2019.35%2052.01%20Q%2015%2052.01%2015%2047.01%20Z'%20fill='%23ffffff'%20stroke='none'%20style='fill:%20%23ffffff;'/%3e%3c/g%3e%3c/svg%3e");
	background-size: 100% 100%;
	background-repeat: no-repeat;

	transform-origin: center;
	transform: rotate(-135deg) scale(1.2);
	margin-left: -10px;
	margin-top: -18px;
}

._cursorRipple_1dgwb_39 {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
	margin-left: -50%;
	margin-top: -50%;

	&::after {
		content: '';
		opacity: 0;
		position: absolute;
		inset: 0;
		border: 4px solid rgba(57, 182, 255, 1);
		border-radius: 50%;
	}
}

._cursor_1dgwb_2._clicking_1dgwb_57 ._cursorRipple_1dgwb_39::after {
	animation: _cursor-ripple_1dgwb_1 300ms ease-out forwards;
}

@keyframes _cursor-ripple_1dgwb_1 {
	0% {
		transform: scale(0);
		opacity: 1;
	}
	100% {
		transform: scale(2);
		opacity: 0;
	}
}`)),document.head.appendChild(r)}}catch(t){console.error("vite-plugin-css-injected-by-js",t)}})();var rt=Object.defineProperty,ot=r=>{throw TypeError(r)},vt=(r,t,e)=>t in r?rt(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e,y=(r,t)=>rt(r,"name",{value:t,configurable:!0}),q=(r,t,e)=>vt(r,typeof t!="symbol"?t+"":t,e),j=(r,t,e)=>t.has(r)||ot("Cannot "+e),s=(r,t,e)=>(j(r,t,"read from private field"),e?e.call(r):t.get(r)),U=(r,t,e)=>t.has(r)?ot("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(r):t.set(r,e),u=(r,t,e,i)=>(j(r,t,"write to private field"),t.set(r,e),e),H=(r,t,e)=>(j(r,t,"access private method"),e),c,f,p,P,x,M,it,Z;function st(){const r=["dark","dark-mode","theme-dark","night","night-mode"],t=document.documentElement,e=document.body||document.documentElement;for(const o of r)if(t.classList.contains(o)||e?.classList.contains(o))return!0;return!!t.getAttribute("data-theme")?.toLowerCase().includes("dark")}y(st,"hasDarkModeClass");function nt(r){const t=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(r);return t?{r:parseInt(t[1]),g:parseInt(t[2]),b:parseInt(t[3])}:null}y(nt,"parseRgbColor");function J(r,t=128){if(!r||r==="transparent"||r.startsWith("rgba(0, 0, 0, 0)"))return!1;const e=nt(r);return e?.299*e.r+.587*e.g+.114*e.b<t:!1}y(J,"isColorDark");function at(){const r=window.getComputedStyle(document.documentElement),t=window.getComputedStyle(document.body||document.documentElement),e=r.backgroundColor,i=t.backgroundColor;return J(i)?!0:i==="transparent"||i.startsWith("rgba(0, 0, 0, 0)")?J(e):!1}y(at,"isBackgroundDark");function ct(){try{return!!(st()||at())}catch(r){return console.warn("Error determining if page is dark:",r),!1}}y(ct,"isPageDark");const bt="_wrapper_1ooyb_1",_t="_visible_1ooyb_11",K={wrapper:bt,visible:_t},Lt="_cursor_1dgwb_2",At="_cursorBorder_1dgwb_10",yt="_cursorFilling_1dgwb_25",Et="_cursorRipple_1dgwb_39",Rt="_clicking_1dgwb_57",C={cursor:Lt,cursorBorder:At,cursorFilling:yt,cursorRipple:Et,clicking:Rt},dt=class{constructor(){U(this,M),q(this,"shown",!1),q(this,"wrapper",document.createElement("div")),q(this,"motion",null),U(this,c,document.createElement("div")),U(this,f,0),U(this,p,0),U(this,P,0),U(this,x,0),this.wrapper.id="page-agent-runtime_simulator-mask",this.wrapper.className=K.wrapper,this.wrapper.setAttribute("data-browser-use-ignore","true"),this.wrapper.setAttribute("data-page-agent-ignore","true");try{const t=new wt({mode:ct()?"dark":"light",styles:{position:"absolute",inset:"0"}});this.motion=t,this.wrapper.appendChild(t.element),t.autoResize(this.wrapper)}catch(t){console.warn("[SimulatorMask] Motion overlay unavailable:",t)}this.wrapper.addEventListener("click",t=>{t.stopPropagation(),t.preventDefault()}),this.wrapper.addEventListener("mousedown",t=>{t.stopPropagation(),t.preventDefault()}),this.wrapper.addEventListener("mouseup",t=>{t.stopPropagation(),t.preventDefault()}),this.wrapper.addEventListener("mousemove",t=>{t.stopPropagation(),t.preventDefault()}),this.wrapper.addEventListener("wheel",t=>{t.stopPropagation(),t.preventDefault()}),this.wrapper.addEventListener("keydown",t=>{t.stopPropagation(),t.preventDefault()}),this.wrapper.addEventListener("keyup",t=>{t.stopPropagation(),t.preventDefault()}),H(this,M,it).call(this),document.body.appendChild(this.wrapper),H(this,M,Z).call(this),window.addEventListener("PageAgent::MovePointerTo",t=>{const{x:e,y:i}=t.detail;this.setCursorPosition(e,i)}),window.addEventListener("PageAgent::ClickPointer",t=>{this.triggerClickAnimation()})}setCursorPosition(t,e){u(this,P,t),u(this,x,e)}triggerClickAnimation(){s(this,c).classList.remove(C.clicking),s(this,c).offsetHeight,s(this,c).classList.add(C.clicking)}show(){this.shown||(this.shown=!0,this.motion?.start(),this.motion?.fadeIn(),this.wrapper.classList.add(K.visible),u(this,f,window.innerWidth/2),u(this,p,window.innerHeight/2),u(this,P,s(this,f)),u(this,x,s(this,p)),s(this,c).style.left=`${s(this,f)}px`,s(this,c).style.top=`${s(this,p)}px`)}hide(){this.shown&&(this.shown=!1,this.motion?.fadeOut(),this.motion?.pause(),s(this,c).classList.remove(C.clicking),setTimeout(()=>{this.wrapper.classList.remove(K.visible)},800))}dispose(){this.motion?.dispose(),this.wrapper.remove()}};c=new WeakMap;f=new WeakMap;p=new WeakMap;P=new WeakMap;x=new WeakMap;M=new WeakSet;it=y(function(){s(this,c).className=C.cursor;const r=document.createElement("div");r.className=C.cursorRipple,s(this,c).appendChild(r);const t=document.createElement("div");t.className=C.cursorFilling,s(this,c).appendChild(t);const e=document.createElement("div");e.className=C.cursorBorder,s(this,c).appendChild(e),this.wrapper.appendChild(s(this,c))},"#createCursor");Z=y(function(){const r=s(this,f)+(s(this,P)-s(this,f))*.2,t=s(this,p)+(s(this,x)-s(this,p))*.2,e=Math.abs(r-s(this,P));e>0&&(e<2?u(this,f,s(this,P)):u(this,f,r),s(this,c).style.left=`${s(this,f)}px`);const i=Math.abs(t-s(this,x));i>0&&(i<2?u(this,p,s(this,x)):u(this,p,t),s(this,c).style.top=`${s(this,p)}px`),requestAnimationFrame(()=>H(this,M,Z).call(this))},"#moveCursorToTarget");y(dt,"SimulatorMask");let Pt=dt;export{Pt as SimulatorMask};
