// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   props-neolithic.js — 신석기 전용 지형지물 (브릭)

   왜 따로 만드는가: 이름의 낱말로 고르는 일반 규칙(props.js)은
   buildVillageNeo 를 '판잣집 다섯 채'로 보냈다. 신석기 마을이 판잣집일 수는 없다.
   신석기는 **움집**이다 — 땅을 파고 그 위에 원뿔 지붕을 덮은 집.

   콘텐츠 문서의 배치표가 인자를 주지 않아(모두 `buildXxxNeo()`) 전부 원점에
   겹쳐 놓이던 문제도 여기서 함께 고친다. 각 소품이 스스로 제 자리를 고른다.

   에셋 — Kenney Brick Kit (CC0). 색은 우리 팔레트를 입힌다 (§8-5).
   ══════════════════════════════════════════════════════════════════════ */
import { ST } from './state.js';
import { brick, ring, pad, STUD, BRICK_H, PLATE_H } from './bricks.js';
import { scatterTreesArea } from './scene-helpers.js';
import { buildWetPatch } from './props.js';   // 되돌이 import — 부를 때에는 이미 다 실려 있다

/* ── 색 ─────────────────────────────────────────────────────── */
const C = {
  thatchA: '#C7AC74',      // 이엉(짚) 밝은 켜
  thatchB: '#B79A63',      // 이엉 어두운 켜
  thatchTop: '#A98A55',
  timber:  '#8A6E52',      // 나무 기둥
  timberD: '#75593F',
  dirt:    '#AD9A76',      // 파낸 흙
  dirtD:   '#948362',
  stone:   '#A9A69A',
  stoneD:  '#8E8A7C',
  shell:   '#E8E2D0',      // 조개
  shellD:  '#D6CEB6',
  ash:     '#7E7A6E',
  ember:   '#C7663E',
  green:   '#7C9B6E',
  reed:    '#9DA96E',
  clay:    '#A8785A'
};

/* ══════════════════════════════════════════════════════════════
   자리 고르기 — 임무 마커와 겹치지 않게
   ══════════════════════════════════════════════════════════════ */
/** 낮은 사양이면 성기게 짓는다 — 모양은 그대로, 조각 수만 줄인다 */
function lod(){ return ST.lowSpec ? 0.6 : 1; }

