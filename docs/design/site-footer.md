# SiteFooter — Implementation Reference

Source of truth: `design_handoff_website_redesign/SiteFooter.dc.html` (57 lines, inline styles).
Design tokens: `design_handoff_website_redesign/_ds/boundfox-studios-design-system-0747e2df-62fc-4fe1-bbd4-f0e974f1e1a3/tokens/*.css`.
Target stack: Angular 22 (SSR, zoneless) + Tailwind v4.

The prototype declares `$preview` = **1280 × 340** — that is only the canvas hint, not a fixed height.
The footer has **no props**; it is imported identically on all six pages via
`<dc-import name="SiteFooter" hint-size="100%,340px">` (Startseite, Spiele und Apps,
Unterstuetzen, Socials, Impressum, Datenschutz).

Attributes that are prototype-runtime only and must **not** be ported: `data-screen-label`,
`style-hover`, `hint-size`, `<helmet>`, `<x-dc>`, `support.js`, `image-slot.js`.
`style-hover="…"` is the prototype's hover mechanism → becomes a Tailwind `hover:` utility.

---

## 1. DOM skeleton

```
footer                                   bg #171717, color #fff, font Barlow
├── div  (top grid)                      max-w 1152 · p 48/24/0 · grid auto-fit minmax · gap 32
│   ├── div  col 1  Brand + tagline      flex-col gap 12
│   ├── div  col 2  SEITEN               flex-col gap 10
│   ├── div  col 3  RECHTLICHES          flex-col gap 10
│   └── div  col 4  FOLGE UNS            flex-col gap 10
└── div  (bottom bar)                    max-w 1152 · mt 24 · p 16/24 · border-top 1px · flex space-between wrap
    ├── span  copyright
    └── span  language list
```

There is **no `<nav>`, no `<ul>/<li>`, no headings** in the prototype — the column titles are
bare `<span>`s and the links are bare `<a>`s inside a flex column. See §9 for the semantic
upgrades to apply in Angular.

---

## 2. Root element — `<footer>`

| Property      | Design value                               | Token                     | Tailwind v4      |
| ------------- | ------------------------------------------ | ------------------------- | ---------------- |
| `background`  | `#171717`                                  | `--bfs-ink` (neutral-900) | `bg-neutral-900` |
| `color`       | `#ffffff` (literal hex, not `--bfs-white`) | —                         | `text-white`     |
| `font-family` | `'Barlow', sans-serif`                     | `--font-body`             | `font-sans`      |

The footer band is **full-bleed**; only its two inner containers are width-capped at 1152px.
No top border, no explicit footer padding, no explicit `line-height` on the root (children
inherit browser-default `normal` unless they set their own — see §3.1 and §9).

---

## 3. Section A — Top grid (link columns)

Container `<div>`:

| Property                | Design value                                     | Token                         | Tailwind v4                                                |
| ----------------------- | ------------------------------------------------ | ----------------------------- | ---------------------------------------------------------- |
| `max-width`             | `1152px`                                         | `--container-max`             | `max-w-6xl`                                                |
| `margin`                | `0 auto`                                         | —                             | `mx-auto`                                                  |
| `padding`               | `48px 24px 0`                                    | `--space-7` / `--space-5` / 0 | `px-6 pt-12 pb-0`                                          |
| `display`               | `grid`                                           | —                             | `grid`                                                     |
| `grid-template-columns` | `repeat(auto-fit, minmax(min(220px,100%), 1fr))` | —                             | `grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]` |
| `gap`                   | `32px` (both axes)                               | `--space-6`                   | `gap-8`                                                    |

### 3.1 Responsive behaviour (derived, no media queries in the design)

Available content width `A = min(viewport, 1152px) − 48px` (the 2 × 24px padding).
`auto-fit` packs the largest `N` where `N·220 + (N−1)·32 ≤ A`:

