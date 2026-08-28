# 01 · 엔진 구조와 데이터 스키마

> **이 문서가 계약서입니다.** 여기 적힌 필드 이름 그대로 만들어야
> `docs/content/*.md`의 퀘스트 243개를 손대지 않고 쓸 수 있습니다.
> 이름을 하나라도 바꾸면 콘텐츠 문서를 전부 고쳐야 합니다.

---

## 1. 파일 구조

```
index.html            지도·탐험 두 모드의 껍데기, importmap

js/engine/            엔진 — 모든 시대가 공유. 시대를 추가해도 고치지 않는다
  state.js              ST, questState, bag, 저장/불러오기
  constants.js
  scene-helpers.js      지형·건물 빌더 (시대 파일이 쓰는 어휘)
  player.js             이동, 카메라, 조이스틱
  markers.js            3D 마커, 미니맵
  minigames.js          미니게임 10형식 (8종 + 기본형 + `blank`)
  grader.js             답안 채점 — 순수 함수, 의존성 0
  ui.js                 퀘스트 카드, 대화, 조사형, 완료 처리
  boot.js               부팅, 시대 전환, 타임라인
  worlds-registry.js    모든 시대를 모아 세 테이블 구성

js/eras/<시대>.js      시대별 콘텐츠 — 서로 독립. 12개
js/map-data.js         지도 모드 데이터 (ERAS, CONTENT, MAP, px/py)
js/map-app.js          지도 모드 렌더링
js/atlas-*.js          지도 모드 얹기 (04-LEARN-MODE.md 참조)
vendor/                three.js, 폰트 (07-ASSETS.md)
```

### 의존 관계

엔진 모듈은 **서로를 참조하는 순환 구조**입니다. ES 모듈이 처리해 주지만, 쪼개서 만들면 어긋납니다. **한 벌로 설계하세요.**

```
boot ──→ worlds-registry ──→ eras/*
  └──→ ui ⇄ state
       ui ⇄ minigames
       ui ⇄ markers ⇄ scene-helpers
       ui ⇄ player
```

`worlds-registry`만 `eras/*`를 알고, **`eras/*`는 엔진의 `scene-helpers`와 `state`만 압니다.** 이 방향을 지켜야 시대를 독립적으로 만들 수 있습니다.

---

## 2. 퀘스트 스키마

퀘스트는 `kind`로 여섯 갈래입니다. **모든 종류가 공통으로** 갖는 것:

| 필드 | 필수 | 설명 |
|---|---|---|
| `id` | ○ | 시대 안에서 고유. 저장의 열쇠 |
| `title` | ○ | 화면에 보이는 이름 |
| `icon` | ○ | 이모지 하나. 마커와 목록에 쓰임 |
| `cat` | ○ | **6종만**: `relic` `person` `culture` `event` `exchange` `life` (전투는 `event` + `war:true` 플래그 — `war` 는 `cat` 값이 아닙니다). **콘텐츠 문서에는 적혀 있지 않습니다** — `contentId` 로 지도 모드 항목을 찾아 그 분류를 씁니다 ([12-BUILD-RULES.md](12-BUILD-RULES.md) §1) |
| `pos` | ○ | `{x, z}` — 3D 월드 좌표. y는 없음 |
| `area` | △ | 여러 지역이 있는 시대에서 필수. 단일 지역이면 생략 |
| `contentId` | ✕ | 지도 모드 항목 id. 완료 시 역사 가방에 담김 |

> **`contentId`는 반드시 실재하는 `CONTENT` 항목이어야 합니다.**
> 없는 id를 쓰면 화면에 영문 id가 그대로 노출됩니다.

### 2-1. 역할 선택 (`kind` 없음)

가장 많이 쓰는 형식입니다. 인물이 되어 판단하고, **정답이 있습니다.**

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

### 2-2. 열린 선택 (`kind:'choice'`)

