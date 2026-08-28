// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   scene-helpers.js — 공용 3D 빌더 (MASTER.md §6-4)

   eras/*.js 는 이 어휘만 쓴다. 직접 THREE 지오메트리를 만들지 않는다.
   저폴리 · 플랫셰이딩 · 그림자 없음 (§6-2)
   크기 감각: 캐릭터 키 2, 지붕 꼭대기 y >= 3.0 (§6-3)
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { ST } from './state.js';

/* ── 재료 ────────────────────────────────────────────────────── */
const matCache = new Map();
export function mat(color, opts){
  const key = color + '|' + JSON.stringify(opts || {});
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial(Object.assign({
    color, flatShading: true, roughness: .92, metalness: 0
  }, opts || {}));
  matCache.set(key, m);
  return m;
}

export function add(obj){ ST.scene.add(obj); return obj; }

/** 그룹을 만들고 위치·회전을 잡아 씬에 넣는다 */
export function place(group, x, z, rotY, y){
  group.position.set(x, y || 0, z);
  if (rotY) group.rotation.y = rotY;
  ST.scene.add(group);
  return group;
}

function box(w,h,d,color,x,y,z){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color));
  m.position.set(x||0, y||0, z||0);
  return m;
}
function cyl(rt,rb,h,seg,color,x,y,z){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||8), mat(color));
  m.position.set(x||0, y||0, z||0);
  return m;
}
function cone(r,h,seg,color,x,y,z){
  const m = new THREE.Mesh(new THREE.ConeGeometry(r,h,seg||6), mat(color));
  m.position.set(x||0, y||0, z||0);
  return m;
}
function sph(r,color,x,y,z,detail){
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail === undefined ? 0 : detail), mat(color));
  m.position.set(x||0, y||0, z||0);
  return m;
}
export { box, cyl, cone, sph };

/* ══════════════════════════════════════════════════════════════
   바탕
   ══════════════════════════════════════════════════════════════ */
export function buildGround(color){
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220, 1, 1),
    mat(color || '#E9E4D3')
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = -0.02;
  return add(g);
}

export function buildWater(x, z, w, d, rotY){
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w || 30, d || 120),
    new THREE.MeshStandardMaterial({ color:'#8FC1C4', transparent:true, opacity:.72, flatShading:true })
  );
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = rotY || 0;
  m.position.set(x || 0, 0.04, z || 0);
  return add(m);
}

/** 가장자리 저폴리 산. 반지름은 ST.BOUND × 1.02 부터 (§6-4) */
export function buildMountains(color, n){
  const g = new THREE.Group();
  const count = n || 26;
  const base = ST.BOUND * 1.02;
  for (let i = 0; i < count; i++){
    const a = (i / count) * Math.PI * 2 + (i % 3) * 0.06;
    const r = base + 3 + (i % 4) * 2.4;
    const h = 7 + (i % 5) * 2.6;
    const c = cone(5.2 + (i % 3) * 1.4, h, 5, color || '#B9BCA8',
                   Math.cos(a) * r, h / 2 - 0.4, Math.sin(a) * r);
    c.rotation.y = i * 0.7;
    g.add(c);
  }
  return add(g);
}

export function buildMountainsWide(color){
  const g = new THREE.Group();
  for (let i = 0; i < 20; i++){
    const a = (i / 20) * Math.PI * 2 + 0.15;
    const r = 80 + (i % 3) * 6;
    const h = 12 + (i % 4) * 4;
    g.add(cone(9 + (i % 3) * 2, h, 5, color || '#C6C9B6',
               Math.cos(a) * r, h / 2, Math.sin(a) * r));
  }
  return add(g);
}

/* ══════════════════════════════════════════════════════════════
   건물·구조물
   ══════════════════════════════════════════════════════════════ */

