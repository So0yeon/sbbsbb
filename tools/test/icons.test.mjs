/* ══════════════════════════════════════════════════════════════════════
   icons.test.mjs — 선 아이콘 한 벌 (요구 2)

       node --test tools/test/

   이모지를 쓰지 않기로 했으므로 두 가지를 지켜야 한다.
     ① 화면에 쓰는 그림 이름이 전부 실제로 있어야 한다 (빈 칸이 생기면 안 된다)
     ② strip() 이 자료에 남은 이모지를 확실히 걷어내야 한다
   ══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const A = require('../../js/icons.js');

/* 코드가 실제로 부르는 이름들 — 하나라도 빠지면 화면이 빈다 */
const USED = [
  'relic','person','culture','event','exchange','life',
  'pin','gate','find','npc',
  'search','map','book','bag','medal','print','compass',
  'close','check','question','chevronL','chevronR','arrowR',
  'step','paw','hourglass','bookOpen','eye','gamepad','chat','pen',
  'fire','water','leaf','mountain','moon','sun',
  'axe','bone','scale','dove','flag','lamp','urn','teapot','boat','rock','house','dot'
];

test('쓰는 그림이 모두 있다', () => {
  for (const n of USED) assert.equal(A.has(n), true, n);
});

test('그림 이름표(BY_EMOJI)가 가리키는 그림도 모두 있다', () => {
  for (const [emo, name] of Object.entries(A.BY_EMOJI)){
    assert.equal(A.has(name), true, emo + ' → ' + name);
  }
});

test('svg() 는 그릴 수 있는 SVG 를 돌려준다', () => {
  const s = A.svg('relic', { size: 20 });
  assert.match(s, /^<svg /);
  assert.match(s, /viewBox="0 0 24 24"/);
  assert.match(s, /width="20"/);
  assert.ok(s.includes('<path') || s.includes('<circle'));
});

test('모든 그림이 path 나 circle 을 하나 이상 갖는다 (빈 아이콘 금지)', () => {
  for (const name of Object.keys(A.PATHS)){
    const g = A.PATHS[name];
    const n = (g.d || []).length + (g.c || []).length + (g.f || []).length;
    assert.ok(n > 0, name + ' 이 비어 있습니다');
  }
});

test('이모지를 넘겨도 선 아이콘으로 옮긴다', () => {
  assert.equal(A.resolve('🏺'), 'relic');
  assert.equal(A.resolve('⛰️'), 'mountain');
  assert.equal(A.resolve('🕊️'), 'dove');
});

test('모르는 것은 기본값으로 떨어진다', () => {
  assert.equal(A.resolve('🦖'), 'pin');
  assert.equal(A.resolve('🦖', 'dot'), 'dot');
  assert.equal(A.resolve(''), 'pin');
});

test('임무 갈래에 맞는 그림을 고른다', () => {
  assert.equal(A.forQuest({ kind:'gate' }), 'gate');
  assert.equal(A.forQuest({ kind:'find' }), 'find');
  assert.equal(A.forQuest({ kind:'inspect' }), 'search');
  assert.equal(A.forQuest({ cat:'person' }), 'person');
  assert.equal(A.forQuest({ cat:'없는분류' }), 'pin');
  assert.equal(A.forQuest(null), 'pin');
});

test('자료의 icon(이모지)은 무시한다 — 분류로만 고른다', () => {
  assert.equal(A.forQuest({ cat:'event', icon:'🏺' }), 'event');
});

test('strip() 이 이모지를 걷어낸다', () => {
  assert.equal(A.strip('🎒 역사 가방'), '역사 가방');
  assert.equal(A.strip('✨ 조개를 주웠소'), '조개를 주웠소');
  assert.equal(A.strip('🕊️'), '');
  assert.equal(A.strip(null), '');
});

test('strip() 은 활자 화살표를 남긴다 (그림이 아니라 글자다)', () => {
  assert.equal(A.strip('알겠소 →'), '알겠소 →');
  assert.equal(A.strip('← 돌아가기'), '← 돌아가기');
  assert.equal(A.strip('↺ 비우기'), '↺ 비우기');
});

test('strip() 이 한글·한자·기호는 건드리지 않는다', () => {
  assert.equal(A.strip('빗살무늬토기'), '빗살무늬토기');
  assert.equal(A.strip('史뿐史뿐'), '史뿐史뿐');
  assert.equal(A.strip('광복·6·25'), '광복·6·25');
  assert.equal(A.strip('[6사04-01]'), '[6사04-01]');
});
