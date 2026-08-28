# 한국사 아틀라스 — 통합 기준 문서 (MASTER)

> **이 문서 하나가 최상위 기준입니다.**
> 꾸러미의 기획 문서 19개(`README`, `docs/00`~`docs/12`, `docs/content/01`~`12`)와
> 수업 기획서 4개(`curriculum.md`, `lesson1~3.md`), 참고 프로젝트 문서 2개를 전부 대조해
> 한 벌로 합친 것입니다. 수치는 **실물 파일과 대조해 검증**했습니다.
>
> 작성 2026-08-28 · 대상 초등 5학년 2학기 사회(역사)

---

## 0. 이 문서를 읽는 법

### 0-1. 우선순위 (다른 문서와 어긋날 때)

```
1순위  이 문서 (MASTER.md)              ← 충돌이 이미 해소돼 있음
2순위  docs/12-BUILD-RULES.md            ← 실제로 만들어 보고 쓴 규칙
3순위  docs/01-ARCHITECTURE.md           ← 필드 이름의 유일한 출처
       docs/08-BUILD-ORDER.md            ← 시간·순서·분업의 유일한 출처
4순위  나머지 docs/*.md
참고    docs/content/*.md                ← 퀘스트 원문. 텍스트는 한 글자도 바꾸지 않음
```

**§15 충돌 해소 대장**에 원본 문서들이 서로 무엇을 다르게 말했는지, 어느 쪽으로
확정했는지가 전부 기록돼 있습니다. 원본 문서를 읽다 이상한 곳을 만나면 §15를 보세요.

### 0-2. 읽는 차례

| 역할 | 읽을 곳 |
|---|---|
| 전원 (시작 전 10분) | §1 · §2 · §3 · §12 |
| 엔진·변환 담당 | §4 · §5 · §6 · §11 · §13 |
| 시대 소품 담당 | §4-2 · §6 · §10 · 자기 시대 `content/NN-*.md` |
| 지도 모드 담당 | §7 · §4-3 · §9 |

---

## 1. 무엇을, 왜 만드는가

### 1-1. 제품

**한국사 아틀라스 — 시간이 쌓이는 지도.** 하나의 앱에 두 모드가 들어갑니다.

| | 지도 모드 | 탐험 모드 |
|---|---|---|
| 화면 | 2D SVG 지도 | 3D 저폴리 월드 |
| 하는 일 | 시대를 옮겨 다니며 영토 변화와 유물을 봄 | 아바타로 그 시대를 걸으며 선택을 겪음 |
| 주인공 | 자료 | 이야기 |
| 코드 | 평범한 `<script>` 전역 | ES 모듈 |
| 시대 수 | 13개 | 12개 |

두 모드를 잇는 것은 **`contentId` 하나뿐**입니다. 탐험에서 퀘스트를 깨면 지도 모드의
역사 가방(도감)이 채워집니다. 저장소도 하나입니다(`historyBagExplore_v1`).

### 1-2. 왜

초등 5-2 사회는 한 학기에 구석기부터 현대까지 달립니다. 교실에서 반복되는 장면:

- **"고구려가 어디예요?"** — 나라 이름은 외우지만 어디였는지를 그리지 못합니다. 교과서 지도는 시대마다 따로 떨어져 있어 영토가 **움직인다**는 감각이 생기지 않습니다.
- **"이게 언제 거예요?"** — 유물 사진과 시대가 연결되지 않습니다.
- **역사가 남의 일** — 연표 위 숫자로만 다가옵니다.

> **목표** — 아이가 "그때 그곳"을 지도 위에서 그릴 수 있게 한다.
> 교사가 자기 수업에 맞게 고쳐 쓸 수 있게 한다.

### 1-3. 교육과정 근거 (`curriculum.md`)

콘텐츠 판단이 갈릴 때 이 다섯 줄이 기준입니다.

```
역사적 사고 과정  >  단순 지식 전달
역사 자료 탐구    >  사실 암기
학생의 질문·판단  >  정답 맞히기
생활 모습과 경험  >  사건 나열
과거·현재의 연결  >  과거 사실의 단순 제시
```

성취기준: `[6사04-01]` 선사·고조선 / `[6사04-02]` 고대 / `[6사04-03]` 고려 /
`[6사05-01]` 조선 유교문화 / `[6사05-02]` 조선 후기·개항 / `[6사06-01]` 일제강점기 /
`[6사06-02]` 광복·6·25

교육과정이 **명시적으로 금지**한 것 — 반드시 지킵니다.

- 정치적 사건 나열 대신 **생활 모습의 변화**와 연결한다
- 광복·6·25를 **연대기적으로 나열하지 않는다**
- 근대 문물을 단순히 "발전된 문명"으로 표현하지 않는다 — 당시 사람들이 어떻게 **받아들이고 해석하고 변형**했는지를 다룬다
- 미니게임에도 교육적 목적을 부여한다 — 최소 하나의 역사적 개념·자료·사고 과정과 연결

---

## 2. 확정 제약과 기술 스택

### 2-1. 타협하지 않는 넷

| 제약 | 왜 |
|---|---|
| **서버 없음** | 학생 개인정보가 나갈 통로 자체를 만들지 않습니다. 저장은 `localStorage`뿐 |
| **인터넷 끊겨도 동작** | 학교·심사장 네트워크는 신뢰할 수 없습니다. three.js·폰트를 `vendor/`에 동봉 |
| **설치·가입 없이 링크 하나로** | 정적 파일. GitHub Pages 배포 |
| **종이로도 쓸 수 있게** | 태블릿 없는 교실이 많습니다. 학습지·기록지 인쇄 |

**두 번째가 가장 자주 잊힙니다.** 개발 막바지에 인터넷을 끊고 시험해 보니 탐험 모드가
죽은 전례가 있습니다.

### 2-2. 스택 (고정)

| 구분 | 사용 |
|---|---|
| 프런트엔드 | 바닐라 JavaScript · SVG · CSS (프레임워크·빌드도구 없음) |
| 3D | **three.js 0.160.0** — `vendor/three/`에 동봉됨 |
| 글꼴 | **Pretendard Variable v1.3.9** — `vendor/font/` 서브셋 92개 동봉됨 |
| 지도 데이터 | **Natural Earth 1:50m** (`assets/countries-50m.json`, 퍼블릭 도메인) |
| 지오메트리 처리 | Python · Shapely |
| 저장 | 브라우저 `localStorage` |
| 배포 | 정적 파일 (GitHub Pages, `main` / root) |
| 인쇄 | `window.print()` + `@media print` — **PDF 라이브러리 금지** (§7-6) |

**버전을 0.160.0으로 고정하세요.** 상위 버전에서 `RoomEnvironment` 경로와 색 공간
기본값이 바뀝니다. `index.html`의 importmap이 `vendor/` 경로를 가리켜야 합니다.

```html
<script type="importmap">
{ "imports": {
    "three": "./vendor/three/build/three.module.js",
    "three/addons/": "./vendor/three/addons/"
} }
</script>
```

### 2-3. 모듈 방식이 두 가지입니다 — 섞지 마세요

- **탐험 모드** — ES 모듈 (`import`/`export`)
- **지도 모드** — 평범한 `<script>` 전역 (나중에 `atlas-*.js`가 위에 얹히는 구조)

### 2-4. 폴더 구조

```
index.html                  전체 앱 셸 (인트로 + 지도모드 DOM + 탐험모드 DOM)
css/styles.css              두 모드 공용 디자인 토큰 + 모드별 스타일

js/
  map-data.js               지도: ERAS, CONTENT, MAP, px/py         (전역)
  map-app.js                지도: 2D SVG 렌더링·인터랙션            (전역)
  atlas-geo.js              지도 얹기: 실측 해안선                   (전역)
  atlas-content.js          지도 얹기: 항목 추가(후삼국 8 + 전쟁기 12) (전역)
  atlas-photos.js           지도 얹기: 사진 폴백(§9-3)               (전역)
  atlas-dedupe.js           지도 얹기: 중복 46쌍 정리                 (전역)
  atlas-integrate.js        지도 얹기: 지도·도감·교사 기능            (전역)
  asset-credits.js          공용: 에셋 출처/저작권 (append-only)      (전역)
  report.js                 공용: 학습지·기록지 인쇄                  (전역)

  explore-app.js            탐험 진입점 — engine/boot.js 한 줄만 import
  engine/                   탐험 공용 엔진 (시대 무관)
    state.js                  ST, questState, bag, 저장/불러오기
    constants.js              카테고리 색/라벨 테이블
    boot.js                   부팅, 시대 전환, 타임라인, 입력 바인딩
    player.js                 아바타 빌드, 이동/점프/카메라
    scene-helpers.js          공용 3D 빌더 (시대 파일이 쓰는 어휘)
    markers.js                퀘스트 3D 마커, 미니맵 레이더
    ui.js                     퀘스트 모달/조사 패널/NPC/가방/시대완료
    minigames.js              미니게임 10형식
    grader.js                 답안 채점 — 순수 함수, 의존성 0 (§5-6)
    worlds-registry.js        WORLDS · AREAS_BY_WORLD · AREA_BUILDERS_BY_WORLD
  eras/                     시대별 데이터 + 3D 월드 빌더 — 12개, 서로 독립
    paleo.js  neolithic.js  bronze.js  samguk.js  unified-silla.js
    later.js  goryeo.js  joseon-early.js  joseon-late.js
    open-port.js  colonial.js  war.js

vendor/three/               three.js 0.160.0 (MIT) — 동봉됨
vendor/font/                Pretendard v1.3.9 (SIL OFL 1.1) — 동봉됨
assets/                     이미지·3D 모델·지도 원본 — §9
docs/                       원본 기획 문서 (참고)
```

### 2-5. 의존 방향

```
boot ──→ worlds-registry ──→ eras/*
  └──→ ui ⇄ state
       ui ⇄ minigames ──→ grader
       ui ⇄ markers ⇄ scene-helpers
       ui ⇄ player
```

`worlds-registry`만 `eras/*`를 압니다. **`eras/*`는 엔진의 `scene-helpers`와 `state`만
압니다.** 이 방향을 지켜야 시대를 독립적으로 만들 수 있습니다.

엔진 모듈끼리는 **서로를 참조하는 순환 구조**입니다. ES 모듈이 처리해 주지만, 쪼개서
지시하면 어긋납니다. **한 벌로 설계하세요.**

---

## 3. 확정 규모 (실물 대조 완료)

원본 문서들의 수치가 서로 달랐습니다. 아래는 **실제 파일을 세어 확정한 값**입니다.

### 3-1. 콘텐츠

| 항목 | 확정값 | 근거 |
|---|---|---|
| 탐험 시대 | **12개** | `docs/content/01`~`12` |
| 탐험 지역 | **46곳** | 각 문서 `## 지역` 표 합계 |
| 탐험 퀘스트 | **243개** (관문 제외) | `### ` 헤딩 합계 |
| 관문 (`kind:'gate'`) | **70개** | 관문 표 행 합계 |
| NPC | **154명** | NPC 항목 합계 |
| 지도 모드 시대 (`ERAS`) | **13개** | `04-LEARN-MODE` 데이터 원문 |
| 학습 항목 (`CONTENT`) | **146개** | 〃 |
| 학습 항목 보강 (신규 작성) | **+20개** | 후삼국 8(`10-LEARN-EXTRA`) + 전쟁기 12(§4-4) |
| 미니게임 | **10형식** | §5 |
| 시대 전용 3D 소품 명세 | **165개** + 개항기 19개 | `09-3D-OBJECTS` + `content/10` |
| 사진 | **68장** (jpg) | `assets/photos/` |
| ㄴ 학습 항목에 붙는 것 | 46파일 → **41개 항목** | 파일명 = 항목 id, `-2` 변형 5개 |
| ㄴ 아직 못 붙인 것 | 22장 (`hb_*`) | 대응 항목 미정 |
| 외부 통신 | **0건** | |

**"228개", "사진 76장", "15개 시대", "146개 중 42개"** 같은 원본 문서의 수치는 전부
낡은 값입니다. 위 표를 쓰세요.

### 3-2. 시대별 분포

| # | 시대 | 파일 | 지역 | 퀘스트 | 관문 | NPC | 미니게임 | 학습 항목 |
|---|---|---|---|---|---|---|---|---|
| 01 | 구석기 | `paleo.js` | 1 | 9 | 0 | 5 | 4 (blank·ember·knap·stack) | 5 |
| 02 | 신석기 | `neolithic.js` | 1 | 10 | 0 | 10 | 6 (blank·grind·memory·sort·spin·stack) | 7 |
| 03 | 청동기·고조선 | `bronze.js` | 1 | 12 | 0 | 7 | 5 (blank·grind·knap·lift·stack) | 7 |
| 04 | 삼국 | `samguk.js` | 4 | 33 | 8 | 16 | lift·stack·기본형 + 빈칸1 | 26 |
| 05 | 통일신라·발해 | `unified-silla.js` | 2 | 17 | 2 | 8 | sort·stack + 빈칸1 | 11 |
| 06 | 후삼국 | `later.js` | 3 | 11 | 4 | 10 | **0 → 1~2개 신규 추가** (§5-5) | 5 (+8 보강) |
| 07 | 고려 | `goryeo.js` | 7 | 20 | 12 | 16 | ember·grind·knap·spin·stack + 빈칸1 | 13 |
| 08 | 조선 전기 | `joseon-early.js` | 9 | 27 | 16 | 24 | ember·grind·knap·lift·spin·stack + 빈칸1 | 10 |
| 09 | 조선 후기 | `joseon-late.js` | 4 | 33 | 6 | 14 | ember·grind·knap·lift·sort·spin·stack + 빈칸1 | 22 |
| 10 | 개항기 | `open-port.js` | 4 | 16 | 6 | 10 | stack ×2 | 14 |
| 11 | 일제강점기 | `colonial.js` | 5 | 25 | 8 | 14 | blank ×6 · memory · sort | 12 |
| 12 | 광복·6·25 | `war.js` | 5 | 30 | 8 | 20 | blank×2·ember·grind·lift·memory·sort×2·spin·stack×2 | 6+8 |
| | **합계** | | **46** | **243** | **70** | **154** | | **146** |

