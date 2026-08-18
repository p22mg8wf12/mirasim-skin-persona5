#!/usr/bin/env bash
# Remove the mirasim-skin-persona5 skin. Restores the pristine index.html
# backups if present, otherwise strips the injected marker block.
set -euo pipefail
UPD="$HOME/.mirasim/app"
[[ -d "$UPD" ]] || { echo "not found: $UPD" >&2; exit 1; }

clean_dir() {
  local d="$1" idx="$d/index.html"
  [[ -f "$idx" ]] || return 0
  if [[ -f "$idx.persona5.bak" ]]; then
    cp -p "$idx.persona5.bak" "$idx"; rm -f "$idx.persona5.bak"
    echo "  restored → $idx"
  else
    python3 - "$idx" <<'PY'
import io, re, sys
idx = sys.argv[1]
B, E = "<!-- mirasim-skin-persona5 BEGIN -->", "<!-- mirasim-skin-persona5 END -->"
h = io.open(idx, encoding="utf-8").read()
n = re.sub(re.escape(B)+r".*?"+re.escape(E)+r"\n?", "", h, flags=re.S)
if n != h: io.open(idx, "w", encoding="utf-8").write(n); print("  stripped → " + idx)
PY
  fi
  rm -f "$d"/mirasim-skin.css "$d"/mirasim-skin.js "$d"/mirasim-skin-mona.json \
        "$d"/mirasim-skin-wallpaper.png "$d"/mirasim-skin-a-mona-*.png 2>/dev/null || true
}

for VER in "$UPD"/*/; do
  for sub in web renderer; do clean_dir "$VER$sub"; done
done
echo "done. ⌘R Mirasim to see the stock UI."
