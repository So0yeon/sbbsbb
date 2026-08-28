// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   marker3d.js — 임무 표지를 3차원으로

   여태 표지는 캔버스 그림을 붙인 스프라이트였다. 늘 정면만 보이니
   세상은 3차원인데 표지만 종이처럼 납작했다.

   여기서는 진짜 물건으로 만든다.
     · 패 — 테가 도톰한 원판. 색 테와 밝은 낯
     · 그림 — 돋보기·말풍선 …을 저폴리 조각으로 짜 맞춰 패 위에 띄운다

   조각은 미리 하나로 굽는다. 표지 한 개가 메시 열 개면 지역마다
   드로우콜이 백 단위로 뛴다. 구워 두면 표지 하나에 셋(테·낯·그림)이다.
   도형은 이름별로 한 벌만 만들어 표지들이 함께 쓴다.

   늘 읽히게 하되 두께가 보이게 — 좌우는 카메라를 그대로 보고,
   위아래는 카메라 기울기의 60%만 따라간다. 그래서 테가 살짝 드러난다.

   그림자는 쓰지 않는다 (MASTER §8-5). 형태는 저폴리 + flatShading.
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const FACE = '#F6F2E7';        // 패의 낯 — 흰빛이되 순백은 아니다
const FACE_DIM = '#E4E0D4';

function m(color, emissive){
  return new THREE.MeshStandardMaterial({
    color, flatShading: true, roughness: .62, metalness: 0,
    // 해를 등져도 죽지 않게 — 표지는 눈에 띄어야 하는 물건이다
    emissive: color, emissiveIntensity: emissive == null ? .16 : emissive
  });
}

/** 여러 조각을 한 도형으로 굽는다 */
function bake(parts){
  const list = parts.map(([geo, pos, rot, scl]) => {
    const g = geo.clone();
    const mtx = new THREE.Matrix4().compose(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
      new THREE.Vector3(scl ? scl[0] : 1, scl ? scl[1] : 1, scl ? scl[2] : 1)
    );
    g.applyMatrix4(mtx);
    // 합치려면 속성이 서로 같아야 한다. 팔면체만 색인이 없어 섞이면 실패한다
    const flat = g.index ? g.toNonIndexed() : g;
    if (flat !== g) g.dispose();
    flat.deleteAttribute('uv');
    return flat;
  });
  const merged = mergeGeometries(list, false);
  list.forEach(g => g.dispose());
  return merged;
}

/* ══════════════════════════════════════════════════════════════
   그림 — 저폴리 조각으로 짜 맞춘다. z+ 쪽이 앞이다.
   반지름 .5 안에 들어오게 맞춘다.
   ══════════════════════════════════════════════════════════════ */
const HALF = Math.PI / 2;

const ART = {
  /* 돋보기 — 살펴보는 임무 */
  search: () => bake([
    [new THREE.TorusGeometry(.27, .075, 6, 16), [.05, .07, 0], [0, 0, 0]],
    [new THREE.CylinderGeometry(.06, .07, .34, 6), [-.17, -.20, 0], [0, 0, Math.PI / 4]]
  ]),

  /* 말풍선 — 이야기를 듣는 임무 */
  chat: () => bake([
    [new THREE.BoxGeometry(.62, .42, .14), [0, .08, 0], [0, 0, 0]],
    [new THREE.ConeGeometry(.11, .22, 4), [-.14, -.19, 0], [0, Math.PI / 4, Math.PI]],
    [new THREE.SphereGeometry(.055, 6, 5), [-.17, .08, .1], [0, 0, 0]],
    [new THREE.SphereGeometry(.055, 6, 5), [0, .08, .1], [0, 0, 0]],
    [new THREE.SphereGeometry(.055, 6, 5), [.17, .08, .1], [0, 0, 0]]
  ]),

  /* 물음표 — 물음에 답하거나 스스로 고르는 임무 */
  question: () => bake([
    [new THREE.TorusGeometry(.19, .07, 6, 14, Math.PI * 1.35), [0, .17, 0], [0, 0, -Math.PI * .42]],
    [new THREE.CylinderGeometry(.07, .07, .17, 6), [.02, -.06, 0], [0, 0, 0]],
    [new THREE.SphereGeometry(.085, 6, 5), [.02, -.26, 0], [0, 0, 0]]
  ]),

  /* 문 — 다른 고을로 가는 길목 */
  gate: () => bake([
    [new THREE.BoxGeometry(.12, .5, .14), [-.22, -.06, 0], [0, 0, 0]],
    [new THREE.BoxGeometry(.12, .5, .14), [ .22, -.06, 0], [0, 0, 0]],
    [new THREE.BoxGeometry(.66, .12, .16), [0, .24, 0], [0, 0, 0]],
    [new THREE.ConeGeometry(.34, .18, 4), [0, .38, 0], [0, Math.PI / 4, 0]]
  ]),

  /* 수집 — 걸어가 주워 오는 것 */
  find: () => bake([
    [new THREE.OctahedronGeometry(.3, 0), [0, 0, 0], [0, 0, 0], [1, 1.25, .8]],
    [new THREE.TorusGeometry(.24, .04, 5, 12), [0, 0, 0], [HALF, 0, 0]]
  ]),

  /* 놀이 — 미니게임이 붙은 임무 */
  gamepad: () => bake([
    [new THREE.BoxGeometry(.6, .3, .16), [0, 0, 0], [0, 0, 0]],
    [new THREE.CylinderGeometry(.11, .09, .3, 6), [-.28, -.1, 0], [0, 0, -.35]],
    [new THREE.CylinderGeometry(.11, .09, .3, 6), [ .28, -.1, 0], [0, 0,  .35]],
    [new THREE.BoxGeometry(.19, .06, .06), [-.16, .02, .11], [0, 0, 0]],
    [new THREE.BoxGeometry(.06, .19, .06), [-.16, .02, .11], [0, 0, 0]],
    [new THREE.SphereGeometry(.055, 6, 5), [.13, -.02, .11], [0, 0, 0]],
    [new THREE.SphereGeometry(.055, 6, 5), [.27, .10, .11], [0, 0, 0]]
  ]),

  /* 여러 판으로 이어지는 것 — 층층이 쌓인 판 */
  event: () => bake([
    [new THREE.BoxGeometry(.46, .1, .3), [-.06, -.16, 0], [0, -.18, 0]],
    [new THREE.BoxGeometry(.46, .1, .3), [0,    -.01, 0], [0,   0,  0]],
    [new THREE.BoxGeometry(.46, .1, .3), [ .06,  .14, 0], [0,  .18, 0]]
  ]),

  /* 그 밖 — 깃발 */
  pin: () => bake([
    [new THREE.CylinderGeometry(.045, .045, .62, 6), [-.16, 0, 0], [0, 0, 0]],
    [new THREE.BoxGeometry(.34, .22, .07), [.02, .17, 0], [0, 0, 0]]
  ])
};