지도 모드에만 있는 시대: **광복(`liberation`)** — 탐험 모드의 광복·6·25(`war`)가 두 시대를
함께 다룹니다.

---

## 4. 데이터 계약

> **이 절이 계약서입니다.** 여기 적힌 필드 이름 그대로 만들어야 `docs/content/*.md`의
> 퀘스트 243개를 손대지 않고 쓸 수 있습니다. 이름을 하나라도 바꾸면 콘텐츠 문서를
> 전부 고쳐야 합니다.

### 4-1. 퀘스트 스키마

모든 종류가 공통으로 갖는 것:

| 필드 | 필수 | 설명 |
|---|---|---|
| `id` | ○ | 시대 안에서 고유. 저장의 열쇠 |
| `title` | ○ | 화면에 보이는 이름 |
| `icon` | ○ | 이모지 하나 |
| `cat` | ○ | **6종만**: `relic` `person` `culture` `event` `exchange` `life` (§4-6) |
| `pos` | ○ | `{x, z}` — 3D 월드 좌표. y는 없음 |
| `area` | △ | 여러 지역이 있는 시대에서 필수 |
| `contentId` | ✕ | 지도 모드 항목 id. 완료 시 역사 가방에 담김 |

> **`contentId`는 반드시 실재하는 `CONTENT` 항목이어야 합니다.** 없는 id를 쓰면 아이
> 화면에 영문 id가 그대로 노출됩니다. 현재 12개가 비어 있습니다 — §4-4에서 채웁니다.

#### 여섯 갈래 (`kind`)

**① 역할 선택 (`kind` 없음)** — 가장 많이 쓰는 형식. 정답이 있습니다.

```js
{ id:'munmu', cat:'person', icon:'👑', title:'문무왕과 삼국 통일',
  area:'silla', pos:{x:0,z:12},
  story:'당신은 문무왕이다. …',
  q:{ text:'지금 무엇을 해야 하는가?',
      choices:['…','…!','…','…'],
      correct:1,                    // 0부터 시작
      ok:'그렇다. …',                // 맞았을 때. 역사적 사실을 여기서 알려 준다
      no:'… 다시 판단하라.' } }      // 틀렸을 때. 힌트를 주고 다시 시키기
```

**`no`는 막다른 길이 아닙니다.** 왜 아닌지 알려 주고 다시 고르게 합니다.

**② 열린 선택 (`kind:'choice'`)** — 정답이 없습니다.

```js
{ id:'danbal-choice', kind:'choice', cat:'life', icon:'✂️',
  title:'상투를 자르라는 명', area:'hanseong', pos:{x:-12,z:-6},
  contentId:'danballyeong',
  setup:'당신은 종로에서 잡화를 파는 장사꾼이다. …',
  prompt:'지금 당신은 어떻게 하겠는가?',
  choices:[ { label:'명을 따라 상투를 자르고…', outcome:'거울 속 낯선 얼굴이…' },
            { label:'상투만은 지키겠다…',       outcome:'며칠 문을 닫으니…' } ],
  epilogue:'단발령에 대한 반발은 매우 컸어요. …' }
```

`choices`가 **문자열 배열이 아니라 `{label, outcome}` 객체 배열**입니다. ①과 다릅니다.
선택지 3개가 적당하고, **어느 것도 틀리지 않아야** 합니다.

**③ 조사형 (`kind:'inspect'`)** — 자료를 눌러 읽고, 다 보면 마무리 문제가 열립니다.

```js
{ id:'ondol-inspect', kind:'inspect', cat:'relic', icon:'♨️',
  title:'온돌이 깔린 궁궐터', area:'balhae', pos:{x:14,z:-16},
  img:['balhae-ondol.webp'],        // 선택. 없으면 사진 칸 자체를 그리지 않음
  hotspots:[ { label:'궁궐 바닥 아래의 고랑', note:'상경성 궁궐터를 파 보니 …' },
             { label:'고구려에서 이어진 것',   note:'온돌은 고구려 사람들이 …' } ],
  capstone:{ text:'무엇을 보여 주는 증거일까요?', choices:[…], correct:1,
             ok:'맞아요. …', no:'다시 살펴보세요.' } }
```

핫스팟 4개가 적당합니다. `note`는 `<b>`를 쓸 수 있습니다. `capstone`이 없으면 핫스팟을
다 보는 것으로 완료됩니다.

**④ 미니게임 (`kind:'minigame'`)** — **선택형 문제가 먼저** 옵니다.

```js
{ id:'bongdon-ember', cat:'event', icon:'🔥', title:'봉돈에 불을 올리다',
  area:'hwaseong', pos:{x:22,z:16}, kind:'minigame',
  story:'당신은 화성 동쪽 봉돈을 지키는 군사다. …',
  q:{ text:'…', choices:[…], correct:1, ok:'…', no:'…' },
  mini:{ type:'ember', tag:'봉돈 · 밤새 불씨 지키기',
         startLabel:'봉돈으로 올라가기 →', intro:'바람이 불 때마다 …',
         ok:'밤새 첫 화두의 불이 꺼지지 않았다. …', retry:'불씨가 사그라들었다. …' } }
```

**⑤ 관문 (`kind:'gate'`)** — `GATES_*` 배열에 따로 정의하고 퀘스트 배열에 합칩니다.

```js
export const GATES_JOSEONL = [
  { id:'gate-han-namhae', area:'hanyang', pos:{x:-38,z:-24}, icon:'🚩',
    title:'남쪽 바다로', to:'namhae', confirm:'한산도 앞바다로 향할까요?' } ];

export const QUESTS_JOSEONL = [ ...QUESTS_JOSEONL_BASE,
  ...GATES_JOSEONL.map(g => ({ id:g.id, kind:'gate', cat:'event', icon:g.icon,
    title:g.title, area:g.area, pos:g.pos, to:g.to, confirm:g.confirm })) ];
```

**관문은 완료 수에 세지 않습니다.** 지역마다 **돌아오는 관문**을 반드시 두세요.

**⑥ 수집품 (`kind:'find'`)** — 여러 개를 다 모으면 완료.

```js
export const FINDS_JOSEONL = [
  { id:'task-1', area:'hanyang', contentId:'…', doneMsg:'다 모았어요!',
    items:[ { id:'find-a', icon:'📜', label:'…', pos:{x:4,z:8} }, … ] } ];
```

**여러 단계 전투 (`stages`)** — `war:true`인 퀘스트에 여러 판을 이어 붙입니다.
`war`는 `cat` 값이 **아닙니다.** 별개의 불리언 플래그입니다.

```js
war:true, warTag:'…', warMidLabel:'…', warNextLabel:'…', warDoneLabel:'…',
recap:'…',                          // 다시 방문했을 때 보여 줄 요약
stages:[ { story:'…', q:{…} }, { story:'…', q:{…} } ]
```

### 4-2. 시대 파일이 내보내는 것

```js
export const AREAS_<시대>           // 지역 정의
export const GATES_<시대>           // 관문
export const QUESTS_<시대>          // 퀘스트 (관문 합친 최종본)
export const NPCS_<시대>            // 길에서 만나는 사람들
export function build<시대><지역>() // 지역별 3D 지형
export const AREA_BUILDERS_<시대>   // 지역 이름 → 빌더
```

**지역**

```js
export const AREAS_JOSEONL = {
  hanyang: { name:'한양', spawn:{x:0,z:16}, bg:'#E4E1CB', bound:56,
             loading:'한양으로 이동하는 중…' } };
```

| 필드 | 설명 |
|---|---|
| `name` | 화면에 보이는 이름 |
| `spawn` | 도착 위치. **어느 마커와도 6 이상** 떨어뜨립니다 |
| `bg` | 하늘·배경색. 시대의 인상을 좌우합니다 |
| `bound` | 돌아다닐 수 있는 반경 (36~72). 가장 먼 마커 거리 + 8 |
| `loading` | 전환 중 문구 |

> **네 값을 직접 정하지 마세요.** 각 콘텐츠 문서 `## 지역` 표에 계산돼 있습니다.
> 그대로 옮기고, 퀘스트 좌표를 바꾸면 `bound`를 다시 계산하세요.

**NPC** — 콘텐츠 문서의 좌표 표기가 두 가지입니다. **`{x,z}` 객체로 통일해서 옮기세요.**

```js
export const NPCS_JOSEONL = [
  { area:'hanyang', pos:{x:-16,z:4}, color:'#8C6A4A', icon:'🏮',
    lines:['첫 번째 대사','두 번째 대사','세 번째 대사'] } ];
```

`01-paleo` `02-neolithic` `03-bronze`는 `좌표 [8,2]` 형식으로 적혀 있습니다 →
`pos:{x:8,z:2}`로 읽습니다. 나머지 9개 시대는 이미 `{x:…,z:…}` 형식입니다.
`lines`는 말을 걸 때마다 순서대로 보여 줍니다. 지역당 3~5명이 적당합니다.

**레지스트리** — 새 시대는 여기에만 손댑니다.

```js
export const WORLDS = {
  later:{ mode:'3d', name:'후삼국', quests:QUESTS_LATER,
          saveKey:'laterExplore_v1',           // 시대마다 고유해야 함
          bg:…, spawn:…, bound:…,               // 시작 지역 값을 그대로 참조
          brand:'🚩 후삼국 탐험', startArea:'cheorwon',
          build:()=>buildLaterCheorwon(), loading:…,
          eyebrow:'후삼국 · 892 ~ 936', title:'…', body:'…', hint:'…',
          complete:{ title:'후삼국 탈출 성공!', body:'…' } } };
```

> **`WORLDS`의 첫 항목이 기본값입니다.** 저장된 시대가 없을 때 여기로 들어갑니다.
> 새 시대를 맨 앞에 넣지 마세요.

### 4-3. 지도 모드 데이터

**시대 (`ERAS`)** — 13개. 배열 순서 = 타임라인 순서 = `eraIdx`.

```
paleo · neo · bronze · three · unified · later · goryeo ·
joseon_e · joseon_l · open · colonial · liberation · war
```

```js
{ id:'three', name:'삼국시대', short:'삼국', years:'기원전 57 ~ 668',
  span:'고구려·백제·신라·가야', line:'세 나라가 한강을 두고 겨루고…',
  accent:'#4E7F6A',                    // 이 시대의 색
  view:[33.2,121.5,43.8,131.2],        // 기본 지도 범위 [남,서,북,동]
  terr:[…], nb:[…], rel:[…] }
```

**나라 영역 (`terr`)**

```js
{ n:'고구려', c:'#4E7F6A', at:[41.6,125.4],
  pts:[[45.0,123.5],[44.8,130.5], …],       // 영역 폴리곤 (여러 폐곡선 가능)
  cap:{ n:'평양', at:[39.02,125.75] },
  kr:1 }                                     // 한반도 클립 여부
```

**교류선 (`rel`)** — `{id, t, ty, from:[lat,lng], to:[lat,lng], bend:-1~1, d}`

**항목 (`CONTENT`)** — 146개(+20개 신규).

```js
{ id:'jeongok', era:'paleo', cat:['relic'], t:'연천 전곡리', at:[38.02,127.06],
  d:'한탄강 가에서 구석기 시대의 주먹도끼가 무더기로 나온 곳이에요.',
  b:['본문 문단 1','본문 문단 2'],
  tags:['주먹도끼','뗀석기','한탄강'], rel:['makjip','seokjangni'] }
```

| 필드 | 필수 | 설명 |
|---|---|---|
| `id` | ○ | 전체에서 고유. **탐험 퀘스트의 `contentId`가 이걸 가리킵니다** |
| `era` | ○ | `ERAS`의 id |
| `cat` | ○ | 배열. 여러 분류에 걸칠 수 있고 **첫 번째가 대표색** |
| `t` `at` `d` `b` | ○ | 이름 / `[위도,경도]` / 한 줄 설명 / 본문 문단 배열 |
| `tags` `rel` | ✕ | 검색·연결용 / 관련 항목 id |

### 4-4. 두 모드 연결 — `ERA_ID_MAP`

두 모드의 시대 id가 다릅니다. **원문 id를 양쪽 다 유지하고 매핑표 하나를 둡니다.**
어느 쪽도 고치지 마세요 — 고치면 `CONTENT` 146개와 콘텐츠 문서 12개를 전부 손대야 합니다.

```js
// 지도 모드(ERAS.id)  →  탐험(WORLDS key / js/eras 파일명)
const ERA_ID_MAP = {
  paleo:'paleo',   neo:'neolithic',  bronze:'bronze',   three:'samguk',
  unified:'unified-silla',           later:'later',     goryeo:'goryeo',
  joseon_e:'joseon-early',           joseon_l:'joseon-late',
  open:'open-port', colonial:'colonial', liberation:'war', war:'war' };
const WORLD_TO_ERA = Object.fromEntries(
  Object.entries(ERA_ID_MAP).map(([e,w]) => [w,e]));   // war → 'war' 로 접힘
```

**연결 지점 네 곳** (통합 QA에서 실제로 클릭해 확인)

1. 인트로 → `#startExploreBtn` → 탐험 모드
2. 지도 모드 `#toExploreBtn` → `window.startExploreMode(eraId)` 전역 함수 호출
3. 탐험 모드 `#toMapBtn` → 지도 모드
4. 퀘스트 완료 → `collectContent(contentId)` → 역사 가방 → 지도 모드 도감

