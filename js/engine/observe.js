// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   observe.js — 유물 관찰 미션 (요청서 §4)

   절대 규칙
     이름을 먼저 알려주지 않는다. 이름을 아는 순간 관찰이 멈추기 때문이다.
       자료 제시 → 질문 → 아이가 관찰 지점을 찾음 → 그제서야 이름과 설명 공개

   세 갈래 (§4-2)
     clue   만들기 전. 만드는 법·쓰는 법을 자료에서 알아낸다
     match  만든 뒤. 내가 만든 것과 실물을 견준다
     trace  닳고 깨진 자국으로 쓰임을 되짚는다
     compare 두 자료를 나란히 놓고 다른 점을 찾는다

   지키는 것
     · 관찰 지점의 자리를 미리 표시하지 않는다
     · 전부 찾을 필요는 없다 (needed 만 채우면 통과)
     · 오래 못 찾으면 힌트가 흐릿하게 밝혀진다 — 막히는 일은 없다
     · 자료마다 출처와 이용 조건을 화면 아래에 적는다 (§10)
     · 실물 사진이 아닌 그림은 그렇다고 밝힌다 (§4-4)

   계약:  runObserve(spec, host, done)   done({ ok:true, found:[...], note })
   ══════════════════════════════════════════════════════════════════════ */
import { artSVG, hasArt } from './artifact-art.js';
import { icon } from './icons.js';
import { onPress } from './minigames.js';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const HINT_AFTER_MS = 22000;   // 이만큼 못 찾으면 힌트를 밝힌다
const HINT_AFTER_MISS = 6;     // 헛클릭이 이만큼 쌓여도 밝힌다

const MODE_TAG = {
  clue:    '단서 찾기',
  match:   '내 것과 견주기',
  trace:   '남은 자국 읽기',
  compare: '두 자료 견주기'
};

/** 자료 한 장(사진이면 사진, 없으면 그림) */
function plate(spec, side){
  const photo = side === 2 ? spec.photo2 : spec.photo;
  const art   = side === 2 ? spec.art2   : spec.art;

  if (photo && photo.src){
    return `<div class="ob-plate" data-side="${side}">
      <img class="ob-img" src="${esc(photo.src)}" alt="" draggable="false">
      <div class="ob-marks"></div>
    </div>`;
  }
  if (art && hasArt(art)){
    return `<div class="ob-plate is-art" data-side="${side}">
      ${artSVG(art)}
      <div class="ob-marks"></div>
    </div>`;
  }
  return `<div class="ob-plate" data-side="${side}"><p class="ob-missing">자료를 준비하지 못했소.</p></div>`;
}

/** 자료 아래 한 줄 — 출처와 이용 조건. 그림이면 그림이라고 밝힌다 */
function creditLine(spec, side){
  const photo = side === 2 ? spec.photo2 : spec.photo;
  const art   = side === 2 ? spec.art2   : spec.art;

  if (photo && photo.src){
    const bits = [photo.source, photo.author, photo.license].filter(Boolean);
    // 출처를 모르는 사진은 애초에 자료로 쓰지 않는다 (docs/07-ASSETS.md)
    return bits.length
      ? `<p class="ob-credit">사진 · ${esc(bits.join(' · '))}</p>`
      : `<p class="ob-credit ob-credit-warn">출처가 확인되지 않은 사진입니다</p>`;
  }
  if (art && hasArt(art)){
    return `<p class="ob-credit">실물 사진이 아니라 특징을 살려 그린 그림이오</p>`;
  }
  return '';
}

