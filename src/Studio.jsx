import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Renderer, Geo, M, ray, rayAABB, rayPlaneY, camera, thumb } from './gl.js';
import { furniture, bodyGeo, garmentGeo, skeleton, furnitureThumb, garmentThumb } from './models.js';
import { INTERIOR, FASHION, SLOT_LABEL, BODY_PRESETS, BODY_FIELDS, ADD_KINDS } from './data.js';
import { fp, rotated, isFlat, problems, freeFloor, cosine, sizeAdvice, fitOf, won, isEmpty, autoPlace } from './engine.js';

const ORANGE = [0.14, 0.33, 0.92], BLUE = [1, 0.36, 0.3];
const STEP = Math.PI / 12;
const SLOTS = ['outer', 'top', 'bottom'];

/* 아이콘 (선으로만) */
const I = {
  cube: <svg viewBox="0 0 16 16"><path d="M8 1.5 14 4.8v6.4L8 14.5 2 11.2V4.8z M2 4.8l6 3.3 6-3.3 M8 8.1v6.4" /></svg>,
  move: <svg viewBox="0 0 16 16"><path d="M8 1v14M1 8h14M8 1 6 3M8 1l2 2M8 15l-2-2M8 15l2-2M1 8l2-2M1 8l2 2M15 8l-2-2M15 8l-2 2" /></svg>,
  rot: <svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2v3h-3" /></svg>,
  del: <svg viewBox="0 0 16 16"><path d="M3 4h10M6 4V2.5h4V4M4.5 4l.7 9.5h5.6l.7-9.5" /></svg>,
  front: <svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" /><path d="M3 13h10" strokeWidth="2.4" /></svg>,
  side: <svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" /><path d="M13 3v10" strokeWidth="2.4" /></svg>,
  top: <svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" /><path d="M3 3h10" strokeWidth="2.4" /></svg>,
  home: <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" /><path d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2" /></svg>,
  eye: <svg viewBox="0 0 16 16"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" /><circle cx="8" cy="8" r="2" /></svg>,
  eyeOff: <svg viewBox="0 0 16 16"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8zM2 14 14 2" /></svg>,
  body: <svg viewBox="0 0 16 16"><circle cx="8" cy="3" r="1.8" /><path d="M5 6.5h6l-.8 4H9.5l-.4 4.5h-2.2L6.5 10.5H5.8z" /></svg>,
  shirt: <svg viewBox="0 0 16 16"><path d="M5.5 2 2 4.5l1.5 2.5L5 6v8h6V6l1.5 1 1.5-2.5L10.5 2c-.5 1-1.5 1.5-2.5 1.5S6 3 5.5 2z" /></svg>,
  room: <svg viewBox="0 0 16 16"><path d="M2 13V5l6-3 6 3v8M2 13h12M6 13V9h4v4" /></svg>,
  wrench: <svg viewBox="0 0 16 16"><path d="M10.5 1.8a3.5 3.5 0 0 0-3 4.8L2.2 11.9a1.4 1.4 0 0 0 2 2l5.3-5.3a3.5 3.5 0 0 0 4.8-3l-2 1-1.8-1.8z" /></svg>,
  star: <svg viewBox="0 0 16 16"><path d="M8 1.5 9.8 6l4.7.3-3.6 3 1.2 4.6L8 11.4 3.9 13.9l1.2-4.6-3.6-3L6.2 6z" /></svg>,
};

function Ic({ i }) { return <span className="ic">{I[i]}</span>; }

