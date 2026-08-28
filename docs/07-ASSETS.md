# 07 · 에셋과 데이터 조달

> **이 문서가 가장 먼저 실행되어야 합니다.**
> 여기 적힌 것들은 프롬프트로 만들 수 없습니다. 내려받거나 계산해야 합니다.
> 시작 직후 이 스크립트들을 백그라운드로 돌려 두고, 그동안 코드를 생성하세요.

---

## 0. 세 가지 분류

재생성 방법이 완전히 다릅니다. 섞으면 시간을 잃습니다.

| 분류 | 대상 | 방법 | 예상 시간 |
|---|---|---|---|
| **A. 코드·콘텐츠** | `js/engine/`, `js/eras/`, `css/`, 퀘스트 텍스트 | 프롬프트로 생성 | 대부분의 시간 |
| **B. 가공 데이터** | `js/atlas-geo.js`, `js/atlas-photos.js` | 스크립트 실행 | 30~60분 (대기) |
| **C. 원본 에셋** | `assets/*.glb`, `assets/*.webp`, `vendor/` | 직접 내려받기 | 20~40분 |

**B와 C를 먼저 걸어 두세요.** 네트워크 대기 시간이라 코드 생성과 병렬로 돌아갑니다.

---

## 1. vendor/ — 오프라인 의존성 (C)

외부 CDN을 쓰지 않는 것이 이 프로젝트의 제약입니다. 학교·행사장 네트워크가 외부를 막아도 3D 탐험 모드가 떠야 합니다.

> ✅ **이 꾸러미에는 `vendor/` 가 이미 들어 있습니다** — three.js 0.160.0 4개 파일 + Pretendard 서브셋 92개.
> 다시 내려받을 필요가 없습니다. 아래 표는 다시 받아야 할 때를 위한 출처입니다.

| 대상 | 버전 | 받는 곳 | 저장 위치 |
|---|---|---|---|
| three.js | **0.160.0** | `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` | `vendor/three/build/three.module.js` |
| GLTFLoader | 0.160.0 | `.../examples/jsm/loaders/GLTFLoader.js` | `vendor/three/addons/loaders/` |
| RoomEnvironment | 0.160.0 | `.../examples/jsm/environments/RoomEnvironment.js` | `vendor/three/addons/environments/` |
| BufferGeometryUtils | 0.160.0 | `.../examples/jsm/utils/BufferGeometryUtils.js` | `vendor/three/addons/utils/` |
| Pretendard Variable | v1.3.9 | `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/` | `vendor/font/` (서브셋 woff2 90여 개) |

`index.html`의 importmap이 이 경로를 가리켜야 합니다.

```html
<script type="importmap">
{ "imports": {
    "three": "./vendor/three/build/three.module.js",
    "three/addons/": "./vendor/three/addons/"
} }
</script>
```

**버전을 0.160.0으로 고정하세요.** 상위 버전에서 `RoomEnvironment` 경로와 색 공간 기본값이 바뀝니다.

---

## 2. assets/ — 3D 모델과 사진 (C)

> ⚠️ **출처가 확인되지 않았습니다 (2026-08-28 정정).** 이 문서는 예전에 "전부 국가유산청 국가유산 디지털 서비스(`https://digital.khs.go.kr/`), 공공누리"라고 적었으나 **근거가 없어 철회합니다.**
> GLB 파일 안에 라이선스 정보가 없고 Sketchfab 내보내기로 보입니다. **공개 배포 전에 실제로 쓰는 2점의 출처와 이용 조건을 확인해 표기하세요.**
> 확인 전에는 기본 도형 폴백으로도 배포할 수 있습니다 — [`../MASTER.md`](../MASTER.md) §9-4.

### 파일 목록 (실물, 17개)

