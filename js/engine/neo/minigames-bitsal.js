/* js/engine/minigames-bitsal.js — 빗살무늬토기를 강가에 세우기 (`neo-pot`)

   **이 파일 하나가 미니게임 전부입니다.** 스타일까지 안에 들고 다니므로
   다른 작업본에 넣을 때 이 파일만 복사하고 한 줄만 부르면 됩니다.

       import './minigames-bitsal.js';        // ui.js 등 어디서든 한 번

   기대는 것은 minigames.js 가 원래부터 내보내던 두 가지뿐입니다
   (MINIGAME_STARTERS · releaseBind). 다른 시대 파일이나 다른 미니게임에는
   전혀 기대지 않으므로, 이 프로젝트의 어떤 판본에 넣어도 그대로 돕니다.

   퀘스트 원문은 docs/content/02-neolithic.md 의 "🏺 강가에 토기 세우기" 절에 있고,
   tools/make_eras.py 가 js/eras/neolithic.js 로 옮깁니다. 텍스트는 여기 없습니다.

   판정 규칙은 12-BUILD-RULES §3(누르는 순간·놓는 순간)을 그대로 따릅니다. */

import { MINIGAME_STARTERS, releaseBind } from './minigames.js';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* minigames.js 의 것과 같은 껍데기입니다. 판본에 따라 shell 이 밖으로
   나와 있지 않을 수 있어, 옮겨 다니기 쉽도록 여기 한 벌 둡니다. */
function shell(mini, inner) {
  return '<div class="mg">'
    + (mini.tag ? '<p class="mg-tag">' + esc(mini.tag) + '</p>' : '')
    + '<p class="mg-intro">' + esc(mini.intro || '') + '</p>'
    + inner
    + '<p class="mg-status" id="mgStatus"></p>'
    + '</div>';
}

/* 이 미니게임이 쓰는 스타일. 공용 클래스(.mg-*)는 styles.css 것을 그대로 쓰고,
   여기서는 이 게임에만 필요한 것만 한 번 심습니다. */
const BITSAL_CSS = `
.neo-pot .pt-node{
  transform-box:view-box; transform-origin:0 0;
  transition:transform .42s var(--ease);
}
.neo-pot #ptSand{ transition:none; }
.neo-pot #ptGhost{ transition:opacity var(--t) var(--ease); }
.pt-touch{
  position:absolute; left:0; right:0; bottom:0; height:49%;
  touch-action:none; cursor:grab;
}
.pt-touch:active{ cursor:grabbing; }
.neo-pot #ptPot.settle{ animation:potSettle .5s var(--ease); }
@keyframes potSettle{
  0%{ transform:translate(150px,var(--pty)) scale(1,1); }
  45%{ transform:translate(150px,var(--pty)) scale(1.05,.95); }
  100%{ transform:translate(150px,var(--pty)) scale(1,1); }
}
`;

(function injectCss() {
  const ID = 'mg-bitsal-css';
  if (typeof document === 'undefined' || document.getElementById(ID)) return;
  const el = document.createElement('style');
  el.id = ID;
  el.textContent = BITSAL_CSS;
  document.head.appendChild(el);
})();

/* ── 게임 ──────────────────────────────────────────────────────
   판정은 knap 과 같은 "누르고 있다가 놓기"(12-BUILD-RULES §3) 입니다.
   다만 알맞은 깊이는 무작위가 아니라 **늘 같습니다** — 토기 밑동 길이는 변하지 않으니까요.
   그래서 구간을 눈에 보이게 그려 두고, 아이가 그 자리를 노려 손을 떼게 합니다.

   흐름: 그냥 세워 본다(넘어진다) → 모래를 눌러 판다 → 묻고 덮는다(선다) */

const POT_TOP   = 112;   // 모래 표면 y
const POT_MAX   = 86;    // 팔 수 있는 가장 깊은 깊이(px)
const POT_LO    = 30;    // 알맞은 깊이 구간
const POT_HI    = 50;
const POT_FIT   = 40;    // 밑동이 꼭 맞는 깊이
const POT_SPEED = 50;    // 1초에 50px 씩 파 내려갑니다
const POT_TRIES = 5;
const POT_BODY  = 'M-27,-80 L27,-80 L20,-34 L0,0 L-20,-34 Z';

/* 구덩이가 파인 모래의 윤곽. d 가 0 이면 그냥 평평합니다. */
function potSand(d) {
  const y = POT_TOP;
  if (d < 1) return 'M0,' + y + ' H300 V220 H0 Z';
  const ht = (34 + d * .17).toFixed(1), hb = 15;
  return 'M0,' + y + ' H' + (150 - ht)
       + ' L' + (150 - hb) + ',' + (y + d).toFixed(1)
       + ' Q150,' + (y + d + 7).toFixed(1) + ' ' + (150 + hb) + ',' + (y + d).toFixed(1)
       + ' L' + (150 + +ht) + ',' + y + ' H300 V220 H0 Z';
}

