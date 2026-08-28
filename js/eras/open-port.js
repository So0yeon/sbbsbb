/* 자동 생성 — tools/convert.mjs · 원본 docs/content/10-open-port.md
   손으로 고치지 마세요. 문체는 tools/style-hao.mjs 규칙을 따릅니다. */
import * as S from '../engine/scene-helpers.js';
import * as P from '../engine/props.js';

export const AREAS_OPEN = {
 "hanseong": {
  "name": "한성 종로",
  "bg": "#E4E1CB",
  "spawn": {
   "x": 0,
   "z": 20
  },
  "bound": 45,
  "loading": "한성 종로로 이동하는 중…"
 },
 "jemulpo": {
  "name": "제물포 개항장",
  "bg": "#B9D6D9",
  "spawn": {
   "x": 0,
   "z": 18
  },
  "bound": 40,
  "loading": "제물포 개항장으로 이동하는 중…"
 },
 "jeongdong": {
  "name": "정동 공사관 거리",
  "bg": "#E4E1CB",
  "spawn": {
   "x": 0,
   "z": 16
  },
  "bound": 36,
  "loading": "정동 공사관 거리로 이동하는 중…"
 },
 "ganghwa": {
  "name": "강화도",
  "bg": "#B9D6D9",
  "spawn": {
   "x": 0,
   "z": 16
  },
  "bound": 36,
  "loading": "강화도로 이동하는 중…"
 }
};

export const GATES_OPEN = [
 {
  "id": "gate-hanseong-jemulpo-0",
  "icon": "🚂",
  "title": "제물포로 가는 기찻길",
  "area": "hanseong",
  "pos": {
   "x": -30,
   "z": -20
  },
  "to": "jemulpo",
  "confirm": "경인선 기차를 타고 제물포로 가겠소?"
 },
 {
  "id": "gate-jemulpo-hanseong-1",
  "icon": "🚂",
  "title": "한성으로 돌아가는 길",
  "area": "jemulpo",
  "pos": {
   "x": 0,
   "z": 30
  },
  "to": "hanseong",
  "confirm": "한성으로 돌아가겠소?"
 },
 {
  "id": "gate-hanseong-jeongdong-2",
  "icon": "🚩",
  "title": "정동 공사관 거리로",
  "area": "hanseong",
  "pos": {
   "x": 30,
   "z": -20
  },
  "to": "jeongdong",
  "confirm": "정동 거리로 향하겠소?"
 },
 {
  "id": "gate-jeongdong-hanseong-3",
  "icon": "🚩",
  "title": "종로로 돌아가는 길",
  "area": "jeongdong",
  "pos": {
   "x": 0,
   "z": 26
  },
  "to": "hanseong",
  "confirm": "종로로 돌아가겠소?"
 },
 {
  "id": "gate-jemulpo-ganghwa-4",
  "icon": "⛵",
  "title": "배를 타고 강화도로",
  "area": "jemulpo",
  "pos": {
   "x": -26,
   "z": -18
  },
  "to": "ganghwa",
  "confirm": "강화도로 건너가겠소?"
 },
 {
  "id": "gate-ganghwa-jemulpo-5",
  "icon": "⛵",
  "title": "제물포로 돌아가는 뱃길",
  "area": "ganghwa",
  "pos": {
   "x": 0,
   "z": 26
  },
  "to": "jemulpo",
  "confirm": "제물포로 돌아가겠소?"
 }
];

