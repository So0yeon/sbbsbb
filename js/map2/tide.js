// © 2026 김용현
/* 차오름 애니메이션 — 물결 모양 clipPath 로 켜진 겹을 아래에서부터 드러냅니다.
   기법과 설정값은 tide-fill-map 을 그대로 따랐습니다.
   평범한 전역 스크립트입니다 (MASTER §2-3). */
(function () {
  'use strict';

  var CFG = { duration: 2600, amplitude: 18, wavelength: 140, cycles: 2.2 };

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* 수면 한 줄(line)과 그 아래를 채운 영역(area)을 함께 만듭니다.
     level 은 수면의 y 좌표입니다 — 작을수록 높이 찼습니다. */
  function wave(box, level, phase, amp) {
    if (amp == null) amp = CFG.amplitude;
    var pad = CFG.amplitude + 12;
    var x0 = box.x - 20, x1 = box.x + box.width + 20;
    var step = Math.max(4, (x1 - x0) / 80);
    var surf = function (x) {
      return level + amp * Math.sin((x / CFG.wavelength) * Math.PI * 2 + phase);
    };
    var line = 'M' + x0.toFixed(1) + ' ' + surf(x0).toFixed(1);
    for (var x = x0 + step; x <= x1; x += step) line += 'L' + x.toFixed(1) + ' ' + surf(x).toFixed(1);
    var bottom = box.y + box.height + pad * 2;
    return {
      line: line,
      area: line + 'L' + x1.toFixed(1) + ' ' + bottom.toFixed(1) +
                   'L' + x0.toFixed(1) + ' ' + bottom.toFixed(1) + 'Z'
    };
  }

  /* t = 0 이면 바닥(아무것도 안 참), 1 이면 꼭대기(가득 참) */
  function levelAt(box, t) {
    var pad = CFG.amplitude + 12;
    var yStart = box.y + box.height + pad, yEnd = box.y - pad;
    return yStart - (yStart - yEnd) * t;
  }

  var systemReduced = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* force 가 null 이면 시스템 설정을 따르고, true/false 면 그것을 강제합니다. */
  /* full  — 물결치며 2.6초 동안 차오릅니다
     calm  — 물결 없이 1.2초 동안 잔잔히 차오릅니다 (움직임을 줄이라는 설정일 때)
     차오름 자체는 「영토가 넓어진다」는 내용이라 어느 쪽에서도 없애지 않습니다. */
  var api = {
    CFG: CFG,
    systemReduced: systemReduced,
    force: null,
    mode: function () {
      if (api.force === null) return systemReduced ? 'calm' : 'full';
      return api.force ? 'full' : 'calm';
    },
    calm: function () { return api.mode() === 'calm'; },
    dur: function () { return api.mode() === 'calm' ? 1200 : CFG.duration; },
    wave: wave,
    levelAt: levelAt,
    fill: function (box) { return wave(box, levelAt(box, 1), 0, 0); },
    run: run
  };

  /* opts: { box, dir:'in'|'out', duration, onFrame(o, p), onDone } */
  function run(opts) {
    var box = opts.box, dir = opts.dir || 'in';
    var calm = api.calm();
    var amp = calm ? 0 : CFG.amplitude;
    var dur = opts.duration || api.dur();
    var end = dir === 'in' ? 1 : 0;

    if (!box || !box.height) {
      var b = { x: 0, y: 0, width: 1, height: 1 };
      opts.onFrame(wave(b, levelAt(b, end), 0, amp), 1);
      if (opts.onDone) opts.onDone();
      return { cancel: function () {} };
    }

    var t0 = 0, id = 0, dead = false;
    function frame(ts) {
      if (dead) return;
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var e = easeOutCubic(p);
      opts.onFrame(wave(box, levelAt(box, dir === 'in' ? e : 1 - e),
                        calm ? 0 : p * Math.PI * 2 * CFG.cycles, amp), p);
      if (p < 1) id = requestAnimationFrame(frame);
      else if (opts.onDone) opts.onDone();
    }
    id = requestAnimationFrame(frame);
    return { cancel: function () { dead = true; cancelAnimationFrame(id); } };
  }

  window.Tide = api;
})();
