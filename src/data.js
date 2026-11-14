export const AXES = [
  { k: 'warm', label: '웜톤', g: '색감' },
  { k: 'cool', label: '쿨톤', g: '색감' },
  { k: 'mono', label: '모노톤', g: '색감' },
  { k: 'vivid', label: '비비드', g: '색감' },
  { k: 'wood', label: '우드', g: '소재' },
  { k: 'metal', label: '메탈', g: '소재' },
  { k: 'fabric', label: '패브릭', g: '소재' },
  { k: 'minimal', label: '미니멀', g: '무드' },
  { k: 'cozy', label: '아늑함', g: '무드' },
  { k: 'vintage', label: '빈티지', g: '무드' },
  { k: 'tech', label: '테크', g: '무드' },
];
export const GROUPS = ['색감', '소재', '무드'];
export const LABEL = Object.fromEntries(AXES.map(a => [a.k, a.label]));
// 패션몰에서는 같은 축을 패션 언어로 번역해서 보여줌
export const FASHION_LABEL = { ...LABEL, wood: '어스톤·내추럴', metal: '광택·하드 소재', fabric: '니트·린넨', tech: '테크웨어' };

export const SWIPES = [
  { id: 's1', t: '원목 데스크 셋업', v: { warm: .9, wood: 1, minimal: .6 }, wall: '#efe7dc', floor: '#c49a6c', items: [['desk', '#b98a5a', 100, 55, 73], ['chair', '#7a5a3c', 45, 48, 82], ['plant', '#4f7a4a', 40, 40, 100]] },
  { id: 's2', t: '화이트 미니멀 원룸', v: { mono: .9, minimal: 1 }, wall: '#f5f4f1', floor: '#e3dfd8', items: [['cabinet', '#f0eeea', 60, 40, 90], ['bed', '#f4f2ee', 100, 150, 40], ['lamp', '#d9d9d9', 28, 28, 140]] },
  { id: 's3', t: '라탄과 식물', v: { warm: .8, wood: .6, fabric: .3, cozy: .9 }, wall: '#efe4cf', floor: '#d6bd93', items: [['sidetable', '#c9a26b', 45, 45, 50], ['plant', '#4f7a4a', 50, 50, 140], ['beanbag', '#d8c3a5', 70, 70, 60], ['plant', '#5f8c55', 36, 36, 90]] },
  { id: 's4', t: '블랙 메탈 데스크', v: { mono: .9, metal: 1, tech: .8 }, wall: '#3b3d42', floor: '#5b5d63', items: [['desk', '#222327', 110, 60, 73], ['hanger', '#1d1d20', 90, 40, 150], ['lamp', '#2b2b2b', 26, 26, 130]] },
  { id: 's5', t: '빈티지 카페 무드', v: { warm: .9, wood: .8, vintage: 1 }, wall: '#e5d3b8', floor: '#8a5a3a', items: [['drawer', '#7a4a2c', 80, 40, 80], ['chair', '#6b3f22', 44, 46, 82], ['shelf', '#8a5a3a', 70, 28, 120]] },
  { id: 's6', t: '네온 게이밍 룸', v: { vivid: 1, tech: 1, metal: .3 }, wall: '#25213a', floor: '#3a3450', items: [['gaming', '#8b5cff', 90, 30, 120], ['desk', '#18161f', 110, 60, 73], ['chair', '#ff4fa0', 50, 50, 100]] },
  { id: 's7', t: '쿨톤 호텔 침실', v: { cool: 1, fabric: .7, minimal: .7 }, wall: '#dfe5ec', floor: '#a9b4bf', items: [['bed', '#8d9cb0', 120, 160, 45], ['sidetable', '#c8d0d9', 40, 40, 50], ['lamp', '#b8c0c8', 26, 26, 140]] },
  { id: 's8', t: '컬러풀 레트로', v: { vivid: .9, vintage: .9 }, wall: '#fbe3c4', floor: '#f07a5a', items: [['sofa', '#2f7f6f', 75, 75, 75], ['cabinet', '#ffb347', 60, 40, 80], ['rug', '#4a6fd8', 120, 120, 1]] },
  { id: 's9', t: '패브릭 소파 코너', v: { warm: .8, fabric: 1, cozy: 1 }, wall: '#f1e7da', floor: '#cdb497', items: [['sofa', '#d8c3a5', 80, 80, 75], ['rug', '#e9dcc8', 130, 130, 1], ['lamp', '#f0e6d6', 28, 28, 140]] },
  { id: 's10', t: '스틸 & 글라스', v: { cool: .9, metal: 1, minimal: .8 }, wall: '#e6eaee', floor: '#b8c0c8', items: [['hanger', '#b8c0c8', 90, 40, 150], ['cabinet', '#d3d9df', 60, 40, 90], ['lamp', '#c0c6cc', 26, 26, 150]] },
];

