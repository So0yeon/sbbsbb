// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   quest-engine.js — 미션 시퀀스 진행 엔진 (요청서 §5 · §11-5)

   기존 3D 탐험 코드를 뜯어고치지 않는다. 그 위에 얹는다.
   시대에 매이지 않는다 — 자료(chain)만 갈아 끼우면 다른 시대가 돌아간다.

   진행 상태는 넷뿐이다 (§5). 점수는 만들지 않는다.
     flags       내가 남긴 것의 상태        potQuality:'clean' 같은 것
     inventory   지니게 된 것               ['clay','pot']
     relations   누구에게 무엇을 주었나     { grandma:'necklace' }
     kept        내가 간직하기로 한 것

   엔딩은 이 넷으로 계산한다. 총점·등급·별점이 어디에도 없다 (§9).

   한 걸음(step)의 생김새
     { id, act, goal, inner, ... , onSuccess:{gain,setFlag,relate,keep}, after:{...} }
       act: note | explore | dialogue | combine | observe | deduce | minigame | choice
       inner:    현대 아이의 속마음 한 줄 (§3 빙의 유지)
       after:    미션을 마친 직후에만 뜨는 2~3문장 정리 카드 (§2 원칙 5)
       contentId: 이 걸음이 여는 학습 항목 — 마치면 지도 모드에 쌓인다
   ══════════════════════════════════════════════════════════════════════ */
import { Store } from './state.js';
import { icon } from './icons.js';
import { onPress } from './minigames.js';
import { runObserve } from './observe.js';
import { runTemplate } from './mg-templates.js';
import { runMinigame } from './minigames.js';
import { pushPopup, popPopup } from './popups.js';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ── 상태 ────────────────────────────────────────────────────── */
let chain = null;
let S = blank();
let hooks = {};        // { pause(v), player(), toast(msg), onUnlock(contentId) }
let openNow = false;
let walkFrom = null;   // explore 걸음에서 '얼마나 걸었나'를 재는 기준점
let pendingAfter = null;   // 창이 닫힌 채로 끝난 걸음의 정리 카드 — 다음에 열 때 보여 준다

function blank(){
  return { at:0, flags:{}, inventory:[], relations:{}, kept:[], observed:[], done:false };
}

export function initQuestEngine(h){ hooks = h || {}; }

/* ── 저장 ────────────────────────────────────────────────────── */
function save(){
  if (!chain || !chain.saveKey) return;
  try { localStorage.setItem(chain.saveKey, JSON.stringify(S)); } catch(e){ /* 사생활 보호 모드 */ }
}
function load(){
  if (!chain || !chain.saveKey) return blank();
  try {
    const raw = localStorage.getItem(chain.saveKey);
    const d = raw ? JSON.parse(raw) : null;
    if (!d || typeof d !== 'object') return blank();
    return Object.assign(blank(), d);
  } catch(e){ return blank(); }
}

/* ── 열고 닫기 ───────────────────────────────────────────────── */
export function hasChain(){ return !!chain; }
export function chainDone(){ return !!(S && S.done); }
export function chainProgress(){
  if (!chain) return { at:0, total:0 };
  return { at: Math.min(S.at, chain.steps.length), total: chain.steps.length };
}

/** 시대가 바뀔 때 부른다. 그 시대에 미션이 없으면 chain 은 null 이 된다 */
export function setChain(c){
  chain = c || null;
  S = chain ? load() : blank();
  paintBadge();
}

export function openChain(){
  if (!chain) return;
  openNow = true;
  if (hooks.pause) hooks.pause(true);
  const scrim = document.getElementById('mqScrim');
  const modal = document.getElementById('mqModal');
  if (scrim) scrim.classList.add('on');
  if (modal) modal.classList.add('on');
  pushPopup('mission', closeChain);
  if (pendingAfter){ const a = pendingAfter; pendingAfter = null; showAfter(a); }
  else render();
}

