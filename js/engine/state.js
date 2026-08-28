// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   state.js — 탐험 모드 런타임 상태 (MASTER.md §4-5)

   저장은 전부 window.AtlasStore(js/store.js)에 위임한다.
   이 파일은 3D 런타임에만 관계된 것을 갖는다.
   ══════════════════════════════════════════════════════════════════════ */

export const Store = (typeof window !== 'undefined' && window.AtlasStore) || null;

/* ── 안전한 저장소 (Store가 없어도 죽지 않게) ────────────────── */
function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
function lsSet(k,v){ try { localStorage.setItem(k,v); return true; } catch(e){ return false; } }
export function lsJSON(k, fb){
  const raw = lsGet(k); if (!raw) return fb;
  try { return JSON.parse(raw); } catch(e){ return fb; }
}

/* ── 전역 런타임 상태 ────────────────────────────────────────── */
export const ST = {
  QUESTS: [], NPCS: [], RELICS: [], AREAS: {}, FINDS: [],
  SAVE_KEY: '', BOUND: 32, WORLD_ID: '',

  scene: null, camera: null, renderer: null, clock: null,
  markerGroups: [], npcGroups: [], findGroups: [], areaGroup: null,

  player: null, rig: null,
  leftLeg: null, rightLeg: null, leftArm: null, rightArm: null,
  leftKnee: null, rightKnee: null, leftElbow: null, rightElbow: null,
  head: null, crest: null, torso: null,

  activeMarker: null, questOpen: false, moving: false,
  camYaw: Math.PI, camZoom: 1, camPitch: 0.46,   // 올려다본 각(라디안). 0.02=눈높이 1.24=위에서
  orbitId: null, pinchDist: null, jumpY: 0, jumpVY: 0,
  spawnPos: { x:0, z:10 },

  currentWorld: null, currentMode: '3d', currentArea: null,
  npcDialogueFor: null, npcLineIdx: 0,
  inspecting: null, inspectSeen: new Set(), inspectPhotoIdx: 0,

  envTexture: null, activeNear: null,
  lowSpec: false, ready: false, paused: false
};

/* ── 퀘스트 진행 (시대별 저장소) ─────────────────────────────── */
export let questState = {};

export function loadQuestState(saveKey){
  ST.SAVE_KEY = saveKey;
  const d = lsJSON(saveKey, null);
  questState = (d && typeof d.questState === 'object' && d.questState) ? d.questState : {};
  return questState;
}
export function saveQuestState(){
  if (!ST.SAVE_KEY) return;
  lsSet(ST.SAVE_KEY, JSON.stringify({ questState }));
}
export function isDone(id){ return questState[id] === 'done'; }

export function markDone(id){
  if (!id || questState[id] === 'done') return false;
  questState[id] = 'done';
  saveQuestState();
  if (Store && ST.WORLD_ID) Store.doneAdd(ST.WORLD_ID, id);
  return true;
}

/* 발견 수 — 관문은 세지 않는다 (§4-5) */
export function foundCount(){
  return ST.QUESTS.filter(q => q.kind !== 'gate' && questState[q.id] === 'done').length;
}
export function totalCount(){
  return ST.QUESTS.filter(q => q.kind !== 'gate').length;
}
export function areaQuests(area){
  return ST.QUESTS.filter(q => q.kind !== 'gate' && (!q.area || q.area === area));
}
export function areaCleared(area){
  const qs = areaQuests(area);
  return qs.length > 0 && qs.every(q => questState[q.id] === 'done');
}
export function worldCleared(){
  const qs = ST.QUESTS.filter(q => q.kind !== 'gate');
  return qs.length > 0 && qs.every(q => questState[q.id] === 'done');
}

/* ── Store 얇은 위임 ─────────────────────────────────────────── */
export const bag = Store ? Store.bag : new Set();

export function collectContent(id, onToast){
  if (!Store || !id || Store.bagHas(id)) return null;
  const CONTENT = (typeof window !== 'undefined' && window.CONTENT) || [];
  const c = CONTENT.find(x => x.id === id);
  if (!c) return null;                 // 없는 항목이면 아무것도 하지 않는다 (§4-4)
  Store.bagAdd(id);
  if (onToast) onToast(`🎒 "${c.t}"을(를) 역사 가방에 담았소`);
  return c;
}

export function bumpAxis(name, n){ if (Store) Store.bumpAxis(name, n); }
export function logAnswer(e){ if (Store) Store.logAnswer(e); }
