/* 자동 생성 — tools/convert.mjs · 원본 docs/content/11-colonial.md
   손으로 고치지 마세요. 문체는 tools/style-hao.mjs 규칙을 따릅니다. */
import * as S from '../engine/scene-helpers.js';
import * as P from '../engine/props.js';

export const AREAS_COLONIAL = {
 "hub": {
  "name": "경성",
  "bg": "#E4E1CB",
  "spawn": {
   "x": 0,
   "z": 22
  },
  "bound": 51,
  "loading": "경성으로 이동하는 중…"
 },
 "manchuria": {
  "name": "만주 벌판",
  "bg": "#C7CBB8",
  "spawn": {
   "x": 8,
   "z": 17
  },
  "bound": 38,
  "loading": "만주 벌판으로 이동하는 중…"
 },
 "shanghai": {
  "name": "상하이 조계",
  "bg": "#E4E1CB",
  "spawn": {
   "x": 4,
   "z": 16
  },
  "bound": 36,
  "loading": "상하이 조계로 이동하는 중…"
 },
 "cheonan": {
  "name": "아우내 장터",
  "bg": "#E0E4CF",
  "spawn": {
   "x": 0,
   "z": 16
  },
  "bound": 36,
  "loading": "아우내 장터로 이동하는 중…"
 },
 "gunsan": {
  "name": "군산항",
  "bg": "#B9D6D9",
  "spawn": {
   "x": 0,
   "z": 16
  },
  "bound": 36,
  "loading": "군산항으로 이동하는 중…"
 }
};

export const GATES_COLONIAL = [
 {
  "id": "gate-hub-manchuria-0",
  "icon": "🚂",
  "title": "경성역",
  "area": "hub",
  "pos": {
   "x": -30,
   "z": -20
  },
  "to": "manchuria",
  "confirm": "기차를 타고 만주로 이동하겠소?"
 },
 {
  "id": "gate-hub-shanghai-1",
  "icon": "⛴️",
  "title": "부두",
  "area": "hub",
  "pos": {
   "x": 28,
   "z": -20
  },
  "to": "shanghai",
  "confirm": "배를 타고 상하이로 이동하겠소?"
 },
 {
  "id": "gate-hub-cheonan-2",
  "icon": "🐎",
  "title": "남쪽 지방으로 가는 길",
  "area": "hub",
  "pos": {
   "x": 14,
   "z": -40
  },
  "to": "cheonan",
  "confirm": "충청도 천안 아우내 장터로 향하겠소?"
 },
 {
  "id": "gate-hub-gunsan-3",
  "icon": "🚂",
  "title": "군산행 기차역",
  "area": "hub",
  "pos": {
   "x": -42,
   "z": 8
  },
  "to": "gunsan",
  "confirm": "기차를 타고 군산항으로 향하겠소?"
 },
 {
  "id": "gate-manchuria-hub-4",
  "icon": "🚂",
  "title": "만주의 기차역",
  "area": "manchuria",
  "pos": {
   "x": 0,
   "z": 14
  },
  "to": "hub",
  "confirm": "경성으로 돌아가겠소?"
 },
 {
  "id": "gate-shanghai-hub-5",
  "icon": "⛴️",
  "title": "상하이의 부두",
  "area": "shanghai",
  "pos": {
   "x": 0,
   "z": 11
  },
  "to": "hub",
  "confirm": "경성으로 돌아가겠소?"
 },
 {
  "id": "gate-cheonan-hub-6",
  "icon": "🐎",
  "title": "경성으로 가는 길",
  "area": "cheonan",
  "pos": {
   "x": 0,
   "z": 22
  },
  "to": "hub",
  "confirm": "경성으로 돌아가겠소?"
 },
 {
  "id": "gate-gunsan-hub-7",
  "icon": "🚂",
  "title": "군산역",
  "area": "gunsan",
  "pos": {
   "x": 0,
   "z": 22
  },
  "to": "hub",
  "confirm": "경성으로 돌아가겠소?"
 }
];

