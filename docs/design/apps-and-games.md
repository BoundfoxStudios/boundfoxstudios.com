# Implementation Reference — Page "Apps & Spiele"

Source design: `design_handoff_website_redesign/Spiele und Apps.dc.html`
Target route: `/apps-und-spiele` · Nav label `APPS & SPIELE` · Header prop `active="projekte"`
Target stack: Angular (SSR) + Tailwind v4

> All values below are read verbatim from the design file's inline styles. Where the file uses a
> CSS variable, the resolved literal value is given in brackets. Nothing here is inferred.

---

## 1. Token Resolution Table

Every `var(--…)` used on this page, resolved from `_ds/boundfox-studios-design-system-0747e2df-62fc-4fe1-bbd4-f0e974f1e1a3/tokens/*.css`.

### 1.1 Colors (`tokens/colors.css`)

| DS token           | Resolves to      | Literal   | Tailwind v4 `@theme` name             | Used on this page for                                            |
| ------------------ | ---------------- | --------- | ------------------------------------- | ---------------------------------------------------------------- |
| `--bfs-yellow`     | —                | `#ffeb3b` | `--color-yellow`                      | (not used in page body; header/footer only)                      |
| `--bfs-amber`      | —                | `#ffc107` | `--color-amber`                       | Badge `amber` bg, CTA button bg                                  |
| `--bfs-orange`     | —                | `#ffa726` | `--color-orange`                      | kicker text, link hover, CTA hover                               |
| `--bfs-ink`        | —                | `#171717` | `--color-neutral-900`                 | "LEHRGRAPHT" grid-paper wordmark, headings, badge text, CTA text |
| `--bfs-gray-700`   | —                | `#404040` | `--color-neutral-700`                 | body text (inherited from `body`)                                |
| `--bfs-gray-600`   | —                | `#525252` | `--color-neutral-600`                 | platform meta lines                                              |
| `--bfs-gray-400`   | —                | `#a3a3a3` | `--color-neutral-400`                 | Badge `outline` border                                           |
| `--bfs-gray-300`   | —                | `#d4d4d4` | `--color-neutral-300`                 | (footer only)                                                    |
| `--bfs-gray-200`   | —                | `#e5e5e5` | `--color-neutral-200`                 | card borders, section rules, grid-paper lines                    |
| `--bfs-gray-100`   | —                | `#f5f5f5` | `--color-neutral-100`                 | media surfaces (MAT, Flugwacht, key-art fallback)                |
| `--bfs-white`      | —                | `#ffffff` | `--color-white`                       | page + card surface                                              |
| `--surface-page`   | `--bfs-white`    | `#ffffff` |                                       | `body` background                                                |
| `--surface-card`   | `--bfs-white`    | `#ffffff` |                                       | all `<article>` backgrounds                                      |
| `--surface-subtle` | `--bfs-gray-100` | `#f5f5f5` |                                       | media panels of MAT / Flugwacht / Bug-A-Ball                     |
| `--text-body`      | `--bfs-gray-700` | `#404040` |                                       | `body` color → all `<p>`                                         |
| `--text-heading`   | `--bfs-ink`      | `#171717` |                                       | h1, h2, h3, Badge `outline` text                                 |
| `--text-muted`     | `--bfs-gray-600` | `#525252` |                                       | platform/meta `<span>`                                           |
| `--text-on-accent` | `--bfs-ink`      | `#171717` |                                       | CTA button label (also on hover)                                 |
| `--accent`         | `--bfs-amber`    | `#ffc107` |                                       | CTA button background                                            |
| `--accent-strong`  | `--bfs-orange`   | `#ffa726` |                                       | kicker color, `a:hover`, CTA hover bg                            |
| `--link`           | —                | `#a16207` | `--color-link` (= stock `yellow-700`) | all text links                                                   |
| `--border-default` | `--bfs-gray-200` | `#e5e5e5` |                                       | card border 1px, section rule                                    |
| `--border-strong`  | `--bfs-gray-400` | `#a3a3a3` |                                       | Badge `outline` border                                           |

### 1.2 Typography (`tokens/typography.css`)

| Token                | Literal                    | Tailwind equivalent                                                                                    |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `--font-display`     | `'Bebas Neue', sans-serif` | `--font-display`                                                                                       |
| `--font-body`        | `'Barlow', sans-serif`     | `--font-sans`                                                                                          |
| `--font-script`      | `'Tahu', cursive`          | `--font-script` — **not used on this page**                                                            |
| `--text-xs`          | `12px`                     | `text-xs`                                                                                              |
| `--text-sm`          | `14px`                     | `text-sm`                                                                                              |
| `--text-base`        | `16px`                     | `text-base`                                                                                            |
| `--text-lg`          | `18px`                     | `text-lg`                                                                                              |
| `--display-sm`       | `24px`                     | `text-2xl`                                                                                             |
| `--display-md`       | `36px`                     | `text-4xl`                                                                                             |
| `--display-lg`       | `60px`                     | `text-6xl` (only as clamp ceiling of the h1)                                                           |
| `--leading-tight`    | `1`                        | `leading-none`                                                                                         |
| `--leading-body`     | `1.625`                    | `leading-relaxed`                                                                                      |
| `--tracking-display` | `0.025em`                  | `tracking-wide`                                                                                        |
| `--tracking-caps`    | `0.1em`                    | `tracking-widest` — **note:** the page hard-codes `0.1em` on kickers, it does not reference this token |

Font loading (`tokens/fonts.css`):

```
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
```

Bebas Neue: single weight 400. Barlow: 400/500/600/700 + italic 400. Only 400 and 700 are used on this page.

### 1.3 Spacing / Radius (`tokens/spacing.css`)

| Token             | Literal                                       | Tailwind                               |
| ----------------- | --------------------------------------------- | -------------------------------------- |
| `--space-1..9`    | `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96` px | `1 / 2 / 3 / 4 / 6 / 8 / 12 / 16 / 24` |
| `--space-5`       | `24px`                                        | `p-6` — card body padding              |
| `--space-6`       | `32px`                                        | `p-8` — feature-card body padding      |
| `--radius-sm`     | `4px`                                         | `rounded`                              |
| `--radius-md`     | `8px`                                         | `rounded-lg` — CTA button              |
| `--radius-lg`     | `12px`                                        | `rounded-xl` — all cards               |
| `--radius-pill`   | `9999px`                                      | `rounded-full` — Badge                 |
| `--container-max` | `1152px`                                      | `max-w-6xl`                            |

