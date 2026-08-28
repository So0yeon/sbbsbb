/* 자동 생성 — tools/convert.mjs · 원본 docs/content/02-neolithic.md
   손으로 고치지 마세요. 문체는 tools/style-hao.mjs 규칙을 따릅니다. */
import * as S from '../engine/scene-helpers.js';
import * as P from '../engine/props.js';

export const AREAS_NEO = {
 "main": {
  "name": "신석기",
  "bg": "#DFE0CE",
  "spawn": {
   "x": 0,
   "z": 21
  },
  "bound": 48,
  "loading": "신석기로 들어서는 중…"
 }
};

export const GATES_NEO = [];

export const QUESTS_NEO_BASE = [
 {
  "title": "간석기 만들기",
  "icon": "🪓",
  "id": "gansingi",
  "kind": "minigame",
  "area": "main",
  "pos": {
   "x": 6,
   "z": -8
  },
  "story": "당신은 마을의 도구 장인이다. 예전처럼 돌을 깨뜨리기만 해서는 날이 거칠고 쉽게 부서진다. 곡식을 거두고 나무를 다듬으려면 더 정교한 도구가 필요하다.",
  "q": {
   "text": "더 날카롭고 튼튼한 도구를 만들려면 이 돌을 어떻게 다뤄야 하는가?",
   "choices": [
    "돌을 그대로 깨뜨려 날카로운 조각만 골라 써야겠어",
    "거친 돌을 넓적한 숫돌에 오래도록 갈아 매끄러운 날을 만들자!",
    "돌을 불에 달군 뒤 곧바로 물에 담가 식혀야겠어",
    "돌 여러 개를 노끈으로 그냥 한데 묶어 써야겠어"
   ],
   "correct": 1,
   "ok": "인내심 있는 손끝이다. 숫돌에 갈고 또 갈아야 날이 선다는 걸 알았다. 이제 실제로 돌을 쥐고 갈아 보자.",
   "no": "그렇게는 거칠고 무딘 도구밖에 나오지 않는다. 숫돌에 오래도록 갈아야 매끄럽고 날카로운 간석기가 된다. 다시 시도하라."
  },
  "mini": {
   "type": "grind",
   "intro": "거친 돌을 숫돌 위에 올렸다. 아무 때나 힘을 주면 날이 삐뚤어지거나 돌이 튕겨 나간다. 돌이 숫돌 면에 딱 밀착하는 그 순간에만 힘을 실어야 하며, 왼쪽 날과 오른쪽 날을 번갈아 갈아야 양쪽이 고르게 선다.",
   "ok": "힘이 실리는 순간을 놓치지 않고 좌우 날을 번갈아 갈아 내자, 거칠던 돌은 어느새 매끈하고 날카로운 간석기가 된다. 이 돌도끼와 돌낫으로 나무를 베고 곡식을 거두는 일이 한결 수월해진다.",
   "retry": "엉뚱한 순간에 힘을 주면 날이 삐뚤게 갈리거나 돌이 미끄러진다. 딱 맞는 순간을 노려 좌우 날을 번갈아 갈아야 한다. 다시 시도하라."
  },
  "cat": "relic"
 },
 {
  "title": "빗살무늬토기",
  "icon": "🏺",
  "id": "bitsal",
  "kind": "inspect",
  "area": "main",
  "pos": {
   "x": -16,
   "z": -14
  },
  "hotspots": [
   {
    "label": "표면의 무늬",
    "note": "빗살처럼 생긴 도구로 겉면 전체에 비스듬한 줄무늬를 촘촘히 새겼소."
   },
   {
    "label": "바닥의 생김새",
    "note": "밑이 뾰족하거나 둥글소. 강가나 바닷가의 부드러운 모래땅에 꽂아 세우기 편한 모양이오."
   },
   {
    "label": "만든 방법",
    "note": "흙을 곱게 빚어 모양을 잡은 뒤, 불에 단단히 구워 물이 새지 않게 만들었소."
   },
   {
    "label": "쓰임새",
    "note": "곡식이나 물을 담아 두는 데 썼소. 정착 생활과 함께 이런 저장용 그릇이 필요해졌소."
   }
  ],
  "capstone": {
   "text": "오, 밑이 뾰족하고 표면 가득 빗살 같은 줄무늬가 새겨진 이 토기! 신석기 시대를 대표하는 이 그릇을 우리는 바로 ____라고 부르는구나!",
   "choices": [],
   "correct": 0,
   "no": "다시 떠올려 보시오. 겉면에 빗살 같은 줄무늬가 촘촘히 새겨진, 신석기 시대를 대표하는 토기의 이름이오."
  },
  "mini": {
   "type": "blank",
   "answer": [
    "빗살무늬토기",
    "빗살무늬 토기"
   ],
   "ok": "그러하오! 무겁고 깨지기 쉬운 이런 토기를 만들어 썼다는 것은, 이제 이 자리를 쉽게 떠나지 않고 오래 머물렀다는 뜻이오. 농사와 정착 생활이 시작되면서, 곡식을 저장할 그릇이 꼭 필요해진 거라오."
  },
  "contentId": "bitsal",
  "cat": "culture",
  "img": [
   "bitsal.jpg"
  ]
 },
 {
  "title": "가락바퀴",
  "icon": "🧵",
  "id": "garak-yumul",
  "kind": "inspect",
  "area": "main",
  "pos": {
   "x": -24,
   "z": 24
  },
  "hotspots": [
   {
    "label": "생김새",
    "note": "가운데에 둥근 구멍이 뚫린 둥글넓적한 모양이오. 흙을 빚어 굽거나 돌을 갈아 만들었소."
   },
   {
    "label": "구멍의 쓰임",
    "note": "가운데 구멍에 나무 막대를 꽂아 팽이처럼 돌리면서 섬유를 꼬아 실을 뽑았소."
   },
   {
    "label": "무게의 역할",
    "note": "적당한 무게가 있어야 돌리는 힘이 오래 유지되어, 실이 끊기지 않고 고르게 꼬이오."
   },
   {
    "label": "함께 발견되는 유물",
    "note": "뼈바늘과 함께 발견되는 경우가 많소. 실을 뽑고 나면 바늘로 엮어 옷감을 지었다는 걸 짐작할 수 있소."
   }
  ],
  "capstone": {
   "text": "가락바퀴와 뼈바늘이 함께 발견된다는 사실에서 무엇을 짐작할 수 있겠소?",
   "choices": [
    "이 시대 사람들은 옷을 전혀 입지 않았다",
    "실을 뽑는 것과 옷감을 짓는 것이 하나로 이어진 작업이었다",
    "가락바퀴와 뼈바늘은 서로 관련이 없는 물건이다",
    "옷감은 다른 나라에서 완제품으로 들여왔다"
   ],
   "correct": 1,
   "ok": "그러하오. 가락바퀴로 실을 뽑고, 그 실을 뼈바늘로 엮어 옷감을 짓는 것은 한 흐름으로 이어진 작업이었소. 두 유물이 늘 함께 나온다는 사실 자체가 이 시대 사람들의 옷 짓는 과정을 보여 주는 증거라오.",
   "no": "다시 살펴보시오. 가락바퀴로 뽑은 실은 그다음 어떤 도구로 이어져 옷감이 되었을지 생각해 보시오."
  },
  "cat": "life"
 },
 {
  "title": "갈돌과 갈판",
  "icon": "🥣",
  "id": "galdolgalpan",
  "kind": "inspect",
  "area": "main",
  "pos": {
   "x": 14,
   "z": -22
  },
  "hotspots": [
   {
    "label": "갈판",
    "note": "넓적하고 평평한 큰 돌이오. 가운데가 오목하게 파여 있는데, 오랫동안 문질러 쓴 흔적이오."
   },
   {
    "label": "갈돌",
    "note": "손에 쥐기 좋은 길쭉한 돌이오. 갈판 위에 곡식을 놓고 갈돌로 밀어 으깼소."
   },
   {
    "label": "쓰임새",
    "note": "도토리 같은 열매의 껍질을 벗기거나, 곡식을 갈아 가루로 만드는 데 썼소."
   },
   {
    "label": "표면의 흔적",
    "note": "갈판 가운데가 반질반질하게 닳아 있소. 오랜 시간 반복해서 사용했다는 증거이오."
   }
  ],
  "capstone": {
   "text": "갈판 가운데가 반질반질하게 닳아 있는 모습에서 무엇을 짐작할 수 있겠소?",
   "choices": [
    "한두 번 쓰고 바로 버린 도구였다",
    "아주 오랫동안, 여러 번에 걸쳐 곡식을 갈았다",
    "갈판은 원래부터 매끈하게 만들어졌다",
    "갈판은 곡식이 아니라 장식용으로만 쓰였다"
   ],
   "correct": 1,
   "ok": "그러하오. 단단한 돌 표면이 반질반질해지려면 아주 오랜 시간, 수없이 문질러야 하오. 이 흔적 하나가 신석기 사람들이 매일같이 곡식을 갈아 먹었다는 사실을 말해 주고 있소.",
   "no": "다시 살펴보시오. 단단한 돌이 매끈하게 닳으려면 얼마나 오래, 얼마나 자주 써야 했을지 생각해 보시오."
  },
  "cat": "relic"
 },
 {
  "title": "농사의 시작",
  "icon": "🌾",
  "id": "nongsa",
  "kind": "minigame",
  "area": "main",
  "pos": {
   "x": 26,
   "z": 16
  },
  "story": "당신은 강가 벌판에 선 마을 사람이다. 사냥과 채집만으로는 겨울마다 먹을 것이 부족했다. 누군가 흘린 씨앗에서 이삭이 자라난 것을 본 적이 있다.",
  "q": {
   "text": "겨울에도 굶주리지 않으려면, 지금 무엇을 시작해야 하는가?",
   "choices": [
    "강가의 땅을 일구어 조와 기장 씨앗을 심고 정성껏 돌보자!",
    "씨앗을 전부 모아 한 끼에 먹어 치워야겠어",
    "땅을 일구지 않고 예전처럼 사냥과 채집만 계속해야겠어",
    "씨앗을 강물에 흩뿌려 떠내려가는 대로 내버려 둬야겠어"
   ],
   "correct": 0,
   "ok": "현명한 시작이다. 땅을 일구고 씨앗을 심어 정성껏 돌보자, 여름이 가고 가을이 오자 노랗게 익은 이삭이 벌판을 가득 채운다. 이제 거둔 이삭에서 낟알을 하나하나 골라내 보자.",
   "no": "그래서는 다음 겨울도 굶주리게 된다. 땅을 일구어 씨앗을 심고 돌보는 일, 그것이 지금 마을에 필요한 변화다. 다시 판단하라."
  },
  "mini": {
   "type": "sort",
   "intro": "거둔 이삭에서 낟알을 훑어 냈다. 통통하고 여문 낟알만 골라야 봄에 다시 싹이 튼다. 하나씩 살펴보며 왼쪽과 오른쪽으로 나누어 보자.",
   "ok": "통통한 낟알만 정성껏 골라 갈무리했다. 봄이 오면 이 낟알을 다시 땅에 심어, 마을은 하늘의 뜻만 바라지 않고도 해마다 곡식을 거둘 수 있게 되었다.",
   "retry": "쭉정이가 섞이면 봄에 싹이 트지 않는다. 낟알을 다시 하나하나 살펴 가려내야 한다.",
   "items": [
    {
     "icon": "🌾",
     "label": "통통한 조 이삭",
     "korean": true
    },
    {
     "icon": "🌱",
     "label": "빈 껍질뿐인 쭉정이",
     "korean": false
    },
    {
     "icon": "🌾",
     "label": "여문 기장 낟알",
     "korean": true
    },
    {
     "icon": "🥀",
     "label": "말라비틀어진 이삭",
     "korean": false
    },
    {
     "icon": "🪨",
     "label": "섞여 들어온 잔돌",
     "korean": false
    },
    {
     "icon": "🌾",
     "label": "알이 굵은 조 낟알",
     "korean": true
    },
    {
     "icon": "🐛",
     "label": "벌레 먹은 낟알",
     "korean": false
    },
    {
     "icon": "🌾",
     "label": "잘 여문 씨앗",
     "korean": true
    }
   ],
   "binLeftLabel": "왼쪽",
   "binRightLabel": "오른쪽"
  },
  "contentId": "nongsa",
  "cat": "life"
 },
 {
  "title": "가락바퀴와 옷감 짜기",
  "icon": "🧶",
  "id": "garakbakwi",
  "kind": "minigame",
  "area": "main",
  "pos": {
   "x": -30,
   "z": 22
  },
  "story": "당신은 마을의 길쌈꾼이다. 짐승 가죽만으로 온 마을 식구의 옷을 짓기엔 턱없이 부족하다. 삼과 같은 풀줄기에서 뽑아낸 가는 실이 손끝에 쥐어져 있다.",
  "q": {
   "text": "이 가는 실 가닥들을 쓸모 있는 옷감으로 만들려면 어떻게 해야 하는가?",
   "choices": [
    "실 가닥을 자르지 않고 그대로 몸에 둘러야겠어",
    "실을 짐승 기름에 적셔 뭉쳐 놓아야겠어",
    "가락바퀴를 돌려 실을 고르게 꼬아 뽑은 뒤 엮어서 짜 보자!",
    "실을 전부 모닥불 곁에 던져 말리기만 해야겠어"
   ],
   "correct": 2,
   "ok": "옳은 생각이다. 이제 가락바퀴를 실제로 돌려, 실을 고르게 꼬아 뽑아 보자.",
   "no": "그렇게는 옷감이 되지 않는다. 가락바퀴로 실을 고르게 꼬아 뽑은 뒤 엮어 짜야 한다. 다시 시도하라."
  },
  "mini": {
   "type": "spin",
   "intro": "가운데 구멍에 막대를 꽂은 둥근 가락바퀴를 손끝으로 잡았다. 이 바퀴를 쉬지 않고 계속 돌려야, 삼실이 고르게 꼬이며 뽑혀 나온다. 가락바퀴를 손가락으로 눌러 돌려 보자.",
   "ok": "실이 고르게 꼬여 길게 뽑혀 나온다. 가락바퀴의 무게가 회전을 오래 유지시켜 준 덕분에, 가는 삼 줄기가 끊어지지 않는 튼튼한 실이 되었다. 이렇게 뽑은 실을 뼈바늘로 엮어 옷감을 짜니, 가죽만 걸치던 마을 사람들도 이제 짜인 옷을 입을 수 있게 되었다."
  },
  "cat": "life"
 },
 {
  "title": "움집 짓기",
  "icon": "🏠",
  "id": "umjip",
  "kind": "minigame",
  "area": "main",
  "pos": {
   "x": 16,
   "z": -6
  },
  "story": "당신은 마을의 집짓기 어른이다. 이제 사냥감을 따라 이리저리 옮겨 다니지 않고 이 강가에 오래 머물기로 했다. 비바람과 추위를 막아 줄 튼튼한 집이 필요하다.",
  "q": {
   "text": "이 강가에 오래 머물 집을 어떻게 지어야 하는가?",
   "choices": [
    "나뭇가지 몇 개만 엮어 지붕도 없이 세워 둬야겠어",
    "땅을 둥글게 파 내려가고 기둥과 서까래를 세운 뒤 풀과 흙으로 지붕을 덮자!",
    "짐승 가죽으로 천막만 쳐서 매번 다시 접어야겠어",
    "동굴을 찾아 마을 전체가 그리로 옮겨 가야겠어"
   ],
   "correct": 1,
   "ok": "옳은 생각이다. 반지하로 파 내려가 기둥을 세우고 지붕을 덮어야 한다는 걸 알았다. 이제 실제로 이 움집을 차례대로 지어 보자.",
   "no": "그렇게는 비바람과 추위를 막을 수 없다. 땅을 파고 기둥을 세워 지붕을 얹은 움집이 필요하다. 다시 판단하라."
  },
  "mini": {
   "type": "stack",
   "intro": "땅을 다지고 여러 재료를 모아 두었다. 순서를 잘못 세우면 지붕이 무너지거나 반지하 공간이 무용지물이 된다. 올바른 차례대로 하나씩 지어 보자.",
   "steps": [
    "땅을 둥글게 파 내려가 반지하 공간을 만든다",
    "파낸 자리 둘레에 기둥을 세우고 서까래를 얹는다",
    "서까래 위에 풀과 흙을 두툼하게 덮어 지붕을 완성한다",
    "안쪽 가운데에 화덕을 만들어 불씨를 놓는다"
   ],
   "ok": "차례대로 지은 움집이 비바람과 추위를 막아 선다. 반지하 공간은 겨울엔 따뜻하고 여름엔 서늘하며, 화덕까지 갖춘 이 집에서 마을 사람들은 이제 대대로 머물 수 있게 되었다.",
   "retry": "순서가 어긋나면 움집이 제대로 서지 않는다. 땅을 파고, 기둥과 서까래를 세우고, 지붕을 덮은 뒤 화덕을 놓는 차례를 다시 떠올려 보자."
  },
  "cat": "life"
 },
 {
  "title": "움집",
  "icon": "🏠",
  "id": "umjip-yumul",
  "kind": "inspect",
  "area": "main",
  "pos": {
   "x": 21,
   "z": -11
  },
  "hotspots": [
   {
    "label": "반지하 구조",
    "note": "땅을 둥글게 혹은 네모나게 파 내려가 바닥을 다졌소. 땅속으로 들어간 만큼 겨울바람을 막고 여름 더위도 식힐 수 있었소."
   },
   {
    "label": "기둥과 원뿔 지붕",
    "note": "파낸 자리 둘레에 기둥을 세우고 서까래를 얹어 뼈대를 만든 뒤, 풀과 흙을 두툼하게 덮어 비바람을 막는 원뿔 모양 지붕을 완성하였소."
   },
   {
    "label": "화덕 자리",
    "note": "움집 한가운데에는 화덕(불 땐 자리)이 있소. 이곳에서 음식을 익히고 추운 밤을 데우며, 불씨를 꺼뜨리지 않고 대대로 이어 갔소."
   }
  ],
  "cat": "life"
 },
 {
  "title": "원시 신앙과 기원제",
  "icon": "🌞",
  "id": "sinang",
  "kind": "minigame",
  "area": "main",
  "pos": {
   "x": 30,
   "z": -22
  },
  "story": "당신은 마을의 제사장이다. 올여름은 유난히 가물어 곡식이 자라지 않는다. 사람의 손으로는 어찌할 수 없는 하늘의 뜻, 마을 사람들이 근심 어린 눈으로 당신을 바라본다.",
  "q": {
   "text": "가뭄을 걷어 내고 마을의 안녕을 빌려면, 지금 무엇을 해야 하는가?",
   "choices": [
    "아무것도 하지 않고 그저 비가 오기만을 조용히 기다려야겠어",
    "마을의 곡식 창고를 모두 태워 하늘에 항의해야겠어",
    "제사장 혼자 산속으로 들어가 다시는 마을에 나타나지 말아야겠어",
    "해와 땅의 정령에게 정성껏 제물을 올리고 온 마을이 함께 기원제를 지내자!"
   ],
   "correct": 3,
   "ok": "정성이 하늘에 닿을 차례다. 제단 앞에 선 그대는 해와 땅, 물과 불의 순서로 제물을 올려야 한다. 이제 그 순서를 놓치지 않고 정성껏 따라 해 보자.",
   "no": "그래서는 마을의 근심을 달랠 수 없다. 정성껏 제물을 올리고 온 마을이 함께 기원해야 한다. 다시 판단하라."
  },
  "mini": {
   "type": "memory",
   "intro": "제사장이 해와 땅, 물과 불의 순서로 정성껏 제물을 올린다. 그 순서를 눈여겨보았다가, 그대로 다시 짚어 기원을 이어가자.",
   "ok": "정성이 하늘에 닿았다. 해와 땅, 물과 불 앞에 순서를 어기지 않고 제물을 올리자, 온 마을이 한마음으로 빈 기원이 며칠 뒤 반가운 비로 돌아온다. 자연을 향한 이 믿음은 대대로 마을을 하나로 묶어 줄 것이다.",
   "retry": "순서가 어긋나면 정성이 흐트러진다. 해와 땅, 물과 불의 순서를 다시 눈여겨보고 처음부터 따라 해 보자."
  },
  "cat": "life"
 },
 {
  "title": "대홍수로부터 마을 지키기",
  "icon": "🌊",
  "id": "hongsu",
  "area": "main",
  "pos": {
   "x": 0,
   "z": -40
  },
  "story": "그대는 온 마을과 함께 제방을 쌓아 움집을 지켜 내고, 소중한 곡식 종자까지 안전하게 갈무리하였소.",
  "war": true,
  "stages": [
   {
    "story": "그대는 온 마을과 함께 제방을 쌓아 움집을 지켜 내고, 소중한 곡식 종자까지 안전하게 갈무리하였소.",
    "q": {
     "text": "불어나는 강물로부터 마을을 지키려면 지금 무엇을 해야 하는가?",
     "choices": [
      "온 마을 사람이 힘을 모아 흙과 돌로 강가에 제방을 쌓자!",
      "제방 없이 그대로 두고 각자 집 안에서 기다려야겠어",
      "움집의 지붕을 모두 걷어 내 빗물이 잘 빠지게 해야겠어",
      "곡식 창고 문을 활짝 열어 곡식이 떠내려가게 둬야겠어"
     ],
     "correct": 0,
     "ok": "빠른 판단이다. 온 마을이 힘을 모아 흙과 돌을 쌓아 올리자, 제방이 불어난 강물을 겨우 막아 낸다. 움집과 창고는 무사하지만, 들판 한쪽은 이미 물에 잠기기 시작했다. 이제 남은 곡식을 지켜야 한다.",
     "no": "그렇게는 마을이 통째로 잠긴다. 온 마을이 힘을 모아 제방을 쌓아야 한다. 다시 판단하라."
    }
   },
   {
    "story": "",
    "q": {
     "text": "물에 잠기는 밭에서 다음 농사를 위한 씨앗을 지키려면 어떻게 해야 하는가?",
     "choices": [
      "밭에 심긴 곡식을 그대로 두고 손을 놓아야겠어",
      "씨앗을 강물에 던져 멀리 떠내려 보내야겠어",
      "물이 닿지 않는 높은 곳에 토기를 옮겨 곡식 종자를 따로 갈무리하자!",
      "씨앗을 전부 그 자리에서 먹어 없애야겠어"
     ],
     "correct": 2,
     "ok": "지혜로운 선택이다. 높은 곳으로 옮긴 토기 안에 소중한 씨앗이 안전하게 갈무리된다. 강물이 물러간 뒤, 마을은 이 씨앗으로 다시 밭을 일구어 이듬해에도 풍년을 맞을 수 있게 되었다. 당신들은 마을을 두 번이나 지켜 냈다!",
     "no": "그렇게는 다음 농사를 지을 씨앗이 남지 않는다. 높은 곳으로 씨앗을 옮겨 갈무리해야 한다. 다시 판단하라."
    }
   }
  ],
  "cat": "event"
 }
];

