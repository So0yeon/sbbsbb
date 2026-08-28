// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   atlas-photos.js — 사진 찾기 (MASTER §9-3)

   기본은 파일 참조다. assets/photos/*.jpg 를 <img src> 로 바로 쓴다.
   목록에 없으면 사진 칸 자체를 그리지 않는다 — onerror 로 숨기면 콘솔에 404가 쌓인다.

   목록의 출처는 js/asset-credits.js 하나다 (파일명 = 학습 항목 id).
   HB_PHOTOS 는 파일이 없는 항목만 인라인으로 채우는 폴백 자리다. 비어 있어도 정상 동작한다.
   ══════════════════════════════════════════════════════════════════════ */
(function (g) {
  'use strict';

  /* assets/ 바로 아래에 있는 webp 8장 */
  var WEBP = {
    'bitsal': 'assets/bitsal.webp',
    'bronze-mirror': 'assets/bronze-mirror.webp',
    'galdolgalpan': 'assets/galdolgalpan.webp',
    'garak': 'assets/garak.webp',
    'bangudae': 'assets/paleo-bangudae-petroglyphs-1.webp',
    'jeongok': 'assets/paleo-jeongokri-handaxe.webp'
  };

  /* 파일이 없는 항목을 base64 로 채우는 자리 — 비어 있어도 됩니다 */
  var HB_PHOTOS = {};

  var index = null;

  function build() {
    index = {};
    var list = (g.AtlasCredits && g.AtlasCredits.PHOTOS) || [];
    list.forEach(function (c) {
      var item = c.item || c.file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      if (!index[item]) index[item] = [];
      index[item].push(c.file);
    });
    // '-2' 변형은 뒤로 보낸다 (대표 사진을 먼저)
    Object.keys(index).forEach(function (k) {
      index[k].sort(function (a, b) { return (/-2\./.test(a) ? 1 : 0) - (/-2\./.test(b) ? 1 : 0); });
    });
  }

  /** 학습 항목 id → { src, file, alt } 또는 null */
  function photoFor(id) {
    if (!id) return null;
    if (!index) build();
    var files = index[id];
    if (files && files.length) {
      return { src: 'assets/photos/' + files[0], file: files[0] };
    }
    if (WEBP[id]) return { src: WEBP[id], file: WEBP[id].split('/').pop() };
    if (HB_PHOTOS[id]) return { src: HB_PHOTOS[id].src, file: id, inline: true };
    return null;
  }

  /** 그 항목에 붙은 사진을 모두 (여러 장 보기용) */
  function photosFor(id) {
    if (!index) build();
    var out = (index[id] || []).map(function (f) {
      return { src: 'assets/photos/' + f, file: f };
    });
    if (WEBP[id]) out.push({ src: WEBP[id], file: WEBP[id].split('/').pop() });
    return out;
  }

  /** 사진이 있는 학습 항목 id 목록 */
  function itemsWithPhoto() {
    if (!index) build();
    return Object.keys(index).concat(Object.keys(WEBP)).filter(function (v, i, a) {
      return a.indexOf(v) === i;
    });
  }

  g.AtlasPhotos = { photoFor: photoFor, photosFor: photosFor, itemsWithPhoto: itemsWithPhoto, HB_PHOTOS: HB_PHOTOS };

})(typeof window !== 'undefined' ? window : globalThis);