```js
collectContent(id) {
  if (!id || bag.has(id)) return;
  const c = CONTENT.find(x => x.id === id);
  if (!c) return;                 // ← 없는 항목이면 아무것도 하지 않는다. 절대 빼지 말 것
  bag.add(id); saveBag();
  showToast(`🎒 "${c.t}"을(를) 역사 가방에 담았어요`);
}
```

#### 채워야 할 학습 항목 20개 (신규 작성)

**후삼국 8개** — `docs/10-LEARN-EXTRA.md`에 본문까지 완성돼 있습니다. 그대로 옮기세요.

```
hb_later_hoju · hb_later_poseokjeong · hb_later_silla_end ·
hb_later_gyeonhwonsanseong · hb_later_naju · hb_later_balhae_refugee ·
hb_later_gyeongsunwang · hb_later_naksandong
```

**광복·6·25 11개 + 일제강점기 1개** — 콘텐츠 문서가 참조하는데 `CONTENT`에 없습니다.
`04-LEARN-MODE` §3-3 스키마로 **새로 써야 합니다.** 톤은 지도 모드의 설명체(~해요체).

| id | 시대 | 무엇 | 참조하는 곳 |
|---|---|---|---|
| `warstart` | `war` | 전쟁이 시작되다 | `12-war.md` |
| `pinanjip` | `war` | 피난살이와 판잣집 | 〃 |
| `cheonmak` | `war` | 천막 학교 | 〃 |
| `hangang-gyo` | `war` | 한강 다리와 피난길 | 〃 |
| `boatman` | `war` | 흥남 철수와 뱃사람 | 〃 |
| `chinain` | `war` | 피난지에 모인 사람들 | 〃 |
| `sijang` | `war` | 국제시장과 장사 | 〃 |
| `milmyeon` | `war` | 밀면 — 고향을 그리는 음식 | 〃 (`lesson3.md` 「냠냠 음식 속으로」) |
| `muljigye` | `war` | 물지게와 물 긷기 | 〃 |
| `ireumdoro` | `war` | 이름 없는 길 / 이산가족 | 〃 |
| `chongseongeo` | `liberation` | 5·10 총선거 | 〃 (`lesson3.md` 「할 수 있어요」) |
| `ssalsutal` | `colonial` | 쌀 수탈과 군산항 | `11-colonial.md` |

> `chongseongeo`는 `05-DECISIONS`가 "아이 화면에 영문 id가 뜬다"의 **실제 사례**로
> 적어 둔 바로 그 id입니다. 반드시 채우세요.

작성 근거는 `lesson3.md`(교과서 3단원 변환본)에 있습니다 — 5·10 총선거, 판잣집,
천막 학교, 밀면, 물지게, 국제시장, 이산가족이 모두 실려 있습니다.

### 4-5. 상태와 저장

```js
export const ST = {
  QUESTS: [], SAVE_KEY: '…', BOUND: 32,
  scene, camera, renderer,
  markerGroups: [], npcGroups: [],
  player, rig, leftLeg, rightLeg, leftArm, rightArm,
  activeMarker: null, questOpen: false, moving: false,
  camYaw: Math.PI, camZoom: 1, camPitchOffset: 0,
  orbitId: null, pinchDist: null, jumpY: 0, jumpVY: 0,
  spawnPos: {x:0,z:10},
  currentWorld: null, currentMode: '3d', currentArea: null,
  npcDialogueFor: null, npcLineIdx: 0,
  inspecting: null, inspectSeen: new Set(), inspectPhotoIdx: 0,
  envTexture: null, activeNear: null };
```

```js
localStorage[ST.SAVE_KEY]            = JSON.stringify({ questState })  // 시대별
localStorage['historyBagExplore_v1'] = JSON.stringify([...bag])        // 시대 공통
localStorage[MKEY]                   = 'student' | 'teacher'           // 지도 모드
localStorage['atlasRecord_v1']       = JSON.stringify(record)          // 기록지 (§7-6)
```

`questState`는 `{ 퀘스트id: 'done' }`. **시대마다 `SAVE_KEY`가 다르므로 퀘스트 id가
겹쳐도 서로 간섭하지 않습니다** — 실제로 고려와 조선 전기에 같은 id가 둘 있습니다.

`localStorage` 접근은 사생활 보호 모드에서 예외를 던질 수 있으므로 읽기·쓰기를 모두
`try/catch`로 감싸고, **저장이 불가능해도 앱은 정상 동작**해야 합니다.

```js
foundCount() = QUESTS.filter(q => q.kind !== 'gate' && questState[q.id] === 'done').length
```

화면의 `발견 3 / 29`가 이것입니다. 관문은 빠집니다.

### 4-6. 분류 (`cat`) — 6종 고정

| id | 이름 | 색 |
|---|---|---|
| `relic` | 유물·유적 | `#7B6A55` |
| `person` | 인물 | `#3F6B8C` |
| `culture` | 문화 | `#3E8A78` |
| `event` | 사건 | `#A8534F` |
| `exchange` | 교류 | `#7C6BA8` |
| `life` | 생활문화 | `#8A7B4E` |

**새 분류를 늘리지 마세요.** 필터 UI와 도감이 여섯 개를 전제로 만들어져 있습니다.
전투 퀘스트는 `cat:'event'` + `war:true` 플래그로 표현합니다.

#### 퀘스트 `cat`을 정하는 규칙 — 손으로 정하지 않습니다

`docs/content/*.md`에는 `cat`이 적혀 있지 않습니다. **적지 마세요.** 이렇게 정합니다.

1. `contentId`가 있으면 → `CONTENT`에서 찾아 **`cat` 배열의 첫 번째** 값을 씁니다
2. 없으면 아이콘 이모지로:
   `⚔️🗡️🏹🛡️💥🔥🚩`→`event` · `👑🤴👘`→`person` · `🏺💎🔔📜🪙`→`relic`
   `🎨🖼️🎵🎭📖`→`culture` · `🍚🍜🧺🏠♨️`→`life`
3. 그래도 못 정하면 `kind`로: `inspect`→`relic` · `choice`·`minigame`→`life` · 나머지 `event`

**왜**: 이렇게 하면 같은 유물이 두 모드에서 같은 색으로 나옵니다. 손으로 정하면
반드시 어긋납니다.

---

## 5. 미니게임 — 10형식

> 엔진에 10형식을 만들어 두고 시대마다 **재사용**합니다. 새 시대를 위해 미니게임을
> 새로 만들지 마세요. 소재를 10형식 중 하나에 맞추는 편이 빠르고, 아이도 조작법을
> 다시 배우지 않아도 됩니다.

### 5-1. 공통 규약

```js
const startFn = MINIGAME_STARTERS[q.mini.type] || startMinigame;
```

`type`을 지정하지 않으면 **기본형**으로 넘어갑니다. 오류가 아니라 설계된 동작입니다.

**흐름** — 미니게임 앞에는 **반드시 선택형 문제가 먼저** 옵니다.

```
story  →  q (선택형)  →  정답  →  mini.intro  →  조작  →  mini.ok
                        └ 오답 → q.no → 다시
```

**공통 필드**: `type`(✕) · `intro`(○) · `ok`(○) · `retry`(실패가 있는 종류는 ○) ·
`tag`(✕) · `startLabel`(✕) · `hitLabel`(✕)

**실패를 막다른 길로 만들지 않습니다.** 초등학생이 씁니다. 시도 횟수 제한은 긴장감을
위한 것이지 배제를 위한 것이 아닙니다.

### 5-2. 판정 시점 — **누르는 순간**

버튼의 `click`은 **손을 뗄 때** 옵니다. 누르고 떼는 사이(80~150ms)에 바늘이 화면의
10~20%를 지나가 "제대로 눌렀는데 빗나감"이 생깁니다. 시험판 첫 플레이어가 곧바로
"제대로 눌렀는데 진다"고 했습니다.

- 판정은 **`pointerdown`**. 뒤따라오는 `click`은 700ms 안이면 무시 (키보드 `Enter`·스페이스로 온 `click`은 살려 둡니다)
- **디바운스로 막지 마세요.** 250ms 디바운스를 뒀더니 빠른 연타가 통째로 먹혔습니다
- 화면은 코드보다 한두 프레임 뒤에 그려집니다. **아이가 "본" 자리**(2프레임 전 위치)도 함께 명중으로 쳐 줍니다
- `knap`처럼 놓는 순간을 재는 것은 `pointerup` 판정 — 지연 보정만 똑같이 넣습니다

### 5-3. 10형식 명세 (확정 상수)

바늘형 4종의 난이도는 **시험판에서 맞춘 값**입니다. `02-MINIGAMES`에 적힌 값과 다르면
아래가 맞습니다.

| # | type | 조작 | 성공 조건 | 구간 폭 (시작→최소) | 속도 (시작→최대) | 실패 |
|---|---|---|---|---|---|---|
| 1 | `spin` | 원을 그리듯 돌리기 | 누적 `laps`바퀴 (기본 4) | — | — | **없음** |
| 2 | `knap` | 누르고 있다 놓기 | 6번 중 4번 | 20 % → 8 % | 게이지 0.75초에 100 % | 6번 후 미달 |
| 3 | `ember` | 눌러 불씨 유지 | 적정 구간에 `holdMs`(6000ms) | 적정 40~75 | 감소 13/초, +16/탭, 쿨다운 450ms, 시작 55 | 레벨 0 |
| 4 | `stack` | 순서대로 누르기 | 모든 단계 순서대로 | — | — | 실수 3회 |
| 5 | `grind` | 좌우 번갈아 타이밍 | 10번 중 6번 | 16 % → 7.5 % | .95 → 2.0 | 10번 후 미달 |
| 6 | `lift` | 단발 타이밍 | 8번 중 5번 | 18 % → 9.5 % | .88 → 1.9 | 8번 후 미달 |
| 7 | `sort` | 두 통에 끌어다 놓기 | 전체의 **70 % 이상** | — | — | 70 % 미만 |
| 8 | `memory` | 순서 기억해 되누르기 | `rounds`(기본 4) 통과 | 시작 길이 2 → `2+rounds-1` | — | **한 번이라도 틀리면 즉시** |
| 9 | `blank` | 빈칸에 낱말 쓰기 | 정규화 후 정답과 일치 | — | — | **없음** (다시 쓰기) |
| 10 | (기본형) | 왕복 바늘 타이밍 | 3번 중 2번 | 23 % → 14 % | .80 → 1.7 | 3번 후 미달 |

명중할 때마다 구간이 3 % 안팎 좁아지고 속도가 .1 안팎 빨라집니다.
**버튼 크기는 난이도 조절에 쓰지 마세요** — 터치 목표 44×44는 타협 대상이 아닙니다.

#### 종류별 추가 필드

- `spin` — `laps`
- `stack` — `steps`(**필수**, 4~5단계가 적당), `visual`(선택 → §5-4)
- `sort` — `items`(**필수**), `binLeftIcon/Label`, `binRightIcon/Label`
  ```js
  items:[ {icon:'♨️', label:'온돌', korean:true },   // true 가 왼쪽 통
          {icon:'🛣️', label:'주작대로', korean:false} ]
  ```
  필드 이름 `korean`이 어색하지만 **좌우를 가르는 불리언**입니다. 10개 안팎, 좌우
  절반씩. 한쪽으로 치우치면 아이가 규칙을 알기 전에 찍어서 70 %를 넘깁니다.
- `memory` — `rounds` (**4보다 크게 잡지 마세요.** 즉시 실패라 가장 가혹합니다)
- `blank` — `정답` 문자열. 공백·가운뎃점·문장부호를 지우고 비교. 틀리면 `no`를 보여 주고 다시

#### 소재와 형식 짝짓기

| 소재의 성격 | 쓸 것 | 예 |
|---|---|---|
| 일정하게 오래 반복 | `spin` | 물레로 백자 빚기, 맷돌 돌리기 |
| 정확한 한 순간 | `knap` · 기본형 | 활쏘기, 돌 떼어내기, 망치질 |
| 계속 지켜보며 유지 | `ember` | 봉수대 불 지키기, 가마 온도 |
| 순서가 중요 | `stack` | 탑 쌓기, 봇짐 꾸리기, 활자 조판 |
| 리듬·박자 | `grind` | 판소리 장단, 톱질 |
| 힘을 모아 들어 올리기 | `lift` | 거중기로 성돌 올리기, 투호 |
| 분류·비교 | `sort` | 고구려 계승과 당 수용, 우리 것과 들어온 것 |
| 기억 | `memory` | 상륙 신호, 봉수 순서 |
| 이름을 스스로 떠올리기 | `blank` | 인물·유물 이름 |

`sort`가 **교육적으로 가장 강합니다.** "발해가 고구려를 이어받았다"를 말로 설명하는
대신 아이가 유물을 직접 갈라 놓으면서 스스로 알아차립니다.

### 5-4. `stack`의 `visual`

`viewBox="0 0 200 170"` 기준 인라인 SVG 문자열. 단계마다 `data-step`을 붙인 `<g>`로
감싸고, **`data-step` 개수 = `steps` 개수**여야 합니다.

```html
<rect x="0" y="142" width="200" height="28" fill="#C9C2A8" opacity=".5"/>
<g class="stack-part" data-step="0"> ... </g>
<g class="stack-part" data-step="1"> ... </g>
```

**콘텐츠 문서에는 `visual`이 하나도 없습니다.** 그러므로:

- **막집 그림을 기본값으로 두지 마세요.** 금속 활자 조판에 막집이 나온 전례가 있습니다
- `steps` 개수에 맞춰 **아래에서 위로 쌓이는 단순한 도형**을 자동으로 그려 줍니다
- 시간이 남으면 서사가 중요한 몇 개에만 손으로 `visual`을 붙입니다

### 5-5. 시대별 배치 규칙