export const QUESTS_COLONIAL_BASE = [
 {
  "title": "탑골공원의 만세 함성",
  "icon": "✊",
  "id": "samil-choice",
  "kind": "choice",
  "area": "hub",
  "pos": {
   "x": -18,
   "z": 4
  },
  "contentId": "samil",
  "setup": "때는 1919년 3월 1일, 정오 무렵. 탑골공원 안팎으로 사람들이 하나둘 모여든다. 누군가 낭독한 독립 선언서의 마지막 구절이 아직 귓가에 맴돈다. 곧 거리로 뛰쳐나가 태극기를 흔들며 만세를 외칠 참인데, 헌병들이 몰려온다는 소문도 들려온다.",
  "prompt": "지금 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "태극기를 손에 쥐고 사람들 맨 앞에서 만세를 외치자!",
    "outcome": "떨리는 목소리로 내지른 만세가 옆 사람에게 옮겨붙는다. 순식간에 거리는 만세 소리로 가득 찬다. 헌병들이 달려오는 소리도 점점 가까워진다."
   },
   {
    "label": "뒤쪽에 서서 조용히 만세를 따라 부르며 사람들 사이에 섞이자",
    "outcome": "앞장서진 못했지만, 당신의 작은 목소리도 이 함성의 한 줄기가 된다. 만세 소리는 앞이든 뒤든 가리지 않고 거리 전체를 뒤흔든다."
   },
   {
    "label": "행여 잡혀갈까 두려워 발길을 돌려 집으로 향해야겠어",
    "outcome": "골목을 돌아서는 순간에도 등 뒤로 만세 소리가 끊이지 않는다. 함께하지 못한 마음이 오래도록 남는다."
   }
  ],
  "epilogue": "실제 역사 속에서는 신분과 나이를 가리지 않은 수많은 사람이 이 함성에 나섰소. 3·1 운동은 전국, 나아가 나라 밖으로까지 퍼져 석 달 넘게 이어졌소. 일제는 이를 폭력으로 진압했는데, 경기도 화성 제암리에서는 사람들을 교회에 가두고 불을 질러 죽이기까지 하였소. 그런 희생 속에서도 3·1 운동은 우리 역사상 가장 큰 민족 운동으로 남았소.",
  "cat": "event",
  "img": [
   "samil.jpg"
  ]
 },
 {
  "title": "우리말을 지키는 교실",
  "icon": "📖",
  "id": "joseoneo-choice",
  "kind": "choice",
  "area": "hub",
  "pos": {
   "x": 16,
   "z": 0
  },
  "contentId": "joseoneo",
  "setup": "당신은 보통학교의 젊은 선생이다. 학교에서는 일본어만 쓰라는 명이 내려왔고, 조선어 시간은 이미 사라진 지 오래다. 그런데 방과 후, 몇몇 아이들이 남아 우리말 책을 몰래 펴 보인다. 창밖으로 누군가 지나가는 발소리가 들린다.",
  "prompt": "지금 당신은 어떻게 해야 하는가?",
  "choices": [
   {
    "label": "문을 잠그고 아이들에게 조용히 우리말 낱말을 가르치자!",
    "outcome": "아이들의 눈이 반짝인다. 들키면 큰일이지만, 이 짧은 시간만큼은 우리말이 교실 안에 살아 숨쉰다."
   },
   {
    "label": "혹시 모를 일을 걱정해 아이들에게 책을 얼른 덮게 해야겠어",
    "outcome": "아이들은 아쉬운 얼굴로 책을 덮는다. 안전하지만, 우리말 한 줄을 배울 기회는 오늘도 미뤄진다."
   },
   {
    "label": "교장에게 이 사실을 먼저 알려 화근을 없애야겠어",
    "outcome": "당장의 문제는 사라지지만, 다음에 남몰래 우리말을 배우려던 아이들의 발길도 함께 끊어진다."
   }
  ],
  "epilogue": "실제 역사 속에서는 조선어학회 학자들이 맞춤법을 정리하고 사전을 준비하다 여럿이 잡혀갔소. 원고를 잃었지만, 광복 뒤 되찾아 끝내 우리말 사전을 완성하였소.",
  "cat": "culture",
  "img": [
   "joseoneo.jpg"
  ]
 },
 {
  "title": "헌병의 검문 앞에서",
  "icon": "🪖",
  "id": "gukgwon-choice",
  "kind": "choice",
  "area": "hub",
  "pos": {
   "x": 0,
   "z": -12
  },
  "contentId": "gukgwon",
  "setup": "당신은 종로 거리를 걷다 헌병 경찰의 검문에 붙들렸다. 품 안에는 이웃에게 전해 줄 편지 한 통이 있을 뿐인데, 눈초리가 심상치 않다. 토지 조사 사업으로 땅을 잃고 떠나야 했던 이웃들의 이야기가 문득 떠오른다.",
  "prompt": "지금 당신은 어떻게 대응해야 하는가?",
  "choices": [
   {
    "label": "떨리지만 침착하게 그저 이웃에게 갈 편지라고 또박또박 말해야겠어",
    "outcome": "짧지만 긴장된 순간이 지나고, 헌병은 못마땅한 얼굴로 당신을 보내 준다. 별일 아니었지만 가슴은 한참 뛴다."
   },
   {
    "label": "괜히 트집 잡힐까 봐 편지를 슬쩍 버리고 모르는 척해야겠어",
    "outcome": "몸은 무사히 빠져나왔지만, 이웃에게 전하려던 소식은 끝내 닿지 못한다."
   },
   {
    "label": "왜 검문하느냐고 목소리를 높여 따져야겠어",
    "outcome": "순간의 억울함은 풀리지 않고, 오히려 더 오랫동안 붙들려 곤욕을 치른다."
   }
  ],
  "epilogue": "실제 역사 속에서는 헌병 경찰이 사람들의 말과 행동 하나하나를 감시하였소. 학교 선생님까지 칼을 차야 했던 시절, 이런 일상의 긴장은 누구에게나 있었소.",
  "cat": "event",
  "img": [
   "gukgwon.jpg"
  ]
 },
 {
  "title": "부두에 도착한 소집 통지",
  "icon": "📯",
  "id": "gangje-choice",
  "kind": "choice",
  "area": "hub",
  "pos": {
   "x": 26,
   "z": -16
  },
  "contentId": "gangje",
  "setup": "당신의 집에 낯선 종이 한 장이 도착했다. 탄광으로 일하러 가라는 소집 통지다. 이웃 청년 몇은 이미 트럭에 실려 떠났고, 돌아왔다는 소식은 아직 들려오지 않는다. 부두에는 사람을 실은 배가 곧 떠날 채비를 하고 있다.",
  "prompt": "지금 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "가족에게 화가 미칠까 두려워 순순히 트럭에 올라야겠어",
    "outcome": "덜컹이는 트럭 위에서 멀어지는 마을을 오래도록 바라본다. 언제 돌아올 수 있을지 아무도 알려 주지 않는다."
   },
   {
    "label": "야밤에 짐을 꾸려 산 너머 먼 친척 집으로 몸을 숨기자",
    "outcome": "숨어 지내는 하루하루가 조마조마하지만, 적어도 이 배에는 오르지 않는다."
   },
   {
    "label": "마을 어른들과 함께 관청에 몰려가 사정을 하소연해야겠어",
    "outcome": "몇 마디 위로만 돌아올 뿐, 소집은 그대로다. 그래도 함께 목소리를 낸 사람들의 얼굴은 오래 기억에 남는다."
   }
  ],
  "epilogue": "실제 역사 속에서는 탄광과 공장, 전쟁터로 수많은 사람이 강제로 끌려갔소. 하시마섬처럼 끝내 돌아오지 못한 곳도 많고, 그 아픔은 아직 완전히 해결되지 않았소.",
  "cat": "event"
 },
 {
  "title": "만주 이주민의 갈림길",
  "icon": "🎖️",
  "id": "sinheung-choice",
  "kind": "choice",
  "area": "manchuria",
  "pos": {
   "x": 0,
   "z": -8
  },
  "contentId": "sinheung",
  "setup": "당신은 재산을 정리해 만주로 건너온 청년이다. 이회영 형제가 세운 신흥무관학교 앞, 훈련을 마친 이들의 구령 소리가 벌판에 울린다. 고향에 두고 온 가족 생각에 마음이 무겁지만, 이곳 사람들은 당신에게 함께할 뜻이 있는지 묻는다.",
  "prompt": "지금 당신은 어떤 선택을 하겠는가?",
  "choices": [
   {
    "label": "학교에 들어가 총 쓰는 법과 진법을 배우자!",
    "outcome": "손에 익지 않은 총을 들고 구르고 넘어지길 며칠, 서서히 대오에 발을 맞추게 된다. 언젠가 이 훈련이 큰 싸움에서 쓰일 것이다."
   },
   {
    "label": "훈련 대신 농사를 지어 이곳 사람들의 식량을 대야겠어",
    "outcome": "총은 들지 않았지만, 당신이 거둔 곡식이 훈련받는 이들의 밥상에 오른다. 싸움도 결국 누군가의 뒷받침 없이는 이어지지 못한다."
   },
   {
    "label": "너무 위험해 보여 다시 고향으로 돌아가야겠어",
    "outcome": "발길을 돌리는 당신 뒤로, 벌판의 구령 소리가 점점 멀어진다. 언젠가 이 결정을 돌아보게 될 것이다."
   }
  ],
  "epilogue": "실제 역사 속에서는 신흥무관학교를 거친 이들이 훗날 봉오동과 청산리에서 일본군을 크게 무찔렀소. 지형을 잘 아는 사람들, 그리고 그들을 뒷받침한 이주민들이 함께 만든 승리였소.",
  "cat": "relic",
  "img": [
   "sinheung.jpg"
  ]
 },
 {
  "title": "한인애국단의 결심",
  "icon": "📮",
  "id": "kimgu-choice",
  "kind": "choice",
  "area": "shanghai",
  "pos": {
   "x": 0,
   "z": -6
  },
  "contentId": "kimgu",
  "setup": "당신은 상하이 임시정부 청사에서 일하는 청년이다. 침체됐던 정부에 활기를 불어넣겠다며 김구가 새 단체를 조직했다. 이봉창은 이미 일본으로 떠났고, 이제 또 한 사람이 큰 결심을 앞두고 있다. 김구가 당신에게도 뜻을 묻는다.",
  "prompt": "지금 당신은 무엇을 하겠는가?",
  "choices": [
   {
    "label": "위험을 알면서도 김구의 뜻에 함께하자!",
    "outcome": "김구는 말없이 당신의 손을 오래 붙잡는다. 큰 결심 뒤에는 언제나 이렇게 무거운 침묵이 따른다."
   },
   {
    "label": "직접 나서는 대신 자금과 연락을 돕는 역할을 맡아야겠어",
    "outcome": "이름이 알려지진 않지만, 이런 손길들이 모여 거사가 준비된다. 누구나 앞장설 수 있는 건 아니다."
   },
   {
    "label": "너무 위험한 길이라 여겨 조용히 발을 빼야겠어",
    "outcome": "임시정부 청사를 나서는 발걸음이 무겁다. 함께하지 못한 마음은 오래도록 남는다."
   }
  ],
  "epilogue": "실제 역사 속에서는 윤봉길이 상하이 훙커우 공원에서 의거를 일으켰소. 이 일로 중국 정부가 임시정부를 돕기 시작했으니, 한 사람의 결심이 큰 흐름을 바꾼 순간이었소.",
  "cat": "person"
 },
 {
  "title": "아우내 장터의 만세 시위",
  "icon": "🎗️",
  "id": "yugwansun-choice",
  "kind": "choice",
  "area": "cheonan",
  "pos": {
   "x": 0,
   "z": -6
  },
  "contentId": "yugwansun",
  "setup": "당신은 이화 학당에 다니다 서울의 만세 시위를 보고 고향 천안으로 내려온 유관순이다. 1919년 4월 1일, 아우내 장날. 장을 보러 나온 사람들 사이로 태극기를 나누어 주며 만세 시위를 준비했다. 헌병 주재소가 지척인데, 벌써 사람들이 눈짓을 주고받는다.",
  "prompt": "장이 서는 이 순간, 당신은 어떻게 하겠는가?",
  "choices": [
   {
    "label": "사람들 앞으로 나서 태극기를 흔들며 만세를 외치자!",
    "outcome": "당신의 외침을 신호로 장터를 가득 메운 사람들이 일제히 만세를 외친다. 헌병 주재소 쪽에서 총소리가 울린다."
   },
   {
    "label": "미리 나누어 둔 태극기가 잘 전해졌는지부터 살펴야겠어",
    "outcome": "구석구석 나누어 준 태극기가 사람들 손에 하나둘 들리는 걸 보며, 곧 터질 함성을 예감한다."
   },
   {
    "label": "헌병들의 낌새가 심상치 않으니 오늘은 미뤄야겠어",
    "outcome": "장터에 모인 사람들의 눈빛에서 이미 결심이 읽힌다. 당신이 망설이는 사이에도 만세 소리는 터져 나온다."
   }
  ],
  "epilogue": "실제 역사 속에서는 이날 시위로 유관순의 부모를 포함해 여러 사람이 목숨을 잃었소. 유관순은 현장에서 체포되어 감옥에 갇힌 뒤에도 만세를 그치지 않았고, 결국 감옥에서 순국하였소. 열여덟 살, 짧지만 꺾이지 않은 삶이었소.",
  "cat": "person",
  "img": [
   "yugwansun.jpg"
  ]
 },
 {
  "title": "군산항, 떠나가는 쌀가마",
  "icon": "🌾",
  "id": "ssalsutal-choice",
  "kind": "choice",
  "area": "gunsan",
  "pos": {
   "x": 0,
   "z": -6
  },
  "contentId": "ssalsutal",
  "setup": "당신은 군산 근처에서 논농사를 짓는 농민이다. 올해도 풍년이었지만, 수확한 쌀 대부분은 일제가 정한 몫만큼 걷혀 군산항으로 실려 간다. 부두에는 일본으로 떠날 쌀가마가 산더미처럼 쌓여 있고, 정작 당신 집 뒤주는 이미 바닥을 보인다.",
  "prompt": "쌓여 가는 쌀가마를 보며, 당신은 어떤 마음이 드는가?",
  "choices": [
   {
    "label": "억울하지만 힘없는 처지를 탓하며 그저 지켜볼 수밖에",
    "outcome": "뱃고동이 울리고 쌀을 가득 실은 배가 항구를 떠난다. 남은 것은 텅 빈 뒤주와 다음 해에 대한 걱정뿐이다."
   },
   {
    "label": "이웃들과 몰래 곡식을 조금씩이라도 감춰 겨울을 나야겠어",
    "outcome": "많지는 않지만, 서로 나누어 감춘 곡식이 매서운 겨울 한 끼가 되어 준다. 작은 저항이 모여 서로를 지킨다."
   },
   {
    "label": "물산 장려 운동 이야기를 들은 대로, 우리 손으로 짓는 살림부터 다시 일으켜야겠어",
    "outcome": "당장 배고픔이 사라지진 않지만, \"우리 것으로 살자\"는 다짐이 마을 곳곳에서 조금씩 뿌리를 내린다."
   }
  ],
  "epilogue": "실제 역사 속에서는 일제가 일본의 쌀 부족 문제를 우리나라에서 해결하려 하면서, 군산항 같은 곳에서 엄청난 양의 쌀이 일본으로 실려 나갔소. 정작 조선 농민들의 살림은 갈수록 어려워졌라오.",
  "cat": "life",
  "img": [
   "ssalsutal.jpg"
  ]
 },
 {
  "title": "봉오동 전투와 청산리 대첩",
  "icon": "⚔️",
  "id": "bongo_cheongsan",
  "area": "manchuria",
  "pos": {
   "x": 0,
   "z": -30
  },
  "story": "그대는 홍범도, 김좌진과 함께 봉오동과 청산리에서 일본군을 크게 무찔러, 독립군 역사상 가장 빛나는 승리를 이끌어 냈소.",
  "war": true,
  "stages": [
   {
    "story": "그대는 홍범도, 김좌진과 함께 봉오동과 청산리에서 일본군을 크게 무찔러, 독립군 역사상 가장 빛나는 승리를 이끌어 냈소.",
    "q": {
     "text": "일본군을 상대하기 위해, 지금 무엇을 준비해야 하는가?",
     "choices": [
      "넓은 벌판으로 나가 정면으로 맞붙어야겠어",
      "일본군을 좁은 골짜기 깊숙이 끌어들인 뒤 매복한 부대로 포위하자!",
      "무기를 버리고 뿔뿔이 흩어져 몸을 피해야겠어",
      "일본군이 지나갈 때까지 아무것도 하지 않고 기다려야겠어"
     ],
     "correct": 1,
     "ok": "현명한 작전이다. 산기슭 곳곳에 몸을 숨긴 독립군이 골짜기 깊숙이 들어온 일본군을 사방에서 에워싼다. 좁은 지형에 갇힌 일본군은 크게 당황한다.",
     "no": "그렇게는 병력의 차이를 이겨낼 수 없다. 지형을 이용해 일본군을 골짜기로 끌어들이고 매복으로 포위해야 한다. 다시 판단하라."
    }
   },
   {
    "story": "",
    "q": {
     "text": "대규모 일본군에 맞서, 독립군 연합 부대는 어떻게 싸워야 하는가?",
     "choices": [
      "평지로 내려가 화력으로 정면 승부를 봐야겠어",
      "산과 숲의 지형을 활용해 여러 차례 나누어 치고 빠지자!",
      "수가 너무 많으니 항복하고 목숨을 구해야겠어",
      "아무 전략 없이 각자 흩어져 싸워야겠어"
     ],
     "correct": 1,
     "ok": "완벽한 판단이다. 험준한 산길 곳곳에서 매복과 기습을 거듭한 끝에, 사흘에 걸친 전투에서 독립군 연합 부대는 일본군에 큰 타격을 입힌다. 군량이 끊겨 감자로 허기를 달래고 눈 덮인 삼림을 헤매면서도, 독립군은 끝내 청산리 대첩이라는 이름의 대승을 거둔다!",
     "no": "그렇게는 병력과 화력에서 앞선 일본군을 이길 수 없다. 지형을 활용한 치고 빠지기 전술로 맞서야 한다. 다시 판단하라."
    }
   }
  ],
  "cat": "event"
 },
 {
  "title": "물산장려운동 — 우리 것을 지켜라",
  "icon": "🧺",
  "id": "mulsan",
  "kind": "minigame",
  "area": "hub",
  "pos": {
   "x": 8,
   "z": 20
  },
  "story": "당신은 종로 저잣거리의 작은 포목점 주인이다. 값싼 왜국 물건이 밀려들면서, 우리 손으로 짜고 기른 물건들은 팔리지 않아 창고에 쌓여만 간다. \"내 살림 내 것으로\" — 사람들이 이렇게 외치며 거리를 돌기 시작했다는 소문이 들려온다.",
  "q": {
   "text": "가게 매대를 다시 꾸리기 전에, 당신은 먼저 무엇부터 해야 하는가?",
   "choices": [
    "값만 싸면 어디서 온 물건이든 상관없이 잔뜩 들여놓자",
    "우리 손으로 짠 무명과 우리 땅에서 난 곡식부터 가려 놓자!",
    "일본에서 건너온 물건만 골라 잘 보이는 자리에 두어야겠어",
    "어디서 온 물건인지 신경 쓰지 말고 아무렇게나 늘어놓자"
   ],
   "correct": 1,
   "ok": "옳은 생각이다. \"내 살림 내 것으로, 우리가 만들어 우리가 쓰자\" — 평양에서 시작된 이 외침이 전국 저잣거리로 퍼져 나가고 있다. 이제 매대에 쌓인 물건들을 하나씩 가려 보자.",
   "no": "그래서는 우리 물건을 만드는 이들의 살림이 여위어만 간다. 어디서 온 물건인지부터 가려 놓아야 한다. 다시 판단하라."
  },
  "mini": {
   "type": "sort",
   "intro": "매대 위에 물건이 하나씩 놓인다. 우리 손으로 만든 물건은 왼쪽 광주리로, 일본에서 건너온 물건은 오른쪽 상자로 끌어다 놓아 보자.",
   "ok": "매대가 깔끔하게 정리됐다. \"우리 것으로만 살자\"는 외침대로, 손님들도 하나둘 우리 물건을 먼저 집어 든다. 이렇게 작은 가게 하나하나가 모여, 물산장려운동은 전국으로 번져 나간다.",
   "retry": "너무 많이 뒤섞여 버렸다. 어느 손으로, 어느 땅에서 온 물건인지 다시 한번 잘 살펴보자.",
   "items": [
    {
     "icon": "🧵",
     "label": "우리 무명실",
     "korean": true
    },
    {
     "icon": "🍬",
     "label": "왜사탕",
     "korean": false
    },
    {
     "icon": "👘",
     "label": "토산 베옷",
     "korean": true
    },
    {
     "icon": "🧴",
     "label": "일본 화장품",
     "korean": false
    },
    {
     "icon": "🌾",
     "label": "우리 쌀",
     "korean": true
    },
    {
     "icon": "🥾",
     "label": "왜신발",
     "korean": false
    },
    {
     "icon": "🧶",
     "label": "토산 명주",
     "korean": true
    },
    {
     "icon": "🍶",
     "label": "일본 정종",
     "korean": false
    },
    {
     "icon": "🧺",
     "label": "대나무 광주리",
     "korean": true
    },
    {
     "icon": "🖋️",
     "label": "일본산 만년필",
     "korean": false
    }
   ],
   "binLeftLabel": "왼쪽",
   "binRightLabel": "오른쪽"
  },
  "contentId": "mulsan",
  "cat": "event"
 },
 {
  "title": "비밀 신호 전달하기",
  "icon": "🏮",
  "id": "bimil_sinho",
  "kind": "minigame",
  "area": "shanghai",
  "pos": {
   "x": -4,
   "z": 2
  },
  "story": "당신은 상하이 임시정부의 연락원이다. 편지를 그대로 품고 다니다간 순사나 밀정에게 들키기 십상이다. 그래서 동지들끼리는 미리 정해 둔 등불 신호로 서로가 같은 편임을 확인한다. 오늘 밤, 처음 만나는 동지와 신호를 맞춰야 한다.",
  "q": {
   "text": "낯선 이가 접선 장소에 나타났다. 이 사람이 진짜 동지인지 어떻게 확인해야 하는가?",
   "choices": [
    "일단 아는 척하며 품속의 편지부터 건네야겠어",
    "미리 정해 둔 등불 신호를 순서대로 주고받아 확인하자!",
    "큰 소리로 이름을 불러 확인해야겠어",
    "의심스러우니 무작정 자리를 피해야겠어"
   ],
   "correct": 1,
   "ok": "옳은 판단이다. 정해진 신호를 순서대로 주고받아야, 말 한마디 없이도 서로가 같은 편임을 안전하게 확인할 수 있다. 이제 실제로 신호를 주고받아 보자.",
   "no": "그렇게는 밀정인지 동지인지 알 길이 없다. 미리 정해 둔 신호로 확인하는 것이 가장 안전하다. 다시 판단하라."
  },
  "mini": {
   "type": "memory",
   "intro": "네 개의 등불이 나란히 놓여 있다. 동지가 켜는 순서를 눈여겨보았다가, 그대로 다시 눌러 신호를 돌려주자. 신호는 주고받을수록 점점 길어진다.",
   "ok": "마지막 신호까지 정확히 되돌려 보내자, 동지의 굳은 얼굴이 비로소 풀린다. \"역시, 우리 편이었군.\" 말 한마디 없이 등불만으로 나눈 믿음이, 오늘 밤의 연락망을 무사히 지켜냈다.",
   "retry": "신호가 어긋났다. 밀정이 아닌지 동지가 다시 눈을 가늘게 뜬다. 처음부터 순서를 다시 눈여겨보자."
  },
  "cat": "life"
 },
 {
  "title": "독립 선언서",
  "icon": "📜",
  "id": "declaration",
  "kind": "inspect",
  "area": "hub",
  "pos": {
   "x": -20,
   "z": 9
  },
  "contentId": "samil",
  "hotspots": [
   {
    "label": "첫 구절",
    "note": "\"오등은 자에 아 조선의 독립국임과 조선인의 자주민임을 선언하노라.\" 이 한 문장이 온 나라에 울려 퍼졌소."
   },
   {
    "label": "민족 대표 33인",
    "note": "각계각층의 대표 33인이 이름을 올려 선언서에 힘을 실었소."
   },
   {
    "label": "퍼져 나간 소식",
    "note": "이 선언서는 사람들의 손을 거쳐 전국 곳곳, 나라 밖으로까지 은밀히 퍼져 나갔소."
   }
  ],
  "cat": "event",
  "img": [
   "samil.jpg"
  ]
 },
 {
  "title": "우리말 사전 원고",
  "icon": "📖",
  "id": "dictionary",
  "kind": "inspect",
  "area": "hub",
  "pos": {
   "x": 18.4,
   "z": 3.7
  },
  "contentId": "joseoneo",
  "hotspots": [
   {
    "label": "맞춤법 정리",
    "note": "학자들은 흩어져 있던 우리말 표기법을 하나로 정리하였소."
   },
   {
    "label": "잡혀간 학자들",
    "note": "이 작업을 하다 여러 학자가 잡혀가고 원고를 빼앗기기도 하였소."
   },
   {
    "label": "광복 뒤 완성",
    "note": "되찾은 원고로, 광복 뒤 마침내 우리말 사전이 완성되었소."
   }
  ],
  "capstone": {
   "text": "오, 잡혀갈 위험을 무릅쓰고 우리말을 지키려 했다니! 이렇게 우리말 사전을 만들고자 모인 학자들의 단체, 그 이름은 바로 ____이구나!",
   "choices": [],
   "correct": 0,
   "no": "다시 떠올려 보시오. 우리말 맞춤법을 정리하고 사전을 만들다 여러 학자가 잡혀갔던, 그 단체의 이름이오."
  },
  "mini": {
   "type": "blank",
   "answer": [
    "조선어학회",
    "조선어 학회"
   ],
   "ok": "그러하오! 조선어학회 학자들은 우리말 표기법을 하나로 정리하고 사전을 만들다 여러 사람이 잡혀가고 원고를 빼앗기기도 하였소. 그렇게 지켜낸 원고로, 광복 뒤 마침내 우리말 사전이 완성됐라오."
  },
  "cat": "culture",
  "img": [
   "joseoneo.jpg"
  ]
 },
 {
  "title": "1936년, 베를린의 마라토너",
  "icon": "🎖️",
  "id": "sontokijeong",
  "area": "hub",
  "pos": {
   "x": 34,
   "z": 10
  },
  "story": "당신은 손기정이다. 마라톤 경기에서 세계 신기록을 세우며 가장 먼저 결승선을 통과했다. 그러나 기쁨보다 무거운 마음이 앞선다. 시상대에 오르면 태극기가 아닌 일장기가 올라가고, 가슴에는 일장기를 달아야 한다.",
  "q": {
   "text": "시상대에 오르는 이 순간, 당신은 가슴에 단 일장기를 어떻게 하겠는가?",
   "choices": [
    "자랑스럽게 일장기를 내보이며 활짝 웃어야겠어",
    "손에 든 나무 화분으로 가슴의 일장기를 가리고 고개를 숙이자!",
    "그 자리에서 일장기를 찢어 버려야겠어",
    "시상식 자체를 거부하고 자리를 떠나야겠어"
   ],
   "correct": 1,
   "ok": "그날 손기정은 정말로 이렇게 했다. 화분으로 가슴을 가린 채 고개 숙인 그의 사진은, 말 없이도 온 세상에 조선인의 마음을 전했다. 금메달의 영광조차 나라 잃은 설움을 다 가리지는 못했다.",
   "no": "다시 생각해 보라. 우승의 기쁨보다, 나라 잃은 설움이 더 컸던 그 순간을 떠올려 보자."
  },
  "cat": "event"
 },
 {
  "title": "조선 총독부와 헌병 경찰",
  "icon": "🏛️",
  "id": "chongdokbu",
  "kind": "inspect",
  "area": "hub",
  "pos": {
   "x": 0,
   "z": -24
  },
  "hotspots": [
   {
    "label": "조선 총독부",
    "note": "1910년 나라를 빼앗은 일제는 조선 총독부를 세우고, 군인 출신 총독을 임명해 우리 민족을 강압적으로 다스렸소."
   },
   {
    "label": "헌병 경찰",
    "note": "군인인 헌병에게 경찰 임무까지 맡겨 한국인을 감시하고 독립운동을 탄압하였소."
   },
   {
    "label": "제복 입은 교사",
    "note": "일반 관리와 학교 교사들에게도 제복을 입고 칼을 차게 해, 거리 곳곳에 공포 분위기를 조성하였소."
   }
  ],
  "capstone": {
   "text": "오, 군인인데 경찰 노릇까지 하다니! 이렇게 군대 안에서 경찰 역할을 겸하는 이들을 ____이라 부르는구나.",
   "choices": [],
   "correct": 0,
   "no": "다시 떠올려 보시오. 군대에서 경찰의 역할을 겸하는 이 군인들이, 조선 총독부 시기 한국인을 감시하는 데 앞장섰소."
  },
  "mini": {
   "type": "blank",
   "answer": [
    "헌병",
    "헌병 경찰",
    "헌병경찰"
   ],
   "ok": "그러하오! 헌병은 원래 군대에서 경찰의 역할을 하는 군인이오. 일제는 이 헌병에게 일반 경찰 임무까지 맡겨, 한국인의 말과 행동 하나하나를 감시하고 독립운동을 탄압했라오."
  },
  "cat": "event"
 },
 {
  "title": "을사늑약과 의병, 안중근",
  "icon": "📜",
  "id": "eulsaneukyak_uibyeong",
  "kind": "inspect",
  "area": "hub",
  "pos": {
   "x": -34,
   "z": -8
  },
  "hotspots": [
   {
    "label": "을사늑약",
    "note": "일제는 러시아와의 전쟁에서 승리한 뒤, 고종이 동의하지 않았는데도 을사늑약을 강제로 맺어 대한 제국의 외교권을 빼앗았소."
   },
   {
    "label": "헤이그 특사",
    "note": "고종은 네덜란드 헤이그의 평화 회의에 특사를 보내 을사늑약이 무효임을 세계에 알리려 했지만, 일제의 방해로 뜻을 이루지 못하였소."
   },
   {
    "label": "의병 운동",
    "note": "을사늑약 소식이 알려지자 상인은 철시하고 학생은 등교를 거부했으며, 여러 곳에서 의병이 일어났소. 대한 제국 군대가 해산되자 군인들까지 의병에 합류하였소."
   },
   {
    "label": "안중근의 하얼빈 의거",
    "note": "국내 의병 활동이 움츠러들자 많은 의병이 만주와 연해주로 건너갔소. 그중 안중근은 우리나라 침략에 앞장선 이토 히로부미를 하얼빈역에서 처단하였소."
   }
  ],
  "capstone": {
   "text": "오, 하얼빈역에서 이토 히로부미를 처단하다니! 연해주에서 의병 활동을 하다 이 의거를 일으킨 사람은 바로 ____이구나!",
   "choices": [],
   "correct": 0,
   "no": "다시 떠올려 보시오. 하얼빈역에서 이토 히로부미를 처단한 그 의병의 이름을 떠올려 보시오."
  },
  "mini": {
   "type": "blank",
   "answer": [
    "안중근"
   ],
   "ok": "그러하오! 안중근은 연해주에서 의병 활동을 하다, 우리나라 침략에 앞장선 이토 히로부미를 만주의 하얼빈역에서 처단하였소. 나라를 지키려는 의병들의 저항이 이렇게까지 이어졌라오."
  },
  "cat": "relic"
 },
 {
  "title": "도시의 두 얼굴",
  "icon": "🏙️",
  "id": "dosi",
  "kind": "inspect",
  "area": "hub",
  "pos": {
   "x": 34,
   "z": 26
  },
  "hotspots": [
   {
    "label": "문화 주택",
    "note": "일본인과 일부 부유한 사람들은 서양식 2층 벽돌집인 문화 주택에 살며 전기와 수도 같은 근대 문물을 누렸소."
   },
   {
    "label": "토막집",
    "note": "가난한 한국인들은 도시 변두리에 땅을 파고 나무토막과 흙, 짚으로 지은 토막집에서 살았소."
   },
   {
    "label": "충무로 일대",
    "note": "일본인들이 모여 살던 충무로 일대에는 상점이 늘어서 근대적인 도시의 모습이 나타났소."
   },
   {
    "label": "청계천 일대",
    "note": "주로 한국인들이 모여 살던 청계천 일대는 전기가 잘 들어오지 않아, 공동 우물을 쓰며 개천가에서 빨래를 해야 하였소."
   }
  ],
  "capstone": {
   "text": "같은 경성 안에서도 일본인이 사는 곳과 한국인이 사는 곳의 모습이 이렇게 달랐던 까닭은 무엇이겠소?",
   "choices": [
    "한국인들이 근대 문물을 원하지 않았기 때문이다",
    "일제가 식민 통치의 혜택을 일본인 중심으로 나누어 주었기 때문이다",
    "두 지역의 날씨가 서로 달랐기 때문이다",
    "한국인들이 일부러 변두리를 선택했기 때문이다"
   ],
   "correct": 1,
   "ok": "그러하오. 근대적인 도시의 겉모습 뒤에는, 식민 통치의 혜택이 일본인들에게 먼저 돌아가던 불평등한 현실이 숨어 있었소. 같은 도시 안에서도 사람들의 삶은 이렇게나 달랐라오.",
   "no": "다시 살펴보시오. 문화 주택과 토막집, 충무로와 청계천의 차이가 우연히 생긴 것은 아니었소."
  },
  "cat": "event"
 },
 {
  "title": "학생들이 일으킨 만세와 항일",
  "icon": "🎌",
  "id": "yukdo_gwangju",
  "kind": "inspect",
  "area": "hub",
  "pos": {
   "x": -8,
   "z": 26
  },
  "hotspots": [
   {
    "label": "순종의 장례식",
    "note": "대한 제국의 마지막 황제 순종이 세상을 떠나자, 학생들은 그 장례식 날 대규모 만세 시위를 계획하였소."
   },
   {
    "label": "6·10 만세 운동",
    "note": "계획은 사전에 발각됐지만, 일부 학생들이 서울 곳곳에서 만세 시위를 벌였고 다른 지역 학생들도 뒤따랐소."
   },
   {
    "label": "광주에서 터진 충돌",
    "note": "몇 년 뒤 광주에서 한국인과 일본인 학생이 충돌했는데, 일본 경찰이 한국 학생만 붙잡자 학생들이 크게 분노하였소."
   },
   {
    "label": "광주 학생 항일 운동",
    "note": "분노한 학생들의 시위는 차별과 우리말·역사 교육의 제한에 항의하며 전국으로 퍼져 나갔소."
   }
  ],
  "capstone": {
   "text": "오, 광주의 학생 충돌이 전국적인 시위로 번졌구나! 한국 학생에 대한 차별에 맞서 전국으로 퍼진 이 운동을 ____이라 부르는구나!",
   "choices": [],
   "correct": 0,
   "no": "다시 떠올려 보시오. 광주에서 시작되어, 학생에 대한 차별에 맞서 전국으로 퍼진 이 운동의 이름이오."
  },
  "mini": {
   "type": "blank",
   "answer": [
    "광주 학생 항일 운동",
    "광주학생항일운동",
    "광주 학생 항일운동"
   ],
   "ok": "그러하오! 광주 학생 항일 운동은 한국 학생을 차별하고 우리말과 역사를 제대로 배우지 못하게 하는 현실에 항의하며 전국으로 퍼졌소. 6·10 만세 운동과 함께, 학생들이 앞장선 대표적인 저항이었라오."
  },
  "cat": "relic"
 },
 {
  "title": "민족정신을 지우려 한 시절",
  "icon": "🙏",
  "id": "minjokmalsal",
  "kind": "inspect",
  "area": "hub",
  "pos": {
   "x": 22,
   "z": -8
  },
  "hotspots": [
   {
    "label": "신사 참배",
    "note": "1930년대 후반 침략 전쟁을 넓혀 가던 일제는, 전국에 세운 신사에 강제로 절을 하게 하였소."
   },
   {
    "label": "창씨개명",
    "note": "우리 민족의 성과 이름까지 일본식으로 바꾸도록 강요하고, 학교에서는 우리말과 역사를 배우지 못하게 하였소."
   },
   {
    "label": "전쟁에 동원된 사람들",
    "note": "전쟁에 필요하다며 사람과 물자를 강제로 동원하였소. 놋그릇과 수저까지 빼앗아 무기를 만들었고, 일부 여성들은 일본군 위안부로 끌려가 씻을 수 없는 고통을 겪었소."
   },
   {
    "label": "역사를 지킨 사람들",
    "note": "이런 탄압 속에서도 신채호 같은 학자들은 우리 역사를 연구해 일제의 역사 왜곡에 맞서며 민족의식을 일깨웠소."
   }
  ],
  "cat": "relic"
 },
 {
  "title": "훙커우 공원의 의거",
  "icon": "💣",
  "id": "hongkou",
  "kind": "inspect",
  "area": "shanghai",
  "pos": {
   "x": 7,
   "z": 2
  },
  "hotspots": [
   {
    "label": "이봉창의 거사",
    "note": "김구가 조직한 한인애국단의 첫 단원 이봉창은 일본 도쿄에서 일왕이 탄 마차에 폭탄을 던졌소."
   },
   {
    "label": "훙커우 공원",
    "note": "일제가 상하이 점령을 축하하는 기념행사를 이 공원에서 크게 열었소."
   },
   {
    "label": "폭탄이 던져진 순간",
    "note": "행사가 한창이던 그때, 한 청년이 단상을 향해 폭탄을 던져 일본군 지휘관과 고관들에게 큰 피해를 입혔소."
   },
   {
    "label": "중국의 반응",
    "note": "이 일로 중국 정부가 대한민국 임시 정부를 적극적으로 돕기 시작하였소. 한 사람의 결심이 독립운동의 큰 흐름을 바꾸었소."
   }
  ],
  "capstone": {
   "text": "오, 훙커우 공원 단상에 폭탄을 던진 그 청년! 이 의거로 중국 정부의 마음까지 움직인 한인애국단의 그 이름은 바로 ____이구나!",
   "choices": [],
   "correct": 0,
   "no": "다시 떠올려 보시오. 훙커우 공원에서 폭탄을 던져 임시정부에 새로운 힘을 불어넣은 한인애국단원의 이름이오."
  },
  "mini": {
   "type": "blank",
   "answer": [
    "윤봉길"
   ],
   "ok": "그러하오! 윤봉길은 상하이 훙커우 공원에서 열린 일제의 기념행사에 폭탄을 던져 일본군에게 큰 피해를 주었소. 이 의거로 중국 정부가 대한민국 임시 정부를 돕기 시작했라오."
  },
  "cat": "relic"
 },
 {
  "title": "한국광복군의 마지막 작전",
  "icon": "🛡️",
  "id": "hangukgwangbokgun",
  "kind": "inspect",
  "area": "shanghai",
  "pos": {
   "x": -8.4,
   "z": 2
  },
  "hotspots": [
   {
    "label": "창설",
    "note": "일제의 탄압 속에서도 대한민국 임시 정부는 정규군인 한국광복군을 창설해 일본과의 전쟁에 나섰소."
   },
   {
    "label": "미군과의 협력",
    "note": "한국광복군은 미군과 협력해 국내로 진입할 작전을 세우며 훈련을 거듭하였소."
   },
   {
    "label": "실현되지 못한 진공 작전",
    "note": "그러나 작전을 실행하기 직전, 일제가 항복하면서 국내 진입 작전은 끝내 이루어지지 못하였소."
   }
  ],
  "capstone": {
   "text": "오, 미군과 함께 국내 진입을 준비하다니! 대한민국 임시 정부가 창설한 이 정규군의 이름은 바로 ____이구나!",
   "choices": [],
   "correct": 0,
   "no": "다시 떠올려 보시오. 대한민국 임시 정부가 창설해, 미군과 함께 국내 진입을 준비했던 그 군대의 이름이오."
  },
  "mini": {
   "type": "blank",
   "answer": [
    "한국광복군",
    "광복군"
   ],
   "ok": "그러하오! 한국광복군은 대한민국 임시 정부가 창설한 정규군으로, 미군과 협력해 국내 진입 작전을 준비하였소. 비록 일제의 항복으로 작전을 실현하지 못했지만, 스스로의 힘으로 나라를 되찾으려 한 의지를 보여 준 사례라오."
  },
  "contentId": "gwangbokgun",
  "cat": "event"
 },
 {
  "title": "『서간도 시종기』, 이은숙의 기록",
  "icon": "📖",
  "id": "seogandoshijonggi",
  "kind": "inspect",
  "area": "manchuria",
  "pos": {
   "x": 6,
   "z": -16
  },
  "hotspots": [
   {
    "label": "압록강을 건너던 밤",
    "note": "이회영 일가는 1만여 석에 이르는 재산과 집을 모두 처분하고, 1910년 겨울 압록강을 건넜소. 혹독한 추위 속 좁은 수레에서 겪은 고생은 이루 말할 수 없었지만, 괴로운 마음을 겉으로 드러내지 않았다고 하오."
   },
   {
    "label": "밤낮으로 지은 옷",
    "note": "이은숙은 매일 빨래하고 손질해 밤낮으로 옷을 지어도 한 달 수입은 겨우 20원 정도였고, 그마저 받으면 곧바로 베이징의 독립군에게 부쳤소."
   },
   {
    "label": "굶는 날이 절반",
    "note": "몇 해가 지나자 형편은 더 어려워져, 하루에 한 끼라도 먹으면 다행이고 굶는 날이 한 달의 절반을 넘길 정도였다고 하오."
   }
  ],
  "cat": "culture"
 },
 {
  "title": "경부선 철도와 임피역",
  "icon": "🚂",
  "id": "gyeongbuseon",
  "kind": "inspect",
  "area": "gunsan",
  "pos": {
   "x": 10,
   "z": 9
  },
  "hotspots": [
   {
    "label": "경부선의 개통",
    "note": "1905년 서울과 부산을 잇는 경부선이 개통되며, 사람과 물자가 이전보다 훨씬 빠르게 이동할 수 있게 되었소."
   },
   {
    "label": "강제로 동원된 사람들",
    "note": "하지만 일제는 철도를 건설할 때 한국인들을 강제로 동원하였소. 철도는 주로 일제가 군대를 신속히 이동시키고, 우리나라에서 빼앗은 자원을 일본으로 실어 나르는 데 활용되었소."
   },
   {
    "label": "군산의 임피역",
    "note": "군산은 바다와 가까워 남부 지방의 드넓은 평야에서 수확한 쌀을 모아 일본으로 보내기 편리하였소. 일제는 이곳에 임피역 같은 간이역을 짓고, 주변 도로를 일본인 농장과 연결하였소."
   },
   {
    "label": "오늘날의 임피역",
    "note": "임피역 주변의 도로는 쌀을 실어 나르는 주요 교통로로 쓰였소. 오늘날 임피역은 건물만 남아 그날의 아픔을 조용히 보여 주고 있소."
   }
  ],
  "cat": "exchange"
 },
 {
  "title": "탑골공원 곳곳에서 그날의 흔적 3가지를 찾아보시오",
  "icon": "🔎",
  "id": "tapgol-find",
  "kind": "find",
  "area": "hub",
  "pos": null,
  "contentId": "samil",
  "doneMsg": "🎉 탑골공원의 흔적을 모두 찾았소! 그날의 함성이 조금 더 가깝게 느껴지오?",
  "items": [
   {
    "id": "f1",
    "icon": "🎌",
    "label": "떨어진 태극기",
    "pos": {
     "x": -16,
     "z": 5
    }
   },
   {
    "id": "f2",
    "icon": "📃",
    "label": "뿌려진 전단지",
    "pos": {
     "x": -21,
     "z": 2
    }
   },
   {
    "id": "f3",
    "icon": "👞",
    "label": "황급히 벗겨진 짚신",
    "pos": {
     "x": -18,
     "z": 11
    }
   }
  ],
  "prompt": "탑골공원 곳곳에서 그날의 흔적 3가지를 찾아보시오",
  "cat": "event",
  "img": [
   "samil.jpg"
  ]
 },
 {
  "title": "아우내 장터 곳곳에서 그날의 흔적 3가지를 찾아보시오",
  "icon": "🔎",
  "id": "aunae-find",
  "kind": "find",
  "area": "cheonan",
  "pos": null,
  "contentId": "yugwansun",
  "doneMsg": "🎉 아우내 장터의 흔적을 모두 찾았소! 열여덟 살 유관순의 용기가 조금 더 가깝게 느껴지오?",
  "items": [
   {
    "id": "f1",
    "icon": "🎌",
    "label": "미리 나누어 둔 태극기",
    "pos": {
     "x": -8,
     "z": -2
    }
   },
   {
    "id": "f2",
    "icon": "🧺",
    "label": "엎어진 장바구니",
    "pos": {
     "x": 9,
     "z": 4
    }
   },
   {
    "id": "f3",
    "icon": "🔔",
    "label": "신호로 쓰인 종",
    "pos": {
     "x": 2,
     "z": 10
    }
   }
  ],
  "prompt": "아우내 장터 곳곳에서 그날의 흔적 3가지를 찾아보시오",
  "cat": "person",
  "img": [
   "yugwansun.jpg"
  ]
 }
];

