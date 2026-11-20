# gta6-cover-art-01-bot

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/TEMPEKHUNTER69/gta6-cover-art-01-bot/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Panels** — a GTA-style cover art maker that turns your own photos into a multi-panel Vice City poster, offline, in your browser.

## What it makes

A three-panel poster cover: one photo spread across three differently-cropped panels, or a different photo in each panel, with a bold sunset/neon caption across the bottom, a retro sun disc, palm silhouettes and white poster gutters. All lettering and decoration are drawn in code — no Rockstar logo, artwork or font.

## How to use it (3 steps)

1. **Add photos** — pick files from your machine (or try a sample). Photos are read locally with FileReader and never uploaded.
2. **Arrange** — pick a layout (Vice Grid, Neon Strip, Poster Split), a colour grade (Vice Sunset, Neon Nights, Midnight Palm, Pastel Drive), type your title + subtitle, then click a panel in the preview and crop it with the zoom / move sliders. Click a thumbnail to put that photo in the selected panel; "Fill all 3 panels" spreads one photo across the cover.
3. **Export PNG** — pick a size and hit Export PNG.

## Export sizes

- 1080 × 1080 (square post)
- 1080 × 1350 (portrait post)
- 1920 × 1080 (wide / story)

The live preview always shows the exact export size, so what you see is what the PNG looks like.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Plain static files under `app/`, no build step, no network request: open `app/index.html` in desktop Chrome and it works offline. Entry plumbing is `main.ts` (Node 22, stdlib only): `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

## License

MIT — see LICENSE.
