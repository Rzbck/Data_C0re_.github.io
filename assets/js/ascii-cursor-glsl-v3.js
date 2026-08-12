(() => {
  if (window.__DATA_C0RE_ASCII_CURSOR_V11__) return;
  window.__DATA_C0RE_ASCII_CURSOR_V11__ = true;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer:fine) and (hover:hover)');
  if (reduce.matches || !finePointer.matches) return;

  document.body.classList.add('ascii-cursor-active');

  const layerStyle = document.createElement('style');
  layerStyle.dataset.asciiCursorLayer = 'v11';
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
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.asciiCursor = 'v11';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '1', opacity: '0', mixBlendMode: 'screen',
    transition: 'opacity 850ms cubic-bezier(.2,.75,.25,1)', contain: 'strict'
  });
  document.body.appendChild(canvas);

  const gl = canvas.getContext('webgl2', {
    alpha: true, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, preserveDrawingBuffer: false,
    powerPreference: 'low-power'
  });
  if (!gl) { canvas.remove(); return; }

  const vertexSource = `#version 300 es
    in vec2 a_position;
    out vec2 v_uv;
    void main(){
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const simulationSource = `#version 300 es
    precision highp float;
    uniform sampler2D u_state;
    uniform sampler2D u_collision;
    uniform vec2 u_texel;
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;
    uniform float u_inject;
    uniform float u_time;
    in vec2 v_uv;
    out vec4 fragColor;

    const float feed = 0.0367;
    const float kill = 0.0649;
    const float Da = 1.0;
    const float Db = 0.90;
    const float dt = 1.0;

    float wallAt(vec2 uv){
      return step(0.5, texture(u_collision, clamp(uv, vec2(0.0), vec2(1.0))).r);
    }

    vec2 stateAt(vec2 uv, vec2 fallbackState){
      uv = clamp(uv, vec2(0.0), vec2(1.0));
      return mix(texture(u_state, uv).xy, fallbackState, wallAt(uv));
    }

    float segmentDistance(vec2 p, vec2 a, vec2 b){
      vec2 pa = p - a;
      vec2 ba = b - a;
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);
      return length(pa - ba * h);
    }

    void main(){
      float wallHere = wallAt(v_uv);
      if (wallHere > 0.5) {
        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        return;
      }

      vec2 state = texture(u_state, v_uv).xy;
      float a = state.x;
      float b = state.y;

      vec2 lap = vec2(0.0);
      lap += stateAt(v_uv + vec2(-u_texel.x, 0.0), state) * 0.20;
      lap += stateAt(v_uv + vec2( u_texel.x, 0.0), state) * 0.20;
      lap += stateAt(v_uv + vec2(0.0, -u_texel.y), state) * 0.20;
      lap += stateAt(v_uv + vec2(0.0,  u_texel.y), state) * 0.20;
      lap += stateAt(v_uv + vec2(-u_texel.x, -u_texel.y), state) * 0.05;
      lap += stateAt(v_uv + vec2( u_texel.x, -u_texel.y), state) * 0.05;
      lap += stateAt(v_uv + vec2(-u_texel.x,  u_texel.y), state) * 0.05;
      lap += stateAt(v_uv + vec2( u_texel.x,  u_texel.y), state) * 0.05;
      lap -= state;

      vec2 wide = vec2(0.0);
      wide += stateAt(v_uv + vec2(-u_texel.x * 3.0, 0.0), state);
      wide += stateAt(v_uv + vec2( u_texel.x * 3.0, 0.0), state);
      wide += stateAt(v_uv + vec2(0.0, -u_texel.y * 3.0), state);
      wide += stateAt(v_uv + vec2(0.0,  u_texel.y * 3.0), state);
      wide = wide * 0.25 - state;

      vec2 wider = vec2(0.0);
      wider += stateAt(v_uv + vec2(-u_texel.x * 7.0, 0.0), state);
      wider += stateAt(v_uv + vec2( u_texel.x * 7.0, 0.0), state);
      wider += stateAt(v_uv + vec2(0.0, -u_texel.y * 7.0), state);
      wider += stateAt(v_uv + vec2(0.0,  u_texel.y * 7.0), state);
      wider = wider * 0.25 - state;

      float reaction = a * b * b;
      float nextA = a + (Da * lap.x - reaction + feed * (1.0 - a)) * dt;
      float nextB = b + (Db * lap.y + reaction - (kill + feed) * b) * dt;

      nextB += max(lap.y, 0.0) * 0.12;
      nextB += max(wide.y, 0.0) * 0.22;
      nextB += max(wider.y, 0.0) * 0.10;

      if (u_inject > 0.001) {
        float aspect = u_texel.y / max(u_texel.x, 0.000001);
        vec2 p = v_uv;
        vec2 m = u_mouse;
        vec2 pm = u_prevMouse;
        p.x *= aspect; m.x *= aspect; pm.x *= aspect;

        float dist = segmentDistance(p, pm, m);
        float core = 1.0 - smoothstep(0.007, 0.048, dist);
        float bloom = 1.0 - smoothstep(0.036, 0.240, dist);
        float grain = 0.80 + 0.20 * sin(v_uv.x * 83.0 + v_uv.y * 69.0 + u_time * 1.65);
        float brush = clamp((core * 0.96 + bloom * 0.34) * grain, 0.0, 1.0) * (1.0 - wallHere);
        nextB = max(nextB, brush * u_inject);
        nextA = min(nextA, 1.0 - brush * 0.32);
      }

      fragColor = vec4(clamp(nextA, 0.0, 1.0), clamp(nextB, 0.0, 1.0), 0.0, 1.0);
    }
  `;

  const displaySource = `#version 300 es
    precision highp float;
    uniform sampler2D u_state;
    uniform sampler2D u_collision;
    uniform vec2 u_resolution;
    uniform vec2 u_grid;
    uniform vec3 u_cyan;
    uniform vec3 u_magenta;
    uniform vec3 u_acid;
    uniform vec3 u_paper;
    in vec2 v_uv;
    out vec4 fragColor;

    float getCharMask(vec2 localUV, float intensity){
      vec2 p = localUV * 2.0 - 1.0;
      float len = length(p);
      float mask = 0.0;
      if (intensity > 0.82) mask = max(abs(p.x), abs(p.y)) < 0.91 ? 1.0 : 0.0;
      else if (intensity > 0.64) {
        float box = max(abs(p.x), abs(p.y));
        mask = (box < 0.91 && box > 0.40) ? 1.0 : 0.0;
      } else if (intensity > 0.47) mask = (abs(p.x) < 0.34 || abs(p.y) < 0.34) ? 1.0 : 0.0;
      else if (intensity > 0.31) mask = (abs(p.x - p.y) < 0.34 || abs(p.x + p.y) < 0.34) ? 1.0 : 0.0;
      else if (intensity > 0.17) mask = (len < 0.79 && len > 0.32) ? 1.0 : 0.0;
      else if (intensity > 0.075) mask = abs(p.y) < 0.31 ? 1.0 : 0.0;
      else if (intensity > 0.018) mask = len < 0.32 ? 1.0 : 0.0;
      float edge = max(abs(p.x), abs(p.y));
      return mask * (1.0 - smoothstep(0.91, 1.0, edge));
    }

    vec3 getColor(float b){
      vec3 col = mix(u_cyan, u_magenta, smoothstep(0.05, 0.46, b));
      col = mix(col, u_acid, smoothstep(0.48, 0.82, b));
      return mix(col, u_paper, smoothstep(0.82, 1.0, b) * 0.38);
    }

    float fineCollision(vec2 fineCell){
      vec2 fineGrid = u_grid * 4.0;
      vec2 uv = (fineCell + 0.5) / fineGrid;
      return step(0.5, texture(u_collision, clamp(uv, vec2(0.0), vec2(1.0))).r);
    }

    float baseBlocked(vec2 baseCell){
      float blocked = 0.0;
      vec2 origin = baseCell * 4.0;
      for (int y = 0; y < 4; y++) {
        for (int x = 0; x < 4; x++) {
          blocked = max(blocked, fineCollision(origin + vec2(float(x), float(y))));
        }
      }
      return blocked;
    }

    float halfBlocked(vec2 baseCell, vec2 halfCell){
      float blocked = 0.0;
      vec2 origin = baseCell * 4.0 + halfCell * 2.0;
      for (int y = 0; y < 2; y++) {
        for (int x = 0; x < 2; x++) {
          blocked = max(blocked, fineCollision(origin + vec2(float(x), float(y))));
        }
      }
      return blocked;
    }

    void main(){
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 screenUV = clamp(fragCoord / u_resolution, vec2(0.0), vec2(1.0));
      vec2 baseGridPos = screenUV * u_grid;
      vec2 baseCell = floor(baseGridPos);
      vec2 baseLocal = fract(baseGridPos);

      vec2 renderGrid = u_grid;
      vec2 renderCell = baseCell;
      vec2 localUV = baseLocal;
      float detailGain = 1.0;

      if (baseBlocked(baseCell) > 0.5) {
        vec2 halfCell = floor(baseLocal * 2.0);
        if (halfBlocked(baseCell, halfCell) < 0.5) {
          renderGrid = u_grid * 2.0;
          vec2 renderPos = screenUV * renderGrid;
          renderCell = floor(renderPos);
          localUV = fract(renderPos);
          detailGain = 0.94;
        } else {
          vec2 quarterCell = floor(baseLocal * 4.0);
          if (fineCollision(baseCell * 4.0 + quarterCell) > 0.5) {
            fragColor = vec4(0.0);
            return;
          }
          renderGrid = u_grid * 4.0;
          vec2 renderPos = screenUV * renderGrid;
          renderCell = floor(renderPos);
          localUV = fract(renderPos);
          detailGain = 0.86;
        }
      }

      vec2 cellUV = (renderCell + 0.5) / renderGrid;
      float b = texture(u_state, clamp(cellUV, vec2(0.0), vec2(1.0))).y;
      float intensity = smoothstep(0.004, 0.30, b);
      float charMask = getCharMask(localUV, intensity);
      vec3 color = getColor(b);
      float glow = smoothstep(0.015, 0.50, b);
      color *= (0.96 + glow * 0.66) * detailGain;
      float alpha = charMask * smoothstep(0.003, 0.20, b) * 0.84 * detailGain;
      fragColor = vec4(color * charMask, alpha);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader) || 'GLSL compile error';
      gl.deleteShader(shader);
      throw new Error(error);
    }
    return shader;
  };

  const makeProgram = fragmentSource => {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program) || 'WebGL link error';
      gl.deleteProgram(program);
      throw new Error(error);
    }
    return program;
  };

  let simulationProgram, displayProgram;
  try {
    simulationProgram = makeProgram(simulationSource);
    displayProgram = makeProgram(displaySource);
  } catch (error) {
    console.warn('DATA C0RE ASCII cursor v11 disabled:', error);
    canvas.remove();
    return;
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

  const bindQuad = program => {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    const location = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  };

  const simUniforms = {
    state: gl.getUniformLocation(simulationProgram, 'u_state'),
    collision: gl.getUniformLocation(simulationProgram, 'u_collision'),
    texel: gl.getUniformLocation(simulationProgram, 'u_texel'),
    mouse: gl.getUniformLocation(simulationProgram, 'u_mouse'),
    prevMouse: gl.getUniformLocation(simulationProgram, 'u_prevMouse'),
    inject: gl.getUniformLocation(simulationProgram, 'u_inject'),
    time: gl.getUniformLocation(simulationProgram, 'u_time')
  };

  const displayUniforms = {
    state: gl.getUniformLocation(displayProgram, 'u_state'),
    collision: gl.getUniformLocation(displayProgram, 'u_collision'),
    resolution: gl.getUniformLocation(displayProgram, 'u_resolution'),
    grid: gl.getUniformLocation(displayProgram, 'u_grid'),
    cyan: gl.getUniformLocation(displayProgram, 'u_cyan'),
    magenta: gl.getUniformLocation(displayProgram, 'u_magenta'),
    acid: gl.getUniformLocation(displayProgram, 'u_acid'),
    paper: gl.getUniformLocation(displayProgram, 'u_paper')
  };

  const parseColor = (value, fallback) => {
    const raw = (value || '').trim();
    const hex = raw.match(/^#([0-9a-f]{6})$/i);
    if (!hex) return fallback;
    const n = parseInt(hex[1], 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };

  const siteStyle = getComputedStyle(document.documentElement);
  const palette = {
    cyan: parseColor(siteStyle.getPropertyValue('--cyan'), [0.0, 0.718, 1.0]),
    magenta: parseColor(siteStyle.getPropertyValue('--magenta'), [0.949, 0.161, 0.541]),
    acid: parseColor(siteStyle.getPropertyValue('--acid'), [0.875, 1.0, 0.0]),
    paper: parseColor(siteStyle.getPropertyValue('--paper'), [0.953, 0.945, 0.922])
  };

  const main = document.querySelector('main');
  let simW = 0, simH = 0, textures = [], framebuffers = [], readIndex = 0;
  let collisionTexture = null, collisionData = null, collisionRaf = 0, collisionTimer = 0;
  let gridCols = 25, gridRows = 14, collisionCols = 100, collisionRows = 56;
  let pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, lastMove: -Infinity };
  let running = false, activated = false, raf = 0, fadeTimer = 0, resetTimer = 0;

  const makeTexture = (w, h, data) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return texture;
  };

  const makeCollisionTexture = () => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, collisionCols, collisionRows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return texture;
  };

  const makeFramebuffer = texture => {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return fb;
  };

  const blankData = () => {
    const data = new Uint8Array(simW * simH * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 255;
    }
    return data;
  };

  const visibleRect = rect => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return rect.width > 0.5 && rect.height > 0.5 && rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw;
  };

  const markRect = rect => {
    if (!collisionData || !visibleRect(rect)) return;
    const vw = Math.max(1, window.innerWidth);
    const vh = Math.max(1, window.innerHeight);
    const left = Math.max(0, rect.left);
    const right = Math.min(vw, rect.right);
    const top = Math.max(0, rect.top);
    const bottom = Math.min(vh, rect.bottom);
    if (right <= left || bottom <= top) return;

    const x0 = Math.max(0, Math.floor(left / vw * collisionCols));
    const x1 = Math.min(collisionCols - 1, Math.ceil(right / vw * collisionCols) - 1);
    const yTop0 = Math.max(0, Math.floor(top / vh * collisionRows));
    const yTop1 = Math.min(collisionRows - 1, Math.ceil(bottom / vh * collisionRows) - 1);

    for (let yTop = yTop0; yTop <= yTop1; yTop++) {
      const y = collisionRows - 1 - yTop;
      for (let x = x0; x <= x1; x++) {
        const i = (y * collisionCols + x) * 4;
        collisionData[i] = 255;
        collisionData[i + 1] = 255;
        collisionData[i + 2] = 255;
        collisionData[i + 3] = 255;
      }
    }
  };

  const markMedia = () => {
    if (!main) return;
    main.querySelectorAll('img,video,canvas,iframe').forEach(el => {
      if (el === canvas) return;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return;
      markRect(el.getBoundingClientRect());
    });
  };

  const borderWidth = value => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  };

  const markBorders = () => {
    if (!main) return;
    main.querySelectorAll('*').forEach(el => {
      if (el.matches('img,video,canvas,iframe,script,style')) return;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return;
      const rect = el.getBoundingClientRect();
      if (!visibleRect(rect)) return;

      const top = style.borderTopStyle !== 'none' ? borderWidth(style.borderTopWidth) : 0;
      const right = style.borderRightStyle !== 'none' ? borderWidth(style.borderRightWidth) : 0;
      const bottom = style.borderBottomStyle !== 'none' ? borderWidth(style.borderBottomWidth) : 0;
      const left = style.borderLeftStyle !== 'none' ? borderWidth(style.borderLeftWidth) : 0;

      if (top > 0) markRect({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.top + top, width: rect.width, height: top });
      if (bottom > 0) markRect({ left: rect.left, right: rect.right, top: rect.bottom - bottom, bottom: rect.bottom, width: rect.width, height: bottom });
      if (left > 0) markRect({ left: rect.left, right: rect.left + left, top: rect.top, bottom: rect.bottom, width: left, height: rect.height });
      if (right > 0) markRect({ left: rect.right - right, right: rect.right, top: rect.top, bottom: rect.bottom, width: right, height: rect.height });
    });
  };

  const markText = () => {
    if (!main) return;
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,svg,canvas,video')) return NodeFilter.FILTER_REJECT;
        const style = getComputedStyle(parent);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const range = document.createRange();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      for (let i = 0; i < text.length;) {
        const codePoint = text.codePointAt(i);
        const char = String.fromCodePoint(codePoint);
        const start = i;
        i += char.length;
        if (!char.trim()) continue;
        try {
          range.setStart(node, start);
          range.setEnd(node, i);
          markRect(range.getBoundingClientRect());
        } catch {}
      }
    }
    range.detach?.();
  };

  const uploadCollision = () => {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, collisionTexture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, collisionCols, collisionRows, gl.RGBA, gl.UNSIGNED_BYTE, collisionData);
    gl.activeTexture(gl.TEXTURE0);
  };

  const updateCollision = () => {
    if (!collisionTexture) return;
    const needed = collisionCols * collisionRows * 4;
    if (!collisionData || collisionData.length !== needed) collisionData = new Uint8Array(needed);
    collisionData.fill(0);
    markMedia();
    markBorders();
    markText();
    uploadCollision();
  };

  const scheduleCollisionUpdate = () => {
    if (collisionTimer || collisionRaf) return;
    collisionTimer = window.setTimeout(() => {
      collisionTimer = 0;
      collisionRaf = requestAnimationFrame(() => {
        collisionRaf = 0;
        updateCollision();
      });
    }, 36);
  };

  const resetState = () => {
    if (!simW || !simH || !textures.length) return;
    const data = blankData();
    textures.forEach(texture => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, simW, simH, gl.RGBA, gl.UNSIGNED_BYTE, data);
    });
    readIndex = 0;
    activated = false;
    pointer.px = pointer.x;
    pointer.py = pointer.y;
  };

  const resize = () => {
    const width = Math.max(1, Math.round(window.innerWidth));
    const height = Math.max(1, Math.round(window.innerHeight));
    canvas.width = width;
    canvas.height = height;

    const nextCols = 25;
    const nextRows = Math.max(1, Math.round(nextCols * height / width));
    const nextCollisionCols = nextCols * 4;
    const nextCollisionRows = nextRows * 4;
    const collisionSizeChanged = nextCollisionCols !== collisionCols || nextCollisionRows !== collisionRows;
    gridCols = nextCols;
    gridRows = nextRows;
    collisionCols = nextCollisionCols;
    collisionRows = nextCollisionRows;

    const targetW = Math.max(320, Math.min(680, Math.round(width * 0.36)));
    const targetH = Math.max(180, Math.round(targetW * height / width));
    const simChanged = targetW !== simW || targetH !== simH;

    if (simChanged) {
      textures.forEach(texture => gl.deleteTexture(texture));
      framebuffers.forEach(fb => gl.deleteFramebuffer(fb));
      simW = targetW;
      simH = targetH;
      const data = blankData();
      textures = [makeTexture(simW, simH, data), makeTexture(simW, simH, data)];
      framebuffers = textures.map(makeFramebuffer);
      readIndex = 0;
    }

    if (collisionSizeChanged || !collisionTexture) {
      if (collisionTexture) gl.deleteTexture(collisionTexture);
      collisionTexture = makeCollisionTexture();
      collisionData = new Uint8Array(collisionCols * collisionRows * 4);
    }

    updateCollision();
  };

  const simulationPass = (now, injectScale) => {
    const writeIndex = 1 - readIndex;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[writeIndex]);
    gl.viewport(0, 0, simW, simH);
    bindQuad(simulationProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[readIndex]);
    gl.uniform1i(simUniforms.state, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, collisionTexture);
    gl.uniform1i(simUniforms.collision, 1);
    gl.uniform2f(simUniforms.texel, 1 / simW, 1 / simH);
    gl.uniform2f(simUniforms.mouse, pointer.x, pointer.y);
    gl.uniform2f(simUniforms.prevMouse, pointer.px, pointer.py);
    const moving = now - pointer.lastMove < 180;
    gl.uniform1f(simUniforms.inject, moving ? injectScale : 0);
    gl.uniform1f(simUniforms.time, now * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    readIndex = writeIndex;
  };

  const displayPass = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    bindQuad(displayProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[readIndex]);
    gl.uniform1i(displayUniforms.state, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, collisionTexture);
    gl.uniform1i(displayUniforms.collision, 1);
    gl.uniform2f(displayUniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(displayUniforms.grid, gridCols, gridRows);
    gl.uniform3fv(displayUniforms.cyan, palette.cyan);
    gl.uniform3fv(displayUniforms.magenta, palette.magenta);
    gl.uniform3fv(displayUniforms.acid, palette.acid);
    gl.uniform3fv(displayUniforms.paper, palette.paper);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disable(gl.BLEND);
  };

  const frame = now => {
    if (!running || document.hidden) return;
    const moving = now - pointer.lastMove < 210;
    const passes = moving ? 8 : 5;
    for (let i = 0; i < passes; i++) simulationPass(now, i === 0 ? 1.0 : 0.58);
    displayPass();
    pointer.px += (pointer.x - pointer.px) * 0.34;
    pointer.py += (pointer.y - pointer.py) * 0.34;
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };

  const stopAndReset = () => {
    running = false;
    cancelAnimationFrame(raf);
    canvas.style.opacity = '0';
    resetState();
  };

  const wake = event => {
    if (!finePointer.matches || reduce.matches) return;
    if (!activated) {
      pointer.px = event.clientX / Math.max(1, window.innerWidth);
      pointer.py = 1 - event.clientY / Math.max(1, window.innerHeight);
    }
    pointer.x = Math.max(0, Math.min(1, event.clientX / Math.max(1, window.innerWidth)));
    pointer.y = Math.max(0, Math.min(1, 1 - event.clientY / Math.max(1, window.innerHeight)));
    pointer.lastMove = performance.now();
    activated = true;
    canvas.style.opacity = '0.80';
    start();

    clearTimeout(fadeTimer);
    clearTimeout(resetTimer);
    fadeTimer = setTimeout(() => { canvas.style.opacity = '0'; }, 1150);
    resetTimer = setTimeout(stopAndReset, 2050);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', scheduleCollisionUpdate, { passive: true });
  window.addEventListener('pointermove', wake, { passive: true });
  document.addEventListener('data-c0re-languagechange', () => {
    setTimeout(updateCollision, 0);
    setTimeout(updateCollision, 120);
  });
  document.fonts?.ready?.then(updateCollision).catch?.(() => {});
  if (main && 'ResizeObserver' in window) new ResizeObserver(scheduleCollisionUpdate).observe(main);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (activated) start();
  });
})();
