// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   icons.js — 이모지를 대신하는 선 아이콘 한 벌 (window.AtlasIcons)

   왜 전역인가: 지도 모드는 평범한 <script>, 탐험 모드는 ES 모듈이다(§2-3).
   store.js 와 같은 자리에 두고 js/engine/icons.js 가 이것을 감싸 쓴다.

   규약
     · 좌표계는 24×24. 선 두께 1.8, 끝과 모서리는 둥글게.
     · d  = 선으로 그리는 path, f = 칠하는 path, c = 원 [cx, cy, r]
     · 화면(DOM)에는 svg() 로, 3차원 스프라이트에는 draw() 로 같은 그림을 쓴다.

   이모지를 쓰지 않는다 — 자료(js/eras/*.js)에 남아 있는 이모지는
   strip() 이 화면에 나오기 전에 걷어낸다.
   ══════════════════════════════════════════════════════════════════════ */
(function (g) {
  'use strict';

  /* ── 그림 ────────────────────────────────────────────────────
     d: 선 path 목록 · f: 채움 path 목록 · c: 원 목록 [cx,cy,r] */
  var P = {

    /* 분류 6종 (§4-6) */
    relic:    { d:['M8 3.6h8', 'M9.6 3.6v2.9C7.4 7.5 6.2 9.5 6.2 12v4.2A4.2 4.2 0 0 0 10.4 20.4h3.2a4.2 4.2 0 0 0 4.2-4.2V12c0-2.5-1.2-4.5-3.4-5.5V3.6', 'M7.4 12.6h9.2'] },
    person:   { d:['M4.9 20.4a7.1 7.1 0 0 1 14.2 0'], c:[[12, 7.6, 3.5]] },
    culture:  { d:['M3.4 20.4h17.2', 'M6.2 20.4v-4.2h11.6v4.2', 'M7.6 16.2 9 11.9h6l1.4 4.3', 'M9.6 11.9 10.6 8.2h2.8l1 3.7', 'M12 8.2V5.1', 'M9.7 5.1h4.6'] },
    event:    { d:['M6.2 21V3.4', 'M6.2 4.6h11.3l-2.3 3.7 2.3 3.7H6.2'] },
    exchange: { d:['M3.8 9.2h14.1', 'm15.2 6.1 2.9 3.1-2.9 3.1', 'M20.2 15.1H6.1', 'm8.8 12 -2.9 3.1L8.8 18.2'] },
    life:     { d:['M3.8 11.2 12 4.4l8.2 6.8', 'M6.4 9.6v10.8h11.2V9.6', 'M10 20.4v-5.1h4v5.1'] },

    /* 임무 갈래 */
    pin:      { d:['M12 21.2s6.4-6.7 6.4-11.1a6.4 6.4 0 1 0-12.8 0C5.6 14.5 12 21.2 12 21.2Z'], c:[[12, 9.9, 2.5]] },
    gate:     { d:['M4.2 20.4v-8.6a7.8 7.8 0 0 1 15.6 0v8.6', 'M9.2 20.4v-6.1a2.8 2.8 0 0 1 5.6 0v6.1', 'M2.6 20.4h18.8'] },
    find:     { d:['m12 3.2 2.3 5.9 5.9 2.3-5.9 2.3L12 19.6l-2.3-5.9L3.8 11.4l5.9-2.3Z'] },
    npc:      { d:['M5.6 20.4a6.4 6.4 0 0 1 12.8 0', 'M18.6 6.6h2.2', 'M18.6 9.4h1.4'], c:[[11.4, 7.4, 3.2]] },

    /* 화면 장치 */
    search:   { d:['M15.7 15.7 20.6 20.6'], c:[[10.6, 10.6, 6.6]] },
    map:      { d:['M9 3.8 3.6 6.1v13.4L9 17.2l6 2.3 5.4-2.3V3.6L15 5.9 9 3.8Z', 'M9 3.8v13.4', 'M15 5.9v13.6'] },
    book:     { d:['M3.8 5.2c2.5-1.3 5.7-1.2 8.2.5 2.5-1.7 5.7-1.8 8.2-.5v13.2c-2.5-1.3-5.7-1.2-8.2.5-2.5-1.7-5.7-1.8-8.2-.5Z', 'M12 5.7v13.2'] },
    bag:      { d:['M7.4 9.2V7a4.6 4.6 0 0 1 9.2 0v2.2', 'M4.9 9.2h14.2a1.8 1.8 0 0 1 1.8 1.8v7.1a2.6 2.6 0 0 1-2.6 2.6H5.7a2.6 2.6 0 0 1-2.6-2.6V11a1.8 1.8 0 0 1 1.8-1.8Z', 'M9.2 13.1h5.6'] },
    medal:    { d:['M8.5 13.4 6.6 21l5.4-2.7L17.4 21l-1.9-7.6'], c:[[12, 9.4, 4.6]] },
    print:    { d:['M7 9.2V3.6h10v5.6', 'M7 17.6H5.3a2.2 2.2 0 0 1-2.2-2.2v-4a2.2 2.2 0 0 1 2.2-2.2h13.4a2.2 2.2 0 0 1 2.2 2.2v4a2.2 2.2 0 0 1-2.2 2.2H17', 'M7 14.2h10v6.2H7Z'] },
    compass:  { d:['m15.4 8.6-2 4.8-4.8 2 2-4.8Z'], c:[[12, 12, 8.8]] },
    close:    { d:['M6.2 6.2 17.8 17.8', 'M17.8 6.2 6.2 17.8'] },
    check:    { d:['m5.2 12.6 4.6 4.6 9.2-9.6'] },
    question: { d:['M9 8.8a3.1 3.1 0 1 1 4.2 2.9c-.9.4-1.2 1-1.2 2v.6'], c:[[12, 17.8, 1.1]] },
    chevronL: { d:['m14.2 5.8-6.2 6.2 6.2 6.2'] },
    chevronR: { d:['m9.8 5.8 6.2 6.2-6.2 6.2'] },
    arrowR:   { d:['M4.2 12h15.2', 'm14.6 7.2 4.8 4.8-4.8 4.8'] },

    /* 등급 · 행동 축 */
    step:     { d:['M9.4 3.4c1.7 0 2.7 2 2.7 4.5s-1 4.2-2.7 4.2-2.7-1.7-2.7-4.2 1-4.5 2.7-4.5Z', 'M7.9 13.6h3.1a2 2 0 0 1 2 2v3.1a2 2 0 0 1-2 2H8.9a2 2 0 0 1-2-2.1l.1-3a2 2 0 0 1 .9-2Z', 'M17.2 5.9c1 0 1.6 1.2 1.6 2.7s-.6 2.6-1.6 2.6-1.6-1.1-1.6-2.6.6-2.7 1.6-2.7Z'] },
    paw:      { d:['M12 20.4c-2.8 0-4.4-1.5-4.4-3.4 0-1.7 1.4-2.5 2.3-3.6.9-1.1 1.2-2.4 2.1-2.4s1.2 1.3 2.1 2.4c.9 1.1 2.3 1.9 2.3 3.6 0 1.9-1.6 3.4-4.4 3.4Z'], c:[[7.3, 9.4, 1.7], [11, 6.9, 1.7], [15.2, 7.4, 1.7], [18.2, 10.4, 1.6]] },
    hourglass:{ d:['M6.8 3.6h10.4', 'M6.8 20.4h10.4', 'M8.2 3.6v3.2c0 2 3.8 3.4 3.8 5.2s-3.8 3.2-3.8 5.2v3.2', 'M15.8 3.6v3.2c0 2-3.8 3.4-3.8 5.2s3.8 3.2 3.8 5.2v3.2'] },
    bookOpen: { d:['M12 6.4C9.6 4.6 6.6 4.4 3.8 5.4v12.4c2.8-1 5.8-.8 8.2 1 2.4-1.8 5.4-2 8.2-1V5.4c-2.8-1-5.8-.8-8.2 1Z', 'M12 6.4v12.4'] },
    eye:      { d:['M2.6 12S6.2 5.9 12 5.9 21.4 12 21.4 12 17.8 18.1 12 18.1 2.6 12 2.6 12Z'], c:[[12, 12, 2.7]] },
    gamepad:  { d:['M7.4 6.9h9.2a4.4 4.4 0 0 1 4.3 3.6l.7 4.1a2.6 2.6 0 0 1-4.7 1.9L15.7 15H8.3l-1.2 1.5a2.6 2.6 0 0 1-4.7-1.9l.7-4.1a4.4 4.4 0 0 1 4.3-3.6Z', 'M7.6 10.2v3', 'M6.1 11.7h3'], c:[[15.6, 11, .9], [17.8, 12.9, .9]] },
    chat:     { d:['M20.6 11.7c0 3.9-3.8 7.1-8.6 7.1-1 0-2-.15-2.9-.4L4 20.4l1.5-3.5c-1.4-1.3-2.1-3-2.1-5.2 0-3.9 3.8-7.1 8.6-7.1s8.6 3.2 8.6 7.1Z'] },
    pen:      { d:['M3.8 20.2l.9-3.7L15.3 5.9a2.1 2.1 0 0 1 3 3L7.5 19.3l-3.7.9Z', 'M13.4 7.8l3 3'] },

    /* 놀이(미니게임) 조각 */
    fire:     { d:['M12 3.4c2.6 3 4.6 4.9 4.6 8.2a4.6 4.6 0 0 1-9.2 0c0-1.4.5-2.4 1.3-3.4.4 1 1 1.6 1.7 1.8-.4-2.4.5-4.6 1.6-6.6Z'] },
    water:    { d:['M12 3.6c3 3.7 5.2 6.2 5.2 9a5.2 5.2 0 0 1-10.4 0c0-2.8 2.2-5.3 5.2-9Z'] },
    leaf:     { d:['M20 4.4c-8 0-13.4 3-13.4 9a5.6 5.6 0 0 0 5.6 5.6c5.6 0 7.8-5.4 7.8-14.6Z', 'M9.4 20.4C10.6 15.6 13.4 11.6 17 9.4'] },
    mountain: { d:['m2.6 19.6 6.2-11 3.6 6 2-3.4 6.9 8.4Z'] },
    moon:     { d:['M19.8 14.6A8.2 8.2 0 0 1 9.4 4.2a8.4 8.4 0 1 0 10.4 10.4Z'] },
    sun:      { d:['M12 2.8v2.4', 'M12 18.8v2.4', 'M4.5 12H2.1', 'M21.9 12h-2.4', 'm6.7 6.7-1.7-1.7', 'm19 19-1.7-1.7', 'm17.3 6.7 1.7-1.7', 'M5 19l1.7-1.7'], c:[[12, 12, 4.2]] },
    axe:      { d:['M6.6 20.6 16.2 11', 'M13.4 8.2c1.6-3 4.4-4.4 6.8-3.6.9 2.5-.4 5.4-3.4 7l-3.4-3.4Z', 'm5 19.2 2.4 2.4'] },
    bone:     { d:['M8.4 15.6 15.6 8.4', 'M8.4 15.6a2.5 2.5 0 1 1-3 3 2.5 2.5 0 1 1 3-3Z', 'M15.6 8.4a2.5 2.5 0 1 0 3-3 2.5 2.5 0 1 0-3 3Z'] },
    scale:    { d:['M12 4.6v15', 'M6.4 19.6h11.2', 'M4.2 7.6h15.6', 'M4.2 7.6 1.9 13.4h4.6Z', 'M19.8 7.6 17.5 13.4h4.6Z'], c:[[12, 5.4, 1.3]] },
    dove:     { d:['M20.4 6.2c-2.6 0-4.4 1-6 2.6-1.6-2-3.4-2.8-5.4-2.8-3 0-5.4 2.2-5.4 5 0 4.4 4.4 8.2 8.8 8.2 4 0 6.6-2.8 6.6-6.4 0-2 .6-4.2 1.4-6.6Z', 'M9.4 10.4h.01'] },
    flag:     { d:['M6.2 21V3.6', 'M6.2 4.8c3.6-1.4 7.2 1.4 10.8 0v7.4c-3.6 1.4-7.2-1.4-10.8 0Z'] },
    lamp:     { d:['M8.6 12.4h6.8l-.9 5.4H9.5Z', 'M7.4 17.8h9.2', 'M12 12.4V9.6', 'M9.4 9.6h5.2a2.6 2.6 0 0 0-5.2 0Z', 'M15.4 14.4h3.4'] },
    urn:      { d:['M9.2 4.2h5.6', 'M10.2 4.2v2.4c-1.8 1-2.8 2.8-2.8 5v4a4 4 0 0 0 4 4h1.2a4 4 0 0 0 4-4v-4c0-2.2-1-4-2.8-5V4.2', 'M6.6 20.4h10.8'] },
    teapot:   { d:['M5.4 10.2h9.4a4.4 4.4 0 0 1 0 8.8H8.4a4.4 4.4 0 0 1-3-7.6Z', 'M14.8 12.4c2.6 0 4.2 1 4.2 2.2s-1.6 2.2-4.2 2.2', 'M9.4 10.2V7.8', 'M7.4 7.8h4.2'] },
    boat:     { d:['M3.4 16.4h17.2l-2.4 4.2H5.8Z', 'M12 15.8V3.8', 'M12 5.4l5.4 3.6L12 12.6'] },
    rock:     { d:['m4.2 15.4 4-8.2 5.4-1.4 6.2 6.6-3.4 6.6H6.6Z', 'm8.2 7.2 3 5.8 6.2-1.2', 'm11.2 13-4.6 5.8'] },
    house:    { d:['M3.8 11.2 12 4.4l8.2 6.8', 'M6.4 9.6v10.8h11.2V9.6'] },
    dot:      { c:[[12, 12, 4.2]] },

    /* 신석기 미니게임이 쓰는 것 (js/engine/neo/) */
    grain:    { d:['M12 21V9.4',
                   'M12 9.4C12 6 13.8 3.6 16.6 2.8c.6 3.2-.7 5.9-4.6 6.6Z',
                   'M12 9.4C12 6 10.2 3.6 7.4 2.8c-.6 3.2.7 5.9 4.6 6.6Z',
                   'M12 14.6c0-3 1.6-5 4.2-5.7.5 2.8-.7 5.1-4.2 5.7Z',
                   'M12 14.6c0-3-1.6-5-4.2-5.7-.5 2.8.7 5.1 4.2 5.7Z'] },
    sprout:   { d:['M12 21v-8.4',
                   'M12 12.6C12 9 9.4 6.4 5.6 6.4c0 3.8 2.6 6.2 6.4 6.2Z',
                   'M12 12.6c0-2.8 2.2-5 5.4-5 0 3-2.2 5-5.4 5Z',
                   'M7.6 21h8.8'] },
    wither:   { d:['M11 21c.6-4.6 1-8 1.6-10.6',
                   'M12.6 10.4C13.8 7.6 13 4.8 10.4 3.2c-1.4 2.8-.8 5.6 2.2 7.2Z',
                   'M12.6 12.8c2-1.4 4.4-1.2 6.2.6-2 1.6-4.4 1.4-6.2-.6Z',
                   'M11.6 16.4c-1.8-1-4-.6-5.4 1.2 2 1 4.2.6 5.4-1.2Z'] },
    bug:      { d:['M8.6 8.6a3.4 3.4 0 0 1 6.8 0', 'M9.6 6.2 8 4', 'M14.4 6.2 16 4',
                   'M7.4 12H3.8', 'M7.4 16H4.6', 'M16.6 12h3.6', 'M16.6 16h2.8',
                   'M12 8.6c3 0 4.8 2.2 4.8 5.4S15 20.4 12 20.4 7.2 17.2 7.2 14 9 8.6 12 8.6Z'] },
    basket:   { d:['M3.4 9.6h17.2l-2 9.4a2.4 2.4 0 0 1-2.4 1.8H7.8a2.4 2.4 0 0 1-2.4-1.8Z',
                   'M7.4 9.6 9.8 3.6', 'M16.6 9.6 14.2 3.6',
                   'M6.6 13.6h10.8', 'M9.6 9.8l.8 10.6', 'M14.4 9.8l-.8 10.6'] },
    box:      { d:['M12 3.4 20.4 7.6v8.8L12 20.6 3.6 16.4V7.6Z',
                   'M3.6 7.6 12 11.8l8.4-4.2', 'M12 11.8v8.8'] },
    star:     { d:['m12 3 2.7 5.9 6.3.7-4.7 4.3 1.3 6.3L12 17.1 6.4 20.2l1.3-6.3L3 9.6l6.3-.7Z'] }
  };

  /* 분류 → 그림 이름 (§4-6 의 6종 고정) */
  var BY_CAT = {
    relic:'relic', person:'person', culture:'culture',
    event:'event', exchange:'exchange', life:'life'
  };

  /* 자료에 남은 이모지를 그림 이름으로 옮기는 표 — 놀이 조각용 */
  var BY_EMOJI = {
    '🔥':'fire', '🌊':'water', '🌿':'leaf', '⛰':'mountain', '⛰️':'mountain',
    '🌙':'moon', '☀':'sun', '☀️':'sun', '🪓':'axe', '🦴':'bone',
    '⚖':'scale', '⚖️':'scale', '🕊':'dove', '🕊️':'dove', '🚩':'flag',
    '🪔':'lamp', '⚱':'urn', '⚱️':'urn', '🫖':'teapot', '⛵':'boat',
    '🪨':'rock', '🏺':'relic', '📌':'pin', '✨':'find', '🗺':'map', '🗺️':'map',
    '📔':'book', '🎒':'bag', '🔍':'search', '🏅':'medal', '🖨':'print',
    '🧭':'compass', '🐾':'paw', '👣':'step', '⏳':'hourglass', '📖':'bookOpen',
    '👀':'eye', '🎮':'gamepad', '💬':'chat', '✍':'pen', '✍️':'pen',
    '🏯':'culture', '🛕':'culture', '👑':'medal', '🎭':'person', '🚂':'exchange',
    '✊':'event', '🗡':'axe', '🗡️':'axe', '🐎':'person', '❔':'question',
    /* 신석기 미니게임 자료가 쓰는 것 (js/engine/neo/) */
    '🌾':'grain', '🌱':'sprout', '🥀':'wither', '🐛':'bug', '🧺':'basket',
    '📦':'box', '⭐':'star', '💧':'water', '🥣':'urn', '🧵':'pen', '🧶':'pen',
    '🏠':'house', '🌞':'sun', '🐚':'relic', '🙏':'person'
  };

  function has(name){ return !!P[name]; }

  /** 이름이든 이모지든 받아 그림 이름으로 바꾼다. 모르면 fallback */
  function resolve(name, fallback){
    if (!name) return fallback || 'pin';
    if (P[name]) return name;
    if (BY_EMOJI[name]) return BY_EMOJI[name];
    // 변이 선택자(FE0F)가 붙은 경우
    var bare = String(name).replace(/️/g, '');
    if (BY_EMOJI[bare]) return BY_EMOJI[bare];
    return fallback || 'pin';
  }

  /** 임무 하나에 맞는 그림 이름 — 자료의 icon(이모지)은 쓰지 않는다 */
  function forQuest(q){
    if (!q) return 'pin';
    if (q.kind === 'gate') return 'gate';
    if (q.kind === 'find') return 'find';
    if (q.kind === 'inspect') return 'search';
    return BY_CAT[q.cat] || 'pin';
  }
  function forCat(cat){ return BY_CAT[cat] || 'pin'; }

  /* ── 화면(DOM)에 넣을 SVG 문자열 ─────────────────────────────
     opts: { size, color, width, cls, title } */
  function svg(name, opts){
    var o = opts || {};
    var g2 = P[resolve(name, o.fallback)];
    if (!g2) return '';
    var size = o.size || 20;
    var color = o.color || 'currentColor';
    var w = o.width || 1.8;
    var body = '';
    (g2.f || []).forEach(function (d){ body += '<path d="' + d + '" fill="' + color + '" stroke="none"/>'; });
    (g2.d || []).forEach(function (d){ body += '<path d="' + d + '"/>'; });
    (g2.c || []).forEach(function (c){ body += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; });
    return '<svg class="ai' + (o.cls ? ' ' + o.cls : '') + '" viewBox="0 0 24 24" width="' + size + '" height="' + size +
           '" fill="none" stroke="' + color + '" stroke-width="' + w +
           '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
           body + '</svg>';
  }

  /* ── 캔버스에 같은 그림 그리기 (3차원 스프라이트용) ───────── */
  function draw(ctx, name, size, color, width){
    var g2 = P[resolve(name)];
    if (!g2) return;
    var k = size / 24;
    ctx.save();
    ctx.scale(k, k);
    ctx.strokeStyle = color || '#191919';
    ctx.fillStyle = color || '#191919';
    ctx.lineWidth = width || 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    (g2.f || []).forEach(function (d){ try { ctx.fill(new Path2D(d)); } catch(e){} });
    (g2.d || []).forEach(function (d){ try { ctx.stroke(new Path2D(d)); } catch(e){} });
    (g2.c || []).forEach(function (c){
      ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2); ctx.stroke();
    });
    ctx.restore();
  }

  /* ── 자료에 남은 이모지 걷어내기 ─────────────────────────────
     화면에 글자로 나가는 값은 전부 이것을 통과시킨다.

     유니코드가 '그림 문자'로 정한 것만 걷어낸다.
     화살표(→ ← ↺), 괘선(═), 기하도형(◉), 저작권 기호(©)는 남긴다 —
     그것은 그림이 아니라 활자다. 여기서 지우면 문장이 어색해진다. */
  var EMOJI_RE = /(?![©®™])[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{E0020}-\u{E007F}]/gu;
  function strip(s){
    if (s == null) return '';
    return String(s).replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
  }

  /* ── HTML 에 적어 둔 자리를 그림으로 채운다 ──────────────────
     <span data-icon="bag" data-icon-size="18"></span>
     이렇게 두면 HTML 은 읽기 쉬운 채로 남고 이모지는 사라진다 */
  function paint(root){
    var scope = root || (typeof document !== 'undefined' ? document : null);
    if (!scope || !scope.querySelectorAll) return;
    var list = scope.querySelectorAll('[data-icon]');
    for (var i = 0; i < list.length; i++){
      var el = list[i];
      if (el.getAttribute('data-icon-done') === '1') continue;
      el.innerHTML = svg(el.getAttribute('data-icon'), {
        size: +el.getAttribute('data-icon-size') || 18,
        color: el.getAttribute('data-icon-color') || 'currentColor'
      });
      el.setAttribute('data-icon-done', '1');
    }
  }

  g.AtlasIcons = {
    PATHS: P, has: has, resolve: resolve,
    forQuest: forQuest, forCat: forCat,
    svg: svg, draw: draw, strip: strip, paint: paint,
    BY_EMOJI: BY_EMOJI
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = g.AtlasIcons;

})(typeof window !== 'undefined' ? window : globalThis);
