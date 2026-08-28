// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   props.js — 시대 전용 소품 (MASTER.md §6-7)

   콘텐츠 문서의 「지역 지형 배치」 표는 시대 전용 빌더 165개를 이름으로만
   부른다(표 안에 for/if 같은 부스러기가 섞여 있어 인자를 신뢰할 수 없다).
   그래서 이름의 낱말로 무엇을 놓을지 정한다.

   전부 공용 빌더의 조합이다. 지붕 꼭대기는 언제나 y >= 3.0 (§6-3).
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { ST } from './state.js';
import {
  mat, box, cyl, cone, sph, place, add,
  buildGround, buildWater, buildMountains, buildMountainsWide,
  jRoofHanok, buildStrawHouse, buildTileHouse, brickBuilding, timberGate,
  buildFortressWall, buildStonePagoda, buildTombMound, buildTrainingGround,
  buildPier, buildShipHull, buildDolmen, buildFirePit, buildPitHouse,
  buildKiln, buildWell, buildFlagPole, buildBonfireTower, buildRockCluster,
  buildStack, scatterTreesArea, scatterRocks, makeTree, textSprite, iconSprite
} from './scene-helpers.js';

/* ── 낱낱의 소품 ─────────────────────────────────────────────── */

export function buildFenceRow(x, z, len, color, rotY){
  const g = new THREE.Group();
  const n = Math.max(2, Math.floor((len || 10) / 1.4));
  for (let i = 0; i < n; i++){
    const t = (i - (n-1)/2) * 1.4;
    g.add(cyl(.08,.08,1.5,5, color || '#8A6E52', t, .75, 0));
  }
  g.add(box(len || 10, .1, .08, color || '#8A6E52', 0, 1.2, 0));
  g.add(box(len || 10, .1, .08, color || '#8A6E52', 0, .7, 0));
  return place(g, x, z, rotY);
}

export function buildBarbedFence(x, z, len, rotY){
  const g = new THREE.Group();
  const n = Math.max(2, Math.floor((len || 12) / 2));
  for (let i = 0; i < n; i++){
    const t = (i - (n-1)/2) * 2;
    g.add(cyl(.07,.07,1.8,5,'#6E6A5E', t, .9, 0));
  }
  for (let k = 0; k < 3; k++)
    g.add(box(len || 12, .04, .04, '#8E8A7C', 0, .6 + k * .5, 0));
  return place(g, x, z, rotY);
}

export function buildTower(x, z, h, color){
  const g = new THREE.Group();
  const H = h || 6;
  g.add(cyl(.9, 1.5, H, 8, color || '#B6B09C', 0, H/2, 0));
  g.add(cyl(1.5, 1.5, .4, 8, color || '#A9A69A', 0, H + .2, 0));
  const roof = cone(1.7, 1.2, 6, '#6B7280', 0, H + 1.0, 0);
  g.add(roof);
  return place(g, x, z);
}

export function buildHall(x, z, w, d, h){
  return jRoofHanok(x, z, w || 5, d || 3.6, h || 2.9, '#E4DCC6', '#5A6470');
}

export function buildShrine(x, z){
  const g = new THREE.Group();
  g.add(box(3.2, .4, 3.2, '#BDB6A4', 0, .2, 0));
  g.add(cyl(.16,.16,2.4,6,'#8A6E52', -1.2, 1.2, -1.2));
  g.add(cyl(.16,.16,2.4,6,'#8A6E52',  1.2, 1.2, -1.2));
  g.add(cyl(.16,.16,2.4,6,'#8A6E52', -1.2, 1.2,  1.2));
  g.add(cyl(.16,.16,2.4,6,'#8A6E52',  1.2, 1.2,  1.2));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.5, 4), mat('#5B3B33'));
  roof.rotation.y = Math.PI/4; roof.position.y = 3.2;
  g.add(roof);
  return place(g, x, z);
}

