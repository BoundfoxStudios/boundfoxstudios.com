# Implementation Reference — Startseite (`/`)

Source of truth: `/Users/manuelrauber/projects/private/boundfoxstudios.com/design_handoff_website_redesign/Startseite.dc.html`
(plus `SiteHeader.dc.html`, `SiteFooter.dc.html`, `_ds/boundfox-studios-design-system-0747e2df-62fc-4fe1-bbd4-f0e974f1e1a3/`).

Every number below is read verbatim out of the inline styles of the prototype. Where the handoff
`README.md` contradicts the HTML, the HTML value is listed first and the discrepancy is flagged in
[§10 Discrepancies](#10-discrepancies--open-decisions).

Target stack: Angular (SSR, standalone components, prefix `app`) + Tailwind v4
(`projects/website/src/styles.css` already has `@import 'tailwindcss';`).

---

## 1. Design tokens → Tailwind v4 `@theme`

All token files live in `_ds/boundfox-studios-design-system-0747e2df-62fc-4fe1-bbd4-f0e974f1e1a3/tokens/`.

### 1.1 colors.css

| CSS variable       | Value                                    | Semantic alias(es)                                      | Tailwind v4 theme var | Utility                                |
| ------------------ | ---------------------------------------- | ------------------------------------------------------- | --------------------- | -------------------------------------- |
| `--bfs-yellow`     | `#ffeb3b`                                | `--accent-soft`                                         | `--color-yellow`      | `bg-yellow` / `text-yellow`            |
| `--bfs-amber`      | `#ffc107`                                | `--accent`, `--focus-ring`                              | `--color-amber`       | `bg-amber`                             |
| `--bfs-orange`     | `#ffa726`                                | `--accent-strong`                                       | `--color-orange`      | `text-orange`                          |
| `--bfs-ink`        | `#171717`                                | `--text-heading`, `--text-on-accent`                    | `--color-neutral-900` | `text-neutral-900`                     |
| `--bfs-gray-700`   | `#404040`                                | `--text-body`, `--surface-inverse`                      | `--color-neutral-700` | `text-neutral-700`                     |
| `--bfs-gray-600`   | `#525252`                                | `--text-muted`                                          | `--color-neutral-600` | `text-neutral-600`                     |
| `--bfs-gray-400`   | `#a3a3a3`                                | `--border-strong`                                       | `--color-neutral-400` | `border-neutral-400`                   |
| `--bfs-gray-300`   | `#d4d4d4`                                | —                                                       | `--color-neutral-300` | `text-neutral-300`                     |
| `--bfs-gray-200`   | `#e5e5e5`                                | `--border-default`                                      | `--color-neutral-200` | `border-neutral-200`                   |
| `--bfs-gray-100`   | `#f5f5f5`                                | `--surface-subtle`                                      | `--color-neutral-100` | `bg-neutral-100`                       |
| `--bfs-white`      | `#ffffff`                                | `--surface-page`, `--surface-card`, `--text-on-inverse` | `--color-white`       | `bg-white`                             |
| `--link`           | `#a16207`                                | (stock yellow-700)                                      | `--color-link`        | `text-link`                            |
| `--gradient-brand` | `linear-gradient(90deg,#ffeb3b,#ffa726)` | —                                                       | —                     | `bg-linear-to-r from-yellow to-orange` |

**Non-negotiable:** the three brand yellows are brand-exact. Do not substitute stock Tailwind
`yellow-*`/`amber-*`. Recommended: `--color-*: initial;` in `@theme` and re-declare only the list
above (per handoff README).

### 1.2 typography.css

| Variable                        | Value                      | Tailwind                                                |
| ------------------------------- | -------------------------- | ------------------------------------------------------- |
| `--font-display`                | `'Bebas Neue', sans-serif` | `--font-display` → `font-display`                       |
| `--font-script`                 | `'Tahu', cursive`          | `--font-script` → `font-script` (not used on this page) |
| `--font-body`                   | `'Barlow', sans-serif`     | `--font-sans` → default body                            |
| `--text-xs / sm / base / lg`    | `12 / 14 / 16 / 18px`      | `text-xs / text-sm / text-base / text-lg`               |
| `--display-sm / md / lg / xl`   | `24 / 36 / 60 / 96px`      | `text-2xl / text-4xl / text-6xl / text-8xl`             |
| `--leading-tight / snug / body` | `1 / 1.25 / 1.625`         | `leading-none / leading-tight / leading-relaxed`        |
| `--tracking-display`            | `0.025em`                  | `tracking-wide`                                         |
| `--tracking-caps`               | `0.1em`                    | `tracking-widest`                                       |
| (inline literal `0.05em`)       | `0.05em`                   | `tracking-wider`                                        |

Font loading (`tokens/fonts.css`):

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
@font-face {
  font-style: normal;
  font-weight: 400;
  src: url('assets/fonts/Tahu.ttf') format('truetype');
  font-family: 'Tahu';
  font-display: swap;
}
```

For SSR: self-host Bebas Neue + Barlow instead of the Google CDN import (no third-party requests —
the site is explicitly tracking/cookie-free). Barlow weights needed on this page: **400** (body) and
**700** (kickers, link labels, badges). Tahu is **not** used on the Startseite.

### 1.3 spacing.css

`--space-1..9` = `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px` (= Tailwind `1 2 3 4 6 8 12 16 24`).
`--radius-sm/md/lg/pill` = `4 / 8 / 12 / 9999px` (= `rounded-sm? no →` `rounded` / `rounded-lg` / `rounded-xl` / `rounded-full`).
`--container-max` = **`1152px`** (= `max-w-6xl`).

### 1.4 effects.css

| Variable          | Value                                                                      | Tailwind                    |
| ----------------- | -------------------------------------------------------------------------- | --------------------------- |
| `--shadow-card`   | `0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1)`           | `shadow-md`                 |
| `--shadow-raised` | `0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)`         | `shadow-lg`                 |
| `--shadow-accent` | `0 10px 15px -3px rgb(255 193 7 / .3), 0 4px 6px -4px rgb(255 193 7 / .3)` | `shadow-lg shadow-amber/30` |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)`                                                  | `ease-in-out`               |
| `--dur-fast`      | `150ms`                                                                    | `duration-150`              |
| `--dur-base`      | `200ms`                                                                    | `duration-200`              |

