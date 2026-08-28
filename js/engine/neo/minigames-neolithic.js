/* js/engine/minigames-neolithic.js — 신석기 전용 미니게임 다섯 가지

   02-MINIGAMES.md 의 아홉 종은 조작이 같아야 아이가 다시 배우지 않아도 됩니다.
   그래서 조작·판정·난이도는 아홉 종 그대로 두고, **보이는 것만** 신석기의 일로 바꿉니다.

     neo-grind   뗀석기가 숫돌 위를 오가고, 갈릴수록 매끈한 간석기가 된다
     neo-winnow  고른 낟알이 빗살무늬토기 안으로 날아가 쌓인다
     neo-spindle 가락바퀴가 무게로 스스로 돌고, 그동안 실이 감긴다
     neo-umjip   땅을 파고 기둥을 세우고 지붕을 덮고 화덕에 불을 놓는다
     neo-rite    제물이 제단의 해·땅·물·불 자리로 날아가 앉는다

   판정 시점(12-BUILD-RULES §3)과 난이도(§3-1), 합격선은 minigames.js 의 것을 그대로 씁니다.
   여기서는 한 줄도 다시 정하지 않습니다. */

import {
  MINIGAME_STARTERS, needleGame, stackGame, memoryGame,
  shell, pressBind, SORT_PASS
} from './minigames.js';
import { icon as _icon, iconName as _iconName } from '../icons.js';

/* 이모지 대신 선 아이콘을 그린다 (앱 전체 규칙).
   그림만 바꾼 것이고 조작·판정·난이도는 원본 그대로다. */
const gi = (v, fb, size) => _icon(_iconName(v, fb || 'dot'), { size: size || 22 });


const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const REDUCED = typeof matchMedia === 'function'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 한 자리에서 다른 자리로 날아가는 조각.
   wrap 은 position:relative 여야 합니다. o.keep 이면 남겨 두고, 아니면 스스로 치웁니다. */
function flyTo(wrap, fromEl, toEl, html, o) {
  o = o || {};
  const wr = wrap.getBoundingClientRect();
  const fr = fromEl.getBoundingClientRect();
  const tr = toEl.getBoundingClientRect();
  const x0 = fr.left - wr.left + fr.width / 2;
  const y0 = fr.top  - wr.top  + fr.height / 2;
  const dx = (tr.left - wr.left + tr.width  / 2) - x0;
  const dy = (tr.top  - wr.top  + tr.height / 2) - y0;

  const f = document.createElement('span');
  f.className = 'neo-fly' + (o.cls ? ' ' + o.cls : '');
  f.innerHTML = html;
  f.style.left = x0 + 'px';
  f.style.top  = y0 + 'px';
  wrap.appendChild(f);

  const end = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))'
            + ' scale(' + (o.scale || .55) + ') rotate(' + (o.spin || 0) + 'deg)';
  if (!REDUCED && f.animate) {
    f.animate(
      [{ transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
       { offset: .7, opacity: 1 },
       { transform: end, opacity: o.fade === false ? 1 : .2 }],
      { duration: o.ms || 440, easing: 'cubic-bezier(.22,.8,.36,1)', fill: 'forwards' });
  } else {
    f.style.transform = end;
  }
  if (!o.keep) setTimeout(() => f.remove(), (o.ms || 440) + 60);
  return f;
}

/* ══ 1. neo-grind — 뗀석기를 갈아 간석기로 ══════════════════════
   난이도·판정은 grind 그대로(10번 중 6번). 바늘 막대는 감추고,
   숫돌 위를 오가는 돌 자체가 바늘 노릇을 합니다. */

const N_PT = 16;
/* 뗀석기의 울퉁불퉁함 — 고정값이라 매번 같은 돌에서 시작합니다 */
const JAG = [1.13, .90, 1.16, .92, 1.10, .88, 1.15, .94,
             1.12, .90, 1.17, .89, 1.09, .95, 1.14, .92];

/* t = 0 갓 떼어 낸 돌 · t = 1 다 갈린 간석기 */
function bladePoints(t) {
  const out = [];
  for (let i = 0; i < N_PT; i++) {
    const a = i / N_PT * Math.PI * 2;
    const rx = 31, ry = 15;
    let r = rx * ry / Math.hypot(ry * Math.cos(a), rx * Math.sin(a));
    r *= 1 + .13 * Math.cos(2 * a);                 // 좌우로 날이 서는 모양
    r *= JAG[i] + (1 - JAG[i]) * t;                 // 갈릴수록 울퉁불퉁함이 사라진다
    out.push((Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1));
  }
  return out.join(' ');
}