| Columns | Required `A` | Viewport range | Column width                             |
| ------- | ------------ | -------------- | ---------------------------------------- |
| 4       | ≥ 976px      | ≥ 1024px       | `(A − 96) / 4` → 252px at the 1152px cap |
| 3       | 724 – 975px  | 772 – 1023px   | `(A − 64) / 3`                           |
| 2       | 472 – 723px  | 520 – 771px    | `(A − 32) / 2`                           |
| 1       | < 472px      | < 520px        | `A`                                      |

The `min(220px, 100%)` inside `minmax` is the overflow guard: below a 268px viewport the track
collapses to `100%` instead of forcing a 220px minimum and blowing out the page. **Keep it
verbatim** — a plain `minmax(220px,1fr)` is not equivalent.

At the four-column desktop state the columns are equal `1fr` tracks (252px each at the cap), so
the brand column's tagline `max-width: 320px` never binds there; it binds from 2-column layout
upward on wide-ish viewports and in the 1-column state.

---

### 3.2 Column 1 — Brand + tagline

Wrapper: `display:flex; flex-direction:column; gap:12px` → `flex flex-col gap-3` (`--space-3`).

**Logo row** — `display:flex; align-items:center; gap:10px` → `flex items-center gap-2.5`
(10px is on the Tailwind 0.25rem scale: `2.5 × 4px`).

| Node         | Value                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| `<img>` src  | `assets/fox-head.png` (intrinsic 600 × 600, transparent PNG)               |
| `<img>` alt  | `""` (empty in the footer — the header uses `alt="Boundfox Studios"`)      |
| `<img>` size | `width:40px; height:40px; object-fit:contain` → `h-10 w-10 object-contain` |

**Wordmark** `<span>` (wraps two coloured `<span>`s, separated by a literal space character):

| Property           | Design value               | Token                                                        | Tailwind v4      |
| ------------------ | -------------------------- | ------------------------------------------------------------ | ---------------- |
| `font-family`      | `'Bebas Neue', sans-serif` | `--font-display`                                             | `font-display`   |
| `font-size`        | `24px`                     | `--display-sm`                                               | `text-2xl`       |
| `letter-spacing`   | `0.05em`                   | (between `--tracking-display` .025 and `--tracking-caps` .1) | `tracking-wider` |
| `line-height`      | `1`                        | `--leading-tight`                                            | `leading-none`   |
| inner span 1 color | `#ffa726`                  | `--bfs-orange`                                               | `text-orange`    |
| inner span 2 color | `#ffeb3b`                  | `--bfs-yellow`                                               | `text-yellow`    |

Footer wordmark differs from the header only by the fox-head size (40px vs 32px), by `alt`
(empty vs `"Boundfox Studios"`), by the missing `white-space:nowrap`, and by not being wrapped
in a link. Everything else is byte-identical → extract one component (§8).

**Tagline `<p>`**

| Property      | Design value | Token                          | Tailwind v4        |
| ------------- | ------------ | ------------------------------ | ------------------ |
| `margin`      | `0`          | —                              | `m-0`              |
| `font-size`   | `14px`       | `--text-sm`                    | `text-sm`          |
| `line-height` | `1.625`      | `--leading-body`               | `leading-relaxed`  |
| `color`       | `#d4d4d4`    | `--bfs-gray-300` (neutral-300) | `text-neutral-300` |
| `max-width`   | `320px`      | —                              | `max-w-80`         |

---

### 3.3 Columns 2–4 — shared shell

All three wrappers are identical: `display:flex; flex-direction:column; gap:10px`
→ `flex flex-col gap-2.5`.

**Column title `<span>`** (same in all three):

| Property         | Design value               | Token            | Tailwind v4                               |
| ---------------- | -------------------------- | ---------------- | ----------------------------------------- |
| `font-family`    | `'Bebas Neue', sans-serif` | `--font-display` | `font-display`                            |
| `font-size`      | `16px`                     | `--text-base`    | `text-base`                               |
| `letter-spacing` | `0.05em`                   | —                | `tracking-wider`                          |
| `color`          | `#ffeb3b`                  | `--bfs-yellow`   | `text-yellow`                             |
| `line-height`    | _not set_ → `normal`       | —                | (leave unset, or `leading-none` — see §9) |

