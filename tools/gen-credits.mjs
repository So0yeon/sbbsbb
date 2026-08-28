/* ══════════════════════════════════════════════════════════════════════
   gen-credits.mjs — assets/photos/CREDITS.md → js/asset-credits.js 의 사진 블록

       node tools/gen-credits.mjs

   MASTER §9-6: asset-credits.js 는 append-only 다.
   이 스크립트는 `PHOTOS` 블록만 다시 쓰고, 손으로 적은 `EXTRA` 는 건드리지 않는다.
   CC BY-SA 사진의 저작자 이름은 한 글자도 줄이지 않는다.
   ══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'js', 'asset-credits.js');

const md = fs.readFileSync(path.join(ROOT, 'assets', 'photos', 'CREDITS.md'), 'utf8');
const rows = [];
md.split(/\r?\n/).forEach(l => {
  const m = l.match(/^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|/);
  if (!m) return;
  const file = m[1].trim();
  const item = m[2].trim();
  const orig = m[3].replace(/`/g, '').trim();
  const author = m[4].trim();
  const license = m[5].trim();
  if (!file || file === '파일') return;
  rows.push({ file, item, orig, author, license });
});

const body = rows.map(r =>
  `  { file:${JSON.stringify(r.file)}, item:${JSON.stringify(r.item)}, orig:${JSON.stringify(r.orig)}, ` +
  `author:${JSON.stringify(r.author)}, license:${JSON.stringify(r.license)}, ` +
  `source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' }`
).join(',\n');

/* 기존 파일에서 EXTRA 블록을 살린다 */
let extra = `[
  { file:'countries-50m.json', item:'지도 원본', author:'Natural Earth', license:'퍼블릭 도메인',
    source:'Natural Earth 1:50m', sourceUrl:'https://www.naturalearthdata.com/' },
  { file:'vendor/three', item:'3D 엔진', author:'three.js 기여자들', license:'MIT',
    source:'three.js 0.160.0', sourceUrl:'https://threejs.org/' },
  { file:'vendor/font', item:'글꼴', author:'길형진 (orioncactus)', license:'SIL OFL 1.1',
    source:'Pretendard v1.3.9', sourceUrl:'https://github.com/orioncactus/pretendard' },
  { file:'*.glb', item:'3D 모델 9점', author:'', license:'미확인',
    source:'출처와 이용 조건을 확인하기 전까지 앱에서 부르지 않습니다', sourceUrl:'' },
  { file:'assets/Models', item:'저폴리 키트 22점', author:'', license:'미확인',
    source:'라이선스 파일이 동봉되지 않아 사용을 보류했습니다', sourceUrl:'' },
  { file:'교과 내용', item:'학습 내용', author:'', license:'',
    source:'초등학교 5학년 2학기 사회 교과서 및 2022 개정 교육과정 문서를 참고해 새로 썼습니다', sourceUrl:'' }
]`;
try {
  const old = fs.readFileSync(OUT, 'utf8');
  const i = old.indexOf('var ATLAS_CREDITS_EXTRA = ');
  if (i >= 0){
    const from = i + 'var ATLAS_CREDITS_EXTRA = '.length;
    const end = old.indexOf('];', from);
    if (end > 0) extra = old.slice(from, end + 1);
  }
} catch(e){ /* 처음 만드는 경우 */ }

const out = `/* ══════════════════════════════════════════════════════════════════════
   asset-credits.js — 자료 출처와 저작권 (MASTER.md §9-6)

   ● PHOTOS 블록은 assets/photos/CREDITS.md 에서 만들어집니다.
     고치려면 CREDITS.md 를 고치고 \`node tools/gen-credits.mjs\` 를 다시 돌리세요.
   ● ATLAS_CREDITS_EXTRA 는 손으로 적는 곳입니다. append-only —
     새 자료를 넣은 사람이 배열 끝에 자기 항목만 더하고, 남의 항목은 지우지 않습니다.

   CC BY-SA 사진은 저작자 이름을 그대로 표시해야 합니다. 줄이거나 다듬지 마세요.
   ══════════════════════════════════════════════════════════════════════ */

var ATLAS_CREDITS_PHOTOS = [
${body}
];

var ATLAS_CREDITS_EXTRA = ${extra};

(function (g) {
  var byFile = {};
  ATLAS_CREDITS_PHOTOS.forEach(function (c) { byFile[c.file] = c; });

  function find(file) {
    if (!file) return null;
    var name = String(file).split('/').pop();
    return byFile[name] || byFile[name.replace(/\\.(jpg|jpeg|png|webp)$/i, '') + '.jpg'] || null;
  }

  /** 사진 아래에 적을 한 줄. 확인되지 않은 항목은 빈 줄을 만들지 않는다 */
  function creditLine(file) {
    var c = find(file);
    if (!c) return '';
    var bits = [];
    if (c.author) bits.push(c.author);
    if (c.license) bits.push(c.license);
    if (c.source) bits.push(c.source);
    return bits.join(' · ');
  }

  function all() {
    return { photos: ATLAS_CREDITS_PHOTOS.slice(), extra: ATLAS_CREDITS_EXTRA.slice() };
  }

  g.AtlasCredits = { find: find, creditLine: creditLine, all: all,
                     PHOTOS: ATLAS_CREDITS_PHOTOS, EXTRA: ATLAS_CREDITS_EXTRA };
})(typeof window !== 'undefined' ? window : globalThis);
`;

fs.writeFileSync(OUT, out, 'utf8');
console.log('사진 출처 ' + rows.length + '건을 js/asset-credits.js 에 적었습니다.');
