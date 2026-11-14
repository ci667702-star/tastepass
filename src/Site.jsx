import React, { useState, useEffect, useMemo } from 'react';
import { thumb } from './gl.js';
import { furnitureThumb, garmentThumb, vignette, heroScene } from './models.js';
import { AXES, GROUPS, LABEL, FASHION_LABEL, SWIPES, IMPORTS, INTERIOR, FASHION, SHOPS, SLOT_LABEL, DEFAULT_OBJECTS } from './data.js';
import { cosine, topAxes, passportName, reasons, isEmpty, won, sizeAdvice, autoPlace } from './engine.js';

/* ---------- 공통 ---------- */
export function Logo({ onClick }) {
  return (
    <button className="logo" onClick={onClick}>
      <svg viewBox="0 0 40 40" className="logo-mark"><rect x="6" y="3" width="28" height="34" rx="6" fill="#2350E6" /><circle cx="20" cy="17" r="7" fill="none" stroke="#FFE04A" strokeWidth="2.4" /><path d="M20 11.5l1.7 4 4 .3-3 2.6 1 4L20 20.2l-3.7 2.2 1-4-3-2.6 4-.3z" fill="#FFE04A" /><rect x="12" y="28" width="16" height="2.4" rx="1.2" fill="#fff" opacity=".7" /></svg>
      <span>취향여권</span>
    </button>
  );
}
export function Header({ page, go }) {
  const nav = [['home', '서비스 소개'], ['make', '여권 만들기'], ['studio', '3D 스튜디오'], ['shop', '가맹점'], ['passport', '내 여권']];
  return (
    <header className="site-h">
      <div className="util">
        <div className="u-l"><a onClick={() => go('shop')}>가맹점 입점 문의</a><i /><a onClick={() => go('shop')}>개발자 API</a></div>
        <Logo onClick={() => go('home')} />
        <div className="u-r"><span className="pill-s">고객센터 <em>▾</em></span><span className="pill-s">KOR <em>▾</em></span></div>
      </div>
      <nav className="gnb">{nav.map(([k, l]) => <button key={k} className={page === k ? 'on' : ''} onClick={() => go(k)}>{l}</button>)}</nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-f">
      <div className="f-in">
        <div>
          <div className="f-links"><a>서비스 이용약관</a><i /><a><b>개인정보처리방침</b></a><i /><a>가맹점 입점 문의</a></div>
          <p>취향여권 TastePass · GEEKs Ideathon 2026 프로토타입</p>
          <p>화면 속 가게 이름과 상품, 데이터는 모두 시연용 가상 데이터입니다.</p>
        </div>
        <span className="pill-s wide">Partner Site <em>▾</em></span>
      </div>
      <div className="f-bot"><span className="f-word">TastePass</span><span>© TastePass prototype. All rights reserved.</span></div>
    </footer>
  );
}
export const Title = ({ eyebrow, light, bold, sub, dark }) => (
  <div className={`sec-t ${dark ? 'dark' : ''}`}>
    <p className="eyebrow">{eyebrow}</p>
    <h2>{light} <b>{bold}</b></h2>
    {sub && <p className="sub">{sub}</p>}
  </div>
);
const SrcIcon = ({ id }) => ({
  order: <svg viewBox="0 0 32 32"><path d="M8 3h16v26l-3-2-2.5 2-2.5-2-2.5 2-2.5-2L8 29z" /><path d="M12 10h8M12 15h8M12 20h5" /></svg>,
  saved: <svg viewBox="0 0 32 32"><path d="M9 4h14v24l-7-5-7 5z" /></svg>,
  photo: <svg viewBox="0 0 32 32"><rect x="3" y="8" width="26" height="19" rx="3" /><circle cx="16" cy="17.5" r="5.5" /><path d="M11 8l2-4h6l2 4" /></svg>,
}[id]);