**Link `<a>`** (columns 2 and 3):

| Property          | Design value                                           | Token                           | Tailwind v4                                  |
| ----------------- | ------------------------------------------------------ | ------------------------------- | -------------------------------------------- |
| `color`           | `#ffffff`                                              | —                               | `text-white`                                 |
| `font-size`       | `14px`                                                 | `--text-sm`                     | `text-sm`                                    |
| `text-decoration` | `none`                                                 | —                               | `no-underline`                               |
| hover `color`     | `#ffeb3b`                                              | `--bfs-yellow`                  | `hover:text-yellow`                          |
| transition        | (README §Interactions) `150ms cubic-bezier(.4,0,.2,1)` | `--dur-fast`, `--ease-standard` | `transition-colors duration-150 ease-in-out` |

> The inline styles carry **no** `transition` — the prototype hover is instant. The handoff
> README mandates 150ms colour transitions site-wide, so add `transition-colors duration-150
ease-in-out`. Do **not** add scale/translate; the only translate in the whole design is the
> gradient pills on the Startseite.

> `_ds/tokens/effects.css` ships a global `a{color:var(--link)} a:hover{color:var(--accent-strong)}`
> (`#a16207` → `#ffa726`). Every footer link **overrides both**: white → `#ffeb3b`.
> Do not port that global rule as a footer default.

---

### 3.4 Column 4 — social icon row

Icon row `<div>`: `display:flex; gap:12px` → `flex gap-3` (`--space-3`).
Sits directly under the "FOLGE UNS" title, separated by the wrapper's 10px gap.

Each icon link `<a>`: `color:#ffffff` → `text-white`, hover `color:#ffeb3b` →
`hover:text-yellow`, plus the same 150ms colour transition. Carries a `title` attribute.
No padding, no border, no background — the hit area is the bare 20 × 20 glyph (see §9).

Each `<svg>`: `width="20" height="20" viewBox="0 0 24 24" fill="currentColor"` →
`h-5 w-5 fill-current`. Exactly **one `<path>` per icon**, no `fill-rule`, no `stroke`.

| Icon    | `title`   | `href`                               | Path facts                                                                      |
| ------- | --------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| GitHub  | `GitHub`  | `https://github.com/BoundfoxStudios` | 1 path, 495-char `d`, single subpath (Octocat silhouette)                       |
| Discord | `Discord` | `https://discord.gg/tHqNzMT`         | 1 path, 905-char `d`, 3 subpaths (mask + two eyes; eyes knocked out by winding) |
| YouTube | `YouTube` | `https://youtube.com/c/boundfox`     | 1 path, 305-char `d`, 2 subpaths (badge + play triangle)                        |

Verified by rendering all three at 200px with the default `nonzero` fill rule: **the Discord
eyes and the YouTube play triangle knock out correctly. Do not add `fill-rule="evenodd"`** — it
is not in the design and is not needed.

Copy the `d` strings verbatim from `SiteFooter.dc.html` lines 43 / 44 / 45. These are the same
brand glyphs used on Socials.dc.html (32px) and Unterstuetzen.dc.html (icon chips) → put them in
one shared icon registry keyed `github` | `discord` | `youtube` (§8).

---

## 4. Section B — Bottom bar

Container `<div>`:

