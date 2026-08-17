# Implementation Reference — Seite „Unterstützen" (`/unterstuetzen`)

Quelle: `design_handoff_website_redesign/Unterstuetzen.dc.html` (High-Fidelity, pixelgenau umzusetzen).
Ziel-Stack: Angular 22 SSR + Tailwind v4 (`projects/website`).
Alle Werte unten sind **1:1 aus der Design-Datei abgelesen** — keine Interpretation, außer wo explizit als „Empfehlung" markiert.

---

## 1. Seitengerüst

```
<div>                     min-height:100vh; display:flex; flex-direction:column;
  <SiteHeader active="support" />   (hint-size 100%,64px)
  <main>                  flex:1;
    <section> Hero
    <section> Kostenfrei unterstützen
    <section> Finanziell unterstützen
  </main>
  <SiteFooter />          (hint-size 100%,340px)
</div>
```

Tailwind: `class="flex min-h-screen flex-col"` auf dem Wrapper, `class="flex-1"` auf `<main>`.

### Globale Styles (aus `<helmet><style>` der Datei — gehören in `styles.css`, nicht in die Page-Component)

| Selektor | Deklaration | Aufgelöster Wert | Tailwind v4 |
| --- | --- | --- | --- |
| `body` | `margin:0` | – | Reset |
| `body` | `background:var(--surface-page)` | `#ffffff` | `bg-white` |
| `body` | `font-family:var(--font-body)` | `'Barlow',sans-serif` | `font-sans` |
| `body` | `color:var(--text-body)` | `#404040` | `text-neutral-700` |
| `a` | `color:var(--link)` | `#a16207` | `text-link` |
| `a` | `text-decoration:none` | – | `no-underline` |
| `a` | `transition:color 150ms ease-in-out` | – | `transition-colors duration-150 ease-in-out` |
| `a:hover` | `color:var(--accent-strong)` | `#ffa726` | `hover:text-orange` |

> Wichtig: Wegen dieser globalen `a:hover`-Regel setzen **alle Karten** auf der Seite im Hover explizit `color:var(--text-body)` zurück (siehe Karten-Spec). Ohne diesen Reset würde der komplette Kartentext beim Hover orange.

---

## 2. Sektion A — Hero

Container: `max-width:var(--container-max)` = **1152px**, `margin:0 auto`, `padding:64px 24px 8px`.
Tailwind: `mx-auto max-w-6xl px-6 pt-16 pb-2`

| Element | Exakte Styles | Tailwind v4 |
| --- | --- | --- |
| Kicker `<div>` | `font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent-strong)` (`#ffa726`); `margin-bottom:8px` | `mb-2 text-xs font-bold tracking-widest uppercase text-orange` |
| `<h1>` | `margin:0; font-family:var(--font-display)` (Bebas Neue); `font-weight:400; font-size:clamp(40px,5.5vw,60px); line-height:var(--leading-tight)` (=1); `letter-spacing:var(--tracking-display)` (=0.025em); `color:var(--text-heading)` (`#171717`) | `m-0 font-display text-[clamp(40px,5.5vw,60px)] leading-none font-normal tracking-wide text-neutral-900` |
| Lead `<p>` | `margin:12px 0 0; font-size:var(--text-lg)` (=18px); `line-height:var(--leading-body)` (=1.625); `max-width:620px; text-wrap:pretty` | `mt-3 max-w-[620px] text-lg leading-relaxed text-pretty` |
| Script-Akzent `<div>` | `margin-top:16px; font-family:var(--font-script)` (Tahu); `font-size:44px; color:var(--accent-strong)` (`#ffa726`); `line-height:1` | `mt-4 font-script text-[44px] leading-none text-orange` |

Hinweise:
- Der Kicker steht im Markup als „Community" (Mixed Case) und wird **per CSS** zu „COMMUNITY". H1 und alle Kartentitel stehen dagegen **bereits als Großbuchstaben im Markup** — kein `uppercase` nötig (aber unschädlich).
- `44px` und `620px` liegen nicht auf der Tailwind-Skala → Arbitrary Values (oder `--text-script: 44px` ins `@theme` aufnehmen).
- Einziger Tahu-/Script-Einsatz der gesamten Site.

---

## 3. Sektion B — „KOSTENFREI UNTERSTÜTZEN"