function seedRng(seed){
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function markerSpots(){
  const pts = [];
  (ST.QUESTS || []).forEach(q => {
    if (q.pos && (!q.area || q.area === ST.currentArea)) pts.push([q.pos.x, q.pos.z, 3.2]);
    if (q.items) q.items.forEach(it => it.pos && pts.push([it.pos.x, it.pos.z, 2.4]));
  });
  (ST.NPCS || []).forEach(n => {
    if (n.pos && (!n.area || n.area === ST.currentArea)) pts.push([n.pos.x, n.pos.z, 2.4]);
  });
  if (ST.spawnPos) pts.push([ST.spawnPos.x, ST.spawnPos.z, 5]);
  return pts;
}

/** 소품이 차지한 자리 — 풀을 뿌릴 때 피하라고 알려 준다 (skyground 가 읽는다) */
function claim(x, z, r){
  ST.propSpots = ST.propSpots || [];
  ST.propSpots.push([x, z, r]);
}

/**
 * 배치표가 좌표를 주지 않으므로 스스로 빈자리를 찾는다.
 * @param seed  같은 지역이면 늘 같은 자리에 놓이도록
 * @param want  { angle, radius, size }  대략 이쯤에 놓고 싶다
 */
function findSpot(seed, want){
  const b = ST.BOUND || 38;
  const rng = seedRng(seed);
  const taken = markerSpots().concat(ST.propSpots || []);
  const size = want.size || 4;

  for (let attempt = 0; attempt < 90; attempt++){
    const spread = attempt / 90;
    const a = want.angle + (rng() - .5) * (0.5 + spread * 2.6);
    const r = Math.max(6, Math.min(b - size - 3,
              want.radius * b + (rng() - .5) * (4 + spread * b * .5)));
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    let ok = true;
    for (const t of taken){
      const need = size + (t[2] || 3);
      if ((x - t[0]) ** 2 + (z - t[1]) ** 2 < need * need){ ok = false; break; }
    }
    if (ok){ claim(x, z, size); return { x, z, rng }; }
  }
  const a = want.angle, r = want.radius * b;
  const x = Math.cos(a) * r, z = Math.sin(a) * r;
  claim(x, z, size);
  return { x, z, rng };
}

/* ══════════════════════════════════════════════════════════════
   ★ 움집 — 신석기 집
   땅을 둥글게 파고 흙 둔덕을 두른 뒤, 그 위에 나뭇가지를 세워
   원뿔을 만들고 이엉(짚)을 덮는다. 한쪽에 낮은 출입구가 있다.
   ══════════════════════════════════════════════════════════════ */
export function pitHouse(cx, cz, opts){
  opts = opts || {};
  const R = opts.radius || 2.55;          // 바닥 반지름 (우리 단위)
  const levels = opts.levels || 10;       // 지붕 켜 수 (마루 4.2 — 캐릭터 키 2의 두 배)
  const face = opts.face == null ? Math.PI / 2 : opts.face;   // 출입구가 보는 방향
  const doorHalf = 0.42;                  // 출입구가 차지하는 각도(라디안) 절반

  /* ① 파낸 자리와 흙 둔덕 */
  const rimR = R + 0.22;
  const rimN = Math.max(12, Math.round((2 * Math.PI * rimR) / (STUD * 2)));
  ring('none-hq-plate-1x2', cx, cz, rimR, 0, C.dirt, rimN, { jitter: .06 });
  ring('none-hq-plate-1x2', cx, cz, rimR - .14, PLATE_H, C.dirtD, rimN - 2, { offset: .2 });

  // 파인 바닥 (조금 낮게 깔아 안이 움푹해 보이게)
  pad(cx, cz, R * .55, R * .55, -0.04, C.dirtD);

  /* ② 지붕 — 얇은 켜를 촘촘히 올린다.
     두꺼운 켜로 쌓으면 층이 크게 져 벌집이나 케이크처럼 보인다. */
  const courses = Math.max(9, Math.round(levels * 3 * lod()));   // 켜 수 (플레이트 높이)
  const topY = PLATE_H * courses;
  for (let lv = 0; lv < courses; lv++){
    const t = lv / courses;
    const r = R * Math.pow(1 - t, 0.95);           // 곧게 선 원뿔 — 움집은 배가 부르지 않다
    if (r < STUD * .6) break;
    const y = lv * PLATE_H;
    const n = Math.max(6, Math.round((2 * Math.PI * r) / (STUD * 2)));
    // 세 켜마다 빛깔을 바꾼다 — 이엉을 한 다발씩 얹은 결
    const color = (lv % 6 < 3) ? C.thatchA : C.thatchB;
    const gap = y < BRICK_H * 3.2;                 // 출입구는 아래쪽만 비운다

    ring('plate-1x2', cx, cz, r, y, color, n, {
      offset: lv * 0.19,                           // 켜마다 어긋나게
      gapFrom: gap ? face - doorHalf : null,
      gapTo:   gap ? face + doorHalf : null
    });
  }

  /* ②-b 서까래 — 이엉 위로 드러난 나무. 이것이 있어야 움집으로 보인다 */
  const rafters = ST.lowSpec ? 6 : 9;
  for (let i = 0; i < rafters; i++){
    const a = (i / rafters) * Math.PI * 2 + 0.17;
    // 출입구 쪽은 비운다
    let d = a - (face - doorHalf);
    while (d < 0) d += Math.PI * 2;
    if (d < doorHalf * 2) continue;
    const steps = Math.round(topY / (BRICK_H * .9));
    for (let lv = 0; lv <= steps; lv++){
      const t = lv / steps;
      const r = R * Math.pow(1 - t, 0.95) + 0.12;
      brick('brick-1x1', cx + Math.cos(a) * r, t * topY, cz + Math.sin(a) * r,
            lv % 2 ? C.timber : C.timberD, -a + Math.PI / 2, [.42, 1.3, .42]);
    }
  }

  /* ③ 꼭대기 — 연기 구멍과 마루 */
  ring('brick-1x1', cx, cz, STUD * 1.15, topY - BRICK_H, C.thatchTop, 7, {});
  brick('brick-1x1-round', cx, topY - BRICK_H * .25, cz, C.timberD, 0, [1.1, .7, 1.1]);

  /* ④ 출입구 — 기둥 둘과 인방, 그 앞 흙자리 */
  const dx = Math.cos(face), dz = Math.sin(face);
  const px = -Math.sin(face), pz = Math.cos(face);
  const doorR = R * .92;
  for (const s of [-1, 1]){
    for (let lv = 0; lv < 3; lv++){
      brick('brick-1x1', cx + dx * doorR + px * s * .42, PLATE_H + lv * BRICK_H,
            cz + dz * doorR + pz * s * .42, C.timber, face);
    }
  }
  brick('brick-1x4', cx + dx * doorR, PLATE_H + 3 * BRICK_H, cz + dz * doorR, C.timberD, face + Math.PI / 2);
  // 문 앞 밟은 자리
  brick('none-hq-plate-2x4', cx + dx * (R + .5), 0.01, cz + dz * (R + .5), C.dirtD, face + Math.PI / 2, [1.2, 1, 1.2]);

  /* ⑤ 안의 화덕 — 움집 한가운데에는 늘 불자리가 있었다. 문으로 들여다보인다 */
  ring('brick-1x1', cx, cz, .42, -0.04, C.stone, 7, {});
  brick('none-hq-plate-1x1', cx, 0.0, cz, C.ember, .3, [1.6, 1, 1.6]);

  /* ⑥ 처마 밑 살림 — 저장 토기와 땔감 */
  const sx = cx + Math.cos(face + 1.5) * (R + .55);
  const sz = cz + Math.sin(face + 1.5) * (R + .55);
  brick('brick-1x1-round', sx, 0, sz, C.clay, 0, [1.25, 1.5, 1.25]);
  brick('brick-1x1-round', sx + .42, 0, sz + .22, C.clay, 0, [.95, 1.1, .95]);
  const wx = cx + Math.cos(face - 1.5) * (R + .5);
  const wz = cz + Math.sin(face - 1.5) * (R + .5);
  for (let i = 0; i < 4; i++){
    brick('brick-1x2', wx, i * BRICK_H * .55, wz, i % 2 ? C.timber : C.timberD, i * .8, [1, .5, 1]);
  }

  claim(cx, cz, R + 1.2);
  return { x: cx, z: cz, r: R };
}

/* ══════════════════════════════════════════════════════════════
   마을 — 움집 여러 채와 마당
   ══════════════════════════════════════════════════════════════ */
let villageSpot = null;

export function villageNeo(){
  const s = findSpot('neo:village', { angle: -2.35, radius: .52, size: 9 });
  const rng = s.rng;
  const n = 5;
  const R = 6.8;

  // 가운데 마당과 불자리
  pad(s.x, s.z, 2.2, 2.2, 0.008, C.dirtD);
  fireplace(s.x, s.z);

  for (let i = 0; i < n; i++){
    const a = (i / n) * Math.PI * 2 + .35;
    const hx = s.x + Math.cos(a) * R;
    const hz = s.z + Math.sin(a) * R;
    pitHouse(hx, hz, {
      radius: 2.15 + rng() * .8,
      levels: 9 + Math.floor(rng() * 3),
      face: Math.atan2(s.z - hz, s.x - hx)          // 문은 마당을 향한다
    });
  }

  // 마을 어귀 건조대 — 그물과 생선을 말리던 자리
  dryingRack(s.x + Math.cos(-1.1) * (R + 2.4), s.z + Math.sin(-1.1) * (R + 2.4), -1.1);
  claim(s.x, s.z, R + 3);

  // 마을에 딸린 일터들 — 임무가 가리키는 자리다
  // (배치표가 이 이름들을 부르지 않으므로 마을과 함께 세운다)
  toolWorkshopNeo();
  weavingNeo();
  pottersSpotNeo();

  villageSpot = s;
  return s;
}

/** 불자리 — 돌을 둘러놓고 가운데 재와 불씨 */
export function fireplace(cx, cz){
  ring('brick-1x1', cx, cz, .62, 0, C.stone, 9, { jitter: .05 });
  brick('none-hq-plate-2x2', cx, 0.02, cz, C.ash, 0);
  brick('brick-1x1', cx - .08, PLATE_H, cz + .05, C.ember, .4, [.8, .7, .8]);
  brick('brick-1x1', cx + .12, PLATE_H, cz - .06, C.ember, 1.1, [.7, .6, .7]);
  claim(cx, cz, 1.4);
}

/** 건조대 — 나무 두 다리에 가로대, 그 위에 그물과 생선 */
export function dryingRack(cx, cz, rotY){
  const dx = Math.cos(rotY || 0), dz = Math.sin(rotY || 0);
  for (const s of [-1, 1]){
    for (let lv = 0; lv < 5; lv++){
      brick('brick-1x1', cx + dx * s * 1.5, lv * BRICK_H, cz + dz * s * 1.5, C.timber, 0);
    }
  }
  for (let k = 0; k < 4; k++){
    brick('brick-1x4', cx + dx * (k - 1.5) * .78, 5 * BRICK_H, cz + dz * (k - 1.5) * .78,
          C.timberD, (rotY || 0) + Math.PI / 2);
  }
  // 널어 둔 것
  for (let k = 0; k < 5; k++){
    const t = (k - 2) * .62;
    brick('none-hq-plate-1x2', cx + dx * t, 5 * BRICK_H - PLATE_H * 1.6, cz + dz * t,
          k % 2 ? C.shellD : C.clay, (rotY || 0), [.9, 1.8, .9]);
  }
  claim(cx, cz, 2.4);
}

/* ══════════════════════════════════════════════════════════════
   조개더미 — 신석기 사람들이 버린 조개껍데기가 쌓인 언덕
   ══════════════════════════════════════════════════════════════ */
export function shellMound(){
  const s = findSpot('neo:shell', { angle: 2.5, radius: .58, size: 4 });
  const rng = s.rng;
  const R = 2.9, H = 2.3;

  // 속이 찬 둔덕 — 격자 위에 높이만큼 쌓는다 (고리로 쌓으면 속이 비어 보인다)
  const step = STUD * 1.5;
  for (let gx = -R; gx <= R; gx += step){
    for (let gz = -R; gz <= R; gz += step){
      const d = Math.sqrt(gx * gx + gz * gz) / R;
      if (d > 1) continue;
      const h = H * Math.cos(d * Math.PI / 2) * (0.75 + rng() * .5);
      const layers = Math.max(1, Math.round(h / (PLATE_H * 1.4)));
      for (let lv = 0; lv < layers; lv++){
        brick(rng() < .45 ? 'plate-1x1-round' : 'none-hq-plate-1x1',
              s.x + gx + (rng() - .5) * .1, lv * PLATE_H * 1.4,
              s.z + gz + (rng() - .5) * .1,
              rng() < .5 ? C.shell : C.shellD, rng() * 3, [1.3, 1, 1.3]);
      }
    }
  }
  // 흘러내린 조개
  for (let i = 0; i < 14; i++){
    const a = rng() * Math.PI * 2, r = R + .2 + rng() * 1.7;
    brick('none-hq-plate-1x1', s.x + Math.cos(a) * r, 0.01, s.z + Math.sin(a) * r,
          rng() < .5 ? C.shell : C.shellD, rng() * 3, [1.2, 1, 1.2]);
  }
  // 깨진 토기 조각도 함께 나온다 — 조개더미가 신석기 쓰레기터였다는 표시
  for (let i = 0; i < 7; i++){
    const a = rng() * Math.PI * 2, r = R * .25 + rng() * R * .6;
    const d = r / R;
    const top = H * Math.pow(Math.cos(d * Math.PI / 2), .7);   // 그 자리의 둔덕 높이
    brick('none-hq-plate-1x2', s.x + Math.cos(a) * r, top, s.z + Math.sin(a) * r,
          C.clay, rng() * 3, [1, 1, .8]);
  }
  claim(s.x, s.z, R + 1.2);
  return s;
}

/* ══════════════════════════════════════════════════════════════
   돌무지와 갈돌·갈판 — 곡식을 갈던 자리
   ══════════════════════════════════════════════════════════════ */
export function rocksNeo(){
  const rng = seedRng('neo:rocks');
  const b = ST.BOUND || 38;

  for (let k = 0; k < 5; k++){
    const s = findSpot('neo:rock' + k, { angle: rng() * Math.PI * 2, radius: .3 + rng() * .5, size: 2.2 });
    const n = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < n; i++){
      const a = rng() * Math.PI * 2, r = rng() * 1.1;
      const lv = Math.floor(rng() * 2);
      brick(rng() < .5 ? 'none-hq-brick-2x2' : 'none-hq-brick-1x2',
            s.x + Math.cos(a) * r, lv * BRICK_H * .6, s.z + Math.sin(a) * r,
            rng() < .5 ? C.stone : C.stoneD, rng() * 3, [1, .55 + rng() * .5, 1]);
    }
  }

  // 갈판 위에 갈돌 — 마을 어귀에 하나
  const g = findSpot('neo:grind', { angle: -1.6, radius: .34, size: 2 });
  brick('none-hq-plate-2x4', g.x, 0, g.z, C.stoneD, .3);
  brick('brick-1x2', g.x, PLATE_H, g.z, C.stone, .3, [1, .55, 1]);
  brick('brick-1x1-round', g.x + .35, PLATE_H + BRICK_H * .55, g.z - .1, C.stoneD, 0, [1, .7, 1]);
  // 갈아 놓은 곡식
  brick('none-hq-plate-1x1', g.x - .5, PLATE_H, g.z + .3, '#CDBC8E', .8, [1.4, 1, 1.4]);
}