export const QUESTS_OPEN_BASE = [
 {
  "title": "척화비 앞에서",
  "icon": "🪨",
  "id": "cheokhwabi-choice",
  "kind": "choice",
  "area": "ganghwa",
  "pos": {
   "x": 0,
   "z": -6
  },
  "contentId": "cheokhwabi",
  "setup": "당신은 강화도 나루터의 젊은 뱃사공이다. 마을 어귀에 새로 세워진 돌비석에는 \"서양 오랑캐가 쳐들어오는데 싸우지 않으면 화친하는 것이요, 화친을 주장함은 나라를 파는 것\"이라 새겨져 있다. 몇 해 전 프랑스와 미국의 배가 이 앞바다까지 들어왔다 물러갔다. 어른들은 문을 굳게 닫아야 한다 하고, 어떤 이는 저들의 배와 총을 보았느냐고 되묻는다.",
  "prompt": "나라의 문을 두고, 지금 당신은 어떻게 생각하는가?",
  "choices": [
   {
    "label": "문을 굳게 닫아야 한다. 저들에게 한 번 열어 주면 끝이 없을 것이다",
    "outcome": "당신의 말에 고개를 끄덕이는 이가 많다. 실제로 조선은 한동안 문을 닫아걸었고, 그 사이 이웃 나라들은 저마다 다른 길을 걸었다."
   },
   {
    "label": "저들의 배와 무기를 먼저 알아야 한다. 알아야 지킬 수도 있지 않겠는가",
    "outcome": "몇몇 어른이 못마땅한 얼굴을 하지만, 조용히 당신 곁으로 오는 이들도 있다. 아는 것과 굽히는 것은 다르다는 말이 마음에 남는다."
   },
   {
    "label": "장사만이라도 트면 마을 살림이 나아지지 않겠는가",
    "outcome": "현실적인 이야기다. 다만 어떤 조건으로 트느냐에 따라 이야기가 완전히 달라진다는 것을, 당신은 아직 알지 못한다."
   }
  ],
  "epilogue": "실제 역사에서는 흥선대원군이 전국에 척화비를 세워 통상 거부의 뜻을 밝혔소. 하지만 1876년, 일본이 군함을 앞세워 오자 조선은 결국 문을 열게 되오. 문을 여느냐 닫느냐보다 <b>어떤 조건으로 여느냐</b>가 더 중요한 문제였소.",
  "cat": "relic",
  "img": [
   "cheokhwabi.jpg"
  ]
 },
 {
  "title": "강화도 조약을 읽다",
  "icon": "📜",
  "id": "ganghwa-treaty-q",
  "area": "ganghwa",
  "pos": {
   "x": 14,
   "z": 8
  },
  "contentId": "ganghwa-treaty",
  "story": "당신은 조약문을 옮겨 적는 젊은 관리다. 1876년, 일본 군함이 앞바다에 늘어선 가운데 조약이 맺어졌다. 조약문에는 낯선 조항이 섞여 있다. \"일본인이 조선의 항구에서 죄를 지으면 일본 관리가 일본 법으로 재판한다.\" 그리고 \"일본 상품에는 세금을 매기지 않는다.\"",
  "q": {
   "text": "이 두 조항을 옮겨 적으며, 당신은 무엇이 문제라고 판단하는가?",
   "choices": [
    "조약을 맺었으니 조항의 내용은 따질 필요가 없다",
    "우리 땅에서 우리 법이 통하지 않고, 세금도 못 걷는다면 나라의 권한이 깎이는 것이다!",
    "일본 물건이 싸게 들어오니 백성에게 이로운 일이다",
    "글자가 어려우니 그대로 베껴 적기만 하면 된다"
   ],
   "correct": 1,
   "ok": "그대의 판단이 옳다. 남의 나라 사람을 우리 법으로 재판하지 못하고 관세도 매기지 못한다면, 그것은 대등한 조약이 아니다. 강화도 조약은 우리나라 최초의 근대적 조약이었지만, 조선에 크게 불리한 <b>불평등 조약</b>이었다.",
   "no": "다시 조항을 읽어 보라. 우리 땅에서 우리 법이 통하지 않는다는 것, 세금을 매길 수 없다는 것이 무엇을 뜻하는지 생각해 보라."
  },
  "cat": "event",
  "img": [
   "ganghwa-treaty.jpg"
  ]
 },
 {
  "title": "개항장의 낯선 물건들",
  "icon": "⚓",
  "id": "gaehang-choice",
  "kind": "choice",
  "area": "jemulpo",
  "pos": {
   "x": 0,
   "z": -6
  },
  "setup": "당신은 제물포 장터에서 포목을 파는 상인이다. 항구가 열린 뒤로 낯선 물건들이 쏟아져 들어온다. 서양에서 온 기계로 짠 무명천은 우리 손베보다 훨씬 곱고 값도 싸다. 손님들이 하나둘 그쪽으로 발길을 옮긴다. 옆자리 상인은 아예 저 물건을 떼다 팔기 시작했다.",
  "prompt": "쏟아져 들어오는 새 물건 앞에서, 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "나도 서양 물건을 떼어다 팔아 장사를 이어 가자",
    "outcome": "당장 손님은 돌아온다. 다만 우리 손으로 짜던 베틀은 하나둘 멈추고, 마을에서 베 짜는 소리가 줄어든다."
   },
   {
    "label": "우리 손으로 짠 베의 질을 앞세워 계속 팔아 보자",
    "outcome": "알아보는 손님이 남아 있다. 값싼 물건에 밀려 힘들지만, 손베를 찾는 이들의 발길은 끊기지 않는다."
   },
   {
    "label": "주변 상인들과 뜻을 모아 값과 물량을 함께 정해 보자",
    "outcome": "혼자보다는 낫다. 실제로 이 무렵 상인들은 조합을 만들어 함께 버티려 애썼다."
   }
  ],
  "epilogue": "개항 이후 값싼 공장 제품이 들어오면서 손으로 물건을 만들던 사람들의 삶이 크게 흔들렸소. 새 문물은 편리함만 가져온 것이 아니라, <b>누군가의 일자리와 생활을 바꾸는 일</b>이기도 하였소.",
  "cat": "event"
 },
 {
  "title": "경인선, 처음 달린 기차",
  "icon": "🚂",
  "id": "gyeongin",
  "kind": "minigame",
  "area": "jemulpo",
  "pos": {
   "x": 16,
   "z": 6
  },
  "story": "당신은 노량진과 제물포를 오가며 짐을 나르던 짐꾼이다. 1899년, 두 곳을 잇는 철길이 놓이고 쇠로 만든 수레가 연기를 뿜으며 달린다. 걸어서 열두 시간 걸리던 길을 한 시간 남짓에 간다고 한다. 사람들은 신기해하면서도 두려워한다. 당신의 일감도 눈에 띄게 줄었다.",
  "q": {
   "text": "이 철도가 놓인 뒤 사람들의 생활에 일어난 가장 큰 변화는 무엇인가?",
   "choices": [
    "아무것도 달라지지 않았다",
    "멀고 가까움에 대한 감각이 달라지고, 사람과 물건이 오가는 방식이 통째로 바뀌었다!",
    "기차 삯이 비싸 아무도 타지 않았다",
    "철도가 놓이자 짐꾼의 일감이 오히려 늘었다"
   ],
   "correct": 1,
   "ok": "그렇다. 하루가 걸리던 길이 한 시간이 되자, 사람들이 생각하는 <b>거리와 시간</b> 자체가 달라졌다. 그 철길이 어떻게 놓였는지, 직접 깔아 보자.",
   "no": "다시 생각해 보라. 열두 시간 걸리던 길이 한 시간이 된다면, 사람들의 하루와 생활은 어떻게 달라지겠는가."
  },
  "mini": {
   "type": "stack",
   "steps": [
    "지나갈 길을 재고 땅을 고른다",
    "자갈을 두껍게 깔아 바닥을 다진다",
    "자갈 위에 침목을 일정한 간격으로 놓는다",
    "침목 위에 쇠 레일을 얹어 못으로 박는다",
    "기관차를 올려 시험 삼아 달려 본다"
   ],
   "intro": "제물포에서 노량진까지, 아직 아무것도 없는 맨땅이다. 순서가 어긋나면 레일이 내려앉아 기차가 지날 수 없다. 차례대로 철길을 놓아 보자.",
   "ok": "기적 소리와 함께 기관차가 처음으로 철길 위를 달린다. 열두 시간 걸리던 길이 한 시간이 되었다. 다만 이 철길은 짐꾼의 일감을 앗아 가기도 했고, 훗날 다른 나라가 물자와 군대를 실어 나르는 길로 쓰이기도 했다. <b>새로 놓인 길은 언제나 한 방향으로만 쓰이지 않는다.</b>",
   "retry": "순서가 어긋나 레일이 내려앉았다. 땅을 고르고, 자갈을 깔고, 침목을 놓은 뒤 레일을 얹는 차례를 다시 떠올려 보자."
  },
  "cat": "exchange"
 },
 {
  "title": "상투를 자르라는 명",
  "icon": "✂️",
  "id": "danbal-choice",
  "kind": "choice",
  "area": "hanseong",
  "pos": {
   "x": -12,
   "z": -6
  },
  "setup": "당신은 종로에서 잡화를 파는 장사꾼이다. 1895년, 나라에서 상투를 자르라는 명이 내려왔다. 관리들이 길목을 지키고 서서 지나가는 사람의 상투를 가위로 자른다. 부모에게 받은 몸을 함부로 하지 않는 것이 효라 배웠는데, 자르지 않으면 장사를 나갈 수도 없다. 어제는 이웃 어른이 상투를 잘리고 사흘째 집 밖으로 나오지 않는다.",
  "prompt": "지금 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "명을 따라 상투를 자르고 장사를 계속하자",
    "outcome": "거울 속 낯선 얼굴이 한동안 어색하다. 먹고사는 일은 이어 가지만, 어른들 앞에 서기가 오래도록 부끄럽다."
   },
   {
    "label": "상투만은 지키겠다. 장사를 쉬더라도 버텨 보자",
    "outcome": "며칠 문을 닫으니 살림이 빠듯하다. 그래도 같은 마음인 이웃들이 조용히 쌀을 나눠 준다."
   },
   {
    "label": "갓을 눌러쓰고 사람 없는 새벽에만 다녀 보자",
    "outcome": "용케 며칠은 넘긴다. 지키는 것도 따르는 것도 아닌 하루하루가 이어진다."
   }
  ],
  "epilogue": "단발령에 대한 반발은 매우 컸소. 위생과 편리를 내세웠지만, 사람들에게 머리 모양은 오랜 <b>가치관과 정체성</b>의 문제였소. 새 제도가 좋은 뜻이더라도 사람들의 생각과 생활을 헤아리지 않으면 받아들여지기 어렵다는 것을 보여 준 일이었소.",
  "cat": "event"
 },
 {
  "title": "불타는 전차 앞에서",
  "icon": "🚋",
  "id": "jeoncha-choice",
  "kind": "choice",
  "area": "hanseong",
  "pos": {
   "x": 12,
   "z": -8
  },
  "setup": "당신은 종로 거리를 지나던 사람이다. 올해 처음 전차가 다니기 시작했다. 말도 소도 없이 저 혼자 굴러가는 쇳덩이를 보러 지방에서 사람들이 올라올 정도였다. 그런데 오늘, 달리던 전차에 어린아이가 치여 목숨을 잃었다. 성난 사람들이 전차를 세우고 불을 지르려 한다. \"저 괴물을 이 거리에서 몰아내자!\"",
  "prompt": "성난 사람들 틈에서, 지금 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "함께 나서서 전차를 멈춰 세우자. 사람이 죽지 않았는가",
    "outcome": "분노는 정당하다. 실제로 이날 사람들은 전차를 불태웠다. 새 문물이 사람의 안전보다 앞설 수 없다는 목소리였다."
   },
   {
    "label": "전차를 없애는 대신 안전하게 다닐 방법을 요구하자고 외쳐 보자",
    "outcome": "목소리는 잘 들리지 않지만, 몇 사람이 걸음을 멈춘다. 무엇을 없앨지가 아니라 어떻게 고칠지를 묻는 목소리다."
   },
   {
    "label": "무서워 뒤로 물러나 지켜보자",
    "outcome": "타오르는 불길을 멀찍이 바라본다. 편리함에 놀라던 마음과 아이를 잃은 슬픔이 한 거리에서 뒤엉킨다."
   }
  ],
  "epilogue": "1899년 서대문과 청량리를 잇는 전차가 개통되고 얼마 지나지 않아 실제로 이런 일이 있었소. 새 문물은 놀라움과 편리함만 준 것이 아니라 <b>사고와 두려움</b>도 함께 가져왔소. 사람들은 그것을 무작정 받아들이지도, 무작정 거부하지도 않았라오.",
  "cat": "life"
 },
 {
  "title": "어떤 글자로 신문을 낼 것인가",
  "icon": "📰",
  "id": "dongnip-sinmun",
  "kind": "minigame",
  "area": "hanseong",
  "pos": {
   "x": 0,
   "z": 10
  },
  "contentId": "dongnimmun",
  "story": "당신은 새로 창간할 신문의 편집을 맡았다. 지금까지 나라의 글은 대부분 한문으로 쓰였다. 한문을 아는 사람은 주로 양반이고, 백성 가운데 한문을 읽는 이는 매우 드물다. 그런데 이 신문은 나라 안의 소식을 널리 알리려고 만드는 것이다.",
  "q": {
   "text": "더 많은 사람이 읽게 하려면, 어떤 글자로 신문을 내야 하는가?",
   "choices": [
    "지금까지 그래 왔듯 한문으로만 내야 한다",
    "누구나 쉽게 읽을 수 있도록 한글로 내고, 낱말 사이를 띄어 써 보자!",
    "글자를 새로 만들어 써야 한다",
    "그림만 싣고 글자는 넣지 말아야 한다"
   ],
   "correct": 1,
   "ok": "한글로 낸 신문은 글을 조금만 아는 사람도 읽을 수 있었다. <b>정보를 아는 사람이 늘어난다는 것</b>은 곧 세상일에 의견을 낼 수 있는 사람이 늘어난다는 뜻이었다. 이제 직접 신문 한 장을 찍어 보자.",
   "no": "다시 생각해 보라. 백성 대부분이 읽지 못하는 글자로 낸다면, 널리 알리려는 목적을 이룰 수 있겠는가."
  },
  "mini": {
   "type": "stack",
   "steps": [
    "알릴 일을 취재해 원고를 쓴다",
    "한문 활자 대신 한글 활자를 골라 놓는다",
    "낱말 사이를 띄어 판을 짠다",
    "판에 먹을 발라 종이에 찍어 낸다",
    "값을 싸게 매겨 저잣거리에 내다 판다"
   ],
   "intro": "인쇄소 안이다. 활자를 뽑아 판을 짜고 먹을 발라 찍기까지, 순서가 어긋나면 종이만 버린다. 차례대로 신문 한 장을 만들어 보자.",
   "ok": "갓 찍어 낸 신문에서 먹 냄새가 난다. 한글로 짜고 낱말을 띄어 쓴 이 신문은, 글을 조금만 아는 사람도 소리 내어 읽을 수 있었다. 실제로 저잣거리에서 한 사람이 읽으면 여럿이 둘러서서 함께 들었다고 한다. <b>읽을 수 있는 사람이 늘어난 만큼, 말할 수 있는 사람도 늘어났다.</b>",
   "retry": "순서가 어긋나 판이 헝클어졌다. 원고를 쓰고, 활자를 고르고, 판을 짜고, 찍어 내는 차례를 다시 떠올려 보자."
  },
  "cat": "relic",
  "img": [
   "dongnimmun.jpg"
  ]
 },
 {
  "title": "엇갈리는 증언",
  "icon": "📝",
  "id": "jemulpo-testimony",
  "kind": "choice",
  "area": "jemulpo",
  "pos": {
   "x": -22,
   "z": -2
  },
  "prompt": "같은 개항을 두고 왜 이렇게 다르게 말할까?",
  "choices": [
   {
    "label": "label:'누군가 거짓말을 하고 있다'",
    "outcome": ""
   },
   {
    "label": "outcome:'그렇게 의심할 수도 있다. 하지만 수첩을 다시 보라. 네 사람 모두 <b>자기가 직접 겪은 일</b>을 말하고 있다. 베틀을 멈춘 것도, 일감이 는 것도 다 사실이다.'",
    "outcome": ""
   },
   {
    "label": "label:'하는 일과 처지가 달라서 겪은 일이 서로 달랐다'",
    "outcome": ""
   },
   {
    "label": "outcome:'그렇다. 값싼 천이 들어온 것은 베 짜던 이에게는 손해였지만 사는 사람에게는 이득이었다. 기차는 짐꾼의 일감을 줄였지만 부두 인부에게는 배를 더 불러왔다. <b>하나의 사건이 자리에 따라 다르게 닿은 것이다.</b>'",
    "outcome": ""
   },
   {
    "label": "label:'시간이 지나 기억이 흐려졌다'",
    "outcome": ""
   },
   {
    "label": "outcome:'기억은 흐려지기도 한다. 다만 이 사람들은 지금 눈앞에서 겪고 있는 일을 말했다. 흐려진 기억이 아니라 <b>서로 다른 자리</b>가 다른 이야기를 만든 것이다.'",
    "outcome": ""
   }
  ],
  "epilogue": "한 가지 일이 모든 사람에게 똑같이 좋거나 나쁘지는 않소. 개항은 누군가에게 기회였고 누군가에게는 잃는 일이었다오.<br><br>그래서 역사를 볼 때는 \"무슨 일이 있었나\"만이 아니라 <b>\"누구의 이야기인가\"</b>를 함께 물어야 하오. 여러 사람의 말을 나란히 놓고 견주어 보는 것, 그것이 역사를 읽는 방법이라오.",
  "cat": "life"
 },
 {
  "title": "딸을 학교에 보낼 것인가",
  "icon": "🎒",
  "id": "yeohaksaeng-choice",
  "kind": "choice",
  "area": "jeongdong",
  "pos": {
   "x": 0,
   "z": -6
  },
  "setup": "당신은 정동에 사는 아이의 어머니다. 담장 너머에 여자아이들을 가르치는 학교가 문을 열었다. 글과 셈은 물론이고 서양의 학문까지 가르친다고 한다. 이웃들은 여자가 배워서 무엇에 쓰느냐고 혀를 찬다. 딸아이는 담장 앞을 몇 번이나 서성이다 돌아온다. 처음에는 학생이 단 한 명뿐이었다고 한다.",
  "prompt": "딸아이의 눈을 보며, 지금 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "남들이 뭐라 하든 학교에 보내자",
    "outcome": "수군거림이 한동안 이어진다. 그래도 딸아이는 매일 아침 담장 안으로 씩씩하게 걸어 들어간다."
   },
   {
    "label": "집안일을 먼저 가르치고, 형편이 나아지면 그때 보내자",
    "outcome": "딸아이는 아쉬운 얼굴로 고개를 끄덕인다. 담장 너머에서 들려오는 글 읽는 소리에 자꾸 귀를 기울인다."
   },
   {
    "label": "이웃들의 말이 옳을지 모른다. 보내지 않겠다",
    "outcome": "평온한 하루가 이어진다. 다만 몇 해 뒤, 그 학교를 나온 이들의 소식이 들려올 때마다 마음 한구석이 서늘하다."
   }
  ],
  "epilogue": "1886년에 세워진 이화학당은 학생이 단 한 명으로 시작하였소. 여자아이가 배우는 일 자체가 낯설던 때였소. 이곳을 나온 이들 가운데는 우리나라 최초의 여성 의사가 된 사람도 있소. <b>배울 기회가 누구에게 열려 있는가</b>는 그때도 지금도 중요한 물음이오.",
  "cat": "life"
 },
 {
  "title": "가배차, 낯선 검은 물",
  "icon": "☕",
  "id": "gabae-choice",
  "kind": "choice",
  "area": "jeongdong",
  "pos": {
   "x": 14,
   "z": 8
  },
  "setup": "당신은 정동의 서양식 호텔에서 일하는 젊은이다. 손님들이 마시는 검고 쓴 물을 사람들은 \"가배차\" 또는 \"양탕국\"이라 부른다. 서양 탕약처럼 생겼다는 뜻이다. 처음 한 모금을 넘긴 당신은 눈살을 찌푸렸다. 그런데 여기 드나드는 이들은 이 쓴 물을 마시며 오래도록 이야기를 나눈다.",
  "prompt": "이 낯선 음식을 두고, 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "쓴맛이 익숙해지도록 몇 번 더 마셔 보자",
    "outcome": "서너 번쯤 마시니 쓴맛 뒤의 향이 느껴진다. 낯선 것이 익숙해지는 데는 시간이 걸린다는 걸 알게 된다."
   },
   {
    "label": "우리 입에 맞게 설탕이나 우유를 섞어 보자",
    "outcome": "훨씬 마시기 좋다. 들어온 것을 그대로 두지 않고 <b>제 입맛에 맞게 바꾸는 것</b>, 그것도 문물을 받아들이는 한 가지 방법이다."
   },
   {
    "label": "우리 차가 더 좋다. 굳이 마실 이유가 없다",
    "outcome": "그것도 하나의 선택이다. 새로 들어온 것이 늘 더 좋은 것은 아니니까."
   }
  ],
  "epilogue": "개항 이후 커피, 빵, 짜장면 같은 낯선 음식이 들어왔소. 사람들은 그것을 그대로 받아들이기만 한 것이 아니라 <b>제 입맛에 맞게 바꾸어</b> 자기 것으로 만들었소. 오늘 우리가 먹는 음식 중에도 그렇게 만들어진 것이 많라오.",
  "cat": "life"
 },
 {
  "title": "두 번의 양요, 문을 열 것인가",
  "icon": "🛡️",
  "id": "daewongun-choice",
  "kind": "choice",
  "area": "ganghwa",
  "pos": {
   "x": -18,
   "z": -16
  },
  "setup": "당신은 강화도 광성보를 지키는 군관이다. 몇 해 전에는 프랑스 함대가 들이닥쳐 외규장각의 책을 실어 갔고, 올해는 미국 함대가 같은 물길로 올라와 포를 쏘았다. 어재연 장군과 병사들이 끝까지 맞섰지만 성은 무너졌다. 조정에서는 흥선대원군이 서양과는 화친할 수 없다며 온 나라에 비석을 세우라 이른다. 한편 바다 건너 일본은 이미 서양의 배와 총을 들여와 힘을 키우고 있다는 소문이 들린다.",
  "prompt": "그대라면 이 나라의 문을 어떻게 하겠는가?",
  "choices": [
   {
    "label": "문을 굳게 닫아 걸고 끝까지 맞서야 한다",
    "outcome": "당분간 외국 배는 물러간다. 그러나 그들이 가진 배와 총이 해마다 강해진다는 소식은 계속 들려온다."
   },
   {
    "label": "싸우더라도 저들의 배와 총만은 배워 두어야 한다",
    "outcome": "몇몇 관리가 몰래 서양 서적을 구해 읽기 시작한다. 그러나 조정의 뜻과 어긋나 크게 퍼지지는 못한다."
   },
   {
    "label": "문을 열고 교류하며 힘을 기르는 편이 낫다",
    "outcome": "그런 말을 입 밖에 냈다가는 당장 벼슬을 잃는다. 당신은 속으로만 생각을 삼킨다."
   }
  ],
  "epilogue": "프랑스가 쳐들어온 <b>병인양요</b>와 미국이 쳐들어온 <b>신미양요</b>를 겪은 뒤, 흥선대원군은 전국에 척화비를 세우고 문을 닫아걸었소. 침략을 막아 낸 것은 사실이지만, 그 사이 이웃 나라들은 새로운 문물을 받아들여 힘을 키우고 있었다오. 그리고 1876년, 조선은 일본의 군함 앞에서 <b>강화도 조약</b>을 맺으며 결국 문을 열게 되오. 스스로 준비해 여는 것과 떠밀려 여는 것은 이렇게 달랐소.",
  "cat": "event"
 },
 {
  "title": "사흘 만에 끝난 개혁",
  "icon": "📮",
  "id": "gapsin-choice",
  "kind": "choice",
  "area": "hanseong",
  "pos": {
   "x": -22,
   "z": -14
  },
  "setup": "1884년 겨울, 당신은 우정총국 개국을 축하하는 잔치에 초대받은 젊은 관리다. 며칠 전 김옥균이 조용히 당신을 찾아와 말했다. 나라를 이대로 두면 망한다고, 오늘 밤 큰일을 도모하니 함께하자고. 그들은 신분에 매인 낡은 제도를 없애고 새 나라를 세우겠다 한다. 다만 그 계획은 일본 공사의 군사를 빌리는 데 기대고 있고, 백성들에게는 아무것도 알리지 않았다.",
  "prompt": "잔치가 무르익는다. 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "뜻이 옳으니 함께 나서겠다",
    "outcome": "그날 밤 정변은 일어난다. 그러나 사흘째 되던 날 청의 군대가 들이닥치고, 당신은 쫓기는 몸이 된다."
   },
   {
    "label": "뜻은 옳으나 남의 군사에 기대는 것은 위태롭다. 물러서겠다",
    "outcome": "당신은 잔치 자리를 조용히 빠져나온다. 사흘 뒤, 함께하자던 이들의 이름이 역적으로 나붙는다."
   },
   {
    "label": "백성이 모르는 개혁은 개혁이 아니다. 말리겠다",
    "outcome": "김옥균은 당신의 말을 듣지 않는다. 시간이 없다는 것이다. 당신은 그 밤을 뜬눈으로 지새운다."
   }
  ],
  "epilogue": "<b>갑신정변</b>은 신분 제도를 없애고 세금을 고르게 매기는 등 앞선 내용을 담고 있었소. 하지만 준비가 짧았고, 일본의 힘에 기댔으며, 무엇보다 백성의 지지를 얻지 못하였다오. 청군이 들어오자 사흘 만에 무너져 <b>삼일천하</b>라 불리오. 좋은 뜻만으로는 세상이 바뀌지 않는다는 것, 그리고 남의 힘을 빌린 변화는 오래가기 어렵다는 것을 보여 준 사건이었소.",
  "cat": "life"
 },
 {
  "title": "한성에 닿은 농민군의 소식",
  "icon": "🌾",
  "id": "donghak-inspect",
  "kind": "inspect",
  "area": "hanseong",
  "pos": {
   "x": 20,
   "z": 10
  },
  "hotspots": [
   {
    "label": "고부에서 시작되었소",
    "note": "1894년, 전라도 고부의 군수가 없는 죄를 씌워 세금을 거두고 저수지를 새로 쌓게 해 물세까지 받았소. 견디다 못한 농민들이 전봉준을 앞세워 들고일어났라오."
   },
   {
    "label": "농민군이 전주성을 차지하였소",
    "note": "농민군은 관군을 잇달아 물리치고 전라도의 중심인 전주성까지 차지하였소. 조정은 크게 놀라 청에 군대를 요청하였다오."
   },
   {
    "label": "스스로 고을을 다스렸소",
    "note": "농민군은 조정과 화약을 맺고 물러나면서 <b>집강소</b>를 두었소. 신분에 따른 차별을 없애고 억울한 세금을 바로잡는 일을 농민들이 직접 해냈라오."
   },
   {
    "label": "우금치에서 무너졌소",
    "note": "청군에 이어 일본군까지 들어와 경복궁을 점령하자, 농민군은 다시 일어나 한성으로 향하였소. 그러나 공주 우금치에서 일본군의 신식 무기 앞에 크게 무너지고 마오."
   }
  ],
  "capstone": {
   "text": "동학 농민군이 조정과 화약을 맺은 뒤 고을마다 집강소를 두고 한 일은 무엇이겠소?",
   "choices": [
    "외국 상인을 대신해 세금을 거두는 일",
    "신분 차별을 없애고 잘못된 세금을 바로잡는 일",
    "농민들에게 군사 훈련을 시키는 일",
    "새로운 임금을 뽑는 일"
   ],
   "correct": 1,
   "ok": "그러하오. 농민들은 집강소를 통해 스스로 고을의 잘못된 일을 바로잡았소. 신분에 따른 차별을 없애고 억울한 세금을 고치자고 한 이 요구는, 훗날 나라의 개혁에도 이어졌라오.",
   "no": "농민들이 무엇 때문에 들고일어났는지를 떠올려 보면 답이 보이오."
  },
  "cat": "life"
 },
 {
  "title": "공사관으로 옮긴 임금",
  "icon": "🕯️",
  "id": "agwan-choice",
  "kind": "choice",
  "area": "jeongdong",
  "pos": {
   "x": -18,
   "z": -14
  },
  "setup": "당신은 정동 골목에 사는 사람이다. 지난가을 경복궁에서 끔찍한 일이 있었다. 일본이 보낸 무리가 궁궐에 들이닥쳐 왕비를 해쳤다는 것이다. 그 뒤로 임금은 궁 안에서도 잠을 이루지 못한다는 말이 돈다. 이 골목에는 러시아·미국·영국의 공사관이 늘어서 있고, 어느 새벽 가마 한 채가 러시아 공사관 문으로 들어갔다는 소문이 파다하다.",
  "prompt": "임금이 남의 나라 공사관에 머문다는 소식을 들은 당신의 생각은?",
  "choices": [
   {
    "label": "목숨이 위태로우니 우선 몸을 피하는 것이 옳다",
    "outcome": "임금은 화를 면한다. 그러나 그곳에 머무는 동안 여러 나라가 광산과 철도의 권리를 하나씩 얻어 간다."
   },
   {
    "label": "임금이 궁을 비우면 나라의 체면이 서지 않는다",
    "outcome": "같은 생각을 가진 사람들이 하루빨리 환궁하시라는 상소를 올린다. 목소리는 점점 커진다."
   },
   {
    "label": "남의 힘에 기대는 한 어느 쪽이든 위태롭기는 마찬가지다",
    "outcome": "당신의 걱정은 오래지 않아 사실이 된다. 이 나라를 두고 여러 나라가 저마다 이권을 다툰다."
   }
  ],
  "epilogue": "왕비가 시해된 <b>을미사변</b> 뒤, 고종은 신변의 위협을 느껴 러시아 공사관으로 거처를 옮겼소. 이를 <b>아관파천</b>이라 하오. 임금은 목숨을 지켰지만, 그 사이 여러 나라가 광산과 철도를 캐고 놓을 권리를 앞다투어 가져갔다오. 나라의 힘이 약하면 임금조차 제 궁에 머물 수 없다는 것을 보여 준 시기였소.",
  "cat": "event"
 },
 {
  "title": "환구단에 오른 황제",
  "icon": "👑",
  "id": "daehan-inspect",
  "kind": "inspect",
  "area": "jeongdong",
  "pos": {
   "x": 6,
   "z": 16
  },
  "hotspots": [
   {
    "label": "궁으로 돌아왔소",
    "note": "러시아 공사관에 머물던 고종은 사람들의 거듭된 요청을 받아들여 1897년 경운궁으로 돌아왔소. 오늘날의 덕수궁이오."
   },
   {
    "label": "하늘에 제사를 올렸소",
    "note": "고종은 한성 한복판에 <b>환구단</b>을 쌓고 하늘에 제사를 지낸 뒤 황제의 자리에 올랐소. 하늘에 제사를 지내는 일은 황제만 할 수 있는 것이었다오."
   },
   {
    "label": "나라 이름을 대한제국으로",
    "note": "국호를 <b>대한제국</b>, 연호를 <b>광무</b>라 정하였소. 어느 나라에도 딸리지 않은 자주독립국임을 안팎에 알린 것이오."
   },
   {
    "label": "새로운 것들을 들여왔소",
    "note": "전기와 전차, 우편과 병원, 근대식 학교와 공장을 세우며 나라를 새롭게 하려 하였소. 다만 시간이 너무 짧았라오."
   }
  ],
  "capstone": {
   "text": "고종이 환구단에서 하늘에 제사를 지내고 황제의 자리에 오른 까닭은 무엇이겠소?",
   "choices": [
    "청의 황제에게 충성을 맹세하기 위해",
    "어느 나라에도 딸리지 않은 자주독립국임을 알리기 위해",
    "일본의 요구를 그대로 따르기 위해",
    "나라 이름을 조선으로 되돌리기 위해"
   ],
   "correct": 1,
   "ok": "그러하오. 하늘에 제사를 지내는 일은 황제만 할 수 있었소. 고종이 스스로 황제가 되고 나라 이름을 대한제국이라 한 것은, 우리나라가 자주독립국임을 안팎에 분명히 밝힌 것이라오.",
   "no": "황제라는 자리가 무엇을 뜻하는지 다시 살펴보시오."
  },
  "cat": "person"
 },
 {
  "title": "도장을 찍을 수 없다",
  "icon": "📜",
  "id": "eulsa-choice",
  "kind": "choice",
  "area": "jeongdong",
  "pos": {
   "x": -6,
   "z": -18
  },
  "setup": "1905년 11월, 당신은 경운궁 곁 중명전에서 일하는 관리다. 어젯밤부터 일본 군사들이 궁을 에워쌌고, 이토 히로부미가 대신들을 한 사람씩 불러 조약에 동의하라 다그친다. 조약의 내용은 이렇다. 대한제국의 외교를 일본이 대신한다는 것. 다른 나라와 말을 주고받을 길이 막힌다는 뜻이다. 황제는 끝내 서명하지 않았는데, 어떤 대신들은 이미 도장을 내주었다는 말이 들린다.",
  "prompt": "문 밖에서 이 광경을 지켜본 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "이 일을 낱낱이 적어 세상에 알리겠다",
    "outcome": "며칠 뒤 신문에 이 일을 통탄하는 글이 실린다. 사람들이 거리로 나와 통곡하고, 스스로 목숨을 끊는 이도 나온다."
   },
   {
    "label": "황제께 아직 서명하지 않으셨음을 밖에 알리시라 아뢰겠다",
    "outcome": "황제는 여러 나라에 조약이 무효임을 알리려 애쓴다. 그러나 이미 외교의 길이 막힌 뒤였다."
   },
   {
    "label": "힘으로 맺은 조약이니 힘으로 되돌려야 한다",
    "outcome": "전국에서 의병이 일어난다. 신돌석 같은 평민 의병장도 나타나 산과 들에서 싸운다."
   }
  ],
  "epilogue": "<b>을사늑약</b>으로 대한제국은 외교권을 빼앗겼소. 고종 황제는 끝까지 서명하지 않았고, 1907년 네덜란드 헤이그에서 열린 만국 평화 회의에 <b>특사</b>를 보내 조약이 무효임을 알리려 하였다오. 하지만 외교권이 없다는 이유로 회의장에 들어가지도 못했고, 이 일을 빌미로 고종은 황제 자리에서 강제로 물러나게 되오. 그 뒤 전국에서 의병이 일어나고, 안중근은 하얼빈에서 이토 히로부미를 저격하오.",
  "cat": "relic"
 }
];

