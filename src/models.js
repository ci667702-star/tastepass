import { Geo, hexRGB, mulC, mixC } from './gl.js';

const WOOD = '#a77b52', WHITE = '#f2efe9', DARK = '#2a2a2e';
const lighten = (h, t) => mixC(hexRGB(h), [1, 1, 1], t);
const darken = (h, f) => mulC(hexRGB(h), f);

/* ---------- 가구: 바닥 중심 기준 로컬 좌표, y는 0부터 ---------- */
export function furniture(kind, w, d, h, color) {
  const g = new Geo(), C = hexRGB(color);
  const x0 = -w / 2, x1 = w / 2, z0 = -d / 2, z1 = d / 2;
  const legs = (y, t, inset, col) => [[x0 + inset, z0 + inset], [x1 - inset - t, z0 + inset], [x0 + inset, z1 - inset - t], [x1 - inset - t, z1 - inset - t]]
    .forEach(([x, z]) => g.box(x, 0, z, x + t, y, z + t, col));
  switch (kind) {
    case 'bed': {
      g.box(x0, 0, z0, x1, h - 18, z1, WOOD);
      g.box(x0 + 2, h - 18, z0 + 7, x1 - 2, h, z1 - 1, WHITE);
      g.box(x0 + 1, h - 3, z0 + d * 0.38, x1 - 1, h + 5, z1, C);
      g.box(x0 + 12, h, z0 + 12, x1 - 12, h + 11, z0 + 44, '#fbfaf7');
      g.box(x0, 0, z0, x1, h + 48, z0 + 7, darken(WOOD, 0.92));
      break;
    }
    case 'desk': {
      g.box(x0, h - 3, z0, x1, h, z1, C); legs(h - 3, 4, 2, darken(color, 0.55));
      g.box(-26, h, z0 + 6, 26, h + 2, z0 + 20, DARK); g.box(-2.5, h, z0 + 10, 2.5, h + 12, z0 + 13, DARK);
      g.box(-30, h + 12, z0 + 9, 30, h + 46, z0 + 12, '#1d1f24');
      g.box(-20, h, z0 + 30, 20, h + 2, z0 + 44, '#e9e7e2');
      break;
    }
    case 'chair': {
      legs(42, 3, 3, darken(color, 0.6)); g.box(x0 + 1, 42, z0 + 1, x1 - 1, 47, z1 - 1, C);
      g.box(x0 + 2, 47, z0, x1 - 2, h, z0 + 5, C);
      break;
    }
    case 'shelf': {
      const t = 2.5, cl = darken(color, 0.9);
      g.box(x0, 0, z0, x0 + t, h, z1, cl); g.box(x1 - t, 0, z0, x1, h, z1, cl); g.box(x0, 0, z0, x1, h, z0 + 1.2, darken(color, 0.8));
      const levels = [0, h / 3, (2 * h) / 3, h - t];
      levels.forEach(y => g.box(x0, y, z0, x1, y + t, z1, color));
      const books = ['#6d8b74', '#d9b77e', '#8a5a3a', '#e4ddd0', '#5b6b8c', '#c96f53'];
      levels.slice(0, 3).forEach((y, i) => {
        let x = x0 + t + 2;
        for (let k = 0; k < 4 + i; k++) {
          const bw = 3 + ((k * 7 + i * 3) % 4), bh = Math.min(h / 3 - 6, 18 + ((k * 5 + i) % 9));
          if (x + bw > x1 - t - 2) break;
          g.box(x, y + t, z0 + 4, x + bw, y + t + bh, z1 - 4, books[(k + i * 2) % books.length]); x += bw + 0.6;
        }
      });
      break;
    }
    case 'sidetable': {
      const r = w / 2;
      g.lathe([[0, 0], [r * 0.62, 0], [r * 0.8, h * 0.25], [r * 0.92, h * 0.6], [r * 0.95, h - 4], [0, h - 4]], C, { smooth: true });
      g.cyl(0, 0, h - 4, h, r, lighten(color, 0.15));
      break;
    }
    case 'hanger': {
      const cl = darken(color, 1);
      g.box(x0, 0, z0, x0 + 4, 3, z1, cl); g.box(x1 - 4, 0, z0, x1, 3, z1, cl);
      g.box(x0, 0, -1.5, x0 + 3, h, 1.5, cl); g.box(x1 - 3, 0, -1.5, x1, h, 1.5, cl); g.box(x0, h - 3, -1.5, x1, h, 1.5, cl);
      [['#d8c3a5', -28], ['#2d3a55', -10], ['#f1efea', 8], ['#7b5236', 26]].forEach(([c, x]) => g.box(x - 2, h - 78, -19, x + 2, h - 6, 19, c));
      break;
    }
    case 'cabinet': {
      g.box(x0, 4, z0, x1, h, z1, C); g.box(x0 + 2, 0, z0 + 2, x1 - 2, 4, z1 - 2, darken(color, 0.7));
      g.box(x0 + 1, 6, z1, -0.4, h - 2, z1 + 0.8, lighten(color, 0.08)); g.box(0.4, 6, z1, x1 - 1, h - 2, z1 + 0.8, lighten(color, 0.08));
      g.box(-4, h * 0.55, z1 + 0.8, -2.5, h * 0.55 + 8, z1 + 2, '#9a9a9a'); g.box(2.5, h * 0.55, z1 + 0.8, 4, h * 0.55 + 8, z1 + 2, '#9a9a9a');
      break;
    }
    case 'gaming': {
      const t = 2.5, cl = '#1e1e28';
      g.box(x0, 0, z0, x0 + t, h, z1, cl); g.box(x1 - t, 0, z0, x1, h, z1, cl);
      [0, h / 3, (2 * h) / 3, h - t].forEach(y => { g.box(x0, y, z0, x1, y + t, z1, cl); g.box(x0 + t, y + t, z1 - 1.5, x1 - t, y + t + 1, z1 - 0.5, lighten(color, 0.25)); });
      g.box(-14, h / 3 + t, z0 + 6, 14, h / 3 + t + 16, z1 - 6, '#f2f2f2'); g.box(-16, (2 * h) / 3 + t, z0 + 8, -6, (2 * h) / 3 + t + 22, z1 - 8, '#ff4fa0');
      break;
    }
    case 'beanbag': {
      g.ellipsoid(0, h * 0.42, 0, w / 2, h * 0.46, d / 2, C);
      g.ellipsoid(0, h * 0.62, -d * 0.12, w * 0.36, h * 0.36, d * 0.3, lighten(color, 0.06));
      break;
    }
    case 'drawer': {
      const cl = color;
      [[x0 + 4, z0 + 4], [x1 - 7, z0 + 4], [x0 + 4, z1 - 7], [x1 - 7, z1 - 7]].forEach(([x, z]) => g.box(x, 0, z, x + 3, 12, z + 3, darken(color, 0.7)));
      g.box(x0, 12, z0, x1, h, z1, cl);
      for (let i = 0; i < 3; i++) {
        const y0 = 15 + i * ((h - 18) / 3), y1 = y0 + (h - 18) / 3 - 3;
        g.box(x0 + 3, y0, z1, x1 - 3, y1, z1 + 1, lighten(color, 0.12));
        g.box(-6, (y0 + y1) / 2 - 1, z1 + 1, 6, (y0 + y1) / 2 + 1, z1 + 2.5, '#c9a45c');
      }
      break;
    }
    case 'lamp': {
      g.cyl(0, 0, 0, 3, w / 2 * 0.8, C); g.cyl(0, 0, 3, h - 26, 1.2, C);
      g.lathe([[w / 2, h - 30], [w / 2 * 0.62, h], [0, h]], '#f6f1e6', { smooth: false });
      break;
    }
    case 'rug': {
      g.box(x0, 0, z0, x1, 1, z1, darken(color, 0.9)); g.box(x0 + 8, 0, z0 + 8, x1 - 8, 1.4, z1 - 8, C);
      break;
    }
    case 'sofa': {
      legs(8, 4, 4, '#3a3a3a'); g.box(x0, 8, z0, x1, 22, z1, darken(color, 0.9));
      g.box(x0 + 11, 22, z0 + 14, x1 - 11, 34, z1 - 1, lighten(color, 0.06));
      g.box(x0, 22, z0, x1, h, z0 + 15, C); g.box(x0, 22, z0, x0 + 11, 52, z1, C); g.box(x1 - 11, 22, z0, x1, 52, z1, C);
      break;
    }
    case 'plant': {
      const r = w / 2 * 0.62;
      g.lathe([[0, 0], [r * 0.8, 0], [r, 34], [0, 34]], '#e9e4dc', { smooth: false });
      g.cyl(0, 0, 32, h * 0.8, 1.4, '#5a6b3c');
      const sc = w / 50, top = h;
      const leaf = [['#4f7a4a', 0, .5, 0, 17], ['#5f8c55', -13, .6, 7, 15], ['#476f42', 13, .64, -5, 16], ['#6b9a5a', 4, .74, 11, 14], ['#4f7a4a', -9, .8, -9, 14], ['#5a8a4f', 10, .86, 6, 12], ['#3f6a3c', -3, .93, 0, 12], ['#6b9a5a', -14, .7, -2, 11]];
      leaf.forEach(([c, x, y, z, r]) => g.ellipsoid(x * sc, top * y + 8, z * sc, r * sc, r * 0.62 * sc, r * 0.85 * sc, c, 14));
      break;
    }
    default: {
      g.box(x0, 0, z0, x1, h, z1, C); g.box(x0 + 1, h, z0 + 1, x1 - 1, h + 0.6, z1 - 1, lighten(color, 0.1));
    }
  }
  return g;
}

