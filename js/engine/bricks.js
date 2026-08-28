// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   bricks.js — 브릭으로 짓기 (Kenney Brick Kit 2024, CC0)

   왜 브릭인가: 상자와 원뿔만으로는 움집도 가마도 다 네모난 상자로 보인다.
   브릭은 스터드가 있어서 같은 크기라도 결이 생기고, 경사 브릭을 겹쳐 쌓으면
   초가지붕·움집 지붕처럼 읽힌다.

   색은 Kenney 팔레트를 쓰지 않고 우리 색을 입힌다 (§8-5 원색 금지).
   같은 모양·같은 색은 InstancedMesh 로 한 번에 그린다 — 브릭 수천 개를 놓아도
   드로우콜은 종류 수만큼만 든다.

   좌표
     brick()      x, y, z 를 우리 단위(캐릭터 키 2)로 직접 준다
     STUD         가로세로 한 칸  0.28
     BRICK_H      브릭 한 층      0.404
     PLATE_H      플레이트 한 층  0.177
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ST } from './state.js';

// 이 파일이 놓인 자리를 기준으로 잡는다 — tools/ 아래 미리보기에서도 같은 곳을 본다
const DIR = new URL('../../assets/kenney/bricks/', import.meta.url).href;
const SRC_STUD = 0.079;                 // 원본 브릭의 스터드 간격

export const STUD = 0.28;
const K = STUD / SRC_STUD;
export const BRICK_H = 0.114 * K;       // 0.404
export const PLATE_H = 0.05  * K;       // 0.177

/** 자주 쓰는 조각만 미리 받는다 — 74개를 다 받을 필요가 없다 */
const CORE = [
  'bevel-hq-brick-1x1', 'bevel-hq-brick-1x1-round', 'bevel-hq-brick-1x2',
  'bevel-hq-brick-1x4', 'bevel-hq-brick-2x2', 'bevel-hq-brick-2x4',
  'bevel-hq-brick-slope-1x2', 'bevel-hq-brick-slope-2x2',
  'bevel-hq-brick-slope-inverted-1x2',
  'none-hq-plate-1x1', 'none-hq-plate-1x1-round', 'none-hq-plate-1x2',
  'none-hq-plate-1x4', 'none-hq-plate-2x2', 'none-hq-plate-2x4',
  'none-hq-brick-1x1', 'none-hq-brick-1x2', 'none-hq-brick-2x2',
  // 스터드 없는 것 — 풀·바위·통나무처럼 '쌓은 티'가 나면 안 되는 곳에 쓴다
  'none-hq-brick-1x1-round', 'none-hq-brick-1x4', 'none-hq-brick-2x4',
  'none-hq-brick-slope-2x2'
];

const GEO = {};                          // 이름 → BufferGeometry (바닥 가운데가 원점)
let loadPromise = null;

/** 앱 시작 때 한 번. 실패해도 앱은 그대로 돈다 */
export function preloadBricks(list){
  if (loadPromise) return loadPromise;
  const loader = new GLTFLoader();
  const names = list || CORE;
  loadPromise = Promise.all(names.map(name =>
    loader.loadAsync(DIR + name + '.glb').then(g => {
      let geo = null;
      g.scene.traverse(o => { if (o.isMesh && !geo) geo = o.geometry; });
      if (!geo) return;
      geo = geo.clone();
      geo.scale(K, K, K);
      geo.computeBoundingBox();
      const b = geo.boundingBox;
      // 바닥 가운데를 원점으로 — 그래야 층층이 쌓기가 쉽다
      geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
      geo.computeVertexNormals();
      GEO[name] = geo;
    }).catch(() => { /* 한 조각이 없어도 나머지로 짓는다 */ })
  )).then(() => GEO);
  return loadPromise;
}

export function bricksReady(){ return Object.keys(GEO).length > 0; }

/* ── 담아 두었다가 한 번에 내보내기 ─────────────────────────── */
let bucket = new Map();                  // 'shape|color' → [Matrix4…]
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(),
      _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();

/**
 * 브릭 하나를 놓는다.
 * @param {string} shape  조각 이름 ('brick-1x2' 처럼 짧게 써도 bevel-hq- 를 붙여 준다)
 * @param {number} x,y,z  우리 단위 (y 는 브릭 바닥 높이)
 * @param {string} color  우리 팔레트 색
 * @param {number} rotY   라디안. 둥근 것을 만들 때 임의 각도로 돌린다
 * @param {number|number[]} scale  1 이거나 [x,y,z]
 */