export function buildMarketRowProp(x, z, n, rotY){
  const g = new THREE.Group();
  const k = n || 4;
  for (let i = 0; i < k; i++){
    const t = (i - (k-1)/2) * 3.0;
    const s = new THREE.Group();
    s.add(cyl(.09,.09,1.9,5,'#8A6E52', -1.0, .95, -.8));
    s.add(cyl(.09,.09,1.9,5,'#8A6E52',  1.0, .95, -.8));
    s.add(cyl(.09,.09,1.9,5,'#8A6E52', -1.0, .95,  .8));
    s.add(cyl(.09,.09,1.9,5,'#8A6E52',  1.0, .95,  .8));
    const cloth = box(2.6, .12, 2.0, i % 2 ? '#C9BFA6' : '#D8CBA8', 0, 2.0, 0);
    s.add(cloth);
    s.add(box(2.2, .5, 1.2, '#A98C68', 0, .8, 0));
    s.position.set(t, 0, 0);
    g.add(s);
  }
  return place(g, x, z, rotY);
}

export function buildField(x, z, w, d, color){
  const g = new THREE.Group();
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w || 12, d || 8), mat(color || '#C6C08E'));
  f.rotation.x = -Math.PI/2; f.position.y = .02;
  g.add(f);
  const rows = Math.floor((d || 8) / 1.2);
  for (let i = 0; i < rows; i++){
    const zz = (i - (rows-1)/2) * 1.2;
    g.add(box(w || 12, .12, .3, '#A89A66', 0, .1, zz));
  }
  return place(g, x, z);
}

export function buildBridge(x, z, len, broken, rotY){
  const g = new THREE.Group();
  const L = len || 14;
  const span = broken ? L * .38 : L;
  g.add(box(2.8, .4, span, '#A9A69A', 0, 1.6, broken ? -(L/2 - span/2) : 0));
  if (broken) g.add(box(2.8, .4, span * .8, '#A9A69A', 0, 1.6, (L/2 - span*.4)));
  const n = broken ? 2 : Math.floor(L / 4);
  for (let i = 0; i < n; i++){
    const t = (i - (n-1)/2) * 4;
    g.add(cyl(.36,.42,1.6,6,'#8E8A7C', -1.1, .8, t));
    g.add(cyl(.36,.42,1.6,6,'#8E8A7C',  1.1, .8, t));
  }
  return place(g, x, z, rotY);
}

export function buildStreetProp(x, z, kind){
  const g = new THREE.Group();
  if (kind === 'lamp'){
    g.add(cyl(.09,.12,3.2,6,'#4E4A42', 0, 1.6, 0));
    g.add(sph(.3, '#F0E4C0', 0, 3.4, 0, 0));
  } else if (kind === 'telegraph'){
    g.add(cyl(.13,.16,4.6,6,'#7B5E42', 0, 2.3, 0));
    g.add(box(1.8,.1,.1,'#7B5E42', 0, 4.3, 0));
    g.add(box(1.4,.1,.1,'#7B5E42', 0, 3.9, 0));
  } else if (kind === 'rail'){
    for (let i = 0; i < 14; i++)
      g.add(box(2.6,.1,.4,'#8A7458', 0, .06, (i - 6.5) * 1.6));
    g.add(box(.14,.14,22,'#6E6A5E', -.9, .16, 0));
    g.add(box(.14,.14,22,'#6E6A5E',  .9, .16, 0));
  } else if (kind === 'tram' || kind === 'train'){
    g.add(box(2.4, 2.0, 6.0, kind === 'tram' ? '#4B6FA0' : '#3E3A34', 0, 1.3, 0));
    g.add(box(2.5, .3, 6.2, '#2F2C28', 0, 2.4, 0));
    for (let i = -1; i <= 1; i += 2){
      g.add(box(.5,.6,.5,'#8E8A7C', i * 1.0, .35, 2.0));
      g.add(box(.5,.6,.5,'#8E8A7C', i * 1.0, .35, -2.0));
    }
    if (kind === 'train') g.add(cyl(.28,.34,1.2,6,'#5E5A52', 0, 2.9, 2.2));
  } else if (kind === 'rickshaw'){
    g.add(box(1.1,.8,1.3,'#7B5E42', 0, .8, 0));
    g.add(cyl(.5,.5,.1,10,'#4E4A42', -.7, .5, 0));
    g.add(cyl(.5,.5,.1,10,'#4E4A42',  .7, .5, 0));
    g.children[1].rotation.z = Math.PI/2;
    g.children[2].rotation.z = Math.PI/2;
  }
  return place(g, x, z);
}

