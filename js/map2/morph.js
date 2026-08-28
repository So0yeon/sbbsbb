// © 2026 김용현
/* 영토 모핑 — 같은 나라가 다음 세기로 넘어갈 때 모양이 흘러서 바뀝니다.
   영토는 조각(섬·본토) 여러 개의 모음이고 조각 수가 세기마다 다릅니다
   (고구려 4세기 2조각 → 5세기 12조각). 그래서 먼저 조각끼리 짝을 짓고,
   짝지어진 조각은 점 개수를 맞춰 잇고, 짝이 없는 조각은 제 중심으로 사라지거나 자라납니다.
   평범한 전역 스크립트입니다 (MASTER §2-3). */
(function () {
  'use strict';

  var MIN_PTS = 16, MAX_PTS = 200;   // 모핑 중에도 해안선이 뭉개지지 않을 만큼
  var MATCH_MIN = 0.15;      // 이보다 낮으면 짝으로 보지 않습니다
  var MATCH_MAX_DIST = 150;  // 이보다 멀면 짝으로 보지 않습니다 (화면 좌표 px)

  /* "M x y L x y … Z" 만 나오므로 숫자만 짝지으면 됩니다 */
  function parseRings(d) {
    var out = [];
    if (!d) return out;
    d.split('M').forEach(function (s) {
      if (!s) return;
      var n = s.replace(/[LlZz]/g, ' ').trim().split(/[\s,]+/);
      var pts = [];
      for (var i = 0; i + 1 < n.length; i += 2) {
        var x = +n[i], y = +n[i + 1];
        if (!isNaN(x) && !isNaN(y)) pts.push([x, y]);
      }
      if (pts.length >= 3) out.push(pts);
    });
    return out;
  }

  function signedArea(p) {
    var a = 0;
    for (var i = 0; i < p.length; i++) {
      var q = p[(i + 1) % p.length];
      a += p[i][0] * q[1] - q[0] * p[i][1];
    }
    return a / 2;
  }
  function centroid(p) {
    var x = 0, y = 0;
    for (var i = 0; i < p.length; i++) { x += p[i][0]; y += p[i][1]; }
    return [x / p.length, y / p.length];
  }
  function perimeter(p) {
    var s = 0;
    for (var i = 0; i < p.length; i++) {
      var q = p[(i + 1) % p.length];
      s += Math.hypot(q[0] - p[i][0], q[1] - p[i][1]);
    }
    return s;
  }
  function cw(p) { return signedArea(p) < 0 ? p.slice().reverse() : p; }

  /* 둘레를 n 등분해 점을 다시 뽑습니다 */
  function resample(p, n) {
    var seg = [], total = 0, i;
    for (i = 0; i < p.length; i++) {
      var q = p[(i + 1) % p.length];
      var len = Math.hypot(q[0] - p[i][0], q[1] - p[i][1]);
      seg.push(len); total += len;
    }
    if (!total) return p.slice(0, n);
    var out = [], step = total / n, idx = 0, acc = 0;
    for (i = 0; i < n; i++) {
      var want = i * step;
      while (idx < seg.length - 1 && acc + seg[idx] < want) { acc += seg[idx]; idx++; }
      var t = seg[idx] ? (want - acc) / seg[idx] : 0;
      var a = p[idx], b = p[(idx + 1) % p.length];
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
    return out;
  }

  /* b 의 시작점을 돌려 a 와 가장 가깝게 맞춥니다 (네 점마다 표본으로 견줍니다) */
  function alignTo(a, b) {
    var best = 0, bestS = Infinity, n = b.length, k, i;
    for (k = 0; k < n; k++) {
      var s = 0;
      for (i = 0; i < a.length; i += 4) {
        var j = (i + k) % n;
        var dx = a[i][0] - b[j][0], dy = a[i][1] - b[j][1];
        s += dx * dx + dy * dy;
      }
      if (s < bestS) { bestS = s; best = k; }
    }
    return b.slice(best).concat(b.slice(0, best));
  }

  function ringInfo(p) {
    var r = cw(p);
    return { pts: r, c: centroid(r), a: Math.abs(signedArea(r)), per: perimeter(r) };
  }

  /* 짝지어진 두 조각의 점 개수를 맞추고 시작점을 정렬합니다 */
  function matched(x, y) {
    var n = Math.round(Math.max(x.per, y.per) / 6);
    n = Math.max(MIN_PTS, Math.min(MAX_PTS, n));
    var ra = resample(x.pts, n);
    return { a: ra, b: alignTo(ra, resample(y.pts, n)) };
  }

  /* 두 영토 사이의 계획을 세웁니다. 한 번만 계산하고 프레임마다 다시 쓰지 않습니다. */
  function plan(fromD, toD) {
    var A = parseRings(fromD).map(ringInfo);
    var B = parseRings(toD).map(ringInfo);
    A.sort(function (x, y) { return y.a - x.a; });

    var taken = {}, pairs = [], gone = [], born = [];

    /* 한 나라의 본토는 다음 세기에도 본토입니다. 크게 옮겨 가거나 크게 줄어도
       (7세기 발해 → 10세기 발해) 사라졌다 다시 생기지 않도록 가장 큰 조각끼리 먼저 묶습니다. */
    var forced = null;
    if (A.length && B.length) {
      var bigB = 0;
      B.forEach(function (y, j) { if (y.a > B[bigB].a) bigB = j; });
      forced = { a: A[0], b: B[bigB] };
      taken[bigB] = 1;
    }

    A.forEach(function (x, xi) {
      if (forced && xi === 0) { pairs.push(matched(x, forced.b)); return; }
      var best = -1, bestScore = 0;
      B.forEach(function (y, j) {
        if (taken[j]) return;
        var d = Math.hypot(x.c[0] - y.c[0], x.c[1] - y.c[1]);
        if (d > MATCH_MAX_DIST) return;
        var sim = Math.min(x.a, y.a) / Math.max(x.a, y.a || 1);
        var score = sim / (1 + d / 40);
        if (score > bestScore) { bestScore = score; best = j; }
      });
      if (best >= 0 && bestScore >= MATCH_MIN) {
        taken[best] = 1;
        pairs.push(matched(x, B[best]));
      } else {
        gone.push(x);
      }
    });
    B.forEach(function (y, j) { if (!taken[j]) born.push(y); });

    return { pairs: pairs, gone: gone, born: born };
  }

  function dOfRing(p) {
    var d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 1; i < p.length; i++) d += 'L' + p[i][0].toFixed(1) + ' ' + p[i][1].toFixed(1);
    return d + 'Z';
  }
  function scaled(info, k) {
    var c = info.c, out = 'M', p = info.pts, i;
    for (i = 0; i < p.length; i++) {
      out += (i ? 'L' : '') + (c[0] + (p[i][0] - c[0]) * k).toFixed(1) + ' ' +
                              (c[1] + (p[i][1] - c[1]) * k).toFixed(1);
    }
    return out + 'Z';
  }

  /* t = 0 이면 이전 영토, 1 이면 새 영토 */
  function at(plan, t) {
    var d = '', i;
    for (i = 0; i < plan.pairs.length; i++) {
      var pr = plan.pairs[i], a = pr.a, b = pr.b, s = 'M', j;
      for (j = 0; j < a.length; j++) {
        s += (j ? 'L' : '') + (a[j][0] + (b[j][0] - a[j][0]) * t).toFixed(1) + ' ' +
                              (a[j][1] + (b[j][1] - a[j][1]) * t).toFixed(1);
      }
      d += s + 'Z';
    }
    /* 짝이 없는 조각은 제자리에서 오므라들거나 펴집니다 */
    for (i = 0; i < plan.gone.length; i++) {
      var k1 = 1 - t;
      if (k1 > 0.02) d += scaled(plan.gone[i], k1);
    }
    for (i = 0; i < plan.born.length; i++) {
      if (t > 0.02) d += scaled(plan.born[i], t);
    }
    return d;
  }

  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* opts: { from, to, duration, onFrame(d, p), onDone } */
  function run(opts) {
    var p = plan(opts.from, opts.to);
    var dur = opts.duration || 1600;
    if (!dur) { opts.onFrame(opts.to, 1); if (opts.onDone) opts.onDone(); return { cancel: function () {} }; }

    var t0 = 0, id = 0, dead = false;
    function frame(ts) {
      if (dead) return;
      if (!t0) t0 = ts;
      var u = Math.min((ts - t0) / dur, 1);
      opts.onFrame(u >= 1 ? opts.to : at(p, easeInOut(u)), u);
      if (u < 1) id = requestAnimationFrame(frame);
      else if (opts.onDone) opts.onDone();
    }
    id = requestAnimationFrame(frame);
    return { cancel: function () { dead = true; cancelAnimationFrame(id); } };
  }

  window.Morph = { plan: plan, at: at, run: run, parseRings: parseRings, dOfRing: dOfRing, ease: easeInOut };
})();