### 1.4 Effects (`tokens/effects.css`)

| Token             | Literal                                                                      | Tailwind                    |
| ----------------- | ---------------------------------------------------------------------------- | --------------------------- |
| `--shadow-card`   | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`           | `shadow-md`                 |
| `--shadow-raised` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`         | `shadow-lg` (not used here) |
| `--shadow-accent` | `0 10px 15px -3px rgb(255 193 7 / 0.3), 0 4px 6px -4px rgb(255 193 7 / 0.3)` | `shadow-lg shadow-amber/30` |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)`                                                    | `ease-in-out`               |
| `--dur-fast`      | `150ms`                                                                      | `duration-150`              |

### 1.5 Tailwind v4 `@theme` (paste into `projects/website/src/styles.css`)

```css
@import 'tailwindcss';

@theme {
  --color-*: initial;
  --color-white: #ffffff;
  --color-yellow: #ffeb3b;
  --color-amber: #ffc107;
  --color-orange: #ffa726;
  --color-link: #a16207;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-900: #171717;

  --font-display: 'Bebas Neue', sans-serif;
  --font-script: 'Tahu', cursive;
  --font-sans: 'Barlow', sans-serif;

  --shadow-accent: 0 10px 15px -3px rgb(255 193 7 / 0.3), 0 4px 6px -4px rgb(255 193 7 / 0.3);
}
```

---

## 2. Global / Page-Level Styles

From the `<helmet>` `<style>` block of the design file (applies to every page):

```css
body {
  margin: 0;
  background: #ffffff; /* --surface-page */
  color: #404040; /* --text-body */
  font-family: 'Barlow', sans-serif; /* --font-body */
}
a {
  transition: color 150ms ease-in-out;
  color: #a16207; /* --link */
  text-decoration: none;
}
a:hover {
  color: #ffa726;
} /* --accent-strong */
```

Page shell (`<div data-screen-label="Spiele und Apps">`):

```css
min-height: 100vh;
display: flex;
flex-direction: column;
```

→ `<main style="flex:1">` between `<app-site-header>` and `<app-site-footer>`; the footer is pushed to the viewport bottom on short pages.

Tailwind: `class="flex min-h-screen flex-col"` on the shell, `class="flex-1"` on `<main>`.

**Note on link color inheritance:** every `<a>` on this page except the CTA button inherits `#a16207` / hover `#ffa726` from the global rule. Do **not** rely on Tailwind's `@layer base` reset removing it — declare an explicit base rule or a `TextLink` component.

---

## 3. Section-by-Section Layout Specification

Vertical stack inside `<main>`:

| #   | Section   | `max-width` | `margin` | `padding` (T R B L) |
| --- | --------- | ----------- | -------- | ------------------- |
| 3.1 | Page head | `1152px`    | `0 auto` | `64px 24px 8px`     |
| 3.2 | APPS      | `1152px`    | `0 auto` | `48px 24px 16px`    |
| 3.3 | SPIELE    | `1152px`    | `0 auto` | `48px 24px 72px`    |

Resulting visual gaps: head → APPS = `8 + 48 = 56px`; APPS grid → SPIELE heading = `16 + 48 = 64px`; SPIELE card → footer = `72px`.

Tailwind: `mx-auto max-w-6xl px-6` on every section; then `pt-16 pb-2` / `pt-12 pb-4` / `pt-12 pb-18`.
`pb-18` = 72px (Tailwind v4 continuous spacing scale, `18 × 0.25rem`).

Content box width at max container: `1152 − 24 − 24 = 1104px`.

---

### 3.1 Section — Page Head

```html
<section style="max-width:var(--container-max);margin:0 auto;padding:64px 24px 8px;"></section>
```

**a) Kicker `<div>`**

```css
font-size: 12px;
font-weight: 700;
letter-spacing: 0.1em;
text-transform: uppercase;
color: #ffa726; /* --accent-strong */
margin-bottom: 8px;
```

Source text (sentence case in markup, uppercased by CSS): `Projekte`
Tailwind: `mb-2 text-xs font-bold uppercase tracking-widest text-orange`

**b) `<h1>`**

```css
margin: 0;
font-family: 'Bebas Neue', sans-serif;
font-weight: 400; /* explicit — resets UA bold */
font-size: clamp(40px, 5.5vw, 60px);
line-height: 1; /* --leading-tight */
letter-spacing: 0.025em; /* --tracking-display */
color: #171717; /* --text-heading */
```

Text: `APPS & SPIELE` (literal uppercase in the markup, **not** `text-transform`).
Clamp breakpoints: `< 727px` viewport → 40px · `727–1091px` → `5.5vw` · `> 1091px` → 60px.
Tailwind: `m-0 font-display text-[clamp(40px,5.5vw,60px)] font-normal leading-none tracking-wide text-neutral-900`

**c) Intro `<p>`**

```css
margin: 12px 0 0;
font-size: 18px; /* --text-lg */
line-height: 1.625; /* --leading-body */
max-width: 560px;
text-wrap: pretty;
```

Color inherited `#404040`.
Text: `Stöber doch einmal durch unsere Projekte — es ist sicher etwas für dich dabei. Alles kostenlos, vieles Open Source.`
Tailwind: `mt-3 max-w-[560px] text-lg leading-relaxed text-pretty`

---

### 3.2 Section — APPS

```html
<section style="max-width:var(--container-max);margin:0 auto;padding:48px 24px 16px;"></section>
```

**a) Section-title row** (identical markup in 3.3)

```css
display: flex;
align-items: center;
gap: 16px;
margin-bottom: 24px;
```

- `<h2>`: `margin:0; font-family:'Bebas Neue'; font-weight:400; font-size:24px; line-height:1; letter-spacing:0.025em; color:#171717;` — text `APPS`
- Rule `<div>`: `flex:1; height:1px; background:#e5e5e5;`