/* ---------- 체형 → 뼈대 수치 (단위 cm) ---------- */
const K = 1 / (2 * Math.PI * 0.86); // 둘레 → 타원 가로 반지름
export function skeleton(b) {
  const H = b.height, leg = H * 0.455 * b.leg;
  const s = {
    H, crotch: leg, hipY: leg + H * 0.045, waistY: leg + H * 0.15, chestY: H * 0.715, shY: H * 0.815, neckY: H * 0.845,
    headY: H * 0.927, headR: H * 0.061, hipA: b.hip * K, waistA: b.waist * K, chestA: b.chest * K, shHalf: b.shoulder / 2,
    neckR: H * 0.029, ZS: 0.72,
  };
  const arm = Math.max(0.8, Math.min(1.35, b.chest / 90));
  s.armR = [4.6 * arm, 3.4 * arm, 2.6 * arm];
  const sx = s.shHalf - 3, ang = 0.17;
  const dir = [Math.sin(ang), -Math.cos(ang), 0.02];
  s.armSeg = side => {
    const S = [side * sx, s.shY - 3, 0];
    const E = [S[0] + side * dir[0] * H * 0.186, S[1] + dir[1] * H * 0.186, S[2] + dir[2] * H * 0.186];
    const W = [E[0] + side * dir[0] * 0.6 * H * 0.15, E[1] + dir[1] * H * 0.15, E[2] + 1.5];
    return { S, E, W };
  };
  s.legSeg = side => {
    const hx = side * s.hipA * 0.48;
    return { Hj: [hx, s.crotch + 4, 0], Kn: [side * s.hipA * 0.4, leg * 0.52, 1], Cf: [side * s.hipA * 0.38, leg * 0.33, -0.5], An: [side * s.hipA * 0.36, 8, 0] };
  };
  s.thighR = s.hipA * 0.5; s.kneeR = 5.2 * (b.hip / 95); s.calfR = 5.8 * (b.hip / 95); s.ankleR = 3.6;
  // 몸통 단면 반지름 (y에 따라)
  const prof = [[s.hipA * 0.84, s.crotch], [s.hipA, s.hipY], [s.waistA + (s.hipA - s.waistA) * 0.4, (s.hipY + s.waistY) / 2], [s.waistA, s.waistY],
    [s.waistA + (s.chestA - s.waistA) * 0.65, (s.waistY + s.chestY) / 2], [s.chestA, s.chestY], [Math.max(s.chestA * 0.97, s.shHalf - 4), s.shY - 5], [s.shHalf - 6, s.shY]];
  s.prof = prof;
  s.rAt = y => {
    if (y <= prof[0][1]) return prof[0][0];
    for (let i = 0; i < prof.length - 1; i++) {
      const [r0, y0] = prof[i], [r1, y1] = prof[i + 1];
      if (y <= y1) return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0);
    }
    return prof.at(-1)[0];
  };
  return s;
}

