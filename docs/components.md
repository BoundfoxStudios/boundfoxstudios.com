# Component Inventory

## Images and brand marks

### Masters — `projects/website/branding/`

Tracked, and outside `public/` on purpose: `angular.json` copies
`{ "glob": "**/*", "input": "projects/website/public" }` and nothing else, so no master ever
reaches `dist/`. The folder holds exactly four files.

| File             | Intrinsic      | Consumed by                               |
| ---------------- | -------------- | ----------------------------------------- |
| `fox-head.png`   | 600 × 600      | `npm run images:generate`                 |
| `icon.png`       | 600 × 600      | the M8 favicon, app-icon and OG generator |
| `og-logo.png`    | 1042 × 751     | the M8 `og/default.png` composition       |
| `bug-a-ball.svg` | 1025 × 1026.82 | the Bug-A-Ball crop script                |

`icon.png` is a byte-identical copy of `fox-head.png`; the two names exist so the icon generator
and the mark generator each own their input.

**There is no vector fox-head mark.** `branding/icon.svg` does not exist and is not created;
`icon.png` is the icon source, and the M8 output ships no `<link rel="icon" type="image/svg+xml">`.

### Generated mark files — `npm run images:generate`

`tools/generate-images.mjs` (sharp) writes WebP only — no PNG fallback, no `<picture>`, no
`ngSrcset`, no image loader. The outputs are committed so `ng build` never depends on sharp.

| File               | Box            | Used by                        |
| ------------------ | -------------- | ------------------------------ |
| `fox-head-32.webp` | —              | M8 icon set                    |
| `fox-head-40.webp` | —              | M8 icon set                    |
| `fox-head-64.webp` | 32 × 32 header | `bfs-brand-lockup markSize=32` |
| `fox-head-80.webp` | 40 × 40 footer | `bfs-brand-lockup markSize=40` |

### Mark usage contract

- `NgOptimizedImage` with `ngSrc`, never a plain `src`.
- `ngSrc` is relative (`images/…`). An absolute path makes `/en/` load the German copy.
- `width` and `height` are always explicit; the file is the 2× size of the box.
- `priority` on the header mark only — it adds `fetchpriority="high"`, `loading="eager"`,
  `decoding="sync"` and a `<link rel="preload" as="image">` in the prerendered `<head>`. The
  footer mark stays lazy.
- `alt=""` on both marks, and no `aria-label` on the logo link. Deviation from
  `docs/design/site-header.md` §2.3 (`alt="Boundfox Studios"`): the wordmark next to the mark is
  real text, so a non-empty alt announces the name twice.

### Wordmark and icon SVGs

Copied verbatim into `public/images/` and referenced relatively as `<img src>`. Never inlined:
`bug-a-ball.svg` carries 58 global `cls-*` class names that collide with any other inlined SVG,
and keeping all three consistent keeps that rule simple. Attributes carry the intrinsic ratio,
CSS does the sizing.

| File                     | Page               | Attributes                 | Classes                        |
| ------------------------ | ------------------ | -------------------------- | ------------------------------ |
| `flugwacht-wordmark.svg` | `/`                | `width="231" height="42"`  | `h-auto w-[56%] max-w-[300px]` |
| `flugwacht-wordmark.svg` | `/apps-and-games/` | `width="231" height="42"`  | `h-auto w-[62%] max-w-[280px]` |
| `mat-dark.svg`           | `/`                | `width="112" height="112"` | —                              |
| `mat-dark.svg`           | `/apps-and-games/` | `width="104" height="104"` | —                              |

### Bug-A-Ball key art

`npm run images:crops` (`tools/generate-bug-a-ball-crops.mjs`, sharp) rasterises
`branding/bug-a-ball.svg` at `density: 144` (2050 × 2054), extracts
`{ left: 0, top: 342, width: 2050, height: 1024 }` and resizes that one rectangle to both slots.
The master is square and both slots are 2:1, so one rectangle serves both. Outputs are committed,
so `ng build` never depends on sharp.

| File                                 | Slot                                        | Loading                             |
| ------------------------------------ | ------------------------------------------- | ----------------------------------- |
| `bug-a-ball-feature-1200x600.{webp,jpg}` | `/apps-and-games/` feature column — the LCP element | `loading="eager" fetchpriority="high"` |
| `bug-a-ball-card-840x420.{webp,jpg}`     | `/` project card 4 media area, below the fold       | `loading="lazy"`                       |

Both render through `<picture>` with the WebP `<source>` and the JPEG `<img>` fallback, both use
**relative** paths, and both carry `i18n-alt="@@common.bug-a-ball.key-art-alt"` with the German
string from `docs/decisions.md` › Copy. English target for M7:
*"Bug-A-Ball: a grinning green blob rolls along a blue track past red and white obstacles."*

