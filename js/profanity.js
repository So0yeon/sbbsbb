// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   profanity.js — 학생이 적는 모든 글에 대한 금칙어 검사 (window.AtlasWords)

   쓰이는 곳
     · 이름 입력 (shell.js)
     · 낱말 적기 놀이 blank (engine/minigames.js)
     · 시대 마무리 탐구질문 답 (engine/ui.js)

   설계
     · 서버가 없으므로 검사도 전부 기기 안에서 한다 (§3 제약).
     · 걸러내는 것이 목적이지 벌주는 것이 아니다 — 막고 다시 쓰게 안내만 한다.
     · 낱말을 지우지 않고 '왜 막혔는지'를 알려 준다.

   교사가 고칠 수 있게 목록을 맨 위에 둔다.
   ══════════════════════════════════════════════════════════════════════ */
(function (g) {
  'use strict';

  /* ── ① 비속어 ────────────────────────────────────────────────
     정규화(띄어쓰기·반복·기호 제거)를 거친 뒤에 찾는다. */
  var PROFANITY = [
    // 대표 욕설과 흔한 변형
    '씨발','시발','씨팔','시팔','씨바','시바알','쌍놈','쌍년','썅','씨부랄','시부랄','씨불',
    'ㅅㅂ','ㅆㅂ','ㅄ','ㅂㅅ','ㅈㄹ','ㅈㄴ','ㄲㅈ','ㅗ',
    '병신','븅신','빙신','등신','밥팅',
    '지랄','지럴','개지랄',
    '좆','좃','좇','존나','존내','졸라','개존',
    '새끼','쉐끼','새키','쌔끼','자식새',
    '개새','개색','개놈','개년','개같','개소리','개판','개무시','개짜증','개빡',
    '미친놈','미친년','미친새','또라이','돌아이',
    '닥쳐','닥치라','꺼져','꺼지라','엿먹','엿이나',
    '니미','네미','애미','애비','에미','에비',
    '뒤져','뒤질','뒈져','뒈질',
    '멍청이','바보같','머저리','천치','얼간이',
    '씹새','씹창','씹할','씹년','씹놈','씨앙',
    // 성적 표현
    '섹스','야동','야설','보지','자지','딸딸이','발정','변태','성기','음란',
    // 영어권
    'fuck','fuk','fck','shit','bitch','bastard','asshole','dick','pussy','slut','whore','cunt','retard'
  ];

  /* ── ② 자신이나 남을 해치는 말 ───────────────────────────────
     욕설과 다르게 다루고, 다른 안내 문구를 준다. */
  var HARM = [
    '자살','죽어라','죽어버려','죽여버','죽일거','칼로찌','목매','폭탄테러','테러하'
  ];

  /* ── ③ 걸리면 안 되는 정상 낱말 ──────────────────────────────
     역사 학습에서 실제로 쓰는 말이 위 목록에 겹치는 경우를 먼저 뺀다. */
  var ALLOW = [
    '시발점','시발역','출발','개발','개항','개혁','개경','개성','개국','개천절','개마고원',
    '개화','개화기','개혁안','개간','개량','개설','새끼줄','새끼손가락','바보온달',
    '자지러','보지도','보지못','보지않','미친듯','미친척','성기능','성기둥'
  ];

  /* ── 정규화 ──────────────────────────────────────────────────
     띄어쓰기·기호·숫자 치환·반복 글자를 걷어내 우회를 줄인다 */
  function normalize(s){
    var t = String(s == null ? '' : s).toLowerCase();
    t = t.replace(/[\s​　]/g, '');
    t = t.replace(/[.,·・~!?@#$%^&*()\-_=+\[\]{}<>/\\|'"“”‘’:;`]/g, '');
    // 숫자·기호로 글자를 흉내 낸 것
    t = t.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a')
         .replace(/5/g, 's').replace(/7/g, 't').replace(/@/g, 'a').replace(/\$/g, 's');
    // 같은 글자 3번 이상 반복은 2번으로
    t = t.replace(/(.)\1{2,}/g, '$1$1');
    return t;
  }

  function stripAllowed(t){
    ALLOW.forEach(function (w){
      var n = normalize(w);
      if (!n) return;
      t = t.split(n).join('');
    });
    return t;
  }

  /**
   * @param {string} text 학생이 쓴 글
   * @returns {{ok:boolean, hit:(string|null), reason:(string|null), message:string}}
   */
  function check(text){
    var raw = String(text == null ? '' : text);
    if (!raw.trim()) return { ok:true, hit:null, reason:null, message:'' };

    var t = stripAllowed(normalize(raw));

    for (var i = 0; i < HARM.length; i++){
      var h = normalize(HARM[i]);
      if (h && t.indexOf(h) >= 0){
        return { ok:false, hit:HARM[i], reason:'harm',
                 message:'마음이 힘든 말이 섞였소. 다른 말로 바꾸어 적어 주시오. 힘들 때는 선생님이나 어른께 꼭 이야기하시오.' };
      }
    }
    for (var j = 0; j < PROFANITY.length; j++){
      var p = normalize(PROFANITY[j]);
      if (p && t.indexOf(p) >= 0){
        return { ok:false, hit:PROFANITY[j], reason:'profanity',
                 message:'여기에 쓸 수 없는 말이 섞였소. 고운 말로 다시 적어 주시오.' };
      }
    }
    return { ok:true, hit:null, reason:null, message:'' };
  }

  /** 걸린 글자를 ○ 로 가린 사본 — 기록에 남길 때 쓴다 */
  function mask(text){
    var out = String(text == null ? '' : text);
    PROFANITY.concat(HARM).forEach(function (w){
      if (!w) return;
      var re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      out = out.replace(re, function (m){ return new Array(m.length + 1).join('○'); });
    });
    return out;
  }

  /** 입력칸 하나에 검사를 붙인다.
   *  onBlock(result) 이 없으면 아무 것도 하지 않고 판정만 돌려준다. */
  function guard(input, onBlock){
    if (!input) return function(){ return true; };
    return function validate(){
      var r = check(input.value);
      if (!r.ok && onBlock) onBlock(r);
      return r.ok;
    };
  }

  g.AtlasWords = {
    PROFANITY: PROFANITY, HARM: HARM, ALLOW: ALLOW,
    normalize: normalize, check: check, mask: mask, guard: guard
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = g.AtlasWords;

})(typeof window !== 'undefined' ? window : globalThis);