export const IMPORTS = [
  {
    id: 'order', icon: '🧾', title: '주문내역 캡처', desc: '쇼핑앱 주문내역 화면을 캡처해서 올려요', w: 3, src: '구매',
    steps: ['OCR로 상품명 읽는 중', '공식 쇼핑 API로 상품 매칭 중', '비전 AI로 색·소재·무드 추출 중'],
    items: [
      { raw: '오크 원목 선반 3단 (화이트오크) 1개', label: '오크 원목 3단 선반', v: { warm: .8, wood: 1, minimal: .7 } },
      { raw: '라탄 펜던트 조명 40cm 1개', label: '라탄 펜던트 조명', v: { warm: .8, wood: .5, cozy: .8 } },
      { raw: '린넨 침구세트 SS 베이지 1개', label: '베이지 린넨 침구', v: { warm: .7, fabric: 1, cozy: .7, minimal: .4 } },
      { raw: '무선 기계식 키보드 화이트 1개', label: '화이트 기계식 키보드', v: { mono: .6, tech: .8, minimal: .4 } },
    ],
  },
  {
    id: 'saved', icon: '📌', title: '저장 이미지', desc: 'SNS에서 저장해 둔 사진 묶음을 올려요', w: 2, src: '저장',
    steps: ['이미지 24장 불러오는 중', '반복되는 색감·무드 찾는 중', '취향 속성으로 정리 중'],
    items: [
      { raw: '9장 · 따뜻한 우드톤 거실', label: '우드톤 거실', v: { warm: 1, wood: .9, cozy: .6 } },
      { raw: '7장 · 여백 많은 화이트 공간', label: '여백 많은 화이트 공간', v: { mono: .7, minimal: 1 } },
      { raw: '5장 · 베이지 니트·린넨 룩', label: '베이지 니트·린넨 룩', v: { warm: .8, fabric: .9, cozy: .6, minimal: .4 } },
      { raw: '3장 · 빈티지 원목 가구', label: '빈티지 원목 가구', v: { warm: .7, wood: .9, vintage: .8 } },
    ],
  },
  {
    id: 'photo', icon: '📷', title: '내 방·물건 사진', desc: '지금 내 방과 자주 입는 옷 사진을 올려요', w: 2, src: '사진',
    steps: ['사진 속 물건 찾는 중', '얼굴·개인정보 가리는 중', '물건별 속성 추출 중'],
    items: [
      { raw: '책상 · 원목 상판, 라운드 모서리', label: '원목 라운드 책상', v: { warm: .8, wood: 1, minimal: .6 } },
      { raw: '의자 · 베이지 패브릭', label: '베이지 패브릭 의자', v: { warm: .6, fabric: .9, cozy: .5 } },
      { raw: '옷 · 오트밀 니트, 아이보리 팬츠', label: '오트밀 니트 코디', v: { warm: .9, fabric: .8, cozy: .6, minimal: .5 } },
    ],
  },
];

