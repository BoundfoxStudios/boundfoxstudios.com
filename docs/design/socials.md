# Implementation Reference — Socials page (`/socials`)

Source of truth: `/Users/manuelrauber/projects/private/boundfoxstudios.com/design_handoff_website_redesign/Socials.dc.html`
Tokens: `/Users/manuelrauber/projects/private/boundfoxstudios.com/design_handoff_website_redesign/_ds/boundfox-studios-design-system-0747e2df-62fc-4fe1-bbd4-f0e974f1e1a3/tokens/*.css`
Target stack: Angular 22 (SSR) + Tailwind v4. Route per handoff README: `/socials`, nav label `SOCIALS`, header prop `active = 'socials'`.

The page is trivial in structure (hero + one grid of three dark link tiles) but every number below is taken verbatim from the inline styles — no rounding, no interpretation unless explicitly marked as a **decision**.

---

## 1. Page shell

```
<div style="min-height:100vh;display:flex;flex-direction:column;">
  <SiteHeader active="socials">          <!-- 64px tall band -->
  <main style="flex:1;">
    <section>  hero        </section>
    <section>  channel grid</section>
  </main>
  <SiteFooter>                            <!-- ~340px -->
</div>
```

| Property             | Value                                                   | Tailwind v4                  |
| -------------------- | ------------------------------------------------------- | ---------------------------- |
| Root                 | `min-height:100vh; display:flex; flex-direction:column` | `flex min-h-screen flex-col` |
| `<main>`             | `flex:1`                                                | `flex-1`                     |
| Page background      | `var(--surface-page)` = `#ffffff`                       | `bg-white` (set on `body`)   |
| Page base font       | `var(--font-body)` = `Barlow, sans-serif`               | `font-sans` (global)         |
| Page base text color | `var(--text-body)` = `#404040` (neutral-700)            | `text-neutral-700` (global)  |
| `body` margin        | `0`                                                     | Preflight handles it         |

Global anchor rules that the prototype applies (from `tokens/effects.css` + the page `<style>`):

```css
a {
  transition: color 150ms ease-in-out;
  color: var(--link); /* #a16207 */
  text-decoration: none;
}
a:hover {
  color: var(--accent-strong); /* #ffa726 */
}
```

On this page every `<a>` is one of the three tiles, and **all of their children set an explicit color**, so the global link color/hover never becomes visible here. Do not rely on it; the tiles set their own colors.

### box-sizing — the one real ambiguity (**decision required**)

The prototype has **no** `* { box-sizing: border-box }` reset (verified: `support.js` only sets it on its own placeholder classes). Therefore in the reference file `max-width:1152px; padding:0 24px` yields a **1152px content column inside a 1200px total width**.
Tailwind Preflight sets `border-box` globally, so `max-w-6xl px-6` yields a **1104px content column inside 1152px total**.

- **Recommended:** follow Tailwind (`mx-auto max-w-6xl px-6`, content 1104px). The design-system readme explicitly maps container 1152px → `max-w-6xl`, and every other value in the system is a stock Tailwind step.
- **If pixel-identical to the prototype screenshots is required:** use `mx-auto max-w-[1200px] px-6` (content 1152px).

The only visible consequence on this page is the desktop card width: **352px** (Tailwind) vs **368px** (prototype). Grid column-count breakpoints are identical either way (see §3.3). Pick one and apply it to all six pages consistently.

---

## 2. Section A — Hero / page intro

Element: `<section>` (first child of `<main>`).

| Property    | Exact value     | Token                                   | Tailwind v4       |
| ----------- | --------------- | --------------------------------------- | ----------------- |
| `max-width` | `1152px`        | `--container-max`                       | `max-w-6xl`       |
| `margin`    | `0 auto`        | —                                       | `mx-auto`         |
| `padding`   | `64px 24px 8px` | `--space-8` / `--space-5` / `--space-2` | `pt-16 px-6 pb-2` |

### A.1 Kicker — "Community"

```html
<div
  style="font-size:12px;font-weight:700;letter-spacing:0.1em;
            text-transform:uppercase;color:var(--accent-strong);margin-bottom:8px;"
>
  Community
</div>
```