**정답이 없습니다.** 선택마다 다른 결과가 나오고, 실제로 무슨 일이 있었는지는 `epilogue`에서 사실로 짚습니다.

```js
{ id:'danbal-choice', kind:'choice', cat:'life', icon:'✂️',
  title:'상투를 자르라는 명', area:'hanseong', pos:{x:-12,z:-6},
  contentId:'danballyeong',
  setup:'당신은 종로에서 잡화를 파는 장사꾼이다. …',
  prompt:'지금 당신은 어떻게 하겠는가?',
  choices:[
    { label:'명을 따라 상투를 자르고 장사를 계속하자',
      outcome:'거울 속 낯선 얼굴이 한동안 어색하다. …' },
    { label:'상투만은 지키겠다. 장사를 쉬더라도 버텨 보자',
      outcome:'며칠 문을 닫으니 살림이 빠듯하다. …' }
  ],
  epilogue:'단발령에 대한 반발은 매우 컸어요. …' }
```

`choices`가 **문자열 배열이 아니라 `{label, outcome}` 객체 배열**입니다. 2-1과 다릅니다.

선택지는 **3개**가 적당합니다. 어느 것도 틀리지 않아야 합니다.

### 2-3. 조사형 (`kind:'inspect'`)

자료를 눌러 읽고, 다 보면 마무리 문제가 열립니다.

```js
{ id:'ondol-inspect', kind:'inspect', cat:'relic', icon:'♨️',
  title:'온돌이 깔린 궁궐터', area:'balhae', pos:{x:14,z:-16},
  img:['balhae-ondol.webp'],        // 선택. 사진 파일명 배열
  hotspots:[
    { label:'궁궐 바닥 아래의 고랑', note:'상경성 궁궐터를 파 보니 …' },
    { label:'고구려에서 이어진 것',   note:'온돌은 고구려 사람들이 …' }
  ],
  capstone:{                         // 선택. 없으면 핫스팟을 다 보는 것으로 완료
    text:'무엇을 보여 주는 증거일까요?',
    choices:['…','…','…','…'],
    correct:1,
    ok:'맞아요. …',
    no:'다시 살펴보세요.' } }
```

**핫스팟은 4개**가 적당합니다. `note`는 `<b>` 태그를 쓸 수 있습니다.

### 2-4. 미니게임 (`kind:'minigame'`)

**선택형 문제가 먼저** 옵니다. 맞혀야 조작 화면으로 넘어갑니다.

```js
{ id:'bongdon-ember', cat:'event', icon:'🔥', title:'봉돈에 불을 올리다',
  area:'hwaseong', pos:{x:22,z:16}, kind:'minigame',
  story:'당신은 화성 동쪽 봉돈을 지키는 군사다. …',
  q:{ text:'…', choices:[…], correct:1, ok:'…', no:'…' },
  mini:{ type:'ember', tag:'봉돈 · 밤새 불씨 지키기',
         startLabel:'봉돈으로 올라가기 →',
         intro:'바람이 불 때마다 …',
         ok:'밤새 첫 화두의 불이 꺼지지 않았다. …',
         retry:'불씨가 사그라들었다. …' } }
```

`mini`의 종류별 필드는 [02-MINIGAMES.md](02-MINIGAMES.md)를 보세요.

### 2-5. 관문 (`kind:'gate'`)

지역을 잇습니다. **`GATES_*` 배열에 따로 정의하고 퀘스트 배열에 합칩니다.**

```js
export const GATES_JOSEONL = [
  { id:'gate-han-namhae', area:'hanyang', pos:{x:-38,z:-24}, icon:'🚩',
    title:'남쪽 바다로', to:'namhae',
    confirm:'한산도 앞바다로 향할까요?' }
];

export const QUESTS_JOSEONL = [
  ...QUESTS_JOSEONL_BASE,
  ...GATES_JOSEONL.map(g => ({
    id:g.id, kind:'gate', cat:'event', icon:g.icon,
    title:g.title, area:g.area, pos:g.pos, to:g.to, confirm:g.confirm
  }))
];
```

