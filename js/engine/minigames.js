// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   minigames.js — 미니게임 20형식

   기존 10형식 (MASTER.md §5-3 확정 상수 그대로)
     spin · knap · ember · stack · grind · lift · sort · memory · blank · aim(기본형)
   신규 10형식 (설계 §3-8, 개수·중복 제한 없음)
     dig · trace · weigh · route · order · spot · rhythm · steer · cipher · pour

   공통 규약 (§5-1)
     - 미니게임 앞에는 반드시 선택형 문제가 먼저 온다 (ui.js 가 보장)
     - 실패를 막다른 길로 만들지 않는다. 언제나 다시 할 수 있다
     - 판정은 pointerdown (§5-2). 뒤따르는 click 은 700ms 안이면 무시.
       키보드(Enter/Space)로 온 click 은 살려 둔다
     - 화면은 코드보다 1~2 프레임 늦다. 2프레임 전 위치도 명중으로 쳐 준다

   계약:  start(mini, host, done)   done(true|false)
   ══════════════════════════════════════════════════════════════════════ */

import { icon as svgIcon, iconName } from './icons.js';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* 놀이 조각도 이모지를 쓰지 않는다 (요구 2).
   자료(js/eras/*.js)가 아직 이모지를 넘겨 주더라도 iconName 이 선 아이콘으로 옮긴다 */
const sym = (v, size, color) => svgIcon(iconName(v, 'dot'), { size: size || 22, color: color });

/* 학생이 쓰는 글의 금칙어 검사 (요구 6) */
const WORDS = (typeof window !== 'undefined' && window.AtlasWords) || null;

/* ── 누르는 순간 판정 (§5-2) ─────────────────────────────────── */
export function onPress(el, fn){
  let last = 0;
  el.addEventListener('pointerdown', e => {
    if (e.button != null && e.button !== 0) return;
    last = performance.now();
    fn(e);
  });
  el.addEventListener('click', e => {
    // 키보드에서 온 click 은 detail === 0 → 살려 둔다
    if (e.detail === 0 && performance.now() - last > 700) fn(e);
  });
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); last = performance.now(); fn(e); }
  });
}