### 1.5 Page-level base styles (from the `<helmet>` block of Startseite.dc.html)

```css
body {
  margin: 0;
  background: #ffffff;
  color: #404040;
  font-family: 'Barlow', sans-serif;
}
a {
  transition: color 150ms ease-in-out;
  color: #a16207;
  text-decoration: none;
}
a:hover {
  color: #ffa726;
}
```

Everything that does not set its own `color` inherits `#404040`. Every `<a>` that does not override
`color` is `#a16207` → hover `#ffa726`.

---

## 2. Page skeleton

```
div  min-height:100vh; display:flex; flex-direction:column
├── <app-site-header active="start">           (64px band, see §7)
├── <main style="flex:1">
│   ├── §3  Projekt-Teaser        (white, container 1152, padding 64/24/72)
│   ├── §4  Unterstützen-Band     (gradient — DEFAULT; dark variant in §4.2, not default)
│   └── §5  Zuletzt auf GitHub    (#f5f5f5 full-bleed, container 1152, padding 64/24/72)
└── <app-site-footer>                          (dark band, see §8)
```

The prototype wraps the sections in `<sc-if>` prototype conditionals driven by props
`supportVariant` (enum `dunkel|gradient`, **default `gradient`**) and `showGithub` (boolean, default
`true`). In Angular: render the **gradient** band unconditionally; the GitHub section is rendered only
when the SSR fetch produced repos (see §5.4).

---

## 3. Section A — Projekt-Teaser

### 3.1 Section shell

```
<section> max-width:1152px; margin:0 auto; padding:64px 24px 72px;
```

