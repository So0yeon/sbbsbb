/* ══════════════════════════════════════════════════════════════════════
   check-style.mjs — 생성된 시대 파일에 해요체·합니다체가 남았는지 검사

       node tools/check-style.mjs

   탐험 모드 텍스트는 전부 사극체여야 한다 (설계 §1).
   남은 것은 tools/style-hao.mjs 규칙이나 style-exceptions.json 으로 고친다.
   결과는 tools/style-report.txt 에 남는다.
   ══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ERAS = path.join(ROOT, 'js', 'eras');

/* 문장 끝으로 볼 글자 */
const TAILSET = ' \t\n.!?…"\'”’」』)]';

/* 낱말이라 바꾸면 안 되는 것 */
const NOUN = /(담요|자유|중요|필요|주요|무료|재료|자료|비료|연료|원료|치료|훈요|고요|동요|요요)$/;

/* `~다`로 끝나는 다체는 정상이다. 아니다·어머니다·다니다 따위를 걸러 낸다 */
const OK_NIDA = /(아니다|어머니다|다니다|보내다|만나다|지나다|떠나다|건너다|하나다)$/;

const files = fs.readdirSync(ERAS).filter(f => f.endsWith('.js'));
const hits = [];

files.forEach(f => {
  const src = fs.readFileSync(path.join(ERAS, f), 'utf8');
  const at = src.indexOf('export const');
  const body = at < 0 ? src : src.slice(at);        // 머리말 주석 제외
  const re = /[가-힣]{1,10}(요|니다)/g;
  let m;
  while ((m = re.exec(body))){
    const end = m.index + m[0].length;
    const next = body[end] || '';
    if (next && TAILSET.indexOf(next) < 0) continue;
    if (NOUN.test(m[0]) || OK_NIDA.test(m[0])) continue;
    if (/습니다$/.test(m[0]) === false && /니다$/.test(m[0]) && !/[ㅂ]니다$/.test(m[0])){
      // 'ㅇㅇ니다' 형태 중 다체가 아닌 것만 남긴다 — 위 OK_NIDA 로 대부분 걸러진다
    }
    hits.push({ file: f, word: m[0],
                around: body.slice(Math.max(0, m.index - 44), end + 2).replace(/\n/g, ' ') });
  }
});

const out = hits.length === 0
  ? '남은 해요체 0건. 탐험 모드 문체 검사를 통과했습니다.'
  : `남은 해요체 ${hits.length}건\n` +
    hits.map(h => `  ${h.file} | ${h.word} | …${h.around}`).join('\n');

fs.writeFileSync(path.join(HERE, 'style-report.txt'), out, 'utf8');
console.log(out.split('\n').slice(0, 40).join('\n'));
process.exitCode = hits.length === 0 ? 0 : 1;