Container: `max-width:1152px; margin:0 auto; padding:48px 24px 16px`
Tailwind: `mx-auto max-w-6xl px-6 pt-12 pb-4`

### 3.1 Section-Heading (Titel + Trennlinie)

```
<div style="display:flex;align-items:center;gap:16px;margin-bottom:8px;">
  <h2 …>KOSTENFREI UNTERSTÜTZEN</h2>
  <div style="flex:1;height:1px;background:var(--border-default);"></div>
</div>
```

| Element | Exakte Styles | Tailwind v4 |
| --- | --- | --- |
| Zeile | `display:flex; align-items:center; gap:16px; margin-bottom:8px` | `mb-2 flex items-center gap-4` |
| `<h2>` | `margin:0; font-family:var(--font-display); font-weight:400; font-size:var(--display-sm)` (=24px); `line-height:1; letter-spacing:0.025em; color:#171717` | `m-0 font-display text-2xl leading-none font-normal tracking-wide text-neutral-900` |
| Linie | `flex:1; height:1px; background:var(--border-default)` (`#e5e5e5`) | `h-px flex-1 bg-neutral-200` |
| Subline `<p>` | `margin:0 0 24px; font-size:var(--text-sm)` (=14px); `color:var(--text-muted)` (`#525252`) | `mt-0 mb-6 text-sm text-neutral-600` |

> Identisches Muster auf `Spiele und Apps.dc.html` (Zeilen 36, 96) → **eigene Komponente** `SectionHeading`.

### 3.2 Karten-Grid

```
display:grid;
grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));
gap:24px;
```
Tailwind: `grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6`

Breakpoint-Mathematik (Container 1152px, Seitenpadding je 24px → nutzbare Breite `min(viewport,1152) − 48`):

| Spalten | Bedingung nutzbare Breite | ⇒ Viewport | Spaltenbreite bei 1152px+ |
| --- | --- | --- | --- |
| 3 | ≥ 3·300 + 2·24 = **948px** | ≥ **996px** | (1104 − 48)/3 = **352px** |
| 2 | ≥ 2·300 + 24 = **624px** | ≥ **672px** | – |
| 1 | < 624px | < **672px** | 100% (dank `min(300px,100%)` kein Overflow) |

4 Spalten sind ausgeschlossen (bräuchte 1272px > 1104px).

### 3.3 Karte (klickbares `<a>`) — heller Icon-Chip

Die **komplette Karte ist ein Link** (`<a>`), nicht nur der CTA (Gegensatz zu den Projektkarten auf der Startseite).

| Teil | Exakte Styles | Tailwind v4 |
| --- | --- | --- |
| `<a>` Root | `background:var(--surface-card)` `#ffffff`; `border:1px solid var(--border-default)` `#e5e5e5`; `border-radius:var(--radius-lg)` **12px**; `box-shadow:var(--shadow-card)` (= `shadow-md`); `padding:var(--space-5)` **24px**; `display:flex; flex-direction:column; gap:12px`; `transition:border-color 150ms ease-in-out`; `color:var(--text-body)` `#404040` | `flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 text-neutral-700 shadow-md transition-colors duration-150 ease-in-out` |
| `<a>` Hover | `border-color:var(--bfs-amber)` **`#ffc107`**; `color:var(--text-body)` (Reset gegen globales `a:hover`) | `hover:border-amber hover:text-neutral-700` |
| Icon-Chip `<span>` | `width:44px; height:44px; border-radius:var(--radius-md)` **8px**; `background:var(--bfs-yellow)` **`#ffeb3b`**; `display:flex; align-items:center; justify-content:center` | `flex size-11 items-center justify-center rounded-lg bg-yellow` |
| Glyph `<svg>` | `width="24" height="24" viewBox="0 0 24 24" fill="var(--bfs-ink)"` (`#171717`) | `size-6 fill-neutral-900` |
| Titel `<span>` | `font-family:var(--font-display); font-size:var(--display-sm)` **24px**; `letter-spacing:0.025em; color:#171717; line-height:1` | `font-display text-2xl leading-none tracking-wide text-neutral-900` |
| Text `<span>` | `font-size:var(--text-sm)` **14px**; `line-height:var(--leading-body)` **1.625** (Farbe erbt `#404040` vom Root) | `text-sm leading-relaxed` |
| CTA `<span>` | `margin-top:auto; font-size:var(--text-sm)` **14px**; `font-weight:700; color:var(--link)` **`#a16207`** | `mt-auto text-sm font-bold text-link` |