Tailwind: `mb-6 flex items-center gap-4` / h2 `m-0 font-display text-2xl font-normal leading-none tracking-wide text-neutral-900` / rule `h-px flex-1 bg-neutral-200`

**b) Card grid**

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
gap: 24px;
```

Tailwind: `grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))]`

Computed column behaviour (content width = `min(viewport, 1152px) − 48px`):

| Content width | Viewport  | Columns | Card width                              |
| ------------- | --------- | ------- | --------------------------------------- |
| ≥ 948px       | ≥ 996px   | 3       | `(w − 48) / 3` — 352px at max container |
| 624–947px     | 672–995px | 2       | `(w − 24) / 2`                          |
| < 624px       | < 672px   | 1       | full width                              |

**c) Card shell** — identical on all three `<article>` elements:

```css
background: #ffffff; /* --surface-card */
border: 1px solid #e5e5e5; /* --border-default */
border-radius: 12px; /* --radius-lg */
box-shadow:
  0 4px 6px -1px rgb(0 0 0 / 0.1),
  0 2px 4px -2px rgb(0 0 0 / 0.1); /* shadow-md */
overflow: hidden;
display: flex;
flex-direction: column;
```

Tailwind: `flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md`
No hover state on these cards (per README: project cards on this page are **not** wholly clickable — only the inline links are).

**d) Media panel — height `180px` on all three, but three different fills**

| Card       | Media CSS                                                                                                                                                                                                                                                                         | Content                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| LehrGrapht | `height:180px; display:flex; align-items:center; justify-content:center; background-color:#ffffff; background-image:linear-gradient(#e5e5e5 1px,transparent 1px),linear-gradient(90deg,#e5e5e5 1px,transparent 1px); background-size:20px 20px; border-bottom:1px solid #e5e5e5;` | `<span>` — see below                                                                                     |
| MAT        | `height:180px; display:flex; align-items:center; justify-content:center; background:#f5f5f5;`                                                                                                                                                                                     | `<img src="assets/mat-dark.svg" alt="mat App-Icon" style="width:104px;height:104px;">`                   |
| Flugwacht  | `height:180px; display:flex; align-items:center; justify-content:center; background:#f5f5f5;`                                                                                                                                                                                     | `<img src="assets/flugwacht-wordmark.svg" alt="Flugwacht Wortmarke" style="width:62%;max-width:280px;">` |

LehrGrapht wordmark `<span>`:

```css
font-family: 'Bebas Neue', sans-serif;
font-size: 38px;
letter-spacing: 0.025em;
color: #171717; /* --bfs-ink */
```

Text: `LEHRGRAPHT`

> **Deliberate asymmetry to preserve:** only the LehrGrapht media has `border-bottom: 1px solid #e5e5e5` — it is white-on-white and needs the separator; the `#f5f5f5` panels do not. Keep it.

Tailwind for the grid-paper panel:

```
flex h-[180px] items-center justify-center border-b border-neutral-200 bg-white
bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)]
bg-[size:20px_20px]
```

**e) Card body** — identical on all three:

```css
padding: 24px; /* --space-5 */
flex: 1;
display: flex;
flex-direction: column;
gap: 8px;
```

Tailwind: `flex flex-1 flex-col gap-2 p-6`

Children, in order:

1. **Meta row** — `display:flex; align-items:center; gap:10px;`
   - Kicker `<span>`: `font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#ffa726;`
   - `<Badge>` — variant per card (see §5.3)
     Tailwind: `flex items-center gap-2.5`
2. **`<h3>`**: `margin:0; font-family:'Bebas Neue'; font-weight:400; font-size:24px; line-height:1; letter-spacing:0.025em; color:#171717;`
3. **`<p>`**: `margin:0; font-size:14px; line-height:1.625;` (color inherited `#404040`)
4. **Platform `<span>`**: `font-size:12px; color:#525252;` (`--text-muted`)
5. **Link row**: `margin-top:auto; padding-top:12px; display:flex; gap:16px; flex-wrap:wrap;`
   Links: `font-size:14px; font-weight:700;` + inherited `color:#a16207`, `hover:#ffa726`, no underline, `transition: color 150ms ease-in-out`.
   Tailwind row: `mt-auto flex flex-wrap gap-4 pt-3` · link: `text-sm font-bold text-link transition-colors duration-150 ease-in-out hover:text-orange`

**f) Card contents (in DOM order — do not reorder)**

**Card 1 — LEHRGRAPHT**

- Kicker: `Word-AddIn`
- Badge: `variant="amber"` → `Verfügbar`
- Title: `LEHRGRAPHT`
- Body: `Maßstabsgetreue Plots für Lehrkräfte, passgenau auf 5×5-mm-Karopapier: Funktionen, Punkte, Flächen, Schrägbilder, Spiegelungen — und mit einem Schalter vom Arbeitsblatt zum Lösungsblatt.`
  _(`×` = U+00D7 multiplication sign, `—` = U+2014 em dash)_
- Platform: `Word für Windows, macOS & iPad · kostenfrei · Open Source` (`·` = U+00B7)
- Links: `Zur Website →` → `https://lehrgrapht.de` · `Source Code →` → `https://github.com/BoundfoxStudios/lehrgrapht`

**Card 2 — MAT**

- Kicker: `CLI-Tool`
- Badge: `variant="outline"` → `In Entwicklung`
- Title: `MAT`
- Body: `Markdown-Vorschau direkt aus dem Terminal — gerendert wie auf GitHub, inklusive Mermaid, KaTeX und Syntax-Highlighting. Kein Server, keine Konfiguration: so beiläufig wie cat.`
  **The trailing word `cat` is wrapped in `<span style="font-family:monospace;">cat</span>`** — the paragraph is rich text, not a plain string. See §4 note on i18n.
- Platform: `macOS, Linux & Windows · Open Source`
- Links: `Zum Repository →` → `https://github.com/BoundfoxStudios/mat`

**Card 3 — FLUGWACHT**

