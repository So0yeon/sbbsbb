// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   engine/icons.js — 전역 window.AtlasIcons 를 모듈 쪽에서 쓰기 위한 껍데기

   state.js 가 window.AtlasStore 를 감싸는 것과 같은 방식이다 (§2-3).
   여기서 이모지는 한 글자도 쓰지 않는다.
   ══════════════════════════════════════════════════════════════════════ */

const A = (typeof window !== 'undefined' && window.AtlasIcons) || null;

/** 화면(DOM)에 넣을 SVG 문자열 */
export function icon(name, opts){ return A ? A.svg(name, opts) : ''; }

/** 임무 한 건에 맞는 그림 이름 — 자료의 이모지는 무시한다 */
export function iconForQuest(q){ return A ? A.forQuest(q) : 'pin'; }

/** 분류(cat)에 맞는 그림 이름 */
export function iconForCat(cat){ return A ? A.forCat(cat) : 'pin'; }

/** 이모지든 이름이든 받아 그림 이름으로 */
export function iconName(v, fallback){ return A ? A.resolve(v, fallback) : (fallback || 'pin'); }

/** 자료에 남은 이모지를 글에서 걷어낸다 */
export function stripEmoji(s){ return A ? A.strip(s) : String(s == null ? '' : s); }

/** 캔버스에 그리기 (3차원 스프라이트용) */
export function drawIcon(ctx, name, size, color, width){
  if (A) A.draw(ctx, name, size, color, width);
}

export const hasIcons = !!A;