export function buildWarehouseProp(x, z, w, d, h){
  const g = new THREE.Group();
  w = w || 6; d = d || 4.4; h = h || 3.6;
  g.add(box(w, h, d, '#B0A894', 0, h/2, 0));
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(d/1.9, d/1.9, w, 8, 1, false, 0, Math.PI), mat('#8E8A7C'));
  roof.rotation.z = Math.PI/2;
  roof.position.y = h;
  g.add(roof);
  g.add(box(1.6, 2.0, .1, '#6E6A5E', 0, 1.0, d/2 + .02));
  return place(g, x, z);
}

export function buildCrates(x, z, n){
  const g = new THREE.Group();
  const k = n || 6;
  for (let i = 0; i < k; i++){
    const c = box(1.0, .8, 1.0, i % 2 ? '#A98C68' : '#9A7E5E',
                  (i % 3 - 1) * 1.15, .4 + Math.floor(i / 3) * .85, ((i % 2) - .5) * 1.1);
    c.rotation.y = i * .3;
    g.add(c);
  }
  return place(g, x, z);
}

export function buildRubble(x, z, n){
  const g = new THREE.Group();
  const k = n || 8;
  for (let i = 0; i < k; i++){
    const a = i / k * Math.PI * 2;
    const r = .6 + (i % 3) * .7;
    const b = box(.5 + (i%3)*.3, .3 + (i%2)*.25, .5 + (i%4)*.2,
                  i % 2 ? '#A5A296' : '#B8B2A2', Math.cos(a) * r, .2, Math.sin(a) * r);
    b.rotation.set(i * .4, i * .7, i * .2);
    g.add(b);
  }
  return place(g, x, z);
}

export function buildRuinedHouse(x, z, rotY){
  const g = new THREE.Group();
  g.add(box(3.0, 1.6, 2.6, '#B0A894', 0, .8, 0));
  const bw = box(1.2, 1.0, .2, '#A5A296', -1.0, 2.0, -1.2);
  bw.rotation.z = .22;
  g.add(bw);
  g.add(box(.2, 1.4, 2.6, '#A5A296', 1.5, 1.7, 0));
  return place(g, x, z, rotY);
}

export function buildBunker(x, z){
  const g = new THREE.Group();
  g.add(box(4.2, 1.6, 3.0, '#8E8A7C', 0, .8, 0));
  g.add(box(4.4, .4, 3.2, '#7E7A6E', 0, 1.7, 0));
  g.add(box(2.4, .4, .1, '#3E3A34', 0, 1.2, 1.55));
  for (let i = 0; i < 6; i++)
    g.add(sph(.42, '#A89A78', (i % 3 - 1) * 1.4, .3, 1.9 + Math.floor(i / 3) * .7));
  return place(g, x, z);
}

export function buildTankHull(x, z, rotY){
  const g = new THREE.Group();
  g.add(box(3.0, 1.0, 5.0, '#5E6350', 0, .9, 0));
  g.add(box(1.9, .8, 2.2, '#6A705A', 0, 1.7, -.3));
  g.add(cyl(.16,.16,3.2,6,'#4E5344', 0, 1.8, 1.6));
  g.children[2].rotation.x = Math.PI/2;
  g.add(box(.7, 1.0, 5.2, '#3E4238', -1.5, .5, 0));
  g.add(box(.7, 1.0, 5.2, '#3E4238',  1.5, .5, 0));
  return place(g, x, z, rotY);
}

export function buildHedgehogs(x, z, n){
  const g = new THREE.Group();
  const k = n || 4;
  for (let i = 0; i < k; i++){
    const s = new THREE.Group();
    for (let a = 0; a < 3; a++){
      const b = cyl(.09,.09,2.2,4,'#6E6A5E', 0, .8, 0);
      b.rotation.set(a === 0 ? .9 : 0, a * 1.05, a === 0 ? 0 : .9);
      s.add(b);
    }
    s.position.set((i - (k-1)/2) * 2.4, 0, 0);
    g.add(s);
  }
  return place(g, x, z);
}

export function buildTentCluster(x, z, n){
  const g = new THREE.Group();
  const k = n || 4;
  for (let i = 0; i < k; i++){
    const a = i / k * Math.PI * 2;
    const t = new THREE.Group();
    const cone1 = cone(1.5, 2.4, 4, i % 2 ? '#C9BFA6' : '#B6AE96', 0, 1.2, 0);
    cone1.rotation.y = Math.PI/4;
    t.add(cone1);
    t.add(box(.7, .9, .06, '#7E7A6E', 0, .45, 1.0));
    t.position.set(Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4);
    g.add(t);
  }
  return place(g, x, z);
}