/* ══════════════════════════════════════════════════════════════
   가마 — 그릇을 굽던 노천 가마
   ══════════════════════════════════════════════════════════════ */
export function kilnNeo(){
  const s = findSpot('neo:kiln', { angle: .5, radius: .55, size: 4 });
  const face = Math.atan2(-s.z, -s.x);            // 아궁이는 안쪽을 본다

  // 흙 둔덕
  ring('none-hq-plate-1x2', s.x, s.z, 1.9, 0, C.dirt, 14, { jitter: .06 });
  // 돔 — 얇은 켜를 촘촘히 올려야 매끈한 흙가마로 보인다
  const kc = Math.max(8, Math.round(11 * lod()));
  for (let lv = 0; lv < kc; lv++){
    const r = 1.7 * Math.pow(1 - lv / kc, .58);
    if (r < STUD * .6) break;
    const y = lv * PLATE_H;
    const n = Math.max(5, Math.round((2 * Math.PI * r) / (STUD * 2)));
    ring('plate-1x2', s.x, s.z, r, y, (lv % 4 < 2) ? C.clay : '#9C6E52', n, {
      offset: lv * .27,
      gapFrom: y < BRICK_H * 1.4 ? face - .55 : null,
      gapTo:   y < BRICK_H * 1.4 ? face + .55 : null
    });
  }
  // 아궁이 앞 재와 불
  const fx = s.x + Math.cos(face) * 2.1, fz = s.z + Math.sin(face) * 2.1;
  brick('none-hq-plate-2x2', fx, 0.02, fz, C.ash, 0, [1.4, 1, 1.4]);
  brick('brick-1x1', fx, PLATE_H, fz, C.ember, .5, [.9, .8, .9]);
  // 구운 그릇 몇 점
  for (let i = 0; i < 3; i++){
    const a = face + 1.8 + i * .5;
    brick('brick-1x1-round', s.x + Math.cos(a) * 2.5, 0, s.z + Math.sin(a) * 2.5, C.clay, 0, [1.1, 1.3, 1.1]);
  }
  claim(s.x, s.z, 3.2);
  return s;
}

