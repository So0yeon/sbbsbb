// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   grader.js — 답안 채점 (MASTER.md §5-6)

   3D도 DOM도 모르는 순수 함수. 의존성 0.
   node --test tools/test/grader.test.mjs 로 검증한다.

   grade(question, answer) -> { pass, matched, feedback }

   오답 처리 규칙
     1회 실패  해설 없이 힌트, 재시도
     2회 실패  해설 전문 제시 후 재시도 (서술형은 이 시점에 통과 처리)
     통과 여부와 무관하게 학생이 쓴 답 전문을 기록에 남긴다
   ══════════════════════════════════════════════════════════════════════ */

/** 공백·가운뎃점·문장부호를 지우고 비교용으로 다듬는다 */
export function normalize(s){
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/[\s ]/g, '')
    .replace(/[·・.,、。!?！？"'“”‘’()\[\]{}<>「」『』~\-—–_/\\|:;]/g, '');
}

function asArray(v){
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * @param {object} question
 *   { type:'choice', correct:number }
 *   { type:'ox', correct:boolean }
 *   { type:'short'|'blank', answers:string[] }
 *   { type:'essay', keywords:string[][], minMatch:number }
 * @param {*} answer
 * @param {number} [tries] 이번이 몇 번째 시도인가 (1부터)
 */
export function grade(question, answer, tries){
  const q = question || {};
  const t = q.type || 'choice';
  const n = tries || 1;

  if (t === 'choice'){
    const pass = Number(answer) === Number(q.correct);
    return { pass, matched: pass ? 1 : 0, feedback: pass ? (q.ok || '') : (q.no || '') };
  }

  if (t === 'ox'){
    const pass = !!answer === !!q.correct;
    return { pass, matched: pass ? 1 : 0, feedback: pass ? (q.ok || '') : (q.no || '') };
  }

  if (t === 'short' || t === 'blank'){
    const a = normalize(answer);
    const list = asArray(q.answers ?? q.answer).map(normalize).filter(Boolean);
    const pass = a.length > 0 && list.includes(a);
    return { pass, matched: pass ? 1 : 0, feedback: pass ? (q.ok || '') : (q.no || '') };
  }

  if (t === 'essay'){
    const a = normalize(answer);
    const groups = asArray(q.keywords);
    let matched = 0;
    const hit = [];
    groups.forEach(group => {
      const words = asArray(group).map(normalize).filter(Boolean);
      const found = words.find(w => w && a.includes(w));
      if (found){ matched++; hit.push(found); }
    });
    const need = q.minMatch == null ? Math.max(1, Math.ceil(groups.length / 2)) : q.minMatch;
    let pass = matched >= need;

    // 2회 실패 시 통과 처리하고 답 전문을 교사에게 넘긴다 (안전장치)
    let feedback;
    if (pass) feedback = q.ok || '';
    else if (n >= 2){ pass = true; feedback = q.explain || q.ok || ''; }
    else feedback = q.hint || q.no || '';

    return { pass, matched, need, hit, feedback, byGrace: !pass ? false : (matched < need) };
  }

  return { pass:false, matched:0, feedback:'' };
}

/** 오답 단계별 안내 (§5-6) */
export function retryMessage(question, tries){
  const q = question || {};
  if (tries <= 1) return q.hint || q.no || '다시 한 번 보시오.';
  return q.explain || q.no || '다시 한 번 보시오.';
}

/* Node 테스트 겸용 */
if (typeof module !== 'undefined' && module.exports){
  module.exports = { grade, normalize, retryMessage };
}