export const QUESTS_NEO = [ ...QUESTS_NEO_BASE,
  ...GATES_NEO.map(g => ({ id:g.id, kind:'gate', cat:'event', icon:g.icon,
    title:g.title, area:g.area, pos:g.pos, to:g.to, confirm:g.confirm })) ];

export const NPCS_NEO = [
 {
  "area": "main",
  "pos": {
   "x": 14,
   "z": -4
  },
  "color": "#7A6248",
  "icon": "👴",
  "lines": [
   "우리 마을에 온 걸 환영하네. 여기선 다들 흙을 빚고, 씨를 뿌리며 살아간다네.",
   "예전엔 먹을 것을 찾아 이리저리 떠돌았지만, 이젠 이 강가에 뿌리를 내렸어. 한곳에 오래 머무니 살림이 다 달라지더군."
  ]
 },
 {
  "area": "main",
  "pos": {
   "x": -22,
   "z": 18
  },
  "color": "#8C5A4E",
  "icon": "🧕",
  "lines": [
   "가락바퀴로 실을 뽑아 옷감을 짜고 있소. 겨울이 오기 전에 다 지어야 하는데.",
   "가락바퀴를 쉬지 않고 돌려야 실이 고르게 뽑히오. 손이 게으르면 실이 금세 끊어지다오."
  ]
 },
 {
  "area": "main",
  "pos": {
   "x": -10,
   "z": -16
  },
  "color": "#5E7048",
  "icon": "🧑",
  "lines": [
   "빗살무늬를 촘촘히 새겨야 정령이 깃들어 곡식이 상하지 않는다고들 하다오.",
   "무늬 없이 밋밋한 그릇보다, 이렇게 정성껏 새긴 그릇이 훨씬 오래간다는 걸 나는 알소."
  ]
 },
 {
  "area": "main",
  "pos": {
   "x": 20,
   "z": 10
  },
  "color": "#6B7A3C",
  "icon": "👨",
  "lines": [
   "작년보다 조를 더 많이 심었소. 올해도 풍년이 들기를 빌어야다오.",
   "사냥만 하던 시절엔 하루 벌어 하루 먹고 살았는데, 이제는 가을 곡식을 창고에 쌓아 두고 겨울을 준비하오."
  ]
 },
 {
  "area": "main",
  "pos": {
   "x": -6,
   "z": -30
  },
  "color": "#41708C",
  "icon": "🎣",
  "lines": [
   "요 며칠 강물이 심상치 않소… 비가 계속 오면 걱정이오.",
   "그래도 이 강 덕분에 우리 마을이 여기 자리 잡을 수 있었다오. 물고기도 잡고, 마실 물도 얻소."
  ]
 },
 {
  "area": "main",
  "pos": {
   "x": 2,
   "z": -11
  },
  "color": "#9C7A52",
  "icon": "🧓",
  "lines": [
   "숫돌에 갈고 또 갈아야 날이 서는 법이지. 급하게 힘만 준다고 날카로워지지 않아.",
   "내가 젊었을 땐 뗀석기만 썼는데, 이제는 갈아 만든 도구가 훨씬 오래가더군."
  ]
 },
 {
  "area": "main",
  "pos": {
   "x": -32,
   "z": -12
  },
  "color": "#5E6B48",
  "icon": "🏹",
  "lines": [
   "농사를 짓기 시작했다고 해서 사냥을 아예 그만둔 건 아니라네. 아직은 사냥과 채집도 살림에 큰 보탬이 되지.",
   "멧돼지 발자국을 봤는데 오늘은 그냥 지나쳤어. 요즘은 마을 일이 더 바빠서 말이야."
  ]
 },
 {
  "area": "main",
  "pos": {
   "x": 8,
   "z": 6
  },
  "color": "#B08A5E",
  "icon": "🐚",
  "lines": [
   "강가에서 조개를 잡아다 이렇게 쌓아 두고 있소. 살은 먹고, 껍데기는 장신구로도 쓰다오.",
   "조개껍데기에 구멍을 뚫어 목걸이를 만들면 아이들이 참 좋아하오."
  ]
 },
 {
  "area": "main",
  "pos": {
   "x": 27,
   "z": -19
  },
  "color": "#8C5A6E",
  "icon": "🙏",
  "lines": [
   "제사장님을 도와 제단을 돌보고 있소. 정성이 부족하면 하늘도 땅도 마음을 열지 않는다고 하셨다오.",
   "가뭄이 들 때마다 온 마을이 여기 모여 함께 빌소. 그 마음들이 모이면 정말 하늘에 닿는 것 같기도 하오."
  ]
 },
 {
  "area": "main",
  "pos": {
   "x": -6,
   "z": 18
  },
  "color": "#4A7E77",
  "icon": "🧒",
  "lines": [
   "저기 나루터에 배 보이시다오? 아버지가 만드신 것이오. 나도 크면 배를 저어 보고 싶소.",
   "요즘은 강가에서 노는 게 제일 재밌소. 예전엔 매일 이사 다녔다는데, 전 여기가 좋소."
  ]
 }
];

