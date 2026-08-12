(() => {
  if (window.__DATA_C0RE_ASCII_CURSOR_V15__) return;
  window.__DATA_C0RE_ASCII_CURSOR_V15__ = true;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer:fine) and (hover:hover)');
  if (reduce.matches || !finePointer.matches) return;

  document.body.classList.add('ascii-cursor-active');
  const layerStyle = document.createElement('style');
  layerStyle.dataset.asciiCursorLayer = 'v15';
  layerStyle.textContent = `
    body.ascii-cursor-active main > *{position:relative;z-index:2}
    body.ascii-cursor-active main > .hero,
    body.ascii-cursor-active main > .about-panel{z-index:auto}
    body.ascii-cursor-active .hero-copy,
    body.ascii-cursor-active .hero-foot,
    body.ascii-cursor-active .about-panel-inner,
    body.ascii-cursor-active .about-scroll-cue{z-index:3}
    body.ascii-cursor-active .about-panel-media{z-index:0}
    body.ascii-cursor-active .about-panel::after{z-index:1}
  `;
  document.head.appendChild(layerStyle);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden','true');
  canvas.dataset.asciiCursor = 'v15';
  Object.assign(canvas.style, {
    position:'fixed', inset:'0', width:'100vw', height:'100vh', pointerEvents:'none',
    zIndex:'1', opacity:'0', mixBlendMode:'screen',
    transition:'opacity 850ms cubic-bezier(.2,.75,.25,1)', contain:'strict'
  });
  document.body.appendChild(canvas);

  const gl = canvas.getContext('webgl2', {
    alpha:true, antialias:false, depth:false, stencil:false,
    premultipliedAlpha:false, preserveDrawingBuffer:false, powerPreference:'low-power'
  });
  if (!gl) { canvas.remove(); return; }

  const vertexSource = `#version 300 es
  in vec2 a_position; out vec2 v_uv;
  void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;

  const simulationSource = `#version 300 es
  precision highp float;
  uniform sampler2D u_state; uniform sampler2D u_collision;
  uniform vec2 u_texel,u_mouse,u_prevMouse; uniform float u_inject,u_time;
  in vec2 v_uv; out vec4 fragColor;
  const float feed=.0367,kill=.0649,Da=1.,Db=.90,dt=1.;
  float wallAt(vec2 uv){return step(.5,texture(u_collision,clamp(uv,vec2(0),vec2(1))).r);}
  vec2 stateAt(vec2 uv,vec2 fallbackState){uv=clamp(uv,vec2(0),vec2(1));return mix(texture(u_state,uv).xy,fallbackState,wallAt(uv));}
  float segmentDistance(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),.000001),0.,1.);return length(pa-ba*h);}
  void main(){
    float wallHere=wallAt(v_uv); if(wallHere>.5){fragColor=vec4(1,0,0,1);return;}
    vec2 state=texture(u_state,v_uv).xy; float a=state.x,b=state.y; vec2 lap=vec2(0);
    lap+=stateAt(v_uv+vec2(-u_texel.x,0),state)*.20; lap+=stateAt(v_uv+vec2(u_texel.x,0),state)*.20;
    lap+=stateAt(v_uv+vec2(0,-u_texel.y),state)*.20; lap+=stateAt(v_uv+vec2(0,u_texel.y),state)*.20;
    lap+=stateAt(v_uv+vec2(-u_texel.x,-u_texel.y),state)*.05; lap+=stateAt(v_uv+vec2(u_texel.x,-u_texel.y),state)*.05;
    lap+=stateAt(v_uv+vec2(-u_texel.x,u_texel.y),state)*.05; lap+=stateAt(v_uv+vec2(u_texel.x,u_texel.y),state)*.05; lap-=state;
    vec2 wide=(stateAt(v_uv+vec2(-u_texel.x*3.,0),state)+stateAt(v_uv+vec2(u_texel.x*3.,0),state)+stateAt(v_uv+vec2(0,-u_texel.y*3.),state)+stateAt(v_uv+vec2(0,u_texel.y*3.),state))*.25-state;
    vec2 wider=(stateAt(v_uv+vec2(-u_texel.x*7.,0),state)+stateAt(v_uv+vec2(u_texel.x*7.,0),state)+stateAt(v_uv+vec2(0,-u_texel.y*7.),state)+stateAt(v_uv+vec2(0,u_texel.y*7.),state))*.25-state;
    float reaction=a*b*b; float nextA=a+(Da*lap.x-reaction+feed*(1.-a))*dt; float nextB=b+(Db*lap.y+reaction-(kill+feed)*b)*dt;
    nextB+=max(lap.y,0.)*.12+max(wide.y,0.)*.22+max(wider.y,0.)*.10;
    if(u_inject>.001){
      float aspect=u_texel.y/max(u_texel.x,.000001); vec2 p=v_uv,m=u_mouse,pm=u_prevMouse; p.x*=aspect;m.x*=aspect;pm.x*=aspect;
      float dist=segmentDistance(p,pm,m); float core=1.-smoothstep(.007,.048,dist); float bloom=1.-smoothstep(.036,.240,dist);
      float grain=.80+.20*sin(v_uv.x*83.+v_uv.y*69.+u_time*1.65); float brush=clamp((core*.96+bloom*.34)*grain,0.,1.)*(1.-wallHere);
      nextB=max(nextB,brush*u_inject); nextA=min(nextA,1.-brush*.32);
    }
    fragColor=vec4(clamp(nextA,0.,1.),clamp(nextB,0.,1.),0,1);
  }`;

  const displaySource = `#version 300 es
  precision highp float;
  uniform sampler2D u_state,u_collision; uniform vec2 u_resolution,u_grid;
  uniform vec3 u_cyan,u_magenta,u_acid,u_paper; in vec2 v_uv; out vec4 fragColor;
  float getCharMask(vec2 uv,float i){vec2 p=uv*2.-1.;float l=length(p),m=0.;
    if(i>.82)m=max(abs(p.x),abs(p.y))<.91?1.:0.; else if(i>.64){float b=max(abs(p.x),abs(p.y));m=(b<.91&&b>.40)?1.:0.;}
    else if(i>.47)m=(abs(p.x)<.34||abs(p.y)<.34)?1.:0.; else if(i>.31)m=(abs(p.x-p.y)<.34||abs(p.x+p.y)<.34)?1.:0.;
    else if(i>.17)m=(l<.79&&l>.32)?1.:0.; else if(i>.075)m=abs(p.y)<.31?1.:0.; else if(i>.018)m=l<.32?1.:0.;
    return m*(1.-smoothstep(.91,1.,max(abs(p.x),abs(p.y))));}
  vec3 getColor(float b){vec3 c=mix(u_cyan,u_magenta,smoothstep(.05,.46,b));c=mix(c,u_acid,smoothstep(.48,.82,b));return mix(c,u_paper,smoothstep(.82,1.,b)*.38);}
  float hit(vec2 cell){vec2 g=u_grid*8.;return step(.5,texture(u_collision,clamp((cell+.5)/g,vec2(0),vec2(1))).r);}
  float baseBlocked(vec2 c){float h=0.;vec2 o=c*8.;for(int y=0;y<8;y++)for(int x=0;x<8;x++)h=max(h,hit(o+vec2(float(x),float(y))));return h;}
  float halfBlocked(vec2 c,vec2 hcell){float h=0.;vec2 o=c*8.+hcell*4.;for(int y=0;y<4;y++)for(int x=0;x<4;x++)h=max(h,hit(o+vec2(float(x),float(y))));return h;}
  float quarterBlocked(vec2 c,vec2 q){float h=0.;vec2 o=c*8.+q*2.;for(int y=0;y<2;y++)for(int x=0;x<2;x++)h=max(h,hit(o+vec2(float(x),float(y))));return h;}
  bool baseEdge(vec2 c){return c.x<.5||c.y<.5||c.x>u_grid.x-1.5||c.y>u_grid.y-1.5;}
  bool halfEdge(vec2 c,vec2 h){return(c.x<.5&&h.x<.5)||(c.y<.5&&h.y<.5)||(c.x>u_grid.x-1.5&&h.x>.5)||(c.y>u_grid.y-1.5&&h.y>.5);}
  bool quarterEdge(vec2 c,vec2 q){return(c.x<.5&&q.x<.5)||(c.y<.5&&q.y<.5)||(c.x>u_grid.x-1.5&&q.x>2.5)||(c.y>u_grid.y-1.5&&q.y>2.5);}
  void main(){
    vec2 screenUV=clamp(gl_FragCoord.xy/u_resolution,vec2(0),vec2(1)); vec2 bp=screenUV*u_grid,bc=floor(bp),bl=fract(bp);
    vec2 rg=u_grid,rc=bc,luv=bl; float gain=1.;
    if(baseBlocked(bc)>.5||baseEdge(bc)){
      vec2 hc=floor(bl*2.);
      if(halfBlocked(bc,hc)<.5&&!halfEdge(bc,hc)){rg=u_grid*2.;vec2 p=screenUV*rg;rc=floor(p);luv=fract(p);gain=.95;}
      else{vec2 qc=floor(bl*4.);
        if(quarterBlocked(bc,qc)<.5&&!quarterEdge(bc,qc)){rg=u_grid*4.;vec2 p=screenUV*rg;rc=floor(p);luv=fract(p);gain=.89;}
        else{vec2 ec=floor(bl*8.);if(hit(bc*8.+ec)>.5){fragColor=vec4(0);return;}rg=u_grid*8.;vec2 p=screenUV*rg;rc=floor(p);luv=fract(p);gain=.82;}
      }
    }
    vec2 cellUV=(rc+.5)/rg; float b=texture(u_state,clamp(cellUV,vec2(0),vec2(1))).y; float i=smoothstep(.004,.30,b);float cm=getCharMask(luv,i);
    vec3 color=getColor(b);color*=(.96+smoothstep(.015,.50,b)*.66)*gain;float alpha=cm*smoothstep(.003,.20,b)*.84*gain;fragColor=vec4(color*cm,alpha);
  }`;

  const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s)||'GLSL compile error';gl.deleteShader(s);throw Error(e);}return s;};
  const makeProgram=fs=>{const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vertexSource));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const e=gl.getProgramInfoLog(p)||'WebGL link error';gl.deleteProgram(p);throw Error(e);}return p;};
  let simulationProgram,displayProgram;
  try{simulationProgram=makeProgram(simulationSource);displayProgram=makeProgram(displaySource);}catch(e){console.warn('DATA C0RE ASCII cursor v15 disabled:',e);canvas.remove();return;}

  const quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const bindQuad=p=>{gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,quad);const l=gl.getAttribLocation(p,'a_position');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);};
  const simU={state:gl.getUniformLocation(simulationProgram,'u_state'),collision:gl.getUniformLocation(simulationProgram,'u_collision'),texel:gl.getUniformLocation(simulationProgram,'u_texel'),mouse:gl.getUniformLocation(simulationProgram,'u_mouse'),prevMouse:gl.getUniformLocation(simulationProgram,'u_prevMouse'),inject:gl.getUniformLocation(simulationProgram,'u_inject'),time:gl.getUniformLocation(simulationProgram,'u_time')};
  const dispU={state:gl.getUniformLocation(displayProgram,'u_state'),collision:gl.getUniformLocation(displayProgram,'u_collision'),resolution:gl.getUniformLocation(displayProgram,'u_resolution'),grid:gl.getUniformLocation(displayProgram,'u_grid'),cyan:gl.getUniformLocation(displayProgram,'u_cyan'),magenta:gl.getUniformLocation(displayProgram,'u_magenta'),acid:gl.getUniformLocation(displayProgram,'u_acid'),paper:gl.getUniformLocation(displayProgram,'u_paper')};

  const parseColor=(v,f)=>{const m=(v||'').trim().match(/^#([0-9a-f]{6})$/i);if(!m)return f;const n=parseInt(m[1],16);return[((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];};
  const rootStyle=getComputedStyle(document.documentElement);
  const palette={cyan:parseColor(rootStyle.getPropertyValue('--cyan'),[0,.718,1]),magenta:parseColor(rootStyle.getPropertyValue('--magenta'),[.949,.161,.541]),acid:parseColor(rootStyle.getPropertyValue('--acid'),[.875,1,0]),paper:parseColor(rootStyle.getPropertyValue('--paper'),[.953,.945,.922])};

  const main=document.querySelector('main');
  const glyphCanvas=document.createElement('canvas');
  const glyphCtx=glyphCanvas.getContext('2d',{alpha:true,willReadFrequently:true});
  const GLYPH_SUPERSAMPLE=8, GLYPH_ALPHA_THRESHOLD=18;

  let simW=0,simH=0,textures=[],framebuffers=[],readIndex=0;
  let collisionTexture=null,collisionData=null,collisionRaf=0,collisionTimer=0,burstRaf=0,burstUntil=0,burstLast=0;
  let gridCols=25,gridRows=14,collisionCols=200,collisionRows=112;
  let pointer={x:.5,y:.5,px:.5,py:.5,lastMove:-Infinity};
  let running=false,activated=false,raf=0,fadeTimer=0,resetTimer=0;

  const makeTexture=(w,h,data)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,data);return t;};
  const makeCollisionTexture=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,collisionCols,collisionRows,0,gl.RGBA,gl.UNSIGNED_BYTE,null);return t;};
  const makeFramebuffer=t=>{const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return f;};
  const blankData=()=>{const d=new Uint8Array(simW*simH*4);for(let i=0;i<d.length;i+=4){d[i]=255;d[i+3]=255;}return d;};
  const visibleRect=r=>r.width>.5&&r.height>.5&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
  const markCell=(x,yTop)=>{if(!collisionData||x<0||x>=collisionCols||yTop<0||yTop>=collisionRows)return;const y=collisionRows-1-yTop,i=(y*collisionCols+x)*4;collisionData[i]=collisionData[i+1]=collisionData[i+2]=collisionData[i+3]=255;};
  const markRect=r=>{if(!collisionData||!visibleRect(r))return;const vw=Math.max(1,innerWidth),vh=Math.max(1,innerHeight),l=Math.max(0,r.left),rr=Math.min(vw,r.right),t=Math.max(0,r.top),b=Math.min(vh,r.bottom);if(rr<=l||b<=t)return;const x0=Math.max(0,Math.floor(l/vw*collisionCols)),x1=Math.min(collisionCols-1,Math.ceil(rr/vw*collisionCols)-1),y0=Math.max(0,Math.floor(t/vh*collisionRows)),y1=Math.min(collisionRows-1,Math.ceil(b/vh*collisionRows)-1);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)markCell(x,y);};
  const markMedia=()=>{if(!main)return;main.querySelectorAll('img,video,canvas,iframe').forEach(el=>{if(el===canvas||el===glyphCanvas)return;const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return;markRect(el.getBoundingClientRect());});};
  const bw=v=>{const n=parseFloat(v);return Number.isFinite(n)?n:0;};
  const markBorders=()=>{if(!main)return;main.querySelectorAll('*').forEach(el=>{if(el.matches('img,video,canvas,iframe,script,style'))return;const s=getComputedStyle(el),r=el.getBoundingClientRect();if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0||!visibleRect(r))return;const t=s.borderTopStyle!=='none'?bw(s.borderTopWidth):0,ri=s.borderRightStyle!=='none'?bw(s.borderRightWidth):0,b=s.borderBottomStyle!=='none'?bw(s.borderBottomWidth):0,l=s.borderLeftStyle!=='none'?bw(s.borderLeftWidth):0;if(t)markRect({left:r.left,right:r.right,top:r.top,bottom:r.top+t,width:r.width,height:t});if(b)markRect({left:r.left,right:r.right,top:r.bottom-b,bottom:r.bottom,width:r.width,height:b});if(l)markRect({left:r.left,right:r.left+l,top:r.top,bottom:r.bottom,width:l,height:r.height});if(ri)markRect({left:r.right-ri,right:r.right,top:r.top,bottom:r.bottom,width:ri,height:r.height});});};

  const transformedChar=(c,t)=>t==='uppercase'?c.toUpperCase():t==='lowercase'?c.toLowerCase():c;
  const rasterizeGlyphs=()=>{
    if(!main||!glyphCtx||!collisionData)return;
    const vw=Math.max(1,innerWidth),vh=Math.max(1,innerHeight),rw=collisionCols*GLYPH_SUPERSAMPLE,rh=collisionRows*GLYPH_SUPERSAMPLE;
    if(glyphCanvas.width!==rw||glyphCanvas.height!==rh){glyphCanvas.width=rw;glyphCanvas.height=rh;}
    const sx=rw/vw,sy=rh/vh;glyphCtx.setTransform(1,0,0,1,0,0);glyphCtx.clearRect(0,0,rw,rh);glyphCtx.setTransform(sx,0,0,sy,0,0);glyphCtx.fillStyle='#fff';glyphCtx.textAlign='left';glyphCtx.textBaseline='alphabetic';
    const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT,{acceptNode(n){if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;const p=n.parentElement;if(!p||p.closest('script,style,svg,canvas,video'))return NodeFilter.FILTER_REJECT;const s=getComputedStyle(p);return s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
    const range=document.createRange();let node;
    while((node=walker.nextNode())){
      const parent=node.parentElement;if(!parent)continue;const s=getComputedStyle(parent);const fs=parseFloat(s.fontSize)||16;
      glyphCtx.font=`${s.fontStyle||'normal'} ${s.fontVariant||'normal'} ${s.fontWeight||'400'} ${fs}px ${s.fontFamily||'sans-serif'}`;
      if('fontKerning'in glyphCtx)glyphCtx.fontKerning=s.fontKerning==='none'?'none':'auto';
      if('letterSpacing'in glyphCtx)glyphCtx.letterSpacing=s.letterSpacing==='normal'?'0px':s.letterSpacing;
      if('wordSpacing'in glyphCtx)glyphCtx.wordSpacing=s.wordSpacing==='normal'?'0px':s.wordSpacing;
      if('direction'in glyphCtx)glyphCtx.direction=s.direction==='rtl'?'rtl':'ltr';
      const probe=glyphCtx.measureText('Hg');const fa=probe.fontBoundingBoxAscent||probe.actualBoundingBoxAscent||fs*.8,fd=probe.fontBoundingBoxDescent||probe.actualBoundingBoxDescent||fs*.2,fh=fa+fd;
      const text=node.nodeValue;
      for(let i=0;i<text.length;){const cp=text.codePointAt(i),raw=String.fromCodePoint(cp),start=i;i+=raw.length;if(!raw.trim())continue;const ch=transformedChar(raw,s.textTransform);try{range.setStart(node,start);range.setEnd(node,i);}catch{continue;}const r=range.getBoundingClientRect();if(!visibleRect(r))continue;
        const baseline=r.top+(r.height-fh)*.5+fa;glyphCtx.fillText(ch,r.left,baseline);
      }
    }
    range.detach?.();glyphCtx.setTransform(1,0,0,1,0,0);
    const pixels=glyphCtx.getImageData(0,0,rw,rh).data,s=GLYPH_SUPERSAMPLE;
    for(let y=0;y<collisionRows;y++){const py0=y*s;for(let x=0;x<collisionCols;x++){const px0=x*s;let hit=false;for(let py=py0;py<py0+s&&!hit;py++){let p=(py*rw+px0)*4+3;for(let px=px0;px<px0+s;px++,p+=4){if(pixels[p]>=GLYPH_ALPHA_THRESHOLD){hit=true;break;}}}if(hit)markCell(x,y);}}
  };

  const uploadCollision=()=>{gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,collisionTexture);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,collisionCols,collisionRows,gl.RGBA,gl.UNSIGNED_BYTE,collisionData);gl.activeTexture(gl.TEXTURE0);};
  const updateCollision=()=>{if(!collisionTexture)return;const n=collisionCols*collisionRows*4;if(!collisionData||collisionData.length!==n)collisionData=new Uint8Array(n);collisionData.fill(0);markMedia();markBorders();rasterizeGlyphs();uploadCollision();};
  const scheduleCollisionUpdate=()=>{if(collisionTimer||collisionRaf)return;collisionTimer=setTimeout(()=>{collisionTimer=0;collisionRaf=requestAnimationFrame(()=>{collisionRaf=0;updateCollision();});},36);};
  const collisionBurst=(ms=520)=>{burstUntil=Math.max(burstUntil,performance.now()+ms);if(burstRaf)return;const tick=now=>{if(now-burstLast>48){burstLast=now;updateCollision();}if(now<burstUntil)burstRaf=requestAnimationFrame(tick);else burstRaf=0;};burstRaf=requestAnimationFrame(tick);};

  const resetState=()=>{if(!simW||!simH||!textures.length)return;const d=blankData();textures.forEach(t=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,simW,simH,gl.RGBA,gl.UNSIGNED_BYTE,d);});readIndex=0;activated=false;pointer.px=pointer.x;pointer.py=pointer.y;};
  const resize=()=>{const w=Math.max(1,Math.round(innerWidth)),h=Math.max(1,Math.round(innerHeight));canvas.width=w;canvas.height=h;const nc=25,nr=Math.max(1,Math.round(nc*h/w)),cc=nc*8,cr=nr*8,collisionChanged=cc!==collisionCols||cr!==collisionRows;gridCols=nc;gridRows=nr;collisionCols=cc;collisionRows=cr;const tw=Math.max(320,Math.min(680,Math.round(w*.36))),th=Math.max(180,Math.round(tw*h/w)),simChanged=tw!==simW||th!==simH;if(simChanged){textures.forEach(t=>gl.deleteTexture(t));framebuffers.forEach(f=>gl.deleteFramebuffer(f));simW=tw;simH=th;const d=blankData();textures=[makeTexture(simW,simH,d),makeTexture(simW,simH,d)];framebuffers=textures.map(makeFramebuffer);readIndex=0;}if(collisionChanged||!collisionTexture){if(collisionTexture)gl.deleteTexture(collisionTexture);collisionTexture=makeCollisionTexture();collisionData=new Uint8Array(collisionCols*collisionRows*4);}updateCollision();};
  const simulationPass=(now,scale)=>{const wi=1-readIndex;gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffers[wi]);gl.viewport(0,0,simW,simH);bindQuad(simulationProgram);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[readIndex]);gl.uniform1i(simU.state,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,collisionTexture);gl.uniform1i(simU.collision,1);gl.uniform2f(simU.texel,1/simW,1/simH);gl.uniform2f(simU.mouse,pointer.x,pointer.y);gl.uniform2f(simU.prevMouse,pointer.px,pointer.py);gl.uniform1f(simU.inject,now-pointer.lastMove<180?scale:0);gl.uniform1f(simU.time,now*.001);gl.drawArrays(gl.TRIANGLES,0,6);readIndex=wi;};
  const displayPass=()=>{gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);bindQuad(displayProgram);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[readIndex]);gl.uniform1i(dispU.state,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,collisionTexture);gl.uniform1i(dispU.collision,1);gl.uniform2f(dispU.resolution,canvas.width,canvas.height);gl.uniform2f(dispU.grid,gridCols,gridRows);gl.uniform3fv(dispU.cyan,palette.cyan);gl.uniform3fv(dispU.magenta,palette.magenta);gl.uniform3fv(dispU.acid,palette.acid);gl.uniform3fv(dispU.paper,palette.paper);gl.drawArrays(gl.TRIANGLES,0,6);gl.disable(gl.BLEND);};
  const frame=now=>{if(!running||document.hidden)return;const moving=now-pointer.lastMove<210,passes=moving?8:5;for(let i=0;i<passes;i++)simulationPass(now,i===0?1:.58);displayPass();pointer.px+=(pointer.x-pointer.px)*.34;pointer.py+=(pointer.y-pointer.py)*.34;raf=requestAnimationFrame(frame);};
  const start=()=>{if(running)return;running=true;raf=requestAnimationFrame(frame);};
  const stopAndReset=()=>{running=false;cancelAnimationFrame(raf);canvas.style.opacity='0';resetState();};
  const wake=e=>{if(!finePointer.matches||reduce.matches)return;if(!activated){pointer.px=e.clientX/Math.max(1,innerWidth);pointer.py=1-e.clientY/Math.max(1,innerHeight);}pointer.x=Math.max(0,Math.min(1,e.clientX/Math.max(1,innerWidth)));pointer.y=Math.max(0,Math.min(1,1-e.clientY/Math.max(1,innerHeight)));pointer.lastMove=performance.now();activated=true;canvas.style.opacity='.80';start();scheduleCollisionUpdate();clearTimeout(fadeTimer);clearTimeout(resetTimer);fadeTimer=setTimeout(()=>canvas.style.opacity='0',1150);resetTimer=setTimeout(stopAndReset,2050);};

  resize();
  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',scheduleCollisionUpdate,{passive:true});
  addEventListener('pointermove',wake,{passive:true});
  addEventListener('pointerover',()=>collisionBurst(650),{passive:true});
  addEventListener('pointerout',()=>collisionBurst(650),{passive:true});
  document.addEventListener('data-c0re-languagechange',()=>collisionBurst(780));
  document.fonts?.ready?.then(()=>collisionBurst(250)).catch?.(()=>{});
  if(main&&'ResizeObserver'in window)new ResizeObserver(()=>collisionBurst(320)).observe(main);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;cancelAnimationFrame(raf);}else if(activated)start();});
})();