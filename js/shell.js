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
  function showOnly(which) {
    var intro = $('intro'), app = $('app'), ex = $('explore');
    intro.classList.toggle('off', which !== 'intro');
    app.classList.toggle('on', which === 'map');
    app.setAttribute('aria-hidden', which === 'map' ? 'false' : 'true');
    ex.classList.toggle('on', which === 'explore');
    ex.setAttribute('aria-hidden', which === 'explore' ? 'false' : 'true');
    if (window.AtlasExplore) window.AtlasExplore.pause(which !== 'explore');
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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSheets();
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
        '<span class="ax-name">' + m.icon + ' ' + m.label + '</span>' +
        '<span class="ax-bar"><span class="ax-fill" style="width:' + Math.round(a.n / maxAxis * 100) + '%"></span></span>' +
        '<span class="ax-n">' + a.n + '</span></div>';
    }).join('');

    var mins = Math.floor(S.totalSeconds() / 60);

    body.innerHTML =
      '<div class="rank-hero">' +
        '<div class="rank-badge">' + r.icon + '</div>' +
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
               (c.sourceUrl ? '<a href="' + esc(c.sourceUrl) + '" target="_blank" rel="noopener">원본 보기 ↗</a>' : '') +
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

        if (STOP === 'intro') { console.log('[SELFTEST] ' + JSON.stringify(out)); return; }
        toMap();
        setTimeout(function () {
          try {
            say('지도마커', document.querySelectorAll('#gMk .mk').length);
            say('지도영역', document.querySelectorAll('#gTerr path').length);
            window.AtlasMap.setEraById('three');
            say('삼국마커', document.querySelectorAll('#gMk .mk').length);

            if (STOP === 'map') { say('지도영역2', document.querySelectorAll('#gTerr path').length); console.log('[SELFTEST] ' + JSON.stringify(out)); return; }
            toExplore('three');
            setTimeout(function () {
              try {
                var E = window.AtlasExplore;
                say('탐험시대', E ? E.currentWorld() : '없음');
                say('발견총계', document.getElementById('exFoundT').textContent);
                say('임무목록', document.querySelectorAll('#exRailList .rail-item').length);
                say('캔버스', document.getElementById('exCanvas').width + 'x' + document.getElementById('exCanvas').height);
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

                // 이야기 카드를 닫고 실제 월드를 보인다
                var go = document.getElementById('exStoryGo');
                if (go) go.click();

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
                    var first = document.querySelector('#exRailList .rail-item');
                    if (first) first.click();
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