export function buildShantyHouse(x, z, rotY){
  const g = new THREE.Group();
  g.add(box(2.4, 1.5, 2.2, '#B0A08C', 0, .75, 0));
  const roof = box(2.9, .12, 2.7, '#8E8A7C', 0, 1.55, 0);
  roof.rotation.z = .07;
  g.add(roof);
  g.add(box(.6, .9, .06, '#7B5E42', 0, .45, 1.12));
  g.add(box(.4, .5, .05, '#5E7E86', .8, 1.0, 1.12));
  return place(g, x, z, rotY);
}

export function buildBooth(x, z){
  const g = new THREE.Group();
  g.add(box(1.4, 2.2, 1.4, '#DCD3BE', 0, 1.1, 0));
  g.add(box(1.6, .18, 1.6, '#8A7B4E', 0, 2.25, 0));
  g.add(box(1.0, 1.6, .06, '#6E6A5E', 0, 1.0, .72));
  return place(g, x, z);
}

export function buildStele(x, z, label){
  const g = new THREE.Group();
  g.add(box(1.4, .3, 1.0, '#A9A69A', 0, .15, 0));
  g.add(box(.7, 2.2, .3, '#B6B09C', 0, 1.3, 0));
  g.add(box(.95, .22, .5, '#9C9A8E', 0, 2.5, 0));
  if (label) g.add(textSprite(label, .011, 0, 3.2, 0));
  return place(g, x, z);
}

export function buildChurch(x, z){
  const g = new THREE.Group();
  g.add(box(4.4, 3.4, 6.2, '#C9BFA6', 0, 1.7, 0));
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 6.2, 8, 1, false, 0, Math.PI), mat('#8E6A5C'));
  roof.rotation.z = Math.PI/2; roof.position.y = 3.4;
  g.add(roof);
  g.add(box(1.8, 6.0, 1.8, '#BDB6A4', 0, 3.0, -3.4));
  g.add(cone(1.3, 2.6, 4, '#6B7280', 0, 7.3, -3.4));
  g.add(box(.14, 1.0, .14, '#E4DCC6', 0, 9.0, -3.4));
  g.add(box(.7, .14, .14, '#E4DCC6', 0, 8.75, -3.4));
  return place(g, x, z);
}

export function buildCannon(x, z, rotY){
  const g = new THREE.Group();
  g.add(cyl(.22,.3,2.4,8,'#4E4A42', 0, .9, 0));
  g.children[0].rotation.x = Math.PI/2.4;
  g.add(cyl(.55,.55,.14,10,'#7B5E42', -.6, .5, -.5));
  g.add(cyl(.55,.55,.14,10,'#7B5E42',  .6, .5, -.5));
  g.children[1].rotation.z = Math.PI/2;
  g.children[2].rotation.z = Math.PI/2;
  return place(g, x, z, rotY);
}

export function buildCrane(x, z){
  // 거중기
  const g = new THREE.Group();
  g.add(box(2.6, .3, 2.6, '#8A6E52', 0, .15, 0));
  g.add(cyl(.16,.16,4.4,6,'#7B5E42', -1.0, 2.2, 0));
  g.add(cyl(.16,.16,4.4,6,'#7B5E42',  1.0, 2.2, 0));
  g.add(box(2.6, .2, .2, '#7B5E42', 0, 4.4, 0));
  g.add(cyl(.3,.3,.5,10,'#6E6A5E', 0, 4.1, 0));
  g.add(box(.06, 2.0, .06, '#8E8A7C', 0, 3.1, 0));
  g.add(box(1.2, .8, 1.2, '#A9A69A', 0, 2.0, 0));
  return place(g, x, z);
}

export function buildShellMound(x, z){
  const g = new THREE.Group();
  for (let i = 0; i < 14; i++){
    const a = i / 14 * Math.PI * 2;
    const r = .5 + (i % 4) * .45;
    g.add(sph(.24, i % 2 ? '#E4DCC6' : '#D8CFB6', Math.cos(a) * r, .18 + (i % 3) * .22, Math.sin(a) * r));
  }
  return place(g, x, z);
}