Der Abstand zwischen allen fünf Kindern ist **12px** (`gap:12px`); `margin-top:auto` auf dem CTA drückt ihn bei ungleich hohen Karten nach unten.

### 3.4 Karteninhalte Sektion B (Reihenfolge exakt: GitHub → Discord → YouTube)

| # | href | Icon | Titel | Beschreibung | CTA |
| --- | --- | --- | --- | --- | --- |
| 1 | `https://github.com/BoundfoxStudios` | github | `GITHUB` | „Vergib Stars, melde Fehler, schlag Features vor — oder bring dich direkt mit Pull Requests in unsere Open-Source-Projekte ein." | `Zur Organisation →` |
| 2 | `https://discord.gg/tHqNzMT` | discord | `DISCORD` | „Sei im Discord aktiv, rege Diskussionen an und hilf anderen aus der Community — genau dafür ist er da." | `Server beitreten →` |
| 3 | `https://youtube.com/c/boundfox` | youtube | `YOUTUBE` | „Schau unsere Videos, like und kommentiere sie — so werden sie von YouTube besser gefunden und erreichen mehr Leute." | `Kanal öffnen →` |

---

## 4. Sektion C — „FINANZIELL UNTERSTÜTZEN"

Container: `max-width:1152px; margin:0 auto; padding:48px 24px 72px`
Tailwind: `mx-auto max-w-6xl px-6 pt-12 pb-18` (72px = 18 × 4px; Tailwind v4 erzeugt `pb-18` dynamisch)

Section-Heading identisch zu 3.1, Titel `FINANZIELL UNTERSTÜTZEN`, Subline „Einmalig oder monatlich — ganz wie du magst. Jeder Beitrag hilft, weiter kostenlose Projekte zu bauen."

### 4.1 Grid — mit Breitenbegrenzung

```
display:grid;
grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));
gap:24px;
max-width:760px;          ← einziger Unterschied zu Sektion B
```
Tailwind: `grid max-w-[760px] grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6`

Folge: nutzbare Breite ≤ 760px → **nie 3-spaltig**. 2 Spalten ab nutzbarer Breite 624px (Viewport ≥ 672px), Spaltenbreite dann (760 − 24)/2 = **368px**; darunter 1-spaltig. Das Grid ist **linksbündig** (kein `margin:0 auto`).

### 4.2 Karte — dunkler Icon-Chip

Identisch zu 3.3, **außer**:

| Teil | Exakte Styles | Tailwind v4 |
| --- | --- | --- |
| Icon-Chip `<span>` | `background:var(--bfs-ink)` **`#171717`** (statt `#ffeb3b`) | `bg-neutral-900` |
| Glyph `<svg>` | `width="22" height="22" viewBox="0 0 24 24" fill="var(--bfs-yellow)"` (`#ffeb3b`) | `size-[22px] fill-yellow` |

Chip-Größe bleibt 44×44 / `rounded-lg` — nur das Glyph ist 22px statt 24px.

### 4.3 Karteninhalte Sektion C (Reihenfolge exakt: Ko-Fi → Patreon)

| # | href | Icon | Titel | Beschreibung | CTA |
| --- | --- | --- | --- | --- | --- |
| 1 | `https://ko-fi.com/boundfoxstudios` | kofi | `KO-FI` | „Spendier uns einen Kaffee — einmalig oder monatlich, ganz ohne Verpflichtung." | `Kaffee spendieren →` |
| 2 | `https://www.patreon.com/boundfoxstudios` | patreon | `PATREON` | „Unterstütze uns mit einem monatlichen Beitrag deiner Wahl und begleite unsere Projekte langfristig." | `Patron werden →` |

**Keine Prozent-/Gebühren-Angaben** auf dieser Seite (explizit im Handoff-README vermerkt).

---

## 5. Vertikaler Rhythmus (Zusammenfassung)

