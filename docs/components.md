# Component inventory and API

This file is the agreed inventory and API of every shared component on the site: selector, path, signal inputs, projection slots, exact utility strings and consuming pages, one subsection each. It is the single agreed list — issues #11, #14, #17, #19, #25 and #30 are checked against it, and §6 resolves every component and prop name proposed anywhere in `docs/design/*.md` to exactly one row. Precedence throughout is `SPEC.md` > `docs/decisions.md` > `docs/design/*.md`, except that a `docs/decisions.md` row which says it corrects `SPEC.md` wins over `SPEC.md` (`CLAUDE.md` › _Read before touching anything_); where a design document contradicts a row here, the row wins, because it was derived under that rule. A component under `projects/website/src/app/ui/` (or `app/layout/`) without a row here is a defect, not an omission.

## 1. Cross-page geometry

### 1.1 Container

Every section is `mx-auto max-w-6xl px-6` — 1152px outer, **1104px inner**, which is the design's `--container-max` exactly. Never `max-w-[1200px]`, never a `max-w-legal` token.

Consequence, stated once so no page re-derives it: desktop card width is 352px (border-box), not the prototype's 368px. The column-count breakpoints in the design docs are unaffected. This closes the "box-sizing" open decision in `docs/design/socials.md` §1.

The legal pages are the single exception: `mx-auto max-w-[760px] px-6` — an arbitrary value per §1.3, not a token.

### 1.2 Heading case

All display copy is authored in **natural German case** and uppercased with the `uppercase` utility on the rendering element. The uppercase spellings in `docs/design/*.md` are rendered output, not source strings.

Two load-bearing consequences:

- The shipped Bebas subset is defined by a **text string, not a unicode range**: `ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ0123456789 &§©·–—→/.,:!?'()-+%` (`docs/decisions.md` M2 › Fonts › _Output names and subsets_, restated in `docs/licenses/fonts.md` › "Bebas Neue is uppercase-only here"). It carries no lowercase forms, so **every element carrying `font-display` must also carry `uppercase`**, or lowercase source letters render from the `Bebas Neue Fallback` / Arial face.
- `→` (U+2192) is _in_ that subset request, but neither Bebas Neue nor Barlow contains the glyph at any weight — verified against the upstream TTFs, not just the subsets (`docs/licenses/fonts.md` › "`→` never comes from a brand font"). It stays in the request so the export does not have to change if that ever becomes false. Every arrow renders from the fallback stack today, which is also why components render the arrow themselves (C9) and it never sits inside a translatable string.

Source strings therefore read `Apps & Spiele`, `Unterstütze uns`, `Zuletzt auf GitHub`, `Vernetze dich mit uns`, `Kostenfrei unterstützen`, `Finanziell unterstützen`, `Alle Projekte`, `Alle Repositories`, `Boundfox`, `Studios`, `Seiten`, `Rechtliches`, `Folge uns` — never the shouted spelling. `docs/design/site-footer.md` §5's note ("keep the source strings uppercase") is overridden by `docs/decisions.md` › _Brand and typography_.

### 1.3 One-off measurements

No further `@theme` tokens (`docs/decisions.md` M2 › Theme tokens › _Off-scale values_). One-off measurements are written as arbitrary utilities at the usage site, in exactly the spelling the design docs and the decision log use — including the three that happen to sit on Tailwind's 4px scale (`h-[180px]`, `h-[200px]`, `min-h-[240px]` could be `h-45`, `h-50`, `min-h-60`; the sources write the arbitrary form, so this file does too, and no page invents the other spelling).

The complete list: `text-[28px]`, `text-[38px]`, `text-[44px]`, `text-[clamp(40px,5.5vw,60px)]`, `max-w-[280px]`, `max-w-[300px]`, `max-w-[480px]`, `max-w-[560px]`, `max-w-[620px]`, `max-w-[760px]`, `w-[56%]`, `w-[62%]`, `px-[18px]`, `size-[22px]`, `h-[180px]`, `h-[200px]`, `min-h-[240px]`, `leading-[normal]`, `bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)]`, `bg-[size:20px_20px]`, plus the **five** grid-track strings recorded in §7: `grid-cols-[repeat(auto-fit,minmax(min(N,100%),1fr))]` for N ∈ {220, 280, 300, 320, 420}.

## 2. Conventions that bind every component

