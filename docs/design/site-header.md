# Implementation Reference — `SiteHeader`

Quelle: `/Users/manuelrauber/projects/private/boundfoxstudios.com/design_handoff_website_redesign/SiteHeader.dc.html`
Kontext: `/Users/manuelrauber/projects/private/boundfoxstudios.com/design_handoff_website_redesign/README.md`
Tokens: `/Users/manuelrauber/projects/private/boundfoxstudios.com/design_handoff_website_redesign/_ds/boundfox-studios-design-system-0747e2df-62fc-4fe1-bbd4-f0e974f1e1a3/tokens/*.css`

Ziel-Stack: Angular 22 (SSR, standalone, zoneless) + Tailwind v4 (`projects/website/src/styles.css` importiert aktuell nur `tailwindcss`, ein `@theme`-Block fehlt noch).

Alle Werte unten sind **1:1 aus dem Prototyp-Markup abgelesen** (Inline-Styles), nicht aus der README-Prosa — Abweichungen zwischen beidem sind in [§9](#9-abweichungen-designdatei-vs-readme) dokumentiert.

---

## 1. Gesamtaufbau

Der Header ist eine geteilte Komponente, die auf **allen sechs Seiten** als erstes Element im Body steht. Im Prototyp per `<dc-import name="SiteHeader" active="…" hint-size="100%,64px">` eingebunden — d. h. **volle Breite, 64px Gesamthöhe**.

```
<header>                              band, volle Breite, bg #171717, color #fff
└── <div>                             Container, max-width 1152px, zentriert, padding 8px 24px,
    │                                 min-height 48px, flex, align-items center, gap 16px, flex-wrap
    ├── <a> Logo-Lockup               flex, gap 10px  → href "/"
    │   ├── <img> fox-head.png        32×32, object-fit contain
    │   └── <span> Wortmarke          Bebas 24px: "BOUNDFOX" orange + " " + "STUDIOS" gelb
    ├── <nav>                         margin-left auto, flex, gap 4px, align-items center, flex-wrap
    │   ├── <a> STARTSEITE
    │   ├── <a> APPS & SPIELE
    │   ├── <a> UNTERSTÜTZEN
    │   └── <a> SOCIALS
    └── <div> Sprachumschalter        flex, gap 8px, border-left 1px #525252, padding-left 16px
        ├── <a> DE
        ├── <span> /
        └── <a> EN
```

Rechenweg Höhe: `min-height 48px` + `padding-block 8px + 8px` = **64px** (deckt sich mit `hint-size="100%,64px"` und der README-Angabe „Höhe 64px").

---

## 2. Sektionen mit exakten Layout-Werten

### 2.1 Band (`<header>`)

| Eigenschaft                 | Wert                                                    | Token            | Tailwind v4      |
| --------------------------- | ------------------------------------------------------- | ---------------- | ---------------- |
| `background`                | `#171717`                                               | `var(--bfs-ink)` | `bg-neutral-900` |
| `color` (Default-Textfarbe) | `#ffffff`                                               | —                | `text-white`     |
| Breite                      | 100% (volle Viewport-Breite)                            | —                | —                |
| Höhe                        | implizit 64px (siehe oben)                              | —                | —                |
| Position                    | statisch im Fluss (**kein** `sticky`/`fixed` im Design) | —                | —                |
| `data-screen-label`         | `"Header"` (Prototyp-Metadatum, **nicht portieren**)    | —                | —                |

### 2.2 Container (`<div>` in `<header>`)

| Eigenschaft   | Wert       | Token                     | Tailwind v4                    |
| ------------- | ---------- | ------------------------- | ------------------------------ |
| `max-width`   | `1152px`   | `var(--container-max)`    | `max-w-6xl` (= 72rem = 1152px) |
| `margin`      | `0 auto`   | —                         | `mx-auto`                      |
| `padding`     | `8px 24px` | `--space-2` / `--space-5` | `py-2 px-6`                    |
| `min-height`  | `48px`     | —                         | `min-h-12`                     |
| `display`     | `flex`     | —                         | `flex`                         |
| `align-items` | `center`   | —                         | `items-center`                 |
| `gap`         | `16px`     | `--space-4`               | `gap-4`                        |
| `flex-wrap`   | `wrap`     | —                         | `flex-wrap`                    |

Die drei Kinder (Logo, Nav, Sprachumschalter) sind Flex-Items ohne eigene `flex`-Angaben; die Nav wird per `margin-left:auto` nach rechts geschoben, der Sprachumschalter folgt direkt danach.

### 2.3 Logo-Lockup (`<a>`)

| Eigenschaft               | Wert                                | Tailwind v4                           |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| `href`                    | `Startseite.dc.html` → real **`/`** | `routerLink="/"`                      |
| `display` / `align-items` | `flex` / `center`                   | `flex items-center`                   |
| `gap`                     | `10px`                              | `gap-2.5` (0.625rem = 10px, on-scale) |
| `color`                   | `#ffffff`                           | `text-white`                          |
| `text-decoration`         | `none`                              | `no-underline`                        |

Bild:

| Eigenschaft        | Wert                                                    | Tailwind v4      |
| ------------------ | ------------------------------------------------------- | ---------------- |
| `src`              | `assets/fox-head.png` (Quelldatei 600×600, transparent) | —                |
| `alt`              | `Boundfox Studios`                                      | —                |
| `width` / `height` | `32px` / `32px`                                         | `h-8 w-8`        |
| `object-fit`       | `contain`                                               | `object-contain` |

Wortmarke (`<span>`, enthält zwei farbige Kind-`<span>`s, getrennt durch ein **echtes Leerzeichen**):

| Eigenschaft       | Wert                       | Token                 | Tailwind v4                                  |
| ----------------- | -------------------------- | --------------------- | -------------------------------------------- |
| `font-family`     | `'Bebas Neue', sans-serif` | `var(--font-display)` | `font-display`                               |
| `font-size`       | `24px`                     | `--display-sm`        | `text-2xl`                                   |
| `letter-spacing`  | `0.05em`                   | —                     | `tracking-wider` (Tailwind-Default = 0.05em) |
| `line-height`     | `1`                        | `--leading-tight`     | `leading-none`                               |
| `white-space`     | `nowrap`                   | —                     | `whitespace-nowrap`                          |
| Teil 1 „BOUNDFOX" | `color:#ffa726`            | `var(--bfs-orange)`   | `text-orange`                                |
| Teil 2 „STUDIOS"  | `color:#ffeb3b`            | `var(--bfs-yellow)`   | `text-yellow`                                |

### 2.4 Navigation (`<nav>`)

| Eigenschaft   | Wert     | Token       | Tailwind v4    |
| ------------- | -------- | ----------- | -------------- |
| `display`     | `flex`   | —           | `flex`         |
| `gap`         | `4px`    | `--space-1` | `gap-1`        |
| `margin-left` | `auto`   | —           | `ml-auto`      |
| `align-items` | `center` | —           | `items-center` |
| `flex-wrap`   | `wrap`   | —           | `flex-wrap`    |

Nav-Link (alle vier identisch, nur Farb-/Border-Werte variieren):

| Eigenschaft                     | Wert                                                         | Token                            | Tailwind v4                                  |
| ------------------------------- | ------------------------------------------------------------ | -------------------------------- | -------------------------------------------- |
| `padding`                       | `8px 12px`                                                   | `--space-2` / `--space-3`        | `py-2 px-3`                                  |
| `font-family`                   | Bebas Neue                                                   | `var(--font-display)`            | `font-display`                               |
| `font-size`                     | `16px`                                                       | `--text-base`                    | `text-base`                                  |
| `letter-spacing`                | `0.05em`                                                     | —                                | `tracking-wider`                             |
| `text-decoration`               | `none`                                                       | —                                | `no-underline`                               |
| `border-bottom`                 | **immer** `2px solid …`                                      | —                                | `border-b-2`                                 |
| `color` (inaktiv)               | `#ffffff`                                                    | —                                | `text-white`                                 |
| `border-bottom-color` (inaktiv) | `transparent`                                                | —                                | `border-transparent`                         |
| `color` (aktiv)                 | `#ffeb3b`                                                    | `var(--bfs-yellow)`              | `text-yellow`                                |
| `border-bottom-color` (aktiv)   | `#ffeb3b`                                                    | `var(--bfs-yellow)`              | `border-yellow`                              |
| Hover (nur inaktiv relevant)    | `color:#ffeb3b`                                              | `var(--bfs-yellow)`              | `hover:text-yellow`                          |
| Transition                      | `color 150ms cubic-bezier(.4,0,.2,1)` (README §Interactions) | `--dur-fast` / `--ease-standard` | `transition-colors duration-150 ease-in-out` |

**Wichtig:** Der `border-bottom` ist auch im inaktiven Zustand vorhanden (`2px solid transparent`) — dadurch springt beim Aktivwerden nichts. Die Bebas-Labels sind im Markup bereits in Großbuchstaben geschrieben; zusätzlich `uppercase` setzen ist unschädlich und empfohlen (Bebas Neue hat ohnehin nur Versalien).

Die Link-Höhe ergibt sich zu 8 + ~19 (16px Bebas, line-height normal) + 8 + 2 = ~37px und bleibt damit unter der 48px-Mindesthöhe des Containers — die Höhe wird also vom `min-height` des Containers bestimmt, nicht von der Nav.

### 2.5 Sprachumschalter (`<div>`)

| Eigenschaft               | Wert                                    | Token                   | Tailwind v4                    |
| ------------------------- | --------------------------------------- | ----------------------- | ------------------------------ |
| `display` / `align-items` | `flex` / `center`                       | —                       | `flex items-center`            |
| `gap`                     | `8px`                                   | `--space-2`             | `gap-2`                        |
| `font-family`             | Bebas Neue                              | `var(--font-display)`   | `font-display`                 |
| `font-size`               | `14px`                                  | `--text-sm`             | `text-sm`                      |
| `letter-spacing`          | `0.05em`                                | —                       | `tracking-wider`               |
| `border-left`             | `1px solid #525252`                     | `var(--bfs-gray-600)`   | `border-l border-neutral-600`  |
| `padding-left`            | `16px`                                  | `--space-4`             | `pl-4`                         |
| „DE" (aktiv)              | `color:#ffeb3b`, `text-decoration:none` | `var(--bfs-yellow)`     | `text-yellow no-underline`     |
| „/" (Trenner, `<span>`)   | `color:#525252`                         | `var(--bfs-gray-600)`   | `text-neutral-600`             |
| „EN" (inaktiv)            | `color:#ffffff`, Hover `#ffeb3b`        | — / `var(--bfs-yellow)` | `text-white hover:text-yellow` |

Im Markup stehen `DE`, `/` und `EN` **ohne Whitespace** direkt aneinander — der Abstand kommt ausschließlich aus `gap:8px`. Die visuelle Darstellung ist also `DE  /  EN` mit je 8px.

Die aktive Sprache ist im Prototyp hart auf DE gesetzt (kein `active`-Prop dafür). In Angular: aktive Locale aus dem Routing-Präfix (`/en`) bzw. der i18n-Konfiguration ableiten, gleiche Aktiv-/Inaktiv-Regel wie bei der Nav (aktiv = gelb, inaktiv = weiß + Hover gelb).

---

## 3. Breakpoints & Responsive-Verhalten

Der Header enthält **keine Media Queries und kein `minmax()`** — das gesamte responsive Verhalten läuft über `flex-wrap:wrap` an zwei Stellen:

1. **Container** (`flex-wrap:wrap`, `gap:16px`): reicht der Platz nicht, klappen Nav und/oder Sprachumschalter in eine zweite Zeile. Die Zeilen-Lücke ist ebenfalls 16px (`gap` gilt für Row- und Column-Gap), die Header-Höhe wächst entsprechend über 64px hinaus.
2. **Nav** (`flex-wrap:wrap`, `gap:4px`): die vier Nav-Links brechen untereinander um.

Rechnerische Umbruchgrenze (Rich­twert für QA): Logo ≈ 32 + 10 + ~185px Wortmarke ≈ 227px, Nav ≈ 4 Links (~95 + ~130 + ~135 + ~85 inkl. Padding) + 3×4px gap ≈ 457px, Sprachumschalter ≈ 1 + 16 + ~60 ≈ 77px, plus 2×16px Container-Gap und 2×24px Padding → **ab ca. 840px Viewport-Breite** beginnt der Umbruch (Bebas-Metriken näherungsweise, exakte Werte erst nach Font-Load messbar).

**Nicht im Design enthalten, für die Umsetzung zu ergänzen (README §Header + §Interactions):** ein echtes Burger-/Mobile-Menü. Der Prototyp lässt die Nav lediglich umbrechen. Vorschlag: unter `md` (768px) Nav + Sprachumschalter in ein Toggle-Panel, Burger-Button rechts (`ml-auto`), Icon aus Lucide (`menu` / `x`, 24px, `currentColor`), gleiche Hover-Farbregel (weiß → `#ffeb3b`). Panel-Hintergrund `#171717`, Links volle Breite, Padding `8px 12px` beibehalten.

---

## 4. Copy-Strings (verbatim) mit i18n-Key-Vorschlag

Alle Strings stammen wörtlich aus der Designdatei. Namespace-Vorschlag: `site-header.*`.

| i18n-Key                              | Deutscher String (verbatim) | Ort               | Anmerkung                                         |
| ------------------------------------- | --------------------------- | ----------------- | ------------------------------------------------- |
| `site-header.logo.alt`                | `Boundfox Studios`          | `<img alt>`       | übersetzbar (Alt-Text)                            |
| `site-header.logo.wordmark-primary`   | `BOUNDFOX`                  | Wortmarke, orange | Markenname — locale-invariant                     |
| `site-header.logo.wordmark-secondary` | `STUDIOS`                   | Wortmarke, gelb   | Markenname — locale-invariant                     |
| `site-header.nav.home`                | `STARTSEITE`                | Nav-Link 1        | EN: `HOME`                                        |
| `site-header.nav.apps-and-games`      | `APPS & SPIELE`             | Nav-Link 2        | im Markup `APPS &amp; SPIELE`; EN: `APPS & GAMES` |
| `site-header.nav.support`             | `UNTERSTÜTZEN`              | Nav-Link 3        | EN: `SUPPORT`                                     |
| `site-header.nav.socials`             | `SOCIALS`                   | Nav-Link 4        | in beiden Sprachen gleich                         |
| `site-header.language.de`             | `DE`                        | Sprachumschalter  | locale-invariant                                  |
| `site-header.language.en`             | `EN`                        | Sprachumschalter  | locale-invariant                                  |

Nicht als Key nötig: der Trenner `/` zwischen DE und EN — statisches Markup.

**Zusätzliche, im Design nicht sichtbare Strings (für A11y/Mobile zu ergänzen):**

| i18n-Key                          | Vorschlag DE      | Zweck                                                            |
| --------------------------------- | ----------------- | ---------------------------------------------------------------- |
| `site-header.nav.aria-label`      | `Hauptnavigation` | `<nav aria-label>`                                               |
| `site-header.logo.link-label`     | `Zur Startseite`  | `aria-label` des Logo-Links (Wortmarke ist Text, daher optional) |
| `site-header.language.aria-label` | `Sprache wählen`  | Gruppe des Sprachumschalters                                     |
| `site-header.menu.open`           | `Menü öffnen`     | Burger-Button (ergänzt)                                          |
| `site-header.menu.close`          | `Menü schließen`  | Burger-Button (ergänzt)                                          |

---

## 5. Farb- & Typografie-Tokens

### 5.1 Verwendete Farben

| Rolle im Header                                                    | Hex           | DS-Variable (`tokens/colors.css`) | Semantischer Alias  | Tailwind-v4-Theme-Key |
| ------------------------------------------------------------------ | ------------- | --------------------------------- | ------------------- | --------------------- |
| Band-Hintergrund                                                   | `#171717`     | `--bfs-ink`                       | `--text-heading`    | `--color-neutral-900` |
| Text auf Band, Logo-Link, inaktive Nav, inaktive Sprache           | `#ffffff`     | `--bfs-white`                     | `--text-on-inverse` | `--color-white`       |
| „BOUNDFOX"                                                         | `#ffa726`     | `--bfs-orange`                    | `--accent-strong`   | `--color-orange`      |
| „STUDIOS", aktive Nav (Text + Border), Hover-Farbe, aktive Sprache | `#ffeb3b`     | `--bfs-yellow`                    | `--accent-soft`     | `--color-yellow`      |
| Trennlinie links vom Sprachumschalter, „/"-Trenner                 | `#525252`     | `--bfs-gray-600`                  | `--text-muted`      | `--color-neutral-600` |
| Border-Farbe inaktiver Nav-Links                                   | `transparent` | —                                 | —                   | `border-transparent`  |

Im Header **nicht** verwendet (nur zur Abgrenzung): `#ffc107` (`--bfs-amber`), `#a16207` (`--link`), `#404040`, `#a3a3a3`, `#d4d4d4`, `#e5e5e5`, `#f5f5f5`, `--gradient-brand`.

Achtung: `styles.css` des DS setzt global `a{color:var(--link);text-decoration:none}` und `a:hover{color:var(--accent-strong)}`. Alle Header-Links überschreiben `color` explizit — beim Nachbau nicht auf globale Link-Farben verlassen, sondern die Farben an den Header-Links setzen.

### 5.2 Verwendete Typografie

| Rolle            | Font       | Größe | Tracking | Leading                | DS-Token                                            |
| ---------------- | ---------- | ----- | -------- | ---------------------- | --------------------------------------------------- |
| Wortmarke        | Bebas Neue | 24px  | 0.05em   | 1                      | `--font-display`, `--display-sm`, `--leading-tight` |
| Nav-Labels       | Bebas Neue | 16px  | 0.05em   | normal (nicht gesetzt) | `--font-display`, `--text-base`                     |
| Sprachumschalter | Bebas Neue | 14px  | 0.05em   | normal (nicht gesetzt) | `--font-display`, `--text-sm`                       |

Barlow und Tahu kommen im Header **nicht** vor. `0.05em` ist im DS-Token-Set nicht als eigene Variable hinterlegt (`--tracking-display:0.025em`, `--tracking-caps:0.1em`), liegt aber exakt auf Tailwinds `tracking-wider`.

Font-Loading (`tokens/fonts.css`):

```
https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap
```

Für den Header genügt Bebas Neue (nur ein Schnitt, 400). Für SSR: `preconnect` auf `fonts.googleapis.com` + `fonts.gstatic.com` und `font-display:swap` beibehalten, um CLS in der 64px-Zeile zu vermeiden.

### 5.3 `@theme`-Ergänzung für `projects/website/src/styles.css`

`styles.css` enthält bisher nur `@import 'tailwindcss';`. Der Header braucht daraus (README §Design Tokens, gekürzt auf die im Header genutzten Werte — der volle Block gehört ohnehin einmalig ins Projekt):

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
}
```

`--color-*: initial` löscht die Stock-Palette (Brand-Vorgabe: keine Tailwind-Gelbtöne). `border-transparent` bleibt trotzdem verfügbar, da `transparent`/`currentColor` nicht Teil der gelöschten Farbpalette sind — im Zweifel `--color-transparent: transparent;` explizit ergänzen.

---

## 6. Links & Routing

| Label                   | Prototyp-`href`           | Ziel-Route (README §Routen)           | `active`-Wert | Angular                                                                                |
| ----------------------- | ------------------------- | ------------------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| Logo (Bild + Wortmarke) | `Startseite.dc.html`      | `/`                                   | —             | `routerLink="/"`                                                                       |
| STARTSEITE              | `Startseite.dc.html`      | `/`                                   | `start`       | `routerLink="/"`, `routerLinkActive` mit `[routerLinkActiveOptions]="{ exact: true }"` |
| APPS & SPIELE           | `Spiele und Apps.dc.html` | `/apps-und-spiele`                    | `projekte`    | `routerLink="/apps-und-spiele"`                                                        |
| UNTERSTÜTZEN            | `Unterstuetzen.dc.html`   | `/unterstuetzen`                      | `support`     | `routerLink="/unterstuetzen"`                                                          |
| SOCIALS                 | `Socials.dc.html`         | `/socials`                            | `socials`     | `routerLink="/socials"`                                                                |
| DE                      | `#` (Platzhalter)         | aktuelle Seite in `de`                | —             | i18n/Locale-Wechsel, nicht Router-intern                                               |
| EN                      | `#` (Platzhalter)         | aktuelle Seite in `en` (Präfix `/en`) | —             | i18n/Locale-Wechsel                                                                    |

Impressum (`/impressum`) und Datenschutz (`/datenschutz`) erscheinen **nicht** in der Nav (nur im Footer); sie werden über `active="legal"` eingebunden, wodurch **kein** Nav-Punkt hervorgehoben ist.

Externe Links: keine im Header.

---

## 7. Komponenten & Props

### 7.1 `SiteHeader`

Der Prototyp definiert genau ein Prop:

```
active: 'start' | 'projekte' | 'support' | 'socials' | 'legal'   // default: 'start'
```

Logik aus dem `<script type="text/x-dc">`-Block:

```js
const on = 'var(--bfs-yellow)',
  off = '#ffffff',
  un = 'transparent';
const v = k => ({ c: a === k ? on : off, b: a === k ? on : un });
```

→ pro Nav-Punkt: Textfarbe `gelb | weiß`, Border-Bottom-Farbe `gelb | transparent`. `legal` trifft keinen Key → alle Links inaktiv.

**Empfehlung für Angular:** Das `active`-Prop **nicht** portieren, sondern `routerLinkActive` verwenden (`routerLinkActive="text-yellow border-yellow"` am Link, für `/` mit `[routerLinkActiveOptions]="{ exact: true }"`). Damit fällt der `legal`-Fall automatisch korrekt aus. Ein optionales `input()` bleibt nur nötig, falls die Komponente ohne Router (z. B. in Tests/Storybook) gerendert wird.

Komponenten-Skelett:

- `selector: 'bfs-site-header'` (Projekt-Präfix prüfen), standalone, `ChangeDetectionStrategy.OnPush`
- Template: semantisches `<header>` mit `<nav aria-label="Hauptnavigation">`
- Keine Inputs/Outputs zwingend erforderlich; für Mobile: internes `signal<boolean>` für den Menü-Zustand

### 7.2 Wiederverwendbare Bausteine, die hier auftauchen

| Baustein           | Wo im Header | Props/Varianten                                                                                                                                                                             |
| ------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Wordmark`/`Logo`  | Logo-Lockup  | `size` (Header 32px Mark + 24px Text, Footer 40px Mark + gleicher Text) — der Footer nutzt exakt dieselbe Wortmarke; als eigene Komponente `bfs-brand-lockup` mit `markSize`-Input auslegen |
| `NavLink`          | 4 Nav-Links  | `active: boolean`, `href/routerLink`, Label; Styling = Bebas 16px, `py-2 px-3`, `border-b-2`, aktiv gelb                                                                                    |
| `LanguageSwitcher` | rechts       | `current: 'de' \| 'en'`; rendert `DE / EN`, aktive Sprache gelb                                                                                                                             |

Aus dem DS-Komponenten-Bundle (`components/display/Badge`, `Card`, `forms/Button` …) wird im Header **nichts** verwendet — der Header besteht ausschließlich aus nativen Elementen.

---

## 8. Assets & Icons

| Asset                  | Pfad im Handoff                                           | Verwendung                                        | Ziel                                                                                                                                                                                              |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fox-Head-Mark          | `assets/fox-head.png` (600×600, transparentes PNG, 13 KB) | Logo links, gerendert 32×32, `object-fit:contain` | nach `projects/website/public/assets/` übernehmen; wegen 600px-Quelle für 32px-Anzeige eine kleinere Variante (64×64 / 96×96 für 3×) oder WebP erzeugen; `width`/`height` am `<img>` setzen (CLS) |
| Logo-Lockup (Referenz) | `assets/logo-lockup.png` (1042×751)                       | **nicht** im Header verwendet, nur Referenz       | —                                                                                                                                                                                                 |

- **Inline-SVG/Icons: keine** im Header. (Social-Glyphen als Inline-SVG gibt es nur im Footer und auf Socials/Unterstützen.)
- Für das zu ergänzende Mobile-Menü: Lucide-Icons `menu` und `x` (24×24, `stroke-width 2`, `currentColor`) — laut DS-Readme ist Lucide das gesetzte Substitut-Icon-Set.
- Marken-Regel (DS-Readme): Fox-Head **nur vollfarbig** und **nur auf Weiß oder Dunkel** — im Header (`#171717`) korrekt; nie auf Gelb/Gradient.

---

## 9. Abweichungen Designdatei vs. README

| Punkt                     | README                                                                     | Designdatei (maßgeblich)                                    | Auflösung                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Header-Padding/Höhe       | „Höhe 64px, Padding `0 24px`"                                              | `padding:8px 24px; min-height:48px`                         | Identisches Ergebnis (8+48+8 = 64px). **Datei umsetzen** (`py-2 px-6 min-h-12`), damit bei Umbruch/größerem Inhalt nichts abgeschnitten wird. |
| Logo-Gap                  | nicht erwähnt                                                              | `gap:10px`                                                  | 10px (`gap-2.5`)                                                                                                                              |
| Sprachumschalter-Gap      | nicht erwähnt                                                              | `gap:8px` zwischen DE, `/`, EN                              | 8px (`gap-2`)                                                                                                                                 |
| Transitions               | „150ms cubic-bezier(.4,0,.2,1)"                                            | im Markup nicht deklariert (Prototyp-Runtime `style-hover`) | README folgen: `transition-colors duration-150 ease-in-out` auf allen Hover-Links                                                             |
| Mobile-Menü               | „für die echte Umsetzung Burger-Menü ergänzen (nicht im Design enthalten)" | nur `flex-wrap`                                             | Burger-Menü selbst entwerfen, siehe §3                                                                                                        |
| Sprachumschalter-Funktion | „Funktion in Angular: i18n/Routing, im Design nur UI"                      | `href="#"`                                                  | echte Locale-Links bauen                                                                                                                      |

---

## 10. A11y-Checkliste (nicht im Design, für die Umsetzung verbindlich)

- `<header>` als Landmark, `<nav aria-label="Hauptnavigation">`.
- Aktiver Nav-Punkt zusätzlich `aria-current="page"` — die gelbe Farbe + Unterstrich allein ist nicht ausreichend.
- Fokus-Sichtbarkeit: DS-Token `--focus-ring: var(--bfs-amber)` (`#ffc107`) → `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber` (im Design nicht dargestellt).
- Kontrast auf `#171717`: Weiß 16.9:1 ✓, `#ffeb3b` 13.7:1 ✓, `#ffa726` 9.5:1 ✓, Trenner `#525252` nur dekorativ.
- Sprachumschalter-Links mit `hreflang` und sprechendem Text/`aria-label` (`Deutsch` / `English`), da „DE"/„EN" allein knapp sind; der Trenner `/` sollte `aria-hidden="true"` sein.
- Logo-Link: Wortmarke ist echter Text → das `<img>` kann `alt=""` bekommen, wenn der Text daneben steht; im Design steht `alt="Boundfox Studios"` — dann besser Text `aria-hidden` **nicht** setzen und Alt auf `""` reduzieren, um Doppellesung zu vermeiden.