const POT_STAGE =
  '<div class="neo-stage neo-pot">'
  + '<svg viewBox="0 0 300 220" class="neo-svg" aria-hidden="true">'
  +   '<rect x="0" y="0" width="300" height="' + POT_TOP + '" fill="#E7E9DF"/>'
  /* 강물 — 여기가 강가라는 것을 말해 줍니다 */
  +   '<path d="M0,86 H54 L40,' + POT_TOP + ' H0 Z" fill="#9DC3C4" opacity=".65"/>'
  +   '<g stroke="#7FAEB0" stroke-width="1.4" opacity=".5" fill="none">'
  +     '<path d="M4,94 q10,-3 20,0 M6,102 q12,-3 24,0"/>'
  +   '</g>'
  /* 젖은 모래 — 파 내려가면 드러납니다 */
  +   '<rect x="0" y="' + POT_TOP + '" width="300" height="108" fill="#BFB498"/>'
  /* 알맞은 깊이 구간 — 모래에 가려져 있다가 파면 드러납니다 */
  +   '<rect id="ptBand" x="112" y="' + (POT_TOP + POT_LO) + '" width="76" height="'
  +     (POT_HI - POT_LO) + '" fill="#5C8F5C" opacity=".34"/>'
  /* 마른 모래 — 이 윤곽이 구덩이가 됩니다 */
  +   '<path id="ptSand" d="' + potSand(0) + '" fill="#E2D9BC"/>'
  /* 파낸 모래 더미 */
  +   '<path id="ptPileL" class="pt-node" d="M-26,0 q6,-15 13,-15 q9,0 13,15 z" fill="#D5CBA8"/>'
  +   '<path id="ptPileR" class="pt-node" d="M-26,0 q6,-15 13,-15 q9,0 13,15 z" fill="#D5CBA8"/>'
  /* 토기가 앉을 자리 */
  +   '<path id="ptGhost" class="pt-node" d="M-20,-34 L0,0 L20,-34" fill="none" stroke="#5C8F5C"'
  +     ' stroke-width="2.4" stroke-dasharray="5 4" stroke-linecap="round" opacity="0"/>'
  /* 토기 */
  +   '<g id="ptPot" class="pt-node">'
  +     '<path d="' + POT_BODY + '" fill="#B08968" stroke="#8A6B48" stroke-width="2"'
  +       ' stroke-linejoin="round"/>'
  +     '<g stroke="#8A6B48" stroke-width="1.1" opacity=".45" fill="none">'
  +       '<path d="M-24,-70 H24 M-22,-60 H22 M-20,-50 H20 M-17,-40 H17"/>'
  +       '<path d="M-22,-78 L-18,-66 M-12,-78 L-8,-66 M-2,-78 L2,-66'
  +            ' M8,-78 L12,-66 M18,-78 L22,-66"/>'
  +       '<path d="M-18,-58 L-14,-46 M-8,-58 L-4,-46 M2,-58 L6,-46 M12,-58 L16,-46"/>'
  +     '</g>'
  +     '<ellipse cx="0" cy="-80" rx="27" ry="6" fill="#9A7350"/>'
  +   '</g>'
  + '</svg>'
  + '<div class="pt-touch" id="ptTouch" aria-hidden="true"></div>'
  + '</div>';