| 파일 | 크기 | 용도 | 상태 |
|---|---|---|---|
| `bitsal.webp` | 12 KB | 사진 | ✅ |
| `bronze-mirror.webp` | 20 KB | 사진 | ✅ |
| `galdolgalpan.webp` | 14 KB | 사진 | ✅ |
| `garak.webp` | 41 KB | 사진 | ✅ |
| `paleo-bangudae-petroglyphs-1.webp` | 255 KB | 사진 | ✅ |
| `paleo-bangudae-petroglyphs-2.webp` | 177 KB | 사진 | ✅ |
| `paleo-bangudae-petroglyphs-3.webp` | 191 KB | 사진 | ✅ |
| `paleo-jeongokri-handaxe.webp` | 8.7 KB | 사진 | ✅ |
| `clepsydra_of_changgyeonggung_palace.glb` | 12 MB | **자격루** (조선 전기) | ✅ 사용 |
| `bronze_age_spearhead.glb` | 3.7 MB | **청동 창** (청동기) | ✅ 사용 |
| `gold_crown_from_the_seobong_tomb.glb` | 15 MB | 예비 | 미사용 |
| `hemispherical_sundial.glb` | 6.8 MB | 예비 | 미사용 |
| `paleolithic_animal_hide_tent.glb` | 4.7 MB | 예비 | 미사용 |
| `paleolithic_hand_axe.glb` | 3.5 MB | 예비 | 미사용 |
| `celadon_porcelaina.glb` | 1.9 MB | 예비 | 미사용 |
| `tablet.glb` | 1.7 MB | 예비 | 미사용 |
| `spinsters_rock.glb` | 1.1 MB | 예비 | 미사용 |

**이 문서가 예전에 적어 둔 webp 14장은 꾸러미에 없습니다** — `goryeo-celadon-chair`/`-monkey`/`-pillow`,
`goryeo-jokduri`, `goryeo-mongol-byeonbal`, `umjip-1~3`, `kimhongdo`, `mireuksaji`,
`geumdongdaehyangro`, `bipa-dagger` 등. 시작 직후 백그라운드로 다시 수집합니다(§3).
**없어도 화면은 성립합니다** — 사진 칸 자체를 그리지 않으면 됩니다.

**실제로 쓰는 GLB 두 개가 15.7MB입니다.** 시간이 모자라면 이 둘은 후순위로 미루고, 대체 도형(엔진의 기본 프리미티브)으로 먼저 채우세요. 나머지 7점은 앱에서 부르지 않습니다.

### 출처 표기

`js/asset-credits.js`에 파일 하나당 한 항목으로 관리합니다. 화면 하단 "자료 출처 · 저작권 안내" 모달이 이걸 읽습니다.

```js
{ file:'paleo-jeongokri-handaxe.webp',
  name:'전곡리 주먹도끼',
  source:'', sourceService:'', sourceUrl:'' }   // 확인된 것만 채운다
```

**기본 출처를 채워 넣지 마세요. 확인되지 않은 source·author·year·license는 비워 둡니다.** 모달이 빈 줄을 자동으로 생략합니다. 임의로 채우면 저작권 표기가 틀어집니다.

---

## 3. 사진 — 파일 우선, `atlas-photos.js` 는 폴백 (B) — ✅ 68장 이미 동봉됨

**기본은 파일 참조입니다.** `assets/photos/*.jpg` **68장**이 이미 꾸러미에 있고, 파일 이름이 곧 학습 항목 id 입니다(46파일 = 학습 항목 **41개**, 나머지 22장은 `hb_*` 미매칭). 저작자·라이선스는 `assets/photos/CREDITS.md` 에 전부 있습니다.

`js/atlas-photos.js` 는 **파일이 없는 항목만 base64로 채우는 폴백 계층**으로 둡니다. 빈 객체로 시작해도 정상 동작하고, 시간이 남을 때만 채웁니다.

아래 파이프라인은 **누락된 webp 14장(§2)을 다시 받을 때** 그대로 씁니다.

### 파이프라인

`tools/fetch_existing_photos.py`가 합니다. 세 단계입니다.

1. 항목마다 **검색어를 여러 개** 두고 앞에서부터 시도
2. **금지어**로 명백한 오답을 걸러냄
3. 사람이 눈으로 최종 확인