const GRIND_X0 = 56, GRIND_W = 188;                 // 숫돌 위에서 돌이 오가는 구간(px)
const gx = p => GRIND_X0 + p / 100 * GRIND_W;

const GRIND_STAGE =
  '<div class="neo-stage neo-grind">'
  + '<svg viewBox="0 0 300 172" class="neo-svg" aria-hidden="true">'
  +   '<rect x="0" y="126" width="300" height="46" fill="#D3CCB2"/>'
  /* 숫돌 — 윗면과 앞면 */
  +   '<path d="M34,96 H266 L282,126 H18 Z" fill="#B4AC94"/>'
  +   '<path d="M18,126 H282 V138 Q150,146 18,138 Z" fill="#948D78"/>'
  +   '<g id="gnWear" stroke="#9A9280" stroke-width="1.2" stroke-linecap="round" opacity=".8"></g>'
  /* 물을 적신 자리 — 갈 때 물을 뿌립니다 */
  +   '<ellipse cx="150" cy="118" rx="96" ry="7" fill="#8FA9A6" opacity=".18"/>'
  /* 딱 밀착하는 구간 */
  +   '<g id="gnZone">'
  +     '<path id="gnZoneFace" d="M0,96 H0 L0,126 H0 Z" fill="rgba(92,143,92,.34)"/>'
  +     '<line id="gnZoneA" x1="0" y1="96" x2="0" y2="126" stroke="#5C8F5C" stroke-width="2"/>'
  +     '<line id="gnZoneB" x1="0" y1="96" x2="0" y2="126" stroke="#5C8F5C" stroke-width="2"/>'
  +   '</g>'
  /* 돌 — gnStone(좌우 이동) > gnPress(누름) > gnSlip(미끄러짐) */
  +   '<g id="gnStone" transform="translate(56,104)">'
  +     '<g id="gnPress"><g id="gnSlip">'
  +       '<ellipse cx="0" cy="20" rx="30" ry="6" fill="#6E6758" opacity=".22"/>'
  +       '<polygon id="gnBlade" points="" fill="#8C8474" stroke="#6B6557" stroke-width="1.4"'
  +         ' stroke-linejoin="round"/>'
  +       '<ellipse id="gnSheen" cx="-9" cy="-6" rx="11" ry="3.4" fill="#F4F1E6" opacity="0"'
  +         ' transform="rotate(-8)"/>'
  +       '<g id="gnEdgeL" opacity="0"><path d="M-30,-9 Q-41,0 -30,9" fill="none"'
  +         ' stroke="#5C8F5C" stroke-width="3.4" stroke-linecap="round"/>'
  +         '<path d="M-44,-6 L-38,0 L-44,6" fill="none" stroke="#5C8F5C"'
  +         ' stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>'
  +       '<g id="gnEdgeR" opacity="0"><path d="M30,-9 Q41,0 30,9" fill="none"'
  +         ' stroke="#5C8F5C" stroke-width="3.4" stroke-linecap="round"/>'
  +         '<path d="M44,-6 L38,0 L44,6" fill="none" stroke="#5C8F5C"'
  +         ' stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>'
  /* 돌을 쥔 손 */
  +       '<g id="gnHand">'
  +         '<path d="M-9,-64 q-4,-14 9,-15 h14 q13,1 9,15 l-3,26 h-26 z" fill="#C9A27E"/>'
  +         '<path d="M-14,-40 q14,-11 28,0 q5,10 0,15 q-14,8 -28,0 q-5,-5 0,-15 z"'
  +           ' fill="#D8B18B" stroke="#A8825E" stroke-width="1.2"/>'
  +         '<g stroke="#A8825E" stroke-width="1.1" fill="none" opacity=".8">'
  +           '<path d="M-8,-28 q0,7 2,10 M0,-29 q0,8 0,11 M8,-28 q0,7 -2,10"/>'
  +         '</g>'
  +       '</g>'
  +     '</g></g>'
  +   '</g>'
  +   '<g id="gnDust"></g>'
  + '</svg>'
  + '<div class="neo-meter"><span class="neo-meter-cap">뗀석기</span>'
  +   '<div class="neo-meter-bar"><i id="gnPolish"></i></div>'
  +   '<span class="neo-meter-cap">간석기</span></div>'
  + '</div>';