- **미니게임이 0개인 시대가 없게 합니다.** → **후삼국(`later`)이 현재 0개입니다.**
  기존 퀘스트 11개 중 하나를 미니게임형으로 바꾸거나 1~2개를 더합니다.
  **권장**: `lt-hunyo`(훈요 10조) → `stack`(조항을 순서대로) ·
  `lt-illicheon`(일리천, 마지막 싸움) → `memory`(신호 순서) 또는 기본형.
  새로 쓰는 텍스트는 탐험 모드 사극 톤(§8-3)을 따릅니다.
- 한 시대에 **같은 종류를 두 번 쓰지 마세요.** 현재 어기고 있는 곳:
  개항기 `stack`×2 · 6·25 `sort`×2 `stack`×2 · 일제강점기 `blank`×6.
  `blank`는 문항이라 예외로 두되, 개항기와 6·25는 여유가 생기면 하나를 다른 종류로.
- 시대당 **2~4개**가 적당합니다. 너무 많으면 이야기가 끊깁니다.
- **조작이 실제 그 행위를 닮아야 합니다.** "돌 갈기"를 좌우 버튼 교대 클릭으로
  만들었다가 "너무 쉽고 간석기와 상관없다"는 피드백으로 폐기한 전례가 있습니다.
  제스처 인식(드래그)도 불안정해서 폐기했습니다. **클릭/탭 기반 + 그 행위의 감각.**

### 5-6. 서술형 채점 (`grader.js`)

기록지 기능(§7-6)과 함께 들어옵니다. **3D도 DOM도 모르는 순수 함수**로 만들고 Node
단위 테스트를 붙입니다 (`node --test`).

```js
grade(question, answer) → { pass, matched, feedback }
```

| 유형 | 규칙 |
|---|---|
| `choice` | 선택 인덱스 일치 |
| `ox` | 불리언 일치 |
| `short` / `blank` | 정규화(공백·가운뎃점·문장부호 제거) 후 정답 배열과 비교 |
| `essay` | 키워드 그룹별로 하나라도 포함되면 1점, `minMatch` 이상이면 통과 |

```js
keywords: [ ['농사','농경','곡식','씨앗'], ['정착','머무','한곳','살게'] ],
minMatch: 2
```

**오답 처리** — ① 1회 실패: 해설 없이 힌트, 재시도 ② 2회 실패: 해설 전문 제시 후
재시도(서술형은 이 시점에 통과 처리) ③ 통과 여부와 무관하게 **학생이 쓴 답 전문을
기록에 남깁니다.**

서술형 키워드 매칭은 맞는 내용을 다른 낱말로 쓰면 오판합니다. 키워드 그룹을 넉넉히
잡고, 2회 실패 시 통과시킨 뒤 답 전문을 기록지에 실어 **교사가 최종 판단**하게 하는
것이 안전장치입니다.

---

## 6. 탐험 모드 — 3D 규칙

### 6-1. 이동 · 카메라 · 입력

**아바타** — 발밑 `y=0`, 머리 꼭대기 **`y≈2.5`**. **`+z`를 바라보게** 만듭니다
(그래야 `rotation.y = atan2(dx, dz)`로 진행 방향을 향합니다). 코나 상투처럼
**앞뒤를 구분해 주는 돌기**를 하나 붙이세요 — 없으면 어느 쪽을 보는지 모릅니다.

**입력 부호 — 이 표가 유일한 출처**

| 입력 | 뜻 |
|---|---|
| `fwd = +1` | 화면 안쪽(카메라에서 멀어지는 쪽) — `W` `↑` |
| `fwd = -1` | 화면 앞쪽(카메라 쪽) — `S` `↓` |
| `strafe = +1` | 화면 오른쪽 — `D` `→` |
| `strafe = -1` | 화면 왼쪽 — `A` `←` |
| 조이스틱 | `joy.z` 위가 `+`, `joy.x` 오른쪽이 `+` (**같은 부호**) |

두 축을 합칠 때 길이가 1을 넘으면 정규화합니다(대각선이 빨라지지 않게).
조이스틱 좌우가 반전된 버그가 실제로 있었습니다 — 이 표 하나로 통일하세요.

**키는 `e.key`가 아니라 `e.code`로 받습니다.**
한글 입력 상태에서 `W A S D`의 `e.key`는 **`ㅈ ㅁ ㄴ ㅇ`** 입니다. `e.key === 'w'`로
만들면 한글 자판을 쓰는 교실에서 이동이 통째로 죽습니다.

- `e.code`(`KeyW` `ArrowUp` …)를 먼저 봅니다
- `e.code`가 비어 오는 환경을 위해 `ㅈ ㅁ ㄴ ㅇ`과 `w a s d` 표도 함께 둡니다
- `blur`·`visibilitychange`에서 **누른 키를 모두 비웁니다** — 안 그러면 계속 걷습니다
- 방향키·스페이스는 `preventDefault()` — 안 하면 페이지가 같이 스크롤됩니다

**카메라 축**

```
카메라 위치 = 아바타 + ( sin(camYaw), 높이, cos(camYaw) ) × 거리
화면 안쪽 f = ( -sin(camYaw), -cos(camYaw) )
화면 오른쪽 r = (  cos(camYaw), -sin(camYaw) )
이동 방향 = f × fwd + r × strafe        (정규화 후 속도 ≈ 9 / 초)
아바타 각도 = atan2(방향.x, 방향.z)
```

**자동 추적은 앞으로 갈 때만, 25° 넘게 어긋날 때만.**
문자 그대로(이동 방향 뒤로 계속 돌린다) 만들면 **`D`를 누르고 있는 동안 아바타가
제자리를 도는 원을 그립니다.** 카메라가 돌면 화면 기준 축도 같이 돌아 입력 방향이
계속 밀리기 때문입니다.

- `fwd > 0.1`일 때만 추적 (뒷걸음·옆걸음에서는 카메라 고정)
- 목표 각도와 차이가 **25°**를 넘는 만큼만 천천히
- **드래그 중에는 추적하지 않습니다**

**드래그 오빗(포인터로 카메라 직접 회전)은 반드시 유지합니다.** 한 번 제거했다가
바로 원복한 전례가 있습니다. 플레이테스터가 말한 "산만함"의 정체는 드래그 오빗이
아니라 위의 자동 추적이었습니다.

**조이스틱은 손가락 기기에서만 띄웁니다.** `#exJoy`는 `aria-hidden="true"`로 시작합니다.
`(pointer: coarse)`이거나 첫 `touchstart`가 오면 `false`로 바꿔 주세요.
**이걸 놓치면 태블릿 교실에서 아이가 한 걸음도 움직이지 못합니다.**
작은 화면에서는 하단 타임라인과 겹치지 않게 위로 올립니다(`bottom: 78px` 안팎).

### 6-2. 스타일과 조명

**저폴리 · 플랫셰이딩.** 사실적인 재현을 하지 않습니다.

```js
new THREE.MeshStandardMaterial({ color: col, flatShading: true })
```

만들기 빠르고, 태블릿에서 가볍고, **"이건 옛날을 그대로 찍은 게 아니라 그린 것"**
이라는 신호를 줍니다. 고증이 확실하지 않은 부분을 사실처럼 보여 주지 않기 위해서입니다.