export default function Studio(props) {
  const { mode, setMode, room, setRoom, objects, setObjects, previewObj, setPreviewObj, tryProduct, body, setBody, outfit, setOutfit, vec, passName, signalsCount, onBuy, go, say } = props;
  const wrap = useRef(null), canvas = useRef(null), gizmo = useRef(null), label = useRef(null), hLabel = useRef(null);
  const R = useRef(null), meshes = useRef(new Map());
  const cam = useRef(null);
  const drag = useRef(null);
  const [sel, setSel] = useState(null);
  const [tool, setTool] = useState('move');
  const [hidden, setHidden] = useState({});
  const [tab, setTab] = useState(mode === 'body' ? 'body' : 'object');
  const [addOpen, setAddOpen] = useState(false);
  const [slotFilter, setSlotFilter] = useState(null);
  const [sizes, setSizes] = useState({});
  const live = useRef({});

  const all = useMemo(() => (previewObj ? [...objects, previewObj] : objects), [objects, previewObj]);
  const bad = useMemo(() => problems(room, all), [room, all]);
  const selObj = all.find(o => o.id === sel);
  live.current = { mode, room, all, sel, bad, hidden, body, outfit, sizes };

  const resetCam = (m = mode) => {
    if (m === 'body') cam.current = { theta: 0.55, phi: 0.12, dist: body.height * 2.45, target: [0, body.height * 0.52, 0], fov: 0.6 };
    else cam.current = { theta: 0.72, phi: 0.62, dist: Math.max(room.w, room.d) * 2.05 + 120, target: [room.w / 2, 55, room.d / 2], fov: 0.62 };
  };
  if (!cam.current) resetCam();
  useEffect(() => { resetCam(mode); setSel(null); setTab(mode === 'body' ? 'body' : 'object'); }, [mode]);
  useEffect(() => { if (previewObj) setSel('preview'); }, [previewObj?.productId]);

  const mesh = (key, build) => {
    const m = meshes.current;
    if (!m.has(key)) m.set(key, R.current.mesh(build()));
    return m.get(key);
  };

  /* ---------- 렌더 루프 ---------- */
  useEffect(() => {
    const cv = canvas.current;
    let r;
    try { r = R.current = new Renderer(cv); } catch (e) { say('이 브라우저에서는 3D를 표시할 수 없어요'); return; }
    let raf, t0 = performance.now();
    const ro = new ResizeObserver(() => { const d = Math.min(2, window.devicePixelRatio || 1); cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; });
    ro.observe(cv);
    const gridCache = {};
    const grid = (cx, cz, span) => {
      const k = `${cx},${cz},${span}`;
      if (gridCache.k !== k) {
        const a = [];
        for (let i = -span; i <= span; i += 50) {
          const major = i % 100 === 0 ? 0.13 : 0.07;
          a.push(cx + i, -5.3, cz - span, 0.1, 0.13, 0.25, major, cx + i, -5.3, cz + span, 0.1, 0.13, 0.25, major);
          a.push(cx - span, -5.3, cz + i, 0.1, 0.13, 0.25, major, cx + span, -5.3, cz + i, 0.1, 0.13, 0.25, major);
        }
        a.push(-span * 2, -5.2, 0, 1, 0.35, 0.3, 0.55, span * 2, -5.2, 0, 1, 0.35, 0.3, 0.55);
        a.push(0, -5.2, -span * 2, 0.14, 0.31, 0.9, 0.55, 0, -5.2, span * 2, 0.14, 0.31, 0.9, 0.55);
        if (gridCache.m) r.free(gridCache.m);
        gridCache.m = r.lines(a); gridCache.k = k;
      }
      return gridCache.m;
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const L = live.current, W = cv.width, H = cv.height;
      if (!W || !H) return;
      const t = (performance.now() - t0) / 1000;
      const items = [], shadows = [];
      const C = camera(cam.current, W / H);
      let lines;
      if (L.mode === 'room') {
        const { w: RW, d: RD, h: RH } = L.room;
        lines = [grid(Math.round(RW / 100) * 50, Math.round(RD / 100) * 50, Math.max(RW, RD) + 400)];
        const rk = `${RW}x${RD}x${RH}`;
        items.push({ mesh: mesh('floor' + rk, () => floorGeo(L.room)), ao: false });
        const e = C.eye;
        const walls = [['back', e[2] > 0], ['front', e[2] < RD], ['left', e[0] > 0], ['right', e[0] < RW]];
        walls.forEach(([k, show]) => show && items.push({ mesh: mesh(`wall-${k}-${rk}`, () => wallGeo(L.room, k)), ao: false }));
        for (const o of L.all) {
          if (L.hidden[o.id]) continue;
          const f = fp(o);
          const cx = o.x + f.w / 2, cz = o.z + f.d / 2;
          const it = { mesh: mesh(`${o.kind}|${o.w}|${o.d}|${o.h}|${o.color}`, () => furniture(o.kind, o.w, o.d, o.h, o.color)), m: M.model(cx, 0, cz, o.rot) };
          if (L.bad[o.id]) it.emit = [0.22 + 0.08 * Math.sin(t * 5), 0.02, 0.02];
          if (o.id === 'preview') { it.outline = o.id === L.sel ? ORANGE : BLUE.map(c => c * (0.75 + 0.25 * Math.sin(t * 4))); it.outlineW = 1.8; }
          else if (o.id === L.sel) { it.outline = ORANGE; it.outlineW = 1.6; }
          items.push(it);
          if (!isFlat(o)) shadows.push({ m: M.model(cx, 0.25, cz, 0, f.w * 1.25 + 14, f.d * 1.25 + 14), a: 0.32 });
        }
      } else {
        lines = [grid(0, 0, 300)];
        const b = L.body, bk = Object.values(b).join('|');
        items.push({ mesh: mesh('stage', () => new Geo().cyl(0, 0, -5, 0, 70, '#d9d6cf', { seg: 48 }).cyl(0, 0, 0, 0.6, 66, '#f3f1ec', { seg: 48 })), ao: false });
        items.push({ mesh: mesh('body' + bk, () => bodyGeo(b)), outline: L.sel === 'body' ? ORANGE : null, outlineW: 1 });
        SLOTS.forEach(slot => {
          const id = L.outfit[slot]; if (!id || L.hidden[slot]) return;
          const item = FASHION.find(f => f.id === id), size = L.sizes[id] || sizeAdvice(item, b).size;
          items.push({ mesh: mesh(`g${id}${size}${bk}`, () => garmentGeo(item, size, b)), outline: L.sel === slot ? ORANGE : null, outlineW: 1 });
        });
        shadows.push({ m: M.model(0, 0.8, 0, 0, b.shoulder * 2.4, 46), a: 0.4 });
      }
      r.render({ cam: cam.current, items, shadows, lines, w: W, h: H });
      drawGizmo(gizmo.current, C.view);
      // 선택한 물건 위 치수 라벨
      const lab = label.current;
      if (lab) {
        const o = L.mode === 'room' && L.all.find(x => x.id === L.sel);
        if (o) {
          const f = fp(o); const p = M.xf(C.vp, [o.x + f.w / 2, Math.max(o.h, 2) + 14, o.z + f.d / 2, 1]);
          lab.style.display = p[3] > 0 ? 'block' : 'none';
          lab.style.transform = `translate(${((p[0] / p[3] + 1) / 2) * cv.clientWidth}px, ${((1 - p[1] / p[3]) / 2) * cv.clientHeight}px) translate(-50%,-100%)`;
        } else lab.style.display = 'none';
      }
      const hl = hLabel.current;
      if (hl) {
        if (L.mode === 'body') {
          const p = M.xf(C.vp, [-L.body.shoulder - 22, L.body.height / 2, 0, 1]);
          hl.style.display = 'block';
          hl.style.transform = `translate(${((p[0] / p[3] + 1) / 2) * cv.clientWidth}px, ${((1 - p[1] / p[3]) / 2) * cv.clientHeight}px) translate(-100%,-50%)`;
        } else hl.style.display = 'none';
      }
    };
    frame();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); meshes.current.forEach(m => r.free(m)); meshes.current.clear(); };
  }, []);

  // 몸이 바뀌면 옛 메시는 정리
  useEffect(() => {
    const m = meshes.current;
    if (m.size > 160 && R.current) { m.forEach(x => R.current.free(x)); m.clear(); }
  }, [body, outfit, objects]);

  /* ---------- 조작 ---------- */
  const ndc = e => { const rc = canvas.current.getBoundingClientRect(); return [((e.clientX - rc.left) / rc.width) * 2 - 1, -(((e.clientY - rc.top) / rc.height) * 2 - 1)]; };
  const curRay = e => { const cv = canvas.current; const C = camera(cam.current, cv.width / cv.height); const [x, y] = ndc(e); return ray(C.vp, x, y); };
  const pick = e => {
    const r = curRay(e);
    if (mode === 'body') {
      const s = skeleton(body);
      return rayAABB(r, [-s.shHalf - 12, 0, -25], [s.shHalf + 12, body.height, 25]) !== null ? 'body' : null;
    }
    let best = null, bt = Infinity;
    for (const o of all) {
      if (hidden[o.id]) continue;
      const f = fp(o);
      const t = rayAABB(r, [o.x, 0, o.z], [o.x + f.w, Math.max(o.h, 4), o.z + f.d]);
      if (t !== null && t < bt) { bt = t; best = o.id; }
    }
    return best;
  };
  const update = (id, patch) => {
    if (id === 'preview') setPreviewObj(p => ({ ...p, ...patch }));
    else setObjects(os => os.map(o => (o.id === id ? { ...o, ...patch } : o)));
  };
  const onDown = e => {
    canvas.current.setPointerCapture(e.pointerId);
    const pan = e.button === 2 || e.shiftKey, orbit = e.button === 1;
    if (!pan && !orbit && e.button === 0) {
      const hit = pick(e);
      if (hit) {
        setSel(hit);
        if (mode === 'room') {
          const o = all.find(x => x.id === hit), p = rayPlaneY(curRay(e), 0);
          if (tool === 'rotate') drag.current = { type: 'rot', id: hit, x: e.clientX, r0: o.rot, o };
          else if (p) drag.current = { type: 'move', id: hit, ox: p[0] - o.x, oz: p[2] - o.z, moved: false };
          setTab('object');
        }
        return;
      }
      setSel(null);
    }
    drag.current = { type: pan ? 'pan' : 'orbit', x: e.clientX, y: e.clientY, c: { ...cam.current, target: [...cam.current.target] } };
  };
  const onMove = e => {
    const d = drag.current; if (!d) return;
    if (d.type === 'rot') { update(d.id, rotated(d.o, norm(d.r0 + (e.clientX - d.x) * 0.012))); return; }
    if (d.type === 'move') {
      const p = rayPlaneY(curRay(e), 0); if (!p) return;
      const snap = v => Math.round(v / 5) * 5;
      update(d.id, { x: snap(p[0] - d.ox), z: snap(p[2] - d.oz) }); d.moved = true; return;
    }
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (d.type === 'orbit') cam.current = { ...cam.current, theta: d.c.theta - dx * 0.008, phi: Math.max(0.04, Math.min(1.5, d.c.phi + dy * 0.006)) };
    else {
      const k = d.c.dist * 0.0013, th = d.c.theta;
      const right = [Math.cos(th), 0, -Math.sin(th)], fwd = [Math.sin(th), 0, Math.cos(th)];
      cam.current = { ...cam.current, target: [d.c.target[0] - right[0] * dx * k - fwd[0] * dy * k, d.c.target[1], d.c.target[2] - right[2] * dx * k - fwd[2] * dy * k] };
    }
  };
  const onUp = () => { drag.current = null; };
  const onWheel = e => { cam.current = { ...cam.current, dist: Math.max(120, Math.min(2600, cam.current.dist * Math.exp(e.deltaY * 0.0012))) }; };
  const view = v => {
    const c = cam.current;
    if (v === 'home') return resetCam();
    cam.current = { ...c, ...(v === 'front' ? { theta: 0, phi: 0.06 } : v === 'side' ? { theta: Math.PI / 2, phi: 0.06 } : { phi: 1.5, theta: 0.0001 }) };
  };
  const norm = r => { const t = Math.PI * 2; return Math.round((((r % t) + t) % t) / STEP) * STEP % t; };
  const rotBy = d => { if (!selObj) return; update(selObj.id, rotated(selObj, norm(selObj.rot + d))); };
  const rotate = () => rotBy(Math.PI / 2);
  const remove = () => {
    if (!selObj) return;
    if (selObj.id === 'preview') setPreviewObj(null); else setObjects(os => os.filter(o => o.id !== selObj.id));
    setSel(null); say(`${selObj.name}을(를) 방에서 뺐어요`);
  };
  const addKind = kind => {
    const base = { box: [60, 40, 60], cabinet: [60, 40, 90], chair: [45, 48, 85], sidetable: [45, 45, 50], shelf: [80, 30, 110] }[kind];
    const name = ADD_KINDS.find(k => k[0] === kind)[1];
    const o = autoPlace(room, all, { id: 'u' + Date.now(), name: `내 ${name}`, kind, w: base[0], d: base[1], h: base[2], color: '#a9b4a2' });
    if (!o) return say('빈 공간이 없어요');
    setObjects(os => [...os, o]); setSel(o.id); setTab('object'); setAddOpen(false);
  };
  useEffect(() => {
    const h = e => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (mode === 'room' && k === 'r') rotate();
      else if (mode === 'room' && k === 'q') rotBy(-STEP);
      else if (mode === 'room' && k === 'e') rotBy(STEP);
      else if (mode === 'room' && k === 'g') setTool('move');
      else if (mode === 'room' && k === 't') setTool('rotate');
      else if (mode === 'room' && (k === 'delete' || k === 'x' || k === 'backspace')) remove();
      else if (k === 'home' || k === '.') view('home');
      else if (k === '1') view('front'); else if (k === '3') view('side'); else if (k === '7') view('top');
      else if (e.shiftKey && k === 'a' && mode === 'room') setAddOpen(o => !o);
      else if (k === 'escape') { setSel(null); setAddOpen(false); }
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  });

  /* ---------- 오른쪽 패널 데이터 ---------- */
  const recs = useMemo(() => INTERIOR.map(p => ({
    ...p, match: Math.round(cosine(vec, p.v) * 100), fits: !!autoPlace(room, objects, { ...p, id: 'x' }),
  })).sort((a, b) => b.fits - a.fits || b.match - a.match), [vec, room, objects]);
  const free = freeFloor(room, all);
  const warn = Object.keys(bad).length;

  const tabs = mode === 'room'
    ? [['object', '선택한 물건', 'cube'], ['room', '방 설정', 'room'], ['recs', '추천 놓아보기', 'star']]
    : [['body', '체형 입력', 'body'], ['wear', '입어보기', 'shirt']];

  return (
    <div className="studio">
      <div className="st-main">
        <div className="st-view" ref={wrap}>
          <canvas ref={canvas} className={tool === 'rotate' && mode === 'room' ? 'rot' : ''} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onWheel={onWheel} onContextMenu={e => e.preventDefault()} />
          <div className="vp-info">
            <p className="eyebrow">3D Studio</p>
            <b>{mode === 'room' ? '내 방' : '내 체형'}</b>
            <span>{mode === 'room' ? `${room.w}×${room.d}×${room.h}cm · 물건 ${all.length}개 · 남은 바닥 ${free.toFixed(1)}㎡` : `키 ${body.height} · 가슴 ${body.chest} · 허리 ${body.waist} · 엉덩이 ${body.hip}cm`}</span>
            {mode === 'room' && warn > 0 && <em>겹치거나 방을 벗어난 물건 {warn}개</em>}
          </div>
          <div className="vp-mode">
            <button className={mode === 'room' ? 'on' : ''} onClick={() => setMode('room')}>방 꾸미기</button>
            <button className={mode === 'body' ? 'on' : ''} onClick={() => setMode('body')}>체형 · 입어보기</button>
          </div>
          <canvas className="gizmo" ref={gizmo} width="180" height="180" onClick={e => {
            const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
            if (Math.hypot(x, y) < 50) view(Math.abs(x) > Math.abs(y) ? 'side' : y < 0 ? 'top' : 'front');
          }} />
          <div className="rail">
            {mode === 'room' && (
              <>
                <button className={tool === 'move' ? 'on' : ''} onClick={() => setTool('move')} title="이동 (G)"><Ic i="move" /><span>이동</span></button>
                <button className={tool === 'rotate' ? 'on' : ''} onClick={() => setTool('rotate')} title="회전 (T)"><Ic i="rot" /><span>회전</span></button>
                <div className="menu-wrap">
                  <button className={addOpen ? 'on' : ''} onClick={() => setAddOpen(o => !o)} title="내 물건 추가"><Ic i="cube" /><span>추가</span></button>
                  {addOpen && (
                    <div className="menu">
                      <div className="menu-h">내 물건 추가</div>
                      {ADD_KINDS.map(([k, l]) => <button key={k} onClick={() => addKind(k)}>{l}</button>)}
                    </div>
                  )}
                </div>
                <i />
              </>
            )}
            <button onClick={() => view('front')} title="앞 (1)"><Ic i="front" /><span>앞</span></button>
            <button onClick={() => view('side')} title="옆 (3)"><Ic i="side" /><span>옆</span></button>
            <button onClick={() => view('top')} title="위 (7)"><Ic i="top" /><span>위</span></button>
            <button onClick={() => view('home')} title="처음 시점"><Ic i="home" /><span>처음</span></button>
          </div>
          <div className="vp-label" ref={label}>
            {selObj && (
              <>
                <div className="tb-name">{selObj.name} <small>{fp(selObj).w}×{fp(selObj).d}×{selObj.h}</small></div>
                {bad[selObj.id] && <em>{bad[selObj.id]}</em>}
                <div className="tb-btns">
                  <button onClick={() => rotBy(-STEP)} title="왼쪽으로 15° (Q)">↺ 15°</button>
                  <button onClick={() => rotBy(STEP)} title="오른쪽으로 15° (E)">↻ 15°</button>
                  <button onClick={rotate} title="90° (R)">90°</button>
                  <button className="del" onClick={remove} title="삭제 (X)"><Ic i="del" /></button>
                </div>
              </>
            )}
          </div>
          <div className="vp-label h" ref={hLabel}>↕ {body.height}cm</div>
          {mode === 'room' && previewObj && (
            <div className={`vp-card ${bad.preview ? 'no' : 'yes'}`}>
              <img src={thumb('f' + previewObj.productId, furnitureThumb(previewObj))} alt="" />
              <div>
                <small>미리 놓아보는 중</small>
                <b>{previewObj.name}</b>
                <span>{bad.preview ? `${bad.preview} · 드래그해서 옮겨보세요` : '이 자리에 들어가요'}</span>
              </div>
              <button className="vbtn pri" disabled={!!bad.preview} onClick={() => onBuy(previewObj.productId)}>구매</button>
              <button className="vbtn" onClick={() => setPreviewObj(null)}>빼기</button>
            </div>
          )}
          <div className="vp-hint">{mode === 'room' ? (tool === 'rotate' ? '회전 모드: 물건을 좌우로 드래그하면 돌아가요 · Q/E 15° · R 90°' : '물건을 드래그하면 옮겨져요 · 빈 곳 드래그로 시점 회전 · 오른쪽 드래그 이동 · 휠 확대') : '드래그로 돌려보기 · 휠 확대'}</div>
        </div>

        <aside className="st-side">
          <div className="side-h">
            <p className="eyebrow">{mode === 'room' ? 'Outliner' : 'My Body'}</p>
            <h3>{mode === 'room' ? <>내 방 <b>물건</b></> : <>나의 <b>체형과 옷</b></>}</h3>
            <span className="pp-chip"><i />{passName}</span>
          </div>
          <div className="outliner">
            {mode === 'room' ? all.map(o => (
              <div key={o.id} className={`ol-row ${sel === o.id ? 'sel' : ''} ${bad[o.id] ? 'warn' : ''}`} onClick={() => { setSel(o.id); setTab('object'); }}>
                <span className="ol-sw" style={{ background: o.color }} />
                <span className="ol-name">{o.name}{o.id === 'preview' && <em className="pv">미리보기</em>}</span>
                <small>{fp(o).w}×{fp(o).d}</small>
                <button className="eye" onClick={e => { e.stopPropagation(); setHidden(h => ({ ...h, [o.id]: !h[o.id] })); }}><Ic i={hidden[o.id] ? 'eyeOff' : 'eye'} /></button>
              </div>
            )) : (
              <>
                <div className={`ol-row ${sel === 'body' ? 'sel' : ''}`} onClick={() => { setSel('body'); setTab('body'); }}><span className="ol-sw" style={{ background: '#ddd7ce' }} /><span className="ol-name">마네킹</span><small>{body.height}cm</small></div>
                {SLOTS.map(slot => {
                  const it = FASHION.find(f => f.id === outfit[slot]);
                  return (
                    <div key={slot} className={`ol-row ${sel === slot ? 'sel' : ''}`} onClick={() => { setSel(slot); setTab('wear'); setSlotFilter(slot); }}>
                      <span className="ol-sw" style={{ background: it ? it.color : 'transparent' }} />
                      <span className="ol-name">{SLOT_LABEL[slot]} <small>{it ? it.name : '없음'}</small></span>
                      {it && <button className="eye" onClick={e => { e.stopPropagation(); setHidden(h => ({ ...h, [slot]: !h[slot] })); }}><Ic i={hidden[slot] ? 'eyeOff' : 'eye'} /></button>}
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div className="pnl-tabs">
            {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          <div className="pnl-body">
            {tab === 'object' && (selObj ? (
              <ObjectProps o={selObj} bad={bad[selObj.id]} update={patch => update(selObj.id, patch)} rotBy={rotBy} setRot={r => update(selObj.id, rotated(selObj, r))} remove={remove}
                onBuy={() => onBuy(selObj.productId)} goShop={() => go('shop')} />
            ) : <p className="empty">3D 화면이나 위 목록에서 물건을 고르세요.<br />물건을 드래그하면 옮겨지고, 회전 도구로 돌릴 수 있어요.</p>)}
            {tab === 'room' && (
              <div className="props">
                <div className="prop-h">방 치수</div>
                {[['w', '가로'], ['d', '세로'], ['h', '높이']].map(([k, l]) => (
                  <Num key={k} label={l} value={room[k]} min={150} max={800} step={10} onChange={v => setRoom(r => ({ ...r, [k]: v }))} />
                ))}
                <div className="stat-row"><span>남은 바닥</span><b>{free.toFixed(1)}㎡</b></div>
                <div className="stat-row"><span>문제</span><b className={warn ? 'red' : ''}>{warn ? `${warn}개 겹침·벗어남` : '없음'}</b></div>
                <div className="prop-h">내 물건 추가</div>
                <div className="chips-row">{ADD_KINDS.map(([k, l]) => <button key={k} className="chipbtn" onClick={() => addKind(k)}>+ {l}</button>)}</div>
              </div>
            )}
            {tab === 'recs' && (
              <div className="props">
                <div className="prop-h">내 취향 + 남은 공간 기준</div>
                {isEmpty(vec) && <p className="empty sm">여권이 비어 있어 크기만 봐요</p>}
                {recs.map(p => (
                  <div key={p.id} className={`rec ${p.fits ? '' : 'dim'} ${previewObj?.productId === p.id ? 'act' : ''}`}>
                    <img src={thumb('f' + p.id, furnitureThumb(p))} alt="" />
                    <div className="rec-i"><b>{p.name}</b><small>{p.w}×{p.d}×{p.h} · {won(p.price)}</small></div>
                    {!isEmpty(vec) && <span className="m">{p.match}%</span>}
                    {p.fits ? <button className="mini" onClick={() => tryProduct(p.id)}>놓기</button> : <span className="nf">공간 부족</span>}
                  </div>
                ))}
              </div>
            )}
            {tab === 'body' && <BodyProps body={body} setBody={setBody} outfit={outfit} />}
            {tab === 'wear' && <WearProps body={body} outfit={outfit} setOutfit={setOutfit} vec={vec} sizes={sizes} setSizes={setSizes} filter={slotFilter} setFilter={setSlotFilter} />}
          </div>
          <div className="side-f">
            <button className="pill line sm" onClick={() => go('shop')}>가맹점 가기</button>
            <span>여권 신호 {signalsCount}개</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Num({ label, value, min, max, step = 1, onChange, unit = 'cm' }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const commit = x => { const n = Math.max(min, Math.min(max, Number(x) || min)); onChange(n); setV(n); };
  return (
    <label className="num">
      <span>{label}</span>
      <div className="num-f">
        <button onClick={() => commit(value - step)}>‹</button>
        <input value={v} onChange={e => setV(e.target.value)} onBlur={e => commit(e.target.value)} onKeyDown={e => e.key === 'Enter' && commit(e.target.value)} />
        <em>{unit}</em>
        <button onClick={() => commit(value + step)}>›</button>
      </div>
    </label>
  );
}

function ObjectProps({ o, bad, update, rotBy, setRot, remove, onBuy, goShop }) {
  return (
    <div className="props">
      <div className="obj-h">
        <img src={thumb('f' + (o.productId || o.id + o.kind + o.w + o.d + o.h + o.color), furnitureThumb(o))} alt="" />
        <div><b>{o.name}</b><small>{o.id === 'preview' ? '미리보기 (아직 구매 전)' : '내 물건'}</small></div>
      </div>
      {bad ? <div className="alert">⚠ {bad}</div> : <div className="okay">✓ 문제없이 놓였어요</div>}
      <div className="prop-h">위치 (왼쪽 벽, 뒷벽에서 거리)</div>
      <Num label="왼쪽에서" value={o.x} min={-200} max={1000} step={5} onChange={x => update({ x })} />
      <Num label="뒤에서" value={o.z} min={-200} max={1000} step={5} onChange={z => update({ z })} />
      <div className="prop-h">회전</div>
      <div className="rot-row">
        <button className="chipbtn" onClick={() => rotBy(-STEP)}>↺ 15°</button>
        <input type="range" min="0" max="345" step="15" value={Math.round((o.rot * 180) / Math.PI) % 360} onChange={e => setRot((Number(e.target.value) * Math.PI) / 180)} />
        <button className="chipbtn" onClick={() => rotBy(STEP)}>↻ 15°</button>
        <b>{Math.round((o.rot * 180) / Math.PI) % 360}°</b>
      </div>
      <div className="prop-h">치수</div>
      <Num label="가로" value={o.w} min={10} max={400} onChange={w => update({ w })} />
      <Num label="깊이" value={o.d} min={10} max={400} onChange={d => update({ d })} />
      <Num label="높이" value={o.h} min={1} max={260} onChange={h => update({ h })} />
      <div className="prop-h">재질 색</div>
      <div className="color-row"><input type="color" value={o.color} onChange={e => update({ color: e.target.value })} /><code>{o.color}</code></div>
      <div className="btn-row">
        {o.id === 'preview' && <button className="pbtn pri" disabled={!!bad} onClick={onBuy}>구매 (데모)</button>}
        {o.id === 'preview' && <button className="pbtn" onClick={goShop}>가맹점에서 보기</button>}
        <button className="pbtn danger" onClick={remove}>방에서 빼기</button>
      </div>
    </div>
  );
}

function BodyProps({ body, setBody, outfit }) {
  const rec = SLOTS.map(slot => { const it = FASHION.find(f => f.id === outfit[slot]); return it ? [slot, it, sizeAdvice(it, body)] : null; }).filter(Boolean);
  return (
    <div className="props">
      <div className="prop-h">체형 빠르게 고르기</div>
      <div className="chips-row">{BODY_PRESETS.map(p => <button key={p.id} className="chipbtn" onClick={() => setBody(p.b)}>{p.label}</button>)}</div>
      <div className="prop-h">치수 직접 넣기</div>
      {BODY_FIELDS.map(([k, l, mn, mx, st, u]) => (
        <div className="slider" key={k}>
          <div className="sl-top"><span>{l}</span><b>{k === 'leg' ? (body[k] < 0.97 ? '짧은 편' : body[k] > 1.03 ? '긴 편' : '보통') : `${body[k]}${u}`}</b></div>
          <input type="range" min={mn} max={mx} step={st} value={body[k]} onChange={e => setBody(b => ({ ...b, [k]: Number(e.target.value) }))} />
        </div>
      ))}
      <p className="note-sm">입력한 치수는 기기 안에서만 쓰고, 가맹점에는 <b>추천 사이즈만</b> 전달돼요.</p>
      {rec.length > 0 && (
        <>
          <div className="prop-h">지금 입은 옷의 추천 사이즈</div>
          {rec.map(([slot, it, a]) => <div key={slot} className="stat-row"><span>{it.name}</span><b>{a.size}</b><small>{a.note}</small></div>)}
        </>
      )}
    </div>
  );
}

function WearProps({ body, outfit, setOutfit, vec, sizes, setSizes, filter, setFilter }) {
  const list = FASHION.map(f => ({ ...f, match: Math.round(cosine(vec, f.v) * 100), adv: sizeAdvice(f, body) }))
    .filter(f => !filter || f.slot === filter).sort((a, b) => b.match - a.match);
  return (
    <div className="props">
      <div className="chips-row">
        <button className={`chipbtn ${!filter ? 'on' : ''}`} onClick={() => setFilter(null)}>전체</button>
        {SLOTS.map(s => <button key={s} className={`chipbtn ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>{SLOT_LABEL[s]}</button>)}
      </div>
      <p className="note-sm">인테리어 취향을 패션 언어로 번역한 순서예요 · 참고용</p>
      {list.map(f => {
        const worn = outfit[f.slot] === f.id, size = sizes[f.id] || f.adv.size, fit = fitOf(f, size, body);
        return (
          <div key={f.id} className={`wear ${worn ? 'act' : ''}`}>
            <div className="wear-top">
              <img src={thumb('g' + f.id, garmentThumb(f, body))} alt="" />
              <div className="rec-i"><b>{f.name}</b><small>{SLOT_LABEL[f.slot]} · {won(f.price)}</small></div>
              {!isEmpty(vec) && <span className="m">{f.match}%</span>}
            </div>
            <div className="wear-bot">
              <div className="sizes">
                {['S', 'M', 'L', 'XL'].map(k => (
                  <button key={k} className={`${size === k ? 'on' : ''} ${f.adv.size === k ? 'rec' : ''}`} onClick={() => { setSizes(s => ({ ...s, [f.id]: k })); if (!worn) setOutfit(o => ({ ...o, [f.slot]: f.id })); }}>{k}</button>
                ))}
              </div>
              <span className={`fit ${fit.ok ? 'y' : 'n'}`}>{size} {fit.label}</span>
              <button className={`mini ${worn ? 'ghost' : ''}`} onClick={() => setOutfit(o => ({ ...o, [f.slot]: worn ? null : f.id }))}>{worn ? '벗기' : '입기'}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 지오메트리 ---------- */
function floorGeo(room) {
  const g = new Geo(), { w: W, d: D } = room;
  g.box(-8, -6, -8, W + 8, -0.2, D + 8, '#bfa98a');
  for (let x = 0, i = 0; x < W; x += 18, i++) g.box(x + 0.3, -0.2, 0, Math.min(W, x + 17.7), 0, D, i % 3 === 0 ? '#d8c3a3' : i % 3 === 1 ? '#d2bc9b' : '#dcc8aa');
  return g;
}
function wallGeo(room, side) {
  const g = new Geo(), { w: W, d: D, h: H } = room, t = 8, col = '#efece6', cap = '#bdb6aa';
  const mk = (x0, z0, x1, z1) => { g.box(x0, 0, z0, x1, H, z1, col); g.box(x0, H, z0, x1, H + 0.6, z1, cap); g.box(x0, 0, z0, x1, 8, z1, '#e2ddd4'); };
  if (side === 'back') {
    mk(-t, -t, W + t, 0);
    const wx0 = W * 0.5, wx1 = Math.min(W - 20, W * 0.5 + 110);
    g.box(wx0, 100, 0, wx1, 200, 0.6, '#cfe0ee'); g.box(wx0 - 4, 96, 0, wx1 + 4, 100, 3, '#fafafa'); g.box(wx0 - 4, 200, 0, wx1 + 4, 204, 3, '#fafafa');
    g.box(wx0 - 4, 100, 0, wx0, 200, 3, '#fafafa'); g.box(wx1, 100, 0, wx1 + 4, 200, 3, '#fafafa'); g.box((wx0 + wx1) / 2 - 1.5, 100, 0, (wx0 + wx1) / 2 + 1.5, 200, 2, '#fafafa');
  }
  if (side === 'front') mk(-t, D, W + t, D + t);
  if (side === 'left') { mk(-t, 0, 0, D); g.box(0, 0, D - 100, 1, 205, D - 15, '#c9ad8a'); g.box(0.5, 100, D - 30, 3, 104, D - 24, '#9a9a9a'); }
  if (side === 'right') mk(W, 0, W + t, D);
  return g;
}

function drawGizmo(cv, view) {
  if (!cv) return;
  const x = cv.getContext('2d'), S = cv.width, c = S / 2, r = S * 0.32;
  x.clearRect(0, 0, S, S);
  x.fillStyle = 'rgba(255,255,255,0.06)'; x.beginPath(); x.arc(c, c, S * 0.46, 0, Math.PI * 2); x.fill();
  const ax = [[[1, 0, 0], '#ff3352', 'X'], [[0, 0, -1], '#8bdc00', 'Y'], [[0, 1, 0], '#2890ff', 'Z']];
  const pts = [];
  ax.forEach(([v, col, l]) => {
    const sx = view[0] * v[0] + view[4] * v[1] + view[8] * v[2], sy = view[1] * v[0] + view[5] * v[1] + view[9] * v[2], sz = view[2] * v[0] + view[6] * v[1] + view[10] * v[2];
    pts.push({ x: c + sx * r, y: c - sy * r, z: sz, col, l, pos: true });
    pts.push({ x: c - sx * r, y: c + sy * r, z: -sz, col, l, pos: false });
  });
  pts.sort((a, b) => a.z - b.z).forEach(p => {
    if (p.pos) { x.strokeStyle = p.col; x.lineWidth = 4; x.beginPath(); x.moveTo(c, c); x.lineTo(p.x, p.y); x.stroke(); }
    x.beginPath(); x.arc(p.x, p.y, p.pos ? 17 : 13, 0, Math.PI * 2);
    x.fillStyle = p.pos ? p.col : p.col + '55'; x.fill();
    if (p.pos) { x.fillStyle = '#111'; x.font = 'bold 18px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(p.l, p.x, p.y + 1); }
  });
}