export function closeChain(){
  openNow = false;
  const scrim = document.getElementById('mqScrim');
  const modal = document.getElementById('mqModal');
  if (scrim) scrim.classList.remove('on');
  if (modal) modal.classList.remove('on');
  popPopup('mission');
  if (hooks.pause) hooks.pause(false);
  paintBadge();
}

export function isChainOpen(){ return openNow; }

/* ── 걸음 진행 ───────────────────────────────────────────────── */
function step(){ return chain && chain.steps[S.at] || null; }

/** 이번 걸음을 마쳤다. 얻은 것·플래그를 적고 다음으로 넘어간다 */
function complete(extra){
  const st = step();
  if (!st) return;

  const win = st.onSuccess || {};
  (win.gain || []).forEach(x => { if (!S.inventory.includes(x)) S.inventory.push(x); });
  (win.keep || []).forEach(x => { if (!S.kept.includes(x)) S.kept.push(x); });
  Object.assign(S.flags, win.setFlag || {}, (extra && extra.setFlag) || {});
  Object.assign(S.relations, win.relate || {}, (extra && extra.relate) || {});
  if (extra && extra.note && !S.observed.includes(extra.note)) S.observed.push(extra.note);

  // 이 걸음이 여는 학습 항목은 지도 모드에 쌓인다 (§5 끝줄)
  if (st.contentId && Store && Store.bagAdd(st.contentId)){
    if (hooks.onUnlock) hooks.onUnlock(st.contentId);
  }
  if (st.axis && Store) Store.bumpAxis(st.axis, 1);

  S.at++;
  if (S.at >= chain.steps.length) S.done = true;
  save();

  // 창이 닫힌 채로 끝났으면(세상에서 표지를 눌러 끝낸 경우) 다음에 열 때 보여 준다
  if (!openNow){ pendingAfter = st.after || null; paintBadge(true); return; }
  if (st.after) showAfter(st.after);
  else render();
}

/* ── 화면 ────────────────────────────────────────────────────── */
function card(inner){
  const host = document.getElementById('mqCard');
  if (!host) return null;
  host.innerHTML = `
    <button class="sheet-x mq-x" id="mqX" type="button" aria-label="닫기">${icon('close', { size:16 })}</button>
    ${inner}`;
  const x = host.querySelector('#mqX');
  if (x) x.addEventListener('click', closeChain);
  return host;
}

function actLabel(a){
  return ({ note:'', explore:'찾아보기', dialogue:'말 걸기', combine:'만들기',
            observe:'관찰하기', deduce:'헤아리기', minigame:'해 보기', choice:'고르기' })[a] || '';
}

function headOf(st){
  const act = actLabel(st.act);
  return `<div class="mq-head">
    <div class="mq-meta">
      <span class="mq-seq">${S.at + 1} / ${chain.steps.length}</span>
      ${st.arc ? `<span class="mq-arc">${esc(st.arc)}</span>` : ''}
      ${act ? `<span class="mq-act">${esc(act)}</span>` : ''}
    </div>
    <h2 class="mq-goal">${esc(st.goal || '')}</h2>
    ${st.inner ? `<p class="mq-inner">“${esc(st.inner)}”</p>` : ''}
  </div>`;
}

function render(){
  if (!chain) return;
  if (S.done){ renderEnding(); return; }
  const st = step();
  if (!st){ renderEnding(); return; }

  const host = card(headOf(st) + `<div class="mq-body" id="mqBody"></div>`);
  if (!host) return;
  const body = host.querySelector('#mqBody');

  switch (st.act){
    case 'note':     return renderNote(st, body);
    case 'explore':  return renderExplore(st, body);
    case 'dialogue': return renderDialogue(st, body);
    case 'combine':  return renderCombine(st, body);
    case 'observe':  return renderObserve(st, body);
    case 'deduce':   return renderDeduce(st, body);
    case 'minigame': return renderMinigame(st, body);
    case 'choice':   return renderChoice(st, body);
    default:         return renderNote(st, body);
  }
}

function nextButton(body, label, fn){
  const b = document.createElement('button');
  b.className = 'q-next on mq-next';
  b.type = 'button';
  b.textContent = label;
  body.appendChild(b);
  onPress(b, fn);
  return b;
}