export const QUESTS_OPEN = [ ...QUESTS_OPEN_BASE,
  ...GATES_OPEN.map(g => ({ id:g.id, kind:'gate', cat:'event', icon:g.icon,
    title:g.title, area:g.area, pos:g.pos, to:g.to, confirm:g.confirm })) ];

export const NPCS_OPEN = [
 {
  "area": "hanseong",
  "pos": {
   "x": -16,
   "z": 4
  },
  "color": "#8C6A4A",
  "icon": "🏮",
  "lines": [
   "종로에서 삼대째 장사를 하고 있소. 요즘은 못 보던 물건이 하루가 다르게 들어오오.",
   "신기하기도 하고 겁이 나기도 하고, 마음이 참 복잡하오."
  ]
 },
 {
  "area": "hanseong",
  "pos": {
   "x": 8,
   "z": -16
  },
  "color": "#4A5E7A",
  "icon": "💡",
  "lines": [
   "경복궁 건청궁에 처음 전등이 켜졌을 때 저도 구경을 갔다오.",
   "하도 자주 꺼져서 사람들이 \"건달불\"이라고 불렀라오. 그래도 그 밤은 참 밝았소."
  ]
 },
 {
  "area": "jemulpo",
  "pos": {
   "x": -16,
   "z": 4
  },
  "color": "#A8748C",
  "icon": "🧵",
  "lines": [
   "스무 해 넘게 베를 짰소. 우리 집 베틀 소리로 아침이 시작됐다오.",
   "그런데 개항장에 기계로 짠 무명천이 들어오니 당해 낼 재간이 없소. 곱기도 곱고 값도 헐하오.",
   "지난달에 베틀을 헛간에 넣었소. 이 동네에서 베 짜는 소리가 거의 끊겼소."
  ]
 },
 {
  "area": "jemulpo",
  "pos": {
   "x": 16,
   "z": -8
  },
  "color": "#7A6A5A",
  "icon": "🧺",
  "lines": [
   "전에는 제물포에서 노량진까지 짐을 지고 하루 종일 걸었소. 힘들어도 벌이는 됐다오.",
   "이제는 기차가 한 시간에 가오. 사람 열 몫을 쇳덩이 하나가 해 버리오.",
   "편해진 건 맞는데, 제 일감은 반으로 줄었소."
  ]
 },
 {
  "area": "jemulpo",
  "pos": {
   "x": -4,
   "z": -4
  },
  "color": "#5A7E8C",
  "icon": "⚓",
  "lines": [
   "저는 부두에서 짐을 싣고 내리오. 항구가 열린 뒤로 배가 끊이지 않소.",
   "전에는 일감 없는 날이 절반이었는데, 요즘은 부르는 데가 많아 골라 가오.",
   "벌이가 나아져서 올해는 동생을 학교에 보냈소."
  ]
 },
 {
  "area": "jemulpo",
  "pos": {
   "x": 14,
   "z": 15
  },
  "color": "#9A8250",
  "icon": "💰",
  "lines": [
   "저는 객주올시다. 외국 상인과 우리 상인 사이를 이어 주고 삯을 받다오.",
   "말이 통하고 물길을 아는 사람이 드무니, 이 일은 아무나 못 하오.",
   "솔직히 말하면 개항이 제게는 기회였소. 창고를 셋이나 늘렸소."
  ]
 },
 {
  "area": "jeongdong",
  "pos": {
   "x": -14,
   "z": 6
  },
  "color": "#6E7A8C",
  "icon": "📚",
  "lines": [
   "저는 신식 학교에 다니는 학생이오. 산수와 지리, 서양 말까지 배우오.",
   "몇 해 전만 해도 여자아이가 글을 배우는 건 생각도 못 할 일이었소.",
   "집에서는 아직도 못마땅해하시지만, 저는 배우는 게 참 좋소."
  ]
 },
 {
  "area": "jeongdong",
  "pos": {
   "x": 16,
   "z": -8
  },
  "color": "#9A7A6A",
  "icon": "🩺",
  "lines": [
   "이 병원에서는 서양 의술로 사람을 고치오. 처음엔 무섭다고들 하였다오.",
   "한 사람 두 사람 낫는 걸 보고 나서야 사람들이 문을 두드리기 시작하였소."
  ]
 },
 {
  "area": "ganghwa",
  "pos": {
   "x": -14,
   "z": 6
  },
  "color": "#6A7A5A",
  "icon": "⛵",
  "lines": [
   "이 앞바다로 낯선 배들이 여러 번 들어왔소. 대포 소리도 들었다오.",
   "그 뒤로 마을 어귀에 저 비석이 섰소."
  ]
 },
 {
  "area": "ganghwa",
  "pos": {
   "x": 16,
   "z": -8
  },
  "color": "#8C7A6A",
  "icon": "🖋️",
  "lines": [
   "조약을 맺던 자리에 저도 있었소. 글자 한 줄 한 줄이 그렇게 무거운 줄 몰랐소.",
   "나중에야 그 조항들이 무슨 뜻이었는지 알게 됐다오."
  ]
 }
];