```js
scene.fog = new THREE.Fog(bg, 38, 92);
scene.add(new THREE.HemisphereLight('#EAF2EF', '#B9A98A', 1.15));
const sun  = new THREE.DirectionalLight('#FFF3DD', 1.3);  sun.position.set(28, 42, 14);
const fill = new THREE.DirectionalLight('#CFE3FF', 0.5);  fill.position.set(-22, 20, -12);

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

- **반구광이 주력.** 위는 옅은 청록, 아래는 흙빛
- 해는 따뜻한 크림색, 채움광은 차가운 하늘색 — 이 대비가 저폴리 면을 살립니다
- 안개를 배경색과 같게 두면 먼 곳이 지평선으로 자연스럽게 사라집니다
- **그림자를 켜지 마세요.** 태블릿에서 프레임이 떨어지고 저폴리에서는 있으나 마나입니다
- 픽셀 비율을 **2로 잘라야** 고해상도 태블릿에서 느려지지 않습니다

**저사양 모드** — 시작 화면에서 선택. 안티앨리어싱 끄기, `pixelRatio` 1 고정.
WebGL 미지원 시 안내 문구를 띄웁니다.

### 6-3. 크기 감각 — 캐릭터 키 ≈ 2

| 대상 | 대략 |
|---|---|
| 캐릭터 | 높이 2 (머리 꼭대기 y≈2.5) |
| 작은 오두막·움집 | 벽 1.2~1.6, **총 높이 최소 3.0** |
| 초가·기와집 | 폭 3~5, 총 높이 3~4.5 |
| 궁궐 | 폭 5~6, 높이 3~4 |
| 성문·관문·큰 건물 | 총 높이 4~6 |
| 석탑 | 높이 3~4 |
| 지역 반경 `bound` | 36~72 |

> **자가 점검 한 줄** — 새 오브젝트를 만들 때마다 "지붕 꼭대기 y가 3.0 이상인가?"
> 신석기 움집 등이 아바타보다 낮게 만들어져 "건물이 사람보다 작다"는 피드백을 받은
> 전례가 있습니다.

**건물을 실제 비례로 만들지 마세요.** 궁궐을 실제 비례로 하면 캐릭터가 개미가 됩니다.
**"조금 작은 장난감 마을"**이 맞습니다.

### 6-4. 공용 빌더 (`scene-helpers.js`)

`eras/*.js`는 **이 어휘만** 씁니다. 직접 `THREE` 지오메트리를 만들지 마세요 —
시대마다 스타일이 어긋납니다. 기본 지오메트리(`Box` `Cylinder` `Cone` `Sphere` `Torus`
`Dodecahedron` `Tetrahedron` `Icosahedron` `Octahedron` `Plane`)를 `THREE.Group`에
조합하는 패턴을 따릅니다.

**바탕**

| 함수 | 설명 |
|---|---|
| `buildGround()` | 110×110 평면 바닥(`#E9E4D3`). **모든 지역에서 가장 먼저** |
| `buildWater()` | 강·바다 평면 (30×120, 청록 반투명 `#8FC1C4`) |
| `buildMountains()` | 가장자리 저폴리 산 26개. **반지름은 `ST.BOUND × 1.02`부터** |
| `buildMountainsWide()` | 더 크고 먼 산 (반지름 80~92) |

> **산 반지름을 37~44로 고정하지 마세요.** 지역 `bound`가 36~72인데 44보다 크면
> 걸어서 산을 뚫고 지나갑니다. 도시·전쟁 씬처럼 산이 안 어울리면 빼도 됩니다
> (6·25에서 실제로 뺐습니다).

**건물·구조물**

| 함수 | 인자 |
|---|---|
| `jRoofHanok(x,z,w,d,h,bodyColor,roofColor)` | 궁궐 `w≈5,h≈3` / 민가 `w≈3,h≈2` |
| `buildStrawHouse(x,z,scale,rotY)` / `buildTileHouse(…)` | 배율, 회전(라디안) |
| `brickBuilding(x,z,w,d,h)` | 벽돌 건물. 개항기·일제강점기용 |
| `timberGate(x,z,spread,color)` | `spread`는 기둥 사이 **절반** 거리. 4.6이면 폭 9.2 |
| `buildFortressWall(x,z,len,axis,color)` | `axis`는 `'x'`/`'z'`. 두께 2.2, 높이 3.4 고정 |
| `buildStonePagoda(x,z)` | 5층 석탑. **두 개를 나란히 두면 쌍탑** |
| `buildTombMound(x,z,r,color)` | `r`은 반지름. 3~4가 적당 |
| `buildTrainingGround(x,z)` / `buildPier(x,z,len)` / `buildShipHull(x,z)` | 연무장 / 부두 / 배 선체 |

**흩뿌리기·기타**

| 함수 | 인자 |
|---|---|
| `scatterTreesArea(n, xr, zr, exclude)` | 개수, `[최소,최대]` 둘, 중심 제외 반경 |
| `scatterHouses(n, xr, zr, exclude, opts)` | `opts = { strawRatio:0.6, avoid:[[0,-6],[12,-2]] }` (기본 초가 55 %) |
| `makeTree(s)` / `buildTrees()` | 나무 1그루 / 전역 산포 |
| `makeNPC(color, icon)` | 옷 색, 이모지. 위치는 반환값에 직접 설정 |
| `iconTexture(emoji)` / `textSprite(text, scale=0.012)` | 마커 텍스처 / 3D 공간 글자 |

### 6-5. 배치 — 겹침 방지

산포 함수의 제외 목록에 **셋을 모두** 넣습니다.

1. 그 지역 퀘스트 좌표 (`ST.QUESTS[].pos`)
2. 그 지역 NPC 좌표
3. **그 지역 `spawn`** ← 이게 빠져서 시험판에서 도착하자마자 나무 속에 서 있었습니다

나무는 3.5 이상, 집은 6.5 이상 띄웁니다. `scatterHouses`의 `avoid`에는 **그 지역에
이미 놓은 건물 좌표를 전부** 넣으세요. 빠뜨리면 민가가 궁궐을 뚫고 들어갑니다.

**퀘스트 좌표는 서로 4단위 이상** 띄웁니다(겹치면 누를 수 없음).

### 6-6. 지역 빌더를 짜는 순서

```js
export function buildLaterCheorwon(){
  buildGround();                                              // 1. 바탕
  buildMountains();
  scatterTreesArea(22, [-32,32], [-32,28], 6);

  jRoofHanok(0, -6, 5.2, 4.2, 3.2, '#DCD3BE', '#5A6470');     // 2. 주요 건물
  timberGate(0, -10, 4.6, '#6B7280');
  buildFortressWall(0, -16, 20, 'x', '#A9A79A');
  buildStonePagoda(-16, -6);

  scatterHouses(9, [-26,26], [-26,20], 9,                     // 3. 민가 (마지막)
    { strawRatio:0.6, avoid:[[0,-6],[0,-10],[-16,-6],[24,10]] });

  buildNPCsLater();                                            // 4. 사람
}
```

**이 순서를 지키세요.** 민가를 먼저 뿌리면 주요 건물과 겹칩니다.
각 콘텐츠 문서의 `## 지역 지형 배치` 표가 이 호출을 순서대로 적어 두었습니다.

```js
export function buildNPCsLater(){
  NPCS_LATER.filter(n => n.area === ST.currentArea).forEach(n => {
    const g = makeNPC(n.color, n.icon);
    g.position.set(n.pos.x, 0, n.pos.z);
    g.userData.npcLines = n.lines;
    ST.scene.add(g); ST.npcGroups.push(g);
  });
}
```

### 6-7. 시대 전용 소품

시대에만 필요한 것(전차, 증기선, 개마무사, 자격루 등)은 **그 시대 파일 안에서** 만들어
export 합니다. 엔진에 넣지 않습니다. 명세는 `docs/09-3D-OBJECTS.md`(165개, 10개 시대)와
`docs/content/10-open-port.md`(개항기 19개)에 있습니다.

- 시대당 2~5개, **6·25만 17개**
- **후삼국은 시대 전용 소품이 하나도 없습니다** — 공용 빌더만으로 3개 지역이 성립합니다
- **빈 공간을 시대에 맞는 저비용 오브젝트로 채웁니다.** "모든 시대의 공간이 휑하다"는
  피드백을 받았습니다. 신석기=조개더미·통나무배·장작더미, 청동기=고인돌·제사 도구,
  전쟁=철조망·군용 잔해. 시간이 없으면 최소한 바위+수풀이라도.

**GLB 모델은 2점만 실제로 씁니다.**

```js
loadJagyeokru(x, z, targetHeight=3.4)       // assets/clepsydra_of_changgyeonggung_palace.glb
loadBronzeSpearhead(x, z, targetHeight=2.2) // assets/bronze_age_spearhead.glb
```

**없으면 기본 도형으로 대체**되게 만드세요. 앱이 GLB 없이도 돌아가야 합니다.

### 6-8. 탐험 모드 DOM 뼈대

엔진이 `document.getElementById`로 직접 참조하므로 **id가 정확해야** 합니다.

```html
<div id="explore" aria-hidden="true">
  <canvas id="exCanvas"></canvas>
  <div id="exLoading"><div class="ex-spin"></div><p id="exLoadingMsg"></p></div>

  <div id="exIntroStory" class="ex-story-wrap">
    <div class="ex-story-card">
      <p class="ex-story-eyebrow" id="exStoryEyebrow"></p>
      <h2 class="ex-story-title" id="exStoryTitle"></h2>
      <p class="ex-story-body" id="exStoryBody"></p>
      <p class="ex-story-hint" id="exStoryHint"></p>
      <button class="intro-btn" id="exStoryGo">모험을 시작한다</button>
    </div>
  </div>

  <div class="ex-top">
    <div class="brand" id="exBrand"></div>
    <div class="spacer"></div>
    <button class="found" id="bagBtn">🎒 역사 가방</button>
    <div class="found">발견 <b id="exFoundN">0</b> / <span id="exFoundT">0</span></div>
    <button class="found" id="toMapBtn">🗺️ 지도 모드</button>
  </div>

  <div id="exHint"></div>              <!-- 하단 토스트 -->
  <div id="npcBubble"></div>           <!-- NPC 말풍선 (3D→2D 투영) -->
  <div id="inspectPanel"></div>        <!-- 조사 패널 -->

  <button type="button" id="exMinimap" aria-label="한반도 지도에서 이 위치 보기">
    <svg id="exMiniRadar" viewBox="0 0 128 128"></svg><span id="exMiniLabel"></span>
  </button>
  <div id="exMiniScrim"></div>
  <div id="exMiniModal" role="dialog"><div class="exmini-card" id="exMiniCard"></div></div>

  <div id="exQuestRail">
    <button type="button" id="exRailToggle">‹</button>
    <div class="rail-panel"><div class="rail-head">임무 목록</div><div id="exRailList"></div></div>
  </div>

  <div id="exScrim2"></div>
  <div id="bagSheet" class="ex-list">
    <div class="ex-list-head"><span>🎒 역사 가방</span><button class="sheet-x" id="bagX">…</button></div>
    <div id="bagBody"></div>
  </div>

  <div id="exJoy" aria-hidden="true"><div id="exJoyKnob"></div></div>
  <button id="exInteract">🔍<span>조사하기</span></button>

  <div id="exScrim"></div>
  <div id="questModal" role="dialog"><div class="quest-card" id="questCard"></div></div>
  <div id="eventSheet" role="dialog"><div class="event-card" id="eventCard"></div></div>

  <div id="eraCompleteScrim"></div>
  <div id="eraCompleteModal" role="dialog">
    <div class="era-complete-card" id="eraCompleteCard">
      <img class="ecc-img" id="eccImg" alt=""><div class="ecc-burst" aria-hidden="true"></div>
      <div class="ecc-medal">🏅</div>
      <p class="ecc-eyebrow" id="eccEyebrow"></p>
      <h2 class="ecc-title" id="eccTitle"></h2>
      <p class="ecc-body" id="eccBody"></p>
      <button class="intro-btn" id="eccClose">탐험 계속하기</button>
    </div>
  </div>

  <nav id="exTimeline"><div id="exTrack"></div></nav>
</div>
```

---

## 7. 지도 모드 — 2D SVG

### 7-1. 좌표계

**모든 좌표는 `[위도, 경도]` 순서입니다.** 저장소 전체가 이 순서입니다.
`[경도, 위도]`로 쓰면 지도가 뒤집힙니다.

```js
const MAP = { lng0:115, lng1:137, lat0:30, lat1:49, w:800, h:902 };
const px = lng => (lng - MAP.lng0) * (MAP.w / (MAP.lng1 - MAP.lng0));
const py = lat => (MAP.lat1 - lat) * (MAP.h / (MAP.lat1 - MAP.lat0));
```

단순 정거원통 투영입니다. 정확한 도법보다 **아이가 알아보는 모양**이 중요합니다.
`path(pts)`가 `[[위도,경도], …]`를 SVG `d` 문자열로 바꿉니다.

> **`MAP` 상수는 `map-data.js`와 `atlas-geo.js`가 반드시 같아야 합니다.**

### 7-2. 지도 데이터 — 1:50m로 확정

동봉된 **`assets/countries-50m.json`** (Natural Earth 1:50m, 739KB, 퍼블릭 도메인)에서
한반도·주변국 육지 폴리곤을 뽑아 씁니다. Python + **Shapely**로 처리해
`js/atlas-geo.js`를 만듭니다.

> **핵심** — 나라 영역 폴리곤을 육지 폴리곤과 **교차 연산**해서, 경계가 바다로
> 삐져나가지 않고 해안선에 저절로 붙게 합니다. 손으로 그리면 절대 안 나오는
> 정확도이고, "한반도로 보인다"를 만드는 결정적 요소입니다.

**스펙에서 뺀 것** (1:50m에 없음): 하천 레이어(압록강·두만강·한강·낙동강),
음영기복. 원본 문서가 말한 "해안선 실측 1,412점"은 1:10m 기준이므로 그대로 기대하지
마세요. **눈대중 좌표로 한반도를 그리는 것은 여전히 금지**입니다 — 40점짜리 손 좌표로는
아무리 다듬어도 한반도로 보이지 않습니다.

**좌표 출처는 한 파일로 못박습니다.** 좌표가 두 곳에 나뉘어 있어서 지도를 다시 그릴
때마다 한쪽이 덮어써지고, 마커가 절반만 표시된 전례가 있습니다.

### 7-3. 영역 클립은 두 벌

- `kr:1` → 한반도(제주·섬 포함)로 자릅니다
- `kr` 없음 → **대륙(주변국 포함) 육지로 자릅니다.** 자르지 않으면 고구려 영역이 동해로 번집니다

**`clipPath` 안에는 `<g>`를 넣지 마세요.** SVG 규격상 무시되고 **브라우저가 오류를
내지 않습니다.** 음영기복이 통째로 사라졌는데 화면을 직접 보기 전까지 몰랐습니다.

**고조선처럼 학계가 합의하지 못한 경계는 점선으로 표시합니다.** 결함이 아니라
"학자마다 다르게 본다"를 가르칠 수 있는 자리입니다.

### 7-4. 라벨은 겹치면 뺍니다

나라 이름과 도읍 이름이 **먼저** 자리를 잡습니다. 항목 라벨은 위 → 아래 → 더 위 순으로
옮겨 보고, 그래도 겹치면 **라벨만** 뺍니다. 점은 남겨 두어 누를 수 있게 합니다.
마커가 몰리는 **경주·한양** 일대가 문제입니다.

### 7-5. 기능

- **타임라인** — 하단에 13개 시대. 누르면 그 시대의 `view` 범위로 카메라가 부드럽게 이동
  ```js
  UNIT = i => i<=6 ? '1단원 · 선사 시대 ~ 고려'
             : (i<=9 ? '2단원 · 조선과 개항' : '3단원 · 일제강점기 ~ 6·25')
  ```
  (`i<=9`에는 개항기가 들어갑니다. 원본의 `'2단원 · 조선'` 라벨은 부정확해서 고쳤습니다.)
- **지도 조작** — 확대·축소 버튼과 휠, 드래그 이동, "시대 전체 보기", 항목 클릭 시 초점 이동
- **상세 시트** — 사진(있으면) / 이름·분류 배지 / 한 줄 설명 / 본문 / 확인 문제 /
  관련 항목 / **출처·저작자·라이선스**
- **유물 도감** — 본 항목이 색으로 채워짐. 탐험 모드의 역사 가방과 **같은 저장소**
- **학생용 / 교사용** — `localStorage[MKEY]`. 교사용에서만 인쇄가 보입니다

### 7-6. 인쇄 — 학습지와 기록지

**PDF 라이브러리를 쓰지 않습니다.** jsPDF는 한글 폰트를 따로 임베드해야 해서 파일이
수 MB 커지고 글자가 깨집니다. 대신 **`window.print()` + `@media print` 전용 레이아웃**을
씁니다. 학생·교사는 크롬 인쇄 대화상자에서 「대상: PDF로 저장」을 고릅니다.
라이브러리 0개, 한글 정상, 오프라인 동작, 종이 인쇄도 그대로 됩니다.

**① 학습지 (교사용, 지도 모드)**

| 종류 | 내용 |
|---|---|
| 조사 학습지 | 항목별 빈칸. 아이가 찾아 적음 |
| 문제지 | 확인 문제 모음 |
| 오려 쓰는 카드 | 잘라서 분류·배열 활동 |
| 정답지 | 교사용 |

머리말에 `학년 __ 반 __ 이름 __`, 정답지에는 `교사용 · 배부 전 확인하세요`.

**② 탐험 기록지 (학생용, 탐험 모드)**

- 이름 / 날짜 / 총 소요 시간
- 시대별 발견 현황 · 역사 가방에 담은 항목
- 문항별: 문제 · 내 답 · 정오 · 시도 횟수
- **서술형 답 전문 (교사 평가란 포함)**
- 하단: 에셋 출처와 저작권 안내

> **"교사가 종이로도 쓸 수 있어야 한다"가 이 프로젝트의 요구 조건입니다.**

### 7-7. 얹기 구조

`map-data.js`와 `map-app.js`는 **고치지 않습니다.** `atlas-*.js`가 위에 얹힙니다.

```html
<script src="js/map-data.js"></script>       <!-- 원본 -->
<script src="js/atlas-geo.js"></script>      <!-- 얹기: 해안선 -->
<script src="js/atlas-content.js"></script>  <!-- 얹기: 항목 20개 추가 -->
<script src="js/atlas-photos.js"></script>   <!-- 얹기: 사진 폴백 -->
<script src="js/asset-credits.js"></script>
<script src="js/map-app.js"></script>        <!-- 원본 -->
<script src="js/atlas-dedupe.js"></script>   <!-- 얹기: 중복 46쌍 -->
<script src="js/atlas-integrate.js"></script><!-- 얹기: 지도·도감·교사 기능 -->
```

**배열을 갈아 끼우지 말고 내용만 바꾸세요.** `map-app.js`가 이미 `KOREA`·`ASIA` 배열을
**참조로 붙잡고** 있습니다. 통째로 대입하면 그쪽은 옛것을 계속 봅니다.

```js
function refill(target, source) {
  target.length = 0;
  for (var i = 0; i < source.length; i++) target.push(source[i]);
}
```

**이걸 모르고 대입했다가 실측 해안선이 화면에 안 나온 적이 있습니다.**

**중복 항목** — 두 팀이 같은 유물을 다른 이름으로 넣은 곳이 **46쌍**입니다
(`docs/11-DUPLICATES.md`에 전체 표). 원본을 고치지 않고 스위치 하나로 고릅니다.

```js
const DUP_MODE = 'keep-both';   // keep-ours | keep-theirs | keep-both
```

> `keep-ours`로 바꾸면 탐험 퀘스트가 `theirs` 쪽 `contentId`를 참조하던 연결이
> 끊깁니다. 바꾸기 전에 탐험 모드를 확인하세요. **기본값은 `keep-both`.**

---

## 8. 디자인 시스템

### 8-1. 색

```css
--bg:#F7F7F5;   --card:#FFFFFF;
--text:#191919; --text2:#777777; --text3:#A3A3A0;
--border:#EAEAEA; --border-strong:#DDDDDA;
--accent:#6E9B94;                        /* 청록. 이 도구의 얼굴색 */
--accent-soft:rgba(110,155,148,.12);