/* ══════════════════════════════════════════════════════════════
   제단과 솟대 — 원시 신앙
   ══════════════════════════════════════════════════════════════ */
export function shrineNeo(){
  const s = findSpot('neo:shrine', { angle: 1.9, radius: .62, size: 4 });
  const rng = s.rng;

  /* 단 — 네모반듯한 포장이 아니라 크기가 제각각인 돌을 둥글게 깐 자리 */
  for (let k = 0; k < 34; k++){
    const a = rng() * Math.PI * 2, r = rng() * 1.55;
    brick(rng() < .5 ? 'none-hq-brick-2x2' : 'none-hq-brick-1x2',
          s.x + Math.cos(a) * r, 0, s.z + Math.sin(a) * r,
          rng() < .5 ? C.stone : C.stoneD, rng() * 3,
          [.7 + rng() * .5, .28 + rng() * .22, .7 + rng() * .5]);
  }
  // 둘레를 두른 돌
  ring('none-hq-brick-1x2', s.x, s.z, 1.75, 0, C.stoneD, 16, { jitter: .16, scale: [1, .5, 1] });

  /* 가운데 선돌 — 위로 갈수록 가늘어진다 */
  const sel = [1.35, 1.2, 1.05, .9, .78];
  for (let lv = 0; lv < sel.length; lv++){
    brick('none-hq-brick-2x2', s.x, PLATE_H + lv * BRICK_H * .82, s.z, lv % 2 ? C.stone : C.stoneD,
          lv * .5 + .2, [sel[lv], .5, sel[lv] * .8]);
  }

  /* 제물 — 선돌 앞에 놓인 토기와 곡식 */
  brick('brick-1x1-round', s.x + .95, PLATE_H, s.z + .75, C.clay, 0, [1.2, 1.1, 1.2]);
  brick('none-hq-plate-1x2', s.x + .55, PLATE_H, s.z + 1.05, '#C6B586', .6, [1.2, 1, 1.2]);

  /* 솟대 — 긴 장대 위의 새. 마을을 지켜 달라는 뜻이다 */
  for (const off of [[-2.6, .7, 7], [2.3, -1.4, 8]]){
    const px = s.x + off[0], pz = s.z + off[1], h = off[2];
    for (let lv = 0; lv < h; lv++){
      brick('brick-1x1', px + Math.sin(lv * .7) * .04, lv * BRICK_H, pz,
            lv % 2 ? C.timber : C.timberD, lv * .3, [.5, 1, .5]);
    }
    const topY = h * BRICK_H;
    const dir = rng() < .5 ? 1 : -1;
    brick('brick-1x2', px, topY, pz, C.timberD, dir > 0 ? .25 : Math.PI + .25, [1.15, .55, .8]);   // 몸
    brick('brick-1x1', px + dir * .34, topY + BRICK_H * .35, pz + .08, C.timberD, .25, [.7, .7, .55]); // 머리
    brick('brick-1x1', px + dir * .55, topY + BRICK_H * .38, pz + .08, '#C08A4A', .25, [.45, .3, .3]); // 부리
    brick('none-hq-plate-1x2', px - dir * .46, topY + BRICK_H * .1, pz, C.timber, dir > 0 ? .25 : Math.PI + .25, [1.3, 1, .6]); // 꼬리
  }
  claim(s.x, s.z, 3.4);
  return s;
}