**관문은 완료 수에 세지 않습니다** (`foundCount()`가 `kind!=='gate'`로 거릅니다).

지역마다 **돌아오는 관문**을 반드시 두세요. 편도만 있으면 갇힙니다.

### 2-6. 수집품 (`kind:'find'`)

한 과제에 여러 개가 흩어져 있고, 다 모으면 완료됩니다.

```js
export const FINDS_JOSEONL = [
  { id:'task-1', area:'hanyang', contentId:'…', doneMsg:'다 모았어요!',
    items:[ { id:'find-a', icon:'📜', label:'…', pos:{x:4,z:8} }, … ] }
];
```

퀘스트 배열에 합칠 때 `taskId`, `siblingIds`, `doneMsg`가 붙습니다.

### 2-7. 여러 단계 전투 (`stages`)

`war:true`인 퀘스트는 `stages`로 여러 판을 이어 붙일 수 있습니다.

```js
war:true, warTag:'…', warMidLabel:'…', warNextLabel:'…', warDoneLabel:'…',
recap:'…',                          // 다시 방문했을 때 보여 줄 요약
stages:[ { story:'…', q:{…} }, { story:'…', q:{…} } ]
```

---

## 3. 시대 파일이 내보내는 것

```js
export const AREAS_<시대>          // 지역 정의
export const GATES_<시대>          // 관문
export const QUESTS_<시대>         // 퀘스트 (관문 합친 최종본)
export const NPCS_<시대>           // 길에서 만나는 사람들
export function build<시대><지역>() // 지역별 3D 지형
export const AREA_BUILDERS_<시대>  // 지역 이름 → 빌더
```

### 지역

```js
export const AREAS_JOSEONL = {
  hanyang: { name:'한양', spawn:{x:0,z:16}, bg:'#E4E1CB', bound:56,
             loading:'한양으로 이동하는 중…' }
};
```

| 필드 | 설명 |
|---|---|
| `name` | 화면에 보이는 이름 |
| `spawn` | 도착 위치 `{x, z}`. **어느 마커와도 6 이상** 떨어뜨립니다 |
| `bg` | 하늘·배경색. 시대의 인상을 좌우합니다 |
| `bound` | 돌아다닐 수 있는 반경 (36~72). 그 지역 가장 먼 마커 거리 + 8 |
| `loading` | 전환 중 문구 |

> **네 값을 직접 정하지 마세요.** 시대마다 계산해서 각 콘텐츠 문서 `## 지역` 절의
> 표에 적어 두었습니다 (`docs/content/NN-시대.md`). 그대로 옮기면 됩니다.

### NPC

```js
export const NPCS_JOSEONL = [
  { area:'hanyang', pos:{x:-16,z:4}, color:'#8C6A4A', icon:'🏮',
    lines:['첫 번째 대사', '두 번째 대사', '세 번째 대사'] }
];
```

말을 걸 때마다 `lines`를 순서대로 보여 줍니다. **지역당 3~5명**이 적당합니다.

### 지형 빌더

`scene-helpers.js`의 어휘만 씁니다. **직접 `THREE` 지오메트리를 만들지 마세요.** 시대마다 스타일이 어긋납니다.

```
buildGround  buildWater  buildMountains  buildMountainsWide
makeTree  buildTrees  scatterTreesArea
jRoofHanok  buildStrawHouse  buildTileHouse  scatterHouses
brickBuilding  timberGate  buildFortressWall
buildTombMound  buildStonePagoda  buildTrainingGround
buildPier  buildShipHull
makeNPC  iconTexture  textSprite
```

시대에만 필요한 것(전차, 증기선, 개마무사 등)은 **그 시대 파일 안에서** 만들어 export 하세요. 엔진에 넣지 않습니다.

### 빌더 레퍼런스

