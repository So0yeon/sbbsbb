/* ══════════════════════════════════════════════════════════════════════
   chain.test.mjs — 신석기 미션 시퀀스가 요청서 §12 검증 목록을 지키는지

       node --test tools/test/

   자료만 보고 판단할 수 있는 항목을 전부 여기서 막는다.
   화면이 필요한 항목(관찰 UI·놀이 조작)은 tools/check.sh 의 stop=mission 이 본다.
   ══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { CHAIN_NEOLITHIC: C } = await import('file://' + path.join(ROOT, 'js/engine/chain-neolithic.js'));

const steps = C.steps;
const OBS   = steps.filter(s => s.act === 'observe');
const GAMES = steps.filter(s => s.act === 'minigame');
const PICKS = steps.filter(s => s.act === 'choice');

/* 기존 콘텐츠에서 신석기 항목을 뽑는다 (map-data.js 가 유일한 출처) */
function neoContentIds(){
  const src = fs.readFileSync(path.join(ROOT, 'js/map-data.js'), 'utf8');
  const ids = [];
  src.split('\n').forEach(l => {
    const m = l.match(/\{\s*id:'([^']+)',\s*era:'neo'/);
    if (m) ids.push(m[1]);
  });
  return ids;
}

test('첫 미션은 "여기가 언제지" 이고, 시대 판별이 첫 관찰이다', () => {
  assert.equal(steps[0].arc.startsWith('0막'), true);
  assert.match(steps[1].goal, /시대를 알아내라/);
  assert.equal(steps[1].act, 'observe');
  assert.equal(steps[1].solve.mode, 'compare');
  // 결론 카드가 0막 안에 있다
  const concl = steps.find(s => s.id === 'conclude-age');
  assert.ok(concl && concl.arc.startsWith('0막'));
  assert.ok(steps.indexOf(concl) < 5);
});

test('관찰이 끝나기 전에 유물 이름을 노출하지 않는다', () => {
  for (const s of OBS){
    const q = s.solve.question || '';
    const name = (s.solve.reveal && s.solve.reveal.name) || '';
    if (!name) continue;
    // 질문과 관찰 지점 글에 이름이 들어가면 안 된다
    const bare = name.split('—')[0].trim();
    assert.equal(q.includes(bare), false, `질문에 이름이 새어 나감: ${s.id}`);
    (s.solve.points || []).forEach(p => {
      assert.equal(p.text.includes(bare), false, `관찰 지점 글에 이름이 새어 나감: ${s.id}`);
    });
  }
  // 빗살무늬 토기는 13번째 걸음에서 이름을 감추고, 16번째에서야 밝힌다
  const first = steps.find(s => s.id === 'see-pot');
  const later = steps.find(s => s.id === 'match-pot');
  assert.equal(first.solve.revealAfter, false);
  assert.ok(later.solve.reveal.name.includes('빗살무늬'));
  assert.ok(steps.indexOf(first) < steps.indexOf(later));
});

test('관찰이 clue · match · trace 세 갈래를 모두 쓴다', () => {
  const modes = new Set(OBS.map(s => s.solve.mode));
  ['clue', 'match', 'trace'].forEach(m => assert.ok(modes.has(m), m + ' 이 없습니다'));
});

test('모든 자료에 출처나 "그림"임을 밝힐 근거가 있다', () => {
  for (const s of OBS){
    const sv = s.solve;
    [[sv.photo, sv.art], [sv.photo2, sv.art2]].forEach(([photo, art], i) => {
      if (!photo && !art) { assert.equal(i, 1, `자료가 없습니다: ${s.id}`); return; }
      if (photo){
        assert.ok(photo.src, `사진 경로 없음: ${s.id}`);
        assert.ok(photo.source && photo.license,
          `사진에 출처·이용 조건이 없습니다: ${s.id} (${photo.src})`);
        assert.ok(fs.existsSync(path.join(ROOT, photo.src)), `사진 파일이 없습니다: ${photo.src}`);
      }
    });
  }
});

