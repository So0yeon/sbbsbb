// © 2026 김용현
/* 지도 모드 v2 — 시대별 영토를 국가별로 모핑합니다.
   기존 지도(js/map-app.js)는 건드리지 않습니다. 이 파일은 map2.html 에서만 씁니다.
   의존: js/atlas-geo.js (해안선) · js/map-data.js (13시대) · js/map2/territory-data.js · js/map2/morph.js */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var T = window.TERRITORY;
  var ERAS = window.ERAS || [];
  var $ = function (id) { return document.getElementById(id); };

  var svg, defs, gTerr, gLabels, rectCache = null;
  var live = {};          // 화면에 올라와 있는 나라 — id → { g, fill }
  var anims = [];         // 돌고 있는 모핑
  var timer = null;       // 다음 세기 예약
  var frameIdx = -1;
  var eraId = null;
  var queue = [];         // 남은 장면 (시대를 넘어 이어집니다)
  var playing = false;

  /* ── 움직임 ──────────────────────────────────────────────── */
  /* 윈도우에서 「애니메이션 효과」를 끄면 브라우저가 prefers-reduced-motion 으로 알려 줍니다.
     그때는 모핑 없이 바로 바꿉니다. 머리말 단추로 되돌릴 수 있습니다. */
  var systemReduced = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var motion = {
    force: null,
    on: function () { return motion.force === null ? !systemReduced : motion.force; },
    dur: function () { return motion.on() ? 1600 : 0; }
  };

  /* ── 좌표 ────────────────────────────────────────────────── */
  var M = T.meta;
  var PX = M.w / (M.lng1 - M.lng0);
  var PY = M.h / (M.lat1 - M.lat0);
  function p2x(lng) { return (lng - M.lng0) * PX; }
  function p2y(lat) { return (M.lat1 - lat) * PY; }

  function el(name, at) {
    var e = document.createElementNS(NS, name);
    for (var k in at) if (at[k] != null) e.setAttribute(k, at[k]);
    return e;
  }
  function ringPath(pts) {
    if (!pts || !pts.length) return '';
    var d = '';
    for (var i = 0; i < pts.length; i++) {
      d += (i ? 'L' : 'M') + p2x(pts[i][1]).toFixed(1) + ',' + p2y(pts[i][0]).toFixed(1);
    }
    return d + 'Z';
  }
  function normRings(pts) {
    if (!pts || !pts.length) return [];
    if (Array.isArray(pts[0]) && Array.isArray(pts[0][0])) return pts;
    return [pts];
  }
  function manyPath(rings) { return normRings(rings).map(ringPath).join(' '); }

  /* 경로 문자열에서 바로 테두리 상자를 잽니다 (그리기 전에도 알아야 하므로 DOM 을 쓰지 않습니다) */
  function boxOfD(d, into) {
    var b = into || { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    var n = d.match(/-?\d+(?:\.\d+)?/g);
    if (!n) return b;
    for (var i = 0; i + 1 < n.length; i += 2) {
      var x = +n[i], y = +n[i + 1];
      if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x;
      if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y;
    }
    return b;
  }

  /* ── 밑그림 (한 번만) ────────────────────────────────────── */
  function drawBase() {
    svg = $('mapSvg');
    svg.innerHTML = '';
    defs = el('defs');
    svg.appendChild(defs);

    svg.appendChild(el('rect', { x: -400, y: -400, width: M.w + 800, height: M.h + 800, class: 'sea' }));
    svg.appendChild(el('path', { d: manyPath(window.ASIA), class: 'land-far' }));
    svg.appendChild(el('path', { d: manyPath(window.KOREA), class: 'land' }));

    gTerr = el('g', { id: 'gTerr' });
    svg.appendChild(gTerr);
    gLabels = el('g', { id: 'gLabels' });      /* 라벨은 언제나 영토 위에 */
    svg.appendChild(gLabels);
  }

  /* 라벨 자리 — 가장 큰 조각의 중심입니다 (섬이 아니라 본토에 붙습니다) */
  function labelPos(d) {
    var rings = window.Morph.parseRings(d), best = null, bestA = -1;
    rings.forEach(function (r) {
      var a = 0, cx = 0, cy = 0, i;
      for (i = 0; i < r.length; i++) {
        var q = r[(i + 1) % r.length];
        a += r[i][0] * q[1] - q[0] * r[i][1];
        cx += r[i][0]; cy += r[i][1];
      }
      a = Math.abs(a / 2);
      if (a > bestA) { bestA = a; best = [cx / r.length, cy / r.length]; }
    });
    return best;
  }

  /* 확대해도 글자 크기는 그대로 두기 위해, 보이는 배율에 맞춰 글자 크기를 되돌립니다 */
  function svgRect() {
    if (!rectCache || !rectCache.width) rectCache = svg.getBoundingClientRect();
    return rectCache;
  }
  function paintLabelScale() {
    if (!gLabels || !view) return;
    var r = svgRect();
    if (!r.width) return;
    var s = Math.min(r.width / view[2], r.height / view[3]);
    gLabels.style.fontSize = (14 / s).toFixed(2) + 'px';
  }

  /* ── 나라 ────────────────────────────────────────────────── */
  function ensureNation(id) {
    if (live[id]) return live[id];
    var info = T.nations[id] || { name: id, color: '#888' };
    var g = el('g', { 'class': 'nat', 'data-id': id });
    /* 색은 CSS 규칙으로만 씁니다. fill 속성에 var() 를 쓰면 브라우저가 무시합니다. */
    g.style.setProperty('--nat', info.color);
    var fill = el('path', { 'class': 'nat-fill', d: '' });
    g.appendChild(fill);
    gTerr.appendChild(g);

    var label = el('text', { 'class': 'nat-label', x: 0, y: 0 });
    label.textContent = info.name;
    label.style.setProperty('--nat', info.color);
    gLabels.appendChild(label);

    return (live[id] = { g: g, fill: fill, label: label, d: '' });
  }

  function dropNation(id) {
    var o = live[id];
    if (!o) return;
    if (o.g.parentNode) o.g.parentNode.removeChild(o.g);
    if (o.label && o.label.parentNode) o.label.parentNode.removeChild(o.label);
    delete live[id];
  }

  function stopAnims() {
    anims.forEach(function (a) { a.cancel(); });
    anims = [];
    if (timer) { clearTimeout(timer); timer = null; }
  }

  /* ── 보이는 범위 · 줌 · 이동 ─────────────────────────────── */
  var view = null, viewAnim = 0;
  var MIN_W = 60, MAX_W = M.w * 2.4;

  function setView(v) {
    view = v;
    svg.setAttribute('viewBox', v.map(function (n) { return n.toFixed(1); }).join(' '));
    paintLabelScale();
  }
  function moveLabel(o, p) {
    if (!p) { o.label.setAttribute('opacity', 0); return; }
    o.label.setAttribute('opacity', 1);
    o.label.setAttribute('x', p[0].toFixed(1));
    o.label.setAttribute('y', p[1].toFixed(1));
  }

  function boxOfEra(id) {
    var b = null;
    framesOfEra(id).forEach(function (i) {
      T.frames[i].nations.forEach(function (n) { b = boxOfD(n.d, b || undefined); });
    });
    if (!b) {                       /* 나라가 없던 시대 — 한반도만 보여 줍니다 */
      normRings(window.KOREA).forEach(function (r) { b = boxOfD(ringPath(r), b || undefined); });
    }
    return b;
  }

  function fitBox(b) {
    var w = b.x1 - b.x0, h = b.y1 - b.y0;
    var padX = w * 0.10 + 24, padY = h * 0.10 + 24;
    return [b.x0 - padX, b.y0 - padY, w + padX * 2, h + padY * 2];
  }

  function fitTo(b, animate) {
    var to = fitBox(b);
    if (viewAnim) { cancelAnimationFrame(viewAnim); viewAnim = 0; }
    if (!view || !animate || !motion.on()) { setView(to); return; }
    var from = view.slice(), t0 = 0;
    (function f(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / 600, 1), e = 1 - Math.pow(1 - p, 3);
      setView([0, 1, 2, 3].map(function (k) { return from[k] + (to[k] - from[k]) * e; }));
      if (p < 1) viewAnim = requestAnimationFrame(f);
    })(0);
  }

  /* 화면 좌표 → 지도 좌표. preserveAspectRatio 가 xMidYMid meet 이라 여백을 빼야 합니다. */
  function toUser(clientX, clientY) {
    var r = svg.getBoundingClientRect();
    var s = Math.min(r.width / view[2], r.height / view[3]);
    var ox = (r.width - view[2] * s) / 2, oy = (r.height - view[3] * s) / 2;
    return [view[0] + (clientX - r.left - ox) / s, view[1] + (clientY - r.top - oy) / s];
  }

  function zoomBy(f, ux, uy) {
    if (viewAnim) { cancelAnimationFrame(viewAnim); viewAnim = 0; }
    var nw = Math.max(MIN_W, Math.min(MAX_W, view[2] * f));
    var k = nw / view[2];
    if (ux == null) { ux = view[0] + view[2] / 2; uy = view[1] + view[3] / 2; }
    setView([ux - (ux - view[0]) * k, uy - (uy - view[1]) * k, nw, view[3] * k]);
  }

  function bindZoom() {
    var pts = {}, start = null, pinch = null;

    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      var u = toUser(e.clientX, e.clientY);
      zoomBy(e.deltaY > 0 ? 1.15 : 1 / 1.15, u[0], u[1]);
    }, { passive: false });

    svg.addEventListener('pointerdown', function (e) {
      svg.setPointerCapture(e.pointerId);
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 1) {
        start = { x: e.clientX, y: e.clientY, view: view.slice() };
        svg.classList.add('dragging');
      } else if (ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), view: view.slice() };
        start = null;
      }
    });

    svg.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);

      if (ids.length >= 2 && pinch) {          /* 두 손가락 — 벌리고 오므리기 */
        var a = pts[ids[0]], b = pts[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 4 && pinch.dist > 4) {
          var mid = toUser((a.x + b.x) / 2, (a.y + b.y) / 2);
          zoomBy(pinch.dist / d, mid[0], mid[1]);
          pinch.dist = d;
        }
        return;
      }
      if (!start) return;                       /* 한 손가락 · 끌기 — 이동 */
      var r = svg.getBoundingClientRect();
      var s = Math.min(r.width / start.view[2], r.height / start.view[3]);
      setView([start.view[0] - (e.clientX - start.x) / s,
               start.view[1] - (e.clientY - start.y) / s,
               start.view[2], start.view[3]]);
    });

    function up(e) {
      delete pts[e.pointerId];
      if (Object.keys(pts).length < 2) pinch = null;
      if (!Object.keys(pts).length) { start = null; svg.classList.remove('dragging'); }
    }
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);

    $('zoomIn').addEventListener('click', function () { zoomBy(1 / 1.3); });
    $('zoomOut').addEventListener('click', function () { zoomBy(1.3); });
    $('zoomFit').addEventListener('click', function () { fitTo(boxOfEra(eraId), true); });
  }

  /* ── 프레임 보이기 ───────────────────────────────────────── */
  /* fresh = true 이면 이전 모양을 물려받지 않고 새로 그립니다 (다시 재생). */
  function showFrame(i, animate, fresh) {
    var f = T.frames[i];
    if (!f) return;
    var prev = frameIdx >= 0 ? T.frames[frameIdx] : null;
    frameIdx = i;

    /* 조선 전기부터 그 이후는 영토가 같아 전환을 두지 않습니다 (데이터의 still) */
    var dur = (f.still || !animate || !motion.on()) ? 0 : motion.dur();

    var prevD = {};
    if (prev && !fresh) prev.nations.forEach(function (n) { prevD[n.id] = n.d; });
    var here = {};
    f.nations.forEach(function (n) { here[n.id] = n.d; });

    /* 이름이 사라진 나라 — 오므라들며 사라집니다 */
    Object.keys(live).forEach(function (id) {
      if (here[id]) return;
      var o = live[id];
      o.g.classList.add('going');
      if (!dur) { dropNation(id); return; }
      anims.push(window.Morph.run({
        from: o.d, to: '', duration: dur,
        onFrame: function (d, u) {
          o.fill.setAttribute('d', d);
          o.label.setAttribute('opacity', (1 - u).toFixed(2));
        },
        onDone: function () { dropNation(id); }
      }));
    });

    /* 이번 장면의 나라 — 같은 이름이면 이전 모양에서 흘러갑니다 */
    f.nations.forEach(function (n) {
      var o = ensureNation(n.id);
      o.g.classList.remove('going');
      /* 같은 나라라도 장면마다 이름표가 다를 수 있습니다 (7세기 신라 → 통일신라) */
      o.label.textContent = n.as || (T.nations[n.id] || {}).name || n.id;
      var from = prevD[n.id] || o.d || '';
      var pTo = labelPos(n.d);
      if (!dur) {
        o.fill.setAttribute('d', n.d);
        moveLabel(o, pTo);
        o.d = n.d;
        return;
      }
      var pFrom = from ? labelPos(from) : pTo;
      anims.push(window.Morph.run({
        from: from, to: n.d, duration: dur,
        onFrame: function (d, u) {
          o.fill.setAttribute('d', d);
          var t = window.Morph.ease(u);
          moveLabel(o, [pFrom[0] + (pTo[0] - pFrom[0]) * t, pFrom[1] + (pTo[1] - pFrom[1]) * t]);
          if (!from) o.label.setAttribute('opacity', u.toFixed(2));
        }
      }));
      o.d = n.d;
    });

    paintChrome(f);
  }

  /* ── 시대 재생 ───────────────────────────────────────────── */
  function framesOfEra(id) {
    var out = [];
    T.frames.forEach(function (f, i) { if (f.eras.indexOf(id) >= 0) out.push(i); });
    return out;
  }

  /* 재생은 시대에서 멈추지 않고 다음 시대로 이어집니다.
     고조선 → 4 → 5 → 6 → 7 → 10 → 11 → 12 → 조선 이 한 줄로 흘러갑니다. */
  function playFrom(i, fresh) {
    stopAnims();
    playing = true;
    queue = [];
    for (var k = i; k < T.frames.length; k++) queue.push(k);
    paintPlay();
    stepAll(fresh);
  }

  function stepAll(fresh) {
    var i = queue.shift();
    if (i == null) { playing = false; paintPlay(); return; }
    var f = T.frames[i];

    /* 한 장면이 여러 시대에 걸치면(조선 전기~6·25) 지금 보고 있던 시대를 그대로 둡니다 */
    var era = (eraId && f.eras.indexOf(eraId) >= 0) ? eraId : f.eras[0];
    if (era !== eraId) { var had = !!view; eraId = era; fitTo(boxOfEra(era), had); }

    showFrame(i, true, fresh);
    if (queue.length) {
      timer = setTimeout(function () { stepAll(false); }, (f.still ? 0 : motion.dur()) + 900);
    } else {
      playing = false;
      paintPlay();
    }
  }

  function stopPlay() {
    stopAnims();
    playing = false;
    paintPlay();
  }

  function playEra(id, fresh) {
    var list = framesOfEra(id);
    var had = !!view;
    eraId = id;

    if (!list.length) {              // 구석기·신석기 — 나라가 없던 때
      stopPlay();
      fitTo(boxOfEra(id), had);
      Object.keys(live).forEach(function (nid) {
        var o = live[nid];
        o.g.classList.add('going');
        if (!motion.on()) { dropNation(nid); return; }
        anims.push(window.Morph.run({
          from: o.d, to: '', duration: motion.dur(),
          onFrame: function (d, u) {
            o.fill.setAttribute('d', d);
            o.label.setAttribute('opacity', (1 - u).toFixed(2));
          },
          onDone: function () { dropNation(nid); }
        }));
      });
      frameIdx = -1;
      paintChrome(null);
      return;
    }

    fitTo(boxOfEra(id), had);
    playFrom(list[0], fresh);
  }

  function paintPlay() {
    var b = $('pause');
    if (!b) return;
    b.textContent = playing ? '멈춤' : '이어보기';
    b.classList.toggle('on', playing);
  }

  /* ── 화면 글씨 ───────────────────────────────────────────── */
  function eraOf(id) {
    for (var i = 0; i < ERAS.length; i++) if (ERAS[i].id === id) return ERAS[i];
    return null;
  }

  function paintChrome(f) {
    var e = eraOf(eraId);
    $('eraName').textContent = e ? e.name : '';
    $('eraYears').textContent = e ? e.years : '';
    $('eraSpan').textContent = e ? e.span : '';

    var cent = $('centLabel');
    if (f) { cent.textContent = f.label; cent.hidden = false; }
    else { cent.hidden = true; }

    var legend = $('legend');
    legend.innerHTML = '';
    if (f) {
      f.nations.forEach(function (n) {
        var info = T.nations[n.id] || { name: n.id, color: '#888' };
        var b = document.createElement('span');
        b.className = 'lg';
        b.style.setProperty('--nat', info.color);
        b.textContent = n.as || info.name;
        legend.appendChild(b);
      });
    } else {
      var p = document.createElement('span');
      p.className = 'lg-none';
      p.textContent = '나라가 세워지기 전입니다 — 땅만 보입니다';
      legend.appendChild(p);
    }

    paintDots();
    [].forEach.call(document.querySelectorAll('#track .tl-btn'), function (b) {
      b.classList.toggle('on', b.dataset.era === eraId);
    });
  }

  function paintDots() {
    var wrap = $('dots');
    wrap.innerHTML = '';
    var list = framesOfEra(eraId);
    if (list.length < 2) return;
    list.forEach(function (i) {
      var f = T.frames[i];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot' + (i === frameIdx ? ' on' : '');
      b.textContent = f.label;
      b.addEventListener('click', function () { stopPlay(); queue = []; showFrame(i, true); });
      wrap.appendChild(b);
    });
  }

  /* ── 타임라인 ────────────────────────────────────────────── */
  function buildTrack() {
    var track = $('track');
    track.innerHTML = '';
    ERAS.forEach(function (e) {
      var has = framesOfEra(e.id).length > 0;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tl-btn' + (has ? '' : ' bare');
      b.dataset.era = e.id;
      b.innerHTML = '<b>' + e.short + '</b>';
      b.addEventListener('click', function () { playEra(e.id); });
      track.appendChild(b);
    });
  }

  /* ── 자기 검사 ───────────────────────────────────────────── */
  function selftest() {
    var bad = [], rows = [];
    T.frames.forEach(function (f, i) {
      showFrame(i, false);
      var got = f.nations.map(function (n) {
        if (!n.d || n.d.length < 20) bad.push(f.key + '/' + n.id + ' — 경로가 비었습니다');
        if (!T.nations[n.id]) bad.push(f.key + '/' + n.id + ' — 나라 정의가 없습니다');
        var box = live[n.id] ? live[n.id].fill.getBBox() : null;
        if (!box || !box.width || !box.height) bad.push(f.key + '/' + n.id + ' — 그려지지 않았습니다');
        return n.id + '(' + (n.d.match(/M/g) || []).length + '조각)';
      });
      rows.push(f.key + ' ' + f.label + (f.still ? ' [전환없음]' : '') +
                ' [' + f.eras.join(',') + '] ' + got.join(' '));
    });

    /* 모핑 계획이 실제로 짝을 찾는지 — 이어지는 나라마다 확인합니다 */
    var morphRows = [];
    for (var i = 1; i < T.frames.length; i++) {
      var a = {}, f0 = T.frames[i - 1], f1 = T.frames[i];
      f0.nations.forEach(function (n) { a[n.id] = n.d; });
      f1.nations.forEach(function (n) {
        if (!a[n.id]) return;
        var p = window.Morph.plan(a[n.id], n.d);
        if (!p.pairs.length) bad.push(f0.key + '→' + f1.key + '/' + n.id + ' — 짝지어진 조각이 없습니다');
        morphRows.push(f0.key + '→' + f1.key + ' ' + n.id +
                       ' 짝 ' + p.pairs.length + ' · 사라짐 ' + p.gone.length + ' · 생김 ' + p.born.length);
      });
    }
    ERAS.forEach(function (e) {
      if (!framesOfEra(e.id).length && e.id !== 'paleo' && e.id !== 'neo') {
        bad.push('시대 ' + e.id + ' 에 영토 프레임이 없습니다');
      }
    });

    rows.forEach(function (r) { console.log('  ' + r); });
    morphRows.forEach(function (r) { console.log('  · ' + r); });
    console.log('[SELFTEST] ' + JSON.stringify({
      frames: T.frames.length, nations: Object.keys(T.nations).length, bad: bad
    }));
  }

  /* ── 시작 ────────────────────────────────────────────────── */
  function start() {
    if (!T || !window.ERAS || !window.KOREA || !window.Morph) {
      console.error('[map2] 자료가 없습니다 — script 순서를 확인하세요');
      return;
    }
    drawBase();
    window.addEventListener('resize', function () { rectCache = null; paintLabelScale(); });
    setView([0, 0, M.w, M.h]);
    buildTrack();
    bindZoom();

    $('replay').addEventListener('click', function () {   /* 고조선부터 조선까지 죽 */
      eraId = T.frames[0].eras[0];
      fitTo(boxOfEra(eraId), !!view);
      playFrom(0, true);
    });
    $('pause').addEventListener('click', function () {
      if (playing) { stopPlay(); return; }
      var next = frameIdx + 1;
      if (next >= T.frames.length) next = 0;
      playFrom(next, next === 0);
    });

    var q = new URLSearchParams(location.search);
    var m = q.get('motion');
    if (m === 'on') motion.force = true;
    else if (m === 'off') motion.force = false;
    console.log('[map2] 모핑 ' + (motion.on() ? '켜짐' : '꺼짐') +
                ' · 시스템 prefers-reduced-motion=' + systemReduced);

    var mb = $('motion');
    function paintMotion() {
      mb.textContent = motion.on() ? '모핑 끄기' : '모핑 켜기';
      mb.classList.toggle('on', motion.on());
    }
    mb.addEventListener('click', function () {
      motion.force = !motion.on();
      paintMotion();
      playEra(eraId, true);
    });
    paintMotion();

    if (q.get('selftest')) { eraId = 'three'; selftest(); return; }

    var want = q.get('era') || 'three';       // 처음에는 삼국시대에서 시작해 끝까지 이어집니다
    playEra(eraOf(want) ? want : 'three');
    paintPlay();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.Map2 = { showFrame: showFrame, playEra: playEra, selftest: selftest };
})();
