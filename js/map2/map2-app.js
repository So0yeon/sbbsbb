// © 2026 김용현
/* 지도 모드 v2 — 시대별 영토 애니메이션
   기존 지도(js/map-app.js)는 건드리지 않습니다. 이 파일은 map2.html 에서만 씁니다.
   의존: js/atlas-geo.js (해안선) · js/map-data.js (13시대) · js/map2/territory-data.js · js/map2/tide.js */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var T = window.TERRITORY;
  var ERAS = window.ERAS || [];
  var $ = function (id) { return document.getElementById(id); };

  var svg, defs, gTerr;
  var live = {};          // 화면에 올라와 있는 나라 — id → { g, dim, lit, edge, keep, wave }
  var anims = [];         // 돌고 있는 애니메이션
  var timer = null;       // 다음 프레임 예약
  var frameIdx = -1;
  var eraId = null;
  var queue = [];         // 이 시대에서 남은 프레임

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

  /* 경로 문자열에서 바로 테두리 상자를 잽니다 (그리기 전에도 알 수 있어야 하므로 DOM 을 쓰지 않습니다).
     굽어 나온 경로는 "M x y L x y … Z" 뿐이라 숫자만 짝지으면 됩니다. */
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
    svg.setAttribute('viewBox', '0 0 ' + M.w + ' ' + M.h);
    svg.innerHTML = '';

    defs = el('defs');
    svg.appendChild(defs);

    svg.appendChild(el('rect', { x: -400, y: -400, width: M.w + 800, height: M.h + 800, class: 'sea' }));
    svg.appendChild(el('path', { d: manyPath(window.ASIA), class: 'land-far' }));
    svg.appendChild(el('path', { d: manyPath(window.KOREA), class: 'land' }));

    gTerr = el('g', { id: 'gTerr' });
    svg.appendChild(gTerr);
  }

  /* ── 나라 한 겹 만들기 ───────────────────────────────────── */
  function ensureNation(id) {
    if (live[id]) return live[id];
    var info = T.nations[id] || { name: id, color: '#888' };

    var keep = el('path', { d: '' });     // 이전 영토 — 계속 켜져 있는 부분
    var wave = el('path', { d: '' });     // 물결 영역 — 새로 차오르는 부분
    var clip = el('clipPath', { id: 'clip-' + id, clipPathUnits: 'userSpaceOnUse' });
    clip.appendChild(keep);
    clip.appendChild(wave);
    defs.appendChild(clip);

    var g = el('g', { 'class': 'nat', 'data-id': id });
    /* 색은 CSS 규칙으로만 씁니다. fill 속성에 var() 를 쓰면 브라우저가 무시합니다. */
    g.style.setProperty('--nat', info.color);
    var dim = el('path', { 'class': 'nat-dim', d: '' });
    var lit = el('path', { 'class': 'nat-lit', d: '', 'clip-path': 'url(#clip-' + id + ')' });
    var edge = el('path', { 'class': 'nat-edge', d: '' });
    g.appendChild(dim); g.appendChild(lit); g.appendChild(edge);
    gTerr.appendChild(g);

    return (live[id] = { g: g, dim: dim, lit: lit, edge: edge, keep: keep, wave: wave, clip: clip });
  }

  function dropNation(id) {
    var o = live[id];
    if (!o) return;
    if (o.g.parentNode) o.g.parentNode.removeChild(o.g);
    if (o.clip.parentNode) o.clip.parentNode.removeChild(o.clip);
    delete live[id];
  }

  function stopAnims() {
    anims.forEach(function (a) { a.cancel(); });
    anims = [];
    if (timer) { clearTimeout(timer); timer = null; }
  }

  /* ── 보이는 범위 ─────────────────────────────────────────── */
  var view = null, viewAnim = 0;

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

  function setView(v) {
    view = v;
    svg.setAttribute('viewBox', v.map(function (n) { return n.toFixed(1); }).join(' '));
  }

  function fitTo(b, animate) {
    var w = b.x1 - b.x0, h = b.y1 - b.y0;
    var padX = w * 0.10 + 24, padY = h * 0.10 + 24;
    var to = [b.x0 - padX, b.y0 - padY, w + padX * 2, h + padY * 2];
    if (!view || !animate || window.Tide.reduced) { setView(to); return; }
    var from = view.slice(), t0 = 0;
    if (viewAnim) cancelAnimationFrame(viewAnim);
    (function f(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / 600, 1), e = 1 - Math.pow(1 - p, 3);
      setView([0, 1, 2, 3].map(function (k) { return from[k] + (to[k] - from[k]) * e; }));
      if (p < 1) viewAnim = requestAnimationFrame(f);
    })(0);
  }

  /* ── 프레임 보이기 ───────────────────────────────────────── */
  /* fresh = true 이면 이전 영토를 물려받지 않고 바닥부터 다시 채웁니다 (시대를 바꿀 때). */
  function showFrame(i, animate, fresh) {
    var f = T.frames[i];
    if (!f) return;
    var prev = frameIdx >= 0 ? T.frames[frameIdx] : null;
    frameIdx = i;

    var prevD = {};
    if (prev) prev.nations.forEach(function (n) { prevD[n.id] = n.d; });
    var here = {};
    f.nations.forEach(function (n) { here[n.id] = n.d; });

    /* 이름이 사라진 나라 — 물이 빠지며 사라집니다 */
    Object.keys(live).forEach(function (id) {
      if (here[id]) return;
      var o = live[id];
      o.keep.setAttribute('d', '');
      o.g.classList.add('going');
      if (!animate) { dropNation(id); return; }
      var box = o.dim.getBBox();
      anims.push(window.Tide.run({
        box: box, dir: 'out',
        onFrame: function (d) { o.wave.setAttribute('d', d); },
        onDone: function () { dropNation(id); }
      }));
    });

    /* 이번 시대의 나라 */
    f.nations.forEach(function (n) {
      var o = ensureNation(n.id);
      o.g.classList.remove('going');
      o.dim.setAttribute('d', n.d);
      o.lit.setAttribute('d', n.d);
      o.edge.setAttribute('d', n.d);
      /* 같은 이름이 이어지면 이전 영토는 켜진 채로 두고, 넓어진 곳만 차오르게 합니다.
         clipPath 는 자식 도형의 합집합이라 이것만으로 됩니다. 영토가 줄어든 경우에는
         켜진 겹 자체가 새 영토라 이전 영역이 되살아나지 않습니다. */
      o.keep.setAttribute('d', fresh ? '' : (prevD[n.id] || ''));

      var box = o.dim.getBBox();
      if (!animate) {
        o.wave.setAttribute('d', window.Tide.fill(box));
        return;
      }
      anims.push(window.Tide.run({
        box: box, dir: 'in',
        onFrame: function (d) { o.wave.setAttribute('d', d); }
      }));
    });

    paintChrome(f);
  }

  /* ── 시대 재생 ───────────────────────────────────────────── */
  function framesOfEra(id) {
    var out = [];
    T.frames.forEach(function (f, i) { if (f.eras.indexOf(id) >= 0) out.push(i); });
    return out;
  }

  function playEra(id, fromIdx) {
    stopAnims();
    var had = !!view;
    eraId = id;
    queue = framesOfEra(id);
    fitTo(boxOfEra(id), had);

    if (!queue.length) {              // 구석기·신석기 — 나라가 없던 때
      Object.keys(live).forEach(function (nid) {
        var o = live[nid], box = o.dim.getBBox();
        anims.push(window.Tide.run({
          box: box, dir: 'out',
          onFrame: function (d) { o.wave.setAttribute('d', d); },
          onDone: function () { dropNation(nid); }
        }));
      });
      frameIdx = -1;
      paintChrome(null);
      return;
    }

    var start = 0;
    if (fromIdx != null) {
      var at = queue.indexOf(fromIdx);
      if (at >= 0) start = at;
    }
    queue = queue.slice(start);
    step(true);
  }

  /* 시대의 첫 장면은 바닥부터 차오르고, 그 다음 세기는 넓어진 곳만 이어서 찹니다. */
  function step(fresh) {
    var i = queue.shift();
    if (i == null) return;
    showFrame(i, true, fresh);
    if (queue.length) {
      timer = setTimeout(function () { step(false); }, window.Tide.CFG.duration + 900);
    }
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
    if (f) {
      cent.textContent = f.label;
      cent.hidden = false;
      cent.classList.toggle('borrowed', !!f.src);
      cent.title = f.src ? f.src + ' 자료를 그대로 씁니다' : '';
    } else {
      cent.hidden = true;
    }

    var legend = $('legend');
    legend.innerHTML = '';
    if (f) {
      f.nations.forEach(function (n) {
        var info = T.nations[n.id] || { name: n.id, color: '#888' };
        var b = document.createElement('span');
        b.className = 'lg';
        b.style.setProperty('--nat', info.color);
        b.textContent = info.name;
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
      b.addEventListener('click', function () { stopAnims(); queue = []; showFrame(i, true); });
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
    var out = { frames: T.frames.length, nations: Object.keys(T.nations).length, rows: [], bad: [] };
    T.frames.forEach(function (f, i) {
      showFrame(i, false);
      var got = f.nations.map(function (n) {
        if (!n.d || n.d.length < 20) out.bad.push(f.key + '/' + n.id + ' — 경로가 비었습니다');
        if (!T.nations[n.id]) out.bad.push(f.key + '/' + n.id + ' — 나라 정의가 없습니다');
        var box = live[n.id] ? live[n.id].dim.getBBox() : null;
        if (!box || !box.width || !box.height) out.bad.push(f.key + '/' + n.id + ' — 그려지지 않았습니다');
        return n.id + '(' + (n.d.match(/M/g) || []).length + '조각)';
      });
      out.rows.push(f.key + ' ' + f.label + ' [' + f.eras.join(',') + '] ' + got.join(' '));
    });
    ERAS.forEach(function (e) {
      if (!framesOfEra(e.id).length && e.id !== 'paleo' && e.id !== 'neo') {
        out.bad.push('시대 ' + e.id + ' 에 영토 프레임이 없습니다');
      }
    });
    out.rows.forEach(function (r) { console.log('  ' + r); });
    console.log('[SELFTEST] ' + JSON.stringify({ frames: out.frames, nations: out.nations, bad: out.bad }));
    return out;
  }

  /* ── 시작 ────────────────────────────────────────────────── */
  function start() {
    if (!T || !window.ERAS || !window.KOREA) {
      console.error('[map2] 자료가 없습니다 — script 순서를 확인하세요');
      return;
    }
    drawBase();
    buildTrack();

    $('replay').addEventListener('click', function () { playEra(eraId); });

    var q = new URLSearchParams(location.search);
    if (q.get('selftest')) { eraId = 'three'; selftest(); return; }

    var want = q.get('era') || 'three';       // 처음에는 삼국시대 — 4→5세기가 이어집니다
    playEra(eraOf(want) ? want : 'three');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.Map2 = { showFrame: showFrame, playEra: playEra, selftest: selftest };
})();