export const SKIN = '#ddd7ce';
export function bodyGeo(b) {
  const s = skeleton(b), g = new Geo();
  const torso = [[0, s.crotch - 2], ...s.prof, [s.neckR * 1.7, s.neckY - 2], [s.neckR, s.neckY], [0, s.neckY]];
  g.lathe(torso, SKIN, { sz: s.ZS, seg: 32 });
  g.cyl(0, 0, s.neckY - 4, s.headY - s.headR * 0.6, s.neckR, SKIN, { seg: 18 });
  g.ellipsoid(0, s.headY, 0.5, s.headR * 0.84, s.headR, s.headR * 0.95, SKIN);
  [-1, 1].forEach(side => {
    const A = s.armSeg(side);
    g.ellipsoid(A.S[0] - side * 0.8, A.S[1], A.S[2], s.armR[0] * 1.08, s.armR[0] * 1.05, s.armR[0] * 1.05, SKIN, 16);
    g.tube(A.S, A.E, s.armR[0], s.armR[1], SKIN); g.ellipsoid(A.E[0], A.E[1], A.E[2], s.armR[1], s.armR[1], s.armR[1], SKIN, 12);
    g.tube(A.E, A.W, s.armR[1], s.armR[2], SKIN);
    g.ellipsoid(A.W[0] + side * 0.6, A.W[1] - s.H * 0.045, A.W[2] + 0.5, 2.4, s.H * 0.05, 4.2, SKIN, 14);
    const L = s.legSeg(side);
    g.tube(L.Hj, L.Kn, s.thighR, s.kneeR, SKIN); g.ellipsoid(L.Kn[0], L.Kn[1], L.Kn[2], s.kneeR, s.kneeR, s.kneeR, SKIN, 14);
    g.tube(L.Kn, L.Cf, s.kneeR, s.calfR, SKIN); g.tube(L.Cf, L.An, s.calfR, s.ankleR, SKIN);
    g.ellipsoid(L.An[0], 4, 6, 4.4, 4, 12, SKIN, 14);
  });
  return g;
}