function potGame(ctx) {
  ctx.mount.innerHTML = shell(ctx.mini, POT_STAGE
    + '<button type="button" class="mg-hit" id="ptBtn">그냥 세워 보기</button>'
    + '<div class="mg-dots" id="ptDots"></div>');

  const svg   = ctx.mount.querySelector('.neo-pot svg');
  const sand  = ctx.mount.querySelector('#ptSand');
  const pot   = ctx.mount.querySelector('#ptPot');
  const ghost = ctx.mount.querySelector('#ptGhost');
  const pileL = ctx.mount.querySelector('#ptPileL');
  const pileR = ctx.mount.querySelector('#ptPileR');
  const touch = ctx.mount.querySelector('#ptTouch');
  const btn   = ctx.mount.querySelector('#ptBtn');
  const dots  = ctx.mount.querySelector('#ptDots');
  const status = ctx.mount.querySelector('#mgStatus');

  let phase = 'try';        // try · wait · dig · cover · done
  let depth = 0, holding = false, tries = 0, seated = 0;
  let coverFrom = 0, coverT0 = 0;
  const trail = [];         // 아이가 "본" 깊이 — 화면은 코드보다 한두 프레임 뒤입니다

  const place = (el, x, y, deg, scale) =>
    el.style.transform = 'translate(' + x + 'px,' + y + 'px)'
      + (deg ? ' rotate(' + deg + 'deg)' : '')
      + (scale ? ' scale(1,' + scale + ')' : '');

  const paintDots = () => {
    let s = '';
    for (let i = 0; i < POT_TRIES; i++) s += '<i class="' + (i < tries ? 'no' : '') + '"></i>';
    dots.innerHTML = s;
  };

  const paint = () => {
    sand.setAttribute('d', potSand(depth));
    const k = Math.min(1, depth / POT_FIT);
    place(pileL, 74, POT_TOP + 1, 0, .25 + k * .95);
    place(pileR, 226, POT_TOP + 1, 0, .25 + k * .95);
  };

  /* ── 1. 그냥 세워 보기 — 넘어집니다. 실패가 아니라 배우는 자리입니다 */
  const doTry = () => {
    phase = 'wait';
    btn.disabled = true;
    place(pot, 150, POT_TOP, 0);
    status.textContent = '기우뚱…';
    ctx.later(() => {
      place(pot, 150, POT_TOP, 74);      // 뾰족한 밑을 축으로 쓰러집니다
      status.textContent = '밑이 뾰족해 평평한 땅에는 서지 않는다.';
    }, 420);
    ctx.later(() => {
      phase = 'dig';
      btn.disabled = false;
      btn.textContent = '모래 파기 — 누르고 있다가 놓기';
      place(pot, 286, POT_TOP - 2, -72);  // 오른쪽에 눕혀 둡니다 (화면 안에 들어오도록)
      place(ghost, 150, POT_TOP + POT_FIT, 0);
      ghost.setAttribute('opacity', '.9');
      status.textContent = '점선 자리에 밑동이 닿도록 모래를 파자 · 남은 기회 ' + (POT_TRIES - tries);
    }, 1350);
  };

  /* ── 2. 모래 파기 — 놓는 순간에 깊이를 봅니다 */
  const inBand = d => d >= POT_LO && d <= POT_HI;

  const judge = () => {
    holding = false;
    const ok = inBand(depth) || trail.some(inBand);
    trail.length = 0;
    if (ok) {
      phase = 'cover';
      seated = depth;
      btn.textContent = '모래를 덮어 세우기';
      ghost.setAttribute('opacity', '0');
      place(pot, 150, POT_TOP + depth, 0);      // 구덩이에 꽂아 넣습니다
      status.textContent = '깊이가 딱 맞다 — 이제 모래를 덮어 주자';
      return;
    }
    tries++;
    paintDots();
    phase = 'wait';
    btn.disabled = true;
    if (depth < POT_LO) {
      place(pot, 150, POT_TOP + depth, 0);
      ctx.later(() => place(pot, 150, POT_TOP + depth, 74), 360);
      status.textContent = '너무 얕다 — 밑동이 걸리지 않아 다시 넘어진다.';
    } else {
      place(pot, 150, POT_TOP + depth, 0);
      status.textContent = '너무 깊다 — 아가리까지 모래에 잠겨 버린다.';
    }
    ctx.later(() => {
      if (tries >= POT_TRIES) { status.textContent = '아쉽다…'; ctx.lose(); return; }
      depth = 0; paint();
      place(pot, 286, POT_TOP - 2, -72);
      phase = 'dig';
      btn.disabled = false;
      status.textContent = '모래가 도로 무너졌다 · 남은 기회 ' + (POT_TRIES - tries);
    }, 1250);
  };

  /* ── 3. 덮기 — 모래가 도로 차오르며 토기를 붙듭니다 */
  const doCover = () => {
    phase = 'done';
    btn.disabled = true;
    svg.insertBefore(pot, sand);        // 묻힌 부분은 모래에 가려집니다
    coverFrom = depth;
    coverT0 = performance.now();
    status.textContent = '모래가 밑동을 붙든다…';
    ctx.later(() => {
      pot.style.setProperty('--pty', (POT_TOP + seated) + 'px');
      pot.classList.add('settle');
      status.textContent = '똑바로 섰다!';
    }, 700);
    ctx.later(ctx.win, 1220);
  };

  ctx.loop(dt => {
    if (phase === 'dig' && holding) {
      depth = Math.min(POT_MAX, depth + POT_SPEED * dt);
      trail.push(depth);
      if (trail.length > 3) trail.shift();
      paint();
      if (depth >= POT_MAX) judge();    // 끝까지 파면 그 자리에서 판정합니다
      return;
    }
    if (phase === 'done' && coverT0) {  // 모래가 도로 차오릅니다
      const k = Math.min(1, (performance.now() - coverT0) / 620);
      depth = coverFrom * (1 - k);
      paint();
      if (k >= 1) coverT0 = 0;
    }
  });

  const down = () => {
    if (phase === 'try')   return doTry();
    if (phase === 'cover') return doCover();
    if (phase === 'dig') { holding = true; }
  };
  const up = () => { if (phase === 'dig' && holding) judge(); };

  releaseBind(btn, down, up);
  releaseBind(touch, down, up);         // 땅을 직접 눌러도 파집니다

  place(pot, 150, POT_TOP, 0);
  paint(); paintDots();
  status.textContent = '먼저 그냥 세워 보자.';
}

/* ── 등록 ──────────────────────────────────────────────────── */
MINIGAME_STARTERS['neo-pot'] = potGame;
