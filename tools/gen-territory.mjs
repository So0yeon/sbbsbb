/* GeoJSON → js/map2/territory-data.js  (개발 전용 · 앱에는 들어가지 않습니다)
 *
 *   node tools/gen-territory.mjs "<GeoJSON 폴더>" [허용오차]
 *
 * 원본 GeoJSON(약 14MB)은 저장소에 넣지 않습니다. 폴더 경로를 인자로 주세요.
 * 인자가 없으면 아래 SRC 기본값을 씁니다.
 *
 * 좌표는 기존 지도(js/map-data.js)와 같은 투영식을 쓰되, 7세기 발해가 경도 138.16까지
 * 뻗기 때문에 캔버스만 오른쪽으로 넓힙니다 (800×902 → 873×902). 기준점과 축척이 같아서
 * 기존 좌표는 그대로 유효합니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = process.argv[2] ||
  'C:/Users/김용현/Documents/카카오톡 받은 파일/한국사 국가별 영토/한국사 국가별 영토';
const TOL = Number(process.argv[3] || 1.1);   // 화면 픽셀 기준 허용오차
const MIN_AREA = 2;                            // 이보다 작은 조각은 버립니다 (px²)
const OUT = fileURLToPath(new URL('../js/map2/territory-data.js', import.meta.url));

// ── 투영 (js/map-data.js 와 동일한 식) ───────────────────────────────
const MAP = { lng0: 115, lng1: 139, lat0: 30, lat1: 49 };
const PX_PER_LNG = 800 / 22;      // 36.3636
const PX_PER_LAT = 902 / 19;      // 47.4737
const W = Math.round((MAP.lng1 - MAP.lng0) * PX_PER_LNG);
const H = Math.round((MAP.lat1 - MAP.lat0) * PX_PER_LAT);
const px = lng => (lng - MAP.lng0) * PX_PER_LNG;
const py = lat => (MAP.lat1 - lat) * PX_PER_LAT;

// ── 나라 ─────────────────────────────────────────────────────────────
const NATIONS = {
  gojoseon: { name: '고조선', color: '#A98467' },
  goguryeo: { name: '고구려', color: '#4E7F6A' },
  baekje:   { name: '백제',   color: '#4B6FA0' },
  silla:    { name: '신라',   color: '#A8843F' },
  gaya:     { name: '가야',   color: '#8B6FA8' },
  tamna:    { name: '탐라',   color: '#7A9B8E' },
  balhae:   { name: '발해',   color: '#3F6E8C' },
  hubaekje: { name: '후백제', color: '#9A5B4C' },
  korea:    { name: '고려',   color: '#4A7C8C' },
  choseon:  { name: '조선',   color: '#7A6A55' },
};

// ── 프레임 (시대 안에서 세기가 흐릅니다) ─────────────────────────────
// 큰 나라를 먼저 적어야 작은 나라가 위에 그려집니다.
const FRAMES = [
  { key: 'c0', century: 0, label: '고조선', eras: ['bronze'], dir: '', use: [
    ['gojoseon', '0gojoseon.geojson'] ] },

  { key: 'c4', century: 4, label: '4세기', eras: ['three'], dir: '4세기(백제 전성기)', use: [
    ['goguryeo', '4goguryeo.geojson'], ['baekje', '4baekje.geojson'],
    ['silla', '4silla.geojson'], ['gaya', '4gaya.geojson'], ['tamna', '4tamna.geojson'] ] },

  { key: 'c5', century: 5, label: '5세기', eras: ['three'], dir: '5세기(고구려 전성기)', use: [
    ['goguryeo', '5goguryeo.geojson'], ['baekje', '5baekje.geojson'],
    ['silla', '5silla.geojson'], ['gaya', '5gaya.geojson'], ['tamna', '5tamna.geojson'] ] },

  // 6세기는 신라 전성기입니다. 가야(562년 병합)와 탐라는 자료가 없어 이 장면에서 빠집니다.
  { key: 'c6', century: 6, label: '6세기', eras: ['three'], dir: '6세기(신라 전성기)', use: [
    ['goguryeo', '6goguryeo.geojson'], ['baekje', '6baekje.geojson'], ['silla', '6silla.geojson'] ] },

  /* 신라는 삼국 → 통일신라 → 후삼국까지 이어지는 한 나라로 둡니다 (영토가 이어서 모핑됩니다).
     7세기 장면에서만 이름표를 「통일신라」로 답니다 — use 의 셋째 칸이 그 이름표입니다. */
  { key: 'c7', century: 7, label: '7세기', eras: ['unified'], dir: '7세기', use: [
    ['balhae', '7balhae.geojson'], ['silla', '7tongilsilla.geojson', '통일신라'] ] },

  { key: 'c10', century: 10, label: '10세기', eras: ['later'], dir: '10세기', use: [
    ['korea', '10korea.geojson'], ['hubaekje', '10hubaekje.geojson'],
    ['silla', '10silla.geojson'], ['balhae', '10balhae.geojson'] ] },

  { key: 'c11', century: 11, label: '11세기', eras: ['goryeo'], dir: '', use: [
    ['korea', '11koea.geojson'] ] },

  { key: 'c12', century: 12, label: '12세기', eras: ['goryeo'], dir: '', use: [
    ['korea', '12korea.geojson'] ] },

  /* 조선 전기부터 6·25 까지는 영토가 같아 전환(모핑)을 두지 않습니다 — still */
  /* 조선은 고려를 이어받습니다 — 넷째 칸이 「이 나라의 앞선 나라」입니다.
     고려 영토가 조선 영토로 흘러갑니다 (사라졌다 생기지 않습니다). */
  { key: 'c14', century: 14, label: '조선', dir: '', still: true,
    use: [ ['choseon', '14choseon.geojson', null, 'korea'] ],
    eras: ['joseon_e', 'joseon_l', 'open', 'colonial', 'liberation', 'war'] },
];

