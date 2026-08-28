// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   player.js — 두루 아바타 · 이동 · 카메라 · 입력 (MASTER.md §6-1)

   부호 표 (유일한 출처)
     fwd    = +1  화면 안쪽 (W ↑)        fwd    = -1  화면 앞쪽 (S ↓)
     strafe = +1  화면 오른쪽 (D →)      strafe = -1  화면 왼쪽 (A ←)
     조이스틱 joy.z 위가 +, joy.x 오른쪽이 + (같은 부호)

   키는 e.key 가 아니라 e.code 로 받는다 — 한글 자판에서 WASD 는 ㅈㅁㄴㅇ 다.
   ══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { ST } from './state.js';
import { mat, cyl, sph, box, cone } from './scene-helpers.js';
import { setAnim, setSpeed, updateAnim } from './anim.js';
import { anyOpen } from './popups.js';
import { MASCOT } from './constants.js';

const SPEED = 9;              // 초당 이동 거리
const CAM_DIST = 13.5;
const EYE_Y = 1.35;                        // 바라보는 높이 (아바타 가슴께)
const FOLLOW_LIMIT = 25 * Math.PI / 180;   // 25도

/* 카메라는 '높이'가 아니라 '올려다본 각'으로 다룬다.
   예전에는 높이만 조절해서 늘 내려다보기만 됐고, 지평선도 하늘도 볼 수 없었다. */
const PITCH_DEFAULT = 0.46;                // 약 26도 — 예전 화면과 비슷한 각
const PITCH_MIN = 0.02;                    // 거의 눈높이 — 하늘과 지평선이 보인다
const PITCH_MAX = 1.24;                    // 거의 바로 위에서 내려다보기
const ZOOM_MIN = 0.42, ZOOM_MAX = 2.8;     // 가까이서 크게 ~ 멀리서 넓게
const pitchOf = () => (ST.camPitch == null ? (ST.camPitch = PITCH_DEFAULT) : ST.camPitch);

/* ══════════════════════════════════════════════════════════════
   아바타 — 두루 (어린 두루미)
   발밑 y=0, 머리 꼭대기 y≈2.5, +z 를 바라본다
   머리의 긴 깃털 하나가 앞뒤를 구분해 준다 (§6-1)
   ══════════════════════════════════════════════════════════════ */
