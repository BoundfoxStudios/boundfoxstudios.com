# Implementation Reference — Impressum (`/impressum`)

Source of truth: `/Users/manuelrauber/projects/private/boundfoxstudios.com/design_handoff_website_redesign/Impressum.dc.html`
(56 lines, inline styles, prototype runtime `support.js` / `image-slot.js` — **not** to be ported).
Shared imports: `SiteHeader.dc.html` (prop `active="legal"`), `SiteFooter.dc.html`.
Tokens: `_ds/boundfox-studios-design-system-0747e2df-62fc-4fe1-bbd4-f0e974f1e1a3/tokens/*.css`.

Target stack: Angular (SSR) + Tailwind v4. Every value below is read 1:1 from the design file — no
interpretation, no rounding. Where a value has no stock Tailwind class, the arbitrary value is given.

---

## 0. Token table (`_ds/.../tokens/*.css` → Tailwind v4 `@theme`)

### colors.css

| CSS variable | Value | Semantic alias(es) | Tailwind v4 theme var | Used on this page |
| --- | --- | --- | --- | --- |
| `--bfs-yellow` | `#ffeb3b` | `--accent-soft` | `--color-yellow` | header (active nav, DE, wordmark „STUDIOS"), footer (column titles, link hover) |
| `--bfs-amber` | `#ffc107` | `--accent`, `--focus-ring` | `--color-amber` | — (focus ring only) |
| `--bfs-orange` | `#ffa726` | `--accent-strong` | `--color-orange` | link hover color (`a:hover`), wordmark „BOUNDFOX" |
| `--bfs-ink` | `#171717` (neutral-900) | `--text-heading` | `--color-neutral-900` | H1 + all H2, header band bg, footer band bg |
| `--bfs-gray-700` | `#404040` (neutral-700) | `--text-body`, `--surface-inverse` | `--color-neutral-700` | all body copy (inherited from `body`) |
| `--bfs-gray-600` | `#525252` (neutral-600) | `--text-muted` | `--color-neutral-600` | header lang divider, footer top-border, footer „/" |
| `--bfs-gray-400` | `#a3a3a3` (neutral-400) | `--border-strong` | `--color-neutral-400` | footer bottom bar text |
| `--bfs-gray-300` | `#d4d4d4` (neutral-300) | — | `--color-neutral-300` | footer tagline |
| `--bfs-gray-200` | `#e5e5e5` (neutral-200) | `--border-default` | `--color-neutral-200` | — (not on this page) |
| `--bfs-gray-100` | `#f5f5f5` (neutral-100) | `--surface-subtle` | `--color-neutral-100` | — (not on this page) |
| `--bfs-white` | `#ffffff` | `--surface-page`, `--surface-card`, `--text-on-inverse` | `--color-white` | page background, header/footer text |
| `--link` | `#a16207` (stock yellow-700) | — | `--color-link` | the two inline links in §Kontakt |
| `--gradient-brand` | `linear-gradient(90deg,#ffeb3b,#ffa726)` | — | — | — (not on this page) |

### typography.css

| Variable | Value | Tailwind |
| --- | --- | --- |
| `--font-display` | `'Bebas Neue', sans-serif` | `--font-display` → `font-display` |
| `--font-script` | `'Tahu', cursive` | `--font-script` (unused on this page) |
| `--font-body` | `'Barlow', sans-serif` | `--font-sans` → default body face |
| `--text-xs` / `--text-sm` / `--text-base` / `--text-lg` | 12 / 14 / 16 / 18 px | `text-xs` / `text-sm` / `text-base` / `text-lg` |
| `--display-sm` / `--display-md` / `--display-lg` / `--display-xl` | 24 / 36 / 60 / 96 px | `text-2xl` / `text-4xl` / `text-6xl` / `text-8xl` |
| `--leading-tight` | `1` | `leading-none` |
| `--leading-snug` | `1.25` | `leading-tight` |
| `--leading-body` | `1.625` | `leading-relaxed` |
| `--tracking-display` | `0.025em` | `tracking-wide` |
| `--tracking-caps` | `0.1em` | `tracking-widest` |
| (inline, header/footer only) | `0.05em` | `tracking-wider` |

### spacing.css

`--space-1..9` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px (= Tailwind `1/2/3/4/6/8/12/16/24`).
`--radius-sm/md/lg/pill` = 4 / 8 / 12 / 9999 px. `--container-max` = **1152px** (`max-w-6xl`).

### effects.css

`--shadow-card` = `shadow-md`, `--shadow-raised` = `shadow-lg`,
`--shadow-accent` = `0 10px 15px -3px rgb(255 193 7/.3), 0 4px 6px -4px rgb(255 193 7/.3)`.
`--ease-standard` = `cubic-bezier(.4,0,.2,1)` (`ease-in-out`), `--dur-fast` = 150ms, `--dur-base` = 200ms.
None of the shadows appear on the Impressum page; only the 150ms color transition on links does.

### fonts.css

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
@font-face{font-family:'Tahu';src:url('assets/fonts/Tahu.ttf') format('truetype');font-weight:400;font-style:normal;font-display:swap}
```

Bebas Neue ships weight 400 only. Barlow needed: 400, 500, 600, 700 + italic 400. Tahu is **not**
used on this page — do not load it here if fonts are split per route.

### Suggested `@theme` (from README, verbatim)

```css
@import "tailwindcss";
@theme {
  --color-*: initial;
  --color-white: #fff;
  --color-yellow: #ffeb3b;
  --color-amber: #ffc107;
  --color-orange: #ffa726;
  --color-link: #a16207;
  --color-neutral-100: #f5f5f5; --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4; --color-neutral-400: #a3a3a3;
  --color-neutral-600: #525252; --color-neutral-700: #404040;
  --color-neutral-900: #171717;
  --font-display: "Bebas Neue", sans-serif;
  --font-script: "Tahu", cursive;
  --font-sans: "Barlow", sans-serif;
}
```

---

## 1. Global / document-level styles

From the page's inline `<style>` in `<helmet>` (identical on Datenschutz — put this into
`projects/website/src/styles.css`, not into the component):

```css
body { margin:0; background:#ffffff; font-family:'Barlow',sans-serif; color:#404040; }
a    { color:#a16207; text-decoration:none; transition:color 150ms ease-in-out; }
a:hover { color:#ffa726; }
```

Tailwind equivalent for the body: `bg-white font-sans text-neutral-700` + a base layer rule for `a`
(`text-link no-underline transition-colors duration-150 ease-in-out hover:text-orange`).

**Important:** headings carry an explicit `font-weight:400` in the design (Bebas Neue has no bold
cut). In Tailwind you must write `font-normal` on `h1`/`h2` or reset heading weight globally,
otherwise the browser default `bold` applies and the display face renders synthetically bolded.

---

## 2. Page shell

```html
<div style="min-height:100vh;display:flex;flex-direction:column;">
  <SiteHeader active="legal">          <!-- hint-size 100% × 64px -->
  <main style="flex:1;"> … </main>
  <SiteFooter>                         <!-- hint-size 100% × 340px -->
</div>
```

| Element | Property | Value | Tailwind |
| --- | --- | --- | --- |
| root wrapper | `min-height` | `100vh` | `min-h-screen` |
| root wrapper | `display` / `flex-direction` | `flex` / `column` | `flex flex-col` |
| `<main>` | `flex` | `1` | `flex-1` |

The wrapper is the app shell, not the imprint page — implement it once in `app.html`
(header / `<router-outlet>` inside `<main class="flex-1">` / footer) and let the route component
render only §3.

---

## 3. Content section — the only page-specific block

```html
<section style="max-width:760px;margin:0 auto;padding:64px 24px 72px;">
```

| Property | Exact value | Tailwind v4 |
| --- | --- | --- |
| `max-width` | **760px** (NOT 768px — `max-w-3xl` is wrong) | `max-w-[760px]` |
| horizontal centering | `margin:0 auto` | `mx-auto` |
| `padding-top` | 64px | `pt-16` |
| `padding-left` / `padding-right` | 24px | `px-6` |
| `padding-bottom` | 72px | `pb-18` (v4 dynamic spacing: 18 × 4px = 72px) |
| background | inherited white | — |
| grid/flex | none — normal block flow, vertical rhythm comes purely from heading margins | — |

There is **no** gap/grid on this page: spacing is produced exclusively by the `margin` values on
`h1`, `h2`, `p`. Do not replace it with `space-y-*` — the first H2 (40px) differs from the rest (32px).

### 3.1 H1

```html
<h1 style="margin:0;font-family:var(--font-display);font-weight:400;
           font-size:clamp(40px,5.5vw,60px);line-height:var(--leading-tight);
           letter-spacing:var(--tracking-display);color:var(--text-heading);">IMPRESSUM</h1>
```

| Property | Value | Tailwind |
| --- | --- | --- |
| `margin` | `0` (no bottom margin — the following H2 supplies the 40px) | `m-0` |
| `font-family` | Bebas Neue | `font-display` |
| `font-weight` | 400 | `font-normal` |
| `font-size` | `clamp(40px, 5.5vw, 60px)` | `text-[clamp(40px,5.5vw,60px)]` |
| `line-height` | `1` | `leading-none` |
| `letter-spacing` | `0.025em` | `tracking-wide` |
| `color` | `#171717` | `text-neutral-900` |
| casing | copy is already uppercase in the source; no `text-transform` is set | — |

Note the difference to Datenschutz: there the H1 has `margin:0 0 8px` because a Badge follows.
Here it is `margin:0`.

### 3.2 H2 (six occurrences)

```html
<h2 style="margin:40px 0 12px;   /* first H2 only */
           font-family:var(--font-display);font-weight:400;font-size:var(--display-sm);
           line-height:var(--leading-tight);letter-spacing:var(--tracking-display);
           color:var(--text-heading);">…</h2>
```

| Property | Value | Tailwind |
| --- | --- | --- |
| `margin` — **1st H2** („ANGABEN GEMÄSS § 5 DDG") | `40px 0 12px` | `mt-10 mb-3 mx-0` |
| `margin` — H2 #2…#6 | `32px 0 12px` | `mt-8 mb-3 mx-0` |
| `font-family` | Bebas Neue | `font-display` |
| `font-weight` | 400 | `font-normal` |
| `font-size` | `--display-sm` = 24px | `text-2xl` |
| `line-height` | `1` | `leading-none` |
| `letter-spacing` | `0.025em` | `tracking-wide` |
| `color` | `#171717` | `text-neutral-900` |

Margins do **not** collapse into anything unexpected: the H1 has `margin:0`, and each `<p>` has
`margin:0`, so the vertical rhythm is exactly `H1 → 40 → H2 → 12 → P → 32 → H2 → 12 → P → …`.

### 3.3 Paragraphs (six occurrences)

```html
<p style="margin:0;font-size:var(--text-base);line-height:var(--leading-body);">…</p>
```

| Property | Value | Tailwind |
| --- | --- | --- |
| `margin` | `0` | `m-0` |
| `font-size` | 16px | `text-base` |
| `line-height` | `1.625` | `leading-relaxed` |
| `font-family` | inherited Barlow | — |
| `color` | inherited `#404040` | — |
| `font-weight` | inherited 400 | — |

Line breaks inside the address / contact / VAT paragraphs are literal `<br>` elements, not separate
paragraphs — keep them as `<br>` so the 1.625 line-height governs the block.

### 3.4 Exact DOM order

1. `h1` IMPRESSUM
2. `h2` (mt-10) ANGABEN GEMÄSS § 5 DDG → `p` (4 lines, 3× `<br>`)
3. `h2` (mt-8) KONTAKT → `p` (3 lines, 2× `<br>`, 2 inline links)
4. `h2` (mt-8) UMSATZSTEUER-ID → `p` (2 lines, 1× `<br>`)
5. `h2` (mt-8) HAFTUNG FÜR INHALTE → `p`
6. `h2` (mt-8) HAFTUNG FÜR LINKS → `p`
7. `h2` (mt-8) URHEBERRECHT → `p`

---

## 4. Copy strings (verbatim German) with proposed i18n keys

Key namespace: `imprint.*` (route `/impressum`). Strings are byte-verbatim from the design file —
note „GEMÄSS", the spaced „§ 5", the spaced „§ 27 a", and the em dashes / typographic characters.

| # | i18n key | German string (verbatim) |
| --- | --- | --- |
| 1 | `imprint.title` | `IMPRESSUM` |
| 2 | `imprint.company.title` | `ANGABEN GEMÄSS § 5 DDG` |
| 3 | `imprint.company.body` | `Boundfox Studios<br>Inhaber: Manuel Rauber<br>Flamingoweg 68<br>70378 Stuttgart` |
| 4 | `imprint.contact.title` | `KONTAKT` |
| 5 | `imprint.contact.email-label` | `E-Mail: ` |
| 6 | `imprint.contact.email` | `info@boundfoxstudios.com` |
| 7 | `imprint.contact.website-label` | `Internet: ` |
| 8 | `imprint.contact.website` | `boundfoxstudios.com` |
| 9 | `imprint.contact.phone` | `Telefon: wegen Spam-Anrufen entfernt` |
| 10 | `imprint.vat.title` | `UMSATZSTEUER-ID` |
| 11 | `imprint.vat.body` | `Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:` |
| 12 | `imprint.vat.number` | `DE294345223` |
| 13 | `imprint.content-liability.title` | `HAFTUNG FÜR INHALTE` |
| 14 | `imprint.content-liability.body` | `Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.` |
| 15 | `imprint.link-liability.title` | `HAFTUNG FÜR LINKS` |
| 16 | `imprint.link-liability.body` | `Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren zu diesem Zeitpunkt nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.` |
| 17 | `imprint.copyright.title` | `URHEBERRECHT` |
| 18 | `imprint.copyright.body` | `Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der vorherigen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.` |

**18 page-level strings.** Keys 3, 5–9, 11–12 belong to one `<p>` each — if the i18n setup prefers
whole-paragraph messages with embedded markup, collapse 5–9 into `imprint.contact.body` and 11–12
into `imprint.vat.body` (then 14 strings, but the two link labels must stay interpolatable).

Legal-content note: only the German text exists. The English translations of §§ Haftung/Urheberrecht
must be produced (and legally reviewed) before the `/en` route ships — legal text is not a
mechanical translation.

### Shared-component copy (owned by header/footer, listed for completeness — do not duplicate keys)

| i18n key | String |
| --- | --- |
| `layout.header.logo-alt` | `Boundfox Studios` |
| `layout.header.wordmark-primary` | `BOUNDFOX` |
| `layout.header.wordmark-secondary` | `STUDIOS` |
| `layout.nav.home` | `STARTSEITE` |
| `layout.nav.projects` | `APPS & SPIELE` |
| `layout.nav.support` | `UNTERSTÜTZEN` |
| `layout.nav.socials` | `SOCIALS` |
| `layout.language.de` | `DE` |
| `layout.language.en` | `EN` |
| `layout.footer.tagline` | `Spiele und Apps — mit Liebe in Stuttgart entwickelt. Kostenlos und Open Source.` |
| `layout.footer.pages.title` | `SEITEN` |
| `layout.footer.pages.home` | `Startseite` |
| `layout.footer.pages.projects` | `Apps & Spiele` |
| `layout.footer.pages.support` | `Unterstützen` |
| `layout.footer.pages.socials` | `Socials` |
| `layout.footer.legal.title` | `RECHTLICHES` |
| `layout.footer.legal.imprint` | `Impressum` |
| `layout.footer.legal.privacy` | `Datenschutz` |
| `layout.footer.social.title` | `FOLGE UNS` |
| `layout.footer.social.github` | `GitHub` (link `title` attribute) |
| `layout.footer.social.discord` | `Discord` (link `title` attribute) |
| `layout.footer.social.youtube` | `YouTube` (link `title` attribute) |
| `layout.footer.copyright` | `© 2026 Boundfox Studios. Alle Rechte vorbehalten.` |
| `layout.footer.languages` | `Deutsch · English` |

---

## 5. Links

### On the Impressum page itself

| Label | `href` | Type | Styling |
| --- | --- | --- | --- |
| `info@boundfoxstudios.com` | `mailto:info@boundfoxstudios.com` | mail | global `a`: `#a16207`, no underline, hover `#ffa726`, `transition:color 150ms ease-in-out` |
| `boundfoxstudios.com` | `https://boundfoxstudios.com` | external (same domain, absolute in design) | same |

No `target="_blank"` / `rel` is set in the design. For the external website link, adding
`rel="noopener"` is a safe production hardening; keep it same-tab to match the design.

### Header links (shared component, rendered on this page)

| Label | Design href | Angular route |
| --- | --- | --- |
| Logo (fox head + wordmark) | `Startseite.dc.html` | `/` |
| `STARTSEITE` | `Startseite.dc.html` | `/` |
| `APPS & SPIELE` | `Spiele und Apps.dc.html` | `/apps-und-spiele` |
| `UNTERSTÜTZEN` | `Unterstuetzen.dc.html` | `/unterstuetzen` |
| `SOCIALS` | `Socials.dc.html` | `/socials` |
| `DE` | `#` | current locale (active) |
| `EN` | `#` | `/en/...` locale switch |

### Footer links (shared component)

| Label | Design href | Angular route / URL |
| --- | --- | --- |
| `Startseite` | `Startseite.dc.html` | `/` |
| `Apps & Spiele` | `Spiele und Apps.dc.html` | `/apps-und-spiele` |
| `Unterstützen` | `Unterstuetzen.dc.html` | `/unterstuetzen` |
| `Socials` | `Socials.dc.html` | `/socials` |
| `Impressum` | `Impressum.dc.html` | `/impressum` |
| `Datenschutz` | `Datenschutz.dc.html` | `/datenschutz` |
| GitHub icon | `https://github.com/BoundfoxStudios` | external |
| Discord icon | `https://discord.gg/tHqNzMT` | external |
| YouTube icon | `https://youtube.com/c/boundfox` | external |

---

## 6. Shared components rendered on this page

### 6.1 `SiteHeader` — prop `active`

Prop contract from the design file:
`active: 'start' | 'projekte' | 'support' | 'socials' | 'legal'`, default `'start'`.
**Impressum passes `active="legal"`** ⇒ *no* nav item is highlighted (all four render in the
inactive state: white text, `border-bottom:2px solid transparent`).

| Element | Property | Value | Tailwind |
| --- | --- | --- | --- |
| `<header>` | background | `#171717` | `bg-neutral-900` |
| `<header>` | color | `#ffffff` | `text-white` |
| inner container | `max-width` | 1152px | `max-w-6xl` |
| inner container | `margin` | `0 auto` | `mx-auto` |
| inner container | `padding` | `8px 24px` | `py-2 px-6` |
| inner container | `min-height` | 48px (⇒ band = 64px total) | `min-h-12` |
| inner container | flex | `flex; align-items:center; gap:16px; flex-wrap:wrap` | `flex items-center gap-4 flex-wrap` |
| logo `<a>` | flex | `flex; align-items:center; gap:10px` | `flex items-center gap-[10px]` |
| logo `<a>` | color / decoration | `#ffffff` / `none` | `text-white no-underline` |
| logo `<img>` | size / fit | `32×32`, `object-fit:contain` | `w-8 h-8 object-contain` |
| wordmark `<span>` | font | Bebas 24px, `letter-spacing:0.05em`, `line-height:1`, `white-space:nowrap` | `font-display text-2xl tracking-wider leading-none whitespace-nowrap` |
| wordmark „BOUNDFOX" | color | `#ffa726` | `text-orange` |
| wordmark „STUDIOS" | color | `#ffeb3b` | `text-yellow` |
| `<nav>` | layout | `flex; gap:4px; margin-left:auto; align-items:center; flex-wrap:wrap` | `flex gap-1 ml-auto items-center flex-wrap` |
| nav `<a>` | padding | `8px 12px` | `py-2 px-3` |
| nav `<a>` | font | Bebas 16px, `letter-spacing:0.05em`, no underline | `font-display text-base tracking-wider no-underline` |
| nav `<a>` inactive | color / border-bottom | `#ffffff` / `2px solid transparent` | `text-white border-b-2 border-transparent` |
| nav `<a>` active | color / border-bottom | `#ffeb3b` / `2px solid #ffeb3b` | `text-yellow border-b-2 border-yellow` |
| nav `<a>` hover | color | `#ffeb3b` (150ms ease-in-out) | `hover:text-yellow transition-colors duration-150 ease-in-out` |
| lang switcher | layout | `flex; gap:8px; align-items:center` | `flex gap-2 items-center` |
| lang switcher | font | Bebas 14px, `letter-spacing:0.05em` | `font-display text-sm tracking-wider` |
| lang switcher | separator | `border-left:1px solid #525252; padding-left:16px` | `border-l border-neutral-600 pl-4` |
| `DE` (active) | color | `#ffeb3b` | `text-yellow` |
| `/` glyph | color | `#525252` | `text-neutral-600` |
| `EN` | color / hover | `#ffffff` / `#ffeb3b` | `text-white hover:text-yellow` |

Mobile: the design only wraps via `flex-wrap`. A real burger menu is **missing from the design** and
must be designed/added for Angular (README explicitly says so).

### 6.2 `SiteFooter` — no props

| Element | Property | Value | Tailwind |
| --- | --- | --- | --- |
| `<footer>` | background / color / font | `#171717` / `#ffffff` / Barlow | `bg-neutral-900 text-white font-sans` |
| top container | `max-width` / `margin` | 1152px / `0 auto` | `max-w-6xl mx-auto` |
| top container | `padding` | `48px 24px 0` | `pt-12 px-6 pb-0` |
| top container | grid | `display:grid; grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr)); gap:32px` | `grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-8` |
| column 1 | layout | `flex; flex-direction:column; gap:12px` | `flex flex-col gap-3` |
| logo row | layout | `flex; align-items:center; gap:10px` | `flex items-center gap-[10px]` |
| logo `<img>` | size / fit | `40×40`, `object-fit:contain`, `alt=""` | `w-10 h-10 object-contain` |
| wordmark | font | Bebas 24px, `letter-spacing:0.05em`, `line-height:1` | `font-display text-2xl tracking-wider leading-none` |
| tagline `<p>` | `margin` / size / leading / color / width | `0` / 14px / 1.625 / `#d4d4d4` / `max-width:320px` | `m-0 text-sm leading-relaxed text-neutral-300 max-w-[320px]` |
| columns 2–4 | layout | `flex; flex-direction:column; gap:10px` | `flex flex-col gap-[10px]` |
| column title `<span>` | font / color | Bebas 16px, `letter-spacing:0.05em`, `#ffeb3b` | `font-display text-base tracking-wider text-yellow` |
| column link `<a>` | color / size / decoration / hover | `#ffffff` / 14px / none / `#ffeb3b` | `text-white text-sm no-underline hover:text-yellow` |
| social row | layout | `flex; gap:12px` | `flex gap-3` |
| social `<a>` | color / hover | `#ffffff` / `#ffeb3b` | `text-white hover:text-yellow` |
| social `<svg>` | size / viewBox / fill | `20×20`, `0 0 24 24`, `fill="currentColor"` | `w-5 h-5` |
| bottom bar | `max-width` / `margin` / `padding` | 1152px / `24px auto 0` / `16px 24px` | `max-w-6xl mt-6 mx-auto mb-0 py-4 px-6` |
| bottom bar | border-top | `1px solid #525252` | `border-t border-neutral-600` |
| bottom bar | layout | `flex; justify-content:space-between; gap:16px; flex-wrap:wrap` | `flex justify-between gap-4 flex-wrap` |
| bottom bar `<span>` | size / color | 12px / `#a3a3a3` | `text-xs text-neutral-400` |

Design hint-size for the footer band: **340px** tall at 1280px viewport.

### 6.3 Components this page needs

| Component | Used here? | Props / variants |
| --- | --- | --- |
| `SiteHeader` | yes | `active: 'start'\|'projekte'\|'support'\|'socials'\|'legal'` — pass `'legal'` |
| `SiteFooter` | yes | none |
| `PageShell` (app shell: `min-h-screen flex flex-col` + `<main class="flex-1">`) | yes | content projection |
| `LegalPage` / `legal-prose` wrapper (`max-w-[760px] mx-auto pt-16 px-6 pb-18`) | yes — shared 1:1 with `/datenschutz` | content projection; optional `badge` slot (Datenschutz only) |
| `LegalSection` (H2 `text-2xl` + body slot; `mt-10` for the first, `mt-8` for the rest) | yes | `title`, `first?: boolean` (or `:first-of-type` CSS) |
| `Badge` (DS component) | **no** on Impressum — used on Datenschutz | `variant: 'yellow'\|'amber'\|'orange'\|'dark'\|'outline'`; base: `inline-flex items-center py-[2px] px-[10px] rounded-full font-sans text-xs font-bold tracking-wider uppercase`; `outline` = transparent bg, `#171717` text, `1px solid #a3a3a3` |
| Inline text link | yes (2×) | styled globally, no component needed |

The `LegalPage` + `LegalSection` pair is worth extracting because Impressum and Datenschutz are
structurally identical (same 760px column, same paddings, same heading margins, same body type).

---

## 7. Assets & icons

**The Impressum page references no images, icons or SVGs of its own.** Everything visual comes from
the two shared components:

| Asset | Where | Size on screen | Notes |
| --- | --- | --- | --- |
| `assets/fox-head.png` | header logo | 32×32, `object-contain`, `alt="Boundfox Studios"` | full-colour mark only; never on yellow/gradient |
| `assets/fox-head.png` | footer logo | 40×40, `object-contain`, `alt=""` (decorative) | same file |
| GitHub glyph | footer social row | inline `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">`, single `<path>` | brand glyph, copy path data from `SiteFooter.dc.html` line 43 |
| Discord glyph | footer social row | same dimensions, single `<path>` | `SiteFooter.dc.html` line 44 |
| YouTube glyph | footer social row | same dimensions, single `<path>` | `SiteFooter.dc.html` line 45 |
| `Tahu.ttf` | — | — | **not** used on this page |

Available but unused here: `assets/logo-lockup.png`, `assets/mat-dark.svg`, `assets/mat-light.svg`,
`assets/flugwacht-wordmark.svg`, `assets/flugwacht-radar.svg`, `assets/bug-a-ball.svg` (the broken one).

---

## 8. Responsive behaviour

There are **no media queries and no `minmax()` grids on the Impressum page itself**. Fluidity comes
from exactly two mechanisms:

1. `max-width:760px` + `margin:0 auto` — below 760px + 48px of padding the column simply fills the
   viewport; the 24px side padding is constant at every breakpoint.
2. `font-size: clamp(40px, 5.5vw, 60px)` on the H1 — 40px below ~727px viewport width, fluid at
   5.5vw between ~727px and ~1091px, capped at 60px above ~1091px.

Everything else (24px paddings, 40/32/12px heading margins, 16px/1.625 body) is fixed at all sizes.

Shared components do carry responsive rules:
- Header: `flex-wrap` on the container and on `<nav>` — items stack/wrap on narrow viewports.
- Footer: `grid-template-columns: repeat(auto-fit, minmax(min(220px,100%), 1fr))` — 4 columns at
  ≥ 1152px, dropping to 3 / 2 / 1 as width shrinks; `min(220px,100%)` prevents overflow below 220px.
  Bottom bar uses `flex-wrap` so the two spans stack under ~500px.

---

## 9. Interaction / motion

Only one interaction exists on this page: link hover.

```css
a { transition: color 150ms ease-in-out; }        /* cubic-bezier(.4,0,.2,1) */
a:hover { color:#ffa726; }                        /* from #a16207 */
```

No underlines, no transforms, no shadows, no scaling. Header/footer links follow the same 150ms
color-only transition (white → `#ffeb3b`).

Accessibility additions not present in the design but required for production:
- visible focus ring using `--focus-ring` (`#ffc107`) — the design defines the token but no state.
- `#a16207` on white = 4.6:1 contrast (passes AA for body text); `#ffa726` hover on white is only
  ~2:1 — acceptable as a *hover* accent alongside the persistent color difference, but do not use
  `#ffa726` as a resting link color.
- `lang="de"` on `<html>`, and `hreflang` alternates once `/en` exists.

---

## 10. Angular implementation checklist

1. Route `/impressum` → standalone component (e.g. `projects/website/src/app/pages/imprint/imprint.ts`),
   prerendered (`RenderMode.Prerender` in `app.routes.server.ts` — the page is fully static).
2. Header receives `active="legal"`; drive it from the router (`/impressum` and `/datenschutz` → `legal`).
3. `<title>` / meta description are not defined in the design — propose
   `Impressum — Boundfox Studios` and a short description; add `robots: index,follow`.
4. Extract `LegalPage` + `LegalSection` before building Datenschutz, so both pages share the shell.
5. Reset heading weights (`font-normal`) — Bebas Neue has no bold cut.
6. Keep `max-w-[760px]`; do **not** substitute `max-w-3xl` (768px).
7. `pb-18` (72px) is a v4 dynamic spacing value — verify it emits; otherwise `pb-[72px]`.