export const RELICS_OPEN = [
 {
  "id": "r-cheokhwabi-choice",
  "icon": "🪨",
  "name": "척화비 앞에서",
  "era": "open-port",
  "from": "cheokhwabi-choice",
  "line": "당신은 강화도 나루터의 젊은 뱃사공이다."
 },
 {
  "id": "r-dongnip-sinmun",
  "icon": "📰",
  "name": "어떤 글자로 신문",
  "era": "open-port",
  "from": "dongnip-sinmun",
  "line": "갓 찍어 낸 신문에서 먹 냄새가 난다."
 },
 {
  "id": "r-donghak-inspect",
  "icon": "🌾",
  "name": "한성",
  "era": "open-port",
  "from": "donghak-inspect",
  "line": "그러하오."
 },
 {
  "id": "r-daehan-inspect",
  "icon": "👑",
  "name": "환구단",
  "era": "open-port",
  "from": "daehan-inspect",
  "line": "그러하오."
 },
 {
  "id": "r-eulsa-choice",
  "icon": "📜",
  "name": "도장",
  "era": "open-port",
  "from": "eulsa-choice",
  "line": "1905년 11월, 당신은 경운궁 곁 중명전에서 일하는 관리다."
 },
 {
  "id": "r-gyeongin",
  "icon": "🚂",
  "name": "경인선, 처음 달린 기차",
  "era": "open-port",
  "from": "gyeongin",
  "line": "기적 소리와 함께 기관차가 처음으로 철길 위를 달린다."
 }
];

