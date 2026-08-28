// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   ui.js — 퀘스트 모달 · 조사 패널 · NPC · 가방 · 시대 완료

   문체 (설계 §1) — 탐험 모드는 하오체.
   공용 카드 클래스만 쓴다 (§8-4). 새 카드 스타일을 만들지 않는다.
   ══════════════════════════════════════════════════════════════════════ */
import { ST, questState, isDone, markDone, foundCount, totalCount,
         collectContent, bumpAxis, logAnswer, Store, saveQuestState } from './state.js';
import { catColor, catLabel, SAY } from './constants.js';
import { runMinigame, onPress, MINIGAME_LABELS } from './minigames.js';
import { setAnim } from './anim.js';
import { onQuestDone, esc } from './collect.js';
import { refreshMarkerStates } from './markers.js';

let hooks = {};            // { onGate, onEraComplete, onRankUp, refreshRail }

export function initUI(h){ hooks = h || {}; }

/* ── 토스트 ──────────────────────────────────────────────────── */
let toastTimer = 0;
export function showToast(msg){
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2600);
}

export function showHint(msg){
  const el = document.getElementById('exHint');
  if (!el) return;
  if (!msg){ el.classList.remove('on'); return; }
  el.textContent = msg;
  el.classList.add('on');
}

/* ── 모달 열고 닫기 ──────────────────────────────────────────── */
function openModal(){
  document.getElementById('exScrim').classList.add('on');
  document.getElementById('questModal').classList.add('on');
  ST.questOpen = true;
}
export function closeQuest(){
  document.getElementById('exScrim').classList.remove('on');
  document.getElementById('questModal').classList.remove('on');
  ST.questOpen = false;
  ST.activeMarker = null;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && ST.questOpen) closeQuest();
});

/* ── 공용 조각 ───────────────────────────────────────────────── */
function head(q){
  const col = q.kind === 'gate' ? '#6E9B94' : catColor(q.cat);
  return `<div class="q-head">
    <div class="q-mi" style="background:${col}22">${q.icon || '📌'}</div>
    <div>
      <span class="q-tag" style="background:${col}">${esc(q.kind === 'gate' ? '길목' : catLabel(q.cat))}</span>
      <h2 class="q-title">${esc(q.title)}</h2>
    </div>
  </div>`;
}

function photoBlock(imgs){
  if (!imgs || !imgs.length) return '';
  const file = imgs[0];
  const src = /^(assets|data:|https?:)/.test(file) ? file : `assets/photos/${file}`;
  const credit = (window.AtlasCredits && window.AtlasCredits.creditLine)
    ? window.AtlasCredits.creditLine(file) : '';
  return `<img class="q-photo" src="${esc(src)}" alt="" onerror="this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.style.display='none')">
          <p class="q-photo-credit">${esc(credit)}</p>`;
}

function choicesHTML(list){
  return `<div class="q-choices">${
    list.map((c, i) => `<button class="q-choice" data-i="${i}" type="button">
        <span class="n">${i + 1}</span><span>${esc(typeof c === 'string' ? c : c.label)}</span>
      </button>`).join('')
  }</div>`;
}

function fb(card, kind, text){
  const el = card.querySelector('#qFb');
  if (!el) return;
  el.className = 'q-fb on ' + kind;
  el.textContent = text || '';
}

function nextBtn(card, label, fn){
  const b = card.querySelector('#qNext');
  if (!b) return;
  b.textContent = label;
  b.classList.add('on');
  const fresh = b.cloneNode(true);
  b.replaceWith(fresh);
  onPress(fresh, fn);
}

/* ══════════════════════════════════════════════════════════════
   퀘스트 열기
   ══════════════════════════════════════════════════════════════ */
export function openQuest(q){
  if (!q) return;
  const card = document.getElementById('questCard');
  ST.activeMarker = q;

  if (q.kind === 'gate')            renderGate(q, card);
  else if (q.kind === 'choice')     renderChoice(q, card);
  else if (q.kind === 'inspect')    renderInspect(q, card);
  else if (q.stages && q.stages.length) renderStages(q, card);
  else                              renderRole(q, card);

  // 사진은 눌러서 크게 볼 수 있다
  const ph = card.querySelector('.q-photo');
  if (ph) ph.addEventListener('click', () => ph.classList.toggle('zoom'));

  openModal();
}

