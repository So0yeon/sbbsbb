/* ══════════════════════════════════════════════════════════════════════
   convert.mjs — docs/content/*.md  →  js/eras/*.js  ·  js/engine/worlds-registry.js
                 docs/04-LEARN-MODE.md → js/map-data.js

   개발 전용. 앱에는 들어가지 않는다. 산출물은 커밋한다.
       node tools/convert.mjs

   MASTER.md §11 변환 규칙 + 설계 §1(사극체) + §3-4(유물) + §3-9(사진)
   ══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toHao } from './style-hao.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CONTENT_DIR = path.join(ROOT, 'docs', 'content');
const ERAS_DIR = path.join(ROOT, 'js', 'eras');

/* ── 시대 메타 ───────────────────────────────────────────────── */
const ERA_META = {
  'paleo':          { key:'PALEO',    name:'구석기',        short:'구석기', years:'약 70만 년 전 ~', eyebrow:'구석기 · 약 70만 년 전 ~', brand:'🪨 구석기 탐험' },
  'neolithic':      { key:'NEO',      name:'신석기',        short:'신석기', years:'약 1만 년 전 ~',  eyebrow:'신석기 · 약 1만 년 전 ~',  brand:'🏺 신석기 탐험' },
  'bronze':         { key:'BRONZE',   name:'청동기·고조선', short:'청동기', years:'기원전 2000 ~',   eyebrow:'청동기·고조선 · 기원전 2000 ~', brand:'🗡️ 청동기 탐험' },
  'samguk':         { key:'SAMGUK',   name:'삼국시대',      short:'삼국',   years:'기원전 57 ~ 668', eyebrow:'삼국 · 기원전 57 ~ 668',  brand:'🐎 삼국 탐험' },
  'unified-silla':  { key:'UNIFIED',  name:'통일신라·발해', short:'통일신라', years:'676 ~ 926',     eyebrow:'통일신라·발해 · 676 ~ 926', brand:'🛕 통일신라·발해 탐험' },
  'later':          { key:'LATER',    name:'후삼국',        short:'후삼국', years:'892 ~ 936',       eyebrow:'후삼국 · 892 ~ 936',      brand:'🚩 후삼국 탐험' },
  'goryeo':         { key:'GORYEO',   name:'고려',          short:'고려',   years:'918 ~ 1392',      eyebrow:'고려 · 918 ~ 1392',       brand:'🏯 고려 탐험' },
  'joseon-early':   { key:'JOSEONE',  name:'조선 전기',     short:'조선전기', years:'1392 ~ 1592',   eyebrow:'조선 전기 · 1392 ~ 1592', brand:'👑 조선 전기 탐험' },
  'joseon-late':    { key:'JOSEONL',  name:'조선 후기',     short:'조선후기', years:'1592 ~ 1876',   eyebrow:'조선 후기 · 1592 ~ 1876', brand:'🎭 조선 후기 탐험' },
  'open-port':      { key:'OPEN',     name:'개항기',        short:'개항기', years:'1876 ~ 1910',     eyebrow:'개항기 · 1876 ~ 1910',    brand:'🚂 개항기 탐험' },
  'colonial':       { key:'COLONIAL', name:'일제강점기',    short:'일제강점기', years:'1910 ~ 1945', eyebrow:'일제강점기 · 1910 ~ 1945', brand:'✊ 일제강점기 탐험' },
  'war':            { key:'WAR',      name:'광복·6·25',     short:'광복·6·25', years:'1945 ~ 1953', eyebrow:'광복과 6·25 · 1945 ~ 1953', brand:'🕊️ 광복·6·25 탐험' }
};

const FILE_OF = {
  '01-paleo':'paleo', '02-neolithic':'neolithic', '03-bronze':'bronze', '04-samguk':'samguk',
  '05-unified-silla':'unified-silla', '06-later':'later', '07-goryeo':'goryeo',
  '08-joseon-early':'joseon-early', '09-joseon-late':'joseon-late', '10-open-port':'open-port',
  '11-colonial':'colonial', '12-war':'war'
};

/* 공용 빌더 (scene-helpers.js 가 내보내는 것) */
const COMMON = new Set([
  'buildGround','buildWater','buildMountains','buildMountainsWide',
  'jRoofHanok','buildStrawHouse','buildTileHouse','brickBuilding','timberGate',
  'buildFortressWall','buildStonePagoda','buildTombMound','buildTrainingGround',
  'buildPier','buildShipHull','buildDolmen','buildFirePit','buildPitHouse','buildKiln',
  'buildWell','buildFlagPole','buildBonfireTower','buildRockCluster','buildStack',
  'scatterTreesArea','scatterHouses','scatterRocks','makeTree','textSprite',
  'loadJagyeokru','loadBronzeSpearhead','buildTrees'
]);
const SKIP_ROWS = new Set(['for','if','while','const','let','var','return','switch','else','function','try']);

