// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   mg-templates.js — 미션용 놀이 템플릿 6종 (요청서 §7)

     restore   조각을 제자리에            깨진 토기 복원
     sequence  절차를 순서대로            돌 갈기 · 토기 빚기 · 움집 짓기
     sort      제한된 칸에 선별            무엇을 저장할까
     compare   두 자료의 차이 찾기         뗀석기와 간석기
     decode    가려진 것 알아내기          흔적으로 쓰임 알아내기
     timed     압박 속 반복 조작           불씨 지키기 · 실 잣기

   지키는 것
     · 개별 제작 금지. 여기에 템플릿만 두고 자료로 갈아 끼운다.
     · 게임 오버가 없다. 못 하면 못 하는 대로 넘어간다.
     · 성공/실패가 아니라 결과의 상태만 남는다
         clean   깔끔하게 해냈다
         rough   해내긴 했으나 자국이 남았다
         partial 도중에 그만두었다
       이 상태가 엔딩의 유리장에 그대로 전시된다.
     · 하나당 60초 안에 끝난다.

   계약:  runTemplate(spec, host, done)   done({ quality })
   ══════════════════════════════════════════════════════════════════════ */
import { onPress } from './minigames.js';
import { icon } from './icons.js';
import { artSVG, hasArt } from './artifact-art.js';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* 공통 껍데기 — 어느 템플릿이나 같은 자리에 같은 것이 놓인다 */
function shell(host, spec, inner){
  host.innerHTML = `
    <div class="mt">
      <p class="mt-intro">${esc(spec.intro || '')}</p>
      <div class="mt-stage" id="mtStage">${inner}</div>
      <p class="mt-say" id="mtSay"></p>
      <div class="mt-foot">
        <button class="mt-skip" id="mtSkip" type="button">이만 하겠소</button>
        <button class="mt-go" id="mtGo" type="button"></button>
      </div>
    </div>`;
  return {
    stage: host.querySelector('#mtStage'),
    say:   host.querySelector('#mtSay'),
    skip:  host.querySelector('#mtSkip'),
    go:    host.querySelector('#mtGo')
  };
}
const tell = (ui, s) => { ui.say.textContent = s || ''; };

/** 끝맺음 — 어떤 길로 끝나든 여기로 모인다 */
function finish(ui, quality, spec, done){
  const WORD = {
    clean:   spec.cleanSay   || '깔끔하게 되었소.',
    rough:   spec.roughSay   || '되기는 되었소. 자국이 좀 남았구려.',
    partial: spec.partialSay || '여기까지 해 두어도 되오. 그대로 남을 것이오.'
  };
  tell(ui, WORD[quality]);
  ui.skip.style.display = 'none';
  ui.go.textContent = '다음으로 →';
  ui.go.style.display = '';         // 템플릿이 처음에 걸어 둔 인라인 display:none 을 지운다 —
                                     // 안 지우면 .on 클래스(display:block)가 있어도 안 보인다
  ui.go.classList.add('on');
  const fresh = ui.go.cloneNode(true);
  ui.go.replaceWith(fresh);
  onPress(fresh, () => done({ quality }));
}

/* ══════════════════════════════════════════════════════════════
   ① restore — 조각을 제자리에
   spec: { slots:[{id,label}], pieces:[{id,label,belongs}] }
   ══════════════════════════════════════════════════════════════ */
function tplRestore(spec, host, done){
  const slots  = spec.slots || [];
  const pieces = shuffle((spec.pieces || []).slice());
  const placed = {};
  let wrong = 0, held = null;

  const ui = shell(host, spec, `
    <div class="mt-restore">
      <div class="mt-slots" id="mtSlots"></div>
      <div class="mt-pieces" id="mtPieces"></div>
    </div>`);
  ui.go.style.display = 'none';

  const slotHost  = ui.stage.querySelector('#mtSlots');
  const pieceHost = ui.stage.querySelector('#mtPieces');

  function paint(){
    slotHost.innerHTML = slots.map(s => {
      const p = placed[s.id];
      return `<button class="mt-slot ${p ? 'on' : ''}" data-id="${esc(s.id)}" type="button">
        <span class="mt-slot-l">${esc(s.label)}</span>
        <span class="mt-slot-v">${p ? esc(p.label) : ''}</span></button>`;
    }).join('');
    pieceHost.innerHTML = pieces.map(p => {
      const used = Object.values(placed).some(x => x && x.id === p.id);
      return `<button class="mt-piece ${used ? 'used' : ''} ${held && held.id === p.id ? 'held' : ''}"
                 data-id="${esc(p.id)}" type="button" ${used ? 'disabled' : ''}>${esc(p.label)}</button>`;
    }).join('');

    slotHost.querySelectorAll('.mt-slot').forEach(b => onPress(b, () => drop(b.dataset.id)));
    pieceHost.querySelectorAll('.mt-piece').forEach(b => onPress(b, () => {
      held = pieces.find(p => p.id === b.dataset.id) || null;
      tell(ui, held ? `"${held.label}" 을(를) 들었소. 어디에 놓겠소?` : '');
      paint();
    }));

    if (Object.keys(placed).length === slots.length){
      finish(ui, wrong === 0 ? 'clean' : 'rough', spec, done);
    }
  }

  function drop(slotId){
    if (!held){ tell(ui, '먼저 조각을 하나 고르시오.'); return; }
    const slot = slots.find(s => s.id === slotId);
    if (!slot || placed[slotId]) return;
    if (held.belongs === slotId){
      placed[slotId] = held; held = null;
      tell(ui, '맞물렸소.');
    } else {
      wrong++;
      tell(ui, '이 자리는 아니오. 결이 맞지 않소.');
    }
    paint();
  }

  onPress(ui.skip, () => finish(ui, Object.keys(placed).length ? 'rough' : 'partial', spec, done));
  paint();
}