export function buildPlayer(){
  const player = new THREE.Group();     // 위치·회전을 담당
  const rig = new THREE.Group();        // 애니메이션이 흔드는 몸통 전체
  player.add(rig);

  const torso = new THREE.Group();
  rig.add(torso);

  // 몸통
  const bodyMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(.34, .42, 1.05, 9),
    mat(MASCOT.bodyColor)
  );
  bodyMesh.position.y = 1.02;
  torso.add(bodyMesh);

  // 날개(팔)
  const armGeo = new THREE.BoxGeometry(.16, .74, .34);
  const leftArm = new THREE.Mesh(armGeo, mat(MASCOT.wingColor));
  leftArm.position.set(-.46, 1.16, 0);
  leftArm.geometry.translate(0, -.37, 0);   // 어깨를 회전축으로
  leftArm.userData.y0 = 1.16;
  const rightArm = leftArm.clone();
  rightArm.position.set(.46, 1.16, 0);
  rightArm.userData.y0 = 1.16;
  torso.add(leftArm); torso.add(rightArm);

  // 목 + 머리
  const head = new THREE.Group();
  head.position.set(0, 1.58, 0);
  torso.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.13, .17, .42, 8), mat(MASCOT.bodyColor));
  neck.position.y = .1;
  head.add(neck);

  const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(.3, 0), mat(MASCOT.bodyColor));
  skull.position.y = .5;
  head.add(skull);

  // 부리 — +z 를 향한다 (앞을 알려 주는 첫 번째 표시)
  const beak = new THREE.Mesh(new THREE.ConeGeometry(.1, .46, 5), mat(MASCOT.beakColor));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, .48, .34);
  head.add(beak);

  // 눈
  const eyeGeo = new THREE.SphereGeometry(.052, 6, 5);
  const eyeMat = mat('#2B2620');
  const e1 = new THREE.Mesh(eyeGeo, eyeMat); e1.position.set(-.16, .56, .21);
  const e2 = new THREE.Mesh(eyeGeo, eyeMat); e2.position.set( .16, .56, .21);
  head.add(e1); head.add(e2);

  // 붉은 정수리 깃털 — 뒤로 길게 뻗어 앞뒤를 확실히 구분한다
  const crest = new THREE.Group();
  crest.position.set(0, .70, -.06);
  const feather = new THREE.Mesh(new THREE.ConeGeometry(.075, .62, 5), mat(MASCOT.crestColor));
  feather.geometry.translate(0, .31, 0);
  crest.add(feather);
  const feather2 = new THREE.Mesh(new THREE.ConeGeometry(.055, .42, 5), mat(MASCOT.crestColor));
  feather2.geometry.translate(0, .21, 0);
  feather2.rotation.z = .34;
  crest.add(feather2);
  crest.rotation.z = -.16;
  head.add(crest);

  // 다리
  const legGeo = new THREE.CylinderGeometry(.075, .075, .58, 6);
  const leftLeg = new THREE.Mesh(legGeo, mat(MASCOT.legColor));
  leftLeg.geometry.translate(0, -.29, 0);
  leftLeg.position.set(-.16, .58, 0);
  const rightLeg = leftLeg.clone();
  rightLeg.position.set(.16, .58, 0);
  rig.add(leftLeg); rig.add(rightLeg);

  // 어깨에 멘 유물 가방 (요구 6 — 시작할 때부터 지니고 있다)
  const bagStrap = new THREE.Mesh(new THREE.TorusGeometry(.36, .045, 5, 12), mat('#8A6E52'));
  bagStrap.rotation.set(Math.PI/2, 0, .5);
  bagStrap.position.set(0, 1.16, 0);
  torso.add(bagStrap);
  const satchel = box(.34, .3, .2, '#9C7A54', .38, .82, -.12);
  torso.add(satchel);
  // 스탬프 수첩
  const bookie = box(.22, .28, .07, '#C25B4F', -.4, .86, -.1);
  torso.add(bookie);

  ST.player = player;
  ST.rig = rig;
  ST.torso = torso;
  ST.head = head;
  ST.crest = crest;
  ST.leftArm = leftArm; ST.rightArm = rightArm;
  ST.leftLeg = leftLeg; ST.rightLeg = rightLeg;

  player.rotation.y = Math.PI;   // 처음에는 카메라 쪽을 본다
  ST.scene.add(player);
  return player;
}

/* ══════════════════════════════════════════════════════════════
   입력
   ══════════════════════════════════════════════════════════════ */
const keys = new Set();
export const joy = { x:0, z:0, active:false };

const CODE_FWD  = ['KeyW','ArrowUp'];
const CODE_BACK = ['KeyS','ArrowDown'];
const CODE_LEFT = ['KeyA','ArrowLeft'];
const CODE_RIGHT= ['KeyD','ArrowRight'];
/* e.code 가 비어 오는 환경을 위한 표 — 한글 자판 포함 */
const KEY_FWD  = ['w','W','ㅈ'], KEY_BACK = ['s','S','ㄴ'];
const KEY_LEFT = ['a','A','ㅁ'], KEY_RIGHT= ['d','D','ㅇ'];

function keyId(e){
  if (e.code) return e.code;
  const k = e.key;
  if (KEY_FWD.includes(k)) return 'KeyW';
  if (KEY_BACK.includes(k)) return 'KeyS';
  if (KEY_LEFT.includes(k)) return 'KeyA';
  if (KEY_RIGHT.includes(k)) return 'KeyD';
  return k;
}

