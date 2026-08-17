# Design Reference — Datenschutz (`/datenschutz`)

Source: `design_handoff_website_redesign/Datenschutz.dc.html` (53 lines, inline styles, prototype runtime ignored).
Target stack: Angular 22 SSR + Tailwind v4 (`projects/website`).
Layout twin: `Impressum.dc.html` — identical shell, identical type scale. The only structural differences are listed in [§9](#9-delta-to-impressum).

---

## 1. Page shell

```
div[data-screen-label="Datenschutz"]      min-height:100vh; display:flex; flex-direction:column
├── <dc-import name="SiteHeader" active="legal">   (hint 100% × 64px)
├── <main style="flex:1">
│   └── <section>                          the whole page content, see §3
└── <dc-import name="SiteFooter">          (hint 100% × 340px)
```

Global page styles (from the file's inline `<style>` in `<helmet>`, identical to `Impressum.dc.html`):

```css
body {
  margin: 0;
  background: var(--surface-page);
  color: var(--text-body);
  font-family: var(--font-body);
}
a {
  transition: color 150ms ease-in-out;
  color: var(--link);
  text-decoration: none;
}
a:hover {
  color: var(--accent-strong);
}
```

Resolved: `background:#ffffff`, `font-family:'Barlow',sans-serif`, `color:#404040`, link `#a16207`, link-hover `#ffa726`.
(`tokens/effects.css` already carries the same `a` / `a:hover` rules — do not duplicate them per page; put them once in `styles.css`.)

**Recommendation:** the `min-height:100vh` flex column + header + `<main flex:1>` + footer belongs in the app shell (`app.html`), not in the page component. The page component renders only the `<section>` from §3.

---

## 2. SiteHeader (shared, `active="legal"`)

Included on this page; full spec so the page can be rebuilt without opening `SiteHeader.dc.html`.

| Element         | Values                                                                                                                                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<header>` band | `background: var(--bfs-ink)` `#171717`; `color:#ffffff`                                                                                                                                                                                                                     |
| Inner container | `max-width: var(--container-max)` = **1152px**; `margin:0 auto`; `padding: 8px 24px`; `min-height:48px`; `display:flex`; `align-items:center`; `gap:16px`; `flex-wrap:wrap` → total band height **64px** (8 + 48 + 8)                                                       |
| Logo link       | `display:flex; align-items:center; gap:10px; color:#ffffff; text-decoration:none` → href `/`                                                                                                                                                                                |
| Logo image      | `assets/fox-head.png`, `width:32px; height:32px; object-fit:contain`, `alt="Boundfox Studios"`                                                                                                                                                                              |
| Wordmark        | `font-family:var(--font-display)`; `font-size:24px`; `letter-spacing:0.05em`; `line-height:1`; `white-space:nowrap`; „BOUNDFOX" `var(--bfs-orange)` `#ffa726`, space, „STUDIOS" `var(--bfs-yellow)` `#ffeb3b`                                                               |
| `<nav>`         | `display:flex; gap:4px; margin-left:auto; align-items:center; flex-wrap:wrap`                                                                                                                                                                                               |
| Nav link        | `padding:8px 12px`; `font-family:var(--font-display)`; `font-size:16px`; `letter-spacing:0.05em`; `text-decoration:none`; `border-bottom:2px solid <transparent                                                                                                             | #ffeb3b>`; color `#ffffff`(inactive) /`#ffeb3b`(active); hover →`#ffeb3b` |
| Language switch | `display:flex; gap:8px; align-items:center; font-family:var(--font-display); font-size:14px; letter-spacing:0.05em; border-left:1px solid var(--bfs-gray-600) (#525252); padding-left:16px`. `DE` = `#ffeb3b`, separator `/` = `#525252`, `EN` = `#ffffff`, hover `#ffeb3b` |

**Critical for this page:** `active="legal"` matches _none_ of the nav keys (`start`, `projekte`, `support`, `socials`). The header logic
`const v = (k) => ({ c: a===k ? on : off, b: a===k ? on : un })` therefore renders **all four nav items inactive** — white text, `border-bottom:2px solid transparent`. Do not highlight anything in the nav on `/impressum` and `/datenschutz`.

Header prop contract (from the prototype's `data-props`): `active: 'start' | 'projekte' | 'support' | 'socials' | 'legal'`, default `'start'`.

---

## 3. Main section — exact layout

```html
<section style="max-width:760px;margin:0 auto;padding:64px 24px 72px;"></section>
```

| Property         | Value                                                                                                                                  | Tailwind v4                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `max-width`      | **760px** (not on the stock scale — `max-w-3xl` is 768px)                                                                              | `max-w-legal` via `@theme { --container-legal: 760px; }`, or `max-w-[760px]` |
| `margin`         | `0 auto`                                                                                                                               | `mx-auto`                                                                    |
| `padding-top`    | **64px**                                                                                                                               | `pt-16`                                                                      |
| `padding-inline` | **24px**                                                                                                                               | `px-6`                                                                       |
| `padding-bottom` | **72px**                                                                                                                               | `pb-18` (v4 dynamic spacing: 18 × 4px)                                       |
| Breakpoints      | none — no media query anywhere on this page. Column is fluid below `760 + 2×24 = 808px` viewport; only the H1 responds, via `clamp()`. |

### 3.1 Vertical rhythm (top → bottom, all margins are literal; no collapsing pairs because every `<p>` has `margin:0` on the touching side)

| #   | Node                                          | margin-top | box height                                                   | margin-bottom |
| --- | --------------------------------------------- | ---------- | ------------------------------------------------------------ | ------------- |
| —   | section `padding-top`                         | —          | 64px                                                         | —             |
| 1   | `h1` DATENSCHUTZERKLÄRUNG                     | 0          | `clamp(40px,5.5vw,60px)` (`line-height:1` ⇒ box = font-size) | **8px**       |
| 2   | Badge (inline-flex, in an anonymous line box) | 0          | ≈22px (see §6.1)                                             | 0             |
| 3   | `h2` 1. VERANTWORTLICHER                      | **40px**   | 24px                                                         | **12px**      |
| 4   | `p` (3 lines via `<br>`)                      | 0          | 3 × 26px = 78px                                              | 0             |
| 5   | `h2` 2. DAS WICHTIGSTE VORAB                  | **32px**   | 24px                                                         | **12px**      |
| 6   | `p`                                           | 0          | n × 26px                                                     | 0             |
| 7   | `h2` 3. HOSTING & SERVER-LOGFILES             | **32px**   | 24px                                                         | **12px**      |
| 8   | `p`                                           | 0          | n × 26px                                                     | 0             |
| 9   | `h2` 4. EXTERNE LINKS                         | **32px**   | 24px                                                         | **12px**      |
| 10  | `p`                                           | 0          | n × 26px                                                     | 0             |
| 11  | `h2` 5. KONTAKT PER E-MAIL                    | **32px**   | 24px                                                         | **12px**      |
| 12  | `p`                                           | 0          | n × 26px                                                     | 0             |
| 13  | `h2` 6. DEINE RECHTE                          | **32px**   | 24px                                                         | **12px**      |
| 14  | `p`                                           | 0          | n × 26px                                                     | 0             |
| 15  | `p` Stand: August 2026                        | **32px**   | 14px × normal leading                                        | 0             |
| —   | section `padding-bottom`                      | —          | 72px                                                         | —             |

Body line box = `16px × 1.625` = **26px** exactly.
H2 box = `24px × 1` = **24px** exactly.

### 3.2 H1

```css
margin: 0 0 8px;
font-family: var(--font-display); /* 'Bebas Neue', sans-serif */
font-weight: 400;
font-size: clamp(40px, 5.5vw, 60px);
line-height: var(--leading-tight); /* 1 */
letter-spacing: var(--tracking-display); /* 0.025em */
color: var(--text-heading); /* #171717 */
```

`5.5vw` hits the 40px floor at viewport ≤ **727px** and the 60px ceiling at viewport ≥ **1091px**.

Tailwind: `mb-2 font-display font-normal text-[clamp(40px,5.5vw,60px)] leading-none tracking-wide text-neutral-900`.

### 3.3 H2 (all six)

```css
margin: 40px 0 12px; /* FIRST h2 only */
margin: 32px 0 12px; /* h2 #2 … #6 */
font-family: var(--font-display);
font-weight: 400;
font-size: var(--display-sm); /* 24px */
line-height: var(--leading-tight); /* 1 */
letter-spacing: var(--tracking-display); /* 0.025em */
color: var(--text-heading); /* #171717 */
```

Tailwind: `mt-10 mb-3 …` (first) / `mt-8 mb-3 …` (rest) + `font-display font-normal text-2xl leading-none tracking-wide text-neutral-900`.
`text-2xl` ships its own `line-height:2rem` in v4 — the explicit `leading-none` is mandatory.

### 3.4 Body paragraphs (§1–§6)

```css
margin: 0;
font-size: var(--text-base); /* 16px */
line-height: var(--leading-body); /* 1.625 */
/* color inherited from body: var(--text-body) = #404040 */
```

Tailwind: `m-0 text-base leading-relaxed` (`leading-relaxed` = 1.625 exactly) — color inherited from the shell (`text-neutral-700`).

### 3.5 Stand-line (last paragraph)

```css
margin: 32px 0 0;
font-size: var(--text-sm); /* 14px */
color: var(--text-muted); /* #525252 = neutral-600 */
```

No `line-height` override — browser default (`normal`) applies.
Tailwind: `mt-8 text-sm text-neutral-600`.

---

## 4. Copy — verbatim German + proposed i18n keys

Namespace `privacy.*`. All strings are the **exact** rendered text (HTML entities resolved: `&amp;` → `&`, `&nbsp;` → U+00A0, `—` = em dash U+2014, `–` in "15–21" = en dash U+2013).

| #   | i18n key                           | Element           | Verbatim German                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ---------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `privacy.title`                    | `h1`              | `DATENSCHUTZERKLÄRUNG`                                                                                                                                                                                                                                                                                                                                                                                       |
| 2   | `privacy.draft-badge`              | Badge             | `Entwurf — vor Veröffentlichung rechtlich prüfen`                                                                                                                                                                                                                                                                                                                                                            |
| 3   | `privacy.controller.heading`       | `h2`              | `1. VERANTWORTLICHER`                                                                                                                                                                                                                                                                                                                                                                                        |
| 4   | `privacy.controller.owner-line`    | `p` line 1        | `Boundfox Studios, Inhaber: Manuel Rauber`                                                                                                                                                                                                                                                                                                                                                                   |
| 5   | `privacy.controller.address-line`  | `p` line 2        | `Flamingoweg 68, 70378 Stuttgart`                                                                                                                                                                                                                                                                                                                                                                            |
| 6   | `privacy.controller.email-label`   | `p` line 3 prefix | `E-Mail: ` (trailing space before the link)                                                                                                                                                                                                                                                                                                                                                                  |
| 7   | `privacy.controller.email-address` | `a` text          | `info@boundfoxstudios.com`                                                                                                                                                                                                                                                                                                                                                                                   |
| 8   | `privacy.essentials.heading`       | `h2`              | `2. DAS WICHTIGSTE VORAB`                                                                                                                                                                                                                                                                                                                                                                                    |
| 9   | `privacy.essentials.body`          | `p`               | `Diese Website kommt ohne Cookies, ohne Tracking und ohne Analyse-Tools aus. Es werden keine personenbezogenen Daten zu Werbezwecken erhoben, gespeichert oder an Dritte weitergegeben.`                                                                                                                                                                                                                     |
| 10  | `privacy.hosting.heading`          | `h2`              | `3. HOSTING & SERVER-LOGFILES`                                                                                                                                                                                                                                                                                                                                                                               |
| 11  | `privacy.hosting.body`             | `p`               | `Beim Aufruf dieser Website verarbeitet der Hosting-Anbieter automatisch technische Zugriffsdaten (z. B. IP-Adresse, Datum und Uhrzeit des Abrufs, aufgerufene Seite, Browsertyp). Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO aus unserem berechtigten Interesse an einem sicheren und stabilen Betrieb der Website. Die Logfiles werden nach kurzer Zeit automatisch gelöscht.`  |
| 12  | `privacy.external-links.heading`   | `h2`              | `4. EXTERNE LINKS`                                                                                                                                                                                                                                                                                                                                                                                           |
| 13  | `privacy.external-links.body`      | `p`               | `Diese Website verlinkt auf externe Plattformen wie YouTube, Discord, GitHub, Patreon und Ko-Fi. Inhalte dieser Anbieter werden nicht eingebettet — erst wenn du einem Link folgst, gelten die Datenschutzbestimmungen des jeweiligen Anbieters.`                                                                                                                                                            |
| 14  | `privacy.email-contact.heading`    | `h2`              | `5. KONTAKT PER E-MAIL`                                                                                                                                                                                                                                                                                                                                                                                      |
| 15  | `privacy.email-contact.body`       | `p`               | `Wenn du uns per E-Mail kontaktierst, verarbeiten wir deine Angaben ausschließlich zur Beantwortung deiner Anfrage (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Die Daten werden gelöscht, sobald sie für diesen Zweck nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.`                                                                                                         |
| 16  | `privacy.rights.heading`           | `h2`              | `6. DEINE RECHTE`                                                                                                                                                                                                                                                                                                                                                                                            |
| 17  | `privacy.rights.body`              | `p`               | `Du hast das Recht auf Auskunft über die dich betreffenden personenbezogenen Daten sowie auf Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO). Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren — für Baden-Württemberg ist das der Landesbeauftragte für den Datenschutz und die Informationsfreiheit.` |
| 18  | `privacy.last-updated`             | `p`               | `Stand: August 2026`                                                                                                                                                                                                                                                                                                                                                                                         |

> In row 11, ` ` stands for the literal non-breaking space of `z.&nbsp;B.` — write it as `&nbsp;` in the template or as a real U+00A0 in the translation file, never as a plain space.

Rows 4–7 form one `<p>` with two `<br>` separators. Options: (a) four keys as above with `<br>` in the template, (b) a single key `privacy.controller.body` carrying markup. (a) keeps the mailto link out of the translation string and is preferred.

Not in the design, but required for the route (SSR `Title`/`Meta`):

| key                        | suggested value                           |
| -------------------------- | ----------------------------------------- |
| `privacy.meta.title`       | `Datenschutzerklärung – Boundfox Studios` |
| `privacy.meta.description` | free — the design specifies none          |

### 4.1 Shared strings also rendered on this page (own the keys in the shell, not here)

Header: `layout.header.nav.home` `STARTSEITE` · `layout.header.nav.projects` `APPS & SPIELE` · `layout.header.nav.support` `UNTERSTÜTZEN` · `layout.header.nav.socials` `SOCIALS` · `layout.header.language.de` `DE` · `layout.header.language.en` `EN` · `layout.header.logo-alt` `Boundfox Studios`.
Footer: `layout.footer.tagline` `Spiele und Apps — mit Liebe in Stuttgart entwickelt. Kostenlos und Open Source.` · `layout.footer.pages.heading` `SEITEN` · `Startseite` · `Apps & Spiele` · `Unterstützen` · `Socials` · `layout.footer.legal.heading` `RECHTLICHES` · `Impressum` · `Datenschutz` · `layout.footer.social.heading` `FOLGE UNS` · link titles `GitHub` / `Discord` / `YouTube` · `layout.footer.copyright` `© 2026 Boundfox Studios. Alle Rechte vorbehalten.` · `layout.footer.languages` `Deutsch · English`.

---

## 5. Tokens used on this page → CSS variables → Tailwind v4

### 5.1 Colors (`_ds/…/tokens/colors.css`)

| Used for                          | Token in the design file        | Resolves to      | Hex                   | Tailwind v4                                |
| --------------------------------- | ------------------------------- | ---------------- | --------------------- | ------------------------------------------ |
| Page background                   | `--surface-page`                | `--bfs-white`    | `#ffffff`             | `bg-white`                                 |
| Body text (inherited)             | `--text-body`                   | `--bfs-gray-700` | `#404040`             | `text-neutral-700`                         |
| H1 + all H2                       | `--text-heading`                | `--bfs-ink`      | `#171717`             | `text-neutral-900`                         |
| Stand-line                        | `--text-muted`                  | `--bfs-gray-600` | `#525252`             | `text-neutral-600`                         |
| Badge text (outline variant)      | `--text-heading`                | `--bfs-ink`      | `#171717`             | `text-neutral-900`                         |
| Badge border (outline variant)    | `--border-strong`               | `--bfs-gray-400` | `#a3a3a3`             | `border-neutral-400`                       |
| mailto link                       | `--link`                        | —                | `#a16207`             | `text-link` (custom, = stock `yellow-700`) |
| mailto link hover                 | `--accent-strong`               | `--bfs-orange`   | `#ffa726`             | `hover:text-orange`                        |
| Header/Footer band                | `--bfs-ink`                     | —                | `#171717`             | `bg-neutral-900`                           |
| Header/Footer accents             | `--bfs-yellow` / `--bfs-orange` | —                | `#ffeb3b` / `#ffa726` | `text-yellow` / `text-orange`              |
| Header divider, footer border-top | `--bfs-gray-600`                | —                | `#525252`             | `border-neutral-600`                       |
| Footer tagline                    | `--bfs-gray-300`                | —                | `#d4d4d4`             | `text-neutral-300`                         |
| Footer bottom row                 | `--bfs-gray-400`                | —                | `#a3a3a3`             | `text-neutral-400`                         |

Unused on this page but part of the palette: `--bfs-amber #ffc107`, `--bfs-gray-200 #e5e5e5`, `--bfs-gray-100 #f5f5f5`, `--gradient-brand`.

### 5.2 Typography (`_ds/…/tokens/typography.css`)

| Token                | Value                      | Used by                            | Tailwind v4                     |
| -------------------- | -------------------------- | ---------------------------------- | ------------------------------- |
| `--font-display`     | `'Bebas Neue', sans-serif` | H1, all H2, header/footer labels   | `font-display`                  |
| `--font-body`        | `'Barlow', sans-serif`     | body, paragraphs, badge            | `font-sans`                     |
| `--font-script`      | `'Tahu', cursive`          | **not used on this page**          | `font-script`                   |
| `--text-xs`          | 12px                       | badge, footer bottom row           | `text-xs`                       |
| `--text-sm`          | 14px                       | Stand-line, footer links           | `text-sm`                       |
| `--text-base`        | 16px                       | all body paragraphs                | `text-base`                     |
| `--text-lg`          | 18px                       | not used here                      | `text-lg`                       |
| `--display-sm`       | 24px                       | all six H2, header/footer wordmark | `text-2xl` (+ `leading-none`)   |
| `--display-lg`       | 60px                       | H1 clamp ceiling                   | inside `text-[clamp(…)]`        |
| `--leading-tight`    | **1**                      | H1, H2                             | `leading-none` ⚠️ name mismatch |
| `--leading-body`     | 1.625                      | body paragraphs                    | `leading-relaxed`               |
| `--tracking-display` | 0.025em                    | H1, H2                             | `tracking-wide`                 |
| `--tracking-caps`    | 0.1em                      | not used here                      | `tracking-widest`               |
| (literal)            | 0.05em                     | badge, header/footer labels        | `tracking-wider`                |

Font loading: `tokens/fonts.css` imports Google Fonts `Bebas+Neue` + `Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400` and `@font-face`s Tahu from `assets/fonts/Tahu.ttf`. For SSR, self-host both Google families (or `<link rel="preconnect">` + `display=swap`); Tahu is not needed by this route.

### 5.3 Spacing / radius / effects

| Token                            | Value                             | Used on this page                                                          |
| -------------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `--space-2`                      | 8px                               | H1 `margin-bottom`                                                         |
| `--space-3`                      | 12px                              | H2 `margin-bottom`                                                         |
| `--space-5`                      | 24px                              | section horizontal padding                                                 |
| `--space-6`                      | 32px                              | H2 `margin-top` (#2–#6), Stand-line `margin-top`                           |
| `--space-8`                      | 64px                              | section `padding-top`                                                      |
| —                                | 40px                              | first H2 `margin-top` (= `space-7`/48 is _not_ used; literal 40px)         |
| —                                | 72px                              | section `padding-bottom` (between `space-7` 48 and `space-8` 64 — literal) |
| `--radius-pill`                  | 9999px                            | Badge                                                                      |
| `--container-max`                | 1152px                            | header + footer only, **not** the content column                           |
| `--dur-fast` / `--ease-standard` | 150ms / `cubic-bezier(.4,0,.2,1)` | link color transition                                                      |

No shadow token is used on this page (`--shadow-card`, `--shadow-raised`, `--shadow-accent` are unused here).

---

## 6. Reusable components on this page

### 6.1 `Badge` (design-system component, `components/display/Badge.jsx`)

Usage in the file:

```html
<x-import
  component-from-global-scope="…Badge"
  variant="outline"
  >Entwurf — vor Veröffentlichung rechtlich prüfen</x-import
>
```

Full source of the base styles (all variants share these):

```css
display: inline-flex;
align-items: center;
padding: 2px 10px;
border-radius: var(--radius-pill); /* 9999px */
font-family: var(--font-body); /* Barlow */
font-size: 12px;
font-weight: 700;
letter-spacing: 0.05em;
text-transform: uppercase;
```

Variant map — the component supports exactly these five:

| `variant`                 | background                      | color                           | border                                     |
| ------------------------- | ------------------------------- | ------------------------------- | ------------------------------------------ |
| `yellow` (default)        | `var(--bfs-yellow)` `#ffeb3b`   | `var(--bfs-ink)` `#171717`      | —                                          |
| `amber`                   | `var(--bfs-amber)` `#ffc107`    | `#171717`                       | —                                          |
| `orange`                  | `var(--bfs-orange)` `#ffa726`   | `#171717`                       | —                                          |
| `dark`                    | `var(--bfs-gray-700)` `#404040` | `var(--bfs-yellow)` `#ffeb3b`   | —                                          |
| **`outline`** ← used here | `transparent`                   | `var(--text-heading)` `#171717` | `1px solid var(--border-strong)` `#a3a3a3` |

Angular API: `<app-badge variant="outline">` with `variant = input<'yellow'|'amber'|'orange'|'dark'|'outline'>('yellow')` and `<ng-content>`; render as `<span>`.
Tailwind: `inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-bold uppercase tracking-wider` + variant classes (`outline`: `border border-neutral-400 bg-transparent text-neutral-900`).

Note `text-transform:uppercase` — the badge copy is written in sentence case but **renders as** `ENTWURF — VOR VERÖFFENTLICHUNG RECHTLICH PRÜFEN`. Keep the source string sentence-case (as above) and let CSS uppercase it.

**Height caveat:** the prototype's `hint-size="auto,22px"` reflects the anonymous line box (Barlow 16px strut vs. the ~20px inline-flex badge). If you want a deterministic 8px gap, drop `mb-2` from the H1 and wrap the badge: `<div class="mt-2 flex"><app-badge …/></div>`. Visual delta ≤ 2px.

### 6.2 `SiteHeader` — see §2. Props: `active: 'start'|'projekte'|'support'|'socials'|'legal'`; this page passes `legal` (⇒ nothing highlighted).

### 6.3 `SiteFooter` — no props. Spec (needed because it renders on this page):

| Part              | Values                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<footer>`        | `background: var(--bfs-ink)` `#171717`; `color:#ffffff`; `font-family: var(--font-body)`                                                                                                                                                                                                                                                       |
| Top grid          | `max-width:1152px; margin:0 auto; padding:48px 24px 0; display:grid; grid-template-columns: repeat(auto-fit, minmax(min(220px,100%),1fr)); gap:32px`                                                                                                                                                                                           |
| Column 1          | `flex-column; gap:12px` — logo row (`display:flex; align-items:center; gap:10px`; `assets/fox-head.png` 40×40 `object-fit:contain`, `alt=""`; wordmark Bebas 24px `letter-spacing:0.05em` `line-height:1`, BOUNDFOX `#ffa726` / STUDIOS `#ffeb3b`) + `<p style="margin:0; font-size:14px; line-height:1.625; color:#d4d4d4; max-width:320px">` |
| Columns 2–4       | `flex-column; gap:10px`; heading `font-display 16px letter-spacing:0.05em color:#ffeb3b`; links `color:#ffffff; font-size:14px; text-decoration:none`, hover `#ffeb3b`                                                                                                                                                                         |
| Column 4 icon row | `display:flex; gap:12px`; icons 20×20 `viewBox="0 0 24 24" fill="currentColor"`, color `#ffffff`, hover `#ffeb3b`                                                                                                                                                                                                                              |
| Bottom bar        | `max-width:1152px; margin:24px auto 0; padding:16px 24px; border-top:1px solid #525252; display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap`; both spans `font-size:12px; color:#a3a3a3`                                                                                                                                     |

Footer grid reflow (auto-fit with 220px min, 32px gap, 48px container padding, capped at 1152px):
4 columns ≥ **1024px** viewport · 3 columns ≥ **772px** · 2 columns ≥ **520px** · 1 column below 520px.

---

## 7. Links on this page

| Label / element                                            | href                                 | Target               | Notes                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `info@boundfoxstudios.com` (§1 Verantwortlicher)           | `mailto:info@boundfoxstudios.com`    | same tab             | the **only** link inside `<main>`; `#a16207`, no underline, hover `#ffa726`, `transition: color 150ms ease-in-out` |
| Header logo                                                | `Startseite.dc.html`                 | → Angular `/`        | `routerLink="/"`                                                                                                   |
| Header nav STARTSEITE                                      | `Startseite.dc.html`                 | → `/`                |                                                                                                                    |
| Header nav APPS & SPIELE                                   | `Spiele und Apps.dc.html`            | → `/apps-und-spiele` |                                                                                                                    |
| Header nav UNTERSTÜTZEN                                    | `Unterstuetzen.dc.html`              | → `/unterstuetzen`   |                                                                                                                    |
| Header nav SOCIALS                                         | `Socials.dc.html`                    | → `/socials`         |                                                                                                                    |
| Header DE / EN                                             | `#`                                  | i18n switch          | design shows UI only; wire to i18n/`/en` prefix                                                                    |
| Footer Startseite / Apps & Spiele / Unterstützen / Socials | same four files                      | → same four routes   |                                                                                                                    |
| Footer Impressum                                           | `Impressum.dc.html`                  | → `/impressum`       |                                                                                                                    |
| Footer Datenschutz                                         | `Datenschutz.dc.html`                | → `/datenschutz`     | current route                                                                                                      |
| Footer GitHub icon                                         | `https://github.com/BoundfoxStudios` | external             | `title="GitHub"`; add `rel="noopener noreferrer"`                                                                  |
| Footer Discord icon                                        | `https://discord.gg/tHqNzMT`         | external             | `title="Discord"`                                                                                                  |
| Footer YouTube icon                                        | `https://youtube.com/c/boundfox`     | external             | `title="YouTube"`                                                                                                  |

The prototype uses no `target="_blank"` anywhere; keep external links same-tab unless the team decides otherwise.

---

## 8. Assets

| Asset                         | Where                      | Notes                                                                                                                              |
| ----------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| —                             | `<main>`                   | **This page references no images, icons or SVGs of its own.**                                                                      |
| `assets/fox-head.png`         | Header 32×32, Footer 40×40 | transparent PNG, `object-fit:contain`; brand rule: full-color mark only, on white or dark — never on yellow/gradient               |
| GitHub glyph                  | Footer                     | inline SVG, 20×20, `viewBox="0 0 24 24"`, `fill="currentColor"`, single `<path>` — copy verbatim from `SiteFooter.dc.html` line 43 |
| Discord glyph                 | Footer                     | inline SVG, same attrs, single `<path>` — `SiteFooter.dc.html` line 44                                                             |
| YouTube glyph                 | Footer                     | inline SVG, same attrs, single `<path>` — `SiteFooter.dc.html` line 45                                                             |
| `_ds/…/assets/fonts/Tahu.ttf` | —                          | not needed by this route                                                                                                           |

Fonts to load: Bebas Neue (400) and Barlow (400/700 used here; the DS imports 400/500/600/700 + italic 400).

---

## 9. Delta to Impressum

Both pages share the exact same shell, section box (`max-width:760px; padding:64px 24px 72px`), H1/H2/paragraph styles and `active="legal"` header state. Differences:

1. `Datenschutz` H1 has `margin:0 0 8px` (Impressum: `margin:0`) — to make room for the badge.
2. `Datenschutz` renders the outline `Badge` between H1 and the first H2; Impressum does not.
3. `Datenschutz` ends with the muted 14px `Stand: August 2026` line (`margin:32px 0 0`); Impressum has no such line.
4. Both use `margin:40px 0 12px` on the first H2 and `margin:32px 0 12px` on the following ones.

⇒ Build one shared `LegalPageComponent` / layout (column box + heading styles) and let both routes fill it.

---

## 10. Reference implementation sketch (Angular + Tailwind v4)

`styles.css` additions (`@theme`, extending the README proposal):

```css
@import 'tailwindcss';
@theme {
  --color-*: initial;
  --color-white: #fff;
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
  --container-legal: 760px; /* the 760px text column of Impressum/Datenschutz */
  --container-site: 1152px; /* header/footer band container */
}
body {
  @apply bg-white font-sans text-neutral-700;
}
a {
  @apply text-link hover:text-orange no-underline transition-colors duration-150 ease-in-out;
}
```

Page template:

```html
<section class="max-w-legal mx-auto px-6 pt-16 pb-18">
  <h1
    class="font-display mb-2 text-[clamp(40px,5.5vw,60px)] leading-none font-normal tracking-wide text-neutral-900"
  >
    DATENSCHUTZERKLÄRUNG
  </h1>
  <app-badge variant="outline">Entwurf — vor Veröffentlichung rechtlich prüfen</app-badge>

  <h2
    class="font-display mt-10 mb-3 text-2xl leading-none font-normal tracking-wide text-neutral-900"
  >
    1. VERANTWORTLICHER
  </h2>
  <p class="m-0 text-base leading-relaxed">
    Boundfox Studios, Inhaber: Manuel Rauber<br />
    Flamingoweg 68, 70378 Stuttgart<br />
    E-Mail: <a href="mailto:info@boundfoxstudios.com">info@boundfoxstudios.com</a>
  </p>

  <!-- h2 #2…#6: identical classes but mt-8 instead of mt-10 -->

  <p class="mt-8 text-sm text-neutral-600">Stand: August 2026</p>
</section>
```

Suggested class constants to avoid repetition: `legalHeading = "mt-8 mb-3 font-display text-2xl leading-none font-normal tracking-wide text-neutral-900"`, `legalBody = "m-0 text-base leading-relaxed"`.

---

## 11. Notes, gaps and decisions for the developer

- **Legal review required.** The badge says it outright; the README repeats it (`Text ist eine Vorlage — vor Launch juristisch prüfen`). Ship only after Manu has had the text checked.
- **`Stand: August 2026` is hard-coded** in the design. Decide: static string, or derived from a build/content date. If i18n'd, the month name must be translated too (`As of August 2026`).
- **No mobile menu.** The header only wraps via `flex-wrap`; the README explicitly says a burger menu must be added in Angular — that changes the header's height contract (currently a fixed 64px band) on small screens.
- **`active="legal"`** must not highlight a nav item. Model it as a nullable active key, not as a fifth nav entry.
- **760px is off-scale.** Either add `--container-legal: 760px` to `@theme` (recommended, both legal pages use it) or accept `max-w-[760px]`.
- **72px bottom padding and 40px first-H2 margin are off the DS spacing scale** (`--space-*` has 64 and 96, 32 and 48). They are literal values in the design — reproduce them exactly (`pb-18`, `mt-10`), do not round to 64/48.
- **Token naming trap:** `--leading-tight` is `1` (Tailwind's `leading-none`) and `--leading-snug` is `1.25` (Tailwind's `leading-tight`). Mapping by name will be off by one step.
- **Badge line box:** the ~22px height comes from the surrounding 16px Barlow strut. If exactness matters, use the wrapper variant in §6.1.
- **`text-transform:uppercase` on the badge** means translators supply sentence-case; do not pre-uppercase the string.
- **Non-breaking space** in `z. B.` and the em/en dashes (`—`, `–`) must survive the i18n pipeline.
- **`&` in `3. HOSTING & SERVER-LOGFILES`** is `&amp;` in the source file — plain `&` in an Angular template is fine, but keep it escaped in XLIFF/JSON.
- **Head metadata is not specified** by the design — set `Title`/`Meta` (and `<link rel="canonical">`) in the route.
- **Accessibility:** heading order is clean (one `h1`, six `h2`). The badge is decorative-adjacent but carries meaning — leave it as readable text (no `aria-hidden`). Check contrast of `#a16207` on white (≈ 4.6:1, passes AA for body text) and `#525252` on white (≈ 7.5:1).
- **SSR/prerender:** fully static route, no data fetching — add it to the prerender list in `app.routes.server.ts`.
- **`support.js` / `image-slot.js` / `<dc-import>` / `<x-import>` are prototype runtime only** — nothing there gets ported.