/* ── ① 역할 선택 (기본형) · ④ 미니게임 ─────────────────────── */
function renderRole(q, card){
  const isMini = q.kind === 'minigame' || !!q.mini;
  const done = isDone(q.id);

  card.innerHTML = `
    ${head(q)}
    ${photoBlock(q.img)}
    ${q.story ? `<div class="q-story">${esc(q.story)}</div>` : ''}
    ${done && q.recap ? `<div class="q-story" style="opacity:.85">${esc(q.recap)}</div>` : ''}
    <button class="q-reveal" id="qReveal" type="button">이제 어찌하겠소? →</button>
    <div class="q-quiz-wrap" id="qWrap">
      <p class="q-q" id="qText"></p>
      <div id="qChoiceHost"></div>
      <div class="q-fb" id="qFb"></div>
      <div id="qMiniHost"></div>
    </div>
    <button class="q-next" id="qNext" type="button"></button>`;

  const reveal = card.querySelector('#qReveal');
  const wrap = card.querySelector('#qWrap');
  onPress(reveal, () => { reveal.style.display = 'none'; wrap.classList.add('on'); askQ(); });

  if (!q.q){ reveal.style.display = 'none'; wrap.classList.add('on'); afterCorrect(); return; }

  let tries = 0;

  function askQ(){
    card.querySelector('#qText').textContent = q.q.text || '';
    const host = card.querySelector('#qChoiceHost');
    host.innerHTML = choicesHTML(q.q.choices || []);
    host.querySelectorAll('.q-choice').forEach(b => onPress(b, () => pick(+b.dataset.i, b, host)));
  }

  function pick(i, el, host){
    tries++;
    const ok = i === q.q.correct;
    logAnswer({ world: ST.WORLD_ID, questId: q.id, title: q.title,
                question: q.q.text, answer: (q.q.choices || [])[i], correct: ok, tries, kind:'choice' });
    if (ok){
      el.classList.add('correct');
      host.querySelectorAll('.q-choice').forEach(b => b.disabled = true);
      fb(card, 'ok', q.q.ok || '그러하오.');
      setAnim('cheer');
      afterCorrect();
    } else {
      el.classList.add('wrong');
      setTimeout(() => el.classList.remove('wrong'), 700);
      fb(card, 'no', q.q.no || '다시 헤아려 보시오.');
      setAnim('tilt');
    }
  }

  function afterCorrect(){
    if (isMini && q.mini){
      nextBtn(card, q.mini.startLabel || '해 보겠소 →', () => {
        card.querySelector('#qNext').classList.remove('on');
        const host = card.querySelector('#qMiniHost');
        runMinigame(q.mini, host, ok => {
          if (ok){
            bumpAxis('challenge', 1);
            fb(card, 'ok', q.mini.ok || '해내었소.');
            host.innerHTML = '';
            complete(q, card);
          } else {
            fb(card, 'neutral', q.mini.retry || '이번에는 안 되었소. 다시 해 보아도 좋소.');
            host.innerHTML = '';
            nextBtn(card, '다시 해 보겠소', () => {
              card.querySelector('#qNext').classList.remove('on');
              runMinigame(q.mini, host, ok2 => {
                if (ok2){ bumpAxis('challenge', 1); fb(card, 'ok', q.mini.ok || '해내었소.'); host.innerHTML=''; complete(q, card); }
                else { host.innerHTML = ''; fb(card, 'neutral', '괜찮소. 다음 길로 가도 되오.'); complete(q, card); }
              });
            });
          }
        });
      });
    } else {
      complete(q, card);
    }
  }
}

/* ── ② 열린 선택 — 정답이 없다 ──────────────────────────────── */
function renderChoice(q, card){
  card.innerHTML = `
    ${head(q)}
    ${photoBlock(q.img)}
    ${q.setup ? `<div class="q-story">${esc(q.setup)}</div>` : ''}
    <p class="q-q">${esc(q.prompt || '그대는 어찌하겠소?')}</p>
    <div id="qChoiceHost"></div>
    <div class="q-fb" id="qFb"></div>
    <div class="q-outcome" id="qOut" style="display:none"></div>
    <button class="q-next" id="qNext" type="button"></button>`;

  const host = card.querySelector('#qChoiceHost');
  host.innerHTML = choicesHTML(q.choices || []);
  host.querySelectorAll('.q-choice').forEach(b => onPress(b, () => {
    const i = +b.dataset.i;
    const c = (q.choices || [])[i];
    host.querySelectorAll('.q-choice').forEach(x => { x.disabled = true; if (x !== b) x.style.opacity = '.45'; });
    b.classList.add('correct');
    const out = card.querySelector('#qOut');
    out.style.display = 'block';
    out.textContent = c.outcome || '';
    bumpAxis('story', 1);
    logAnswer({ world: ST.WORLD_ID, questId: q.id, title: q.title,
                question: q.prompt, answer: c.label, correct: null, tries: 1, kind:'choice-open' });
    if (q.epilogue) fb(card, 'neutral', q.epilogue);
    complete(q, card);
  }));
}