/* ---------- 옷: 사이즈에 따라 여유(ease)가 달라짐 ---------- */
export function garmentGeo(item, size, b) {
  const s = skeleton(b), g = new Geo(), col = item.color;
  if (item.slot === 'bottom') {
    const gw = item.sizes[size].waist, ease = Math.max(0.4, Math.min(4, (gw - b.waist) / (2 * Math.PI) + 0.8));
    const wide = item.cut === 'wide';
    const top = s.waistY - 2;
    const prof = [[0, s.crotch - 3], [s.hipA * 0.86 + ease, s.crotch - 3], [s.hipA + ease + 0.6, s.hipY], [s.rAt((s.hipY + top) / 2) + ease, (s.hipY + top) / 2], [s.waistA + ease, top], [s.waistA + ease * 0.7, top + 3]];
    g.lathe(prof, col, { sz: s.ZS, seg: 32 });
    g.lathe([[s.waistA + ease + 0.3, top - 0.5], [s.waistA + ease + 0.3, top + 3.5]], darken(col, 0.85), { sz: s.ZS, seg: 32, smooth: false });
    [-1, 1].forEach(side => {
      const L = s.legSeg(side);
      const hem = [L.An[0] * 1.05, 6, 1];
      g.tube(L.Hj, L.Kn, s.thighR + ease + 1, wide ? s.thighR * 0.95 + ease : s.kneeR + ease + 1.4, col);
      g.tube(L.Kn, hem, wide ? s.thighR * 0.95 + ease : s.kneeR + ease + 1.4, wide ? s.thighR * 1.02 + ease : s.calfR * 0.9 + ease + 0.6, col);
      g.ellipsoid(L.Kn[0], L.Kn[1], L.Kn[2], (wide ? s.thighR * 0.95 : s.kneeR + 1.4) + ease, 4, (wide ? s.thighR * 0.95 : s.kneeR + 1.4) + ease, col, 14);
    });
    return g;
  }
  const gc = item.sizes[size].chest;
  const base = item.slot === 'outer' ? 2.2 : 0.9;
  const ease = Math.max(0.5, Math.min(7, (gc - b.chest) / (2 * Math.PI) + base));
  const hemY = item.length === 'long' ? s.crotch * 0.55 : item.length === 'hip' ? s.crotch - 4 : item.length === 'short' ? s.hipY - 4 : s.hipY - 1;
  const prof = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const y = hemY + ((s.shY - hemY) * i) / steps;
    let r = s.rAt(y) + ease;
    if (y < s.crotch) r = s.hipA * 1.06 + ease + (s.crotch - y) * 0.12;
    if (y < s.hipY && y >= s.crotch) r = Math.max(r, s.hipA + ease);
    if (item.cut === 'over') r += 1.6;
    prof.push([r, y]);
  }
  prof.push([s.neckR * 1.9 + ease * 0.4, s.neckY - 2.5]);
  g.lathe(prof, col, { sz: s.ZS + (ease > 3 ? 0.04 : 0), seg: 34 });
  g.lathe([[prof[0][0] + 0.25, hemY - 0.3], [prof[0][0] + 0.25, hemY + 2.5]], darken(col, 0.88), { sz: s.ZS, seg: 34, smooth: false });
  if (item.collar) g.lathe([[s.neckR * 1.9 + ease * 0.4, s.neckY - 3], [s.neckR * 1.5 + 0.8, s.neckY + 1.5]], lighten(col, 0.05), { sz: 0.9, seg: 24, smooth: false });
  [-1, 1].forEach(side => {
    const A = s.armSeg(side);
    const sr = [s.armR[0] + 1.6 + ease * 0.35, s.armR[1] + 1.5 + ease * 0.3, s.armR[2] + 1.6 + ease * 0.3];
    g.ellipsoid(A.S[0] - side * 0.8, A.S[1] - 0.5, A.S[2], sr[0] * 1.02, sr[0] * 1.0, sr[0] * 1.0, col, 16);
    if (item.sleeve === 'short') {
      const m = A.S.map((v, i) => v + (A.E[i] - v) * 0.45);
      g.tube(A.S, m, sr[0], sr[0] * 0.98, col);
    } else {
      g.tube(A.S, A.E, sr[0], sr[1], col); g.ellipsoid(A.E[0], A.E[1], A.E[2], sr[1], sr[1], sr[1], col, 12);
      const cuff = A.W.map((v, i) => v + (A.E[i] - v) * 0.06);
      g.tube(A.E, cuff, sr[1], sr[2], col);
    }
  });
  return g;
}
/* ---------- 썸네일용 장면 ---------- */
export function furnitureThumb(p) {
  return () => ({ geo: furniture(p.kind, p.w, p.d, p.h, p.color), box: [p.w, Math.max(p.h, 20), p.d] });
}
export function garmentThumb(item, body) {
  return () => {
    const s = skeleton(body);
    const g = garmentGeo(item, 'M', body);
    const g2 = new Geo().merge(g, 0, item.slot === 'bottom' ? -s.crotch * 0.45 : -s.chestY + 25, 0, 0);
    const lo = item.slot === 'bottom' ? 6 : item.length === 'long' ? s.crotch * 0.55 : item.length === 'hip' ? s.crotch - 4 : s.hipY - 4;
    const hi = item.slot === 'bottom' ? s.waistY + 3 : s.neckY;
    const shift = item.slot === 'bottom' ? -s.crotch * 0.45 : -s.chestY + 25;
    const hgt = hi - lo;
    return { geo: g2, box: [s.shHalf * 2.2, hgt, 30], cam: { theta: 0.45, phi: 0.12, dist: hgt * 2.5 + 40, target: [0, (lo + hi) / 2 + shift, 0], fov: 0.6 } };
  };
}
export function vignette(style) {
  return () => {
    const g = new Geo();
    g.box(-90, -3, -90, 90, 0, 90, style.floor);
    g.box(-90, 0, -96, 90, 150, -90, style.wall);
    g.box(-96, 0, -96, -90, 150, 90, mixC(hexRGB(style.wall), [0, 0, 0], 0.06));
    const slots = [[-45, -62, 0], [30, -55, 0], [-58, 10, Math.PI / 2], [35, 25, 0]];
    style.items.forEach(([kind, color, w, d, h], i) => { const [x, z, r] = slots[i]; g.merge(furniture(kind, w, d, h, color), x, 0, z, r); });
    return { geo: g, box: [180, 150, 180] };
  };
}
export function heroScene(body) {
  return () => {
    const g = new Geo();
    g.cyl(0, 0, -4, 0, 120, '#f4f1ea', { seg: 48 });
    g.merge(bodyGeo(body), 18, 0, 10, -0.35);
    g.merge(garmentGeo(OUTFIT_HERO.top, 'M', body), 18, 0, 10, -0.35);
    g.merge(garmentGeo(OUTFIT_HERO.bottom, 'M', body), 18, 0, 10, -0.35);
    g.merge(furniture('shelf', 70, 30, 110, '#b98a5a'), -62, 0, -45, 0.3);
    g.merge(furniture('plant', 50, 50, 140, '#4f7a4a'), 70, 0, -60, 0);
    g.merge(furniture('sidetable', 45, 45, 50, '#c9a26b'), -40, 0, 45, 0);
    return { geo: g, box: [240, 175, 240] };
  };
}
const OUTFIT_HERO = {
  top: { slot: 'top', color: '#d9c7ab', sleeve: 'long', length: 'reg', sizes: { M: { chest: 104 } } },
  bottom: { slot: 'bottom', color: '#ece2cf', cut: 'wide', sizes: { M: { waist: 74 } } },
};