/* ① note — 이야기 한 조각, 결론 카드 */
function renderNote(st, body){
  body.innerHTML = (st.lines || []).map(l => `<p class="mq-line">${esc(l)}</p>`).join('');
  nextButton(body, st.nextLabel || '알겠소 →', () => complete());
}

/* ② explore — 세상으로 나가 찾는다 */
function renderExplore(st, body){
  body.innerHTML = `
    <p class="mq-line">${esc(st.say || '나가서 찾아보시오.')}</p>
    <p class="mq-hint">${esc(st.hint || '세상으로 나가면 이 창은 닫히오. 다 보았으면 위쪽 「지금 할 일」을 다시 누르시오.')}</p>`;

  if (st.target){
    // 그 임무 표지를 실제로 열면 걸음이 끝난다
    nextButton(body, '나가 보겠소 →', () => { walkFrom = null; closeChain(); });
    body.insertAdjacentHTML('beforeend',
      `<p class="mq-target">찾을 것 · ${esc(st.targetName || st.target)}</p>`);
  } else {
    // 걸어 다니기만 하면 되는 걸음
    walkFrom = null;
    nextButton(body, '나가 보겠소 →', () => {
      const p = hooks.player && hooks.player();
      walkFrom = p ? { x:p.x, z:p.z, need: st.walk || 8 } : null;
      closeChain();
    });
    const now = walked();
    if (now) nextButton(body, '둘러보았소 →', () => complete());
  }
}
function walked(){
  if (!walkFrom) return false;
  const p = hooks.player && hooks.player();
  if (!p) return false;
  return Math.hypot(p.x - walkFrom.x, p.z - walkFrom.z) >= walkFrom.need;
}

/** boot.js 의 매 프레임에서 부른다 — 걸어 다닌 거리를 지켜본다 */
export function tickChain(){
  if (!chain || S.done || openNow) return;
  const st = step();
  if (!st || st.act !== 'explore' || st.target) return;
  if (walked()){
    walkFrom = null;
    if (hooks.toast) hooks.toast('둘러보았소. 「지금 할 일」을 누르시오');
    paintBadge(true);
  }
}

/** ui.js 가 임무 표지를 열 때 알려 준다 */
export function noticeQuestOpened(id){
  if (!chain || S.done) return;
  const st = step();
  if (st && st.act === 'explore' && st.target === id){
    complete();
    if (hooks.toast) hooks.toast('지금 할 일을 하나 마쳤소');
  }
}

/* ③ dialogue — 말이 통하지 않으므로 손짓과 표정으로 */
function renderDialogue(st, body){
  body.innerHTML = `
    ${(st.lines || []).map(l => `<p class="mq-said">${esc(l)}</p>`).join('')}
    <div class="mq-picks" id="mqPicks"></div>
    <p class="mq-fb" id="mqFb"></p>`;
  const picks = body.querySelector('#mqPicks');
  const fb = body.querySelector('#mqFb');
  picks.innerHTML = (st.options || []).map((o, i) =>
    `<button class="mq-pick" data-i="${i}" type="button">${esc(o.label)}</button>`).join('');
  picks.querySelectorAll('.mq-pick').forEach(b => onPress(b, () => {
    const o = st.options[+b.dataset.i];
    picks.querySelectorAll('.mq-pick').forEach(x => { x.disabled = true; if (x !== b) x.style.opacity = '.45'; });
    fb.textContent = o.reply || '';
    nextButton(body, '알겠소 →', () => complete({ setFlag: o.setFlag }));
  }));
}

/* ④ combine — 지닌 것을 골라 쓴다 */
function renderCombine(st, body){
  const need = st.need || [];
  const have = need.filter(n => S.inventory.includes(n));
  body.innerHTML = `
    <p class="mq-line">${esc(st.say || '')}</p>
    <ul class="mq-inv">${need.map(n => `
      <li class="${S.inventory.includes(n) ? 'has' : ''}">
        <span>${icon(S.inventory.includes(n) ? 'check' : 'question', { size:14 })}</span>
        <span>${esc((chain.names && chain.names[n]) || n)}</span></li>`).join('')}</ul>
    <p class="mq-fb" id="mqFb"></p>`;
  if (have.length >= need.length){
    nextButton(body, st.makeLabel || '만들어 보겠소 →', () => complete());
  } else {
    body.querySelector('#mqFb').textContent = '아직 손에 없는 것이 있소. 먼저 구해 오시오.';
    nextButton(body, '나가 보겠소 →', closeChain);
  }
}

