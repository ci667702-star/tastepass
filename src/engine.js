import { AXES } from './data.js';

export const SRC_WEIGHT = { 좋아요: 1, 저장: 2, 사진: 2, 구매: 3, 찜: 1, 가맹점구매: 3 };

export function cosine(u, v) {
  let d = 0, nu = 0, nv = 0;
  for (const a of AXES) {
    const x = u[a.k] || 0, y = v[a.k] || 0;
    d += x * y; nu += x * x; nv += y * y;
  }
  return nu && nv ? d / Math.sqrt(nu * nv) : 0;
}

// 신호(구매>저장>좋아요)를 가중합 → 0~1 정규화 → 사용자가 직접 고친 값 반영
export function buildPassport(signals, manual) {
  const sum = {};
  for (const s of signals) {
    if (s.off) continue;
    for (const a of AXES) sum[a.k] = (sum[a.k] || 0) + (s.v[a.k] || 0) * s.w;
  }
  const max = Math.max(0, ...Object.values(sum));
  const out = {};
  for (const a of AXES) {
    const base = max ? (sum[a.k] || 0) / max : 0;
    out[a.k] = Math.min(1, Math.max(0, base + (manual[a.k] || 0)));
  }
  return out;
}

export const isEmpty = v => AXES.every(a => !v[a.k]);

export function topAxes(v, n = 4, min = 0.3) {
  return AXES.filter(a => (v[a.k] || 0) >= min).sort((a, b) => v[b.k] - v[a.k]).slice(0, n);
}

const argmax = (v, keys) => keys.reduce((b, k) => ((v[k] || 0) > (v[b] || 0) ? k : b), keys[0]);
export function passportName(v) {
  if (isEmpty(v)) return '아직 비어 있는 저장소';
  const ADJ = { warm: '따뜻한', cool: '차분한', mono: '단정한', vivid: '선명한' };
  const MAT = { wood: '원목', metal: '메탈', fabric: '패브릭' };
  const NOUN = { minimal: '미니멀리스트', cozy: '홈바디', vintage: '빈티지 수집가', tech: '셋업 장인' };
  return `${ADJ[argmax(v, ['warm', 'cool', 'mono', 'vivid'])]} ${MAT[argmax(v, ['wood', 'metal', 'fabric'])]} ${NOUN[argmax(v, ['minimal', 'cozy', 'vintage', 'tech'])]}`;
}

export function reasons(user, prod, n = 2) {
  return AXES.map(a => ({ k: a.k, s: (user[a.k] || 0) * (prod[a.k] || 0) }))
    .filter(x => x.s > 0.15).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.k);
}

// 방 배치: 뒷벽·왼쪽부터 빈자리를 찾고, 물건 사이 10cm 여유를 둠. 러그(높이 3cm 이하)는 바닥 가운데에 깔림.
export function layout(room, items) {
  const G = 10, placed = [], out = [];
  for (const it of items) {
    const flat = it.h <= 3;
    let spot = null;
    if (it.w <= room.w && it.d <= room.d && it.h <= room.h) {
      if (flat) spot = { x: (room.w - it.w) / 2, z: (room.d - it.d) / 2 };
      else {
        outer: for (let z = 0; z + it.d <= room.d; z += 5) {
          for (let x = 0; x + it.w <= room.w; x += 5) {
            const hit = placed.some(p => !p.flat && x < p.x + p.w + G && x + it.w + G > p.x && z < p.z + p.d + G && z + it.d + G > p.z);
            if (!hit) { spot = { x, z }; break outer; }
          }
        }
      }
    }
    if (spot) { const p = { ...it, ...spot, flat, fits: true }; placed.push(p); out.push(p); }
    else out.push({ ...it, fits: false });
  }
  return out;
}

export function freeArea(room, laid) {
  const used = laid.filter(p => p.fits && !p.flat).reduce((s, p) => s + p.w * p.d, 0);
  return Math.max(0, (room.w * room.d - used) / 10000);
}

export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(x => Math.min(255, Math.round(x * f)));
  return `rgb(${c.join(',')})`;
}

export const won = n => n.toLocaleString('ko-KR') + '원';