export function runObserve(spec, host, done){
  const points = (spec.points || []).map((p, i) => ({
    i, at: p.at, r: p.r || 8, text: p.text, side: p.side || 1, found: false
  }));
  const needed = Math.max(1, Math.min(spec.needed || 2, points.length));
  const two = spec.mode === 'compare' || !!(spec.photo2 || spec.art2);

  host.innerHTML = `
    <div class="ob">
      <div class="ob-head">
        <span class="ob-tag">${esc(MODE_TAG[spec.mode] || '관찰')}</span>
        <p class="ob-q">${esc(spec.question || '무엇이 보이오?')}</p>
      </div>

      <div class="ob-stage ${two ? 'is-two' : ''}" id="obStage">
        <div class="ob-pane">
          ${plate(spec, 1)}
          ${creditLine(spec, 1)}
        </div>
        ${two ? `<div class="ob-pane">${plate(spec, 2)}${creditLine(spec, 2)}</div>` : ''}
      </div>

      <div class="ob-bar">
        <div class="ob-zoom">
          <button class="ob-zbtn" id="obOut" type="button" aria-label="작게">${icon('close', { size:12 })}</button>
          <span class="ob-zlabel" id="obZ">1.0배</span>
          <button class="ob-zbtn" id="obIn" type="button" aria-label="크게">${icon('search', { size:14 })}</button>
        </div>
        <p class="ob-prog" id="obProg"></p>
      </div>

      <ul class="ob-notes" id="obNotes"></ul>
      <p class="ob-help" id="obHelp">자료를 눌러 눈에 띄는 곳을 짚어 보시오. 크게 볼 수도 있소.</p>

      <div class="ob-reveal" id="obReveal" hidden></div>
      <button class="q-next" id="obNext" type="button" hidden></button>
    </div>`;

  const stage  = host.querySelector('#obStage');
  const progEl = host.querySelector('#obProg');
  const notes  = host.querySelector('#obNotes');
  const helpEl = host.querySelector('#obHelp');

  /* 팝업 안에 내용이 늘어 스크롤이 길어질 때, 방금 늘어난 곳까지 부드럽게 따라가 준다 */
  function scrollToNew(){
    const card = host.closest('.quest-card, .exmini-card, .event-card');
    if (card) card.scrollTo({ top: card.scrollHeight, behavior: 'smooth' });
  }
  const zEl    = host.querySelector('#obZ');

  let zoom = 1, panX = 0, panY = 0, misses = 0, hinted = false, finished = false;

  /* ── 확대·이동 ─────────────────────────────────────────────── */
  const plates = [...host.querySelectorAll('.ob-plate')];
  function applyZoom(){
    plates.forEach(p => {
      const inner = p.querySelector('.ob-img, .ob-art');
      if (inner) inner.style.transform = `scale(${zoom}) translate(${panX}px, ${panY}px)`;
      const marks = p.querySelector('.ob-marks');
      if (marks) marks.style.transform = `scale(${zoom}) translate(${panX}px, ${panY}px)`;
    });
    zEl.textContent = zoom.toFixed(1) + '배';
  }
  const setZoom = v => {
    const next = Math.max(1, Math.min(4, v));
    if (next === 1){ panX = 0; panY = 0; }
    zoom = next;
    applyZoom();
  };
  onPress(host.querySelector('#obIn'),  () => setZoom(zoom + .5));
  onPress(host.querySelector('#obOut'), () => setZoom(zoom - .5));

  stage.addEventListener('wheel', e => {
    e.preventDefault();
    setZoom(zoom + (e.deltaY > 0 ? -.3 : .3));
  }, { passive:false });

  /* 손가락 두 개로 벌리기 */
  let pinch = null;
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') return;
    if (!pinch) pinch = { ids:[e.pointerId], d0:0, z0:zoom };
    else if (pinch.ids.length === 1) pinch.ids.push(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!pinch || pinch.ids.length < 2) return;
    e.preventDefault();
  }, { passive:false });
  const endPinch = () => { pinch = null; };
  stage.addEventListener('pointerup', endPinch);
  stage.addEventListener('pointercancel', endPinch);

  /* ── 관찰 지점 찾기 ──────────────────────────────────────────
     좌표는 자료(사진·그림) 기준으로 적는다.

     틀은 정사각형인데 사진은 그렇지 않다. object-fit:contain 이라
     사진은 틀 안에서 위아래(또는 좌우)에 여백을 두고 놓인다.
     그 여백을 셈에 넣지 않으면, 그림에 맞춰 찍은 자리가 사진에서는
     어긋난다. 여기서 자료가 실제로 그려진 네모를 구해 옮겨 준다. */
  function markHost(side){
    return host.querySelector(`.ob-plate[data-side="${side}"] .ob-marks`);
  }

  /** 틀 안에서 자료가 실제로 차지하는 네모 (틀 크기에 대한 비율 0~1) */
  function fitBox(pl){
    const el = pl.querySelector('.ob-img, .ob-art');
    const r = pl.getBoundingClientRect();
    if (!el || !r.width || !r.height) return { x:0, y:0, w:1, h:1 };

    // 사진은 실제 화소 비율, 그림(SVG)은 viewBox 비율
    let nw = el.naturalWidth || 0, nh = el.naturalHeight || 0;
    if (!nw && el.viewBox && el.viewBox.baseVal){
      nw = el.viewBox.baseVal.width; nh = el.viewBox.baseVal.height;
    }
    if (!nw || !nh) return { x:0, y:0, w:1, h:1 };

    const s = Math.min(r.width / nw, r.height / nh);       // contain
    const w = nw * s / r.width, h = nh * s / r.height;
    return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
  }

  function paintProgress(){
    const n = points.filter(p => p.found).length;
    progEl.textContent = `${n} / ${needed} 군데를 찾았소`;
    if (n >= needed && !finished) pass();
  }

  function addNote(p){
    const li = document.createElement('li');
    li.className = 'ob-note';
    li.innerHTML = `<span class="ob-note-i">${icon('eye', { size:14 })}</span><span></span>`;
    li.querySelector('span:last-child').textContent = p.text;
    notes.appendChild(li);
    scrollToNew();
  }

  function reveal(p){
    const pl = host.querySelector(`.ob-plate[data-side="${p.side}"]`);
    const mh = markHost(p.side);
    if (mh && pl){
      const b = fitBox(pl);
      const dot = document.createElement('span');
      dot.className = 'ob-mark';
      dot.style.left = ((b.x + p.at[0] / 100 * b.w) * 100).toFixed(2) + '%';
      dot.style.top  = ((b.y + p.at[1] / 100 * b.h) * 100).toFixed(2) + '%';
      dot.innerHTML = icon('check', { size:12 });
      mh.appendChild(dot);
    }
    addNote(p);
    paintProgress();
  }

  plates.forEach(pl => {
    pl.addEventListener('click', e => {
      if (finished) return;
      const r = pl.getBoundingClientRect();
      const side = +pl.dataset.side;
      // 확대를 되돌려 틀 안의 비율로, 다시 자료 안의 비율(%)로 바꾼다
      const fx = ((e.clientX - r.left) / r.width  - .5) / zoom + .5;
      const fy = ((e.clientY - r.top)  / r.height - .5) / zoom + .5;
      const b = fitBox(pl);
      if (fx < b.x || fx > b.x + b.w || fy < b.y || fy > b.y + b.h) return;   // 여백은 자료가 아니다
      const x = (fx - b.x) / b.w * 100;
      const y = (fy - b.y) / b.h * 100;

      const hit = points.find(p => !p.found && p.side === side &&
        Math.hypot(p.at[0] - x, p.at[1] - y) <= p.r);

      if (hit){
        hit.found = true;
        misses = 0;
        helpEl.textContent = '그렇소. 눈여겨보았구려.';
        reveal(hit);
      } else {
        misses++;
        helpEl.textContent = '거기에는 별다른 것이 없소. 다른 곳도 보시오.';
        if (misses >= HINT_AFTER_MISS) showHint();
      }
    });
  });

  /* 막히지 않게 — 오래 못 찾으면 남은 자리를 흐릿하게 밝힌다 */
  function showHint(){
    if (hinted || finished) return;
    const rest = points.filter(p => !p.found);
    if (!rest.length) return;
    hinted = true;
    const p = rest[0];
    const pl = host.querySelector(`.ob-plate[data-side="${p.side}"]`);
    const mh = markHost(p.side);
    if (mh && pl){
      const b = fitBox(pl);
      const g = document.createElement('span');
      g.className = 'ob-glow';
      g.style.left = ((b.x + p.at[0] / 100 * b.w) * 100).toFixed(2) + '%';
      g.style.top  = ((b.y + p.at[1] / 100 * b.h) * 100).toFixed(2) + '%';
      g.style.width = g.style.height = (p.r * 2.6 * b.w) + '%';
      mh.appendChild(g);
    }
    helpEl.textContent = '이쯤을 보시오. 무언가 있소.';
  }
  const hintTimer = setTimeout(showHint, HINT_AFTER_MS);

  /* ── 통과 — 여기서야 이름을 밝힌다 ────────────────────────── */
  function pass(){
    finished = true;
    clearTimeout(hintTimer);
    helpEl.textContent = '';

    const rv = spec.reveal;
    const box = host.querySelector('#obReveal');
    if (rv && spec.revealAfter !== false){
      box.hidden = false;
      box.innerHTML = `
        <p class="ob-rv-tag">이제 이름을 알려 주겠소</p>
        <h3 class="ob-rv-name"></h3>
        <p class="ob-rv-body"></p>
        ${rv.cite ? `<p class="ob-rv-cite"></p>` : ''}`;
      box.querySelector('.ob-rv-name').textContent = rv.name || '';
      box.querySelector('.ob-rv-body').textContent = rv.body || '';
      if (rv.cite) box.querySelector('.ob-rv-cite').textContent = rv.cite;
    }

    const btn = host.querySelector('#obNext');
    btn.hidden = false;
    btn.classList.add('on');
    btn.textContent = '알겠소 →';
    scrollToNew();
    onPress(btn, () => done({
      ok: true,
      found: points.filter(p => p.found).map(p => p.text),
      note: spec.note || (rv && rv.name) || ''
    }));
  }

  paintProgress();
  applyZoom();
}
