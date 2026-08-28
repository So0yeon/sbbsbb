// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   artifact-art.js — 관찰용 유물 그림 (실물 사진이 아님)

   왜 그림인가
     관찰 미션에는 유물 자료가 있어야 하는데, 저장소에 든 사진 가운데
     출처가 확인된 것은 `assets/photos/bitsal.jpg` 하나뿐이다.
     docs/07-ASSETS.md 는 "확인되지 않은 출처·라이선스는 비워 둔다" 고 못박고 있고,
     출처를 모르는 사진을 관찰 자료로 쓸 수는 없다.

     그래서 나머지는 여기서 직접 그린다. 화면에는 언제나
     "실물 사진이 아니라 특징을 살려 그린 그림" 이라고 밝힌다.
     사진을 구하면 chain 자료의 photo 를 채우기만 하면 그림 대신 사진이 나온다.

   그리는 법
     · 좌표계 100×100. 관찰 지점(핫스팟)도 같은 좌표를 쓴다.
     · 흙·돌·뼈의 색만 쓴다. 이모지를 쓰지 않는다.
     · 사실을 지어내지 않는다 — 교과서에 나오는 생김새의 특징만 살린다.
   ══════════════════════════════════════════════════════════════════════ */

const C = {
  stone:  '#9A9186', stoneD: '#6F675C', stoneL: '#B8B0A3',
  ground: '#C9BFA6', groundD:'#A79878', soil:  '#8A7A5E',
  bone:   '#E3DCC6', boneD:  '#BFB59A',
  clay:   '#B07A55', clayD:  '#8A5C3C',
  shell:  '#EAE3D6', shellD: '#C4B9A4',
  wood:   '#8A6E52', line:   '#4A443A', water:'#AFC3C0'
};