| Property       | Exact value                    | Token                              | Tailwind v4       |
| -------------- | ------------------------------ | ---------------------------------- | ----------------- |
| font-family    | inherited Barlow               | `--font-body`                      | inherited         |
| font-size      | `12px`                         | `--text-xs`                        | `text-xs`         |
| font-weight    | `700`                          | —                                  | `font-bold`       |
| letter-spacing | `0.1em`                        | `--tracking-caps`                  | `tracking-widest` |
| text-transform | `uppercase`                    | —                                  | `uppercase`       |
| color          | `#ffa726`                      | `--accent-strong` → `--bfs-orange` | `text-orange`     |
| margin-bottom  | `8px`                          | `--space-2`                        | `mb-2`            |
| line-height    | **not set** → browser `normal` | —                                  | see trap below    |

> **Tailwind trap:** in v4 `text-xs` also emits `line-height: calc(1 / 0.75)` (= 16px). The design leaves line-height at `normal` (≈14.4px for Barlow). For an exact match write `text-xs leading-[normal]`. Same applies to every other size utility on this page where no line-height is given (card handle, card CTA).

### A.2 H1 — "VERNETZE DICH MIT UNS"

| Property       | Exact value                          | Token                          | Tailwind v4                      |
| -------------- | ------------------------------------ | ------------------------------ | -------------------------------- |
| element        | `<h1>`                               | —                              | —                                |
| margin         | `0`                                  | —                              | `m-0` (Preflight already resets) |
| font-family    | `'Bebas Neue', sans-serif`           | `--font-display`               | `font-display`                   |
| font-weight    | `400`                                | —                              | `font-normal`                    |
| font-size      | `clamp(40px, 5.5vw, 60px)`           | (60px = `--display-lg`)        | `text-[clamp(40px,5.5vw,60px)]`  |
| line-height    | `1`                                  | `--leading-tight`              | `leading-none`                   |
| letter-spacing | `0.025em`                            | `--tracking-display`           | `tracking-wide`                  |
| color          | `#171717`                            | `--text-heading` → `--bfs-ink` | `text-neutral-900`               |
| casing         | already uppercase in the copy string | —                              | —                                |

Clamp behaviour: 40px up to viewport **727.3px**; fluid `5.5vw` between **727.3px and 1090.9px**; 60px from **1090.9px** up.

### A.3 Lead paragraph

| Property    | Exact value         | Token            | Tailwind v4                               |
| ----------- | ------------------- | ---------------- | ----------------------------------------- |
| margin      | `12px 0 0`          | `--space-3`      | `mt-3`                                    |
| font-size   | `18px`              | `--text-lg`      | `text-lg`                                 |
| line-height | `1.625`             | `--leading-body` | `leading-relaxed` (use `text-lg/relaxed`) |
| max-width   | `560px`             | — (no token)     | `max-w-[560px]`                           |
| color       | inherited `#404040` | `--text-body`    | inherited                                 |
| text-wrap   | `pretty`            | —                | `text-pretty`                             |

Vertical rhythm note: hero `padding-bottom: 8px` + grid section `padding-top: 48px` ⇒ **56px** between the lead paragraph box and the card grid.

---

## 3. Section B — Channel grid

Element: `<section>` (second child of `<main>`).

| Property    | Exact value      | Token                         | Tailwind v4                         |
| ----------- | ---------------- | ----------------------------- | ----------------------------------- |
| `max-width` | `1152px`         | `--container-max`             | `max-w-6xl`                         |
| `margin`    | `0 auto`         | —                             | `mx-auto`                           |
| `padding`   | `48px 24px 72px` | `--space-7` / `--space-5` / — | `pt-12 px-6 pb-18` (or `pb-[72px]`) |