- Kicker: `Mobile App`
- Badge: `variant="outline"` → `In Entwicklung`
- Title: `FLUGWACHT`
- Body: `Bewusst minimaler Flug-Tracker für einzelne Flüge: Flugnummer und Datum eintragen, am Reisetag live auf der Karte verfolgen — mit Ankunftszeit in beiden Zeitzonen. Ohne Konto, alles bleibt auf deinem Gerät.`
- Platform: `iOS & Android · Open Source`
- Links: `Zum Repository →` → `https://github.com/BoundfoxStudios/flugwacht`

---

### 3.3 Section — SPIELE

```html
<section style="max-width:var(--container-max);margin:0 auto;padding:48px 24px 72px;"></section>
```

**a) Section-title row** — identical spec to §3.2a, text `SPIELE`.

**b) Feature card `<article>`**

```css
background: #ffffff;
border: 1px solid #e5e5e5;
border-radius: 12px;
box-shadow:
  0 4px 6px -1px rgb(0 0 0 / 0.1),
  0 2px 4px -2px rgb(0 0 0 / 0.1);
overflow: hidden;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
```

**No `gap`** — the two columns butt directly against each other.
Tailwind: `grid overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]`

Column behaviour (card outer width = content width; inner track area = width − 2px borders):

| Content width | Viewport | Columns                      | Column width                           |
| ------------- | -------- | ---------------------------- | -------------------------------------- |
| ≥ 640px       | ≥ 688px  | 2                            | `(w − 2) / 2` — 551px at max container |
| < 640px       | < 688px  | 1 (media stacked above body) | full width                             |

**c) Media column (left)**

```css
min-height: 240px;
overflow: hidden;
background: #f5f5f5; /* --surface-subtle */
position: relative;
```

Inner image, `position:absolute; inset:0; width:100%; height:100%;` and **`object-fit: cover`** (README §2/§Assets).

In the design file this is a prototype drop target and carries **no real asset**:

```html
<image-slot
  id="bugaball-art-feature"
  shape="rect"
  placeholder="Bug-A-Ball Key-Art hier ablegen"
  style="position:absolute;inset:0;width:100%;height:100%;"
></image-slot>
```

→ Replace with `<img class="absolute inset-0 h-full w-full object-cover" src="…" alt="…">`. See §7 (missing asset).

The media column has **no** `border-right`; the two columns are separated only by the change of background (`#f5f5f5` vs `#ffffff`).

**d) Body column (right)**

```css
padding: 32px; /* --space-6 */
display: flex;
flex-direction: column;
gap: 10px;
align-items: flex-start;
```

Tailwind: `flex flex-col items-start gap-2.5 p-8`

Children in order:

1. **Meta row** — `display:flex; align-items:center; gap:10px;`
   - Kicker `<span>`: `12px / 700 / 0.1em / uppercase / #ffa726` — text `Spiel`
   - `<Badge variant="amber">Verfügbar</Badge>`
2. **`<h3>`**: `margin:0; font-family:'Bebas Neue'; font-weight:400; font-size:36px (--display-md); line-height:1; letter-spacing:0.025em; color:#171717;` — text `BUG-A-BALL`
   Tailwind: `m-0 font-display text-4xl font-normal leading-none tracking-wide text-neutral-900`
3. **`<p>`**: `margin:0; font-size:16px (--text-base); line-height:1.625; max-width:480px;`
   Text: `In Bug-A-Ball rollst du dich durch verschiedene Level und Welten, vorbei an kniffligen Hindernissen. Schalte exklusive Skins frei und zeig allen auf der Bestenliste, wer hier der Profi ist.`
   Tailwind: `m-0 max-w-[480px] text-base leading-relaxed`
4. **Platform `<span>`**: `font-size:14px (--text-sm); color:#525252;`
   Text: `Für iOS & Android — auf fast allen Geräten.`
   _(note: 14px here, whereas the small cards in §3.2 use 12px)_
5. **CTA `<a>`** — see §5.5.

---

## 4. Copy Inventory (verbatim German + proposed i18n keys)

Namespace `apps-and-games.*` (route `/apps-und-spiele`). Shared strings are lifted to `common.*`.

### 4.1 Page head

| Key                          | German (verbatim, source casing)                                                                                      | Notes                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `apps-and-games.hero.kicker` | `Projekte`                                                                                                            | rendered uppercase via CSS                       |
| `apps-and-games.hero.title`  | `APPS & SPIELE`                                                                                                       | literal caps in markup; `&` is `&amp;` in source |
| `apps-and-games.hero.intro`  | `Stöber doch einmal durch unsere Projekte — es ist sicher etwas für dich dabei. Alles kostenlos, vieles Open Source.` |                                                  |

### 4.2 Section titles

| Key                                  | German   |
| ------------------------------------ | -------- |
| `apps-and-games.apps.section-title`  | `APPS`   |
| `apps-and-games.games.section-title` | `SPIELE` |

### 4.3 App cards

| Key                                          | German                                                                                                                                                                                                           |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps-and-games.apps.lehrgrapht.kicker`      | `Word-AddIn`                                                                                                                                                                                                     |
| `apps-and-games.apps.lehrgrapht.title`       | `LEHRGRAPHT`                                                                                                                                                                                                     |
| `apps-and-games.apps.lehrgrapht.description` | `Maßstabsgetreue Plots für Lehrkräfte, passgenau auf 5×5-mm-Karopapier: Funktionen, Punkte, Flächen, Schrägbilder, Spiegelungen — und mit einem Schalter vom Arbeitsblatt zum Lösungsblatt.`                     |
| `apps-and-games.apps.lehrgrapht.platforms`   | `Word für Windows, macOS & iPad · kostenfrei · Open Source`                                                                                                                                                      |
| `apps-and-games.apps.mat.kicker`             | `CLI-Tool`                                                                                                                                                                                                       |
| `apps-and-games.apps.mat.title`              | `MAT`                                                                                                                                                                                                            |
| `apps-and-games.apps.mat.description`        | `Markdown-Vorschau direkt aus dem Terminal — gerendert wie auf GitHub, inklusive Mermaid, KaTeX und Syntax-Highlighting. Kein Server, keine Konfiguration: so beiläufig wie <code>cat</code>.`                   |
| `apps-and-games.apps.mat.platforms`          | `macOS, Linux & Windows · Open Source`                                                                                                                                                                           |
| `apps-and-games.apps.flugwacht.kicker`       | `Mobile App`                                                                                                                                                                                                     |
| `apps-and-games.apps.flugwacht.title`        | `FLUGWACHT`                                                                                                                                                                                                      |
| `apps-and-games.apps.flugwacht.description`  | `Bewusst minimaler Flug-Tracker für einzelne Flüge: Flugnummer und Datum eintragen, am Reisetag live auf der Karte verfolgen — mit Ankunftszeit in beiden Zeitzonen. Ohne Konto, alles bleibt auf deinem Gerät.` |
| `apps-and-games.apps.flugwacht.platforms`    | `iOS & Android · Open Source`                                                                                                                                                                                    |

**`apps-and-games.apps.mat.description` contains inline markup.** In the design it is
`… so beiläufig wie <span style="font-family:monospace;">cat</span>.`
With Angular `$localize` / xliff, keep the span in the template so it becomes a placeholder:

```html
<p i18n="@@apps-and-games.apps.mat.description">
  Markdown-Vorschau direkt aus dem Terminal — gerendert wie auf GitHub, inklusive Mermaid, KaTeX und
  Syntax-Highlighting. Kein Server, keine Konfiguration: so beiläufig wie
  <span class="font-mono">cat</span>.
