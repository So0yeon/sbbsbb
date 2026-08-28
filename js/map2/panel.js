// © 2026 김용현
/* 지도 모드 v2 — 옆 패널과 지도 위 항목들.
   기존 지도 모드(js/map-app.js)에서 v2 에 없는 것만 옮겨 왔습니다.
     · 분류 필터 · 항목 목록 · 상세 시트
     · 지도 위 항목 마커 · 교류선 · 이웃 나라 이름 · 수도
   영토·나라 이름·연표·확대는 v2 가 하므로 가져오지 않았습니다.
   원본 파일은 손대지 않았습니다. 평범한 전역 스크립트입니다 (MASTER §2-3). */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };
  var S = window.AtlasStore || { bagHas: function () { return false; }, bag: { size: 0 } };

  var M = window.TERRITORY.meta;
  var PX = M.w / (M.lng1 - M.lng0), PY = M.h / (M.lat1 - M.lat0);
  function p2x(lng) { return (lng - M.lng0) * PX; }
  function p2y(lat) { return (M.lat1 - lat) * PY; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function add(parent, tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    parent.appendChild(e);
    return e;
  }

  var CAT_LABEL = { relic: '유물·유적', person: '인물', culture: '문화',
                    event: '사건', exchange: '교류', life: '생활문화' };
  var CAT_KEYS = ['relic', 'person', 'culture', 'event', 'exchange', 'life'];
  function catColor(k) {
    var m = { relic: '#7B6A55', person: '#3F6B8C', culture: '#3E8A78',
              event: '#A8534F', exchange: '#7C6BA8', life: '#8A7B4E' };
    return m[k] || '#7B6A55';
  }

  var eraId = null;
  /* 처음에는 아무 분류도 켜지 않습니다 — 지도를 깨끗하게 두고 보고 싶은 것만 켭니다.
     null 이면 전부, 아니면 그 표에서 1 인 것만 봅니다. */
  var activeCats = { relic: 0, person: 0, culture: 0, event: 0, exchange: 0, life: 0 };
  function anyCat() {
    return !activeCats || CAT_KEYS.some(function (k) { return activeCats[k]; });
  }
  var G = null;                 // { rel, cap, mk }
  var api = null;               // window.Map2

  function eraOf(id) {
    var list = window.ERAS || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* ── 이 시대의 항목 ───────────────────────────────────────── */
  function itemsOfEra() {
    return (window.CONTENT || []).filter(function (c) {
      if (c.era !== eraId) return false;
      if (window.ATLAS_DUP_HIDDEN && window.ATLAS_DUP_HIDDEN[c.id]) return false;
      if (activeCats && !(c.cat || []).some(function (k) { return activeCats[k]; })) return false;
      return true;
    });
  }

  /* ── 분류 필터 ───────────────────────────────────────────── */
  function drawFilter() {
    var box = $('catFilter');
    box.innerHTML = CAT_KEYS.map(function (k) {
      var on = !activeCats || activeCats[k];
      return '<button class="cat-chip ' + (on ? 'on' : '') + '" data-k="' + k + '" type="button" ' +
        (on ? 'style="background:' + catColor(k) + '"' : '') + '>' +
        '<span class="cat-dot" style="background:' + (on ? '#fff' : catColor(k)) + '"></span>' +
        CAT_LABEL[k] + '</button>';
    }).join('') +
      '<button class="cat-chip ' + (activeCats ? '' : 'on') + '" id="catAll" type="button"' +
      (activeCats ? '' : ' style="background:#4A4A46"') + '>전체</button>';

    box.querySelectorAll('.cat-chip[data-k]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!activeCats) {                       /* 전부 켜져 있었으면 누른 것만 남깁니다 */
          activeCats = { relic: 0, person: 0, culture: 0, event: 0, exchange: 0, life: 0 };
          activeCats[b.dataset.k] = 1;
        } else {
          activeCats[b.dataset.k] = activeCats[b.dataset.k] ? 0 : 1;
        }
        drawFilter(); drawList(); drawMarkers();
      });
    });
    /* 「전체」는 켜져 있으면 모두 끄고, 아니면 모두 켭니다 */
    $('catAll').addEventListener('click', function () {
      activeCats = anyCat() ? { relic: 0, person: 0, culture: 0, event: 0, exchange: 0, life: 0 } : null;
      drawFilter(); drawList(); drawMarkers();
    });
  }

  /* ── 항목 목록 ───────────────────────────────────────────── */
  function drawList() {
    var box = $('itemList');
    var list = itemsOfEra();
    $('itemCount').textContent = list.length ? list.length + '개' : '';
    if (!list.length) {
      box.innerHTML = '<p class="muted">' +
        (anyCat() ? '이 시대에는 볼 항목이 없어요.'
                  : '지도 왼쪽 위에서 보고 싶은 분류를 켜 보세요.') + '</p>';
      return;
    }
    box.innerHTML = list.map(function (c) {
      return '<button class="item-row ' + (S.bagHas(c.id) ? 'got' : '') + '" data-id="' + esc(c.id) + '" type="button">' +
        '<span class="item-bar" style="background:' + catColor((c.cat || [])[0]) + '"></span>' +
        '<span class="item-txt"><b>' + esc(c.t) + '</b><span>' + esc(c.d || '') + '</span></span></button>';
    }).join('');
    box.querySelectorAll('.item-row').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = (window.CONTENT || []).find(function (x) { return x.id === b.dataset.id; });
        if (c) openItem(c);           /* 지도는 움직이지 않습니다 */
      });
    });
  }

  /* ── 지도 위 마커 ────────────────────────────────────────── */
  function drawMarkers() {
    if (!G) return;
    var gM = G.mk;
    gM.innerHTML = '';
    var upp = api.unitsPerPx();
    /* 나라 이름·수도·이웃 나라가 이미 차지한 자리는 비켜 갑니다 */
    var placed = (api.nationLabelBoxes ? api.nationLabelBoxes() : []).concat(reserved);
    var fs = (11 * upp).toFixed(2);            // 화면에서 11px 로 보이게
    var gapY = 13 * upp, rHit = 15 * upp, rDot = 5 * upp;

    itemsOfEra().forEach(function (c) {
      if (!c.at) return;
      var x = p2x(c.at[1]), y = p2y(c.at[0]);
      var col = catColor((c.cat || [])[0]);
      var got = S.bagHas(c.id);

      var g = add(gM, 'g', { 'class': 'mk' + (got ? ' got' : ''), tabindex: '0',
                             role: 'button', 'aria-label': c.t });
      add(g, 'circle', { 'class': 'hit', cx: x, cy: y, r: rHit });     // 터치 영역을 크게
      add(g, 'circle', { 'class': 'dot', cx: x, cy: y, r: got ? rDot * 1.2 : rDot,
                         fill: col, 'fill-opacity': got ? 1 : 0.4,
                         stroke: col, 'stroke-width': 1.6 * upp });

      /* 라벨은 겹치면 뺍니다. 점은 남깁니다 */
      var half = (c.t.length * 5.6 + 10) * upp;
      var slot = [[0, -12 * upp], [0, 19 * upp], [0, -25 * upp], [0, 32 * upp],
                  [half + 8 * upp, 4 * upp], [-half - 8 * upp, 4 * upp],
                  [half + 8 * upp, -16 * upp], [-half - 8 * upp, -16 * upp]];
      for (var i = 0; i < slot.length; i++) {
        var lx = x + slot[i][0], ly = y + slot[i][1];
        var clash = placed.some(function (p) {
          return Math.abs(p[0] - lx) < (p[2] + half) && Math.abs(p[1] - ly) < gapY;
        });
        if (!clash) {
          placed.push([lx, ly, half]);
          add(g, 'text', { x: lx, y: ly, 'text-anchor': 'middle',
                           'font-size': fs, 'stroke-width': 3 * upp }, c.t);
          break;
        }
      }

      g.addEventListener('click', function () { openItem(c); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(c); }
      });
    });
  }

  /* ── 교류선 · 이웃 나라 · 수도 ───────────────────────────── */
  var reserved = [];      // 수도·이웃 나라 이름이 차지한 자리

  function drawEraExtras() {
    if (!G) return;
    G.rel.innerHTML = '';
    G.cap.innerHTML = '';
    reserved = [];
    var era = eraOf(eraId);
    if (!era) return;
    var upp = api.unitsPerPx();

    (era.rel || []).forEach(function (r) {
      if (!r.from || !r.to) return;
      var x1 = p2x(r.from[1]), y1 = p2y(r.from[0]), x2 = p2x(r.to[1]), y2 = p2y(r.to[0]);
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, b = r.bend || 0;
      var p = add(G.rel, 'path', {
        d: 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) +
           ' Q' + (mx - dy * b).toFixed(1) + ',' + (my + dx * b).toFixed(1) +
           ' ' + x2.toFixed(1) + ',' + y2.toFixed(1),
        'class': 'rel-line', stroke: era.accent || '#7C6BA8',
        'stroke-width': (2 * upp).toFixed(2)
      });
      p.style.cursor = 'pointer';
      p.addEventListener('click', function () { openRel(r); });
    });

    /* 수도는 v2 영토 자료에 없어 기존 시대 자료에서 위치만 가져옵니다 (영토는 쓰지 않습니다) */
    (era.terr || []).forEach(function (t) {
      if (!t.cap || !t.cap.at) return;
      add(G.cap, 'circle', { cx: p2x(t.cap.at[1]), cy: p2y(t.cap.at[0]), r: 3.4 * upp, fill: '#191919' });
      /* 수도 이름은 점 아래에 둡니다 — 나라 이름은 위쪽에 있으므로 서로 겹치지 않습니다 */
      add(G.cap, 'text', { x: p2x(t.cap.at[1]), y: p2y(t.cap.at[0]) + 14 * upp,
                           'class': 'cap-label', 'text-anchor': 'middle',
                           'font-size': (12 * upp).toFixed(2), 'stroke-width': 3.4 * upp }, t.cap.n);
      reserved.push([p2x(t.cap.at[1]), p2y(t.cap.at[0]) + 14 * upp, ((t.cap.n.length + 1) * 6 + 8) * upp]);
    });

    (era.nb || []).forEach(function (n) {
      if (!n.at) return;
      add(G.cap, 'text', { x: p2x(n.at[1]), y: p2y(n.at[0]), 'class': 'nb-label',
                           'text-anchor': 'middle', 'font-size': (12 * upp).toFixed(2),
                           'stroke-width': 3 * upp }, n.n);
      reserved.push([p2x(n.at[1]), p2y(n.at[0]), (n.n.length * 6 + 8) * upp]);
    });
  }

  /* ── 상세 시트 ───────────────────────────────────────────── */
  function photoFor(id) {
    if (window.AtlasPhotos && window.AtlasPhotos.photoFor) return window.AtlasPhotos.photoFor(id);
    return null;
  }

  function openItem(c) {
    var card = $('mapCard');
    var ph = photoFor(c.id);
    var credit = ph && window.AtlasCredits ? window.AtlasCredits.creditLine(ph.file || ph.src) : '';
    var rel = (c.rel || []).map(function (id) {
      return (window.CONTENT || []).find(function (x) { return x.id === id; });
    }).filter(Boolean);
    /* 역사 가방을 거쳐 여기로 왔으면 '걸어 보기' 대신 '돌아가기' — 새로 들어가는 게 아니다 (요구 7) */
    var backHome = window.AtlasShell && window.AtlasShell.cameFromExplore && window.AtlasShell.cameFromExplore();

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
      (backHome ?
        '<div class="mc-rel"><button class="intro-btn" id="mcExplore" type="button">🧭 탐험 모드로 돌아가기</button></div>' :
       window.startExploreMode ?
        '<div class="mc-rel"><button class="intro-btn" id="mcExplore" type="button">🧭 이 시대를 걸어 보기</button></div>' : '');

    card.querySelectorAll('.mc-rel .item-row').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = (window.CONTENT || []).find(function (x) { return x.id === b.dataset.id; });
        if (!n) return;
        if (n.era !== eraId && api.showEra) api.showEra(n.era);
        openItem(n);
      });
    });
    var ex = card.querySelector('#mcExplore');
    if (ex) ex.addEventListener('click', function () {
      closeSheet();
      if (backHome) window.AtlasShell.backToExplore();
      else window.startExploreMode(eraId);
    });
    openSheet();
  }

  /** 화살표 상세의 나가는/들어오는 물품 — 있을 때만 그린다 */
  function goodsSide(s, cls) {
    if (!s || !s.list || !s.list.length) return '';
    return '<div class="mc-goods ' + cls + '"><h4>' + esc(s.label) + '</h4>' +
      '<div class="mc-tags">' + s.list.map(function (x) {
        return '<span class="mc-tag">' + esc(x) + '</span>';
      }).join('') + '</div></div>';
  }

  function openRel(r) {
    var g = r.goods || {};
    $('mapCard').innerHTML =
      '<div class="mc-badges"><span class="mc-badge" style="background:#7C6BA8">' + esc(r.ty || '교류') + '</span></div>' +
      '<h2 class="mc-title">' + esc(r.t) + '</h2>' +
      '<div class="mc-b"><p>' + esc(r.d || '') + '</p></div>' +
      goodsSide(g.out, 'out') + goodsSide(g.in, 'in');
    openSheet();
  }

  function openSheet() {
    $('mapScrim').classList.add('on');
    $('mapSheet').classList.add('on');
  }
  function closeSheet() {
    $('mapScrim').classList.remove('on');
    $('mapSheet').classList.remove('on');
  }

  /* ── 밖에서 부르는 것 ────────────────────────────────────── */
  function setEra(id) {
    if (id === eraId) { drawEraExtras(); drawMarkers(); return; }
    eraId = id;
    var era = eraOf(id);
    $('eraLine').textContent = era ? (era.line || '') : '';
    drawFilter();
    drawList();
    drawEraExtras();
    drawMarkers();
  }

  function init(map2, groups) {
    api = map2;
    G = groups;
    $('mapScrim').addEventListener('click', closeSheet);
    $('sheetClose').addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  }

  /** 학습 항목 하나를 이름으로 찾아 펼친다 (탐험 모드의 역사 가방에서 부른다).
      실제로 찍힌 자리로 지도를 옮겨 줘야 그 위치가 눈에 들어온다 (요구 7). */
  function openItemById(id) {
    var c = (window.CONTENT || []).find(function (x) { return x.id === id; });
    if (!c) return false;
    if (c.at && api.focusOn) api.focusOn(c.at);
    openItem(c);
    return true;
  }

  window.Map2Panel = {
    init: init, setEra: setEra,
    relabel: function () { drawEraExtras(); drawMarkers(); },
    itemsOfEra: itemsOfEra, closeSheet: closeSheet,
    openItemById: openItemById
  };
})();