/* 이름별로 한 벌만 굽는다 */
const ART_GEO = {};
function artGeo(name){
  const key = ART[name] ? name : 'pin';
  return ART_GEO[key] || (ART_GEO[key] = ART[key]());
}

/* 테와 낯 — 모든 표지가 함께 쓴다 */
let RIM_GEO = null, FACE_GEO = null;
function rimGeo(){
  return RIM_GEO || (RIM_GEO = bake([
    [new THREE.CylinderGeometry(.53, .53, .17, 18), [0, 0, 0], [HALF, 0, 0]],
    // 가장자리 베벨 — 멀리서도 '두껍다'가 읽힌다
    [new THREE.TorusGeometry(.53, .075, 6, 22), [0, 0, 0], [0, 0, 0]]
  ]));
}
function faceGeo(){
  return FACE_GEO || (FACE_GEO = bake([
    [new THREE.CylinderGeometry(.47, .47, .04, 18), [0, 0,  .10], [HALF, 0, 0]],
    [new THREE.CylinderGeometry(.47, .47, .04, 18), [0, 0, -.10], [HALF, 0, 0]]
  ]));
}

/* ══════════════════════════════════════════════════════════════
   패 하나 — 테 + 낯 + 그림, 메시 셋
   ══════════════════════════════════════════════════════════════ */

/**
 * @param {string} name   icons.js 의 그림 이름 (search·chat·question·gate·find·gamepad·event)
 * @param {number} size   지름 기준 배율 (1 이면 지름 약 1.1)
 * @param {string} color  분류 색 — 테와 그림에 쓴다
 */
export function makeIcon3D(name, size, color){
  const g = new THREE.Group();
  const rimMat = m(color);
  const faceMat = m(FACE, .22);
  const artMat = m(color, .2);

  g.add(new THREE.Mesh(rimGeo(), rimMat));
  g.add(new THREE.Mesh(faceGeo(), faceMat));

  const art = new THREE.Mesh(artGeo(name), artMat);
  art.scale.setScalar(.95);
  art.position.z = .15;
  g.add(art);

  const s = size || 1;
  g.scale.setScalar(s);

  /* 마쳤는지·가리켜지는지에 따라 색과 짙기를 바꾼다.
     markers.js 가 재질을 하나하나 만지지 않도록 여기서 받는다. */
  g.userData.setTone = (col, opacity, done) => {
    rimMat.color.set(col);  rimMat.emissive.set(col);
    artMat.color.set(col);  artMat.emissive.set(col);
    const f = done ? FACE_DIM : FACE;
    faceMat.color.set(f);   faceMat.emissive.set(f);
    [rimMat, faceMat, artMat].forEach(mm => {
      mm.opacity = opacity;
      mm.transparent = opacity < 1;
      mm.needsUpdate = true;
    });
  };
  g.userData.baseScale = s;
  return g;
}

/**
 * 카메라를 보게 돌린다.
 * 좌우는 그대로 따라가고 위아래는 60%만 — 늘 읽히면서 테의 두께가 드러난다.
 */
const _v = new THREE.Vector3();
export function faceCamera(obj, camera){
  if (!camera || !obj.parent) return;
  camera.getWorldPosition(_v);
  const dx = _v.x - (obj.parent.position.x + obj.position.x);
  const dz = _v.z - (obj.parent.position.z + obj.position.z);
  obj.rotation.y = Math.atan2(dx, dz);

  const dy = _v.y - (obj.parent.position.y + obj.position.y);
  const flat = Math.hypot(dx, dz) || 1e-3;
  obj.rotation.x = -Math.atan2(dy, flat) * 0.6;
}
