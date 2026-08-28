// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   markers.js — 퀘스트 3D 마커 · 근접 판정 · 미니맵 레이더
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { ST, questState, isDone } from './state.js';
import { catColor } from './constants.js';
import { mat, iconSprite } from './scene-helpers.js';

const NEAR = 3.4;      // 이 거리 안이면 '조사하기'가 뜬다

/* ── 마커 하나 ───────────────────────────────────────────────── */
function makeMarker(q){
  const g = new THREE.Group();
  const done = isDone(q.id);
  const isGate = q.kind === 'gate';
  const color = isGate ? '#6E9B94' : catColor(q.cat);

  // 바닥 고리
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.0, .09, 6, 20),
    mat(color, { transparent:true, opacity: done ? .35 : .85 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = .06;
  g.add(ring);

  // 기둥
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(.07, .07, 1.5, 6),
    mat(color, { transparent:true, opacity: done ? .3 : .8 })
  );
  post.position.y = .75;
  g.add(post);

  // 아이콘
  const icon = iconSprite(q.icon || '📌', 1.05);
  icon.position.y = 2.05;
  icon.material.opacity = done ? .42 : 1;
  g.add(icon);

  g.position.set(q.pos.x, 0, q.pos.z);
  g.userData = { quest: q, ring, post, icon, base: 2.05, done };
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
    q.items.forEach(it => {
      if (!it.pos) return;
      const g = new THREE.Group();
      const got = questState['find:' + q.id + ':' + it.id] === 'done';
      const sp = iconSprite(it.icon || '✨', .85);
      sp.position.y = 1.2;
      sp.material.opacity = got ? .3 : 1;
      g.add(sp);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(.6, .06, 5, 14),
        mat('#7C6BA8', { transparent:true, opacity: got ? .25 : .7 })
      );
      ring.rotation.x = -Math.PI/2; ring.position.y = .05;
      g.add(ring);
      g.position.set(it.pos.x, 0, it.pos.z);
      g.userData = { findOf: q, item: it, sprite: sp, ring, base: 1.2, got };
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
    const done = isDone(g.userData.quest.id);
    if (done === g.userData.done) return;
    g.userData.done = done;
    g.userData.ring.material = mat(
      g.userData.quest.kind === 'gate' ? '#6E9B94' : catColor(g.userData.quest.cat),
      { transparent:true, opacity: done ? .35 : .85 }
    );
    g.userData.icon.material.opacity = done ? .42 : 1;
  });
  ST.findGroups.forEach(g => {
    const key = 'find:' + g.userData.findOf.id + ':' + g.userData.item.id;
    const got = questState[key] === 'done';
    if (got === g.userData.got) return;
    g.userData.got = got;
    g.userData.sprite.material.opacity = got ? .3 : 1;
  });
}

/* ── 매 프레임: 둥실거림 + 근접 판정 ─────────────────────────── */
export function updateMarkers(t){
  const p = ST.player;
  if (!p) return null;

  let best = null, bestD = NEAR;

  ST.markerGroups.forEach((g, i) => {
    g.userData.icon.position.y = g.userData.base + Math.sin(t * 1.7 + i) * .13;
    g.userData.ring.rotation.z += 0.004;
    const d = Math.hypot(p.position.x - g.position.x, p.position.z - g.position.z);
    const done = g.userData.done;
    const scale = d < NEAR ? 1.14 : 1;
    g.scale.setScalar(scale);
    if (!done && d < bestD){ bestD = d; best = g; }
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
    g.userData.sprite.position.y = g.userData.base + Math.sin(t * 2.1 + i) * .1;
    g.userData.ring.rotation.z -= 0.005;
  });

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

/* ── 미니맵 레이더 ───────────────────────────────────────────── */
export function drawRadar(){
  const svg = document.getElementById('exMiniRadar');
  if (!svg || !ST.player) return;
  const R = 56, C = 64;
  const lim = ST.BOUND || 40;

  let s = `<circle cx="${C}" cy="${C}" r="${R}" fill="#F1F1EC" stroke="#DDDDDA"/>`;
  s += `<circle cx="${C}" cy="${C}" r="${R*.55}" fill="none" stroke="#EAEAEA"/>`;

  ST.markerGroups.forEach(g => {
    const q = g.userData.quest;
    const x = C + (g.position.x / lim) * R;
    const y = C + (g.position.z / lim) * R;
    const col = q.kind === 'gate' ? '#6E9B94' : catColor(q.cat);
    const op = g.userData.done ? .3 : 1;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${q.kind==='gate'?3.4:2.6}" fill="${col}" opacity="${op}"/>`;
  });

  const px = C + (ST.player.position.x / lim) * R;
  const py = C + (ST.player.position.z / lim) * R;
  const a = ST.player.rotation.y;
  const tx = px + Math.sin(a) * 8, ty = py + Math.cos(a) * 8;
  s += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="#191919" stroke-width="1.6"/>`;
  s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="#191919"/>`;

  svg.innerHTML = s;
}