| Von → Bis | Abstand |
| --- | --- |
| Header-Unterkante → Hero-Kicker | 64px (`pt-16`) |
| Hero-Unterkante → H2 „KOSTENFREI" | 8px + 48px = **56px** |
| Sektion B Unterkante → H2 „FINANZIELL" | 16px + 48px = **64px** |
| Sektion C Grid → Footer-Oberkante | 72px (`pb-18`) |
| H2 → Subline | 8px |
| Subline → Grid | 24px |

Horizontal: durchgehend `padding-inline: 24px`, Container 1152px.

---

## 6. Copy-Strings (verbatim) + i18n-Keys

Alle Strings deutsch, du-Form. Sonderzeichen exakt übernehmen: **Geviertstrich `—` (U+2014) mit Leerzeichen**, `→` (U+2192), `Ü/ö/ä`.

| i18n-Key | Deutscher Text (verbatim) |
| --- | --- |
| `support.hero.kicker` | `Community` |
| `support.hero.title` | `UNTERSTÜTZE UNS` |
| `support.hero.lead` | `Unsere Spiele, Apps und Tutorials sind kostenlos — und sollen es bleiben. Hier findest du alle Möglichkeiten, uns dabei zu unterstützen. Vieles davon kostet dich keinen Cent.` |
| `support.hero.thanks` | `Danke!` |
| `support.free.heading` | `KOSTENFREI UNTERSTÜTZEN` |
| `support.free.subline` | `Zeit und Aufmerksamkeit helfen uns genauso wie Geld — manchmal sogar mehr.` |
| `support.free.github.title` | `GITHUB` |
| `support.free.github.description` | `Vergib Stars, melde Fehler, schlag Features vor — oder bring dich direkt mit Pull Requests in unsere Open-Source-Projekte ein.` |
| `support.free.github.cta` | `Zur Organisation →` |
| `support.free.discord.title` | `DISCORD` |
| `support.free.discord.description` | `Sei im Discord aktiv, rege Diskussionen an und hilf anderen aus der Community — genau dafür ist er da.` |
| `support.free.discord.cta` | `Server beitreten →` |
| `support.free.youtube.title` | `YOUTUBE` |
| `support.free.youtube.description` | `Schau unsere Videos, like und kommentiere sie — so werden sie von YouTube besser gefunden und erreichen mehr Leute.` |
| `support.free.youtube.cta` | `Kanal öffnen →` |
| `support.financial.heading` | `FINANZIELL UNTERSTÜTZEN` |
| `support.financial.subline` | `Einmalig oder monatlich — ganz wie du magst. Jeder Beitrag hilft, weiter kostenlose Projekte zu bauen.` |
| `support.financial.kofi.title` | `KO-FI` |
| `support.financial.kofi.description` | `Spendier uns einen Kaffee — einmalig oder monatlich, ganz ohne Verpflichtung.` |
| `support.financial.kofi.cta` | `Kaffee spendieren →` |
| `support.financial.patreon.title` | `PATREON` |
| `support.financial.patreon.description` | `Unterstütze uns mit einem monatlichen Beitrag deiner Wahl und begleite unsere Projekte langfristig.` |
| `support.financial.patreon.cta` | `Patron werden →` |

**23 übersetzbare Strings** auf dieser Seite (Header-/Footer-Strings gehören zu den geteilten Komponenten und zählen hier nicht).

Empfehlung: den Pfeil `→` **nicht** in den übersetzbaren String legen, sondern im Template als `<span aria-hidden="true">→</span>` anhängen (`support.free.github.cta` = `Zur Organisation`). Dann bleibt der Screenreader-Text sauber und Übersetzer können den Pfeil nicht verlieren. Falls 1:1-Treue wichtiger ist: String wie oben inkl. Pfeil belassen.

Zusätzlich (nicht sichtbar, aber nötig):
- `support.meta.title` / `support.meta.description` für `<title>`/Meta-Description — im Design nicht enthalten, muss festgelegt werden.

---

## 7. Design-Tokens (CSS-Variable → Wert → Tailwind-Theme)

Alle auf dieser Seite verwendeten Variablen, Quelle `_ds/boundfox-studios-design-system-0747e2df-.../tokens/*.css`.

### Farben (`tokens/colors.css`)