/* ══════════════════════════════════════════════════════════════
   밭 · 울타리 — 농사의 시작
   ══════════════════════════════════════════════════════════════ */
let farmSpot = null;      // 울타리가 밭을 찾아 두르도록

export function farmFieldNeo(){
  const s = findSpot('neo:farm', { angle: -.5, radius: .6, size: 7 });
  const rng = s.rng;
  const rows = 6, cols = 8;

  for (let r = 0; r < rows; r++){
    // 이랑과 고랑 — 흙을 도톰하게 돋운 줄과 그 사이 파인 줄
    const z = s.z + (r - (rows - 1) / 2) * STUD * 3.6;
    for (let c = 0; c < cols; c++){
      const x = s.x + (c - (cols - 1) / 2) * STUD * 2.4;
      brick('none-hq-plate-1x4', x, 0.01, z, C.dirt, Math.PI / 2, [1, 1, 1.15]);
      brick('none-hq-plate-1x4', x, 0.01 + PLATE_H, z, C.dirtD, Math.PI / 2, [.85, 1, 1]);
      // 조·기장 싹 — 신석기에 기른 곡식
      if (rng() < .62){
        const h = 1 + Math.floor(rng() * 2);
        for (let lv = 0; lv < h; lv++){
          brick('brick-1x1', x + (rng() - .5) * .15, PLATE_H * 2 + lv * BRICK_H * .7,
                z + (rng() - .5) * .15, C.green, rng() * 3, [.4, .8, .4]);
        }
        if (rng() < .4){
          brick('none-hq-plate-1x1', x, PLATE_H * 2 + h * BRICK_H * .7, z,
                '#C6B586', rng() * 3, [.6, 1.3, .6]);
        }
      }
    }
    // 고랑 (사이 파인 줄)
    if (r < rows - 1){
      for (let c = 0; c < cols; c++){
        const x = s.x + (c - (cols - 1) / 2) * STUD * 2.4;
        brick('none-hq-plate-1x4', x, 0.005, z + STUD * 1.8, C.dirtD, Math.PI / 2, [1, 1, .7]);
      }
    }
  }

  // 밭 귀퉁이의 돌괭이 — 땅을 일구던 연장
  brick('brick-1x4', s.x - 3.2, 0.05, s.z - 3.2, C.timber, .9, [1, .35, .45]);
  brick('brick-1x2', s.x - 3.2 + Math.cos(.9) * .7, 0.05, s.z - 3.2 + Math.sin(.9) * .7,
        C.stoneD, .9 + Math.PI / 2, [1, .45, .8]);

  claim(s.x, s.z, 5.5);
  farmSpot = s;
  return s;
}