function grindGame(ctx) {
  let el = null, shown = 0, target = 0, wearN = 0;

  needleGame(ctx, {
    tries: 10, need: 6, width0: 16, widthMin: 7.5, speed0: .95, speedMax: 2.0,
    alternate: true,
    hitLabel: ctx.mini.hitLabel || '지금 밀어 갈기',
    stage: GRIND_STAGE,
    barClass: 'ghost',            // 바늘 막대는 감춥니다 — 돌이 곧 바늘입니다

    onReady(mount) {
      el = {
        stone: mount.querySelector('#gnStone'),
        press: mount.querySelector('#gnPress'),
        slip:  mount.querySelector('#gnSlip'),
        blade: mount.querySelector('#gnBlade'),
        sheen: mount.querySelector('#gnSheen'),
        edgeL: mount.querySelector('#gnEdgeL'),
        edgeR: mount.querySelector('#gnEdgeR'),
        face:  mount.querySelector('#gnZoneFace'),
        za:    mount.querySelector('#gnZoneA'),
        zb:    mount.querySelector('#gnZoneB'),
        dust:  mount.querySelector('#gnDust'),
        wear:  mount.querySelector('#gnWear'),
        bar:   mount.querySelector('#gnPolish')
      };
      el.blade.setAttribute('points', bladePoints(0));
    },

    /* 구간은 숫돌에 사다리꼴로 얹습니다 — 아랫면(18~282)이 윗면(34~266)보다 넓으므로 */
    onZone(zone, width, side) {
      if (!el) return;
      const l = gx(zone), r = gx(zone + width);
      const top = x => 34 + (x - 18) * (232 / 264);
      const lt = top(l).toFixed(1), rt = top(r).toFixed(1);
      el.face.setAttribute('d',
        'M' + lt + ',96 H' + rt + ' L' + r.toFixed(1) + ',126 H' + l.toFixed(1) + ' Z');
      el.za.setAttribute('x1', lt); el.za.setAttribute('x2', l.toFixed(1));
      el.zb.setAttribute('x1', rt); el.zb.setAttribute('x2', r.toFixed(1));
      /* 이번에 갈 날에만 초록빛이 돕니다 */
      el.edgeL.setAttribute('opacity', side === 0 ? .95 : 0);
      el.edgeR.setAttribute('opacity', side === 1 ? .95 : 0);
    },

    onFrame(pos) {
      if (!el) return;
      el.stone.setAttribute('transform', 'translate(' + gx(pos).toFixed(1) + ',104)');
      if (shown !== target) {                   // 갈린 정도가 천천히 따라옵니다
        shown += (target - shown) * .12;
        if (Math.abs(target - shown) < .004) shown = target;
        el.blade.setAttribute('points', bladePoints(shown));
        el.blade.setAttribute('fill', mixStone(shown));
        el.sheen.setAttribute('opacity', (shown * .62).toFixed(3));
        el.bar.style.width = (shown * 100) + '%';
      }
    },

    onHit(hits, need, side, pos) {
      if (!el) return;
      target = Math.min(1, hits / need);
      el.press.classList.remove('press'); void el.press.offsetWidth;
      el.press.classList.add('press');
      spitDust(el.dust, gx(pos), 116, side);
      if (wearN < 14) {                          // 숫돌에 남는 갈린 자국
        const x = gx(pos), y = 108 + (wearN % 3) * 5;
        const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', x - 16); ln.setAttribute('y1', y);
        ln.setAttribute('x2', x + 16); ln.setAttribute('y2', y);
        el.wear.appendChild(ln); wearN++;
      }
    },

    onMiss(pos) {
      if (!el) return;
      el.slip.classList.remove('slip'); void el.slip.offsetWidth;
      el.slip.classList.add('slip');
      spitDust(el.dust, gx(pos), 116, 2);
    }
  });
}

/* 갈리면서 빛깔이 짙고 차분해집니다 */
function mixStone(t) {
  const a = [140, 132, 116], b = [111, 106, 94];
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')';
}

/* 돌가루 — 갈 때마다 튀고 사라집니다 */
function spitDust(g, x, y, side) {
  if (REDUCED) return;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const dir = side === 0 ? -1 : (side === 1 ? 1 : (i % 2 ? 1 : -1));
    c.setAttribute('cx', x); c.setAttribute('cy', y);
    c.setAttribute('r', (1 + Math.random() * 2).toFixed(1));
    c.setAttribute('fill', i % 3 ? '#EAE4D2' : '#C7BFA8');
    c.setAttribute('class', 'gn-dust');
    c.style.setProperty('--dx', (dir * (10 + Math.random() * 26)).toFixed(1) + 'px');
    c.style.setProperty('--dy', (-8 - Math.random() * 22).toFixed(1) + 'px');
    c.style.animationDelay = (Math.random() * 60) + 'ms';
    g.appendChild(c);
    setTimeout(() => c.remove(), 760);
  }
}

/* ══ 2. neo-winnow — 낟알을 골라 토기에 갈무리 ══════════════════
   판정과 합격선은 sort 그대로(SORT_PASS). 고른 것이 실제로 날아가 쌓입니다. */