export const QUESTS_COLONIAL = [ ...QUESTS_COLONIAL_BASE,
  ...GATES_COLONIAL.map(g => ({ id:g.id, kind:'gate', cat:'event', icon:g.icon,
    title:g.title, area:g.area, pos:g.pos, to:g.to, confirm:g.confirm })) ];

export const NPCS_COLONIAL = [
 {
  "area": "hub",
  "pos": {
   "x": 4,
   "z": 16
  },
  "color": "#8C6A3E",
  "icon": "🧺",
  "lines": [
   "어서 오시오. 요즘은 물건 들여오기도 예전 같지 않소.",
   "그래도 오늘은 국산 무명이 좀 들어왔소. \"내 살림 내 것으로\"라잖소.",
   "평양에서 시작된 물산 장려 운동이 여기 경성까지 퍼졌지 뭐이오."
  ]
 },
 {
  "area": "hub",
  "pos": {
   "x": 14,
   "z": 4
  },
  "color": "#3F5A6E",
  "icon": "🎒",
  "lines": [
   "학교에서는 일본어만 쓰라고 하는데, 저는 그래도 우리말이 더 편하오.",
   "선생님이 몰래 알려 주신 낱말, 집에서 몰래 연습하고 있소."
  ]
 },
 {
  "area": "hub",
  "pos": {
   "x": -4,
   "z": -9
  },
  "color": "#6E6455",
  "icon": "🧓",
  "lines": [
   "작년에 토지 조사 사업으로 땅문서를 못 낸 옆집이 결국 만주로 떠났다네.",
   "요즘은 헌병들 눈치 보느라 큰소리로 말도 못 해."
  ]
 },
 {
  "area": "hub",
  "pos": {
   "x": -14,
   "z": 9
  },
  "color": "#7A2E2E",
  "icon": "📣",
  "lines": [
   "오늘 이곳에서 무슨 일이 있었는지 알아? 태극기를 든 사람들로 가득했었지.",
   "언젠가 이 날을 다들 기억하게 될 거야."
  ]
 },
 {
  "area": "hub",
  "pos": {
   "x": 30,
   "z": 16
  },
  "color": "#5C4A3E",
  "icon": "📰",
  "lines": [
   "역사를 왜곡하는 일제에 맞서, 신채호 선생 같은 분들이 우리 역사를 연구하고 계시다더군.",
   "베를린 올림픽에서 손기정이 금메달을 땄다는 소식, 들었나? 그런데 시상대 사진 속 그의 표정이 영 밝지가 않아."
  ]
 },
 {
  "area": "hub",
  "pos": {
   "x": 12,
   "z": 22
  },
  "color": "#A8843F",
  "icon": "🎽",
  "lines": [
   "손기정 선수가 마라톤에서 세계 신기록을 세웠다오!",
   "그런데 가슴에 일장기를 달고 뛰어야 했다니, 마음이 참 복잡하구려."
  ]
 },
 {
  "area": "manchuria",
  "pos": {
   "x": -4,
   "z": -3
  },
  "color": "#5A4A3E",
  "icon": "🎖️",
  "lines": [
   "이 벌판에서 매일 훈련을 하지. 언젠가 나라를 되찾을 날을 위해서.",
   "홍범도 대장님도 원래는 산에서 짐승 잡던 포수였다더군."
  ]
 },
 {
  "area": "manchuria",
  "pos": {
   "x": 8,
   "z": -22
  },
  "color": "#4A5A3E",
  "icon": "🪖",
  "lines": [
   "봉오동 골짜기에서 일본군을 크게 무찔렀던 그 날을 잊지 못해.",
   "지형을 잘 아는 우리가, 낯선 땅에 온 일본군보다 훨씬 유리했지."
  ]
 },
 {
  "area": "shanghai",
  "pos": {
   "x": 3,
   "z": -2
  },
  "color": "#8C7F6E",
  "icon": "📮",
  "lines": [
   "이곳이 우리나라 최초의 민주공화국, 임시정부라네.",
   "여러 도시를 옮겨 다니며 힘겹게 이어 왔지만, 포기한 적은 없어."
  ]
 },
 {
  "area": "shanghai",
  "pos": {
   "x": -3,
   "z": 6
  },
  "color": "#6E5A4A",
  "icon": "🛡️",
  "lines": [
   "한국광복군에 들어가 훈련을 받고 있소. 언젠가 국내로 진격할 날을 위해서.",
   "일제가 그렇게 빨리 항복할 줄은 몰랐지. 작전은 끝내 실행하지 못했지만, 후회는 없다오."
  ]
 },
 {
  "area": "cheonan",
  "pos": {
   "x": 6,
   "z": 6
  },
  "color": "#8C6A3E",
  "icon": "🧺",
  "lines": [
   "오늘은 아우내 장날이라 사람이 참 많소.",
   "이화 학당에 다니던 그 처자가 고향으로 내려왔다던데, 뭔가 큰일을 준비하는 눈치이오."
  ]
 },
 {
  "area": "cheonan",
  "pos": {
   "x": -6,
   "z": 2
  },
  "color": "#7A5236",
  "icon": "🧑",
  "lines": [
   "서울에서 만세 시위가 일어났다는 소식, 다들 들었다오?",
   "우리도 가만히 있을 수는 없지 않겠소."
  ]
 },
 {
  "area": "gunsan",
  "pos": {
   "x": 5,
   "z": 6
  },
  "color": "#5C6B7A",
  "icon": "⚓",
  "lines": [
   "오늘도 쌀가마를 배에 싣느라 하루 종일 등이 휘었소.",
   "이 쌀이 다 어디로 가는지는 다들 알지 않소. 정작 우리 뒤주는 텅 비었는데 말이오."
  ]
 },
 {
  "area": "gunsan",
  "pos": {
   "x": -6,
   "z": 0
  },
  "color": "#6E6455",
  "icon": "👨‍🌾",
  "lines": [
   "토지 조사 사업 때 땅문서를 제대로 못 내서, 조상 대대로 짓던 논을 빼앗겼다오.",
   "이제는 그 논에서 난 쌀을 남의 밭 일꾼으로 거두어야 하는 신시오."
  ]
 }
];

