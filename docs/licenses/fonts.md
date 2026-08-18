# Web fonts

Four faces ship from `projects/website/public/fonts/`, all self-hosted (SPEC §10: no
third-party font origin) and all subsetted with `pyftsubset` (fontTools 4.63.0), `--flavor=woff2`,
`--layout-features='*'`, `--no-hinting`.

| File                   | Source                                                 | Licence                | Subset                                      |
| ---------------------- | ------------------------------------------------------ | ---------------------- | ------------------------------------------- |
| `bebas-neue-400.woff2` | `google/fonts` → `ofl/bebasneue/BebasNeue-Regular.ttf` | OFL 1.1                | uppercase, digits, punctuation, `& § © – —` |
| `barlow-400.woff2`     | `google/fonts` → `ofl/barlow/Barlow-Regular.ttf`       | OFL 1.1                | latin                                       |
| `barlow-700.woff2`     | `google/fonts` → `ofl/barlow/Barlow-Bold.ttf`          | OFL 1.1                | latin                                       |
| `tahu-400.woff2`       | design handoff → `_ds/…/assets/fonts/Tahu.ttf`         | see [tahu.md](tahu.md) | latin                                       |

Unicode ranges:

- **latin** — `U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD`
- **Bebas Neue** — `U+0020-005A,U+00A0,U+00A7,U+00A9,U+00C4,U+00D6,U+00DC,U+00DF,U+1E9E,U+2013,U+2014,U+2018-2019,U+201C-201D,U+2026`

Barlow 500, 600 and every italic are deliberately not shipped: no page in the handoff uses them.

## Bebas Neue is uppercase-only here

Every Bebas string in the design is already uppercase in the markup (`ZULETZT AUF GITHUB`,
`UNTERSTÜTZE UNS`, `ALLE REPOSITORIES`). The subset carries no lowercase glyphs, so a
lowercase letter in a `font-display` string renders from the fallback face. Write Bebas copy in
uppercase, or use `uppercase` — do not rely on the font to shape it.

## `→` never comes from a brand font

Neither Bebas Neue nor Barlow contains `U+2192` at any weight — verified against the upstream
TTFs, not just the subsets. Every `→` in the design therefore renders from the fallback stack.
That is also why the arrow stays out of the translatable strings.

## Fallback metrics

Each real face has a `… Fallback` face over `local('Arial')` whose metrics are derived from the
upstream font's `head`/`hhea`/`OS/2` tables against Arial (`unitsPerEm 2048`, `ascender 1854`,
`descender -434`, `lineGap 67`, `xAvgCharWidth 904`):

```
size-adjust       = (font.xAvgCharWidth / font.unitsPerEm) / (904 / 2048)
ascent-override   = (font.ascender     / font.unitsPerEm) / size-adjust
descent-override  = (|font.descender|  / font.unitsPerEm) / size-adjust
line-gap-override = (font.lineGap      / font.unitsPerEm) / size-adjust
```

| Face           | size-adjust | ascent-override | descent-override | line-gap-override |
| -------------- | ----------- | --------------- | ---------------- | ----------------- |
| Bebas Neue 400 | 87.67%      | 102.65%         | 34.22%           | 0%                |
| Barlow 400     | 116.22%     | 86.04%          | 17.21%           | 0%                |
| Barlow 700     | 119.39%     | 83.76%          | 16.75%           | 0%                |
| Tahu 400       | 96.74%      | 95.10%          | 54.27%           | 1.55%             |