/* ── ③ 조사형 ───────────────────────────────────────────────── */
function renderInspect(q, card){
  const hs = q.hotspots || [];
  card.innerHTML = `
    ${head(q)}
    ${photoBlock(q.img)}
    ${q.story ? `<div class="q-story">${esc(q.story)}</div>` : ''}
    <div class="q-hotspots" id="qHots"></div>
    <p class="q-progress" id="qProg"></p>
    <div id="qCapHost"></div>
    <div class="q-fb" id="qFb"></div>
    <button class="q-next" id="qNext" type="button"></button>`;

  const host = card.querySelector('#qHots');
  const prog = card.querySelector('#qProg');
  const seen = new Set();
  setAnim('look');

  function paint(){
    host.innerHTML = hs.map((h, i) => `
      <button class="q-hot ${seen.has(i) ? 'seen' : ''}" data-i="${i}" type="button">
        <span class="hot-i">${seen.has(i) ? '✓' : '🔍'}</span><span>${esc(h.label)}</span>
      </button>
      ${seen.has(i) ? `<div class="q-hot-note">${h.note || ''}</div>` : ''}`).join('');
    host.querySelectorAll('.q-hot').forEach(b => onPress(b, () => {
      const i = +b.dataset.i;
      if (!seen.has(i)){ seen.add(i); bumpAxis('observe', 1); }
      paint();
    }));
    prog.textContent = `${seen.size} / ${hs.length} 가지를 살펴보았소`;
    if (seen.size >= hs.length) openCap();
  }

  let capOpen = false;
  function openCap(){
    if (capOpen) return;
    capOpen = true;
    if (!q.capstone){ complete(q, card); return; }
    const cap = q.capstone;
    const capHost = card.querySelector('#qCapHost');
    capHost.innerHTML = `<p class="q-q">${esc(cap.text)}</p><div id="capChoices"></div>`;
    const ch = capHost.querySelector('#capChoices');
    ch.innerHTML = choicesHTML(cap.choices || []);
    let tries = 0;
    ch.querySelectorAll('.q-choice').forEach(b => onPress(b, () => {
      const i = +b.dataset.i;
      tries++;
      const ok = i === cap.correct;
      logAnswer({ world: ST.WORLD_ID, questId: q.id, title: q.title,
                  question: cap.text, answer: (cap.choices || [])[i], correct: ok, tries, kind:'capstone' });
      if (ok){
        b.classList.add('correct');
        ch.querySelectorAll('.q-choice').forEach(x => x.disabled = true);
        fb(card, 'ok', cap.ok || '그러하오.');
        setAnim('cheer');
        complete(q, card);
      } else {
        b.classList.add('wrong');
        setTimeout(() => b.classList.remove('wrong'), 700);
        fb(card, 'no', cap.no || '다시 살펴보시오.');
        setAnim('tilt');
      }
    }));
  }
  paint();
}

