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
import { setAuraDone } from './scene-helpers.js';
import { icon, iconForQuest, stripEmoji } from './icons.js';
import { pushPopup, popPopup, anyOpen, closeTop } from './popups.js';

let hooks = {};            // { onGate, onEraComplete, onRankUp, refreshRail }

export function initUI(h){
  hooks = h || {};

  /* 임무 카드는 다시 그릴 때마다 속이 통째로 바뀐다.
     닫기 단추는 카드 자체에 한 번만 걸어 둔다 (요구 4) */
  const card = document.getElementById('questCard');
  if (card) card.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('.q-x')) closeQuest();
  });
}

/* 학생이 쓴 글을 검사하는 금칙어 목록 (js/profanity.js) */
const WORDS = (typeof window !== 'undefined' && window.AtlasWords) || null;

/* ── 토스트 ──────────────────────────────────────────────────────
   줄을 세운다. 앞의 말이 채 읽히기도 전에 덮이지 않게 (요구 3·수집형) */
let toastTimer = 0;
const toastQueue = [];
let toastBusy = false;

export function showToast(msg){
  const text = stripEmoji(msg);        // 자료에 남은 이모지는 화면에 내보내지 않는다
  if (!text) return;
  toastQueue.push(text);
  if (!toastBusy) nextToast();
}

function nextToast(){
  const el = document.getElementById('toast');
  if (!el){ toastQueue.length = 0; toastBusy = false; return; }
  const text = toastQueue.shift();
  if (text == null){ toastBusy = false; el.classList.remove('on'); return; }

  toastBusy = true;
  el.textContent = text;
  el.classList.add('on');
  clearTimeout(toastTimer);
  const wait = toastQueue.length ? 1700 : 2600;
  toastTimer = setTimeout(() => {
    el.classList.remove('on');
    if (toastQueue.length) setTimeout(nextToast, 220);
    else toastBusy = false;
  }, wait);
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
  pushPopup('quest', closeQuest);
}
export function closeQuest(){
  document.getElementById('exScrim').classList.remove('on');
  document.getElementById('questModal').classList.remove('on');
  ST.questOpen = false;
  ST.activeMarker = null;
  popPopup('quest');
}

/* ══════════════════════════════════════════════════════════════
   창 여닫는 키 — Esc · Enter · E 로 맨 위 창을 닫는다 (요구 4)

   글을 쓰는 중(입력칸 안)에는 Enter 가 '닫기'가 되면 안 된다.
   그 경우는 각 입력칸이 알아서 처리한다.
   ══════════════════════════════════════════════════════════════ */
function isTyping(el){
  if (!el) return false;
  const t = (el.tagName || '').toUpperCase();
  return t === 'INPUT' || t === 'TEXTAREA' || el.isContentEditable;
}

document.addEventListener('keydown', e => {
  if (!anyOpen()) return;
  if (isTyping(e.target)) return;

  const k = e.key;
  const close = (k === 'Escape') || (k === 'Enter') || (k === 'e' || k === 'E' || e.code === 'KeyE');
  if (!close) return;

  // 단추에 초점이 있을 때의 Enter 는 그 단추를 누르는 것이 맞다
  if (k === 'Enter' && e.target && (e.target.tagName || '').toUpperCase() === 'BUTTON') return;

  e.preventDefault();
  e.stopPropagation();
  closeTop();
});