function buildTram(x, z){ return P.eraProp("buildTram", x, z); }
function buildSteamTrain(x, z){ return P.eraProp("buildSteamTrain", x, z); }
function buildRailTrack(x, z){ return P.eraProp("buildRailTrack", x, z); }
function buildStele(x, z){ return P.eraProp("buildStele", x, z); }
function buildStreetLamp(x, z){ return P.eraProp("buildStreetLamp", x, z); }
function buildTelegraphLine(x, z){ return P.eraProp("buildTelegraphLine", x, z); }
function buildRickshaw(x, z){ return P.eraProp("buildRickshaw", x, z); }
function buildMarketStall(x, z){ return P.eraProp("buildMarketStall", x, z); }
function buildShopFront(x, z){ return P.eraProp("buildShopFront", x, z); }
function buildHarborWater(x, z){ return P.eraProp("buildHarborWater", x, z); }
function buildSteamShip(x, z){ return P.eraProp("buildSteamShip", x, z); }
function buildCargoStack(x, z){ return P.eraProp("buildCargoStack", x, z); }
function buildWarehouse(x, z){ return P.eraProp("buildWarehouse", x, z); }
function buildLighthouse(x, z){ return P.eraProp("buildLighthouse", x, z); }
function buildChurchSpire(x, z){ return P.eraProp("buildChurchSpire", x, z); }
function buildIronFence(x, z){ return P.eraProp("buildIronFence", x, z); }
function buildLegationFlag(x, z){ return P.eraProp("buildLegationFlag", x, z); }
function buildCannon(x, z){ return P.eraProp("buildCannon", x, z); }
function buildReeds(x, z){ return P.eraProp("buildReeds", x, z); }

