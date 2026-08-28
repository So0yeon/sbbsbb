/* js/engine/minigames.js — 미니게임 9종 + 기본형 + 빈칸 채우기
   02-MINIGAMES.md 의 상수, 12-BUILD-RULES.md §3 의 판정 규칙을 그대로 따릅니다.

   판정은 pointerdown 입니다. click 은 손을 뗄 때(80~150ms 뒤) 오고,
   그 사이에 바늘이 화면의 10~20%를 지나갑니다.
   디바운스는 넣지 않습니다 — 250ms 를 뒀더니 빠른 연타가 통째로 먹혔습니다. */

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* 누르는 순간에 판정한다. 뒤따라오는 click 은 700ms 안이면 무시하되,
   키보드 Enter·스페이스로 온 click 은 살려 둔다. */
import { icon as _icon, iconName as _iconName } from '../icons.js';

/* 이모지 대신 선 아이콘을 그린다 (앱 전체 규칙).
   그림만 바꾼 것이고 조작·판정·난이도는 원본 그대로다. */
const gi = (v, fb, size) => _icon(_iconName(v, fb || 'dot'), { size: size || 22 });

export function pressBind(el, fn) {
  let lastPointer = 0;
  el.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    lastPointer = performance.now();
    fn(e);
  });
  el.addEventListener('click', e => {
    if (performance.now() - lastPointer < 700) return;   // 방금 pointerdown 으로 처리했다
    fn(e);
  });
  return el;
}

export function releaseBind(el, downFn, upFn) {
  el.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    downFn(e);
  });
  const up = e => { upFn(e); };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); downFn(e); }
  });
  el.addEventListener('keyup', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); upFn(e); }
  });
}

/* 미니게임 하나가 살아 있는 동안의 뒷정리 목록 */
function makeCtx(mount, mini, onWin, onLose) {
  const ctx = {
    mount, mini, raf: 0, timers: [],
    win() { ctx.stop(); onWin(); },
    lose() { ctx.stop(); onLose(); },
    stop() {
      cancelAnimationFrame(ctx.raf);
      ctx.timers.forEach(clearTimeout);
      ctx.timers.length = 0;
      ctx.dead = true;
    },
    later(fn, ms) { const t = setTimeout(fn, ms); ctx.timers.push(t); return t; },
    loop(fn) {
      let last = performance.now();
      const step = now => {
        if (ctx.dead) return;
        const dt = Math.min(.05, (now - last) / 1000);
        last = now;
        fn(dt, now);
        ctx.raf = requestAnimationFrame(step);
      };
      ctx.raf = requestAnimationFrame(step);
    }
  };
  return ctx;
}

export function shell(mini, inner) {
  return '<div class="mg">'
    + (mini.tag ? '<p class="mg-tag">' + esc(mini.tag) + '</p>' : '')
    + '<p class="mg-intro">' + esc(mini.intro || '') + '</p>'
    + inner
    + '<p class="mg-status" id="mgStatus"></p>'
    + '</div>';
}

/* ── 바늘형 공통 ──────────────────────────────────────────────
   구간 폭·속도는 12-BUILD-RULES §3-1 의 시험판 값입니다.
   버튼 크기로 난이도를 조절하지 않습니다 (터치 목표 44×44 는 타협 대상이 아님). */
