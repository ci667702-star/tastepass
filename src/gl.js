// 작은 WebGL 렌더러: 정점색 메시 + 반구광/방향광 + 블롭 그림자 + 외곽선(선택 표시) + 그리드 선
export const hexRGB = h => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
export const mulC = (c, f) => c.map(x => Math.min(1, x * f));
export const mixC = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
const toC = c => (typeof c === 'string' ? hexRGB(c) : c);

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

export class Geo {
  constructor() { this.p = []; this.n = []; this.c = []; }
  v(p, n, c) { this.p.push(p[0], p[1], p[2]); this.n.push(n[0], n[1], n[2]); this.c.push(c[0], c[1], c[2]); }
  tri(a, b, c, na, nb, nc, col) {
    const fn = cross(sub(b, a), sub(c, a));
    const avg = [na[0] + nb[0] + nc[0], na[1] + nb[1] + nc[1], na[2] + nb[2] + nc[2]];
    if (dot(fn, avg) < 0) { [b, c] = [c, b]; [nb, nc] = [nc, nb]; }
    this.v(a, na, col); this.v(b, nb, col); this.v(c, nc, col);
  }
  quad(a, b, c, d, n, col) { this.tri(a, b, c, n, n, n, col); this.tri(a, c, d, n, n, n, col); }
  box(x0, y0, z0, x1, y1, z1, col) {
    col = toC(col);
    const P = (x, y, z) => [x, y, z];
    this.quad(P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1), [0, 1, 0], mulC(col, 1.04));
    this.quad(P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1), [0, -1, 0], col);
    this.quad(P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1), [0, 0, 1], col);
    this.quad(P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0), [0, 0, -1], col);
    this.quad(P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0), [1, 0, 0], col);
    this.quad(P(x0, y0, z0), P(x0, y0, z1), P(x0, y1, z1), P(x0, y1, z0), [-1, 0, 0], col);
    return this;
  }
  // profile: [[r,y],...] 아래→위 순서
  lathe(profile, col, o = {}) {
    col = toC(col);
    const { seg = 28, cx = 0, cz = 0, sx = 1, sz = 1, smooth = true } = o;
    const sn = [];
    for (let k = 0; k < profile.length - 1; k++) {
      const [r0, y0] = profile[k], [r1, y1] = profile[k + 1];
      const l = Math.hypot(y1 - y0, r1 - r0) || 1;
      sn.push([(y1 - y0) / l, -(r1 - r0) / l]);
    }
    const vn = profile.map((_, i) => {
      const a = sn[i - 1], b = sn[i];
      const s = a && b ? [a[0] + b[0], a[1] + b[1]] : (a || b);
      const l = Math.hypot(s[0], s[1]) || 1; return [s[0] / l, s[1] / l];
    });
    const P = (r, y, t) => [cx + r * Math.cos(t) * sx, y, cz + r * Math.sin(t) * sz];
    const N = (nr, ny, t) => norm([nr * Math.cos(t) / sx, ny, nr * Math.sin(t) / sz]);
    for (let k = 0; k < profile.length - 1; k++) {
      const [r0, y0] = profile[k], [r1, y1] = profile[k + 1];
      const n0 = smooth ? vn[k] : sn[k], n1 = smooth ? vn[k + 1] : sn[k];
      for (let j = 0; j < seg; j++) {
        const t0 = (j / seg) * Math.PI * 2, t1 = ((j + 1) / seg) * Math.PI * 2;
        const a = P(r0, y0, t0), b = P(r0, y0, t1), c = P(r1, y1, t1), d = P(r1, y1, t0);
        const na = N(n0[0], n0[1], t0), nb = N(n0[0], n0[1], t1), nc = N(n1[0], n1[1], t1), nd = N(n1[0], n1[1], t0);
        this.tri(a, b, c, na, nb, nc, col); this.tri(a, c, d, na, nc, nd, col);
      }
    }
    return this;
  }
  ellipsoid(cx, cy, cz, rx, ry, rz, col, seg = 22) {
    const prof = [];
    for (let i = 0; i <= 12; i++) { const t = Math.PI - (i / 12) * Math.PI; prof.push([rx * Math.sin(t), cy + ry * Math.cos(t)]); }
    return this.lathe(prof, col, { cx, cz, sz: rz / rx, seg });
  }
  cyl(cx, cz, y0, y1, r, col, o = {}) {
    const r2 = o.r2 ?? r;
    return this.lathe([[0, y0], [r, y0], [r2, y1], [0, y1]], col, { cx, cz, smooth: false, seg: o.seg || 24, sx: o.sx || 1, sz: o.sz || 1 });
  }
  tube(p0, p1, r0, r1, col, seg = 16) {
    col = toC(col);
    const ax = norm(sub(p1, p0));
    const helper = Math.abs(ax[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm(cross(ax, helper)), w = cross(ax, u);
    for (let j = 0; j < seg; j++) {
      const t0 = (j / seg) * Math.PI * 2, t1 = ((j + 1) / seg) * Math.PI * 2;
      const dir = t => [u[0] * Math.cos(t) + w[0] * Math.sin(t), u[1] * Math.cos(t) + w[1] * Math.sin(t), u[2] * Math.cos(t) + w[2] * Math.sin(t)];
      const d0 = dir(t0), d1 = dir(t1);
      const a = [p0[0] + d0[0] * r0, p0[1] + d0[1] * r0, p0[2] + d0[2] * r0];
      const b = [p0[0] + d1[0] * r0, p0[1] + d1[1] * r0, p0[2] + d1[2] * r0];
      const c = [p1[0] + d1[0] * r1, p1[1] + d1[1] * r1, p1[2] + d1[2] * r1];
      const d = [p1[0] + d0[0] * r1, p1[1] + d0[1] * r1, p1[2] + d0[2] * r1];
      this.tri(a, b, c, d0, d1, d1, col); this.tri(a, c, d, d0, d1, d0, col);
    }
    return this;
  }
  merge(g, tx = 0, ty = 0, tz = 0, rot = 0) {
    const c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < g.p.length; i += 3) {
      const x = g.p[i], y = g.p[i + 1], z = g.p[i + 2];
      this.p.push(c * x + s * z + tx, y + ty, -s * x + c * z + tz);
      const nx = g.n[i], ny = g.n[i + 1], nz = g.n[i + 2];
      this.n.push(c * nx + s * nz, ny, -s * nx + c * nz);
      this.c.push(g.c[i], g.c[i + 1], g.c[i + 2]);
    }
    return this;
  }
}

