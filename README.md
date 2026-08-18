# mirasim-skin-persona5

**English** · [简体中文](README.zh-CN.md)

A **怪盗 / Phantom-thief** skin for the Mirasim desktop app — Persona 5-Royal-
inspired ink-black / calling-card-red / mask-white, with a living **Morgana desk
companion** (Mona) that chats, reports on your sessions, and runs a focus timer.

> Style tribute / fan work. All graphics, dialogue, and the skill codex are
> original; character art is AI-generated in the P5R visual idiom. No official
> logos, no game assets, no copyrighted text.

![preview](preview.png)

**Simulated workspace** (all content fictional):

![workspace](shots/screenshot.png)

**Mona's features:**

![features](shots/features.png)

## Install

```bash
./install.sh          # injects into Mirasim's local frontend, no admin needed
```

Then **⌘R the Mirasim window** (or restart the app).

- The skin patches Mirasim's user-writable self-update copy
  (`~/.mirasim/app/<version>/{web,renderer}/index.html`), **not** the signed
  app bundle — reversible, no code-signature impact.
- An app update ships a new version dir and drops the skin; just re-run
  `./install.sh`.

```bash
./uninstall.sh        # restore the stock UI
```

## What you get

**The skin** — full high-contrast P5 token override: ink surfaces, razor
(un-rounded) corners, hard offset shadows, red action / white accent, torn-shard
corners, mask watermark, a big `PHANTOM` wordmark filling empty panes, skewed
tabs, and a calling-card intro when the skin engages.

**Morgana (Mona)** — a sprite desk pet that:

Everything below is **local by default — no network, no key, no extra process.**

| Feature | How |
|---|---|
| **Local assistant chat** | Click Mona → phone chat. Ask the time / date, keep a todo list (`记一下 …` / `待办` / `删 2`), get a battle report (`战况`), or just chat. Instant, offline, reads your live quota + running sessions for context. |
| **Custom persona** | ⚙ in the chat → persona field. Shape her tone (AIRP-friendly). |
| **Heist alerts** | Speaks when a session **finishes / errors / needs approval**, or quota crosses 85%. |
| **Focus timer** | Right-click → 番茄专注: a 25-min focus barrier with an overhead countdown, ending in SHOWTIME. |
| **Function menu** | Right-click / long-press: chat, focus, fortune, battle report, SHOWTIME, skin toggle, hide. |
| **Draggable** | Drag Mona (and her phone) anywhere; positions persist. |
| **Moods** | Walks, blinks, naps when idle, jumps on click. |

> **Optional free-form LLM chat (off by default):** the settings toggle talks
> only to `http://127.0.0.1:51789` — a local bridge **you** run. This package
> ships no such process and never starts one, and with the toggle off the
> request is never made. Loopback is the only option available: the Mirasim
> desktop window's CSP only lets the page talk to `127.0.0.1`, and Mirasim's own
> model proxy is per-session and dynamic-port, so it can't be reached reliably.
> The bridge itself is intentionally left out to keep this zero-dependency and
> offline.

### Hotkeys

- `Alt+Shift+K` — toggle skin
- `Alt+Shift+S` — SHOWTIME
- `Alt+Shift+U` — hide/show the date tag
- `Alt+Shift+M` — hide/show Mona

## The codex

`codex.html` is a standalone mobile-portrait **Phantom Thieves skill sheet** for
Morgana — 4 skills (each with SP cost / attribute / battle role) plus a SHOWTIME
finale, styled as a theatrical P5R codex. Open it in any browser. Her SP scales
with your remaining quota, in-universe.

## Privacy

Mona is **100% local by default**: chat, todos, persona, and positions all live
in your browser's `localStorage`, never written to any file in this repo. Out of
the box she makes **no network calls** — no external API, no key, no background
process. The one exception is the off-by-default LLM toggle above, which reaches
only `127.0.0.1`, so data never leaves your machine either way. Nothing here
contains any key, token, account, or path.

## Layout

```
skin/persona5.css     tokens + components + Mona styling
skin/persona5.js      single-theme toggle + FX/Mona engine
skin/assets/          Morgana sprites + Joker key art wallpaper
codex.html            the Phantom Thieves skill sheet
install.sh / uninstall.sh
```
