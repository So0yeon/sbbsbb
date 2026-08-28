/* ══════════════════════════════════════════════════════════════════════
   style-hao.mjs — 해요체·합니다체 → 사극체(하오체) 변환

   개발 전용. 빌드 타임에 한 번 돌아 js/eras/*.js 를 만든다.
   앱에는 이 코드가 들어가지 않는다.

   원칙
     - 어미만 바꾼다. 고유명사·연도·수치·인용부호 안 내용은 건드리지 않는다
     - 사실 관계와 선택지 논리는 그대로 둔다
     - 규칙으로 못 다루는 것은 tools/style-exceptions.json 에 손으로 적는다

   어미 분포는 docs/content/*.md 5,017 문장을 실측해 잡았다
   (tools/ending-report.txt).
   ══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* ── 한글 자모 ───────────────────────────────────────────────── */
const BASE = 0xAC00, NJONG = 28;
const JONG_R = 8;    // ㄹ
const JONG_B = 17;   // ㅂ

function jongOf(ch){
  const c = ch.codePointAt(0) - BASE;
  return (c >= 0 && c < 11172) ? c % NJONG : -1;
}
function stripJong(ch){
  const c = ch.codePointAt(0) - BASE;
  if (c < 0 || c >= 11172) return ch;
  return String.fromCodePoint(BASE + Math.floor(c / NJONG) * NJONG);
}
function hasJong(ch){ return jongOf(ch) > 0; }

/* ── 예외 사전 ───────────────────────────────────────────────── */
let EXC = {};
try {
  EXC = JSON.parse(fs.readFileSync(path.join(HERE, 'style-exceptions.json'), 'utf8'));
} catch(e){ EXC = {}; }

/* ── 규칙 ────────────────────────────────────────────────────── */
/* 순서가 중요하다. 긴 것부터. 문장 끝(구두점·따옴표·줄끝) 앞에서만 바꾼다. */

const TAIL = `(?=[\\s.!?…"'”’」』\\)\\]]|<|$)`;

const RULES = [
  /* ── 합니다체 ─────────────────────────────────────────── */
  ['답니다', '라오'],
  ['랍니다', '라오'],
  ['입니다', '이오'],
  ['합니다', '하오'],
  ['됩니다', '되오'],
  ['옵니다', '오오'],
  ['습니다', '소'],

  /* ── 청유·명령 ────────────────────────────────────────── */
  ['보세요', '보시오'],
  ['하세요', '하시오'],
  ['주세요', '주시오'],
  ['쓰세요', '쓰시오'],
  ['가세요', '가시오'],
  ['오세요', '오시오'],
  ['찾으세요', '찾으시오'],
  ['떠올려 보세요', '떠올려 보시오'],
  ['세요', '시오'],
  ['셔요', '시오'],
  ['마요', '마시오'],

  /* ── 감탄·확인 ────────────────────────────────────────── */
  ['맞아요', '그러하오'],
  ['그래요', '그러하오'],
  ['더라고요', '더구려'],
  ['더군요', '더구려'],
  ['는군요', '는구려'],
  ['네요', '구려'],
  ['군요', '구려'],

  /* ── 말끝에 붙는 것들 ─────────────────────────────────── */
  ['언젠가는요', '언젠가는 만나겠지요'],
  ['지만요', '지만 말이오'],
  ['만큼요', '만큼이오'],
  ['라고요', '라 하오'],
  ['고요', '소'],
  ['았거든요', '았소'],
  ['었거든요', '었소'],
  ['였거든요', '였소'],
  ['거든요', '오'],
  ['나라요', '나라이오'],
  ['대요', '다오'],
  ['래요', '라오'],
  ['내요', '내오'],
  ['써요', '쓰오'],
  ['빠요', '쁘오'],

  /* ── 과거 (축약형 먼저) ───────────────────────────────── */
  ['했어요', '하였소'],
  ['됐어요', '되었소'],
  ['봤어요', '보았소'],
  ['줬어요', '주었소'],
  ['왔어요', '왔소'],
  ['갔어요', '갔소'],
  ['졌어요', '졌소'],
  ['겼어요', '겼소'],
  ['냈어요', '냈소'],
  ['났어요', '났소'],
  ['섰어요', '섰소'],
  ['썼어요', '썼소'],
  ['탔어요', '탔소'],
  ['찼어요', '찼소'],
  ['쳤어요', '쳤소'],
  ['폈어요', '폈소'],
  ['셨어요', '셨소'],
  ['았어요', '았소'],
  ['었어요', '었소'],
  ['였어요', '였소'],

  /* ── 과거 + 지요 ──────────────────────────────────────── */
  ['했지요', '하였다오'],
  ['았지요', '았다오'],
  ['었지요', '었다오'],
  ['였지요', '였다오'],
  ['이지요', '이라오'],
  ['지요', '다오'],
  ['죠', '다오'],

  /* ── 지정사 ───────────────────────────────────────────── */
  ['이에요', '이오'],
  ['예요', '이오'],
  ['에요', '이오'],

  /* ── 의문 (ㄹ까요는 자모 규칙이 따로 처리) ────────────── */
  ['을까요', '겠소'],
  ['인가요', '이오'],
  ['나요', '오'],
  ['가요', '가오'],

  /* ── 현재 ─────────────────────────────────────────────── */
  ['해요', '하오'],
  ['돼요', '되오'],
  ['와요', '오오'],
  ['봐요', '보오'],
  ['있어요', '있소'],
  ['없어요', '없소'],
  ['않아요', '않소'],
  ['같아요', '같소'],
  ['어요', '소'],
  ['아요', '소']
];