/** 기와지붕 한옥. 궁궐 w≈5,h≈3 / 민가 w≈3,h≈2 */
export function jRoofHanok(x, z, w, d, h, bodyColor, roofColor, rotY){
  const g = new THREE.Group();
  w = w || 4; d = d || 3.4; h = h || 2.4;
  const body = box(w, h, d, bodyColor || '#DCD3BE', 0, h/2, 0);
  g.add(body);

  // 기단
  g.add(box(w + .7, .34, d + .7, '#BDB6A4', 0, .17, 0));

  // 지붕 — 두 겹 처마
  const roofH = Math.max(1.0, h * .52);
  const r1 = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d) * .82, roofH, 4), mat(roofColor || '#5A6470'));
  r1.rotation.y = Math.PI / 4;
  r1.position.y = h + roofH / 2 - .06;
  r1.scale.set(1, 1, d / w);
  g.add(r1);

  const eave = box(w + 1.5, .18, d + 1.5, roofColor || '#5A6470', 0, h + .1, 0);
  g.add(eave);

  // 기둥
  const px = w/2 - .25, pz = d/2 - .2;
  [[-px,-pz],[px,-pz],[-px,pz],[px,pz]].forEach(p => {
    g.add(cyl(.13,.13,h,6,'#8A6E52', p[0], h/2, p[1]));
  });
  return place(g, x, z, rotY);
}

export function buildStrawHouse(x, z, scale, rotY){
  const s = scale || 1;
  const g = new THREE.Group();
  const h = 1.5 * s;
  g.add(box(2.6*s, h, 2.4*s, '#D9CDB4', 0, h/2, 0));
  const r = cone(2.1*s, 1.7*s, 6, '#C2A86A', 0, h + .85*s, 0);
  g.add(r);
  g.add(box(.6*s, .9*s, .1*s, '#7E6A4E', 0, .45*s, 1.22*s));
  return place(g, x, z, rotY);
}

export function buildTileHouse(x, z, scale, rotY){
  const s = scale || 1;
  return jRoofHanok(x, z, 3.1*s, 2.7*s, 2.0*s, '#E2DAC6', '#6B7280', rotY);
}

/** 벽돌 건물 — 개항기·일제강점기 */
export function brickBuilding(x, z, w, d, h, rotY){
  const g = new THREE.Group();
  w = w || 4; d = d || 3.4; h = h || 4;
  g.add(box(w, h, d, '#A8695C', 0, h/2, 0));
  g.add(box(w + .4, .3, d + .4, '#8E5A4F', 0, h + .1, 0));
  // 창 두 줄
  for (let r = 0; r < 2; r++){
    for (let c = -1; c <= 1; c++){
      if (w < 3 && c !== 0) continue;
      g.add(box(.5, .8, .08, '#DCE4E8', c * (w/3.4), h*.32 + r*(h*.34), d/2 + .02));
    }
  }
  return place(g, x, z, rotY);
}

/** 나무 문 — spread 는 기둥 사이 절반 거리 */
export function timberGate(x, z, spread, color, rotY){
  const g = new THREE.Group();
  const s = spread || 4.6, h = 4.6, c = color || '#6B7280';
  g.add(cyl(.34,.4,h,8,'#7B5E42', -s, h/2, 0));
  g.add(cyl(.34,.4,h,8,'#7B5E42',  s, h/2, 0));
  g.add(box(s*2 + 1.6, .5, .8, c, 0, h + .1, 0));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(s + 1.4, 1.0, 4), mat(c));
  roof.rotation.y = Math.PI/4; roof.scale.set(1, 1, .34);
  roof.position.y = h + .8;
  g.add(roof);
  return place(g, x, z, rotY);
}

/** 성벽 — axis 'x' | 'z', 두께 2.2 높이 3.4 고정 */
export function buildFortressWall(x, z, len, axis, color){
  const g = new THREE.Group();
  const w = axis === 'z' ? 2.2 : (len || 20);
  const d = axis === 'z' ? (len || 20) : 2.2;
  g.add(box(w, 3.4, d, color || '#A9A79A', 0, 1.7, 0));
  // 여장
  const n = Math.floor((len || 20) / 2.4);
  for (let i = 0; i < n; i++){
    const t = (i - (n-1)/2) * 2.4;
    const bx = axis === 'z' ? 0 : t;
    const bz = axis === 'z' ? t : 0;
    g.add(box(axis === 'z' ? 2.4 : 1.5, .8, axis === 'z' ? 1.5 : 2.4,
              color || '#B7B5A8', bx, 3.8, bz));
  }
  return place(g, x, z);
}