| Property          | Design value        | Token                          | Tailwind v4                   |
| ----------------- | ------------------- | ------------------------------ | ----------------------------- |
| `max-width`       | `1152px`            | `--container-max`              | `max-w-6xl`                   |
| `margin`          | `24px auto 0`       | `--space-5`                    | `mx-auto mt-6`                |
| `padding`         | `16px 24px`         | `--space-4` / `--space-5`      | `px-6 py-4`                   |
| `border-top`      | `1px solid #525252` | `--bfs-gray-600` (neutral-600) | `border-t border-neutral-600` |
| `display`         | `flex`              | —                              | `flex`                        |
| `justify-content` | `space-between`     | —                              | `justify-between`             |
| `gap`             | `16px`              | `--space-4`                    | `gap-4`                       |
| `flex-wrap`       | `wrap`              | —                              | `flex-wrap`                   |

**Important:** the 1px rule is _inside_ the 1152px container, so it spans at most 1152px and is
inset by the 24px side padding of neither container — it runs the full 1152px box width. It is
**not** full-bleed across the dark band.

The footer's bottom edge is the bottom bar's own `padding-bottom: 16px`. There is no additional
footer padding — do not add one.

Both `<span>`s: `font-size:12px` (`--text-xs` → `text-xs`), `color:#a3a3a3`
(`--bfs-gray-400`, neutral-400 → `text-neutral-400`). No font-family override → Barlow.

When the bar wraps (roughly < 460px of content width), `justify-between` puts the copyright on
line 1 and the language list left-aligned on line 2, separated by the 16px row gap.

---

## 5. Copy strings (verbatim German) + proposed i18n keys

Namespace `footer.*`. Character notes: `—` is U+2014 EM DASH (spaced), `©` is U+00A9,
`·` is U+00B7 MIDDLE DOT (spaced), `ü` is U+00FC. `&amp;` in the source is a plain `&`.

| #   | i18n key                          | German copy (verbatim)                                                            | Where                                          |
| --- | --------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | `footer.brand.wordmark-primary`   | `BOUNDFOX`                                                                        | col 1 wordmark (orange) — **locale-invariant** |
| 2   | `footer.brand.wordmark-secondary` | `STUDIOS`                                                                         | col 1 wordmark (yellow) — **locale-invariant** |
| 3   | `footer.tagline`                  | `Spiele und Apps — mit Liebe in Stuttgart entwickelt. Kostenlos und Open Source.` | col 1 `<p>`                                    |
| 4   | `footer.pages.title`              | `SEITEN`                                                                          | col 2 title                                    |
| 5   | `footer.pages.home`               | `Startseite`                                                                      | col 2 link                                     |
| 6   | `footer.pages.projects`           | `Apps & Spiele`                                                                   | col 2 link                                     |
| 7   | `footer.pages.support`            | `Unterstützen`                                                                    | col 2 link                                     |
| 8   | `footer.pages.socials`            | `Socials`                                                                         | col 2 link                                     |
| 9   | `footer.legal.title`              | `RECHTLICHES`                                                                     | col 3 title                                    |
| 10  | `footer.legal.imprint`            | `Impressum`                                                                       | col 3 link                                     |
| 11  | `footer.legal.privacy`            | `Datenschutz`                                                                     | col 3 link                                     |
| 12  | `footer.social.title`             | `FOLGE UNS`                                                                       | col 4 title                                    |
| 13  | `footer.social.github-label`      | `GitHub`                                                                          | `title=` on icon link                          |
| 14  | `footer.social.discord-label`     | `Discord`                                                                         | `title=` on icon link                          |
| 15  | `footer.social.youtube-label`     | `YouTube`                                                                         | `title=` on icon link                          |
| 16  | `footer.copyright`                | `© 2026 Boundfox Studios. Alle Rechte vorbehalten.`                               | bottom bar left                                |
| 17  | `footer.language-list`            | `Deutsch · English`                                                               | bottom bar right                               |

17 visible strings; **15 need translation** (#1/#2 are the brand wordmark and stay as-is; #13–15
are brand names but must still be keyed because they double as accessible labels).

Notes for the EN catalogue:

- #4 `SEITEN` → `PAGES`, #9 `RECHTLICHES` → `LEGAL`, #12 `FOLGE UNS` → `FOLLOW US`.
  All Bebas Neue, so they render all-caps regardless — keep the source strings uppercase
  rather than relying on `text-transform` (Bebas has no lowercase glyphs of note).