### 3.1 Grid container

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
gap: 24px;
```

Tailwind v4:

```html
<div class="grid [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6"></div>
```

(`grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]` works too; the bracketed property form is easier to read.)

### 3.2 Column math

Content width `W = min(viewport, container-cap) − 48px`.
`n` columns fit when `n·280 + (n−1)·24 ≤ W`.

| Columns | Requires `W ≥` | Viewport threshold |
| ------- | -------------- | ------------------ |
| 3       | 888px          | **≥ 936px**        |
| 2       | 584px          | **≥ 632px**        |
| 1       | —              | **< 632px**        |

At full container: 3 columns of **352px** each (Tailwind/border-box, W = 1104) or **368px** each (prototype/content-box, W = 1152).
`min(280px, 100%)` guarantees no horizontal overflow on viewports narrower than 328px.

Rows stretch (grid default `align-items: stretch`) ⇒ all three tiles are equal height, and the CTA line is pinned to the bottom via `margin-top:auto`.

### 3.3 Tile (`<a>` — the whole card is the link)

Identical for all three tiles; only href, icon, and copy differ.

| Property      | Exact value                                                    | Token                                                       | Tailwind v4                                          |
| ------------- | -------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| element       | `<a href="…">`                                                 | —                                                           | `<a>`                                                |
| background    | `#171717`                                                      | `--bfs-ink` (neutral-900)                                   | `bg-neutral-900`                                     |
| border        | `1px solid #525252`                                            | `--bfs-gray-600` (neutral-600)                              | `border border-neutral-600`                          |
| border-radius | `12px`                                                         | `--radius-lg`                                               | `rounded-xl`                                         |
| box-shadow    | `0 4px 6px -1px rgb(0 0 0/0.1), 0 2px 4px -2px rgb(0 0 0/0.1)` | `--shadow-card` (= `shadow-md`)                             | `shadow-md`                                          |
| padding       | `32px`                                                         | `--space-6`                                                 | `p-8`                                                |
| display       | `flex; flex-direction:column`                                  | —                                                           | `flex flex-col`                                      |
| gap           | `14px`                                                         | — (off the 4px token scale)                                 | `gap-3.5`                                            |
| transition    | `border-color 150ms ease-in-out`                               | `--dur-fast`, `--ease-standard` = `cubic-bezier(.4,0,.2,1)` | `transition-[border-color] duration-150 ease-in-out` |
| **hover**     | `border-color: #ffc107`                                        | `--bfs-amber`                                               | `hover:border-amber`                                 |

Hover is **border-color only** — no lift, no scale, no background change (matches the README interaction rules). `transition-colors` would also work but transitions more properties than the design declares; prefer `transition-[border-color]`.

Add for the real implementation (not in the prototype, required for production): `:focus-visible` ring using `--focus-ring` (`#ffc107`), e.g. `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber`.

### 3.4 Tile children (in DOM order)

| #   | Element              | Exact styles                                                                                             | Token map                                                                                     | Tailwind v4                                                                  |
| --- | -------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | `<svg>` icon         | `width:32; height:32; viewBox="0 0 24 24"; fill:var(--bfs-yellow)`                                       | `--bfs-yellow` `#ffeb3b`                                                                      | `size-8` + `fill-yellow` (or `text-yellow fill-current`)                     |
| 2   | `<span>` name        | `font-family:var(--font-display); font-size:28px; letter-spacing:0.025em; color:#ffffff; line-height:1`  | `--font-display`, `--tracking-display`, literal white (= `--bfs-white` / `--text-on-inverse`) | `font-display text-[28px] leading-none tracking-wide text-white`             |
| 3   | `<span>` description | `font-size:14px; line-height:1.625; color:#d4d4d4`                                                       | `--text-sm`, `--leading-body`, `--bfs-gray-300` (neutral-300)                                 | `text-sm/relaxed text-neutral-300`                                           |
| 4   | `<span>` handle      | `font-size:12px; color:#a3a3a3; font-family:monospace`                                                   | `--text-xs`, `--bfs-gray-400` (neutral-400)                                                   | `font-mono text-xs leading-[normal] text-neutral-400`                        |
| 5   | `<span>` CTA         | `margin-top:auto; font-family:var(--font-display); font-size:16px; letter-spacing:0.05em; color:#ffeb3b` | `--font-display`, `--text-base`, `--bfs-yellow`                                               | `mt-auto font-display text-base leading-[normal] tracking-wider text-yellow` |

Notes on exactness:

- **28px** (tile name) is _not_ on the token scale — it sits between `--display-sm` (24px) and `--display-md` (36px). Keep it as an arbitrary value or add a `--text-tile: 28px` theme entry.
- **0.05em** (CTA) is _not_ in `typography.css` (only 0.025em and 0.1em are). It equals Tailwind's `tracking-wider` — the same value the header/footer use for Bebas labels.
- **`font-family: monospace`** is the bare generic family, not a stack. Tailwind's `font-mono` expands to `ui-monospace, SFMono-Regular, Menlo, …` which renders differently. For a literal match use `font-[monospace]`, or define `--font-mono: monospace` in `@theme`.
- The name span is hard-coded `#ffffff`, not a `var()`. Map it to `--bfs-white` / `--text-on-inverse`.
- No `target="_blank"` / `rel` in the design — the prototype opens external links in the same tab. **Decision:** if you add `target="_blank"`, always add `rel="noopener noreferrer"` (and consider an "opens in new tab" hint for screen readers).

