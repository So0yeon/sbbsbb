// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   boot.js — 부팅 · 시대 전환 · 지역 전환 · 타임라인 · 메인 루프
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { ST, loadQuestState, questState, isDone, foundCount, totalCount, Store } from './state.js';
import { SAY, WORLD_TO_ERA } from './constants.js';
import { buildPlayer, bindInput, updatePlayer, placePlayerAt, clearKeys } from './player.js';
import { buildMarkers, clearMarkers, updateMarkers, drawRadar, findItemUnderPlayer,
         refreshMarkerStates, NEAR, flashQuest, flashActive, clearFlash } from './markers.js';
import { initUI, openQuest, closeQuest, showToast, showHint, updateCounter, renderRail,
         talkToNPC, positionBubble, hideNpcBubble, openBag, closeBag,
         showEraComplete, hideEraComplete, pickFindItem, primeRank } from './ui.js';
import { initCollect, onEnterArea, renderRelicBag, renderStampBook } from './collect.js';
import { setAnim, resetAnim } from './anim.js';
import { WORLDS, AREAS_BY_WORLD, AREA_BUILDERS_BY_WORLD, RELICS_BY_WORLD, NPCS_BY_WORLD } from './worlds-registry.js';
import { dressArea, updateSky, preloadNature } from './skyground.js';
import { applyBrief } from './era-briefs.js';
import { icon } from './icons.js';
import { pushPopup, popPopup } from './popups.js';
import { resetAreaClaims } from './props.js';
import { chainOf } from './chains.js';
import { initQuestEngine, setChain, openChain, closeChain, tickChain, shouldAutoOpen } from './quest-engine.js';
import './neo-games.js';                      // 이식해 온 신석기 미니게임을 엔진 표에 올린다
import { applyNeoMinis } from './neo-quest-minis.js';

let canvas, renderer, scene, camera, clock;
let running = false;
let secTimer = 0;

/* ══════════════════════════════════════════════════════════════
   시작
   ══════════════════════════════════════════════════════════════ */
export function bootExplore(startWorldId){
  if (ST.ready){ switchWorld(startWorldId || currentWorldId()); return; }

  canvas = document.getElementById('exCanvas');
  if (!canvas) return;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !ST.lowSpec, alpha:false });
  } catch(e){
    showToast(SAY.noWebGL);
    return;
  }
  renderer.setPixelRatio(ST.lowSpec ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(52, 1, 0.1, 400);
  clock = new THREE.Clock();

  ST.scene = scene; ST.camera = camera; ST.renderer = renderer; ST.clock = clock;

  // 조명 (§6-2) — 그림자는 켜지 않는다
  scene.add(new THREE.HemisphereLight('#EAF2EF', '#B9A98A', 1.15));
  const sun = new THREE.DirectionalLight('#FFF3DD', 1.3); sun.position.set(28, 42, 14); scene.add(sun);
  const fill = new THREE.DirectionalLight('#CFE3FF', 0.5); fill.position.set(-22, 20, -12); scene.add(fill);

  buildPlayer();

  initUI({
    onGate: goArea,
    onEraComplete: () => showEraComplete(ST.currentWorld),
    refreshRail: () => renderRail(pointToQuest)
  });
  initCollect({ toast: showToast, onChange: refreshCollectViews });

  /* 미션 시퀀스 — 기존 코드를 고치지 않고 위에 얹는다 (요청서 §1-4) */
  initQuestEngine({
    pause: v => { ST.paused = !!v; if (v) clearKeys(); },
    player: () => ST.player ? { x: ST.player.position.x, z: ST.player.position.z } : null,
    toast: showToast,
    onUnlock: () => refreshCollectViews()
  });

  bindInput(canvas, { onInteract: interact });
  bindChrome();
  resize();
  window.addEventListener('resize', resize);

  preloadNature();                 // 하늘·바닥에 쓸 CC0 자연 조각 (없어도 앱은 돈다)
  // 헤드리스 검사용 훅 — 실제 씬을 밖에서 들여다볼 수 있게 한다
  // 헤드리스 검사용 훅 — 씬을 들여다보고 한 프레임을 직접 돌릴 수 있게 한다
  if (typeof window !== 'undefined') window.__atlas3d = { scene, camera, renderer, ST, tick };
  ST.ready = true;
  switchWorld(startWorldId || firstWorldId());
  running = true;
  renderer.setAnimationLoop(tick);
}