- #16: the year `2026` should come from a `currentYear` signal / SSR-evaluated constant, not be
  baked into the translation. Split as `© {{year}} Boundfox Studios. Alle Rechte vorbehalten.`
  with an ICU/interpolation param.
- #17 is currently static text, not an interactive switcher (the real language switcher lives in
  the header). If it should become clickable, it needs two new keys and route/locale wiring —
  ask before changing behaviour.

---

## 6. Links

| Label          | Prototype `href`                     | Angular route/target   | External |
| -------------- | ------------------------------------ | ---------------------- | -------- |
| Startseite     | `Startseite.dc.html`                 | `/` (`routerLink="/"`) | no       |
| Apps & Spiele  | `Spiele und Apps.dc.html`            | `/apps-und-spiele`     | no       |
| Unterstützen   | `Unterstuetzen.dc.html`              | `/unterstuetzen`       | no       |
| Socials        | `Socials.dc.html`                    | `/socials`             | no       |
| Impressum      | `Impressum.dc.html`                  | `/impressum`           | no       |
| Datenschutz    | `Datenschutz.dc.html`                | `/datenschutz`         | no       |
| GitHub (icon)  | `https://github.com/BoundfoxStudios` | same                   | **yes**  |
| Discord (icon) | `https://discord.gg/tHqNzMT`         | same                   | **yes**  |
| YouTube (icon) | `https://youtube.com/c/boundfox`     | same                   | **yes**  |

Route mapping is from README.md §Routen. The three external URLs are identical to the ones used
on Unterstuetzen.dc.html and Socials.dc.html — hoist them into one shared `SOCIAL_LINKS`
constant so the three pages cannot drift.

The footer logo is **not** a link (the header logo is). Do not add one unless asked.

Add `target="_blank" rel="noopener noreferrer"` to the three external links — not in the
prototype, but required for a real site; confirm with Manu if link-out behaviour should differ.

---

## 7. Token map (design → `_ds` variable → Tailwind v4 `@theme`)

Every colour, size and spacing value in this footer resolves onto the stock Tailwind scale — no
arbitrary values are needed except the one `grid-template-columns`.

### Colours

| Design value | `_ds` token                     | `@theme` name (README proposal) | Used for                            |
| ------------ | ------------------------------- | ------------------------------- | ----------------------------------- |
| `#171717`    | `--bfs-ink` (neutral-900)       | `--color-neutral-900`           | footer band background              |
| `#ffffff`    | (literal; `--bfs-white` exists) | `--color-white`                 | footer text, nav links, icon glyphs |
| `#ffa726`    | `--bfs-orange`                  | `--color-orange`                | wordmark "BOUNDFOX"                 |
| `#ffeb3b`    | `--bfs-yellow`                  | `--color-yellow`                | column titles, all hover states     |
| `#d4d4d4`    | `--bfs-gray-300` (neutral-300)  | `--color-neutral-300`           | tagline                             |
| `#525252`    | `--bfs-gray-600` (neutral-600)  | `--color-neutral-600`           | bottom-bar `border-top`             |
| `#a3a3a3`    | `--bfs-gray-400` (neutral-400)  | `--color-neutral-400`           | copyright + language list           |

Unused in this component but present in the token file: `--bfs-amber #ffc107`,
`--bfs-gray-700 #404040`, `--bfs-gray-200 #e5e5e5`, `--bfs-gray-100 #f5f5f5`,
`--link #a16207`, `--gradient-brand`.

### Typography