/* ── 뼈대 ────────────────────────────────────────────────────── */
function shell(host, mini, innerHTML){
  host.innerHTML = `
    <div class="mg">
      ${mini.tag ? `<p class="mg-tag">${esc(mini.tag)}</p>` : ''}
      <p class="mg-intro">${esc(mini.intro || '')}</p>
      <div class="mg-stage" id="mgStage">${innerHTML}</div>
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

/* 종료 헬퍼 — 실패해도 막다른 길이 아니다 */
function finish(host, ui, ok, done, mini){
  ui.action.textContent = ok ? '잘 하였소 →' : (mini.retryLabel || '다시 해 보겠소');
  ui.action.className = ok ? 'mg-btn' : 'mg-btn sub';
  // stack·sort·dig·trace·route·order·spot·cipher 는 놀이 중 단추를 style.display='none' 으로
  // 숨겨 둔다. cloneNode(true) 는 그 인라인 스타일까지 그대로 옮기므로, 여기서 지우지 않으면
  // "잘 하였소" 단추가 만들어지고도 보이지 않아 다음으로 넘어갈 길이 없어진다.
  ui.action.style.display = '';
  const fresh = ui.action.cloneNode(true);
  ui.action.replaceWith(fresh);
  onPress(fresh, () => done(ok));
}

/* 애니메이션 루프 관리 (모달이 닫히면 멈춘다) */
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

/* ══════════════════════════════════════════════════════════════
   바늘형 공용 — aim(기본형) · knap · grind · lift
   ══════════════════════════════════════════════════════════════ */
function needleGame(mini, host, done, cfg){
  const ui = shell(host, mini, `
    <div class="mg-track" id="mgTrack">
      <div class="mg-zone" id="mgZone"></div>
      <div class="mg-needle" id="mgNeedle"></div>
    </div>
    <div class="mg-pips" id="mgPips"></div>`);

  const track = ui.stage.querySelector('#mgTrack');
  const zoneEl = ui.stage.querySelector('#mgZone');
  const needle = ui.stage.querySelector('#mgNeedle');
  const pips = ui.stage.querySelector('#mgPips');

  let width = cfg.zone0, speed = cfg.speed0, pos = 0, dir = 1;
  let tries = 0, hits = 0, running = false, stop = null;
  const history = [];                    // 2프레임 전 위치 (지연 보정)

  const zoneStart = () => 50 - width / 2;

  function paint(){
    zoneEl.style.left = zoneStart() + '%';
    zoneEl.style.width = width + '%';
    needle.style.left = pos + '%';
    let s = '';
    for (let i = 0; i < cfg.total; i++){
      const cls = i < history.length ? (history[i] ? 'hit' : 'miss') : '';
      s += `<span class="mg-pip ${cls}"></span>`;
    }
    pips.innerHTML = s;
    setScore(ui.score, `${hits} / ${cfg.need} 성공  ·  남은 기회 ${cfg.total - tries}`);
  }

  const recent = [];
  function begin(){
    running = true;
    ui.action.textContent = cfg.hitLabel || mini.hitLabel || '지금이오!';
    stop = loop(host, dt => {
      pos += dir * speed * 60 * dt;
      if (pos >= 100){ pos = 100; dir = -1; }
      if (pos <= 0){ pos = 0; dir = 1; }
      recent.push(pos);
      if (recent.length > 3) recent.shift();
      needle.style.left = pos + '%';
    });
  }

  function judge(){
    if (!running) return;
    tries++;
    const lo = zoneStart(), hi = lo + width;
    // 아이가 '본' 자리(2프레임 전)도 명중으로 쳐 준다
    const cand = recent.slice();
    const ok = cand.some(p => p >= lo && p <= hi);
    history.push(ok);
    if (ok){
      hits++;
      width = Math.max(cfg.zoneMin, width - 3);
      speed = Math.min(cfg.speedMax, speed + 0.1);
    }
    paint();
    if (hits >= cfg.need){ running = false; stop && stop(); finish(host, ui, true, done, mini); return; }
    if (tries >= cfg.total){ running = false; stop && stop(); finish(host, ui, false, done, mini); return; }
  }

  paint();
  onPress(ui.action, () => { if (!running) begin(); else judge(); });
  onPress(track, () => { if (running) judge(); });
}

export function startMinigame(mini, host, done){   // 기본형 aim
  needleGame(mini, host, done, { total:3, need:2, zone0:23, zoneMin:14, speed0:.80, speedMax:1.7 });
}
const startAim = startMinigame;

function startGrind(mini, host, done){
  needleGame(mini, host, done, { total:10, need:6, zone0:16, zoneMin:7.5, speed0:.95, speedMax:2.0,
                                 hitLabel:'번갈아 밀기' });
}
function startLift(mini, host, done){
  needleGame(mini, host, done, { total:8, need:5, zone0:18, zoneMin:9.5, speed0:.88, speedMax:1.9,
                                 hitLabel:'힘을 주시오' });
}

/* ── knap — 누르고 있다 놓기 (게이지 0.75초에 100%) ──────────── */
function startKnap(mini, host, done){
  const ui = shell(host, mini, `
    <div class="mg-gauge"><div class="mg-gauge-zone" id="mgZone"></div><div class="mg-gauge-fill" id="mgFill"></div></div>
    <div class="mg-pips" id="mgPips"></div>`);
  const fill = ui.stage.querySelector('#mgFill');
  const zone = ui.stage.querySelector('#mgZone');
  const pips = ui.stage.querySelector('#mgPips');

  let width = 20, val = 0, holding = false, tries = 0, hits = 0, stop = null;
  const history = [];
  const zoneStart = () => 62 - width / 2;

  function paint(){
    zone.style.left = zoneStart() + '%';
    zone.style.width = width + '%';
    let s = '';
    for (let i = 0; i < 6; i++){
      const cls = i < history.length ? (history[i] ? 'hit' : 'miss') : '';
      s += `<span class="mg-pip ${cls}"></span>`;
    }
    pips.innerHTML = s;
    setScore(ui.score, `${hits} / 4 성공  ·  남은 기회 ${6 - tries}`);
  }

  stop = loop(host, dt => {
    if (holding){
      val = Math.min(100, val + dt * (100 / 0.75));
      fill.style.width = val + '%';
    }
  });

  function press(){ if (tries >= 6) return; holding = true; val = 0; }
  function release(){
    if (!holding) return;
    holding = false;
    tries++;
    const lo = zoneStart(), hi = lo + width;
    const ok = val >= lo && val <= hi;
    history.push(ok);
    if (ok){ hits++; width = Math.max(8, width - 3); }
    val = 0; fill.style.width = '0%';
    paint();
    if (hits >= 4){ stop && stop(); finish(host, ui, true, done, mini); return; }
    if (tries >= 6){ stop && stop(); finish(host, ui, false, done, mini); return; }
  }

  ui.action.textContent = '누르고 있다가 놓으시오';
  ui.action.addEventListener('pointerdown', press);
  ui.action.addEventListener('pointerup', release);
  ui.action.addEventListener('pointercancel', release);
  ui.action.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); press(); } });
  ui.action.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') release(); });
  paint();
}

/* ── ember — 눌러 불씨 유지 ──────────────────────────────────── */
function startEmber(mini, host, done){
  const ui = shell(host, mini, `
    <div class="mg-ember">
      <div class="mg-flame" id="mgFlame">${sym('fire', 34, '#C25B4F')}</div>
      <div class="mg-gauge" style="width:100%"><div class="mg-gauge-fill" id="mgFill"></div></div>
    </div>`);
  const flame = ui.stage.querySelector('#mgFlame');
  const fill = ui.stage.querySelector('#mgFill');

  const HOLD_MS = mini.holdMs || 6000;
  let level = 55, held = 0, cool = 0, running = false, stop = null;

  function paint(){
    fill.style.width = level + '%';
    fill.style.background = (level >= 40 && level <= 75) ? '#6E9B94' : '#A8534F';
    const k = .6 + level / 100;
    flame.style.transform = `scale(${k.toFixed(2)})`;
    flame.style.opacity = Math.max(.25, Math.min(1, level / 60)).toFixed(2);
    setScore(ui.score, `알맞은 세기 유지  ${(held/1000).toFixed(1)} / ${(HOLD_MS/1000).toFixed(0)}초`);
  }

  function begin(){
    running = true;
    ui.action.textContent = '나뭇가지 넣기';
    stop = loop(host, dt => {
      level -= 13 * dt;
      cool = Math.max(0, cool - dt * 1000);
      if (level >= 40 && level <= 75) held += dt * 1000;
      if (level <= 0){
        level = 0; paint(); running = false; stop && stop();
        finish(host, ui, false, done, mini); return false;
      }
      if (held >= HOLD_MS){
        paint(); running = false; stop && stop();
        finish(host, ui, true, done, mini); return false;
      }
      paint();
    });
  }

  onPress(ui.action, () => {
    if (!running){ begin(); return; }
    if (cool > 0) return;
    cool = 450;
    level = Math.min(100, level + 16);
    paint();
  });
  paint();
}

/* ── spin — 원을 그리듯 돌리기 (실패 없음) ──────────────────── */
function startSpin(mini, host, done){
  const laps = mini.laps || 4;
  const ui = shell(host, mini, `
    <div class="mg-spin-wrap">
      <div class="mg-wheel" id="mgWheel"><div class="mg-wheel-dot"></div></div>
    </div>`);
  const wheel = ui.stage.querySelector('#mgWheel');

  let last = null, total = 0, spinning = false;
  ui.action.textContent = '돌리시오 (드래그)';

  function angle(e){
    const r = wheel.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height/2), e.clientX - (r.left + r.width/2));
  }
  function paint(){
    const done_ = total / (Math.PI * 2);
    setScore(ui.score, `${done_.toFixed(1)} / ${laps} 바퀴`);
    wheel.style.transform = `rotate(${total}rad)`;
  }

  wheel.addEventListener('pointerdown', e => {
    spinning = true; last = angle(e); wheel.setPointerCapture(e.pointerId);
  });
  wheel.addEventListener('pointermove', e => {
    if (!spinning) return;
    const a = angle(e);
    let d = a - last;
    while (d >  Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    last = a;
    total += Math.abs(d);
    paint();
    if (total >= laps * Math.PI * 2){
      spinning = false;
      finish(host, ui, true, done, mini);
    }
  });
  const stopSpin = () => { spinning = false; };
  wheel.addEventListener('pointerup', stopSpin);
  wheel.addEventListener('pointercancel', stopSpin);

  // 키보드 대체 — 버튼 연타로도 돌아간다
  onPress(ui.action, () => {
    total += Math.PI / 3;
    paint();
    if (total >= laps * Math.PI * 2) finish(host, ui, true, done, mini);
  });
  paint();
}

/* ── stack — 순서대로 누르기 (실수 3회) ─────────────────────── */
function autoVisual(n){
  // 콘텐츠 문서에 visual 이 없다 → steps 수에 맞춰 아래에서 위로 쌓는 단순 도형 (§5-4)
  let s = `<rect x="0" y="142" width="200" height="28" fill="#C9C2A8" opacity=".5"/>`;
  const h = Math.min(30, 120 / n);
  for (let i = 0; i < n; i++){
    const w = 150 - i * (90 / Math.max(1, n));
    const y = 142 - (i + 1) * h;
    s += `<g class="stack-part" data-step="${i}">
            <rect x="${(200 - w) / 2}" y="${y}" width="${w}" height="${h - 3}" rx="4"
                  fill="${i % 2 ? '#B9A98A' : '#C9BFA6'}" stroke="#A8987A"/>
          </g>`;
  }
  return s;
}

function startStack(mini, host, done){
  const steps = (mini.steps && mini.steps.length) ? mini.steps : ['첫째','둘째','셋째','넷째'];
  const visual = mini.visual || autoVisual(steps.length);
  const ui = shell(host, mini, `
    <svg class="mg-stack-visual" viewBox="0 0 200 170">${visual}</svg>
    <div class="mg-steps" id="mgSteps"></div>`);
  const list = ui.stage.querySelector('#mgSteps');
  const parts = ui.stage.querySelectorAll('.stack-part');

  let at = 0, miss = 0;
  const order = steps.map((_, i) => i);
  const shuffled = order.slice().sort(() => Math.random() - .5);

  function paint(){
    list.innerHTML = shuffled.map(i =>
      `<button class="mg-step ${order.indexOf(i) < at ? 'done' : ''}" data-i="${i}" type="button">${esc(steps[i])}</button>`
    ).join('');
    list.querySelectorAll('.mg-step').forEach(b => onPress(b, () => pick(+b.dataset.i)));
    parts.forEach((p, i) => p.classList.toggle('on', i < at));
    setScore(ui.score, `${at} / ${steps.length} 단계  ·  실수 ${miss} / 3`);
  }
  function pick(i){
    if (i === at){
      at++;
      paint();
      if (at >= steps.length) finish(host, ui, true, done, mini);
    } else {
      miss++;
      paint();
      if (miss >= 3) finish(host, ui, false, done, mini);
    }
  }
  ui.action.style.display = 'none';
  paint();
}

/* ── sort — 두 통에 나누기 (70% 이상) ───────────────────────── */
function startSort(mini, host, done){
  const items = (mini.items || []).slice();
  const ui = shell(host, mini, `
    <div class="mg-sort-items" id="mgPool"></div>
    <div class="mg-bins">
      <div class="mg-bin" id="binL"><b>${esc(mini.binLeftIcon || '')} ${esc(mini.binLeftLabel || '왼쪽')}</b><div class="bin-items" id="binLI"></div></div>
      <div class="mg-bin" id="binR"><b>${esc(mini.binRightIcon || '')} ${esc(mini.binRightLabel || '오른쪽')}</b><div class="bin-items" id="binRI"></div></div>
    </div>`);
  const pool = ui.stage.querySelector('#mgPool');
  const binLI = ui.stage.querySelector('#binLI');
  const binRI = ui.stage.querySelector('#binRI');

  let idx = 0;
  const results = [];

  function paint(){
    if (idx >= items.length){
      const ok = results.filter(Boolean).length / items.length >= .7;
      setScore(ui.score, `${results.filter(Boolean).length} / ${items.length} 맞음`);
      pool.innerHTML = '';
      finish(host, ui, ok, done, mini);
      return;
    }
    const it = items[idx];
    pool.innerHTML = `<span class="mg-chip">${esc(it.icon || '')} ${esc(it.label)}</span>`;
    setScore(ui.score, `${idx} / ${items.length}  —  어느 쪽이오?`);
  }
  function put(left){
    if (idx >= items.length) return;
    const it = items[idx];
    const ok = (!!it.korean) === left;
    results.push(ok);
    (left ? binLI : binRI).insertAdjacentHTML('beforeend',
      `<span class="mg-chip" style="${ok ? '' : 'opacity:.5'}">${esc(it.icon || '')} ${esc(it.label)}</span>`);
    idx++;
    paint();
  }
  onPress(ui.stage.querySelector('#binL'), () => put(true));
  onPress(ui.stage.querySelector('#binR'), () => put(false));
  ui.action.style.display = 'none';
  paint();
}

/* ── memory — 순서 기억해 되누르기 (한 번 틀리면 즉시 실패) ─── */
function startMemory(mini, host, done){
  const rounds = Math.min(4, mini.rounds || 4);
  const icons = mini.icons || ['fire','water','leaf','mountain','moon','sun'];
  const n = Math.min(icons.length, 6);
  const ui = shell(host, mini, `<div class="mg-memory" id="mgCells"></div>`);
  const cells = ui.stage.querySelector('#mgCells');

  let round = 0, seq = [], input = [], showing = false;

  function paint(){
    cells.innerHTML = icons.slice(0, n).map((ic, i) =>
      `<button class="mg-mcell" data-i="${i}" type="button">${sym(ic, 26)}</button>`).join('');
    cells.querySelectorAll('.mg-mcell').forEach(b => onPress(b, () => tap(+b.dataset.i)));
    setScore(ui.score, `${round} / ${rounds} 판`);
  }
  function light(i, ms){
    const el = cells.querySelector(`[data-i="${i}"]`);
    if (!el) return;
    el.classList.add('lit');
    setTimeout(() => el.classList.remove('lit'), ms);
  }
  async function show(){
    showing = true;
    ui.action.textContent = '잘 보시오…';
    for (let k = 0; k < seq.length; k++){
      await new Promise(r => setTimeout(r, 480));
      light(seq[k], 340);
    }
    await new Promise(r => setTimeout(r, 480));
    showing = false;
    ui.action.textContent = '이제 그대로 누르시오';
  }
  function nextRound(){
    round++;
    if (round > rounds){ finish(host, ui, true, done, mini); return; }
    const len = 2 + (round - 1);
    seq = Array.from({ length: len }, () => Math.floor(Math.random() * n));
    input = [];
    paint();
    show();
  }
  function tap(i){
    if (showing) return;
    light(i, 200);
    input.push(i);
    const k = input.length - 1;
    if (input[k] !== seq[k]){ finish(host, ui, false, done, mini); return; }
    if (input.length === seq.length) setTimeout(nextRound, 480);
  }
  paint();
  onPress(ui.action, () => { if (round === 0) nextRound(); });
  ui.action.textContent = '시작하기';
}

/* ── blank — 빈칸에 낱말 쓰기 (실패 없음) ───────────────────── */
function normalize(s){
  return String(s == null ? '' : s).toLowerCase()
    .replace(/[\s ]/g,'')
    .replace(/[·・.,、。!?！？"'“”‘’()\[\]{}<>「」『』~\-—–_/\\|:;]/g,'');
}
function startBlank(mini, host, done){
  const answers = (Array.isArray(mini.answer) ? mini.answer : [mini.answer || mini['정답'] || '']).filter(Boolean);
  const ui = shell(host, mini, `
    <p style="font-size:16px;font-weight:700">${esc(mini.question || '빈칸에 알맞은 말을 적으시오.')}</p>
    <div class="q-blank-wrap">
      <input class="q-blank-input" id="mgBlank" type="text" autocomplete="off" placeholder="여기에 적으시오">
    </div>`);
  const input = ui.stage.querySelector('#mgBlank');
  let tries = 0;

  ui.action.textContent = '확인';
  onPress(ui.action, check);
  input.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); check(); } });

  function check(){
    const raw = String(input.value || '');

    /* 금칙어가 섞이면 채점하지 않는다 (요구 6) */
    if (WORDS){
      const r = WORDS.check(raw);
      if (!r.ok){
        input.classList.add('wrong');
        setScore(ui.score, r.message);
        return;
      }
    }

    const v = normalize(raw);
    if (!v) return;
    tries++;
    if (answers.map(normalize).includes(v)){
      input.disabled = true;
      input.classList.remove('wrong');
      finish(host, ui, true, done, mini);
    } else {
      input.classList.add('wrong');
      setScore(ui.score, (tries >= 2 && mini.hint) ? mini.hint : (mini.no || '그것이 아니오. 다시 적어 보시오.'));
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   신규 10형식
   ══════════════════════════════════════════════════════════════ */

/* ── dig — 격자 흙을 파서 유물 찾기 ─────────────────────────── */
function startDig(mini, host, done){
  const cols = mini.cols || 6, rows = mini.rows || 4;
  const relics = mini.relics || ['axe','relic','bone'];
  const digs = mini.digs || Math.ceil(cols * rows * .5);
  const ui = shell(host, mini, `<div class="mg-dig" id="mgGrid" style="grid-template-columns:repeat(${cols},1fr)"></div>`);
  const grid = ui.stage.querySelector('#mgGrid');

  const total = cols * rows;
  const spots = [];
  while (spots.length < relics.length){
    const p = Math.floor(Math.random() * total);
    if (!spots.includes(p)) spots.push(p);
  }
  let used = 0, found = 0;

  function paint(){
    setScore(ui.score, `유물 ${found} / ${relics.length}  ·  남은 삽질 ${digs - used}`);
  }
  grid.innerHTML = Array.from({ length: total }, (_, i) =>
    `<button class="mg-cell" data-i="${i}" type="button" aria-label="흙 파기"></button>`).join('');
  grid.querySelectorAll('.mg-cell').forEach(b => onPress(b, () => dig(b, +b.dataset.i)));

  function dig(el, i){
    if (el.classList.contains('dug') || el.classList.contains('found')) return;
    if (used >= digs) return;
    used++;
    const k = spots.indexOf(i);
    if (k >= 0){
      el.classList.add('found');
      el.textContent = relics[k];
      found++;
    } else {
      el.classList.add('dug');
      el.textContent = '·';
    }
    paint();
    if (found >= relics.length){ finish(host, ui, true, done, mini); return; }
    if (used >= digs){ finish(host, ui, false, done, mini); }
  }
  ui.action.style.display = 'none';
  paint();
}

/* ── trace — 점을 순서대로 이어 그리기 ──────────────────────── */
function startTrace(mini, host, done){
  const nodes = mini.nodes || [[20,80],[50,20],[80,80],[50,60],[20,80]];
  const ui = shell(host, mini, `<div class="mg-trace" id="mgTrace"><svg id="mgLine" style="position:absolute;inset:0;width:100%;height:100%"></svg></div>`);
  const wrap = ui.stage.querySelector('#mgTrace');
  const svg = ui.stage.querySelector('#mgLine');

  let at = 0, slips = 0;
  nodes.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'mg-tnode';
    b.type = 'button';
    b.textContent = i + 1;
    b.style.left = p[0] + '%';
    b.style.top = p[1] + '%';
    b.dataset.i = i;
    wrap.appendChild(b);
    onPress(b, () => tap(i));
  });

  function paint(){
    wrap.querySelectorAll('.mg-tnode').forEach((el, i) => {
      el.classList.toggle('done', i < at);
      el.classList.toggle('next', i === at);
    });
    let d = '';
    for (let i = 1; i < at; i++){
      d += `<line x1="${nodes[i-1][0]}%" y1="${nodes[i-1][1]}%" x2="${nodes[i][0]}%" y2="${nodes[i][1]}%" stroke="#6E9B94" stroke-width="3" stroke-linecap="round"/>`;
    }
    svg.innerHTML = d;
    setScore(ui.score, `${at} / ${nodes.length} 획`);
  }
  function tap(i){
    if (i === at){
      at++;
      paint();
      if (at >= nodes.length) finish(host, ui, true, done, mini);
    } else {
      slips++;
      at = 0;
      paint();
      setScore(ui.score, `차례가 어긋났소. 처음부터 다시 그어 보시오. (${slips}번째)`);
    }
  }
  ui.action.style.display = 'none';
  paint();
}

/* ── weigh — 저울 균형 맞추기 ───────────────────────────────── */
function startWeigh(mini, host, done){
  const target = mini.target || 12;
  const weights = mini.weights || [1,2,3,5,8];
  const tol = mini.tolerance || 0;
  const ui = shell(host, mini, `
    <div class="mg-scale">
      <div class="mg-pan" id="panL"><b id="panLV">0</b><div style="font-size:12px;color:#777">내 짐</div></div>
      <div class="mg-beam" id="beam"></div>
      <div class="mg-pan" id="panR"><b>${target}</b><div style="font-size:12px;color:#777">${esc(mini.targetLabel || '기준')}</div></div>
    </div>
    <div class="mg-sort-items" id="mgW" style="margin-top:14px"></div>`);
  const panL = ui.stage.querySelector('#panL');
  const panLV = ui.stage.querySelector('#panLV');
  const beam = ui.stage.querySelector('#beam');
  const bank = ui.stage.querySelector('#mgW');

  let sum = 0;
  bank.innerHTML = weights.map((w, i) =>
    `<button class="mg-chip" data-w="${w}" type="button">${sym('scale', 15)} ${w}</button>`).join('') +
    `<button class="mg-chip" data-w="reset" type="button">↺ 비우기</button>`;
  bank.querySelectorAll('.mg-chip').forEach(b => onPress(b, () => {
    if (b.dataset.w === 'reset') sum = 0; else sum += +b.dataset.w;
    paint();
  }));

  function paint(){
    panLV.textContent = sum;
    const diff = sum - target;
    const tilt = Math.max(-12, Math.min(12, diff * 2));
    beam.style.transform = `rotate(${tilt}deg)`;
    panL.style.transform = `translateY(${tilt * .6}px)`;
    setScore(ui.score, Math.abs(diff) <= tol ? '평형이오!' : (diff > 0 ? '내 쪽이 무겁소' : '내 쪽이 가볍소'));
    ui.action.textContent = Math.abs(diff) <= tol ? '확인하기' : '아직이오';
  }
  onPress(ui.action, () => {
    if (Math.abs(sum - target) <= tol) finish(host, ui, true, done, mini);
  });
  paint();
}

/* ── route — 격자에서 길 고르기 ─────────────────────────────── */
function startRoute(mini, host, done){
  const cols = mini.cols || 5, rows = mini.rows || 5;
  const blocked = new Set(mini.blocked || []);
  const start = mini.start == null ? (rows - 1) * cols : mini.start;
  const goal  = mini.goal  == null ? cols - 1 : mini.goal;
  const ui = shell(host, mini, `<div class="mg-route" id="mgR" style="grid-template-columns:repeat(${cols},1fr)"></div>`);
  const grid = ui.stage.querySelector('#mgR');

  let here = start;
  const path = [start];
  let slips = 0;

  function paint(){
    grid.innerHTML = Array.from({ length: cols * rows }, (_, i) => {
      let cls = 'mg-rcell';
      let ch = '';
      if (blocked.has(i)){ cls += ' blocked'; ch = sym(mini.blockIcon || 'mountain', 18); }
      if (path.includes(i)) cls += ' path';
      if (i === here){ cls += ' here'; ch = sym('dove', 18); }
      else if (i === goal) ch = sym(mini.goalIcon || 'flag', 18);
      return `<button class="${cls}" data-i="${i}" type="button">${ch}</button>`;
    }).join('');
    grid.querySelectorAll('.mg-rcell').forEach(b => onPress(b, () => step(+b.dataset.i)));
    paintScore();
  }
  function paintScore(){
    setScore(ui.score, `${path.length - 1} 걸음  ·  잘못 든 길 ${slips}`);
  }
  function step(i){
    const rx = i % cols, ry = Math.floor(i / cols);
    const hx = here % cols, hy = Math.floor(here / cols);
    if (Math.abs(rx - hx) + Math.abs(ry - hy) !== 1) return;
    if (blocked.has(i)){ slips++; setScore(ui.score, mini.blockedSay || '그 길은 막혔소.'); return; }
    here = i;
    if (!path.includes(i)) path.push(i);
    paint();
    if (here === goal) finish(host, ui, true, done, mini);
  }
  ui.action.style.display = 'none';
  paint();
}

/* ── order — 차례대로 세우기 ────────────────────────────────── */
function startOrder(mini, host, done){
  const cards = (mini.cards || []).slice();       // 원본이 이미 올바른 차례
  const ui = shell(host, mini, `
    <div class="mg-oslots" id="mgSlots"></div>
    <div class="mg-order" id="mgCards"></div>`);
  const slots = ui.stage.querySelector('#mgSlots');
  const list = ui.stage.querySelector('#mgCards');

  const shuffled = cards.map((c, i) => ({ c, i })).sort(() => Math.random() - .5);
  let at = 0, miss = 0;

  function paint(){
    slots.innerHTML = cards.slice(0, at).map(c => `<span class="mg-oslot">${esc(c)}</span>`).join('') ||
      '<span class="mg-oslot" style="opacity:.5">여기에 차례대로 놓으시오</span>';
    list.innerHTML = shuffled.map(o =>
      `<button class="mg-ocard ${o.i < at ? 'placed' : ''}" data-i="${o.i}" type="button" ${o.i < at ? 'disabled' : ''}>${esc(o.c)}</button>`
    ).join('');
    list.querySelectorAll('.mg-ocard').forEach(b => onPress(b, () => pick(+b.dataset.i)));
    setScore(ui.score, `${at} / ${cards.length}  ·  실수 ${miss} / 3`);
  }
  function pick(i){
    if (i === at){
      at++; paint();
      if (at >= cards.length) finish(host, ui, true, done, mini);
    } else {
      miss++; paint();
      if (miss >= 3) finish(host, ui, false, done, mini);
    }
  }
  ui.action.style.display = 'none';
  paint();
}

/* ── spot — 두 자료에서 다른 곳 찾기 ────────────────────────── */
function startSpot(mini, host, done){
  const cols = mini.cols || 4, rows = mini.rows || 4;
  const base = mini.base || ['relic','relic','relic','relic'];
  const diffs = mini.diffs || 3;
  const total = cols * rows;

  const left = Array.from({ length: total }, (_, i) => base[i % base.length]);
  const right = left.slice();
  const spots = [];
  const alt = mini.alt || ['lamp','urn','teapot'];
  while (spots.length < diffs){
    const p = Math.floor(Math.random() * total);
    if (spots.includes(p)) continue;
    spots.push(p);
    right[p] = alt[spots.length % alt.length];
  }

  const ui = shell(host, mini, `
    <div class="mg-spot">
      <div class="mg-spot-pane"><div class="mg-dig" style="grid-template-columns:repeat(${cols},1fr)">${
        left.map(c => `<div class="mg-cell" style="background:#F1F1EC;border-color:#EAEAEA">${c}</div>`).join('')
      }</div></div>
      <div class="mg-spot-pane"><div class="mg-dig" id="mgRight" style="grid-template-columns:repeat(${cols},1fr)">${
        right.map((c, i) => `<button class="mg-cell" data-i="${i}" type="button" style="background:#F1F1EC;border-color:#EAEAEA">${c}</button>`).join('')
      }</div></div>
    </div>`);
  const rightGrid = ui.stage.querySelector('#mgRight');
  let found = 0, slips = 0;

  rightGrid.querySelectorAll('.mg-cell').forEach(b => onPress(b, () => {
    const i = +b.dataset.i;
    if (spots.includes(i)){
      if (b.classList.contains('found')) return;
      b.classList.add('found');
      found++;
      paint();
      if (found >= diffs) finish(host, ui, true, done, mini);
    } else {
      slips++;
      paint();
    }
  }));
  function paint(){ setScore(ui.score, `다른 곳 ${found} / ${diffs}  ·  헛짚음 ${slips}`); }
  ui.action.style.display = 'none';
  paint();
}

/* ── rhythm — 장단 맞춰 치기 ────────────────────────────────── */
function startRhythm(mini, host, done){
  const pattern = mini.pattern || [1,0,1,0,1,1,0,1];
  const bpm = mini.bpm || 92;
  const step = 60000 / bpm;
  const ui = shell(host, mini, `<div class="mg-rhythm" id="mgBeats"></div>`);
  const beats = ui.stage.querySelector('#mgBeats');

  let at = -1, hits = 0, need = pattern.filter(Boolean).length, tapped = false, running = false, timer = 0, stop = null;
  const results = pattern.map(() => null);

  function paint(){
    beats.innerHTML = pattern.map((p, i) => {
      let cls = 'mg-beat';
      if (i === at) cls += ' now';
      if (results[i] === true) cls += ' hit';
      if (results[i] === false) cls += ' miss';
      return `<span class="${cls}" style="${p ? '' : 'opacity:.35'}"></span>`;
    }).join('');
    setScore(ui.score, `${hits} / ${need} 박  (${Math.round(hits / Math.max(1,need) * 100)}%)`);
  }
  function begin(){
    running = true;
    ui.action.textContent = '치시오!';
    timer = 0;
    stop = loop(host, dt => {
      timer += dt * 1000;
      if (timer >= step){
        timer -= step;
        if (at >= 0 && pattern[at] && !tapped){ results[at] = false; }
        at++;
        tapped = false;
        if (at >= pattern.length){
          running = false;
          const rate = hits / Math.max(1, need);
          paint();
          finish(host, ui, rate >= .7, done, mini);
          return false;
        }
        paint();
      }
    });
  }
  onPress(ui.action, () => {
    if (!running){ begin(); return; }
    if (at < 0 || at >= pattern.length || tapped) return;
    tapped = true;
    if (pattern[at]){ hits++; results[at] = true; } else { results[at] = false; }
    paint();
  });
  paint();
}

/* ── steer — 좌우로 키를 잡아 지나가기 ──────────────────────── */
function startSteer(mini, host, done){
  const lanes = mini.lanes || 5;
  const need = mini.length || 14;
  const ui = shell(host, mini, `
    <div class="mg-steer" id="mgSea"><div class="mg-ship" id="mgShip">${sym(mini.shipIcon || 'boat', 26)}</div></div>
    <div class="mg-steer-btns">
      <button class="mg-btn sub" id="mgL" type="button">← 왼쪽</button>
      <button class="mg-btn sub" id="mgR" type="button">오른쪽 →</button>
    </div>`);
  const sea = ui.stage.querySelector('#mgSea');
  const ship = ui.stage.querySelector('#mgShip');

  let lane = Math.floor(lanes / 2), passed = 0, hitCount = 0, running = false, stop = null;
  const rocks = [];
  let spawnT = 0;

  function laneX(l){ return (l + .5) / lanes * 100; }
  function placeShip(){ ship.style.left = `calc(${laneX(lane)}% - 13px)`; }

  function begin(){
    running = true;
    ui.action.textContent = '지나가는 중…';
    stop = loop(host, dt => {
      spawnT += dt;
      if (spawnT > .62){
        spawnT = 0;
        const l = Math.floor(Math.random() * lanes);
        const el = document.createElement('div');
        el.className = 'mg-rock';
        el.innerHTML = sym(mini.rockIcon || 'rock', 22);
        el.style.left = `calc(${laneX(l)}% - 11px)`;
        el.style.top = '-24px';
        sea.appendChild(el);
        rocks.push({ el, l, y: -24 });
      }
      for (let i = rocks.length - 1; i >= 0; i--){
        const r = rocks[i];
        r.y += 150 * dt;
        r.el.style.top = r.y + 'px';
        if (r.y > 170 && r.y < 200 && r.l === lane && !r.hit){
          r.hit = true; hitCount++;
          ship.style.opacity = '.35';
          setTimeout(() => ship.style.opacity = '1', 200);
        }
        if (r.y > 230){
          r.el.remove(); rocks.splice(i, 1);
          if (!r.hit) passed++;
          paint();
          if (passed >= need){
            running = false;
            finish(host, ui, hitCount <= (mini.allow == null ? 2 : mini.allow), done, mini);
            return false;
          }
        }
      }
    });
  }
  function paint(){ setScore(ui.score, `${passed} / ${need} 지남  ·  부딪힘 ${hitCount}`); }

  onPress(ui.stage.querySelector('#mgL'), () => { lane = Math.max(0, lane - 1); placeShip(); });
  onPress(ui.stage.querySelector('#mgR'), () => { lane = Math.min(lanes - 1, lane + 1); placeShip(); });
  window.addEventListener('keydown', e => {
    if (!running) return;
    if (e.code === 'ArrowLeft'){ lane = Math.max(0, lane - 1); placeShip(); }
    if (e.code === 'ArrowRight'){ lane = Math.min(lanes - 1, lane + 1); placeShip(); }
  });
  onPress(ui.action, () => { if (!running) begin(); });
  placeShip(); paint();
}

/* ── cipher — 신호표를 보고 뜻을 고르기 ─────────────────────── */
function startCipher(mini, host, done){
  const table = mini.table || [];        // [{sign:'🔥', mean:'적이 나타났다'}]
  const rounds = mini.rounds || table.map((_, i) => i);
  const ui = shell(host, mini, `
    <div class="mg-cipher-table">${table.map(t => `<span class="mg-ckey">${esc(t.sign)} = ${esc(t.mean)}</span>`).join('')}</div>
    <div class="mg-csignal" id="mgSig"></div>
    <div class="q-choices" id="mgOpts" style="margin-top:14px"></div>`);
  const sig = ui.stage.querySelector('#mgSig');
  const opts = ui.stage.querySelector('#mgOpts');

  let at = 0, right = 0, wrong = 0;
  const quiz = (mini.quiz && mini.quiz.length) ? mini.quiz
    : rounds.map(i => ({ sign: table[i].sign, answer: i }));

  function paint(){
    if (at >= quiz.length){
      finish(host, ui, right >= Math.ceil(quiz.length * .7), done, mini);
      return;
    }
    sig.textContent = quiz[at].sign;
    opts.innerHTML = table.map((t, i) =>
      `<button class="q-choice" data-i="${i}" type="button"><span class="n">${i+1}</span><span>${esc(t.mean)}</span></button>`).join('');
    opts.querySelectorAll('.q-choice').forEach(b => onPress(b, () => pick(+b.dataset.i, b)));
    setScore(ui.score, `${at} / ${quiz.length} 해독  ·  맞음 ${right}`);
  }
  function pick(i, el){
    if (i === quiz[at].answer){ right++; el.classList.add('correct'); }
    else { wrong++; el.classList.add('wrong'); }
    at++;
    setTimeout(paint, 420);
  }
  ui.action.style.display = 'none';
  paint();
}

/* ── pour — 알맞은 양에서 멈추기 ────────────────────────────── */
function startPour(mini, host, done){
  const target = mini.target || 70;
  const band = mini.band || 8;
  const total = mini.tries || 3;
  const ui = shell(host, mini, `
    <div class="mg-pour" id="mgJar">
      <div class="mg-pour-target" id="mgT1"></div>
      <div class="mg-pour-target" id="mgT2"></div>
      <div class="mg-pour-fill" id="mgFill"></div>
    </div>
    <div class="mg-pips" id="mgPips"></div>`);
  const fill = ui.stage.querySelector('#mgFill');
  const pips = ui.stage.querySelector('#mgPips');
  ui.stage.querySelector('#mgT1').style.bottom = (target - band) + '%';
  ui.stage.querySelector('#mgT2').style.bottom = (target + band) + '%';

  let level = 0, pouring = false, tries = 0, stop = null;
  const results = [];

  function paint(){
    fill.style.height = level + '%';
    pips.innerHTML = Array.from({ length: total }, (_, i) =>
      `<span class="mg-pip ${i < results.length ? (results[i] ? 'hit' : 'miss') : ''}"></span>`).join('');
    setScore(ui.score, `남은 기회 ${total - tries}`);
  }
  function begin(){
    pouring = true;
    level = 0;
    ui.action.textContent = '멈추시오!';
    stop = loop(host, dt => {
      level += 46 * dt;
      if (level >= 105){ judge(); return false; }
      paint();
    });
  }
  function judge(){
    if (!pouring) return;
    pouring = false;
    stop && stop();
    tries++;
    const ok = Math.abs(level - target) <= band;
    results.push(ok);
    paint();
    if (ok){ finish(host, ui, true, done, mini); return; }
    if (tries >= total){ finish(host, ui, false, done, mini); return; }
    ui.action.textContent = '다시 붓기';
    level = 0;
    paint();
  }
  onPress(ui.action, () => { if (!pouring) begin(); else judge(); });
  paint();
}

/* ══════════════════════════════════════════════════════════════
   등록
   ══════════════════════════════════════════════════════════════ */
export const MINIGAME_STARTERS = {
  aim: startAim,
  spin: startSpin, knap: startKnap, ember: startEmber, stack: startStack,
  grind: startGrind, lift: startLift, sort: startSort, memory: startMemory, blank: startBlank,
  dig: startDig, trace: startTrace, weigh: startWeigh, route: startRoute, order: startOrder,
  spot: startSpot, rhythm: startRhythm, steer: startSteer, cipher: startCipher, pour: startPour
};

export const MINIGAME_LABELS = {
  aim:'겨누기', spin:'돌리기', knap:'떼어내기', ember:'불씨 지키기', stack:'차례로 쌓기',
  grind:'갈기', lift:'들어 올리기', sort:'가려 놓기', memory:'차례 외우기', blank:'낱말 적기',
  dig:'파내기', trace:'따라 긋기', weigh:'저울질', route:'길 찾기', order:'차례 세우기',
  spot:'다른 곳 찾기', rhythm:'장단 맞추기', steer:'키잡이', cipher:'신호 읽기', pour:'알맞게 붓기'
};

/** ui.js 가 부르는 진입점 */
export function runMinigame(mini, host, done){
  const fn = MINIGAME_STARTERS[mini && mini.type] || startMinigame;
  try { fn(mini || {}, host, done); }
  catch (err){
    console.error('[minigame]', err);
    host.innerHTML = '<p class="mg-intro">이 놀이를 열 수 없소. 그냥 넘어가도 되오.</p>';
    const b = document.createElement('button');
    b.className = 'mg-btn'; b.type = 'button'; b.textContent = '넘어가기';
    host.appendChild(b);
    onPress(b, () => done(true));
  }
}
