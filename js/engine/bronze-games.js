// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   bronze-games.js — 청동기 전용 미니게임 네 가지

   minigames.js 의 스무 가지는 조작이 같아야 아이가 다시 배우지 않아도 되므로,
   판정 시점(pointerdown)과 난이도(구간 폭·필요 성공 수·남은 기회)는
   원래 knap · grind · lift · stack 그대로 두고 **보이는 것만** 청동기의 일로 바꾼다
   (js/engine/neo/minigames-neolithic.js 가 신석기에서 한 것과 같은 방식).

     cast      거푸집에 청동물 붓기 — knap 그대로(6번 중 4번). 도가니가 달아오르고
               알맞은 순간에 기울이면 거푸집 칼 모양 홈에 청동물이 실제로 차오른다
     mirror    청동 거울 갈고 닦기 — grind 그대로(10번 중 6번). 가죽 판이 거울 위를
               오가며, 닦일수록 거울이 진짜로 빛을 머금는다
     dolmen    고인돌 세우기 — lift 그대로(8번 중 5번). 신호북 채가 흔들리는 순간에
               맞추어 당기면, 덮개돌이 흙 비탈을 타고 실제로 받침돌 위까지 오른다
     palisade  마을을 지키는 도랑과 울타리 — stack 그대로(원래 등록된 함수를 그대로
               부르고 그림만 새로 준다). 단계마다 도랑·기둥·뾰족한 끝·망루가 실제로 선다

   이 파일 하나가 네 미니게임 전부다. minigames.js 가 원래 내보내는
   onPress · MINIGAME_STARTERS · MINIGAME_LABELS 세 가지에만 기댄다.
   ══════════════════════════════════════════════════════════════════════ */
import { onPress, MINIGAME_STARTERS, MINIGAME_LABELS } from './minigames.js';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const lerp = (a,b,t) => a + (b - a) * t;

/* minigames.js 것과 같은 뼈대. 옮겨 다니기 쉽도록 여기 한 벌 더 둔다
   (js/engine/neo/minigames-bitsal.js 가 쓰는 것과 같은 방식). */
function shell(host, mini, innerHTML){
  host.innerHTML = `
    <div class="mg">
      ${mini.tag ? `<p class="mg-tag">${esc(mini.tag)}</p>` : ''}
      <p class="mg-intro">${esc(mini.intro || '')}</p>
      <div class="mg-stage bz-stage" id="mgStage">${innerHTML}</div>
      <p class="mg-score" id="mgScore"></p>
      <button class="mg-btn" id="mgAction" type="button">${esc(mini.startLabel || '시작하기')}</button>
    </div>`;
  return {
    stage:  host.querySelector('#mgStage'),
    score:  host.querySelector('#mgScore'),
    action: host.querySelector('#mgAction')
  };
}
function setScore(el, s){ if (el) el.textContent = s; }
function finish(host, ui, ok, done, mini){
  ui.action.textContent = ok ? '잘 하였소 →' : (mini.retryLabel || '다시 해 보겠소');
  ui.action.className = ok ? 'mg-btn' : 'mg-btn sub';
  const fresh = ui.action.cloneNode(true);
  ui.action.replaceWith(fresh);
  onPress(fresh, () => done(ok));
}
function loop(host, fn){
  let raf = 0, prev = performance.now(), alive = true;
  function tick(now){
    if (!alive || !host.isConnected){ alive = false; return; }
    const dt = Math.min(.05, (now - prev) / 1000);
    prev = now;
    if (fn(dt, now) === false){ alive = false; return; }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  return () => { alive = false; cancelAnimationFrame(raf); };
}
function pipsHtml(total, tries, hits){
  let s = '';
  for (let i = 0; i < total; i++){
    const cls = i < tries ? (i < hits ? 'hit' : 'miss') : '';
    s += `<span class="mg-pip ${cls}"></span>`;
  }
  return s;
}
/* 흩날리는 부스러기 — 갈리거나 무너질 때 잠깐 튀었다 사라진다 */
function burst(g, x, y, n, colors, spread){
  const NS = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < n; i++){
    const c = document.createElementNS(NS, 'circle');
    const a = Math.random() * Math.PI * 2;
    const r = (spread || 18) * (.4 + Math.random() * .6);
    c.setAttribute('cx', x); c.setAttribute('cy', y);
    c.setAttribute('r', (1 + Math.random() * 1.8).toFixed(1));
    c.setAttribute('fill', colors[i % colors.length]);
    c.setAttribute('class', 'bz-mote');
    c.style.setProperty('--dx', (Math.cos(a) * r).toFixed(1) + 'px');
    c.style.setProperty('--dy', (Math.sin(a) * r - 6).toFixed(1) + 'px');
    c.style.animationDelay = (Math.random() * 40) + 'ms';
    g.appendChild(c);
    setTimeout(() => c.remove(), 720);
  }
}

