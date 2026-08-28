// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   neo-games.js — 신석기 전용 미니게임을 우리 엔진에 잇는 다리

   js/engine/neo/ 안의 두 파일은 다른 꾸러미에서 가져온 것이다.
   게임을 한 줄도 고치지 않으려고 폴더째 그대로 두었고
   (그래야 그 안의 `./minigames.js` 상대경로가 그대로 맞는다),
   여기서 계약만 맞춰 준다.

   계약이 다르다
     저쪽   startMinigame(mini, mount, onWin, onLose) → fn(ctx)
            ctx = { mount, mini, win(), lose(), later(), loop(), stop() }
     우리   runMinigame(mini, host, done)             → fn(mini, host, done)

   화면 이름도 겹친다 (.mg · .mg-tag · .mg-intro …).
   그래서 저쪽 게임은 언제나 .neo-host 안에서만 그린다.
   css/styles.css 의 이식 구간이 그 안으로 가둬져 있다.

   여기서 하는 일은 셋뿐이다.
     ① 저쪽 게임을 .neo-host 안에 앉힌다
     ② onWin/onLose 를 우리 done(ok) 으로 옮긴다
     ③ 다 하고 나면 '다음' 단추를 우리 모양으로 하나 붙인다
   ══════════════════════════════════════════════════════════════════════ */
import { MINIGAME_STARTERS as NEO_STARTERS, startMinigame as neoStart } from './neo/minigames.js';
import './neo/minigames-neolithic.js';          // neo-* 다섯 개를 NEO_STARTERS 에 등록한다
import { MINIGAME_STARTERS, onPress } from './minigames.js';

/** 이 다리를 통해 우리 엔진에 올리는 것 — 신석기 다섯 가지뿐이다 */
export const NEO_TYPES = ['neo-grind', 'neo-winnow', 'neo-spindle', 'neo-umjip', 'neo-rite'];

/** 저쪽 게임 하나를 우리 계약으로 감싼다 */
function adapt(type){
  return function (mini, host, done){
    host.innerHTML = '<div class="neo-host" id="neoHost"></div>';
    const mount = host.querySelector('#neoHost');

    let settled = false;
    const finish = ok => {
      if (settled) return;
      settled = true;

      // 저쪽 게임에는 '다음' 단추가 없다. 우리 화면 흐름에 맞춰 하나 붙인다.
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mg-btn' + (ok ? '' : ' sub');
      btn.textContent = ok ? '잘 하였소 →' : (mini.retryLabel || '다시 해 보겠소');
      mount.appendChild(btn);
      onPress(btn, () => done(ok));
    };

    // mini.type 이 우리 표를 거쳐 왔으므로 저쪽에도 같은 type 으로 넘긴다
    neoStart(Object.assign({}, mini, { type }), mount, () => finish(true), () => finish(false));
  };
}

/* 우리 표에 올린다. 다른 시대가 쓰는 스무 가지는 건드리지 않는다 */
NEO_TYPES.forEach(t => {
  if (NEO_STARTERS[t]) MINIGAME_STARTERS[t] = adapt(t);
});

/** 그 갈래가 이식해 온 신석기 게임인가 */
export function isNeoType(t){ return NEO_TYPES.indexOf(t) >= 0; }