export function bindInput(canvas, hooks){
  hooks = hooks || {};

  window.addEventListener('keydown', e => {
    // 창이 하나라도 떠 있으면 세상은 키를 받지 않는다.
    // (ui.js 가 Esc·Enter·E 로 그 창을 닫는다)
    if (ST.questOpen || ST.paused || anyOpen()) return;
    const id = keyId(e);
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(id)) e.preventDefault();
    if (id === 'Space'){ tryJump(); return; }
    if (id === 'KeyE' || id === 'Enter'){ if (hooks.onInteract) hooks.onInteract(); return; }
    keys.add(id);
  });
  window.addEventListener('keyup', e => keys.delete(keyId(e)));

  // 창을 벗어나면 누른 키를 모두 비운다 — 안 그러면 계속 걷는다 (§6-1)
  window.addEventListener('blur', clearKeys);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearKeys(); });

  /* 드래그 오빗 — 반드시 유지한다 (§6-1) */
  canvas.addEventListener('pointerdown', e => {
    if (ST.questOpen || ST.paused || anyOpen()) return;
    ST.orbitId = e.pointerId;
    ST._orbitX = e.clientX; ST._orbitY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (ST.orbitId !== e.pointerId) return;
    const dx = e.clientX - ST._orbitX;
    const dy = e.clientY - ST._orbitY;
    ST._orbitX = e.clientX; ST._orbitY = e.clientY;
    ST.camYaw -= dx * 0.006;
    ST.camPitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitchOf() - dy * 0.005));
  });
  const endOrbit = e => { if (ST.orbitId === e.pointerId) ST.orbitId = null; };
  canvas.addEventListener('pointerup', endOrbit);
  canvas.addEventListener('pointercancel', endOrbit);

  /* 두 손가락으로 벌리고 오므리기 — 태블릿에서는 휠이 없다 */
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 2) ST.pinchDist = touchGap(e);
  }, { passive:true });
  canvas.addEventListener('touchmove', e => {
    if (e.touches.length !== 2 || !ST.pinchDist) return;
    const gap = touchGap(e);
    const k = ST.pinchDist / Math.max(1, gap);
    ST.camZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, ST.camZoom * (1 + (k - 1) * .5)));
    ST.pinchDist = gap;
    ST.orbitId = null;                       // 확대 중에는 화면을 돌리지 않는다
  }, { passive:true });
  const endPinch = e => { if (e.touches.length < 2) ST.pinchDist = null; };
  canvas.addEventListener('touchend', endPinch, { passive:true });
  canvas.addEventListener('touchcancel', endPinch, { passive:true });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    ST.camZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, ST.camZoom + (e.deltaY > 0 ? .12 : -.12)));
  }, { passive:false });

  bindJoystick(hooks);
}

function touchGap(e){
  const a = e.touches[0], b = e.touches[1];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export function clearKeys(){ keys.clear(); joy.x = 0; joy.z = 0; joy.active = false; }

function tryJump(){
  if (ST.jumpY > 0.01) return;
  ST.jumpVY = 7.2;
  setAnim('jump');
}
export { tryJump };

/* 조이스틱 — 손가락 기기에서만 (§6-1) */
function bindJoystick(hooks){
  const el = document.getElementById('exJoy');
  const knob = document.getElementById('exJoyKnob');
  if (!el || !knob) return;

  const show = () => el.setAttribute('aria-hidden', 'false');
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) show();
  window.addEventListener('touchstart', show, { once:true });

  let id = null, cx = 0, cy = 0, R = 52;
  el.addEventListener('pointerdown', e => {
    const r = el.getBoundingClientRect();
    cx = r.left + r.width/2; cy = r.top + r.height/2; R = r.width/2 - 12;
    id = e.pointerId; joy.active = true;
    el.setPointerCapture(e.pointerId);
    move(e);
  });
  el.addEventListener('pointermove', e => { if (id === e.pointerId) move(e); });
  const end = e => {
    if (id !== e.pointerId) return;
    id = null; joy.x = 0; joy.z = 0; joy.active = false;
    knob.style.transform = '';
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);

  function move(e){
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > R){ dx = dx / d * R; dy = dy / d * R; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    joy.x =  dx / R;          // 오른쪽이 +
    joy.z = -dy / R;          // 위가 +
  }
}

/* ══════════════════════════════════════════════════════════════
   매 프레임
   ══════════════════════════════════════════════════════════════ */
