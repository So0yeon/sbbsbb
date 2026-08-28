// © 2026 김용현
/* ══════════════════════════════════════════════════════════════════════
   report.js — 인쇄 (MASTER §7-6)

   PDF 라이브러리를 쓰지 않는다. window.print() + @media print 전용 레이아웃.
   학생·교사는 인쇄 대화상자에서 「대상: PDF로 저장」을 고른다.

   ● 탐험 기록지 (학생용) — 이름이 머리말에 자동으로 들어간다 (요구 1)
   ● 스탬프 수첩
   ● 학습지·문제지·정답지 (교사용, 지도 모드)
   하단에는 언제나 자료 출처를 싣는다 (요구 8).
   ══════════════════════════════════════════════════════════════════════ */
(function (g) {
  'use strict';

  var S = g.AtlasStore;
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  function today() {
    var d = new Date();
    return d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '.';
  }

  /** 머리말 — 이름이 있으면 넣고, 없으면 빈칸으로 인쇄한다 */
  function head(title, sub) {
    var name = S.displayName();
    return '<div class="pr-head">' +
      '<div class="pr-title">' + esc(title) + '</div>' +
      '<div class="pr-meta">' +
        '<span>학년 <span class="pr-blank" style="min-width:40px"></span> 반 <span class="pr-blank" style="min-width:40px"></span></span>' +
        '<span><b>이름</b> ' + (name ? esc(name) : '<span class="pr-blank"></span>') + '</span>' +
        '<span>날짜 ' + today() + '</span>' +
        (sub ? '<span>' + esc(sub) + '</span>' : '') +
      '</div></div>';
  }

  function foot(extra) {
    var lines = [
      '史뿐史뿐 — 초등 5학년 2학기 사회(역사) 학습 도구 · 역지사지팀',
      '지도 Natural Earth 1:50m(퍼블릭 도메인) · 사진 위키미디어 공용(CC BY / CC BY-SA / CC0 / 공공누리 1유형) · 글꼴 Pretendard(SIL OFL 1.1) · 3D 엔진 three.js(MIT)',
      '저폴리 3D 표현은 사실의 재현이 아니라 상징적인 그림입니다. 유물의 실제 모습은 사진과 박물관 자료로 확인해 주세요.',
      '이 프로그램은 서버가 없으며 입력한 내용은 기기 밖으로 전송되지 않습니다. 개인정보 처리방침은 privacy.html 에 있습니다.'
    ];
    if (extra) lines.push(extra);
    return '<div class="pr-foot">' + lines.map(esc).join('<br>') + '</div>';
  }

  function paint(html) {
    var area = document.getElementById('printArea');
    if (!area) return;
    area.innerHTML = html;
    setTimeout(function () { g.print(); }, 60);
  }

  /* ══════════════════════════════════════════════════════════
     ① 탐험 기록지 (학생용)
     ══════════════════════════════════════════════════════════ */
  function printRecord() {
    var r = S.currentRank();
    var t = S.typeOf();
    var answers = S.answers();
    var mins = Math.floor(S.totalSeconds() / 60);

    var worldName = {};
    if (g.AtlasExplore) worldName = g.AtlasExplore.worldNames();

    var byWorld = {};
    answers.forEach(function (a) {
      (byWorld[a.world] = byWorld[a.world] || []).push(a);
    });

    var essays = answers.filter(function (a) { return a.kind === 'essay' || (a.answer && String(a.answer).length > 24); });

    var html =
      head('탐험 기록지', '탐험 등급 ' + r.name) +

      '<div class="pr-sec"><h3>탐험 요약</h3>' +
        '<table class="pr-table">' +
          '<tr><th>탐험 등급</th><td>' + esc(r.icon + ' ' + r.name) + '</td>' +
              '<th>탐험가 유형</th><td>' + esc(t.name) + '</td></tr>' +
          '<tr><th>발견한 임무</th><td>' + S.doneTotal() + '개</td>' +
              '<th>모은 유물</th><td>' + S.relicCount() + '개</td></tr>' +
          '<tr><th>받은 도장</th><td>' + S.stampCount() + '개</td>' +
              '<th>탐험한 시간</th><td>약 ' + mins + '분</td></tr>' +
        '</table>' +
        '<p style="font-size:9.5pt;margin-top:6px">' + esc(t.desc) + '</p>' +
      '</div>' +

      '<div class="pr-sec"><h3>시대별 발견 현황</h3>' +
        '<table class="pr-table"><tr><th>시대</th><th>발견</th><th>답한 문항</th></tr>' +
        Object.keys(byWorld).map(function (w) {
          return '<tr><td>' + esc(worldName[w] || w) + '</td>' +
                 '<td>' + S.doneInWorld(w) + '</td>' +
                 '<td>' + byWorld[w].length + '</td></tr>';
        }).join('') +
        '</table></div>' +

      '<div class="pr-sec"><h3>문항별 기록</h3>' +
        '<table class="pr-table">' +
          '<tr><th style="width:24%">임무</th><th style="width:34%">문제</th><th style="width:26%">내 답</th><th style="width:8%">정오</th><th style="width:8%">시도</th></tr>' +
          (answers.length ? answers.map(function (a) {
            var mark = a.correct === true ? '○' : (a.correct === false ? '✕' : '—');
            return '<tr><td>' + esc(a.title || '') + '</td>' +
                   '<td>' + esc(a.question || '') + '</td>' +
                   '<td>' + esc(a.answer || '') + '</td>' +
                   '<td style="text-align:center">' + mark + '</td>' +
                   '<td style="text-align:center">' + (a.tries || 1) + '</td></tr>';
          }).join('') : '<tr><td colspan="5">아직 답한 문항이 없습니다.</td></tr>') +
        '</table>' +
        '<p style="font-size:9pt;margin-top:5px">정오의 “—” 는 정답이 없는 열린 선택입니다.</p>' +
      '</div>' +

      (essays.length ?
      '<div class="pr-sec"><h3>서술형 답 전문 (교사 평가란)</h3>' +
        essays.map(function (a) {
          return '<table class="pr-table" style="margin-bottom:8px">' +
            '<tr><th style="width:16%">문제</th><td colspan="3">' + esc(a.question || '') + '</td></tr>' +
            '<tr><th>학생의 답</th><td colspan="3">' + esc(a.answer || '') + '</td></tr>' +
            '<tr><th>교사 평가</th><td colspan="3"><div class="pr-answer-box"></div></td></tr>' +
            '</table>';
        }).join('') +
      '</div>' : '') +

      foot();

    paint(html);
  }

  /* ══════════════════════════════════════════════════════════
     ② 스탬프 수첩
     ══════════════════════════════════════════════════════════ */
  function printStampBook() {
    var worlds = g.AtlasExplore ? g.AtlasExplore.worldList() : [];
    var html = head('스탬프 수첩', '받은 도장 ' + S.stampCount() + '개');

    worlds.forEach(function (w) {
      var cells = [];
      Object.keys(w.areas || {}).forEach(function (a) {
        var nm = (w.areas[a].name || a);
        cells.push('<div class="pr-stamp ' + (S.stampHas('visit:' + w.id + ':' + a) ? 'on' : '') + '">' + esc(nm) + '<br>왔다 감</div>');
        cells.push('<div class="pr-stamp ' + (S.stampHas('clear:' + w.id + ':' + a) ? 'on' : '') + '">' + esc(nm) + '<br>다 봄</div>');
      });
      cells.push('<div class="pr-stamp ' + (S.stampHas('era:' + w.id) ? 'on' : '') + '">' + esc(w.name) + '<br>마침</div>');
      html += '<div class="pr-sec"><h3>' + esc(w.name) + '</h3><div class="pr-stamps">' + cells.join('') + '</div></div>';
    });

    html += foot();
    paint(html);
  }

  /* ══════════════════════════════════════════════════════════
     ③ 학습지 · 문제지 · 정답지 (교사용)
     ══════════════════════════════════════════════════════════ */
  function printWorksheet(era, items) {
    items = items || [];
    var html = head(era.name + ' 조사 학습지', era.years || '');

    html += '<div class="pr-sec"><h3>1. 무엇을 찾아볼까요</h3>' +
      '<table class="pr-table"><tr><th style="width:22%">이름</th><th style="width:38%">어떤 것인가요</th><th>내가 알아낸 것</th></tr>' +
      items.map(function (c) {
        return '<tr><td>' + esc(c.t) + '</td><td>' + esc(c.d || '') + '</td><td style="height:26px"></td></tr>';
      }).join('') + '</table></div>';

    html += '<div class="pr-sec"><h3>2. 지도에서 찾아 표시해 보세요</h3>' +
      '<p style="font-size:10pt">아래 이름을 지도에서 찾아 번호를 적어 보세요.</p>' +
      '<p style="font-size:10pt;line-height:2.2">' +
      items.map(function (c, i) { return (i + 1) + ') ' + esc(c.t) + ' <span class="pr-blank" style="min-width:60px"></span>'; }).join(' &nbsp; ') +
      '</p></div>';

    html += '<div class="pr-page-break"></div>';

    html += head(era.name + ' 오려 쓰는 카드', '잘라서 분류·배열 활동에 씁니다');
    html += '<div class="pr-sec"><table class="pr-table">' +
      items.map(function (c, i) {
        if (i % 2) return '';
        var a = items[i], b = items[i + 1];
        var cell = function (x) {
          return x ? '<td style="height:70px"><b>' + esc(x.t) + '</b><br><span style="font-size:9pt">' + esc(x.d || '') + '</span></td>' : '<td></td>';
        };
        return '<tr>' + cell(a) + cell(b) + '</tr>';
      }).join('') + '</table></div>';

    html += '<div class="pr-page-break"></div>';

    html += head(era.name + ' 정답지', '교사용 · 배부 전 확인하세요');
    html += '<div class="pr-sec"><h3>항목별 핵심</h3><table class="pr-table">' +
      '<tr><th style="width:22%">이름</th><th>본문 요약</th></tr>' +
      items.map(function (c) {
        return '<tr><td>' + esc(c.t) + '</td><td>' + esc((c.b || []).join(' ')) + '</td></tr>';
      }).join('') + '</table></div>';

    html += foot('교사용 정답지 — 학생에게 배부하지 마세요.');
    paint(html);
  }

  g.AtlasReport = {
    printRecord: printRecord,
    printStampBook: printStampBook,
    printWorksheet: printWorksheet
  };

})(typeof window !== 'undefined' ? window : globalThis);