export function buildStonePagoda(x, z, tiers){
  const g = new THREE.Group();
  const n = tiers || 5;
  let y = 0;
  g.add(box(2.2, .4, 2.2, '#B9B4A6', 0, .2, 0)); y = .4;
  for (let i = 0; i < n; i++){
    const w = 1.7 - i * .2;
    g.add(box(w, .52, w, '#C3BEAF', 0, y + .26, 0));
    g.add(box(w + .55, .16, w + .55, '#ADA898', 0, y + .58, 0));
    y += .72;
  }
  g.add(cone(.3, .7, 6, '#B0AA98', 0, y + .35, 0));
  return place(g, x, z);
}

export function buildTombMound(x, z, r, color){
  const g = new THREE.Group();
  const rr = r || 3.5;
  const m = new THREE.Mesh(new THREE.SphereGeometry(rr, 10, 6, 0, Math.PI*2, 0, Math.PI/2), mat(color || '#9DAE85'));
  m.position.y = 0;
  g.add(m);
  g.add(cyl(rr + .3, rr + .5, .3, 12, '#B6B09C', 0, .15, 0));
  return place(g, x, z);
}

export function buildTrainingGround(x, z){
  const g = new THREE.Group();
  const f = new THREE.Mesh(new THREE.PlaneGeometry(12, 9), mat('#D6CBB0'));
  f.rotation.x = -Math.PI/2; f.position.y = .01;
  g.add(f);
  for (let i = -1; i <= 1; i++){
    g.add(cyl(.14,.14,2.2,6,'#8A6E52', i*3, 1.1, -3.6));
    g.add(box(1.1, 1.1, .12, '#E4DCC6', i*3, 2.2, -3.6));
  }
  g.add(box(.9, .12, 4.4, '#9A7E5E', 4.6, 1.0, 0));
  return place(g, x, z);
}

export function buildPier(x, z, len, rotY){
  const g = new THREE.Group();
  const L = len || 12;
  g.add(box(2.6, .3, L, '#A98C68', 0, .5, 0));
  const n = Math.floor(L / 2.2);
  for (let i = 0; i < n; i++){
    const t = (i - (n-1)/2) * 2.2;
    g.add(cyl(.16,.16,1.2,6,'#7E6647', -1.0, .25, t));
    g.add(cyl(.16,.16,1.2,6,'#7E6647',  1.0, .25, t));
  }
  return place(g, x, z, rotY);
}

export function buildShipHull(x, z, scale, rotY){
  const s = scale || 1;
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.6*s, 1.1*s, 7.2*s), mat('#7B5E42'));
  hull.position.y = .7*s;
  g.add(hull);
  g.add(cone(1.5*s, 2.2*s, 4, '#7B5E42', 0, .7*s, 4.0*s));
  g.children[1].rotation.x = Math.PI/2;
  g.add(cyl(.16*s,.16*s,4.6*s,6,'#5E4B36', 0, 3.0*s, 0));
  const sail = box(2.4*s, 3.0*s, .1*s, '#E8E2D0', 0, 3.4*s, 0);
  g.add(sail);
  return place(g, x, z, rotY);
}

/* 자주 쓰는 작은 것들 ─────────────────────────────────────────── */
export function buildDolmen(x, z, scale){
  const s = scale || 1;
  const g = new THREE.Group();
  g.add(box(.9*s, 2.0*s, .8*s, '#A9A69A', -1.2*s, 1.0*s, 0));
  g.add(box(.9*s, 2.0*s, .8*s, '#A9A69A',  1.2*s, 1.0*s, 0));
  const cap = box(4.2*s, .6*s, 2.8*s, '#9C9A8E', 0, 2.3*s, 0);
  cap.rotation.z = .04;
  g.add(cap);
  return place(g, x, z);
}

export function buildFirePit(x, z){
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++){
    const a = i / 7 * Math.PI * 2;
    g.add(sph(.22, '#8E8A7C', Math.cos(a)*.9, .16, Math.sin(a)*.9));
  }
  g.add(cone(.34, .8, 5, '#C7663E', 0, .4, 0));
  g.add(cone(.2, .5, 5, '#E8A64A', 0, .55, 0));
  return place(g, x, z);
}