/* ---------- 행렬 (column-major) ---------- */
export const M = {
  persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]); },
  look(e, c, up = [0, 1, 0]) {
    const z = norm(sub(e, c)), x = norm(cross(up, z)), y = cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]);
  },
  mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; },
  model(tx, ty, tz, rot = 0, sx = 1, sz = 1) { const c = Math.cos(rot), s = Math.sin(rot); return new Float32Array([c * sx, 0, -s * sx, 0, 0, 1, 0, 0, s * sz, 0, c * sz, 0, tx, ty, tz, 1]); },
  inv(m) {
    const o = new Float32Array(16);
    const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m;
    const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!det) return o; det = 1 / det;
    o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return o;
  },
  xf(m, v) { const [x, y, z, w = 1] = v; return [0, 1, 2, 3].map(r => m[r] * x + m[4 + r] * y + m[8 + r] * z + m[12 + r] * w); },
};

export function camera(cam, aspect) {
  const { theta, phi, dist, target } = cam;
  const eye = [target[0] + dist * Math.cos(phi) * Math.sin(theta), target[1] + dist * Math.sin(phi), target[2] + dist * Math.cos(phi) * Math.cos(theta)];
  const view = M.look(eye, target);
  const proj = M.persp(cam.fov || 0.7, aspect, 5, 8000);
  return { eye, view, proj, vp: M.mul(proj, view) };
}