export function buildOpen_hanseong(){
  S.buildGround();
  S.buildMountains();
  S.scatterTreesArea(12,[-32,32],[-30,26],7);
  S.jRoofHanok(-14,-14,5,3.6,2.8,'#F1E6C8','#5B3B33');
  S.jRoofHanok(-4,-18,4,3,2.4,'#EFE2C4','#4A332B');
  buildShopFront(21,-4,'#B8503F',-Math.PI/2);
  buildShopFront(-23,-10,'#3E6E5A',Math.PI/2);
  buildRailTrack(0,2,40,'x');
  buildTram(-6,2,0);
  buildTelegraphLine([-24,-13,-2,9,20],-2);
  buildStreetLamp(6,5);
  buildStreetLamp(-19,6);
  buildRickshaw(20,6,-0.5);
  buildMarketStall(-18,14,'#C9B58C',0.2);
  buildMarketStall(-9,17,'#B49A78',-0.15);
  buildMarketStall(9,14,'#C2AE84',0.1);
  buildMarketStall(18,17,'#BCA680',-0.25);
  S.scatterHouses(7,[-28,28],[-26,-6],9,{strawRatio:0.25,avoid:[[-14,-14],[-4,-18],[10,-16],[18,-12],[21,-4],[-23,-10]]});
}