| CSS-Variable | Wert | Auf dieser Seite verwendet für | Tailwind-Theme-Vorschlag |
| --- | --- | --- | --- |
| `--bfs-yellow` | `#ffeb3b` | Icon-Chip Sektion B, Glyph Sektion C | `--color-yellow` |
| `--bfs-amber` | `#ffc107` | **Karten-Hover-Border** | `--color-amber` |
| `--bfs-orange` (= `--accent-strong`) | `#ffa726` | Kicker, „Danke!", globaler Link-Hover | `--color-orange` |
| `--bfs-ink` (= `--text-heading`, `--text-on-accent`) | `#171717` | H1/H2/Kartentitel, Glyph Sektion B, Icon-Chip Sektion C | `--color-neutral-900` |
| `--bfs-gray-700` (= `--text-body`) | `#404040` | Fließtext, Kartenbeschreibung | `--color-neutral-700` |
| `--bfs-gray-600` (= `--text-muted`) | `#525252` | Sublines unter den H2 | `--color-neutral-600` |
| `--bfs-gray-200` (= `--border-default`) | `#e5e5e5` | Kartenrahmen, Trennlinie im Section-Heading | `--color-neutral-200` |
| `--bfs-white` (= `--surface-page`, `--surface-card`) | `#ffffff` | Seiten-BG, Karten-BG | `--color-white` |
| `--link` | `#a16207` (Tailwind `yellow-700`) | CTA-Zeilen, globale Linkfarbe | `--color-link` |

Auf dieser Seite **nicht** verwendet, aber im Token-Set vorhanden: `--bfs-gray-400 #a3a3a3` (`--border-strong`), `--bfs-gray-300 #d4d4d4`, `--bfs-gray-100 #f5f5f5` (`--surface-subtle`), `--surface-inverse #404040`, `--text-on-inverse #ffffff`, `--accent #ffc107`, `--accent-soft #ffeb3b`, `--focus-ring #ffc107`, `--gradient-brand linear-gradient(90deg,#ffeb3b,#ffa726)`.

### Typografie (`tokens/typography.css`)

| CSS-Variable | Wert | Verwendung hier | Tailwind |
| --- | --- | --- | --- |
| `--font-display` | `'Bebas Neue',sans-serif` | H1, H2, Kartentitel | `--font-display` |
| `--font-body` | `'Barlow',sans-serif` | body, alles andere | `--font-sans` |
| `--font-script` | `'Tahu',cursive` | nur „Danke!" | `--font-script` |
| `--text-xs` | `12px` | Kicker | `text-xs` |
| `--text-sm` | `14px` | Sublines, Kartenbeschreibung, CTA | `text-sm` |
| `--text-lg` | `18px` | Hero-Lead | `text-lg` |
| `--display-sm` | `24px` | H2, Kartentitel | `text-2xl` |
| `--leading-tight` | `1` | H1, H2, Kartentitel | `leading-none` |
| `--leading-body` | `1.625` | Lead, Kartenbeschreibung | `leading-relaxed` |
| `--tracking-display` | `0.025em` | H1, H2, Kartentitel | `tracking-wide` |
| `--tracking-caps` | `0.1em` | Kicker (inline als `0.1em`) | `tracking-widest` |
| (inline) | `clamp(40px,5.5vw,60px)` | H1 | arbitrary |
| (inline) | `44px` | „Danke!" | arbitrary |
| (inline) | `font-weight:400` | Bebas-Headings (nie bold rendern) | `font-normal` |
| (inline) | `font-weight:700` | Kicker, CTA-Zeilen | `font-bold` |

Nicht verwendet: `--text-base 16px`, `--display-md 36px`, `--display-lg 60px`, `--display-xl 96px`, `--leading-snug 1.25`.

### Spacing / Radius / Container (`tokens/spacing.css`)

| CSS-Variable | Wert | Verwendung hier |
| --- | --- | --- |
| `--space-5` | `24px` | Kartenpadding (`padding:var(--space-5)`) |
| `--radius-md` | `8px` | Icon-Chip |
| `--radius-lg` | `12px` | Karten |
| `--container-max` | `1152px` | alle drei Sektionen |

Rohwerte inline (nicht über Variablen): `64/48/24/16/12/8px` Paddings & Margins, `72px` unteres Padding, `44px` Chip, `1px` Linien/Border.
Nicht verwendet: `--space-1..4,6..9`, `--radius-sm 4px`, `--radius-pill 9999px`.

### Effekte (`tokens/effects.css`)