/* ══════════════════════════════════════════════════════════════
   지도 모드 데이터 (ERAS · CONTENT)
   ══════════════════════════════════════════════════════════════ */
function extractMapData(){
  const src = fs.readFileSync(path.join(ROOT, 'docs', '04-LEARN-MODE.md'), 'utf8');
  const blocks = [...src.matchAll(/```js\n([\s\S]*?)```/g)].map(m => m[1]);
  const eras = blocks.find(b => /const ERAS\s*=/.test(b));
  const content = blocks.find(b => /const CONTENT\s*=/.test(b));
  if (!eras || !content) throw new Error('04-LEARN-MODE.md 에서 ERAS/CONTENT 를 찾지 못했습니다');
  return { eras, content };
}

function catOfContent(contentSrc){
  const map = {};
  const re = /\{\s*id:'([^']+)'\s*,\s*era:'([^']+)'\s*,\s*cat:\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(contentSrc))){
    const first = (m[3].match(/'([^']+)'/) || [])[1];
    if (first) map[m[1]] = first;
  }
  return map;
}

/* ══════════════════════════════════════════════════════════════
   파서 도구
   ══════════════════════════════════════════════════════════════ */
function tableRows(lines, from){
  // from 이후 첫 표를 읽어 셀 배열을 돌려준다
  const rows = [];
  let started = false;
  for (let i = from; i < lines.length; i++){
    const l = lines[i].trim();
    if (l.startsWith('|')){
      started = true;
      const cells = l.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => /^-+$/.test(c.replace(/\s/g,'')))) continue;
      rows.push(cells);
    } else if (started && l === '') {
      // 표 사이 빈 줄은 허용하지 않는다 → 끝
      break;
    } else if (started){
      break;
    }
  }
  return rows.slice(1);   // 머리글 제외
}