자동 검색만 믿으면 안 됩니다. 실제로 '전차'를 찾으니 지하철 개찰구가, '임진왜란'을 찾으니 6·25 사진이 나왔습니다.

### 라이선스 필터

이 정규식에 걸리는 것만 씁니다.

```python
OK_LIC = re.compile(
    r"(CC[ -]BY(-SA)?[ -][\d.]+|CC0|Public domain|KOGL Type 1|공공누리)", re.I)
```

### 금지어 목록

```python
BAN = re.compile(
    r"market|alley|station|subway|university|campus|bunker|schip|orphan|"
    r"banner|logo|flag of|map of the world|meeting|conference|festival poster|"
    r"protest|demonstration|K-?pop|restaurant|cafe|hotel|apartment|"
    r"USS |N-EH|US Navy|Marine|drama|촬영장|세트장|테마파크|"
    r"airport|stadium|bridge at night", re.I)
```

### 검색어 사전

**이 사전이 이 파이프라인에서 가장 손이 많이 간 부분입니다.** 항목 이름에 아래 열쇠가 들어 있으면 그 검색어를 먼저 씁니다. 없으면 항목 이름에서 괄호와 조사를 떼어 그대로 검색합니다.

```python
HINT = {
 # 선사
 "연천 전곡리": ["Jeongok-ri Prehistory Museum", "Jeongok handaxe"],
 "공주 석장리": ["Seokjang-ri Museum Gongju", "Seokjangni paleolithic"],
 "단양 수양개": ["Suyanggae site Danyang", "Suyanggae"],
 "동굴과 막집": ["Paleolithic cave dwelling Korea", "Durubong cave"],
 "돌을 깨서 만든 도구": ["Korean paleolithic stone tools", "chipped stone tool Korea"],
 "서울 암사동": ["Amsa-dong Prehistoric Settlement"],
 "부산 동삼동 조개더미": ["Dongsam-dong shell midden"],
 "양양 오산리": ["Osan-ri site Yangyang", "Osanri Neolithic"],
 "제주 고산리": ["Gosan-ri site Jeju"],
 "빗살무늬 토기": ["Jeulmun pottery", "comb pattern pottery Korea"],
 "농사와 가축 기르기": ["Neolithic farming Korea museum", "prehistoric agriculture Korea"],
 "갈아서 만든 도구": ["polished stone tool Korea", "ground stone axe Korea"],
 # 청동기·고조선
 "고인돌": ["Ganghwa dolmen", "Gochang dolmen"],
 "비파형 동검": ["Liaoning bronze dagger"],
 "미송리식 토기": ["Misongni type pottery"],
 "반달 돌칼": ["semilunar stone knife Korea"],
 "청동 거울": ["Korean bronze mirror fine linear"],
 "고조선": ["Gojoseon", "Dangun"],
 "단군 이야기": ["Samguk yusa", "Dangun myth"],
 # 삼국
 "광개토 대왕": ["Gwanggaeto Stele"],
 "장수왕": ["Jangsu tomb Goguryeo", "General's Tomb Ji'an"],
 "무령왕릉": ["Muryeong crown ornament", "Tomb of King Muryeong"],
 "황룡사": ["Hwangnyongsa site Gyeongju"],
 "첨성대": ["Cheomseongdae"],
 "금관": ["Silla gold crown"],
 "천마도": ["Cheonmado"],
 "칠지도": ["Seven-Branched Sword"],
 "금동 대향로": ["Baekje Gilt-bronze Incense Burner"],
 "무용총": ["Muyongchong mural"],
 "가야": ["Daeseong-dong tombs Gimhae", "Gaya iron armor"],
 # 통일신라·발해
 "불국사": ["Bulguksa Dabotap"],
 "석굴암": ["Seokguram"],
 "성덕 대왕 신종": ["Divine Bell of King Seongdeok"],
 "무구정광대다라니경": ["Pure Light Dharani Sutra"],
 "발해": ["Balhae stone lantern", "Balhae Buddha"],
 "장보고": ["Cheonghaejin", "Jang Bogo"],
 # 고려
 "고려청자": ["Goryeo celadon"],
 "팔만대장경": ["Tripitaka Koreana", "Haeinsa Janggyeong Panjeon"],
 "직지": ["Jikji"],
 "삼국유사": ["Samguk yusa"],
 "삼국사기": ["Samguk sagi"],
 "강감찬": ["Gang Gam-chan"],
 "서희": ["Goryeo Khitan War"],
 "삼별초": ["Yongjangsanseong Jindo", "Hangpaduri"],
 "부석사": ["Buseoksa Muryangsujeon"],
 # 조선
 "훈민정음": ["Hunminjeongeum Haerye"],
 "경복궁": ["Geunjeongjeon Gyeongbokgung"],
 "종묘": ["Jongmyo shrine"],
 "숭례문": ["Sungnyemun"],
 "측우기": ["Cheugugi rain gauge"],
 "앙부일구": ["Angbuilgu"],
 "자격루": ["Jagyeongnu"],
 "혼천의": ["Honcheonui armillary sphere"],
 "경국대전": ["Gyeongguk daejeon"],
 "이순신": ["Yi Sun-sin statue", "Geobukseon"],
 "거북선": ["Geobukseon", "turtle ship Korea"],
 "남한산성": ["Namhansanseong"],
 "수원 화성": ["Hwaseong Fortress Suwon"],
 "대동여지도": ["Daedongyeojido"],
 "정약용": ["Jeong Yak-yong", "Dasan Chodang"],
 "김홍도": ["Kim Hong-do Ssireum"],
 "신윤복": ["Shin Yun-bok painting"],
 "판소리": ["Pansori"],
 "탈춤": ["Talchum Korean mask dance"],
 "상평통보": ["Sangpyeong Tongbo"],
 "백자": ["Moon jar Joseon", "Joseon white porcelain"],
 "분청사기": ["Buncheong ware"],
 # 개항·근대
 "강화도 조약": ["Treaty of Ganghwa"],
 "독립신문": ["Tongnip Sinmun"],
 "독립문": ["Independence Gate Seoul"],
 "전차": ["Seoul tram history"],
 "경인선": ["Gyeongin Line 1899"],
 "대한제국": ["Gojong Korean Empire", "Hwangudan"],
 "명동성당": ["Myeongdong Cathedral"],
 "덕수궁": ["Deoksugung Seokjojeon"],
 # 일제강점기
 "3·1 운동": ["March First Movement"],
 "유관순": ["Yu Gwan-sun"],
 "안중근": ["An Jung-geun"],
 "윤봉길": ["Yun Bong-gil"],
 "임시 정부": ["Provisional Government of Korea Shanghai"],
 "한글": ["Korean language society", "Hangul"],
 "서대문 형무소": ["Seodaemun Prison"],
 # 인물·사건 — 실물이 없어 대표 유적/유물로 대체
 "주몽": ["Ohoe tomb Goguryeo mural", "Goguryeo tomb mural"],
 "온조": ["Pungnaptoseong", "Hanseong Baekje Museum"],
 "박혁거세": ["Oreung Gyeongju", "Najeong Gyeongju"],
 "진흥왕": ["Jinheung Sunsubi", "Bukhansan Jinheung monument"],
 "일본에 전한 문화": ["Takamatsuzuka", "Horyuji Kudara Kannon"],
 "문무왕": ["Underwater Tomb of King Munmu", "Daewangam"],
 "대조영": ["Balhae", "Balhae stone lantern"],
 "발해 상경성": ["Shangjing Longquanfu", "Balhae capital site"],
 "원효": ["Bunhwangsa", "Wonhyo"],
 "의상": ["Buseoksa Muryangsujeon"],
 "견훤": ["Geumsansa", "Gyeon Hwon tomb"],
 "궁예": ["Cheorwon Taebong", "Goseokjeong Cheorwon"],
 "왕건": ["Wang Geon statue", "Manwoldae Kaesong"],
 "신라의 항복": ["Gyeongsun of Silla", "Gyeongju Silla"],
 "후삼국 통일": ["Later Three Kingdoms", "Manwoldae"],
 "윤관": ["Yun Gwan tomb", "Dongbuk Nine Fortresses"],
 "강화도 천도": ["Ganghwa Goryeo palace site", "Goryeogung Ganghwa"],
 "문익점": ["cotton plant Korea", "Mun Ik-jeom"],
 "최무선": ["Jinpo battle", "Korean cannon Joseon"],
 "송국리": ["Songgungni site Buyeo"],
 "농사와 가축": ["Neolithic Korea museum exhibit"],
 "수양개": ["Suyanggae Danyang", "Danyang prehistoric"],
 "무용총": ["Muyongchong", "Goguryeo dance tomb mural"],
 "살수": ["Eulji Mundeok", "Salsu battle"],
 # 남은 항목 — 실물이 없는 제도·전투·개념은 관련 유적/기록물로 대체
 "부여 송국리": ["Songgungni Buyeo", "Songguk-ri site"],
 "벽란도": ["Yeseong River Kaesong", "Byeokrando"],
 "한양 천도": ["Hanyang capital Joseon map", "Old map of Seoul Joseon"],
 "4군 6진": ["Yukjin Joseon", "Joseon northern border map"],
 "삼포와 왜관": ["Waegwan Joseon", "Busan Japanese quarter Joseon"],
 "행주 대첩": ["Haengju Fortress", "Haengjusanseong"],
 "진주 대첩": ["Jinju Fortress", "Jinjuseong"],
 "곽재우": ["Gwak Jae-u", "Uibyeong righteous army Korea"],
 "영조": ["Tangpyeongbi", "Yeongjo of Joseon"],
 "정조": ["Jeongjo of Joseon", "Hwaseong Fortress Suwon"],
 "모내기": ["Rice transplanting Korea", "Korean rice paddy"],
 "청에 다녀온 사신": ["Yeonhaengdo", "Joseon envoy Qing painting"],
 "흥선대원군": ["Heungseon Daewongun"],
 "대조영": ["Balhae", "Dunhua Balhae site"],
 "발해 상경성": ["Shangjing Longquanfu", "Balhae stone lantern"],
 "윤관": ["Yun Gwan", "Bukgwan Yujeokdo"],
 "수양개": ["Suyanggae Danyang", "Danyang Suyanggae Museum"],
 "농사와 가축": ["Neolithic Korea exhibit", "Amsadong museum"],
 "신돌석": ["Shin Dol-seok", "Korean righteous army 1907"],
 "국권을 빼앗기다": ["Japan Korea Annexation Treaty 1910"],
 "봉오동": ["Battle of Fengwudong", "Hong Beom-do"],
 "김구": ["Kim Ku", "Baekbeom Kim Ku"],
 "우리말을 지킨": ["Korean Language Society", "Joseoneo hakhoe"],
 "물산 장려": ["Korean Production Movement", "Jo Man-sik"],
 "강제로 끌려간": ["Korean forced labor 1940s", "Hashima island Korean"],
 "통일 정부를 바란": ["Kim Ku", "Korean unification 1948"],
 "전쟁이 시작되다": ["Korean War 1950", "Korean War refugees"],
 # 광복·전쟁
 "광복": ["Liberation of Korea 1945"],
 "제헌 헌법": ["Constitution of South Korea 1948"],
 "6·25": ["Korean War memorial", "Korean War"],
 "판문점": ["Panmunjom"],
 "이산가족": ["Korean family reunion"],
}
```

