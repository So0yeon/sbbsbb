# 史뿐史뿐 <sub>사뿐사뿐</sub>

**시간이 쌓이는 지도** — 초등학교 5학년 2학기 사회(역사) 학습 도구

> 아이가 "그때 그곳"을 지도 위에서 그릴 수 있게 한다.
> 교사가 자기 수업에 맞게 고쳐 쓸 수 있게 한다.

---

## 무엇인가

하나의 웹 앱에 두 모드가 들어 있습니다. 두 모드를 잇는 것은 `contentId` 하나입니다 —
탐험에서 임무를 마치면 지도 모드의 도감이 채워집니다.

| | 🗺️ 지도 모드 | 🧭 탐험 모드 |
|---|---|---|
| 화면 | 2D SVG 지도 | 3D 저폴리 월드 |
| 하는 일 | 시대를 옮겨 다니며 영토 변화와 유물을 봅니다 | 길잡이 **두루**와 함께 그 시대를 걸으며 선택을 겪습니다 |
| 문체 | `~해요체` (찾아볼 때는 쉬운 말) | **사극체 · 하오체** (놀 때는 사극) |
| 시대 | 13개 | 12개 |

## 규모

| 항목 | 수 |
|---|---|
| 탐험 시대 / 지역 | 12개 / 46곳 |
| 임무 | **243개** (관문 70개 별도) |
| 길에서 만나는 사람 | 154명 |
| 미니게임 | **20형식** |
| 학습 항목 | 166개 (원본 146 + 새로 쓴 20) |
| 유물 아이템 | 127개 |
| 사진이 붙은 임무 | **94개** |
| 사진 | 113장 (전부 저작자·라이선스 표시) |
| 해안선 | 실측 530점 (Natural Earth 1:50m) |
| 외부 통신 | **0건** |

## 지켜야 할 넷

| 제약 | 왜 |
|---|---|
| **서버 없음** | 학생 개인정보가 나갈 통로 자체를 만들지 않습니다. 저장은 `localStorage`뿐 |
| **인터넷이 끊겨도 동작** | 학교·심사장 네트워크를 믿을 수 없습니다. three.js·글꼴을 `vendor/`에 동봉 |
| **설치·가입 없이 링크 하나로** | 정적 파일. GitHub Pages 배포 |
| **종이로도 쓸 수 있게** | 태블릿 없는 교실이 많습니다. 학습지·기록지·수첩 인쇄 |

---

## 이 프로젝트에만 있는 것

### 🐾 발자국 등급 — 경쟁이 아니라 성취
누적 발견 수만 봅니다. **다른 학생과 비교하는 수치는 어디에도 없습니다.**

```
🐾 설레는 첫걸음 → 🧭 궁금한 길잡이 → 🎒 씩씩한 탐험가 → ⏳ 슬기로운 시간여행자 → 📖 든든한 역사지기
```

### 🧭 탐험가 유형
행동 여섯 축(👀관찰 · 🎮도전 · 💬이야기 · 🏺수집 · 🗺️탐사 · ✍️기록)을 세어
**"차근차근 살펴보는 수집가"** 처럼 이름을 지어 줍니다. 표본이 적으면 확정하지 않습니다.

### 🏺 유물 가방 · 📔 스탬프 수첩
시작할 때 두루가 둘 다 받습니다. 임무를 마치면 그 시대의 도구·유물이 가방에 들어오고,
고을에 발을 디딜 때·다 둘러볼 때·시대를 마칠 때마다 수첩에 도장이 찍힙니다(총 104칸).

### 🕊️ 두루
시간의 틈을 넘나드는 어린 두루미. 머리의 붉은 깃털이 앞뒤를 알려 줍니다.
숨쉬기·걷기·점프에 더해 **정답에 만세 · 오답에 갸웃 · 도장 찍기 · 관문에서 손 흔들기** 를 합니다.
추가 에셋 없이 전부 절차적 애니메이션입니다.

### 🎮 미니게임 20형식
```
aim  spin  knap  ember  stack  grind  lift  sort  memory  blank
dig  trace  weigh  route  order  spot  rhythm  steer  cipher  pour
```
전부 클릭/탭 기반이고, **실패가 막다른 길이 아닙니다.**
판정은 `pointerdown` + 2프레임 지연 보정 — "제대로 눌렀는데 빗나감"을 없앴습니다.

### 📷 사진 관찰 임무
> 📷 빗살무늬 토기 → 「뾰족한 밑바닥」 → **"이 토기는 도무지 세울 수가 없소. 어찌하여 밑을 이리 뾰족하게 만들었겠소?"**

### 🔒 개인정보
서버가 없고 이름은 선택 항목입니다. 첫 실행 시 한 번 고지하고, 언제든 **설정 → 내 기록 모두 지우기**로 즉시 지웁니다.
방침 전문은 [`privacy.html`](privacy.html) 에 있습니다 (표준말 — 고지는 명확해야 하므로 사극체를 쓰지 않습니다).

---

## 돌려 보기

```bash
python -m http.server 8765        # 정적 파일이면 무엇이든 됩니다
# http://127.0.0.1:8765/index.html
```

빌드 도구가 없습니다. `index.html` 을 그대로 열어도 되지만, ES 모듈 때문에
`file://` 대신 아무 정적 서버나 하나 띄우는 편이 확실합니다.