const WINNOW_STAGE =
  '<div class="neo-stage neo-winnow" id="wnWrap">'
  + '<div class="wn-ear" id="wnEar">'
  +   '<div class="wn-card" id="wnCard"></div>'
  + '</div>'
  + '<div class="wn-bins">'
  +   '<button type="button" class="wn-bin" id="wnL">'
  +     '<svg viewBox="0 0 80 92" class="wn-art" aria-hidden="true">'
  +       '<defs><clipPath id="wnJarClip">'
  +         '<path d="M17,16 H63 L56,58 L40,80 L24,58 Z"/></clipPath></defs>'
  +       '<g clip-path="url(#wnJarClip)">'
  +         '<rect x="10" y="14" width="60" height="70" fill="#EFE7D0"/>'
  +         '<g id="wnFill"><rect x="10" y="16" width="60" height="72" fill="#CFA652"/>'
  +           '<g fill="#E2C177">'
  +             '<circle cx="26" cy="24" r="3"/><circle cx="40" cy="20" r="3.4"/>'
  +             '<circle cx="54" cy="25" r="3"/><circle cx="33" cy="33" r="3.2"/>'
  +             '<circle cx="47" cy="34" r="3"/>'
  +           '</g></g>'
  +       '</g>'
  +       '<path d="M17,16 H63 L56,58 L40,80 L24,58 Z" fill="none" stroke="#8A6B48" stroke-width="2.6"/>'
  +       '<g stroke="#8A6B48" stroke-width="1" opacity=".4">'
  +         '<path d="M20,24 L60,24 M21,32 L59,32 M23,40 L57,40 M25,48 L55,48"/>'
  +         '<path d="M22,20 L26,30 M30,20 L34,30 M38,20 L42,30 M46,20 L50,30 M54,20 L58,30"/>'
  +         '<path d="M26,36 L30,46 M34,36 L38,46 M42,36 L46,46 M50,36 L54,46"/>'
  +       '</g>'
  +       '<ellipse cx="40" cy="16" rx="23" ry="5" fill="#A8825E"/>'
  +     '</svg>'
  +     '<span class="wn-bin-label">씨앗으로 갈무리</span>'
  +     '<span class="wn-bin-count" id="wnCountL">0</span>'
  +   '</button>'
  +   '<button type="button" class="wn-bin" id="wnR">'
  +     '<svg viewBox="0 0 80 92" class="wn-art" aria-hidden="true">'
  +       '<g id="wnHeap" style="transform-origin:40px 78px">'
  +         '<path d="M6,78 Q40,42 74,78 Z" fill="#BCB49A"/>'
  +         '<g stroke="#A79F8B" stroke-width="1.4" stroke-linecap="round">'
  +           '<path d="M18,76 L26,58 M30,78 L34,54 M44,78 L48,56 M54,76 L60,60 M38,78 L40,50"/>'
  +         '</g>'
  +       '</g>'
  +       '<path d="M4,79 H76" stroke="#A79F8B" stroke-width="2" stroke-linecap="round"/>'
  +     '</svg>'
  +     '<span class="wn-bin-label">골라내 버리기</span>'
  +     '<span class="wn-bin-count" id="wnCountR">0</span>'
  +   '</button>'
  + '</div></div>';