### API 호출 규약

```
https://commons.wikimedia.org/w/api.php?
  action=query&format=json&generator=search
  &gsrsearch=filetype:bitmap <검색어>&gsrnamespace=6
```

- User-Agent를 반드시 넣으세요: `korean-history-atlas/1.0 (teacher hackathon)`
- 가로 300px 미만은 버립니다
- 재시도 4회, 호출 사이 간격을 두세요

### 저장 형식

```js
const HB_PHOTOS = {
  'hb_50982713': { by:'저작자', lic:'CC BY-SA 4.0',
                   src:"data:image/jpeg;base64,..." },
  ...
};
```

`by`와 `lic`은 **필수**입니다. 항목마다 화면에 표시됩니다. 원본 URL은 저장하지 않습니다 — 필요하면 검색어로 다시 찾습니다.

---

## 4. atlas-geo.js — 지도 데이터 (B)

**Natural Earth 1:50m** — 꾸러미의 `assets/countries-50m.json` (739KB, 퍼블릭 도메인). ✅ 이미 동봉됨. **손으로 쓸 수도, 프롬프트로 만들 수도 없습니다.**

### 들어 있는 것 / 없는 것

| 레이어 | 내용 |
|---|---|
| 해안선·국가 경계 | 1:50m 실측. 한반도와 주변국 육지 폴리곤 |
| ~~하천~~ | **없습니다.** 국가 경계 파일이라 압록강·두만강·한강·낙동강이 들어 있지 않습니다 |
| ~~음영기복~~ | **없습니다.** 태백산맥·백두산 표현은 스펙에서 뺐습니다 |

