// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   anim.js — 아바타 애니메이션 상태 기계

   추가 에셋 0. 전부 절차적 트윈이다.
   ST.rig / head / leftArm / rightArm / leftLeg / rightLeg 를 움직인다.
   crest 는 두루(구 마스코트) 시절 흔적 — 지금 아바타는 쓰지 않는다.

   상태
     idle   숨쉬기 · 깃털 흔들림        (기본)
     walk   팔다리 스윙 (속도 비례)
     jump   웅크렸다 펴기
     cheer  두 팔 만세 + 깡총            정답 · 미니게임 성공
     tilt   고개 갸웃                    오답
     stamp  팔을 내려 도장 찍기          스탬프 획득
     wave   손 흔들기                    관문 통과
     look   몸을 숙여 들여다보기         조사 시작
   ══════════════════════════════════════════════════════════════════════ */
import { ST } from './state.js';

const ONE_SHOT = { jump:0.55, cheer:1.25, tilt:0.95, stamp:1.10, wave:1.40, look:1.00 };

const A = {
  state: 'idle',
  t: 0,            // 현재 상태 경과
  walkPhase: 0,    // 걷기 위상 (상태가 바뀌어도 이어진다)
  speed: 0,        // 0~1
  hold: 0          // 원샷 남은 시간
};

export function setAnim(name){
  if (!ONE_SHOT[name]){
    // 지속 상태(idle/walk)는 원샷 중에는 바꾸지 않는다
    if (A.hold > 0) return;
    if (A.state !== name){ A.state = name; A.t = 0; }
    return;
  }
  A.state = name; A.t = 0; A.hold = ONE_SHOT[name];
}
export function animState(){ return A.state; }
export function setSpeed(v){ A.speed = Math.max(0, Math.min(1, v || 0)); }

const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;

export function updateAnim(dt){
  const rig = ST.rig;
  if (!rig) return;

  A.t += dt;
  if (A.hold > 0){
    A.hold -= dt;
    if (A.hold <= 0){ A.hold = 0; A.state = A.speed > .05 ? 'walk' : 'idle'; A.t = 0; }
  } else {
    A.state = A.speed > .05 ? 'walk' : 'idle';
  }

  const LA = ST.leftArm, RA = ST.rightArm, LL = ST.leftLeg, RL = ST.rightLeg;
  const head = ST.head, crest = ST.crest, torso = ST.torso;

  // 기본값으로 되돌린 뒤 상태별로 덧입힌다
  if (LA) { LA.rotation.set(0,0,0); LA.position.y = LA.userData.y0; }
  if (RA) { RA.rotation.set(0,0,0); RA.position.y = RA.userData.y0; }
  if (LL) LL.rotation.set(0,0,0);
  if (RL) RL.rotation.set(0,0,0);
  if (head) head.rotation.set(0,0,0);
  if (torso) torso.rotation.set(0,0,0);
  rig.position.y = 0;
  rig.scale.set(1,1,1);

  // 깃털은 언제나 살짝 흔들린다
  if (crest) crest.rotation.z = Math.sin(A.t * 3.1) * 0.09 - 0.16;

  switch (A.state){

    case 'walk': {
      A.walkPhase += dt * (5.2 + A.speed * 4.4);
      const s = Math.sin(A.walkPhase) * (0.38 + A.speed * 0.42);
      if (LL) LL.rotation.x =  s;
      if (RL) RL.rotation.x = -s;
      if (LA) LA.rotation.x = -s * 0.72;
      if (RA) RA.rotation.x =  s * 0.72;
      rig.position.y = Math.abs(Math.sin(A.walkPhase)) * 0.055;
      if (torso) torso.rotation.z = Math.sin(A.walkPhase) * 0.03;
      break;
    }

    case 'idle': {
      const b = Math.sin(A.t * 1.9) * 0.04;
      rig.position.y = b;
      if (torso) torso.rotation.x = b * 0.25;
      if (head) head.rotation.x = Math.sin(A.t * 1.9 + .5) * 0.05;
      if (LA) LA.rotation.z =  Math.sin(A.t * 1.6) * 0.06;
      if (RA) RA.rotation.z = -Math.sin(A.t * 1.6) * 0.06;
      break;
    }

    case 'jump': {
      const p = Math.min(1, A.t / ONE_SHOT.jump);
      const squat = p < .22 ? (p / .22) : 0;
      rig.scale.y = 1 - squat * 0.16;
      if (LA) LA.rotation.x = -1.1 * ease(Math.min(1, p * 1.6));
      if (RA) RA.rotation.x = -1.1 * ease(Math.min(1, p * 1.6));
      if (LL) LL.rotation.x = -0.45 * (1 - p);
      if (RL) RL.rotation.x = -0.45 * (1 - p);
      break;
    }

    case 'cheer': {
      const p = Math.min(1, A.t / ONE_SHOT.cheer);
      const hop = Math.abs(Math.sin(p * Math.PI * 2)) * 0.34 * (1 - p * .4);
      rig.position.y = hop;
      const up = -2.15 * ease(Math.min(1, p * 3));
      if (LA) { LA.rotation.x = up; LA.rotation.z =  0.28; }
      if (RA) { RA.rotation.x = up; RA.rotation.z = -0.28; }
      if (head) head.rotation.x = -0.22;
      if (crest) crest.rotation.z = Math.sin(A.t * 16) * 0.3 - 0.16;
      break;
    }

    case 'tilt': {
      const p = Math.min(1, A.t / ONE_SHOT.tilt);
      const k = Math.sin(p * Math.PI);
      if (head) { head.rotation.z = k * 0.42; head.rotation.y = k * 0.18; }
      if (torso) torso.rotation.z = k * 0.08;
      if (LA) LA.rotation.x = k * 0.5;
      break;
    }

    case 'stamp': {
      const p = Math.min(1, A.t / ONE_SHOT.stamp);
      // 팔을 들었다가 (0~.35) 내리찍고 (.35~.5) 머문다
      let arm;
      if (p < .35)      arm = -1.5 * (p / .35);
      else if (p < .5)  arm = -1.5 + 1.9 * ((p - .35) / .15);
      else              arm = 0.4;
      if (RA) RA.rotation.x = arm;
      if (torso) torso.rotation.x = p > .35 ? 0.16 : 0;
      rig.position.y = p > .35 && p < .55 ? -0.06 : 0;
      if (head) head.rotation.x = 0.14;
      break;
    }

    case 'wave': {
      const p = Math.min(1, A.t / ONE_SHOT.wave);
      const fade = p > .8 ? (1 - (p - .8) / .2) : 1;
      if (RA){
        RA.rotation.x = -2.25 * fade;
        RA.rotation.z = Math.sin(A.t * 11) * 0.42 * fade;
      }
      if (head) head.rotation.y = 0.16 * fade;
      break;
    }

    case 'look': {
      const p = Math.min(1, A.t / ONE_SHOT.look);
      const k = Math.sin(p * Math.PI);
      if (torso) torso.rotation.x = k * 0.36;
      if (head) head.rotation.x = k * 0.34;
      if (LA) LA.rotation.x = k * 0.5;
      if (RA) RA.rotation.x = k * 0.5;
      rig.position.y = -k * 0.08;
      break;
    }
  }
}

/* 상태를 처음으로 되돌린다 (시대 전환 등) */
export function resetAnim(){
  A.state = 'idle'; A.t = 0; A.hold = 0; A.speed = 0;
}