function winnowGame(ctx) {
  const items = (ctx.mini.items || []).slice();
  if (!items.length) return (MINIGAME_STARTERS.sort)(ctx);

  ctx.mount.innerHTML = shell(ctx.mini, WINNOW_STAGE);
  const wrap  = ctx.mount.querySelector('#wnWrap');
  const card  = ctx.mount.querySelector('#wnCard');
  const binL  = ctx.mount.querySelector('#wnL');
  const binR  = ctx.mount.querySelector('#wnR');
  const fill  = ctx.mount.querySelector('#wnFill');
  const heap  = ctx.mount.querySelector('#wnHeap');
  const cntL  = ctx.mount.querySelector('#wnCountL');
  const cntR  = ctx.mount.querySelector('#wnCountR');
  const status = ctx.mount.querySelector('#mgStatus');

  const keep = items.filter(x => x.korean === true).length || 1;
  const toss = items.length - keep || 1;
  let i = 0, right = 0, nL = 0, nR = 0, busy = false;

  const show = () => {
    if (i >= items.length) {
      card.className = 'wn-card done';
      card.innerHTML = '<span class="wn-card-icon">' + gi('basket', 'basket', 26) + '</span>'
                     + '<span class="wn-card-label">다 골라냈다</span>';
      status.textContent = '맞게 가른 것 ' + right + ' / ' + items.length;
      ctx.later(right / items.length >= SORT_PASS ? ctx.win : ctx.lose, 620);
      return;
    }
    busy = false;
    binL.disabled = binR.disabled = false;
    const it = items[i];
    card.className = 'wn-card';
    card.innerHTML = '<span class="wn-card-icon">' + gi(it.icon, 'grain', 26) + '</span>'
                   + '<span class="wn-card-label">' + esc(it.label) + '</span>';
    status.textContent = (i + 1) + ' / ' + items.length + ' · 맞게 가른 것 ' + right;
  };

  /* 낟알이 날아가는 동안에는 다음 것을 받지 않습니다 —
     연달아 누르면 보지도 못한 낟알이 그냥 넘어가 버립니다 */
  const answer = left => {
    if (busy || i >= items.length) return;
    busy = true;
    binL.disabled = binR.disabled = true;
    const it = items[i];
    const ok = (it.korean === true) === left;
    if (ok) right++;

    const bin = left ? binL : binR;
    flyTo(wrap, card, bin,
      '<span class="wn-fly-icon">' + gi(it.icon, 'grain', 22) + '</span>'
      + '<span class="wn-fly-mark ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓' : '✕') + '</span>',
      { ms: 460, scale: .5, spin: left ? -16 : 16, fade: false });

    card.classList.add(ok ? 'ok' : 'no');
    bin.classList.add('take');
    ctx.later(() => bin.classList.remove('take'), 520);

    /* 낟알이 닿을 즈음 토기가 차오르고 검불더미가 커집니다 */
    ctx.later(() => {
      if (left) {
        nL++; cntL.textContent = nL;
        fill.style.transform = 'translateY(' + (64 - Math.min(1, nL / keep) * 64).toFixed(1) + 'px)';
      } else {
        nR++; cntR.textContent = nR;
        heap.style.transform = 'scale(' + (1 + Math.min(1, nR / toss) * .26).toFixed(3) + ')';
      }
    }, 380);

    i++;
    ctx.later(show, 300);
  };

  fill.style.transform = 'translateY(64px)';
  pressBind(binL, () => answer(true));
  pressBind(binR, () => answer(false));
  show();
}

/* ══ 3. neo-spindle — 가락바퀴로 실을 잣기 ══════════════════════
   spin 과 같은 목표(누적 laps 바퀴, 실패 없음)에 가락바퀴의 무게를 더했습니다.
   손을 떼도 바퀴가 한동안 스스로 도는 것 — 그게 가락바퀴가 있는 이유입니다. */

const SPINDLE_STAGE =
  '<div class="neo-stage neo-spindle" id="spWrap">'
  + '<svg viewBox="0 0 220 232" class="neo-svg" aria-hidden="true">'
  /* 삼 섬유 뭉치 */
  +   '<g id="spFiber" style="transform-origin:110px 26px">'
  +     '<ellipse cx="110" cy="26" rx="34" ry="17" fill="#CFC8A6"/>'
  +     '<g stroke="#B3AA84" stroke-width="1.6" stroke-linecap="round">'
  +       '<path d="M86,18 q10,-9 20,-2 M104,14 q12,-8 22,2 M92,34 q14,7 28,1 M118,32 q10,4 18,-2"/>'
  +     '</g>'
  +   '</g>'
  /* 꼬이며 내려오는 실 */
  +   '<path id="spThread" d="M110,42 L110,86" fill="none" stroke="#C0B58C"'
  +     ' stroke-width="2.4" stroke-linecap="round"/>'
  /* 막대(축) */
  +   '<rect x="105" y="60" width="10" height="150" rx="5" fill="#8A6B48"/>'
  +   '<rect x="107" y="60" width="3" height="150" fill="#A07E56" opacity=".7"/>'
  /* 감긴 실뭉치 */
  +   '<g id="spCoil"></g>'
  /* 가락바퀴 */
  +   '<g id="spWhorl" style="transform-origin:110px 176px">'
  +     '<circle cx="110" cy="176" r="40" fill="#A8825E"/>'
  +     '<circle cx="110" cy="176" r="40" fill="none" stroke="#7A5C42" stroke-width="3"/>'
  +     '<circle cx="110" cy="176" r="27" fill="none" stroke="#8E6E4E" stroke-width="2" opacity=".8"/>'
  +     '<g stroke="#7A5C42" stroke-width="2.6" stroke-linecap="round">'
  +       '<path d="M110,140 V150 M110,202 V212 M74,176 H84 M136,176 H146"/>'
  +       '<path d="M84,150 L91,157 M136,202 L129,195 M136,150 L129,157 M84,202 L91,195"/>'
  +     '</g>'
  +     '<path d="M110,176 L134,158 A30,30 0 0,0 110,146 Z" fill="#8E6E4E" opacity=".55"/>'
  +     '<circle cx="110" cy="176" r="7" fill="#5E4A34"/>'
  +   '</g>'
  +   '<g id="spBlur" opacity="0">'
  +     '<circle cx="110" cy="176" r="45" fill="none" stroke="#A8825E"'
  +       ' stroke-width="2" stroke-dasharray="18 26" stroke-linecap="round"/>'
  +   '</g>'
  + '</svg>'
  + '<div class="sp-pad" id="spPad" aria-hidden="true"></div>'
  + '</div>'
  + '<div class="mg-progress"><i id="spProg"></i></div>';