/* ---------- 홈 ---------- */
const CATS = [
  ['인테리어', '내 방과 물건에서 모은 취향으로, 처음 간 가구몰도 나를 알아봐요.'],
  ['패션', '방에서 찾은 색감·소재·무드를 옷의 언어로 바꿔 추천해요.'],
  ['데스크 셋업', '책상 치수에 딱 맞는 선반과 조명만 골라 보여줘요.'],
  ['홈카페', '좋아하는 컵과 테이블 톤으로 홈카페 소품을 맞춰요.'],
  ['소품', '작은 물건 하나도 지금 방 분위기에 어울리는지 먼저 봐요.'],
  ['체형 핏', '내 체형을 넣으면 사이즈와 핏을 3D 마네킹으로 확인해요.'],
  ['선물', '친구의 여권을 빌려 취향에 맞는 선물을 골라요.'],
];
export function Home({ go, body, vec }) {
  const [ci, setCi] = useState(0);
  const [step, setStep] = useState(0);
  const [card, setCard] = useState(2);
  const [paused, setPaused] = useState(false);
  useEffect(() => { const t = setInterval(() => setCi(i => (i + 1) % CATS.length), 3200); return () => clearInterval(t); }, []);
  useEffect(() => { if (paused) return; const t = setInterval(() => setCard(i => (i + 1) % CARDS.length), 3000); return () => clearInterval(t); }, [paused]);
  const hero = useMemo(() => thumb('hero', heroScene(body), { w: 760, h: 760, cam: { theta: 0.5, phi: 0.3, dist: 560, target: [0, 70, 0], fov: 0.6 } }), []);
  const STEPS = [
    ['스와이프', '데이터가 없어도 1분이면 시작해요', thumb('v-s3', vignette(SWIPES[2]), { w: 520, h: 520, theta: 0.72 }), '좋아요 ×1'],
    ['주문내역 캡처', '실제로 산 물건이 가장 강한 취향 신호예요', thumb('f-p1', furnitureThumb(INTERIOR[0]), { w: 520, h: 520 }), '구매 ×3'],
    ['저장 이미지', 'SNS에 저장해 둔 사진에서 반복되는 무드를 찾아요', thumb('v-s9', vignette(SWIPES[8]), { w: 520, h: 520, theta: 0.72 }), '저장 ×2'],
    ['내 방 사진', '지금 가진 물건을 3D 내 방으로 옮겨요', thumb('f-o1', furnitureThumb(DEFAULT_OBJECTS[0]), { w: 520, h: 520 }), '사진 ×2'],
  ];
  const CARDS = useMemo(() => [
    ...INTERIOR.slice(0, 6).map(p => ({ tag: '무드리빙', title: p.name, desc: `${p.w}×${p.d}×${p.h}cm · 내 방에 들어가는지 먼저 확인`, img: thumb('f' + p.id, furnitureThumb(p)), bg: '#F3EDE3' })),
    ...FASHION.slice(0, 5).map(f => ({ tag: '데일리핏', title: f.name, desc: `내 체형 추천 ${sizeAdvice(f, body).size} · 3D 마네킹으로 입어보기`, img: thumb('g' + f.id, garmentThumb(f, body)), bg: '#E9EEF8' })),
  ], []);
  return (
    <main className="home">
      <section className="hero">
        <div className="h-circle big" />
        <div className="h-circle small" />
        <div className="h-left">
          <h1>취향을 설명하지 마세요<br />방이 이미 말하고 있어요</h1>
          <div className="h-idx"><span className="n">{String(ci + 1).padStart(2, '0')}</span><i /><span className="t">{CATS[ci][0]}</span></div>
          <div className="h-idx2">{String(CATS.length).padStart(2, '0')}</div>
          <p className="h-desc" key={ci}>{CATS[ci][1]}</p>
          <button className="pill white" onClick={() => go('make')}>내 취향 여권 만들기</button>
        </div>
        {hero && <img className="h-render" src={hero} alt="취향 여권으로 꾸민 방과 마네킹" />}
        <ul className="orbit">
          {CATS.map(([c], i) => <li key={c} className={i === ci ? 'on' : ''} style={{ '--k': i }} onClick={() => setCi(i)}><i />{c}</li>)}
        </ul>
        <div className="mouse"><span /></div>
      </section>

      <section className="sec grey">
        <Title eyebrow="How it works" light="취향을" bold="모으다" sub="취향을 글로 설명하는 대신, 이미 가진 것과 저장해 둔 것을 올리기만 하면 돼요." />
        <div className="steps-stage">
          <ul className="tl">
            {STEPS.map(([n], i) => <li key={n} className={i === step ? 'on' : ''} onClick={() => setStep(i)}><i /><span>STEP 0{i + 1}</span></li>)}
          </ul>
          <div className="big-num"><span>0</span><span>{step + 1}</span></div>
          <img className="step-img" key={step} src={STEPS[step][2]} alt="" />
          <div className="callout"><i /><div><b>{STEPS[step][0]} <small>{STEPS[step][3]}</small></b><p>{STEPS[step][1]}</p></div></div>
        </div>
        <div className="circles">
          {STEPS.map(([n], i) => <button key={n} className={i === step ? 'on' : ''} onClick={() => setStep(i)}>{n}</button>)}
        </div>
      </section>

      <section className="sec yellow">
        <Title eyebrow="Partners" light="어디서든" bold="나에게 맞추다" sub="여권 하나로, 처음 간 가게에서도 내 방과 내 몸에 맞는 것부터 보여줘요." />
        <div className="carousel">
          <div className="track" style={{ transform: `translateX(calc(50% - ${card * 244 + 122}px))` }}>
            {CARDS.map((c, i) => (
              <div key={i} className={`c-card ${i === card ? 'on' : ''}`} onClick={() => setCard(i)}>
                <div className="c-img" style={{ background: c.bg }}>{c.img && <img src={c.img} alt="" />}</div>
                <div className="c-txt"><b>{c.tag}</b><p>{c.title}</p><small>{c.desc}</small></div>
              </div>
            ))}
          </div>
        </div>
        <div className="c-ctrl">
          <div className="c-line">{CARDS.map((_, i) => <i key={i} className={i <= card ? 'done' : ''} />)}</div>
          <span className="pill white sm">{CARDS[card].tag}</span>
          <button className="pause" onClick={() => setPaused(p => !p)}>{paused ? '▶' : '❚❚'}</button>
        </div>
      </section>

      <section className="sec white">
        <Title eyebrow="Privacy" light="추적 없이" bold="안전하게" sub="취향의 주인은 사용자예요. 가게는 순서와 점수만 받아요." />
        <div className="mosaic">
          <div className="tile t1"><b>항목별 동의</b><p>‘인테리어 취향만’, ‘방 치수만’처럼 고르게 보여줘요.</p></div>
          <div className="tile t2"><b>원클릭 철회</b><p>연결을 끊으면 그 가게에서 쌓인 기록도 지워져요.</p></div>
          <div className="tile tbig"><img src={thumb('v-s1', vignette(SWIPES[0]), { w: 640, h: 640, theta: 0.72 })} alt="" /><div className="tag-in">원본 데이터는 밖으로 나가지 않아요</div></div>
          <div className="tile t3"><b>민감정보는 받지 않아요</b><p>얼굴·개인정보는 분석 전에 가리고, 체형 치수는 사이즈 추천에만 써요.</p></div>
          <div className="tile t4"><span className="t4-k">API</span><b>가게가 받는 것</b><p>상품 순서 · 일치도 점수 · 추천 사이즈</p></div>
        </div>
        <div className="cta-row">
          <p>내 방과 내 몸을 3D로 열어보세요.</p><i />
          <button className="round" onClick={() => go('studio', 'room')}>방</button>
          <button className="round" onClick={() => go('studio', 'body')}>체형</button>
          <button className="round" onClick={() => go('shop')}>가게</button>
        </div>
      </section>
    </main>
  );
}