export function buildPitHouse(x, z, scale, rotY){
  const s = scale || 1;
  const g = new THREE.Group();
  g.add(cyl(2.3*s, 2.6*s, .5*s, 9, '#B9A98A', 0, .25*s, 0));
  const roof = cone(2.7*s, 2.9*s, 8, '#C9AE79', 0, 1.9*s, 0);
  g.add(roof);
  g.add(box(.8*s, 1.0*s, .1*s, '#6E5A40', 0, .5*s, 2.4*s));
  // 총 높이 3.4s — 아바타(2)보다 확실히 높다 (§6-3)
  return place(g, x, z, rotY);
}

export function buildKiln(x, z){
  const g = new THREE.Group();
  g.add(cyl(1.0, 1.6, 2.2, 8, '#8E7A5E', 0, 1.1, 0));
  g.add(cyl(.36,.5,1.2,6,'#7A6750', 0, 2.6, 0));
  g.add(box(.8,.9,.6,'#5E4B36', 0, .45, 1.5));
  return place(g, x, z);
}

export function buildWell(x, z){
  const g = new THREE.Group();
  g.add(cyl(.9,.9,.9,10,'#A9A69A', 0, .45, 0));
  g.add(cyl(.72,.72,.1,10,'#5F7E80', 0, .84, 0));
  g.add(cyl(.09,.09,2.0,6,'#7B5E42', -.9, 1.4, 0));
  g.add(cyl(.09,.09,2.0,6,'#7B5E42',  .9, 1.4, 0));
  g.add(box(2.2,.14,.3,'#7B5E42', 0, 2.4, 0));
  return place(g, x, z);
}

export function buildFlagPole(x, z, color, label){
  const g = new THREE.Group();
  g.add(cyl(.09,.09,4.4,6,'#6E6A5E', 0, 2.2, 0));
  const f = box(1.6,.9,.06, color || '#A8534F', .84, 3.7, 0);
  g.add(f);
  if (label) g.add(textSprite(label, .014, 0, 4.9, 0));
  return place(g, x, z);
}

export function buildBonfireTower(x, z){
  const g = new THREE.Group();
  g.add(cyl(1.3,1.7,2.6,8,'#A9A79A', 0, 1.3, 0));
  g.add(cyl(.8,1.0,1.0,8,'#8E8A7C', 0, 3.1, 0));
  g.add(cone(.5,1.0,6,'#C7663E', 0, 4.0, 0));
  return place(g, x, z);
}

export function buildRockCluster(x, z, n, scale){
  const g = new THREE.Group();
  const s = scale || 1, k = n || 4;
  for (let i = 0; i < k; i++){
    const a = i / k * Math.PI * 2;
    const r = sph((.4 + (i%3)*.22) * s, i % 2 ? '#A5A296' : '#B2AEA1',
                  Math.cos(a) * .9 * s, (.3 + (i%2)*.16) * s, Math.sin(a) * .9 * s);
    r.rotation.set(i, i*.7, i*.3);
    g.add(r);
  }
  return place(g, x, z);
}

export function buildStack(x, z, kind){
  // 조개더미 · 장작더미 등 빈 공간 채우기용
  const g = new THREE.Group();
  const col = kind === 'wood' ? '#9A7E5E' : (kind === 'shell' ? '#E4DCC6' : '#C9BFA6');
  for (let i = 0; i < 9; i++){
    const s = sph(.26, col, (i%3-1)*.42, .18 + Math.floor(i/3)*.3, ((i%3)-1)*.36 + (i%2)*.2);
    s.rotation.set(i, i, i);
    g.add(s);
  }
  return place(g, x, z);
}

/* ══════════════════════════════════════════════════════════════
   나무·산포
   ══════════════════════════════════════════════════════════════ */
export function makeTree(s){
  s = s || 1;
  const g = new THREE.Group();
  g.add(cyl(.16*s,.22*s,1.5*s,6,'#7B5E42', 0, .75*s, 0));
  const c1 = cone(1.05*s, 1.9*s, 6, '#6E8F63', 0, 2.1*s, 0);
  const c2 = cone(.8*s, 1.4*s, 6, '#7C9B6E', 0, 3.0*s, 0);
  g.add(c1); g.add(c2);
  return g;
}