> 이 문서가 예전에 적은 "1:10m · 해안선 1,412점 · 하천 · 음영기복"은 **동봉본에 해당하지 않습니다.**
> 1:50m 기준으로 스펙을 낮춘 결정입니다 — [`../MASTER.md`](../MASTER.md) §7-2.

### 처리 방법

Python + **Shapely**로 처리합니다. 핵심은 하나입니다.

> **나라 영역 폴리곤을 육지 폴리곤과 교차 연산**해서, 경계가 바다로 삐져나가지 않고 해안선에 저절로 붙게 합니다.

손으로 그리면 절대 안 나오는 정확도이고, 이 프로젝트에서 "한반도로 보인다"를 만든 결정적 요소입니다. 초기에 좌표를 눈대중으로 찍었을 때는 40점짜리 윤곽이었고, 아무리 다듬어도 한반도로 보이지 않았습니다.

### 좌표 규약

- 순서는 **`[위도, 경도]`** — 저장소 전체가 이 순서입니다
- `map-data.js`의 `px()` / `py()` 변환 함수를 그대로 씁니다
- 지도 범위(`MAP`) 상수를 `map-data.js`와 반드시 일치시키세요

### 알려진 함정

`clipPath` 안에 `<g>`를 넣으면 **SVG 규격상 무시됩니다.** 브라우저가 오류를 내지 않아 화면을 직접 보기 전까지 모릅니다. 음영기복이 통째로 사라졌던 원인이 이것이었습니다.

