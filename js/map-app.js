// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   map-app.js — 지도 모드 (2D SVG)

   좌표는 [위도, 경도] 순서 (MASTER §7-1).
   나라 영역은 clipPath 로 자른다 — kr:1 이면 한반도, 아니면 대륙 (§7-3).
   clipPath 안에 <g> 를 넣지 않는다. 오류가 나지 않고 조용히 사라진다.

   문체 — 지도 모드 설명은 ~해요체 그대로 (설계 §1-1).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var S = window.AtlasStore;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var NS = 'http://www.w3.org/2000/svg';

  var eraIdx = 0;
  var activeCats = null;          // null = 전부
  var view = null;                // { x, y, w, h }
  var svg, root;

  /* ── 좌표 → SVG 경로 ─────────────────────────────────────── */
  function pathOf(pts) {
    if (!pts || !pts.length) return '';
    var d = '';
    for (var i = 0; i < pts.length; i++) {
      d += (i ? 'L' : 'M') + px(pts[i][1]).toFixed(1) + ',' + py(pts[i][0]).toFixed(1);
    }
    return d + 'Z';
  }
  function pathOfMany(rings) {
    return rings.map(pathOf).join(' ');
  }

  /* 여러 폐곡선을 합친 배열도 받는다 (제주도가 포함된 나라 영역 등) */
  function normRings(pts) {
    if (!pts || !pts.length) return [];
    if (Array.isArray(pts[0]) && Array.isArray(pts[0][0])) return pts;   // 이미 여러 겹
    return [pts];
  }

  /* ══════════════════════════════════════════════════════════
     한 번만 그리는 것 — 바다·육지·클립
     ══════════════════════════════════════════════════════════ */
  function drawBase() {
    svg.innerHTML = '';

    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML =
      '<clipPath id="krClip">' + normRings(window.KOREA).map(function (r) {
        return '<path d="' + pathOf(r) + '"/>';
      }).join('') + '</clipPath>' +
      '<clipPath id="landClip">' +
        normRings(window.ASIA).map(function (r) { return '<path d="' + pathOf(r) + '"/>'; }).join('') +
        normRings(window.KOREA).map(function (r) { return '<path d="' + pathOf(r) + '"/>'; }).join('') +
      '</clipPath>';
    svg.appendChild(defs);

    root = document.createElementNS(NS, 'g');
    root.setAttribute('id', 'mapRoot');
    svg.appendChild(root);

    var sea = document.createElementNS(NS, 'rect');
    sea.setAttribute('x', -400); sea.setAttribute('y', -400);
    sea.setAttribute('width', 1600); sea.setAttribute('height', 1800);
    sea.setAttribute('fill', 'var(--sea)');
    root.appendChild(sea);

    add(root, 'path', { d: pathOfMany(normRings(window.ASIA)), class: 'land-far' });
    add(root, 'path', { d: pathOfMany(normRings(window.KOREA)), class: 'land' });

    ['gTerr', 'gRel', 'gLabel', 'gMk'].forEach(function (id) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('id', id);
      root.appendChild(g);
    });
  }

  function add(parent, tag, attrs, text) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (text != null) el.textContent = text;
    parent.appendChild(el);
    return el;
  }

  /* ══════════════════════════════════════════════════════════
     시대 그리기
     ══════════════════════════════════════════════════════════ */
  function drawEra() {
    var era = window.ERAS[eraIdx];
    if (!era) return;

    document.documentElement.style.setProperty('--era-accent', era.accent || '#6E9B94');
    $('mapEraName').textContent = era.name;
    $('eraYears').textContent = era.years || '';
    $('eraTitle').textContent = era.name;
    $('eraSpan').textContent = era.span || '';
    $('eraLine').textContent = era.line || '';

    var gT = $('gTerr'), gR = $('gRel'), gL = $('gLabel'), gM = $('gMk');
    [gT, gR, gL, gM].forEach(function (g) { g.innerHTML = ''; });

    /* 나라 영역 */
    (era.terr || []).forEach(function (t) {
      var rings = normRings(t.pts);
      if (!rings.length) return;
      var dashed = /고조선/.test(t.n || '');       // 학계가 합의하지 못한 경계는 점선 (§7-3)
      add(gT, 'path', {
        d: pathOfMany(rings),
        class: 'terr' + (dashed ? ' dashed' : ''),
        fill: t.c || '#7B6A55',
        stroke: t.c || '#7B6A55',
        'clip-path': t.kr ? 'url(#krClip)' : 'url(#landClip)'
      });
      if (t.at) add(gL, 'text', {
        x: px(t.at[1]), y: py(t.at[0]), class: 'terr-label',
        fill: t.c || '#7B6A55', 'text-anchor': 'middle'
      }, t.n);
      if (t.cap && t.cap.at) {
        add(gL, 'circle', { cx: px(t.cap.at[1]), cy: py(t.cap.at[0]), r: 3.4, fill: '#191919' });
        add(gL, 'text', {
          x: px(t.cap.at[1]), y: py(t.cap.at[0]) - 7, class: 'cap-label', 'text-anchor': 'middle'
        }, '◉ ' + t.cap.n);
      }
    });

    /* 이웃 나라 라벨 */
    (era.nb || []).forEach(function (n) {
      if (!n.at) return;
      add(gL, 'text', { x: px(n.at[1]), y: py(n.at[0]), class: 'nb-label', 'text-anchor': 'middle' }, n.n);
    });

    /* 교류선 */
    (era.rel || []).forEach(function (r) {
      if (!r.from || !r.to) return;
      var x1 = px(r.from[1]), y1 = py(r.from[0]), x2 = px(r.to[1]), y2 = py(r.to[0]);
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      var dx = x2 - x1, dy = y2 - y1;
      var b = (r.bend || 0);
      var cx = mx - dy * b, cy = my + dx * b;
      var p = add(gR, 'path', {
        d: 'M' + x1 + ',' + y1 + ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + x2 + ',' + y2,
        class: 'rel-line', stroke: era.accent || '#7C6BA8'
      });
      p.style.cursor = 'pointer';
      p.addEventListener('click', function () { openRel(r, era); });
    });

    drawMarkers();
    fitTo(era.view);
    drawTimeline();
    drawFilter();
    drawList();
    updateBagCount();
  }

  /* ── 항목 마커 ───────────────────────────────────────────── */
  function itemsOfEra() {
    var era = window.ERAS[eraIdx];
    return (window.CONTENT || []).filter(function (c) {
      if (c.era !== era.id) return false;
      if (window.ATLAS_DUP_HIDDEN && window.ATLAS_DUP_HIDDEN[c.id]) return false;
      if (activeCats && !(c.cat || []).some(function (k) { return activeCats[k]; })) return false;
      return true;
    });
  }

  function catColor(k) {
    var m = { relic: '#7B6A55', person: '#3F6B8C', culture: '#3E8A78',
              event: '#A8534F', exchange: '#7C6BA8', life: '#8A7B4E' };
    return m[k] || '#7B6A55';
  }
  var CAT_LABEL = { relic: '유물·유적', person: '인물', culture: '문화',
                    event: '사건', exchange: '교류', life: '생활문화' };

  function drawMarkers() {
    var gM = $('gMk');
    gM.innerHTML = '';
    var placed = [];

    itemsOfEra().forEach(function (c) {
      if (!c.at) return;
      var x = px(c.at[1]), y = py(c.at[0]);
      var col = catColor((c.cat || [])[0]);
      var got = S.bagHas(c.id);

      var g = add(gM, 'g', { class: 'mk' + (got ? ' got' : ''), tabindex: '0',
                             role: 'button', 'aria-label': c.t });
      add(g, 'circle', { class: 'hit', cx: x, cy: y, r: 14 });          // 터치 영역을 크게 (§8-2)
      add(g, 'circle', { class: 'dot', cx: x, cy: y, r: got ? 6 : 5,
                         fill: got ? col : '#FDFDFB', stroke: col });

      // 라벨은 겹치면 뺀다. 점은 남긴다 (§7-4)
      var slot = [[0, -11], [0, 17], [0, -21]];
      var ok = null;
      for (var i = 0; i < slot.length; i++) {
        var lx = x + slot[i][0], ly = y + slot[i][1];
        if (!placed.some(function (p) { return Math.abs(p[0] - lx) < 46 && Math.abs(p[1] - ly) < 12; })) {
          ok = [lx, ly]; break;
        }
      }
      if (ok) {
        placed.push(ok);
        add(g, 'text', { x: ok[0], y: ok[1], 'text-anchor': 'middle' }, c.t);
      }

      g.addEventListener('click', function () { openItem(c); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(c); }
      });
    });
  }

  /* ── 옆 목록 ─────────────────────────────────────────────── */
  function drawList() {
    var box = $('itemList');
    var list = itemsOfEra();
    if (!list.length) { box.innerHTML = '<p class="muted">이 시대에는 볼 항목이 없어요.</p>'; return; }
    box.innerHTML = list.map(function (c) {
      var col = catColor((c.cat || [])[0]);
      return '<button class="item-row ' + (S.bagHas(c.id) ? 'got' : '') + '" data-id="' + esc(c.id) + '" type="button">' +
        '<span class="item-bar" style="background:' + col + '"></span>' +
        '<span class="item-txt"><b>' + esc(c.t) + '</b><span>' + esc(c.d || '') + '</span></span></button>';
    }).join('');
    box.querySelectorAll('.item-row').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = (window.CONTENT || []).find(function (x) { return x.id === b.dataset.id; });
        if (c) { focusOn(c); openItem(c); }
      });
    });
  }

  /* ── 분류 필터 ───────────────────────────────────────────── */
  function drawFilter() {
    var box = $('catFilter');
    var keys = ['relic', 'person', 'culture', 'event', 'exchange', 'life'];
    box.innerHTML = keys.map(function (k) {
      var on = !activeCats || activeCats[k];
      return '<button class="cat-chip ' + (on ? 'on' : '') + '" data-k="' + k + '" type="button" ' +
        (on ? 'style="background:' + catColor(k) + '"' : '') + '>' +
        '<span class="cat-dot" style="background:' + (on ? '#fff' : catColor(k)) + '"></span>' +
        CAT_LABEL[k] + '</button>';
    }).join('') + '<button class="cat-chip" id="catAll" type="button">전체</button>';

    box.querySelectorAll('.cat-chip[data-k]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!activeCats) {
          activeCats = { relic: 0, person: 0, culture: 0, event: 0, exchange: 0, life: 0 };
          activeCats[b.dataset.k] = 1;
        } else {
          activeCats[b.dataset.k] = activeCats[b.dataset.k] ? 0 : 1;
          if (keys.every(function (k) { return !activeCats[k]; })) activeCats = null;
        }
        drawFilter(); drawMarkers(); drawList();
      });
    });
    $('catAll').addEventListener('click', function () {
      activeCats = null; drawFilter(); drawMarkers(); drawList();
    });
  }

  /* ── 타임라인 ────────────────────────────────────────────── */
  function unitOf(i) {
    return i <= 6 ? '1단원 · 선사 시대 ~ 고려'
         : (i <= 9 ? '2단원 · 조선과 개항' : '3단원 · 일제강점기 ~ 6·25');
  }
  function drawTimeline() {
    var track = $('mapTrack');
    var html = '', lastUnit = '';
    (window.ERAS || []).forEach(function (e, i) {
      var u = unitOf(i);
      if (u !== lastUnit) { html += '<span class="tl-unit">' + u + '</span>'; lastUnit = u; }
      html += '<button class="tl-btn ' + (i === eraIdx ? 'on' : '') + '" data-i="' + i + '" type="button">' +
        '<b>' + esc(e.short || e.name) + '</b><small>' + esc(e.years || '') + '</small></button>';
    });
    track.innerHTML = html;
    track.querySelectorAll('.tl-btn').forEach(function (b) {
      b.addEventListener('click', function () { setEra(+b.dataset.i); });
    });
    var on = track.querySelector('.tl-btn.on');
    if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  /* ── 화면 이동 ───────────────────────────────────────────── */
  function fitTo(v) {
    if (!v) { view = { x: 0, y: 0, w: MAP.w, h: MAP.h }; applyView(); return; }
    var x1 = px(v[1]), x2 = px(v[3]), y1 = py(v[2]), y2 = py(v[0]);
    var pad = 26;
    var x = Math.min(x1, x2) - pad, y = Math.min(y1, y2) - pad;
    var w = Math.abs(x2 - x1) + pad * 2, h = Math.abs(y2 - y1) + pad * 2;
    var ratio = MAP.w / MAP.h;
    if (w / h > ratio) { var nh = w / ratio; y -= (nh - h) / 2; h = nh; }
    else { var nw = h * ratio; x -= (nw - w) / 2; w = nw; }
    view = { x: x, y: y, w: w, h: h };
    applyView(true);
  }
  function applyView(animate) {
    if (!view) return;
    svg.style.transition = animate ? 'none' : '';
    svg.setAttribute('viewBox', [view.x, view.y, view.w, view.h].map(function (n) { return n.toFixed(1); }).join(' '));
  }
  function zoom(k, cx, cy) {
    if (!view) return;
    var nw = Math.max(90, Math.min(MAP.w * 1.6, view.w * k));
    var nh = nw * (view.h / view.w);
    var fx = cx == null ? .5 : cx, fy = cy == null ? .5 : cy;
    view.x += (view.w - nw) * fx;
    view.y += (view.h - nh) * fy;
    view.w = nw; view.h = nh;
    applyView();
  }
  function focusOn(c) {
    if (!c.at || !view) return;
    view.x = px(c.at[1]) - view.w / 2;
    view.y = py(c.at[0]) - view.h / 2;
    applyView();
  }

  function bindPan() {
    var id = null, sx = 0, sy = 0, ox = 0, oy = 0;
    svg.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.mk')) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; ox = view.x; oy = view.y;
      svg.classList.add('dragging');
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove', function (e) {
      if (id !== e.pointerId || !view) return;
      var r = svg.getBoundingClientRect();
      view.x = ox - (e.clientX - sx) * (view.w / r.width);
      view.y = oy - (e.clientY - sy) * (view.h / r.height);
      applyView();
    });
    var end = function (e) { if (id === e.pointerId) { id = null; svg.classList.remove('dragging'); } };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);

    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = svg.getBoundingClientRect();
      zoom(e.deltaY > 0 ? 1.12 : 0.89, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    }, { passive: false });

    $('zoomIn').addEventListener('click', function () { zoom(0.82); });
    $('zoomOut').addEventListener('click', function () { zoom(1.22); });
    $('zoomFit').addEventListener('click', function () { fitTo(window.ERAS[eraIdx].view); });
  }

  /* ══════════════════════════════════════════════════════════
     상세 시트
     ══════════════════════════════════════════════════════════ */
  function photoFor(id) {
    if (window.AtlasPhotos && window.AtlasPhotos.photoFor) return window.AtlasPhotos.photoFor(id);
    return null;
  }

  function openItem(c) {
    var card = $('mapCard');
    var col = catColor((c.cat || [])[0]);
    var ph = photoFor(c.id);
    var credit = ph && window.AtlasCredits ? window.AtlasCredits.creditLine(ph.file || ph.src) : '';

    var rel = (c.rel || []).map(function (id) {
      return (window.CONTENT || []).find(function (x) { return x.id === id; });
    }).filter(Boolean);

    card.innerHTML =
      (ph ? '<img class="mc-photo" src="' + esc(ph.src) + '" alt="' + esc(c.t) + '">' +
            (credit ? '<p class="mc-credit">' + esc(credit) + '</p>' : '') : '') +
      '<div class="mc-badges">' + (c.cat || []).map(function (k) {
        return '<span class="mc-badge" style="background:' + catColor(k) + '">' + (CAT_LABEL[k] || k) + '</span>';
      }).join('') + '</div>' +
      '<h2 class="mc-title">' + esc(c.t) + '</h2>' +
      '<p class="mc-d">' + esc(c.d || '') + '</p>' +
      '<div class="mc-b">' + (c.b || []).map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>' +
      ((c.tags || []).length ? '<div class="mc-tags">' + c.tags.map(function (t) {
        return '<span class="mc-tag">#' + esc(t) + '</span>';
      }).join('') + '</div>' : '') +
      (rel.length ? '<div class="mc-rel"><h4>이어서 볼 이야기</h4><div class="item-list">' +
        rel.map(function (r) {
          return '<button class="item-row" data-id="' + esc(r.id) + '" type="button">' +
            '<span class="item-bar" style="background:' + catColor((r.cat || [])[0]) + '"></span>' +
            '<span class="item-txt"><b>' + esc(r.t) + '</b><span>' + esc(r.d || '') + '</span></span></button>';
        }).join('') + '</div></div>' : '') +
      '<div class="mc-rel"><button class="intro-btn" id="mcExplore" type="button">🧭 이 시대를 걸어 보기</button></div>';

    card.querySelectorAll('.mc-rel .item-row').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = (window.CONTENT || []).find(function (x) { return x.id === b.dataset.id; });
        if (n) { setEraById(n.era); focusOn(n); openItem(n); }
      });
    });
    var ex = card.querySelector('#mcExplore');
    if (ex) ex.addEventListener('click', function () {
      closeSheet();
      window.startExploreMode(window.ERAS[eraIdx].id);
    });

    $('mapScrim').classList.add('on');
    $('mapSheet').classList.add('on');
  }

  function openRel(r, era) {
    var card = $('mapCard');
    card.innerHTML =
      '<div class="mc-badges"><span class="mc-badge" style="background:#7C6BA8">' + esc(r.ty || '교류') + '</span></div>' +
      '<h2 class="mc-title">' + esc(r.t) + '</h2>' +
      '<div class="mc-b"><p>' + esc(r.d || '') + '</p></div>';
    $('mapScrim').classList.add('on');
    $('mapSheet').classList.add('on');
  }

  function closeSheet() {
    $('mapScrim').classList.remove('on');
    $('mapSheet').classList.remove('on');
  }

  /* ══════════════════════════════════════════════════════════
     시대 전환
     ══════════════════════════════════════════════════════════ */
  function setEra(i) {
    if (i < 0 || i >= (window.ERAS || []).length) return;
    eraIdx = i;
    drawEra();
  }
  function setEraById(id) {
    var i = (window.ERAS || []).findIndex(function (e) { return e.id === id; });
    if (i >= 0) setEra(i);
  }

  function updateBagCount() {
    var n = $('mapBagN');
    if (n) n.textContent = S.bag.size;
  }

  /* ══════════════════════════════════════════════════════════
     시작
     ══════════════════════════════════════════════════════════ */
  var started = false;

  function open(eraId) {
    if (!started) {
      svg = $('mapSvg');
      drawBase();
      bindPan();
      bindTop();
      started = true;
    }
    if (eraId) setEraById(eraId); else drawEra();
    updateBagCount();
  }

  function bindTop() {
    $('mapHomeBtn').addEventListener('click', function () { window.AtlasShell.toIntro(); });
    $('mapScrim').addEventListener('click', closeSheet);
    $('mapBagBtn').addEventListener('click', function () { window.AtlasShell.openRelics(); });
    $('toExploreBtn').addEventListener('click', function () {
      window.startExploreMode(window.ERAS[eraIdx].id);
    });
    $('mapMenuBtn').addEventListener('click', function () { window.AtlasShell.openSettings(); });
  }

  function refreshMode() {
    // 교사용이면 인쇄 버튼을 보여 준다
    var teacher = S.mapMode() === 'teacher';
    var btn = document.getElementById('mapPrintBtn');
    if (teacher && !btn) {
      btn = document.createElement('button');
      btn.id = 'mapPrintBtn';
      btn.className = 'found';
      btn.type = 'button';
      btn.textContent = '🖨 학습지';
      btn.addEventListener('click', function () {
        if (window.AtlasReport) window.AtlasReport.printWorksheet(window.ERAS[eraIdx], itemsOfEra());
      });
      $('mapMenuBtn').before(btn);
    } else if (!teacher && btn) {
      btn.remove();
    }
  }

  window.AtlasMap = {
    open: open, setEra: setEra, setEraById: setEraById,
    refreshMode: refreshMode, updateBagCount: updateBagCount,
    currentEra: function () { return window.ERAS[eraIdx]; },
    itemsOfEra: itemsOfEra
  };

})();
