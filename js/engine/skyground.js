// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   skyground.js — 하늘과 바닥

   왜 따로 두는가: scene-helpers.js 는 시대 소품 담당이 함께 고치는 파일이다.
   하늘·바닥은 여기 한 곳에만 두고, boot.js 에서 두 줄로 부른다.

   하늘 — 그라데이션 돔 + 해 + 저폴리 구름
     지역의 bg 색을 지평선으로 삼고, 하늘 꼭대기 색은 거기서 만들어 낸다.
     안개 색을 지평선과 맞춰 먼 곳이 자연스럽게 사라지게 한다 (§6-2).

   바닥 — 걷는 자리는 평평하게, 눈에 보이는 먼 곳만 굽이치게
     아바타는 y=0 을 걷는다. 지형을 울퉁불퉁하게 만들면 발이 뜨거나 잠긴다.
     그래서 다닐 수 있는 반경(ST.BOUND) 안은 평평하게 두고, 그 밖만 들어 올린다.
     그 위에 CC0 자연 조각(풀·꽃·돌·수풀)을 인스턴싱으로 흩뿌린다.

   에셋 — Kenney Nature Kit 2.1 (CC0). 텍스처가 없고 재질 색만 있어서
          우리 팔레트 쪽으로 물들여 쓴다 (§8-5 원색 금지).
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ST } from './state.js';

/* ══════════════════════════════════════════════════════════════
   색 다루기
   ══════════════════════════════════════════════════════════════ */
const _c = new THREE.Color();
const _hsl = { h:0, s:0, l:0 };

/* 하늘은 그 지역 바닥색을 그대로 쓰면 안 된다 — 바닥과 같은 색이라 하늘이 있는지도
   모르게 된다(첫 판이 그랬다). 진짜 하늘 팔레트를 두고, 거기에 시대색을 물들인다. */
const SKY_HAZE = '#EFE7D6';   // 지평선 언저리 — 따뜻한 미색
const SKY_MID  = '#BCD6E6';   // 중간 — 옅은 하늘색
const SKY_TOP  = '#7FA7CD';   // 꼭대기 — 짙은 하늘색

/** 두 색을 섞는다 */
function mix(a, b, t){
  return new THREE.Color().set(a).lerp(new THREE.Color().set(b), t);
}

const zenithOf = bg => mix(SKY_TOP, bg, .22);
const midOf    = bg => mix(SKY_MID, bg, .30);
const hazeOf   = bg => mix(SKY_HAZE, bg, .45);

/* ══════════════════════════════════════════════════════════════
   하늘
   ══════════════════════════════════════════════════════════════ */
