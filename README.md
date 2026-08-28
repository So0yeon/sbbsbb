# 한국사 아틀라스 — 사전 준비 꾸러미

초등 5학년 2학기 사회(역사) 학습 도구를 만들기 위한 **기획 문서와 재료**입니다.

> ## ⚠️ 이 꾸러미에는 코드가 없습니다
>
> 대회 규칙(선행 개발 금지)에 맞추어 **기획 문서·라이브러리·에셋만** 담았습니다.
> `index.html`, `js/`, `css/` 는 들어 있지 않습니다. 개발 시작 시각 이후에 만듭니다.
>
> 지시문(프롬프트) 원문도 싣지 않았습니다. `docs/08-BUILD-ORDER.md` 에는
> *무엇을 어떤 순서로* 만들지만 적혀 있습니다.

---

## 들어 있는 것

| | 무엇 | 성격 |
|---|---|---|
| `docs/` | 기획 문서 13개 + 시대별 콘텐츠 12개 | 기획 |
| `vendor/three/` | three.js 0.160.0 (MIT) | 라이브러리 |
| `vendor/font/` | Pretendard v1.3.9 (SIL OFL 1.1) | 글꼴 |
| `assets/` | 3D 모델 9점 · **사진 76장** · 저폴리 키트 · 지도 원본 | 에셋 |
| `curriculum.md`, `lesson1~3.md` | 수업 기획서 | 기획 |

전부 **남이 만들었거나, 우리가 글로 쓴 것**입니다.

## 문서 읽는 차례

1. **[00-OVERVIEW](docs/00-OVERVIEW.md)** — 이것만 읽어도 무엇을 만드는지 압니다
2. **[12-BUILD-RULES](docs/12-BUILD-RULES.md)** — 한 번 만들어 보고 알아낸 규칙. **다른 문서와 어긋나면 이게 맞습니다**
3. **[08-BUILD-ORDER](docs/08-BUILD-ORDER.md)** — 시간 배분과 우선순위 컷라인
4. 자기 담당 문서로

| 문서 | 내용 |
|---|---|
| [00-OVERVIEW](docs/00-OVERVIEW.md) | 전체 그림, 제약, 폴더 구조 |
| [01-ARCHITECTURE](docs/01-ARCHITECTURE.md) | **퀘스트 스키마 계약서**, 빌더 어휘, DOM 뼈대 |
| [02-MINIGAMES](docs/02-MINIGAMES.md) | 미니게임 8종 메커닉과 정확한 상수 |
| [03-DESIGN-SYSTEM](docs/03-DESIGN-SYSTEM.md) | 색·비례·문체·3D 규칙 |
| [04-LEARN-MODE](docs/04-LEARN-MODE.md) | 2D 지도 스펙 + `ERAS`·`CONTENT` 원문 |
| [05-DECISIONS](docs/05-DECISIONS.md) | **막혔을 때 먼저.** 이미 겪은 함정 |
| [06-BUILD-PLAN](docs/06-BUILD-PLAN.md) | 누가 무엇을 맡는가 |
| [07-ASSETS](docs/07-ASSETS.md) | 에셋 조달 (이 꾸러미에 이미 받아 두었습니다) |
| [08-BUILD-ORDER](docs/08-BUILD-ORDER.md) | 만드는 차례·시간 배분·우선순위 |
| [09-3D-OBJECTS](docs/09-3D-OBJECTS.md) | **시대 전용 3D 소품 165개 명세** |
| [10-LEARN-EXTRA](docs/10-LEARN-EXTRA.md) | 후삼국 학습 항목 8개 (본편에 모자란 것) |
| [11-DUPLICATES](docs/11-DUPLICATES.md) | 겹치는 항목 46쌍 · 사진 파일 이름의 근거 |
| [12-BUILD-RULES](docs/12-BUILD-RULES.md) | **만들 때 지킬 규칙** — 이동·입력·판정·배치. 시험 삼아 한 번 만들어 보고 쓴 문서 |
| [content/](docs/content/) | 시대별 원문 12개 — 퀘스트 243 · 관문 70 · NPC 154 |

## 무엇을 만드는가

하나의 앱에 두 모드가 들어갑니다.

| | 학습 모드 | 탐험 모드 |
|---|---|---|
| 화면 | 2D SVG 지도 | 3D 저폴리 월드 |
| 하는 일 | 시대를 옮겨 다니며 영토 변화와 유물을 봄 | 아바타로 그 시대를 걸으며 선택을 겪음 |

두 모드를 잇는 것은 **`contentId` 하나뿐**입니다.

## 규모

| 항목 | 수 |
|---|---|
| 탐험 시대 / 지역 | 12개 / 46곳 |
| 퀘스트 | 243개 (관문 제외) |
| 관문 · NPC | 70개 · 154명 |
| 미니게임 | 8종 + 기본형 |
| 학습 항목 / 시대 | 146개 / 13개 |
| 3D 소품 명세 | 165개 |

**12개 시대를 전부 만듭니다.** 콘텐츠 문서가 기계적으로 옮겨질 만큼 규칙적이라,
변환 규칙을 한 번 만들어 12개에 그대로 돌리면 됩니다
([12-BUILD-RULES](docs/12-BUILD-RULES.md) §6). 시간이 모자라면 시대를 빼지 말고
그 시대의 3D 소품을 줄이세요 — [08-BUILD-ORDER](docs/08-BUILD-ORDER.md) 1장.

## 지켜야 할 제약

| 제약 | 왜 |
|---|---|
| **서버 없음** | 학생 개인정보가 나갈 통로를 만들지 않습니다. 저장은 `localStorage` |
| **인터넷 끊겨도 동작** | 심사장 네트워크를 믿을 수 없습니다. three.js·폰트를 `vendor/`에 동봉 |
| **설치·가입 없이 링크 하나로** | 정적 파일. GitHub Pages 배포 |
| **종이로도 쓸 수 있게** | 태블릿 없는 교실이 많습니다. 학습지 인쇄 |

## 사진

`assets/photos/` 에 위키미디어 공용 사진 **68장**이 있습니다.
파일 이름이 곧 학습 항목 id 라서 그대로 이어 붙일 수 있습니다(46장).
**저작자와 라이선스는 [`assets/photos/CREDITS.md`](assets/photos/CREDITS.md) 에 있습니다.
CC BY-SA 사진은 저작자 이름을 그대로 표시해야 합니다.**

`assets/countries-50m.json` 은 Natural Earth 국가 경계 원본입니다.
여기서 한반도 해안선을 뽑아 씁니다 — [07-ASSETS.md](docs/07-ASSETS.md) 4장.

## 에셋 주의

`assets/`의 GLB 9점은 **Sketchfab 내보내기이고 파일에 라이선스 정보가 없습니다.**
공개 배포 전에 모델마다 출처와 이용 조건을 확인해 표기하세요.
앱이 실제로 쓰는 것은 자격루·청동 창 2점(15.6MB)뿐이고, 나머지 7점은 예비입니다.

## 출처

- 지도 — Natural Earth (퍼블릭 도메인)
- 사진 — 위키미디어 공용 (CC BY-SA / CC BY / 퍼블릭 도메인)
- 3D 모델 — 국가유산청 디지털유산 (공공누리) · Sketchfab
- 글꼴 — Pretendard, 길형진 (SIL OFL 1.1)
- 3D 엔진 — three.js 0.160.0 (MIT)
- 내용 — 초등학교 5학년 2학기 사회 교과서 및 교육과정 문서
