/* ══════════════════════════════════════════════════════════════════════
   audit.mjs — 생성된 퀘스트 데이터 전수 점검

       node tools/audit.mjs

   "완료할 수 없는 임무" 를 찾아낸다. MASTER §14 검증 목록의 자동화판이다.
   ══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/* 학습 항목 id 모음 (map-data.js + atlas-content.js) */
const contentIds = new Set();
['map-data.js', 'atlas-content.js'].forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  const re = /\{\s*id:'([^']+)'\s*,\s*era:'/g;
  let m; while ((m = re.exec(src))) contentIds.add(m[1]);
});

/* 사진 파일 */
const photoFiles = new Set(fs.readdirSync(path.join(ROOT, 'assets', 'photos')));
fs.readdirSync(path.join(ROOT, 'assets')).forEach(f => { if (/\.webp$/i.test(f)) photoFiles.add('assets/' + f); });

const MINI_TYPES = new Set(['aim','spin','knap','ember','stack','grind','lift','sort','memory','blank',
                            'dig','trace','weigh','route','order','spot','rhythm','steer','cipher','pour']);

const problems = [];
const stat = { quests:0, gates:0, mini:0, inspectMini:0, photo:0 };

function load(file){
  const src = fs.readFileSync(path.join(ROOT, 'js', 'eras', file), 'utf8');
  const grab = name => {
    const head = 'export const ' + name + ' = ';
    const i = src.indexOf(head);
    if (i < 0) return null;
    const from = i + head.length;
    const end = src.indexOf(';\n\n', from);
    try { return JSON.parse(src.slice(from, end)); } catch(e){ return null; }
  };
  const key = (src.match(/export const QUESTS_([A-Z]+)_BASE/) || [])[1];
  return { key, quests: grab('QUESTS_' + key + '_BASE') || [], areas: grab('AREAS_' + key) || {},
           npcs: grab('NPCS_' + key) || [], relics: grab('RELICS_' + key) || [], gates: grab('GATES_' + key) || [] };
}

const files = fs.readdirSync(path.join(ROOT, 'js', 'eras')).filter(f => f.endsWith('.js'));
const areaCount = {};