function firstWorldId(){ return Object.keys(WORLDS)[0]; }
function currentWorldId(){ return ST.WORLD_ID || firstWorldId(); }

function resize(){
  if (!renderer || !canvas) return;
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}

/* ══════════════════════════════════════════════════════════════
   시대 전환
   ══════════════════════════════════════════════════════════════ */
export function switchWorld(id){
  const w = WORLDS[id];
  if (!w) return;

  // 시대 안내와 탐구질문을 덮어씌운다 (era-briefs.js — 자료 재생성에도 살아남는다)
  applyBrief(w, id);

  // 시대를 옮기면 앞 시대의 말풍선·모달을 끌고 가지 않는다
  closeQuest();
  hideEraComplete();
  hideNpcBubble();
  closeChain();            // 앞 시대의 미션 창도 함께 닫는다

  loading(w.loading || '시간의 틈을 건너는 중…');

  ST.WORLD_ID = id;
  ST.currentWorld = w;
  ST.QUESTS = applyNeoMinis(w.quests || []);   // 신석기는 이식해 온 놀이를 쓴다
  ST.NPCS = NPCS_BY_WORLD[id] || [];
  ST.RELICS = RELICS_BY_WORLD[id] || [];
  ST.AREAS = AREAS_BY_WORLD[id] || {};
  loadQuestState(w.saveKey);
  primeRank();

  scene.background = new THREE.Color(w.bg || '#E9E4D3');
  scene.fog = new THREE.Fog(w.bg || '#E9E4D3', 38, 92);

  document.getElementById('exBrand').textContent = w.brand || w.name || '';
  resetAnim();

  // 시작 지역
  const areaId = w.startArea || Object.keys(ST.AREAS)[0] || null;
  goArea(areaId, null, true);

  setChain(chainOf(id));          // 그 시대의 미션 시퀀스 (없으면 자유 탐험)
  buildTimeline();
  showStory(w);
}

/** 이름을 부르는 말 — 받침이 있으면 '이여', 없으면 '여'. 이름이 없으면 부르지 않는다 */
function vocative(){
  const n = Store ? Store.displayName() : '';
  if (!n) return '';
  const last = n.charCodeAt(n.length - 1) - 0xAC00;
  const hasJong = (last >= 0 && last < 11172) ? (last % 28) !== 0 : false;
  return n + (hasJong ? '이여, ' : '여, ');
}

function showStory(w){
  const wrap = document.getElementById('exIntroStory');
  if (!wrap) return;
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v || ''; };

  set('exStoryEyebrow', w.eyebrow);
  set('exStoryTitle', w.title || w.name);

  /* 이 시대에서 할 일 — 성취기준을 학생의 말로 옮긴 학습 목표 (요구 1) */
  const goalWrap = document.getElementById('exStoryGoal');
  if (goalWrap){
    if (w.goal){
      goalWrap.innerHTML =
        `<span class="ex-goal-tag">이 시대에서 할 일</span><p class="ex-goal-text"></p>`;
      goalWrap.querySelector('.ex-goal-text').textContent = w.goal;
      goalWrap.hidden = false;
    } else {
      goalWrap.hidden = true;
    }
  }

  set('exStoryBody', (w.body || '').replace(/\{이름\}이여, /g, vocative()).replace(/\{이름\}/g, ''));
  set('exStoryHint', w.hint);
  /* 성취기준(w.standard)은 화면에 내보내지 않는다.
     학생이 '무엇을 평가받는지' 를 먼저 읽으면 탐구가 답 맞히기로 바뀐다.
     자료(era-briefs.js)에는 그대로 남겨 콘텐츠를 고칠 때의 근거로 쓴다. */

  wrap.classList.add('on');
  ST.paused = true;
}

/* ══════════════════════════════════════════════════════════════
   지역 전환
   ══════════════════════════════════════════════════════════════ */