--sea:#E8E9E4;      /* 바다가 파랗지 않습니다 */
--land:#FCFCFA;  --land-far:#F1F1EC;     /* 주변국 — 한 단계 물러나 보이게 */
--coast:#D4D4CC;

--c-relic:#7B6A55;  --c-person:#3F6B8C;  --c-culture:#3E8A78;
--c-event:#A8534F;  --c-exchange:#7C6BA8; --c-life:#8A7B4E;
```

**순백(`#FFF`)과 순흑(`#000`)을 배경·본문에 쓰지 마세요.** 화면을 오래 보는 아이의
눈이 피로해집니다. 바다를 회녹색으로 둔 것은 **나라 영역의 색이 주인공이어야 하기
때문**입니다. 바다가 파랗면 시대별 영역 색이 묻힙니다.

**시대 색(`accent`)** — 흙·풀·돌에서 온 색. 구석기 `#B08968` · 신석기 `#BFA06E` ·
청동기 `#A98467` · 삼국 `#4E7F6A` … **시대가 흐를수록 조금씩 차가워지게** 배열하면
타임라인이 시간의 흐름처럼 읽힙니다.

**지역 배경색(`bg`)** — 시대의 인상을 색 하나로 전합니다.
한산도 `#B9D6D9`(바다) · 남한산성 `#C7CBB8`(겨울 산) · 철원 `#D9DEE0`(분지) ·
송악 `#DCE5DF`(강)

### 8-2. 글자와 모양

```css
--font:'Pretendard Variable','Pretendard',-apple-system,…
--r-sm:10px;  --r-md:14px;  --r-lg:20px;  --r-xl:26px;
--sh-1: 0 1px 2px rgba(25,25,25,.04), 0 4px 14px rgba(25,25,25,.06);
--sh-2: 0 2px 6px rgba(25,25,25,.05), 0 12px 34px rgba(25,25,25,.10);
--ease: cubic-bezier(.22,.8,.36,1);
--t-fast:180ms;  --t:280ms;  --t-slow:400ms;
```

- 본문은 **한글 가독성** 최우선. **8pt 미만 금지**
- 숫자와 연도는 본문과 같은 굵기로. 강조하면 연표 암기처럼 보입니다
- 모서리는 넉넉하게, 그림자는 **두 겹**(가까운 것 + 먼 것), 전환은 `--ease` 하나로 통일
- **터치 목표 최소 44×44px.** 지도 마커도 보이는 원보다 터치 영역을 크게

### 8-3. 문체 — 섞지 마세요

| 대상 | 문체 | 예 |
|---|---|---|
| 지도 모드 설명 | **~해요체** | "돌을 깨뜨려 도구를 만들었어요." |
| 탐험 모드 서술 | **~다체** (고풍) | "그대는 시간의 틈에 휩쓸려 …" |
| 탐험 모드 선택지 | **1인칭 다짐** | "당과 맞서 싸워 이 땅에서 몰아내자!" |
| 조사형 `note` | **~해요체** | "1978년 이곳에서 주먹도끼가 …" |

지도 모드에서 "~하였다"가 나오면 갑자기 교과서가 되고, 탐험 모드에서 "~해요"가
나오면 몰입이 깨집니다. `curriculum.md`·`lesson*.md`는 **소재 선정**의 기준일 뿐,
그 설명체를 게임 텍스트에 복사하지 마세요.

### 8-4. 공용 CSS 컴포넌트 — 새 카드 스타일을 만들지 마세요

퀘스트 모달(`.quest-card`)·이벤트 시트(`.event-card`)·미니맵 모달(`.exmini-card`)이
공유합니다.

- `.q-head` → `.q-mi`(48×48 원형+아이콘) + `.q-tag` + `.q-title`
- `.q-story` (양피지색 박스)
- `.q-reveal` (점선 테두리 "이제 어떻게 할까?" → `.q-quiz-wrap` 펼침)
- `.q-choices` > `.q-choice`(번호 원+텍스트) — 정답 `.correct`, 오답 일시적 `.wrong`
- `.q-blank-wrap`(입력창+확인) — `.q-blank-input.wrong` / `:disabled`(정답 시)
- `.q-fb.on.ok` / `.q-fb.on.no` / `.q-fb.on.neutral`
- `.q-next.on` — 하단 pill 버튼(텍스트만 바꿔 재사용)
- 여닫힘 공통: `.on` 토글로 opacity/visibility/pointer-events + 카드는
  `translateY(10px) scale(.97)` → `none` (`var(--t)`)

### 8-5. 하지 말 것

원색·형광색 / 그림자 켜기 / 사실적 텍스처 / 애니메이션 남발 / 문체 섞기 /
8pt 미만 본문 / 44px 미만 터치 목표 / SVG 아이콘 세트 제작(이모지를 씁니다)

퀘스트 아이콘은 **내용과 맞춘 것**으로. `📌` 같은 범용 기호를 남발하면 목록에서
구분이 안 됩니다.

---

## 9. 에셋

### 9-1. 실물 인벤토리 (꾸러미에 이미 있음)

| 경로 | 내용 | 비고 |
|---|---|---|
| `vendor/three/` | three.js **0.160.0** — `three.module.js` + GLTFLoader · RoomEnvironment · BufferGeometryUtils | MIT |
| `vendor/font/` | Pretendard Variable **v1.3.9** — 서브셋 woff2 **92개** + `pretendard.css` | SIL OFL 1.1 |
| `assets/photos/*.jpg` | 사진 **68장** + `CREDITS.md` | 위키미디어 공용 |
| `assets/*.webp` | **8장** — `bitsal` `bronze-mirror` `galdolgalpan` `garak` `paleo-bangudae-petroglyphs-1~3` `paleo-jeongokri-handaxe` | |
| `assets/*.glb` | **9점** (총 ~49MB) — 실제 사용 2점 | §9-4 |
| `assets/countries-50m.json` | Natural Earth 1:50m, 739KB | 퍼블릭 도메인 |
| `assets/Models/` | 저폴리 키트 — 22모델 × FBX/GLB/OBJ + `colormap.png` | §9-5 |

### 9-2. 시작 5분 안에 걸어 둘 일

`vendor/`와 `assets/`가 **이미 들어 있으므로** 대회 시작 후 내려받을 것은 아래 하나뿐입니다.
네트워크 대기라 코드 생성과 병렬로 돕니다.

```
[백그라운드] 누락 webp 14장 수집   ← §9-3
[전면]      저장소 초기화 → 첫 커밋 → 폴더 구조 → 엔진 뼈대
```

**시작 시각 이후의 커밋 이력이 남아야 합니다.** 저장소를 먼저 만들고 첫 커밋을 남기세요.

### 9-3. 사진 — 파일 우선, 인라인 폴백

**기본은 파일 참조입니다.** `assets/photos/*.jpg`를 `<img src>`로 직접 씁니다.
파일 이름이 곧 학습 항목 id입니다.

```
68장 = 학습 항목에 붙는 46파일(→41개 항목, `-2` 변형 5개) + 미매칭 22장(`hb_*`)
```

**표에서 목록을 만들어 두고, 목록에 없으면 사진 칸 자체를 그리지 않습니다.**
`onerror`로 숨기면 콘솔에 404가 쌓입니다.

`js/atlas-photos.js`는 **폴백 계층**으로 둡니다 — 파일이 없는 항목만 base64로 채우는
자리입니다. 처음에는 빈 객체로 시작하고, 시간이 남을 때만 채웁니다.

```js
const HB_PHOTOS = {                       // 비어 있어도 정상 동작
  'hb_50982713': { by:'저작자', lic:'CC BY-SA 4.0', src:'data:image/jpeg;base64,…' } };
function photoFor(id){                    // 파일 우선 → 인라인 → 없으면 null
  if (PHOTO_FILES.has(id)) return { src:`assets/photos/${id}.jpg`, ...PHOTO_META[id] };
  return HB_PHOTOS[id] || null;
}
```

**누락된 webp 14장** — `07-ASSETS.md`가 목록에 적었으나 꾸러미에 없습니다.
시작 직후 백그라운드로 다시 수집합니다. 없어도 화면은 성립합니다(사진 칸 생략).

```
goryeo-celadon-chair / -monkey / -pillow · goryeo-jokduri · goryeo-mongol-byeonbal
umjip-1 / -2 / -3 · kimhongdo · mireuksaji · geumdongdaehyangro · bipa-dagger  외
```

**수집 규약** (위키미디어 공용)

```
https://commons.wikimedia.org/w/api.php?action=query&format=json
  &generator=search&gsrsearch=filetype:bitmap <검색어>&gsrnamespace=6
```

- User-Agent 필수: `korean-history-atlas/1.0 (teacher hackathon)`
- 가로 300px 미만 버림, 재시도 4회, 호출 사이 간격
- 라이선스 필터
  ```python
  OK_LIC = re.compile(r"(CC[ -]BY(-SA)?[ -][\d.]+|CC0|Public domain|KOGL Type 1|공공누리)", re.I)
  ```
- **자동 검색만 믿으면 안 됩니다.** '전차'를 찾으니 지하철 개찰구가, '임진왜란'을
  찾으니 6·25 사진이 나왔습니다. 금지어 필터를 걸고 **사람이 눈으로 최종 확인**합니다.
- 검색어 사전은 `docs/07-ASSETS.md` §3에 100개 넘게 정리돼 있습니다. 그대로 쓰세요.
- 이미지는 `webp`, **가로 1200px을 넘기지 마세요**

### 9-4. GLB — 라이선스 미확인 상태

| 파일 | 크기 | 사용 |
|---|---|---|
| `clepsydra_of_changgyeonggung_palace.glb` | 12 MB | **자격루** (조선 전기) |
| `bronze_age_spearhead.glb` | 3.7 MB | **청동 창** (청동기) |
| `gold_crown_from_the_seobong_tomb.glb` | 15 MB | 예비 |
| `hemispherical_sundial.glb` · `paleolithic_animal_hide_tent.glb` · `paleolithic_hand_axe.glb` · `celadon_porcelaina.glb` · `spinsters_rock.glb` · `tablet.glb` | 1.1~6.8 MB | 예비 |

> ⚠️ **파일에 라이선스 정보가 없습니다.** `07-ASSETS.md`와 `05-DECISIONS.md`가
> "전부 국가유산청 공공누리"라고 적었으나 **근거가 없습니다.** 그 서술은 철회합니다.
>
> **공개 배포 전에 실제로 쓰는 2점의 출처와 이용 조건을 확인해 `asset-credits.js`에
> 적으세요.** 확인 전에는 기본 도형 폴백으로도 배포할 수 있습니다.
> 나머지 7점은 저장소에 남기되 앱에서 부르지 않습니다.

```js
{ file:'clepsydra_of_changgyeonggung_palace.glb', name:'자격루',
  source:'', sourceService:'', sourceUrl:'' }   // 확인된 것만 채운다
```

**확인되지 않은 `author`·`year`·`license`는 비워 두세요.** 모달이 빈 줄을 자동으로
생략합니다. 임의로 채우면 저작권 표기가 틀어집니다.

### 9-5. 저폴리 키트 (`assets/Models/`)

22개 모델(`bridge` `building-platform/roof/structure` `character-archer` `fence` `flag`
`ladder` `patch-dirt/grass` `plant` `platform` `rocks-high/low/ramp` `stones` `target`
`tent` `tree` `tree-high` `weapon-arrow/bow`)이 FBX·GLB·OBJ 세 형식으로 들어 있습니다.

**라이선스 파일이 동봉돼 있지 않습니다.** Kenney 계열 CC0 키트로 보이나 확인 전에는
쓰지 마세요. 이 프로젝트의 3D는 **기본 지오메트리 조합**이 원칙이고(§6-2), 이 키트는
없어도 됩니다.

### 9-6. 라이선스 표기 의무

| 대상 | 라이선스 | 표기 |
|---|---|---|
| Natural Earth 1:50m | 퍼블릭 도메인 | 없음 (명시 권장) |
| 위키미디어 사진 68장 | CC BY / CC BY-SA / CC0 / 공공누리 1유형 | **저작자·라이선스 필수** |
| GLB 9점 | **미확인** | 확인 후 표기. 미확인이면 사용 보류 |
| `assets/Models/` 키트 | **미확인** | 〃 |
| three.js | MIT | 권장 |
| Pretendard | SIL OFL 1.1 | 권장 |
| 교과서 인용 (`lesson3.md`) | 요약·재구성본 | 원문 그대로 옮기지 않음 |

**CC BY-SA 사진은 저작자 이름을 그대로 표시해야 합니다.** `by` 필드를 임의로 줄이거나
다듬지 마세요. 전체 표는 `assets/photos/CREDITS.md`에 있습니다.

`js/asset-credits.js`는 **append-only**로 취급합니다 — 새 에셋을 추가한 사람이 자기
항목만 배열 끝에 덧붙이고, 남의 항목은 지우지 않습니다. 화면 하단 "자료 출처 ·
저작권 안내" 모달이 이걸 읽습니다.

---

## 10. 콘텐츠 원문 (`docs/content/`)

### 10-1. 문서 구조 (12개 모두 동일)

```
## 지역                  지역 목록 + bg/spawn/bound/loading 표
## 관문 (지역 이동)       아이콘·이름·있는 곳·좌표·가는 곳·확인 문구 표   (단일 지역 시대는 없음)
## 퀘스트                ### <이모지> <제목>  형식으로 나열
## 길에서 만나는 사람들    **<이모지>** · 지역 · 좌표 · 옷색 + 대사 목록
## 지역 지형 배치         ### `build…()` 별 「놓는 것 · 인자 · 메모」 표
```

퀘스트 한 개의 첫 줄:

