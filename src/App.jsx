import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { SWIPES, IMPORTS, INTERIOR, FASHION, SHOPS, SAMPLE_B, DEFAULT_ROOM, DEFAULT_OBJECTS, BODY_PRESETS } from './data.js';
import { SRC_WEIGHT, cosine, buildPassport, isEmpty, passportName, autoPlace } from './engine.js';
import Studio from './Studio.jsx';
import './style.css';
import { Header, Footer, Home, Make, Shop, ConsentModal, Passport } from './Site.jsx';

let uid = 0;
const nid = () => `id${++uid}`;
const now = () => new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

function App() {
  const [page, setPage] = useState('home');
  const [studioMode, setStudioMode] = useState('room');
  const [signals, setSignals] = useState([]);
  const [manual, setManual] = useState({});
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [imported, setImported] = useState({});
  const [which, setWhich] = useState('me');
  const [room, setRoom] = useState(DEFAULT_ROOM);
  const [objects, setObjects] = useState(DEFAULT_OBJECTS);
  const [previewObj, setPreviewObj] = useState(null);
  const [body, setBody] = useState(BODY_PRESETS[0].b);
  const [outfit, setOutfit] = useState({ top: 'f3', bottom: 'f6', outer: null });
  const [consents, setConsents] = useState({});
  const [mode, setMode] = useState({});
  const [shopId, setShopId] = useState('living');
  const [asking, setAsking] = useState(null);
  const [logs, setLogs] = useState([]);
  const [toast, setToast] = useState(null);

  const myVec = useMemo(() => buildPassport(signals, manual), [signals, manual]);
  const vec = which === 'B' ? SAMPLE_B : myVec;
  const say = msg => setToast({ msg, id: nid() });
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);
  const go = (p, m) => { if (m) setStudioMode(m); setPage(p); window.scrollTo(0, 0); };

  const addSignals = arr => setSignals(s => [...arr.map(x => ({ id: nid(), off: false, ...x })), ...s]);
  const importSrc = src => {
    setImported(m => { if (m[src.id]) return m; addSignals(src.items.map(it => ({ src: src.src, w: src.w, label: it.label, v: it.v }))); return { ...m, [src.id]: true }; });
  };
  const fillAll = () => {
    if (!signals.some(s => s.src === '좋아요')) addSignals([SWIPES[0], SWIPES[2], SWIPES[8]].map(c => ({ src: '좋아요', w: 1, label: c.t, v: c.v })));
    IMPORTS.forEach(importSrc); setSwipeIdx(SWIPES.length); say('샘플 취향을 모두 가져왔어요');
  };

  const log = (id, v) => {
    const shop = SHOPS.find(s => s.id === id);
    const ranked = shop.items.map(p => ({ id: p.id, m: Math.round(cosine(v, p.v) * 100) })).sort((a, b) => b.m - a.m);
    setLogs(l => [...l, { shopId: id, at: now(), req: { endpoint: 'POST /v1/rerank', passport_token: 'tp_tok_••••', items: shop.items.map(p => p.id).join(', ') }, res: { ranked: ranked.slice(0, 5).map(r => `${r.id} · ${r.m}%`).join(', ') + ' …', raw_taste: '전달 안 함', body_size: id === 'fit' ? '추천 사이즈만' : undefined } }]);
  };
  const enter = id => {
    if (isEmpty(vec)) { say('저장소가 비어 있어요. 먼저 저장소를 만들어 주세요'); return; }
    if (consents[id]) { setMode(m => ({ ...m, [id]: true })); log(id, vec); return; }
    setAsking(id);
  };
  const agree = scopes => {
    const id = asking;
    setConsents(c => ({ ...c, [id]: { scopes, at: now() } })); setMode(m => ({ ...m, [id]: true })); setAsking(null); log(id, vec);
    say('가게에 취향 저장소가 연결됐어요');
  };
  const revoke = id => {
    setConsents(c => { const n = { ...c }; delete n[id]; return n; }); setMode(m => ({ ...m, [id]: false }));
    setSignals(s => s.filter(x => x.shopId !== id)); say('연결을 끊고 그 가게에서 쌓인 기록을 지웠어요');
  };
  const record = (p, id, kind) => {
    const c = consents[id];
    if (!c || !mode[id]) return say(kind === '찜' ? '찜했어요 (저장소 없이 보는 중이라 기록 안 됨)' : '구매했어요 (저장소엔 기록 안 됨)');
    if (!c.scopes.record) return say('기록 저장에 동의하지 않아 저장소엔 남기지 않았어요');
    addSignals([{ src: kind === '찜' ? '찜' : '가맹점구매', w: SRC_WEIGHT[kind === '찜' ? '찜' : '가맹점구매'], label: `${SHOPS.find(s => s.id === id).name} · ${p.name}`, v: p.v, shopId: id }]);
    say(`저장소에 기록됐어요 → 다음 추천에 반영 (${kind})`);
  };

  const tryProduct = pid => {
    const p = INTERIOR.find(x => x.id === pid);
    const base = { ...p, id: 'preview', productId: p.id, rot: 0 };
    const o = autoPlace(room, objects, base);
    setPreviewObj(o || { ...base, x: Math.max(0, (room.w - p.w) / 2), z: Math.max(0, (room.d - p.d) / 2) });
    if (!o) say('빈 자리가 없어서 가운데에 놓았어요. 드래그해서 옮겨보세요');
    go('studio', 'room');
  };
  const buyFurniture = (pid, fromShop) => {
    const p = INTERIOR.find(x => x.id === pid);
    if (previewObj && previewObj.productId === pid) {
      setObjects(os => [...os, { ...previewObj, id: nid(), name: p.name }]); setPreviewObj(null);
    } else {
      const o = autoPlace(room, objects, { ...p, id: nid(), productId: p.id });
      if (o) setObjects(os => [...os, o]);
    }
    if (consents.living && mode.living) record(p, 'living', '구매');
    else if (!fromShop) say(`${p.name}을(를) 샀어요. 내 방에 추가됐어요`);
  };
  const onBuy = (p, id) => {
    if (id === 'living') { buyFurniture(p.id, true); if (!(consents.living && mode.living)) say(`${p.name} 구매 · 내 방에 추가됐어요`); }
    else { record(p, id, '구매'); setOutfit(o => ({ ...o, [p.slot]: p.id })); }
  };
  const onWear = p => { setOutfit(o => ({ ...o, [p.slot]: p.id })); go('studio', 'body'); };
  const stamps = Object.entries(consents).map(([id, c]) => ({ id, ...SHOPS.find(s => s.id === id), at: c.at }));

  if (page === 'studio') {
    return (
      <div className="site studio-page">
        <Header page="studio" go={go} />
        <Studio mode={studioMode} setMode={setStudioMode} room={room} setRoom={setRoom} objects={objects} setObjects={setObjects}
          previewObj={previewObj} setPreviewObj={setPreviewObj} tryProduct={tryProduct} body={body} setBody={setBody}
          outfit={outfit} setOutfit={setOutfit} vec={vec} passName={isEmpty(vec) ? '저장소 비어 있음' : passportName(vec)}
          signalsCount={signals.filter(s => !s.off).length} onBuy={pid => buyFurniture(pid)} go={go} say={say} />
        {toast && <div className="toast" key={toast.id}>{toast.msg}</div>}
      </div>
    );
  }
  return (
    <div className="site">
      <Header page={page} go={go} />
      {page === 'home' && <Home go={go} body={body} vec={vec} />}
      {page === 'make' && (
        <Make swipeIdx={swipeIdx} imported={imported} onImport={importSrc} onAll={fillAll} vec={myVec} go={go}
          onPick={(c, like) => { if (like) addSignals([{ src: '좋아요', w: 1, label: c.t, v: c.v }]); setSwipeIdx(i => i + 1); }} />
      )}
      {page === 'shop' && (
        <Shop shopId={shopId} setShopId={setShopId} vec={vec} isB={which === 'B'} which={which} setWhich={setWhich} consents={consents} mode={mode}
          enter={enter} leave={id => setMode(m => ({ ...m, [id]: false }))} room={room} objects={objects} body={body}
          onTry={p => tryProduct(p.id)} onWear={onWear} onWish={(p, id) => record(p, id, '찜')} onBuy={onBuy} logs={logs} />
      )}
      {page === 'passport' && (
        <Passport vec={vec} isB={which === 'B'} which={which} setWhich={setWhich} signals={signals} manual={manual} stamps={stamps}
          toggleSignal={id => setSignals(s => s.map(x => (x.id === id ? { ...x, off: !x.off } : x)))}
          onNudge={(k, d) => setManual(m => ({ ...m, [k]: Math.max(-1, Math.min(1, (m[k] || 0) + d)) }))}
          resetManual={() => setManual({})} consents={consents} revoke={revoke} logs={logs} go={go} />
      )}
      <Footer />
      {asking && <ConsentModal shop={SHOPS.find(s => s.id === asking)} onOk={agree} onCancel={() => setAsking(null)} />}
      {toast && <div className="toast" key={toast.id}>{toast.msg}</div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