export function goArea(areaId, gate, silent){
  const w = ST.currentWorld;
  if (!w) return;
  const areas = ST.AREAS;
  const a = areaId && areas[areaId] ? areas[areaId] : null;

  areaEpoch++;                       // 앞선 지역의 늦은 비동기 작업을 무효로 만든다
  clearFlash();                      // 지역이 바뀌면 가리키던 자리는 뜻이 없다
  resetAreaClaims();                 // 씬을 비우므로 '이미 놓았다' 기록도 비운다
  if (!silent) loading((a && a.loading) || '길을 옮기는 중…');

  // 씬 비우기 — 조명·아바타만 남긴다
  clearMarkers();
  ST.npcGroups.forEach(g => scene.remove(g));
  ST.npcGroups = [];
  for (let i = scene.children.length - 1; i >= 0; i--){
    const o = scene.children[i];
    if (o === ST.player || o.isLight) continue;
    scene.remove(o);
  }

  ST.currentArea = areaId || null;
  ST.BOUND = (a && a.bound) || w.bound || 40;
  ST.spawnPos = (a && a.spawn) || w.spawn || { x:0, z:10 };

  const bg = (a && a.bg) || w.bg || '#E9E4D3';
  scene.background = new THREE.Color(bg);
  scene.fog = new THREE.Fog(bg, 38, 92);

  // 지형 만들기
  const builders = AREA_BUILDERS_BY_WORLD[ST.WORLD_ID] || {};
  const build = (areaId && builders[areaId]) || w.build || null;
  try { if (build) build(); }
  catch(err){ console.error('[area build]', err); }

  // 하늘과 바닥 — 지역 빌더가 놓은 납작한 바닥을 굽이치는 것으로 바꾸고 자연 조각을 흩뿌린다
  try { dressArea(scene, { bg }); } catch(err){ console.error('[skyground]', err); }

  buildNPCs();
  buildMarkers();
  placePlayerAt(ST.spawnPos.x, ST.spawnPos.z);

  updateCounter();
  renderRail(pointToQuest);
  const label = document.getElementById('exMiniLabel');
  if (label) label.textContent = (a && a.name) || (w.name || '');

  if (areaId) onEnterArea(ST.WORLD_ID, areaId, (a && a.name) || areaId);

  setTimeout(() => loading(false), silent ? 0 : 420);
}

/* 지역이 바뀔 때마다 늘어나는 표. 늦게 도착한 옛 요청을 버리는 데 쓴다 */
let areaEpoch = 0;

function buildNPCs(){
  const epoch = areaEpoch;
  import('./scene-helpers.js').then(({ makeNPC, setAuraDone }) => {
    // 그 사이 지역이 또 바뀌었으면 이 요청은 버린다 (사람이 두 번 서는 것을 막는다)
    if (epoch !== areaEpoch) return;

    (ST.NPCS || []).forEach((n, i) => {
      if (n.area && ST.currentArea && n.area !== ST.currentArea) return;
      const g = makeNPC(n.color, n.icon);
      g.position.set(n.pos.x, 0, n.pos.z);
      g.userData.npcLines = n.lines || [];
      // 말을 걸어 본 사람인지 기억한다 — 마법진이 회색으로 남는다 (요구 3)
      g.userData.npcKey = 'npc:' + (ST.currentArea || '-') + ':' + (n.id || i);
      setAuraDone(g.userData.aura, questState[g.userData.npcKey] === 'done');
      scene.add(g);
      ST.npcGroups.push(g);
    });
  });
}

function loading(msg){
  const el = document.getElementById('exLoading');
  const t = document.getElementById('exLoadingMsg');
  if (!el) return;
  if (msg === false){ el.classList.remove('on'); return; }
  if (t) t.textContent = msg;
  el.classList.add('on');
}

/* ══════════════════════════════════════════════════════════════
   타임라인
   ══════════════════════════════════════════════════════════════ */
function buildTimeline(){
  const track = document.getElementById('exTrack');
  if (!track) return;
  track.innerHTML = Object.keys(WORLDS).map(id => {
    const w = WORLDS[id];
    return `<button class="tl-btn ${id === ST.WORLD_ID ? 'on' : ''}" data-id="${id}" type="button">
      <b>${w.short || w.name}</b><small>${w.years || ''}</small></button>`;
  }).join('');
  track.querySelectorAll('.tl-btn').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.id === ST.WORLD_ID) return;
      switchWorld(b.dataset.id);
    });
  });
  const on = track.querySelector('.tl-btn.on');
  if (on && on.scrollIntoView) on.scrollIntoView({ inline:'center', block:'nearest' });
}

/* ══════════════════════════════════════════════════════════════
   조작
   ══════════════════════════════════════════════════════════════ */
