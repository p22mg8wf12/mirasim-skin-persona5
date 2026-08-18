#!/usr/bin/env bash
# mirasim-skin-persona5 — install the 怪盗 / Phantom (P5-style) skin into
# the Mirasim desktop app. Path-agnostic, no personal data.
#
#   ./install.sh
#
# Injects one marker-delimited block of <link>/<script> before </head> of
# Mirasim's served frontend, in its user-writable self-update directory
# (~/.mirasim/app/<version>/{web,renderer}). The app bundle is not touched.
# Reverse with ./uninstall.sh. Alt+Shift+K toggles the skin in-app.

set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKIN="$HERE/skin"
UPD="$HOME/.mirasim/app"

[[ -d "$UPD" ]] || { echo "not found: $UPD — open Mirasim at least once first." >&2; exit 1; }

# active version = state.json "good", else highest semver dir
VER="$(python3 - "$UPD" <<'PY'
import json, os, re, sys
upd = sys.argv[1]
try:
    v = json.load(open(os.path.join(upd, "state.json")))["good"]
    if os.path.isdir(os.path.join(upd, v)): print(v); raise SystemExit
except Exception: pass
ds = [d for d in os.listdir(upd) if re.match(r"^\d+\.\d+\.\d+$", d)]
print(max(ds, key=lambda s: tuple(map(int, s.split(".")))) if ds else "")
PY
)"
[[ -n "$VER" ]] || { echo "no Mirasim version dir under $UPD" >&2; exit 1; }
echo "target version: $VER"

# discover Mirasim's local model reverse-proxy port (so Mona can chat).
# loopback only; nothing sensitive. blank if not found.
PORT="$(python3 - <<'PY'
import subprocess, re
try:
    out = subprocess.run(["lsof","-nP","-iTCP","-sTCP:LISTEN"],capture_output=True,text=True,timeout=8).stdout
    ports = sorted({int(l.rsplit(":",1)[1].split()[0]) for l in out.splitlines() if l.startswith("Mirasim") and ":" in l})
except Exception:
    ports = []
for p in ports:
    try:
        r = subprocess.run(["curl","-sf","--max-time","2","http://127.0.0.1:%d/v1/models"%p,
                            "-H","anthropic-version: 2023-06-01"],capture_output=True,text=True,timeout=5)
        if '"object":"model"' in r.stdout: print(p); break
    except Exception: pass
PY
)"

inject_dir() {
  local d="$1" idx="$d/index.html"
  [[ -f "$idx" ]] || return 0
  cp "$SKIN/persona5.css" "$d/mirasim-skin.css"
  cp "$SKIN/persona5.js"  "$d/mirasim-skin.js"
  cp "$SKIN/assets/keyart.png"     "$d/mirasim-skin-wallpaper.png"
  for f in walk sit jump sleep; do
    cp "$SKIN/assets/mona-$f.png" "$d/mirasim-skin-a-mona-$f.png"
  done
  printf '{"proxyPort": %s}' "${PORT:-null}" > "$d/mirasim-skin-mona.json"

  [[ -f "$idx.persona5.bak" ]] || cp -p "$idx" "$idx.persona5.bak"
  python3 - "$idx" <<'PY'
import io, re, sys
idx = sys.argv[1]
B, E = "<!-- mirasim-skin-persona5 BEGIN -->", "<!-- mirasim-skin-persona5 END -->"
html = io.open(idx, encoding="utf-8").read()
html = re.sub(re.escape(B)+r".*?"+re.escape(E)+r"\n?", "", html, flags=re.S)
block = (B + "\n"
         '<link rel="stylesheet" href="./mirasim-skin.css">\n'
         '<script src="./mirasim-skin.js"></script>\n' + E + "\n")
if "</head>" not in html: sys.exit("no </head> in " + idx)
io.open(idx, "w", encoding="utf-8").write(html.replace("</head>", block + "  </head>", 1))
print("  injected → " + idx)
PY
}

for sub in web renderer; do inject_dir "$UPD/$VER/$sub"; done

cat <<EOF

done. ⌘R the Mirasim window (or restart the app) to see it.
  · Alt+Shift+K  toggle skin        · Alt+Shift+S  SHOWTIME
  · click Mona   phone chat + ⚙     · Alt+Shift+M  hide/show Mona
An app update installs a new version dir and drops this — just re-run ./install.sh.
EOF