function spindleGame(ctx) {
  const laps = ctx.mini.laps || 4;
  ctx.mount.innerHTML = shell(ctx.mini, SPINDLE_STAGE
    + '<button type="button" class="mg-hit" id="spFlick">'
    + esc(ctx.mini.hitLabel || '가락바퀴 튕겨 돌리기') + '</button>');

  const wrap   = ctx.mount.querySelector('#spWrap');
  const pad    = ctx.mount.querySelector('#spPad');
  const whorl  = ctx.mount.querySelector('#spWhorl');
  const blur   = ctx.mount.querySelector('#spBlur');
  const fiber  = ctx.mount.querySelector('#spFiber');
  const thread = ctx.mount.querySelector('#spThread');
  const coil   = ctx.mount.querySelector('#spCoil');
  const prog   = ctx.mount.querySelector('#spProg');
  const status = ctx.mount.querySelector('#mgStatus');
  const flick  = ctx.mount.querySelector('#spFlick');

  const FULL = laps * Math.PI * 2;
  let angle = 0, vel = 0, total = 0, down = false, lastA = 0, lastT = 0, won = false;
  const COILS = 9;
  for (let i = 0; i < COILS; i++) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    e.setAttribute('cx', 110);
    e.setAttribute('cy', 78 + i * 9);
    e.setAttribute('rx', 6 + (i < COILS - 2 ? i * 1.4 : (COILS - 1 - i) * 4 + 4));
    e.setAttribute('ry', 5);
    e.setAttribute('fill', i % 2 ? '#D8CDA4' : '#C6BA8E');
    e.setAttribute('class', 'sp-coil');
    coil.appendChild(e);
  }
  const coilEls = [...coil.children];

  const angleOf = e => {
    const r = pad.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  };

  pad.addEventListener('pointerdown', e => {
    e.preventDefault();
    down = true; lastA = angleOf(e); lastT = performance.now();
    pad.setPointerCapture && pad.setPointerCapture(e.pointerId);
  });
  pad.addEventListener('pointermove', e => {
    if (!down || ctx.dead) return;
    const now = performance.now();
    const a = angleOf(e);
    let d = a - lastA;
    while (d >  Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    const dt = Math.max(.008, (now - lastT) / 1000);
    lastA = a; lastT = now;
    angle += d;
    total += Math.abs(d);                       // 방향은 상관없이 절댓값으로 셉니다
    vel = Math.max(-16, Math.min(16, d / dt));  // 손을 뗀 뒤 이어질 힘
  });
  const up = () => { down = false; };
  pad.addEventListener('pointerup', up);
  pad.addEventListener('pointercancel', up);
  /* 손가락이 없는 환경 — 튕겨서 돌립니다 */
  pressBind(flick, () => { vel += (vel < 0 ? -8 : 8); });

  ctx.loop(dt => {
    if (!down) {
      /* 가락바퀴의 무게가 회전을 오래 붙들어 줍니다 */
      const step = vel * dt;
      angle += step; total += Math.abs(step);
      vel *= Math.exp(-1.5 * dt);
      if (Math.abs(vel) < .05) vel = 0;
    }
    const n = total / (Math.PI * 2);
    const p = Math.min(1, total / FULL);

    whorl.style.transform = 'rotate(' + (angle * 180 / Math.PI).toFixed(1) + 'deg)';
    blur.setAttribute('opacity', Math.min(.75, Math.abs(vel) / 14).toFixed(2));
    fiber.style.transform = 'scale(' + (1 - p * .55).toFixed(3) + ')';
    prog.style.width = (p * 100) + '%';

    /* 실이 꼬일수록 결이 촘촘해집니다 */
    const amp = 7 * (1 - p) + 1;
    const waves = 3 + Math.round(p * 5);
    let d = 'M110,42';
    for (let k = 1; k <= waves * 2; k++) {
      const y = 42 + (44 / (waves * 2)) * k;
      d += ' Q' + (110 + (k % 2 ? amp : -amp)).toFixed(1) + ',' + (y - 22 / waves).toFixed(1)
         + ' 110,' + y.toFixed(1);
    }
    thread.setAttribute('d', d);
    coilEls.forEach((e, k) => e.style.opacity = p * COILS > k ? 1 : 0);

    if (won) return;
    status.textContent = n.toFixed(1) + ' / ' + laps + ' 바퀴'
      + (Math.abs(vel) > 6 ? ' · 바퀴가 힘을 받아 스스로 돈다' : '');
    if (total >= FULL) {
      won = true;
      status.textContent = '실이 다 뽑혔다!';
      ctx.later(ctx.win, 420);
    }
  });
}

