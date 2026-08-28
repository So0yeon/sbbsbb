/* 자동 생성 — tools/convert.mjs
   새 시대는 여기에만 손댑니다. WORLDS 의 첫 항목이 기본값입니다. */
import { AREAS_PALEO, QUESTS_PALEO, NPCS_PALEO, RELICS_PALEO, AREA_BUILDERS_PALEO } from '../eras/paleo.js';
import { AREAS_NEO, QUESTS_NEO, NPCS_NEO, RELICS_NEO, AREA_BUILDERS_NEO } from '../eras/neolithic.js';
import { AREAS_BRONZE, QUESTS_BRONZE, NPCS_BRONZE, RELICS_BRONZE, AREA_BUILDERS_BRONZE } from '../eras/bronze.js';
import { AREAS_SAMGUK, QUESTS_SAMGUK, NPCS_SAMGUK, RELICS_SAMGUK, AREA_BUILDERS_SAMGUK } from '../eras/samguk.js';
import { AREAS_UNIFIED, QUESTS_UNIFIED, NPCS_UNIFIED, RELICS_UNIFIED, AREA_BUILDERS_UNIFIED } from '../eras/unified-silla.js';
import { AREAS_LATER, QUESTS_LATER, NPCS_LATER, RELICS_LATER, AREA_BUILDERS_LATER } from '../eras/later.js';
import { AREAS_GORYEO, QUESTS_GORYEO, NPCS_GORYEO, RELICS_GORYEO, AREA_BUILDERS_GORYEO } from '../eras/goryeo.js';
import { AREAS_JOSEONE, QUESTS_JOSEONE, NPCS_JOSEONE, RELICS_JOSEONE, AREA_BUILDERS_JOSEONE } from '../eras/joseon-early.js';
import { AREAS_JOSEONL, QUESTS_JOSEONL, NPCS_JOSEONL, RELICS_JOSEONL, AREA_BUILDERS_JOSEONL } from '../eras/joseon-late.js';
import { AREAS_OPEN, QUESTS_OPEN, NPCS_OPEN, RELICS_OPEN, AREA_BUILDERS_OPEN } from '../eras/open-port.js';
import { AREAS_COLONIAL, QUESTS_COLONIAL, NPCS_COLONIAL, RELICS_COLONIAL, AREA_BUILDERS_COLONIAL } from '../eras/colonial.js';
import { AREAS_WAR, QUESTS_WAR, NPCS_WAR, RELICS_WAR, AREA_BUILDERS_WAR } from '../eras/war.js';