```
`퀘스트id` · **종류** · 지역 `area` · 좌표 `{x,z}` · 학습 항목 `contentId`
```

### 10-2. 텍스트를 다듬지 마세요

> **퀘스트·대사 텍스트는 한 글자도 바꾸지 말고 그대로 옮깁니다.**
> 오타처럼 보여도 그대로 옮기고, **진짜 오타는 콘텐츠 문서 쪽을 고칩니다**
> (그래야 두 번 고치지 않습니다).

새 콘텐츠를 추가할 때만 톤 규칙(§8-3)과 교육과정 원칙(§1-3)을 신경 쓰면 됩니다.

### 10-3. 콘텐츠 설계에서 이미 결정된 것

- **B1. 사건을 나열하지 말고 생활의 변화로 연결한다.** 조선 후기의 한산도·남한산성이
  이순신·의병·진주대첩·병자호란으로만 채워져 전란 일색이었습니다. 소금 굽기·판소리·
  보부상·서당을 넣어 채웠습니다.
- **B2. 지역 쏠림을 확인한다.** 조선 후기가 한양 15 · 화성 5였습니다. 화성을 11개로
  올렸습니다. **가장 많은 지역 ≤ 가장 적은 지역 × 2.**
- **B3. 활동 형식을 섞는다.** 역할 선택 / 열린 선택 / 조사형 / 미니게임 네 가지.
- **B4. 시대의 결을 지킨다.** 개항기 선택형은 **정답을 두지 않습니다.** 단발령 앞에서
  상투를 자를지 말지에 정답이 없기 때문입니다.
- **B5. 설화와 사료가 어긋나면 둘 다 보여 준다.** 서동요는 이야기를 끝낸 뒤 2009년
  미륵사지 석탑 기록이 『삼국유사』와 다르다는 점을 짚습니다. **가르칠 거리입니다.**
- **B6. 시대끼리 이어 준다.** 최치원의 골품제 벽 → 후삼국 호족 / 석가탑 → 무구정광
  대다라니경 / 양요와 척화비 → 강화도 조약 / 을사늑약 → 의병·안중근 → 일제강점기.

---

## 11. 콘텐츠 → 시대 파일 변환 규칙

> `docs/content/*.md`는 **기계적으로 옮길 수 있을 만큼 규칙적입니다.** 손으로 옮기지
> 말고 변환 규칙을 **한 번** 만들어 12개 시대에 그대로 돌리세요. 시험판에서 이 방식으로
> 세 시대(퀘스트 102개)를 한 번에 옮겼고, 나머지 아홉도 같은 형식입니다.

### 11-1. 읽는 규칙

| 문서에 있는 것 | 되는 것 |
|---|---|
| `### <이모지> <제목>` | `icon`, `title` |
| `` `id` · **종류** · 지역 `area` · 좌표 `{x,z}` · 학습 항목 `contentId` `` | 나머지 필드. **종류** → `kind` |
| **종류** 매핑 | 역할 선택→(없음) · 열린 선택→`choice` · 조사형→`inspect` · 미니게임→`minigame` · 수집형→`find` |
| `**상황**` 뒤 인용문 / `**요약**: …` | `story` (열린 선택은 `setup`) |
| `**묻는 말**: …` + `선택지` 목록 + `정답: N번` | `q:{text, choices, correct}` — **N번은 1부터, `correct`는 0부터** |
| 묻는 말이 두 번 이상 | `stages`로 이어 붙임 |
| `**맞았을 때**` / `**틀렸을 때**` 인용문 | `q.ok` / `q.no` |
| `- **라벨** — 설명` (조사형) | `hotspots[]` |
| `**마무리 문제**: …` | `capstone` |
| `**마무리**` 인용문 | `epilogue` |
| `**미니게임 종류**: \`type\`` | `mini.type` |
| `**단계**` / `**조작 안내**` / `- 아이콘 라벨 → 왼쪽/오른쪽` | `mini.steps` / `mini.intro` / `mini.items` |
| `**실패했을 때**: …` | `mini.retry` |
| `**형식**: 빈칸 채우기 문제` + `**정답**: <낱말>` | `mini.type:'blank'` |
| `**찾을 것**` 목록 · `**다 모았을 때**: …` | `find` 퀘스트들과 `doneMsg` |
| 관문 표 | `GATES_*` → `kind:'gate'`로 합침 |
| 길에서 만나는 사람들 | `NPCS_*` (좌표 `[x,z]`는 `{x,z}`로) |
| 지역 지형 배치 표 | 지역 빌더 함수 (표의 호출을 순서대로) |
| `cat` | **문서에 없음.** §4-6 규칙으로 계산 |

### 11-2. 순서

1. 변환 규칙을 만들고 **한 시대**로 검증 (퀘스트 하나 완료까지 직접 플레이)
2. 나머지 11개 시대를 같은 규칙으로 변환
3. 시대별 전용 소품을 채운다 — **여기가 진짜 시간이 드는 곳**
4. `worlds-registry.js`에 12개를 등록 (**한 사람이 마지막에 몰아서**)

**시대마다 프롬프트를 반복하지 마세요.**

### 11-3. 시대마다 손으로 써야 하는 것

배치표의 **지역 빌더**는 그대로 옮겨지지만, 그 표가 부르는 **시대 전용 소품**
(`buildBunker` `buildJangsi` `buildObservatoryTower` …)은 새로 써야 합니다.
시대당 2~5개, **6·25만 17개**, 개항기는 19개(자기 문서에 명세 있음), **후삼국은 0개**.
공용 빌더를 조합하고 **지붕 꼭대기가 `y=3` 이상**인지 확인하세요.

---

## 12. 만드는 차례 · 분업 · 시간

### 12-1. 시간 배분 (8~14시간, 12개 시대 전부)

| 구간 | 시간 | 내용 | 없으면 |
|---|---|---|---|
| 1단계 | 1.5h | 엔진 뼈대 + 껍데기 | 아무것도 안 됨 |
| 2단계 | 1.5h | 미니게임 10형식 + `grader.js` | 시대가 밋밋해짐 |
| 3단계 | 1h | **변환 규칙 만들고 한 시대로 검증** | 12개를 손으로 옮기게 됨 |
| 4단계 | 1h | 나머지 11개 시대 변환 + 레지스트리 등록 | 시대가 3개뿐 |
| 5단계 | 3~5h | 시대별 전용 소품 채우기 | 지형이 휑함 |
| 6단계 | 2h | 지도 모드 (2D 지도) + 학습 항목 20개 신규 작성 | 반쪽짜리 |
| 7단계 | 1h | 인쇄(학습지·기록지) · 통합 · 검증 · 배포 | 심사장에서 터짐 |

### 12-2. 우선순위 컷라인

```
반드시     엔진 · 미니게임 10형식 · 탐험 12시대 전부 · 지도 모드 기본
되면       시대별 전용 소품 전부 · 학습지/기록지 인쇄 · 사진 68장
시간 남으면 GLB 3D 모델 · 누락 webp 14장 · 교사용 편집
```

**시대를 빼지 마세요.** 콘텐츠 이전은 규칙 하나로 12개가 한꺼번에 되므로, 모자라는
것은 언제나 "그 시대의 3D 소품"이지 "그 시대" 자체가 아닙니다. 이 순서로 줄이세요.

1. 시대별 전용 소품 → 공용 빌더로 대체 (지붕 높이만 §6-3대로 확인)
2. 사진·GLB → 없어도 화면이 성립합니다
3. 그래도 모자라면 **한 시대 안에서 퀘스트 개수를 줄입니다** (퀘스트는 서로 독립)
4. **정말 마지막에만** 시대를 `worlds-registry.js`에서 뺍니다

**빈 시대가 하나도 없는 편이 데모에서 훨씬 낫습니다.**

**소품에 힘을 줄 순서**: 삼국(영토 변화가 가장 잘 보임) · 조선 후기(생활사가 풍부) ·
6·25(미니게임이 가장 많음) → 고려 · 조선 전기 → 신석기 · 청동기 →
통일신라·발해 · 일제강점기 → 구석기 · 후삼국 · 개항기.
**심사에서 앞의 셋을 먼저 보여 주세요.**

### 12-3. 분업

| 담당 | 하는 일 | 주로 여는 곳 | 건드리는 파일 |
|---|---|---|---|
| **엔진 담당** | 엔진 전체 · 미니게임 10형식 · `grader` · **콘텐츠 변환 규칙** · `worlds-registry` 병합 | §4 §5 §6 §11 | `js/engine/*`, `js/eras/*`(변환분) |
| **소품 담당** | 시대별 전용 3D 소품 (시대를 나눠 맡음) | §6 §10 · `content/NN-*.md` | `js/eras/<자기 시대>.js` |
| **지도 담당** | 지도 모드 · 학습 항목 20개 신규 · 사진·에셋·인쇄 | §7 §9 | `js/map-*`, `js/atlas-*`, `js/report.js`, `assets/` |

두 명이면 지도 담당을 나머지 둘이 나눠 갖습니다.

```
Phase 0 (0:00~0:30)  뼈대 스캐폴딩 — 엔진 담당 혼자, 나머지는 에셋 확인
      │  ① 저장소 초기화 + 첫 커밋
      │  ② index.html 뼈대 — 인트로 + #app(지도) + #explore(탐험) DOM 전부, id 확정
      │  ③ css/styles.css :root 디자인 토큰
      │  ④ engine/state.js · constants.js · worlds-registry.js(빈 WORLDS={})
      │  ⑤ js/asset-credits.js 빈 배열
      ▼
Phase 1 (0:30~2:00)  엔진 — 엔진 담당
      │  player → scene-helpers → markers → minigames+grader → ui → boot
      │  ※ 최소 1개 시대(더미라도)를 등록해 한 바퀴 굴려 볼 것
      ▼
Phase 2 (2:00~종료 1h 전)  전원 병렬
      │  엔진 담당 : 변환 규칙 → content/*.md 12개 → js/eras/*.js → 전부 등록
      │  소품 담당 : 시대를 나눠 전용 3D 소품 (퀘스트는 이미 들어가 있음)
      │  지도 담당 : 지도 모드 + 항목 20개 + 사진 + 인쇄
      ▼
Phase 3 (마지막 1h)  통합/QA — 전원. 기능 추가 중단
```

**Phase 0이 끝나야 세 사람이 완전히 병렬로 갈 수 있습니다.**

### 12-4. 공유 파일 규칙

시대 파일은 서로 독립이라 충돌하지 않습니다. 문제는 이 셋입니다.

| 파일 | 규칙 |
|---|---|
| `worlds-registry.js` | **엔진 담당이 병합 전담.** 각자 등록하지 말고 마지막에 몰아서 |
| `index.html` · `css/styles.css` | Phase 0 이후 거의 건드릴 일 없어야 정상. 필요하면 **자기 모드 컨테이너(`#app`/`#explore`) 안쪽**과 자기 CSS 섹션에만 |
| `asset-credits.js` | **append-only.** 배열 끝에 자기 항목만 추가, 남의 항목 삭제 금지 |

작은 단위로 자주 커밋하고, **충돌이 났을 때만 상의**합니다. 남의 담당 파일을 고쳐야
하면 **말하고 고치세요.** 조용히 고치면 다음 병합에서 사라집니다.

### 12-5. 각자의 "끝났다"

**엔진** — 빈 월드에서 캐릭터가 걷고 시야가 돈다 / 마커를 눌러 카드가 열리고 완료된다 /
새로고침해도 완료 상태가 남는다 / 미니게임이 **성공·실패 양쪽 모두** 정상 종료된다 /
`collectContent`가 없는 항목에 영문 id를 노출하지 않는다 / 시대 둘 이상을 오갈 수 있다

**시대 하나** — `발견 0 / N`이 뜬다 / 지역이 여럿이면 **관문으로 오가고 돌아올 수 있다** /
퀘스트 하나를 완료해 역사 가방에 담긴다 / 마커가 겹쳐 못 누르는 곳이 없다 /
형식이 섞여 있다 / 지역별 퀘스트 수가 한쪽으로 몰리지 않는다

**지도 모드** — 지도가 한반도로 보인다 / 시대를 옮기면 영역·도읍이 바뀐다 /
항목 상세가 열리고 관련 항목으로 이어진다 / 분류 필터가 동작한다 /
도감이 채워지고 **탐험에서 깬 것도 반영된다** / 교사용에서 학습지가 인쇄된다 /
사진마다 저작자·라이선스가 보인다 / 라벨이 겹쳐 읽을 수 없는 곳이 없다

### 12-6. 배포

```
GitHub Pages → Settings → Pages → Branch: main / root
```

**배포 후 반드시 실제 URL에서 한 번 열어 보세요.** 로컬 Windows는 대소문자를 가리지
않지만 배포 서버는 가립니다. `vendor/`와 `assets/` 경로에서 자주 터집니다.

---

## 13. 함정 모음 (전부 실제로 당한 것)

### 13-1. 구문

| 함정 | 대응 |
|---|---|
| **배열 마지막 원소 뒤 쉼표 누락** (세 번 당함) | 추가 전에 **직전 줄 끝에 쉼표부터** 넣는다 |
| `q:{…}`로 끝나는 퀘스트의 닫는 중괄호 | **두 개**입니다 — `no:'…' } },` |

### 13-2. 진단

| 증상 | 원인 | 대응 |
|---|---|---|
| **고쳤는데 오류가 계속 보임** (가장 오래 헤맴) | 콘솔 기록이 남은 것 | **새 탭**에서 다시 판정 |
| 탐험 모드가 빈 화면 | `vendor/three` 경로 | importmap과 대소문자 확인 |
| `Unexpected token` | 배열 마지막 쉼표 | 추가 지점 직전 줄 |
| 마커가 절반만 보임 | 좌표가 두 파일에 나뉨 | 출처를 한 파일로 못박기 |
| 음영기복/영역이 사라짐 | `clipPath` 안의 `<g>` | **오류가 안 납니다.** 구조 바꾸기 |