export function needleGame(ctx, cfg) {
  const { mini } = ctx;
  ctx.mount.innerHTML = shell(mini,
    (cfg.stage || '')
    + '<div class="mg-bar' + (cfg.barClass ? ' ' + cfg.barClass : '') + '" id="mgBar">'
    + '<div class="mg-zone" id="mgZone"></div>'
    + '<div class="mg-needle" id="mgNeedle"></div>'
    + '</div>'
    + '<button type="button" class="mg-hit" id="mgHit">' + esc(cfg.hitLabel || mini.hitLabel || '지금!') + '</button>'
    + '<div class="mg-dots" id="mgDots"></div>');

  const zoneEl = ctx.mount.querySelector('#mgZone');
  const needle = ctx.mount.querySelector('#mgNeedle');
  const status = ctx.mount.querySelector('#mgStatus');
  const dots   = ctx.mount.querySelector('#mgDots');
  const hit    = ctx.mount.querySelector('#mgHit');

  let width = cfg.width0, speed = cfg.speed0;
  let pos = 0, dir = 1, tries = 0, hits = 0, side = 0;
  let zone = cfg.randomZone ? Math.random() * (100 - width) : (50 - width / 2);
  const trail = [];        // 아이가 "본" 자리 — 화면은 코드보다 한두 프레임 뒤에 그려집니다

  function paintDots() {
    let s = '';
    for (let i = 0; i < cfg.tries; i++) {
      const cls = i < tries ? (i < hits ? 'ok' : 'no') : '';
      s += '<i class="' + cls + '"></i>';
    }
    dots.innerHTML = s;
  }
  function label() {
    let t = '';
    if (cfg.alternate) t += (side === 0 ? '왼쪽' : '오른쪽') + ' 차례 · ';
    t += hits + ' / ' + cfg.need + ' 명중 · 남은 기회 ' + (cfg.tries - tries);
    status.textContent = t;
  }
  function place() {
    zoneEl.style.left  = zone + '%';
    zoneEl.style.width = width + '%';
    if (cfg.onZone) cfg.onZone(zone, width, side);
  }
  if (cfg.onReady) cfg.onReady(ctx.mount);
  place(); paintDots(); label();
  // 버튼에 초점을 둬야 스페이스바·엔터로도 '지금!' 을 누를 수 있다 (버튼의 기본 동작)
  hit.focus({ preventScroll: true });

  ctx.loop(dt => {
    pos += dir * speed * dt * 100;
    if (pos >= 100) { pos = 100; dir = -1; }
    if (pos <= 0)   { pos = 0;   dir = 1; }
    trail.push(pos);
    if (trail.length > 3) trail.shift();
    needle.style.left = pos + '%';
    if (cfg.onFrame) cfg.onFrame(pos, dt);
  });

  function inZone(p) { return p >= zone && p <= zone + width; }

  pressBind(hit, () => {
    if (tries >= cfg.tries) return;
    const justSide = side;          // 방금 간 쪽 — side 는 아래에서 뒤집힙니다
    tries++;
    // 지금 자리와, 아이가 본 두 프레임 전 자리를 함께 명중으로 칩니다
    const ok = inZone(pos) || trail.some(inZone);
    if (ok) {
      hits++;
      width = Math.max(cfg.widthMin, width - 3);
      speed = Math.min(cfg.speedMax, speed + .1);
      if (cfg.alternate) side = 1 - side;
      zone = cfg.randomZone ? Math.random() * (100 - width)
           : (cfg.alternate ? (side === 0 ? 8 + Math.random() * 22 : 70 - Math.random() * 22)
                            : 50 - width / 2);
      place();
      hit.classList.remove('miss'); hit.classList.add('good');
      if (cfg.onHit) cfg.onHit(hits, cfg.need, justSide, pos);
    } else {
      hit.classList.remove('good'); hit.classList.add('miss');
      if (cfg.onMiss) cfg.onMiss(pos, justSide);
    }
    paintDots(); label();
    setTimeout(() => hit.classList.remove('good', 'miss'), 180);

    if (hits >= cfg.need) { status.textContent = '해냈다!'; ctx.later(ctx.win, 420); }
    else if (tries >= cfg.tries) { status.textContent = '아쉽다…'; ctx.later(ctx.lose, 520); }
  });
}