| Design value               | `_ds` token                                                                             | Tailwind                          |
| -------------------------- | --------------------------------------------------------------------------------------- | --------------------------------- |
| `'Bebas Neue', sans-serif` | `--font-display`                                                                        | `--font-display` → `font-display` |
| `'Barlow', sans-serif`     | `--font-body`                                                                           | `--font-sans` → `font-sans`       |
| `12px`                     | `--text-xs`                                                                             | `text-xs`                         |
| `14px`                     | `--text-sm`                                                                             | `text-sm`                         |
| `16px`                     | `--text-base`                                                                           | `text-base`                       |
| `24px`                     | `--display-sm`                                                                          | `text-2xl`                        |
| `1`                        | `--leading-tight`                                                                       | `leading-none`                    |
| `1.625`                    | `--leading-body`                                                                        | `leading-relaxed`                 |
| `0.05em`                   | _(no exact token; sits between `--tracking-display` .025em and `--tracking-caps` .1em)_ | `tracking-wider`                  |

`--font-script` (Tahu) is **not** used in the footer — it appears only as the "Danke!" accent on
Unterstuetzen.

Font loading: `tokens/fonts.css` pulls Bebas Neue + Barlow (400/500/600/700 + 400 italic) from
Google Fonts and `@font-face`s Tahu from `assets/fonts/Tahu.ttf`. For the Angular build, self-host
both Google families (SSR + no-tracking requirement in the README: "Kein Tracking, keine Cookies"
— a Google Fonts CDN request leaks visitor IPs) and copy `Tahu.ttf` into the app's assets.
The footer needs only Bebas Neue 400 and Barlow 400.

### Spacing / radius / shadow

| Design value | `_ds` token                        | Tailwind        |
| ------------ | ---------------------------------- | --------------- |
| `10px`       | _(off the named scale; 2.5 steps)_ | `gap-2.5`       |
| `12px`       | `--space-3`                        | `gap-3`         |
| `16px`       | `--space-4`                        | `py-4`, `gap-4` |
| `24px`       | `--space-5`                        | `px-6`, `mt-6`  |
| `32px`       | `--space-6`                        | `gap-8`         |
| `40px`       | _(logo mark)_                      | `h-10 w-10`     |
| `48px`       | `--space-7`                        | `pt-12`         |
| `320px`      | _(tagline cap)_                    | `max-w-80`      |
| `1152px`     | `--container-max`                  | `max-w-6xl`     |

No radius, no shadow, no gradient, no opacity, no blur anywhere in this component.

### Motion