---

## 4. Copy strings (verbatim) + proposed i18n keys

All copy is German (du-form). Characters verified: `—` is U+2014 EM DASH (surrounded by regular spaces), `→` is U+2192 RIGHTWARDS ARROW, `Entwickler:innen` uses a normal colon.

| #   | i18n key                               | Verbatim string                                                                                       | Element                                                | Translate?      |
| --- | -------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------- |
| 1   | `socials.hero.kicker`                  | `Community`                                                                                           | hero kicker (uppercased by CSS, **not** in the string) | yes             |
| 2   | `socials.hero.headline`                | `VERNETZE DICH MIT UNS`                                                                               | `<h1>` (uppercase in the source string)                | yes             |
| 3   | `socials.hero.lead`                    | `Hier findest du uns — für Tutorials, Fragen, Feedback oder einfach einen Blick hinter die Kulissen.` | lead `<p>`                                             | yes             |
| 4   | `socials.channels.github.name`         | `GITHUB`                                                                                              | tile 1 name                                            | no (brand name) |
| 5   | `socials.channels.github.description`  | `Unsere Open-Source-Projekte: Code lesen, Issues melden, mitentwickeln.`                              | tile 1 description                                     | yes             |
| 6   | `socials.channels.github.handle`       | `github.com/BoundfoxStudios`                                                                          | tile 1 handle                                          | no (URL)        |
| 7   | `socials.channels.github.cta`          | `ZUR ORGANISATION →`                                                                                  | tile 1 CTA                                             | yes             |
| 8   | `socials.channels.discord.name`        | `DISCORD`                                                                                             | tile 2 name                                            | no (brand name) |
| 9   | `socials.channels.discord.description` | `Unsere Community: Hilfe bei deinen Projekten, Feedback und Austausch mit anderen Entwickler:innen.`  | tile 2 description                                     | yes             |
| 10  | `socials.channels.discord.handle`      | `discord.gg/tHqNzMT`                                                                                  | tile 2 handle                                          | no (URL)        |
| 11  | `socials.channels.discord.cta`         | `SERVER BEITRETEN →`                                                                                  | tile 2 CTA                                             | yes             |
| 12  | `socials.channels.youtube.name`        | `YOUTUBE`                                                                                             | tile 3 name                                            | no (brand name) |
| 13  | `socials.channels.youtube.description` | `Kostenlose Kurse und Tutorials zu Unity, Blender und Spieleentwicklung — auf Deutsch.`               | tile 3 description                                     | yes             |
| 14  | `socials.channels.youtube.handle`      | `youtube.com/c/boundfox`                                                                              | tile 3 handle                                          | no (URL)        |
| 15  | `socials.channels.youtube.cta`         | `KANAL ÖFFNEN →`                                                                                      | tile 3 CTA                                             | yes             |

**15 distinct visible strings on this page**; 8 of them actually need translation.

Recommendations:

- Keep the trailing ` →` **out** of the translated string and render the arrow as a separate decorative span (`aria-hidden="true"`). If you keep it inside, the strings above are the verbatim source values.
- `Community` is stored in sentence case and uppercased with `text-transform:uppercase` — keep it that way so other locales can opt out of shouting; do not bake uppercase into the string. (Same pattern on `Spiele und Apps.dc.html` / `Unterstuetzen.dc.html`, where the kicker source strings are `Projekte` / `Community`.)
- `VERNETZE DICH MIT UNS` **is** stored uppercase in the design (h1 has no `text-transform`). Either keep it uppercase in the string or add `uppercase` to the h1 and store `Vernetze dich mit uns` — pick one convention for all six pages.
- Missing from the design, needed for the route: `<title>` and `<meta name="description">`. Suggested keys `socials.meta.title` / `socials.meta.description` — copy must be written, it does not exist in the handoff.

### Strings owned by the shared components (rendered on this page, defined elsewhere)