**좌표 단위는 캐릭터 키 ≈ 2 입니다.** ([03-DESIGN-SYSTEM.md](03-DESIGN-SYSTEM.md) 4장)
`x`는 좌우, `z`는 앞뒤. `y`는 인자에 없습니다 — 전부 바닥에 놓입니다.

#### 바탕

| 함수 | 설명 |
|---|---|
| `buildGround()` | 바닥판. **모든 지역에서 가장 먼저** 부릅니다 |
| `buildWater()` | 물. 강·바다가 있는 지역에서 |
| `buildMountains()` | 배경 산. 대부분의 지역에서 |
| `buildMountainsWide()` | 더 넓게 퍼진 산. 벌판 느낌이 필요할 때 |

#### 건물

| 함수 | 인자 설명 |
|---|---|
| `jRoofHanok(x, z, w, d, h, bodyColor, roofColor)` | 폭·깊이·높이. 궁궐은 `w≈5, h≈3`, 민가는 `w≈3, h≈2` |
| `buildStrawHouse(x, z, scale, rotY)` | 배율, 회전(라디안) |
| `buildTileHouse(x, z, scale, rotY)` | 배율, 회전 |
| `brickBuilding(x, z, w, d, h)` | 벽돌 건물. 개항기·일제강점기용 |

#### 구조물

| 함수 | 인자 설명 |
|---|---|
| `timberGate(x, z, spread, color)` | `spread`는 기둥 사이 **절반** 거리. 4.6이면 폭 9.2 |
| `buildFortressWall(x, z, len, axis, color)` | `axis`는 `'x'` 또는 `'z'`. 두께 2.2, 높이 3.4 고정 |
| `buildStonePagoda(x, z)` | 5층 석탑. 크기 고정. **두 개를 나란히 두면 쌍탑** |
| `buildTombMound(x, z, r, color)` | `r`은 반지름. 3~4가 적당 |
| `buildTrainingGround(x, z)` | 연무장 (과녁·기둥) |
| `buildPier(x, z, len)` | 나무 부두 |
| `buildShipHull(x, z)` | 배 선체 |

#### 흩뿌리기

| 함수 | 인자 설명 |
|---|---|
| `scatterTreesArea(n, xr, zr, exclude)` | 개수, `[최소,최대]` 범위 둘, 중심 제외 반경 |
| `scatterHouses(n, xr, zr, exclude, opts)` | 위와 같고 `opts` 추가 |

```js
opts = { strawRatio: 0.6,               // 초가 비율. 기본 0.55
         avoid: [[0,-6], [12,-2]] }     // 이 좌표 근처에는 짓지 않음
```

> **`avoid`에 그 지역에 이미 놓은 건물 좌표를 전부 넣으세요.**
> 빠뜨리면 민가가 궁궐을 뚫고 들어갑니다.

#### 기타

| 함수 | 인자 설명 |
|---|---|
| `makeNPC(color, icon)` | 옷 색, 이모지. 위치는 반환값에 직접 설정 |
| `makeTree(s)` | 배율 |
| `iconTexture(emoji)` | 마커용 텍스처 |
| `textSprite(text, scale=0.012)` | 3D 공간의 글자 |

### 지역 빌더 짜는 순서

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

### NPC 배치

```js
export function buildNPCsLater(){
  NPCS_LATER.filter(n => n.area === ST.currentArea).forEach(n => {
    const g = makeNPC(n.color, n.icon);
    g.position.set(n.pos.x, 0, n.pos.z);
    g.userData.npcLines = n.lines;
    ST.scene.add(g);
    ST.npcGroups.push(g);
  });
}
```

시대마다 이 함수 하나를 두고, 각 지역 빌더 끝에서 부릅니다. `ST.currentArea`로 걸러 **그 지역 사람만** 나옵니다.

---

## 4. 레지스트리

새 시대는 여기에만 손댑니다.

