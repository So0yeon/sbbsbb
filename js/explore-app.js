// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   explore-app.js — 탐험 모드 진입점
   engine/boot.js 만 부른다 (MASTER.md §2-4).
   지도 모드(전역 스크립트)와는 window.AtlasExplore 로만 이어진다.
   ══════════════════════════════════════════════════════════════════════ */
import { bootExplore, switchWorld, pauseExplore, worldNames, worldList, refreshCollectViews, openEraComplete } from './engine/boot.js';
import { WORLDS, RELICS_BY_WORLD, AREAS_BY_WORLD } from './engine/worlds-registry.js';
import { renderRelicBag, renderStampBook } from './engine/collect.js';
import { ST } from './engine/state.js';
import { ERA_ID_MAP } from './engine/constants.js';

window.AtlasExplore = {
  /** 지도 모드 시대 id 또는 탐험 시대 id 로 시작 */
  start(eraOrWorld){
    const id = WORLDS[eraOrWorld] ? eraOrWorld : (ERA_ID_MAP[eraOrWorld] || Object.keys(WORLDS)[0]);
    bootExplore(id);
  },
  switchWorld,
  pause: pauseExplore,
  /** 시대 마무리 화면(핵심 탐구질문 포함)을 연다 */
  showEraComplete: openEraComplete,
  currentWorld(){ return ST.WORLD_ID; },
  worldNames, worldList,
  refreshCollectViews,

  /** 유물 가방 그리기 (shell.js 가 부름) */
  drawRelicBag(el){ renderRelicBag(el, RELICS_BY_WORLD, worldNames()); },
  /** 스탬프 수첩 그리기 */
  drawStampBook(el){ renderStampBook(el, worldList()); },

  RELICS_BY_WORLD, AREAS_BY_WORLD, WORLDS
};

/* 지도 모드에서 부르는 전역 함수 (§4-4 연결 지점 2) */
window.startExploreMode = function(eraId){
  if (window.AtlasShell) window.AtlasShell.toExplore(eraId);
  else window.AtlasExplore.start(eraId);
};

document.dispatchEvent(new CustomEvent('atlas:explore-ready'));