export function fieldFenceNeo(){
  const f = farmSpot || (ST.propSpots || []).slice(-1)[0] || { x: 0, z: 0 };
  const cx = f.x !== undefined ? f.x : f[0];     // 밭을 두른다
  const cz = f.z !== undefined ? f.z : f[1];
  const halfW = 4.6, halfD = 4.2;
  const rng = seedRng('neo:fence');

  // 기둥 — 굵기와 키를 조금씩 달리해 손으로 세운 티를 낸다
  const post = (x, z) => {
    const h = 3 + (rng() < .3 ? 1 : 0);
    for (let lv = 0; lv < h; lv++){
      brick('brick-1x1', x + (rng() - .5) * .08, lv * BRICK_H, z + (rng() - .5) * .08,
            rng() < .5 ? C.timber : C.timberD, rng() * 3, [.62, 1, .62]);
    }
  };
  // 가로대 — 두 줄
  const rail = (x, z, rotY, len) => {
    for (const lvY of [1.2, 2.3]){
      for (let k = 0; k < len; k++){
        brick('brick-1x4', x + Math.cos(rotY) * (k - (len - 1) / 2) * STUD * 4,
              lvY * BRICK_H, z + Math.sin(rotY) * (k - (len - 1) / 2) * STUD * 4,
              C.timberD, rotY + Math.PI / 2, [1, .55, .7]);
      }
    }
  };
  for (let x = -halfW; x <= halfW + .01; x += 2.3) { post(cx + x, cz - halfD); post(cx + x, cz + halfD); }
  for (let z = -halfD + 2.1; z <= halfD - 2.1 + .01; z += 2.1) { post(cx - halfW, cz + z); post(cx + halfW, cz + z); }
  rail(cx, cz - halfD, 0, 8);
  rail(cx, cz + halfD, 0, 8);
  rail(cx - halfW, cz, Math.PI / 2, 7);
  rail(cx + halfW, cz, Math.PI / 2, 7);
  return { x: cx, z: cz };
}

/* ══════════════════════════════════════════════════════════════
   통나무배 · 갈대 — 강가
   ══════════════════════════════════════════════════════════════ */
export function canoeNeo(){
  const b = ST.BOUND || 38;
  const cx = -b * .58, cz = 6;                     // 강은 왼쪽으로 흐른다 (props.js buildRiverBand)
  const rotY = .22;
  const dx = Math.cos(rotY), dz = Math.sin(rotY);

  for (let k = -3; k <= 3; k++){
    const t = k * STUD * 2;
    const narrow = Math.abs(k) >= 3 ? .55 : 1;
    brick('brick-2x2', cx + dx * t, 0.06, cz + dz * t, C.timberD, rotY, [narrow, .7, narrow]);
  }
  // 파낸 속
  for (let k = -2; k <= 2; k++){
    brick('none-hq-plate-1x2', cx + dx * k * STUD * 2, 0.06 + BRICK_H * .5,
          cz + dz * k * STUD * 2, '#5E4B36', rotY, [1, 1, 1.2]);
  }
  // 노
  brick('brick-1x4', cx + dx * 1.4 - dz * .9, 0.1, cz + dz * 1.4 + dx * .9, C.timber, rotY + .7, [1, .4, .5]);
  claim(cx, cz, 3);
  return { x: cx, z: cz };
}

export function reedsNeo(){
  const b = ST.BOUND || 38;
  const rng = seedRng('neo:reeds');
  const bank = -b * 0.55;                      // 강가 (buildRiverBand 는 -b*0.72 를 가운데로 둔다)

  for (let i = 0; i < Math.round(54 * lod()); i++){
    const z = (rng() - .5) * b * 1.7;
    const x = bank + (rng() - .5) * 4.2;
    const h = 3 + Math.floor(rng() * 4);
    const lean = (rng() - .5) * .5;            // 바람에 기운 만큼 위로 갈수록 밀린다
    for (let lv = 0; lv < h; lv++){
      brick('brick-1x1', x + lean * lv * .12, lv * BRICK_H * .78, z + lean * lv * .06,
            rng() < .5 ? C.reed : C.green, rng() * 3, [.26, .95, .26]);
    }
    // 이삭
    brick('none-hq-plate-1x1', x + lean * h * .12, h * BRICK_H * .78,
          z + lean * h * .06, '#C6B586', rng() * 3, [.5, 1.6, .5]);
  }

  // 강가에 널린 그물추 — 신석기 사람들이 물고기를 잡던 흔적
  for (let i = 0; i < 9; i++){
    const z = (rng() - .5) * b * .9;
    const x = bank + 2.4 + rng() * 1.6;
    brick('brick-1x1', x, 0, z, C.stoneD, rng() * 3, [.5, .45, .5]);
  }
}

/* ══════════════════════════════════════════════════════════════
   임무가 가리키는 자리들 — 간석기·옷감·빗살무늬토기
   ══════════════════════════════════════════════════════════════ */