export function buildOpen_jemulpo(){
  S.buildGround();
  S.buildMountains();
  S.buildWater();
  S.scatterTreesArea(7,[-28,28],[-24,12],7);
  buildHarborWater(0,-24,56,22);
  S.buildPier(-8,-16,10);
  S.buildPier(8,-18,8);
  buildSteamShip(-9,-29,0.08);
  buildSteamShip(10,-30,-0.12);
  buildLighthouse(-25,-26);
  buildCargoStack(-13,-11);
  buildCargoStack(13,-12);
  buildCargoStack(2,-12);
  buildWarehouse(23,-13,5,11,4.2);
  buildWarehouse(-24,-9,4.5,9,3.8);
  buildRailTrack(4,10,34,'x');
  buildSteamTrain(-4,10,0);
  buildTelegraphLine([-22,-11,0,11,22],4);
  S.scatterHouses(5,[-26,26],[2,18],9,{strawRatio:0.5,avoid:[[-4,10],[4,10],[14,15],[-16,4]]});
}

export function buildOpen_jeongdong(){
  S.buildGround();
  S.buildMountains();
  S.scatterTreesArea(14,[-28,28],[-26,22],7);
  buildChurchSpire(-7,-21);
  buildIronFence(-14,-5.5,11,'x');
  buildIronFence(10,-5.5,11,'x');
  buildLegationFlag(-17,-7,'#C7392F');
  buildLegationFlag(6,-8,'#2E4A87');
  buildLegationFlag(19,-4,'#3E7A55');
  S.jRoofHanok(-18,4,4,3,2.4,'#EFE2C4','#4A5A3E');
  buildStreetLamp(-4,0);
  buildStreetLamp(10,2);
  buildRickshaw(-9,3,0.7);
  S.scatterHouses(4,[-24,24],[4,18],9,{strawRatio:0.2,avoid:[[-18,4],[-14,6],[16,-8]]});
}

export function buildOpen_ganghwa(){
  S.buildGround();
  S.buildMountains();
  S.buildWater();
  S.scatterTreesArea(12,[-28,28],[-24,16],7);
  buildStele(0,-10);
  buildHarborWater(-14,-24,28,16);
  S.buildPier(-12,-16,8);
  S.buildFortressWall(-7,-22,20,'x','#9C9484');
  buildCannon(-14,-19.5,0);
  buildCannon(-7,-19.5,0.1);
  buildCannon(0,-19.5,-0.08);
  buildReeds(16,[-24,-4],[-14,-4]);
  buildReeds(10,[6,22],[-16,-8]);
  S.jRoofHanok(12,-8,4,3,2.4,'#EAE0C4','#4A332B');
  S.scatterHouses(6,[-24,24],[-2,16],9,{strawRatio:0.7,avoid:[[12,-8],[-14,6],[16,-8],[14,8]]});
}

export const AREA_BUILDERS_OPEN = {
  "hanseong": buildOpen_hanseong,
  "jemulpo": buildOpen_jemulpo,
  "jeongdong": buildOpen_jeongdong,
  "ganghwa": buildOpen_ganghwa
};