export const INTERIOR = [
  { id: 'p1', name: '오크 3단 선반', kind: 'shelf', price: 129000, w: 80, d: 30, h: 110, color: '#b98a5a', v: { warm: .9, wood: 1, minimal: .6 } },
  { id: 'p2', name: '라탄 사이드테이블', kind: 'sidetable', price: 69000, w: 45, d: 45, h: 50, color: '#c9a26b', v: { warm: .8, wood: .6, fabric: .3, cozy: .8 } },
  { id: 'p3', name: '블랙 스틸 행거', kind: 'hanger', price: 89000, w: 100, d: 45, h: 160, color: '#2b2b2b', v: { mono: .9, metal: 1, minimal: .5, tech: .3 } },
  { id: 'p4', name: '화이트 수납장', kind: 'cabinet', price: 99000, w: 60, d: 40, h: 90, color: '#eeeae2', v: { mono: .7, minimal: 1 } },
  { id: 'p5', name: 'RGB 게이밍 선반', kind: 'gaming', price: 159000, w: 90, d: 30, h: 120, color: '#6b4cff', v: { vivid: 1, tech: 1, metal: .5 } },
  { id: 'p6', name: '베이지 패브릭 빈백', kind: 'beanbag', price: 119000, w: 80, d: 80, h: 70, color: '#d8c3a5', v: { warm: .7, fabric: 1, cozy: 1 } },
  { id: 'p7', name: '빈티지 원목 서랍장', kind: 'drawer', price: 239000, w: 90, d: 45, h: 80, color: '#8a5a3a', v: { warm: .8, wood: 1, vintage: 1 } },
  { id: 'p8', name: '크롬 플로어 조명', kind: 'lamp', price: 79000, w: 30, d: 30, h: 150, color: '#b8c0c8', v: { cool: .8, metal: .9, minimal: .6, tech: .4 } },
  { id: 'p9', name: '컬러 블록 러그', kind: 'rug', price: 89000, w: 140, d: 200, h: 1, color: '#f07a5a', v: { vivid: .9, fabric: .8, vintage: .4 } },
  { id: 'p10', name: '웜 울 러그', kind: 'rug', price: 99000, w: 120, d: 170, h: 1, color: '#cbb59a', v: { warm: .8, fabric: .9, cozy: .7, minimal: .4 } },
  { id: 'p11', name: '쿨그레이 1인 소파', kind: 'sofa', price: 289000, w: 75, d: 80, h: 75, color: '#8d97a3', v: { cool: .9, fabric: .9, minimal: .5, cozy: .5 } },
  { id: 'p12', name: '몬스테라 화분', kind: 'plant', price: 49000, w: 50, d: 50, h: 140, color: '#4f7a4a', v: { warm: .4, cozy: .7, wood: .3 } },
];

const TOP = { S: { chest: 96 }, M: { chest: 104 }, L: { chest: 112 }, XL: { chest: 120 } };
const OUT = { S: { chest: 104 }, M: { chest: 112 }, L: { chest: 120 }, XL: { chest: 128 } };
const PANTS = { S: { waist: 68 }, M: { waist: 74 }, L: { waist: 80 }, XL: { waist: 86 } };
export const FASHION = [
  { id: 'f1', name: '오트밀 니트 가디건', slot: 'outer', sleeve: 'long', length: 'short', price: 59000, color: '#d9c7ab', sizes: { S: { chest: 100 }, M: { chest: 108 }, L: { chest: 116 }, XL: { chest: 124 } }, v: { warm: .9, fabric: .8, cozy: .9, minimal: .4 } },
  { id: 'f2', name: '블랙 테크 바람막이', slot: 'outer', sleeve: 'long', length: 'hip', price: 129000, color: '#26282c', collar: true, sizes: OUT, v: { mono: .8, metal: .6, tech: 1 } },
  { id: 'f3', name: '브라운 코듀로이 셔츠', slot: 'top', sleeve: 'long', length: 'reg', price: 69000, color: '#7b5236', collar: true, sizes: TOP, v: { warm: .8, vintage: .9, wood: .4 } },
  { id: 'f4', name: '화이트 오버핏 셔츠', slot: 'top', sleeve: 'long', length: 'hip', cut: 'over', price: 49000, color: '#f1efea', collar: true, sizes: { S: { chest: 108 }, M: { chest: 116 }, L: { chest: 124 }, XL: { chest: 132 } }, v: { mono: .7, minimal: 1 } },
  { id: 'f5', name: '코랄 그래픽 티', slot: 'top', sleeve: 'short', length: 'reg', price: 35000, color: '#ff6f61', sizes: { S: { chest: 94 }, M: { chest: 100 }, L: { chest: 106 }, XL: { chest: 112 } }, v: { vivid: 1, tech: .4, vintage: .3 } },
  { id: 'f6', name: '아이보리 린넨 팬츠', slot: 'bottom', cut: 'wide', price: 65000, color: '#ece2cf', sizes: PANTS, v: { warm: .7, fabric: .9, minimal: .7 } },
  { id: 'f7', name: '다크 데님 스트레이트', slot: 'bottom', cut: 'straight', price: 79000, color: '#2f3e56', sizes: { S: { waist: 70 }, M: { waist: 76 }, L: { waist: 82 }, XL: { waist: 88 } }, v: { cool: .7, fabric: .6, minimal: .5, vintage: .3 } },
  { id: 'f8', name: '네이비 울 코트', slot: 'outer', sleeve: 'long', length: 'long', price: 199000, color: '#2d3a55', collar: true, sizes: OUT, v: { cool: .8, fabric: .7, minimal: .6 } },
  { id: 'f9', name: '차콜 와이드 슬랙스', slot: 'bottom', cut: 'wide', price: 69000, color: '#45484e', sizes: PANTS, v: { mono: .8, minimal: .8, fabric: .4 } },
];
export const SLOT_LABEL = { top: '상의', bottom: '하의', outer: '아우터' };

