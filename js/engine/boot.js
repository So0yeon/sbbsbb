// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   boot.js — 부팅 · 시대 전환 · 지역 전환 · 타임라인 · 메인 루프
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { ST, loadQuestState, questState, isDone, foundCount, totalCount, Store } from './state.js';
import { SAY, WORLD_TO_ERA } from './constants.js';
import { buildPlayer, bindInput, updatePlayer, placePlayerAt, clearKeys } from './player.js';
import { buildMarkers, clearMarkers, updateMarkers, drawRadar, findItemUnderPlayer, refreshMarkerStates } from './markers.js';
import { initUI, openQuest, closeQuest, showToast, showHint, updateCounter, renderRail,
         talkToNPC, positionBubble, openBag, closeBag, showEraComplete, hideEraComplete,
         pickFindItem, primeRank } from './ui.js';
import { initCollect, onEnterArea, renderRelicBag, renderStampBook } from './collect.js';
import { setAnim, resetAnim } from './anim.js';
import { WORLDS, AREAS_BY_WORLD, AREA_BUILDERS_BY_WORLD, RELICS_BY_WORLD, NPCS_BY_WORLD } from './worlds-registry.js';

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
    refreshRail: () => renderRail(q => openQuest(q))
  });
  initCollect({ toast: showToast, onChange: refreshCollectViews });

  bindInput(canvas, { onInteract: interact });
  bindChrome();
  resize();
  window.addEventListener('resize', resize);

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

  loading(w.loading || '시간의 틈을 건너는 중…');

  ST.WORLD_ID = id;
  ST.currentWorld = w;
  ST.QUESTS = w.quests || [];
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
  document.getElementById('exStoryEyebrow').textContent = w.eyebrow || '';
  document.getElementById('exStoryTitle').textContent = w.title || w.name || '';
  document.getElementById('exStoryBody').textContent =
    (w.body || '').replace(/\{이름\}이여, /g, vocative()).replace(/\{이름\}/g, '');
  document.getElementById('exStoryHint').textContent = w.hint || '';
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

  buildNPCs();
  buildMarkers();
  placePlayerAt(ST.spawnPos.x, ST.spawnPos.z);

  updateCounter();
  renderRail(q => openQuest(q));
  const label = document.getElementById('exMiniLabel');
  if (label) label.textContent = (a && a.name) || (w.name || '');

  if (areaId) onEnterArea(ST.WORLD_ID, areaId, (a && a.name) || areaId);

  setTimeout(() => loading(false), silent ? 0 : 420);
}

function buildNPCs(){
  import('./scene-helpers.js').then(({ makeNPC }) => {
    (ST.NPCS || []).forEach(n => {
      if (n.area && ST.currentArea && n.area !== ST.currentArea) return;
      const g = makeNPC(n.color, n.icon);
      g.position.set(n.pos.x, 0, n.pos.z);
      g.userData.npcLines = n.lines || [];
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
function interact(){
  if (ST.questOpen || ST.paused) return;

  // 1) 가까운 NPC
  const p = ST.player.position;
  let npc = null, nd = 3.2;
  ST.npcGroups.forEach(g => {
    const d = Math.hypot(p.x - g.position.x, p.z - g.position.z);
    if (d < nd){ nd = d; npc = g; }
  });

  // 2) 가까운 마커
  const m = ST.activeNear;
  const md = m ? Math.hypot(p.x - m.position.x, p.z - m.position.z) : 99;

  if (m && md <= nd){ openQuest(m.userData.quest); return; }
  if (npc){ talkToNPC(npc, camera, canvas); return; }
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
  on('eccClose', hideEraComplete);
  on('eraCompleteScrim', hideEraComplete);
  on('exStoryGo', () => {
    document.getElementById('exIntroStory').classList.remove('on');
    ST.paused = false;
    clearKeys();
  });
  on('exRailToggle', () => {
    const r = document.getElementById('exQuestRail');
    r.classList.toggle('closed');
    document.getElementById('exRailToggle').textContent = r.classList.contains('closed') ? '›' : '‹';
  });
  on('exMinimap', () => {
    document.getElementById('exMiniScrim').classList.add('on');
    document.getElementById('exMiniModal').classList.add('on');
    drawMiniModal();
  });
  on('exMiniScrim', () => {
    document.getElementById('exMiniScrim').classList.remove('on');
    document.getElementById('exMiniModal').classList.remove('on');
  });
}

function drawMiniModal(){
  const card = document.getElementById('exMiniCard');
  if (!card) return;
  const w = ST.currentWorld;
  const a = ST.AREAS[ST.currentArea];
  const eraId = WORLD_TO_ERA[ST.WORLD_ID];
  card.innerHTML = `
    <div class="q-head"><div class="q-mi">🗺️</div>
      <div><span class="q-tag" style="background:#6E9B94">지금 있는 곳</span>
      <h2 class="q-title">${(a && a.name) || (w && w.name) || ''}</h2></div></div>
    <p class="mg-intro">${(w && w.eyebrow) || ''}</p>
    <button class="q-next on" id="miniToMap" type="button">🗺️ 지도 모드에서 보기</button>`;
  const b = card.querySelector('#miniToMap');
  if (b) b.addEventListener('click', () => {
    document.getElementById('exMiniScrim').classList.remove('on');
    document.getElementById('exMiniModal').classList.remove('on');
    if (window.AtlasShell) window.AtlasShell.toMap(eraId);
  });
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
  const near = updateMarkers(t);

  // 조사하기 버튼
  const btn = document.getElementById('exInteract');
  if (btn){
    let show = !!near && Math.hypot(
      ST.player.position.x - near.position.x, ST.player.position.z - near.position.z) < 3.4;
    if (!show){
      const p = ST.player.position;
      show = ST.npcGroups.some(g => Math.hypot(p.x - g.position.x, p.z - g.position.z) < 3.2);
    }
    btn.classList.toggle('on', show && !ST.questOpen && !ST.paused);
  }

  // 수집 아이템 밟기
  const item = findItemUnderPlayer();
  if (item) pickFindItem(item);

  // NPC 말풍선 따라가기
  if (ST.npcDialogueFor) positionBubble(ST.npcDialogueFor, camera, canvas);

  radarT += dt;
  if (radarT > .25){ radarT = 0; drawRadar(); }

  secTimer += dt;
  if (secTimer >= 10){ secTimer = 0; if (Store) Store.addSeconds(10); }

  renderer.render(scene, camera);
}

export function pauseExplore(v){ ST.paused = !!v; if (v) clearKeys(); }