## 폴더

```
index.html            앱 셸 (인트로 + 지도 모드 + 탐험 모드)
privacy.html          개인정보 처리방침 (단독 · 인쇄 가능)
css/styles.css

js/
  store.js            두 모드 공용 저장소 · 발자국 등급 · 탐험가 유형   (전역)
  privacy-text.js     방침 본문                                        (전역)
  atlas-geo.js        실측 해안선 · 제주                                (전역)
  map-data.js         ERAS · CONTENT (자동 생성)                        (전역)
  atlas-content.js    학습 항목 20개 보강                               (전역)
  atlas-photos.js  asset-credits.js  atlas-dedupe.js  map-app.js  report.js  shell.js
  explore-app.js      탐험 모드 진입점                                  (ES 모듈)
  engine/             state constants boot player anim scene-helpers props
                      markers grader minigames ui collect worlds-registry
  eras/               12개 시대 (자동 생성)

tools/                개발 전용 — 앱에는 들어가지 않습니다
vendor/  assets/  docs/
```

## 만들 때 쓰는 도구

```bash
node tools/convert.mjs        docs/content/*.md 12개 → js/eras/*.js + worlds-registry + map-data
node tools/gen-geo.mjs        Natural Earth TopoJSON → 실측 해안선
node tools/gen-credits.mjs    CREDITS.md → js/asset-credits.js
node tools/fetch-photos.mjs   위키미디어 공용에서 자유 이용 사진 수집

node tools/check-style.mjs    탐험 모드에 해요체가 남았는지            (0건이어야 함)
node tools/audit.mjs          완료할 수 없는 임무가 있는지             (0건이어야 함)
bash tools/check.sh           헤드리스 Chrome 으로 열어 콘솔 오류 검사 (0건이어야 함)
```

`tools/minigames.html` 은 미니게임 20형식 시험대입니다. `?auto=1` 로 열면 전부 만들어 보고,
`?drive=1` 로 열면 정해진 답이 있는 형식을 끝까지 눌러 봅니다.
`tools/contact-sheet.html` 은 새로 모은 사진을 한 화면에서 눈으로 대조하는 판입니다.

## 정직하게 남는 한계

- **시대별 국경은 근사치입니다.** 해안선은 실측이지만 영역은 교과서를 참고해 그렸습니다. **역사 전공 교사의 검수가 필요합니다.**
- **고조선 경계는 학계가 합의하지 못했습니다.** 그래서 점선입니다. 결함이 아니라 "학자마다 다르게 본다"를 가르칠 수 있는 자리입니다.
- **사진이 없는 학습 항목이 아직 많습니다.** 빈 액자를 보여 주지 않고 사진 칸 자체를 생략합니다.
- **일부 시대는 지역별 임무 수가 고르지 않습니다** (일제강점기 14/3/4/2/2 등). 원본 콘텐츠에서 온 것으로, 균형을 맞추려면 임무를 새로 써야 합니다.
- **3D는 상징적인 그림입니다.** 저폴리 표현은 고증이 아닙니다. 유물의 실제 모습은 사진과 박물관 자료로 확인해 주세요.
- **GLB 3D 모델 9점과 저폴리 키트는 라이선스가 확인되지 않아 앱에서 부르지 않습니다.** 기본 도형으로 대신 그립니다.
- **자동 사진 검색은 믿을 수 없습니다.** 실제로 '38선'을 찾으니 미국의 도로 표지판이 나왔습니다. 눈으로 확인해 버렸고, 네 항목은 사람이 직접 고르도록 남겨 두었습니다.

## 출처

- 지도 — Natural Earth 1:50m (퍼블릭 도메인)
- 사진 — 위키미디어 공용 (CC BY / CC BY-SA / CC0 / 공공누리 1유형 / 퍼블릭 도메인) — [`assets/photos/CREDITS.md`](assets/photos/CREDITS.md)
- 글꼴 — Pretendard, 길형진 (SIL OFL 1.1) · 신라문화체, 경주시 (공공누리 제1유형) — https://www.gyeongju.go.kr/open_content/ko/page.do?mnu_uid=3288
- 3D 엔진 — three.js 0.160.0 (MIT)
- 내용 — 초등학교 5학년 2학기 사회 교과서 및 2022 개정 교육과정 문서

앱 안 **자료 출처 · 저작권** 에서 113건 전부를 볼 수 있고, 인쇄물 하단에도 실립니다.
CC BY-SA 사진의 저작자 이름은 줄이거나 다듬지 않습니다.

## 문서

| 문서 | 내용 |
|---|---|
| [`MASTER.md`](MASTER.md) | 기획 기준 문서 (대회 시작 전에 쓴 것) |
| [`docs/superpowers/specs/2026-08-28-korean-history-atlas-design.md`](docs/superpowers/specs/2026-08-28-korean-history-atlas-design.md) | 구현 설계 — MASTER를 어디서 왜 덮어썼는지 |
| [`docs/README-package.md`](docs/README-package.md) | 사전 준비 꾸러미 원본 설명 (코드가 없던 상태) |
| [`docs/`](docs/) · [`docs/content/`](docs/content/) | 기획 문서 13개 · 시대별 콘텐츠 원문 12개 |

---

제작 **역지사지팀** · 문의 bgnlkim@gmail.com · wptnwptn@sen.go.kr · memory02@sen.go.kr