/* ── 여러 단계 전투 (stages) ────────────────────────────────── */
function renderStages(q, card){
  let at = 0;
  const stages = q.stages;

  function draw(){
    const s = stages[at];
    card.innerHTML = `
      ${head(q)}
      ${q.warTag ? `<p class="mg-tag">${esc(q.warTag)} · ${at + 1} / ${stages.length}</p>` : ''}
      <div class="q-story">${esc(s.story || '')}</div>
      <p class="q-q">${esc(s.q ? s.q.text : '')}</p>
      <div id="qChoiceHost"></div>
      <div class="q-fb" id="qFb"></div>
      <button class="q-next" id="qNext" type="button"></button>`;
    const host = card.querySelector('#qChoiceHost');
    if (!s.q){ step(); return; }
    host.innerHTML = choicesHTML(s.q.choices || []);
    let tries = 0;
    host.querySelectorAll('.q-choice').forEach(b => onPress(b, () => {
      const i = +b.dataset.i, ok = i === s.q.correct;
      tries++;
      logAnswer({ world: ST.WORLD_ID, questId: q.id + ':' + at, title: q.title,
                  question: s.q.text, answer: (s.q.choices || [])[i], correct: ok, tries, kind:'stage' });
      if (ok){
        b.classList.add('correct');
        host.querySelectorAll('.q-choice').forEach(x => x.disabled = true);
        fb(card, 'ok', s.q.ok || '');
        setAnim('cheer');
        step();
      } else {
        b.classList.add('wrong');
        setTimeout(() => b.classList.remove('wrong'), 700);
        fb(card, 'no', s.q.no || '다시 판단하시오.');
        setAnim('tilt');
      }
    }));
  }
  function step(){
    at++;
    if (at < stages.length){
      nextBtn(card, q.warNextLabel || '다음 싸움으로 →', draw);
    } else {
      nextBtn(card, q.warDoneLabel || '싸움을 마치다', () => complete(q, card, true));
    }
  }
  draw();
}

/* ── ⑤ 관문 ─────────────────────────────────────────────────── */
function renderGate(q, card){
  card.innerHTML = `
    ${head(q)}
    <div class="q-story">${esc(q.confirm || SAY.gateConfirm)}</div>
    <button class="q-next on" id="qGo" type="button">떠나겠소 →</button>
    <button class="q-reveal" id="qStay" type="button" style="margin-top:10px">조금 더 머물겠소</button>`;
  onPress(card.querySelector('#qGo'), () => {
    setAnim('wave');
    closeQuest();
    if (hooks.onGate) hooks.onGate(q.to, q);
  });
  onPress(card.querySelector('#qStay'), closeQuest);
}

/* ── ⑥ 수집형 — 아이템을 밟았을 때 ──────────────────────────── */
export function pickFindItem(group){
  const q = group.userData.findOf;
  const it = group.userData.item;
  const key = 'find:' + q.id + ':' + it.id;
  if (questState[key] === 'done') return;
  questState[key] = 'done';
  saveQuestState();
  group.userData.got = true;
  group.userData.sprite.material.opacity = .3;
  bumpAxis('collect', 1);
  setAnim('cheer');

  const all = (q.items || []).every(x => questState['find:' + q.id + ':' + x.id] === 'done');
  showToast(`✨ ${it.label || '무언가'}를 주웠소`);
  if (all){
    showToast(q.doneMsg || '다 모았소!');
    finishQuest(q);
  }
}

/* ══════════════════════════════════════════════════════════════
   완료 처리
   ══════════════════════════════════════════════════════════════ */
function complete(q, card, immediate){
  const label = q.kind === 'inspect' ? '잘 보았소 →' : '알겠소 →';
  if (immediate){ finishQuest(q); closeQuest(); return; }
  nextBtn(card, label, () => { finishQuest(q); closeQuest(); });
}

export function finishQuest(q){
  const fresh = markDone(q.id);
  if (q.contentId) collectContent(q.contentId, showToast);
  if (fresh){
    const areaName = (ST.AREAS[q.area] && ST.AREAS[q.area].name) || q.area || '';
    const worldName = (ST.currentWorld && ST.currentWorld.name) || ST.WORLD_ID;
    onQuestDone(ST.WORLD_ID, q, areaName, worldName);
    checkRankUp();
  }
  refreshMarkerStates();
  updateCounter();
  if (hooks.refreshRail) hooks.refreshRail();

  const total = totalCount();
  if (total > 0 && foundCount() >= total && hooks.onEraComplete) hooks.onEraComplete();
}

let lastRank = -1;
export function checkRankUp(){
  if (!Store) return;
  const r = Store.currentRank();
  if (lastRank < 0){ lastRank = r.index; return; }
  if (r.index > lastRank){
    lastRank = r.index;
    setAnim('cheer');
    showToast(`${r.icon} ${SAY.rankUp(r.name)}`);
  }
}
export function primeRank(){ if (Store) lastRank = Store.currentRank().index; }