/* ══════════════════════════════════════════════════════════════
   1. cast — 거푸집에 청동물 붓기 (knap 그대로: 6번 중 4번)
   ══════════════════════════════════════════════════════════════ */
const CAST_STAGE = `
<div class="bz-cast">
  <svg viewBox="0 0 300 190" class="bz-svg" aria-hidden="true">
    <rect x="0" y="150" width="300" height="40" fill="#C9C2A8" opacity=".4"/>
    <defs>
      <clipPath id="bzLiqClip"><path d="M54,151 Q50,110 60,99 H92 Q102,110 98,151 Z"/></clipPath>
      <clipPath id="bzCavClip"><path id="bzCavPath" d="M222,94 L229,118 L225,140 L234,150 L210,150 L219,140 L215,118 Z"/></clipPath>
    </defs>
    <!-- 도가니 -->
    <g id="bzCrucible">
      <path d="M50,152 Q46,108 58,96 H94 Q106,108 102,152 Z" fill="#5B5348" stroke="#3E3931" stroke-width="2"/>
      <rect id="bzLiquid" x="50" y="151" width="52" height="0" fill="#B23B22" clip-path="url(#bzLiqClip)"/>
      <ellipse id="bzLiquidTop" cx="76" cy="151" rx="20" ry="4" fill="#F5C842" opacity="0"/>
      <ellipse cx="76" cy="96" rx="19" ry="6" fill="none" stroke="#3E3931" stroke-width="2.4"/>
    </g>
    <g id="bzDrops"></g>
    <path id="bzStream" d="M92,100 Q158,62 213,96" fill="none" stroke="#E8791E" stroke-width="4.5"
      stroke-linecap="round" opacity="0"/>
    <!-- 거푸집 -->
    <g>
      <rect x="190" y="86" width="64" height="68" rx="4" fill="#8B8474" stroke="#6B6557" stroke-width="2"/>
      <line x1="222" y1="88" x2="222" y2="152" stroke="#6B6557" stroke-width="1.4" opacity=".55"/>
      <path d="${'M222,94 L229,118 L225,140 L234,150 L210,150 L219,140 L215,118 Z'}" fill="#241F18"/>
      <rect id="bzCavFill" x="207" y="150" width="30" height="0" fill="#E8791E" clip-path="url(#bzCavClip)"/>
    </g>
  </svg>
  <div class="mg-gauge bz-heat"><div class="mg-gauge-zone" id="bzZone"></div><div class="mg-gauge-fill" id="bzFill"></div></div>
  <div class="mg-pips" id="bzPips"></div>
</div>`;