Header: `BOUNDFOX`, `STUDIOS`, `STARTSEITE`, `APPS & SPIELE`, `UNTERSTÜTZEN`, `SOCIALS`, `DE`, `EN`, `alt="Boundfox Studios"`.
Footer: `Spiele und Apps — mit Liebe in Stuttgart entwickelt. Kostenlos und Open Source.`, `SEITEN`, `Startseite`, `Apps & Spiele`, `Unterstützen`, `Socials`, `RECHTLICHES`, `Impressum`, `Datenschutz`, `FOLGE UNS`, `© 2026 Boundfox Studios. Alle Rechte vorbehalten.`, `Deutsch · English`, plus `title` attributes `GitHub` / `Discord` / `YouTube`.

---

## 5. Design tokens used on this page

### 5.1 Colors (`tokens/colors.css`)

| CSS variable                                              | Resolves to | Where used on this page                                                 | Tailwind class (per README `@theme`) |
| --------------------------------------------------------- | ----------- | ----------------------------------------------------------------------- | ------------------------------------ |
| `--accent-strong` → `--bfs-orange`                        | `#ffa726`   | hero kicker text                                                        | `text-orange`                        |
| `--text-heading` → `--bfs-ink`                            | `#171717`   | `<h1>`                                                                  | `text-neutral-900`                   |
| `--text-body` → `--bfs-gray-700`                          | `#404040`   | body/lead paragraph (inherited)                                         | `text-neutral-700`                   |
| `--surface-page` → `--bfs-white`                          | `#ffffff`   | page background                                                         | `bg-white`                           |
| `--bfs-ink`                                               | `#171717`   | tile background                                                         | `bg-neutral-900`                     |
| `--bfs-gray-600`                                          | `#525252`   | tile border (rest)                                                      | `border-neutral-600`                 |
| `--bfs-amber`                                             | `#ffc107`   | tile border (hover), focus ring                                         | `hover:border-amber`                 |
| `--bfs-yellow`                                            | `#ffeb3b`   | tile icon fill, tile CTA text                                           | `fill-yellow` / `text-yellow`        |
| `#ffffff` (literal) = `--bfs-white` / `--text-on-inverse` | `#ffffff`   | tile name                                                               | `text-white`                         |
| `--bfs-gray-300`                                          | `#d4d4d4`   | tile description                                                        | `text-neutral-300`                   |
| `--bfs-gray-400`                                          | `#a3a3a3`   | tile handle                                                             | `text-neutral-400`                   |
| `--link`                                                  | `#a16207`   | inherited by the tile `<a>` but never visible (all children set colors) | `text-link`                          |

Not used on this page: `--bfs-gray-200`, `--bfs-gray-100`, `--surface-subtle`, `--gradient-brand`, `--border-default`, `--border-strong`, `--shadow-raised`, `--shadow-accent`, `--font-script`.

### 5.2 Typography (`tokens/typography.css`)

| Token                | Value                      | Used for                             |
| -------------------- | -------------------------- | ------------------------------------ |
| `--font-display`     | `'Bebas Neue', sans-serif` | h1, tile name, tile CTA              |
| `--font-body`        | `'Barlow', sans-serif`     | everything else (via `body`)         |
| `--text-xs`          | `12px`                     | kicker (literal `12px`), tile handle |
| `--text-sm`          | `14px`                     | tile description                     |
| `--text-base`        | `16px`                     | tile CTA (literal `16px`)            |
| `--text-lg`          | `18px`                     | hero lead                            |
| `--display-lg`       | `60px`                     | upper bound of the h1 clamp          |
| `--leading-tight`    | `1`                        | h1; tile name uses literal `1`       |
| `--leading-body`     | `1.625`                    | hero lead, tile description          |
| `--tracking-display` | `0.025em`                  | h1, tile name                        |
| `--tracking-caps`    | `0.1em`                    | hero kicker                          |
| _(no token)_         | `0.05em`                   | tile CTA — Tailwind `tracking-wider` |
| _(no token)_         | `28px`                     | tile name                            |
| _(no token)_         | `monospace`                | tile handle                          |

Fonts are loaded via `tokens/fonts.css`:
`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap')`.
For Angular SSR, self-host Bebas Neue 400 and Barlow 400/700 (only 400 and 700 are used on this page) rather than hot-linking Google Fonts; add `font-display: swap` and preload the two woff2 files. `Tahu` (`--font-script`) is **not** used on this page.

### 5.3 Spacing / radius / effects (`tokens/spacing.css`, `tokens/effects.css`)