/* ══════════════════════════════════════════════════════════════
   ② sequence — 절차를 순서대로
   spec: { steps:[{label, say}] }   섞어 두고 차례대로 누르게 한다
   ══════════════════════════════════════════════════════════════ */
function tplSequence(spec, host, done){
  const steps = (spec.steps || []).map((s, i) => ({ ...s, order: i }));
  const bag = shuffle(steps.slice());
  let at = 0, wrong = 0;

  const ui = shell(host, spec, `
    <ol class="mt-track" id="mtTrack"></ol>
    <div class="mt-chips" id="mtChips"></div>`);
  ui.go.style.display = 'none';

  const track = ui.stage.querySelector('#mtTrack');
  const chips = ui.stage.querySelector('#mtChips');

  function paint(){
    track.innerHTML = steps.map((s, i) => `
      <li class="mt-tstep ${i < at ? 'done' : (i === at ? 'now' : '')}">
        <span class="mt-tnum">${i + 1}</span>
        <span>${i < at ? esc(s.label) : '?'}</span>
      </li>`).join('');
    chips.innerHTML = bag.map(s => `
      <button class="mt-chip ${s.order < at ? 'used' : ''}" data-o="${s.order}"
              type="button" ${s.order < at ? 'disabled' : ''}>${esc(s.label)}</button>`).join('');
    chips.querySelectorAll('.mt-chip').forEach(b => onPress(b, () => pick(+b.dataset.o)));
  }

  function pick(order){
    if (order === at){
      const s = steps[at];
      at++;
      tell(ui, s.say || '그 다음이오.');
      paint();
      if (at >= steps.length) finish(ui, wrong === 0 ? 'clean' : 'rough', spec, done);
    } else {
      wrong++;
      tell(ui, spec.wrongSay || '아직 그럴 차례가 아니오.');
    }
  }

  onPress(ui.skip, () => finish(ui, at > 0 ? 'rough' : 'partial', spec, done));
  paint();
}

/* ══════════════════════════════════════════════════════════════
   ③ sort — 제한된 칸에 선별
   spec: { bins:[{id,label,cap}], items:[{id,label,best}] }
   ══════════════════════════════════════════════════════════════ */
function tplSort(spec, host, done){
  const bins  = spec.bins || [];
  const items = (spec.items || []).slice();
  const put = {};                        // itemId → binId
  let wrong = 0;

  const ui = shell(host, spec, `
    <div class="mt-items" id="mtItems"></div>
    <div class="mt-bins" id="mtBins"></div>`);
  ui.go.style.display = 'none';

  const itemHost = ui.stage.querySelector('#mtItems');
  const binHost  = ui.stage.querySelector('#mtBins');
  let held = null;

  const countIn = b => Object.values(put).filter(v => v === b).length;

  function paint(){
    itemHost.innerHTML = items.map(it => `
      <button class="mt-item ${put[it.id] ? 'used' : ''} ${held === it.id ? 'held' : ''}"
              data-id="${esc(it.id)}" type="button" ${put[it.id] ? 'disabled' : ''}>${esc(it.label)}</button>`).join('');
    binHost.innerHTML = bins.map(b => `
      <div class="mt-bin">
        <button class="mt-bin-head" data-id="${esc(b.id)}" type="button">
          ${esc(b.label)} <span class="mt-cap">${countIn(b.id)} / ${b.cap}</span>
        </button>
        <ul class="mt-bin-list">${
          items.filter(it => put[it.id] === b.id).map(it => `<li>${esc(it.label)}</li>`).join('')
        }</ul>
      </div>`).join('');

    itemHost.querySelectorAll('.mt-item').forEach(x => onPress(x, () => {
      held = x.dataset.id;
      const it = items.find(i => i.id === held);
      tell(ui, it ? `"${it.label}" 을(를) 들었소.` : '');
      paint();
    }));
    binHost.querySelectorAll('.mt-bin-head').forEach(x => onPress(x, () => drop(x.dataset.id)));

    if (Object.keys(put).length >= Math.min(items.length, bins.reduce((n, b) => n + b.cap, 0))){
      finish(ui, wrong === 0 ? 'clean' : 'rough', spec, done);
    }
  }

  function drop(binId){
    if (!held){ tell(ui, '먼저 하나를 고르시오.'); return; }
    const bin = bins.find(b => b.id === binId);
    const it  = items.find(i => i.id === held);
    if (!bin || !it) return;
    if (countIn(binId) >= bin.cap){ tell(ui, '더 들어가지 않소. 다른 곳을 보시오.'); return; }
    put[it.id] = binId;
    if (it.best && it.best !== binId){ wrong++; tell(ui, it.no || '그리 두면 오래가지 못하오.'); }
    else tell(ui, it.ok || '그럴듯하오.');
    held = null;
    paint();
  }

  onPress(ui.skip, () => finish(ui, Object.keys(put).length ? 'rough' : 'partial', spec, done));
  paint();
}