/** 간석기 만드는 자리 — 모룻돌과 깨진 조각, 갈다 만 돌도끼 */
export function toolWorkshopNeo(){
  const s = findSpot('neo:tools', { angle: -2.9, radius: .38, size: 3 });
  const rng = s.rng;

  brick('none-hq-plate-2x4', s.x, 0, s.z, C.dirtD, .4, [1.3, 1, 1.3]);
  // 모룻돌
  brick('brick-2x2', s.x, PLATE_H, s.z, C.stone, .4, [1.1, .7, 1.1]);
  // 갈다 만 돌도끼 — 몸통과 자루
  brick('brick-1x2', s.x + .1, PLATE_H + BRICK_H * .7, s.z, C.stoneD, .9, [1, .35, .8]);
  brick('brick-1x4', s.x - .5, PLATE_H, s.z + .5, C.timber, 1.7, [1, .3, .4]);
  // 깨진 돌조각이 둘레에 흩어져 있다
  for (let i = 0; i < 12; i++){
    const a = rng() * Math.PI * 2, r = .9 + rng() * 1.5;
    brick('none-hq-plate-1x1', s.x + Math.cos(a) * r, 0.02, s.z + Math.sin(a) * r,
          rng() < .5 ? C.stone : C.stoneD, rng() * 3, [.8 + rng() * .5, 1, .8 + rng() * .5]);
  }
  // 앉던 통나무
  for (let k = -1; k <= 1; k++){
    brick('brick-1x4', s.x + 1.9, BRICK_H * .3, s.z + k * .56, C.timberD, 0, [1, .55, 1]);
  }
  return s;
}

/** 옷감 짜는 자리 — 세로틀 베틀과 가락바퀴 */
export function weavingNeo(){
  const s = findSpot('neo:weave', { angle: -1.15, radius: .42, size: 3 });
  const rng = s.rng;

  // 베틀 두 기둥
  for (const side of [-1, 1]){
    for (let lv = 0; lv < 6; lv++){
      brick('brick-1x1', s.x + side * 1.1, lv * BRICK_H, s.z, C.timber, 0, [.7, 1, .7]);
    }
  }
  // 위아래 가로대
  brick('brick-1x4', s.x, 6 * BRICK_H, s.z, C.timberD, Math.PI / 2, [1, .6, 1]);
  brick('brick-1x4', s.x, BRICK_H * .4, s.z, C.timberD, Math.PI / 2, [1, .6, 1]);
  // 날실 — 위에서 아래로 드리운 줄
  for (let k = -3; k <= 3; k++){
    for (let lv = 1; lv < 6; lv++){
      brick('brick-1x1', s.x + k * .3, lv * BRICK_H, s.z, '#CFC3A4', 0, [.16, 1, .16]);
    }
  }
  // 짜인 옷감이 아래쪽에 조금
  brick('none-hq-plate-2x4', s.x, BRICK_H * 1.2, s.z, '#B9A981', Math.PI / 2, [1, 1, .55]);
  // 가락바퀴 — 실을 잣던 둥근 돌
  for (let i = 0; i < 3; i++){
    brick('plate-1x1-round', s.x - 1.9 + i * .5, 0.02, s.z + 1.2 + (rng() - .5) * .5,
          C.clay, rng() * 3, [1.5, 1, 1.5]);
  }
  return s;
}

/** 빗살무늬토기 — 바닥이 뾰족해 모래에 박아 세운다 (임무의 물음이 여기서 풀린다) */
export function pottersSpotNeo(){
  const s = findSpot('neo:pots', { angle: 2.05, radius: .4, size: 3 });
  const rng = s.rng;

  // 모래밭
  pad(s.x, s.z, 2.5, 2.2, 0, '#D6C9A6');

  // 모래에 반쯤 박아 세운 토기 넷
  for (let i = 0; i < 4; i++){
    const a = i / 4 * Math.PI * 2 + .3;
    const px = s.x + Math.cos(a) * 1.0, pz = s.z + Math.sin(a) * 1.0;
    // 몸통 — 위로 갈수록 벌어지다가 아가리에서 살짝 오므라든다
    const prof = [.8, 1.15, 1.45, 1.7, 1.86, 1.76];   // 아래가 좁고 위가 벌어진 빗살무늬토기
    for (let lv = 0; lv < prof.length; lv++){
      brick('brick-1x1-round', px, PLATE_H + lv * BRICK_H * .62, pz,
            lv >= prof.length - 2 ? '#B0805F' : C.clay, rng() * 3, [prof[lv], .7, prof[lv]]);
    }
    // 뾰족한 아래는 모래 밑으로 들어가 보이지 않는다
  }
  // 아직 박지 못해 옆으로 누운 것 하나 — 세울 수 없다는 것을 눈으로 보여 준다
  const lx = s.x + .5, lz = s.z + 1.75;
  const prof2 = [.8, 1.15, 1.45, 1.7, 1.86, 1.76];
  for (let k = 0; k < prof2.length; k++){
    brick('brick-1x1-round', lx + k * .42, BRICK_H * .48, lz,
          k >= prof2.length - 2 ? '#B0805F' : C.clay,
          Math.PI / 2, [.7, prof2[k], prof2[k]]);
  }
  return s;
}

/* ══════════════════════════════════════════════════════════════
   덤불 · 나무 · 오솔길
   ══════════════════════════════════════════════════════════════ */

