// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   markers.js — 퀘스트 3D 마커 · 근접 판정 · 미니맵 레이더
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { ST, questState, isDone } from './state.js';
import { catColor } from './constants.js';
import { mat, iconSprite, makeAura, setAuraDone, DONE_COLOR } from './scene-helpers.js';
import { iconForQuest } from './icons.js';

/** 이 거리 안이면 '조사하기'가 뜨고, 그 버튼이 실제로 동작한다.
 *  boot.js 의 interact() 도 이 값을 쓴다 — 두 곳이 어긋나면
 *  버튼은 떴는데 눌리지 않는 자리가 생긴다. */
export const NEAR = 3.4;

/* ── 마커 하나 ───────────────────────────────────────────────── */
function makeMarker(q){
  const g = new THREE.Group();
  const done = isDone(q.id);
  const isGate = q.kind === 'gate';
  const color = isGate ? '#6E9B94' : catColor(q.cat);

  // 마법진 — 상호작용할 수 있다는 표시 (요구 3)
  const aura = makeAura(color, 1.95);
  g.add(aura);
  setAuraDone(aura, done);

  // 기둥 — 멀리서도 자리를 알아보게
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(.06, .06, 1.5, 6),
    mat(done ? DONE_COLOR : color, { transparent:true, opacity: done ? .3 : .8 })
  );
  post.position.y = .75;
  g.add(post);

  // 아이콘 — 이모지가 아니라 선 아이콘 (요구 2)
  const icon = iconSprite(iconForQuest(q), 1.05, done ? DONE_COLOR : color);
  icon.position.y = 2.05;
  icon.material.opacity = done ? .5 : 1;
  g.add(icon);

  g.position.set(q.pos.x, 0, q.pos.z);
  g.userData = { quest: q, aura, post, icon, color, base: 2.05, done };
  return g;
}

export function buildMarkers(){
  clearMarkers();
  const area = ST.currentArea;
  ST.QUESTS.forEach(q => {
    if (!q.pos) return;
    if (q.area && area && q.area !== area) return;
    if (q.kind === 'find') return;          // 수집형은 아이템으로 따로 놓는다
    const g = makeMarker(q);
    ST.scene.add(g);
    ST.markerGroups.push(g);
  });
  buildFindItems();
}

/* 수집형 — 낱개 아이템을 뿌린다 */
function buildFindItems(){
  (ST.QUESTS || []).forEach(q => {
    if (q.kind !== 'find' || !q.items) return;
    if (q.area && ST.currentArea && q.area !== ST.currentArea) return;
    const color = catColor(q.cat) || '#7C6BA8';
    q.items.forEach(it => {
      if (!it.pos) return;
      const g = new THREE.Group();
      const got = questState['find:' + q.id + ':' + it.id] === 'done';

      const aura = makeAura(color, 1.15);
      g.add(aura);
      setAuraDone(aura, got);

      const sp = iconSprite('find', .85, got ? DONE_COLOR : color);
      sp.position.y = 1.2;
      sp.material.opacity = got ? .4 : 1;
      g.add(sp);

      g.position.set(it.pos.x, 0, it.pos.z);
      g.userData = { findOf: q, item: it, sprite: sp, aura, color, base: 1.2, got };
      ST.scene.add(g);
      ST.findGroups.push(g);
    });
  });
}

export function clearMarkers(){
  ST.markerGroups.forEach(g => ST.scene.remove(g));
  ST.findGroups.forEach(g => ST.scene.remove(g));
  ST.markerGroups = [];
  ST.findGroups = [];
}

export function refreshMarkerStates(){
  ST.markerGroups.forEach(g => {
    const d = g.userData;
    const done = isDone(d.quest.id);
    if (done === d.done) return;
    d.done = done;
    setAuraDone(d.aura, done);                       // 색 → 회색 (요구 3)
    d.post.material = mat(done ? DONE_COLOR : d.color,
      { transparent:true, opacity: done ? .3 : .8 });
    d.icon.material.map = iconSprite(iconForQuest(d.quest), 1,
      done ? DONE_COLOR : d.color).material.map;
    d.icon.material.opacity = done ? .5 : 1;
    d.icon.material.needsUpdate = true;
  });
  ST.findGroups.forEach(g => {
    const d = g.userData;
    const got = questState['find:' + d.findOf.id + ':' + d.item.id] === 'done';
    if (got === d.got) return;
    d.got = got;
    setAuraDone(d.aura, got);
    d.sprite.material.map = iconSprite('find', 1, got ? DONE_COLOR : d.color).material.map;
    d.sprite.material.opacity = got ? .4 : 1;
    d.sprite.material.needsUpdate = true;
  });
}