/* ══════════════════════════════════════════════════════════════
   ④ compare — 두 자료의 차이 찾기
   spec: { left:{art|label}, right:{art|label}, diffs:[{label, text}], decoys:[label] }
   ══════════════════════════════════════════════════════════════ */
function tplCompare(spec, host, done){
  const diffs  = (spec.diffs || []).map((d, i) => ({ ...d, i, got:false }));
  const decoys = (spec.decoys || []).map((l, i) => ({ label:l, i: 1000 + i }));
  const all = shuffle([...diffs, ...decoys]);
  let wrong = 0;

  const ui = shell(host, spec, `
    <div class="mt-cmp">
      <figure class="mt-cmp-side">
        ${spec.left && spec.left.art && hasArt(spec.left.art) ? artSVG(spec.left.art) : ''}
        <figcaption>${esc((spec.left && spec.left.label) || '왼쪽')}</figcaption>
      </figure>
      <figure class="mt-cmp-side">
        ${spec.right && spec.right.art && hasArt(spec.right.art) ? artSVG(spec.right.art) : ''}
        <figcaption>${esc((spec.right && spec.right.label) || '오른쪽')}</figcaption>
      </figure>
    </div>
    <p class="mt-cmp-q">${esc(spec.question || '다른 점을 골라 보시오.')}</p>
    <div class="mt-chips" id="mtPicks"></div>`);
  ui.go.style.display = 'none';

  const picks = ui.stage.querySelector('#mtPicks');
  function paint(){
    picks.innerHTML = all.map(x => {
      const d = diffs.find(y => y.i === x.i);
      return `<button class="mt-chip ${d && d.got ? 'used' : ''}" data-i="${x.i}" type="button"
                ${d && d.got ? 'disabled' : ''}>${esc(x.label)}</button>`;
    }).join('');
    picks.querySelectorAll('.mt-chip').forEach(b => onPress(b, () => pick(+b.dataset.i)));
  }
  function pick(i){
    const d = diffs.find(x => x.i === i);
    if (d){
      if (d.got) return;
      d.got = true;
      tell(ui, d.text || '그렇소.');
      paint();
      if (diffs.every(x => x.got)) finish(ui, wrong === 0 ? 'clean' : 'rough', spec, done);
    } else {
      wrong++;
      tell(ui, spec.wrongSay || '그건 둘 다 그러하오.');
    }
  }
  onPress(ui.skip, () => finish(ui, diffs.some(d => d.got) ? 'rough' : 'partial', spec, done));
  paint();
}

/* ══════════════════════════════════════════════════════════════
   ⑤ decode — 가려진 것 알아내기
   spec: { cells:[{label, hint}], answers:[{label, ok}], reveals }
   칸을 하나씩 열어 단서를 모으고, 적게 열수록 깔끔하다
   ══════════════════════════════════════════════════════════════ */
