(() => {
  if (window.__DATA_C0RE_ASCII_CURSOR_V5__) return;
  window.__DATA_C0RE_ASCII_CURSOR_V5__ = true;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer:fine) and (hover:hover)');
  if (reduce.matches || !finePointer.matches) return;

  document.body.classList.add('ascii-cursor-active');
  const layerStyle = document.createElement('style');
  layerStyle.dataset.asciiCursorLayer = 'v5';
  layerStyle.textContent = `
    body.ascii-cursor-active main > *{position:relative;z-index:2}
    body.ascii-cursor-active main > .hero,
    body.ascii-cursor-active main > .about-panel{z-index:auto}
    body.ascii-cursor-active .hero-copy,
    body.ascii-cursor-active .hero-foot,
    body.ascii-cursor-active .about-panel-inner,
    body.ascii-cursor-active .about-scroll-cue{position:relative;z-index:3}
    body.ascii-cursor-active .about-panel-media{z-index:0}
    body.ascii-cursor-active .about-panel::after{z-index:1}
  `;
  document.head.appendChild(layerStyle);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.asciiCursor = 'v5';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '1', opacity: '0', mixBlendMode: 'screen',
    transition: 'opacity 300ms ease', contain: 'strict'
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
    uniform vec2 u_texel;
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;
    uniform float u_inject;
    uniform float u_time;
    uniform float u_alive;
    in vec2 v_uv;
    out vec4 fragColor;

    const float feed = 0.0367;
    const float kill = 0.0649;
    const float Da = 1.0;
    const float Db = 0.86;
    const float dt = 1.0;

    float hash21(vec2 p){
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float segmentDistance(vec2 p, vec2 a, vec2 b){
      vec2 pa = p - a;
      vec2 ba = b - a;
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.000001), 0.0, 1.0);
      return length(pa - ba * h);
    }

    void main(){
      vec2 state = texture(u_state, v_uv).xy;
      float a = state.x;
      float b = state.y;

      vec2 lap = vec2(0.0);
      lap += texture(u_state, v_uv + vec2(-u_texel.x, 0.0)).xy * 0.20;
      lap += texture(u_state, v_uv + vec2( u_texel.x, 0.0)).xy * 0.20;
      lap += texture(u_state, v_uv + vec2(0.0, -u_texel.y)).xy * 0.20;
      lap += texture(u_state, v_uv + vec2(0.0,  u_texel.y)).xy * 0.20;
      lap += texture(u_state, v_uv + vec2(-u_texel.x, -u_texel.y)).xy * 0.05;
      lap += texture(u_state, v_uv + vec2( u_texel.x, -u_texel.y)).xy * 0.05;
      lap += texture(u_state, v_uv + vec2(-u_texel.x,  u_texel.y)).xy * 0.05;
      lap += texture(u_state, v_uv + vec2( u_texel.x,  u_texel.y)).xy * 0.05;
      lap -= state;

      vec2 wide = vec2(0.0);
      wide += texture(u_state, v_uv + vec2(-u_texel.x * 3.0, 0.0)).xy;
      wide += texture(u_state, v_uv + vec2( u_texel.x * 3.0, 0.0)).xy;
      wide += texture(u_state, v_uv + vec2(0.0, -u_texel.y * 3.0)).xy;
      wide += texture(u_state, v_uv + vec2(0.0,  u_texel.y * 3.0)).xy;
      wide = wide * 0.25 - state;

      float reaction = a * b * b;
      float nextA = a + (Da * lap.x - reaction + feed * (1.0 - a)) * dt;
      float nextB = b + (Db * lap.y + reaction - (kill + feed) * b) * dt;

      // Wider transport makes the mouse gesture escape its local circle and travel.
      nextB += max(wide.y, 0.0) * 0.19;
      nextB += max(lap.y, 0.0) * 0.10;

      if (u_inject > 0.001) {
        float aspect = u_texel.y / max(u_texel.x, 0.000001);
        vec2 p = v_uv;
        vec2 m = u_mouse;
        vec2 pm = u_prevMouse;
        p.x *= aspect; m.x *= aspect; pm.x *= aspect;

        float dist = segmentDistance(p, pm, m);
        float core = 1.0 - smoothstep(0.010, 0.050, dist);
        float bloom = 1.0 - smoothstep(0.045, 0.180, dist);
        float grain = 0.82 + 0.18 * sin(v_uv.x * 91.0 + v_uv.y * 73.0 + u_time * 1.8);
        float brush = clamp((core * 0.92 + bloom * 0.24) * grain, 0.0, 1.0);
        nextB = max(nextB, brush * u_inject);
        nextA = min(nextA, 1.0 - brush * 0.30);
      }

      // After the first interaction, sparse descendants appear across the viewport.
      // They are weak enough to keep the mouse as the origin but let the field live everywhere.
      if (u_alive > 0.5) {
        vec2 cell = floor(v_uv * vec2(36.0, 22.0));
        float epoch = floor(u_time * 0.34);
        float n = hash21(cell + epoch * 17.71);
        float seed = smoothstep(0.9968, 1.0, n) * 0.075;
        nextB = max(nextB, seed);
        nextA = min(nextA, 1.0 - seed * 0.16);
      }

      fragColor = vec4(clamp(nextA, 0.0, 1.0), clamp(nextB, 0.0, 1.0), 0.0, 1.0);
    }
  `;

  const displaySource = `#version 300 es
    precision highp float;
    uniform sampler2D u_state;
    uniform vec2 u_resolution;
    uniform vec2 u_grid;
    in vec2 v_uv;
    out vec4 fragColor;

    float getCharMask(vec2 localUV, float intensity){
      vec2 p = localUV * 2.0 - 1.0;
      float len = length(p);
      float mask = 0.0;

      if (intensity > 0.82) {
        mask = max(abs(p.x), abs(p.y)) < 0.88 ? 1.0 : 0.0;
      } else if (intensity > 0.64) {
        float box = max(abs(p.x), abs(p.y));
        mask = (box < 0.88 && box > 0.43) ? 1.0 : 0.0;
      } else if (intensity > 0.47) {
        mask = (abs(p.x) < 0.30 || abs(p.y) < 0.30) ? 1.0 : 0.0;
      } else if (intensity > 0.31) {
        mask = (abs(p.x - p.y) < 0.30 || abs(p.x + p.y) < 0.30) ? 1.0 : 0.0;
      } else if (intensity > 0.17) {
        mask = (len < 0.76 && len > 0.35) ? 1.0 : 0.0;
      } else if (intensity > 0.075) {
        mask = abs(p.y) < 0.27 ? 1.0 : 0.0;
      } else if (intensity > 0.018) {
        mask = len < 0.28 ? 1.0 : 0.0;
      }

      float edge = max(abs(p.x), abs(p.y));
      return mask * (1.0 - smoothstep(0.88, 1.0, edge));
    }

    vec3 getColor(float b){
      vec3 cyan = vec3(0.00, 0.72, 1.00);
      vec3 magenta = vec3(1.00, 0.02, 0.62);
      vec3 yellow = vec3(1.00, 0.84, 0.02);
      vec3 col = mix(cyan, magenta, smoothstep(0.06, 0.48, b));
      return mix(col, yellow, smoothstep(0.50, 0.90, b));
    }

    void main(){
      vec2 fragCoord = gl_FragCoord.xy;

      // Exact viewport-fitted grid: 200 columns, aspect-derived rows.
      // Because gridPos is normalized by u_resolution, the first and last cells
      // terminate exactly at the viewport bounds and are never half-cropped.
      vec2 gridPos = (fragCoord / u_resolution) * u_grid;
      vec2 cell = floor(gridPos);
      vec2 localUV = fract(gridPos);
      vec2 cellUV = (cell + 0.5) / u_grid;

      float b = texture(u_state, clamp(cellUV, vec2(0.0), vec2(1.0))).y;
      float intensity = smoothstep(0.006, 0.34, b);
      float charMask = getCharMask(localUV, intensity);

      vec3 color = getColor(b);
      float glow = smoothstep(0.03, 0.55, b);
      color *= 0.78 + glow * 0.48;
      float alpha = charMask * smoothstep(0.006, 0.23, b) * 0.56;

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
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(p) || 'WebGL link error';
      gl.deleteProgram(p);
      throw new Error(error);
    }
    return p;
  };

  let simulationProgram, displayProgram;
  try {
    simulationProgram = makeProgram(simulationSource);
    displayProgram = makeProgram(displaySource);
  } catch (error) {
    console.warn('DATA C0RE ASCII cursor v5 disabled:', error);
    canvas.remove();
    return;
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

  const bindQuad = p => {
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    const location = gl.getAttribLocation(p, 'a_position');
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  };

  const simUniforms = {
    state: gl.getUniformLocation(simulationProgram, 'u_state'),
    texel: gl.getUniformLocation(simulationProgram, 'u_texel'),
    mouse: gl.getUniformLocation(simulationProgram, 'u_mouse'),
    prevMouse: gl.getUniformLocation(simulationProgram, 'u_prevMouse'),
    inject: gl.getUniformLocation(simulationProgram, 'u_inject'),
    time: gl.getUniformLocation(simulationProgram, 'u_time'),
    alive: gl.getUniformLocation(simulationProgram, 'u_alive')
  };
  const displayUniforms = {
    state: gl.getUniformLocation(displayProgram, 'u_state'),
    resolution: gl.getUniformLocation(displayProgram, 'u_resolution'),
    grid: gl.getUniformLocation(displayProgram, 'u_grid')
  };

  let simW = 0, simH = 0, textures = [], framebuffers = [], readIndex = 0;
  let gridCols = 200, gridRows = 100;
  let pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, lastMove: -Infinity };
  let running = false, activated = false, raf = 0, dimTimer = 0;

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

  const makeFramebuffer = texture => {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return fb;
  };

  const blankData = () => {
    const data = new Uint8Array(simW * simH * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
    return data;
  };

  const resize = () => {
    const width = Math.max(1, Math.round(window.innerWidth));
    const height = Math.max(1, Math.round(window.innerHeight));
    canvas.width = width;
    canvas.height = height;

    gridCols = 200;
    gridRows = Math.max(1, Math.round(gridCols * height / width));

    const targetW = Math.max(320, Math.min(640, Math.round(width * 0.34)));
    const targetH = Math.max(180, Math.round(targetW * height / width));
    if (targetW === simW && targetH === simH) return;

    textures.forEach(texture => gl.deleteTexture(texture));
    framebuffers.forEach(fb => gl.deleteFramebuffer(fb));
    simW = targetW;
    simH = targetH;
    const data = blankData();
    textures = [makeTexture(simW, simH, data), makeTexture(simW, simH, data)];
    framebuffers = textures.map(makeFramebuffer);
    readIndex = 0;
  };

  const simulationPass = (now, injectScale) => {
    const writeIndex = 1 - readIndex;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[writeIndex]);
    gl.viewport(0, 0, simW, simH);
    bindQuad(simulationProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[readIndex]);
    gl.uniform1i(simUniforms.state, 0);
    gl.uniform2f(simUniforms.texel, 1 / simW, 1 / simH);
    gl.uniform2f(simUniforms.mouse, pointer.x, pointer.y);
    gl.uniform2f(simUniforms.prevMouse, pointer.px, pointer.py);
    const moving = now - pointer.lastMove < 170;
    gl.uniform1f(simUniforms.inject, moving ? injectScale : 0);
    gl.uniform1f(simUniforms.time, now * 0.001);
    gl.uniform1f(simUniforms.alive, activated ? 1 : 0);
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
    gl.uniform2f(displayUniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(displayUniforms.grid, gridCols, gridRows);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disable(gl.BLEND);
  };

  const frame = now => {
    if (!running || document.hidden) return;
    const moving = now - pointer.lastMove < 190;
    const passes = moving ? 7 : 4;
    for (let i = 0; i < passes; i++) simulationPass(now, i === 0 ? 1.0 : 0.55);
    displayPass();
    pointer.px += (pointer.x - pointer.px) * 0.38;
    pointer.py += (pointer.y - pointer.py) * 0.38;
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
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
    canvas.style.opacity = '0.54';
    start();
    clearTimeout(dimTimer);
    dimTimer = setTimeout(() => { canvas.style.opacity = '0.34'; }, 1500);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', wake, { passive: true });
  window.addEventListener('scroll', () => {
    if (activated) start();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (activated) {
      start();
    }
  });
})();