</p>
```

### 4.4 Games feature card

| Key                                           | German                                                                                                                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps-and-games.games.bug-a-ball.kicker`      | `Spiel`                                                                                                                                                                                         |
| `apps-and-games.games.bug-a-ball.title`       | `BUG-A-BALL`                                                                                                                                                                                    |
| `apps-and-games.games.bug-a-ball.description` | `In Bug-A-Ball rollst du dich durch verschiedene Level und Welten, vorbei an kniffligen Hindernissen. Schalte exklusive Skins frei und zeig allen auf der Bestenliste, wer hier der Profi ist.` |
| `apps-and-games.games.bug-a-ball.platforms`   | `Für iOS & Android — auf fast allen Geräten.`                                                                                                                                                   |
| `apps-and-games.games.bug-a-ball.cta`         | `Zur Website`                                                                                                                                                                                   |

### 4.5 Shared strings

| Key                           | German             | Occurrences on this page   |
| ----------------------------- | ------------------ | -------------------------- |
| `common.badge.available`      | `Verfügbar`        | 2 (LehrGrapht, Bug-A-Ball) |
| `common.badge.in-development` | `In Entwicklung`   | 2 (MAT, Flugwacht)         |
| `common.link.website`         | `Zur Website →`    | 1 (LehrGrapht)             |
| `common.link.source-code`     | `Source Code →`    | 1 (LehrGrapht)             |
| `common.link.repository`      | `Zum Repository →` | 2 (MAT, Flugwacht)         |

The `→` (U+2192) is part of the link label in the design markup. Recommended: author the label without
the arrow and append `<span aria-hidden="true"> →</span>` so screen readers do not announce it and
translations stay clean.

### 4.6 Image alternative texts

| Key                                           | German                | Notes                                                                                                        |
| --------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps-and-games.apps.mat.icon-alt`            | `mat App-Icon`        | verbatim from design                                                                                         |
| `apps-and-games.apps.flugwacht.wordmark-alt`  | `Flugwacht Wortmarke` | verbatim from design                                                                                         |
| `apps-and-games.games.bug-a-ball.key-art-alt` | _(to author)_         | design has only the drop-slot placeholder `Bug-A-Ball Key-Art hier ablegen`, which is **not** shippable copy |

**Total distinct strings on this page: 30** (27 visible + 3 alt texts).
Of those, `LEHRGRAPHT`, `MAT`, `FLUGWACHT`, `BUG-A-BALL` are product names — keep them out of the
translator's editable set or mark them `translate="no"`.

Header/footer copy is not counted here — it belongs to the shared `SiteHeader` / `SiteFooter`
components (see §6).

---

## 5. Reusable Components

### 5.1 `PageHead` (kicker + h1 + intro)

Also used on Startseite, Unterstützen, Socials — extract.

| Prop            | Type              | Value on this page     |
| --------------- | ----------------- | ---------------------- |
| `kicker`        | string            | `Projekte`             |
| `title`         | string            | `APPS & SPIELE`        |
| `intro`         | string            | `Stöber doch einmal …` |
| `introMaxWidth` | px, default `560` | `560`                  |

Container padding differs per page — pass through or wrap externally. On this page: `pt-16 pb-2`.

### 5.2 `SectionHeading` (title + flex rule)

Used twice on this page, in the same shape on other pages.

| Prop    | Type   | Value             |
| ------- | ------ | ----------------- |
| `title` | string | `APPS` / `SPIELE` |

Fixed styling: `flex items-center gap-4 mb-6`; h2 `font-display text-2xl font-normal leading-none tracking-wide text-neutral-900`; rule `h-px flex-1 bg-neutral-200`.
Heading level should be settable (`headingLevel: 2 | 3`) since the page uses `h2` here.

### 5.3 `Badge` (from the DS bundle, `components/display/Badge.jsx`)

Base style (all variants):

```css
display: inline-flex;
align-items: center;
padding: 2px 10px;
border-radius: 9999px; /* --radius-pill */
font-family: 'Barlow', sans-serif;
font-size: 12px;
font-weight: 700;
letter-spacing: 0.05em;
text-transform: uppercase;
```

| Variant            | background    | color     | border              |
| ------------------ | ------------- | --------- | ------------------- |
| `yellow` (default) | `#ffeb3b`     | `#171717` | —                   |
| **`amber`**        | `#ffc107`     | `#171717` | —                   |
| `orange`           | `#ffa726`     | `#171717` | —                   |
| `dark`             | `#404040`     | `#ffeb3b` | —                   |
| **`outline`**      | `transparent` | `#171717` | `1px solid #a3a3a3` |

Only `amber` and `outline` are used on this page. Design hint-size for both: `auto × 22px`.