/* ---------- 방: 회전 반영한 바닥 크기, 겹침, 자동 배치 ---------- */
export const fp = o => { const c = Math.abs(Math.cos(o.rot || 0)), s = Math.abs(Math.sin(o.rot || 0)); return { w: Math.round(o.w * c + o.d * s), d: Math.round(o.w * s + o.d * c) }; };
// 가운데를 고정한 채로 돌리기
export function rotated(o, rot) { const a = fp(o), cx = o.x + a.w / 2, cz = o.z + a.d / 2; const b = fp({ ...o, rot }); return { rot, x: Math.round(cx - b.w / 2), z: Math.round(cz - b.d / 2) }; }
export const isFlat = o => o.h <= 3;
export function overlaps(a, b, gap = 0) {
  const A = fp(a), B = fp(b);
  return a.x < b.x + B.w + gap && a.x + A.w + gap > b.x && a.z < b.z + B.d + gap && a.z + A.d + gap > b.z;
}
export function problems(room, objs) {
  const bad = {};
  objs.forEach(o => {
    const f = fp(o);
    if (o.x < -0.5 || o.z < -0.5 || o.x + f.w > room.w + 0.5 || o.z + f.d > room.d + 0.5 || o.h > room.h) bad[o.id] = '방 밖으로 나가요';
  });
  objs.forEach((a, i) => objs.slice(i + 1).forEach(b => {
    if (isFlat(a) || isFlat(b)) return;
    if (overlaps(a, b)) { bad[a.id] = bad[a.id] || `${b.name}와 겹쳐요`; bad[b.id] = bad[b.id] || `${a.name}와 겹쳐요`; }
  }));
  return bad;
}
export function autoPlace(room, objs, item) {
  const o = { rot: 0, ...item };
  if (isFlat(o)) { const f = fp(o); return f.w <= room.w && f.d <= room.d ? { ...o, x: (room.w - f.w) / 2, z: (room.d - f.d) / 2 } : null; }
  const solid = objs.filter(x => !isFlat(x));
  for (const rot of [0, Math.PI / 2]) {
    const t = { ...o, rot }, f = fp(t);
    for (let z = 0; z + f.d <= room.d; z += 5) for (let x = 0; x + f.w <= room.w; x += 5) {
      const c = { ...t, x, z };
      if (!solid.some(s => overlaps(c, s, 8))) return c;
    }
  }
  return null;
}
export function freeFloor(room, objs) {
  return Math.max(0, (room.w * room.d - objs.filter(o => !isFlat(o)).reduce((s, o) => s + o.w * o.d, 0)) / 10000);
}

/* ---------- 옷: 내 체형에 맞는 사이즈 ---------- */
export function sizeAdvice(item, body) {
  const order = ['S', 'M', 'L', 'XL'];
  if (item.slot === 'bottom') {
    const pick = order.find(k => item.sizes[k].waist >= body.waist - 1) || 'XL';
    const diff = item.sizes[pick].waist - body.waist;
    return { size: pick, diff, note: diff > 6 ? '허리가 넉넉해요' : diff < 0 ? '허리가 조금 끼어요' : '허리 딱 맞아요', ok: diff >= -1 };
  }
  const need = item.slot === 'outer' ? 10 : 6;
  const pick = order.find(k => item.sizes[k].chest >= body.chest + need) || 'XL';
  const diff = item.sizes[pick].chest - body.chest;
  return { size: pick, diff, note: diff < need ? '가슴이 조금 끼어요' : diff > need + 12 ? '오버핏으로 넉넉해요' : '가슴 여유 적당해요', ok: diff >= need - 2 };
}
export function fitOf(item, size, body) {
  if (item.slot === 'bottom') { const d = item.sizes[size].waist - body.waist; return { diff: d, label: d < -1 ? '작아요' : d > 8 ? '커요' : '잘 맞아요', ok: d >= -1 && d <= 8 }; }
  const need = item.slot === 'outer' ? 10 : 6, d = item.sizes[size].chest - body.chest;
  return { diff: d, label: d < need - 2 ? '작아요' : d > need + 16 ? '커요' : '잘 맞아요', ok: d >= need - 2 && d <= need + 16 };
}
