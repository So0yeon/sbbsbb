/* ══════════════════════════════════════════════════════════════════════
   fetch-photos.mjs — 위키미디어 공용에서 사진을 더 모은다 (MASTER §9-3)

       node tools/fetch-photos.mjs           내려받기
       node tools/fetch-photos.mjs --dry     무엇을 받을지만 보기

   규약
     - User-Agent 필수
     - 자유 이용 라이선스만 (CC BY / CC BY-SA / CC0 / 퍼블릭 도메인 / 공공누리 1유형)
     - 가로 1200px 썸네일을 받는다 (원본을 받아 줄이지 않는다)
     - **자동 검색만 믿지 않는다.** 받은 뒤 tools/contact-sheet.html 로 눈으로 확인한다
     - 저작자·라이선스·원본 URL 이 모두 있어야 저장한다
   ══════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIR = path.join(ROOT, 'assets', 'photos');
const UA = 'korean-history-atlas/1.0 (teacher hackathon; contact bgnlkim@gmail.com)';
const DRY = process.argv.includes('--dry');

const OK_LIC = /(CC[ -]BY(-SA)?[ -][\d.]+|CC0|Public domain|KOGL Type ?1|공공누리)/i;
const BAD_TITLE = /(subway|metro|지하철|logo|map of the world|flag of|coat of arms|stamp of|banknote|cosplay|replica of the|modern)/i;

/* 항목 id → 검색어 (앞의 것부터 시도) · 제목에 반드시 있어야 하는 낱말 */
const TARGETS = {
  /* 삼국 */
  'bi-gwanggaeto': { q: ['Gwanggaeto Stele', '광개토대왕릉비'], must: /(gwanggaeto|광개토)/i },
  'seokchon':      { q: ['Seokchon-dong Ancient Tombs Seoul', '석촌동 고분'], must: /(seokchon|석촌)/i },
  'chiljido':      { q: ['Seven-Branched Sword', '칠지도'], must: /(branched sword|칠지도)/i },
  'goryeong':      { q: ['Jisan-dong Tumuli Goryeong', '고령 지산동 고분군'], must: /(jisan|goryeong|지산|고령)/i },
  'sillauisik':    { q: ['토우장식 장경호', 'Silla pottery figurine Gyeongju', '신라 토우'], must: /(토우|figurine|silla)/i },
  'maekjeok':      { q: ['Anak Tomb No. 3 mural kitchen', '고구려 고분 벽화 부엌'], must: /(anak|mural|벽화|tomb)/i },
  'jumong':        { q: ['Wunu Mountain City', '오녀산성'], must: /(wunu|오녀|mountain city)/i },
  'jangsu':        { q: ['Tomb of the General Ji an', '장군총'], must: /(general|장군총|jiang)/i },
  'onjo':          { q: ['Pungnaptoseong', '풍납토성'], must: /(pungnap|풍납)/i },
  'hyeokgeose':    { q: ['Najeong Gyeongju', '나정 경주'], must: /(najeong|나정)/i },
  'icadon':        { q: ['Ichadon monument', '이차돈 순교비'], must: /(ichadon|이차돈)/i },
  'jinheung':      { q: ['Bukhansan Silla Monument Jinheung', '북한산 진흥왕 순수비'], must: /(jinheung|진흥|silla monument)/i },
  'salsu':         { q: ['Eulji Mundeok statue', '을지문덕'], must: /(eulji|을지문덕)/i },
  'ansiseong':     { q: ['백암성', 'Goguryeo mountain fortress wall', '고구려 성벽'], must: /(goguryeo|고구려|산성|성벽|백암)/i },
  'hwangsan':      { q: ['Gyebaek statue Nonsan', '계백 장군'], must: /(gyebaek|계백)/i },
  'gwansanseong':  { q: ['Jeongnimsa Temple Site Five-story Stone Pagoda', '정림사지 오층석탑'], must: /(jeongnim|정림)/i },

  /* 조선 후기 */
  'jinju':         { q: ['Jinjuseong Fortress', '진주성'], must: /(jinju|진주)/i },
  'tongsinsa':     { q: ['Joseon Tongsinsa procession', '조선통신사 행렬도'], must: /(tongsinsa|통신사)/i },
  'sangpyeongtongbo': { q: ['Sangpyeong Tongbo coin', '상평통보'], must: /(sangpyeong|상평통보)/i },
  'hangeulsoseol': { q: ['Korean folk painting magpie and tiger', '까치호랑이 민화'], must: /(magpie|tiger|민화|호작)/i },
  'uibyeong':      { q: ['Gwak Jae-u', '곽재우'], must: /(gwak|곽재우)/i },
  'tangpyeong':    { q: ['Portrait of King Yeongjo', '영조 어진'], must: /(yeongjo|영조)/i },
  'cheonjugyo':    { q: ['Jeoldusan Martyrs Shrine', '절두산'], must: /(jeoldusan|절두산)/i },
  'donghak-changje': { q: ['Choe Je-u Donghak', '최제우'], must: /(choe je|donghak|최제우|동학)/i },

  /* 개항기 · 일제강점기 */
  'cheokhwabi':    { q: ['Cheokhwabi monument', '척화비'], must: /(cheokhwabi|척화비)/i },
  'dongnimmun':    { q: ['Independence Gate Seoul', '독립문'], must: /(independence gate|독립문)/i },
  'gukgwon':       { q: ['Eulsa Treaty 1905 document', '을사늑약'], must: /(eulsa|을사)/i },
  'yugwansun':     { q: ['Yu Gwan-sun', '유관순'], must: /(gwan-sun|gwansun|유관순)/i },
  'samil':         { q: ['3·1 운동 만세 시위', 'March First Movement demonstration 1919', '기미독립선언서'], must: /(march first|1919|삼일|3·1|만세|독립선언)/i },
  'joseoneo':      { q: ['Korean Language Society Joseoneo hakhoe', '조선어학회'], must: /(language society|조선어학회)/i },
  'ssalsutal':     { q: ['군산 근대건축관', 'Gunsan Modern Architecture Museum', '군산항'], must: /(gunsan|군산)/i },
  'sinheung':      { q: ['Korean Independence Army', '한국독립군'], must: /(independence army|독립군)/i },

  /* 광복 · 6·25 */
  /* 아래 넷은 자동 검색이 엉뚱한 사진을 가져와 뺐습니다 — 사람이 직접 고르세요.
     warstart(38선 표지판을 찾으니 미국 도로 표지판이 나옴) · kimgu(인물 확인 불가한 단체 사진)
     gwangbok · cheonmak(조건에 맞는 자유 이용 사진을 찾지 못함).
     MASTER §9-3 "자동 검색만 믿으면 안 됩니다" 의 실제 사례입니다. */
  'chongseongeo':  { q: ['1948 South Korean Constitutional Assembly election', '5·10 총선거'], must: /(1948|election|총선거|제헌)/i },
  'hangang-gyo':   { q: ['Hangang Bridge 1950 Korean War', '한강 인도교'], must: /(han river|hangang|bridge)/i },
  'heungnam':      { q: ['Hungnam evacuation December 1950', '흥남 철수'], must: /(hungnam|heungnam|흥남)/i },
  'boatman':       { q: ['SS Meredith Victory Hungnam', 'Hungnam evacuation ship'], must: /(meredith|hungnam|흥남)/i },
  'pinanjip':      { q: ['Korean War refugees Busan shanty', '부산 피란민'], must: /(refugee|busan|피란|부산)/i },
  'muljigye':      { q: ['Korea water carrier jige 1950s', '물지게'], must: /(water|jige|물지게|carrier)/i },
  'sijang':        { q: ['Gukje Market Busan', '부산 국제시장'], must: /(gukje|busan|국제시장|부산)/i },
  'chinain':       { q: ['감천문화마을', 'Gamcheon Culture Village Busan', '부산 산복도로'], must: /(gamcheon|감천|busan|부산)/i },
  'milmyeon':      { q: ['Milmyeon noodles Busan', '밀면'], must: /(milmyeon|밀면|noodle)/i },
  'amnok':         { q: ['Yalu River bridge Amnok', '압록강'], must: /(yalu|amnok|압록)/i },
  'armistice':     { q: ['Korean Armistice Agreement Panmunjom 1953', '정전협정'], must: /(armistice|panmunjom|1953|정전)/i },
  'isan':          { q: ['Imjingak ribbons separated families', '임진각'], must: /(imjingak|임진각)/i },
  'ireumdoro':     { q: ['자유의 다리 임진각', 'Freedom Bridge Imjingak', '임진각 철조망'], must: /(imjingak|freedom bridge|임진각|자유의)/i }
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function stripTags(s){
  return String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

async function search(term){
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', origin: '*',
    generator: 'search',
    gsrsearch: 'filetype:bitmap ' + term,
    gsrnamespace: '6',
    gsrlimit: '10',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata|mime',
    iiurlwidth: '1200'
  });
  for (let i = 0; i < 4; i++){
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
      if (r.ok) return await r.json();
    } catch(e){}
    await sleep(700 * (i + 1));
  }
  return null;
}

