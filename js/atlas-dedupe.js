// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   atlas-dedupe.js — 겹치는 항목 스위치 (MASTER §7-7 · docs/11-DUPLICATES.md)

   실물을 대조해 보니 `docs/11-DUPLICATES.md` 의 46쌍은
   **CONTENT 안의 중복 항목이 아니라, 예전 사진 id(hb_*) ↔ 학습 항목 id 의 대응표**였습니다.
   CONTENT 146개의 id 는 모두 고유합니다. 그래서 기본값 keep-both 에서
   숨겨지는 항목은 하나도 없습니다.

   그래도 스위치는 남겨 둡니다 — 나중에 같은 유물이 두 이름으로 들어오면
   원본을 고치지 말고 여기서만 고르면 됩니다.

       DUP_MODE = 'keep-both' | 'keep-ours' | 'keep-theirs'

   ⚠️ keep-ours 로 바꾸면 탐험 퀘스트가 theirs 쪽 contentId 를 참조하던 연결이
      끊깁니다. 바꾸기 전에 탐험 모드를 확인하세요.
   ══════════════════════════════════════════════════════════════════════ */
(function (g) {
  'use strict';

  var DUP_MODE = 'keep-both';

  /* [ 우리 id, 저쪽 id ] — 실제로 겹치는 CONTENT 항목이 생기면 여기에 적습니다 */
  var PAIRS = [];

  /* 예전 사진 id → 학습 항목 id (11-DUPLICATES.md).
     사진 파일 이름은 이미 학습 항목 id 를 쓰므로 화면에서는 쓰지 않지만,
     옛 자료를 다시 만날 때를 위해 남겨 둡니다. */
  var OLD_PHOTO_ID = {
    hb_50982713:'jeongok', hb_30687085:'bitsal', hb_43785609:'bipa',
    hb_33610823:'ganghwa-dolmen', hb_68979560:'dangun', hb_9215304:'dangun',
    hb_23444134:'muryeong', hb_3952844:'mireuksa', hb_71497777:'geumdong',
    hb_39651435:'gwanggaeto', hb_42726041:'muyongchong', hb_40111140:'gwanggaeto',
    hb_50078045:'cheomseongdae', hb_54725302:'geumgwan', hb_18964888:'suro',
    hb_13193622:'gaya-iron', hb_75717042:'bulguksa', hb_69204044:'seokguram',
    hb_66576255:'mugujeonggwang', hb_88138414:'daejoyeong', hb_22047484:'cheongja',
    hb_56800902:'palman', hb_11634954:'jikji', hb_59304179:'seohee',
    hb_65844808:'ganggamchan', hb_36774372:'sambyeolcho', hb_43464725:'sejong',
    hb_9384606:'gwahak', hb_75338454:'gwahak', hb_84959535:'baekja',
    hb_22180013:'gyeongbok'
  };

  var hidden = {};

  function apply() {
    hidden = {};
    if (DUP_MODE === 'keep-both') return;
    PAIRS.forEach(function (p) {
      if (DUP_MODE === 'keep-ours') hidden[p[1]] = 1;
      else if (DUP_MODE === 'keep-theirs') hidden[p[0]] = 1;
    });
  }

  apply();

  g.ATLAS_DUP_HIDDEN = hidden;
  g.AtlasDedupe = {
    get mode() { return DUP_MODE; },
    set mode(v) { DUP_MODE = v; apply(); g.ATLAS_DUP_HIDDEN = hidden; },
    PAIRS: PAIRS, OLD_PHOTO_ID: OLD_PHOTO_ID, apply: apply
  };

})(typeof window !== 'undefined' ? window : globalThis);