export const RELICS_COLONIAL = [
 {
  "id": "r-sinheung-choice",
  "icon": "🎖️",
  "name": "만주 이주민의 갈림길",
  "era": "colonial",
  "from": "sinheung-choice",
  "line": "당신은 재산을 정리해 만주로 건너온 청년이다."
 },
 {
  "id": "r-declaration",
  "icon": "📜",
  "name": "독립 선언서",
  "era": "colonial",
  "from": "declaration",
  "line": ""
 },
 {
  "id": "r-dictionary",
  "icon": "📖",
  "name": "우리말 사전 원고",
  "era": "colonial",
  "from": "dictionary",
  "line": "그러하오!"
 },
 {
  "id": "r-chongdokbu",
  "icon": "🏛️",
  "name": "조선 총독부",
  "era": "colonial",
  "from": "chongdokbu",
  "line": "그러하오!"
 },
 {
  "id": "r-eulsaneukyak_uibyeong",
  "icon": "📜",
  "name": "을사늑약",
  "era": "colonial",
  "from": "eulsaneukyak_uibyeong",
  "line": "그러하오!"
 },
 {
  "id": "r-dosi",
  "icon": "🏙️",
  "name": "도시의 두 얼굴",
  "era": "colonial",
  "from": "dosi",
  "line": "그러하오."
 },
 {
  "id": "r-yukdo_gwangju",
  "icon": "🎌",
  "name": "학생들",
  "era": "colonial",
  "from": "yukdo_gwangju",
  "line": "그러하오!"
 },
 {
  "id": "r-minjokmalsal",
  "icon": "🙏",
  "name": "민족정신",
  "era": "colonial",
  "from": "minjokmalsal",
  "line": ""
 },
 {
  "id": "r-hongkou",
  "icon": "💣",
  "name": "훙커우 공원의 의거",
  "era": "colonial",
  "from": "hongkou",
  "line": "그러하오!"
 },
 {
  "id": "r-hangukgwangbokgun",
  "icon": "🛡️",
  "name": "한국광복군의 마지막 작전",
  "era": "colonial",
  "from": "hangukgwangbokgun",
  "line": "그러하오!"
 },
 {
  "id": "r-seogandoshijonggi",
  "icon": "📖",
  "name": "『서간도 시종기』, 이은숙의 기록",
  "era": "colonial",
  "from": "seogandoshijonggi",
  "line": ""
 },
 {
  "id": "r-gyeongbuseon",
  "icon": "🚂",
  "name": "경부선 철도",
  "era": "colonial",
  "from": "gyeongbuseon",
  "line": ""
 }
];