export function updateCounter(){
  const n = document.getElementById('exFoundN');
  const t = document.getElementById('exFoundT');
  if (n) n.textContent = foundCount();
  if (t) t.textContent = totalCount();
}

/* ══════════════════════════════════════════════════════════════
   NPC 말풍선
   ══════════════════════════════════════════════════════════════ */
export function talkToNPC(group, camera, canvas){
  const lines = group.userData.npcLines || [];
  if (!lines.length) return;
  if (ST.npcDialogueFor !== group){ ST.npcDialogueFor = group; ST.npcLineIdx = 0; }
  else ST.npcLineIdx = (ST.npcLineIdx + 1) % lines.length;

  const el = document.getElementById('npcBubble');
  if (!el) return;
  el.textContent = lines[ST.npcLineIdx];
  el.classList.add('on');
  bumpAxis('story', 1);
  positionBubble(group, camera, canvas);
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 4200);
}

export function positionBubble(group, camera, canvas){
  const el = document.getElementById('npcBubble');
  if (!el || !el.classList.contains('on') || !group) return;
  const v = group.position.clone();
  v.y += 2.7;
  v.project(camera);
  const r = canvas.getBoundingClientRect();
  const x = (v.x * .5 + .5) * r.width;
  const y = (-v.y * .5 + .5) * r.height;
  el.style.left = Math.round(x - el.offsetWidth / 2) + 'px';
  el.style.top = Math.round(y - el.offsetHeight - 8) + 'px';
}

/* ══════════════════════════════════════════════════════════════
   역사 가방 (탐험 모드)
   ══════════════════════════════════════════════════════════════ */
export function renderBag(){
  const body = document.getElementById('bagBody');
  if (!body) return;
  const CONTENT = window.CONTENT || [];
  const ids = Store ? Store.bagList() : [];
  if (!ids.length){
    body.innerHTML = '<p class="muted">아직 담은 것이 없소. 임무를 마치면 하나씩 들어오오.</p>';
    return;
  }
  const items = ids.map(id => CONTENT.find(c => c.id === id)).filter(Boolean);
  body.innerHTML = `<div class="item-list">${items.map(c => {
    const col = catColor((c.cat || [])[0]);
    return `<div class="item-row got">
      <span class="item-bar" style="background:${col}"></span>
      <span class="item-txt"><b>${esc(c.t)}</b><span>${esc(c.d || '')}</span></span>
    </div>`;
  }).join('')}</div>`;
}

export function openBag(){
  renderBag();
  document.getElementById('exScrim2').classList.add('on');
  document.getElementById('bagSheet').classList.add('on');
}
export function closeBag(){
  document.getElementById('exScrim2').classList.remove('on');
  document.getElementById('bagSheet').classList.remove('on');
}

/* ══════════════════════════════════════════════════════════════
   시대 완료
   ══════════════════════════════════════════════════════════════ */
export function showEraComplete(world){
  const c = world && world.complete;
  document.getElementById('eccEyebrow').textContent = world ? (world.eyebrow || '') : '';
  document.getElementById('eccTitle').textContent = (c && c.title) || '시대를 마쳤소!';
  document.getElementById('eccBody').textContent = (c && c.body) || '';
  document.getElementById('eraCompleteScrim').classList.add('on');
  document.getElementById('eraCompleteModal').classList.add('on');
  setAnim('cheer');
}
export function hideEraComplete(){
  document.getElementById('eraCompleteScrim').classList.remove('on');
  document.getElementById('eraCompleteModal').classList.remove('on');
}

/* ══════════════════════════════════════════════════════════════
   임무 목록 (오른쪽 레일)
   ══════════════════════════════════════════════════════════════ */
export function renderRail(onPick){
  const list = document.getElementById('exRailList');
  if (!list) return;
  const qs = ST.QUESTS.filter(q => !q.area || q.area === ST.currentArea);
  list.innerHTML = qs.map(q => `
    <button class="rail-item ${isDone(q.id) ? 'done' : ''}" data-id="${esc(q.id)}" type="button">
      <span class="ri-icon">${q.icon || '📌'}</span><span>${esc(q.title)}</span>
    </button>`).join('');
  list.querySelectorAll('.rail-item').forEach(b => onPress(b, () => {
    const q = ST.QUESTS.find(x => x.id === b.dataset.id);
    if (q && onPick) onPick(q);
  }));
}

export { MINIGAME_LABELS };