const bare = s => String(s || '').replace(/`/g, '').trim();
const pos = s => {
  const m = String(s || '').match(/x\s*:\s*(-?[\d.]+)\s*,\s*z\s*:\s*(-?[\d.]+)/);
  return m ? { x: +m[1], z: +m[2] } : null;
};

function readQuote(lines, i){
  const out = [];
  while (i < lines.length && lines[i].trim() === '') i++;
  while (i < lines.length && lines[i].trim().startsWith('>')){
    out.push(lines[i].trim().replace(/^>\s?/, ''));
    i++;
  }
  return { text: out.join('\n').trim(), next: i };
}
function readList(lines, i){
  const out = [];
  while (i < lines.length && lines[i].trim() === '') i++;
  while (i < lines.length && /^\s*-\s+/.test(lines[i])){
    out.push(lines[i].trim().replace(/^-\s+/, ''));
    i++;
  }
  return { items: out, next: i };
}

/* ══════════════════════════════════════════════════════════════
   퀘스트 하나 파싱
   ══════════════════════════════════════════════════════════════ */
const KIND_OF = {
  '역할 선택': null,
  '열린 선택 (정답 없음)': 'choice',
  '열린 선택': 'choice',
  '조사형': 'inspect',
  '미니게임': 'minigame',
  '수집형': 'find'
};

const ICON_CAT = [
  [/[⚔️🗡️🏹🛡️💥🔥🚩⚓🪖]/u, 'event'],
  [/[👑🤴👘🧑👴👵🎖️🧕🗣️]/u, 'person'],
  [/[🏺💎🔔📜🪙⚱️🪔🗿🪨🪓⚒️🔨🧱🪞🏛️⛩️🗼]/u, 'relic'],
  [/[🎨🖼️🎵🎭📖📚🖋️🖌️🎓]/u, 'culture'],
  [/[🍚🍜🧺🏠♨️🌾👨‍🌾🧵]/u, 'life'],
  [/[🚢⛵🛶🚂🌐🤝]/u, 'exchange']
];

function decideCat(q, contentCat){
  if (q.contentId && contentCat[q.contentId]) return contentCat[q.contentId];
  const ic = q.icon || '';
  for (const [re, c] of ICON_CAT) if (re.test(ic)) return c;
  if (q.kind === 'inspect') return 'relic';
  if (q.kind === 'choice' || q.kind === 'minigame') return 'life';
  return 'event';
}

function parseQuest(head, body, areaFallback){
  const lines = body;
  const q = { title: head.title, icon: head.icon };
  const questions = [];
  let mini = null, capstone = null, hotspots = [], finds = [], epilogue = null;
  let pendingStory = null, inMini = false, inCap = false;
  let sortItems = [];

  let i = 0;
  // 메타 줄
  while (i < lines.length && lines[i].trim() === '') i++;
  const meta = lines[i] || '';
  i++;
  const mId = meta.match(/^`([^`]+)`/);
  q.id = mId ? mId[1] : head.title;
  const mKind = meta.match(/\*\*([^*]+)\*\*/);
  const kindLabel = mKind ? mKind[1].trim() : '역할 선택';
  const kind = KIND_OF[kindLabel];
  if (kind) q.kind = kind;
  const mArea = meta.match(/지역\s*`([^`]+)`/);
  q.area = mArea ? mArea[1] : areaFallback;
  const mPos = meta.match(/좌표\s*`([^`]+)`/);
  q.pos = mPos ? pos(mPos[1]) : null;
  const mCid = meta.match(/학습 항목\s*`([^`]+)`/);
  if (mCid) q.contentId = mCid[1];

  const cur = () => questions[questions.length - 1];

  for (; i < lines.length; i++){
    const raw = lines[i];
    const l = raw.trim();
    if (!l) continue;

    let m;

    if (l === '**상황**'){
      const r = readQuote(lines, i + 1); pendingStory = r.text; i = r.next - 1; continue;
    }
    if ((m = l.match(/^\*\*요약\*\*\s*:\s*(.+)$/))){ pendingStory = m[1].trim(); continue; }

    if ((m = l.match(/^\*\*묻는 말\*\*\s*:\s*(.+)$/))){
      questions.push({ text: m[1].trim(), story: pendingStory, choices: [], correct: 0 });
      pendingStory = null; inCap = false; continue;
    }

    if ((m = l.match(/^\*\*마무리 문제\*\*\s*:\s*(.+)$/))){
      capstone = { text: m[1].trim(), choices: [], correct: 0 };
      inCap = true; continue;
    }

    if (l === '선택지'){
      const r = readList(lines, i + 1);
      const target = inCap ? capstone : cur();
      if (target){
        if (q.kind === 'choice'){
          target.choices = r.items.map(s => {
            const lm = s.match(/label:\s*'([\s\S]*?)'\s*,\s*outcome:\s*'([\s\S]*?)'/);
            if (lm) return { label: lm[1], outcome: lm[2] };
            return { label: s.replace(/^[{\s]*|[},\s]*$/g, ''), outcome: '' };
          });
        } else {
          target.choices = r.items.map(s => s.trim());
        }
      }
      i = r.next - 1; continue;
    }

    if ((m = l.match(/^정답\s*:\s*(\d+)\s*번/))){
      const target = inCap ? capstone : cur();
      if (target) target.correct = (+m[1]) - 1;
      continue;
    }

    if (l === '**맞았을 때**'){
      const r = readQuote(lines, i + 1);
      if (inMini && mini) mini.ok = r.text;
      else if (inCap && capstone) capstone.ok = r.text;
      else if (cur()) cur().ok = r.text;
      i = r.next - 1; continue;
    }
    if (l === '**틀렸을 때**'){
      const r = readQuote(lines, i + 1);
      if (inCap && capstone) capstone.no = r.text;
      else if (cur()) cur().no = r.text;
      i = r.next - 1; continue;
    }
    if (l === '**마무리**'){
      const r = readQuote(lines, i + 1); epilogue = r.text; i = r.next - 1; continue;
    }

    if ((m = l.match(/^\*\*미니게임 종류\*\*\s*:\s*`?([a-z]+)`?/))){
      mini = mini || {}; mini.type = m[1]; inMini = true; continue;
    }
    if ((m = l.match(/^\*\*형식\*\*\s*:\s*(.+)$/))){
      if (/빈칸/.test(m[1])){ mini = mini || {}; mini.type = 'blank'; inMini = true; }
      continue;
    }
    if ((m = l.match(/^\*\*조작 안내\*\*\s*:\s*(.+)$/))){
      mini = mini || {}; mini.intro = m[1].trim(); inMini = true; continue;
    }
    if ((m = l.match(/^\*\*실패했을 때\*\*\s*:\s*(.+)$/))){
      mini = mini || {}; mini.retry = m[1].trim(); continue;
    }
    if ((m = l.match(/^\*\*정답\*\*\s*:\s*(.+)$/))){
      mini = mini || {}; mini.answer = m[1].trim().replace(/`/g,''); continue;
    }
    if (l === '**단계**'){
      const r = readList(lines, i + 1);
      mini = mini || {}; mini.steps = r.items; i = r.next - 1; continue;
    }
    if (l === '**찾을 것**' || /^\*\*찾을 것\*\*/.test(l)){
      const r = readList(lines, i + 1);
      finds = r.items.map(s => {
        const im = s.match(/^(\S+)\s*\*\*(.+?)\*\*\s*—\s*좌표\s*`([^`]+)`/);
        if (im) return { id: 'f' + finds.length, icon: im[1], label: im[2], pos: pos(im[3]) };
        return null;
      }).filter(Boolean);
      finds.forEach((f, k) => f.id = 'f' + (k + 1));
      i = r.next - 1; continue;
    }
    if ((m = l.match(/^\*\*다 모았을 때\*\*\s*:\s*(.+)$/))){ q.doneMsg = m[1].trim(); continue; }

    // 분류 미니게임 항목:  - ♨️ 온돌 → 왼쪽
    if ((m = l.match(/^-\s*(\S+)\s+(.+?)\s*→\s*(왼쪽|오른쪽)\s*$/))){
      sortItems.push({ icon: m[1], label: m[2].trim(), korean: m[3] === '왼쪽' });
      continue;
    }

    // 조사형 핫스팟:  - **라벨** — 설명
    if ((m = l.match(/^-\s*\*\*(.+?)\*\*\s*[—–-]\s*(.+)$/))){
      hotspots.push({ label: m[1].trim(), note: m[2].trim() });
      continue;
    }
  }

  /* 조립 */
  if (pendingStory && !questions.length) q.story = pendingStory;
  else if (questions.length && questions[0].story) q.story = questions[0].story;

  if (q.kind === 'choice'){
    q.setup = q.story; delete q.story;
    const c0 = questions[0];
    if (c0){ q.prompt = c0.text; q.choices = c0.choices; }
    if (epilogue) q.epilogue = epilogue;
  } else if (q.kind === 'inspect'){
    q.hotspots = hotspots;
    if (capstone) q.capstone = capstone;
    if (epilogue) q.epilogue = epilogue;
    if (questions.length && !capstone){
      q.capstone = { text: questions[0].text, choices: questions[0].choices,
                     correct: questions[0].correct, ok: questions[0].ok, no: questions[0].no };
    }
  } else if (q.kind === 'find'){
    q.items = finds;
    if (questions.length) q.prompt = questions[0].text;
  } else {
    if (questions.length === 1){
      const c = questions[0];
      q.q = { text: c.text, choices: c.choices, correct: c.correct, ok: c.ok, no: c.no };
    } else if (questions.length > 1){
      q.war = true;
      q.stages = questions.map(c => ({
        story: c.story || '',
        q: { text: c.text, choices: c.choices, correct: c.correct, ok: c.ok, no: c.no }
      }));
      q.q = { text: questions[0].text, choices: questions[0].choices,
              correct: questions[0].correct, ok: questions[0].ok, no: questions[0].no };
      delete q.q;
    }
    if (capstone) q.capstone = capstone;
    if (epilogue) q.epilogue = epilogue;
  }

  if (mini){
    if (sortItems.length) mini.items = sortItems;
    if (mini.type === 'sort' && !mini.binLeftLabel){ mini.binLeftLabel = '왼쪽'; mini.binRightLabel = '오른쪽'; }
    q.mini = mini;
    if (!q.kind) q.kind = 'minigame';
  }

  return q;
}

/* ══════════════════════════════════════════════════════════════
   문서 하나 파싱
   ══════════════════════════════════════════════════════════════ */
function parseDoc(slug, text){
  const lines = text.split(/\r?\n/);
  const sec = {};
  lines.forEach((l, i) => {
    const m = l.match(/^##\s+(.+)$/);
    if (!m) return;
    const t = m[1].trim();
    if (t.startsWith('지역 지형 배치')) sec.terrain = i;
    else if (t.startsWith('지역')) sec.areas = i;
    else if (t.startsWith('관문')) sec.gates = i;
    else if (t.startsWith('퀘스트')) sec.quests = i;
    else if (t.startsWith('길에서')) sec.npcs = i;
  });

  /* 지역 */
  const areas = {};
  let singleArea = false;
  if (sec.areas != null){
    tableRows(lines, sec.areas).forEach(r => {
      if (r.length < 6) return;
      let id = bare(r[0]);
      if (!id || /단일|—|-/.test(id) && !/^[a-z]/.test(id)){ id = 'main'; singleArea = true; }
      areas[id] = {
        name: bare(r[1]),
        bg: bare(r[2]),
        spawn: pos(r[3]) || { x:0, z:14 },
        bound: parseInt(bare(r[4]), 10) || 40,
        loading: bare(r[5])
      };
    });
  }
  if (!Object.keys(areas).length){
    areas.main = { name: ERA_META[slug].name, bg:'#E9E4D3', spawn:{x:0,z:14}, bound:40, loading:'들어서는 중…' };
    singleArea = true;
  }

  /* 관문 */
  const gates = [];
  if (sec.gates != null){
    tableRows(lines, sec.gates).forEach(r => {
      if (r.length < 6) return;
      const from = bare(r[2]), to = bare(r[4]);
      if (!from || !to) return;
      gates.push({
        id: `gate-${from}-${to}-${gates.length}`,
        icon: bare(r[0]) || '🚩',
        title: bare(r[1]),
        area: from,
        pos: pos(r[3]) || { x:0, z:0 },
        to,
        confirm: bare(r[5])
      });
    });
  }

  /* 퀘스트 */
  const quests = [];
  if (sec.quests != null){
    const end = sec.npcs != null ? sec.npcs : (sec.terrain != null ? sec.terrain : lines.length);
    let i = sec.quests + 1;
    while (i < end){
      const m = lines[i].match(/^###\s+(\S+)\s+(.+)$/);
      if (!m){ i++; continue; }
      const head = { icon: m[1], title: m[2].trim() };
      let j = i + 1;
      while (j < end && !/^###\s/.test(lines[j])) j++;
      quests.push(parseQuest(head, lines.slice(i + 1, j), singleArea ? 'main' : null));
      i = j;
    }
  }

  /* NPC */
  const npcs = [];
  if (sec.npcs != null){
    const end = sec.terrain != null ? sec.terrain : lines.length;
    for (let i = sec.npcs + 1; i < end; i++){
      const m = lines[i].match(/^\*\*(\S+)\*\*\s*·(.*)$/);
      if (!m) continue;
      const rest = m[2];
      const ma = rest.match(/지역\s*`([^`]+)`/);
      const mp = rest.match(/좌표\s*`?\[?\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]?`?/);
      const mo = rest.match(/좌표\s*`([^`]+)`/);
      const mc = rest.match(/옷\s*`?(#[0-9A-Fa-f]{3,6})`?/);
      const p = (mo && pos(mo[1])) || (mp ? { x:+mp[1], z:+mp[2] } : null);
      const r = readList(lines, i + 1);
      npcs.push({
        area: ma ? ma[1] : (singleArea ? 'main' : null),
        pos: p || { x:0, z:0 },
        color: mc ? mc[1] : '#8C6A4A',
        icon: m[1],
        lines: r.items
      });
      i = r.next - 1;
    }
  }

  /* 지역 지형 배치 */
  const builders = {};   // name → [ [fn, args], ... ]
  const order = [];
  if (sec.terrain != null){
    for (let i = sec.terrain + 1; i < lines.length; i++){
      const m = lines[i].match(/^###\s+`([A-Za-z0-9_]+)\(\)`/);
      if (!m) continue;
      const name = m[1];
      order.push(name);
      const rows = tableRows(lines, i + 1);
      builders[name] = rows.map(r => {
        const fn = bare(r[0]);
        if (!fn || SKIP_ROWS.has(fn)) return null;
        return [fn, (r[1] || '').replace(/^`|`$/g, '').trim()];
      }).filter(Boolean);
    }
  }

  return { areas, singleArea, gates, quests, npcs, builders, order };
}

/* ══════════════════════════════════════════════════════════════
   유물 (요구 4) — 퀘스트에서 뽑는다
   ══════════════════════════════════════════════════════════════ */
const TITLE_TAIL = /( 만들기| 살펴보다| 지켜보다| 바라보다| 들여다보다| 읽다| 보다| 짓기| 굽기| 세우기| 세우다| 하다| 찾기| 찾아보다| 지키기| 오르다| 올리다| 넘다| 나서다| 맞이하다| 떠나다| 만나다| 듣다| 배우다| 쓰다| 그리다| 새기다| 지나다| 건너다| 나누다| 열다| 담다| 잇다)$/;

function relicName(title){
  let t = String(title).replace(/^[^\s]*\s/, m => m);          // 그대로
  t = t.replace(TITLE_TAIL, '').trim();
  t = t.replace(/^(.*?)(을|를|이|가|와|과|에서|에게|에)\s+.*$/, '$1').trim() || t;
  return t.slice(0, 18) || title.slice(0, 18);
}
function firstSentence(s){
  if (!s) return '';
  const t = String(s).split(/(?<=[.!?…])\s/)[0];
  return t.length > 90 ? t.slice(0, 88) + '…' : t;
}

function buildRelics(slug, quests){
  const pref = quests.filter(q => q.kind !== 'gate' && (q.cat === 'relic' || q.kind === 'inspect'));
  const alt = quests.filter(q => q.kind !== 'gate' && q.mini);
  const rest = quests.filter(q => q.kind !== 'gate');
  const pick = [];
  const seen = new Set();
  const push = arr => arr.forEach(q => { if (pick.length < 12 && !seen.has(q.id)){ seen.add(q.id); pick.push(q); } });
  push(pref); push(alt);
  if (pick.length < 6) push(rest);

  return pick.map(q => ({
    id: 'r-' + q.id,
    icon: q.icon || '🏺',
    name: relicName(q.title),
    era: slug,
    from: q.id,
    line: firstSentence((q.mini && q.mini.ok) || (q.q && q.q.ok) || (q.capstone && q.capstone.ok) || q.story || q.setup || '')
  }));
}

/* ══════════════════════════════════════════════════════════════
   사진 (요구 10)
   ══════════════════════════════════════════════════════════════ */
function photoIndex(){
  const dir = path.join(ROOT, 'assets', 'photos');
  const set = new Set();
  try {
    fs.readdirSync(dir).forEach(f => {
      const m = f.match(/^(.+)\.(jpg|jpeg|png|webp)$/i);
      if (m) set.add(m[1]);
    });
  } catch(e){}
  try {
    fs.readdirSync(path.join(ROOT, 'assets')).forEach(f => {
      const m = f.match(/^(.+)\.webp$/i);
      if (m) set.add('..:' + m[1]);
    });
  } catch(e){}
  return set;
}

function attachPhotos(quests, photos){
  let n = 0;
  quests.forEach(q => {
    if (!q.contentId) return;
    const id = q.contentId;
    if (photos.has(id)){ q.img = [id + '.jpg']; n++; }
    else if (photos.has(id + '-2')){ q.img = [id + '-2.jpg']; n++; }
    else if (photos.has('..:' + id)){ q.img = ['assets/' + id + '.webp']; n++; }
  });
  return n;
}

/* ══════════════════════════════════════════════════════════════
   사극체 변환
   ══════════════════════════════════════════════════════════════ */
function haoQuest(q){
  const S = v => (typeof v === 'string' ? toHao(v) : v);
  q.title = S(q.title);
  q.story = S(q.story); q.setup = S(q.setup); q.prompt = S(q.prompt);
  q.epilogue = S(q.epilogue); q.doneMsg = S(q.doneMsg); q.confirm = S(q.confirm);
  q.recap = S(q.recap);
  if (q.q){
    q.q.text = S(q.q.text); q.q.ok = S(q.q.ok); q.q.no = S(q.q.no);
  }
  if (q.capstone){
    q.capstone.text = S(q.capstone.text);
    q.capstone.ok = S(q.capstone.ok); q.capstone.no = S(q.capstone.no);
  }
  if (q.hotspots) q.hotspots.forEach(h => { h.label = S(h.label); h.note = S(h.note); });
  if (q.choices) q.choices.forEach(c => { if (c && c.outcome) c.outcome = S(c.outcome); });
  if (q.stages) q.stages.forEach(s => {
    s.story = S(s.story);
    if (s.q){ s.q.text = S(s.q.text); s.q.ok = S(s.q.ok); s.q.no = S(s.q.no); }
  });
  if (q.mini){
    q.mini.intro = S(q.mini.intro); q.mini.ok = S(q.mini.ok); q.mini.retry = S(q.mini.retry);
    q.mini.tag = S(q.mini.tag);
  }
  if (q.items) q.items.forEach(it => { it.label = S(it.label); });
  return q;
}

/* ══════════════════════════════════════════════════════════════
   내보내기
   ══════════════════════════════════════════════════════════════ */
function emitBuilders(doc, slug){
  const meta = ERA_META[slug];
  const areaIds = Object.keys(doc.areas);
  const defined = doc.order;

  // 지역 빌더 고르기
  const areaBuilder = {};
  areaIds.forEach(a => {
    if (a === 'main'){
      areaBuilder[a] = defined.find(n => /World/i.test(n)) || defined[defined.length - 1] || null;
    } else {
      areaBuilder[a] = defined.find(n => n.toLowerCase().endsWith(a.toLowerCase()))
                    || defined.find(n => n.toLowerCase().includes(a.toLowerCase()))
                    || null;
    }
  });
  const areaBuilderNames = new Set(Object.values(areaBuilder).filter(Boolean));

  let out = '';

  // 시대 전용 소품 — 이름으로 만든다
  defined.forEach(name => {
    if (areaBuilderNames.has(name)) return;
    out += `function ${name}(x, z){ return P.eraProp(${JSON.stringify(name)}, x, z); }\n`;
  });
  out += '\n';

  // 지역 빌더
  areaIds.forEach(a => {
    const name = areaBuilder[a];
    const fn = `build${meta.key[0] + meta.key.slice(1).toLowerCase()}_${a}`;
    const calls = (name && doc.builders[name]) || [];
    const body = calls.map(([f, args]) => {
      const isCommon = COMMON.has(f);
      const call = `${isCommon ? 'S.' : ''}${f}(${args})`;
      return `  ${isCommon || defined.includes(f) ? call : `P.eraProp(${JSON.stringify(f)}, ${args || '0, 0'})`};`;
    }).join('\n');
    out += `export function ${fn}(){\n`;
    out += body || '  S.buildGround();\n  S.buildMountains();\n  S.scatterTreesArea(20, [-30,30], [-30,26], 6, "mix");';
    out += `\n}\n\n`;
    areaBuilder[a] = fn;
  });

  const map = areaIds.map(a => `  ${JSON.stringify(a)}: ${areaBuilder[a]}`).join(',\n');
  out += `export const AREA_BUILDERS_${meta.key} = {\n${map}\n};\n`;
  return out;
}

function emitEra(slug, doc, contentCat, photos){
  const meta = ERA_META[slug];
  const K = meta.key;

  doc.quests.forEach(q => { q.cat = decideCat(q, contentCat); });
  const nPhoto = attachPhotos(doc.quests, photos);
  const relics = buildRelics(slug, doc.quests);
  doc.quests.forEach(haoQuest);
  doc.gates.forEach(g => { g.title = toHao(g.title); g.confirm = toHao(g.confirm); });
  doc.npcs.forEach(n => { n.lines = (n.lines || []).map(toHao); });
  relics.forEach(r => { r.line = toHao(r.line); });

  const J = (v) => JSON.stringify(v, null, 1).replace(/\n/g, '\n');

  let out = `/* 자동 생성 — tools/convert.mjs · 원본 docs/content/${Object.keys(FILE_OF).find(k => FILE_OF[k] === slug)}.md
   손으로 고치지 마세요. 문체는 tools/style-hao.mjs 규칙을 따릅니다. */
import * as S from '../engine/scene-helpers.js';
import * as P from '../engine/props.js';

export const AREAS_${K} = ${J(doc.areas)};

export const GATES_${K} = ${J(doc.gates)};

export const QUESTS_${K}_BASE = ${J(doc.quests)};

export const QUESTS_${K} = [ ...QUESTS_${K}_BASE,
  ...GATES_${K}.map(g => ({ id:g.id, kind:'gate', cat:'event', icon:g.icon,
    title:g.title, area:g.area, pos:g.pos, to:g.to, confirm:g.confirm })) ];

export const NPCS_${K} = ${J(doc.npcs)};

export const RELICS_${K} = ${J(relics)};

`;
  out += emitBuilders(doc, slug);
  fs.writeFileSync(path.join(ERAS_DIR, slug + '.js'), out, 'utf8');

  return {
    slug, key: K, quests: doc.quests.length, gates: doc.gates.length,
    npcs: doc.npcs.length, relics: relics.length, photos: nPhoto,
    areas: Object.keys(doc.areas), startArea: Object.keys(doc.areas)[0], areasObj: doc.areas
  };
}

/* ══════════════════════════════════════════════════════════════
   실행
   ══════════════════════════════════════════════════════════════ */
function main(){
  fs.mkdirSync(ERAS_DIR, { recursive: true });

  const { eras, content } = extractMapData();
  const contentCat = catOfContent(content);
  const photos = photoIndex();

  const stats = [];
  Object.entries(FILE_OF).forEach(([file, slug]) => {
    const text = fs.readFileSync(path.join(CONTENT_DIR, file + '.md'), 'utf8');
    const doc = parseDoc(slug, text);
    stats.push(emitEra(slug, doc, contentCat, photos));
  });

  /* worlds-registry */
  const imports = stats.map(s =>
    `import { AREAS_${s.key}, QUESTS_${s.key}, NPCS_${s.key}, RELICS_${s.key}, AREA_BUILDERS_${s.key} } from '../eras/${s.slug}.js';`
  ).join('\n');

  const worlds = stats.map(s => {
    const m = ERA_META[s.slug];
    const a0 = s.areasObj[s.startArea];
    return `  ${JSON.stringify(s.slug)}: {
    mode:'3d', name:${JSON.stringify(m.name)}, short:${JSON.stringify(m.short)}, years:${JSON.stringify(m.years)},
    quests: QUESTS_${s.key}, saveKey:'${s.slug}Explore_v1',
    bg:${JSON.stringify(a0.bg)}, spawn:${JSON.stringify(a0.spawn)}, bound:${a0.bound},
    brand:${JSON.stringify(m.brand)}, startArea:${JSON.stringify(s.startArea)},
    loading:${JSON.stringify(a0.loading)},
    eyebrow:${JSON.stringify(m.eyebrow)},
    title:${JSON.stringify(m.name + '으로 들어서다')},
    body:${JSON.stringify('{이름}이여, 그대는 시간의 틈에 휩쓸려 이곳에 닿았다.\n이 땅의 사람들이 무엇을 보고 무엇을 골랐는지, 두 발로 걸어 알아보시오.')},
    hint:${JSON.stringify('W A S D 또는 방향키로 걷고, 빛나는 자리에 다가가 조사해 보시오.')},
    complete:{ title:${JSON.stringify(m.name + '을 마치다')}, body:${JSON.stringify('이 시대의 임무를 모두 마쳤소. 수첩에 도장이 하나 더 늘었구려.')} }
  }`;
  }).join(',\n');

  const reg = `/* 자동 생성 — tools/convert.mjs
   새 시대는 여기에만 손댑니다. WORLDS 의 첫 항목이 기본값입니다. */
${imports}

export const WORLDS = {
${worlds}
};

export const AREAS_BY_WORLD = {
${stats.map(s => `  ${JSON.stringify(s.slug)}: AREAS_${s.key}`).join(',\n')}
};

export const AREA_BUILDERS_BY_WORLD = {
${stats.map(s => `  ${JSON.stringify(s.slug)}: AREA_BUILDERS_${s.key}`).join(',\n')}
};

export const NPCS_BY_WORLD = {
${stats.map(s => `  ${JSON.stringify(s.slug)}: NPCS_${s.key}`).join(',\n')}
};

export const RELICS_BY_WORLD = {
${stats.map(s => `  ${JSON.stringify(s.slug)}: RELICS_${s.key}`).join(',\n')}
};
`;
  fs.writeFileSync(path.join(ROOT, 'js', 'engine', 'worlds-registry.js'), reg, 'utf8');

  /* map-data.js */
  const mapData = `/* 자동 생성 — tools/convert.mjs · 원본 docs/04-LEARN-MODE.md
   지도 모드 데이터. 평범한 <script> 전역입니다 (MASTER §2-3). */
var MAP = { lng0:115, lng1:137, lat0:30, lat1:49, w:800, h:902 };
function px(lng){ return (lng - MAP.lng0) * (MAP.w / (MAP.lng1 - MAP.lng0)); }
function py(lat){ return (MAP.lat1 - lat) * (MAP.h / (MAP.lat1 - MAP.lat0)); }
window.MAP = MAP; window.px = px; window.py = py;

${eras.trim()}

${content.trim()}
`;
  fs.writeFileSync(path.join(ROOT, 'js', 'map-data.js'), mapData, 'utf8');

  /* 보고 */
  const tot = stats.reduce((a, s) => ({
    q: a.q + s.quests, g: a.g + s.gates, n: a.n + s.npcs, r: a.r + s.relics, p: a.p + s.photos
  }), { q:0, g:0, n:0, r:0, p:0 });

  const lines = [];
  lines.push('시대  퀘스트  관문  NPC  유물  사진  지역');
  stats.forEach(s => lines.push(
    `${s.slug.padEnd(15)} ${String(s.quests).padStart(4)} ${String(s.gates).padStart(5)} ${String(s.npcs).padStart(5)} ${String(s.relics).padStart(5)} ${String(s.photos).padStart(5)}  ${s.areas.join(',')}`
  ));
  lines.push(`합계            ${tot.q}  ${tot.g}  ${tot.n}  ${tot.r}  ${tot.p}`);
  lines.push(`학습 항목 cat 표: ${Object.keys(contentCat).length}개`);
  const report = lines.join('\n');
  fs.writeFileSync(path.join(HERE, 'convert-report.txt'), report, 'utf8');
  console.log(report);
}

main();