files.forEach(file => {
  const era = file.replace('.js', '');
  const { quests, areas, npcs, relics, gates } = load(file);
  const areaIds = Object.keys(areas);
  const P = (id, msg) => problems.push(`${era} · ${id} — ${msg}`);

  const ids = new Set();
  quests.forEach(q => {
    stat.quests++;
    if (ids.has(q.id)) P(q.id, '퀘스트 id 가 겹칩니다');
    ids.add(q.id);

    if (!q.pos && q.kind !== 'find') P(q.id, '좌표가 없습니다');
    if (q.area && !areaIds.includes(q.area)) P(q.id, `없는 지역을 가리킵니다 (${q.area})`);
    if (q.contentId && !contentIds.has(q.contentId)) P(q.id, `없는 학습 항목을 가리킵니다 (${q.contentId})`);
    if (q.img) {
      const f = q.img[0];
      if (!photoFiles.has(f) && !photoFiles.has(f.replace('assets/', 'assets/'))) P(q.id, `사진 파일이 없습니다 (${f})`);
      else stat.photo++;
    }

    /* 완료할 수 있는가 */
    const hasQ = q.q && Array.isArray(q.q.choices) && q.q.choices.length >= 2;
    const hasCap = q.capstone && Array.isArray(q.capstone.choices) && q.capstone.choices.length >= 2;
    const hasMini = !!(q.mini && q.mini.type);
    const hasStages = Array.isArray(q.stages) && q.stages.length > 0;
    const hasChoices = Array.isArray(q.choices) && q.choices.length > 0;
    const hasItems = Array.isArray(q.items) && q.items.length > 0;
    const hasHot = Array.isArray(q.hotspots) && q.hotspots.length > 0;

    if (q.kind === 'find'){
      if (!hasItems) P(q.id, '수집형인데 찾을 것이 없습니다');
      q.items && q.items.forEach(it => { if (!it.pos) P(q.id, `수집 항목 ${it.id} 에 좌표가 없습니다`); });
    } else if (q.kind === 'choice'){
      if (!hasChoices) P(q.id, '열린 선택인데 선택지가 없습니다');
      (q.choices || []).forEach((c, i) => { if (!c.label) P(q.id, `선택지 ${i} 에 문구가 없습니다`); });
    } else if (q.kind === 'inspect'){
      if (!hasHot) P(q.id, '조사형인데 살펴볼 것이 없습니다');
      if (q.capstone && !hasCap && !hasMini) P(q.id, '마무리 문제의 선택지가 비어 있고 대신할 놀이도 없습니다 (완료 불가)');
      if (hasMini) stat.inspectMini++;
    } else if (hasStages){
      q.stages.forEach((s, i) => {
        if (!s.q || !Array.isArray(s.q.choices) || s.q.choices.length < 2) P(q.id, `${i + 1}번째 단계에 선택지가 없습니다`);
      });
    } else {
      if (!hasQ && !hasMini) P(q.id, '묻는 말도 놀이도 없습니다 (완료 불가)');
    }

    if (hasQ){
      if (q.q.correct == null || q.q.correct < 0 || q.q.correct >= q.q.choices.length)
        P(q.id, `정답 번호가 범위를 벗어납니다 (${q.q.correct} / ${q.q.choices.length})`);
    }
    if (hasCap){
      if (q.capstone.correct == null || q.capstone.correct < 0 || q.capstone.correct >= q.capstone.choices.length)
        P(q.id, `마무리 문제 정답 번호가 범위를 벗어납니다`);
    }
    if (hasMini){
      stat.mini++;
      if (!MINI_TYPES.has(q.mini.type)) P(q.id, `모르는 놀이 종류입니다 (${q.mini.type})`);
      if (q.mini.type === 'stack' && !(q.mini.steps || []).length) P(q.id, 'stack 인데 단계가 없습니다');
      if (q.mini.type === 'sort' && !(q.mini.items || []).length) P(q.id, 'sort 인데 가를 것이 없습니다');
      if (q.mini.type === 'blank' && !q.mini.answer) P(q.id, 'blank 인데 정답이 없습니다');
    }

    /* 마커가 겹치지 않는가 (같은 지역 안에서 4단위) */
    if (q.pos){
      quests.forEach(o => {
        if (o === q || !o.pos || o.area !== q.area) return;
        if (o.id <= q.id) return;
        const d = Math.hypot(o.pos.x - q.pos.x, o.pos.z - q.pos.z);
        if (d < 4) P(q.id, `${o.id} 와 너무 가깝습니다 (${d.toFixed(1)})`);
      });
    }
  });

  gates.forEach(g => {
    stat.gates++;
    if (!areaIds.includes(g.to)) P(g.id, `가는 곳이 없는 지역입니다 (${g.to})`);
    if (!areaIds.includes(g.area)) P(g.id, `있는 곳이 없는 지역입니다 (${g.area})`);
  });

  /* 지역마다 돌아오는 관문이 있는가 */
  if (areaIds.length > 1){
    areaIds.forEach(a => {
      const out = gates.filter(g => g.area === a);
      if (!out.length) problems.push(`${era} · ${a} — 이 지역에서 나가는 관문이 없습니다`);
      const into = gates.filter(g => g.to === a);
      if (!into.length) problems.push(`${era} · ${a} — 이 지역으로 오는 관문이 없습니다`);
    });
  }

  /* 지역 쏠림 (가장 많은 지역 ≤ 가장 적은 지역 × 2) */
  if (areaIds.length > 1){
    const per = areaIds.map(a => quests.filter(q => q.area === a).length);
    const mx = Math.max(...per), mn = Math.min(...per);
    areaCount[era] = per.join('/');
    if (mn > 0 && mx > mn * 3) problems.push(`${era} — 지역 쏠림이 큽니다 (${per.join(' / ')})`);
  }

  /* 도착 지점이 마커와 6 이상 떨어졌는가 */
  areaIds.forEach(a => {
    const sp = areas[a].spawn;
    if (!sp) return;
    quests.forEach(q => {
      if (q.area !== a || !q.pos) return;
      const d = Math.hypot(q.pos.x - sp.x, q.pos.z - sp.z);
      if (d < 6) problems.push(`${era} · ${a} — 도착 지점이 ${q.id} 와 ${d.toFixed(1)} 밖에 안 떨어졌습니다`);
    });
    const bound = areas[a].bound || 40;
    quests.forEach(q => {
      if (q.area !== a || !q.pos) return;
      const r = Math.hypot(q.pos.x, q.pos.z);
      if (r > bound) problems.push(`${era} · ${a} — ${q.id} 가 다닐 수 있는 범위 밖입니다 (${r.toFixed(1)} > ${bound})`);
    });
  });

  /* 유물이 실재하는 퀘스트에 붙었는가 */
  relics.forEach(r => {
    if (!ids.has(r.from)) problems.push(`${era} · ${r.id} — 없는 퀘스트에서 나옵니다 (${r.from})`);
  });

  /* NPC */
  npcs.forEach((n, i) => {
    if (n.area && !areaIds.includes(n.area)) problems.push(`${era} · NPC ${i} — 없는 지역입니다 (${n.area})`);
    if (!n.lines || !n.lines.length) problems.push(`${era} · NPC ${i} — 대사가 없습니다`);
  });
});

const lines = [];
lines.push(`퀘스트 ${stat.quests} · 관문 ${stat.gates} · 놀이 ${stat.mini} · 사진 ${stat.photo}`);
lines.push(`조사형인데 놀이도 있는 임무 ${stat.inspectMini}개`);
lines.push('');
if (!problems.length) lines.push('찾은 문제 없음.');
else {
  lines.push(`찾은 문제 ${problems.length}건`);
  problems.forEach(p => lines.push('  ' + p));
}
const out = lines.join('\n');
fs.writeFileSync(path.join(HERE, 'audit-report.txt'), out, 'utf8');
console.log(out.split('\n').slice(0, 60).join('\n'));
process.exitCode = problems.length ? 1 : 0;