| Token             | Value                     | Tailwind       |
| ----------------- | ------------------------- | -------------- |
| `--dur-fast`      | `150ms`                   | `duration-150` |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` | `ease-in-out`  |

---

## 8. Reusable components

### 8.1 `SiteFooter` (this component)

- Selector suggestion `bfs-site-footer`. **No inputs.** Rendered once in `app.html` below
  `<router-outlet>`; identical on all six routes.
- Element: `<footer>`.
- Internal data: two arrays (`pageLinks`, `legalLinks`) of `{ labelKey, routerLink }` and one
  `socialLinks` array of `{ icon, labelKey, href }` — drive the three columns from `@for`.

### 8.2 `BrandWordmark`

Shared with `SiteHeader`. Extract as `bfs-brand-wordmark`.

| Input    | Type                       | Header                           | Footer                 |
| -------- | -------------------------- | -------------------------------- | ---------------------- |
| `size`   | `32 \| 40` (px, mark only) | `32`                             | `40`                   |
| `alt`    | `string`                   | `'Boundfox Studios'`             | `''` (decorative)      |
| `nowrap` | `boolean`                  | `true` (`white-space:nowrap`)    | `false`                |
| `link`   | `string \| null`           | `'/'` (whole lockup is an `<a>`) | `null` (plain `<div>`) |

Wordmark type is fixed (Bebas 24px / `0.05em` / `leading-none`, orange + yellow) in both places.

### 8.3 `SocialIcon` / icon registry

Inline-SVG registry, keys `github` | `discord` | `youtube`. Each entry: `viewBox "0 0 24 24"`,
one `d` string, `fill="currentColor"`.

| Input  | Type                                 | Footer value | Other consumers                                         |
| ------ | ------------------------------------ | ------------ | ------------------------------------------------------- |
| `name` | `'github' \| 'discord' \| 'youtube'` | per link     | same three                                              |
| `size` | number (px)                          | `20`         | `32` on Socials tiles, `24` in Unterstuetzen icon chips |

Render as `<svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="currentColor">`
with a single `<path [attr.d]="…">`. Colour comes from the parent via `currentColor` — never
hard-code a fill.

### 8.4 `SocialIconLink`

Thin wrapper: `<a [href] [title] target="_blank" rel="noopener noreferrer">` + `SocialIcon`.
Inputs: `href`, `label` (title + `aria-label`), `icon`, `size`.
Variant needed for the footer: white glyph → yellow on hover, 150ms.
Socials/Unterstuetzen use yellow-on-dark and dark-on-yellow variants — plan a `tone` input
(`'on-dark' | 'on-accent'`) rather than three copies.

### 8.5 `FooterLinkColumn` (optional)

`title: string` + `links: { label, routerLink }[]`. Only worth extracting if columns 2 and 3
stay purely link lists; column 4 differs (icon row instead of stacked links) so it should not be
forced through the same component.

---

## 9. Semantics & accessibility deltas (prototype → production)

The prototype is presentational HTML. Apply these when rebuilding; none of them change a pixel.

1. Wrap columns 2 and 3 in `<nav aria-labelledby="…">` and turn the flex columns into
   `<ul>/<li>` with `list-none m-0 p-0`. Reference the column title `<span>` (give it an `id`)
   from `aria-labelledby`. Column 4's icon row likewise.
2. Column titles are `<span>` in the design — keep them non-heading (they are labels, not
   document structure) and expose them via `aria-labelledby` as above. If you prefer headings,
   `<h2>` with the exact same type styles is acceptable; do not let a UA heading style leak in
   (reset `font-size`/`margin`).
3. The 20 × 20 icon links have a **24 × 24 minimum-target-size gap** (WCAG 2.2 AA §2.5.8 asks
   for 24 × 24). Add `p-1 -m-1` (or `inline-flex` with padding compensated by negative margin)
   so the visual layout is unchanged but the hit box grows to 28 × 28. Verify the row's 12px gap
   still reads as 12px after the negative margins.
4. Give the icon links `aria-label` in addition to `title` (a `title` alone is unreliable for
   screen readers), using the same three label keys.
5. Hover is colour-only; add a visible `:focus-visible` ring — the design has none.
   Suggested: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber`
   (`--focus-ring` = `--bfs-amber` `#ffc107` in the token file).
6. Contrast check: `#d4d4d4` on `#171717` ≈ 12.0:1 ✓; `#a3a3a3` on `#171717` ≈ 6.4:1 ✓ (both
   pass AA at 12/14px); `#ffeb3b` on `#171717` ≈ 15.2:1 ✓; `#ffa726` on `#171717` ≈ 9.4:1 ✓.
   No contrast remediation needed.
7. The footer logo has `alt=""` — correct, since the wordmark text next to it already names the
   studio. Keep it empty; do not "fix" it to match the header.
8. Add `transition-colors duration-150 ease-in-out` to every hover target, and respect
   `prefers-reduced-motion` globally (colour-only transitions are generally fine to keep).

---

## 10. Reference implementation sketch (Tailwind v4 classes only)