/* ── 공용 조각 ───────────────────────────────────────────────── */
function head(q){
  const col = q.kind === 'gate' ? '#6E9B94' : catColor(q.cat);
  // 닫기 단추는 모든 임무 창에 있어야 한다 (요구 4) — head 가 유일한 공통 조각이다
  return `<button class="sheet-x q-x" type="button" aria-label="닫기">${icon('close', { size:16 })}</button>
  <div class="q-head">
    <div class="q-mi" style="background:${col}22">${icon(iconForQuest(q), { size:22, color:col })}</div>
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
  else if (q.kind === 'find')       renderFind(q, card);
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
    <div id="qMiniHost"></div>
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

    const cap = q.capstone;
    const hasQuiz = cap && Array.isArray(cap.choices) && cap.choices.length >= 2;
    const capHost = card.querySelector('#qCapHost');

    // 마무리 문제가 없거나 선택지가 비어 있으면 놀이나 완료로 넘어간다
    if (!hasQuiz){
      if (cap && cap.text) capHost.innerHTML = `<p class="q-q">${esc(cap.text)}</p>`;
      afterCap();
      return;
    }

    capHost.innerHTML = `<p class="q-q">${esc(cap.text)}</p><div id="capChoices"></div>`;
    const ch = capHost.querySelector('#capChoices');
    ch.innerHTML = choicesHTML(cap.choices);
    let tries = 0;
    ch.querySelectorAll('.q-choice').forEach(b => onPress(b, () => {
      const i = +b.dataset.i;
      tries++;
      const ok = i === cap.correct;
      logAnswer({ world: ST.WORLD_ID, questId: q.id, title: q.title,
                  question: cap.text, answer: cap.choices[i], correct: ok, tries, kind:'capstone' });
      if (ok){
        b.classList.add('correct');
        ch.querySelectorAll('.q-choice').forEach(x => x.disabled = true);
        fb(card, 'ok', cap.ok || '그러하오.');
        setAnim('cheer');
        afterCap();
      } else {
        b.classList.add('wrong');
        setTimeout(() => b.classList.remove('wrong'), 700);
        fb(card, 'no', cap.no || '다시 살펴보시오.');
        setAnim('tilt');
      }
    }));
  }

  /** 조사형에도 놀이가 붙을 수 있다 (빗살무늬토기의 낱말 적기 같은 것) */
  function afterCap(){
    if (!q.mini){ complete(q, card); return; }
    const host = card.querySelector('#qMiniHost');
    nextBtn(card, q.mini.startLabel || '해 보겠소 →', () => {
      card.querySelector('#qNext').classList.remove('on');
      runMinigame(q.mini, host, ok => {
        host.innerHTML = '';
        if (ok){
          bumpAxis('challenge', 1);
          fb(card, 'ok', q.mini.ok || '해내었소.');
        } else {
          fb(card, 'neutral', q.mini.retry || '괜찮소. 다음 길로 가도 되오.');
        }
        complete(q, card);
      });
    });
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

/* ── ⑥-a 수집형을 임무 목록에서 열었을 때 ────────────────────
   주울 것이 남았는데 창에서 '알겠소'만 눌러 끝나면 안 된다.
   여기서는 무엇이 남았는지만 보여 주고, 완료는 발로 주웠을 때만 한다. */
function renderFind(q, card){
  const items = q.items || [];
  const gotOf = it => questState['find:' + q.id + ':' + it.id] === 'done';
  const got = items.filter(gotOf).length;
  const all = items.length > 0 && got === items.length;

  card.innerHTML = `
    ${head(q)}
    ${photoBlock(q.img)}
    ${q.story ? `<div class="q-story">${esc(stripEmoji(q.story))}</div>` : ''}
    <p class="q-progress">${got} / ${items.length} 가지를 주웠소</p>
    <div class="q-hotspots" id="qFindList"></div>
    <div class="q-fb on neutral" id="qFb">${all
      ? esc(stripEmoji(q.doneMsg || '다 모았소!'))
      : '남은 것은 걸어가서 직접 주워야 하오. 빛나는 자리를 밟으시오.'}</div>
    <button class="q-next" id="qNext" type="button"></button>`;

  card.querySelector('#qFindList').innerHTML = items.map(it => `
    <button class="q-hot ${gotOf(it) ? 'seen' : ''}" type="button" disabled>
      <span class="hot-i">${icon(gotOf(it) ? 'check' : 'find', { size:16 })}</span>
      <span>${esc(gotOf(it) ? stripEmoji(it.label || '') : '아직 못 찾았소')}</span>
    </button>`).join('');

  nextBtn(card, '알겠소 →', closeQuest);
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
  group.userData.sprite.material.opacity = .4;
  setAuraDone(group.userData.aura, true);      // 주운 자리는 회색이 된다 (요구 3)
  bumpAxis('collect', 1);
  setAnim('cheer');

  const all = (q.items || []).every(x => questState['find:' + q.id + ':' + x.id] === 'done');
  showToast(`${stripEmoji(it.label) || '무언가'}를 주웠소`);
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

  /* 시대를 '막 마친' 그 순간에만 연다.
     이미 마친 시대에서 임무를 다시 열 때마다 뜨면 성가시다.
     다시 보고 싶으면 위쪽 발견 수를 누르면 된다 (boot.js) */
  const total = totalCount();
  if (fresh && total > 0 && foundCount() >= total && hooks.onEraComplete) hooks.onEraComplete();
}

let lastRank = -1;
export function checkRankUp(){
  if (!Store) return;
  const r = Store.currentRank();
  if (lastRank < 0){ lastRank = r.index; return; }
  if (r.index > lastRank){
    lastRank = r.index;
    setAnim('cheer');
    showToast(SAY.rankUp(r.name));
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
  el.textContent = stripEmoji(lines[ST.npcLineIdx]);
  el.classList.add('on');
  bumpAxis('story', 1);
  positionBubble(group, camera, canvas);
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 4200);

  /* 할 말을 다 들었으면 마법진이 회색으로 남는다 (요구 3) —
     '이 사람과는 끝냈다' 를 걸어 다니면서 알아볼 수 있게 */
  if (ST.npcLineIdx === lines.length - 1){
    const key = group.userData.npcKey;
    if (key && questState[key] !== 'done'){
      questState[key] = 'done';
      saveQuestState();
    }
    setAuraDone(group.userData.aura, true);
  }
}

/** 말풍선을 즉시 감춘다 (시대·지역을 옮길 때) */
export function hideNpcBubble(){
  const el = document.getElementById('npcBubble');
  if (el){ clearTimeout(el._t); el.classList.remove('on'); }
  ST.npcDialogueFor = null;
  ST.npcLineIdx = 0;
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
  pushPopup('bag', closeBag);
}
export function closeBag(){
  document.getElementById('exScrim2').classList.remove('on');
  document.getElementById('bagSheet').classList.remove('on');
  popPopup('bag');
}

/* ══════════════════════════════════════════════════════════════
   시대 완료
   ══════════════════════════════════════════════════════════════ */
export function showEraComplete(world){
  const c = world && world.complete;
  document.getElementById('eccEyebrow').textContent = world ? (world.eyebrow || '') : '';
  document.getElementById('eccTitle').textContent = (c && c.title) || '시대를 마쳤소!';
  document.getElementById('eccBody').textContent = (c && c.body) || '';
  buildInquiry(world);
  document.getElementById('eraCompleteScrim').classList.add('on');
  document.getElementById('eraCompleteModal').classList.add('on');
  pushPopup('eraComplete', hideEraComplete);
  setAnim('cheer');
}
export function hideEraComplete(){
  document.getElementById('eraCompleteScrim').classList.remove('on');
  document.getElementById('eraCompleteModal').classList.remove('on');
  popPopup('eraComplete');
}

/* ══════════════════════════════════════════════════════════════
   핵심 탐구질문 (요구 5)

   시대의 임무를 모두 마친 자리에서 한 번만 던진다.
   정답을 채점하지 않는다 — 학생이 쓴 글을 그대로 기록지에 남긴다
   (curriculum.md §12 "학생의 질문과 판단 > 정답 맞히기").
   쓴 글은 금칙어 검사를 지나야 저장된다 (요구 6).
   ══════════════════════════════════════════════════════════════ */
function savedInquiry(worldId){
  if (!Store) return null;
  return Store.answers().find(a => a.kind === 'inquiry' && a.world === worldId) || null;
}

function buildInquiry(world){
  const host = document.getElementById('eccInquiry');
  if (!host) return;

  const q = world && world.inquiry;
  const worldId = ST.WORLD_ID;
  if (!q || !q.question){ host.hidden = true; host.innerHTML = ''; return; }
  host.hidden = false;

  const prev = savedInquiry(worldId);

  host.innerHTML = `
    <div class="ecc-inq-head">
      ${icon('question', { size:18 })}
      <span>이 시대의 핵심 질문</span>
    </div>
    <p class="ecc-inq-q"></p>
    <p class="ecc-inq-hint"></p>
    <textarea class="ecc-inq-input" id="eccInqInput" rows="4"
      aria-label="핵심 질문에 대한 내 생각"></textarea>
    <p class="ecc-inq-note" id="eccInqNote"></p>
    <button class="q-next on" id="eccInqSave" type="button">${prev ? '고쳐 적겠소' : '적었소'}</button>`;

  host.querySelector('.ecc-inq-q').textContent = q.question;
  host.querySelector('.ecc-inq-hint').textContent = q.hint || '';

  const input = host.querySelector('#eccInqInput');
  const note  = host.querySelector('#eccInqNote');
  const save  = host.querySelector('#eccInqSave');

  input.placeholder = q.placeholder || '내 생각을 적어 보시오';
  if (prev && prev.answer) input.value = prev.answer;
  if (prev) note.textContent = '기록지에 담아 두었소. 고쳐 적어도 되오.';

  const tell = (msg, bad) => {
    note.textContent = msg || '';
    note.classList.toggle('bad', !!bad);
  };

  onPress(save, () => {
    const text = String(input.value || '').trim();
    if (text.length < 5){
      tell('한 문장이라도 좋으니 조금만 더 적어 주시오.', true);
      input.focus();
      return;
    }

    /* 금칙어 검사 (요구 6) — 걸리면 저장하지 않는다 */
    if (WORDS){
      const r = WORDS.check(text);
      if (!r.ok){ tell(r.message, true); input.focus(); return; }
    }

    logAnswer({
      world: worldId,
      questId: 'inquiry:' + worldId,
      title: (world && world.name) || worldId,
      question: q.question,
      answer: text,
      correct: null,
      tries: 1,
      kind: 'inquiry'
    });
    bumpAxis('write', 2);
    tell('그대의 생각을 기록지에 담았소.', false);
    save.textContent = '고쳐 적겠소';
    showToast('탐구질문에 답하였소. 기록지에서 다시 볼 수 있소');
  });
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
      <span class="ri-icon">${icon(iconForQuest(q), { size:17 })}</span><span>${esc(q.title)}</span>
    </button>`).join('');
  list.querySelectorAll('.rail-item').forEach(b => onPress(b, () => {
    const q = ST.QUESTS.find(x => x.id === b.dataset.id);
    if (q && onPick) onPick(q);
  }));
}

export { MINIGAME_LABELS };