export function buildCanoe(x, z, rotY){
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 4.4, 8, 1, false, 0, Math.PI), mat('#7B5E42'));
  hull.rotation.z = Math.PI/2;
  hull.rotation.y = Math.PI;
  hull.position.y = .4;
  g.add(hull);
  g.add(cyl(.06,.06,2.4,5,'#8A6E52', .5, .8, .6));
  return place(g, x, z, rotY);
}

export function buildCaveCamp(x, z){
  const g = new THREE.Group();
  const rock = sph(3.2, '#A5A296', 0, .6, 0, 0);
  rock.scale.set(1, .8, 1.2);
  g.add(rock);
  g.add(box(1.6, 1.6, .6, '#5E5A52', 0, .8, 2.2));
  return place(g, x, z);
}

export function buildMammothGround(x, z){
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++){
    g.add(box(.28, .28, 2.6, '#E4DCC6', (i - 2) * .8, .14, 0));
  }
  g.add(sph(.9, '#C9BFA6', 0, .5, -2.2, 0));
  g.add(cyl(.1,.1,2.2,5,'#E8E2D0', -.7, .6, -2.8));
  g.add(cyl(.1,.1,2.2,5,'#E8E2D0',  .7, .6, -2.8));
  return place(g, x, z);
}

/* ══════════════════════════════════════════════════════════════
   이름의 낱말로 무엇을 놓을지 정한다
   ══════════════════════════════════════════════════════════════ */