/* ── 1. spin — 돌리기. 실패 없음 ───────────────────────────── */
function spinGame(ctx) {
  const laps = ctx.mini.laps || 4;
  ctx.mount.innerHTML = shell(ctx.mini,
    '<div class="mg-spin" id="mgSpin"><div class="mg-spin-core" id="mgCore"></div>'
    + '<div class="mg-spin-mark" id="mgMark"></div></div>');
  const pad = ctx.mount.querySelector('#mgSpin');
  const core = ctx.mount.querySelector('#mgCore');
  const mark = ctx.mount.querySelector('#mgMark');
  const status = ctx.mount.querySelector('#mgStatus');
  let last = null, total = 0, down = false;

  const angleOf = e => {
    const r = pad.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  };
  const show = () => {
    const n = total / (Math.PI * 2);
    status.textContent = n.toFixed(1) + ' / ' + laps + ' 바퀴';
    const p = Math.min(1, n / laps);
    core.style.transform = 'scale(' + (0.28 + p * 0.72) + ')';
    mark.style.transform = 'rotate(' + (total * 180 / Math.PI) + 'deg)';
    if (n >= laps) { status.textContent = '다 돌렸다!'; ctx.later(ctx.win, 360); }
  };
  show();
  pad.addEventListener('pointerdown', e => {
    down = true; last = angleOf(e);
    pad.setPointerCapture && pad.setPointerCapture(e.pointerId);
  });
  pad.addEventListener('pointermove', e => {
    if (!down || ctx.dead) return;
    const a = angleOf(e);
    let d = a - last;
    while (d >  Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    total += Math.abs(d);        // 방향은 상관없이 절댓값으로 셉니다
    last = a;
    show();
  });
  const up = () => { down = false; };
  pad.addEventListener('pointerup', up);
  pad.addEventListener('pointercancel', up);
  // 손가락이 없는 환경을 위한 대체 조작
  const key = ctx.mount.querySelector('#mgCore');
  pressBind(key, () => { total += Math.PI / 2; show(); });
}

/* ── 2. knap — 당겼다 놓기. 놓는 순간 판정 ─────────────────── */
function knapGame(ctx) {
  ctx.mount.innerHTML = shell(ctx.mini,
    '<div class="mg-bar tall" id="mgBar">'
    + '<div class="mg-zone" id="mgZone"></div>'
    + '<div class="mg-fill" id="mgFill"></div>'
    + '</div>'
    + '<button type="button" class="mg-hit" id="mgHit">누르고 있다가 놓기</button>'
    + '<div class="mg-dots" id="mgDots"></div>');
  const zoneEl = ctx.mount.querySelector('#mgZone');
  const fill   = ctx.mount.querySelector('#mgFill');
  const status = ctx.mount.querySelector('#mgStatus');
  const dots   = ctx.mount.querySelector('#mgDots');
  const btn    = ctx.mount.querySelector('#mgHit');

  let width = 20, zone = Math.random() * (100 - width);
  let charge = 0, holding = false, tries = 0, hits = 0;
  const TRIES = 6, NEED = 4;

  const paint = () => {
    let s = '';
    for (let i = 0; i < TRIES; i++) s += '<i class="' + (i < tries ? (i < hits ? 'ok' : 'no') : '') + '"></i>';
    dots.innerHTML = s;
    status.textContent = hits + ' / ' + NEED + ' 명중 · 남은 기회 ' + (TRIES - tries);
    zoneEl.style.left = zone + '%'; zoneEl.style.width = width + '%';
  };
  paint();

  ctx.loop(dt => {
    if (holding) charge = Math.min(100, charge + dt * 100);   // 1초에 100%
    fill.style.width = charge + '%';
  });

  releaseBind(btn,
    () => { if (tries < TRIES) { holding = true; charge = 0; } },
    () => {
      if (!holding) return;
      holding = false;
      tries++;
      const ok = charge >= zone && charge <= zone + width;
      if (ok) {
        hits++;
        width = Math.max(11, width - 2.5);
        zone = Math.random() * (100 - width);
        btn.classList.add('good');
      } else {
        btn.classList.add('miss');
      }
      charge = 0; fill.style.width = '0%';
      paint();
      setTimeout(() => btn.classList.remove('good', 'miss'), 180);
      if (hits >= NEED) { status.textContent = '깔끔하다!'; ctx.later(ctx.win, 420); }
      else if (tries >= TRIES) { status.textContent = '아쉽다…'; ctx.later(ctx.lose, 520); }
    });
}

/* ── 3. ember — 불씨 지키기 ────────────────────────────────── */
function emberGame(ctx) {
  const holdMs = ctx.mini.holdMs || 6000;
  ctx.mount.innerHTML = shell(ctx.mini,
    '<div class="mg-ember"><div class="mg-gauge"><div class="mg-good"></div>'
    + '<div class="mg-level" id="mgLevel"></div></div>'
    + '<div class="mg-flame" id="mgFlame">' + gi('fire', 'fire', 30) + '</div></div>'
    + '<button type="button" class="mg-hit" id="mgHit">'
    + esc(ctx.mini.hitLabel || '나뭇가지 더하기') + '</button>'
    + '<div class="mg-progress"><i id="mgProg"></i></div>');
  const level = ctx.mount.querySelector('#mgLevel');
  const flame = ctx.mount.querySelector('#mgFlame');
  const prog  = ctx.mount.querySelector('#mgProg');
  const status = ctx.mount.querySelector('#mgStatus');
  const btn   = ctx.mount.querySelector('#mgHit');

  let v = 55, held = 0, cool = 0;
  ctx.loop(dt => {
    v -= 13 * dt;
    if (cool > 0) cool -= dt * 1000;
    const good = v >= 40 && v <= 75;
    if (good) held += dt * 1000;
    level.style.height = Math.max(0, Math.min(100, v)) + '%';
    level.style.background = v < 40 ? '#C4573F' : (good ? '#5C8F5C' : '#D98A3C');
    flame.style.opacity = 0.35 + Math.min(1, v / 100) * .65;
    flame.style.transform = 'scale(' + (0.7 + Math.min(1.4, v / 70)) + ')';
    prog.style.width = Math.min(100, held / holdMs * 100) + '%';
    status.textContent = good ? '알맞다 — 이대로 지켜라' : (v < 40 ? '사그라든다!' : '너무 타오른다');
    if (held >= holdMs) { status.textContent = '밤을 넘겼다!'; ctx.stop(); ctx.later(ctx.win, 300); }
    if (v <= 0) { status.textContent = '꺼지고 말았다…'; ctx.stop(); ctx.later(ctx.lose, 420); }
  });
  pressBind(btn, () => {
    if (cool > 0) return;      // 쿨다운 450ms — 디바운스가 아니라 규칙입니다
    cool = 450;
    v = Math.min(100, v + 16);
  });
}

/* ── 4. stack — 순서대로 쌓기 ──────────────────────────────── */
export function stackGame(ctx, opt = {}) {
  const steps = (ctx.mini.steps || []).slice();
  if (!steps.length) return defaultGame(ctx);
  const order = steps.map((s, i) => i);
  const shuffled = order.slice().sort(() => Math.random() - .5);

  /* visual 이 없을 때 막집 그림을 기본값으로 두지 않습니다.
     단계 수에 맞춰 아래에서 위로 쌓이는 단순한 도형을 그립니다 (12-BUILD-RULES §3-3) */
  const visual = opt.visual || ctx.mini.visual || defaultStackVisual(steps.length);

  ctx.mount.innerHTML = shell(ctx.mini,
    '<div class="mg-stack' + (opt.stageClass ? ' ' + opt.stageClass : '') + '">'
    + '<svg viewBox="' + (opt.viewBox || '0 0 200 170') + '" class="mg-stack-svg" id="mgSvg">'
    + visual + '</svg>'
    + '<div class="mg-steps" id="mgSteps"></div></div>');
  const svg = ctx.mount.querySelector('#mgSvg');
  const list = ctx.mount.querySelector('#mgSteps');
  const status = ctx.mount.querySelector('#mgStatus');
  svg.querySelectorAll('.stack-part').forEach(p => p.style.opacity = 0);

  let next = 0, wrong = 0;
  status.textContent = '올바른 차례대로 눌러 보세요 · 실수 ' + wrong + ' / 3';

  shuffled.forEach(i => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mg-step';
    b.textContent = steps[i];
    pressBind(b, () => {
      if (b.disabled) return;
      if (i === next) {
        b.disabled = true;
        b.classList.add('ok');
        const part = svg.querySelector('.stack-part[data-step="' + next + '"]');
        if (part) { part.style.opacity = 1; part.classList.add('on'); }
        if (opt.onStep) opt.onStep(next, svg);
        next++;
        if (next >= steps.length) { status.textContent = '차례대로 다 세웠다!'; ctx.later(ctx.win, 420); }
        else status.textContent = '좋다 · 실수 ' + wrong + ' / 3';
      } else {
        wrong++;
        b.classList.add('no');
        if (opt.onWrong) opt.onWrong(wrong, svg);
        setTimeout(() => b.classList.remove('no'), 260);
        status.textContent = '순서가 어긋났다 · 실수 ' + wrong + ' / 3';
        if (wrong >= 3) { status.textContent = '무너졌다…'; ctx.later(ctx.lose, 460); }
      }
    });
    list.appendChild(b);
  });
}

