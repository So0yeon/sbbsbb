# © 2026 김용현
#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
#  check.sh — 헤드리스 Chrome 으로 실제 화면을 열어 콘솔 오류를 잡는다
#
#      bash tools/check.sh [경로]        기본 /index.html?selftest=1
#
#  MASTER §14-2 "새 탭에서 열어 콘솔 오류 0건" 을 자동으로 확인한다.
# ══════════════════════════════════════════════════════════════════════
set -u
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
PROFILE="/c/Users/$USERNAME/AppData/Local/Temp/atlas-chrome"
URLPATH="${1:-/index.html?selftest=1}"
URL="http://127.0.0.1:8765${URLPATH}"

mkdir -p tools/.out
"$CHROME" --headless=new --disable-gpu --no-first-run --no-default-browser-check \
  --user-data-dir="$PROFILE" --enable-logging=stderr --v=0 \
  --disk-cache-size=1 --media-cache-size=1 \
  --use-angle=swiftshader --enable-unsafe-swiftshader \
  --window-size=1400,900 --virtual-time-budget=9000 \
  --dump-dom "$URL" > tools/.out/dom.html 2> tools/.out/log.txt

echo "── 콘솔 ─────────────────────────────────────────────"
grep -a "INFO:CONSOLE\|ERROR:CONSOLE" tools/.out/log.txt | sed 's/^\[[^]]*\]//' | head -40
echo
echo "── 자가 검사 ────────────────────────────────────────"
grep -ao 'SELFTEST\] {.*}' tools/.out/log.txt | head -3
echo
N=$(grep -ac "Uncaught\|ERROR:CONSOLE" tools/.out/log.txt || true)
echo "오류로 보이는 줄: ${N}"