/** 덤불과 억새 포기 — 큰 나무가 아니라 사람 무릎께 오는 것들 */
export function bushesNeo(){
  const b = ST.BOUND || 38;
  const rng = seedRng('neo:bush');

  // 덤불 — 스터드가 보이면 장난감 블록처럼 읽힌다. 민민한 조각과 둥근 것만 쓴다
  for (let i = 0; i < Math.round(26 * lod()); i++){
    const a = rng() * Math.PI * 2, r = 8 + rng() * (b - 12);
    const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
    const tone = rng() < .5 ? C.green : '#8AA57C';
    const dark = rng() < .5 ? '#6E8C63' : '#7F9A72';
    const n = 7 + Math.floor(rng() * 5);
    for (let k = 0; k < n; k++){
      const aa = rng() * Math.PI * 2, rr = rng() * .62;
      const up = rng();
      brick('none-hq-brick-1x1-round',
            cx + Math.cos(aa) * rr, up * .38, cz + Math.sin(aa) * rr,
            up > .55 ? tone : dark, rng() * 3,
            [1.1 + rng() * .8, .75 + rng() * .6, 1.1 + rng() * .8]);
    }
  }

  // 억새 포기 — 가늘고 긴 것 몇 대씩
  for (let i = 0; i < Math.round(22 * lod()); i++){
    const a = rng() * Math.PI * 2, r = 9 + rng() * (b - 13);
    const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
    for (let k = 0; k < 5; k++){
      const aa = rng() * Math.PI * 2, rr = rng() * .34;
      const h = 2 + Math.floor(rng() * 2);
      for (let lv = 0; lv < h; lv++){
        brick('none-hq-brick-1x1', cx + Math.cos(aa) * rr, lv * BRICK_H * .72,
              cz + Math.sin(aa) * rr, rng() < .5 ? C.reed : '#A8B080',
              rng() * 3, [.2, .95, .2]);
      }
    }
  }
}

/** 나무 — 있던 것을 그대로 쓰되, 밑동에 낙엽과 죽은 가지를 깐다 */
export function treesNeo(){
  const b = ST.BOUND || 38;
  scatterTreesArea(20, [-b * .85, b * .85], [-b * .85, b * .85], 9, 'mix');

  const rng = seedRng('neo:fallen');
  for (let i = 0; i < 9; i++){
    const a = rng() * Math.PI * 2, r = 11 + rng() * (b - 15);
    const cx = Math.cos(a) * r, cz = Math.sin(a) * r, rot = rng() * Math.PI;
    // 쓰러진 통나무
    for (let k = -2; k <= 2; k++){
      brick('none-hq-brick-1x4', cx + Math.cos(rot) * k * .55, BRICK_H * .2,
            cz + Math.sin(rot) * k * .55, rng() < .5 ? C.timber : C.timberD,
            rot + Math.PI / 2, [1, .6, .95]);
    }
    // 버섯과 낙엽
    for (let k = 0; k < 4; k++){
      const aa = rng() * Math.PI * 2, rr = 1 + rng() * 1.2;
      brick('none-hq-plate-1x1', cx + Math.cos(aa) * rr, 0.01, cz + Math.sin(aa) * rr,
            rng() < .4 ? '#B79A63' : '#9C8A62', rng() * 3, [1.2, 1, 1.2]);
    }
  }
}

/** 오솔길 — 마을·밭·강나루를 잇는 밟은 자리. 눈이 갈 곳을 만든다 */
export function pathsNeo(targets){
  const rng = seedRng('neo:path');
  targets.forEach(seg => {
    const [ax, az, bx, bz] = seg;
    const len = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(2, Math.round(len / (STUD * 2.2)));
    for (let i = 0; i <= steps; i++){
      const t = i / steps;
      const x = ax + (bx - ax) * t + (rng() - .5) * .7;
      const z = az + (bz - az) * t + (rng() - .5) * .7;
      brick('none-hq-plate-2x2', x, 0.005, z, rng() < .5 ? C.dirt : C.dirtD,
            rng() * 3, [1.5, 1, 1.5]);
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   등록 — props.js 가 이름으로 찾아 쓴다
   ══════════════════════════════════════════════════════════════ */
export const NEO_PROPS = {
  buildVillageNeo:    () => { villageNeo(); },
  buildShellMoundNeo: () => { shellMound(); },
  buildRocksNeo:      () => { rocksNeo(); },
  buildKilnNeo:       () => { kilnNeo(); },
  buildShrineNeo:     () => { shrineNeo(); },
  buildFarmFieldNeo:  () => { farmFieldNeo(); },
  buildFieldFenceNeo: () => { fieldFenceNeo(); },
  buildCanoeNeo:      () => { canoeNeo(); },
  buildReedsNeo:      () => { reedsNeo(); },
  buildFloodZoneNeo:  (x, z) => {
    const r = buildWetPatch(x, z);
    // 배치표의 마지막 차례 — 자리가 다 정해졌으니 이때 길을 낸다
    const b = ST.BOUND || 38;
    const v = villageSpot, f = farmSpot;
    const segs = [];
    if (v) segs.push([v.x, v.z, -b * 0.55, v.z * .4]);          // 마을 → 강나루
    if (v && f) segs.push([v.x, v.z, f.x, f.z]);                 // 마을 → 밭
    if (v) segs.push([v.x, v.z, (ST.spawnPos||{x:0,z:17}).x, (ST.spawnPos||{x:0,z:17}).z]);
    if (segs.length) pathsNeo(segs);
    return r;
  },
  buildBushesNeo:     () => { bushesNeo(); },
  buildTreesNeo:      () => { treesNeo(); }
};