test('쓰는 그림이 artifact-art.js 에 모두 있다', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'js/engine/artifact-art.js'), 'utf8');
  const names = [...src.matchAll(/^\s{2}(\w+):\s*\{$/gm)].map(m => m[1]);
  for (const s of OBS){
    [s.solve.art, s.solve.art2].filter(Boolean).forEach(a =>
      assert.ok(names.includes(a), `${s.id} 가 부르는 그림이 없습니다: ${a}`));
  }
  GAMES.forEach(g => {
    if (g.game.art) assert.ok(names.includes(g.game.art), `놀이 그림 없음: ${g.game.art}`);
  });
});

test('모든 걸음이 "왜 지금 이걸 하지"에 답할 수 있다 (앞 걸음과 이어진다)', () => {
  // 이어짐의 최소 조건: 만들기(combine)에 필요한 것은 앞에서 이미 얻어야 한다
  const owned = new Set();
  steps.forEach((s, i) => {
    if (s.act === 'combine'){
      (s.need || []).forEach(n =>
        assert.ok(owned.has(n), `${s.id}(${i + 1}번째)가 요구하는 "${n}" 을 앞에서 얻지 않습니다`));
    }
    ((s.onSuccess && s.onSuccess.gain) || []).forEach(g => owned.add(g));
  });
});

test('기존 신석기 콘텐츠 항목이 하나도 빠지지 않는다', () => {
  const want = neoContentIds();
  assert.ok(want.length >= 7, '신석기 콘텐츠를 찾지 못했습니다');
  const used = new Set(steps.map(s => s.contentId).filter(Boolean));
  want.forEach(id => assert.ok(used.has(id), `미션에 나오지 않는 항목: ${id}`));
});

test('콘텐츠를 새로 지어내지 않는다 — contentId 는 실제 항목만 가리킨다', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js/map-data.js'), 'utf8');
  steps.filter(s => s.contentId).forEach(s =>
    assert.ok(src.includes(`id:'${s.contentId}'`), `없는 항목을 가리킵니다: ${s.contentId}`));
});

test('총점·등급·별점이 어디에도 없다', () => {
  // 주석에 적힌 "점수를 만들지 않는다" 는 다짐이므로, 자료와 상태만 본다
  const raw = JSON.stringify(C);
  [/총점/, /별점/, /점수/, /등급/].forEach(re =>
    assert.equal(re.test(raw), false, '자료에 점수 같은 것이 있습니다: ' + re));
  const eng = fs.readFileSync(path.join(ROOT, 'js/engine/quest-engine.js'), 'utf8');
  // 엔진에도 점수를 세는 것이 없어야 한다 (설명 주석은 세지 않는다)
  const code = eng.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  [/score/i, /별점/, /총점/].forEach(re =>
    assert.equal(re.test(code), false, '엔진에 점수가 있습니다: ' + re));
});

test('큰 선택에는 반드시 잃는 것이 있다', () => {
  assert.ok(PICKS.length >= 3, '되돌릴 수 없는 선택이 너무 적습니다');
  PICKS.forEach(s => (s.options || []).forEach(o => {
    assert.ok(o.gain && o.gain.trim(), `${s.id}: 얻는 것이 비었습니다`);
    assert.ok(o.lose && o.lose.trim(), `${s.id}: 잃는 것이 비었습니다`);
  }));
});

test('놀이는 템플릿 6종이거나 이식해 온 신석기 놀이여야 한다', () => {
  // 템플릿 여섯은 우리가 만든 것, neo-* 는 예시 꾸러미에서 그대로 옮겨 온 것이다
  const TPL  = ['restore','sequence','sort','compare','decode','timed'];
  const NEO  = ['neo-grind','neo-winnow','neo-spindle','neo-umjip','neo-rite'];
  GAMES.forEach(g => {
    const k = g.game.tpl || g.game.type;
    assert.ok(TPL.includes(k) || NEO.includes(k), '알 수 없는 놀이: ' + k);
  });
  assert.ok(GAMES.length <= Math.floor(steps.length / 3),
    `놀이가 너무 많습니다 ${GAMES.length} / ${steps.length}`);
});