const RULES = [
  [/GroundWide/i,                (x,z)=>{ buildGround(); buildMountainsWide(); }],
  [/Ground|Haze/i,               ()=>{ buildGround(); }],
  [/Hills|Mountain/i,            ()=>{ buildMountains(); }],
  [/River|Water|Coast|Harbor|Flood|Sea/i, (x,z)=>buildWater(x||0, z||0, 34, 120)],
  [/Reeds|Bushes/i,              (x,z)=>{ for(let i=0;i<7;i++) buildStack((x||0)+(i%3-1)*2.2, (z||0)+Math.floor(i/3)*2.0, 'shell'); }],
  [/Trees|Forest/i,              ()=>scatterTreesArea(24, [-32,32], [-32,28], 6, 'mix')],
  [/Rocks|Rubble/i,              (x,z)=>buildRubble(x||0, z||0, 8)],
  [/ShellMound/i,                buildShellMound],
  [/Canoe|Boat/i,                buildCanoe],
  [/CaveCamp|Cave/i,             buildCaveCamp],
  [/Mammoth/i,                   buildMammothGround],
  [/Dolmen/i,                    (x,z)=>buildDolmen(x, z, 1.1)],
  [/Kiln|Gama|Forge|Casting|Jejakso|Hwapo/i, buildKiln],
  [/Paddy|Field|Farm|Mokhwabat|Batt/i, (x,z)=>buildField(x, z, 12, 8)],
  [/Well/i,                      buildWell],
  [/TentSchool|Tent/i,           (x,z)=>buildTentCluster(x, z, 4)],
  [/Shanty(House)?$/i,           buildShantyHouse],
  [/ShantyTown|DosiRow|Village|Row$/i,
                                 (x,z)=>{ for(let i=0;i<5;i++) buildShantyHouse((x||0)+(i%3-1)*5.2, (z||0)+Math.floor(i/3)*5.0, i*.7); }],
  [/Market|Jangsi|Stall|Jeojatgeori|Mitsukoshi/i, (x,z)=>buildMarketRowProp(x, z, 4)],
  [/Warehouse|Cargo|Storehouse|Crates/i, (x,z)=>{ buildWarehouseProp(x, z); buildCrates((x||0)+5, (z||0)+2, 6); }],
  [/Bunker/i,                    buildBunker],
  [/Watchtower|Tower|Observatory|Lighthouse|Bongsudae|Spire/i, (x,z)=>buildTower(x, z, 6.5)],
  [/Church/i,                    buildChurch],
  [/BrokenBridge/i,              (x,z)=>buildBridge(x, z, 16, true)],
  [/Bridge/i,                    (x,z)=>buildBridge(x, z, 14, false)],
  [/BarbedWire|Barbed/i,         (x,z)=>buildBarbedFence(x, z, 14)],
  [/Hedgehog/i,                  (x,z)=>buildHedgehogs(x, z, 4)],
  [/Tank/i,                      buildTankHull],
  [/Sandbag/i,                   (x,z)=>{ for(let i=0;i<8;i++) sandbag(x,z,i); }],
  [/Fence|MemorialFence|IronFence|FieldFence/i, (x,z)=>buildFenceRow(x, z, 12)],
  [/RuinedHouse|Ruin/i,          buildRuinedHouse],
  [/Cannon/i,                    buildCannon],
  [/Crane/i,                     buildCrane],
  [/Rickshaw/i,                  (x,z)=>buildStreetProp(x, z, 'rickshaw')],
  [/Tram/i,                      (x,z)=>buildStreetProp(x, z, 'tram')],
  [/SteamTrain|Train/i,          (x,z)=>buildStreetProp(x, z, 'train')],
  [/RailTrack|Rail/i,            (x,z)=>buildStreetProp(x, z, 'rail')],
  [/Telegraph/i,                 (x,z)=>buildStreetProp(x, z, 'telegraph')],
  [/StreetLamp|Lamp/i,           (x,z)=>buildStreetProp(x, z, 'lamp')],
  [/SteamShip|Ship/i,            (x,z)=>buildShipHull(x, z, 1.2)],
  [/Pier|Port|Waegwan|Dock/i,    (x,z)=>buildPier(x, z, 14)],
  [/StationGate|CityWallGate|GateSign|Gate/i, (x,z)=>timberGate(x, z, 4.6, '#6B7280')],
  [/Fort|Northern|Defense|Wall/i,(x,z)=>buildFortressWall(x, z, 20, 'x', '#A9A79A')],
  [/Palace|Capitol|Govt|Provisional|Gyeongbok|Legation/i, (x,z)=>buildHall(x, z, 6, 4.4, 3.4)],
  [/Shrine|Altar|Jongmyo|Sajik|Dangun|Heungdeoksa|Panjeon|Gagwol/i, buildShrine],
  [/Pagoda|Tapgol/i,             (x,z)=>{ buildStonePagoda(x, z); scatterTreesArea(6, [(x||0)-8,(x||0)+8], [(z||0)-8,(z||0)+8], 3); }],
  [/School|Seodang|Jiphyeonjeon|Gwahak/i, (x,z)=>buildHall(x, z, 4.6, 3.4, 2.8)],
  [/Park|Hongkou/i,              (x,z)=>{ scatterTreesArea(10, [(x||0)-10,(x||0)+10], [(z||0)-10,(z||0)+10], 3, 'broad'); buildFenceRow(x, (z||0)+8, 14); }],
  [/Booth|Voting/i,              buildBooth],
  [/Stele|Sign|Marker|Flag/i,    (x,z)=>buildStele(x, z)],
  [/Camp|Independence|Battle/i,  (x,z)=>{ buildTentCluster(x, z, 4); buildFlagPole((x||0)+4, (z||0)-3, '#A8534F'); }],
  [/Street|Jongno|Yukjo|Road/i,  (x,z)=>{ buildMarketRowProp(x, z, 3); buildStreetProp((x||0)+6, (z||0), 'lamp'); }],
  [/Bell|Pavilion/i,             (x,z)=>{ buildHall(x, z, 3.6, 3.6, 3.0); }],
  [/Hub|Gukgyeong|Border/i,      (x,z)=>{ buildStele(x, z); buildFlagPole((x||0)+3, (z||0), '#6E9B94'); }],
  [/House|Home/i,                (x,z)=>buildStrawHouse(x, z, 1.1, 0)],
  [/Brick|Building/i,            (x,z)=>brickBuilding(x, z, 5, 4, 4.6)]
];

function sandbag(x, z, i){
  const g = new THREE.Group();
  g.add(sph(.4, '#A89A78', (i % 4 - 1.5) * .8, .28 + Math.floor(i / 4) * .5, 0));
  place(g, x || 0, z || 0);
}

/** 이름으로 시대 소품을 놓는다. 맞는 낱말이 없으면 바위 무더기를 놓는다 */
export function eraProp(name, x, z){
  const n = String(name || '').replace(/^build/, '');
  for (const [re, fn] of RULES){
    if (re.test(n)){
      try { return fn(x, z); } catch(e){ console.warn('[eraProp]', n, e); return null; }
    }
  }
  return buildRockCluster(x || 0, z || 0, 4, 1.0);
}