/* ---------- 여권 만들기 ---------- */
export function Make({ swipeIdx, onPick, imported, onImport, onAll, vec, go }) {
  const [stage, setStage] = useState(swipeIdx >= SWIPES.length ? 'import' : 'swipe');
  const [anim, setAnim] = useState(null);
  const [busy, setBusy] = useState(null);
  const card = SWIPES[swipeIdx];
  const pick = like => { if (anim || !card) return; setAnim(like ? 'r' : 'l'); setTimeout(() => { setAnim(null); onPick(card, like); }, 260); };
  useEffect(() => {
    const h = e => { if (stage !== 'swipe') return; if (e.key === 'ArrowRight') pick(true); if (e.key === 'ArrowLeft') pick(false); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  });
  useEffect(() => { if (stage === 'swipe' && !card) setStage('import'); }, [card]);
  const run = src => {
    let step = 0; setBusy({ id: src.id, step });
    const t = setInterval(() => { step += 1; if (step >= src.steps.length) { clearInterval(t); setBusy(null); onImport(src); } else setBusy({ id: src.id, step }); }, 650);
  };
  const doneAll = IMPORTS.every(s => imported[s.id]);
  return (
    <main className="make">
      <div className="make-top">
        <div className="stepper">
          {[['swipe', '취향 고르기'], ['import', '취향 가져오기'], ['done', '여권 완성']].map(([k, l], i) => (
            <button key={k} className={stage === k ? 'on' : ''} onClick={() => setStage(k)}><span>0{i + 1}</span>{l}</button>
          ))}
        </div>
      </div>
      {stage === 'swipe' && (
        <section className="sec grey tight">
          <Title eyebrow={`${Math.min(swipeIdx + 1, SWIPES.length)} / ${SWIPES.length}`} light="마음에 드는 방을" bold="고르다" sub="데이터가 하나도 없어도 괜찮아요. 끌리는 공간만 골라주세요. (키보드 ← →)" />
          {card && (
            <div className="swipe-area">
              <div className={`sw-card ${anim ? 'out-' + anim : ''}`} key={card.id}>
                <img src={thumb('v-' + card.id, vignette(card), { w: 640, h: 640, theta: 0.72 })} alt={card.t} />
                <div className="sw-txt"><b>{card.t}</b><div className="tags">{topAxes(card.v, 3, 0.5).map(a => <span key={a.k}>#{a.label}</span>)}</div></div>
              </div>
              <div className="sw-btns">
                <button className="round lg" onClick={() => pick(false)}>별로</button>
                <button className="round lg on" onClick={() => pick(true)}>좋아요</button>
              </div>
              <button className="link" onClick={() => { onAll(); setStage('done'); }}>건너뛰고 샘플 데이터로 채우기</button>
            </div>
          )}
        </section>
      )}
      {stage === 'import' && (
        <section className="sec white tight">
          <Title eyebrow="Import" light="가진 것에서" bold="가져오다" sub="아이디·비밀번호는 받지 않아요. 내가 직접 올린 것만 분석해요. (시연은 샘플로 진행)" />
          <div className="imports">
            {IMPORTS.map(src => {
              const done = imported[src.id], b = busy?.id === src.id;
              return (
                <div key={src.id} className={`imp ${done ? 'ok' : ''}`}>
                  <div className="imp-h"><span className="imp-ic"><SrcIcon id={src.id} /></span><span className="w">{src.src} ×{src.w}</span></div>
                  <h3>{src.title}</h3>
                  <p className="d">{src.desc}</p>
                  {b && <ol className="pipe">{src.steps.map((s, i) => <li key={s} className={i < busy.step ? 'done' : i === busy.step ? 'now' : ''}>{s}</li>)}</ol>}
                  {done && (
                    <ul className="ext">
                      {src.items.map(it => <li key={it.label}><code>{it.raw}</code><span>→ <b>{it.label}</b> {topAxes(it.v, 3, 0.5).map(a => <em key={a.k}>{a.label}</em>)}</span></li>)}
                    </ul>
                  )}
                  {!b && !done && <button className="pill blue full" disabled={!!busy} onClick={() => run(src)}>샘플 올리기</button>}
                  {done && <p className="okline">여권에 {src.items.length}개 신호 추가됨</p>}
                </div>
              );
            })}
          </div>
          <div className="center mt40">
            {!doneAll && <button className="pill line" onClick={onAll}>샘플 한 번에 가져오기</button>}
            <button className="pill blue" onClick={() => setStage('done')}>여권 완성하기</button>
          </div>
        </section>
      )}
      {stage === 'done' && (
        <section className="sec yellow tight">
          <Title eyebrow="Done" light="나만의 여권을" bold="받다" sub="이제 이 여권 하나로 3D 스튜디오와 모든 제휴 가게를 쓸 수 있어요." />
          <div className="done-wrap">
            <PassportBook vec={vec} small />
            <div className="done-cta">
              <button className="big-cta" onClick={() => go('studio', 'room')}><b>3D 내 방 열기</b><span>가진 물건 배치하고 추천 놓아보기 →</span></button>
              <button className="big-cta" onClick={() => go('studio', 'body')}><b>체형 넣고 입어보기</b><span>마네킹에 사이즈별로 입혀보기 →</span></button>
              <button className="big-cta" onClick={() => go('shop')}><b>가맹점 둘러보기</b><span>여권으로 입장하면 순서가 바뀌어요 →</span></button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* ---------- 여권 책자 ---------- */
export function PassportBook({ vec, isB, small, stamps = [], editable, onNudge }) {
  const empty = isEmpty(vec);
  return (
    <div className={`book ${small ? 'small' : ''}`}>
      <div className="cover">
        <svg viewBox="0 0 100 100" className="emb"><circle cx="50" cy="50" r="44" fill="none" stroke="#FFE04A" strokeWidth="2" /><circle cx="50" cy="50" r="36" fill="none" stroke="#FFE04A" strokeWidth=".8" /><path d="M50 22l6 20 20 2-16 12 6 20-16-11-16 11 6-20-16-12 20-2z" fill="#FFE04A" /></svg>
        <p className="c1">TASTE PASSPORT</p>
        <p className="c2">취향 여권</p>
        <p className="c3">No. {isB ? 'TP-B-0002' : 'TP-K-0001'}</p>
      </div>
      <div className="page">
        <p className="lbl">취향 유형 · TYPE</p>
        <p className="pname">{passportName(vec)}</p>
        <div className="kw">{topAxes(vec).map(a => <span key={a.k}>#{a.label}</span>)}</div>
        {!empty && (
          <div className="bars">
            {GROUPS.map(g => (
              <div key={g} className="bg">
                <p className="gname">{g}</p>
                {AXES.filter(a => a.g === g).map(a => (
                  <div key={a.k} className="bar">
                    <span>{a.label}</span>
                    <div className="tr"><i style={{ width: `${Math.round((vec[a.k] || 0) * 100)}%` }} /></div>
                    <em>{Math.round((vec[a.k] || 0) * 100)}</em>
                    {editable && <span className="nud"><button onClick={() => onNudge(a.k, -0.15)}>−</button><button onClick={() => onNudge(a.k, 0.15)}>+</button></span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {empty && <p className="muted">아직 비어 있어요. 여권 만들기에서 취향을 골라주세요.</p>}
        {!small && (
          <>
            <p className="lbl mt">입국 도장 · VISAS</p>
            <div className="stamps">
              {stamps.length === 0 && <span className="muted">아직 없어요</span>}
              {stamps.map((s, i) => <div className="stamp" key={s.id} style={{ '--r': `${(i % 2 ? 5 : -6)}deg` }}><b>{s.en}</b><span>{s.name}</span><small>{s.at}</small></div>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- 가맹점 ---------- */
export function Shop({ shopId, setShopId, vec, isB, which, setWhich, consents, mode, enter, leave, room, objects, body, onTry, onWear, onWish, onBuy, logs }) {
  const shop = SHOPS.find(s => s.id === shopId), on = mode[shopId], consent = consents[shopId], fashion = shopId === 'fit';
  const L = fashion ? FASHION_LABEL : LABEL;
  const [api, setApi] = useState(false);
  const list = useMemo(() => {
    const base = shop.items.map((p, i) => ({
      ...p, match: Math.round(cosine(vec, p.v) * 100), why: reasons(vec, p.v),
      fits: !fashion ? !!autoPlace(room, objects, { ...p, id: 'x' }) : null, adv: fashion ? sizeAdvice(p, body) : null,
    }));
    return on ? [...base].sort((a, b) => b.match - a.match) : base;
  }, [shop, on, vec, room, objects, body]);
  const lastLog = logs.filter(l => l.shopId === shopId).at(-1);
  return (
    <main className="shop-page">
      <div className="demo-bar">
        <span>가맹점 화면 미리보기 · 실제 쇼핑몰에 ‘취향 여권으로 입장’ 버튼이 붙은 모습이에요</span>
        <div className="seg">{SHOPS.map(s => <button key={s.id} className={s.id === shopId ? 'on' : ''} onClick={() => setShopId(s.id)}>{s.name}</button>)}</div>
        <div className="seg">{[['me', '내 여권'], ['B', '샘플 여권 B']].map(([k, l]) => <button key={k} className={which === k ? 'on' : ''} onClick={() => setWhich(k)}>{l}</button>)}</div>
      </div>
      <div className={`mall ${fashion ? 'fashion' : ''}`}>
        <div className="mall-h">
          <span className="mall-logo">{shop.en}</span>
          <nav>{(fashion ? ['NEW', 'TOP', 'BOTTOM', 'OUTER', 'SALE'] : ['NEW', '가구', '수납', '조명', '패브릭', '식물']).map(n => <span key={n}>{n}</span>)}</nav>
          <span className="mall-r">로그인 · 장바구니 0</span>
        </div>
        <div className={`tp-bar ${on ? 'on' : ''}`}>
          {on ? (
            <>
              <span className="tp-ic">✓</span>
              <div><b>{isB ? '샘플 여권 B' : passportName(vec)}</b> 님의 취향 순서로 보고 있어요{fashion && <small> · 인테리어 취향을 패션으로 번역한 참고용 순서</small>}</div>
              <button onClick={() => leave(shopId)}>여권 없이 보기</button>
            </>
          ) : (
            <>
              <span className="tp-ic"><svg viewBox="0 0 20 20"><rect x="4" y="2" width="12" height="16" rx="2.5" fill="#FFE04A" /><circle cx="10" cy="9" r="3" fill="none" stroke="#2350E6" strokeWidth="1.4" /></svg></span>
              <div><b>처음 오셨나요?</b> 취향 여권이 있으면 3초 만에 나에게 맞춘 순서로 볼 수 있어요</div>
              <button className="tp-btn" onClick={() => enter(shopId)}>취향 여권으로 입장</button>
            </>
          )}
        </div>
        <div className="mall-title"><h3>{on ? '나에게 맞춘 상품' : '전체 상품'}</h3><span>{on ? '취향 일치도순' : '인기순'} · {list.length}개</span></div>
        <div className="grid">
          {list.map((p, i) => (
            <div key={p.id} className="prod">
              <div className="p-img">
                <img src={fashion ? thumb('g' + p.id, garmentThumb(p, body)) : thumb('f' + p.id, furnitureThumb(p))} alt={p.name} />
                {on && <span className="rk">{i + 1}</span>}
                {on && <span className="mtc">{p.match}%</span>}
              </div>
              <div className="p-b">
                <p className="nm">{p.name}</p>
                <p className="pr">{won(p.price)}</p>
                {!fashion && <p className="sz">{p.w}×{p.d}×{p.h}cm</p>}
                {on && p.why.length > 0 && <div className="why">{p.why.map(k => <span key={k}>{fashion && L[k] !== LABEL[k] ? `${LABEL[k]}→${L[k]}` : L[k]}</span>)}</div>}
                {on && !fashion && consent?.scopes.room && <p className={`fitl ${p.fits ? 'y' : 'n'}`}>{p.fits ? '내 방에 들어가요' : '내 방엔 공간이 부족해요'}</p>}
                {on && fashion && consent?.scopes.body && <p className="fitl y">내 체형 추천 {p.adv.size} · {p.adv.note}</p>}
                <div className="p-act">
                  <button onClick={() => onWish(p, shopId)}>찜</button>
                  {fashion ? <button onClick={() => onWear(p)}>3D 입어보기</button> : <button onClick={() => onTry(p)}>3D 놓아보기</button>}
                  <button className="buy" onClick={() => onBuy(p, shopId)}>구매</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="api-box">
        <button className="api-t" onClick={() => setApi(a => !a)}>{api ? '▾' : '▸'} 개발자 보기 · 재정렬 API</button>
        {api && (
          <div className="api-in">
            <p>가게는 상품 목록만 보내고, 여권은 순서와 점수만 돌려줘요. 취향 원본과 체형 치수는 밖으로 나가지 않아요.</p>
            {lastLog ? (
              <div className="api-g">
                <div><small>→ 가게가 보낸 요청</small><pre>{JSON.stringify(lastLog.req, null, 2)}</pre></div>
                <div><small>← 여권이 돌려준 응답</small><pre>{JSON.stringify(lastLog.res, null, 2)}</pre></div>
              </div>
            ) : <p className="muted">여권으로 입장하면 요청과 응답이 여기에 보여요.</p>}
          </div>
        )}
      </div>
    </main>
  );
}

export function ConsentModal({ shop, onOk, onCancel }) {
  const fashion = shop.id === 'fit';
  const [sc, setSc] = useState({ taste: true, room: !fashion, body: fashion, record: true });
  const opts = [
    ['taste', fashion ? '취향 키워드 (인테리어 취향을 패션 언어로 번역)' : '취향 키워드로 상품 순서 맞추기'],
    fashion ? ['body', '추천 사이즈 (치수 원본은 보내지 않아요)'] : ['room', '방 치수 (내 방에 들어가는 상품 표시)'],
    ['record', '이 가게에서 찜·구매한 기록을 내 여권에 저장'],
  ];
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="m-top"><Logo /><span>동의 요청</span></div>
        <h3><b>{shop.name}</b>에 여권을 보여줄까요?</h3>
        {opts.map(([k, l]) => (
          <label className="chk" key={k}><input type="checkbox" checked={sc[k]} disabled={k === 'taste'} onChange={e => setSc({ ...sc, [k]: e.target.checked })} /><span>{l}</span></label>
        ))}
        <div className="give">
          <p><b>가게가 받는 것</b>상품 순서 · 일치도 점수{fashion ? ' · 추천 사이즈' : ''}</p>
          <p><b>받지 않는 것</b>취향 원본 · 저장 이미지 · 주문내역 · 사진 · 체형 치수</p>
        </div>
        <div className="m-btns"><button className="pill line" onClick={onCancel}>취소</button><button className="pill blue" onClick={() => onOk(sc)}>동의하고 입장</button></div>
      </div>
    </div>
  );
}

/* ---------- 내 여권 ---------- */
export function Passport({ vec, isB, which, setWhich, signals, toggleSignal, onNudge, manual, resetManual, stamps, consents, revoke, logs, go }) {
  const SC = { taste: '취향 키워드', room: '방 치수', body: '추천 사이즈', record: '기록 저장' };
  return (
    <main className="pp-page">
      <section className="sec grey tight">
        <Title eyebrow="My Passport" light="내 취향을" bold="들고 다니다" sub="취향은 내가 고치고, 누구에게 보여줄지도 내가 정해요." />
        <div className="center mb30"><div className="seg big">{[['me', '내 여권'], ['B', '샘플 여권 B (쿨톤·메탈·테크)']].map(([k, l]) => <button key={k} className={which === k ? 'on' : ''} onClick={() => setWhich(k)}>{l}</button>)}</div></div>
        <PassportBook vec={vec} isB={isB} stamps={stamps} editable={!isB} onNudge={onNudge} />
        {!isB && Object.keys(manual).length > 0 && <div className="center"><button className="link" onClick={resetManual}>직접 고친 값 되돌리기</button></div>}
      </section>
      {!isB && (
        <section className="sec white tight">
          <div className="two">
            <div className="panel-w">
              <h3>여권에 쌓인 신호 <span>{signals.filter(s => !s.off).length}</span></h3>
              <p className="muted">선물·가족용처럼 내 취향이 아닌 건 빼주세요</p>
              <ul className="sig">
                {signals.map(s => (
                  <li key={s.id} className={s.off ? 'off' : ''}>
                    <span className={`src s-${s.src}`}>{s.src} ×{s.w}</span><span className="sl">{s.label}</span>
                    <button onClick={() => toggleSignal(s.id)}>{s.off ? '다시 포함' : '내 취향 아님'}</button>
                  </li>
                ))}
                {signals.length === 0 && <li className="muted">아직 신호가 없어요 <button className="link" onClick={() => go('make')}>여권 만들기</button></li>}
              </ul>
            </div>
            <div className="panel-w">
              <h3>동의 관리 <span>{Object.keys(consents).length}</span></h3>
              <p className="muted">누가 언제 무엇을 받았는지 보고, 한 번에 철회해요</p>
              {Object.keys(consents).length === 0 && <p className="muted mt">아직 여권을 보여준 가게가 없어요.</p>}
              {Object.entries(consents).map(([id, c]) => {
                const s = SHOPS.find(x => x.id === id), n = signals.filter(x => x.shopId === id).length, calls = logs.filter(l => l.shopId === id).length;
                return (
                  <div className="cs" key={id}>
                    <div><b>{s.name}</b> <small>{c.at} 동의</small>
                      <div className="cs-tags">{Object.entries(c.scopes).filter(([, v]) => v).map(([k]) => <span key={k}>{SC[k]}</span>)}</div>
                      <small>API 호출 {calls}회 · 쌓인 기록 {n}개</small>
                    </div>
                    <button className="pill line red sm" onClick={() => revoke(id)}>철회하고 기록 삭제</button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