const SKY_VERT = `
  varying vec3 vDir;
  void main(){
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const SKY_FRAG = `
  uniform vec3 top;
  uniform vec3 mid;
  uniform vec3 haze;
  uniform vec3 horizon;
  uniform vec3 sunDir;
  uniform vec3 sunColor;
  varying vec3 vDir;

  void main(){
    float h = clamp(vDir.y, -1.0, 1.0);

    // 지평선 → 중간 → 꼭대기, 세 단계로 섞는다.
    // 화면에 보이는 하늘은 지평선 바로 위 좁은 띠라서, 그 구간을 넉넉히 나눈다.
    float t = clamp(h, 0.0, 1.0);
    vec3 col = mix(haze, mid, smoothstep(0.0, 0.10, t));
    col = mix(col, top, smoothstep(0.06, 0.42, t));

    // 지평선 아래쪽은 바닥색으로 잦아든다
    col = mix(horizon, col, smoothstep(-0.10, 0.03, h));

    // 해 언저리를 따뜻하게 — 동그란 해가 아니라 번지는 빛
    float d = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
    col += sunColor * pow(d, 22.0) * 0.55;
    col += sunColor * pow(d, 3.0) * 0.06;

    gl_FragColor = vec4(col, 1.0);
  }`;

let skyMesh = null, skyUniforms = null;
let cloudGroup = null;

/** 저폴리 구름 한 덩이 */
function makeCloud(rng){
  const g = new THREE.Group();
  const n = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < n; i++){
    const r = 5.0 + rng() * 5.0;
    const m = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, 0),
      cloudMat
    );
    m.position.set((i - n / 2) * r * 1.15, (rng() - .5) * r * .5, (rng() - .5) * r * .8);
    m.scale.y = .55 + rng() * .2;
    m.rotation.set(rng() * 3, rng() * 3, rng() * 3);
    g.add(m);
  }
  return g;
}
let cloudMat = null;

/* 되풀이 가능한 난수 — 같은 지역은 늘 같은 모습이어야 한다 */
function rngOf(seed){
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) >>> 0;
  return function(){
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * 하늘을 세운다. 지역이 바뀔 때마다 부른다.
 * @param {THREE.Scene} scene
 * @param {string} bg     그 지역의 배경색 (지평선 색이 된다)
 * @param {string} seed   지역 id — 구름 배치를 고정한다
 */
export function installSky(scene, bg, seed){
  const horizon = new THREE.Color(bg);
  const top = zenithOf(bg);
  const mid = midOf(bg);
  const haze = hazeOf(bg);
  const sunColor = new THREE.Color('#FFF0D2');
  const sunDir = new THREE.Vector3(28, 42, 14).normalize();

  if (!skyMesh){
    skyUniforms = {
      top:      { value: top },
      mid:      { value: mid },
      haze:     { value: haze },
      horizon:  { value: horizon },
      sunDir:   { value: sunDir },
      sunColor: { value: sunColor }
    };
    skyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(300, 32, 20),
      new THREE.ShaderMaterial({
        uniforms: skyUniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG,
        side: THREE.BackSide, depthWrite: false, fog: false
      })
    );
    skyMesh.renderOrder = -1000;
    skyMesh.frustumCulled = false;
  } else {
    skyUniforms.top.value.copy(top);
    skyUniforms.mid.value.copy(mid);
    skyUniforms.haze.value.copy(haze);
    skyUniforms.horizon.value.copy(horizon);
  }
  scene.add(skyMesh);

  // 안개를 지평선 색과 맞춘다 — 먼 곳이 하늘로 자연스럽게 사라진다
  scene.fog = new THREE.Fog(haze.getHex(), Math.max(40, ST.BOUND * 1.1), 250);
  scene.background = null;                       // 돔이 배경을 맡는다

  /* 구름 */
  if (!cloudMat){
    cloudMat = new THREE.MeshStandardMaterial({
      color:'#FFFFFF', flatShading:true, roughness:1, metalness:0,
      transparent:true, opacity:.9, fog:false
    });
  }
  cloudMat.color.copy(mix('#FFFFFF', mid, .22));

  if (cloudGroup) { cloudGroup.parent && cloudGroup.parent.remove(cloudGroup); }
  cloudGroup = new THREE.Group();
  const rng = rngOf(seed || 'sky');
  const count = 10 + Math.floor(rng() * 5);
  for (let i = 0; i < count; i++){
    const c = makeCloud(rng);
    const a = rng() * Math.PI * 2;
    const r = 70 + rng() * 110;
    c.position.set(Math.cos(a) * r, 26 + rng() * 30, Math.sin(a) * r);
    c.userData.drift = .25 + rng() * .5;
    c.userData.angle = a;
    c.userData.radius = r;
    cloudGroup.add(c);
  }
  cloudGroup.frustumCulled = false;
  scene.add(cloudGroup);
  return skyMesh;
}

/** 매 프레임 — 구름을 아주 천천히 흘린다 */
export function updateSky(dt){
  if (!cloudGroup) return;
  cloudGroup.children.forEach(c => {
    c.userData.angle += (c.userData.drift * dt) / c.userData.radius;
    c.position.x = Math.cos(c.userData.angle) * c.userData.radius;
    c.position.z = Math.sin(c.userData.angle) * c.userData.radius;
  });
}

/* ══════════════════════════════════════════════════════════════
   자연 조각 불러오기 (CC0 · Kenney Nature Kit)
   ══════════════════════════════════════════════════════════════ */
const KIT = [
  'grass', 'grass_large', 'grass_leafs', 'grass_leafsLarge',
  'flower_yellowA', 'flower_yellowB', 'flower_redA', 'flower_purpleA', 'flower_purpleC',
  'plant_bushSmall', 'plant_bushTriangle', 'plant_flatShort',
  'rock_smallA', 'rock_smallB', 'rock_smallFlatA', 'rock_smallTopA',
  'stone_smallA', 'stone_smallFlatB',
  'mushroom_tanGroup', 'log', 'stump_round', 'lily_small', 'lily_large',
  'crops_wheatStageB', 'crops_dirtRow'
];

/* 이름 → [{ geometry, color }] — 원본 재질 색을 함께 들고 있는다 */
const PARTS = {};
let kitPromise = null;

/** 앱 시작 때 한 번 부른다. 실패해도 앱은 그대로 돌아간다 */
export function preloadNature(base){
  if (kitPromise) return kitPromise;
  const dir = (base || 'assets/kenney/nature/');
  const loader = new GLTFLoader();
  kitPromise = Promise.all(KIT.map(name =>
    loader.loadAsync(dir + name + '.glb').then(g => {
      const parts = [];
      g.scene.updateWorldMatrix(true, true);
      g.scene.traverse(o => {
        if (!o.isMesh) return;
        const geo = o.geometry.clone();
        geo.applyMatrix4(o.matrixWorld);           // 노드 변환을 구워 넣는다
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const col = new THREE.Color();
        if (mats[0] && mats[0].color) col.copy(mats[0].color); else col.set('#8FA37A');
        parts.push({ geometry: geo, color: col });
      });
      if (parts.length) PARTS[name] = parts;
    }).catch(() => { /* 한 조각이 없어도 나머지는 쓴다 */ })
  )).then(() => PARTS);
  return kitPromise;
}

export function natureReady(){ return Object.keys(PARTS).length > 0; }

/* ══════════════════════════════════════════════════════════════
   바닥
   ══════════════════════════════════════════════════════════════ */

/** 그 지역에서 무언가 이미 놓인 자리 — 여기엔 흩뿌리지 않는다 (§6-5) */
function occupied(){
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
function farFrom(x, z, list, d){
  for (let i = 0; i < list.length; i++){
    const dx = x - list[i][0], dz = z - list[i][1];
    if (dx*dx + dz*dz < d*d) return false;
  }
  return true;
}

/**
 * 바닥을 깐다. 지역 빌더가 buildGround() 로 만든 평면 위에 얹는다.
 *
 * 걷는 자리(반경 BOUND)는 평평하게 두고, 그 밖만 굽이치게 한다.
 * 색은 한 덩어리가 아니라 얼룩덜룩하게 — 이것만으로도 훨씬 덜 밋밋해진다.
 */
export function buildGroundPro(scene, opts){
  opts = opts || {};
  const base = new THREE.Color(opts.color || '#E9E4D3');
  const bound = ST.BOUND || 40;
  const seed = opts.seed || 'ground';
  const rng = rngOf(seed);

  const SIZE = 260, SEG = 60;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const tint = new THREE.Color();

  // 부드러운 잡음 — 세 개의 물결을 겹친다 (라이브러리 없이)
  const wob = (x, z) =>
    Math.sin(x * .07 + seedNum(seed)) * Math.cos(z * .055 - 1.1) * 1.0 +
    Math.sin(x * .021 + 2.4) * Math.cos(z * .017 + .7) * 2.2 +
    Math.sin((x + z) * .11) * .35;

  for (let i = 0; i < pos.count; i++){
    const x = pos.getX(i), z = pos.getZ(i);
    const r = Math.hypot(x, z);

    // 다닐 수 있는 반경 안은 평평하게, 밖으로 갈수록 들어 올린다
    const rise = Math.max(0, (r - bound * .92) / 26);
    const h = wob(x, z) * Math.min(1, rise * rise) * 1.6;
    pos.setY(i, h);

    // 색 얼룩 — 밝기와 채도를 조금씩 흔든다
    // 주기가 길면 보이는 자리 안에서 한 덩어리가 된다 (첫 판이 그랬다).
    // 잔무늬 8~15단위, 큰 무늬 30~40단위로 짧게 잡는다.
    const fine  = Math.sin(x * .62 + 1.7) * Math.cos(z * .55 - .4);
    const mid2  = Math.sin(x * .21 + .3) * Math.cos(z * .19 + 1.1);
    const broad = Math.sin(x * .085 + .6) * Math.cos(z * .072 - 1.3);
    const n = fine * .28 + mid2 * .42 + broad * .55;
    tint.copy(base);
    tint.getHSL(_hsl);
    tint.setHSL(_hsl.h + n * .018, Math.min(.55, Math.max(.04, _hsl.s + n * .10)), Math.max(.2, Math.min(.95, _hsl.l + n * .13)));
    colors[i*3] = tint.r; colors[i*3+1] = tint.g; colors[i*3+2] = tint.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors: true, flatShading: true, roughness: .96, metalness: 0
  }));
  mesh.position.y = -0.02;
  mesh.name = 'groundPro';
  scene.add(mesh);
  return mesh;
}

function seedNum(seed){
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) >>> 0;
  return (s % 628) / 100;
}

/** 흙자국·풀자국 — 바닥에 납작한 원반을 깔아 얼룩을 만든다.
    정점 색 그라데이션만으로는 눈에 잘 안 띈다. */
export function groundPatches(scene, opts){
  opts = opts || {};
  const base = new THREE.Color(opts.color || '#E9E4D3');
  const bound = ST.BOUND || 40;
  const rng = rngOf('patch:' + (opts.seed || ''));
  const avoid = occupied();

  const group = new THREE.Group();
  group.name = 'groundPatches';

  // 얼룩은 '칠한 자국'이 아니라 '땅의 결'로 보여야 한다 — 색차를 약하게, 모서리를 둥글게
  const tones = (opts.tones || ['#D8CFB6', '#C9BFA6', '#DDD6C0']).map(c => mix(base, c, .30));
  const geo = new THREE.CircleGeometry(1, 18);
  geo.rotateX(-Math.PI / 2);

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(),
        _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();

  tones.forEach((tone, ti) => {
    const spots = [];
    const want = 22;
    let guard = 0;
    while (spots.length < want && guard++ < want * 30){
      const a = rng() * Math.PI * 2;
      const r = bound * (0.1 + Math.sqrt(rng()) * 0.95);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!farFrom(x, z, avoid, 1.6)) continue;
      spots.push([x, z]);
    }
    if (!spots.length) return;
    const im = new THREE.InstancedMesh(
      geo,
      new THREE.MeshStandardMaterial({ color: tone, flatShading:true, roughness:.98, metalness:0,
                                       polygonOffset:true, polygonOffsetFactor:-1 - ti, polygonOffsetUnits:-1 }),
      spots.length
    );
    spots.forEach((p, i) => {
      const rr = 3.6 + rng() * 7.4;
      _e.set(0, rng() * 6.28, 0);
      _q.setFromEuler(_e);
      _v.set(p[0], 0.012 + ti * 0.004, p[1]);
      _s.set(rr, 1, rr * (.7 + rng() * .6));
      _m.compose(_v, _q, _s);
      im.setMatrixAt(i, _m);
    });
    im.instanceMatrix.needsUpdate = true;
    im.frustumCulled = false;
    group.add(im);
  });

  scene.add(group);
  return group;
}

/* ── 흩뿌리기 ──────────────────────────────────────────────── */
const SCATTER_SETS = {
  /* 기본 — 풀밭 */
  green: [
    { name:'grass',            n:70, s:[2.2,3.6], tint:'#7C9B6E', t:.55 },
    { name:'grass_large',      n:26, s:[2.0,3.0], tint:'#6E8F63', t:.55 },
    { name:'grass_leafs',      n:34, s:[2.4,3.8], tint:'#84A175', t:.5 },
    { name:'plant_bushSmall',  n:18, s:[2.0,3.2], tint:'#6E8F63', t:.5 },
    { name:'flower_yellowA',   n:12, s:[2.2,3.2], tint:'#C9A24B', t:.35 },
    { name:'flower_redA',      n:8,  s:[2.2,3.2], tint:'#A8534F', t:.35 },
    { name:'flower_purpleA',   n:8,  s:[2.2,3.2], tint:'#7C6BA8', t:.35 },
    { name:'rock_smallA',      n:14, s:[2.0,3.4], tint:'#A5A296', t:.6 },
    { name:'stone_smallFlatB', n:12, s:[1.3,2.1], tint:'#B2AEA1', t:.6 }
  ],
  /* 메마른 땅 — 구석기·전쟁터 */
  dry: [
    { name:'grass_leafs',      n:34, s:[1.8,2.8], tint:'#A89A6E', t:.6 },
    { name:'rock_smallA',      n:26, s:[2.2,3.8], tint:'#A5A296', t:.6 },
    { name:'rock_smallB',      n:18, s:[2.0,3.2], tint:'#B2AEA1', t:.6 },
    { name:'stone_smallA',     n:16, s:[2.0,3.4], tint:'#ADA898', t:.6 },
    { name:'log',              n:6,  s:[1.6,2.4], tint:'#8A6E52', t:.5 },
    { name:'stump_round',      n:6,  s:[1.8,2.6], tint:'#7B5E42', t:.5 }
  ],
  /* 논밭 — 신석기 이후 마을 */
  farm: [
    { name:'grass',            n:46, s:[2.2,3.4], tint:'#7C9B6E', t:.55 },
    { name:'crops_wheatStageB',n:22, s:[1.8,2.6], tint:'#C2A86A', t:.45 },
    { name:'crops_dirtRow',    n:10, s:[2.0,3.0], tint:'#A89A78', t:.5 },
    { name:'plant_bushSmall',  n:12, s:[2.0,3.0], tint:'#6E8F63', t:.5 },
    { name:'flower_yellowB',   n:10, s:[2.2,3.2], tint:'#C9A24B', t:.35 },
    { name:'rock_smallFlatA',  n:12, s:[1.3,2.0], tint:'#A5A296', t:.6 }
  ],
  /* 물가 */
  water: [
    { name:'grass_leafsLarge', n:40, s:[2.2,3.4], tint:'#7C9B6E', t:.5 },
    { name:'lily_small',       n:16, s:[2.4,3.6], tint:'#6E8F63', t:.45 },
    { name:'lily_large',       n:10, s:[2.2,3.2], tint:'#71916A', t:.45 },
    { name:'stone_smallFlatB', n:16, s:[1.3,2.1], tint:'#B2AEA1', t:.6 },
    { name:'plant_flatShort',  n:18, s:[2.2,3.4], tint:'#84A175', t:.5 }
  ]
};

/**
 * 바닥에 자연 조각을 흩뿌린다. 인스턴싱이라 종류 수만큼만 드로우콜이 든다.
 * @param {THREE.Scene} scene
 * @param {object} opts { set:'green'|'dry'|'farm'|'water', seed, density }
 */
export function scatterNature(scene, opts){
  opts = opts || {};
  if (!natureReady()) return null;

  const list = SCATTER_SETS[opts.set] || SCATTER_SETS.green;
  const bound = ST.BOUND || 40;
  const rng = rngOf((opts.seed || 'sc') + ':' + (opts.set || 'green'));
  const avoid = occupied();
  const density = opts.density == null ? 1 : opts.density;

  const group = new THREE.Group();
  group.name = 'natureScatter';

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(),
        _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();

  list.forEach(item => {
    const parts = PARTS[item.name];
    if (!parts) return;

    const spots = [];
    const want = Math.round(item.n * density);
    let guard = 0;
    while (spots.length < want && guard++ < want * 30){
      const a = rng() * Math.PI * 2;
      // 가장자리 쪽에 조금 더 몰리게 (가운데는 임무 자리)
      const r = bound * (0.18 + Math.sqrt(rng()) * 0.92);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!farFrom(x, z, avoid, 3.0)) continue;
      if (!farFrom(x, z, spots, 2.0)) continue;
      spots.push([x, z]);
    }
    if (!spots.length) return;

    parts.forEach(part => {
      const color = mix(part.color, item.tint, item.t);
      const im = new THREE.InstancedMesh(
        part.geometry,
        new THREE.MeshStandardMaterial({ color, flatShading:true, roughness:.95, metalness:0 }),
        spots.length
      );
      spots.forEach((p, i) => {
        const sc = item.s[0] + rng() * (item.s[1] - item.s[0]);
        _e.set(0, rng() * Math.PI * 2, 0);
        _q.setFromEuler(_e);
        _v.set(p[0], 0, p[1]);
        _s.set(sc, sc * (.85 + rng() * .3), sc);
        _m.compose(_v, _q, _s);
        im.setMatrixAt(i, _m);
      });
      im.instanceMatrix.needsUpdate = true;
      im.frustumCulled = false;
      group.add(im);
    });
  });

  scene.add(group);
  return group;
}

/* ══════════════════════════════════════════════════════════════
   먼 산 — 공기원근법
   지역 빌더가 세운 산이 화면 위쪽을 다 막아 하늘이 보이지 않았다.
   ① 멀수록 하늘색에 가깝게 물들이고 ② 더 먼 곳에 낮은 능선을 두 겹 더 둔다.
   이러면 지평선에 깊이가 생기고, 능선 사이로 하늘이 드러난다.
   ══════════════════════════════════════════════════════════════ */
const _wp = new THREE.Vector3();

/** 이미 세워진 산을 거리에 따라 물들인다 (공용 재질을 건드리지 않게 새 재질을 준다) */
export function hazeDistant(scene, skyMid){
  const bound = ST.BOUND || 40;
  const far = 200;
  scene.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    if (o.geometry.type !== 'ConeGeometry') return;
    o.getWorldPosition(_wp);
    const r = Math.hypot(_wp.x, _wp.z);
    if (r < bound * 0.9) return;                 // 다니는 자리 안의 나무는 그대로 둔다
    const t = Math.min(1, (r - bound) / (far - bound));
    const base = (o.material && o.material.color) ? o.material.color : new THREE.Color('#B9BCA8');
    o.material = new THREE.MeshStandardMaterial({
      color: mix(base, skyMid, 0.22 + t * 0.58),
      flatShading: true, roughness: .97, metalness: 0
    });
  });
}

/** 더 먼 능선 두 겹 — 하늘과 땅 사이를 메운다 */
export function farRidges(scene, skyMid, seed){
  const rng = rngOf('ridge:' + (seed || ''));
  const g = new THREE.Group();
  g.name = 'farRidges';

  [{ r:[118, 138], h:[14, 26], n:26, t:.62 },
   { r:[172, 196], h:[20, 36], n:22, t:.80 }].forEach(layer => {
    const geoCol = mix('#A9AE9A', skyMid, layer.t);
    const m = new THREE.MeshStandardMaterial({ color: geoCol, flatShading:true, roughness:.98, metalness:0 });
    for (let i = 0; i < layer.n; i++){
      const a = (i / layer.n) * Math.PI * 2 + rng() * .12;
      const r = layer.r[0] + rng() * (layer.r[1] - layer.r[0]);
      const h = layer.h[0] + rng() * (layer.h[1] - layer.h[0]);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(14 + rng() * 12, h, 5), m);
      cone.position.set(Math.cos(a) * r, h / 2 - 2, Math.sin(a) * r);
      cone.rotation.y = rng() * 6.28;
      g.add(cone);
    }
  });
  scene.add(g);
  return g;
}

/* ══════════════════════════════════════════════════════════════
   지역 하나를 한 번에 꾸미기 — boot.js 가 부르는 것은 이것 하나
   ══════════════════════════════════════════════════════════════ */

/** 흩뿌리기 종류별 바닥색과 얼룩색 — 바닥이 한 가지 모래색이면 밋밋하다 */
const GROUND_OF_SET = {
  green: { base:'#DCDCC0', tones:['#C7CFA8', '#D3D6B8', '#BFC8A0'] },
  dry:   { base:'#DDD5C0', tones:['#CFC4A8', '#D8CCB0', '#C6BA9C'] },
  farm:  { base:'#DAD6B8', tones:['#C9BE96', '#D2CBA6', '#BFB48C'] },
  water: { base:'#D6DCC6', tones:['#C2CFB2', '#CED8C0', '#B8C8A8'] }
};

/** 시대 id → 어떤 흩뿌리기를 쓸지 */
const SET_OF_WORLD = {
  paleo:'dry', neolithic:'farm', bronze:'farm', samguk:'green',
  'unified-silla':'green', later:'green', goryeo:'green',
  'joseon-early':'green', 'joseon-late':'farm', 'open-port':'green',
  colonial:'dry', war:'dry'
};

/**
 * 지역이 바뀔 때 한 번 부른다.
 * 지역 빌더가 만든 납작한 바닥을 찾아 치우고, 굽이치는 바닥으로 바꾼 뒤
 * 하늘을 세우고 자연 조각을 흩뿌린다.
 */
export function dressArea(scene, opts){
  opts = opts || {};
  const bg = opts.bg || '#E9E4D3';
  const seed = (ST.WORLD_ID || '') + ':' + (ST.currentArea || '');

  // 지역 빌더가 놓은 평평한 바닥(220×220 평면)을 찾아 치운다
  const flats = [];
  scene.traverse(o => {
    if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' &&
        o.geometry.parameters && o.geometry.parameters.width >= 200 && o.name !== 'groundPro'){
      flats.push(o);
    }
  });
  let groundColor = opts.ground;
  flats.forEach(f => {
    if (!groundColor && f.material && f.material.color) groundColor = '#' + f.material.color.getHexString();
    scene.remove(f);
  });

  const set0 = opts.set || SET_OF_WORLD[ST.WORLD_ID] || 'green';
  const gp = GROUND_OF_SET[set0] || GROUND_OF_SET.green;
  // 지역 빌더가 정한 색이 있으면 그 쪽으로 조금 끌어 준다
  const gcol = groundColor ? mix(gp.base, groundColor, .35) : new THREE.Color(gp.base);

  buildGroundPro(scene, { color: gcol, seed });
  installSky(scene, bg, seed);
  groundPatches(scene, { color: gcol, tones: gp.tones, seed });

  const skyMid = midOf(bg);
  farRidges(scene, skyMid, seed);
  hazeDistant(scene, skyMid);

  const set = set0;
  const density = ST.lowSpec ? .5 : 1.35;

  if (natureReady()){
    scatterNature(scene, { set, seed, density });
  } else {
    // 아직 조각이 안 왔으면, 다 오고 나서 한 번 더 뿌린다.
    // 그 사이 지역이 바뀌었으면 하지 않는다.
    const token = seed;
    dressToken = token;
    preloadNature().then(() => {
      if (dressToken !== token) return;
      scatterNature(scene, { set, seed, density });
    });
  }
}

let dressToken = null;