```html
<footer class="bg-neutral-900 font-sans text-white">
  <div
    class="mx-auto grid max-w-6xl grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-8 px-6 pt-12 pb-0"
  >
    <!-- col 1 -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2.5">
        <img
          class="h-10 w-10 object-contain"
          src="fox-head.png"
          alt=""
        />
        <span class="font-display text-2xl leading-none tracking-wider">
          <span class="text-orange">BOUNDFOX</span> <span class="text-yellow">STUDIOS</span>
        </span>
      </div>
      <p class="m-0 max-w-80 text-sm leading-relaxed text-neutral-300">…</p>
    </div>

    <!-- col 2 / col 3 -->
    <div class="flex flex-col gap-2.5">
      <span class="font-display text-base tracking-wider text-yellow">SEITEN</span>
      <a
        class="text-sm text-white no-underline transition-colors duration-150 ease-in-out hover:text-yellow"
        >Startseite</a
      >
      …
    </div>

    <!-- col 4 -->
    <div class="flex flex-col gap-2.5">
      <span class="font-display text-base tracking-wider text-yellow">FOLGE UNS</span>
      <div class="flex gap-3">
        <a class="text-white transition-colors duration-150 ease-in-out hover:text-yellow">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="…" />
          </svg>
        </a>
        …
      </div>
    </div>
  </div>

  <div
    class="mx-auto mt-6 flex max-w-6xl flex-wrap justify-between gap-4 border-t border-neutral-600 px-6 py-4"
  >
    <span class="text-xs text-neutral-400">© 2026 Boundfox Studios. Alle Rechte vorbehalten.</span>
    <span class="text-xs text-neutral-400">Deutsch · English</span>
  </div>
</footer>
```

`text-orange` / `text-yellow` assume the `@theme` block from README.md §Design Tokens
(`--color-yellow: #ffeb3b`, `--color-amber: #ffc107`, `--color-orange: #ffa726`,
`--color-link: #a16207`, neutrals kept, all other stock palettes disabled via
`--color-*: initial`). Register `--font-display: "Bebas Neue", sans-serif` and
`--font-sans: "Barlow", sans-serif` in the same block.

---

## 11. Assets

| Asset          | Path                                | Used as                      | Notes                                                                                                                                                                                                                                                       |
| -------------- | ----------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fox head mark  | `assets/fox-head.png`               | col 1 logo, 40 × 40 rendered | Intrinsic 600 × 600 transparent PNG. Brand rule: full-colour mark only, and only on white or dark — the footer's `#171717` band is compliant. Serve a 40/80/120px `srcset` (or convert to SVG/WebP) instead of shipping the 600px original for a 40px slot. |
| GitHub glyph   | inline SVG, `SiteFooter.dc.html:43` | 20 × 20                      | 24×24 viewBox, 1 path, `fill="currentColor"`                                                                                                                                                                                                                |
| Discord glyph  | inline SVG, `SiteFooter.dc.html:44` | 20 × 20                      | 24×24 viewBox, 1 path (3 subpaths)                                                                                                                                                                                                                          |
| YouTube glyph  | inline SVG, `SiteFooter.dc.html:45` | 20 × 20                      | 24×24 viewBox, 1 path (2 subpaths)                                                                                                                                                                                                                          |
| Bebas Neue 400 | Google Fonts                        | wordmark + column titles     | self-host                                                                                                                                                                                                                                                   |
| Barlow 400     | Google Fonts                        | all body text                | self-host                                                                                                                                                                                                                                                   |

Not used by the footer (listed for completeness — they belong to other screens):
`assets/logo-lockup.png`, `assets/mat-dark.svg`, `assets/mat-light.svg`,
`assets/flugwacht-wordmark.svg`, `assets/flugwacht-radar.svg`, `assets/bug-a-ball.svg`
(the README flags the Bug-A-Ball key art as missing/broken), `_ds/…/assets/fonts/Tahu.ttf`.

---

## 12. Open questions for Manu

1. `© 2026` — hard-code or derive from the current year at SSR time? (Recommend derive.)
2. `Deutsch · English` in the bottom bar is static text while the header has a working DE/EN
   switcher. Should the footer line become a second switcher, or stay decorative?
3. External social links: open in a new tab (`target="_blank"`) or same tab? The prototype
   specifies neither.
4. The footer logo is not clickable in the design while the header logo is — intentional?
5. Should columns 2/3 use `routerLinkActive` styling (as the header nav does) or stay plain
   white? The design shows no active state in the footer.