function defaultStackVisual(n) {
  let s = '<rect x="0" y="142" width="200" height="28" fill="#C9C2A8" opacity=".5"/>';
  const h = Math.min(26, 120 / n);
  for (let i = 0; i < n; i++) {
    const w = 150 - i * (90 / n);
    const y = 142 - (i + 1) * h;
    s += '<g class="stack-part" data-step="' + i + '">'
      + '<rect x="' + (100 - w / 2) + '" y="' + y + '" width="' + w + '" height="' + (h - 3)
      + '" rx="4" fill="' + ['#B08968', '#A98467', '#8A7B4E', '#7B6A55', '#6E9B94', '#3E8A78'][i % 6]
      + '" opacity=".9"/></g>';
  }
  return s;
}

/* ── 7. sort — 두 갈래로 가려내기 ──────────────────────────── */
export const SORT_PASS = .7;         // 열 중 일곱을 맞게 가르면 합격

function sortGame(ctx) {
  const items = (ctx.mini.items || []).slice();
  if (!items.length) return defaultGame(ctx);
  const L = ctx.mini.binLeftLabel  || '왼쪽';
  const R = ctx.mini.binRightLabel || '오른쪽';
  ctx.mount.innerHTML = shell(ctx.mini,
    '<div class="mg-sort">'
    + '<div class="mg-card" id="mgCard"></div>'
    + '<div class="mg-bins">'
    + '<button type="button" class="mg-bin" id="mgL">' + (ctx.mini.binLeftIcon ? gi(ctx.mini.binLeftIcon) : '←') + ' ' + esc(L) + '</button>'
    + '<button type="button" class="mg-bin" id="mgR">' + esc(R) + ' ' + (ctx.mini.binRightIcon ? gi(ctx.mini.binRightIcon) : '→') + '</button>'
    + '</div></div>');
  const card = ctx.mount.querySelector('#mgCard');
  const status = ctx.mount.querySelector('#mgStatus');
  let i = 0, right = 0;

  const show = () => {
    if (i >= items.length) {
      const rate = right / items.length;
      status.textContent = '맞게 가른 것 ' + right + ' / ' + items.length;
      ctx.later(rate >= SORT_PASS ? ctx.win : ctx.lose, 620);
      card.innerHTML = '';
      return;
    }
    const it = items[i];
    card.innerHTML = '<span class="mg-card-icon">' + gi(it.icon, 'box', 28) + '</span>'
                   + '<span class="mg-card-label">' + esc(it.label) + '</span>';
    status.textContent = (i + 1) + ' / ' + items.length + ' · 맞은 것 ' + right;
  };
  const answer = left => {
    if (i >= items.length) return;
    const ok = (items[i].korean === true) === left;
    if (ok) right++;
    card.classList.add(ok ? 'ok' : 'no');
    setTimeout(() => card.classList.remove('ok', 'no'), 200);
    i++;
    show();
  };
  pressBind(ctx.mount.querySelector('#mgL'), () => answer(true));
  pressBind(ctx.mount.querySelector('#mgR'), () => answer(false));
  show();
}