/* 오른쪽 임무 목록은 임무를 여는 창이 아니라 자리를 알려 주는 곳이다 (요구 3).
   누르면 미니맵에서 그 자리가 반짝이고, 임무는 걸어가서 직접 연다. */
function pointToQuest(q){
  if (!q) return;
  const ok = flashQuest(q);
  drawRadar();
  if (!ok){ showToast('이 임무는 자리가 정해져 있지 않소'); return; }
  showToast(isDone(q.id)
    ? `이미 마친 곳이오 — 미니맵에서 반짝이는 자리요`
    : `${q.title} — 미니맵에서 반짝이는 자리로 가 보시오`);
}

const NPC_NEAR = 3.2;

/** 손이 닿는 곳에 있는 NPC 중 가장 가까운 것 */
function nearestNPC(){
  if (!ST.player) return null;
  const p = ST.player.position;
  let npc = null, nd = NPC_NEAR;
  ST.npcGroups.forEach(g => {
    const d = Math.hypot(p.x - g.position.x, p.z - g.position.z);
    if (d < nd){ nd = d; npc = g; }
  });
  return npc ? { group: npc, dist: nd } : null;
}

/** 손이 닿는 곳의 마커 (markers.js 의 NEAR 와 같은 기준을 쓴다) */
function nearestMarker(){
  const m = ST.activeNear;
  if (!m || !ST.player) return null;
  const p = ST.player.position;
  const d = Math.hypot(p.x - m.position.x, p.z - m.position.z);
  return d <= NEAR ? { group: m, dist: d } : null;
}

function interact(){
  if (ST.questOpen || ST.paused) return;

  const npc = nearestNPC();
  const mk = nearestMarker();

  // 둘 다 닿으면 더 가까운 쪽을 고른다
  if (mk && (!npc || mk.dist <= npc.dist)){ openQuest(mk.group.userData.quest); return; }
  if (npc){ talkToNPC(npc.group, camera, canvas); return; }
}

function bindChrome(){
  const on = (id, fn, ev) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(ev || 'click', fn);
  };
  on('exInteract', interact);
  on('bagBtn', openBag);
  on('bagX', closeBag);
  on('exScrim2', closeBag);
  on('exScrim', closeQuest);
  on('questX', closeQuest);
  on('eccClose', hideEraComplete);
  on('eccX', hideEraComplete);
  on('eraCompleteScrim', hideEraComplete);

  /* 지도 모드로 돌아가기 (요구 7) — 이 단추에 아무 것도 걸려 있지 않았다 */
  on('toMapBtn', toMapMode);

  /* 홈 — 두 갈래길로 돌아간다 */
  on('exHomeBtn', () => {
    closeMiniModal();
    closeQuest();
    hideEraComplete();
    if (window.AtlasShell) window.AtlasShell.toIntro();
  });

  const startStory = () => {
    document.getElementById('exIntroStory').classList.remove('on');
    ST.paused = false;
    clearKeys();
    // 미션이 있는 시대는 처음 들어설 때 한 번만 저절로 열린다 (요청서 §3 빙의 연출).
    // 그 뒤로는 위쪽 「지금 할 일」 을 눌러야 열린다.
    if (shouldAutoOpen()) setTimeout(openChain, 260);
  };
  on('exStoryGo', startStory);
  on('exStoryX', startStory);
  on('exRailToggle', () => {
    const r = document.getElementById('exQuestRail');
    r.classList.toggle('closed');
    document.getElementById('exRailToggle').textContent = r.classList.contains('closed') ? '›' : '‹';
  });
  on('mqBtn', openChain);
  on('mqScrim', () => { const m = document.getElementById('mqModal'); if (m) m.classList.remove('on'); });
  on('exMinimap', openMiniModal);
  on('exMiniScrim', closeMiniModal);

  /* 마친 시대의 마무리 질문을 다시 보고 싶을 때 (요구 5) */
  on('exFoundBtn', () => {
    const total = totalCount();
    if (total > 0 && foundCount() >= total) showEraComplete(ST.currentWorld);
    else showToast(`아직 ${total - foundCount()} 가지가 남았소`);
  });
}

/* ── 지도 모드로 (요구 7) ────────────────────────────────────── */
export function toMapMode(){
  closeMiniModal();
  closeQuest();
  hideEraComplete();
  const eraId = WORLD_TO_ERA[ST.WORLD_ID];
  if (window.AtlasShell) window.AtlasShell.toMap(eraId);
  else if (window.AtlasMap) window.AtlasMap.open(eraId);
}