/* ── 매 프레임: 둥실거림 + 근접 판정 ─────────────────────────── */
export function updateMarkers(t){
  const p = ST.player;
  if (!p) return null;

  let best = null, bestD = NEAR;

  ST.markerGroups.forEach((g, i) => {
    const u = g.userData;
    u.icon.position.y = u.base + Math.sin(t * 1.7 + i) * .13;
    u.aura.rotation.z += u.done ? 0.0012 : 0.004;    // 마친 자리는 천천히 돈다
    const d = Math.hypot(p.position.x - g.position.x, p.position.z - g.position.z);

    /* 임무 목록에서 고른 자리는 세상에서도 숨을 쉰다 (요구 1) */
    const lit = isFlashed(u);
    const beat = lit ? flashBeat() : 0;
    const scale = (d < NEAR ? 1.14 : 1) + beat * 0.34;
    g.scale.setScalar(scale);
    u.icon.material.opacity = lit ? 1 : (u.done ? .5 : 1);
    u.aura.material.opacity = lit ? (.55 + beat * .45)
                                  : (u.done ? .42 : .95);
    u.post.material.opacity = lit ? (.5 + beat * .5) : (u.done ? .3 : .8);
    if (lit) u.aura.rotation.z += 0.03;              // 가리키는 동안 빠르게 돈다

    if (!u.done && d < bestD){ bestD = d; best = g; }
  });

  // 완료된 것도 다시 볼 수 있게: 가까운 게 없으면 완료된 것 중 가장 가까운 것
  if (!best){
    let d2 = NEAR;
    ST.markerGroups.forEach(g => {
      const d = Math.hypot(p.position.x - g.position.x, p.position.z - g.position.z);
      if (d < d2){ d2 = d; best = g; }
    });
  }

  // 수집형 아이템
  ST.findGroups.forEach((g, i) => {
    const u = g.userData;
    u.sprite.position.y = u.base + Math.sin(t * 2.1 + i) * .1;
    u.aura.rotation.z -= u.got ? 0.0015 : 0.005;

    const lit = isFlashed(u);
    const beat = lit ? flashBeat() : 0;
    g.scale.setScalar(1 + beat * 0.4);
    u.aura.material.opacity = lit ? (.55 + beat * .45) : (u.got ? .42 : .95);
    if (lit) u.aura.rotation.z -= 0.03;
  });

  updateBeacons();          // 세상에 세운 표시등 (요구: 화면에서도 반짝이게)

  ST.activeNear = best;
  return best;
}

/** 아바타가 밟은 수집 아이템을 돌려준다 */
export function findItemUnderPlayer(){
  const p = ST.player;
  if (!p) return null;
  for (const g of ST.findGroups){
    if (g.userData.got) continue;
    const d = Math.hypot(p.position.x - g.position.x, p.position.z - g.position.z);
    if (d < 1.5) return g;
  }
  return null;
}

/* ══════════════════════════════════════════════════════════════
   임무 자리 알려 주기 (요구 3)

   오른쪽 임무 목록은 임무를 여는 창이 아니라 '어디 있는지' 를
   알려 주는 곳이다. 누르면 미니맵의 그 자리가 잠시 반짝인다.
   임무는 걸어가서 직접 열어야 한다.
   ══════════════════════════════════════════════════════════════ */
const FLASH_SEC = 6;
let flash = null;      // { pts:[{x,z}], color, until }

/* 시간은 렌더 시계로 잰다.
   performance.now() 로 재면 헤드리스의 가상 시간과 어긋나 레이더를
   끝없이 다시 그리게 되고, 그 바람에 렌더러가 죽는다. */
function nowSec(){
  return ST.clock ? ST.clock.elapsedTime : (performance.now() / 1000);
}

/* ── 세상에 세우는 표시등 ─────────────────────────────────────
   표지가 조금 커졌다 작아지는 것만으로는 멀리서 보이지 않는다.
   빛기둥을 세우고 바닥에 고리를 퍼뜨려 어디인지 한눈에 알게 한다. */
let beacons = [];

function makeBeacon(color){
  const g = new THREE.Group();

  // 빛기둥 — 위로 갈수록 옅어진다
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(.5, 1.15, 11, 12, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.3,
                                  depthWrite:false, side:THREE.DoubleSide })
  );
  beam.position.y = 5.5;
  g.add(beam);

  // 바닥에서 퍼져 나가는 고리 둘 (엇갈려 퍼진다)
  const rings = [0, .5].map(() => {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(1, .1, 8, 30),
      new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.9, depthWrite:false })
    );
    r.rotation.x = -Math.PI / 2;
    r.position.y = .12;
    g.add(r);
    return r;
  });

  // 머리 위에서 도는 표 — 위에서 내려다볼 때도 보이게
  const cap = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, .13, 8, 24),
    new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.85, depthWrite:false })
  );
  cap.position.y = 3.4;
  g.add(cap);

  g.userData = { beam, rings, cap };
  return g;
}

function clearBeacons(){
  beacons.forEach(b => { if (ST.scene) ST.scene.remove(b); });
  beacons = [];
}