export function ray(vp, ndcX, ndcY) {
  const inv = M.inv(vp);
  const a = M.xf(inv, [ndcX, ndcY, -1, 1]), b = M.xf(inv, [ndcX, ndcY, 1, 1]);
  const p0 = [a[0] / a[3], a[1] / a[3], a[2] / a[3]], p1 = [b[0] / b[3], b[1] / b[3], b[2] / b[3]];
  return { o: p0, d: norm(sub(p1, p0)) };
}
export function rayAABB(r, mn, mx) {
  let t0 = -Infinity, t1 = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(r.d[i]) < 1e-9) { if (r.o[i] < mn[i] || r.o[i] > mx[i]) return null; continue; }
    let a = (mn[i] - r.o[i]) / r.d[i], b = (mx[i] - r.o[i]) / r.d[i];
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    if (t0 > t1) return null;
  }
  return t1 < 0 ? null : t0;
}
export function rayPlaneY(r, y = 0) { if (Math.abs(r.d[1]) < 1e-6) return null; const t = (y - r.o[1]) / r.d[1]; return t < 0 ? null : [r.o[0] + r.d[0] * t, y, r.o[2] + r.d[2] * t]; }

/* ---------- 렌더러 ---------- */
const VS = `attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;uniform mat4 uVP;uniform mat4 uM;uniform float uPush;
varying vec3 vN;varying vec3 vC;varying vec3 vW;
void main(){vec4 w=uM*vec4(aP+aN*uPush,1.0);vW=w.xyz;vN=(uM*vec4(aN,0.0)).xyz;vC=aC;gl_Position=uVP*w;}`;
const FS = `precision mediump float;varying vec3 vN;varying vec3 vC;varying vec3 vW;
uniform vec3 uL;uniform float uFlat;uniform vec3 uFC;uniform float uA;uniform vec3 uE;uniform vec3 uEye;uniform float uAO;
void main(){if(uFlat>0.5){gl_FragColor=vec4(uFC,uA);return;}
vec3 n=normalize(vN);float d=max(dot(n,normalize(uL)),0.0);float h=0.5+0.5*n.y;
vec3 amb=mix(vec3(0.50,0.48,0.47),vec3(0.98,0.99,1.0),h)*0.56;
vec3 v=normalize(uEye-vW);float rim=pow(1.0-max(dot(n,v),0.0),3.0)*0.12;
float ao=mix(1.0,mix(0.7,1.0,smoothstep(0.0,30.0,vW.y)),uAO);
vec3 c=vC*(amb+d*0.6)*ao+rim+uE;gl_FragColor=vec4(c,uA);}`;
const SVS = `attribute vec2 aQ;uniform mat4 uVP;uniform mat4 uM;varying vec2 vQ;void main(){vQ=aQ;gl_Position=uVP*uM*vec4(aQ.x*0.5,0.0,aQ.y*0.5,1.0);}`;
const SFS = `precision mediump float;varying vec2 vQ;uniform float uA;void main(){float r=length(vQ);gl_FragColor=vec4(0.08,0.07,0.1,(1.0-smoothstep(0.35,1.0,r))*uA);}`;
const LVS = `attribute vec3 aP;attribute vec4 aC;uniform mat4 uVP;varying vec4 vC;void main(){vC=aC;gl_Position=uVP*vec4(aP,1.0);}`;
const LFS = `precision mediump float;varying vec4 vC;void main(){gl_FragColor=vC;}`;

function prog(gl, vs, fs) {
  const p = gl.createProgram();
  for (const [t, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    gl.attachShader(p, sh);
  }
  gl.linkProgram(p);
  const loc = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const u = gl.getActiveUniform(p, i); loc[u.name] = gl.getUniformLocation(p, u.name); }
  const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < na; i++) { const a = gl.getActiveAttrib(p, i); loc[a.name] = gl.getAttribLocation(p, a.name); }
  return { p, loc };
}