function tplDecode(spec, host, done){
  const cells = (spec.cells || []).map((c, i) => ({ ...c, i, open:false }));
  const answers = spec.answers || [];
  const budget = spec.reveals || Math.max(2, Math.ceil(cells.length / 2));
  let opened = 0, wrong = 0;

  const ui = shell(host, spec, `
    <div class="mt-grid" id="mtGrid"></div>
    <p class="mt-cmp-q">${esc(spec.question || '무엇에 쓰던 것이겠소?')}</p>
    <div class="mt-chips" id="mtAns"></div>`);
  ui.go.style.display = 'none';

  const grid = ui.stage.querySelector('#mtGrid');
  const ansHost = ui.stage.querySelector('#mtAns');

  function paint(){
    grid.innerHTML = cells.map(c => `
      <button class="mt-cell ${c.open ? 'open' : ''}" data-i="${c.i}" type="button">
        ${c.open ? esc(c.hint) : icon('search', { size:16 })}
      </button>`).join('');
    grid.querySelectorAll('.mt-cell').forEach(b => onPress(b, () => open(+b.dataset.i)));
    ansHost.innerHTML = answers.map((a, i) =>
      `<button class="mt-chip" data-i="${i}" type="button">${esc(a.label)}</button>`).join('');
    ansHost.querySelectorAll('.mt-chip').forEach(b => onPress(b, () => answer(+b.dataset.i)));
    tell(ui, `열어 본 자리 ${opened} / ${budget}`);
  }
  function open(i){
    const c = cells[i];
    if (!c || c.open) return;
    c.open = true; opened++;
    paint();
  }
  function answer(i){
    const a = answers[i];
    if (!a) return;
    if (a.ok) finish(ui, (wrong === 0 && opened <= budget) ? 'clean' : 'rough', spec, done);
    else { wrong++; tell(ui, a.no || '그렇게 보기는 어렵소. 자국을 더 보시오.'); }
  }
  onPress(ui.skip, () => finish(ui, opened ? 'rough' : 'partial', spec, done));
  paint();
}

/* ══════════════════════════════════════════════════════════════
   ⑥ timed — 압박 속 반복 조작
   spec: { seconds, decay, gainPerTap, lowSay, art }
   게이지가 떨어지기 전에 눌러 유지한다. 못 지켜도 끝난다.
   ══════════════════════════════════════════════════════════════ */
function tplTimed(spec, host, done){
  const seconds = Math.min(60, spec.seconds || 22);
  const decay   = spec.decay || 26;          // 초당 떨어지는 양
  const gain    = spec.gainPerTap || 13;

  const ui = shell(host, spec, `
    <div class="mt-timed">
      ${spec.art && hasArt(spec.art) ? `<div class="mt-timed-art">${artSVG(spec.art)}</div>` : ''}
      <div class="mt-gauge"><div class="mt-gauge-fill" id="mtFill"></div></div>
      <button class="mt-tap" id="mtTap" type="button">${esc(spec.tapLabel || '지금 손을 쓰시오')}</button>
      <p class="mt-clock" id="mtClock"></p>
    </div>`);
  ui.go.style.display = 'none';

  const fill  = ui.stage.querySelector('#mtFill');
  const clock = ui.stage.querySelector('#mtClock');
  const tap   = ui.stage.querySelector('#mtTap');

  let level = 72, left = seconds, low = 0, ended = false, raf = 0, prev = performance.now();

  onPress(tap, () => {
    if (ended) return;
    level = Math.min(100, level + gain);
    paint();
  });

  function paint(){
    fill.style.width = Math.max(0, level).toFixed(1) + '%';
    fill.classList.toggle('weak', level < 30);
    clock.textContent = Math.max(0, Math.ceil(left)) + '초';
  }

  function step(now){
    if (ended) return;
    const dt = Math.min(.05, (now - prev) / 1000);
    prev = now;
    left -= dt;
    level -= decay * dt;
    if (level < 25){ low += dt; tell(ui, spec.lowSay || '꺼져 가오. 서두르시오.'); }
    else if (level > 60) tell(ui, '');
    if (level <= 0){ level = 0; }
    paint();
    if (left <= 0){ end(); return; }
    raf = requestAnimationFrame(step);
  }
  function end(){
    ended = true;
    cancelAnimationFrame(raf);
    tap.disabled = true;
    // 꺼뜨린 시간이 길수록 자국이 남는다. 게임 오버는 없다.
    finish(ui, low < 2 ? 'clean' : 'rough', spec, done);
  }

  onPress(ui.skip, () => { ended = true; cancelAnimationFrame(raf); finish(ui, 'partial', spec, done); });
  paint();
  raf = requestAnimationFrame(step);
}

/* ── 도구 ────────────────────────────────────────────────────── */
function shuffle(a){
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const TEMPLATES = {
  restore:  tplRestore,
  sequence: tplSequence,
  sort:     tplSort,
  compare:  tplCompare,
  decode:   tplDecode,
  timed:    tplTimed
};
export const TEMPLATE_NAMES = Object.keys(TEMPLATES);

/** 템플릿 하나를 돌린다. 모르는 이름이면 아무 것도 하지 않고 넘긴다 */
export function runTemplate(spec, host, done){
  const fn = TEMPLATES[spec && spec.tpl];
  if (!fn){ done({ quality:'partial' }); return; }
  fn(spec, host, done);
}