/* ── 8. memory — 순서 기억하기 ─────────────────────────────── */
export function memoryGame(ctx, opt = {}) {
  const rounds = ctx.mini.rounds || 4;
  const icons = opt.icons || ['fire', 'water', 'leaf', 'star'];
  const names = opt.names || null;
  const N = icons.length;
  ctx.mount.innerHTML = shell(ctx.mini,
    '<div class="' + (opt.wrapClass || 'mg-mem-wrap') + '" id="mgMemWrap">'
    + (opt.stage || '')
    + '<div class="mg-memory" id="mgPads"></div></div>');
  const pads = ctx.mount.querySelector('#mgPads');
  const status = ctx.mount.querySelector('#mgStatus');
  const els = [];
  for (let i = 0; i < N; i++) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mg-pad'; b.dataset.i = i;
    if (names) b.innerHTML = '<span class="mg-pad-icon">' + gi(icons[i]) + '</span>'
                           + '<span class="mg-pad-name">' + esc(names[i]) + '</span>';
    else b.innerHTML = gi(icons[i]);
    pads.appendChild(b); els.push(b);
  }
  if (opt.onReady) opt.onReady(ctx.mount, els);
  let round = 0, seq = [], input = 0, playing = true;

  const flash = (i, mode) => {
    if (opt.onFlash) opt.onFlash(i, mode || 'show');
    els[i].classList.add('lit');
    ctx.later(() => els[i].classList.remove('lit'), 320);
  };
  const play = () => {
    playing = true;
    if (opt.onRound) opt.onRound(round, rounds);
    status.textContent = (round + 1) + ' / ' + rounds + ' 라운드 · 잘 보세요';
    seq.forEach((v, k) => ctx.later(() => flash(v), 520 + k * 560));
    ctx.later(() => { playing = false; input = 0; status.textContent = '이제 그 차례대로 눌러 보세요'; },
      520 + seq.length * 560);
  };
  const nextRound = () => {
    seq.push((Math.random() * N) | 0);
    play();
  };
  els.forEach((b, i) => pressBind(b, () => {
    if (playing) return;
    const good = seq[input] === i;
    flash(i, good ? 'user' : 'bad');
    if (good) {
      input++;
      if (input >= seq.length) {
        round++;
        if (round >= rounds) { status.textContent = '다 맞혔다!'; ctx.later(ctx.win, 420); }
        else ctx.later(nextRound, 620);
      }
    } else {
      status.textContent = '순서가 어긋났다…';
      ctx.later(ctx.lose, 520);        // 한 번이라도 틀리면 즉시
    }
  }));
  seq.push((Math.random() * N) | 0);
  nextRound();
}