function castGame(mini, host, done){
  const ui = shell(host, mini, CAST_STAGE);
  const liquid = ui.stage.querySelector('#bzLiquid');
  const liqTop = ui.stage.querySelector('#bzLiquidTop');
  const cavFill = ui.stage.querySelector('#bzCavFill');
  const stream = ui.stage.querySelector('#bzStream');
  const drops = ui.stage.querySelector('#bzDrops');
  const zoneEl = ui.stage.querySelector('#bzZone');
  const fillEl = ui.stage.querySelector('#bzFill');
  const pips = ui.stage.querySelector('#bzPips');

  const TRIES = 6, NEED = 4;
  let width = 20, val = 0, holding = false, tries = 0, hits = 0, stop = null;
  const zoneStart = () => 62 - width / 2;
  const streamLen = stream.getTotalLength();
  stream.style.strokeDasharray = String(streamLen);
  stream.style.strokeDashoffset = String(streamLen);

  function paint(){
    zoneEl.style.left = zoneStart() + '%';
    zoneEl.style.width = width + '%';
    fillEl.style.width = val + '%';
    liquid.setAttribute('height', (val * .5).toFixed(1));
    liquid.setAttribute('y', (151 - val * .5).toFixed(1));
    const heat = val / 100;
    liquid.setAttribute('fill', `rgb(${Math.round(178+heat*61)},${Math.round(59+heat*141)},${Math.round(34+heat*32)})`);
    liqTop.setAttribute('opacity', (heat * .85).toFixed(2));
    pips.innerHTML = pipsHtml(TRIES, tries, hits);
    setScore(ui.score, `${hits} / ${NEED} 성공 · 남은 기회 ${TRIES - tries}`);
  }

  stop = loop(host, dt => {
    if (holding){
      val = Math.min(100, val + dt * (100 / 0.75));
      paint();
    }
  });

  function pourStream(color){
    stream.setAttribute('stroke', color);
    stream.style.transition = 'none';
    stream.style.strokeDashoffset = String(streamLen);
    stream.style.opacity = '1';
    requestAnimationFrame(() => {
      stream.style.transition = 'stroke-dashoffset .38s ease-out';
      stream.style.strokeDashoffset = '0';
    });
    setTimeout(() => { stream.style.transition = 'opacity .5s ease-in'; stream.style.opacity = '0'; }, 420);
  }
  function spill(){
    burst(drops, 76, 98, 8, ['#E8791E','#B23B22','#F5C842'], 22);
  }
  function coldClunk(){
    pourStream('#8A8579');
    burst(drops, 150, 84, 5, ['#8A8579','#6B6557'], 14);
  }

  function press(){ if (tries >= TRIES) return; holding = true; val = 0; paint(); }
  function release(){
    if (!holding) return;
    holding = false;
    tries++;
    const lo = zoneStart(), hi = lo + width;
    const ok = val >= lo && val <= hi;
    if (ok){
      hits++;
      width = Math.max(8, width - 3);
      pourStream('#E8791E');
      const t = hits / NEED;
      cavFill.setAttribute('height', (t * 52).toFixed(1));
      cavFill.setAttribute('y', (150 - t * 52).toFixed(1));
    } else if (val < zoneStart()){
      spill();
    } else {
      coldClunk();
    }
    val = 0;
    paint();
    if (hits >= NEED){ stop && stop(); finish(host, ui, true, done, mini); return; }
    if (tries >= TRIES){ stop && stop(); finish(host, ui, false, done, mini); return; }
  }

  ui.action.textContent = '누르고 있다가 놓으시오';
  ui.action.addEventListener('pointerdown', press);
  ui.action.addEventListener('pointerup', release);
  ui.action.addEventListener('pointercancel', release);
  ui.action.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); press(); } });
  ui.action.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') release(); });
  paint();
}

/* ══════════════════════════════════════════════════════════════
   2. mirror — 청동 거울 갈고 닦기 (grind 그대로: 10번 중 6번)
   ══════════════════════════════════════════════════════════════ */
const MIRROR_STAGE = `
<div class="bz-mirror">
  <svg viewBox="0 0 300 188" class="bz-svg" aria-hidden="true">
    <rect x="130" y="156" width="40" height="9" rx="2" fill="#7A5C42"/>
    <rect x="146" y="120" width="8" height="38" fill="#8A6B48"/>
    <ellipse cx="150" cy="94" rx="55" ry="55" fill="#8C8474" stroke="#6B6557" stroke-width="2.4"/>
    <defs><clipPath id="bzMirrorClip"><ellipse cx="150" cy="94" rx="53" ry="53"/></clipPath></defs>
    <g clip-path="url(#bzMirrorClip)">
      <ellipse id="bzSheen" cx="150" cy="94" rx="53" ry="53" fill="#EFE7CE" opacity="0"/>
      <ellipse id="bzGlint" cx="128" cy="72" rx="22" ry="9" fill="#FFF7DE" opacity="0" transform="rotate(-28 128 72)"/>
    </g>
    <ellipse cx="150" cy="94" rx="53" ry="53" fill="none" stroke="#6B6557" stroke-width="1" opacity=".4"/>
    <!-- 문지르는 판(가죽+모래) -->
    <g id="bzPad">
      <ellipse cx="0" cy="0" rx="20" ry="12" fill="#C9A876" stroke="#8A6B48" stroke-width="1.6"/>
      <path d="M-6,-30 q-4,-12 8,-13 h10 q11,1 8,13 l-2,22 h-22 z" fill="#D8B18B"/>
    </g>
  </svg>
  <div class="mg-track bz-slim"><div class="mg-zone" id="bzZone"></div><div class="mg-needle" id="bzNeedle"></div></div>
  <div class="mg-pips" id="bzPips"></div>
</div>`;

