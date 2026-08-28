// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   collect.js — 유물 주머니 · 도장 수첩

   저장은 window.AtlasStore 가 맡고, 이 파일은 '언제 무엇이 들어오는가'를 맡는다.
   도장을 찍을 때 아바타가 도장 찍는 동작을 하고(anim), 화면에 잉크가 번진다.
   ══════════════════════════════════════════════════════════════════════ */
import { ST, Store, areaCleared, worldCleared } from './state.js';
import { setAnim } from './anim.js';
import { SAY } from './constants.js';
import { icon, iconName } from './icons.js';

/* 이모지를 쓰지 않는다 (요구 2) — 자료의 r.icon 은 선 아이콘 이름으로 옮겨진다 */
function relicIcon(r){ return icon(iconName(r && r.icon, 'relic'), { size:24 }); }
function questionIcon(){ return icon('question', { size:20, color:'#A3A3A0' }); }

let toast = () => {};
let onChange = () => {};

export function initCollect(hooks){
  toast = (hooks && hooks.toast) || toast;
  onChange = (hooks && hooks.onChange) || onChange;
}

/* ══════════════════════════════════════════════════════════════
   유물 가방
   ══════════════════════════════════════════════════════════════ */

/** 지금 시대의 유물 목록 */
export function relicsOfWorld(){
  return ST.RELICS || [];
}

/** 퀘스트 완료로 얻는 유물을 지급한다 */
export function grantRelicsFor(questId){
  if (!Store) return [];
  const got = [];
  (ST.RELICS || []).forEach(r => {
    if (r.from !== questId) return;
    if (Store.relicAdd(r.id)){
      got.push(r);
      toast(SAY.relicAdded(r.name));
    }
  });
  if (got.length) onChange();
  return got;
}

export function relicHas(id){ return Store ? Store.relicHas(id) : false; }
export function relicCount(){ return Store ? Store.relicCount() : 0; }

/* ══════════════════════════════════════════════════════════════
   스탬프 수첩
   ══════════════════════════════════════════════════════════════ */
export function stampId(kind, world, area){
  return kind === 'era' ? `era:${world}` : `${kind}:${world}:${area}`;
}

function fx(text){
  const wrap = document.getElementById('stampFx');
  const ink  = document.getElementById('stampFxInk');
  if (!wrap || !ink) return;
  ink.textContent = text;
  wrap.classList.remove('on');
  void wrap.offsetWidth;              // 애니메이션 재시작
  wrap.classList.add('on');
  setTimeout(() => wrap.classList.remove('on'), 1200);
}

function press(id, message, inkText){
  if (!Store || !Store.stampAdd(id)) return false;
  setAnim('stamp');
  fx(inkText);
  toast(message);
  onChange();
  return true;
}

/** 지역에 처음 도착했을 때 */
export function stampVisit(world, area, areaName){
  return press(stampId('visit', world, area), SAY.stampVisit(areaName), areaName + '\n왔다 감');
}

/** 그 지역 퀘스트를 모두 마쳤을 때 */
export function stampClear(world, area, areaName){
  if (!areaCleared(area)) return false;
  return press(stampId('clear', world, area), SAY.stampClear(areaName), areaName + '\n다 봄');
}

/** 시대를 마쳤을 때 */
export function stampEra(world, worldName){
  if (!worldCleared()) return false;
  return press(stampId('era', world), SAY.stampEra(worldName), worldName + '\n마침');
}

/** 지역 도착 시 한 번에 처리 */
export function onEnterArea(world, area, areaName){
  stampVisit(world, area, areaName);
  if (Store) Store.bumpAxis('travel', 1);
}

/** 퀘스트 완료 시 한 번에 처리 */
export function onQuestDone(world, quest, areaName, worldName){
  grantRelicsFor(quest.id);
  if (quest.area) stampClear(world, quest.area, areaName || quest.area);
  stampEra(world, worldName || world);
}

/* ══════════════════════════════════════════════════════════════
   화면 그리기 — 유물 가방
   ══════════════════════════════════════════════════════════════ */
export function renderRelicBag(container, allRelicsByWorld, worldNames){
  if (!container) return;
  const got = new Set(Store ? Store.relicList() : []);
  const worlds = Object.keys(allRelicsByWorld);
  let total = 0, mine = 0;

  const html = worlds.map(w => {
    const list = allRelicsByWorld[w] || [];
    if (!list.length) return '';
    const n = list.filter(r => got.has(r.id)).length;
    total += list.length; mine += n;
    const cells = list.map(r => {
      const has = got.has(r.id);
      return `<div class="relic-cell ${has ? 'got' : 'locked'}" ${has ? `title="${esc(r.line || '')}"` : ''}>
                <div class="rc-icon">${has ? relicIcon(r) : questionIcon()}</div>
                <div class="rc-name">${has ? esc(r.name) : '?'}</div>
              </div>`;
    }).join('');
    return `<div class="shelf">
              <div class="shelf-head">${esc(worldNames[w] || w)} <span class="sh-n">${n} / ${list.length}</span></div>
              <div class="shelf-grid">${cells}</div>
            </div>`;
  }).join('');

  container.innerHTML = html || '<p class="muted">아직 유물이 없소.</p>';
  const c = document.getElementById('relicCount');
  if (c) c.textContent = `${mine} / ${total}`;
}

/* ══════════════════════════════════════════════════════════════
   화면 그리기 — 스탬프 수첩
   ══════════════════════════════════════════════════════════════ */
export function renderStampBook(container, worlds){
  if (!container) return;
  let have = 0, all = 0;

  const pages = worlds.map(w => {
    const areas = w.areas || {};
    const keys = Object.keys(areas);
    const cells = [];

    keys.forEach(a => {
      const nm = areas[a].name || a;
      const v = Store && Store.stampHas(stampId('visit', w.id, a));
      const c = Store && Store.stampHas(stampId('clear', w.id, a));
      all += 2; if (v) have++; if (c) have++;
      cells.push(`<div class="stamp ${v ? 'on' : ''}">${esc(nm)}<br>왔다 감</div>`);
      cells.push(`<div class="stamp full ${c ? 'on' : ''}">${esc(nm)}<br>다 봄</div>`);
    });

    const e = Store && Store.stampHas(stampId('era', w.id));
    all++; if (e) have++;
    cells.push(`<div class="stamp era ${e ? 'on' : ''}">${esc(w.name)}<br>마침</div>`);

    return `<div class="book-page">
              <h4>${esc(w.name)}</h4>
              <div class="stamp-grid">${cells.join('')}</div>
            </div>`;
  }).join('');

  container.innerHTML = `<div class="book-spread">${pages}</div>`;
  const c = document.getElementById('stampCount');
  if (c) c.textContent = `${have} / ${all}`;
}

function esc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
export { esc };