| CSS-Variable | Wert | Verwendung hier |
| --- | --- | --- |
| `--shadow-card` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` (= `shadow-md`) | alle 5 Karten |
| `--dur-fast` / `--ease-standard` | `150ms` / `cubic-bezier(.4,0,.2,1)` | Border- und Farb-Transitions (inline als `150ms ease-in-out` geschrieben — identisch zu Tailwind `ease-in-out`) |

Nicht verwendet: `--shadow-raised`, `--shadow-accent`, `--dur-base 200ms`.

### Fonts (`tokens/fonts.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
@font-face{font-family:'Tahu';src:url('assets/fonts/Tahu.ttf') format('truetype');font-weight:400;font-style:normal;font-display:swap}
```
Für Angular: `Tahu.ttf` aus `_ds/.../assets/fonts/` nach `projects/website/public/fonts/` kopieren (Empfehlung: zusätzlich als `.woff2` konvertieren, `.ttf` als Fallback) und `@font-face` in `styles.css` mit `/fonts/Tahu.woff2` neu deklarieren. Google-Fonts entweder self-hosten (kein Tracking — passt zur „keine Cookies/kein Tracking"-Vorgabe) oder per `<link>` in `index.html` mit `preconnect`.

### `@theme` für Tailwind v4 (`projects/website/src/styles.css`)

```css
@import "tailwindcss";

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
  --font-display: "Bebas Neue", sans-serif;
  --font-script: "Tahu", cursive;
  --font-sans: "Barlow", sans-serif;
}
```
(Aus dem Handoff-README übernommen; deckt alle Farben/Fonts dieser Seite ab. `max-w-6xl` = 72rem = 1152px ist bereits Tailwind-Default.)

---

## 8. Links (vollständig, inkl. geteilter Komponenten)

### Seiteneigene Links (alle extern, alle als komplette Karte klickbar)

| Ziel | href | Sektion |
| --- | --- | --- |
| GitHub-Organisation | `https://github.com/BoundfoxStudios` | B |
| Discord-Server | `https://discord.gg/tHqNzMT` | B |
| YouTube-Kanal | `https://youtube.com/c/boundfox` | B |
| Ko-fi | `https://ko-fi.com/boundfoxstudios` | C |
| Patreon | `https://www.patreon.com/boundfoxstudios` | C |