/* ⑤ observe — 유물 관찰 (§4) */
function renderObserve(st, body){
  runObserve(st.solve || {}, body, res => {
    complete({ note: res.note, setFlag: st.solve && st.solve.setFlag });
  });
}

/* ⑥ deduce — 모은 단서로 결론을 고른다 */
function renderDeduce(st, body){
  const clues = st.clues && st.clues.length ? st.clues : S.observed.slice(-4);
  body.innerHTML = `
    <ul class="mq-clues">${clues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <p class="mq-line">${esc(st.say || '그러면 어찌해야 하겠소?')}</p>
    <div class="mq-picks" id="mqPicks"></div>
    <p class="mq-fb" id="mqFb"></p>`;
  const picks = body.querySelector('#mqPicks');
  const fb = body.querySelector('#mqFb');
  picks.innerHTML = (st.options || []).map((o, i) =>
    `<button class="mq-pick" data-i="${i}" type="button">${esc(o.label)}</button>`).join('');
  picks.querySelectorAll('.mq-pick').forEach(b => onPress(b, () => {
    const o = st.options[+b.dataset.i];
    if (o.ok){
      picks.querySelectorAll('.mq-pick').forEach(x => x.disabled = true);
      b.classList.add('on');
      fb.textContent = o.reply || '그렇소.';
      nextButton(body, '알겠소 →', () => complete({ setFlag: o.setFlag }));
    } else {
      fb.textContent = o.reply || '해 보았으나 그리 되지 않소.';
    }
  }));
}

/* ⑦ minigame — 템플릿 여섯 중 하나 (§7),
      또는 자료가 type 을 적어 준 놀이 (minigames.js 표에 등록된 것).
      엔진은 어느 시대의 놀이인지 알지 못한다 — 자료가 정한다. */
function renderMinigame(st, body){
  const g = st.game || {};

  if (g.type){
    // type 으로 부르는 놀이는 되고/안 되고만 알려 준다. 게임 오버는 없으므로
    // 못 해낸 것도 '자국이 남았다' 로 적고 그대로 넘어간다.
    runMinigame(g, body, ok => {
      const set = {};
      if (st.qualityFlag) set[st.qualityFlag] = ok ? 'clean' : 'rough';
      complete({ setFlag: set });
    });
    return;
  }

  runTemplate(g, body, res => {
    const set = {};
    if (st.qualityFlag) set[st.qualityFlag] = res.quality;
    complete({ setFlag: set });
  });
}

/* ⑧ choice — 되돌릴 수 없다. 반드시 무언가를 잃는다 (§8) */
function renderChoice(st, body){
  body.innerHTML = `
    <p class="mq-line">${esc(st.say || '')}</p>
    <p class="mq-cost">고르면 되돌릴 수 없소. 하나를 얻으면 하나는 잃소.</p>
    <div class="mq-picks mq-picks-col" id="mqPicks"></div>`;
  const picks = body.querySelector('#mqPicks');
  picks.innerHTML = (st.options || []).map((o, i) => `
    <button class="mq-pick mq-pick-big" data-i="${i}" type="button">
      <b>${esc(o.label)}</b>
      <span class="mq-gain">얻는 것 · ${esc(o.gain || '')}</span>
      <span class="mq-lose">잃는 것 · ${esc(o.lose || '')}</span>
    </button>`).join('');
  picks.querySelectorAll('.mq-pick').forEach(b => onPress(b, () => {
    const o = st.options[+b.dataset.i];
    picks.querySelectorAll('.mq-pick').forEach(x => { x.disabled = true; if (x !== b) x.style.opacity = '.4'; });
    const box = document.createElement('p');
    box.className = 'mq-fb';
    box.textContent = o.reply || '';
    body.appendChild(box);
    nextButton(body, '그리하겠소 →', () => complete({
      setFlag: o.setFlag, relate: o.relate
    }));
  }));
}