export const SHOPS = [
  { id: 'living', name: '무드리빙', en: 'MOODLIVING', kind: '인테리어 자사몰 (가상)', items: INTERIOR },
  { id: 'fit', name: '데일리핏', en: 'DAILYFIT', kind: '패션 자사몰 (가상)', items: FASHION },
];

export const SAMPLE_B = { cool: .9, mono: .6, metal: 1, tech: 1, minimal: .5 };

export const DEFAULT_ROOM = { w: 320, d: 360, h: 240 };
export const DEFAULT_OBJECTS = [
  { id: 'o1', name: '침대', kind: 'bed', w: 110, d: 200, h: 45, color: '#e6ddd0', x: 0, z: 0, rot: 0 },
  { id: 'o2', name: '책상', kind: 'desk', w: 120, d: 60, h: 73, color: '#c49a6c', x: 200, z: 0, rot: 0 },
  { id: 'o3', name: '의자', kind: 'chair', w: 45, d: 48, h: 85, color: '#6b5a4a', x: 237, z: 72, rot: Math.PI },
];

export const BODY_PRESETS = [
  { id: 'f', label: '여성 기본', b: { height: 163, shoulder: 38, chest: 84, waist: 66, hip: 92, leg: 1 } },
  { id: 'm', label: '남성 기본', b: { height: 175, shoulder: 45, chest: 96, waist: 80, hip: 96, leg: 1 } },
  { id: 'slim', label: '슬림', b: { height: 170, shoulder: 40, chest: 82, waist: 64, hip: 86, leg: 1.03 } },
  { id: 'fit', label: '탄탄', b: { height: 178, shoulder: 48, chest: 104, waist: 80, hip: 98, leg: 1 } },
  { id: 'curve', label: '곡선형', b: { height: 162, shoulder: 39, chest: 94, waist: 70, hip: 104, leg: 0.98 } },
];
export const BODY_FIELDS = [
  ['height', '키', 145, 200, 1, 'cm'], ['shoulder', '어깨너비', 32, 54, 1, 'cm'], ['chest', '가슴둘레', 72, 124, 1, 'cm'],
  ['waist', '허리둘레', 56, 112, 1, 'cm'], ['hip', '엉덩이둘레', 78, 124, 1, 'cm'], ['leg', '다리 비율', 0.9, 1.1, 0.01, ''],
];
export const ADD_KINDS = [['box', '상자'], ['cabinet', '수납장'], ['chair', '의자'], ['sidetable', '협탁'], ['shelf', '선반']];