export function makeBroadTree(s){
  s = s || 1;
  const g = new THREE.Group();
  g.add(cyl(.18*s,.24*s,1.4*s,6,'#79614A', 0, .7*s, 0));
  g.add(sph(1.25*s, '#71916A', 0, 2.2*s, 0, 0));
  g.add(sph(.8*s, '#7E9E74', .7*s, 2.8*s, -.4*s, 0));
  return g;
}

function farEnough(x, z, list, minD){
  for (let i = 0; i < list.length; i++){
    const dx = x - list[i][0], dz = z - list[i][1];
    if (dx*dx + dz*dz < minD*minD) return false;
  }
  return true;
}

/** 그 지역의 퀘스트·NPC·spawn 좌표를 모두 모은다 (§6-5) */
export function occupiedPoints(){
  const pts = [];
  (ST.QUESTS || []).forEach(q => {
    if (q.pos && (!q.area || q.area === ST.currentArea)) pts.push([q.pos.x, q.pos.z]);
    if (q.items) q.items.forEach(it => it.pos && pts.push([it.pos.x, it.pos.z]));
  });
  (ST.NPCS || []).forEach(n => {
    if (n.pos && (!n.area || n.area === ST.currentArea)) pts.push([n.pos.x, n.pos.z]);
  });
  if (ST.spawnPos) pts.push([ST.spawnPos.x, ST.spawnPos.z]);
  return pts;
}

export function scatterTreesArea(n, xr, zr, exclude, kind){
  const avoid = occupiedPoints();
  const placed = [];
  const g = new THREE.Group();
  const ex = exclude || 6;
  let guard = 0;
  while (placed.length < n && guard++ < n * 40){
    const x = xr[0] + Math.random() * (xr[1] - xr[0]);
    const z = zr[0] + Math.random() * (zr[1] - zr[0]);
    if (Math.hypot(x, z) < ex) continue;
    if (Math.hypot(x, z) > ST.BOUND - 2) continue;
    if (!farEnough(x, z, avoid, 4.0)) continue;
    if (!farEnough(x, z, placed, 3.5)) continue;
    const t = (kind === 'broad' || (kind === 'mix' && Math.random() < .5))
      ? makeBroadTree(.8 + Math.random() * .5)
      : makeTree(.8 + Math.random() * .5);
    t.position.set(x, 0, z);
    t.rotation.y = Math.random() * 6.28;
    g.add(t);
    placed.push([x, z]);
  }
  return add(g);
}

export function scatterHouses(n, xr, zr, exclude, opts){
  opts = opts || {};
  const strawRatio = opts.strawRatio === undefined ? .55 : opts.strawRatio;
  const avoid = occupiedPoints().concat(opts.avoid || []);
  const placed = [];
  const ex = exclude || 8;
  let guard = 0, made = 0;
  while (made < n && guard++ < n * 50){
    const x = xr[0] + Math.random() * (xr[1] - xr[0]);
    const z = zr[0] + Math.random() * (zr[1] - zr[0]);
    if (Math.hypot(x, z) < ex) continue;
    if (Math.hypot(x, z) > ST.BOUND - 4) continue;
    if (!farEnough(x, z, avoid, 6.5)) continue;
    if (!farEnough(x, z, placed, 6.5)) continue;
    const rot = Math.random() * 6.28;
    if (Math.random() < strawRatio) buildStrawHouse(x, z, .9 + Math.random()*.3, rot);
    else buildTileHouse(x, z, .9 + Math.random()*.3, rot);
    placed.push([x, z]);
    made++;
  }
  return placed;
}

export function scatterRocks(n, xr, zr, exclude){
  const avoid = occupiedPoints();
  const placed = [];
  let guard = 0;
  while (placed.length < n && guard++ < n * 40){
    const x = xr[0] + Math.random() * (xr[1] - xr[0]);
    const z = zr[0] + Math.random() * (zr[1] - zr[0]);
    if (Math.hypot(x, z) < (exclude || 5)) continue;
    if (!farEnough(x, z, avoid, 3.2)) continue;
    if (!farEnough(x, z, placed, 4)) continue;
    buildRockCluster(x, z, 3, .6 + Math.random()*.6);
    placed.push([x, z]);
  }
  return placed;
}

