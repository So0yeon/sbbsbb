// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   constants.js — 분류 색·라벨, 시대 id 매핑, 문체 문구
   MASTER.md §4-6 · §4-4
   ══════════════════════════════════════════════════════════════════════ */

/* 분류 6종 고정 (§4-6). 늘리지 말 것 — 필터 UI와 도감이 6개를 전제로 한다 */
export const CATS = {
  relic:    { label:'유물·유적',  color:'#7B6A55' },
  person:   { label:'인물',       color:'#3F6B8C' },
  culture:  { label:'문화',       color:'#3E8A78' },
  event:    { label:'사건',       color:'#A8534F' },
  exchange: { label:'교류',       color:'#7C6BA8' },
  life:     { label:'생활문화',   color:'#8A7B4E' }
};
export const CAT_ORDER = ['relic','person','culture','event','exchange','life'];

export function catColor(c){ return (CATS[c] && CATS[c].color) || '#7B6A55'; }
export function catLabel(c){ return (CATS[c] && CATS[c].label) || '기타'; }

/* 지도 모드(ERAS.id) → 탐험(WORLDS key) (§4-4) */
export const ERA_ID_MAP = {
  paleo:'paleo',   neo:'neolithic',  bronze:'bronze',   three:'samguk',
  unified:'unified-silla',           later:'later',     goryeo:'goryeo',
  joseon_e:'joseon-early',           joseon_l:'joseon-late',
  open:'open-port', colonial:'colonial', liberation:'war', war:'war'
};
export const WORLD_TO_ERA = Object.fromEntries(
  Object.entries(ERA_ID_MAP).map(([e,w]) => [w,e])
);

/* 마스코트 */
export const MASCOT = {
  name: '두루',
  species: '두루미',
  bodyColor: '#F4F1E6',
  wingColor: '#D8D2C0',
  crestColor: '#C25B4F',
  beakColor: '#E0A64B',
  legColor: '#6E6A5E'
};

/* 하오체 UI 문구 — 탐험 모드 전용 (§D1) */
export const SAY = {
  bagAdded:      (t) => `"${t}"을(를) 역사 가방에 담았소`,
  relicAdded:    (n) => `${n}을(를) 유물 주머니에 넣었소`,
  stampVisit:    (n) => `${n}에 발을 디딘 도장을 찍었소`,
  stampClear:    (n) => `${n}을(를) 모두 둘러본 도장을 찍었소`,
  stampEra:      (n) => `${n}을(를) 마친 도장을 찍었소`,
  rankUp:        (n) => `한 걸음 더 나아갔구려 — ${n}`,
  nearMarker:    '가까이 왔소. 조사해 보시오',
  gateConfirm:   '이 길로 가겠소?',
  npcMore:       '더 들어 보시오',
  saveFail:      '기록을 저장할 수 없는 환경이오. 탐험은 그대로 이어 가도 되오',
  noWebGL:       '이 기기에서는 3차원 화면을 열 수 없습니다. 지도 모드를 이용해 주세요.'
};
