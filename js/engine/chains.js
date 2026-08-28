// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   chains.js — 시대별 미션 시퀀스 등록표

   ── 다른 시대를 넣는 방법 (요청서 §11-7) ─────────────────────────────
   1. `chain-<시대>.js` 를 하나 만들고 `chain-neolithic.js` 와 같은 모양으로
      { id, era, saveKey, names, steps:[...], ending:{ slots:[...] } } 를 내보낸다.
   2. steps 의 각 걸음에 act 를 골라 적는다
      (note · explore · dialogue · combine · observe · deduce · minigame · choice).
      관찰은 solve, 놀이는 game:{ tpl:'sequence'|'sort'|'timed'|'restore'|'compare'|'decode' }.
   3. 학습 항목과 이어지는 걸음에 `contentId` 를 적는다. 그 걸음을 마치면
      지도 모드의 그 항목이 열린다.
   4. 아래 CHAINS 에 한 줄 더한다. 엔진은 고치지 않는다.
   ──────────────────────────────────────────────────────────────────────

   엔진(quest-engine.js)은 시대를 모른다. 자료만 갈아 끼우면 그대로 돈다.
   ══════════════════════════════════════════════════════════════════════ */
import { CHAIN_NEOLITHIC } from './chain-neolithic.js';

export const CHAINS = {
  'neolithic': CHAIN_NEOLITHIC
};

/** 그 시대의 미션 시퀀스. 없으면 null (그 시대는 예전처럼 자유 탐험만 한다) */
export function chainOf(worldId){ return CHAINS[worldId] || null; }

/** 미션 시퀀스가 있는 시대인가 */
export function hasChainFor(worldId){ return !!CHAINS[worldId]; }