```js
import { AREAS_LATER, AREA_BUILDERS_LATER, QUESTS_LATER, buildLaterCheorwon }
  from '../eras/later.js';

export const AREAS_BY_WORLD = { …, later:AREAS_LATER };
export const AREA_BUILDERS_BY_WORLD = { …, later:AREA_BUILDERS_LATER };

export const WORLDS = {
  later:{ mode:'3d', name:'후삼국', quests:QUESTS_LATER,
          saveKey:'laterExplore_v1',
          bg:AREAS_LATER.cheorwon.bg,
          spawn:AREAS_LATER.cheorwon.spawn,
          bound:AREAS_LATER.cheorwon.bound,
          brand:'🚩 후삼국 탐험',
          startArea:'cheorwon',
          build:()=>buildLaterCheorwon(),
          loading:AREAS_LATER.cheorwon.loading,
          eyebrow:'후삼국 · 892 ~ 936',
          title:'다시 셋으로 갈라진 시대에 선 이여',
          hint:'WASD / 방향키로 이동 · …',
          body:'그대는 시간의 틈에 휩쓸려 …',
          complete:{ title:'후삼국 탈출 성공!', body:'…' } }
};
```

| 필드 | 필수 | 설명 |
|---|---|---|
| `mode` | ○ | `'3d'` |
| `name` | ○ | 타임라인에 보이는 이름 |
| `quests` | ○ | 퀘스트 배열 |
| `saveKey` | ○ | **시대마다 고유해야 합니다.** 진행 저장의 열쇠 |
| `bg` `spawn` `bound` | ○ | 시작 지역 값을 그대로 참조 |
| `brand` | ○ | 좌상단 배지 |
| `startArea` | △ | 여러 지역일 때 |
| `build` | ○ | 시작 지역 빌더 |
| `eyebrow` `title` `body` `hint` | ○ | 진입 화면 |
| `complete` | ✕ | 완료 팝업. 없으면 기본 문구 |

> **`WORLDS`의 첫 항목이 기본값입니다.** 저장된 시대가 없을 때 여기로 들어갑니다. 새 시대를 맨 앞에 넣지 마세요.

---

## 5. 상태와 저장

### `ST` — 런타임 상태 한 덩어리

```js
export const ST = {
  QUESTS: [], SAVE_KEY: '…', BOUND: 32,
  scene, camera, renderer,
  markerGroups: [], npcGroups: [],
  player, rig, leftLeg, rightLeg, leftArm, rightArm,
  activeMarker: null, questOpen: false, moving: false,
  camYaw: Math.PI, camZoom: 1, camPitchOffset: 0,
  orbitId: null, pinchDist: null,
  jumpY: 0, jumpVY: 0,
  spawnPos: {x:0,z:10},
  currentWorld: null, currentMode: '3d', currentArea: null,
  npcDialogueFor: null, npcLineIdx: 0,
  inspecting: null, inspectSeen: new Set(), inspectPhotoIdx: 0,
  envTexture: null, activeNear: null,
};
```

시대 파일은 `ST.currentArea`, `ST.scene`, `ST.npcGroups` 정도만 씁니다.

### 저장

```js
localStorage[ST.SAVE_KEY]      = JSON.stringify({ questState })  // 시대별
localStorage['historyBagExplore_v1'] = JSON.stringify([...bag])  // 시대 공통
```

`questState`는 `{ 퀘스트id: 'done' }` 입니다.

> **시대마다 `SAVE_KEY`가 다르므로 퀘스트 id가 겹쳐도 서로 간섭하지 않습니다.**
> 실제로 고려와 조선 전기에 같은 id가 둘 있는데 문제없이 동작합니다.

### 역사 가방

```js
collectContent(id) {
  if (!id || bag.has(id)) return;
  const c = CONTENT.find(x => x.id === id);
  if (!c) return;                 // ← 없는 항목이면 아무것도 하지 않는다
  bag.add(id); saveBag();
  showToast(`🎒 "${c.t}"을(를) 역사 가방에 담았어요`);
}
```

