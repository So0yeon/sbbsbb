// © 2026 김용현
/* 차오름 애니메이션 — 물결 모양 clipPath 로 켜진 겹을 아래에서부터 드러냅니다.
   기법과 설정값은 tide-fill-map 을 그대로 따랐습니다.
   평범한 전역 스크립트입니다 (MASTER §2-3). */
(function () {
  'use strict';

  var CFG = { duration: 2400, amplitude: 18, wavelength: 140, cycles: 2.2 };

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* 수면 아래를 채운 영역. level 은 수면의 y 좌표입니다 (작을수록 높이 찼습니다). */
  function wave(box, level, phase) {
    var pad = CFG.amplitude + 12;
    var x0 = box.x - 20, x1 = box.x + box.width + 20;
    var step = Math.max(4, (x1 - x0) / 80);
    var surf = function (x) {
      return level + CFG.amplitude * Math.sin((x / CFG.wavelength) * Math.PI * 2 + phase);
    };
    var d = 'M' + x0.toFixed(1) + ' ' + surf(x0).toFixed(1);
    for (var x = x0 + step; x <= x1; x += step) d += 'L' + x.toFixed(1) + ' ' + surf(x).toFixed(1);
    var bottom = box.y + box.height + pad * 2;
    return d + 'L' + x1.toFixed(1) + ' ' + bottom.toFixed(1) +
               'L' + x0.toFixed(1) + ' ' + bottom.toFixed(1) + 'Z';
  }

  /* t = 0 이면 바닥(아무것도 안 참), 1 이면 꼭대기(가득 참) */
  function levelAt(box, t) {
    var pad = CFG.amplitude + 12;
    var yStart = box.y + box.height + pad, yEnd = box.y - pad;
    return yStart - (yStart - yEnd) * t;
  }

  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* opts: { box, dir:'in'|'out', duration, onFrame(d, p), onDone } */
  function run(opts) {
    var box = opts.box, dir = opts.dir || 'in';
    var dur = opts.duration || CFG.duration;
    var full = dir === 'in' ? 1 : 0;

    if (reduced || !box || !box.height) {
      opts.onFrame(wave(box || { x: 0, y: 0, width: 1, height: 1 }, levelAt(box || { x: 0, y: 0, width: 1, height: 1 }, full), 0), 1);
      if (opts.onDone) opts.onDone();
      return { cancel: function () {} };
    }

    var t0 = 0, id = 0, dead = false;
    function frame(ts) {
      if (dead) return;
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var e = easeOutCubic(p);
      opts.onFrame(wave(box, levelAt(box, dir === 'in' ? e : 1 - e), p * Math.PI * 2 * CFG.cycles), p);
      if (p < 1) id = requestAnimationFrame(frame);
      else if (opts.onDone) opts.onDone();
    }
    id = requestAnimationFrame(frame);
    return { cancel: function () { dead = true; cancelAnimationFrame(id); } };
  }

  /* 애니메이션 없이 가득 채운 상태 */
  function fill(box) { return wave(box, levelAt(box, 1), 0); }

  window.Tide = { CFG: CFG, run: run, wave: wave, levelAt: levelAt, fill: fill, reduced: reduced };
})();