test('이식해 온 놀이는 실제로 등록된 다섯 가지만 쓴다', () => {
  const src = fs.readFileSync(path.join(ROOT, 'js/engine/neo-games.js'), 'utf8');
  const listed = (src.match(/'neo-[a-z]+'/g) || []).map(s => s.replace(/'/g, ''));
  GAMES.filter(g => g.game.type).forEach(g =>
    assert.ok(listed.includes(g.game.type), '다리에 없는 놀이: ' + g.game.type));
});

test('같은 놀이를 연달아 놓지 않는다', () => {
  let prev = null;
  steps.forEach(s => {
    if (s.act !== 'minigame'){ prev = null; return; }
    const k = s.game.tpl || s.game.type;
    assert.notEqual(k, prev, '같은 놀이가 연달아 나옵니다: ' + k);
    prev = k;
  });
});

test('같은 상호작용이 세 번 연달아 나오지 않는다', () => {
  for (let i = 2; i < steps.length; i++){
    const a = steps[i].act;
    assert.equal(a === steps[i-1].act && a === steps[i-2].act, false,
      `${a} 가 세 번 연달아 나옵니다 (${i + 1}번째)`);
  }
});

test('놀이는 60초 안에 끝난다', () => {
  GAMES.forEach(g => {
    if (g.game.tpl === 'timed') assert.ok(g.game.seconds <= 60, g.id + ' 가 너무 깁니다');
  });
});

test('게임 오버가 없다 — 모든 놀이가 그만두어도 넘어갈 상태를 갖는다', () => {
  GAMES.forEach(g => {
    assert.ok(g.qualityFlag, `${g.id}: 결과를 남길 플래그가 없습니다`);
  });
});

test('엔딩은 진행 상태 넷에서만 나온다', () => {
  const ok = ['flags', 'relations', 'kept', 'inventory'];
  (C.ending.slots || []).forEach(s => assert.ok(ok.includes(s.from), '엉뚱한 출처: ' + s.from));
  assert.ok(C.ending.fixed, '모든 플레이에 같은 고정 부분이 있어야 합니다');
});

test('엔딩에 우열을 매기는 말을 쓰지 않는다', () => {
  const raw = JSON.stringify(C.ending);
  [/축하/, /아쉽게도/, /최고/, /훌륭한 결과/, /실패/].forEach(re =>
    assert.equal(re.test(raw), false, '우열을 매기는 말: ' + re));
});

test('모든 걸음에 무엇을 하는지가 적혀 있다', () => {
  steps.forEach((s, i) => {
    assert.ok(s.id, `${i + 1}번째 걸음에 id 가 없습니다`);
    assert.ok(s.goal, `${s.id} 에 goal 이 없습니다`);
    assert.ok(s.arc, `${s.id} 에 막 표시가 없습니다`);
  });
  const ids = steps.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length, 'id 가 겹칩니다');
});

test('이모지를 쓰지 않는다', () => {
  // 괘선(═)·화살표(→)·기하 도형(◉)은 이모지가 아니다.
  // 유니코드가 '그림 문자'로 정한 것만 센다.
  const files = ['js/engine/chain-neolithic.js', 'js/engine/observe.js',
                 'js/engine/mg-templates.js', 'js/engine/quest-engine.js',
                 'js/engine/artifact-art.js', 'js/engine/chains.js'];
  files.forEach(f => {
    const raw = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const m = raw.match(/(?![©®™])\p{Extended_Pictographic}/gu) || [];
    assert.equal(m.length, 0, f + ' 에 이모지가 있습니다: ' + m.join(' '));
  });
});

test('다른 시대는 엔진을 고치지 않고 등록표 한 줄로 더한다', () => {
  const reg = fs.readFileSync(path.join(ROOT, 'js/engine/chains.js'), 'utf8');
  assert.match(reg, /export const CHAINS/);
  assert.match(reg, /chainOf/);
  // 엔진이 특정 시대를 알고 있으면 안 된다
  const eng = fs.readFileSync(path.join(ROOT, 'js/engine/quest-engine.js'), 'utf8');
  assert.equal(/neolithic|신석기/.test(eng), false, '엔진이 특정 시대를 알고 있습니다');
});