**`if (!c) return;`을 빠뜨리지 마세요.** 없으면 아이 화면에 영문 id가 그대로 나옵니다.

### 완료 수

```js
foundCount() = QUESTS.filter(q => q.kind !== 'gate' && questState[q.id] === 'done').length
```

화면의 `발견 3 / 29`가 이것입니다. 관문은 빠집니다.

---

## 6. 지도 모드와의 연결

두 모드를 잇는 것은 **`contentId` 하나뿐**입니다.

```
탐험 퀘스트 --contentId--> 지도 모드 CONTENT 항목 --> 역사 가방 / 도감
```

지도 모드 항목의 최소 형태입니다. 자세한 것은 [04-LEARN-MODE.md](04-LEARN-MODE.md).

```js
{ id:'moneagi', era:'joseon_l', cat:['event'], t:'모내기법',
  at:[35.82, 127.15],              // [위도, 경도] — 이 순서를 지킬 것
  d:'한 줄 설명',
  b:['본문 문단1', '본문 문단2'],
  tags:['…'], rel:['다른 항목 id'] }
```

**시대 id가 두 모드에서 다릅니다.** 지도 모드는 `neo` `three` `unified` `open`, 탐험은 `neolithic` `samguk` `unified-silla` `open-port` 입니다.
**양쪽 원문 id를 그대로 두고 `ERA_ID_MAP` 하나로 잇습니다** — 어느 쪽도 고치지 마세요. 고치면 `CONTENT` 146개와 콘텐츠 문서 12개를 전부 손봐야 합니다 ([MASTER.md](../MASTER.md) §4-4).

---

## 7. 이동·카메라·입력

이 절의 내용은 [**12-BUILD-RULES.md §2**](12-BUILD-RULES.md) 에 있습니다 —
아바타 크기, 입력 부호표, `e.code` 로 키를 받아야 하는 이유(한글 자판), 카메라 축 수식,
자동 추적의 25° 제한, 조이스틱을 띄우는 조건. **다른 문서가 "§01 7절"이라고 가리키는 것이 그 내용입니다.**

---

## 8. 반드시 지킬 것

- 새 시대를 위해 **엔진 파일을 고치지 않는다**
- 퀘스트 좌표는 서로 **4단위 이상** 띄운다 (겹치면 누를 수 없음)
- 지역별 퀘스트 수가 **가장 많은 곳 ≤ 가장 적은 곳 × 2**
- 배열 마지막 원소 뒤 **쉼표**를 빠뜨리지 않는다
- `q:{…}`로 끝나는 퀘스트는 닫는 중괄호가 **두 개** (`} },`)
- 좌표는 **`[위도, 경도]`** 순서 (지도 모드)
- `stack` 의 `visual` 은 **선택**이다. 콘텐츠 문서에 하나도 없으므로 단계 수에 맞춘 도형을 자동으로 그린다 — **막집 기본값 금지** ([12-BUILD-RULES.md](12-BUILD-RULES.md) §3-3)
- 타이밍 미니게임은 `click` 이 아니라 `pointerdown` 으로 판정한다 (§3)

---

## index.html DOM 뼈대 (탐험 모드)

> 팀원 수연 님이 정리한 내용입니다.

## 1. index.html 뼈대 — 탐험 모드에 필요한 DOM

`<div id="explore" aria-hidden="true">` 안에 다음 요소들이 **정확히 이 id로** 있어야 엔진 코드가 그대로 동작합니다 (엔진이 `document.getElementById`로 직접 참조하기 때문).