/* 그림 한 장 = viewBox 0 0 100 100 안의 조각들 */
const ART = {

  /* 뗀석기 — 깨뜨려 만든 주먹도끼. 가장자리가 들쭉날쭉하다 */
  tteon: {
    label: '깨뜨려 만든 돌',
    draw: () => `
      <path d="M50 8 L64 20 L72 34 L74 52 L66 74 L54 90 L44 88 L34 72 L28 52 L32 30 Z"
            fill="${C.stone}" stroke="${C.stoneD}" stroke-width="1.4"/>
      <path d="M50 8 L58 26 L50 44 L40 30 Z" fill="${C.stoneL}" opacity=".55"/>
      <path d="M64 20 L72 34 L60 40 L58 26 Z" fill="${C.stoneL}" opacity=".35"/>
      <path d="M28 52 L40 56 L36 74 L34 72 Z" fill="${C.stoneL}" opacity=".3"/>
      <path d="M74 52 L66 74 L58 66 L70 58 Z" fill="${C.stoneD}" opacity=".25"/>
      <path d="M50 90 L54 90 L60 78 L52 80 L46 76 L40 80 L34 72"
            fill="none" stroke="${C.stoneD}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M32 30 L40 34 M44 22 L48 30 M66 30 L60 34 M70 46 L62 48 M30 46 L38 48"
            stroke="${C.stoneD}" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>`
  },

  /* 간석기 — 갈아서 만든 돌도끼. 날이 곧고 표면이 매끈하다 */
  gan: {
    label: '갈아서 만든 돌',
    draw: () => `
      <path d="M50 10 C60 10 66 18 67 30 L70 62 C71 74 63 86 50 88
               C37 86 29 74 30 62 L33 30 C34 18 40 10 50 10 Z"
            fill="${C.stone}" stroke="${C.stoneD}" stroke-width="1.4"/>
      <path d="M50 10 C58 10 64 18 65 30 L67 60 L50 62 Z" fill="${C.stoneL}" opacity=".5"/>
      <path d="M30 62 L70 62 C71 74 63 86 50 88 C37 86 29 74 30 62 Z"
            fill="${C.stoneL}" opacity=".22"/>
      <path d="M31 66 C42 71 58 71 69 66" fill="none" stroke="${C.stoneD}"
            stroke-width="1" opacity=".6"/>
      <path d="M38 84 C44 87 56 87 62 84" fill="none" stroke="#F3EFE4"
            stroke-width="2.6" stroke-linecap="round"/>
      <path d="M40 24 C46 22 54 22 60 24 M38 38 C46 36 54 36 62 38"
            fill="none" stroke="${C.stoneL}" stroke-width="1.2" opacity=".8"/>`
  },

  /* 돌괭이·돌보습 — 날을 갈고 자루에 묶어 쓴다 */
  gwaengi: {
    label: '땅을 파는 돌 연장',
    draw: () => `
      <path d="M20 16 L30 10 L74 76 L64 82 Z" fill="${C.wood}" stroke="#6B543E" stroke-width="1.2"/>
      <path d="M22 22 L64 84 C58 90 46 92 38 86 C28 78 24 62 22 46 Z"
            fill="${C.stone}" stroke="${C.stoneD}" stroke-width="1.4"/>
      <path d="M24 30 L58 80 C52 84 44 84 38 80 C30 74 26 58 24 44 Z"
            fill="${C.stoneL}" opacity=".4"/>
      <path d="M38 86 C46 92 58 90 64 84" fill="none" stroke="#F3EFE4"
            stroke-width="3" stroke-linecap="round"/>
      <path d="M26 20 L36 14 M30 26 L40 20 M34 32 L44 26"
            stroke="#5F4A36" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M25 17 L37 10 M29 23 L41 16 M33 29 L45 22"
            stroke="#C8B79A" stroke-width="1" stroke-linecap="round" opacity=".8"/>`
  },

  /* 갈돌과 갈판 — 판 한가운데가 움푹 팼다 */
  galdol: {
    label: '곡식을 빻던 돌',
    draw: () => `
      <path d="M12 58 C12 50 24 44 50 44 C76 44 88 50 88 58 L88 68
               C88 76 76 82 50 82 C24 82 12 76 12 68 Z"
            fill="${C.stone}" stroke="${C.stoneD}" stroke-width="1.4"/>
      <ellipse cx="50" cy="58" rx="38" ry="14" fill="${C.stoneL}"/>
      <ellipse cx="50" cy="59" rx="27" ry="9.5" fill="${C.stoneD}" opacity=".42"/>
      <ellipse cx="50" cy="59.5" rx="18" ry="6" fill="${C.stoneD}" opacity=".5"/>
      <path d="M32 56 C40 52 60 52 68 56" fill="none" stroke="${C.stoneD}"
            stroke-width=".9" opacity=".7"/>
      <rect x="30" y="24" width="40" height="15" rx="7.5"
            fill="${C.stone}" stroke="${C.stoneD}" stroke-width="1.4"/>
      <rect x="33" y="26.5" width="34" height="6" rx="3" fill="${C.stoneL}" opacity=".7"/>
      <path d="M34 38 C42 41 58 41 66 38" fill="none" stroke="${C.stoneD}"
            stroke-width="2" opacity=".55"/>`
  },

  /* 가락바퀴 — 가운데 구멍에 막대를 꽂아 돌린다 */
  garak: {
    label: '실을 잣던 둥근 돌',
    draw: () => `
      <ellipse cx="50" cy="62" rx="30" ry="11" fill="${C.stoneD}" opacity=".18"/>
      <path d="M20 56 C20 44 33 36 50 36 C67 36 80 44 80 56
               C80 64 67 70 50 70 C33 70 20 64 20 56 Z"
            fill="${C.clay}" stroke="${C.clayD}" stroke-width="1.4"/>
      <path d="M24 54 C26 45 36 39 50 39 C64 39 74 45 76 54 C68 49 60 47 50 47 C40 47 32 49 24 54 Z"
            fill="#C08D64" opacity=".7"/>
      <ellipse cx="50" cy="53" rx="7.5" ry="4.6" fill="#F3EFE4" stroke="${C.clayD}" stroke-width="1.2"/>
      <ellipse cx="50" cy="53.6" rx="5" ry="2.8" fill="${C.soil}" opacity=".55"/>
      <path d="M50 12 L50 51" stroke="${C.wood}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M50 12 L50 51" stroke="#A98661" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M50 18 C58 20 58 26 50 28 C42 30 42 36 50 38"
            fill="none" stroke="${C.boneD}" stroke-width="1.4"/>
      <path d="M30 60 C38 63 62 63 70 60" fill="none" stroke="${C.clayD}"
            stroke-width="1" opacity=".6"/>`
  },

  /* 뼈바늘 — 한쪽 끝에 실을 꿰는 구멍이 있다 */
  bonebaneul: {
    label: '뼈로 만든 바늘',
    draw: () => `
      <path d="M46 12 C52 12 56 16 56 22 L54 74 C54 82 52 88 50 88
               C48 88 46 82 46 74 L44 22 C44 16 40 12 46 12 Z"
            fill="${C.bone}" stroke="${C.boneD}" stroke-width="1.3"/>
      <path d="M47 20 L49 74" stroke="#FFFDF5" stroke-width="1.6" opacity=".85"/>
      <ellipse cx="50" cy="22" rx="3.4" ry="4.6" fill="#F3EFE4" stroke="${C.boneD}" stroke-width="1.2"/>
      <path d="M50 88 L52 92 L48 92 Z" fill="${C.boneD}"/>
      <path d="M50 22 C64 22 70 30 66 40 C62 50 70 56 78 54"
            fill="none" stroke="${C.stoneL}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
      <path d="M30 44 C34 40 40 40 44 44" fill="none" stroke="${C.boneD}"
            stroke-width="1" opacity=".5"/>`
  },

  /* 조개더미 — 껍데기가 켜켜이 쌓인 층 */
  jogaedeomi: {
    label: '조개껍데기가 쌓인 자리',
    draw: () => {
      let s = `<path d="M4 84 C20 84 30 82 50 82 C70 82 82 84 96 84 L96 96 L4 96 Z"
                     fill="${C.soil}"/>`;
      const rows = [
        { y: 78, n: 9, c: C.shell },
        { y: 70, n: 8, c: C.shellD },
        { y: 62, n: 7, c: C.shell },
        { y: 54, n: 6, c: C.shellD },
        { y: 46, n: 4, c: C.shell }
      ];
      rows.forEach((r, ri) => {
        const w = 76 - ri * 11;
        for (let i = 0; i < r.n; i++){
          const x = 50 - w / 2 + (w / (r.n - 1 || 1)) * i;
          const rot = ((i * 37 + ri * 13) % 40) - 20;
          s += `<g transform="translate(${x.toFixed(1)} ${r.y}) rotate(${rot})">
                  <path d="M-6 0 C-6 -4.4 -2.8 -7 0 -7 C2.8 -7 6 -4.4 6 0 C3 2.4 -3 2.4 -6 0 Z"
                        fill="${r.c}" stroke="${C.shellD}" stroke-width=".8"/>
                  <path d="M0 -6.4 L-3.4 0 M0 -6.4 L0 .6 M0 -6.4 L3.4 0"
                        stroke="${C.shellD}" stroke-width=".6" opacity=".8"/>
                </g>`;
        }
        s += `<path d="M${50 - (76 - ri * 11) / 2 - 3} ${r.y + 4.6} C50 ${r.y + 7.4} 50 ${r.y + 7.4} ${50 + (76 - ri * 11) / 2 + 3} ${r.y + 4.6}"
                    fill="none" stroke="${C.groundD}" stroke-width="1" opacity=".55"/>`;
      });
      // 사이에 섞인 물고기 뼈와 토기 조각
      s += `<path d="M60 66 L70 66 M64 63.4 L64 68.6 M67 63.8 L67 68.2"
                  stroke="${C.boneD}" stroke-width="1.1" stroke-linecap="round"/>`;
      s += `<path d="M30 58 L38 56 L39 62 L31 63 Z" fill="${C.clay}" opacity=".9"/>`;
      s += `<path d="M32 58.6 L37.4 57.4 M32.4 60.6 L37.8 59.6"
                  stroke="${C.clayD}" stroke-width=".7"/>`;
      return s;
    }
  },

  /* 움집터 — 땅을 판 자리, 기둥 구멍, 가운데 화덕 */
  umjipteo: {
    label: '땅을 파고 지은 집의 자리',
    draw: () => {
      let s = `<rect x="2" y="2" width="96" height="96" fill="${C.ground}"/>
        <ellipse cx="50" cy="54" rx="40" ry="33" fill="${C.groundD}"/>
        <ellipse cx="50" cy="56" rx="35" ry="28.5" fill="${C.soil}" opacity=".55"/>
        <ellipse cx="50" cy="57" rx="30" ry="24" fill="${C.soil}"/>`;
      // 기둥 구멍 여섯
      for (let i = 0; i < 6; i++){
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + Math.cos(a) * 24, y = 57 + Math.sin(a) * 19;
        s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="2.9"
                       fill="#4E4436" stroke="#3A3228" stroke-width=".7"/>`;
      }
      // 가운데 화덕
      s += `<ellipse cx="50" cy="58" rx="10" ry="8" fill="#6B5B44"/>
            <ellipse cx="50" cy="58" rx="7" ry="5.4" fill="#3E352A"/>
            <path d="M46 58 L48 54 L50 58 L52 53.6 L54 58" fill="none"
                  stroke="#B5543F" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>`;
      // 둘레 돌
      for (let i = 0; i < 10; i++){
        const a = (i / 10) * Math.PI * 2;
        s += `<ellipse cx="${(50 + Math.cos(a) * 12.4).toFixed(1)}" cy="${(58 + Math.sin(a) * 9.8).toFixed(1)}"
                       rx="2.1" ry="1.7" fill="${C.stone}"/>`;
      }
      // 땅을 판 깊이를 보이는 단
      s += `<path d="M10 54 C10 40 28 32 50 32 C72 32 90 40 90 54"
                  fill="none" stroke="${C.groundD}" stroke-width="1.4" opacity=".9"/>`;
      return s;
    }
  },

  /* 조개껍데기 치레걸이 — 구멍을 뚫어 꿴 목걸이 */
  chiregeori: {
    label: '조개껍데기로 만든 꾸미개',
    draw: () => {
      let s = `<path d="M18 24 C18 56 32 74 50 74 C68 74 82 56 82 24"
                     fill="none" stroke="${C.boneD}" stroke-width="1.8"/>`;
      const n = 9;
      for (let i = 0; i < n; i++){
        const t = i / (n - 1);
        const a = Math.PI * (0.06 + t * 0.88);
        const x = 50 - Math.cos(a) * 32;
        const y = 24 + Math.sin(a) * 50;
        const big = Math.abs(t - .5) < .18;
        const r = big ? 8 : 6;
        s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
                <path d="M${-r} 0 C${-r} ${-r * .74} ${-r * .46} ${-r * 1.16} 0 ${-r * 1.16}
                         C${r * .46} ${-r * 1.16} ${r} ${-r * .74} ${r} 0
                         C${r * .5} ${r * .4} ${-r * .5} ${r * .4} ${-r} 0 Z"
                      fill="${i % 2 ? C.shell : C.shellD}" stroke="${C.shellD}" stroke-width=".8"/>
                <path d="M0 ${-r * 1.05} L${-r * .56} 0 M0 ${-r * 1.05} L0 ${r * .3}
                         M0 ${-r * 1.05} L${r * .56} 0"
                      stroke="${C.shellD}" stroke-width=".6" opacity=".9"/>
                <circle cx="0" cy="${(-r * .78).toFixed(1)}" r="1.5" fill="#6B6152"/>
              </g>`;
      }
      return s;
    }
  },

  /* 씨앗과 이삭 — 농사 미션의 배경 그림 */
  ssiat: {
    label: '거둔 곡식',
    draw: () => {
      let s = `<path d="M8 88 C30 82 70 82 92 88 L92 96 L8 96 Z" fill="${C.soil}"/>`;
      for (let i = 0; i < 5; i++){
        const x = 22 + i * 14;
        s += `<path d="M${x} 88 C${x - 2} 66 ${x - 1} 50 ${x} 34"
                    fill="none" stroke="#8C9A5B" stroke-width="2"/>`;
        for (let k = 0; k < 5; k++){
          const y = 36 + k * 8;
          s += `<ellipse cx="${x - 3.4}" cy="${y}" rx="3" ry="2" fill="#C8AE62" transform="rotate(-24 ${x - 3.4} ${y})"/>
                <ellipse cx="${x + 3.4}" cy="${y + 2}" rx="3" ry="2" fill="#D7BE72" transform="rotate(24 ${x + 3.4} ${y + 2})"/>`;
        }
      }
      return s;
    }
  }
};

/** 그림 한 장을 SVG 문자열로. 없으면 빈 문자열 */
export function artSVG(name){
  const a = ART[name];
  if (!a) return '';
  return `<svg class="ob-art" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
               role="img" aria-label="${a.label}">
            <rect x="0" y="0" width="100" height="100" fill="#F3EFE4"/>
            ${a.draw()}
          </svg>`;
}

export function artLabel(name){ return (ART[name] && ART[name].label) || ''; }
export function hasArt(name){ return !!ART[name]; }
export const ART_NAMES = Object.keys(ART);