function pick(json, must){
  const pages = json && json.query && json.query.pages;
  if (!pages) return null;
  const list = Object.values(pages);
  for (const p of list){
    const ii = (p.imageinfo || [])[0];
    if (!ii) continue;
    const title = p.title || '';
    if (BAD_TITLE.test(title)) continue;
    if (must && !must.test(title)) continue;
    if ((ii.width || 0) < 300) continue;
    if (!/^image\/(jpeg|png|webp)$/.test(ii.mime || '')) continue;
    const em = ii.extmetadata || {};
    const lic = stripTags(em.LicenseShortName && em.LicenseShortName.value);
    const author = stripTags(em.Artist && em.Artist.value);
    if (!lic || !OK_LIC.test(lic)) continue;
    if (!author) continue;
    return {
      title, author, license: lic,
      src: ii.thumburl || ii.url,
      page: ii.descriptionurl || '',
      w: ii.thumbwidth || ii.width
    };
  }
  return null;
}

async function download(url, dest){
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 4000) throw new Error('너무 작은 파일');
  fs.writeFileSync(dest, buf);
  return buf.length;
}

const got = [], missed = [];

for (const [id, t] of Object.entries(TARGETS)){
  const exists = fs.existsSync(path.join(DIR, id + '.jpg')) || fs.existsSync(path.join(DIR, id + '.png'));
  if (exists){ continue; }

  let found = null;
  for (const term of t.q){
    const json = await search(term);
    found = pick(json, t.must);
    if (found) break;
    await sleep(400);
  }
  if (!found){ missed.push(id); console.log('✗ ' + id + ' — 조건에 맞는 사진을 찾지 못했습니다'); continue; }

  const ext = /\.png$/i.test(found.src) ? '.png' : '.jpg';
  const file = id + ext;
  if (DRY){
    got.push({ id, file, ...found, bytes: 0 });
    console.log('· ' + id + ' → ' + found.title + ' [' + found.license + ']');
  } else {
    try {
      const n = await download(found.src, path.join(DIR, file));
      got.push({ id, file, ...found, bytes: n });
      console.log('✓ ' + id + ' → ' + file + ' (' + Math.round(n/1024) + 'KB) ' + found.license);
    } catch(e){
      missed.push(id);
      console.log('✗ ' + id + ' — 내려받기 실패: ' + e.message);
    }
  }
  await sleep(500);
}