// ── Douglas–Peucker ─────────────────────────────────────────────────
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return dp(pts.slice(0, idx + 1), tol).slice(0, -1).concat(dp(pts.slice(idx), tol));
}

// 닫힌 고리는 시작점과 끝점이 같습니다. 그대로 넣으면 기준선 길이가 0 이 되어 전부 지워지므로,
// 시작점에서 가장 먼 점을 찾아 두 도막으로 잘라 각각 처리합니다.
function dpRing(ring, tol) {
  const pts = ring.slice();
  const a = pts[0], b = pts[pts.length - 1];
  if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-9) pts.pop();
  if (pts.length < 4) return pts;
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > fd) { fd = d; far = i; }
  }
  const head = dp(pts.slice(0, far + 1), tol);
  const tail = dp(pts.slice(far).concat([pts[0]]), tol);
  return head.slice(0, -1).concat(tail.slice(0, -1));
}

const areaOf = pts => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
};

function pathOf(file) {
  const gj = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rings = [];
  let rawPts = 0;
  for (const ft of gj.features || []) {
    const g = ft.geometry; if (!g) continue;
    const polys = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
    for (const poly of polys) for (const ring of poly) {
      rawPts += ring.length;
      const projected = ring.map(([lng, lat]) => [px(lng), py(lat)]);
      const s = dpRing(projected, TOL);
      if (s.length >= 4 && areaOf(s) >= MIN_AREA) rings.push(s);
    }
  }
  const d = rings.map(r => 'M' + r.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z').join('');
  return { d, rings: rings.length, pts: rings.reduce((n, r) => n + r.length, 0), rawPts };
}

// ── 굽기 ─────────────────────────────────────────────────────────────
const used = new Set();
const frames = [];
let totalRaw = 0, totalPts = 0;

for (const f of FRAMES) {
  const nations = [];
  for (const [id, file, as, after] of f.use) {
    const full = path.join(SRC, f.dir, file);
    if (!fs.existsSync(full)) { console.warn('  건너뜀 — 파일 없음:', file); continue; }
    const o = pathOf(full);
    nations.push({ id, d: o.d, as, after });
    used.add(id);
    totalRaw += o.rawPts; totalPts += o.pts;
    console.log(`  ${f.key.padEnd(4)} ${id.padEnd(9)} 조각 ${String(o.rings).padStart(4)}  ${String(o.rawPts).padStart(6)}점 → ${String(o.pts).padStart(5)}점  ${(o.d.length / 1024).toFixed(0)}KB`);
  }
  if (nations.length) frames.push({ ...f, nations });
}

const nations = {};
for (const id of Object.keys(NATIONS)) if (used.has(id)) nations[id] = NATIONS[id];

const body =
`/* 자동 생성 — tools/gen-territory.mjs · 손으로 고치지 마세요.
   원본: 직접 제작한 시대별·국가별 GeoJSON (GADM 행정구역의 합집합)
   허용오차 ${TOL}px · 원본 ${totalRaw.toLocaleString()}점 → ${totalPts.toLocaleString()}점
   좌표는 기존 지도(js/map-data.js)와 같은 투영식입니다. 캔버스만 가로로 넓혔습니다. */

window.TERRITORY = {
  meta: { lng0:${MAP.lng0}, lng1:${MAP.lng1}, lat0:${MAP.lat0}, lat1:${MAP.lat1}, w:${W}, h:${H} },
  nations: ${JSON.stringify(nations, null, 2).replace(/\n/g, '\n  ')},
  frames: [
${frames.map(f => `    { key:'${f.key}', century:${f.century}, label:'${f.label}', eras:${JSON.stringify(f.eras)}${f.still ? ', still:true' : ''},
      nations:[
${f.nations.map(n => `        { id:'${n.id}'${n.as ? `, as:'${n.as}'` : ''}${n.after ? `, after:'${n.after}'` : ''}, d:'${n.d}' }`).join(',\n')}
      ] }`).join(',\n')}
  ]
};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body, 'utf8');
console.log();
console.log('프레임', frames.length, '· 나라', Object.keys(nations).length,
  '·', (body.length / 1024).toFixed(0) + 'KB →', OUT);