```html
<div id="explore" aria-hidden="true">
  <canvas id="exCanvas"></canvas>                         <!-- Three.js 렌더 타깃 -->

  <div id="exLoading"><div class="ex-spin"></div><p id="exLoadingMsg"></p></div>  <!-- 시대/지역 전환 로딩 -->

  <div id="exIntroStory" class="ex-story-wrap">             <!-- 시대 진입 시 1회 스토리 인트로 -->
    <div class="ex-story-card">
      <p class="ex-story-eyebrow" id="exStoryEyebrow"></p>
      <h2 class="ex-story-title" id="exStoryTitle"></h2>
      <p class="ex-story-body" id="exStoryBody"></p>
      <p class="ex-story-hint" id="exStoryHint"></p>
      <button class="intro-btn" id="exStoryGo">모험을 시작한다</button>
    </div>
  </div>

  <div class="ex-top">                                       <!-- 상단 바 -->
    <div class="brand" id="exBrand"></div>
    <div class="spacer"></div>
    <button class="found" id="bagBtn">🎒 역사 가방</button>
    <div class="found">발견 <b id="exFoundN">0</b> / <span id="exFoundT">0</span></div>
    <button class="found" id="toMapBtn">🗺️ 지도 모드</button>   <!-- 지도모드로 전환 -->
  </div>

  <div id="exHint"></div>              <!-- 하단 토스트 힌트 -->
  <div id="npcBubble"></div>           <!-- NPC 대화 말풍선(3D 좌표→2D 투영으로 위치 계산) -->
  <div id="inspectPanel"></div>        <!-- 조사(inspect) 패널 -->

  <button type="button" id="exMinimap" aria-label="한반도 지도에서 이 위치 보기">
    <svg id="exMiniRadar" viewBox="0 0 128 128"></svg>
    <span id="exMiniLabel"></span>
  </button>
  <div id="exMiniScrim"></div>
  <div id="exMiniModal" role="dialog"><div class="exmini-card" id="exMiniCard"></div></div>

  <div id="exQuestRail">                <!-- 임무 목록 사이드 레일 -->
    <button type="button" id="exRailToggle">‹</button>
    <div class="rail-panel">
      <div class="rail-head">임무 목록</div>
      <div id="exRailList"></div>
    </div>
  </div>

  <div id="exScrim2"></div>
  <div id="bagSheet" class="ex-list">
    <div class="ex-list-head"><span>🎒 역사 가방</span><button class="sheet-x" id="bagX">…</button></div>
    <div id="bagBody"></div>
  </div>

  <div id="exJoy" aria-hidden="true"><div id="exJoyKnob"></div></div>   <!-- 터치 조이스틱: 손가락 기기에서 aria-hidden="false" 로 바꿔야 보입니다 (12-BUILD-RULES §2-6) -->
  <button id="exInteract">🔍<span>조사하기</span></button>              <!-- 상호작용 버튼 -->

  <div id="exScrim"></div>
  <div id="questModal" role="dialog"><div class="quest-card" id="questCard"></div></div>
  <div id="eventSheet" role="dialog"><div class="event-card" id="eventCard"></div></div>

  <div id="eraCompleteScrim"></div>
  <div id="eraCompleteModal" role="dialog">
    <div class="era-complete-card" id="eraCompleteCard">
      <img class="ecc-img" id="eccImg" alt="">
      <div class="ecc-burst" aria-hidden="true"></div>
      <div class="ecc-medal">🏅</div>
      <p class="ecc-eyebrow" id="eccEyebrow"></p>
      <h2 class="ecc-title" id="eccTitle"></h2>
      <p class="ecc-body" id="eccBody"></p>
      <button class="intro-btn" id="eccClose">탐험 계속하기</button>
    </div>
  </div>

  <nav id="exTimeline"><div id="exTrack"></div></nav>   <!-- 하단 시대 타임라인 트랙 -->
</div>
```

인트로 화면(모드 선택)에는 `#startExploreBtn`(탐험 모드 시작), 지도 모드 쪽에는 `#toExploreBtn`이 있어 탐험 모드로 진입합니다. 진입 시 `window.startExploreMode(eraId)` 전역 함수를 호출하는 계약입니다(지도 모드 쪽 `map-app.js`가 이 함수를 호출).