```html
<div class="relative min-h-[240px] overflow-hidden bg-neutral-100">
  <picture>
    <source type="image/webp" srcset="images/bug-a-ball-feature-1200x600.webp" />
    <img
      class="absolute inset-0 h-full w-full object-cover"
      src="images/bug-a-ball-feature-1200x600.jpg"
      width="1200" height="600" loading="eager" fetchpriority="high"
      i18n-alt="@@common.bug-a-ball.key-art-alt"
      alt="Bug-A-Ball: eine grinsende grüne Kugel rollt über eine blaue Bahn an rot-weißen Hindernissen vorbei."
    />
  </picture>
</div>
```

```html
<div class="h-[200px] overflow-hidden bg-neutral-100">
  <picture class="block h-full w-full">
    <source type="image/webp" srcset="images/bug-a-ball-card-840x420.webp" />
    <img
      class="h-full w-full object-cover"
      src="images/bug-a-ball-card-840x420.jpg"
      width="840" height="420" loading="lazy"
      i18n-alt="@@common.bug-a-ball.key-art-alt"
      alt="Bug-A-Ball: eine grinsende grüne Kugel rollt über eine blaue Bahn an rot-weißen Hindernissen vorbei."
    />
  </picture>
</div>
```

Three things that are load-bearing:

- **`<picture>` needs `block h-full w-full` in the home slot.** Preflight sets `img { display: block }`;
  a block image inside an inline `<picture>` gets wrapped in an anonymous block box of `height: auto`,
  so `h-full` on the `<img>` resolves against an auto height, computes to `auto`, and `object-cover`
  never engages. The feature slot does not need it because the `<img>` is absolutely positioned against
  the `relative` wrapper.
- `width`/`height` are the **intrinsic** crop dimensions, not the rendered box. That is what keeps CLS
  at 0 while `object-cover` does the fitting.
- **Never inline the SVG** and never `NgOptimizedImage` here — `NgOptimizedImage` is reserved for the
  fox head. `@angular-eslint/template/prefer-ngsrc` warns on these two `<img>` elements by design;
  `npm run lint` has no `--max-warnings`, so it does not fail. Do not "fix" it.
- Never use `profile/bug-a-ball.png` from `BoundfoxStudios/.github`: it has App Store and Google Play
  badges baked in, which read wrong inside a card and carry their own trademark usage rules.

## Components

Selector prefix `bfs` (SPEC §2). Signal inputs only, OnPush everywhere, no component `.css`.

| Component   | Selector          | Inputs                                                                                                                                                                 | Variants                     | Consumers                                                                                                                                          |
| ----------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BrandIcon` | `bfs-brand-icon`  | `name = input.required<BrandIconName>()` where `BrandIconName = 'github' \| 'discord' \| 'youtube' \| 'kofi' \| 'patreon'`; `size = input(24)` (px, onto the SVG `width`/`height`) | none — `name` selects the glyph | Site footer 20 `text-white hover:text-yellow` · Support financial chip 22 `text-yellow` · Support free chip 24 `text-neutral-900` · Socials tile 32 `text-yellow` |

- The component emits no Tailwind class and no host styling. Colour comes from an inherited
  `text-*` utility on the consumer through `fill="currentColor"`; `docs/design/socials.md` §7.3's
  `class="size-8 fill-yellow"` on the host is superseded.
- `aria-hidden="true"` and `focusable="false"` live on the rendered `<svg>`. Consumers must not
  repeat `aria-hidden` on the host; the accessible name comes from the surrounding link.
- The shape data is copied verbatim from the handoff and carries no `fill-rule` — the Discord eyes
  and the YouTube triangle knock out correctly under the default `nonzero` rule.
- `BrandIconName` is exported from `ui/brand-icon/brand-icon.ts`; `data/social-links.ts` imports it
  from there.

## Conventions

- Every `border` utility spells out its colour — Preflight emits `border: 0 solid` with no default.
- One-off measurements are arbitrary utilities at the usage site (`text-[28px]`, `max-w-[760px]`),
  never new `@theme` tokens.

## Performance

The LCP element per page, so the SPEC §8 gates (Performance ≥ 95, CLS < 0.05) are writable.

| Route                     | LCP element                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `/`                       | the `<h1>` text (`Apps & Spiele`)                              |
| `/apps-and-games/`        | the Bug-A-Ball feature image (`bug-a-ball-feature-1200x600.*`) |
| `/support/`               | the `<h1>` text (`Unterstütze uns`)                            |
| `/socials/`               | the `<h1>` text (`Vernetze dich mit uns`)                      |
| `/legal-details-imprint/` | the `<h1>` text (`Impressum`)                                  |
| `/privacy-policy/`        | the `<h1>` text (`Datenschutzerklärung`)                       |

The 32 px header mark is never the LCP element on any page. Only the Apps & Games feature image
gets `loading="eager" fetchpriority="high"`; the home card crop is below the fold and stays
`loading="lazy"`.
