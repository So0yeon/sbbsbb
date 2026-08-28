/* ══════════════════════════════════════════════════════════════════════
   asset-credits.js — 자료 출처와 저작권 (MASTER.md §9-6)

   ● PHOTOS 블록은 assets/photos/CREDITS.md 에서 만들어집니다.
     고치려면 CREDITS.md 를 고치고 `node tools/gen-credits.mjs` 를 다시 돌리세요.
   ● ATLAS_CREDITS_EXTRA 는 손으로 적는 곳입니다. append-only —
     새 자료를 넣은 사람이 배열 끝에 자기 항목만 더하고, 남의 항목은 지우지 않습니다.

   CC BY-SA 사진은 저작자 이름을 그대로 표시해야 합니다. 줄이거나 다듬지 마세요.
   ══════════════════════════════════════════════════════════════════════ */

var ATLAS_CREDITS_PHOTOS = [
  { file:"baekja-2.jpg", item:"baekja", orig:"hb_43798363", author:"Hiart", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"baekja.jpg", item:"baekja", orig:"hb_84959535", author:"Ismoon (talk) 10:44, 14 December 2018 (UTC)", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"bipa.jpg", item:"bipa", orig:"hb_43785609", author:"Prof. Gary Lee Todd", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"bitsal.jpg", item:"bitsal", orig:"hb_30687085", author:"Szilas", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"bulguksa.jpg", item:"bulguksa", orig:"hb_75717042", author:"Leonard J. DeFrancisci", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"cheomseongdae.jpg", item:"cheomseongdae", orig:"hb_50078045", author:"Zsinj", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"cheongja.jpg", item:"cheongja", orig:"hb_22047484", author:"The original uploader was Korea history at English", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"daedongyeo.jpg", item:"daedongyeo", orig:"hb_94069864", author:"Gim Jeong-ho", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"daehan.jpg", item:"daehan", orig:"hb_70108878", author:"Joseph de La Nézière", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"daejoyeong.jpg", item:"daejoyeong", orig:"hb_88138414", author:"Good friend100 (talk) 01:13, 29 January 2008 (UTC)", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"daewongun.jpg", item:"daewongun", orig:"hb_32196305", author:"Hulbert, Homer B.", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"dangun-2.jpg", item:"dangun", orig:"hb_9215304", author:"Salamander724", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"dangun.jpg", item:"dangun", orig:"hb_68979560", author:"User:CatOnMars", license:"CC BY 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"ganggamchan.jpg", item:"ganggamchan", orig:"hb_65844808", author:"War Memorial of Korea Open Archives", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"ganghwa-dolmen.jpg", item:"ganghwa-dolmen", orig:"hb_33610823", author:"ChongDae", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"ganghwa-treaty.jpg", item:"ganghwa-treaty", orig:"hb_25966186", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gaya-iron.jpg", item:"gaya-iron", orig:"hb_13193622", author:"Gary Lee Todd, Ph.D.", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"geumdong.jpg", item:"geumdong", orig:"hb_71497777", author:"Gary Todd from Xinzheng, China", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"geumgwan.jpg", item:"geumgwan", orig:"hb_54725302", author:"Gary Todd", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gwahak-2.jpg", item:"gwahak", orig:"hb_75338454", author:"Nina R from Africa", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gwahak.jpg", item:"gwahak", orig:"hb_9384606", author:"Steve46814", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gwanggaeto-2.jpg", item:"gwanggaeto", orig:"hb_40111140", author:"Prcshaw", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gwanggaeto.jpg", item:"gwanggaeto", orig:"hb_39651435", author:"Yumeto", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gyeongbok.jpg", item:"gyeongbok", orig:"hb_22180013", author:"Basile Morin", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hansando-2.jpg", item:"hansando", orig:"hb_29998068", author:"Byeon Bak", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hansando.jpg", item:"hansando", orig:"hb_84359976", author:"Steve46814", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_14637964.jpg", item:"—", orig:"hb_14637964", author:"Bernard Gagnon", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_22281302.jpg", item:"—", orig:"hb_22281302", author:"Ismoon (talk) 21:12, 9 July 2018 (UTC)", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_23230617.jpg", item:"—", orig:"hb_23230617", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_30783945.jpg", item:"—", orig:"hb_30783945", author:"Abasaa", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_32134913.jpg", item:"—", orig:"hb_32134913", author:"The government of the Kingdom of Great(er) Joseon.", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_36423147.jpg", item:"—", orig:"hb_36423147", author:"Gary Todd from Xinzheng, China", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_3834244.jpg", item:"—", orig:"hb_3834244", author:"Trainholic", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_39033938.jpg", item:"—", orig:"hb_39033938", author:"Likely Samuel Austin Moffett", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_49092074.jpg", item:"—", orig:"hb_49092074", author:"the Chosun Bimbo (https://www.flickr.com/photos/46", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_52180914.jpg", item:"—", orig:"hb_52180914", author:"Kang Byeong Kee, 강병기", license:"CC BY 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_55362657.jpg", item:"—", orig:"hb_55362657", author:"Gary Todd from Xinzheng, China", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_61234265.jpg", item:"—", orig:"hb_61234265", author:"Contax3", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_66709271.jpg", item:"—", orig:"hb_66709271", author:"고려", license:"CC BY 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_69686179.jpg", item:"—", orig:"hb_69686179", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_70903956.jpg", item:"—", orig:"hb_70903956", author:"Steve46814", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_73347898.jpg", item:"—", orig:"hb_73347898", author:"Wikimedia Commons", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_78111482.jpg", item:"—", orig:"hb_78111482", author:"정초(鄭招), 변효문(卞孝文)", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_83468505.jpg", item:"—", orig:"hb_83468505", author:"Unknown artistUnknown artist", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_86380536.jpg", item:"—", orig:"hb_86380536", author:"Academy of Korean Studies", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_88642026.jpg", item:"—", orig:"hb_88642026", author:"User:Gapo", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_89187976.jpg", item:"—", orig:"hb_89187976", author:"Gyeongin Railway Co. Ltd., probably", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_94123189.jpg", item:"—", orig:"hb_94123189", author:"猫猫的日记本", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hwaseong.jpg", item:"hwaseong", orig:"hb_39333144", author:"Bernard Gagnon", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jeongok.jpg", item:"jeongok", orig:"hb_50982713", author:"Ismoon (talk) 19:51, 23 May 2018 (UTC)", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jikji.jpg", item:"jikji", orig:"hb_11634954", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jongmyo.jpg", item:"jongmyo", orig:"hb_75846400", author:"Cultural Heritage Administration", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"kimhongdo.jpg", item:"kimhongdo", orig:"hb_70474534", author:"Kim Hong-do", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"mireuksa.jpg", item:"mireuksa", orig:"hb_3952844", author:"Bernard Gagnon", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"moneagi.jpg", item:"moneagi", orig:"hb_39150857", author:"Unknown photographerUnknown photographer", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"mugujeonggwang.jpg", item:"mugujeonggwang", orig:"hb_66576255", author:"Naturehead", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"muryeong.jpg", item:"muryeong", orig:"hb_23444134", author:"en:Gihoon81", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"muyongchong.jpg", item:"muyongchong", orig:"hb_42726041", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"namhansan.jpg", item:"namhansan", orig:"hb_80523512", author:"Steve46814 (talk)", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"palman.jpg", item:"palman", orig:"hb_56800902", author:"Lauren Heckler (the Flickr ID is malpuella) at Fli", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"pansori.jpg", item:"pansori", orig:"hb_25468906", author:"originally by photoren", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sambyeolcho.jpg", item:"sambyeolcho", orig:"hb_36774372", author:"Chipmunkdavis", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sejong.jpg", item:"sejong", orig:"hb_43464725", author:"Government of Joseon", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"seohee.jpg", item:"seohee", orig:"hb_59304179", author:"玖巧仔", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"seokguram.jpg", item:"seokguram", orig:"hb_69204044", author:"Cultural Heritage Administration", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"silhak.jpg", item:"silhak", orig:"hb_11603435", author:"Wikimedia Commons", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sungnyemun.jpg", item:"sungnyemun", orig:"hb_45293754", author:"Sean Young (@assanges)", license:"CC BY 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"suro.jpg", item:"suro", orig:"hb_18964888", author:"HappyMidnight", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' }
];

var ATLAS_CREDITS_EXTRA = [
  { file:'countries-50m.json', item:'지도 원본', author:'Natural Earth', license:'퍼블릭 도메인',
    source:'Natural Earth 1:50m', sourceUrl:'https://www.naturalearthdata.com/' },
  { file:'vendor/three', item:'3D 엔진', author:'three.js 기여자들', license:'MIT',
    source:'three.js 0.160.0', sourceUrl:'https://threejs.org/' },
  { file:'vendor/font', item:'글꼴', author:'길형진 (orioncactus)', license:'SIL OFL 1.1',
    source:'Pretendard v1.3.9', sourceUrl:'https://github.com/orioncactus/pretendard' },
  { file:'*.glb', item:'3D 모델 9점', author:'', license:'미확인',
    source:'출처와 이용 조건을 확인하기 전까지 앱에서 부르지 않습니다', sourceUrl:'' },
  { file:'assets/Models', item:'저폴리 키트 22점', author:'', license:'미확인',
    source:'라이선스 파일이 동봉되지 않아 사용을 보류했습니다', sourceUrl:'' },
  { file:'교과 내용', item:'학습 내용', author:'', license:'',
    source:'초등학교 5학년 2학기 사회 교과서 및 2022 개정 교육과정 문서를 참고해 새로 썼습니다', sourceUrl:'' }
];

(function (g) {
  var byFile = {};
  ATLAS_CREDITS_PHOTOS.forEach(function (c) { byFile[c.file] = c; });

  function find(file) {
    if (!file) return null;
    var name = String(file).split('/').pop();
    return byFile[name] || byFile[name.replace(/\.(jpg|jpeg|png|webp)$/i, '') + '.jpg'] || null;
  }

  /** 사진 아래에 적을 한 줄. 확인되지 않은 항목은 빈 줄을 만들지 않는다 */
  function creditLine(file) {
    var c = find(file);
    if (!c) return '';
    var bits = [];
    if (c.author) bits.push(c.author);
    if (c.license) bits.push(c.license);
    if (c.source) bits.push(c.source);
    return bits.join(' · ');
  }

  function all() {
    return { photos: ATLAS_CREDITS_PHOTOS.slice(), extra: ATLAS_CREDITS_EXTRA.slice() };
  }

  g.AtlasCredits = { find: find, creditLine: creditLine, all: all,
                     PHOTOS: ATLAS_CREDITS_PHOTOS, EXTRA: ATLAS_CREDITS_EXTRA };
})(typeof window !== 'undefined' ? window : globalThis);
