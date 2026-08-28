// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   store.js — 두 모드가 함께 쓰는 저장소와 순수 계산
   전역 스크립트(window.AtlasStore). DOM도 THREE도 모른다.

   왜 전역인가: 지도 모드는 평범한 <script>, 탐험 모드는 ES 모듈이다(§2-3).
   프로필·가방·수첩·등급은 양쪽이 함께 써야 하므로 가장 아래층에 전역으로 둔다.
   탐험 모드의 js/engine/state.js 가 이 객체를 감싸 쓴다.

   localStorage 접근은 전부 try/catch — 사생활 보호 모드에서도 앱은 동작한다(§4-5).
   ══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── 키 ─────────────────────────────────────────────────────── */
  var K = {
    profile : 'atlasStudent_v1',
    bag     : 'historyBagExplore_v1',
    relic   : 'relicBag_v1',
    stamp   : 'stampBook_v1',
    axes    : 'atlasAxes_v1',
    done    : 'atlasDone_v1',
    record  : 'atlasRecord_v1',
    mode    : 'atlasMapMode_v1'      // 'student' | 'teacher'
  };

  /* ── 안전한 저장소 ──────────────────────────────────────────── */
  function get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function set(k,v){ try { localStorage.setItem(k,v); return true; } catch(e){ return false; } }
  function del(k){ try { localStorage.removeItem(k); return true; } catch(e){ return false; } }
  function json(k, fb){
    var raw = get(k); if (!raw) return fb;
    try { return JSON.parse(raw); } catch(e){ return fb; }
  }
  function available(){
    try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; }
    catch(e){ return false; }
  }

  /* ── 프로필 ─────────────────────────────────────────────────── */
  var profile = Object.assign(
    { name:'', mascot:'두루', agreedAt:'', startedAt:'' },
    json(K.profile, {}) || {}
  );
  function saveProfile(){ set(K.profile, JSON.stringify(profile)); }

  function setName(n){
    profile.name = String(n || '').trim().slice(0, 20);
    if (!profile.startedAt) profile.startedAt = new Date().toISOString();
    saveProfile();
    return profile.name;
  }
  function agree(){
    profile.agreedAt = new Date().toISOString();
    if (!profile.startedAt) profile.startedAt = profile.agreedAt;
    saveProfile();
  }
  function hasAgreed(){ return !!profile.agreedAt; }
  /** 인쇄·화면에 쓸 이름. 없으면 빈 문자열(인쇄에서는 빈칸이 된다) */
  function displayName(){ return profile.name || ''; }
  function callName(){ return profile.name || '그대'; }

  /* ── 역사 가방 (학습 항목 도감) ─────────────────────────────── */
  var bag = new Set(json(K.bag, []) || []);
  function saveBag(){ set(K.bag, JSON.stringify(Array.from(bag))); }
  function bagHas(id){ return bag.has(id); }
  function bagAdd(id){
    if (!id || bag.has(id)) return false;
    bag.add(id); saveBag(); bumpAxis('collect', 1); return true;
  }
  function bagList(){ return Array.from(bag); }

  /* ── 유물 가방 ──────────────────────────────────────────────── */
  var relics = new Set(json(K.relic, []) || []);
  function saveRelics(){ set(K.relic, JSON.stringify(Array.from(relics))); }
  function relicHas(id){ return relics.has(id); }
  function relicAdd(id){
    if (!id || relics.has(id)) return false;
    relics.add(id); saveRelics(); bumpAxis('collect', 1); return true;
  }
  function relicList(){ return Array.from(relics); }
  function relicCount(){ return relics.size; }

  /* ── 스탬프 수첩 ────────────────────────────────────────────── */
  /* 도장 id 규약:  visit:<world>:<area>  ·  clear:<world>:<area>  ·  era:<world> */
  var stamps = json(K.stamp, {}) || {};
  function saveStamps(){ set(K.stamp, JSON.stringify(stamps)); }
  function stampHas(id){ return !!stamps[id]; }
  function stampAdd(id){
    if (!id || stamps[id]) return false;
    stamps[id] = new Date().toISOString();
    saveStamps();
    return true;
  }
  function stampAt(id){ return stamps[id] || null; }
  function stampCount(){ return Object.keys(stamps).length; }

  /* ── 완료 퀘스트 (전 시대 합산) ─────────────────────────────── */
  var doneAll = new Set(json(K.done, []) || []);
  function saveDone(){ set(K.done, JSON.stringify(Array.from(doneAll))); }
  function doneKey(world, qid){ return world + ':' + qid; }
  function doneAdd(world, qid){
    var k = doneKey(world, qid);
    if (doneAll.has(k)) return false;
    doneAll.add(k); saveDone(); return true;
  }
  function doneHas(world, qid){ return doneAll.has(doneKey(world, qid)); }
  function doneTotal(){ return doneAll.size; }
  function doneInWorld(world){
    var p = world + ':', n = 0;
    doneAll.forEach(function(k){ if (k.indexOf(p) === 0) n++; });
    return n;
  }

  /* ── 행동 축 (탐험가 유형 재료) ─────────────────────────────── */
  var AXIS_IDS = ['observe','challenge','story','collect','travel','write'];
  var axes = Object.assign(
    { observe:0, challenge:0, story:0, collect:0, travel:0, write:0 },
    json(K.axes, {}) || {}
  );
  function bumpAxis(name, n){
    if (AXIS_IDS.indexOf(name) < 0) return;
    axes[name] += (n || 1);
    set(K.axes, JSON.stringify(axes));
  }
  function axisSnapshot(){ return Object.assign({}, axes); }

  /* ── 답안 기록 (기록지 인쇄용) ──────────────────────────────── */
  var record = json(K.record, null) || { answers:[], seconds:0 };
  if (!Array.isArray(record.answers)) record.answers = [];
  function saveRecord(){ set(K.record, JSON.stringify(record)); }
  function logAnswer(e){
    var i = record.answers.findIndex(function(a){
      return a.world === e.world && a.questId === e.questId && a.question === e.question;
    });
    if (i >= 0) record.answers[i] = e; else record.answers.push(e);
    saveRecord();
  }
  function answers(){ return record.answers.slice(); }
  function addSeconds(s){ record.seconds = (record.seconds || 0) + s; saveRecord(); }
  function totalSeconds(){ return record.seconds || 0; }

  /* ── 지도 모드 학생/교사 ────────────────────────────────────── */
  function mapMode(){ return get(K.mode) === 'teacher' ? 'teacher' : 'student'; }
  function setMapMode(m){ set(K.mode, m === 'teacher' ? 'teacher' : 'student'); }

  /* ══════════════════════════════════════════════════════════════
     탐험 등급 — 발자국 5단계 (순수 함수)
     경쟁이 아니라 성취를 느끼게 하는 것이 목적이다.
     다른 학생과 비교하는 수치는 어디에도 내보내지 않는다.
     ══════════════════════════════════════════════════════════════ */
  var RANKS = [
    { i:0, icon:'step', name:'아직 첫걸음 전',     at:0,   say:'가방과 수첩을 챙겼으니, 이제 한 걸음만 떼면 되오.' },
    { i:1, icon:'paw', name:'설레는 첫걸음',       at:1,   say:'첫 발자국을 남겼구려. 여기서부터 길이 열리오.' },
    { i:2, icon:'compass', name:'궁금한 길잡이',       at:10,  say:'묻는 것이 많아졌구려. 좋은 조짐이오.' },
    { i:3, icon:'bag', name:'씩씩한 탐험가',       at:40,  say:'가방이 제법 묵직해졌소. 걸음에 힘이 붙었구려.' },
    { i:4, icon:'hourglass', name:'슬기로운 시간여행자', at:100, say:'시대와 시대 사이를 제 발로 오가는구려.' },
    { i:5, icon:'bookOpen', name:'든든한 역사지기',     at:180, say:'그대가 걸어온 길이 곧 한 권의 책이 되었소.' }
  ];

  /** @param {number} n 누적 발견 수 */
  function rankOf(n){
    n = Math.max(0, n | 0);
    var r = RANKS[0];
    for (var i = 0; i < RANKS.length; i++) if (n >= RANKS[i].at) r = RANKS[i];
    var next = RANKS[r.i + 1] || null;
    var from = r.at, to = next ? next.at : r.at;
    var progress = next ? Math.min(1, (n - from) / Math.max(1, to - from)) : 1;
    return {
      index: r.i, icon: r.icon, name: r.name, say: r.say,
      count: n, next: next ? { name: next.name, at: next.at, need: next.at - n } : null,
      progress: progress
    };
  }
  function currentRank(){ return rankOf(doneTotal() + relics.size); }

  /* ══════════════════════════════════════════════════════════════
     탐험가 유형 — 행동 6축의 상위 두 축 조합 (순수 함수)
     ══════════════════════════════════════════════════════════════ */
  var AXIS_META = {
    observe:   { icon:'eye', label:'관찰', adj:'차근차근 살펴보는',       noun:'관찰가',
                 desc:'그대는 서두르지 않고 오래 들여다보는 사람이오. 남이 지나친 자리에서 증거를 찾아내오.' },
    challenge: { icon:'gamepad', label:'도전', adj:'겁 없이 부딪쳐 보는',     noun:'도전가',
                 desc:'그대는 손으로 직접 해 보아야 아는 사람이오. 실패해도 다시 잡는 손이 빠르오.' },
    story:     { icon:'chat', label:'이야기', adj:'사람의 말을 귀담아듣는', noun:'이야기꾼',
                 desc:'그대는 길에서 만난 이들의 말을 흘려듣지 않소. 역사를 사람의 일로 읽는 눈을 가졌소.' },
    collect:   { icon:'relic', label:'수집', adj:'하나도 놓치지 않고 모으는', noun:'수집가',
                 desc:'그대는 흩어진 것을 한자리에 모아 놓고서야 마음이 놓이는 사람이오.' },
    travel:    { icon:'map', label:'탐사', adj:'발로 뛰어 멀리 가 보는',  noun:'길잡이',
                 desc:'그대는 지도 끝까지 가 보아야 직성이 풀리는 사람이오. 넓게 보는 눈이 있소.' },
    write:     { icon:'pen', label:'기록', adj:'생각을 글로 남기는',      noun:'기록가',
                 desc:'그대는 본 것을 제 말로 적어 두는 사람이오. 그 글이 뒷사람의 길이 되오.' }
  };

  var TYPE_MIN = 10;   // 표본이 이보다 적으면 유형을 확정하지 않는다

  function typeOf(a){
    a = a || axes;
    var list = AXIS_IDS.map(function(id){ return { id:id, n:a[id] || 0 }; });
    var total = list.reduce(function(s,x){ return s + x.n; }, 0);
    var sorted = list.slice().sort(function(x,y){ return y.n - x.n || AXIS_IDS.indexOf(x.id) - AXIS_IDS.indexOf(y.id); });

    if (total < TYPE_MIN){
      return {
        settled:false, total:total,
        name:'아직 살펴보는 중이오',
        desc:'조금 더 걸어 보시오. 그대가 어떤 탐험가인지 곧 드러날 것이오.',
        top:sorted.slice(0,2).map(function(x){ return x.id; }),
        axes:list
      };
    }
    var a1 = AXIS_META[sorted[0].id], a2 = AXIS_META[sorted[1].id];
    var name = (sorted[1].n > 0 && sorted[1].id !== sorted[0].id)
      ? (a1.adj + ' ' + a2.noun)
      : (a1.adj + ' ' + a1.noun);
    return {
      settled:true, total:total, name:name, desc:a1.desc,
      top:[sorted[0].id, sorted[1].id], axes:list
    };
  }

  /* ── 전체 삭제 ──────────────────────────────────────────────── */
  function wipeAll(){
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        if (!k) continue;
        if (k.indexOf('atlas') === 0 || /Explore_v1$/.test(k) ||
            k === K.bag || k === K.relic || k === K.stamp) keys.push(k);
      }
    } catch(e){ /* 접근 불가 환경 */ }
    keys.forEach(del);

    bag.clear(); relics.clear(); doneAll.clear();
    Object.keys(stamps).forEach(function(k){ delete stamps[k]; });
    AXIS_IDS.forEach(function(id){ axes[id] = 0; });
    record.answers = []; record.seconds = 0;
    profile.name = ''; profile.agreedAt = ''; profile.startedAt = '';
  }

  /* ── 내보내기 ───────────────────────────────────────────────── */
  global.AtlasStore = {
    KEYS: K, available: available,
    get: get, set: set, del: del, json: json,

    profile: profile, setName: setName, agree: agree, hasAgreed: hasAgreed,
    displayName: displayName, callName: callName,

    bag: bag, bagAdd: bagAdd, bagHas: bagHas, bagList: bagList,
    relicAdd: relicAdd, relicHas: relicHas, relicList: relicList, relicCount: relicCount,
    stampAdd: stampAdd, stampHas: stampHas, stampAt: stampAt, stampCount: stampCount, stamps: stamps,

    doneAdd: doneAdd, doneHas: doneHas, doneTotal: doneTotal, doneInWorld: doneInWorld,

    AXIS_IDS: AXIS_IDS, AXIS_META: AXIS_META, bumpAxis: bumpAxis, axes: axes, axisSnapshot: axisSnapshot,

    logAnswer: logAnswer, answers: answers, addSeconds: addSeconds, totalSeconds: totalSeconds,

    mapMode: mapMode, setMapMode: setMapMode,

    RANKS: RANKS, rankOf: rankOf, currentRank: currentRank,
    TYPE_MIN: TYPE_MIN, typeOf: typeOf,

    wipeAll: wipeAll
  };

  /* Node 테스트에서도 쓸 수 있게 */
  if (typeof module !== 'undefined' && module.exports) module.exports = global.AtlasStore;

})(typeof window !== 'undefined' ? window : globalThis);
