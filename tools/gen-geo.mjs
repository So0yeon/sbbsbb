/* ══════════════════════════════════════════════════════════════════════
   gen-geo.mjs — assets/countries-50m.json (Natural Earth 1:50m TopoJSON)
                 → js/atlas-geo.js  (실측 해안선)

       node tools/gen-geo.mjs

   MASTER §7-2 · §7-3
     - 눈대중 좌표로 한반도를 그리지 않는다
     - 좌표의 출처는 이 한 파일로 못박는다
     - 나라 영역은 브라우저의 SVG clipPath 로 자른다 (한반도용 / 대륙용 두 벌)
   좌표는 [위도, 경도] 순서다 (§7-1).
   ══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const topo = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'countries-50m.json'), 'utf8'));
const { scale, translate } = topo.transform;

/* ── 아크 풀기 ───────────────────────────────────────────────── */
const ARCS = topo.arcs.map(arc => {
  let x = 0, y = 0;
  return arc.map(p => {
    x += p[0]; y += p[1];
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]];   // [lng, lat]
  });
});

function arcOf(i){
  if (i < 0) return ARCS[~i].slice().reverse();
  return ARCS[i];
}
function ringOf(idxs){
  const out = [];
  idxs.forEach((i, k) => {
    const a = arcOf(i);
    out.push(...(k === 0 ? a : a.slice(1)));
  });
  return out;
}
function ringsOf(geom){
  if (geom.type === 'Polygon') return geom.arcs.map(ringOf);
  if (geom.type === 'MultiPolygon') return geom.arcs.flatMap(poly => poly.map(ringOf));
  return [];
}

/* ── 지도 범위 (map-data.js 의 MAP 과 같아야 한다) ───────────── */
const VIEW = { lng0: 114, lng1: 138, lat0: 29, lat1: 50 };

function inView(ring){
  return ring.some(p => p[0] >= VIEW.lng0 && p[0] <= VIEW.lng1 && p[1] >= VIEW.lat0 && p[1] <= VIEW.lat1);
}
function clipToView(ring){
  // 범위 밖 좌표는 가장자리로 눌러 둔다 (선이 화면 밖으로 길게 뻗지 않게)
  return ring.map(p => [
    Math.min(VIEW.lng1 + 2, Math.max(VIEW.lng0 - 2, p[0])),
    Math.min(VIEW.lat1 + 2, Math.max(VIEW.lat0 - 2, p[1]))
  ]);
}
function simplify(ring, tol){
  const out = [ring[0]];
  for (let i = 1; i < ring.length; i++){
    const a = out[out.length - 1], b = ring[i];
    if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) >= tol) out.push(b);
  }
  if (out.length > 2) out.push(ring[ring.length - 1]);
  return out;
}
function area(ring){
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++){
    s += (ring[j][0] * ring[i][1]) - (ring[i][0] * ring[j][1]);
  }
  return Math.abs(s / 2);
}
/** [lng,lat] → [lat,lng] 로 뒤집고 소수 3자리로 줄인다 */
function toLatLng(ring){
  return ring.map(p => [ +p[1].toFixed(3), +p[0].toFixed(3) ]);
}

/* ── 나라 고르기 ─────────────────────────────────────────────── */
const geoms = topo.objects.countries.geometries;
const nameOf = g => (g.properties && (g.properties.name || g.properties.NAME)) || g.id || '';

const KOREA_NAMES = ['South Korea', 'North Korea', 'Korea, South', 'Korea, North', 'Republic of Korea', 'Dem. Rep. Korea'];
const NEAR_NAMES = ['China', 'Japan', 'Russia', 'Mongolia', 'Taiwan'];

function collect(names, minArea, tol){
  const rings = [];
  geoms.forEach(g => {
    const n = nameOf(g);
    if (!names.some(x => n === x || n.indexOf(x) >= 0)) return;
    ringsOf(g).forEach(r => {
      if (!inView(r)) return;
      if (area(r) < minArea) return;
      rings.push(simplify(clipToView(r), tol));
    });
  });
  return rings;
}

const korea = collect(KOREA_NAMES, 0.0008, 0.012);
const asia  = collect(NEAR_NAMES,  0.02,   0.05);

if (!korea.length) throw new Error('한반도 폴리곤을 찾지 못했습니다 — 나라 이름 표기를 확인하세요');

const nPts = a => a.reduce((s, r) => s + r.length, 0);

/* 제주도 — map-data.js 의 ERAS 가 `pts:[[...],JEJU]` 로 참조한다.
   한반도 폐곡선 중 위도 33.0~33.8 · 경도 126.0~127.0 안에 있는 것을 고른다. */
const jejuRing = korea.find(r =>
  r.length > 8 &&
  r.every(p => p[1] >= 33.0 && p[1] <= 33.9 && p[0] >= 125.9 && p[0] <= 127.1)
);
if (!jejuRing) console.warn('⚠ 제주도 폐곡선을 찾지 못했습니다 — JEJU 가 비어 있습니다');
const JEJU = jejuRing ? toLatLng(jejuRing) : [];

const out = `/* 자동 생성 — tools/gen-geo.mjs
   원본: assets/countries-50m.json (Natural Earth 1:50m, 퍼블릭 도메인)
   좌표는 [위도, 경도] 순서입니다 (MASTER §7-1).

   KOREA — 한반도와 부속 섬 ${korea.length}개 폐곡선 (${nPts(korea)}점)
   ASIA  — 주변국 육지 ${asia.length}개 폐곡선 (${nPts(asia)}점)

   나라 영역은 이 폴리곤을 clipPath 로 써서 브라우저가 잘라 냅니다 (§7-3).
   배열을 통째로 갈아 끼우지 말고 내용만 바꾸세요 — map-app.js 가 참조로 붙잡습니다. */

var KOREA = ${JSON.stringify(toLatLngAll(korea))};
var ASIA  = ${JSON.stringify(toLatLngAll(asia))};

/* 제주도 — map-data.js 의 나라 영역이 \`pts:[[...],JEJU]\` 로 참조합니다.
   그래서 이 파일은 map-data.js 보다 먼저 실려야 합니다. (${JEJU.length}점) */
var JEJU = ${JSON.stringify(JEJU)};

window.KOREA = KOREA;
window.ASIA = ASIA;
window.JEJU = JEJU;

function refill(target, source){
  target.length = 0;
  for (var i = 0; i < source.length; i++) target.push(source[i]);
}
window.refill = refill;
`;

function toLatLngAll(rings){ return rings.map(toLatLng); }

fs.writeFileSync(path.join(ROOT, 'js', 'atlas-geo.js'), out, 'utf8');
console.log(`한반도 ${korea.length}개 폐곡선 ${nPts(korea)}점 · 주변국 ${asia.length}개 ${nPts(asia)}점`);