/* ══ 4. neo-umjip — 움집을 차례대로 짓기 ════════════════════════
   순서·실수 3번은 stack 그대로. 단계마다 실제로 집이 지어집니다. */

const UMJIP_VISUAL =
  '<rect x="0" y="130" width="200" height="40" fill="#C9C2A8" opacity=".55"/>'
  /* 지을 자리 — 아직 아무것도 없을 때 무엇을 짓는지 보여 주는 밑그림 */
  + '<g fill="none" stroke="#B3AC96" stroke-width="1.6" stroke-dasharray="4 5" opacity=".8">'
  +   '<path d="M100,46 L170,136 Q100,150 30,136 Z"/>'
  +   '<ellipse cx="100" cy="134" rx="62" ry="15"/>'
  + '</g>'
  /* 0 · 땅을 둥글게 파 내려간다 */
  + '<g class="stack-part" data-step="0" style="transform-origin:100px 132px">'
  +   '<path d="M26,133 q9,-13 21,-3 z" fill="#9C8B66"/>'
  +   '<path d="M152,133 q11,-14 23,-2 z" fill="#9C8B66"/>'
  +   '<ellipse cx="100" cy="133" rx="60" ry="15" fill="#8A7B5E"/>'
  +   '<ellipse cx="100" cy="131" rx="51" ry="11" fill="#655A44"/>'
  +   '<ellipse cx="100" cy="134" rx="44" ry="8" fill="#7A6C52" opacity=".7"/>'
  + '</g>'
  /* 1 · 기둥과 서까래 */
  + '<g class="stack-part" data-step="1" style="transform-origin:100px 134px">'
  +   '<g stroke="#7A5C42" stroke-width="4.4" stroke-linecap="round" fill="none">'
  +     '<path d="M46,130 L100,56 M66,137 L100,56 M100,139 L100,56'
  +          ' M134,137 L100,56 M154,130 L100,56"/>'
  +   '</g>'
  +   '<ellipse cx="100" cy="104" rx="36" ry="9" fill="none" stroke="#8E6E4E"'
  +     ' stroke-width="2.4" stroke-dasharray="5 5"/>'
  +   '<circle cx="100" cy="56" r="4.5" fill="#5E4A34"/>'
  + '</g>'
  /* 2 · 풀과 흙을 덮은 지붕 */
  + '<g class="stack-part" data-step="2" style="transform-origin:100px 58px">'
  +   '<path d="M100,46 L170,137 Q100,151 30,137 Z" fill="#9B7550"/>'
  +   '<path d="M100,46 L138,137 Q100,145 62,137 Z" fill="#B08D65"/>'
  +   '<g stroke="#7A5C3C" stroke-width="1.5" opacity=".5" fill="none">'
  +     '<path d="M100,50 L52,135 M100,50 L76,137 M100,50 L124,137 M100,50 L148,135"/>'
  +     '<path d="M60,116 Q100,124 140,116 M48,130 Q100,140 152,130"/>'
  +   '</g>'
  +   '<ellipse cx="100" cy="45" rx="9" ry="4.5" fill="#6B5A44"/>'
  +   '<path d="M84,137 q16,-30 32,0 z" fill="#3F372C"/>'
  + '</g>'
  /* 3 · 화덕과 불씨 */
  + '<g class="stack-part" data-step="3" style="transform-origin:100px 130px">'
  +   '<ellipse cx="100" cy="133" rx="17" ry="6" fill="#5A4E3C"/>'
  +   '<g fill="#C4BCA8" stroke="#9A9280" stroke-width="1">'
  +     '<circle cx="85" cy="132" r="4.6"/><circle cx="100" cy="136" r="4.8"/>'
  +     '<circle cx="115" cy="132" r="4.6"/>'
  +   '</g>'
  +   '<g class="umjip-flame" style="transform-origin:100px 132px">'
  +     '<path d="M100,104 q14,15 8,23 q-3,6 -8,6 q-5,0 -8,-6 q-6,-8 8,-23 z" fill="#D9722E"/>'
  +     '<path d="M100,114 q8,9 4,15 q-2,3 -4,3 q-2,0 -4,-3 q-4,-6 4,-15 z" fill="#F2C560"/>'
  +   '</g>'
  + '</g>';

