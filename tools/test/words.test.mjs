/* ══════════════════════════════════════════════════════════════════════
   words.test.mjs — 금칙어 검사 (요구 6)

       node --test tools/test/

   막아야 할 말은 막고, 역사 수업에서 실제로 쓰는 말은 막지 않는지 본다.
   후자가 더 중요하다 — '개항'이 막히면 수업이 멈춘다.
   ══════════════════════════════════════════════════════════════════════ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const W = require('../../js/profanity.js');

test('빈 글은 통과한다', () => {
  assert.equal(W.check('').ok, true);
  assert.equal(W.check('   ').ok, true);
  assert.equal(W.check(null).ok, true);
});

test('평범한 답은 통과한다', () => {
  const ok = [
    '주먹도끼를 보니 사냥을 하며 옮겨 다녔을 것 같다',
    '빗살무늬토기는 바닥이 뾰족해서 땅에 꽂아 썼을 것이다',
    '고인돌을 옮기려면 사람이 많이 필요했다',
    '나는 고구려 무덤 벽화를 골랐다'
  ];
  for (const s of ok) assert.equal(W.check(s).ok, true, s);
});

test('비속어는 막는다', () => {
  const bad = ['씨발', '시 발', 'ㅅㅂ', '병신이다', '지랄하네', '개새끼', 'fuck you', '멍청이같다'];
  for (const s of bad){
    const r = W.check(s);
    assert.equal(r.ok, false, s);
    assert.equal(r.reason, 'profanity', s);
  }
});

test('띄어쓰기·기호·반복으로 피해 가는 것도 막는다', () => {
  for (const s of ['씨 발', '씨.발', '씨~발', '씨발!!!', 'ㅅ ㅂ']){
    assert.equal(W.check(s).ok, false, s);
  }
});

test('숫자로 글자를 흉내 낸 영어도 막는다', () => {
  assert.equal(W.check('fuck').ok, false);
  assert.equal(W.check('sh1t').ok, false);       // 1 → i
});

test('자신이나 남을 해치는 말은 따로 안내한다', () => {
  const r = W.check('자살하고 싶다');
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'harm');
  assert.match(r.message, /선생님|어른/);
});

test('역사 수업에서 쓰는 말은 막지 않는다 (오탐 방지)', () => {
  const ok = [
    '개항 이후 전차가 다녔다',
    '개혁을 하려고 했다',
    '고려의 도읍은 개경이다',
    '개성에는 상인이 많았다',
    '출발점이 어디인지 모르겠다',
    '시발점이 되는 사건이다',
    '새끼줄을 꼬아 썼다',
    '개마고원은 북쪽에 있다',
    '농기구를 개량했다'
  ];
  for (const s of ok) assert.equal(W.check(s).ok, true, s);
});

test('mask 는 걸린 낱말만 가린다', () => {
  const m = W.mask('이 바보같은 유물');
  assert.ok(!m.includes('바보같'));
  assert.ok(m.includes('유물'));
});

test('normalize 는 기호와 반복을 걷어낸다', () => {
  assert.equal(W.normalize('가.나,다'), '가나다');
  assert.equal(W.normalize('아아아아'), '아아');
  assert.equal(W.normalize('A B'), 'ab');
});