/* CREDITS.md 에 덧붙인다 (append-only) */
if (!DRY && got.length){
  const md = path.join(DIR, 'CREDITS.md');
  let src = fs.readFileSync(md, 'utf8');
  const add = got.map(g =>
    `| \`${g.file}\` | ${g.id} | — | ${g.author} | ${g.license} |`
  ).join('\n');
  const header = '\n\n## 추가 수집 (개발 시작 이후)\n\n' +
    '아래는 관찰 임무에 쓰려고 나중에 더 모은 사진입니다. 원본 문서 링크는 `tools/photo-fetch-log.txt` 에 있습니다.\n\n' +
    '| 파일 | 학습 항목 | 원래 id | 저작자 | 라이선스 |\n|---|---|---|---|---|\n';
  if (src.indexOf('## 추가 수집') < 0) src += header + add + '\n';
  else src += add + '\n';
  fs.writeFileSync(md, src, 'utf8');

  fs.writeFileSync(path.join(HERE, 'photo-fetch-log.txt'),
    got.map(g => [g.id, g.file, g.title, g.author, g.license, g.page].join('\t')).join('\n'), 'utf8');
}

console.log(`\n받은 사진 ${got.length}장 · 못 받은 항목 ${missed.length}개`);
if (missed.length) console.log('못 받음: ' + missed.join(', '));
console.log('\n⚠ 반드시 tools/contact-sheet.html 로 눈으로 확인하세요.');