> **Height parity caveat:** the `outline` variant adds a 1px border on each side. To keep both
> variants at exactly 22px, use `box-sizing: border-box` plus an explicit `line-height`, or render
> the outline border as an inset ring (`ring-1 ring-inset ring-neutral-400`). Otherwise `outline`
> renders 2px taller and the meta rows in the APPS grid will not align row-to-row.

Tailwind: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider`
· amber: `bg-amber text-neutral-900` · outline: `text-neutral-900 ring-1 ring-inset ring-neutral-400`

### 5.4 `ProjectCard` (APPS grid card)

Slot-based; three instances on this page.

| Prop           | Type                       | Notes                                                                                                |
| -------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `media`        | content slot               | fixed 180px-high panel; three fills used (see §3.2d)                                                 |
| `mediaVariant` | `'grid-paper' \| 'subtle'` | `grid-paper` adds the white + 20px raster + bottom border; `subtle` is flat `#f5f5f5` with no border |
| `kicker`       | string                     | e.g. `Word-AddIn`                                                                                    |
| `badge`        | `{ label, variant }`       | `amber` \| `outline`                                                                                 |
| `title`        | string                     | Bebas 24px                                                                                           |
| `description`  | rich text                  | MAT needs an inline `<code>`/monospace span                                                          |
| `platforms`    | string                     | 12px, `#525252`                                                                                      |
| `links`        | `{ label, href }[]`        | 1–2 entries; wraps at `gap:16px`                                                                     |

Not clickable as a whole — no card-level hover, no card-level `<a>`.

### 5.5 `FeatureCard` (SPIELE)

| Prop            | Type                 | Value                                                    |
| --------------- | -------------------- | -------------------------------------------------------- |
| `image`         | `{ src, alt }`       | Bug-A-Ball key art, `object-fit: cover`                  |
| `kicker`        | string               | `Spiel`                                                  |
| `badge`         | `{ label, variant }` | `Verfügbar` / `amber`                                    |
| `title`         | string               | `BUG-A-BALL` (36px)                                      |
| `description`   | string               | max-width 480px, 16px                                    |
| `platforms`     | string               | 14px                                                     |
| `cta`           | `{ label, href }`    | `Zur Website` → `https://bug-a-ball.com`                 |
| `imagePosition` | `'start' \| 'end'`   | `start` here — worth parameterising if more games follow |

### 5.6 `ButtonPrimary` (the CTA)

Exact design declaration:

```css
display: inline-block;
margin-top: 8px;
background: #ffc107; /* --accent */
color: #171717; /* --text-on-accent */
padding: 10px 20px;
font-family: 'Bebas Neue', sans-serif;
text-transform: uppercase;
letter-spacing: 0.05em;
font-size: 16px;
border-radius: 8px; /* --radius-md */
box-shadow:
  0 10px 15px -3px rgb(255 193 7 / 0.3),
  0 4px 6px -4px rgb(255 193 7 / 0.3);
transition: background 150ms ease-in-out;
```

Hover (from `style-hover`): `background: #ffa726; color: #171717;`
The explicit hover `color` exists to **override the global `a:hover { color:#ffa726 }`** — the label
must stay ink-dark on hover. Do not drop it.

`margin-top: 8px` is part of the CTA declaration on this page, not of the button component — keep it
as a layout class on the usage site (`mt-2`), not baked into the button.

Active state (README §Interactions): 1px translate-down (`active:translate-y-px`).
Tailwind: `mt-2 inline-block rounded-lg bg-amber px-5 py-2.5 font-display text-base uppercase tracking-wider text-neutral-900 shadow-accent transition-colors duration-150 ease-in-out hover:bg-orange hover:text-neutral-900 active:translate-y-px`
(`px-5` = 20px, `py-2.5` = 10px.)

### 5.7 `TextLink` (arrow link)

`text-sm font-bold text-link transition-colors duration-150 ease-in-out hover:text-orange`
Label + `<span aria-hidden="true"> →</span>`. Used 4× on this page.

### 5.8 `Kicker` / eyebrow

`text-xs font-bold uppercase tracking-widest text-orange` — used 5× (page head + 4 cards).

---

## 6. Links

### 6.1 Page body (all external)

| Label                  | href                                            | Component              |
| ---------------------- | ----------------------------------------------- | ---------------------- |
| `Zur Website →`        | `https://lehrgrapht.de`                         | ProjectCard LehrGrapht |
| `Source Code →`        | `https://github.com/BoundfoxStudios/lehrgrapht` | ProjectCard LehrGrapht |
| `Zum Repository →`     | `https://github.com/BoundfoxStudios/mat`        | ProjectCard MAT        |
| `Zum Repository →`     | `https://github.com/BoundfoxStudios/flugwacht`  | ProjectCard Flugwacht  |
| `Zur Website` (button) | `https://bug-a-ball.com`                        | FeatureCard CTA        |

The design file sets no `target` / `rel`. Decide project-wide; if opening in a new tab, add
`rel="noopener"` and an accessible hint.

### 6.2 Header (shared `SiteHeader`, rendered on this page with `active="projekte"`)

Design hrefs are prototype filenames; map to routes:

| Label           | Design href               | Route                                        |
| --------------- | ------------------------- | -------------------------------------------- |
| logo lockup     | `Startseite.dc.html`      | `/`                                          |
| `STARTSEITE`    | `Startseite.dc.html`      | `/`                                          |
| `APPS & SPIELE` | `Spiele und Apps.dc.html` | `/apps-und-spiele` — **active on this page** |
| `UNTERSTÜTZEN`  | `Unterstuetzen.dc.html`   | `/unterstuetzen`                             |
| `SOCIALS`       | `Socials.dc.html`         | `/socials`                                   |
| `DE`            | `#`                       | i18n switch (active)                         |
| `EN`            | `#`                       | i18n switch                                  |

### 6.3 Footer (shared `SiteFooter`)