function mirrorGame(mini, host, done){
  const ui = shell(host, mini, MIRROR_STAGE);
  const sheen = ui.stage.querySelector('#bzSheen');
  const glint = ui.stage.querySelector('#bzGlint');
  const disc = ui.stage.querySelector('.bz-mirror ellipse');
  const pad = ui.stage.querySelector('#bzPad');
  const zoneEl = ui.stage.querySelector('#bzZone');
  const needle = ui.stage.querySelector('#bzNeedle');
  const pips = ui.stage.querySelector('#bzPips');

  const TOTAL = 10, NEED = 6;
  let width = 16, speed = .95, pos = 0, dir = 1, tries = 0, hits = 0, running = false, stop = null;
  let shown = 0, target = 0;
  const trail = [];
  const PAD_X0 = 100, PAD_W = 100;             // 거울 위를 오가는 구간(px)
  const padX = p => PAD_X0 + p / 100 * PAD_W;
  const zoneStart = () => 50 - width / 2;

  function paint(){
    zoneEl.style.left = zoneStart() + '%';
    zoneEl.style.width = width + '%';
    needle.style.left = pos + '%';
    pips.innerHTML = pipsHtml(TOTAL, tries, hits);
    setScore(ui.score, `${hits} / ${NEED} 성공 · 남은 기회 ${TOTAL - tries}`);
  }

  function paintDisc(){
    if (Math.abs(target - shown) > .001) shown += (target - shown) * .12;
    else shown = target;
    const c = Math.round(140 - shown * 44);
    disc.setAttribute('fill', `rgb(${c+16},${c+8},${c-8})`);
    sheen.setAttribute('opacity', (shown * .5).toFixed(2));
    glint.setAttribute('opacity', (Math.max(0, shown - .6) * 2).toFixed(2));
  }

  function begin(){
    running = true;
    ui.action.textContent = '지금 밀기';
    stop = loop(host, dt => {
      pos += dir * speed * 60 * dt;
      if (pos >= 100){ pos = 100; dir = -1; }
      if (pos <= 0){ pos = 0; dir = 1; }
      trail.push(pos); if (trail.length > 3) trail.shift();
      needle.style.left = pos + '%';
      pad.setAttribute('transform', `translate(${padX(pos).toFixed(1)},94)`);
      paintDisc();
    });
  }
  function inZone(p){ const lo = zoneStart(), hi = lo + width; return p >= lo && p <= hi; }

  function judge(){
    if (!running) return;
    tries++;
    const ok = inZone(pos) || trail.some(inZone);
    if (ok){
      hits++;
      width = Math.max(7.5, width - 3);
      speed = Math.min(2.0, speed + .1);
      target = hits / NEED;
    }
    paint();
    if (hits >= NEED){ running = false; stop && stop(); finish(host, ui, true, done, mini); return; }
    if (tries >= TOTAL){ running = false; stop && stop(); finish(host, ui, false, done, mini); return; }
  }

  const track = ui.stage.querySelector('.mg-track');
  paint(); pad.setAttribute('transform', `translate(${padX(0)},94)`);
  onPress(ui.action, () => { if (!running) begin(); else judge(); });
  onPress(track, () => { if (running) judge(); });
}