function umjipGame(ctx) {
  return stackGame(ctx, { visual: UMJIP_VISUAL, stageClass: 'neo-umjip' });
}

/* ══ 5. neo-rite — 제단에 제물을 올리기 ═════════════════════════
   memory 그대로(한 번 틀리면 끝, rounds 라운드). 누르면 제물이 제단으로 날아갑니다. */

const RITE_ICONS = ['sun', 'sprout', 'water', 'fire'];
const RITE_NAMES = ['해', '땅', '물', '불'];
const RITE_SLOT_X = [46, 102, 158, 214];
const RITE_SLOT_Y = 60;

const RITE_STAGE = (() => {
  let s = '<svg viewBox="0 0 260 124" class="neo-svg rt-altar" aria-hidden="true">'
    /* 하늘로 오르는 기운 */
    + '<g id="rtRays" opacity="0" stroke="#C7B06A" stroke-width="2.4" stroke-linecap="round">'
    +   '<path d="M130,12 V2 M96,18 L90,9 M164,18 L170,9 M70,30 L61,24 M190,30 L199,24"/>'
    + '</g>';
  RITE_SLOT_X.forEach((x, i) => {
    s += '<g class="rt-slot" id="rtSlot' + i + '">'
      +   '<ellipse cx="' + x + '" cy="' + (RITE_SLOT_Y + 17) + '" rx="20" ry="5"'
      +     ' fill="#8F8873" opacity=".28"/>'
      +   '<circle cx="' + x + '" cy="' + RITE_SLOT_Y + '" r="18" class="rt-slot-dish"/>'
      +   '<text x="' + x + '" y="' + (RITE_SLOT_Y + 5) + '" class="rt-slot-mark">'
      +     RITE_NAMES[i] + '</text>'
      + '</g>';
  });
  /* 돌 제단 */
  s += '<path d="M20,80 H240 Q244,88 238,96 H22 Q16,88 20,80 Z" fill="#C1BAA8"/>'
    +  '<path d="M28,96 H232 Q240,106 236,116 H24 Q20,106 28,96 Z" fill="#A79F8B"/>'
    +  '<g stroke="#8F8873" stroke-width="1.3" opacity=".55" fill="none">'
    +    '<path d="M78,80 V96 M132,80 V96 M186,80 V96 M58,96 V116 M112,96 V116 M166,96 V116 M210,96 V116"/>'
    +  '</g>'
    +  '</svg>';
  return '<div class="neo-stage neo-rite-stage">' + s + '</div>';
})();

function riteGame(ctx) {
  let wrap = null, slots = [], pads = [], rays = null;
  let laid = [];                       // 아이가 올려 둔 제물 — 라운드가 바뀌면 치웁니다

  return memoryGame(ctx, {
    icons: RITE_ICONS,
    names: RITE_NAMES,
    wrapClass: 'neo-rite',
    stage: RITE_STAGE,

    onReady(mount, els) {
      wrap = mount.querySelector('#mgMemWrap');
      pads = els;
      rays = mount.querySelector('#rtRays');
      slots = RITE_ICONS.map((_, i) => mount.querySelector('#rtSlot' + i));
    },

    onRound(round, rounds) {
      laid.forEach(f => f.remove()); laid = [];
      slots.forEach(s => s.classList.remove('on', 'bad'));
      if (rays) rays.setAttribute('opacity', (round / rounds * .9).toFixed(2));
    },

    /* mode — show: 제사장이 올리는 것 · user: 아이가 올리는 것 · bad: 어긋난 것 */
    onFlash(i, mode) {
      const slot = slots[i];
      if (!wrap || !slot) return;
      const f = flyTo(wrap, pads[i], slot, gi(RITE_ICONS[i]),
        { ms: mode === 'bad' ? 300 : 420, scale: .7, cls: 'rt-fly',
          fade: mode !== 'user', keep: mode === 'user' });
      if (mode === 'user') laid.push(f);
      slot.classList.remove('bad');
      if (mode === 'bad') {
        slot.classList.add('bad');
      } else {
        slot.classList.add('on');
        if (mode === 'show') ctx.later(() => slot.classList.remove('on'), 620);
      }
    }
  });
}

/* ── 등록 ──────────────────────────────────────────────────── */
MINIGAME_STARTERS['neo-grind']   = grindGame;
MINIGAME_STARTERS['neo-winnow']  = winnowGame;
MINIGAME_STARTERS['neo-spindle'] = spindleGame;
MINIGAME_STARTERS['neo-umjip']   = umjipGame;
MINIGAME_STARTERS['neo-rite']    = riteGame;
