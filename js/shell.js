// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   shell.js — 앱 껍데기 (전역 스크립트)

   인트로 흐름 · 모드 전환 · 큰 시트(유물 가방·수첩·탐험 기록·출처·방침·설정)

   문체 (설계 §1)
     화면 문구는 하오체, 개인정보·오류 안내는 표준말.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var S = window.AtlasStore;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /* ══════════════════════════════════════════════════════════
     인트로
     ══════════════════════════════════════════════════════════ */
  var STEPS = ['cover', 'consent', 'name', 'kit', 'mode'];

  function step(name) {
    STEPS.forEach(function (s) {
      var el = document.querySelector('.intro-step[data-step="' + s + '"]');
      if (el) el.classList.toggle('on', s === name);
    });
    if (name === 'name') {
      var i = $('nameInput');
      if (i) { i.value = S.profile.name || ''; setTimeout(function () { i.focus(); }, 60); }
    }
    if (name === 'kit') {
      var g = $('kitGreetName');
      if (g) g.textContent = S.displayName() || '그대';
    }
  }

  /* 선 아이콘 한 조각 (js/icons.js) — 이모지를 쓰지 않는다 (요구 2) */
  function ic(name, size) {
    return window.AtlasIcons ? window.AtlasIcons.svg(name, { size: size || 18 }) : '';
  }

  /* 이름에 쓸 수 없는 말이 섞였는지 본다 (요구 6).
     막기만 하고 벌주지 않는다 — 무엇이 문제인지 알려 주고 다시 쓰게 한다 */
  function nameOk(value) {
    var note = $('nameWarn');
    if (!window.AtlasWords) return true;
    var r = window.AtlasWords.check(value);
    if (note) {
      note.textContent = r.ok ? '' : r.message;
      note.classList.toggle('on', !r.ok);
    }
    if (!r.ok) $('nameInput').focus();
    return r.ok;
  }

  function bindIntro() {
    $('coverNext').addEventListener('click', function () {
      step(S.hasAgreed() ? 'name' : 'consent');
    });

    $('consentCheck').addEventListener('change', function (e) {
      $('consentNext').disabled = !e.target.checked;
    });
    $('consentBack').addEventListener('click', function () { step('cover'); });
    $('consentNext').addEventListener('click', function () {
      S.agree();
      step('name');
    });

    $('nameNext').addEventListener('click', function () {
      if (!nameOk($('nameInput').value)) return;
      S.setName($('nameInput').value);
      step('kit');
    });
    $('nameSkip').addEventListener('click', function () {
      S.setName('');
      step('kit');
    });
    $('nameInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); $('nameNext').click(); }
    });

    $('kitNext').addEventListener('click', function () { step('mode'); });

    $('startExploreBtn').addEventListener('click', function () { toExplore(); });
    $('startMapBtn').addEventListener('click', function () { toMap(); });

    $('introPrivacyLink').addEventListener('click', openPrivacy);
    $('consentPrivacyLink').addEventListener('click', openPrivacy);
    $('introCreditsLink').addEventListener('click', openCredits);
    $('modeRankLink').addEventListener('click', openRank);
    $('modeSettingsLink').addEventListener('click', openSettings);
  }

  /* ══════════════════════════════════════════════════════════
     모드 전환 (§4-4 연결 지점)
     ══════════════════════════════════════════════════════════ */
  /* 전체화면 — 탐험·지도에서는 켜고, 홈으로 나오면 끈다.
     브라우저는 사람이 누른 동작에서만 전체화면을 허용하므로
     모드 전환(단추 클릭)에서만 부른다. 거절당해도 앱은 그대로 돈다. */
  function setFullscreen(on) {
    // 자가 검사(헤드리스)에서는 건드리지 않는다 — 창 관리자가 없어 렌더러가 죽는다
    if (new URLSearchParams(location.search).get('selftest')) return;
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    var out = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    var now = document.fullscreenElement || document.webkitFullscreenElement || null;
    try {
      if (on && !now && req) {
        var p = req.call(el);
        if (p && p.catch) p.catch(function () { /* 사용자가 막았거나 기기가 지원하지 않음 */ });
      } else if (!on && now && out) {
        var q = out.call(document);
        if (q && q.catch) q.catch(function () {});
      }
    } catch (e) { /* 전체화면은 있으면 좋은 것이지 없으면 안 되는 것이 아니다 */ }
  }

  function showOnly(which) {
    var intro = $('intro'), app = $('app'), ex = $('explore');
    intro.classList.toggle('off', which !== 'intro');
    app.classList.toggle('on', which === 'map');
    app.setAttribute('aria-hidden', which === 'map' ? 'false' : 'true');
    ex.classList.toggle('on', which === 'explore');
    ex.setAttribute('aria-hidden', which === 'explore' ? 'false' : 'true');
    if (window.AtlasExplore) window.AtlasExplore.pause(which !== 'explore');
    setFullscreen(which !== 'intro');
  }

  function toExplore(eraId) {
    showOnly('explore');
    var go = function () { window.AtlasExplore.start(eraId); };
    if (window.AtlasExplore) go();
    else document.addEventListener('atlas:explore-ready', go, { once: true });
  }

  function toMap(eraId) {
    showOnly('map');
    if (window.AtlasMap) window.AtlasMap.open(eraId);
  }

  function toIntro() {
    showOnly('intro');
    step('mode');
  }

  /* ══════════════════════════════════════════════════════════
     큰 시트
     ══════════════════════════════════════════════════════════ */
  var SHEETS = ['relicSheet', 'stampSheet', 'rankSheet', 'creditsSheet', 'privacySheet', 'settingsSheet'];

  function closeSheets() {
    SHEETS.forEach(function (id) { var e = $(id); if (e) e.classList.remove('on'); });
    $('sheetScrim').classList.remove('on');
  }
  function openSheet(id) {
    closeSheets();
    $('sheetScrim').classList.add('on');
    $(id).classList.add('on');
  }

  function bindSheets() {
    $('sheetScrim').addEventListener('click', closeSheets);
    document.querySelectorAll('[data-close-sheet]').forEach(function (b) {
      b.addEventListener('click', closeSheets);
    });
    /* 큰 시트도 Esc·Enter·E 로 닫는다 (요구 4).
       글을 쓰는 중이거나 단추에 초점이 있을 때는 건드리지 않는다 */
    document.addEventListener('keydown', function (e) {
      var open = SHEETS.some(function (id) { var el = $(id); return el && el.classList.contains('on'); });
      if (!open) return;
      var t = e.target || {};
      var tag = (t.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) return;
      if (e.key === 'Enter' && tag === 'BUTTON') return;
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        closeSheets();
      }
    });

    $('relicBtn').addEventListener('click', openRelics);
    $('stampBtn').addEventListener('click', openStamps);
    $('stampPrint').addEventListener('click', function () {
      if (window.AtlasReport) window.AtlasReport.printStampBook();
    });
    $('rankPrint').addEventListener('click', function () {
      if (window.AtlasReport) window.AtlasReport.printRecord();
    });
  }

  function openRelics() {
    openSheet('relicSheet');
    if (window.AtlasExplore) window.AtlasExplore.drawRelicBag($('relicBody'));
    else $('relicBody').innerHTML = '<p class="muted">탐험 모드를 한 번 열면 가방이 채워지오.</p>';
  }
  function openStamps() {
    openSheet('stampSheet');
    if (window.AtlasExplore) window.AtlasExplore.drawStampBook($('stampBody'));
    else $('stampBody').innerHTML = '<p class="muted">탐험 모드를 한 번 열면 수첩이 열리오.</p>';
  }

  /* ══════════════════════════════════════════════════════════
     탐험 기록 — 발자국 등급과 탐험가 유형
     ══════════════════════════════════════════════════════════ */
  function openRank() {
    openSheet('rankSheet');
    renderRank();
  }

  function renderRank() {
    var body = $('rankBody');
    if (!body) return;

    var r = S.currentRank();
    var t = S.typeOf();
    var name = S.displayName();
    var meta = S.AXIS_META;
    var maxAxis = Math.max.apply(null, t.axes.map(function (a) { return a.n; }).concat([1]));

    var axes = t.axes.map(function (a) {
      var m = meta[a.id];
      return '<div class="axis-row">' +
        '<span class="ax-name">' + ic(m.icon, 15) + ' ' + m.label + '</span>' +
        '<span class="ax-bar"><span class="ax-fill" style="width:' + Math.round(a.n / maxAxis * 100) + '%"></span></span>' +
        '<span class="ax-n">' + a.n + '</span></div>';
    }).join('');

    var mins = Math.floor(S.totalSeconds() / 60);

    body.innerHTML =
      '<div class="rank-hero">' +
        '<div class="rank-badge">' + ic(r.icon, 30) + '</div>' +
        '<h3 class="rank-name">' + esc(r.name) + '</h3>' +
        (name ? '<p class="rank-say">' + esc(name) + ', ' + esc(r.say) + '</p>'
              : '<p class="rank-say">' + esc(r.say) + '</p>') +
        '<div class="rank-bar"><div class="rank-bar-fill" style="width:' + Math.round(r.progress * 100) + '%"></div></div>' +
        '<p class="rank-next">' +
          (r.next ? esc(r.next.name) + '까지 ' + r.next.need + '걸음' : '가장 먼 발자국까지 걸어왔소') +
        '</p>' +
      '</div>' +

      '<div class="rank-type">' +
        '<p class="rank-type-label">그대는 이런 탐험가요</p>' +
        '<h3 class="rank-type-name">' + esc(t.name) + '</h3>' +
        '<p class="rank-type-desc">' + esc(t.desc) + '</p>' +
      '</div>' +

      '<div class="axis-list">' + axes + '</div>' +

      '<div class="set-row" style="margin-top:18px">' +
        '<span class="sr-txt"><b>지금까지</b><span>' +
          '발견 ' + S.doneTotal() + ' · 유물 ' + S.relicCount() + ' · 도장 ' + S.stampCount() +
          (mins > 0 ? ' · 걸은 시간 약 ' + mins + '분' : '') +
        '</span></span>' +
      '</div>' +

      '<p class="muted" style="font-size:13px;margin-top:14px">' +
        '여기 적힌 것은 그대 혼자만의 발자취요. 남과 견주는 숫자는 어디에도 없소.' +
      '</p>';
  }

  /* ══════════════════════════════════════════════════════════
     자료 출처 · 저작권 (요구 8)
     ══════════════════════════════════════════════════════════ */
  function openCredits() {
    openSheet('creditsSheet');
    var body = $('creditsBody');
    if (!window.AtlasCredits) { body.innerHTML = '<p class="muted">출처 목록을 불러오지 못했습니다.</p>'; return; }
    var all = window.AtlasCredits.all();

    var rows = function (list) {
      return list.map(function (c) {
        var bits = [];
        if (c.author) bits.push('저작자 ' + esc(c.author));
        if (c.license) bits.push(esc(c.license));
        if (c.source) bits.push(esc(c.source));
        return '<div class="credit-item"><b>' + esc(c.file) + (c.item ? ' <span class="muted">— ' + esc(c.item) + '</span>' : '') + '</b>' +
               '<span>' + bits.join(' · ') + '</span>' +
               (c.sourceUrl ? '<a href="' + esc(c.sourceUrl) + '" target="_blank" rel="noopener">원본 보기</a>' : '') +
               '</div>';
      }).join('');
    };

    body.innerHTML =
      '<div class="doc-body">' +
        '<p>이 프로그램이 쓰는 자료의 저작자와 이용 조건입니다. ' +
        'CC BY-SA 사진은 저작자 이름을 그대로 표시합니다.</p>' +
      '</div>' +
      '<div class="credit-group"><h4>도구 · 자료</h4>' + rows(all.extra) + '</div>' +
      '<div class="credit-group"><h4>사진 ' + all.photos.length + '장 — 위키미디어 공용</h4>' + rows(all.photos) + '</div>';
  }

  /* ══════════════════════════════════════════════════════════
     개인정보 처리방침 (요구 2)
     ══════════════════════════════════════════════════════════ */
  function openPrivacy() {
    openSheet('privacySheet');
    var body = $('privacyBody');
    body.innerHTML = window.ATLAS_PRIVACY ? window.ATLAS_PRIVACY.html
      : '<p>개인정보 처리방침을 불러오지 못했습니다.</p>';
  }

  /* ══════════════════════════════════════════════════════════
     설정
     ══════════════════════════════════════════════════════════ */
  function openSettings() {
    openSheet('settingsSheet');
    renderSettings();
  }

  function renderSettings() {
    var body = $('settingsBody');
    var name = S.displayName();
    var teacher = S.mapMode() === 'teacher';
    var low = S.get('atlasLowSpec_v1') === '1';

    body.innerHTML =
      '<div class="set-row">' +
        '<span class="sr-txt"><b>이름</b><span>' + (name ? esc(name) : '적지 않았소 — 없어도 괜찮소') + '</span></span>' +
        '<button class="set-btn" id="setName" type="button">이름 바꾸기</button>' +
      '</div>' +
      '<div class="set-row">' +
        '<span class="sr-txt"><b>화면</b><span>느린 기기에서는 저사양 화면이 부드럽소</span></span>' +
        '<button class="set-btn" id="setLow" type="button">' + (low ? '저사양 켬' : '저사양 끔') + '</button>' +
      '</div>' +
      '<div class="set-row">' +
        '<span class="sr-txt"><b>지도 모드</b><span>' + (teacher ? '교사용 — 학습지 인쇄가 보이오' : '학생용') + '</span></span>' +
        '<button class="set-btn" id="setTeacher" type="button">' + (teacher ? '학생용으로' : '교사용으로') + '</button>' +
      '</div>' +
      '<div class="set-row">' +
        '<span class="sr-txt"><b>개인정보 처리방침</b><span>이름과 기록이 어디에 저장되는지 적혀 있습니다</span></span>' +
        '<button class="set-btn" id="setPrivacy" type="button">읽어 보기</button>' +
      '</div>' +
      '<div class="set-row">' +
        '<span class="sr-txt"><b>자료 출처 · 저작권</b><span>사진과 도구의 저작자를 적어 두었소</span></span>' +
        '<button class="set-btn" id="setCredits" type="button">보기</button>' +
      '</div>' +
      '<div class="set-row">' +
        '<span class="sr-txt"><b>내 기록 모두 지우기</b><span>이름 · 진행 · 유물 · 도장이 이 기기에서 즉시 삭제됩니다</span></span>' +
        '<button class="set-btn danger" id="setWipe" type="button">지우기</button>' +
      '</div>' +
      '<div id="wipeConfirm" style="display:none;margin-top:14px" class="q-fb on no">' +
        '정말 지울까요? 되돌릴 수 없습니다.' +
        '<div style="margin-top:10px;display:flex;gap:8px">' +
          '<button class="set-btn danger" id="wipeYes" type="button">네, 모두 지웁니다</button>' +
          '<button class="set-btn" id="wipeNo" type="button">아니요</button>' +
        '</div>' +
      '</div>' +
      '<p class="muted" style="font-size:12.5px;margin-top:16px">' +
        (S.available() ? '' : '이 브라우저에서는 저장이 막혀 있습니다. 학습은 그대로 할 수 있지만 기록이 남지 않습니다.') +
      '</p>';

    $('setName').addEventListener('click', function () {
      closeSheets();
      showOnly('intro');
      step('name');
    });
    $('setLow').addEventListener('click', function () {
      S.set('atlasLowSpec_v1', low ? '0' : '1');
      renderSettings();
    });
    $('setTeacher').addEventListener('click', function () {
      S.setMapMode(teacher ? 'student' : 'teacher');
      if (window.AtlasMap) window.AtlasMap.refreshMode();
      renderSettings();
    });
    $('setPrivacy').addEventListener('click', openPrivacy);
    $('setCredits').addEventListener('click', openCredits);
    $('setWipe').addEventListener('click', function () {
      $('wipeConfirm').style.display = 'block';
    });
    $('wipeNo').addEventListener('click', function () {
      $('wipeConfirm').style.display = 'none';
    });
    $('wipeYes').addEventListener('click', function () {
      S.wipeAll();
      closeSheets();
      toast('기록을 모두 지웠습니다.');
      setTimeout(function () { location.reload(); }, 900);
    });
  }

  /* ══════════════════════════════════════════════════════════
     토스트 (지도 모드·껍데기 공용)
     ══════════════════════════════════════════════════════════ */
  var toastTimer = 0;
  function toast(msg) {
    var el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }

  /* ══════════════════════════════════════════════════════════
     시작
     ══════════════════════════════════════════════════════════ */
  function init() {
    if (window.AtlasIcons) window.AtlasIcons.paint(document);   // HTML 의 [data-icon] 자리를 채운다
    bindIntro();
    bindSheets();

    // 저사양 설정을 탐험 엔진에 전한다
    if (S.get('atlasLowSpec_v1') === '1') window.ATLAS_LOW_SPEC = true;

    // 이미 고지를 확인한 이용자는 표지에서 바로 이름/모드로 갈 수 있다
    step('cover');

    if (new URLSearchParams(location.search).get('selftest')) selftest();
  }

  /* ══════════════════════════════════════════════════════════
     자가 검사 — ?selftest=1 (개발용)
     헤드리스 브라우저에서 실제로 눌러 보고 결과를 콘솔에 남긴다.
     ══════════════════════════════════════════════════════════ */
  function selftest() {
    var STOP = new URLSearchParams(location.search).get('stop') || '';
    var ERA = new URLSearchParams(location.search).get('era') || 'three';   // ?era=neolithic
    var out = { 단계: [] };
    var say = function (k, v) { out[k] = v; out.단계.push(k); };

    setTimeout(function () {
      try {
        S.agree();
        S.setName('검사');
        say('프로필', S.displayName() + ' / 동의 ' + (S.hasAgreed() ? 'O' : 'X'));
        say('등급', S.currentRank().name);
        say('유형', S.typeOf().name);
        say('학습항목', (window.CONTENT || []).length);
        say('시대수', (window.ERAS || []).length);
        say('해안선점', (window.KOREA || []).reduce(function (n, r) { return n + r.length; }, 0));
        say('제주점', (window.JEJU || []).length);
        say('사진출처', window.AtlasCredits ? window.AtlasCredits.PHOTOS.length : -1);
        var ext = performance.getEntriesByType('resource')
          .map(function (r) { return r.name; })
          .filter(function (n) { return n.indexOf(location.origin) !== 0 && n.indexOf('data:') !== 0 && n.indexOf('blob:') !== 0; });
        say('외부요청', ext.length + (ext.length ? ' — ' + ext.slice(0, 3).join(' ') : '건'));
        say('저장가능', S.available() ? 'O' : 'X');

        if (STOP === 'intro') { console.log('[SELFTEST] ' + JSON.stringify(out)); return; }
        toMap();
        setTimeout(function () {
          try {
            say('지도마커', document.querySelectorAll('#gMk .mk').length);
            say('지도영역', document.querySelectorAll('#gTerr path').length);
            try { window.AtlasMap.setEraById(ERA); } catch(e){}   // 지도 시대 id는 탐험 id와 다를 수 있다
            say('시대마커', document.querySelectorAll('#gMk .mk').length);

            if (STOP === 'map') { say('지도영역2', document.querySelectorAll('#gTerr path').length); console.log('[SELFTEST] ' + JSON.stringify(out)); return; }
            toExplore(ERA);
            setTimeout(function () {
              try {
                var E = window.AtlasExplore;
                say('탐험시대', E ? E.currentWorld() : '없음');
                say('발견총계', document.getElementById('exFoundT').textContent);
                say('임무목록', document.querySelectorAll('#exRailList .rail-item').length);
                say('캔버스', document.getElementById('exCanvas').width + 'x' + document.getElementById('exCanvas').height);
                var A3 = window.__atlas3d;
                // 검사용 — 카메라 각도/거리를 정해 찍을 수 있게 (?pitch=0.05&zoom=1.6)
                var qp = new URLSearchParams(location.search);
                if (A3 && qp.get('pitch')) A3.ST.camPitch = parseFloat(qp.get('pitch'));
                if (A3 && qp.get('zoom')) A3.ST.camZoom = parseFloat(qp.get('zoom'));
                if (A3) {
                  var kinds = {};
                  A3.scene.children.forEach(function (o) {
                    var k = o.name || (o.isMesh ? (o.geometry && o.geometry.type) : o.type);
                    kinds[k] = (kinds[k] || 0) + 1;
                  });
                  say('씬구성', JSON.stringify(kinds));
                  say('배경', A3.scene.background ? '색' : '없음(돔)');
                  say('안개', A3.scene.fog ? (A3.scene.fog.near.toFixed(0) + '~' + A3.scene.fog.far.toFixed(0) + ' #' + A3.scene.fog.color.getHexString()) : '없음');
                  say('카메라높이', A3.camera.position.y.toFixed(1));
                  say('카메라각', (A3.ST.camPitch * 57.3).toFixed(0) + '도 · 배율 ' + A3.ST.camZoom.toFixed(2));
                }
                var W = E.WORLDS;
                var qn = 0, gn = 0, nn = 0, rn = 0;
                Object.keys(W).forEach(function (k) {
                  qn += W[k].quests.filter(function (q) { return q.kind !== 'gate'; }).length;
                  gn += W[k].quests.filter(function (q) { return q.kind === 'gate'; }).length;
                  nn += (E.WORLDS[k] && (window.AtlasExplore.worldList().find(function (w) { return w.id === k; }) ? 0 : 0));
                  rn += (E.RELICS_BY_WORLD[k] || []).length;
                });
                say('퀘스트합', qn); say('관문합', gn); say('유물합', rn);
                say('시대목록', Object.keys(W).length);

                if (STOP === 'story') {
                  // 시대 안내 카드를 띄운 채로 멈춘다 — 화면을 눈으로 확인할 때 (요구 1)
                  say('학습목표', (document.querySelector('#exStoryGoal .ex-goal-text') || {}).textContent || '없음');
                  say('성취기준', (document.getElementById('exStoryStandard') || {}).textContent || '없음');
                  document.querySelectorAll('#exIntroStory, .ex-story-card').forEach(function (e) {
                    e.style.transition = 'none'; e.style.opacity = '1'; e.style.transform = 'none';
                  });
                  console.log('[SELFTEST] ' + JSON.stringify(out));
                  return;
                }

                // 이야기 카드를 닫고 실제 월드를 보인다
                var go = document.getElementById('exStoryGo');
                if (go) go.click();

                if (STOP === 'scene') {
                  // 지형지물만 눈으로 확인할 때 — ?px=&pz=&yaw= 로 서는 자리를 정한다
                  var A4 = window.__atlas3d;
                  if (A4 && A4.ST.player) {
                    if (qp.get('px')) A4.ST.player.position.x = parseFloat(qp.get('px'));
                    if (qp.get('pz')) A4.ST.player.position.z = parseFloat(qp.get('pz'));
                    if (qp.get('yaw')) A4.ST.camYaw = parseFloat(qp.get('yaw'));
                  }
                  if (A4) {
                    var bk = A4.scene.children.filter(function (o) { return o.name === 'bricks'; });
                    say('브릭덩어리', bk.length + '개 · ' +
                        bk.reduce(function (n, g) { return n + (g.userData.count || 0); }, 0) + '조각 · ' +
                        bk.reduce(function (n, g) { return n + g.children.length; }, 0) + '드로우콜');
                    var sp = (A4.ST.propSpots || []);
                    say('소품자리', sp.length + '곳 · ' + sp.slice(0, 8).map(function (q) {
                      return q[0].toFixed(0) + ',' + q[1].toFixed(0);
                    }).join(' '));
                  }
                  setTimeout(function () {
                    if (qp.get('bare')) {
                      // 캔버스만 남기고 다 감춘다 — 지형지물을 눈으로 볼 때
                      var ex = document.getElementById('explore');
                      if (ex) Array.prototype.forEach.call(ex.children, function (e) {
                        if (e.id !== 'exCanvas') e.style.display = 'none';
                      });
                      document.querySelectorAll('body > *').forEach(function (e) {
                        if (e.id !== 'explore' && e.tagName !== 'SCRIPT') e.style.display = 'none';
                      });
                    }
                    console.log('[SELFTEST] ' + JSON.stringify(out));
                  }, 2500);
                  return;
                }

                if (STOP === 'gate') {
                  // 관문으로 지역을 옮기고 돌아올 수 있는지 (MASTER §12-5)
                  var go3 = document.getElementById('exStoryGo'); if (go3) go3.click();
                  var Wg = window.AtlasExplore.WORLDS['samguk'];
                  var gate = Wg.quests.find(function (x) { return x.kind === 'gate'; });
                  say('첫관문', gate ? gate.title + ' → ' + gate.to : '없음');
                  var rail2 = document.querySelectorAll('#exRailList .rail-item');
                  for (var g2 = 0; g2 < rail2.length; g2++) {
                    if (rail2[g2].textContent.indexOf(gate.title) >= 0) { rail2[g2].click(); break; }
                  }
                  setTimeout(function () {
                    var goBtn = document.querySelector('#questCard #qGo');
                    say('관문카드', goBtn ? goBtn.textContent : '없음');
                    if (goBtn) goBtn.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
                    setTimeout(function () {
                      say('도착지역', document.getElementById('exMiniLabel').textContent);
                      say('그지역임무', document.querySelectorAll('#exRailList .rail-item').length);
                      say('방문도장', S.stampHas('visit:samguk:' + gate.to) ? '찍힘' : '없음');
                      console.log('[SELFTEST] ' + JSON.stringify(out));
                    }, 900);
                  }, 500);
                  return;
                }

                if (STOP === 'print') {
                  // 임무 몇 개를 마쳐 기록을 만든 뒤 인쇄물을 그린다
                  var Wp = window.AtlasExplore.WORLDS['samguk'];
                  var picks = Wp.quests.filter(function (x) { return x.kind !== 'gate'; }).slice(0, 6);
                  picks.forEach(function (x, i) {
                    S.doneAdd('samguk', x.id);
                    S.logAnswer({ world:'samguk', questId:x.id, title:x.title,
                      question:(x.q && x.q.text) || (x.capstone && x.capstone.text) || '살펴본 임무',
                      answer:'보기 ' + (i + 1), correct: i % 3 !== 2, tries: (i % 2) + 1, kind:'choice' });
                  });
                  S.logAnswer({ world:'samguk', questId:'essay-demo', title:'고구려의 힘은 어디에서 왔는가',
                    question:'광개토대왕이 영토를 넓힐 수 있었던 까닭을 두 가지 이상 적어 보시오.',
                    answer:'튼튼한 기병과 성을 쌓는 기술이 있었고, 여러 부족을 하나로 묶어 군사를 크게 모을 수 있었기 때문이다.',
                    correct:true, tries:1, kind:'essay' });
                  S.stampAdd('visit:samguk:goguryeo'); S.stampAdd('clear:samguk:goguryeo');
                  S.stampAdd('era:samguk'); S.relicAdd('r-gwanggaeto');
                  var which = new URLSearchParams(location.search).get('doc') || 'record';
                  if (which === 'stamp') window.AtlasReport.previewStampBook();
                  else if (which === 'sheet') window.AtlasReport.previewWorksheet(window.ERAS[3], window.AtlasMap.itemsOfEra().slice(0, 10));
                  else window.AtlasReport.previewRecord();
                  document.body.classList.add('print-preview');
                  say('인쇄물', which);
                  say('인쇄길이', document.getElementById('printArea').innerHTML.length);
                  console.log('[SELFTEST] ' + JSON.stringify(out));
                  return;
                }

                if (STOP === 'neomini') {
                  /* 이식해 온 신석기 놀이 — 미션 시퀀스의 '돌 갈기' 자리에서 확인한다 */
                  var AT = +(new URLSearchParams(location.search).get('at') || 8);
                  try {
                    localStorage.setItem('neolithicChain_v1', JSON.stringify({
                      at: AT, flags: {}, inventory: ['stone', 'seed', 'clay', 'pot', 'post'],
                      relations: {}, kept: [], observed: [], done: false
                    }));
                  } catch (e) {}
                  window.AtlasExplore.switchWorld('neolithic');
                  setTimeout(function () {
                    var g7 = document.getElementById('exStoryGo'); if (g7) g7.click();
                    setTimeout(function () {
                      say('걸음', (document.querySelector('.mq-goal') || {}).textContent || '없음');
                      var host = document.querySelector('.neo-host');
                      say('이식한놀이틀', host ? '있음' : '없음');
                      say('놀이속', host ? host.querySelector('.mg') ? '그려짐' : '빔' : '없음');
                      say('숫돌그림', document.querySelector('.neo-host .neo-svg') ? '있음' : '없음');
                      say('안내문', (document.querySelector('.neo-host .mg-intro') || {}).textContent.slice(0, 28) || '');
                      var EMO3 = /(?![©®™])\p{Extended_Pictographic}/u;
                      var n = 0, w2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), nd2;
                      while ((nd2 = w2.nextNode())) if (EMO3.test(nd2.nodeValue)) n++;
                      say('놀이이모지', n);

                      /* 임무 쪽 자료도 이식한 갈래를 쓰는지 */
                      var W7 = window.AtlasExplore.WORLDS['neolithic'];
                      var types = W7.quests.map(function (q) { return q.mini && q.mini.type; })
                                           .filter(Boolean).join(' ');
                      say('임무놀이갈래', types);

                      /* 움집 그림이 창을 가득 채우는가 (요구 3) */
                      var us = document.querySelector('.neo-host .mg-stack.neo-umjip .mg-stack-svg');
                      if (us) {
                        var ur = us.getBoundingClientRect();
                        // 카드에는 세로 스크롤바가 있어 가운데가 조금 밀린다.
                        // 실제로 담고 있는 상자를 기준으로 잰다.
                        var box = us.closest('.mg-stack');
                        var cr = (box || document.querySelector('.mq-card')).getBoundingClientRect();
                        say('움집그림너비', Math.round(ur.width) + ' / 카드 ' + Math.round(cr.width));
                        say('움집그림비율', Math.round(ur.width / cr.width * 100) + '%');
                        say('움집그림가운데',
                          Math.abs((ur.left + ur.width / 2) - (cr.left + cr.width / 2)) < 6 ? 'O' : 'X');
                      }
                      console.log('[SELFTEST] ' + JSON.stringify(out));
                    }, 900);
                  }, 900);
                  return;
                }

                if (STOP === 'mission') {
                  /* 신석기 미션 시퀀스 — 관찰 화면을 실제로 눌러 본다 */
                  var EMO2 = /(?![©®™])\p{Extended_Pictographic}/u;
                  var scan2 = function () {
                    var n = 0, w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), nd;
                    while ((nd = w.nextNode())) if (EMO2.test(nd.nodeValue)) n++;
                    return n;
                  };
                  // 시대를 판별하는 두 번째 걸음부터 보이게 상태를 심는다
                  try {
                    localStorage.setItem('neolithicChain_v1', JSON.stringify({
                      at: 1, flags: {}, inventory: ['stone'], relations: {},
                      kept: [], observed: [], done: false
                    }));
                  } catch (e) {}

                  window.AtlasExplore.switchWorld('neolithic');
                  setTimeout(function () {
                    var g5 = document.getElementById('exStoryGo'); if (g5) g5.click();
                    setTimeout(function () {
                      var modal = document.getElementById('mqModal');
                      say('미션창', modal && modal.classList.contains('on') ? '열림' : '안열림');
                      say('이번걸음', (document.querySelector('.mq-goal') || {}).textContent || '없음');
                      say('속마음', (document.querySelector('.mq-inner') || {}).textContent || '없음');

                      var plates = document.querySelectorAll('.ob-plate');
                      say('관찰자료수', plates.length);
                      say('출처표기', (document.querySelector('.ob-credit') || {}).textContent || '없음');
                      say('지점미리표시', document.querySelectorAll('.ob-mark').length);   // 0 이어야 한다
                      say('이름미리공개', document.querySelector('.ob-rv-name') ? '새어나감' : '감춰짐');

                      // 관찰 지점 두 곳을 짚어 본다 (왼쪽 자료의 50,88 과 34,32)
                      var hit = function (pl, xp, yp) {
                        var r = pl.getBoundingClientRect();
                        pl.dispatchEvent(new MouseEvent('click', {
                          bubbles: true,
                          clientX: r.left + r.width * xp / 100,
                          clientY: r.top + r.height * yp / 100
                        }));
                      };
                      if (plates[0]) { hit(plates[0], 50, 88); hit(plates[0], 34, 32); }

                      setTimeout(function () {
                        say('관찰노트', document.querySelectorAll('.ob-note').length);
                        say('찾은표시', document.querySelectorAll('.ob-mark').length);
                        say('이름공개', (document.querySelector('.ob-rv-name') || {}).textContent || '아직');
                        say('미션이모지', scan2());

                        // 다음으로 넘어가면 정리 카드가 뜬다
                        var nb = document.getElementById('obNext');
                        if (nb) nb.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                        setTimeout(function () {
                          say('다음걸음', (document.querySelector('.mq-goal') || {}).textContent ||
                                          (document.querySelector('.mq-after-title') || {}).textContent || '없음');
                          say('지도개방', S.bagHas('ganseok') ? 'O' : 'X');
                          console.log('[SELFTEST] ' + JSON.stringify(out));
                        }, 350);
                      }, 350);
                    }, 900);
                  }, 900);
                  return;
                }

                if (STOP === 'newui') {
                  /* 이번에 고친 것들을 실제 화면에서 확인한다
                     1 시대 안내의 학습 목표·성취기준 · 2 이모지 0개 · 3 마법진
                     4 팝업 닫기 · 5 핵심 탐구질문 · 7 지도 모드 이동 · 8 사진 비율 */
                  // 활자 화살표(→ ←)는 이모지가 아니므로 세지 않는다 — js/icons.js 와 같은 기준
                  var EMO = /(?![©®™])\p{Extended_Pictographic}/u;
                  var scanEmoji = function () {
                    var n = 0, w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                    var node, hits = [];
                    while ((node = w.nextNode())) {
                      if (EMO.test(node.nodeValue)) { n++; if (hits.length < 3) hits.push(node.nodeValue.trim().slice(0, 20)); }
                    }
                    return n + (hits.length ? ' — ' + hits.join(' / ') : '');
                  };

                  // ① 시대 안내 (이야기 카드가 아직 떠 있는 상태)
                  say('학습목표', (document.querySelector('#exStoryGoal .ex-goal-text') || {}).textContent || '없음');
                  say('성취기준', (document.getElementById('exStoryStandard') || {}).textContent || '없음');
                  say('시대제목', (document.getElementById('exStoryTitle') || {}).textContent || '');
                  say('닫기단추', document.getElementById('exStoryX') ? '있음' : '없음');

                  var go4 = document.getElementById('exStoryGo'); if (go4) go4.click();

                  setTimeout(function () {
                    // ② 이모지
                    say('화면이모지', scanEmoji());

                    // ③ 마법진 — 마커와 사람 발밑에 깔렸는가
                    var auras = 0, npcAuras = 0;
                    var STx = (A3 && A3.ST) || { markerGroups: [], npcGroups: [] };
                    STx.markerGroups.forEach(function (g) {
                      if (g.userData && g.userData.aura) auras++;
                    });
                    STx.npcGroups.forEach(function (g) {
                      if (g.userData && g.userData.aura) npcAuras++;
                    });
                    say('마커마법진', auras + ' / ' + STx.markerGroups.length);
                    say('사람마법진', npcAuras + ' / ' + STx.npcGroups.length);

                    // 마친 임무의 마법진은 회색으로 흐려져야 한다 (요구 3)
                    var wid = window.AtlasExplore.currentWorld();
                    var Wc = window.AtlasExplore.WORLDS[wid];
                    var target = Wc.quests.filter(function (q) { return q.kind !== 'gate' && q.pos; })[0];
                    var st = {};
                    st[target.id] = 'done';
                    try { localStorage.setItem(Wc.saveKey, JSON.stringify({ questState: st })); } catch (e) {}
                    window.AtlasExplore.switchWorld(wid);
                    var goA = document.getElementById('exStoryGo'); if (goA) goA.click();

                    var before = 0, after = 0;
                    STx.markerGroups.forEach(function (g) {
                      if (!g.userData || !g.userData.aura) return;
                      if (g.userData.quest.id === target.id) after = g.userData.aura.material.opacity;
                      else before = g.userData.aura.material.opacity;
                    });
                    say('마친임무', target.title);
                    say('마친마법진', after.toFixed(2) + ' (아직인 것 ' + before.toFixed(2) + ')');
                    say('회색으로', after < before ? 'O' : 'X');

                    /* ③-b 임무 목록은 임무를 열지 않고 자리만 알려 준다 (요구 3) */
                    var rail1 = document.querySelector('#exRailList .rail-item');
                    if (rail1) rail1.click();
                    say('목록이임무를엶',
                        document.getElementById('questModal').classList.contains('on') ? '엶(틀림)' : '안 엶');
                    say('미니맵반짝임',
                        (document.getElementById('exMiniRadar') || {}).innerHTML &&
                        document.getElementById('exMiniRadar').innerHTML.indexOf('stroke-width="2.4"') >= 0 ? 'O' : 'X');
                    say('접기단추자리',
                        getComputedStyle(document.getElementById('exQuestRail')).alignItems);

                    /* 세상에서도 그 자리가 숨을 쉬는가 (요구 1) */
                    var railId = rail1 && rail1.dataset.id;
                    var litMk = STx.markerGroups.filter(function (g) {
                      return g.userData && g.userData.quest.id === railId;
                    })[0];
                    if (litMk) {
                      var s1 = litMk.scale.x, o1 = litMk.userData.aura.material.opacity;
                      var A3b = window.__atlas3d;
                      // 시계를 조금 밀어 숨결의 다른 지점을 본다
                      if (A3b && A3b.ST.clock) A3b.ST.clock.elapsedTime += 0.24;
                      if (A3b && A3b.tick) A3b.tick();      // 한 프레임 돌린다
                      var s2 = litMk.scale.x;
                      say('세상반짝임', (s1 !== s2 || s1 > 1.2) ? 'O' : 'X (' + s1.toFixed(2) + '→' + s2.toFixed(2) + ')');
                      say('마법진밝기', o1.toFixed(2));
                    } else {
                      say('세상반짝임', '표지를 못 찾음');
                    }

                    /* ① 성취기준은 학생 화면에 없어야 한다 (요구 1) */
                    say('성취기준노출', document.getElementById('exStoryStandard') ? '있음(틀림)' : '없음');


                    /* 임무는 걸어가서 연다 — 마커 앞에 세우고 조사하기를 누른다 */
                    var openAQuest = function () {
                      var mg = STx.markerGroups.filter(function (g) { return g.userData && g.userData.quest.kind !== 'gate'; })[0];
                      if (!mg || !STx.player) return;
                      STx.player.position.set(mg.position.x, 0, mg.position.z);
                      STx.activeNear = mg;
                      var b = document.getElementById('exInteract');
                      if (b) b.click();
                    };

                    // ④ 임무 창의 닫기 단추 + ⑧ 사진 비율
                    openAQuest();
                    setTimeout(function () {
                      say('임무닫기단추', document.querySelector('#questCard .q-x') ? '있음' : '없음');
                      var ph = document.querySelector('#questCard .q-photo');
                      say('사진맞춤', ph ? getComputedStyle(ph).objectFit : '사진없음');
                      say('임무창이모지', scanEmoji());

                      // Esc · Enter · E 세 키가 모두 닫는가 (요구 4)
                      var keyCloses = function (key) {
                        openAQuest();
                        var wasOpen = document.getElementById('questModal').classList.contains('on');
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: key, bubbles: true }));
                        var nowOpen = document.getElementById('questModal').classList.contains('on');
                        return wasOpen && !nowOpen ? 'O' : 'X';
                      };
                      say('Esc닫힘', keyCloses('Escape'));
                      say('Enter닫힘', keyCloses('Enter'));
                      say('E닫힘', keyCloses('e'));
                      setTimeout(function () {

                        // ⑤ 핵심 탐구질문 — 이 시대를 다 마친 것으로 만들고 연다
                        var Wn = window.AtlasExplore.WORLDS[window.AtlasExplore.currentWorld()];
                        say('탐구질문있음', (Wn && Wn.inquiry && Wn.inquiry.question) ? '있음' : '없음');
                        window.AtlasExplore.showEraComplete();

                        setTimeout(function () {
                          var inq = document.getElementById('eccInquiry');
                          say('질문화면', (inq && !inq.hidden) ? '열림' : '안열림');
                          say('질문글', (document.querySelector('.ecc-inq-q') || {}).textContent || '');

                          var box = document.getElementById('eccInqInput');
                          var btn = document.getElementById('eccInqSave');
                          if (box && btn) {
                            // ⑥ 금칙어가 섞이면 저장되지 않아야 한다
                            box.value = '이 시대는 씨발 재미없다';
                            btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true }));
                            say('금칙어막힘', (document.getElementById('eccInqNote') || {}).textContent || '');
                            say('금칙어저장', S.answers().filter(function (a) { return a.kind === 'inquiry'; }).length);

                            // 제대로 쓴 답은 기록에 남아야 한다
                            box.value = '고인돌을 옮기려면 사람이 아주 많이 필요했을 것이므로 힘을 가진 사람이 있었다고 생각한다.';
                            btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true }));
                            var saved = S.answers().filter(function (a) { return a.kind === 'inquiry'; });
                            say('답저장', saved.length ? saved[0].answer.slice(0, 24) : '없음');
                            say('기록지반영', window.AtlasReport.previewRecord().indexOf('핵심 탐구질문') >= 0 ? 'O' : 'X');
                          }

                          // ⑦ 지도 모드로 이동
                          document.getElementById('eccClose').click();
                          document.getElementById('toMapBtn').click();
                          setTimeout(function () {
                            say('지도이동', document.getElementById('app').classList.contains('on') ? 'O' : 'X');

                            /* ④ 역사 가방의 항목을 누르면 지도로 건너가 그 항목이 펼쳐진다 (요구 4) */
                            toExplore(ERA);
                            setTimeout(function () {
                              var g6 = document.getElementById('exStoryGo'); if (g6) g6.click();
                              S.bagAdd('bitsal');
                              document.getElementById('bagBtn').click();
                              var bagRow = document.querySelector('#bagBody .item-row');
                              say('가방항목단추', bagRow ? bagRow.tagName : '없음');
                              if (bagRow) bagRow.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                              setTimeout(function () {
                                say('가방에서지도로', document.getElementById('app').classList.contains('on') ? 'O' : 'X');
                                say('펼쳐진항목', (document.querySelector('#mapCard .mc-title') || {}).textContent || '안열림');
                                console.log('[SELFTEST] ' + JSON.stringify(out));
                              }, 300);
                            }, 700);
                          }, 400);
                        }, 400);
                      }, 250);
                    }, 500);
                  }, 700);
                  return;
                }

                if (STOP === 'inspect') {
                  // 조사형 + 놀이가 붙은 임무를 끝까지 눌러 본다 (빗살무늬토기)
                  window.AtlasExplore.switchWorld('neolithic');
                  setTimeout(function () {
                    var go2 = document.getElementById('exStoryGo'); if (go2) go2.click();
                    var W = window.AtlasExplore.WORLDS['neolithic'];
                    var bq = W.quests.find(function (x) { return x.id === 'bitsal'; });
                    say('빗살임무', bq ? bq.kind + '/' + (bq.mini && bq.mini.type) + '/사진 ' + (bq.img ? bq.img[0] : '없음') : '없음');
                    var rail = document.querySelectorAll('#exRailList .rail-item');
                    for (var k = 0; k < rail.length; k++) {
                      if (rail[k].textContent.indexOf('빗살') >= 0) { rail[k].click(); break; }
                    }
                    setTimeout(function () {
                      var hots = document.querySelectorAll('#questCard .q-hot');
                      say('살펴볼것', hots.length);
                      for (var h = 0; h < hots.length; h++) hots[h].dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
                      setTimeout(function () {
                        var again = document.querySelectorAll('#questCard .q-hot');
                        for (var h2 = 0; h2 < again.length; h2++) again[h2].dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
                        setTimeout(function () {
                          var nx = document.querySelector('#questCard #qNext');
                          say('다음버튼', nx ? nx.textContent : '없음');
                          if (nx) nx.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
                          setTimeout(function () {
                            say('놀이열림', document.querySelector('#questCard .mg') ? '열림' : '안열림');
                            var inp = document.querySelector('#questCard #mgBlank');
                            if (inp) {
                              inp.value = '빗살무늬토기';
                              document.querySelector('#questCard #mgAction').dispatchEvent(new PointerEvent('pointerdown', {bubbles:true}));
                            }
                            setTimeout(function () {
                              say('낱말판정', (document.querySelector('#questCard #mgAction') || {}).textContent || '');
                              console.log('[SELFTEST] ' + JSON.stringify(out));
                            }, 300);
                          }, 300);
                        }, 300);
                      }, 300);
                    }, 500);
                  }, 900);
                  return;
                }

                if (STOP === 'quest') {
                  setTimeout(function () {
                    /* 임무 목록은 자리만 알려 준다 (요구 3).
                       임무를 열려면 마커 앞으로 가서 조사하기를 눌러야 한다 */
                    var mqx = document.getElementById('mqX');
                    if (mqx && document.getElementById('mqModal').classList.contains('on')) mqx.click();
                    var STq = (window.__atlas3d || {}).ST;
                    var mg = STq && STq.markerGroups.filter(function (g) {
                      return g.userData && g.userData.quest.kind !== 'gate';
                    })[0];
                    if (mg && STq.player) {
                      STq.player.position.set(mg.position.x, 0, mg.position.z);
                      STq.activeNear = mg;
                      var ib = document.getElementById('exInteract');
                      if (ib) ib.click();
                    }
                    setTimeout(function () {
                      // 가상 시간에서는 CSS 전이가 끝나지 않으므로 강제로 보이게 한다
                      ['exScrim', 'questModal'].forEach(function (id) {
                        var e = document.getElementById(id);
                        if (e) { e.style.transition = 'none'; e.style.opacity = '1'; e.style.visibility = 'visible'; }
                      });
                      var qc = document.getElementById('questCard');
                      if (qc) { qc.style.transition = 'none'; qc.style.transform = 'none'; }
                      say('임무카드', document.getElementById('questModal').classList.contains('on') ? '열림' : '안열림');
                      say('카드제목', (document.querySelector('#questCard .q-title') || {}).textContent || '');
                      console.log('[SELFTEST] ' + JSON.stringify(out));
                    }, 500);
                  }, 500);
                  return;
                }
              } catch (e) { say('오류3', String(e)); }
              console.log('[SELFTEST] ' + JSON.stringify(out));
            }, 2200);
          } catch (e) { say('오류2', String(e)); console.log('[SELFTEST] ' + JSON.stringify(out)); }
        }, 700);
      } catch (e) { say('오류1', String(e)); console.log('[SELFTEST] ' + JSON.stringify(out)); }
    }, 400);
  }

  window.AtlasShell = {
    toExplore: toExplore, toMap: toMap, toIntro: toIntro,
    openRank: openRank, openRelics: openRelics, openStamps: openStamps,
    openCredits: openCredits, openPrivacy: openPrivacy, openSettings: openSettings,
    closeSheets: closeSheets, toast: toast, renderRank: renderRank,
    step: step
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