/** 표시등을 자라게 한다 — updateMarkers 가 매 프레임 부른다 */
function updateBeacons(){
  if (!beacons.length) return;
  if (!flashActive()){ clearBeacons(); return; }
  const t = nowSec();
  const life = Math.max(0, (flash.until - t) / FLASH_SEC);      // 1 → 0
  const beat = flashBeat();

  beacons.forEach(g => {
    const u = g.userData;
    u.beam.material.opacity = (.16 + beat * .30) * (0.35 + life * 0.65);
    u.cap.rotation.z += 0.05;
    u.cap.material.opacity = (.55 + beat * .45) * life;
    u.rings.forEach((r, i) => {
      // 0 → 1 로 퍼졌다가 처음으로 돌아간다. 둘이 엇갈리게 시작한다
      const p = ((t * 0.85 + i * 0.5) % 1);
      const s = 0.6 + p * 3.4;
      r.scale.set(s, s, 1);
      r.material.opacity = (1 - p) * 0.85 * life;
    });
  });
}

/** 그 임무가 있는 자리를 미니맵에 반짝여 준다. 자리가 없으면 false */
export function flashQuest(q){
  if (!q) return false;
  const pts = [];
  if (q.kind === 'find' && q.items) q.items.forEach(it => { if (it.pos) pts.push(it.pos); });
  else if (q.pos) pts.push(q.pos);
  if (!pts.length){ flash = null; return false; }
  const color = q.kind === 'gate' ? '#6E9B94' : catColor(q.cat);
  flash = { id: q.id, pts, color, until: nowSec() + FLASH_SEC };

  // 세상에도 표시등을 세운다 — 멀리서도 보이게
  clearBeacons();
  if (ST.scene) pts.forEach(p => {
    const g = makeBeacon(color);
    g.position.set(p.x, 0, p.z);
    ST.scene.add(g);
    beacons.push(g);
  });
  return true;
}

/** 이 표지가 지금 가리켜지고 있는가 — 세상 쪽 반짝임에 쓴다 */
function isFlashed(u){
  if (!flash || !flashActive()) return false;
  if (u.quest)  return u.quest.id  === flash.id;
  if (u.findOf) return u.findOf.id === flash.id;
  return false;
}

/** 0 ↔ 1 로 오가는 숨결. 미니맵과 세상이 같은 박자로 뛴다 */
function flashBeat(){ return (Math.sin(nowSec() * 6.6) + 1) / 2; }
export function flashActive(){ return !!(flash && nowSec() < flash.until); }
export function clearFlash(){ flash = null; clearBeacons(); }

/* ── 미니맵 레이더 ───────────────────────────────────────────── */
export function drawRadar(){
  const svg = document.getElementById('exMiniRadar');
  if (!svg || !ST.player) return;
  const R = 56, C = 64;
  const lim = ST.BOUND || 40;

  let s = `<circle cx="${C}" cy="${C}" r="${R}" fill="#EDEDE6" stroke="#B9B6AA" stroke-width="1.4"/>`;
  s += `<circle cx="${C}" cy="${C}" r="${R*.55}" fill="none" stroke="#D2CFC3" stroke-dasharray="3 3"/>`;
  s += `<line x1="${C}" y1="${C-R}" x2="${C}" y2="${C+R}" stroke="#DDDAD0"/>`;
  s += `<line x1="${C-R}" y1="${C}" x2="${C+R}" y2="${C}" stroke="#DDDAD0"/>`;

  ST.markerGroups.forEach(g => {
    const q = g.userData.quest;
    const x = C + (g.position.x / lim) * R;
    const y = C + (g.position.z / lim) * R;
    const col = q.kind === 'gate' ? '#6E9B94' : catColor(q.cat);
    const op = g.userData.done ? .3 : 1;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${q.kind==='gate'?3.4:2.6}" fill="${col}" opacity="${op}"/>`;
  });

  /* 임무 목록에서 고른 자리 — 숨을 쉬듯 커졌다 작아진다 (요구 3) */
  if (flashActive()){
    const t = nowSec();
    const life = (flash.until - t) / FLASH_SEC;           // 1 → 0
    const beat = (Math.sin(t * 6.6) + 1) / 2;             // 0 ↔ 1
    flash.pts.forEach(p => {
      const fx = C + (p.x / lim) * R;
      const fy = C + (p.z / lim) * R;
      const rr = 5 + beat * 7;
      s += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${rr.toFixed(1)}"
              fill="none" stroke="${flash.color}" stroke-width="2.4"
              opacity="${(life * (0.35 + beat * 0.65)).toFixed(2)}"/>`;
      s += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="3.4"
              fill="${flash.color}" opacity="${(0.5 + beat * 0.5).toFixed(2)}"/>`;
    });
  }

  const px = C + (ST.player.position.x / lim) * R;
  const py = C + (ST.player.position.z / lim) * R;
  const a = ST.player.rotation.y;
  const tx = px + Math.sin(a) * 8, ty = py + Math.cos(a) * 8;
  s += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="#191919" stroke-width="1.6"/>`;
  s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="#191919"/>`;

  svg.innerHTML = s;
}