/* ══════════════════════════════════════════════════════════════
   사람
   ══════════════════════════════════════════════════════════════ */
export function makeNPC(color, icon){
  const g = new THREE.Group();
  const c = color || '#8C6A4A';
  g.add(cyl(.32,.4,1.1,8, c, 0, .78, 0));           // 몸
  g.add(sph(.3, '#E8D3B8', 0, 1.6, 0, 0));           // 머리
  g.add(cyl(.1,.1,.7,6, c, -.42, .95, 0));           // 팔
  g.add(cyl(.1,.1,.7,6, c,  .42, .95, 0));
  g.add(cyl(.12,.12,.5,6,'#6E6A5E', -.14, .25, 0));  // 다리
  g.add(cyl(.12,.12,.5,6,'#6E6A5E',  .14, .25, 0));
  if (icon){
    const s = iconSprite(icon, .9);
    s.position.set(0, 2.5, 0);
    g.add(s);
  }
  g.userData.isNPC = true;
  return g;
}

/* ══════════════════════════════════════════════════════════════
   글자·아이콘 스프라이트
   ══════════════════════════════════════════════════════════════ */
const texCache = new Map();

export function iconTexture(emoji){
  if (texCache.has('i:' + emoji)) return texCache.get('i:' + emoji);
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d');
  x.font = '92px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(emoji, s/2, s/2 + 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set('i:' + emoji, t);
  return t;
}

export function iconSprite(emoji, scale){
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: iconTexture(emoji), transparent: true, depthWrite: false
  }));
  const s = scale || 1;
  sp.scale.set(s, s, s);
  return sp;
}

export function textSprite(text, scale, x, y, z){
  const key = 't:' + text;
  let t = texCache.get(key);
  if (!t){
    const pad = 16, fs = 44;
    const c = document.createElement('canvas');
    const m = c.getContext('2d');
    m.font = `700 ${fs}px Pretendard, sans-serif`;
    const w = Math.ceil(m.measureText(text).width) + pad * 2;
    c.width = w; c.height = fs + pad * 2;
    const x2 = c.getContext('2d');
    x2.font = `700 ${fs}px Pretendard, sans-serif`;
    x2.textAlign = 'center'; x2.textBaseline = 'middle';
    x2.fillStyle = 'rgba(255,255,255,.86)';
    x2.fillRect(0, 0, c.width, c.height);
    x2.fillStyle = '#191919';
    x2.fillText(text, c.width/2, c.height/2);
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    texCache.set(key, t);
  }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:t, transparent:true, depthWrite:false }));
  const s = scale || .012;
  sp.scale.set(t.image.width * s, t.image.height * s, 1);
  sp.position.set(x || 0, y || 0, z || 0);
  return sp;
}

/* ══════════════════════════════════════════════════════════════
   GLB — 없으면 기본 도형으로 대체된다 (§6-7)
   라이선스가 확인되지 않아 기본값은 '부르지 않음'이다 (§9-4)
   ══════════════════════════════════════════════════════════════ */
export const USE_GLB = false;

export function loadJagyeokru(x, z){
  // 자격루 — 기본 도형 폴백
  const g = new THREE.Group();
  g.add(box(2.2,.4,1.6,'#B6B09C', 0, .2, 0));
  g.add(cyl(.62,.72,1.5,10,'#8E7A5E', -.6, 1.0, 0));
  g.add(cyl(.5,.58,1.2,10,'#9C886A', .55, .85, 0));
  g.add(cyl(.2,.2,2.4,8,'#6E6A5E', 0, 1.9, -.5));
  g.add(box(.9,1.3,.14,'#C9BFA6', 0, 2.3, -.5));
  return place(g, x, z);
}

export function loadBronzeSpearhead(x, z){
  const g = new THREE.Group();
  g.add(cyl(.12,.14,2.0,6,'#7B5E42', 0, 1.0, 0));
  const tip = cone(.28, 1.0, 4, '#8FA37A', 0, 2.3, 0);
  g.add(tip);
  return place(g, x, z);
}