/** 시대 마무리 화면(핵심 탐구질문 포함)을 연다 — 발견 수 단추와 검사용 */
export function openEraComplete(){
  showEraComplete(ST.currentWorld);
}

export function openMiniModal(){
  document.getElementById('exMiniScrim').classList.add('on');
  document.getElementById('exMiniModal').classList.add('on');
  drawMiniModal();
  pushPopup('mini', closeMiniModal);          // Esc·Enter·E 로도 닫히게 (요구 4)
}
export function closeMiniModal(){
  const s = document.getElementById('exMiniScrim');
  const m = document.getElementById('exMiniModal');
  if (s) s.classList.remove('on');
  if (m) m.classList.remove('on');
  popPopup('mini');
}

function drawMiniModal(){
  const card = document.getElementById('exMiniCard');
  if (!card) return;
  const w = ST.currentWorld;
  const a = ST.AREAS[ST.currentArea];
  card.innerHTML = `
    <button class="sheet-x" id="miniX" type="button" aria-label="닫기">${icon('close', { size:16 })}</button>
    <div class="q-head"><div class="q-mi">${icon('map', { size:22, color:'#6E9B94' })}</div>
      <div><span class="q-tag" style="background:#6E9B94">지금 있는 곳</span>
      <h2 class="q-title"></h2></div></div>
    <p class="mg-intro"></p>
    <button class="q-next on" id="miniToMap" type="button">지도 모드에서 보기</button>`;
  card.querySelector('.q-title').textContent = (a && a.name) || (w && w.name) || '';
  card.querySelector('.mg-intro').textContent = (w && w.eyebrow) || '';
  card.querySelector('#miniX').addEventListener('click', closeMiniModal);
  card.querySelector('#miniToMap').addEventListener('click', toMapMode);
}

/* 유물 가방·수첩 화면 갱신 (shell.js 가 열 때도 씀) */
export function refreshCollectViews(){
  const rb = document.getElementById('relicBody');
  if (rb && document.getElementById('relicSheet').classList.contains('on')){
    renderRelicBag(rb, RELICS_BY_WORLD, worldNames());
  }
  const sb = document.getElementById('stampBody');
  if (sb && document.getElementById('stampSheet').classList.contains('on')){
    renderStampBook(sb, worldList());
  }
}
export function worldNames(){
  const o = {};
  Object.keys(WORLDS).forEach(id => o[id] = WORLDS[id].name);
  return o;
}
export function worldList(){
  return Object.keys(WORLDS).map(id => ({
    id, name: WORLDS[id].name, areas: AREAS_BY_WORLD[id] || {}
  }));
}

/* ══════════════════════════════════════════════════════════════
   메인 루프
   ══════════════════════════════════════════════════════════════ */
let radarT = 0;
function tick(){
  if (!running) return;
  const dt = Math.min(.05, clock.getDelta());
  const t = clock.elapsedTime;

  updatePlayer(dt);
  updateSky(dt);
  updateMarkers(t);            // ST.activeNear 를 갱신한다
  tickChain();                 // 미션의 '둘러보기' 걸음을 지켜본다

  // 조사하기 버튼 — 판정은 interact() 와 똑같은 기준을 쓴다.
  // 두 기준이 어긋나면 버튼은 떴는데 눌리지 않는 자리가 생긴다.
  const btn = document.getElementById('exInteract');
  if (btn){
    const show = !!(nearestMarker() || nearestNPC());
    btn.classList.toggle('on', show && !ST.questOpen && !ST.paused);
  }

  // 수집 아이템 밟기
  const item = findItemUnderPlayer();
  if (item) pickFindItem(item);

  // NPC 말풍선 따라가기
  if (ST.npcDialogueFor) positionBubble(ST.npcDialogueFor, camera, canvas);

  // 반짝이는 동안에는 더 자주 다시 그린다 (요구 3)
  radarT += dt;
  if (radarT > (flashActive() ? .09 : .25)){ radarT = 0; drawRadar(); }

  secTimer += dt;
  if (secTimer >= 10){ secTimer = 0; if (Store) Store.addSeconds(10); }

  renderer.render(scene, camera);
}

export function pauseExplore(v){ ST.paused = !!v; if (v) clearKeys(); }
