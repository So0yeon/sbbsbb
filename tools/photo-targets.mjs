/* ══════════════════════════════════════════════════════════════════════
   photo-targets.mjs — 사진이 필요한 학습 항목을 뽑는다

       node tools/photo-targets.mjs

   요구 10: 사진이 붙은 관찰 임무를 40개 이상으로 늘린다.
   먼저 "퀘스트가 참조하는데 사진이 없는 항목"을 우선순위대로 뽑는다.
   ══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/* 이미 있는 사진 */
const have = new Set();
fs.readdirSync(path.join(ROOT, 'assets', 'photos')).forEach(f => {
  const m = f.match(/^(.+?)(-2)?\.(jpg|jpeg|png|webp)$/i);
  if (m) have.add(m[1]);
});
fs.readdirSync(path.join(ROOT, 'assets')).forEach(f => {
  const m = f.match(/^(.+)\.webp$/i);
  if (m) have.add(m[1]);
});

/* CONTENT — map-data.js + atlas-content.js 에서 id/t/era 를 긁는다 */
function scrape(file){
  const src = fs.readFileSync(path.join(ROOT, 'js', file), 'utf8');
  const out = [];
  const re = /\{\s*id:'([^']+)'\s*,\s*era:'([^']+)'\s*,\s*cat:\[([^\]]*)\]\s*,\s*t:'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) out.push({ id: m[1], era: m[2], cat: (m[3].match(/'([^']+)'/) || [])[1], t: m[4] });
  return out;
}
const CONTENT = scrape('map-data.js').concat(scrape('atlas-content.js'));

/* 퀘스트가 참조하는 contentId */
const used = new Map();     // contentId → { kind, title, era }
fs.readdirSync(path.join(ROOT, 'js', 'eras')).forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'eras', f), 'utf8');
  const at = src.indexOf('export const QUESTS_');
  const end = src.indexOf(';\n\n', at);
  let arr = [];
  try { arr = JSON.parse(src.slice(src.indexOf('= ', at) + 2, end)); } catch(e){ return; }
  arr.forEach(q => {
    if (!q.contentId) return;
    const prev = used.get(q.contentId);
    const rank = q.kind === 'inspect' ? 0 : (q.kind === 'minigame' ? 1 : 2);
    if (!prev || rank < prev.rank) used.set(q.contentId, { rank, kind: q.kind || 'role', title: q.title, era: f.replace('.js','') });
  });
});

const rows = [];
CONTENT.forEach(c => {
  if (have.has(c.id)) return;
  const u = used.get(c.id);
  rows.push({ id: c.id, t: c.t, era: c.era, cat: c.cat, kind: u ? u.kind : '', rank: u ? u.rank : 9 });
});
rows.sort((a, b) => a.rank - b.rank || a.era.localeCompare(b.era));

const withPhoto = CONTENT.filter(c => have.has(c.id)).length;
const questsWithPhoto = [...used.keys()].filter(id => have.has(id)).length;

const lines = [];
lines.push(`학습 항목 ${CONTENT.length}개 · 사진 있음 ${withPhoto}개 · 없음 ${rows.length}개`);
lines.push(`퀘스트가 참조하는 항목 ${used.size}개 중 사진 있음 ${questsWithPhoto}개`);
lines.push('');
lines.push('사진이 필요한 항목 (퀘스트가 쓰는 것 먼저)');
lines.push('id\t종류\t시대\t분류\t이름');
rows.forEach(r => lines.push(`${r.id}\t${r.kind}\t${r.era}\t${r.cat}\t${r.t}`));

fs.writeFileSync(path.join(HERE, 'photo-targets.txt'), lines.join('\n'), 'utf8');
console.log(lines.slice(0, 3).join('\n'));
console.log('→ tools/photo-targets.txt (' + rows.length + '줄)');