/* ══════════════════════════════════════════════════════════════
   3. dolmen — 고인돌 세우기 (lift 그대로: 8번 중 5번)
   신호북(드럼) 채가 흔들리다 알맞은 자리에 온 순간에 당겨야 한다.
   당길 때마다 덮개돌이 흙 비탈을 따라 조금씩 받침돌 위로 오른다.
   ══════════════════════════════════════════════════════════════ */
const DOLMEN_START = { x: 66, y: 158, deg: -7 };
const DOLMEN_END   = { x: 214, y: 116, deg: 0 };
const DRUM = { cx: 46, cy: 156, r: 17 };
const VILLAGERS = [ [20,166], [34,170], [50,168] ];

function dolmenGeom(){
  const cap = `M-72,-13 L70,-15 L80,0 L64,15 L-64,15 L-80,0 Z`;
  return `
  <svg viewBox="0 0 300 190" class="bz-svg" aria-hidden="true">
    <rect x="0" y="172" width="300" height="18" fill="#B9A97C"/>
    <path d="M18,172 L226,128 L300,128 L300,172 Z" fill="#C4B587"/>
    <g stroke="#A8996B" stroke-width="1.2" opacity=".5">
      <path d="M40,168 L232,126 M70,172 L246,124"/>
    </g>
    <!-- 받침돌 -->
    <path d="M185,172 L191,128 L209,128 L215,172 Z" fill="#9B978A" stroke="#7A766A" stroke-width="1.4"/>
    <path d="M231,172 L237,128 L255,128 L261,172 Z" fill="#9B978A" stroke="#7A766A" stroke-width="1.4"/>
    <!-- 밧줄 -->
    <g id="bzRopes" stroke="#8A6B48" stroke-width="2.2" stroke-linecap="round" fill="none"></g>
    <!-- 일꾼들 -->
    <g id="bzFolk"></g>
    <!-- 덮개돌 아래 굴림대(통나무 굴대) — 세상 좌표로 따로 움직인다 -->
    <g id="bzRollers" fill="#6B4A32"></g>
    <!-- 덮개돌 -->
    <g id="bzCap">
      <g id="bzCapInner">
        <path d="${cap}" fill="#8D8879" stroke="#68655A" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M-60,-8 Q0,-14 58,-9" stroke="#A6A192" stroke-width="2" fill="none" opacity=".7"/>
      </g>
    </g>
    <g id="bzCapDust"></g>
    <!-- 신호북 -->
    <g id="bzDrumStand">
      <rect x="${DRUM.cx-3}" y="${DRUM.cy+DRUM.r-2}" width="6" height="14" fill="#6B4A32"/>
      <ellipse cx="${DRUM.cx}" cy="${DRUM.cy}" rx="${DRUM.r}" ry="${DRUM.r*.82}" fill="#8A6B48" stroke="#5E4530" stroke-width="2"/>
      <path id="bzDrumZone" fill="#D98A3C" opacity=".55"/>
      <g id="bzMallet"><line x1="0" y1="0" x2="0" y2="-30" stroke="#5E4530" stroke-width="3.4" stroke-linecap="round"/>
        <circle cx="0" cy="-30" r="4.4" fill="#3E2E1C"/></g>
    </g>
  </svg>`;
}
function villagerHtml(x, y, i){
  return `<g class="bz-folk" id="bzFolk${i}">
    <line x1="${x}" y1="${y-16}" x2="${x}" y2="${y-2}" stroke="#7A5C42" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${x}" cy="${y-19}" r="4.2" fill="#C9A27E"/>
    <line x1="${x}" y1="${y-13}" x2="${x-6}" y2="${y}" stroke="#5E4530" stroke-width="2.6" stroke-linecap="round"/>
    <line x1="${x}" y1="${y-13}" x2="${x+6}" y2="${y}" stroke="#5E4530" stroke-width="2.6" stroke-linecap="round"/>
    <line class="bz-arm" id="bzArm${i}" x1="${x}" y1="${y-14}" x2="${x+16}" y2="${y-10}"
      stroke="#C9A27E" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

function dolmenGame(mini, host, done){
  const ui = shell(host, mini, `<div class="bz-dolmen">${dolmenGeom()}</div>
    <div class="mg-pips" id="bzPips"></div>`);
  const stage = ui.stage;
  const cap    = stage.querySelector('#bzCap');
  const rollers= stage.querySelector('#bzRollers');
  const ropes  = stage.querySelector('#bzRopes');
  const folk   = stage.querySelector('#bzFolk');
  const dust   = stage.querySelector('#bzCapDust');
  const mallet = stage.querySelector('#bzMallet');
  const drumZone = stage.querySelector('#bzDrumZone');
  const pips   = stage.querySelector('#bzPips');

  for (let i = 0; i < 5; i++){
    const r = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    r.setAttribute('rx', 7); r.setAttribute('ry', 3.2);
    rollers.appendChild(r);
  }
  const rollerEls = [...rollers.children];
  folk.innerHTML = VILLAGERS.map((p,i) => villagerHtml(p[0], p[1], i)).join('');

  const TOTAL = 8, NEED = 5;
  let width = 18, speed = .88, pos = 0, dir = 1, tries = 0, hits = 0, running = false, stop = null;
  let shownT = 0, targetT = 0, dip = 0;
  const trail = [];
  const zoneStart = () => 50 - width / 2;
  const angOf = p => -50 + p / 100 * 100;

  function setDrumZone(){
    const lo = zoneStart(), hi = lo + width;
    const a1 = angOf(lo) * Math.PI / 180, a2 = angOf(hi) * Math.PI / 180;
    const R = DRUM.r - 2;
    const x1 = DRUM.cx + Math.sin(a1) * R, y1 = DRUM.cy - Math.cos(a1) * R * .82;
    const x2 = DRUM.cx + Math.sin(a2) * R, y2 = DRUM.cy - Math.cos(a2) * R * .82;
    drumZone.setAttribute('d', `M${DRUM.cx},${DRUM.cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R*.82} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`);
  }

  function placeCap(t){
    const x = lerp(DOLMEN_START.x, DOLMEN_END.x, t);
    const y = lerp(DOLMEN_START.y, DOLMEN_END.y, t);
    const deg = lerp(DOLMEN_START.deg, DOLMEN_END.deg, t);
    cap.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${deg.toFixed(1)})`);
    rollerEls.forEach((r, i) => {
      const rx = x + (i - (rollerEls.length-1)/2) * 26;
      r.setAttribute('cx', rx.toFixed(1)); r.setAttribute('cy', (y + 15).toFixed(1));
    });
    const anchorX = x - 58, anchorY = y + 4;
    ropes.innerHTML = VILLAGERS.map(p =>
      `<line x1="${anchorX.toFixed(1)}" y1="${anchorY.toFixed(1)}" x2="${p[0]}" y2="${p[1]-16}"/>`).join('');
    return { anchorX, anchorY };
  }

  function paint(){
    mallet.setAttribute('transform', `translate(${DRUM.cx},${DRUM.cy}) rotate(${angOf(pos).toFixed(1)})`);
    if (Math.abs(targetT - shownT + dip) > .001) shownT += (targetT - dip - shownT) * .18;
    else shownT = targetT - dip;
    placeCap(clamp(shownT, 0, 1));
    pips.innerHTML = pipsHtml(TOTAL, tries, hits);
    setScore(ui.score, `${hits} / ${NEED} 성공 · 남은 기회 ${TOTAL - tries}`);
  }

  function begin(){
    running = true;
    ui.action.textContent = '당겨라!';
    stop = loop(host, dt => {
      pos += dir * speed * 60 * dt;
      if (pos >= 100){ pos = 100; dir = -1; }
      if (pos <= 0){ pos = 0; dir = 1; }
      trail.push(pos); if (trail.length > 3) trail.shift();
      if (dip > 0){ dip = Math.max(0, dip - dt * 1.6); }
      paint();
    });
  }
  function inZone(p){ const lo = zoneStart(), hi = lo + width; return p >= lo && p <= hi; }

  function pull(ok){
    VILLAGERS.forEach((p,i) => {
      const g = stage.querySelector('#bzFolk' + i);
      if (!g) return;
      const deg = ok ? -14 : 8;
      g.setAttribute('transform', `rotate(${deg} ${p[0]} ${p[1]})`);
      setTimeout(() => g.setAttribute('transform', ''), 220);
    });
    const { anchorX, anchorY } = placeCap(clamp(shownT, 0, 1));
    burst(dust, anchorX, anchorY + 10, ok ? 6 : 4, ok ? ['#C9BFA6','#A69A78'] : ['#A69A78'], 16);
  }

  function judge(){
    if (!running) return;
    tries++;
    const ok = inZone(pos) || trail.some(inZone);
    if (ok){
      hits++;
      width = Math.max(9.5, width - 2.5);
      speed = Math.min(1.9, speed + .12);
      targetT = hits / NEED;
      setDrumZone();
      pull(true);
    } else {
      dip = Math.min(.5, dip + .16);
      pull(false);
    }
    paint();
    if (hits >= NEED){
      running = false; stop && stop();
      const inner = stage.querySelector('#bzCapInner');
      if (inner) inner.classList.add('bz-settle');
      setTimeout(() => finish(host, ui, true, done, mini), 480);
      return;
    }
    if (tries >= TOTAL){ running = false; stop && stop(); finish(host, ui, false, done, mini); return; }
  }

  setDrumZone(); placeCap(0); paint();
  onPress(ui.action, () => { if (!running) begin(); else judge(); });
  onPress(stage.querySelector('.bz-dolmen'), () => { if (running) judge(); });
}