const _dir = new THREE.Vector3();

export function updatePlayer(dt){
  const p = ST.player;
  if (!p) return;

  let fwd = 0, strafe = 0;
  if (!ST.questOpen && !ST.paused && !anyOpen()){
    if (CODE_FWD.some(k => keys.has(k)))   fwd += 1;
    if (CODE_BACK.some(k => keys.has(k)))  fwd -= 1;
    if (CODE_RIGHT.some(k => keys.has(k))) strafe += 1;
    if (CODE_LEFT.some(k => keys.has(k)))  strafe -= 1;
    if (joy.active){ fwd += joy.z; strafe += joy.x; }
  }

  // 두 축을 합쳐 길이가 1을 넘으면 정규화 (대각선이 빨라지지 않게)
  const len = Math.hypot(fwd, strafe);
  if (len > 1){ fwd /= len; strafe /= len; }

  const cy = Math.cos(ST.camYaw), sy = Math.sin(ST.camYaw);
  // 화면 안쪽 f = (-sin, -cos) · 화면 오른쪽 r = (cos, -sin)
  const dx = (-sy) * fwd + ( cy) * strafe;
  const dz = (-cy) * fwd + (-sy) * strafe;

  const moving = Math.hypot(dx, dz) > 0.02;
  ST.moving = moving;
  setSpeed(Math.min(1, Math.hypot(fwd, strafe)));

  if (moving){
    _dir.set(dx, 0, dz).normalize();
    const nx = p.position.x + _dir.x * SPEED * dt;
    const nz = p.position.z + _dir.z * SPEED * dt;
    const r = Math.hypot(nx, nz);
    const lim = ST.BOUND;
    if (r <= lim){ p.position.x = nx; p.position.z = nz; }
    else {
      // 경계에서 미끄러지게
      const k = lim / r;
      p.position.x = nx * k; p.position.z = nz * k;
    }
    p.rotation.y = Math.atan2(_dir.x, _dir.z);
  }

  // 점프
  if (ST.jumpVY !== 0 || ST.jumpY > 0){
    ST.jumpVY -= 22 * dt;
    ST.jumpY += ST.jumpVY * dt;
    if (ST.jumpY <= 0){ ST.jumpY = 0; ST.jumpVY = 0; }
  }
  p.position.y = ST.jumpY;

  updateAnim(dt);
  updateCamera(dt, fwd, moving);
}

function updateCamera(dt, fwd, moving){
  const p = ST.player, cam = ST.camera;
  if (!p || !cam) return;

  /* 자동 추적 — 앞으로 갈 때만, 25° 넘게 어긋날 때만, 드래그 중에는 않는다 */
  if (moving && fwd > 0.1 && ST.orbitId === null){
    const want = p.rotation.y + Math.PI;          // 아바타 뒤에서 보기
    let diff = want - ST.camYaw;
    while (diff >  Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const over = Math.abs(diff) - FOLLOW_LIMIT;
    if (over > 0){
      const step = Math.sign(diff) * over * Math.min(1, dt * 2.6);
      ST.camYaw += step;
    }
  }

  const d = CAM_DIST * ST.camZoom;
  const pit = pitchOf();
  const cp = Math.cos(pit), sp = Math.sin(pit);
  cam.position.set(
    p.position.x + Math.sin(ST.camYaw) * d * cp,
    Math.max(0.55, p.position.y + EYE_Y + sp * d),      // 바닥을 뚫고 들어가지 않게
    p.position.z + Math.cos(ST.camYaw) * d * cp
  );
  cam.lookAt(p.position.x, p.position.y + EYE_Y, p.position.z);
}

/* 시대·지역 전환 시 */
export function placePlayerAt(x, z){
  if (!ST.player) return;
  ST.player.position.set(x, 0, z);
  ST.player.rotation.y = Math.atan2(-x, -z);   // 지역 가운데를 보게
  ST.camYaw = ST.player.rotation.y + Math.PI;
  ST.jumpY = 0; ST.jumpVY = 0;
  clearKeys();
}