---

## 5. 시작 직후 실행 순서

```
시작  ─┬─ [백그라운드] 누락 webp 14장 수집 (§2·§3)  → 사람 눈 확인 필요
       └─ [전면]      저장소 초기화 → 첫 커밋
                      → 폴더 구조 → 엔진 뼈대     → 08-BUILD-ORDER.md 참조
```

**`vendor/` · `assets/` · 사진 68장 · `countries-50m.json` 은 이미 동봉돼 있습니다.**
대회 시작 후 내려받아야 할 것은 누락 webp 14장뿐입니다.

사진과 GLB는 없어도 앱이 돌아갑니다. 사진 없는 항목은 화면에서 자연스럽게 생략되고, GLB 대신 기본 도형이 나옵니다. **시간이 모자라면 여기를 버리세요.**

---

## 6. 라이선스 정리

| 대상 | 라이선스 | 표기 의무 |
|---|---|---|
| Natural Earth 1:50m | 퍼블릭 도메인 | 없음 (그래도 명시 권장) |
| 위키미디어 사진 68장 | CC BY / CC BY-SA / CC0 / 공공누리 1유형 | **저작자·라이선스 표기 필수** |
| GLB 3D 모델 9점 | **미확인** | 확인 후 표기. 미확인이면 사용 보류 |
| `assets/Models/` 저폴리 키트 | **미확인** | 〃 |
| three.js | MIT | 표기 권장 |
| Pretendard | SIL OFL 1.1 | 표기 권장 |

CC BY-SA 사진은 **저작자 이름을 그대로** 표시해야 합니다. `by` 필드를 임의로 줄이거나 다듬지 마세요.