export const WORLDS = {
  "paleo": {
    mode:'3d', name:"구석기", short:"구석기", years:"약 70만 년 전 ~",
    quests: QUESTS_PALEO, saveKey:'paleoExplore_v1',
    bg:"#DDD8C8", spawn:{"x":0,"z":17}, bound:38,
    brand:"🪨 구석기 탐험", startArea:"main",
    loading:"구석기로 들어서는 중…",
    eyebrow:"구석기 · 약 70만 년 전 ~",
    title:"구석기으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"구석기을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "neolithic": {
    mode:'3d', name:"신석기", short:"신석기", years:"약 1만 년 전 ~",
    quests: QUESTS_NEO, saveKey:'neolithicExplore_v1',
    bg:"#DFE0CE", spawn:{"x":0,"z":21}, bound:48,
    brand:"🏺 신석기 탐험", startArea:"main",
    loading:"신석기로 들어서는 중…",
    eyebrow:"신석기 · 약 1만 년 전 ~",
    title:"신석기으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"신석기을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "bronze": {
    mode:'3d', name:"청동기·고조선", short:"청동기", years:"기원전 2000 ~",
    quests: QUESTS_BRONZE, saveKey:'bronzeExplore_v1',
    bg:"#DCDCC9", spawn:{"x":0,"z":24}, bound:54,
    brand:"🗡️ 청동기 탐험", startArea:"main",
    loading:"청동기·고조선으로 들어서는 중…",
    eyebrow:"청동기·고조선 · 기원전 2000 ~",
    title:"청동기·고조선으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"청동기·고조선을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "samguk": {
    mode:'3d', name:"삼국시대", short:"삼국", years:"기원전 57 ~ 668",
    quests: QUESTS_SAMGUK, saveKey:'samgukExplore_v1',
    bg:"#E4E1CB", spawn:{"x":0,"z":21}, bound:48,
    brand:"🐎 삼국 탐험", startArea:"goguryeo",
    loading:"평양으로 이동하는 중…",
    eyebrow:"삼국 · 기원전 57 ~ 668",
    title:"삼국시대으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"삼국시대을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "unified-silla": {
    mode:'3d', name:"통일신라·발해", short:"통일신라", years:"676 ~ 926",
    quests: QUESTS_UNIFIED, saveKey:'unified-sillaExplore_v1',
    bg:"#E4E1CB", spawn:{"x":0,"z":18}, bound:42,
    brand:"🛕 통일신라·발해 탐험", startArea:"silla",
    loading:"금성으로 이동하는 중…",
    eyebrow:"통일신라·발해 · 676 ~ 926",
    title:"통일신라·발해으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"통일신라·발해을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "later": {
    mode:'3d', name:"후삼국", short:"후삼국", years:"892 ~ 936",
    quests: QUESTS_LATER, saveKey:'laterExplore_v1',
    bg:"#C7CBB8", spawn:{"x":0,"z":16}, bound:36,
    brand:"🚩 후삼국 탐험", startArea:"cheorwon",
    loading:"철원으로 이동하는 중…",
    eyebrow:"후삼국 · 892 ~ 936",
    title:"후삼국으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"후삼국을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "goryeo": {
    mode:'3d', name:"고려", short:"고려", years:"918 ~ 1392",
    quests: QUESTS_GORYEO, saveKey:'goryeoExplore_v1',
    bg:"#E4E1CB", spawn:{"x":0,"z":22}, bound:50,
    brand:"🏯 고려 탐험", startArea:"gaegyeong",
    loading:"개경으로 이동하는 중…",
    eyebrow:"고려 · 918 ~ 1392",
    title:"고려으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"고려을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "joseon-early": {
    mode:'3d', name:"조선 전기", short:"조선전기", years:"1392 ~ 1592",
    quests: QUESTS_JOSEONE, saveKey:'joseon-earlyExplore_v1',
    bg:"#E4E1CB", spawn:{"x":0,"z":26}, bound:58,
    brand:"👑 조선 전기 탐험", startArea:"hanyang",
    loading:"한양 육조거리로 이동하는 중…",
    eyebrow:"조선 전기 · 1392 ~ 1592",
    title:"조선 전기으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"조선 전기을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "joseon-late": {
    mode:'3d', name:"조선 후기", short:"조선후기", years:"1592 ~ 1876",
    quests: QUESTS_JOSEONL, saveKey:'joseon-lateExplore_v1',
    bg:"#E4E1CB", spawn:{"x":0,"z":24}, bound:54,
    brand:"🎭 조선 후기 탐험", startArea:"hanyang",
    loading:"한양으로 이동하는 중…",
    eyebrow:"조선 후기 · 1592 ~ 1876",
    title:"조선 후기으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"조선 후기을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "open-port": {
    mode:'3d', name:"개항기", short:"개항기", years:"1876 ~ 1910",
    quests: QUESTS_OPEN, saveKey:'open-portExplore_v1',
    bg:"#E4E1CB", spawn:{"x":0,"z":20}, bound:45,
    brand:"🚂 개항기 탐험", startArea:"hanseong",
    loading:"한성 종로로 이동하는 중…",
    eyebrow:"개항기 · 1876 ~ 1910",
    title:"개항기으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"개항기을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "colonial": {
    mode:'3d', name:"일제강점기", short:"일제강점기", years:"1910 ~ 1945",
    quests: QUESTS_COLONIAL, saveKey:'colonialExplore_v1',
    bg:"#E4E1CB", spawn:{"x":0,"z":22}, bound:51,
    brand:"✊ 일제강점기 탐험", startArea:"hub",
    loading:"경성으로 이동하는 중…",
    eyebrow:"일제강점기 · 1910 ~ 1945",
    title:"일제강점기으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"일제강점기을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  },
  "war": {
    mode:'3d', name:"광복·6·25", short:"광복·6·25", years:"1945 ~ 1953",
    quests: QUESTS_WAR, saveKey:'warExplore_v1',
    bg:"#E4E1CB", spawn:{"x":4,"z":20}, bound:46,
    brand:"🕊️ 광복·6·25 탐험", startArea:"seoul",
    loading:"서울로 이동하는 중…",
    eyebrow:"광복과 6·25 · 1945 ~ 1953",
    title:"광복·6·25으로 들어서다",
    body:"{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.",
    hint:"W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.",
    complete:{ title:"광복·6·25을 마치다", body:"이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려." }
  }
};

export const AREAS_BY_WORLD = {
  "paleo": AREAS_PALEO,
  "neolithic": AREAS_NEO,
  "bronze": AREAS_BRONZE,
  "samguk": AREAS_SAMGUK,
  "unified-silla": AREAS_UNIFIED,
  "later": AREAS_LATER,
  "goryeo": AREAS_GORYEO,
  "joseon-early": AREAS_JOSEONE,
  "joseon-late": AREAS_JOSEONL,
  "open-port": AREAS_OPEN,
  "colonial": AREAS_COLONIAL,
  "war": AREAS_WAR
};

export const AREA_BUILDERS_BY_WORLD = {
  "paleo": AREA_BUILDERS_PALEO,
  "neolithic": AREA_BUILDERS_NEO,
  "bronze": AREA_BUILDERS_BRONZE,
  "samguk": AREA_BUILDERS_SAMGUK,
  "unified-silla": AREA_BUILDERS_UNIFIED,
  "later": AREA_BUILDERS_LATER,
  "goryeo": AREA_BUILDERS_GORYEO,
  "joseon-early": AREA_BUILDERS_JOSEONE,
  "joseon-late": AREA_BUILDERS_JOSEONL,
  "open-port": AREA_BUILDERS_OPEN,
  "colonial": AREA_BUILDERS_COLONIAL,
  "war": AREA_BUILDERS_WAR
};

export const NPCS_BY_WORLD = {
  "paleo": NPCS_PALEO,
  "neolithic": NPCS_NEO,
  "bronze": NPCS_BRONZE,
  "samguk": NPCS_SAMGUK,
  "unified-silla": NPCS_UNIFIED,
  "later": NPCS_LATER,
  "goryeo": NPCS_GORYEO,
  "joseon-early": NPCS_JOSEONE,
  "joseon-late": NPCS_JOSEONL,
  "open-port": NPCS_OPEN,
  "colonial": NPCS_COLONIAL,
  "war": NPCS_WAR
};

export const RELICS_BY_WORLD = {
  "paleo": RELICS_PALEO,
  "neolithic": RELICS_NEO,
  "bronze": RELICS_BRONZE,
  "samguk": RELICS_SAMGUK,
  "unified-silla": RELICS_UNIFIED,
  "later": RELICS_LATER,
  "goryeo": RELICS_GORYEO,
  "joseon-early": RELICS_JOSEONE,
  "joseon-late": RELICS_JOSEONL,
  "open-port": RELICS_OPEN,
  "colonial": RELICS_COLONIAL,
  "war": RELICS_WAR
};