export const RELICS_NEO = [
 {
  "id": "r-gansingi",
  "icon": "🪓",
  "name": "간석기",
  "era": "neolithic",
  "from": "gansingi",
  "line": "힘이 실리는 순간을 놓치지 않고 좌우 날을 번갈아 갈아 내자, 거칠던 돌은 어느새 매끈하고 날카로운 간석기가 된다."
 },
 {
  "id": "r-bitsal",
  "icon": "🏺",
  "name": "빗살무늬토기",
  "era": "neolithic",
  "from": "bitsal",
  "line": "그러하오!"
 },
 {
  "id": "r-garak-yumul",
  "icon": "🧵",
  "name": "가락바퀴",
  "era": "neolithic",
  "from": "garak-yumul",
  "line": "그러하오."
 },
 {
  "id": "r-galdolgalpan",
  "icon": "🥣",
  "name": "갈돌",
  "era": "neolithic",
  "from": "galdolgalpan",
  "line": "그러하오."
 },
 {
  "id": "r-umjip-yumul",
  "icon": "🏠",
  "name": "움집",
  "era": "neolithic",
  "from": "umjip-yumul",
  "line": ""
 },
 {
  "id": "r-nongsa",
  "icon": "🌾",
  "name": "농사의 시작",
  "era": "neolithic",
  "from": "nongsa",
  "line": "통통한 낟알만 정성껏 골라 갈무리했다."
 },
 {
  "id": "r-garakbakwi",
  "icon": "🧶",
  "name": "가락바퀴",
  "era": "neolithic",
  "from": "garakbakwi",
  "line": "실이 고르게 꼬여 길게 뽑혀 나온다."
 },
 {
  "id": "r-umjip",
  "icon": "🏠",
  "name": "움집",
  "era": "neolithic",
  "from": "umjip",
  "line": "차례대로 지은 움집이 비바람과 추위를 막아 선다."
 },
 {
  "id": "r-sinang",
  "icon": "🌞",
  "name": "원시 신앙",
  "era": "neolithic",
  "from": "sinang",
  "line": "정성이 하늘에 닿았다."
 }
];

