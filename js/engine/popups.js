// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   popups.js — 열려 있는 창을 한 곳에서 센다

   왜 필요한가 (요구 4)
     탐험 모드에는 창이 여럿이다 — 임무, 위치, 시대 마무리, 탐구질문, 가방.
     창마다 따로 닫는 규칙을 두면 어떤 창은 Esc 로 닫히고 어떤 창은 안 닫힌다.
     여기에 나중에 열린 것이 위로 쌓이게 두고, 키 하나로 맨 위만 닫는다.

     ST.questOpen 하나로는 임무 창밖에 알 수 없어서, 창이 떠 있는데도
     E 키가 뒤에 있는 세상에 닿는 일이 있었다. anyOpen() 이 그것을 막는다.
   ══════════════════════════════════════════════════════════════════════ */

const stack = [];      // [{ id, close }] — 뒤가 맨 위

/** 창이 열렸다고 알린다. 같은 id 는 한 번만 쌓인다 */
export function pushPopup(id, close){
  const i = stack.findIndex(p => p.id === id);
  if (i >= 0) stack.splice(i, 1);
  stack.push({ id, close });
}

/** 창이 닫혔다고 알린다 */
export function popPopup(id){
  const i = stack.findIndex(p => p.id === id);
  if (i >= 0) stack.splice(i, 1);
}

export function anyOpen(){ return stack.length > 0; }
export function topPopup(){ return stack.length ? stack[stack.length - 1] : null; }
export function isOpen(id){ return stack.some(p => p.id === id); }

/** 맨 위 창을 닫는다. 닫았으면 true */
export function closeTop(){
  const p = stack[stack.length - 1];
  if (!p) return false;
  try { p.close(); } catch(e){ /* 닫기가 실패해도 쌓인 것은 비운다 */ }
  popPopup(p.id);
  return true;
}

/** 전부 닫는다 (시대 전환 등) */
export function closeAllPopups(){
  while (stack.length) closeTop();
}