export function brick(shape, x, y, z, color, rotY, scale){
  const name = GEO[shape] ? shape
             : (GEO['bevel-hq-' + shape] ? 'bevel-hq-' + shape
             : (GEO['none-hq-' + shape] ? 'none-hq-' + shape : shape));
  const key = name + '|' + color;
  if (!bucket.has(key)) bucket.set(key, []);
  _e.set(0, rotY || 0, 0);
  _q.setFromEuler(_e);
  _v.set(x, y, z);
  if (Array.isArray(scale)) _s.set(scale[0], scale[1], scale[2]);
  else _s.set(scale || 1, scale || 1, scale || 1);
  _m.compose(_v, _q, _s);
  bucket.get(key).push(_m.clone());
}

/** LEGO 좌표로 놓기 — 스터드 칸과 층 번호 */
export function studBrick(shape, sx, level, sz, color, quarter, plateLevels){
  brick(shape, sx * STUD, (level || 0) * BRICK_H + (plateLevels || 0) * PLATE_H,
        sz * STUD, color, (quarter || 0) * Math.PI / 2);
}

/** 담긴 것을 씬에 낸다. 조각이 아직 안 왔으면 오고 나서 낸다 */
export function flushBricks(scene){
  const mine = bucket;
  bucket = new Map();
  if (!mine.size) return null;

  const area = ST.WORLD_ID + ':' + ST.currentArea;

  const emit = () => {
    if (ST.WORLD_ID + ':' + ST.currentArea !== area) return null;   // 그새 지역이 바뀌었다
    const group = new THREE.Group();
    group.name = 'bricks';
    let n = 0;
    mine.forEach((list, key) => {
      const i = key.lastIndexOf('|');
      const shape = key.slice(0, i), color = key.slice(i + 1);
      const geo = GEO[shape];
      if (!geo) return;
      const im = new THREE.InstancedMesh(
        geo,
        new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: .93, metalness: 0 }),
        list.length
      );
      list.forEach((m, k) => im.setMatrixAt(k, m));
      im.instanceMatrix.needsUpdate = true;
      im.frustumCulled = false;
      group.add(im);
      n += list.length;
    });
    group.userData.count = n;
    scene.add(group);
    return group;
  };

  if (bricksReady()) return emit();
  preloadBricks().then(emit);
  return null;
}

/* ══════════════════════════════════════════════════════════════
   자주 쓰는 짜임
   ══════════════════════════════════════════════════════════════ */

/** 원을 따라 브릭을 돌려 놓는다 — 움집·가마처럼 둥근 것의 뼈대 */
export function ring(shape, cx, cz, radius, y, color, count, opts){
  opts = opts || {};
  const gapFrom = opts.gapFrom, gapTo = opts.gapTo;   // 입구로 비워 둘 각도 구간
  const jitter = opts.jitter || 0;
  for (let i = 0; i < count; i++){
    const a = (i / count) * Math.PI * 2 + (opts.offset || 0);
    if (gapFrom != null){
      let d = a - gapFrom;
      while (d < 0) d += Math.PI * 2;
      while (d > Math.PI * 2) d -= Math.PI * 2;
      if (d < (gapTo - gapFrom)) continue;
    }
    const r = radius + (jitter ? (Math.sin(i * 12.9898) * .5) * jitter : 0);
    brick(shape, cx + Math.cos(a) * r, y, cz + Math.sin(a) * r, color,
          -a + Math.PI / 2, opts.scale);
  }
}

/** 네모 벽 한 겹 */
export function wallRect(shape, cx, cz, halfW, halfD, y, color){
  const step = STUD * 2;
  for (let x = -halfW; x <= halfW; x += step){
    brick(shape, cx + x, y, cz - halfD, color, 0);
    brick(shape, cx + x, y, cz + halfD, color, 0);
  }
  for (let z = -halfD + step; z <= halfD - step; z += step){
    brick(shape, cx - halfW, y, cz + z, color, Math.PI / 2);
    brick(shape, cx + halfW, y, cz + z, color, Math.PI / 2);
  }
}

/** 바닥 깔개 — 흙바닥, 마당 */
export function pad(cx, cz, halfW, halfD, y, color){
  const step = STUD * 2;
  for (let x = -halfW; x <= halfW; x += step)
    for (let z = -halfD; z <= halfD; z += step)
      brick('none-hq-plate-2x2', cx + x, y || 0, cz + z, color, 0);
}
