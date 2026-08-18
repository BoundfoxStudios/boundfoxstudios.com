# Web fonts

Four faces ship from `projects/website/public/fonts/`, all self-hosted (SPEC §10: no
third-party font origin). `npm run fonts:generate` (`tools/generate-fonts.mjs`) regenerates all
four plus both `OFL.txt` files; it downloads the two Google sources, reads the tracked Tahu
master, and subsets with `subset-font` (harfbuzz WASM, woff2 out — no Python toolchain).

| File                   | Source                                                | Licence                              |
| ---------------------- | ----------------------------------------------------- | ------------------------------------ |
| `bebas-neue-400.woff2` | `google/fonts` → `ofl/bebasneue/BebasNeue-Regular.ttf` | OFL 1.1, `bebas-neue-OFL.txt`        |
| `barlow-400.woff2`     | `google/fonts` → `ofl/barlow/Barlow-Regular.ttf`       | OFL 1.1, `barlow-OFL.txt`            |
| `barlow-700.woff2`     | `google/fonts` → `ofl/barlow/Barlow-Bold.ttf`          | OFL 1.1, `barlow-OFL.txt`            |
| `tahu-400.woff2`       | `projects/website/branding/fonts/Tahu.ttf` (tracked)  | see [tahu.md](tahu.md), SPEC §12 D5  |

Subsets:

- **Barlow 400/700** — Google's own `latin` unicode-range.
- **Bebas Neue** — the text `ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ0123456789 &§©·–—→/.,:!?'()-+%`.
- **Tahu** — the text `Danke!Thanks`; it renders one word on `/support/`.

Barlow 500, 600 and every italic are deliberately not shipped: no page in the handoff uses them.

## Bebas Neue is uppercase-only here

All display copy is authored in natural German case and uppercased by the `uppercase` utility,
so the rendered glyphs are always uppercase. The subset carries no lowercase forms — a string
that reaches Bebas without `uppercase` renders from the fallback face.

## `→` never comes from a brand font

Neither Bebas Neue nor Barlow contains `U+2192` at any weight — verified against the upstream
TTFs, not just the subsets. It stays in the Bebas subset request so the export does not have to
change if that ever stops being true. Every `→` renders from the fallback stack today, which is
also why components render the arrow themselves and it never sits inside a translatable string.

## Fallback metrics

Each of the three text faces has a `… Fallback` face over `local('Arial')`, computed from
`@capsizecss/metrics` against Arial and referenced from the `@theme` stacks. Tahu gets none.

| Face           | size-adjust | ascent-override | descent-override | line-gap-override |
| -------------- | ----------- | --------------- | ---------------- | ----------------- |
| Bebas Neue 400 | 76.72%      | 117.32%         | 39.11%           | 0%                |
| Barlow 400     | 96.68%      | 103.43%         | 20.69%           | 0%                |
| Barlow 700     | 99.60%      | 100.41%         | 20.08%           | 0%                |