| Token             | Value                     | Used for                                      |
| ----------------- | ------------------------- | --------------------------------------------- |
| `--space-2`       | `8px`                     | kicker `margin-bottom`, hero `padding-bottom` |
| `--space-3`       | `12px`                    | lead `margin-top`                             |
| `--space-5`       | `24px`                    | horizontal section padding, grid gap          |
| `--space-6`       | `32px`                    | tile padding                                  |
| `--space-7`       | `48px`                    | grid section `padding-top`                    |
| `--space-8`       | `64px`                    | hero `padding-top`                            |
| _(no token)_      | `72px`                    | grid section `padding-bottom`                 |
| _(no token)_      | `14px`                    | tile flex gap                                 |
| `--radius-lg`     | `12px`                    | tile corners                                  |
| `--container-max` | `1152px`                  | both sections                                 |
| `--shadow-card`   | `shadow-md` values        | tile                                          |
| `--dur-fast`      | `150ms`                   | tile border transition                        |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` | tile border transition                        |

---

## 6. Links

Page content (inside `<main>`) — all external, all in the same tab in the design:

| Label                     | href                                 | External |
| ------------------------- | ------------------------------------ | -------- |
| GitHub tile (whole card)  | `https://github.com/BoundfoxStudios` | yes      |
| Discord tile (whole card) | `https://discord.gg/tHqNzMT`         | yes      |
| YouTube tile (whole card) | `https://youtube.com/c/boundfox`     | yes      |

Rendered on this page but owned by the shared components (prototype hrefs → Angular routes):

| Component           | Label                      | Prototype href                    | Angular target                                   |
| ------------------- | -------------------------- | --------------------------------- | ------------------------------------------------ |
| Header logo         | BOUNDFOX STUDIOS           | `Startseite.dc.html`              | `/`                                              |
| Header nav          | STARTSEITE                 | `Startseite.dc.html`              | `/`                                              |
| Header nav          | APPS & SPIELE              | `Spiele und Apps.dc.html`         | `/apps-und-spiele`                               |
| Header nav          | UNTERSTÜTZEN               | `Unterstuetzen.dc.html`           | `/unterstuetzen`                                 |
| Header nav          | SOCIALS (**active**)       | `Socials.dc.html`                 | `/socials`                                       |
| Header lang         | DE (active) / EN           | `#` / `#`                         | i18n switch (locale routing, e.g. `/en/socials`) |
| Footer              | Startseite                 | `Startseite.dc.html`              | `/`                                              |
| Footer              | Apps & Spiele              | `Spiele und Apps.dc.html`         | `/apps-und-spiele`                               |
| Footer              | Unterstützen               | `Unterstuetzen.dc.html`           | `/unterstuetzen`                                 |
| Footer              | Socials                    | `Socials.dc.html`                 | `/socials`                                       |
| Footer              | Impressum                  | `Impressum.dc.html`               | `/impressum`                                     |
| Footer              | Datenschutz                | `Datenschutz.dc.html`             | `/datenschutz`                                   |
| Footer social icons | GitHub / Discord / YouTube | same three external URLs as above | external                                         |

---

## 7. Components

### 7.1 Needed for this page