export class Renderer {
  constructor(canvas, opts = {}) {
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: !!opts.keep });
    if (!gl) throw new Error('WebGL을 쓸 수 없어요');
    this.gl = gl; this.canvas = canvas;
    this.main = prog(gl, VS, FS); this.sh = prog(gl, SVS, SFS); this.ln = prog(gl, LVS, LFS);
    this.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
  mesh(geo) {
    const gl = this.gl, mk = a => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a), gl.STATIC_DRAW); return b; };
    return { p: mk(geo.p), n: mk(geo.n), c: mk(geo.c), count: geo.p.length / 3 };
  }
  lines(arr) { const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); return { b, count: arr.length / 7 }; }
  reset() { for (let i = 0; i < 8; i++) this.gl.disableVertexAttribArray(i); }
  free(m) { if (!m) return; const gl = this.gl; [m.p, m.n, m.c, m.b].forEach(b => b && gl.deleteBuffer(b)); }
  attr(loc, buf, size, stride = 0, off = 0) { const gl = this.gl; if (loc < 0 || loc === undefined) return; gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, off); }
  render({ cam, items = [], shadows = [], lines = [], clear = [0, 0, 0, 0], w, h }) {
    const gl = this.gl;
    gl.viewport(0, 0, w, h); gl.clearColor(...clear); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const C = camera(cam, w / h);
    // 선
    if (lines.length) {
      const { p, loc } = this.ln; gl.useProgram(p); this.reset(); gl.uniformMatrix4fv(loc.uVP, false, C.vp); gl.depthMask(false);
      for (const l of lines) { this.attr(loc.aP, l.b, 3, 28, 0); this.attr(loc.aC, l.b, 4, 28, 12); gl.drawArrays(gl.LINES, 0, l.count); }
      gl.depthMask(true);
    }
    // 그림자
    if (shadows.length) {
      const { p, loc } = this.sh; gl.useProgram(p); gl.uniformMatrix4fv(loc.uVP, false, C.vp);
      this.reset(); this.attr(loc.aQ, this.quad, 2); gl.depthMask(false);
      for (const s of shadows) { gl.uniformMatrix4fv(loc.uM, false, s.m); gl.uniform1f(loc.uA, s.a ?? 0.35); gl.drawArrays(gl.TRIANGLES, 0, 6); }
      gl.depthMask(true);
    }
    const { p, loc } = this.main; gl.useProgram(p); this.reset();
    gl.uniformMatrix4fv(loc.uVP, false, C.vp); gl.uniform3fv(loc.uL, [0.45, 0.85, 0.55]); gl.uniform3fv(loc.uEye, C.eye);
    for (const it of items) {
      if (it.hidden) continue;
      this.attr(loc.aP, it.mesh.p, 3); this.attr(loc.aN, it.mesh.n, 3); this.attr(loc.aC, it.mesh.c, 3);
      gl.uniformMatrix4fv(loc.uM, false, it.m || M.model(0, 0, 0));
      gl.uniform1f(loc.uAO, it.ao === false ? 0 : 1);
      if (it.outline) {
        gl.enable(gl.CULL_FACE); gl.cullFace(gl.FRONT);
        gl.uniform1f(loc.uFlat, 1); gl.uniform3fv(loc.uFC, it.outline); gl.uniform1f(loc.uA, 1); gl.uniform1f(loc.uPush, it.outlineW || 1.6);
        gl.drawArrays(gl.TRIANGLES, 0, it.mesh.count);
        gl.disable(gl.CULL_FACE);
      }
      gl.uniform1f(loc.uFlat, 0); gl.uniform1f(loc.uPush, 0); gl.uniform1f(loc.uA, it.alpha ?? 1);
      gl.uniform3fv(loc.uE, it.emit || [0, 0, 0]);
      gl.drawArrays(gl.TRIANGLES, 0, it.mesh.count);
    }
    return C;
  }
}

// 썸네일용 오프스크린 렌더러 (하나를 같이 씀)
let thumbR = null, thumbCanvas = null;
const cache = new Map();
export function thumb(key, build, o = {}) {
  if (cache.has(key)) return cache.get(key);
  const W = o.w || 360, H = o.h || 300;
  try {
    if (!thumbR) { thumbCanvas = document.createElement('canvas'); thumbR = new Renderer(thumbCanvas, { keep: true }); }
    thumbCanvas.width = W; thumbCanvas.height = H;
    const { geo, box, cam: bcam } = build();
    const mesh = thumbR.mesh(geo);
    const [bw, bh, bd] = box;
    const cam = o.cam || bcam || { theta: o.theta ?? 0.62, phi: 0.36, dist: Math.max(bw, bh, bd) * 2.35 + 40, target: [0, bh * 0.45, 0], fov: 0.6 };
    thumbR.render({ cam, items: [{ mesh }], shadows: o.noShadow || bcam ? [] : [{ m: M.model(0, 0.3, 0, 0, bw * 1.35, bd * 1.35), a: 0.3 }], w: W, h: H });
    const url = thumbCanvas.toDataURL('image/png');
    thumbR.free(mesh);
    cache.set(key, url); return url;
  } catch (e) { cache.set(key, ''); return ''; }
}