1. **C1 Borders name their colour.** Preflight emits `border: 0 solid` with no colour, so every `border*` utility is paired with a colour utility. The complete allowed set on this site: `border-neutral-200` (#e5e5e5), `border-neutral-600` (#525252), `border-transparent`, `border-yellow`, `border-amber`. The grep that proves it: `grep -rn "border" projects/website/src/app/ui | grep -v "border-neutral\|border-transparent\|border-yellow\|border-amber"` returns nothing.
2. **C2 Letter-spacing.** `0.025em` = `tracking-wide`, `0.05em` = `tracking-wider`, `0.1em` = `tracking-widest`. These are Tailwind v4 defaults and survive the `--color-*: initial` wipe (that wipe only clears `--color-*`). Never define a tracking token, never an arbitrary tracking value.
3. **C3 Focus.** The single `focus-ring` utility from the focus-system issue (#12) goes on every interactive element; no component declares a `focus-visible:` variant of its own and `outline-none` never appears. `surface-dark` (which flips `--focus-ring` to `#ffc107`) goes on the header band, the footer band, the Socials tiles (`bfs-link-card tone="dark"`) and the dark Support chip span — the four surfaces `docs/decisions.md` M2 › Focus system names. Everything else inherits `#171717`, including the yellow→orange gradient band.
4. **C4 Motion.** Colour and border-colour only: `transition-colors duration-150 ease-in-out`. No transform, no scale, no shadow change on hover; the one `translate` on the site is `active:translate-y-px` on `bfs-button-primary`. `motion-reduce:transition-none` is required only on the mobile menu's opacity transition (`docs/decisions.md` M3 › Panel geometry and motion).
5. **C5 Hover.** No card-level hover where the design has none: `bfs-project-card`, `bfs-feature-card` and `bfs-repository-card` are non-interactive and are never wholly clickable. `bfs-link-card` is a single `<a>` whose only hover is the border colour (plus the light tone's `hover:text-neutral-700`, which cancels the global `a:hover`).
6. **C6 Presentational.** `<name>.ts` + `<name>.html`, no `.component` suffix, no component `.css`, `ChangeDetectionStrategy.OnPush`, `input()`/`computed()`, no injected services. The one sanctioned exception is `bfs-repository-card`, which does `private readonly locale = inject(LOCALE_ID);` — a compile-time constant, not a service (`docs/decisions.md` M4 › Relative time).
7. **C7 Active navigation.** `routerLinkActive` replaces the prototype's `active` prop everywhere. `bfs-site-header` has **no** `active` input; the `legal` case falls out by itself because no nav link matches `/legal-details-imprint` or `/privacy-policy`. The active link additionally carries `aria-current="page"`.
8. **C8 Copy in components.** German source lives in templates. A component receives translatable copy either as a static attribute marked at the usage site (`<bfs-project-card platforms="iOS & Android" i18n-platforms="@@home.projects.flugwacht.platforms">`) or as projected content when the string contains markup. Product, brand and acronym names (`LehrGrapht`, `MAT`, `Flugwacht`, `Bug-A-Ball`, `GitHub`, `Discord`, `YouTube`, `Ko-fi`, `Patreon`, `Boundfox`, `Studios`, `DE`, `EN`) are unmarked literals rendered with `translate="no"`.
9. **C9 Arrows.** Components render the arrow themselves: `{{ label }}<span aria-hidden="true" class="ml-1">→</span>` (verbatim from `docs/decisions.md` › _Brand and typography_). Every id's source text is the design string minus the trailing arrow.
10. **C10 Projection slot names are kebab-case attributes**, following `docs/decisions.md` M4 (`<ng-content select="[card-footer]" />`): `[card-media]`, `[card-badge]`, `[card-chip]`, `[card-links]`, `[card-cta]`, `[card-footer]`, `[head-link]`, `[head-accent]`. The unnamed `<ng-content />` is always the descriptive body text. The single camelCase exception is `[legalNotice]` on `bfs-legal-page`, because `docs/decisions.md` M6 fixes that spelling.
11. **C11 Host display.** A component whose root element must be the flex/grid item declares `host: { class: 'contents' }`, so the styled element in the template becomes the grid item. Without it the host element itself is `display:inline` and equal-height rows plus `mt-auto` CTA pinning (`docs/design/socials.md` §3.2) break. Applies to `bfs-project-card`, `bfs-feature-card`, `bfs-link-card`, `bfs-card`, `bfs-repository-card`, `bfs-brand-lockup`, `bfs-section-head`, `bfs-legal-page`.
12. **C12 Links.** Internal navigation uses `routerLink` **without** a trailing slash (`routerLink="/support"`). Trailing slashes are for plain-href output only: canonical, hreflang, sitemap `<loc>`, language switcher. A component input that carries a route is named `route`, never `routerLink` — `[routerLink]` is the RouterLink directive's selector and would attach the directive to the component host.
13. **C13 DOM ids.** `<component>-<section>-title`; the fixed exceptions are `mobile-menu-panel` and the a11y hook `data-a11y-exception="kicker-contrast"`. The footer's three column titles carry `footer-pages-title`, `footer-legal-title`, `footer-social-title` and are referenced by `aria-labelledby`.
14. **C14 Images.** Relative paths only (`images/…`, never `/images/…`) — an absolute path makes `/en/` load the German copy of the asset. Every `<img>` carries an `alt` attribute — `alt=""` when decorative, never omitted. The fox head goes through `NgOptimizedImage`; SVGs are `<img src>` with intrinsic `width`/`height` attributes and are **never** inlined (their global `cls-*` class names collide).
15. **C15 Heading weight.** Preflight sets `h1`–`h6` to `font-weight: inherit`, so `font-normal` on a display heading is a restatement of the reset, not an override. The class strings below keep it where the source document writes it (`docs/design/support.md` §2, `docs/decisions.md` M6) and omit it elsewhere; both render at 400. Do not "fix" one to match the other.
16. **C16 Design harness.** `projects/website/src/app/pages/design-harness/` exists only during M2 and is deleted by the UI-primitives PR (#14); `grep -rn design-harness projects` must then be empty.

## 3. UI primitives (`projects/website/src/app/ui/`)

Selector prefix `bfs` (SPEC §2). Signal inputs only, OnPush everywhere, no component `.css`.

### 3.1 `bfs-badge` — `app/ui/badge/badge.ts|.html`

```ts
export type BadgeVariant = 'amber' | 'outline';
readonly variant = input.required<BadgeVariant>();
```

Template: `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase" [class]="variantClass()"><ng-content /></span>`

- `amber` → `bg-amber text-neutral-900`
- `outline` → `text-neutral-900 ring-1 ring-inset ring-neutral-400` — a **ring, never a border**; a 1px border makes it 2px taller and the meta rows in the apps grid stop aligning.
- Rendered height is **20px for both variants** (12px `text-xs` + its `calc(1/0.75)` = 16px line box + 2×2px `py-0.5`). The design's "22px" is the surrounding line box. The acceptance criterion is parity at 20px, measured side by side (`docs/decisions.md` M2 › UI primitives › Badge height); issue #14's "exactly 22px" checkbox is amended by that row.
- `yellow`, `orange` and `dark` are dropped — they occur nowhere in the six pages (`docs/decisions.md` M2 › Component inventory › Badge variants).
- Labels are always projected and marked at the usage site: `@@common.badge.available` (`Verfügbar`) and `@@common.badge.in-development` (`In Entwicklung`) — one spelling repo-wide, no `meaning`, no `description`.

Consumers: home 4 project cards (2 amber, 2 outline); Apps & Games 3 app cards (1 amber, 2 outline) + the feature card (amber). Not used on Support, Socials or the legal pages (the privacy draft badge is dropped, `docs/decisions.md` M6 › Privacy › Draft badge).

### 3.2 `bfs-kicker` — `app/ui/kicker/`

```ts
readonly variant = input<'block' | 'inline'>('block');
```

- `block` → `<p class="mb-2 text-xs font-bold tracking-widest text-orange uppercase" data-a11y-exception="kicker-contrast"><ng-content /></p>`
- `inline` → the same `<span>` without `mb-2`.
- The `data-a11y-exception="kicker-contrast"` attribute is mandatory on the rendered element: the axe run excludes exactly this selector, and `docs/accessibility.md` (written by #12/#45) records the measured **1.94:1** for `#ffa726` on `#ffffff`. Do not darken the kicker (SPEC §12 D2, SPEC §11.6).

Consumers: home (projects head, GitHub head, 4 card meta rows), Apps & Games (page head, 3 card meta rows, feature card), Support hero, Socials hero, 404 — `block` for page and section heads, `inline` inside cards.

### 3.3 `bfs-section-head` — `app/ui/section-head/`

Absorbs `PageHead`, `PageHero`, `PageIntro`, `SectionHeading` and "section head".

```ts
readonly variant = input<'page' | 'section'>('section');
readonly size = input<'display-md' | 'display-sm'>('display-sm'); // section only: 36px | 24px
readonly heading = input.required<string>();
readonly headingLevel = input<1 | 2 | 3 | null>(null);
readonly kicker = input<string | null>(null);
readonly lead = input<string | null>(null);          // page variant only
readonly leadMaxWidth = input<560 | 620>(560);
readonly subline = input<string | null>(null);       // section + display-sm only
readonly bottomMargin = input<0 | 24 | 28 | 32>(0);

protected readonly level = computed(() => this.headingLevel() ?? (this.variant() === 'page' ? 1 : 2));
```

Heading classes, shared: `m-0 font-display font-normal leading-none tracking-wide text-neutral-900 uppercase`; plus the size:

| form                                  | size class                      |
| ------------------------------------- | ------------------------------- |
| `variant="page"`                      | `text-[clamp(40px,5.5vw,60px)]` |
| `variant="section" size="display-md"` | `text-4xl` (36px)               |
| `variant="section" size="display-sm"` | `text-2xl` (24px)               |

Row layout, one per form:

- **page** and **section/display-md** — `<div class="flex flex-wrap items-end justify-between gap-6">`, left block = optional kicker + heading + optional lead `<p class="mt-3 max-w-[560px] text-lg leading-relaxed text-pretty">` (or `max-w-[620px]`), right block = `<ng-content select="[head-link]" />`. When neither a head link nor a lead exists the wrapper is still the flex row — harmless, one code path.
- **section/display-sm** — `<div class="flex items-center gap-4">` containing the heading and `<div class="h-px flex-1 bg-neutral-200"></div>`, followed by the optional subline `<p class="m-0 mb-6 text-sm text-neutral-600">`. When a subline is present the row carries `mb-2`, so the block still ends 24px above the grid (`docs/design/support.md` §3.1 rhythm: row `margin-bottom:8px`, subline `margin:0 0 24px`).
- `bottomMargin` maps through a literal class map: `0 → ''`, `24 → 'mb-6'`, `28 → 'mb-7'`, `32 → 'mb-8'`. Home's projects head uses 32, home's GitHub head 28 — both stay, they are not unified (`docs/design/home.md` §10.5). The four standalone page heads use 0 because their `<section>` padding supplies the rhythm.
- Optional Tahu accent: `<ng-content select="[head-accent]" />` after the lead, used only by Support (`<p head-accent class="mt-4 font-script text-[44px] leading-none text-orange" i18n="@@support.hero.thanks">Danke!</p>`). No `uppercase` here — Tahu ships the mixed-case subset `Danke!Thanks`.
- `headingLevel` exists only because issue #14 names it. No usage across the six pages plus the 404 needs a value other than the variant default, so it defaults to `null` and costs nothing.

Consumers: home §3.2 (`variant="page"`, `[bottomMargin]="32"`, kicker + lead + `[head-link]`; level 1 is the `page` default and is not passed), home §5.2 (`variant="section" size="display-md"`, `[bottomMargin]="28"`, kicker + `[head-link]`), Apps & Games page head (`page`) and the APPS/SPIELE rows (`section` `display-sm`, `[bottomMargin]="24"`), Support hero (`page`, `[leadMaxWidth]="620"`, accent) and its two section rows (`section` `display-sm` with `subline`), Socials hero (`page`), 404 (`page`).

### 3.4 `bfs-project-card` — `app/ui/project-card/`

One component for the home grid and the apps grid.

```ts
export type ProjectCardDensity = 'roomy' | 'compact';
export type ProjectCardMedia = 'pattern' | 'contain' | 'icon' | 'cover';
readonly density = input.required<ProjectCardDensity>();
readonly media = input.required<ProjectCardMedia>();
readonly kicker = input.required<string>();
readonly title = input.required<string>();
readonly platforms = input.required<string>();
readonly headingLevel = input<2 | 3>(2);
```

Density is the **only** size switch: `roomy` = home (media 200px, pattern wordmark authored at 44px, page grid `minmax(min(420px,100%),1fr)`), `compact` = Apps & Games (media 180px, wordmark 38px, page grid `minmax(min(300px,100%),1fr)`). The grid track lives on the page, not the card; it is recorded here so the two pages cannot drift. Density also carries the footer arrangement, which is the one place the two design documents genuinely differ (`docs/design/home.md` §3.4 vs. `docs/design/apps-and-games.md` §3.2e) — the two footers are bound to `density`, not unified.

Template tree:

```
article.flex.flex-col.overflow-hidden.rounded-xl.border.border-neutral-200.bg-white.shadow-md   (host: contents)
├── div  media panel
│     roomy → h-[200px] · compact → h-[180px]
│     pattern → flex items-center justify-center overflow-hidden border-b border-neutral-200 bg-white
│                bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)]
│                bg-[size:20px_20px]
│     contain | icon → flex items-center justify-center overflow-hidden bg-neutral-100
│     cover   → overflow-hidden bg-neutral-100          (no centering; the image fills)
│   └── <ng-content select="[card-media]" />
└── div.flex.flex-1.flex-col.gap-2.p-6
    ├── div.flex.items-center.gap-2.5
    │   ├── <bfs-kicker variant="inline">{{ kicker() }}</bfs-kicker>
    │   └── <ng-content select="[card-badge]" />
    ├── h2|h3  m-0 font-display text-2xl leading-none tracking-wide text-neutral-900 uppercase
    │          translate="no"   → {{ title() }}
    ├── p.m-0.text-sm.leading-relaxed  → <ng-content />        (description, may contain markup)
    ├── roomy:  div.mt-auto.flex.flex-wrap.items-center.justify-between.gap-3.pt-2
    │             ├── span.text-xs.text-neutral-600 → {{ platforms() }}
    │             └── <ng-content select="[card-links]" />
    └── compact: span.text-xs.text-neutral-600 → {{ platforms() }}
                  div.mt-auto.flex.flex-wrap.gap-4.pt-3 → <ng-content select="[card-links]" />
```

- Only the `pattern` panel carries `border-b border-neutral-200` — it is white on white and needs the separator; the `#f5f5f5` panels do not. Deliberate asymmetry, keep it (`docs/design/apps-and-games.md` §3.2d).
- No hover, no card-level anchor. Only the projected links are clickable.
- Media content is authored at the usage site because it differs per card:
  - graph-paper wordmark `<span card-media aria-hidden="true" translate="no" class="font-display text-[44px] tracking-wide text-neutral-900 uppercase">LehrGrapht</span>` (`text-[38px]` on Apps & Games). The `uppercase` is required and is an addition to the snippet in `docs/decisions.md` M5 › Apps & Games: the shipped Bebas subset has no lowercase glyphs (§1.2), so without it "ehr"/"rapht" render from the Arial fallback.
  - `<img card-media src="images/flugwacht-wordmark.svg" width="231" height="42" alt="…" class="h-auto w-[56%] max-w-[300px]">` (`w-[62%] max-w-[280px]` on Apps & Games);
  - `<img card-media src="images/mat-dark.svg" width="112" height="112" alt="…">` (104×104 on Apps & Games);
  - the Bug-A-Ball `<picture card-media class="block h-full w-full">` (`bug-a-ball-card-840x420.webp`/`.jpg`) wrapping `<img class="h-full w-full object-cover" loading="lazy">`, alt from `@@common.bug-a-ball.key-art-alt` — the `block h-full w-full` on the `<picture>` is load-bearing, and the full block is in §5.2.
- **Settled while building #26: both SVGs are decorative, `alt=""`.** Same rule as the fox head (`docs/decisions.md` › Header / footer › _Fox head `alt`_): the card's own `<h2>` names the product directly below the image, so a non-empty alt makes the card announce its name twice. All four proposed ids are retired — `home.projects.flugwacht.image-alt`, `home.projects.mat.image-alt`, `apps-and-games.apps.flugwacht.wordmark-alt` and `apps-and-games.apps.mat.icon-alt`. The attribute is still written out, never omitted (C14).
- Links are projected `bfs-arrow-link` elements, so their labels and `aria-label`s stay markable in the page template.

Consumers: home 4 cards in order LehrGrapht → Flugwacht → MAT → Bug-A-Ball (`roomy`, `headingLevel` 2); Apps & Games 3 cards in order LehrGrapht → MAT → Flugwacht (`compact`, `headingLevel` 3).

### 3.5 `bfs-feature-card` — `app/ui/feature-card/`

```ts
readonly kicker = input.required<string>();
readonly title = input.required<string>();
readonly platforms = input.required<string>();
readonly headingLevel = input<2 | 3>(3);
```

```
article.grid.overflow-hidden.rounded-xl.border.border-neutral-200.bg-white.shadow-md
        .grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]        (host: contents; no gap — the columns butt)
├── div.relative.min-h-[240px].overflow-hidden.bg-neutral-100 → <ng-content select="[card-media]" />
└── div.flex.flex-col.items-start.gap-2.5.p-8
    ├── div.flex.items-center.gap-2.5 → <bfs-kicker variant="inline"> + <ng-content select="[card-badge]" />
    ├── h3  m-0 font-display text-4xl leading-none tracking-wide text-neutral-900 uppercase  translate="no"
    ├── p.m-0.max-w-[480px].text-base.leading-relaxed → <ng-content />
    ├── span.text-sm.text-neutral-600 → {{ platforms() }}      (14px here, not the cards' 12px)
    └── <ng-content select="[card-cta]" />
```

The media column has no `border-right`; the two columns are separated only by the background change. The two columns separate at viewport 690px, not the 688px `docs/design/apps-and-games.md` §3.3b states — the card's own 1px borders sit inside the content width (`docs/decisions.md` M5 › Apps & Games › _Feature-card stacking threshold_), and above that the computed track list reads `551px 551px 0px` because `auto-fit` collapses the third track it has no child for. The image is `<img class="absolute inset-0 h-full w-full object-cover">` inside a `<picture>` using `bug-a-ball-feature-1200x600.{webp,jpg}` with `loading="eager" fetchpriority="high"` and explicit `width`/`height` — it is the declared LCP element of that page (§5.4). `imagePosition` is not shipped: one usage, the same rule that dropped the three badge variants.

Consumer: Apps & Games, SPIELE section.

### 3.6 `bfs-link-card` — `app/ui/link-card/`

One component for the Socials tiles and both Support card families.

```ts
export type LinkCardTone = 'light' | 'dark';
readonly tone = input.required<LinkCardTone>();
readonly href = input.required<string>();
readonly ariaLabel = input.required<string>();
readonly heading = input.required<string>();
readonly ctaLabel = input.required<string>();
readonly handle = input<string | null>(null);   // dark tone only
readonly headingLevel = input<2 | 3>(3);
```

```
a  [href] [attr.aria-label]  focus-ring transition-colors duration-150 ease-in-out
   flex flex-col rounded-xl shadow-md
   light → gap-3   border border-neutral-200 bg-white         p-6 text-neutral-700 hover:border-amber hover:text-neutral-700
   dark  → gap-3.5 border border-neutral-600 bg-neutral-900   p-8 surface-dark      hover:border-amber
├── <ng-content select="[card-chip]" />
├── h2|h3  m-0 font-display leading-none tracking-wide uppercase  translate="no"
│          light → text-2xl text-neutral-900   ·   dark → text-[28px] text-white
├── p.m-0.text-sm.leading-relaxed  (dark adds text-neutral-300) → <ng-content />
├── @if (handle()) span.font-mono.text-xs.leading-[normal].text-neutral-400 → {{ handle() }}
└── span.mt-auto  light → text-sm font-bold text-link
                  dark  → font-display text-base leading-[normal] tracking-wider text-yellow uppercase
    → {{ ctaLabel() }}<span aria-hidden="true" class="ml-1">→</span>
```

- The CTA is a `<span>`, not `bfs-arrow-link` — nested anchors are illegal. It repeats the arrow-link type on purpose; that is the only duplication in the system and it is recorded here.
- The whole card is one anchor with no nested interactive element. The accessible name comes from `aria-label` (`@@support.free.github.aria`, `@@support.free.discord.aria`, `@@support.free.youtube.aria`, `@@support.financial.kofi.aria`, `@@support.financial.patreon.aria`, `@@socials.channels.github.aria`, `@@socials.channels.discord.aria`, `@@socials.channels.youtube.aria`), so the handle and the arrow are never announced.
- Chips are authored at the usage site because their background differs inside one tone: free Support section `<span card-chip class="flex size-11 items-center justify-center rounded-lg bg-yellow"><bfs-brand-icon name="github" [size]="24" class="text-neutral-900" /></span>`; financial section `<span card-chip class="surface-dark flex size-11 items-center justify-center rounded-lg bg-neutral-900"><bfs-brand-icon name="kofi" [size]="22" class="text-yellow" /></span>`; Socials `<bfs-brand-icon card-chip name="github" [size]="32" class="text-yellow" />` with no chip wrapper.
- `hover:text-neutral-700` on the light tone is not decoration — it cancels the global `a:hover { color: #ffa726 }` (shipped in `projects/website/src/styles.css` `@layer base`) that would otherwise turn the whole card orange.

Consumers: Support 5 cards (`light`, `headingLevel` 3) in order GitHub → Discord → YouTube, then Ko-fi → Patreon; Socials 3 tiles (`dark`, `headingLevel` 2) in order GitHub → Discord → YouTube. The two families differ **only** by `tone`.

### 3.7 `bfs-card` — `app/ui/card/`

The design-system card shell, used only by the repository cards.

```ts
readonly eyebrow = input<string | null>(null);   // added in M4 (#25)
readonly title = input.required<string>();
readonly headingLevel = input<2 | 3>(3);         // added in M4 (#25)
readonly hasFooter = input(false);               // added in M4 (#25)
```

```
div.flex.flex-col.overflow-hidden.rounded-xl.border.border-neutral-200.bg-white.shadow-md   (host: contents)
├── div.flex-1.p-6
│   ├── @if (eyebrow()) div.mb-1.5.text-xs.font-bold.tracking-widest.text-orange.uppercase → {{ eyebrow() }}
│   ├── h2|h3  mb-2 font-display text-2xl leading-none tracking-wide text-neutral-900 uppercase  translate="no"
│   └── div.text-sm.leading-relaxed.text-neutral-700 → <ng-content />
└── @if (hasFooter()) div.border-t.border-neutral-200.bg-neutral-100.px-6.py-3.text-xs.text-neutral-600
        → <ng-content select="[card-footer]" />
```

- The footer strip is **12px**, the deliberate fix over the design system's inherited 16px (`docs/design/home.md` §10, item 3).
- A `null` eyebrow emits no element at all — never an empty line.
- No image block: the design system's 144px image slot is used nowhere on this site.
- The card is a non-interactive `<div>`: no link, no hover border.

Consumer: `bfs-repository-card` only.

### 3.8 `bfs-button-primary` — `app/ui/button-primary/`

```ts
readonly href = input<string | null>(null);
readonly route = input<string | null>(null);
readonly ariaLabel = input<string | null>(null);
```

Renders an `<a>` (there is no `<button>` CTA on the site) with `inline-block rounded-lg bg-amber px-5 py-2.5 font-display text-base tracking-wider text-neutral-900 uppercase shadow-accent transition-colors duration-150 ease-in-out hover:bg-orange hover:text-neutral-900 active:translate-y-px focus-ring` and `<ng-content />` for the arrow-free label.

- `hover:text-neutral-900` is load-bearing: it cancels the global `a:hover` so the label stays ink-dark.
- The design's `mt-2` belongs to the usage site (`class="mt-2"` on the element), not to the component.
- `shadow-accent` resolves: `--shadow-accent` is already in the `@theme` block of `projects/website/src/styles.css`.

Consumer: Apps & Games feature-card CTA, `href="https://bugaball.com/"` (SPEC §11.3 — `bug-a-ball.com` serves an invalid certificate), `aria-label` from `@@apps-and-games.games.bug-a-ball.cta-aria`.

### 3.9 `bfs-pill-link` — `app/ui/pill-link/`

```ts
readonly href = input.required<string>();
```

```ts
readonly newTab = input(false);      // renders [attr.target]/[attr.rel] only when set
```

`<a [href] [attr.target] [attr.rel] class="inline-flex items-center gap-2 rounded-full bg-white px-[18px] py-2.5 font-display text-base tracking-wider text-neutral-900 uppercase shadow-md transition-colors duration-150 ease-in-out hover:text-neutral-900 focus-ring"><ng-content /></a>`

- `gap-2` (8px) is the design's prepared slot for an optional icon; the five chips ship without one.
- `hover:text-neutral-900` cancels the global `a:hover` — the pill deliberately does not change colour.
- The pills sit on the yellow→orange gradient band, which is **not** a `surface-dark` surface: the ring stays `#171717` (14.7:1 / 9.2:1 measured, `docs/decisions.md` M2 › Focus system).

Consumers: home support band, five chips in order GitHub, Discord, YouTube, Ko-fi, Patreon.

### 3.10 `bfs-arrow-link` — `app/ui/arrow-link/`

```ts
readonly route = input<string | null>(null);   // internal — never name this input routerLink
readonly href = input<string | null>(null);    // external; exactly one of the two is set
readonly ariaLabel = input<string | null>(null);
readonly variant = input<'body' | 'display'>('body');
readonly newTab = input(false);                // href form only; renders [attr.target]/[attr.rel]
```

Renders `<a [routerLink]>` when `route()` is set, otherwise `<a [href]>`; both carry `[attr.aria-label]`, then `<ng-content /><span aria-hidden="true" class="ml-1">→</span>`.

- `body` → `text-sm font-bold text-link transition-colors duration-150 ease-in-out hover:text-orange focus-ring`
- `display` → `font-display text-lg tracking-wider text-link uppercase transition-colors duration-150 ease-in-out hover:text-orange focus-ring` (18px Bebas, the head-row link)

Consumers: home (`display` `Alle Projekte` → `/apps-and-games`; `display` `Alle Repositories` → `https://github.com/BoundfoxStudios`; `body` one per project card), Apps & Games (`body` ×4 — LehrGrapht gets both `Zur Website` and `Source Code`), 404 (`body` ×4 in a `<ul class="m-0 flex flex-wrap gap-x-6 gap-y-3 list-none p-0">`, `docs/decisions.md` M3 › 404 page › Link markup).

### 3.11 `bfs-brand-icon` — `app/ui/brand-icon/` (built in M2, issue #11)

```ts
export type BrandIconName = 'github' | 'discord' | 'youtube' | 'kofi' | 'patreon';
readonly name = input.required<BrandIconName>();
readonly size = input(24);   // px, onto the SVG width/height
```

`<svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">` with one `<path>` per glyph; Patreon is `<circle cx="15.2" cy="8.8" r="7.3">` + `<rect x="1.2" y="1.5" width="4.2" height="21">`. There is no variant input — `name` selects the glyph.

- The component emits no Tailwind class and no host styling. Colour comes from an inherited `text-*` utility on the consumer through `fill="currentColor"`; `docs/design/socials.md` §7.3's `class="size-8 fill-yellow"` on the host is superseded.
- `aria-hidden="true"` and `focusable="false"` live on the rendered `<svg>`. Consumers must not repeat `aria-hidden` on the host; the accessible name comes from the surrounding link.
- The shape data is copied verbatim from the handoff and carries no `stroke` and explicitly **no `fill-rule="evenodd"`** — verified at 200px, the Discord eyes and the YouTube triangle knock out correctly under the default `nonzero` rule.
- `BrandIconName` is exported from `ui/brand-icon/brand-icon.ts`; `data/social-links.ts` imports it from there and re-uses it as the type of `SocialLink.id`. The union spells Ko-fi as `kofi` (issue #11, `docs/design/support.md` §10); `docs/design/home.md` §6.7's `ko-fi` spelling is retired.

Consumer sizes — `docs/decisions.md` M2 › Brand icon corrects issue #11's "24 elsewhere":

| consumer                                     | size | colour utility on the consumer |
| -------------------------------------------- | ---- | ------------------------------ |
| site footer icon row                         | 20   | `text-white hover:text-yellow` |
| Support financial chip (Ko-fi, Patreon)      | 22   | `text-yellow`                  |
| Support free chip (GitHub, Discord, YouTube) | 24   | `text-neutral-900`             |
| Socials tile chip                            | 32   | `text-yellow`                  |

### 3.12 `bfs-brand-lockup` — `app/ui/brand-lockup/` (built in M3, issue #17)

```ts
readonly markSize = input<32 | 40>(32);
readonly nowrap = input(true);
readonly priority = input(false);
```

```
div.flex.items-center.gap-2.5                                     (host: contents)
├── img  NgOptimizedImage, alt="", class="object-contain"
│        markSize 32 → ngSrc="images/fox-head-64.webp" width="32" height="32"   (2× file in a 1× box)
│        markSize 40 → ngSrc="images/fox-head-80.webp" width="40" height="40"
│        [priority] only when priority() is true
└── span.font-display.text-2xl.leading-none.tracking-wider.uppercase  [class.whitespace-nowrap]="nowrap()"  translate="no"
    ├── span.text-orange → Boundfox
    ├── &ngsp;  (renders as one real space)
    └── span.text-yellow → Studios
```

- The lockup is **never itself a link**: the header wraps it in `<a routerLink="/">`, the footer renders it bare.
- The separating space is authored as `&ngsp;`, recorded here because a literal space is silently wrong: Angular's whitespace removal deletes a whitespace-only text node between two elements, so `Boundfox` and `Studios` would render glued together. `&ngsp;` compiles to U+0020, which keeps the footer's `nowrap = false` able to break the wordmark; `&nbsp;` would freeze it. Verified in the prerendered header markup (issue #17).
- `alt=""` on **both** marks, and the logo link carries no `aria-label`. This is a deliberate deviation from `docs/design/site-header.md` §2.3 (`alt="Boundfox Studios"`): the adjacent wordmark is real text, so a non-empty alt makes the name announce twice. `site-header.logo.alt` and `site-header.logo.link-label` are retired.
- `Boundfox`/`Studios` are unmarked locale-invariant brand words; `uppercase` supplies the rendered caps.
- The full mark contract (relative `ngSrc`, explicit dimensions, `priority` on the header only) is §5.1.

Consumers: header (`markSize` 32, `nowrap` true, `priority` true), footer (`markSize` 40, `nowrap` false, no `priority`).

### 3.13 `bfs-legal-page` — `app/ui/legal-page/` (built in M6, issue #30)

```ts
readonly proseLang = input<string | null>(null);
```

Template, verbatim:

```html
<section class="mx-auto max-w-[760px] px-6 pt-16 pb-18">
  <ng-content select="[legalNotice]" />
  <div [attr.lang]="proseLang()"><ng-content /></div>
</section>
```

- One component only — there is no `LegalSection`. Headings and paragraphs stay literal utility strings in the two page templates: H1 `m-0 font-display text-[clamp(40px,5.5vw,60px)] leading-none font-normal tracking-wide text-neutral-900 uppercase`; H2 `mt-10 mb-3` (first) / `mt-8 mb-3` (rest) at `font-display text-2xl leading-none tracking-wide text-neutral-900`; H3 `mt-6 mb-2 … text-lg`; paragraphs `m-0`, consecutive ones `mt-4`, the first after the H1 `mt-6`; lists `mt-4 list-disc space-y-1 pl-6`.
- The `legalNotice` slot sits **outside** the `lang`-marked wrapper (that is its whole purpose); it is the only slot on the site whose attribute is camelCase, because `docs/decisions.md` M6 fixes that spelling.
- No `max-w-legal` token — the 760px is an arbitrary value per §1.3.

Consumers: imprint, privacy policy.

Typography lives in the two page templates as literal utilities, not in the component — the layout owns the column, the projection and the `lang` wrapper, nothing else. The scale both pages use (settled while building #30, `docs/decisions.md` M6 › Legal layout › _Vertical rhythm of the new elements_):

| element | classes |
| --- | --- |
| `h1` | `m-0 font-display text-[clamp(40px,5.5vw,60px)] leading-none font-normal tracking-wide text-neutral-900` |
| `h2` | `mt-10 mb-3` first, `mt-8 mb-3` after, plus `font-display text-2xl leading-none font-normal tracking-wide text-neutral-900` |
| `h3` | `mt-6 mb-2 font-display text-lg leading-none font-normal tracking-wide text-neutral-900` |
| `p` | `m-0 text-base leading-relaxed`; a **consecutive** paragraph in the same section takes `mt-4` |

- **`font-normal` on every heading is mandatory.** Bebas Neue has no bold cut, so the UA default `bold` would synthesise one. Measured on the shipped imprint: all seven headings compute to weight 400.
- Measured rhythm at 1280px, no collapsed margins: H1 → 40 → H2 → 12 → P → 32 → H2 → 12 → P → 16 → P → 32 → H2 → 24 → H3 → 8 → P.
- The section is a border-box, so `max-w-[760px]` caps its **outer** width and `px-6` sits inside it: 760px wide at 1280 and at 768, full width at 375.
- The `<h1>` and the privacy "Stand" line are the only translated elements inside the wrapper, so each carries its own `[attr.lang]="isGermanLocale ? null : 'en'"`. The notice needs none — the `legalNotice` slot renders it outside the wrapper.

### 3.14 `bfs-repository-card` / `bfs-repository-cards` — `app/ui/repository-card/` (built in M4, issue #25)

```ts
// bfs-repository-card
readonly title = input.required<string>();
readonly description = input.required<string>();
readonly language = input<string | null>(null);
readonly version = input<string | null>(null);
readonly updatedAt = input.required<string>();       // ISO string from github-data.json
private readonly locale = inject(LOCALE_ID);         // compile-time constant, the one C6 exception
```

Composes `bfs-card` with `[eyebrow]="language()"`, `[title]`, `[hasFooter]="true"`, `[headingLevel]="3"`. The eyebrow renders GitHub's single primary `language` verbatim, never composed, never translated. The footer is one message so English can reorder it:

`<span i18n="@@home.github.card.updated">{{ versionLabel() }} · aktualisiert <time [attr.datetime]="updatedAt()" data-lastmod-ignore>{{ relativeLabel() }}</time></span>`

where `versionLabel()` falls back to `$localize` `@@common.badge.in-development` and `relativeLabel()` comes from `new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' })` over whole UTC days, clamped with `Math.min(0, …)`. The `data-lastmod-ignore` attribute is what keeps the sitemap's `lastmod` from churning daily.

`bfs-repository-cards` owns the grid — `grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]` (3 / 2 / 1 columns at content width ≥888px / 584–887px / <584px) — and renders three authored `<bfs-repository-card>` elements in fixed order LehrGrapht → MAT → Flugwacht, never a sorted `@for`. It reads `gitHubData` directly (the one place besides the sitemap generator that does) and maps `lehrgrapht.latestTag?.name`, `mat.latestRelease?.tagName` and `flugwacht.latestRelease?.tagName` with `?? null` — never a `!`.

The three column counts were swept pixel by pixel in chromium against the real build inside `<div class="mx-auto max-w-6xl px-6">`: the transitions land exactly at content 888px (viewport 936) and content 584px (viewport 632), matching `docs/design/home.md` §5.3's 1200 → 3, 800 → 2, 500 → 1.

Consumer: home, section C. Until that page lands (M5, issue #26) nothing imports either component, so their five ids are absent from `messages.xlf` — extraction only walks the reachable app graph.

## 4. Layout components (`projects/website/src/app/layout/`)

### 4.1 `bfs-site-header` — `app/layout/site-header/`

No inputs. `<header class="surface-dark bg-neutral-900 text-white">` › `<div class="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-4 gap-y-2 px-6 py-2">` (64px) with three children:

- `<a routerLink="/" class="focus-ring">` wrapping `<bfs-brand-lockup [priority]="true" />`.
- `<nav class="ml-auto flex flex-wrap items-center gap-1" [attr.aria-label]>` with four links, each `border-b-2 border-transparent px-3 py-2 font-display text-base tracking-wider text-white uppercase transition-colors duration-150 ease-in-out hover:text-yellow focus-ring`, `routerLinkActive="text-yellow border-yellow"`, `[routerLinkActiveOptions]="{ exact: true }"` on `/`, plus `aria-current="page"` when active (from `ariaCurrentWhenActive="page"`, `RouterLinkActive`'s own input — no template reference variable needed). Routes: `/`, `/apps-and-games`, `/support`, `/socials` (no trailing slash, C12).
- `<bfs-language-switcher class="border-l border-neutral-600 pl-4 max-md:hidden" [links]="localeLinks.links()" />` — §4.1.1.
- `<bfs-mobile-menu class="ml-auto md:hidden" />` as the last child — §4.3. It also puts `max-md:hidden` on the nav and on the switcher usage above, so below 768px the band holds the lockup and the burger only. `ml-auto` has to be on the burger: below `md` the nav is `display:none` and no longer pushes anything.

**`min-h-16`, not `min-h-12` (corrected while building #17, recorded in issue #76).** The design's "`min-height: 48px` + 8px + 8px = 64px" (`docs/design/site-header.md` §1/§2.2/§9) is content-box arithmetic. Preflight sets `box-sizing: border-box`, under which the 16px of `py-2` is *inside* the 48px, the tallest flex item is a 42px nav link (24px line box, because Tailwind forces `--text-base--line-height: 1.5`, + 16px padding + 2px border), and `min-h-12` never engages — the band measures 58px. `min-h-16` is the one token that reproduces the 64px every other document states, including the mobile-menu overlay's `top('64px')` (`docs/decisions.md` M3 › Panel geometry and motion). Measured with Playwright over the real build: exactly 64px at 768 / 1152 / 1280 / 1440px, 172px at 320 / 375px where the nav and the switcher wrap.

#### 4.1.1 `bfs-language-switcher` — `app/layout/site-header/language-switcher.ts|.html`

```ts
readonly links = input.required<readonly LocaleLink[]>();
```

Presentational (C6): it injects nothing, and `bfs-site-header` passes `localeLinks.links()` in. Hrefs come from `seo/locale-links.ts` (`LocaleLinks`), never computed in the component.

Root element `<div role="group" aria-label="Sprache wählen" i18n-aria-label="@@site-header.language.aria-label" class="flex items-center gap-2 font-display text-sm tracking-wider">`, then one `@for` over `links()`: the current locale is `<span aria-current="true" translate="no" class="text-yellow">DE</span>` — never a self-link; the other locale is `<a [href] [attr.hreflang] rel="alternate" translate="no" class="text-white hover:text-yellow focus-ring">EN</a>` and never a `routerLink` (separate bundles, full document load); separator `<span aria-hidden="true" class="text-neutral-600">/</span>`, emitted from `$last` so it never trails.

- **A group, not a landmark.** `docs/design/site-header.md` §1 renders the switcher as a `<div>` and `docs/decisions.md` › _Copy_ fixes `footer.language.aria-label` as the `aria-label` of the footer's language `<nav>`. Both are on every page, so a second `<nav>` with the identical name would be an axe `landmark-unique` violation, and SPEC §8 allows exactly one documented axe exception, already spent on the orange kicker (§11.6). `role="group"` keeps the design's element, exposes the name (a bare `<div aria-label>` exposes nothing and trips axe's `aria-prohibited-attr`), and adds no landmark. Verified: the header's accessibility tree is `banner › link "Boundfox Studios" › navigation "Hauptnavigation" › group "Sprache wählen"` — the header's only `<nav>` is the main navigation, so §4.2's footer language `<nav>` stays the one landmark named `Sprache wählen`. An axe-core run over the prerendered pages reports no violation from the header, `aria-prohibited-attr` and `landmark-unique` included.
- `DE` / `EN` are unmarked `translate="no"` literals (C8), rendered as `{{ localeLink.code.toUpperCase() }}`; `site-header.language.de` / `.en` from `docs/design/site-header.md` §4 are retired. Only `site-header.language.aria-label` is marked.
- **The `border-l border-neutral-600 pl-4` divider lives on the usage site, not in the component** (moved while building #18). The mobile panel separates the same switcher with `mt-2 border-t border-neutral-600 pt-2` (`docs/decisions.md` M3 › _Panel geometry and motion_); keeping the left border inside the template would draw it there too. The component owns its own chrome only where both consumers agree.
- The switcher anchor carries no `transition-colors`: the base `a` rule in `styles.css` already transitions `color` at 150ms, and unlike a nav link it has no border colour to carry along.

Consumer: the header. The footer ships its own markup — it needs the `Deutsch`/`English` endonyms (`footer.language.de` / `footer.language.en`), not `DE`/`EN`.

### 4.2 `bfs-site-footer` — `app/layout/site-footer/`

No inputs. `<footer class="surface-dark bg-neutral-900 font-sans text-white">` with

- top grid `mx-auto grid max-w-6xl grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-8 px-6 pt-12 pb-0` (4 / 3 / 2 / 1 columns at ≥1024 / 772–1023 / 520–771 / <520px viewport). Keep `min(220px,100%)` verbatim.
- column 1: `<bfs-brand-lockup [markSize]="40" [nowrap]="false" />` (not a link) + `<p class="m-0 max-w-80 text-sm leading-relaxed text-neutral-300">`.
- columns 2–4: `flex flex-col gap-2.5`; title `<span id="footer-pages-title|footer-legal-title|footer-social-title" class="font-display text-base tracking-wider text-yellow uppercase">`; links inside `<nav aria-labelledby="…">` › `<ul class="m-0 flex list-none flex-col gap-2.5 p-0">`, each `text-sm text-white no-underline transition-colors duration-150 ease-in-out hover:text-yellow focus-ring`. Routes carry no trailing slash (C12): `/`, `/apps-and-games`, `/support`, `/socials`, `/legal-details-imprint`, `/privacy-policy`.
- column 4 icon row `<ul class="m-0 flex list-none gap-3 p-0">` over `SOCIAL_LINKS` (§7), each link `target="_blank" rel="noopener noreferrer" translate="no"` with `title` and `aria-label` both bound to the entry's `name`, `-m-1 inline-flex p-1` to grow the hit box to 28×28 without moving the 12px visual gap, glyph `<bfs-brand-icon [size]="20" />`.
- bottom bar `mx-auto mt-6 flex max-w-6xl flex-wrap justify-between gap-4 border-t border-neutral-600 px-6 py-4` with two children: the copyright `<span class="text-xs text-neutral-400">` and the language `<nav>` below, which carries the same `text-xs text-neutral-400`. The design's second `<span>` became that `<nav>` with the semantic upgrade, so the bar holds one span, not two. The year is interpolated from a `currentYear` signal, never baked into the translation.
- the language pair is the bar's second child, `<nav class="flex items-center gap-2 text-xs text-neutral-400" aria-label="Sprache wählen" i18n-aria-label="@@footer.language.aria-label">` — the one landmark on the site named `Sprache wählen` (§4.1.1). One `@for` over `LocaleLinks.links()`, following the identical switcher rule: the current locale is `<span aria-current="true" class="text-yellow">` and never a self-link, the other locale is `<a [href] [attr.hreflang] rel="alternate" class="text-neutral-400 no-underline transition-colors duration-150 ease-in-out hover:text-yellow focus-ring">`, separator `<span aria-hidden="true">/</span>` from `$last`. Labels are the endonyms `footer.language.de` / `footer.language.en` (`footer.language-list` is retired), selected by a `@switch` on the locale code so the German source text stays in the template; the same id on both branches extracts as one unit. Each prerendered page therefore carries exactly one locale href — `/en/support/` under German, `/support/` under English.

Deviations found while building (#19), all measured against the real build:

- The `<ul>`s carry the 10px rhythm (`flex flex-col gap-2.5`, and `flex gap-3` for the icon row), not just `m-0 list-none p-0`. The column wrapper's `gap-2.5` only spaces the title against the `<nav>` once the semantic upgrade inserts `nav > ul` between wrapper and links.
- `aria-labelledby` is a static attribute, not `[attr.aria-labelledby]` — the three ids are compile-time constants (C13).
- Column titles are authored in natural German case (`Seiten`, `Rechtliches`, `Folge uns`) and uppercased by the `uppercase` utility. Beyond the casing convention this is functional: `tools/generate-fonts.mjs` subsets Bebas Neue to `A–Z ÄÖÜ 0–9` and punctuation, so a lowercase source string would render from the Arial fallback.
- The social anchor needs `inline-flex` next to `p-1 -m-1`; on an inline box the line-box leading makes the padding grow the hit area asymmetrically.
- Measured column packing at the `min(220px,100%)` track: 1 column at 320/375px, 2 at 520/768px, 3 at 772px, 4 at 1024/1152/1440px (252px tracks at the 1152px cap), no horizontal overflow at 320px. Ten focusable elements, each showing the 2px `#ffc107` ring at 2px offset; the current locale is a `<span>` and is deliberately skipped by Tab.

The layout shell itself is not a component: `app.html` is `<div class="flex min-h-screen flex-col"><bfs-site-header /><main class="flex-1"><router-outlet /></main><bfs-site-footer /></div>`.

### 4.3 `bfs-mobile-menu` — `app/layout/mobile-menu/`

No inputs, no outputs: it owns its `isOpen = signal(false)` and is the only stateful, JavaScript-driven widget on the site, hence the only component with a unit test (SPEC §8, §3.4).

Two parts in one template. The toggle is a single `<button type="button" class="px-3 py-2 text-white transition-colors duration-150 ease-in-out hover:text-yellow focus-ring" [attr.aria-expanded]="isOpen()" aria-controls="mobile-menu-panel">` holding an `@if (isOpen())` pair of inline 24×24 SVGs (`stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" aria-hidden="true" focusable="false"`, paths `M18 6 6 18M6 6l12 12` and `M3 6h18M3 12h18M3 18h18`) and, in each branch, a `<span class="sr-only">` carrying `@@site-header.menu.close` / `@@site-header.menu.open`. Two branches, **one** button element: the CDK returns focus to whatever was focused at attach time, so the toggle has to survive the open/close cycle. The labels are visually hidden spans rather than an `aria-label`, because German source belongs in templates (`docs/decisions.md` › _Conventions › i18n_) and no document grants this component an exception.

The panel lives in `<ng-template #panel>` and reaches the DOM only through `overlayRef.attach(new TemplatePortal(...))`, so it is absent from the prerendered HTML. `<nav id="mobile-menu-panel" tabindex="-1" cdkTrapFocus [cdkTrapFocusAutoCapture]="true" [attr.aria-label]>` (`@@site-header.menu.panel-label`) with `surface-dark flex w-screen flex-col gap-1 bg-neutral-900 px-6 py-4 opacity-100 transition-opacity duration-150 ease-in-out motion-reduce:transition-none starting:opacity-0`, the four header routes as stacked full-width links (`px-3 py-2 font-display text-base tracking-wider text-white uppercase transition-colors duration-150 ease-in-out hover:text-yellow focus-ring`, `routerLinkActive="text-yellow"` + `ariaCurrentWhenActive="page"`), then `<div class="mt-2 border-t border-neutral-600 pt-2">` around `bfs-language-switcher`.

- **`surface-dark` on the panel is load-bearing.** The CDK appends its overlay container to `<body>`, so the panel is outside the `<header>` subtree and inherits nothing — without it the focus rings would be `#171717` on `#171717`.
- **`tabindex="-1"` and no `focus-ring`.** The panel is focused programmatically so the open behaviour is assertable in jsdom, where the trap finds nothing tabbable (`offsetWidth` is 0). A `tabindex="-1"` container is not interactive; whether the UA ring shows after a keyboard-initiated open is a browser heuristic and must not be styled away — `outline-none` stays forbidden.
- **The active state drops the header's `border-b-2` underline** (decided while building #18). Under a stacked full-width link a bottom border reads as a divider, not a tab marker; the colour swap carries the state and `aria-current="page"` carries it non-visually.
- **`starting:opacity-0`** supplies the entry fade — `transition-opacity` alone animates nothing on an element inserted at full opacity. There is no exit fade: `detach()` removes the panel synchronously, which is also what returns focus.
- **Overlay config:** `overlay.position().global().top('64px').left('0')`, `width: '100%'` in the `OverlayConfig` rather than the `@deprecated` `GlobalPositionStrategy.width()`, `scrollStrategies.block()`, `hasBackdrop: true`, `backdropClass: 'cdk-overlay-dark-backdrop'`. The block strategy needs `node_modules/@angular/cdk/overlay-prebuilt.css`, which `angular.json` lists **before** `styles.css`.
- **Every close path funnels through one private `close()`** — backdrop click, `keydownEvents()` filtered to `Escape`, `NavigationEnd` **or** `NavigationSkipped`, and a `matchMedia('(min-width: 768px)')` `change` registered inside `afterNextRender` (prerendering must never touch `window`) and torn down through `DestroyRef`. `NavigationSkipped` is in the filter because tapping the link of the current route emits nothing else and would leave the panel covering the page (decided while building #18). Focus return is `CdkTrapFocus.ngOnDestroy` on all of them, never a manual restore call.
- **CDK import discipline:** `@angular/cdk/a11y`, `@angular/cdk/overlay` and `@angular/cdk/portal` only, never the package root, and the standalone `CdkTrapFocus` directive rather than `A11yModule`.
- **Bundle cost:** the overlay adds ~65 kB raw / ~14 kB transfer, taking the initial bundle from 339.17 kB to 403.94 kB. SPEC §3.4 keeps the 500 kB error budget; the soft `maximumWarning` moved 400 kB → 450 kB while building #18 so a permanently-warning build does not become the normal state.

## 5. Assets, marks and performance

### 5.1 Mark usage contract

`tools/generate-images.mjs` (sharp, `npm run images:generate`) writes WebP only — no PNG fallback, no `<picture>`, no `ngSrcset`, no image loader (`docs/decisions.md` M2 › Image pipeline, which corrects issue #10's "WebP with a PNG fallback"). The outputs are committed so `ng build` never depends on sharp.

| file               | box            | used by                        |
| ------------------ | -------------- | ------------------------------ |
| `fox-head-32.webp` | —              | M8 icon set                    |
| `fox-head-40.webp` | —              | M8 icon set                    |
| `fox-head-64.webp` | 32 × 32 header | `bfs-brand-lockup markSize=32` |
| `fox-head-80.webp` | 40 × 40 footer | `bfs-brand-lockup markSize=40` |

The contract the M3 shell must implement:

- `NgOptimizedImage` with `ngSrc`, never a plain `src`.
- `ngSrc` is relative (`images/…`). An absolute path makes `/en/` load the German copy.
- `width` and `height` are always explicit; the file is the 2× size of the box.
- `priority` on the header mark only — it adds `fetchpriority="high"`, `loading="eager"`, `decoding="sync"` and a `<link rel="preload" as="image">` in the prerendered `<head>`. The footer mark stays lazy.
- `alt=""` on both marks, and no `aria-label` on the logo link. Deviation from `docs/design/site-header.md` §2.3 (`alt="Boundfox Studios"`): the wordmark next to the mark is real text, so a non-empty alt announces the name twice.

### 5.2 SVG media sizes

The wordmark and icon SVGs are copied verbatim into `public/images/` and referenced relatively as `<img src>`. Never inlined: `bug-a-ball.svg` carries 58 global `cls-*` class names that collide with any other inlined SVG, and keeping all three consistent keeps that rule simple (C14). Attributes carry the intrinsic ratio, CSS does the sizing.

| asset                           | attributes                     | on `/`                         | on `/apps-and-games/`          |
| ------------------------------- | ------------------------------ | ------------------------------ | ------------------------------ |
| `images/flugwacht-wordmark.svg` | `width="231" height="42"`      | `h-auto w-[56%] max-w-[300px]` | `h-auto w-[62%] max-w-[280px]` |
| `images/mat-dark.svg`           | `width`/`height` = render size | 112 × 112                      | 104 × 104                      |

**Bug-A-Ball key art.** `npm run images:crops` (`tools/generate-bug-a-ball-crops.mjs`, sharp) rasterises `branding/bug-a-ball.svg` at `density: 144` (2050 × 2054), extracts `{ left: 0, top: 342, width: 2050, height: 1024 }` and resizes that one rectangle to both slots. The master is square and both slots are 2:1, so one rectangle serves both. Outputs are committed, so `ng build` never depends on sharp.

| file                                     | slot                                                | loading                                |
| ---------------------------------------- | --------------------------------------------------- | -------------------------------------- |
| `bug-a-ball-feature-1200x600.{webp,jpg}` | `/apps-and-games/` feature column — the LCP element | `loading="eager" fetchpriority="high"` |
| `bug-a-ball-card-840x420.{webp,jpg}`     | `/` project card 4 media area, below the fold       | `loading="lazy"`                       |

Both render through `<picture>` with the WebP `<source>` and the JPEG `<img>` fallback, both use **relative** paths, and both carry `i18n-alt="@@common.bug-a-ball.key-art-alt"` with the German string from `docs/decisions.md` › Copy — one shared id, which retires `home.projects.bug-a-ball.image-alt` and `apps-and-games.games.bug-a-ball.key-art-alt`. English target for M7: _"Bug-A-Ball: a grinning green blob rolls along a blue track past red and white obstacles."_

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

Four things that are load-bearing:

- **`<picture>` needs `block h-full w-full` in the home slot.** Preflight sets `img { display: block }`; a block image inside an inline `<picture>` gets wrapped in an anonymous block box of `height: auto`, so `h-full` on the `<img>` resolves against an auto height, computes to `auto`, and `object-cover` never engages. The feature slot does not need it because the `<img>` is absolutely positioned against the `relative` wrapper.
- `width`/`height` are the **intrinsic** crop dimensions, not the rendered box. That is what keeps CLS at 0 while `object-cover` does the fitting.
- **Never inline the SVG** and never `NgOptimizedImage` here — `NgOptimizedImage` is reserved for the fox head. `@angular-eslint/template/prefer-ngsrc` warns on these two `<img>` elements by design; `npm run lint` has no `--max-warnings`, so it does not fail. Do not "fix" it.
- Never use `profile/bug-a-ball.png` from `BoundfoxStudios/.github`: it has App Store and Google Play badges baked in, which read wrong inside a card and carry their own trademark usage rules.

### 5.3 Branding sources

`projects/website/branding/` is tracked and sits outside `public/` on purpose: `angular.json` copies `{ "glob": "**/*", "input": "projects/website/public" }` and nothing else, so no master ever reaches `dist/`. Generators read from `branding/` and write into `public/images/`. The folder holds exactly four image files plus `fonts/Tahu.ttf`.

| file             | intrinsic      | consumed by                               |
| ---------------- | -------------- | ----------------------------------------- |
| `fox-head.png`   | 600 × 600      | `npm run images:generate`                 |
| `icon.png`       | 600 × 600      | the M8 favicon, app-icon and OG generator |
| `og-logo.png`    | 1042 × 751     | the M8 `og/default.png` composition       |
| `bug-a-ball.svg` | 1025 × 1026.82 | the Bug-A-Ball crop script                |

`icon.png` is a byte-identical copy of `fox-head.png`; the two names exist so the icon generator and the mark generator each own their input. `og-logo.png` is a copy of the handoff `logo-lockup.png`.

**There is no vector fox-head mark.** `branding/icon.svg` does not exist and is not created; `icon.png` is the icon source, and the M8 output ships no `<link rel="icon" type="image/svg+xml">`. `docs/decisions.md` M2 › Image pipeline wins over issue #10's scope bullet, which still names `icon.svg`.

### 5.4 LCP element per page

Recorded so the SPEC §8 gates (Performance ≥ 95, CLS < 0.05) are writable.

| route                     | LCP element                                                    |
| ------------------------- | -------------------------------------------------------------- |
| `/`                       | the `<h1>` text (`Apps & Spiele`)                              |
| `/apps-and-games/`        | the Bug-A-Ball feature image (`bug-a-ball-feature-1200x600.*`) |
| `/support/`               | the `<h1>` text (`Unterstütze uns`)                            |
| `/socials/`               | the `<h1>` text (`Vernetze dich mit uns`)                      |
| `/legal-details-imprint/` | the `<h1>` text (`Impressum`)                                  |
| `/privacy-policy/`        | the `<h1>` text (`Datenschutzerklärung`)                       |

The 32px header mark is never the LCP element on any page. Only the Apps & Games feature image gets `loading="eager" fetchpriority="high"`; the home card crop is below the fold and stays `loading="lazy"`. `/404/` is deliberately absent — no source names its LCP element, and this file does not guess.

## 6. Name reconciliation — every proposal in docs/design/*.md

Every component name and every proposed prop in `docs/design/*.md` resolves to exactly one row.

| proposed name (source)                                                                                                                                                               | resolves to                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageHead` (apps §5.1), `PageHero` (support §9), `PageIntroComponent` (socials §7.1), "section head" (home §6.4), `SectionHeading` (apps §5.2, support §3.1)                         | `bfs-section-head`                                                                                                                                        |
| `PageHead.intro`/`introMaxWidth` (apps §5.1), `PageHero.lead`/`leadMaxWidth`/`scriptAccent` (support §9), `subtitle`/`headingSize`/`marginBottom`/`linkLabel`/`linkHref` (home §6.4) | `bfs-section-head` inputs `lead`, `leadMaxWidth`, `[head-accent]`, `size`, `bottomMargin`, `[head-link]`                                                  |
| `project-card` / `app-project-card` / "Project teaser card" (home §6.3), `ProjectCard` (apps §5.4)                                                                                   | `bfs-project-card` (`density`, `media`)                                                                                                                   |
| `mediaVariant: 'grid-paper' \| 'subtle'` (apps §5.4)                                                                                                                                 | folded into `media` (`pattern` = grid-paper, `contain`/`icon`/`cover` = subtle fills)                                                                     |
| `type` / `status` / `linkLabel` / `linkHref` (home §6.3)                                                                                                                             | not inputs — kicker text, projected `[card-badge]` and projected `[card-links]`                                                                           |
| `FeatureCard` (apps §5.5)                                                                                                                                                            | `bfs-feature-card`                                                                                                                                        |
| `SocialTileComponent` (socials §7.1), `LinkCardComponent` (socials §7.2), `SupportCard` (support §9)                                                                                 | `bfs-link-card` (`tone`)                                                                                                                                  |
| `Badge` (home §6.1, apps §5.3, privacy §6.1, imprint §6.3)                                                                                                                           | `bfs-badge` (`amber`, `outline`)                                                                                                                          |
| `Card` (home §6.2)                                                                                                                                                                   | `bfs-card`                                                                                                                                                |
| `ButtonPrimary` / "Primary button" (apps §5.6, home §6.6)                                                                                                                            | `bfs-button-primary`                                                                                                                                      |
| "Pill chip link" (home §6.5)                                                                                                                                                         | `bfs-pill-link`                                                                                                                                           |
| `TextLink` (apps §5.7)                                                                                                                                                               | `bfs-arrow-link variant="body"`                                                                                                                           |
| the head-row link (home §3.2, §5.2)                                                                                                                                                  | `bfs-arrow-link variant="display"`                                                                                                                        |
| `Kicker` (apps §5.8), `KickerComponent` (socials §7.1)                                                                                                                               | `bfs-kicker` (`block`, `inline`)                                                                                                                          |
| "Social icon set" / `app-icon` (home §6.7), `SocialIcon` / icon registry (footer §8.3), `BrandIconComponent` (socials §7.1, support §9)                                              | `bfs-brand-icon` (`ko-fi` spelling → `kofi`)                                                                                                              |
| `BrandWordmark` (footer §8.2), `Wordmark` / `Logo` / brand lockup (header §7.2)                                                                                                      | `bfs-brand-lockup` (`size` → `markSize`, `nowrap`; `alt` and `link` dropped, §8)                                                                          |
| `SiteHeader` (all pages), `NavLink`, `LanguageSwitcher` (header §7.2)                                                                                                                | `bfs-site-header` (+ its internal `bfs-language-switcher`; no `active` input)                                                                             |
| `SiteFooter` (all pages)                                                                                                                                                             | `bfs-site-footer`                                                                                                                                         |
| `LegalPage` / `legal-prose` (imprint §6.3)                                                                                                                                           | `bfs-legal-page`                                                                                                                                          |
| repo cards on the home page (home §5.3/§5.4)                                                                                                                                         | `bfs-repository-card` + `bfs-repository-cards`                                                                                                            |
| `PageShell` (imprint §6.3)                                                                                                                                                           | not a component — `app.html`                                                                                                                              |
| `CardGridComponent` (socials §7.1)                                                                                                                                                   | not a component — a grid utility string on the page (`minmax` values 220/280/300/320/420 recorded per consumer in §7)                                     |
| `SocialIconLink` (footer §8.4)                                                                                                                                                       | not a component — footer-internal markup over `bfs-brand-icon`; its proposed `tone: 'on-dark' \| 'on-accent'` is dropped with it                          |
| `FooterLinkColumn` (footer §8.5)                                                                                                                                                     | not a component — footer-internal `@for`                                                                                                                  |
| `LegalSection` (imprint §6.3)                                                                                                                                                        | dropped — one component only (`docs/decisions.md` M6)                                                                                                     |
| `badge` slot on `LegalPage` (imprint §6.3, privacy §6.1)                                                                                                                             | dropped — the privacy draft badge is not built (`docs/decisions.md` M6)                                                                                   |
| `active` prop (header §7.1, all page docs)                                                                                                                                           | dropped — `routerLinkActive` + `aria-current="page"`                                                                                                      |
| `alt` / `link` inputs on `BrandWordmark` (footer §8.2)                                                                                                                               | dropped — `alt=""` on both marks, and the lockup is never itself a link                                                                                   |
| `supportVariant`, `showGithub` (home §2)                                                                                                                                             | dropped — the gradient band always renders; the three repository cards always render, because the prebuild fails loudly rather than yielding partial data |
| `Badge` variants `yellow` / `orange` / `dark`                                                                                                                                        | dropped — they occur nowhere in the six pages                                                                                                             |
| `imagePosition` (apps §5.5)                                                                                                                                                          | dropped — one usage                                                                                                                                       |
| `chipTone` (support §9)                                                                                                                                                              | dropped — the chip is authored at the usage site                                                                                                          |

## 7. Not components

Page-level markup, recorded so nobody extracts it into a component later.

- The home gradient band: `<section class="bg-linear-to-r from-yellow to-orange">` › `<div class="mx-auto flex max-w-6xl flex-col items-start gap-5 px-6 py-14">`. Its `<h2>` (`m-0 font-display text-4xl leading-none tracking-wide text-neutral-900 uppercase`) and its paragraph (`m-0 max-w-[560px] text-base leading-relaxed text-neutral-900 text-pretty`) are **page-level markup, not `bfs-section-head`** — the paragraph is a 16px ink-coloured band text, not the 18px inherited-colour lead the component renders. Its trailing one-off link `text-sm font-bold text-neutral-900 underline hover:text-neutral-700` plus arrow span is permanently underlined, ink-dark, and deliberately not a `bfs-arrow-link`.
- All card grids: home projects `minmax(min(420px,100%),1fr)`, apps `minmax(min(300px,100%),1fr)`, feature card `minmax(min(320px,100%),1fr)`, socials `minmax(min(280px,100%),1fr)`, support `minmax(min(300px,100%),1fr)`, repository cards `minmax(min(280px,100%),1fr)`, footer `minmax(min(220px,100%),1fr)` — all `gap-6` except the footer's `gap-8`, all with `min(N,100%)` kept verbatim as the overflow guard.
- The Support financial grid's `max-w-[760px]` cap and its left alignment (no `mx-auto`).
- `projects/website/src/app/data/social-links.ts` (built in M3, issue #19) — not markup at all, listed here because the three social destinations look like component inputs and are not. `interface SocialLink { readonly id: BrandIconName; readonly name: string; readonly handle: string; readonly href: string }` plus `SOCIAL_LINKS` in tile order GitHub → Discord → YouTube (`docs/decisions.md` › _Conventions › Shared data_). The footer icon row reads `id`, `name` and `href`; `handle` exists for the Socials tiles (M5); `href` is the JSON-LD `Organization.sameAs` (M8). The file also exports `socialLink(id)`, which returns the entry or throws during prerendering — the home pills, the home _Alle Repositories_ link and the three free Support cards read their `href` through it, so the organisation URL and the two handles exist in exactly one place (`docs/decisions.md` M5 › Socials › _One source for the three channel URLs_). Ko-fi and Patreon are funding destinations, not social channels, and stay literals at their usage sites. `grep -rl 'discord.gg' projects/website/src` stays at exactly this one file (the plain `grep -r` counts two lines, because `handle` and `href` both carry the domain) — no template ever inlines one of the URLs.
- Section paddings: home A `pt-16 pb-18`, home C `pt-16 pb-18`, apps/socials/support heads `pt-16 pb-2`, apps APPS + support B `pt-12 pb-4`, apps SPIELE + socials grid + support C `pt-12 pb-18`, both legal pages `pt-16 pb-18`.

- `projects/website/src/app/pages/not-found/` (M3, issue #22) — the only page built before M5, because Apache needs something branded to serve. `<section class="mx-auto max-w-6xl px-6 pt-16 pb-18">` (the Socials hero geometry with `pb-18` instead of `pb-2`, since nothing follows it) holding `<bfs-section-head variant="page">` with `kicker="Fehler 404"`, `heading="Seite nicht gefunden"` and the lead, then `<ul class="m-0 mt-8 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">` of four `bfs-arrow-link` items (§3.10). German source is authored in natural case (`Fehler 404`, not `FEHLER 404` as the issue body writes it) and uppercased by the component's `uppercase` — `docs/decisions.md` › _Copy_ wins over the issue body.
- **The 404 markup never echoes the requested path.** `/404/` is prerendered once and hydrated at every missed URL, so any rendering of the URL — including the language switcher's href, which is why `LocaleLinks` falls back to the locale root on a `noIndex` route — would make the client DOM diverge from the server one. Verified in chromium: after a popstate to an arbitrary URL the `<main>` subtree is byte-identical to the prerendered one once `ng-version`/`ngh` are stripped.

## 8. Dropped on purpose

Names and props that exist in the design documents and are deliberately not built. They resolve in §6; the reason is here so nobody re-proposes them.

- `LegalSection` — the legal pages ship one component (`bfs-legal-page`) and literal utility strings.
- The `badge` slot on the legal page, i.e. the privacy draft badge (`docs/decisions.md` M6 › Privacy › Draft badge).
- The `active` prop on the header and on every page document — `routerLinkActive` plus `aria-current="page"` replaces it (C7).
- `alt` and `link` inputs on the brand lockup, together with the retired ids `site-header.logo.alt` and `site-header.logo.link-label`.
- `supportVariant` and `showGithub` on the home page — both bands always render; the prebuild fails loudly rather than yielding partial data.
- Badge variants `yellow`, `orange`, `dark`; `imagePosition` on the feature card; `chipTone` on the support card; `tone: 'on-dark' | 'on-accent'` on the footer icon link — each has zero or one usage across the six pages.
- `CardGridComponent`, `FooterLinkColumn`, `SocialIconLink`, `PageShell` — page- or layout-internal markup, listed in §6 and §7.
- The `ko-fi` id spelling (`docs/design/home.md` §6.7) in favour of `kofi`; the alt ids `home.projects.bug-a-ball.image-alt` and `apps-and-games.games.bug-a-ball.key-art-alt` in favour of `common.bug-a-ball.key-art-alt`; `footer.language-list` in favour of `footer.language.de` / `footer.language.en`.
- `branding/icon.svg` and the SVG favicon link — no vector brand mark exists (§5.3).
- **Partly settled while building #26:** `bfs-arrow-link` and `bfs-pill-link` now carry `newTab = input(false)`, rendering `[attr.target]` / `[attr.rel]` only when it is set. The design documents genuinely contradict each other — `docs/design/home.md` §4.1/§10.8 and `docs/design/site-footer.md` §6 ask for new-tab, `docs/design/imprint.md` §5 and `docs/design/privacy.md` §7 ask for same-tab, `docs/design/socials.md` §10.5 and `docs/design/support.md` §14.2 list it as open — so the input is opt-in per usage rather than a component-wide default, and the home page is the only consumer that sets it (five pills, four card links). The legal pages keep same-tab in M6, as their documents say. `bfs-link-card` and `bfs-button-primary` still ship without the input; adding it is the same one-line change if a page needs it.

## 9. Change rule

Every component added under `projects/website/src/app/ui/` (or `app/layout/`) gets a row here in the same PR; every deviation an implementing PR discovers updates this file in that same PR. `docs/components.md` is the file #14, #17, #19, #25 and #30 are checked against, and the asset material in §5 is the contract the image pipeline (#10, #15) and the M3 shell share.

`/docs` is in `.prettierignore`, so Prettier never reformats this file: tables are aligned by hand, GFM only.