Im Design ohne `target`/`rel`. Empfehlung für die Umsetzung: `target="_blank" rel="noopener noreferrer"` + visuell unsichtbarer Hinweis („öffnet in neuem Tab") — bewusst zu entscheiden, ist eine Abweichung vom Prototyp.

### Links aus `SiteHeader` (Prop `active="support"`)

`/` (Logo + STARTSEITE), `/apps-und-spiele`, `/unterstuetzen` (**aktiv**), `/socials`, Sprachumschalter `DE` / `EN` (im Prototyp `href="#"`).

### Links aus `SiteFooter`

`/`, `/apps-und-spiele`, `/unterstuetzen`, `/socials`, `/impressum`, `/datenschutz`, plus Icon-Reihe GitHub/Discord/YouTube (gleiche URLs wie oben).

---

## 9. Wiederverwendbare Komponenten

| Komponente | Selector-Vorschlag | Props / Inputs | Varianten | Auch verwendet auf |
| --- | --- | --- | --- | --- |
| `SiteHeader` | `app-site-header` | `active: 'start' \| 'projekte' \| 'support' \| 'socials' \| 'legal'` (hier `'support'`) | – | alle Seiten |
| `SiteFooter` | `app-site-footer` | – | – | alle Seiten |
| `PageHero` | `app-page-hero` | `kicker: string`, `title: string`, `lead: string`, `leadMaxWidth?: number` (hier **620px**, Socials/Startseite **560px**), `scriptAccent?: string` (hier `Danke!`) | mit/ohne Script-Akzent | Startseite, Apps & Spiele, Socials |
| `SectionHeading` | `app-section-heading` | `title: string`, `subline?: string` | – | Apps & Spiele (2×) |
| `SupportCard` | `app-support-card` | `href`, `icon: IconName`, `title`, `description`, `ctaLabel` | `chipTone: 'light' \| 'dark'` → light: Chip `#ffeb3b` + Glyph `#171717` @24px; dark: Chip `#171717` + Glyph `#ffeb3b` @22px | nur diese Seite (Struktur aber nah an der Socials-Kachel) |
| `BrandIcon` | `app-brand-icon` | `name: 'github' \| 'discord' \| 'youtube' \| 'kofi' \| 'patreon'`, `size: number` | Farbe über `fill`/`currentColor` steuern | Footer (20px, `currentColor`), Socials (32px, `#ffeb3b`), diese Seite (24/22px) |

Empfehlung: `SupportCard` als `<a>`-Host-Element bauen (`:host { display:flex }`) oder mit `<a>` als einzigem Kind — die gesamte Kachel muss klickbar sein.
Datenbasis für die 5 Karten als typisiertes Array im Component (`readonly freeWays`, `readonly financialWays`), nicht 5× dupliziertes Template.

---

## 10. Assets & Icons

**Bilder auf dieser Seite: keine.** (`fox-head.png` erscheint nur in Header/Footer.)

Alle Icons sind **Inline-SVG**, `viewBox="0 0 24 24"`, ein einzelnes `fill` (keine Strokes) — direkt aus der Design-Datei kopierbar:

| Icon-Name | Elemente | Render-Größe hier | Fill | Erste Zeichen des Path-Data (zum Wiederfinden) |
| --- | --- | --- | --- | --- |
| `github` | 1 × `<path>` | 24×24 | `#171717` | `M12 .3a12 12 0 0 0-3.79 23.4…` |
| `discord` | 1 × `<path>` | 24×24 | `#171717` | `M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52…` |
| `youtube` | 1 × `<path>` | 24×24 | `#171717` | `M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14…` |
| `kofi` | 1 × `<path>` (Kaffeetasse) | 22×22 | `#ffeb3b` | `M2 5h15a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-.63…` |
| `patreon` | `<circle cx="15.2" cy="8.8" r="7.3">` + `<rect x="1.2" y="1.5" width="4.2" height="21">` | 22×22 | `#ffeb3b` | – |

`github`/`discord`/`youtube` sind **byte-identisch** mit den Pfaden in `SiteFooter.dc.html` (20px, `fill="currentColor"`) und `Socials.dc.html` (32px, `fill="var(--bfs-yellow)"`) → einmal in `BrandIcon` zentralisieren und `fill="currentColor"` verwenden, Farbe per `text-*`-Klasse setzen.

Schrift-Asset: `_ds/boundfox-studios-design-system-0747e2df-62fc-4fe1-bbd4-f0e974f1e1a3/assets/fonts/Tahu.ttf`.

---

## 11. Interaktion & Motion

- Nur Farb-/Border-Transitions, `150ms` `ease-in-out` (= `cubic-bezier(.4,0,.2,1)`). Keine Skalierung, kein Bounce, kein Schatten-Wechsel im Hover.
- Karten-Hover: Border `#e5e5e5` → `#ffc107`; Textfarbe explizit auf `#404040` gehalten.
- Kein `:active`-State im Design definiert (der 1px-Press gilt laut README nur für den Primär-Button auf „Apps & Spiele").
- Kein `:focus-visible` im Design definiert → **muss ergänzt werden** (Token `--focus-ring: #ffc107` ist dafür vorgesehen), z.B. `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber`.
- `prefers-reduced-motion`: Transitions sind reine Farbwechsel, unkritisch; optional trotzdem abschalten.

---

## 12. Semantik & Accessibility (Abweichungen zum Prototyp, bewusst zu entscheiden)

1. Kartentitel sind im Prototyp `<span>` innerhalb des `<a>`. Für die Doku-Struktur besser `<h3>` (Styling identisch: `font-display text-2xl leading-none tracking-wide text-neutral-900`, `margin:0`).
2. Der Kicker „Community" ist ein `<div>` — als `<p>` oder `<span>` rendern; er ist **keine** Überschrift.
3. SVGs sind rein dekorativ (Titel steht daneben) → `aria-hidden="true"` + `focusable="false"`.
4. Der `→`-Pfeil sollte `aria-hidden` sein bzw. nicht im Übersetzungsstring stehen (siehe §6).
5. Überschriften-Hierarchie der Seite: `h1` (UNTERSTÜTZE UNS) → 2 × `h2` (Sektionstitel) → 5 × `h3` (Kartentitel).
6. Kontrast: CTA `#a16207` auf Weiß = 4.9:1 (AA für Normaltext ✓). Kartentext `#404040` auf Weiß = 10.4:1 ✓. Kicker `#ffa726` auf Weiß = 2.0:1 — **AA-fail für Normaltext**, ist aber 12px/bold-Label und so vom Design vorgegeben; als bekannte Abweichung dokumentieren, nicht eigenmächtig ändern.

---

## 13. Fertiges Tailwind-Skelett (Referenz-Markup)

```html
<div class="flex min-h-screen flex-col">
  <app-site-header active="support" />

  <main class="flex-1">
    <!-- A: Hero -->
    <section class="mx-auto max-w-6xl px-6 pt-16 pb-2">
      <p class="mb-2 text-xs font-bold tracking-widest uppercase text-orange">Community</p>
      <h1 class="m-0 font-display text-[clamp(40px,5.5vw,60px)] leading-none font-normal tracking-wide text-neutral-900">
        UNTERSTÜTZE UNS
      </h1>
      <p class="mt-3 max-w-[620px] text-lg leading-relaxed text-pretty">…</p>
      <p class="mt-4 font-script text-[44px] leading-none text-orange">Danke!</p>
    </section>

    <!-- B: Kostenfrei -->
    <section class="mx-auto max-w-6xl px-6 pt-12 pb-4">
      <div class="mb-2 flex items-center gap-4">
        <h2 class="m-0 font-display text-2xl leading-none font-normal tracking-wide text-neutral-900">
          KOSTENFREI UNTERSTÜTZEN
        </h2>
        <div class="h-px flex-1 bg-neutral-200"></div>
      </div>
      <p class="mb-6 text-sm text-neutral-600">…</p>

      <div class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
        <a href="https://github.com/BoundfoxStudios"
           class="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 text-neutral-700
                  shadow-md transition-colors duration-150 ease-in-out
                  hover:border-amber hover:text-neutral-700">
          <span class="flex size-11 items-center justify-center rounded-lg bg-yellow">
            <svg class="size-6 fill-neutral-900" viewBox="0 0 24 24" aria-hidden="true">…</svg>
          </span>
          <h3 class="m-0 font-display text-2xl leading-none tracking-wide text-neutral-900">GITHUB</h3>
          <p class="m-0 text-sm leading-relaxed">…</p>
          <span class="mt-auto text-sm font-bold text-link">Zur Organisation <span aria-hidden="true">→</span></span>
        </a>
        …
      </div>
    </section>

    <!-- C: Finanziell -->
    <section class="mx-auto max-w-6xl px-6 pt-12 pb-18">
      … Heading wie oben …
      <div class="grid max-w-[760px] grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
        <a … class="… ">
          <span class="flex size-11 items-center justify-center rounded-lg bg-neutral-900">
            <svg class="size-[22px] fill-yellow" viewBox="0 0 24 24" aria-hidden="true">…</svg>
          </span>
          …
        </a>
      </div>
    </section>
  </main>

  <app-site-footer />
</div>
```

---

## 14. Offene Punkte / Entscheidungen für den Entwickler

1. **Meta-Daten** (`<title>`, Description, OG-Tags) sind im Design nicht enthalten.
2. **`target="_blank"` / `rel`** für die 5 externen Karten-Links ist im Prototyp nicht gesetzt.
3. **Focus-Styles** fehlen im Design komplett — mit `--focus-ring: #ffc107` ergänzen (bei 5 komplett klickbaren Karten zwingend).
4. **Sprachumschalter DE/EN** ist im Header nur UI (`href="#"`); Routing/i18n-Strategie (Angular i18n vs. `/en`-Präfix) ist noch offen und betrifft die Key-Struktur aus §6.
5. **Header-Höhe**: README nennt 64px; `SiteHeader.dc.html` erzeugt sie über `padding:8px 24px` + `min-height:48px` — bei flex-wrap auf Mobil wächst das Band. Mobile-Burger-Menü ist im Design nicht enthalten und muss ergänzt werden.
6. **44px** (Script-Größe) und **620px / 760px** (max-widths) liegen nicht auf der Tailwind-Skala — entweder Arbitrary Values oder eigene Theme-Tokens.
7. `text-wrap: pretty` wird von Safari erst ab 17.5 unterstützt — unkritischer Progressive Enhancement.