/* ── 기본형 ────────────────────────────────────────────────── */
function defaultGame(ctx) {
  needleGame(ctx, { tries: 3, need: 2, width0: 23, widthMin: 14, speed0: .80, speedMax: 1.7,
                    randomZone: false, hitLabel: ctx.mini.hitLabel || '지금 내리치기' });
}

export const MINIGAME_STARTERS = {
  spin:  spinGame,
  knap:  knapGame,
  ember: emberGame,
  stack: stackGame,
  sort:  sortGame,
  memory: memoryGame,
  grind: ctx => needleGame(ctx, {
    tries: 10, need: 6, width0: 16, widthMin: 7.5, speed0: .95, speedMax: 2.0,
    alternate: true, hitLabel: ctx.mini.hitLabel || '지금 밀기' }),
  lift:  ctx => {
    needleGame(ctx, {
      tries: 8, need: 5, width0: 18, widthMin: 9.5, speed0: .88, speedMax: 1.9,
      randomZone: true, hitLabel: ctx.mini.hitLabel || '지금 올리기',
      onHit: (h, need) => {
        const bar = ctx.mount.querySelector('.mg-lift-obj');
        if (bar) bar.style.bottom = (h / need * 78) + '%';
      }
    });
    const bar = ctx.mount.querySelector('.mg-bar');
    if (bar) {
      const w = document.createElement('div');
      w.className = 'mg-lift';
      w.innerHTML = '<div class="mg-lift-obj">' + gi('rock', 'rock', 30) + '</div>';
      bar.parentNode.insertBefore(w, bar);
    }
  },
};

/* 미니게임 시작 — type 이 없으면 기본형입니다. 오류가 아니라 설계된 동작입니다. */
export function startMinigame(mini, mount, onWin, onLose) {
  const ctx = makeCtx(mount, mini || {}, onWin, onLose);
  const fn = MINIGAME_STARTERS[mini && mini.type] || defaultGame;
  try { fn(ctx); } catch (e) { console.error(e); ctx.win(); }
  return ctx;
}

/* ── 빈칸 채우기 (10번째 형식) ─────────────────────────────────
   공백·가운뎃점·문장부호를 지우고 비교합니다. 실패가 없습니다. */
export function normalizeAnswer(s) {
  return String(s || '')
    .replace(/[\s·・.,!?~"'“”‘’()「」『』\-—]/g, '')
    .toLowerCase();
}

export function checkBlank(input, answer, alt) {
  const a = normalizeAnswer(input);
  if (!a) return false;
  const list = [answer].concat(alt || []);
  return list.some(x => normalizeAnswer(x) === a);
}