| Label           | Design href               | Route / URL                          |
| --------------- | ------------------------- | ------------------------------------ |
| `Startseite`    | `Startseite.dc.html`      | `/`                                  |
| `Apps & Spiele` | `Spiele und Apps.dc.html` | `/apps-und-spiele`                   |
| `Unterstützen`  | `Unterstuetzen.dc.html`   | `/unterstuetzen`                     |
| `Socials`       | `Socials.dc.html`         | `/socials`                           |
| `Impressum`     | `Impressum.dc.html`       | `/impressum`                         |
| `Datenschutz`   | `Datenschutz.dc.html`     | `/datenschutz`                       |
| GitHub icon     | —                         | `https://github.com/BoundfoxStudios` |
| Discord icon    | —                         | `https://discord.gg/tHqNzMT`         |
| YouTube icon    | —                         | `https://youtube.com/c/boundfox`     |

### 6.4 Shared-component geometry (needed to place this page correctly)

**SiteHeader** — `background:#171717; color:#ffffff;`
Inner: `max-width:1152px; margin:0 auto; padding:8px 24px; min-height:48px; display:flex; align-items:center; gap:16px; flex-wrap:wrap;`
→ effective band height `8 + 48 + 8 = 64px`.
_(The README states "Höhe 64px, Padding `0 24px`"; the file is the authority — `8px 24px` + `min-height:48px`. Same result, different mechanism; use the file's values so wrapped mobile rows grow correctly.)_

- Logo `<a>`: `flex; align-items:center; gap:10px;` · `<img src="assets/fox-head.png" alt="Boundfox Studios" style="width:32px;height:32px;object-fit:contain;">` · wordmark `<span>` Bebas 24px, `letter-spacing:0.05em; line-height:1; white-space:nowrap` — `BOUNDFOX` `#ffa726`, space, `STUDIOS` `#ffeb3b`.
- `<nav>`: `flex; gap:4px; margin-left:auto; align-items:center; flex-wrap:wrap;` · items `padding:8px 12px; font-family:Bebas; font-size:16px; letter-spacing:0.05em; border-bottom:2px solid <color|transparent>;` active color+border `#ffeb3b`, inactive `#ffffff`, hover `#ffeb3b`.
- Lang switch `<div>`: `flex; gap:8px; align-items:center; font-family:Bebas; font-size:14px; letter-spacing:0.05em; border-left:1px solid #525252; padding-left:16px;` · `DE` `#ffeb3b`, `/` `#525252`, `EN` `#ffffff` hover `#ffeb3b`.

**SiteFooter** — `background:#171717; color:#ffffff; font-family:Barlow;` (design preview height 340px)

- Top grid: `max-width:1152px; margin:0 auto; padding:48px 24px 0; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr)); gap:32px;`
- Bottom bar: `max-width:1152px; margin:24px auto 0; padding:16px 24px; border-top:1px solid #525252; display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap;` — both spans `font-size:12px; color:#a3a3a3;`
- Column titles Bebas 16px `letter-spacing:0.05em` `#ffeb3b`; links Barlow 14px white → hover `#ffeb3b`; columns `flex flex-col gap-2.5` (logo column `gap:12px`).
- Tagline `<p>`: `font-size:14px; line-height:1.625; color:#d4d4d4; max-width:320px;` — `Spiele und Apps — mit Liebe in Stuttgart entwickelt. Kostenlos und Open Source.`
- Bottom copy: `© 2026 Boundfox Studios. Alle Rechte vorbehalten.` / `Deutsch · English`

---

## 7. Assets

### 7.1 Referenced by this page's body

| Asset                  | Path in design                        | Render size                                                   | Intrinsic                                 | Notes                                                                                                                                      |
| ---------------------- | ------------------------------------- | ------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| mat app icon           | `assets/mat-dark.svg`                 | `104 × 104px`                                                 | `viewBox 0 0 600 600`, `width/height 600` | Dark variant (`#171717` rounded square, `rx=96`) — correct on the light `#f5f5f5` panel. A `mat-light.svg` also exists; **not** used here. |
| Flugwacht wordmark     | `assets/flugwacht-wordmark.svg`       | `width: 62%`, `max-width: 280px`, height auto                 | `viewBox 0 0 231.18 42` (aspect ≈ 5.5:1)  | At 280px wide → ≈ 51px tall. Colors baked in: `#262626`, `#ffc107`, `#ffeb3b`.                                                             |
| **Bug-A-Ball key art** | _(none — `<image-slot>` placeholder)_ | fills the media column, `object-fit: cover`, min-height 240px | —                                         | **MISSING.** See below.                                                                                                                    |

### 7.2 Missing asset — Bug-A-Ball key art

The design uses a prototype drop slot:
`<image-slot id="bugaball-art-feature" shape="rect" placeholder="Bug-A-Ball Key-Art hier ablegen">`

`design_handoff_website_redesign/assets/bug-a-ball.svg` (39 KB, dated 2021) exists but README §Assets
declares the SVG export broken (styles lost — it relies on a `<defs><style>` block of `.cls-*` classes
that did not survive export). **Verify it renders before using it**; if not, source a raster key art
(the old site's `bugaball_Thumbnail.png`) and ship a responsive `<img>` (`srcset` + `width`/`height`
to avoid CLS). The same key art is also needed on the Startseite project card.

### 7.3 Referenced by header/footer on this page

| Asset         | Path                  | Render size                                               |
| ------------- | --------------------- | --------------------------------------------------------- |
| Fox-head mark | `assets/fox-head.png` | header `32 × 32`, footer `40 × 40`, `object-fit: contain` |

### 7.4 Icons

- **No icons in this page's body** — the only glyph-like element is the `→` (U+2192) inside link labels, which is plain text.
- Footer only: three inline brand SVGs, `width=20 height=20 viewBox="0 0 24 24" fill="currentColor"`, single `<path>` each. Icon names: **github**, **discord**, **youtube**. Copy the path data verbatim from `SiteFooter.dc.html` lines 43–45 (they are simplified brand marks, not Lucide). `title` attributes: `GitHub`, `Discord`, `YouTube` — replace with `aria-label` + visually-hidden text for accessibility.
- The DS readme names **Lucide** as the substitution icon set for generic UI icons; nothing on this page needs it.

### 7.5 Fonts

| Family     | Source                                | Weights used on this page                                    |
| ---------- | ------------------------------------- | ------------------------------------------------------------ |
| Bebas Neue | Google Fonts                          | 400 (h1, h2, h3, LEHRGRAPHT wordmark, CTA)                   |
| Barlow     | Google Fonts                          | 400 (body, badges base is 700), 700 (kickers, links, badges) |
| Tahu       | local `_ds/.../assets/fonts/Tahu.ttf` | **not used on this page** (Unterstützen only)                |

For SSR, self-host or preconnect: `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
Bebas Neue is display-critical (all headings) — preload the woff2 to avoid a FOUT on the h1.

---

## 8. Interaction & Motion

| Element                                                           | Trigger | Change                                                  | Timing                                            |
| ----------------------------------------------------------------- | ------- | ------------------------------------------------------- | ------------------------------------------------- |
| Text links (`Zur Website →`, `Source Code →`, `Zum Repository →`) | hover   | `color: #a16207 → #ffa726`                              | `150ms ease-in-out`                               |
| CTA button                                                        | hover   | `background: #ffc107 → #ffa726`; color pinned `#171717` | `150ms ease-in-out` (property: `background` only) |
| CTA button                                                        | active  | + `translate-y: 1px` (README)                           | —                                                 |
| Project cards                                                     | —       | **none** — no card-level hover on this page             | —                                                 |
| Header nav links                                                  | hover   | `#ffffff → #ffeb3b`                                     | `150ms ease-in-out`                               |
| Footer links / social icons                                       | hover   | `#ffffff → #ffeb3b`                                     | `150ms ease-in-out`                               |

The inline styles use the CSS keyword `ease-in-out` (= `cubic-bezier(0.42,0,0.58,1)`), while the DS
token `--ease-standard` and the README both specify `cubic-bezier(0.4,0,0.2,1)`. Tailwind's
`ease-in-out` utility emits `cubic-bezier(0.4,0,0.2,1)` — matching the token. **Use the Tailwind
utility**; the difference from the raw keyword is imperceptible and the token is the stated intent.

Add `motion-reduce:transition-none` for `prefers-reduced-motion`.

---

## 9. Responsive Summary

| Viewport    | H1 size | APPS grid | SPIELE feature card | Header/Footer |
| ----------- | ------- | --------- | ------------------- | ------------- |
| ≥ 1200px    | 60px    | 3 × 352px | 2 × 551px           | single row    |
| 1091–1199px | 60px    | 3 cols    | 2 cols              | single row    |
| 996–1090px  | `5.5vw` | 3 cols    | 2 cols              | single row    |
| 727–995px   | `5.5vw` | 2 cols    | 2 cols              | single row    |
| 688–726px   | 40px    | 2 cols    | 2 cols              | may wrap      |
| 672–687px   | 40px    | 2 cols    | **1 col (stacked)** | wraps         |
| < 672px     | 40px    | **1 col** | 1 col (stacked)     | wraps         |

All of this comes from `auto-fit` + `minmax` + `clamp` — **no media queries are needed**, and none
exist in the design. Do not add Tailwind `sm:`/`md:` breakpoint variants to reproduce this; the
intrinsic grid is the design.

Horizontal padding stays `24px` at every size (no smaller mobile gutter in the design).

**Mobile navigation is not designed.** README §Shared Components: the header only `flex-wrap`s.
A burger menu must be added in Angular — a deliberate, documented gap.

---

## 10. Semantics & Accessibility Checklist

- Heading order on this page: `h1` (APPS & SPIELE) → `h2` (APPS) → `h3` ×3 → `h2` (SPIELE) → `h3`. Correct, keep it.
- Cards are `<article>`; the grids are plain `<div>`s. Consider `<ul>`/`<li>` for the APPS grid so the count is announced.
- **Duplicate link text:** `Zum Repository →` appears twice and `Zur Website` appears twice (once as text link, once as CTA). Add `aria-label` including the product name, e.g. `aria-label="LehrGrapht – zur Website"`.
- Wrap the `→` in `<span aria-hidden="true">`.
- Headings are authored in literal uppercase (`APPS & SPIELE`, `LEHRGRAPHT`). Bebas Neue has only caps glyphs, so nothing is lost visually — but consider authoring sentence case + `uppercase` so screen readers and translations behave. **Decision needed** (kicker spans already use `text-transform: uppercase` with sentence-case source, so the file is internally inconsistent).
- Contrast: `#525252` on `#ffffff` = 7.5:1 ✓ · `#a16207` on `#ffffff` = 4.9:1 ✓ · `#ffa726` on `#ffffff` = **1.9:1 ✗** — the orange kicker fails WCAG AA for 12px text. It is brand-mandated; flag for the client or darken kickers only. Same issue on every page.
- Focus rings: nothing is designed. `--focus-ring: #ffc107` exists in the tokens — use `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber`.
- Give the key-art `<img>` explicit `width`/`height` (or `aspect-ratio`) to prevent layout shift in the 240px media column.

---

## 11. Deltas vs. the README and vs. the Startseite

Trust the `.dc.html` file over the README where they differ.

| Item                     | Startseite / README                   | This page (authoritative)                                    |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------ |
| APPS grid `minmax`       | Startseite: `min(420px,100%)`         | `min(300px,100%)`                                            |
| Card media height        | Startseite: `200px`                   | `180px`                                                      |
| Card body gap / padding  | `24px` / gap 8px                      | same                                                         |
| LEHRGRAPHT wordmark size | Startseite: `44px`                    | `38px`                                                       |
| mat icon size            | README: `112px`                       | `104px`                                                      |
| Flugwacht wordmark       | README: `56%`, `max 300px`            | `62%`, `max 280px`                                           |
| Header inner box         | README: "Höhe 64px, Padding `0 24px`" | `padding:8px 24px; min-height:48px` (= 64px total)           |
| Easing                   | README: `cubic-bezier(.4,0,.2,1)`     | inline `ease-in-out` keyword — use the token                 |
| LehrGrapht links         | Startseite: 1 link                    | 2 links (Website + Source Code)                              |
| Descriptions             | Startseite: short                     | longer, page-specific — **do not reuse the Startseite copy** |

The APPS/SPIELE card families therefore need either **separate size props on one shared component**
(`mediaHeight`, `minColumnWidth`, `wordmarkSize`) or two distinct components. A single component with
`density: 'compact' | 'roomy'` is the cleaner call.