### 13-3. 조작

| 증상 | 원인 | 절 |
|---|---|---|
| 한글 자판에서 WASD가 죽음 | `e.key`로 받음 | §6-1 |
| 옆으로 가면 화면이 빙글빙글 | 자동 추적 무제한 | §6-1 |
| 눌렀는데 빗나감 | `click`으로 판정 | §5-2 |
| 조이스틱 좌우 반전 | `joy.x` 부호 | §6-1 표 |
| 태블릿에서 못 움직임 | `#exJoy`가 계속 `aria-hidden` | §6-1 |
| 도착하자마자 나무 속 | 산포 제외 목록에 `spawn` 없음 | §6-5 |
| 걸어서 산을 통과 | 산 반지름 고정값 | §6-4 |
| 건물이 사람보다 작음 | 스케일 감각 | §6-3 |

### 13-4. 통합

- **받아온 코드를 그대로 복사하지 않습니다.** 다른 팀에서 받은 후삼국 코드는 모듈 분리
  이전 구조였습니다. 통째로 넣었다면 분리가 되돌아가고 다른 시대가 로드되지 않았을
  겁니다. **데이터는 그대로 두고 구조만 현재 규약에 맞춰 옮깁니다.**
- **중복 항목은 감추되 지우지 않습니다.** `DUP_MODE` 스위치 하나로 고릅니다(§7-7).
- **혼자 20분 이상 붙잡지 마세요.**

---

## 14. 검증 체크리스트

### 14-1. 시대를 마무리할 때

- [ ] 퀘스트·NPC·관문이 콘텐츠 문서 그대로 (**텍스트 한 글자도 안 바꿈**)
- [ ] `## 지역` 표의 `bg` `spawn` `bound` `loading`을 그대로 옮겼는지
- [ ] `worlds-registry.js`에 등록
- [ ] 브라우저에서 직접 플레이해 퀘스트 하나 완료까지 확인

### 14-2. 제출 전 (전부 실제로 걸린 것)

- [ ] **새 탭**에서 열어 콘솔 오류 0건
- [ ] 네트워크 탭에 **외부 도메인 요청 0건**
- [ ] **인터넷을 끊고** 지도·탐험 두 모드가 모두 뜨는지
- [ ] 한글 입력 상태로 바꾼 뒤 `WASD`로 걸어 보기
- [ ] `D`를 3초간 눌러 보기 — 제자리를 돌면 §6-1 위반
- [ ] 시대마다 도착 지점에 나무·집이 박혀 있지 않은지
- [ ] 바늘형 미니게임을 **직접** 눌러 보기 — 눈으로 맞았는데 빗나가면 §5-2
- [ ] 태블릿 크기(768px 안팎)에서 조이스틱이 보이고 좌우가 맞는지
- [ ] 모든 버튼이 태블릿에서 눌리는지 (44×44)
- [ ] 미니게임이 **성공·실패 양쪽** 모두 정상 종료
- [ ] `localStorage` 초기화(시크릿 창) 후 처음부터 한 번 완주
- [ ] 인트로 → 지도 → 탐험 → 지도 왕복 4개 지점(§4-4)을 실제로 클릭
- [ ] 사진 항목마다 저작자·라이선스가 표시되는지
- [ ] `asset-credits.js`에 실제로 쓴 에셋이 다 등록됐는지
- [ ] 학습지·기록지가 실제로 인쇄되는지 (한글 안 깨지는지)
- [ ] **빈 화면/미완성 시대가 없는지**
- [ ] 배포하고 **실제 URL에서 한 번 더** 열어 보기

---

## 15. 충돌 해소 대장

원본 문서들이 서로 다르게 말한 곳입니다. 전부 확정했습니다.

### 15-1. 결정이 필요했던 것 (12건)

| # | 무엇이 충돌했나 | 확정 |
|---|---|---|
| 1 | **사진 조달** — 파일 68장 동봉(README·12) vs `atlas-photos.js` base64 2.6MB(07·04) | **둘 다.** 파일 우선, `atlas-photos.js`는 폴백 계층 (§9-3) |
| 2 | **지도 데이터** — 동봉 `countries-50m.json`(1:50m) vs 문서가 전제한 1:10m·1,412점·하천·음영기복 | **동봉 50m로 하고 스펙을 낮춤.** 하천·음영기복 제외 (§7-2) |
| 3 | **미니게임 개수** — 8종+기본형(README·00·01·05) vs 9종(08) vs blank는 10번째(12·02). 컷라인도 "4종만 필수"(06) vs "전부"(08) | **10형식 전부 필수** (§5). 실측 결과 `blank`는 문서에 4회가 아니라 **16회** 나옴 |
| 4 | **`sidae-quest` 두 문서의 지위** — 다른 프로젝트(three r169, 2시대, 키보드 전용, PDF) / 구현 코드 64블록이 "코드 없음" 주장과 충돌 | **아틀라스 범위에 흡수** — 기록지 인쇄(§7-6)와 서술형 채점(§5-6)을 기능으로 편입. ⚠️ 코드 포함 파일이 꾸러미에 있다는 사실은 §16 참조 |
| 5 | **팀 역할** — A=엔진(00§7·06) vs A=지도 모드(00 말미) vs B=엔진(08 Phase) | **08-BUILD-ORDER Phase표 기준** (§12-3). 이름표 대신 역할명으로 기술 |
| 6 | **`contentId` 12개가 `CONTENT`에 없음** | **`CONTENT`에 20개 신규 작성** (후삼국 8 + 전쟁기 12) (§4-4) |
| 7 | **두 모드 시대 id 불일치** — `neo`/`three`/`unified`/`open` vs `neolithic`/`samguk`/`unified-silla`/`open-port` | **`ERA_ID_MAP` 하나를 두고 원문 id 유지** (§4-4) |
| 8 | **GLB 출처** — "전부 국가유산청 공공누리"(07·05) vs "Sketchfab, 라이선스 정보 없음"(README) | **미확인으로 표기.** 실사용 2점만 검증 후 표기 (§9-4) |
| 9 | **파기 순서** — "12시대 전부, 소품을 줄여라"(README·00·08) vs "3시대만 사수, 7시대 이상 먼저 버림"(06§5) | **12시대 전부, 소품만 줄임** (§12-2). 06§5는 폐기 |
| 10 | **후삼국 미니게임 0개** vs "0개인 시대가 없게 하라"(02§10·05 B3) | **1~2개 신규 추가** (§5-5) |
| 11 | **`cat` 개수** — 7종(01, `war` 포함) vs 6종(03·04, "늘리지 마세요") | **6종 확정.** 전투는 `cat:'event'` + `war:true` 플래그 (§4-6) |
| 12 | **07-ASSETS의 webp 14장이 실물에 없음** | **시작 후 다시 수집** (§9-3). 없어도 화면 성립 |

### 15-2. 문서 규칙·실물 대조로 자동 해소된 것

| 무엇 | 확정 근거 |
|---|---|
| `knap` 구간 26→11 %·1초(02) vs 20→8 %·0.75초(12) | **12-BUILD-RULES 우선** → 20→8 %, 0.75초 |
| `grind` 22→9 %(02) vs 16→7.5 %(12) | 〃 → 16→7.5 % |
| `lift`·기본형 상수 | 〃 → §5-3 표 |
| `stack`의 `visual` 필수(02·01§8) vs 없으면 자동 생성(12§3-3) | 〃 → **자동 생성.** 막집 기본값 금지 |
| 배경 산 반지름 37~44 vs `bound × 1.02` | 〃 → `bound × 1.02` |
| 카메라 자동 추적 무제한(05) vs 25° 제한(12§2-5) | 〃 → 25° 제한 + `fwd>0.1`일 때만 |
| 아바타 머리 높이 2.5(12·09) vs 2.48(03) | 실질 동일 → **≈2.5** |
| `js/eras/` 파일 10개(00 폴더 구조) vs 12개(01·05 A1) | 콘텐츠 문서 12개 실재 → **12개** |
| 지도 모드 시대 "15개"(04 말미) vs 나열 13개 | 실측 → **13개** |
| 학습 항목 228개(00·04§4-3) vs 146개 | 실측 → **146개** (+20 신규) |
| 사진 76장(README 표) vs 68장(README 본문) | 실측 → **68장** |
| 사진 붙는 항목 42개(12§5-3) vs 46장(README) | 실측 → **파일 46개 = 항목 41개** |
| 퀘스트 321개(08§1) vs 243개 | 실측 → **243개** (321은 관문·수집품 포함 옛 수치로 추정) |
| `09-3D-OBJECTS.md`의 제목이 `# 08 · …` | 오기 → **09**가 맞음 |
| NPC 좌표 `[x,z]`(01~03) vs `{x,z}`(04~12) | 01-ARCHITECTURE 계약 → **`{x,z}`로 통일** |
| `UNIT` 라벨 `'2단원 · 조선'`에 개항기 포함 | curriculum 2단원 = 조선 후기+개항 → **`'2단원 · 조선과 개항'`** |
| 등록 담당 A(06) vs B(08) / `index.html` C(06) vs B(00 말미) | 08 우선 → §12-4 |
| 에셋 출처 "전부 국가유산청"(05) vs 사진은 위키미디어(07§3·README) | 실물 `CREDITS.md` → **사진=위키미디어, GLB=미확인** |

### 15-3. 문서에 남기는 사실 (충돌은 아니나 알아 둘 것)

- **모드 이름은 「지도 모드」와 「탐험 모드」입니다 (2026-08-28 변경).**
  예전 이름은 「학습 모드」였고, 꾸러미 안의 모든 문서를 새 이름으로 고쳤습니다.
  다만 **파일명·DOM id 일부는 옛 이름을 그대로 둡니다** — 링크가 많아 바꾸면 얻는 것보다
  깨질 위험이 큽니다. 아래는 바뀌지 않았으니 그대로 쓰세요.
  `docs/04-LEARN-MODE.md` · `docs/10-LEARN-EXTRA.md` · `#app`(지도 모드 컨테이너) ·
  `js/map-*.js` · `js/atlas-*.js`. 반대로 버튼 id 는 `toLearnBtn` → **`toMapBtn`** 으로
  바꿨습니다(라벨도 `🗺️ 지도 모드`).
- **개항기의 3D 소품 명세 19개는 `09-3D-OBJECTS.md`가 아니라 `content/10-open-port.md`
  안에 있습니다.** 09는 10개 시대만 다룹니다.
- **후삼국은 시대 전용 소품이 하나도 없는 유일한 시대**입니다. 공용 빌더만으로 성립합니다.
- `curriculum.md` 1-1의 대상 시대에 **철기 문화**가 있으나 앱에 철기 시대는 없습니다.
  청동기·고조선 시대 안에서 다룹니다.
- 고려와 조선 전기에 **같은 퀘스트 id가 둘** 있습니다. `SAVE_KEY`가 시대마다 달라
  문제없이 동작합니다.
- `lesson3.md`의 신문·사료 인용문은 **저작권 때문에 요약·재구성**된 것입니다. 원문
  그대로 옮기지 마세요.

---

## 16. 남은 과제와 위험

### 16-1. 정직하게 남는 한계

- **영역 경계는 근사치입니다.** 해안선은 실측이지만 시대별 국경은 교과서를 참고해 그린
  것입니다. **역사 전공 교사의 검수가 필요합니다.**
- **고조선 경계는 학계 미확정**이라 점선입니다. 결함이 아니라 **"학자마다 다르게 본다"를
  가르칠 수 있는 지점**입니다.
- **사진이 없는 항목이 많습니다** (146개 중 105개). 빈 액자를 보여 주지 말고 칸 자체를
  생략합니다.
- **일부 항목이 중복**됩니다(46쌍). `DUP_MODE` 스위치로 고릅니다.
- **에셋의 역사적 부정확성** — 저폴리는 상징적 표현입니다. 이 점을 도움말·기록지 하단에
  밝힙니다.

### 16-2. 위험과 대응

| 위험 | 대응 |
|---|---|
| 심사장 네트워크 차단 | `vendor/` 동봉 완료. **인터넷 끊고 리허설**(§14-2) |
| 학교 PC 사양 부족 | 저사양 모드, WebGL 미지원 안내 (§6-2) |
| GLB·저폴리 키트 라이선스 미확인 | 확인 전에는 기본 도형 폴백으로 배포 (§9-4·§9-5) |
| 서술형 키워드 오판 | 키워드 그룹 확장 + 2회 실패 시 통과 + 답 전문을 교사에게 (§5-6) |
| 시간 부족 | 시대를 빼지 말고 **소품부터** 줄임 (§12-2) |
| ⚠️ **꾸러미의 `2026-08-27-sidae-quest.md`에 Python·JS 구현 코드 64블록이 들어 있음** | README는 "코드 없음(선행 개발 금지)"이라고 적었습니다. **대회 주최 측 규칙을 확인해 제출 전 이 파일의 포함 여부를 결정하세요.** 기능(기록지·채점기)은 §5-6·§7-6에 규칙으로 옮겨 두었으므로 파일 자체는 빼도 됩니다 |

### 16-3. 출처

- 지도 — Natural Earth 1:50m (퍼블릭 도메인)
- 사진 — 위키미디어 공용 (CC BY-SA / CC BY / CC0 / 공공누리 1유형 / 퍼블릭 도메인)
- 3D 모델 — **출처 미확인.** 사용 전 확인 필요
- 글꼴 — Pretendard, 길형진 (SIL OFL 1.1)
- 3D 엔진 — three.js 0.160.0 (MIT)
- 내용 — 초등학교 5학년 2학기 사회 교과서 및 2022 개정 교육과정 문서