/* ══════════════════════════════════════════════════════════════
   4. palisade — 마을을 지키는 도랑과 울타리
   원래 등록된 'stack' 을 그대로 부르고, 그림만 새로 준다.
   ══════════════════════════════════════════════════════════════ */
const PALISADE_VISUAL = (() => {
  let s = '<rect x="0" y="140" width="200" height="30" fill="#B9C08E" opacity=".55"/>';
  s += '<g class="stack-part" data-step="0">'
     + '<rect x="10" y="136" width="180" height="14" rx="4" fill="#6B5D45"/>'
     + '<rect x="10" y="136" width="180" height="4" fill="#4F4432" opacity=".5"/>'
     + '</g>';
  const xs = [20, 46, 72, 98, 124, 150, 176];
  let posts = '<g class="stack-part" data-step="1">';
  xs.forEach((x, i) => { posts += `<rect x="${x-4}" y="72" width="8" height="68" rx="2" fill="${i % 2 ? '#7A5C42' : '#8A6B48'}"/>`; });
  posts += '</g>';
  s += posts;
  let tips = '<g class="stack-part" data-step="2">';
  xs.forEach(x => { tips += `<path d="M${x},60 L${x-5},72 L${x+5},72 Z" fill="#B08A5E"/>`; });
  tips += '</g>';
  s += tips;
  s += '<g class="stack-part" data-step="3">'
     + '<rect x="86" y="120" width="4" height="20" fill="#6B4A32"/>'
     + '<rect x="110" y="120" width="4" height="20" fill="#6B4A32"/>'
     + '<rect x="74" y="96" width="52" height="14" fill="#9B7A52"/>'
     + '<path d="M100,58 L130,96 L70,96 Z" fill="#6B4A32"/>'
     + '<line x1="100" y1="58" x2="100" y2="38" stroke="#5E4530" stroke-width="2"/>'
     + '<path d="M100,38 L118,44 L100,50 Z" fill="#A8534F"/>'
     + '</g>';
  return s;
})();

function palisadeGame(mini, host, done){
  const startStack = MINIGAME_STARTERS['stack'];
  if (!startStack){ finish(host, shell(host, mini, ''), true, done, mini); return; }
  startStack(Object.assign({}, mini, { visual: PALISADE_VISUAL }), host, done);
}

/* ── 등록 ──────────────────────────────────────────────────── */
MINIGAME_STARTERS['cast']     = castGame;
MINIGAME_STARTERS['mirror']   = mirrorGame;
MINIGAME_STARTERS['dolmen']   = dolmenGame;
MINIGAME_STARTERS['palisade'] = palisadeGame;

MINIGAME_LABELS['cast']     = '청동물 붓기';
MINIGAME_LABELS['mirror']   = '거울 닦기';
MINIGAME_LABELS['dolmen']   = '고인돌 세우기';
MINIGAME_LABELS['palisade'] = '도랑·울타리 세우기';
