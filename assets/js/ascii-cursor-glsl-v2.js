(() => {
  if (window.__DATA_C0RE_ASCII_CURSOR_V2__) return;
  window.__DATA_C0RE_ASCII_CURSOR_V2__ = true;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer:fine) and (hover:hover)');
  if (reduce.matches || !finePointer.matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.asciiCursor = 'v2';
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '48', opacity: '0', mixBlendMode: 'screen',
    transition: 'opacity 220ms ease', contain: 'strict'
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
    uniform float u_inject;
    uniform float u_radius;
    in vec2 v_uv;
    out vec4 fragColor;

    const float feed = 0.0367;
    const float kill = 0.0649;
    const float Da = 1.0;
    const float Db = 0.5;
    const float dt = 1.0;

    void main(){
      vec2 state = texture(u_state, v_uv).xy;
      float a = state.x;
      float b = state.y;

      vec2 lap = vec2(0.0);
      lap += texture(u_state, v_uv + vec2(-u_texel.x, 0.0)).xy * 0.2;
      lap += texture(u_state, v_uv + vec2( u_texel.x, 0.0)).xy * 0.2;
      lap += texture(u_state, v_uv + vec2(0.0, -u_texel.y)).xy * 0.2;
      lap += texture(u_state, v_uv + vec2(0.0,  u_texel.y)).xy * 0.2;
      lap += texture(u_state, v_uv + vec2(-u_texel.x, -u_texel.y)).xy * 0.05;
      lap += texture(u_state, v_uv + vec2( u_texel.x, -u_texel.y)).xy * 0.05;
      lap += texture(u_state, v_uv + vec2(-u_texel.x,  u_texel.y)).xy * 0.05;
      lap += texture(u_state, v_uv + vec2( u_texel.x,  u_texel.y)).xy * 0.05;
      lap -= state;

      float reaction = a * b * b;
      float nextA = a + (Da * lap.x - reaction + feed * (1.0 - a)) * dt;
      float nextB = b + (Db * lap.y + reaction - (kill + feed) * b) * dt;

      if (u_inject > 0.001) {
        float aspect = u_texel.y / max(u_texel.x, 0.000001);
        vec2 d = v_uv - u_mouse;
        d.x *= aspect;
        float dist = length(d);
        float broad = 1.0 - smoothstep(u_radius * 0.12, u_radius, dist);
        float rim = smoothstep(u_radius * 0.48, u_radius * 0.72, dist)
                  * (1.0 - smoothstep(u_radius * 0.72, u_radius, dist));
        float brush = clamp(broad * 0.82 + rim * 0.55, 0.0, 1.0);
        nextB = max(nextB, brush * u_inject);
        nextA = min(nextA, 1.0 - brush * 0.34);
      }

      fragColor = vec4(clamp(nextA, 0.0, 1.0), clamp(nextB, 0.0, 1.0), 0.0, 1.0);
    }
  `;

  const displaySource = `#version 300 es
    precision highp float;
    uniform sampler2D u_state;
    uniform vec2 u_resolution;
    uniform float u_cell;
    in vec2 v_uv;
    out vec4 fragColor;

    float getCharMask(vec2 localUV, float intensity){
      vec2 p = localUV * 2.0 - 1.0;
      float len = length(p);
      float mask = 0.0;
      if (intensity > 0.8) mask = 1.0;
      else if (intensity > 0.6) {
        float box = max(abs(p.x), abs(p.y));
        mask = (box < 0.8 && box > 0.4) ? 1.0 : 0.0;
      } else if (intensity > 0.45) mask = (abs(p.x) < 0.2 || abs(p.y) < 0.2) ? 1.0 : 0.0;
      else if (intensity > 0.3) mask = (abs(p.x - p.y) < 0.2 || abs(p.x + p.y) < 0.2) ? 1.0 : 0.0;
      else if (intensity > 0.15) mask = (len < 0.7 && len > 0.4) ? 1.0 : 0.0;
      else if (intensity > 0.08) mask = abs(p.y) < 0.2 ? 1.0 : 0.0;
      else if (intensity > 0.02) mask = len < 0.2 ? 1.0 : 0.0;
      return mask * smoothstep(1.0, 0.8, max(abs(p.x), abs(p.y)));
    }

    vec3 getColor(float intensity){
      vec3 c1 = vec3(0.0, 0.8, 1.0);
      vec3 c2 = vec3(1.0, 0.0, 0.8);
      vec3 c3 = vec3(1.0, 0.9, 0.0);
      vec3 col = mix(c1, c2, smoothstep(0.1, 0.5, intensity));
      return mix(col, c3, smoothstep(0.5, 0.9, intensity));
    }

    void main(){
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 cellCoord = floor(fragCoord / u_cell) * u_cell + u_cell * 0.5;
      vec2 cellUV = clamp(cellCoord / u_resolution, vec2(0.0), vec2(1.0));
      float b = texture(u_state, cellUV).y;
      float intensity = smoothstep(0.012, 0.42, b);
      vec2 localUV = fract(fragCoord / u_cell);
      float charMask = getCharMask(localUV, intensity);
      vec3 charColor = getColor(b) * charMask * 1.28;
      float alpha = charMask * smoothstep(0.012, 0.26, b) * 0.92;
      fragColor = vec4(charColor, alpha);
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
    console.warn('DATA C0RE ASCII cursor v2 disabled:', error);
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
    inject: gl.getUniformLocation(simulationProgram, 'u_inject'),
    radius: gl.getUniformLocation(simulationProgram, 'u_radius')
  };
  const displayUniforms = {
    state: gl.getUniformLocation(displayProgram, 'u_state'),
    resolution: gl.getUniformLocation(displayProgram, 'u_resolution'),
    cell: gl.getUniformLocation(displayProgram, 'u_cell')
  };

  let simW = 0, simH = 0, textures = [], framebuffers = [], readIndex = 0;
  let pointer = { x: 0.5, y: 0.5, lastMove: -Infinity };
  let running = false, raf = 0, idleTimer = 0, resetTimer = 0;

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

  const resetState = () => {
    if (!simW || !simH) return;
    const data = blankData();
    textures.forEach(texture => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, simW, simH, gl.RGBA, gl.UNSIGNED_BYTE, data);
    });
    readIndex = 0;
  };

  const resize = () => {
    const width = Math.max(1, Math.round(window.innerWidth));
    const height = Math.max(1, Math.round(window.innerHeight));
    canvas.width = width;
    canvas.height = height;

    const targetW = Math.max(240, Math.min(540, Math.round(width * 0.32)));
    const targetH = Math.max(150, Math.round(targetW * height / width));
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

  const simulationPass = now => {
    const writeIndex = 1 - readIndex;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[writeIndex]);
    gl.viewport(0, 0, simW, simH);
    bindQuad(simulationProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[readIndex]);
    gl.uniform1i(simUniforms.state, 0);
    gl.uniform2f(simUniforms.texel, 1 / simW, 1 / simH);
    gl.uniform2f(simUniforms.mouse, pointer.x, pointer.y);
    const active = now - pointer.lastMove < 125 ? 1 : 0;
    gl.uniform1f(simUniforms.inject, active);
    gl.uniform1f(simUniforms.radius, 0.42);
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
    gl.uniform1f(displayUniforms.cell, 7.0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disable(gl.BLEND);
  };

  const frame = now => {
    if (!running || document.hidden) return;
    simulationPass(now);
    simulationPass(now);
    displayPass();
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  const wake = event => {
    if (!finePointer.matches || reduce.matches) return;
    pointer.x = Math.max(0, Math.min(1, event.clientX / Math.max(1, window.innerWidth)));
    pointer.y = Math.max(0, Math.min(1, 1 - event.clientY / Math.max(1, window.innerHeight)));
    pointer.lastMove = performance.now();
    canvas.style.opacity = '0.86';
    start();
    clearTimeout(idleTimer);
    clearTimeout(resetTimer);
    idleTimer = setTimeout(() => { canvas.style.opacity = '0'; }, 5200);
    resetTimer = setTimeout(stopAndReset, 5800);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', wake, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (performance.now() - pointer.lastMove < 5200) {
      start();
    }
  });
})();