| Component                             | Purpose                                                                                                                                                               | Inputs / variants                                                                                                                                                                                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SiteHeaderComponent`                 | dark 64px band, imported as `<dc-import name="SiteHeader" active="socials">`                                                                                          | `active: 'start' \| 'projekte' \| 'support' \| 'socials' \| 'legal'` (from the prototype's prop schema). Active item: text `#ffeb3b` + `border-bottom: 2px solid #ffeb3b`; inactive white, hover `#ffeb3b`, transparent bottom border. In Angular prefer `routerLinkActive` over an input. |
| `SiteFooterComponent`                 | dark footer band, ~340px                                                                                                                                              | none                                                                                                                                                                                                                                                                                       |
| `PageIntroComponent` (a.k.a. hero)    | kicker + h1 + lead; **identical markup on `Socials`, `Unterstuetzen` and `Spiele und Apps`** (only the lead's `max-width` differs: 560px here, 620px on Unterstützen) | `kicker: string`, `headline: string`, `lead: string`, optional `leadMaxWidth` (560/620px), optional projected slot for the Tahu accent used on Unterstützen                                                                                                                                |
| `KickerComponent` / `.kicker` utility | 12px/700/0.1em uppercase orange label                                                                                                                                 | variant `block` (with `margin-bottom:8px`, page kicker) vs `inline` (`<span>`, no margin, card eyebrow on Startseite/Spiele und Apps)                                                                                                                                                      |
| `CardGridComponent` / utility class   | `grid; auto-fit minmax(min(N,100%),1fr); gap:24px` — recurs on every page with N ∈ {280, 300, 320, 420}                                                               | `minColumnWidth: number` (280 here)                                                                                                                                                                                                                                                        |
| `SocialTileComponent`                 | the dark clickable channel tile                                                                                                                                       | `href`, `icon: 'github' \| 'discord' \| 'youtube'`, `name`, `description`, `handle`, `ctaLabel`; internally: `<a>` with the shell styles from §3.3                                                                                                                                         |
| `BrandIconComponent`                  | the three inline brand glyphs                                                                                                                                         | `name: 'github' \| 'discord' \| 'youtube'`, `size` (20 in footer, 24 on Unterstützen, 32 here); use `fill="currentColor"` and drive the color with a text-color class                                                                                                                      |

### 7.2 Shared link-card shell (worth extracting)

`Socials` tiles and the `Unterstuetzen` "Kostenfrei unterstützen" cards share the same skeleton: an `<a>` that is `flex flex-col`, `border 1px`, `rounded-xl`, `shadow-md`, `transition border-color 150ms ease-in-out`, `hover:border-color #ffc107`, with the CTA line pushed down by `margin-top:auto`. They differ only in tone:

|               | Socials (dark)                                        | Unterstützen (light)                                              |
| ------------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| background    | `#171717`                                             | `#ffffff` (`--surface-card`)                                      |
| border (rest) | `#525252`                                             | `#e5e5e5` (`--border-default`)                                    |
| padding       | `32px` (`--space-6`)                                  | `24px` (`--space-5`)                                              |
| gap           | `14px`                                                | `12px`                                                            |
| icon          | bare 32px SVG, fill `#ffeb3b`                         | 44×44 chip, `rounded-lg`, bg `#ffeb3b`, 24px glyph fill `#171717` |
| name          | Bebas 28px `#ffffff`                                  | Bebas 24px (`--display-sm`) `#171717`                             |
| handle line   | present (monospace 12px `#a3a3a3`)                    | absent                                                            |
| CTA           | Bebas 16px uppercase `#ffeb3b` (`ZUR ORGANISATION →`) | Barlow 14px bold `#a16207`, sentence case (`Zur Organisation →`)  |

Recommendation: one `LinkCardComponent` providing the shell + `tone: 'dark' \| 'light'`, with the body composed via content projection; keep `SocialTileComponent` as the page-level composition.

### 7.3 Suggested Angular skeleton

```html
<!-- socials-page.html -->
<section class="mx-auto max-w-6xl px-6 pt-16 pb-2">
  <p class="text-orange mb-2 text-xs leading-[normal] font-bold tracking-widest uppercase">
    Community
  </p>
  <h1
    class="font-display m-0 text-[clamp(40px,5.5vw,60px)] leading-none font-normal tracking-wide text-neutral-900"
  >
    VERNETZE DICH MIT UNS
  </h1>
  <p class="mt-3 max-w-[560px] text-lg/relaxed text-pretty">…</p>
</section>

<section class="mx-auto max-w-6xl px-6 pt-12 pb-[72px]">
  <div class="grid [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
    @for (channel of channels; track channel.id) {
    <a
      class="hover:border-amber focus-visible:outline-amber flex flex-col gap-3.5 rounded-xl border border-neutral-600 bg-neutral-900 p-8 shadow-md transition-[border-color] duration-150 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2"
      [href]="channel.href"
    >
      <bfs-brand-icon
        class="fill-yellow size-8"
        [name]="channel.icon"
        aria-hidden="true"
      />
      <span class="font-display text-[28px] leading-none tracking-wide text-white"
        >{{ channel.name }}</span
      >
      <span class="text-sm/relaxed text-neutral-300">{{ channel.description }}</span>
      <span class="font-[monospace] text-xs leading-[normal] text-neutral-400"
        >{{ channel.handle }}</span
      >
      <span class="font-display text-yellow mt-auto text-base leading-[normal] tracking-wider">
        {{ channel.cta }} <span aria-hidden="true">→</span>
      </span>
    </a>
    }
  </div>
</section>
```

Channel order is fixed: **GitHub, Discord, YouTube**.

---

## 8. Assets

- **No images on this page.** `assets/fox-head.png` (32px header, 40px footer) is referenced only by the shared header/footer components.
- **Three inline SVG icons**, each `viewBox="0 0 24 24"`, single `<path>`, no stroke, rendered at `width=32 height=32` with `fill="var(--bfs-yellow)"`:

| Icon name | Location of the exact path data (copy verbatim, do not redraw)                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `github`  | `Socials.dc.html` line 35 (identical path in `SiteFooter.dc.html` line 43 and `Unterstuetzen.dc.html` line 42) |
| `discord` | `Socials.dc.html` line 42 (identical in `SiteFooter.dc.html` line 44, `Unterstuetzen.dc.html` line 50)         |
| `youtube` | `Socials.dc.html` line 49 (identical in `SiteFooter.dc.html` line 45, `Unterstuetzen.dc.html` line 58)         |

Because the same three glyphs appear at three sizes and three colors across the site, build them once as a `BrandIconComponent` with `fill="currentColor"` and set the color via a text-color utility (`text-yellow` here, `text-white`/`hover:text-yellow` in the footer, `text-neutral-900` on Unterstützen).

- Fonts: Bebas Neue 400, Barlow 400/700 (Google Fonts — self-host for SSR). `assets/fonts/Tahu.ttf` is **not** needed for this page.
- Nothing is missing for this page — the Bug-A-Ball key-art gap noted in the README affects only Startseite and Apps & Spiele.

---

## 9. Behaviour & accessibility

- The **entire tile is one anchor**, unlike the Startseite project cards where only the inline links are clickable. Keep it as a single `<a>` (no nested interactive elements).
- Only transition declared: `border-color 150ms ease-in-out`. No transform, no scale, no shadow change.
- Screen readers will read all four text nodes of a tile as the link name (`GITHUB Unsere Open-Source-Projekte: … github.com/BoundfoxStudios ZUR ORGANISATION →`). Add an explicit `aria-label` (e.g. `GitHub — zur Organisation`) and mark the arrow `aria-hidden="true"`.
- Icons are decorative next to the visible channel name → `aria-hidden="true"` / `focusable="false"`.
- The prototype has no focus styling; add a visible `:focus-visible` ring in `--focus-ring` (`#ffc107`) — it passes on the `#171717` tile background.
- Contrast on the dark tile: `#d4d4d4` on `#171717` ≈ 11.3:1 (fine); `#a3a3a3` on `#171717` ≈ 6.4:1 (fine for 12px). `#ffeb3b` on `#171717` ≈ 15.5:1.
- Heading structure: `<h1>` is the only heading on the page — the tile names are `<span>`s in the design. If you promote them to `<h2>` for outline quality, keep the exact visual styling (Bebas 28px/leading-none/tracking 0.025em/white).
- No client state, no data fetching, no forms. Fully static/prerenderable — add the route to `app.routes.server.ts` with `RenderMode.Prerender`.

---

## 10. Open decisions / gaps for the developer

1. **box-sizing / container width** — `max-w-6xl px-6` (1104px content) vs `max-w-[1200px] px-6` (1152px content, matches the prototype). Must be decided globally, not per page. (§1)
2. **Tailwind line-height defaults** — v4 size utilities inject a line-height the design does not declare (kicker, handle, CTA). Use `leading-[normal]` or accept ±1–2px. (§2.A.1)
3. **Uppercase in copy vs CSS** — `Community` is sentence case + `text-transform`, while `VERNETZE DICH MIT UNS` and the tile names are stored uppercase. Unify before extracting i18n strings. (§4)
4. **Arrow `→` inside or outside the translated string.** (§4)
5. **`target="_blank"` for the three external tiles** — not specified in the design. (§3.4)
6. **Page `<title>` / meta description / OG tags** — no copy exists in the handoff. (§4)
7. **Language switcher** — header shows `DE / EN` with `href="#"`; the Angular routing/i18n mechanism is not defined by the design. English translations of all 8 translatable strings do not exist yet.
8. **`monospace` vs Tailwind `font-mono`** — decide whether to add `--font-mono: monospace` to `@theme`. (§3.4)
9. **28px tile name and 14px tile gap** are off the token scale — either add theme entries (`--text-tile: 28px`) or keep arbitrary values.
10. No i18n library is installed yet (`package.json` has no `@angular/localize`, Transloco, or similar) — the key scheme above is a proposal, not wired to anything.