function buildGroundNeo(x, z){ return P.eraProp("buildGroundNeo", x, z); }
function buildRiverNeo(x, z){ return P.eraProp("buildRiverNeo", x, z); }
function buildHillsNeo(x, z){ return P.eraProp("buildHillsNeo", x, z); }
function buildReedsNeo(x, z){ return P.eraProp("buildReedsNeo", x, z); }
function buildTreesNeo(x, z){ return P.eraProp("buildTreesNeo", x, z); }
function buildRocksNeo(x, z){ return P.eraProp("buildRocksNeo", x, z); }
function buildBushesNeo(x, z){ return P.eraProp("buildBushesNeo", x, z); }
function buildShellMoundNeo(x, z){ return P.eraProp("buildShellMoundNeo", x, z); }
function buildCanoeNeo(x, z){ return P.eraProp("buildCanoeNeo", x, z); }
function buildFieldFenceNeo(x, z){ return P.eraProp("buildFieldFenceNeo", x, z); }
function buildVillageNeo(x, z){ return P.eraProp("buildVillageNeo", x, z); }
function buildFarmFieldNeo(x, z){ return P.eraProp("buildFarmFieldNeo", x, z); }
function buildKilnNeo(x, z){ return P.eraProp("buildKilnNeo", x, z); }
function buildShrineNeo(x, z){ return P.eraProp("buildShrineNeo", x, z); }
function buildFloodZoneNeo(x, z){ return P.eraProp("buildFloodZoneNeo", x, z); }

export function buildNeo_main(){
  buildGroundNeo();
  buildRiverNeo();
  S.buildMountains();
  buildHillsNeo();
  buildTreesNeo();
  buildReedsNeo();
  buildRocksNeo();
  buildBushesNeo();
  buildShellMoundNeo();
  buildCanoeNeo();
  buildVillageNeo();
  buildFarmFieldNeo();
  buildFieldFenceNeo();
  buildKilnNeo();
  buildShrineNeo();
  buildFloodZoneNeo();
}

export const AREA_BUILDERS_NEO = {
  "main": buildNeo_main
};