Tailwind: `mx-auto max-w-6xl px-6 pt-16 pb-18` — note **72px bottom is off the default scale**
(`pb-18` = 72px exists in Tailwind v4's 4px scale as `18 * 4 = 72`; if not, use `pb-[72px]`).

Background: page white (no own background).

### 3.2 Section head (heading row)

```
<div> display:flex; align-items:flex-end; justify-content:space-between;
      gap:24px; flex-wrap:wrap; margin-bottom:32px;
```

Left block (no explicit width — shrinks/wraps naturally):

| Element      | Exact styles                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Kicker `div` | `font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#ffa726; margin-bottom:8px;`                           |
| `h1`         | `margin:0; font-family:'Bebas Neue'; font-weight:400; font-size:clamp(40px,5.5vw,60px); line-height:1; letter-spacing:0.025em; color:#171717;` |
| `p`          | `margin:12px 0 0; font-size:18px; line-height:1.625; max-width:560px; text-wrap:pretty;` (color inherited `#404040`)                           |

Right link (sits on the same baseline via `align-items:flex-end`):

```
<a href="/apps-und-spiele">
  font-family:'Bebas Neue'; font-size:18px; letter-spacing:0.05em;
  color:#a16207 (inherited from base a); hover #ffa726
```

### 3.3 Card grid

```
display:grid;
grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr));
gap:24px;
```

Resulting column count (content width = `min(viewport,1152px) − 48px` padding):

| Viewport | Content width | Columns          |
| -------- | ------------- | ---------------- |
| ≥ 912px  | ≥ 864px       | **2** (2×2 grid) |
| < 912px  | < 864px       | **1**            |

3 columns are mathematically impossible (`3·420 + 2·24 = 1308 > 1104` max content width), so the
layout is always 1 or 2 columns. Tailwind v4: `grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))]`.

**Card order: LehrGrapht → Flugwacht → MAT → Bug-A-Ball.**

### 3.4 Project card (`<article>`) — shared shell

```
background:#ffffff;
border:1px solid #e5e5e5;
border-radius:12px;
box-shadow: var(--shadow-card)   /* shadow-md */
overflow:hidden;
display:flex; flex-direction:column;
```

No hover state on the card itself — **the whole card is NOT clickable**, only the link in the footer row.

**Media area** — height `200px` in all four cards, but the fill differs per card (§3.5).

**Body**

```
padding:24px; flex:1; display:flex; flex-direction:column; gap:8px;
```

| Row                  | Styles                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Meta row `div`       | `display:flex; align-items:center; gap:10px;`                                                                                  |
| ↳ type kicker `span` | `font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#ffa726;`                              |
| ↳ `<Badge>`          | see §6.1, rendered height ≈ 22px                                                                                               |
| `h2`                 | `margin:0; font-family:'Bebas Neue'; font-weight:400; font-size:24px; line-height:1; letter-spacing:0.025em; color:#171717;`   |
| `p`                  | `margin:0; font-size:14px; line-height:1.625;` (color `#404040`)                                                               |
| Footer row `div`     | `margin-top:auto; padding-top:8px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;` |
| ↳ platform `span`    | `font-size:12px; color:#525252;`                                                                                               |
| ↳ link `a`           | `font-size:14px; font-weight:700;` (color `#a16207`, hover `#ffa726`)                                                          |

### 3.5 Card media areas (per card)

**1. LehrGrapht — graph-paper pattern**

```
height:200px; display:flex; align-items:center; justify-content:center;
background-color:#ffffff;
background-image:linear-gradient(#e5e5e5 1px,transparent 1px),
                 linear-gradient(90deg,#e5e5e5 1px,transparent 1px);
background-size:20px 20px;
border-bottom:1px solid #e5e5e5;      /* only this card has the divider */
```

Inner `<span>`: `font-family:'Bebas Neue'; font-size:44px; letter-spacing:0.025em; color:#171717;` → text `LEHRGRAPHT`.

**2. Flugwacht — wordmark**

```
height:200px; display:flex; align-items:center; justify-content:center; background:#f5f5f5;
<img src="assets/flugwacht-wordmark.svg" alt="Flugwacht Wortmarke"
     style="width:56%; max-width:300px;">   /* height auto, intrinsic ratio 231.18 × 42 */
```

**3. MAT — app icon**

```
height:200px; display:flex; align-items:center; justify-content:center; background:#f5f5f5;
<img src="assets/mat-dark.svg" alt="mat App-Icon" style="width:112px; height:112px;">
```

**4. Bug-A-Ball — key art (ASSET MISSING)**

```
height:200px; overflow:hidden; background:#f5f5f5;
<image-slot id="bugaball-art" shape="rect" placeholder="Bug-A-Ball Key-Art hier ablegen">
```

Prototype drop-placeholder. Replace with
`<img src="…" alt="…" style="width:100%;height:100%;object-fit:cover;">`. No `border-bottom` on this
media area. Key art must be sourced (see §9).

### 3.6 Card copy (verbatim)

| Card       | Type kicker | Badge                      | Title        | Description                                                                                                                                                                   | Platforms                        | Link label         | Link href                                      |
| ---------- | ----------- | -------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------ | ---------------------------------------------- |
| LehrGrapht | `App`       | `Verfügbar` (amber)        | `LEHRGRAPHT` | `Kostenfreies, quelloffenes Word-AddIn für Lehrkräfte: maßstabsgetreue Plots, passgenau auf 5×5-mm-Karopapier — ideal zum Nachmessen.`                                        | `Word für Windows, macOS & iPad` | `Zur Website →`    | `https://lehrgrapht.de`                        |
| Flugwacht  | `App`       | `In Entwicklung` (outline) | `FLUGWACHT`  | `Bewusst minimaler Flug-Tracker: Flugnummer eintragen und am Reisetag live auf der Karte verfolgen, wo der Flieger gerade ist — ganz ohne Konto.`                             | `iOS & Android`                  | `Zum Repository →` | `https://github.com/BoundfoxStudios/flugwacht` |
| MAT        | `App`       | `In Entwicklung` (outline) | `MAT`        | `Markdown-Vorschau direkt aus dem Terminal — gerendert wie auf GitHub, ohne Server und ohne Konfiguration. So beiläufig wie <span style="font-family:monospace;">cat</span>.` | `macOS, Linux & Windows`         | `Zum Repository →` | `https://github.com/BoundfoxStudios/mat`       |
| Bug-A-Ball | `Spiel`     | `Verfügbar` (amber)        | `BUG-A-BALL` | `Rolle dich durch Level und Welten, weiche Hindernissen aus, schalte exklusive Skins frei — und zeig auf der Bestenliste, wer hier der Profi ist.`                            | `iOS & Android`                  | `Zur Website →`    | `https://bug-a-ball.com`                       |

MAT's description contains an inline `<span style="font-family:monospace;">cat</span>` —
in i18n this needs an interpolated markup placeholder (Angular `$localize` / ICU with a nested tag),
not a plain string.

---

## 4. Section B — Unterstützen-Band

### 4.1 Gradient variant (**DEFAULT — build this one**)

```
<section> background:linear-gradient(90deg,#ffeb3b,#ffa726);   /* full-bleed */
  <div> max-width:1152px; margin:0 auto; padding:56px 24px;
        display:flex; flex-direction:column; gap:20px; align-items:flex-start;
```

| Element       | Exact styles                                                                                                                                                                                                                                                                                                                   | Copy                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `h2`          | `margin:0; font-family:'Bebas Neue'; font-weight:400; font-size:36px; line-height:1; letter-spacing:0.025em; color:#171717;`                                                                                                                                                                                                   | `UNTERSTÜTZE UNS`                                                                                                         |
| `p`           | `margin:0; font-size:16px; line-height:1.625; color:#171717; max-width:560px; text-wrap:pretty;`                                                                                                                                                                                                                               | `Unsere Projekte sind kostenlos und Open Source. Wenn du magst, gib etwas zurück — vieles davon kostet dich keinen Cent.` |
| Chips wrapper | `display:flex; gap:12px; flex-wrap:wrap;`                                                                                                                                                                                                                                                                                      | —                                                                                                                         |
| Chip `a` (×5) | `display:inline-flex; align-items:center; gap:8px; background:#ffffff; color:#171717; border-radius:9999px; padding:10px 18px; font-family:'Bebas Neue'; font-size:16px; letter-spacing:0.05em; box-shadow:var(--shadow-card);` hover: `color:#171717` (i.e. **no** color change — it explicitly cancels the global `a:hover`) | see below                                                                                                                 |
| Trailing `a`  | `color:#171717; font-size:14px; font-weight:700; text-decoration:underline;` hover `color:#404040`                                                                                                                                                                                                                             | `Alle Möglichkeiten ansehen →` → `/unterstuetzen`                                                                         |

Chips (order fixed, **no icons** inside — the `gap:8px` is prepared for an optional icon):

| Label     | href                                      |
| --------- | ----------------------------------------- |
| `GITHUB`  | `https://github.com/BoundfoxStudios`      |
| `DISCORD` | `https://discord.gg/tHqNzMT`              |
| `YOUTUBE` | `https://youtube.com/c/boundfox`          |
| `KO-FI`   | `https://ko-fi.com/boundfoxstudios`       |
| `PATREON` | `https://www.patreon.com/boundfoxstudios` |

All five are external → `target="_blank" rel="noopener noreferrer"` (not in the prototype, add it).

### 4.2 Dark variant (alternative — do **not** ship as default; documented for completeness)

```
<section> background:#404040   /* --surface-inverse = --bfs-gray-700, NOT #171717 */
  <div> max-width:1152px; margin:0 auto; padding:64px 24px;
    <div> display:grid;
          grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));
          gap:48px; align-items:center;
```

2 columns at viewport ≥ 696px, else 1.

Left column: kicker `Community` (`12px/700/0.1em/uppercase; color:#ffeb3b; margin-bottom:8px`),
`h2 UNTERSTÜTZE UNS` (Bebas 36px/1/0.025em, `color:#ffffff`), `p` (`margin:12px 0 20px; 16px/1.625;
color:#d4d4d4; text-wrap:pretty`, same copy as §4.1), CTA `a` (`display:inline-block;
background:#ffc107; color:#171717; padding:10px 20px; font-family:'Bebas Neue';
text-transform:uppercase; letter-spacing:0.05em; font-size:16px; border-radius:8px;
box-shadow:var(--shadow-accent); transition:background 150ms ease-in-out;` hover `background:#ffa726`)
with copy `Alle Möglichkeiten` → `/unterstuetzen`.

Right column: `display:grid; grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr)); gap:12px;`
with five tiles: `background:#171717; border:1px solid #525252; border-radius:8px; padding:16px;
display:flex; flex-direction:column; gap:10px; transition:border-color 150ms ease-in-out;`
hover `border-color:#ffc107`. Each contains a 24×24 inline `<svg viewBox="0 0 24 24" fill="#ffeb3b">`,
a name span (Bebas 18px, `letter-spacing:0.05em`, `color:#ffffff`, `line-height:1`) and a sub span
(`12px; color:#a3a3a3`):

| Tile    | Sub-label                |
| ------- | ------------------------ |
| GITHUB  | `Code, Issues & Stars`   |
| DISCORD | `Community beitreten`    |
| YOUTUBE | `Abonnieren & schauen`   |
| KO-FI   | `Einmalig spendieren`    |
| PATREON | `Monatlich unterstützen` |

Same hrefs as §4.1.

---

## 5. Section C — Zuletzt auf GitHub

### 5.1 Section shell

```
<section> background:#f5f5f5;                       /* full-bleed */
  <div> max-width:1152px; margin:0 auto; padding:64px 24px 72px;
```

### 5.2 Section head

```
<div> display:flex; align-items:flex-end; justify-content:space-between;
      gap:24px; flex-wrap:wrap; margin-bottom:28px;      /* 28px — NOT 32px like §3.2 */
```

| Element      | Styles                                                                                                                       | Copy                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Kicker `div` | `font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#ffa726; margin-bottom:8px;`         | `Open Source`                                                |
| `h2`         | `margin:0; font-family:'Bebas Neue'; font-weight:400; font-size:36px; line-height:1; letter-spacing:0.025em; color:#171717;` | `ZULETZT AUF GITHUB`                                         |
| `a`          | `font-family:'Bebas Neue'; font-size:18px; letter-spacing:0.05em;` (color `#a16207`, hover `#ffa726`)                        | `ALLE REPOSITORIES →` → `https://github.com/BoundfoxStudios` |

### 5.3 Repo card grid

```
display:grid;
grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));
gap:24px;
```

| Viewport  | Columns |
| --------- | ------- |
| ≥ 936px   | 3       |
| 632–935px | 2       |
| < 632px   | 1       |

Each card is a `<Card>` (design-system component, §6.2) with `hint-size 100%,220px` — i.e. the
design preview reserves ~220px height; do not hard-code a height, let content define it.

### 5.4 Card data (PLACEHOLDER)

| Eyebrow            | Title        | Body                                                                                 | Footer                                 |
| ------------------ | ------------ | ------------------------------------------------------------------------------------ | -------------------------------------- |
| `TypeScript`       | `LEHRGRAPHT` | `Mathe-Plotter-Word-AddIn für Lehrkräfte — maßstabsgetreu auf 5×5-mm-Karopapier.`    | `v1.6.2 · aktualisiert vor 3 Tagen`    |
| `TypeScript · Bun` | `MAT`        | `Markdown-Vorschau im Browser, gerendert wie auf GitHub — direkt aus dem Terminal.`  | `v0.9.2 · aktualisiert gestern`        |
| `Dart · Flutter`   | `FLUGWACHT`  | `Minimaler Flug-Tracker für einzelne, manuell angelegte Flüge — live auf der Karte.` | `Meilenstein 0.3 · aktualisiert heute` |

Production behaviour (from handoff README): fetch `GET https://api.github.com/orgs/BoundfoxStudios/repos?sort=pushed`
**server-side during SSR**, cache it, render cards for `lehrgrapht`, `mat`, `flugwacht`. On error:
hide the section (or render a static fallback). No client-side fetch. Eyebrow = language(s), title =
repo name uppercased, body = repo description, footer = `<latest release tag> · aktualisiert <relative>`.
The relative-time phrasing (`vor 3 Tagen` / `gestern` / `heute`) must be produced by a German
relative-time formatter (`Intl.RelativeTimeFormat('de')`), so the footer needs a composed i18n
message, not a literal.

Cards are **not** clickable in the design (the DS `Card` renders a `<div>`). If they should link to
the repo, that is a new decision — see §10.

---

## 6. Reusable components

### 6.1 `Badge` — `_ds/…/components/display/Badge.jsx`

```
display:inline-flex; align-items:center;
padding:2px 10px; border-radius:9999px;
font-family:'Barlow'; font-size:12px; font-weight:700;
letter-spacing:0.05em; text-transform:uppercase;
```

| `variant`          | background    | color     | border              |
| ------------------ | ------------- | --------- | ------------------- |
| `yellow` (default) | `#ffeb3b`     | `#171717` | —                   |
| `amber`            | `#ffc107`     | `#171717` | —                   |
| `orange`           | `#ffa726`     | `#171717` | —                   |
| `dark`             | `#404040`     | `#ffeb3b` | —                   |
| `outline`          | `transparent` | `#171717` | `1px solid #a3a3a3` |

Used on this page: `amber` → `Verfügbar`; `outline` → `In Entwicklung`.
Angular API: `<app-badge variant="amber|outline|yellow|orange|dark">…</app-badge>` (content projection).

### 6.2 `Card` — `_ds/…/components/display/Card.jsx`

Props: `eyebrow?`, `title?`, `footer?`, `image?` (string URL or node), children, `style?`.

```
root:    background:#ffffff; border:1px solid #e5e5e5; border-radius:12px;
         box-shadow:var(--shadow-card); overflow:hidden; font-family:'Barlow';
         display:flex; flex-direction:column;
image:   height:144px; background:#f5f5f5; display:flex; align-items:center;
         justify-content:center; overflow:hidden;  (img: 100%/100%, object-fit:cover)
body:    padding:24px; flex:1;
  eyebrow: font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
           color:#ffa726; margin-bottom:6px;
  title:   font-family:'Bebas Neue'; font-size:24px; line-height:1; letter-spacing:0.025em;
           color:#171717; margin-bottom:8px;
  text:    font-size:14px; line-height:1.625; color:#404040;
footer:  padding:12px 24px; border-top:1px solid #e5e5e5; background:#f5f5f5;
```

On the Startseite only `eyebrow` / `title` / `footer` / children are used — **no** image block.
Footer font-size: see §10 (the component sets none → inherits 16px; the handoff README says 12px).

Angular API: `<app-card [eyebrow]="…" [title]="…" [footer]="…">…</app-card>`, optional `image` slot.

### 6.3 Project teaser card (page-specific, §3.4/§3.5)

Not part of the DS bundle — build as `<app-project-card>`:
inputs `type` (`App` | `Spiel`), `status` (`available` | `in-development`), `title`, `description`
(may contain markup), `platforms`, `linkLabel`, `linkHref`, and a **media slot** with four
variants — `pattern` (graph paper + wordmark text), `contain` (centered SVG, width % + max-width),
`icon` (fixed 112px square), `cover` (full-bleed image). Media height is always `200px`; only the
`pattern` variant carries `border-bottom:1px solid #e5e5e5`.

### 6.4 Section head (used twice: §3.2 and §5.2)

`<app-section-head>` inputs: `kicker`, `heading`, `subtitle?` (only §3.2), `linkLabel?`, `linkHref?`,
`headingLevel` (`h1` in §3.2, `h2` in §5.2), `headingSize` (`clamp(40px,5.5vw,60px)` vs `36px`),
`marginBottom` (`32px` vs `28px`).

### 6.5 Pill chip link (§4.1)

`<app-pill-link href label>` — white pill, Bebas 16px, `padding:10px 18px`, `border-radius:9999px`,
`shadow-md`, keeps `color:#171717` on hover.

### 6.6 Primary button (dark variant only, §4.2)

`background:#ffc107; color:#171717; padding:10px 20px; radius 8px; shadow-accent;` hover `#ffa726`,
active +1px translateY (per handoff README). Reused as the main CTA on `/apps-und-spiele`.

### 6.7 Social icon set

Inline SVGs, `viewBox="0 0 24 24"`, single `<path>` each (except Patreon = `<circle>` + `<rect>`).
Icon names (do not re-draw — copy the path data from the prototype files):

| Icon      | Where              | Size / fill                                                                         |
| --------- | ------------------ | ----------------------------------------------------------------------------------- |
| `github`  | §4.2 tiles, footer | 24px `fill:#ffeb3b` / 20px `fill:currentColor`                                      |
| `discord` | §4.2 tiles, footer | idem                                                                                |
| `youtube` | §4.2 tiles, footer | idem                                                                                |
| `ko-fi`   | §4.2 tiles         | 24px `fill:#ffeb3b`                                                                 |
| `patreon` | §4.2 tiles         | 24px `fill:#ffeb3b` (`circle cx=15.2 cy=8.8 r=7.3` + `rect x=1.2 y=1.5 w=4.2 h=21`) |

Source of the path data: `Startseite.dc.html` lines 120/125/130/135/140 and `SiteFooter.dc.html`
lines 43–45. Build one `<app-icon name="github|discord|youtube|ko-fi|patreon" [size]>` component with
`fill="currentColor"` and color it from the outside.

---

## 7. `SiteHeader` (shared, `active="start"` on this page)

```
<header> background:#171717; color:#ffffff;
  <div> max-width:1152px; margin:0 auto; padding:8px 24px; min-height:48px;
        display:flex; align-items:center; gap:16px; flex-wrap:wrap;
```

→ band height 64px (48 + 2×8).

**Logo link** → `/`: `display:flex; align-items:center; gap:10px; color:#ffffff; text-decoration:none;`

- `<img src="assets/fox-head.png" alt="Boundfox Studios" style="width:32px;height:32px;object-fit:contain;">`
- Wordmark `<span>`: `font-family:'Bebas Neue'; font-size:24px; letter-spacing:0.05em; line-height:1; white-space:nowrap;`
  containing `<span style="color:#ffa726">BOUNDFOX</span>` + space + `<span style="color:#ffeb3b">STUDIOS</span>`.

**Nav**: `display:flex; gap:4px; margin-left:auto; align-items:center; flex-wrap:wrap;`
Each link: `padding:8px 12px; font-family:'Bebas Neue'; font-size:16px; letter-spacing:0.05em;
text-decoration:none; border-bottom:2px solid <transparent|#ffeb3b>; color:<#ffffff|#ffeb3b>;`
hover `color:#ffeb3b`.

| Label           | Route              | `active` key |
| --------------- | ------------------ | ------------ |
| `STARTSEITE`    | `/`                | `start`      |
| `APPS & SPIELE` | `/apps-und-spiele` | `projekte`   |
| `UNTERSTÜTZEN`  | `/unterstuetzen`   | `support`    |
| `SOCIALS`       | `/socials`         | `socials`    |

(`legal` is a fifth `active` value with no matching nav item — used by Impressum/Datenschutz.)

**Language switch**: `display:flex; gap:8px; align-items:center; font-family:'Bebas Neue';
font-size:14px; letter-spacing:0.05em; border-left:1px solid #525252; padding-left:16px;`
`DE` `color:#ffeb3b`, separator `/` `color:#525252`, `EN` `color:#ffffff` hover `#ffeb3b`.
Both hrefs are `#` in the prototype → wire to i18n routing (`/en/...`).

Mobile: prototype only wraps (`flex-wrap`). A real burger menu must be added — **not in the design**.

---

## 8. `SiteFooter` (shared)

```
<footer> background:#171717; color:#ffffff; font-family:'Barlow';
  <div> max-width:1152px; margin:0 auto; padding:48px 24px 0;
        display:grid; grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr)); gap:32px;
```

Columns: 4 at ≥1024px viewport, 3 at ≥772px, 2 at ≥520px, else 1.

1. **Brand column** — `display:flex; flex-direction:column; gap:12px;`
   - logo row `display:flex; align-items:center; gap:10px;`, `<img src="assets/fox-head.png" alt="" style="width:40px;height:40px;object-fit:contain;">`, wordmark identical to header (Bebas 24px).
   - `<p style="margin:0; font-size:14px; line-height:1.625; color:#d4d4d4; max-width:320px;">Spiele und Apps — mit Liebe in Stuttgart entwickelt. Kostenlos und Open Source.</p>`
2. **SEITEN** — `display:flex; flex-direction:column; gap:10px;`; title `<span>` Bebas 16px `letter-spacing:0.05em; color:#ffeb3b`; links `color:#ffffff; font-size:14px; text-decoration:none;` hover `#ffeb3b`: `Startseite` → `/`, `Apps & Spiele` → `/apps-und-spiele`, `Unterstützen` → `/unterstuetzen`, `Socials` → `/socials`.
3. **RECHTLICHES** — `Impressum` → `/impressum`, `Datenschutz` → `/datenschutz`.
4. **FOLGE UNS** — icon row `display:flex; gap:12px;`; each `a` `color:#ffffff` hover `#ffeb3b`,
   `title="GitHub|Discord|YouTube"`, `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">`.
   Hrefs: `https://github.com/BoundfoxStudios`, `https://discord.gg/tHqNzMT`, `https://youtube.com/c/boundfox`.

Bottom bar:

```
max-width:1152px; margin:24px auto 0; padding:16px 24px;
border-top:1px solid #525252;
display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap;
spans: font-size:12px; color:#a3a3a3;
```

Left: `© 2026 Boundfox Studios. Alle Rechte vorbehalten.` — Right: `Deutsch · English`.

---

## 9. Assets

| Asset                           | Used by                        | Notes                                                                                                                                                                                                                                                               |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/fox-head.png`           | header (32×32), footer (40×40) | transparent PNG, `object-fit:contain`. Brand rule: full-colour mark only, only on white or dark — never on the yellow/gradient band.                                                                                                                                |
| `assets/flugwacht-wordmark.svg` | §3.5 card 2                    | `viewBox="0 0 231.18 42"`, rendered `width:56%; max-width:300px`                                                                                                                                                                                                    |
| `assets/mat-dark.svg`           | §3.5 card 3                    | `viewBox="0 0 600 600"`, dark icon on light surface, rendered 112×112                                                                                                                                                                                               |
| `assets/mat-light.svg`          | —                              | light counterpart, unused on this page                                                                                                                                                                                                                              |
| `assets/flugwacht-radar.svg`    | —                              | icon variant, unused on this page                                                                                                                                                                                                                                   |
| `assets/logo-lockup.png`        | —                              | reference only                                                                                                                                                                                                                                                      |
| `_ds/…/assets/fonts/Tahu.ttf`   | —                              | script accent font, not used on this page                                                                                                                                                                                                                           |
| **Bug-A-Ball key art**          | §3.5 card 4                    | **MISSING.** `assets/bug-a-ball.svg` exists but is broken (styles lost on export — `<style>`-based `.cls-*` classes). Source a PNG/JPG (e.g. `bugaball_Thumbnail.png` from the old site) and render `object-fit:cover`. Same asset is needed on `/apps-und-spiele`. |

Icons: no icon library needed for this page — all glyphs are the five inline brand SVGs (§6.7).

---

## 10. Discrepancies & open decisions

1. **Header height/padding** — handoff README says “Höhe 64px, Padding `0 24px`”; the HTML uses
   `padding:8px 24px; min-height:48px` (same 64px total). Follow the HTML.
2. **Dark support band background** — README says `#171717`; the token `--surface-inverse` resolves to
   `#404040` (`--bfs-gray-700`), which is what the prototype renders. Irrelevant while gradient is the
   default, but note it if the dark variant is ever enabled.
3. **DS `Card` footer font-size** — the component sets no `font-size`, so the footer inherits 16px;
   the README specifies 12px. Implement **12px** (`text-xs`, colour `#525252` reads correct against the
   `#f5f5f5` strip) and treat it as an intentional fix.
4. **Gradient chip hover lift** — README mentions “Gradient-Pills heben sich 1px per translateY beim
   Hover”; the HTML has no transform, only a hover rule that _cancels_ the link colour change.
   Decide: keep it static (HTML) or add `hover:-translate-y-px` (README).
5. **Section-head bottom margin differs** — 32px in §3.2 vs 28px in §5.2. Keep both; do not unify.
6. **`showGithub` / `supportVariant` prototype props** — not real features. Ship gradient band always;
   the GitHub section is conditional on the SSR data fetch succeeding.
7. **GitHub cards are static `<div>`s** in the design. If they should link to the repo, that is a new
   interaction (add the card-hover border `#e5e5e5 → #ffc107` used elsewhere for clickable tiles).
8. **External links** carry no `target`/`rel` in the prototype — add `target="_blank" rel="noopener noreferrer"`.
9. **Language switch** points at `#`. Needs the real i18n routing decision (`/en` prefix vs Angular i18n builds).
10. **Accessibility gaps to close in the rebuild**: `alt=""` on the footer logo is correct (decorative),
    but the Bug-A-Ball image needs a real `alt`; the arrow `→` inside link labels should stay inside the
    accessible name or be marked `aria-hidden`; the graph-paper wordmark “LEHRGRAPHT” is decorative text
    duplicated by the `h2` — consider `aria-hidden="true"` on it.
11. **`text-wrap:pretty`** is used on the two lead paragraphs (§3.2, §4.1) — keep it (`text-pretty`).

---

## 11. i18n key map (kebab-case)

Namespace `home.*` for page-local copy, `common.*` for strings shared with other pages,
`header.*` / `footer.*` for the shared shell.

### 11.1 Section A — Projekte

| Key                                    | German copy (verbatim)                                                                                                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home.projects.kicker`                 | `Projekte` (rendered uppercase via CSS)                                                                                                                                             |
| `home.projects.title`                  | `APPS & SPIELE`                                                                                                                                                                     |
| `home.projects.subtitle`               | `Woran wir gerade bauen — und was du schon heute spielen und benutzen kannst. Kostenlos und Open Source.`                                                                           |
| `home.projects.all-link`               | `ALLE PROJEKTE →`                                                                                                                                                                   |
| `home.projects.lehrgrapht.wordmark`    | `LEHRGRAPHT` (decorative art text in the media area)                                                                                                                                |
| `home.projects.lehrgrapht.title`       | `LEHRGRAPHT`                                                                                                                                                                        |
| `home.projects.lehrgrapht.description` | `Kostenfreies, quelloffenes Word-AddIn für Lehrkräfte: maßstabsgetreue Plots, passgenau auf 5×5-mm-Karopapier — ideal zum Nachmessen.`                                              |
| `home.projects.lehrgrapht.platforms`   | `Word für Windows, macOS & iPad`                                                                                                                                                    |
| `home.projects.lehrgrapht.link`        | `Zur Website →`                                                                                                                                                                     |
| `home.projects.flugwacht.image-alt`    | `Flugwacht Wortmarke`                                                                                                                                                               |
| `home.projects.flugwacht.title`        | `FLUGWACHT`                                                                                                                                                                         |
| `home.projects.flugwacht.description`  | `Bewusst minimaler Flug-Tracker: Flugnummer eintragen und am Reisetag live auf der Karte verfolgen, wo der Flieger gerade ist — ganz ohne Konto.`                                   |
| `home.projects.flugwacht.platforms`    | `iOS & Android`                                                                                                                                                                     |
| `home.projects.flugwacht.link`         | `Zum Repository →`                                                                                                                                                                  |
| `home.projects.mat.image-alt`          | `mat App-Icon`                                                                                                                                                                      |
| `home.projects.mat.title`              | `MAT`                                                                                                                                                                               |
| `home.projects.mat.description`        | `Markdown-Vorschau direkt aus dem Terminal — gerendert wie auf GitHub, ohne Server und ohne Konfiguration. So beiläufig wie {cat}.` (`{cat}` = monospace `<span>` containing `cat`) |
| `home.projects.mat.platforms`          | `macOS, Linux & Windows`                                                                                                                                                            |
| `home.projects.mat.link`               | `Zum Repository →`                                                                                                                                                                  |
| `home.projects.bug-a-ball.image-alt`   | _(new — design has only the placeholder “Bug-A-Ball Key-Art hier ablegen”)_                                                                                                         |
| `home.projects.bug-a-ball.title`       | `BUG-A-BALL`                                                                                                                                                                        |
| `home.projects.bug-a-ball.description` | `Rolle dich durch Level und Welten, weiche Hindernissen aus, schalte exklusive Skins frei — und zeig auf der Bestenliste, wer hier der Profi ist.`                                  |
| `home.projects.bug-a-ball.platforms`   | `iOS & Android`                                                                                                                                                                     |
| `home.projects.bug-a-ball.link`        | `Zur Website →`                                                                                                                                                                     |

### 11.2 Shared labels

| Key                           | German copy      |
| ----------------------------- | ---------------- |
| `common.project-type.app`     | `App`            |
| `common.project-type.game`    | `Spiel`          |
| `common.badge.available`      | `Verfügbar`      |
| `common.badge.in-development` | `In Entwicklung` |
| `common.social.github`        | `GITHUB`         |
| `common.social.discord`       | `DISCORD`        |
| `common.social.youtube`       | `YOUTUBE`        |
| `common.social.ko-fi`         | `KO-FI`          |
| `common.social.patreon`       | `PATREON`        |

### 11.3 Section B — Unterstützen (gradient default)

| Key                             | German copy                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `home.support.title`            | `UNTERSTÜTZE UNS`                                                                                                         |
| `home.support.text`             | `Unsere Projekte sind kostenlos und Open Source. Wenn du magst, gib etwas zurück — vieles davon kostet dich keinen Cent.` |
| `home.support.all-options-link` | `Alle Möglichkeiten ansehen →`                                                                                            |

Dark-variant-only (not shipped by default): `home.support.kicker` = `Community`,
`home.support.cta` = `Alle Möglichkeiten`, `home.support.tiles.github.subtitle` = `Code, Issues & Stars`,
`…discord.subtitle` = `Community beitreten`, `…youtube.subtitle` = `Abonnieren & schauen`,
`…ko-fi.subtitle` = `Einmalig spendieren`, `…patreon.subtitle` = `Monatlich unterstützen`.

### 11.4 Section C — GitHub

| Key                                 | German copy                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `home.github.kicker`                | `Open Source`                                                                                                                             |
| `home.github.title`                 | `ZULETZT AUF GITHUB`                                                                                                                      |
| `home.github.all-repositories-link` | `ALLE REPOSITORIES →`                                                                                                                     |
| `home.github.card.updated`          | `aktualisiert {relativeTime}` — composed with `Intl.RelativeTimeFormat('de')`; design placeholders read `vor 3 Tagen`, `gestern`, `heute` |

Placeholder card copy (`v1.6.2 · aktualisiert vor 3 Tagen`, the three repo descriptions, the eyebrows
`TypeScript`, `TypeScript · Bun`, `Dart · Flutter`) comes from the GitHub API at build/SSR time and is
**not** translatable content.

### 11.5 Shell (shared with all pages)

`header.nav.home` = `STARTSEITE` · `header.nav.apps-and-games` = `APPS & SPIELE` ·
`header.nav.support` = `UNTERSTÜTZEN` · `header.nav.socials` = `SOCIALS` ·
`header.logo.alt` = `Boundfox Studios` · `header.brand.first` = `BOUNDFOX` ·
`header.brand.second` = `STUDIOS` · `header.language.de` = `DE` · `header.language.en` = `EN`

`footer.tagline` = `Spiele und Apps — mit Liebe in Stuttgart entwickelt. Kostenlos und Open Source.` ·
`footer.pages.title` = `SEITEN` · `footer.pages.home` = `Startseite` ·
`footer.pages.apps-and-games` = `Apps & Spiele` · `footer.pages.support` = `Unterstützen` ·
`footer.pages.socials` = `Socials` · `footer.legal.title` = `RECHTLICHES` ·
`footer.legal.imprint` = `Impressum` · `footer.legal.privacy` = `Datenschutz` ·
`footer.social.title` = `FOLGE UNS` · `footer.social.github-title` = `GitHub` ·
`footer.social.discord-title` = `Discord` · `footer.social.youtube-title` = `YouTube` ·
`footer.copyright` = `© 2026 Boundfox Studios. Alle Rechte vorbehalten.` ·
`footer.languages` = `Deutsch · English`

---

## 12. Complete link inventory

| #   | Label                          | Target (production route)                      | Prototype href            | External |
| --- | ------------------------------ | ---------------------------------------------- | ------------------------- | -------- |
| 1   | Logo (header)                  | `/`                                            | `Startseite.dc.html`      | no       |
| 2   | `STARTSEITE`                   | `/`                                            | `Startseite.dc.html`      | no       |
| 3   | `APPS & SPIELE`                | `/apps-und-spiele`                             | `Spiele und Apps.dc.html` | no       |
| 4   | `UNTERSTÜTZEN`                 | `/unterstuetzen`                               | `Unterstuetzen.dc.html`   | no       |
| 5   | `SOCIALS`                      | `/socials`                                     | `Socials.dc.html`         | no       |
| 6   | `DE`                           | i18n switch (TBD)                              | `#`                       | no       |
| 7   | `EN`                           | i18n switch (TBD)                              | `#`                       | no       |
| 8   | `ALLE PROJEKTE →`              | `/apps-und-spiele`                             | `Spiele und Apps.dc.html` | no       |
| 9   | `Zur Website →` (LehrGrapht)   | `https://lehrgrapht.de`                        | same                      | yes      |
| 10  | `Zum Repository →` (Flugwacht) | `https://github.com/BoundfoxStudios/flugwacht` | same                      | yes      |
| 11  | `Zum Repository →` (MAT)       | `https://github.com/BoundfoxStudios/mat`       | same                      | yes      |
| 12  | `Zur Website →` (Bug-A-Ball)   | `https://bug-a-ball.com`                       | same                      | yes      |
| 13  | `GITHUB` chip                  | `https://github.com/BoundfoxStudios`           | same                      | yes      |
| 14  | `DISCORD` chip                 | `https://discord.gg/tHqNzMT`                   | same                      | yes      |
| 15  | `YOUTUBE` chip                 | `https://youtube.com/c/boundfox`               | same                      | yes      |
| 16  | `KO-FI` chip                   | `https://ko-fi.com/boundfoxstudios`            | same                      | yes      |
| 17  | `PATREON` chip                 | `https://www.patreon.com/boundfoxstudios`      | same                      | yes      |
| 18  | `Alle Möglichkeiten ansehen →` | `/unterstuetzen`                               | `Unterstuetzen.dc.html`   | no       |
| 19  | `ALLE REPOSITORIES →`          | `https://github.com/BoundfoxStudios`           | same                      | yes      |
| 20  | `Startseite` (footer)          | `/`                                            | `Startseite.dc.html`      | no       |
| 21  | `Apps & Spiele` (footer)       | `/apps-und-spiele`                             | `Spiele und Apps.dc.html` | no       |
| 22  | `Unterstützen` (footer)        | `/unterstuetzen`                               | `Unterstuetzen.dc.html`   | no       |
| 23  | `Socials` (footer)             | `/socials`                                     | `Socials.dc.html`         | no       |
| 24  | `Impressum` (footer)           | `/impressum`                                   | `Impressum.dc.html`       | no       |
| 25  | `Datenschutz` (footer)         | `/datenschutz`                                 | `Datenschutz.dc.html`     | no       |
| 26  | GitHub icon (footer)           | `https://github.com/BoundfoxStudios`           | same                      | yes      |
| 27  | Discord icon (footer)          | `https://discord.gg/tHqNzMT`                   | same                      | yes      |
| 28  | YouTube icon (footer)          | `https://youtube.com/c/boundfox`               | same                      | yes      |

---

## 13. Motion & interaction summary

- Only colour / border-colour transitions: `150ms cubic-bezier(.4,0,.2,1)` → `transition-colors duration-150 ease-in-out`.
- Text links: `#a16207` → hover `#ffa726`, never underlined (exception: `Alle Möglichkeiten ansehen →` is permanently underlined and stays `#171717`, hover `#404040`).
- Nav / footer links on dark: `#ffffff` → hover `#ffeb3b`.
- Clickable tiles (dark support variant): border `#525252` → hover `#ffc107`.
- Primary button: `#ffc107` → hover `#ffa726`; active +1px translateY.
- Project teaser cards: **no** hover state, **not** clickable as a whole.
- No scaling, no bounce, no blur/glass effects.