/* ── 마친 직후의 정리 카드 (§2 원칙 5) ───────────────────────── */
function showAfter(after){
  const host = card(`
    <div class="mq-after">
      <p class="mq-after-tag">알고 보니</p>
      <h2 class="mq-after-title"></h2>
      <p class="mq-after-body"></p>
      <p class="mq-after-cite"></p>
    </div>
    <div id="mqBody"></div>`);
  if (!host) return;
  host.querySelector('.mq-after-title').textContent = after.title || '';
  host.querySelector('.mq-after-body').textContent = after.body || '';
  const cite = host.querySelector('.mq-after-cite');
  if (after.cite) cite.textContent = after.cite; else cite.remove();
  nextButton(host.querySelector('#mqBody'), '계속 →', render);
}

/* ══════════════════════════════════════════════════════════════
   엔딩 — 박물관 유리장 (§9)
   총점·등급·별점을 만들지 않는다. 조합마다 다를 뿐 우열이 없다.
   ══════════════════════════════════════════════════════════════ */
function renderEnding(){
  const e = chain.ending || {};
  const slots = (e.slots || []).map(s => {
    const v = s.from === 'relations' ? S.relations[s.key]
            : s.from === 'kept'      ? (S.kept.includes(s.key) ? 'yes' : 'no')
            : S.flags[s.key];
    const line = (s.says && (s.says[v] || s.says['*'])) || null;
    return line ? { label: s.label, line } : null;
  }).filter(Boolean);

  const host = card(`
    <div class="mq-end">
      <p class="mq-end-tag">${esc(e.tag || '눈을 뜨니 박물관이오')}</p>
      <h2 class="mq-end-title">${esc(e.title || '유리장 앞')}</h2>
      <p class="mq-end-lead">${esc(e.lead || '')}</p>

      <div class="mq-case">
        ${slots.map(s => `
          <div class="mq-case-row">
            <span class="mq-case-l">${esc(s.label)}</span>
            <span class="mq-case-v"></span>
          </div>`).join('')}
      </div>

      <p class="mq-end-fixed">${esc(e.fixed || '')}</p>
      ${S.observed.length ? `<details class="mq-note-box">
        <summary>내가 관찰한 것 ${S.observed.length}가지</summary>
        <ul>${S.observed.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
      </details>` : ''}
      <p class="mq-end-last">${esc(e.last || '')}</p>
    </div>
    <div id="mqBody"></div>`);
  if (!host) return;

  host.querySelectorAll('.mq-case-v').forEach((el, i) => { el.textContent = slots[i].line; });

  const body = host.querySelector('#mqBody');
  nextButton(body, '닫기', closeChain);
  const again = document.createElement('button');
  again.className = 'mq-again';
  again.type = 'button';
  again.textContent = '다른 선택을 했다면? — 처음부터 다시';
  body.appendChild(again);
  onPress(again, () => {
    S = blank();
    save();
    render();
  });
}

/* ── 위쪽 「지금 할 일」 단추 ────────────────────────────────── */
function paintBadge(alert){
  const btn = document.getElementById('mqBtn');
  if (!btn) return;
  if (!chain){ btn.hidden = true; return; }
  btn.hidden = false;
  const p = chainProgress();
  const label = btn.querySelector('.mq-btn-t');
  if (label) label.textContent = S.done ? '마쳤소' : `지금 할 일 ${Math.min(p.at + 1, p.total)} / ${p.total}`;
  btn.classList.toggle('alert', !!alert);
}

/** 바깥에서 상태를 들여다볼 때 (검사·기록) */
export function chainState(){ return JSON.parse(JSON.stringify(S)); }
export function chainMeta(){ return chain ? { id: chain.id, era: chain.era, steps: chain.steps.length } : null; }