/* `~ㄹ까요` → 종성 ㄹ 을 떼고 `겠소`  (할까요→하겠소 · 볼까요→보겠소) */
function fixLkkayo(s){
  return s.replace(new RegExp(`([가-힣])까요${TAIL}`, 'g'), (m, ch) => {
    if (jongOf(ch) === JONG_R) return stripJong(ch) + '겠소';
    return ch + '겠소';
  });
}

/* 줄임말 되돌리기 — 해요체 현재형은 모음이 줄어 있다
   져요→지오 · 여요→이오 · 겨요→기오 · 켜요→키오 · 혀요→히오 · 펴요→피오
   줘요→주오 · 워요→우오 · 봐요→보오 · 와요→오오
   (ㅕ=6 → ㅣ=20 · ㅝ=14 → ㅜ=13 · ㅘ=9 → ㅗ=8) */
const JUNG_BACK = { 6:20, 14:13, 9:8 };
function decompose(ch){
  const c = ch.codePointAt(0) - BASE;
  if (c < 0 || c >= 11172) return null;
  return { cho: Math.floor(c / 588), jung: Math.floor((c % 588) / 28), jong: c % 28 };
}
function compose(cho, jung, jong){
  return String.fromCodePoint(BASE + cho * 588 + jung * 28 + jong);
}
function fixContracted(s){
  return s.replace(new RegExp(`([가-힣])요${TAIL}`, 'g'), (m, ch) => {
    const d = decompose(ch);
    if (!d || d.jong !== 0) return m;
    const back = JUNG_BACK[d.jung];
    if (back === undefined) return m;
    return compose(d.cho, back, 0) + '오';
  });
}

/* `르` 불규칙 — 불러요→부르오 · 몰라요→모르오 · 치러요→치르오 */
function fixReu(s){
  return s.replace(new RegExp(`([가-힣])([러라])요${TAIL}`, 'g'), (m, prev) => {
    return stripJong(prev) + '르오';
  });
}

/* `~ㅂ니다` → 종성 ㅂ 을 떼고 `오`  (갑니다→가오) — 위 표에 없는 나머지 */
function fixBnida(s){
  return s.replace(new RegExp(`([가-힣])니다${TAIL}`, 'g'), (m, ch) => {
    if (jongOf(ch) === JONG_B) return stripJong(ch) + '오';
    return m;
  });
}

/* ── 본체 ────────────────────────────────────────────────────── */
export function toHao(text){
  if (text == null) return text;
  let s = String(text);
  if (!s.trim()) return s;

  // 예외 사전 (문장 전체 일치)
  if (EXC[s]) return EXC[s];

  s = fixLkkayo(s);

  for (const [from, to] of RULES){
    s = s.replace(new RegExp(from + TAIL, 'g'), to);
  }
  s = fixReu(s);
  s = fixContracted(s);
  s = fixBnida(s);

  // '거예요' 는 낱말 경계에서만 (증거예요 → 증거이오)
  s = s.replace(new RegExp(`(^|[\\s("'])거이오`, 'g'), '$1것이오');

  // 조각 예외 (부분 문자열)
  for (const [from, to] of Object.entries(EXC)){
    if (from.startsWith('~')) s = s.split(from.slice(1)).join(to);
  }
  return s;
}

/** 여러 문자열에 한꺼번에 */
export function haoAll(v){
  if (v == null) return v;
  if (Array.isArray(v)) return v.map(haoAll);
  if (typeof v === 'string') return toHao(v);
  return v;
}

/* ── 남은 해요체를 찾아낸다 (검증용) ─────────────────────────── */
const LEFTOVER = new RegExp(
  `(어요|아요|에요|예요|세요|네요|군요|지요|까요|니다|나요|해요|돼요|죠)` + TAIL, 'g'
);
export function findLeftovers(text){
  if (typeof text !== 'string') return [];
  const out = [];
  let m;
  LEFTOVER.lastIndex = 0;
  while ((m = LEFTOVER.exec(text))){
    out.push({ at: m.index, tail: m[1], around: text.slice(Math.max(0, m.index - 22), m.index + 6) });
  }
  return out;
}

export default { toHao, haoAll, findLeftovers };