function buildColonialGround(x, z){ return P.eraProp("buildColonialGround", x, z); }
function buildColonialHazeHills(x, z){ return P.eraProp("buildColonialHazeHills", x, z); }
function buildHubTrees(x, z){ return P.eraProp("buildHubTrees", x, z); }
function buildJongno(x, z){ return P.eraProp("buildJongno", x, z); }
function buildTapgolPark(x, z){ return P.eraProp("buildTapgolPark", x, z); }
function buildSchool(x, z){ return P.eraProp("buildSchool", x, z); }
function buildGovStreet(x, z){ return P.eraProp("buildGovStreet", x, z); }
function buildMitsukoshi(x, z){ return P.eraProp("buildMitsukoshi", x, z); }
function buildDosiRow(x, z){ return P.eraProp("buildDosiRow", x, z); }
function buildStationGate(x, z){ return P.eraProp("buildStationGate", x, z); }
function buildPortSign(x, z){ return P.eraProp("buildPortSign", x, z); }
function buildCheonanGateSign(x, z){ return P.eraProp("buildCheonanGateSign", x, z); }
function buildManchuriaGround(x, z){ return P.eraProp("buildManchuriaGround", x, z); }
function buildIndependenceCamp(x, z){ return P.eraProp("buildIndependenceCamp", x, z); }
function buildBattleField(x, z){ return P.eraProp("buildBattleField", x, z); }
function buildShanghaiGround(x, z){ return P.eraProp("buildShanghaiGround", x, z); }
function buildProvisionalGovt(x, z){ return P.eraProp("buildProvisionalGovt", x, z); }
function buildHongkouPark(x, z){ return P.eraProp("buildHongkouPark", x, z); }
function buildCheonanGround(x, z){ return P.eraProp("buildCheonanGround", x, z); }
function buildAunaeMarket(x, z){ return P.eraProp("buildAunaeMarket", x, z); }
function buildAunaeVillage(x, z){ return P.eraProp("buildAunaeVillage", x, z); }
function buildGunsanGround(x, z){ return P.eraProp("buildGunsanGround", x, z); }
function buildGunsanPort(x, z){ return P.eraProp("buildGunsanPort", x, z); }
function buildImpiStation(x, z){ return P.eraProp("buildImpiStation", x, z); }

export function buildColonial_hub(){
  buildColonialGround();
  buildColonialHazeHills();
  buildHubTrees();
  buildJongno();
  buildTapgolPark();
  buildSchool();
  buildGovStreet();
  buildMitsukoshi();
  buildDosiRow();
  buildStationGate();
  buildPortSign();
  buildCheonanGateSign();
}

export function buildColonial_manchuria(){
  buildManchuriaGround();
  S.buildMountains();
  buildIndependenceCamp();
  buildBattleField();
}

export function buildColonial_shanghai(){
  buildShanghaiGround();
  buildProvisionalGovt();
  buildHongkouPark();
}

export function buildColonial_cheonan(){
  buildCheonanGround();
  S.scatterTreesArea(10,[-22,22],[-20,20],7);
  buildAunaeMarket();
  buildAunaeVillage();
}

export function buildColonial_gunsan(){
  buildGunsanGround();
  buildGunsanPort();
  buildImpiStation();
}

export const AREA_BUILDERS_COLONIAL = {
  "hub": buildColonial_hub,
  "manchuria": buildColonial_manchuria,
  "shanghai": buildColonial_shanghai,
  "cheonan": buildColonial_cheonan,
  "gunsan": buildColonial_gunsan
};
