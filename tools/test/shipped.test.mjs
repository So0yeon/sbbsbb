/* ══════════════════════════════════════════════════════════════════════
   shipped.test.mjs — 배포본이 스스로 완결되어 있는지

       node --test tools/test/

   왜 필요한가
     저장소에 담기지 않은 파일을 담긴 파일이 부르면, 내 컴퓨터에서는
     멀쩡히 돌아가고 배포한 곳에서만 404 가 난다. 실제로 그런 일이 있었다 —
     js/engine/markers.js 를 담으면서 그 파일이 부르는 marker3d.js 를
     빠뜨려, GitHub Pages 에서만 화면이 서지 않았다.

     그래서 '내 폴더' 가 아니라 'git 이 아는 것' 만으로 확인한다.
   ══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });

/* 'git 이 아는 것' = 색인(index). 곧 커밋될 모습이므로,
   커밋하기 전에 빠진 것을 잡아낼 수 있다. */
const tracked = new Set(git('ls-files').split('\n').filter(Boolean));
const show = f => git('show', ':' + f);

/** 화면에 실제로 실려 나가는 것만 본다 (tools/ 는 만들 때만 쓰는 것) */
const shippedJs = [...tracked].filter(f => f.startsWith('js/') && /\.(js|mjs)$/.test(f));
const pages = ['index.html', 'map2.html', 'privacy.html'].filter(f => tracked.has(f));

/* import 'x' · import … from 'x' · import('x') — 문자열 안의 것은 걸러야 하므로
   줄 첫머리에서 시작하는 것만 본다 (변환기가 코드를 글자로 찍어 내는 곳이 있다) */
function importsOf(src){
  const out = [];
  src.split('\n').forEach(line => {
    const m = line.match(/^\s*(?:import|export)\b[^'"]*from\s*['"]([^'"]+)['"]/)
           || line.match(/^\s*import\s*['"]([^'"]+)['"]/)
           || line.match(/^\s*(?:const|let|var)?[^'"]*\bimport\(\s*['"]([^'"]+)['"]/);
    if (m) out.push(m[1]);
  });
  return out;
}

test('담긴 파일이 부르는 모듈은 모두 저장소에 있다', () => {
  const missing = [];
  shippedJs.forEach(f => {
    importsOf(show(f)).forEach(spec => {
      if (!spec.startsWith('.')) return;            // three 같은 것은 importmap 이 푼다
      const p = path.posix.normalize(path.posix.join(path.posix.dirname(f), spec));
      if (!tracked.has(p)) missing.push(`${f} → ${spec}`);
    });
  });
  assert.deepEqual(missing, [],
    '저장소에 없는 것을 부르고 있습니다 (배포하면 404):\n  ' + missing.join('\n  '));
});

test('페이지가 부르는 파일도 모두 저장소에 있다', () => {
  const missing = [];
  pages.forEach(f => {
    const src = show(f);
    [...src.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)].map(m => m[1]).forEach(p => {
      if (!p || /^(data:|https?:|#|mailto:)/.test(p)) return;
      const q = p.replace(/^\.\//, '').replace(/[?#].*$/, '');
      if (q.endsWith('/')) return;                  // 디렉터리는 확인하지 않는다
      if (!tracked.has(q)) missing.push(`${f} → ${q}`);
    });
  });
  assert.deepEqual(missing, [],
    '페이지가 없는 파일을 부르고 있습니다:\n  ' + missing.join('\n  '));
});

test('브라우저가 저절로 찾는 것도 있다', () => {
  // 파비콘을 data: URI 로만 두면 /favicon.ico 를 따로 찾아 404 가 남는다
  assert.ok(tracked.has('favicon.ico'), 'favicon.ico 가 없습니다');
});

test('자료가 가리키는 사진이 모두 있다', () => {
  const photos = new Set([...tracked]
    .filter(f => f.startsWith('assets/photos/'))
    .map(f => f.split('/').pop()));
  const missing = [];
  [...tracked].filter(f => f.startsWith('js/eras/')).forEach(f => {
    const src = show(f);
    const m = src.match(/export const QUESTS_([A-Z]+)_BASE = /);
    if (!m) return;
    const i = src.indexOf(m[0]);
    let quests;
    try { quests = JSON.parse(src.slice(i + m[0].length, src.indexOf(';\n\n', i))); }
    catch(e){ return; }
    quests.forEach(q => (q.img || []).forEach(v => {
      const bare = String(v).split('/').pop();
      const ok = /^assets\//.test(v) ? tracked.has(v) : photos.has(bare);
      if (!ok) missing.push(`${f.split('/').pop()} · ${q.id} → ${v}`);
    }));
  });
  assert.deepEqual(missing, [], '없는 사진을 가리킵니다:\n  ' + missing.join('\n  '));
});
