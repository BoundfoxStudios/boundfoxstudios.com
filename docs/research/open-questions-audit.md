# Completeness critique — what still blocks writing precise issues

Verified against the live site, the repo, the GitHub org, the asset files, and a real Tailwind v4 compile. Items are ordered by how much downstream work they block.

---

## P0 — Decide these first; several issues cannot be written until they are settled

### 1. The route/slug scheme contradicts the live site, and Angular i18n forces one answer

**Missing:** The design handoff specifies German slugs (`/apps-und-spiele`, `/unterstuetzen`, `/impressum`, `/datenschutz`). The technical research's verified lab used English slugs (`/apps-and-games`, `/support`, `/legal-details-imprint`, `/privacy-policy`). **The live site already uses the English slugs in both locales** — I confirmed HTTP 200 on `/support/`, `/socials/`, `/games/`, `/legal-details-imprint/`, `/privacy-policy/`, and on `/en/`, `/en/support/`, `/en/games/`. So `de at / + en at /en/` is not a new design — it is the current, indexed production structure.

**Why it matters:** Angular's localize build makes the router URL _identical in both locales_ (that is exactly why the switcher is `subPath + routerUrl` with no mapping table). German slugs would mean `/apps-und-spiele` **and** `/en/apps-und-spiele` — German URLs on the English site — or a per-locale route table that breaks the verified switcher, the sitemap generator and the hreflang logic all at once. It also throws away every existing backlink.

**Proposed resolution:** Adopt the live site's existing English slugs verbatim, in both locales, and override the handoff:

| new route                 | old URL     | action            |
| ------------------------- | ----------- | ----------------- |
| `/` , `/en/`              | same        | keep, 0 redirects |
| `/apps-and-games/`        | `/games/`   | 301               |
| `/support/`               | `/support/` | keep              |
| `/socials/`               | `/socials/` | keep              |
| `/legal-details-imprint/` | same        | keep              |
| `/privacy-policy/`        | same        | keep              |

Five of six pages keep their URLs. Add a companion rule to the spec: **all canonical URLs, hreflang hrefs, sitemap `<loc>`s and the language-switcher `href` carry a trailing slash**, because Apache `DirectorySlash` 301s `/support` → `/support/`; the switcher code in the research emits `/en/support` without one and would add a redirect hop to every language switch.

### 2. There is no URL migration / redirect map — the old site is a live WordPress with indexed content

**Missing:** Nobody has owned SEO continuity. The old site is live WordPress behind Cloudflare (`cf-edge-cache: platform=wordpress`, Yoast sitemaps). Its full public URL inventory, from `sitemap_index.xml`:

- Pages: `/`, `/shops/`, `/spreadshop/`, `/2d-space-shooter-course/`, `/blender-course/`, `/blender-shading-kurs/`, `/spiele-programmieren-mit-unity-kurs-gratis/`, `/courses/`, `/games/`, `/socials/`
- Posts: `/founding-boundfox-studios-coaching/`, `/founding-boundfox-studios-we-are-founded/`, `/founding-boundfox-studios-preparing-business-registration/`
- Taxonomies: `/category/company/` + 6 `/tag/*` pages
- Plus `/support/`, `/legal-details-imprint/`, `/privacy-policy/`, `/press/index.php`, `/feed/`, `/comments/feed/`, the author sitemap, and every `/en/…` mirror of the above (≈50 URLs total).

**Why it matters:** The new site has six routes. Everything else 404s on cutover — including the free German Unity course page, which is the most link-worthy asset on the domain. Redirects cannot be written _after_ the WordPress `.htaccess` is gone, because the URL list will no longer be discoverable.

**Proposed resolution:** One issue, "Legacy URL redirect map", producing a checked-in `deploy/redirects.htaccess` generated from a committed CSV. Rules: courses/shop/blog/taxonomy → `301` to the closest new page (`/courses/` and all course pages → `/apps-and-games/`; `/shops/`, `/spreadshop/` → `/support/`; posts + `/category/*` + `/tag/*` → `/`); `/games/` → `/apps-and-games/`; feeds and `/wp-json/`, `/wp-content/`, `/wp-includes/` → `410 Gone` (not 301 — they are not content); Yoast sitemap paths → `301` to `/sitemap.xml`. Mirror each rule under `/en/`. Snapshot the current sitemaps into the repo now, before cutover.

### 3. No cutover plan for the very first deploy — the target docroot currently serves WordPress

**Missing:** Every deploy discussion assumes an empty Apache docroot. It is not empty. Also `x-powered-by: PleskLin` on the sibling domain shows the hosting is **Plesk on Linux**, where the docroot is `/httpdocs`, not `/` — the research's `server-dir: /` is probably wrong, and `/press/index.php` is a non-WordPress legacy directory sitting in that same docroot.

**Why it matters:** Uploading static files into a live WordPress root produces a broken hybrid: WordPress's front-controller `.htaccess` rewrites everything to `index.php`, and `dangerous-clean-slate` would delete `/press/` and the site's backups. FTP-Deploy-Action also has no sync state on first run.

**Proposed resolution:** A "Production cutover" issue with an explicit runbook: (a) take a full Plesk backup of docroot + DB; (b) deploy first to a staging vhost (`beta.boundfoxstudios.com`, Cloudflare DNS-only, `noindex` via a staging-only `.htaccess`) and verify; (c) confirm the real docroot path and set `server-dir` to it; (d) on cutover, remove `wp-*`, `xmlrpc.php` and the WordPress `.htaccess`, **preserve `/press/`** and any `/wp-content/uploads/` files still hot-linked externally (or redirect them); (e) upload assets before HTML; (f) purge Cloudflare; (g) verify with `curl -I` on ten old URLs and both locales' 404s; (h) document rollback = restore the Plesk backup. Keep a `.ftp-deploy-sync-state.json` note: it is created on first successful run, so a partial first upload must be repaired by deleting it.

### 4. Cloudflare sits in front of the origin and nobody accounted for it

**Missing:** The `.htaccess`, caching, HSTS and HTTPS-redirect design all assume Apache talks to the browser directly. `www.boundfoxstudios.com` currently returns **HTTP 526** (Cloudflare cannot validate the origin certificate) while the apex returns 200 — so the `www` hostname is broken today, and the tooling research's deploy workflow points its environment URL at `https://www.boundfoxstudios.com`.

**Why it matters:** Four concrete failures: (a) `RewriteCond %{HTTPS} !=on` is the documented infinite-redirect loop if Cloudflare SSL mode is Flexible; (b) `Cache-Control: no-cache` on HTML does not stop Cloudflare's edge cache — a deploy can be invisible for hours; (c) HSTS/`preload` set at both layers is a footgun; (d) canonical/hreflang/sitemap must agree with whichever hostname actually works.

**Proposed resolution:** One "Cloudflare & TLS" issue: set SSL mode to Full (strict) and install a valid origin cert covering apex **and** `www`; canonicalize on the **apex** `https://boundfoxstudios.com` (matches the live indexed URLs) and 301 `www` → apex _at Cloudflare_, not in `.htaccess`; replace the `%{HTTPS}` condition with `%{HTTP:X-Forwarded-Proto}` or drop it and enforce "Always Use HTTPS" at Cloudflare; set HSTS at Cloudflare only, without `preload` initially; add a Cloudflare cache-purge step to `deploy.yml` (`CF_ZONE_ID` + scoped API token as environment secrets, purge by prefix, run after upload); fix the deploy workflow's `environment.url` to the apex.

### 5. The Tahu script font is almost certainly not licensed for this use

**Missing:** No one checked. The font's name table reads: `Copyright (c) 2018 by Khurasan. All rights reserved.` / `Tahu! is a trademark of Khurasan.` / vendor URL `www.mbkaos.com`. Khurasan releases are typically free for **personal use only**; there is no embedded open licence. Boundfox Studios is a registered business (USt-IdNr. is in the Impressum) and the site is commercial use, plus webfont embedding is a separate grant.

**Why it matters:** It is a legal exposure on a page that also carries the Impressum, and it is used for exactly one word ("Danke!" on `/support/`). Cheapest thing in the project to get wrong.

**Proposed resolution:** Default to replacing it with an SIL-OFL brush script (Caveat or Grape Nuts from Google Fonts, self-hosted like the others) and re-checking the visual at 44px `#ffa726`. If Manu wants the exact face, buy a Khurasan commercial + webfont licence and commit the licence PDF to `docs/licenses/`. Do **not** "solve" it by converting the word to an outlined SVG — that is still a derivative of an unlicensed font. Also note the design system ships `Tahu.ttf` inside `_ds/…/assets/fonts/`; if the handoff folder is ever committed and the repo goes public, the font file is redistributed too (see item 16).

### 6. Bug-A-Ball is treated as a blocker in three analyses — it is not, but the real problem is different

**Missing / wrong:** The handoff README says `assets/bug-a-ball.svg` is "defekt (Styles beim Export verloren)" and three page analyses repeat it as a missing asset. **It is not broken** — I rendered it with `rsvg-convert` and it comes out perfectly: full gradients, 1025×1026, `<defs><style>` intact. Separately, the org's public `.github` repo already contains a wide key art at `profile/bug-a-ball.png` (830×390, ~2.1:1).

The actual problems nobody named: (a) the media slots need **wide** crops (200px-tall card, 240px-min feature column with `object-fit: cover`) and the SVG is square — art direction/cropping is required, not asset sourcing; (b) the org PNG has App Store / Google Play badges baked in, which look wrong inside a card and carry their own trademark usage rules; (c) the SVG's `cls-1…cls-58` class names are global — inlining it into the page would collide with any other inlined SVG.

**Why it matters:** An issue that says "source the missing key art" sends someone hunting for a file that already exists twice, and skips the decision that actually needs making.

**Proposed resolution:** Retitle the issue "Bug-A-Ball key art crops". Use `assets/bug-a-ball.svg` as the master, export two raster crops with sharp (1200×600 for the feature column, 840×420 for the card), ship WebP + a JPEG fallback, reference them as `<img>` (never inline), and author German and English alt text. Do not use the badge version.

### 7. `bug-a-ball.com` has an invalid TLS certificate — a primary CTA points at it

**Missing:** `https://bug-a-ball.com` fails to connect: the certificate subject is `Plesk` (the Plesk default self-signed cert), so every browser shows a full-page interstitial. Over plain HTTP it 301s to `https://bugaball.com/` — the un-hyphenated domain, which works fine (200, valid cert, `<title>Bug-A-Ball - Free Mobile Game ⚡</title>`).

**Why it matters:** "Zur Website →" on the Startseite card and the amber primary CTA on `/apps-and-games/` — the single most prominent button on the site — currently land on a browser security warning.

**Proposed resolution:** Change every occurrence of `https://bug-a-ball.com` in the copy/link inventory to `https://bugaball.com/`, and file a separate ops task to issue a Let's Encrypt cert for `bug-a-ball.com` in Plesk so the vanity domain keeps working. Add the same link check to CI (see item 24).

### 8. English copy does not exist for a single page

**Missing:** The page inventory counts ~130 page-owned strings plus ~24 shell strings, all German. There is no English source anywhere, no owner, no glossary, and no decision on the legal pages.

**Why it matters:** `i18nMissingTranslation: "error"` is the recommended (correct) setting — which means **the build cannot succeed for the `en` locale until every string is translated.** That makes translation a hard dependency of the very first green build, not a follow-up. It is currently on no milestone.

**Proposed resolution:** One milestone, "English locale", with one issue per page (they can be parallelised) plus a shared-shell issue, each with acceptance criterion "`ng build` passes with `i18nMissingTranslation: error`". A tone/glossary note up front: German is du-form and warm; English should be second-person, contraction-friendly, never salesy; keep product names, "Bebas"-cased headings and the `→` glyph out of the strings. For the two legal pages, do **not** commission translations: serve the German text under `/en/legal-details-imprint/` and `/en/privacy-policy/` with a one-line English notice ("This page is legally binding in German only."). That is common practice, avoids paying for legal review twice, and unblocks the build immediately.

---

## P1 — each of these is a real issue nobody has written

### 9. There is no focus-visible system, and no single ring colour can work

**Missing:** Every page analysis independently says "no focus state is designed; token `--focus-ring: #ffc107` exists." None resolved it, because it cannot be resolved with one colour: the site has four surface families — white, `#f5f5f5`, `#171717` tiles, and the yellow→orange gradient band. Amber `#ffc107` on the gradient band is roughly 1.1:1 — invisible exactly where five clickable pills live.

**Why it matters:** Every hover state on this site is colour-only, so keyboard users get _nothing_ without a ring. It affects ~30 interactive elements across all six pages, so it must be decided once, before any component is built.

**Proposed resolution:** A surface-scoped custom property, set once and inherited: `:root { --focus-ring: #171717 }` (dark ring, ≥4.5:1 on white, `#f5f5f5` and the gradient), overridden to `#ffc107` on `.surface-dark` (header, footer, socials tiles, dark support chips). One utility applied everywhere: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`, plus `outline-none` never used. Add `:focus-visible` screenshots of one element per surface to the issue's acceptance criteria.

### 10. Mobile navigation: propose _not_ building a burger

**Missing:** Six analyses say "a burger menu must be designed and added" and none specify breakpoint, panel layout, animation, focus trap, ESC handling, scroll lock, `aria-expanded`/`aria-controls`, close-on-navigate, or `prefers-reduced-motion`. That is a design task disguised as an implementation task.

**Why it matters:** It is the only stateful, JS-driven, focus-managing widget on an otherwise fully static site. It brings the site's only realistic a11y regression risk and its only real unit-testable logic — for four nav links.

**Proposed resolution:** **Ship no burger.** Four items (`STARTSEITE` ~90px, `APPS & SPIELE` ~110px, `UNTERSTÜTZEN` ~115px, `SOCIALS` ~70px) wrap to two rows at 375px inside a 327px content box; the header grows from 64px to ~136px and stays fully keyboard- and screen-reader-accessible with zero JavaScript, exactly as the design does it. Add only: `gap-y-2` on the header container so the wrapped rows breathe, and centre the nav when it wraps. Write the issue as "Verify and polish wrapped header at 320/375/414/768px", with a screenshot checklist. If Manu rejects this, the fallback issue must specify all nine behaviours above — but it should be a conscious upgrade, not an assumed default. (The header is not sticky, so nothing forces an overlay.)

### 11. Font pipeline is named but not specified

**Missing:** "Self-host Bebas Neue + Barlow" is stated across analyses; the actual pipeline is not. Undecided: which weights, format, subsetting, `font-display`, preload, and fallback metrics.

**Why it matters:** Bebas Neue is a tall condensed display face used at `clamp(40px,5.5vw,60px)` for every H1. Swapping from a system fallback at that size is a violent layout shift — this is the site's whole CLS budget. And the DS `fonts.css` still `@import`s Google Fonts, which contradicts the site's own "kein Tracking, keine Cookies" claim on the very page that asserts it.

**Proposed resolution:** One "Self-hosted fonts" issue: ship `Bebas Neue 400` and `Barlow 400/700` only (verified sufficient across all six pages; drop Barlow 500/600/italic unless a page needs them), as `woff2`, Latin-subset (Bebas additionally subset to uppercase + digits + `&§©–—→`), served from `public/fonts/` with `font-display: swap`; `<link rel="preload">` only Bebas 400 and Barlow 400; define `@font-face` fallbacks with `size-adjust`/`ascent-override`/`descent-override` measured against `Arial`/`Helvetica` so the swap does not reflow; delete the Google Fonts `@import` and add a CI grep asserting no `fonts.googleapis.com` string survives in `dist/`. Convert Tahu's replacement (item 5) the same way.

### 12. Image pipeline is unspecified

**Missing:** `fox-head.png` is a 600×600 PNG rendered at 32px (header, every page) and 40px (footer, every page). No decision on format, `srcset`, `NgOptimizedImage`, or LCP element.

**Why it matters:** 13 kB of PNG downscaled 19× on every page load, no explicit dimensions in some slots, and no named LCP element means no performance target can be written.

**Proposed resolution:** One "Image pipeline" issue: generate `fox-head` at 32/40/64/80 px WebP + PNG fallback via the same `sharp` script already proposed for icons; use `NgOptimizedImage` (`ngSrc` + explicit `width`/`height` + `priority` on the header mark) — it works fine with static output and gives the preload for free; ship the two Bug-A-Ball crops as WebP+JPEG; keep `mat-dark.svg` and `flugwacht-wordmark.svg` as `<img src>` (not inlined — same class-collision reason as item 6); inline only the five brand glyphs (github/discord/youtube/kofi/patreon) through one `BrandIcon` with `fill="currentColor"`. Declare the LCP element per page (H1 text on five pages; the Bug-A-Ball feature image on `/apps-and-games/`).

### 13. The orange kicker fails contrast on every page and no one has decided

**Missing:** `#ffa726` on white measures ~1.9–2.0:1 at 12px bold. Three analyses flag it, all defer to "a client decision". That decision is Manu's and it is a one-liner — but it must exist before six pages are built, because it changes a token.

**Why it matters:** The kicker appears on all six pages, often as the first text in the document, and it is the site's only systemic WCAG AA failure on light surfaces.

**Proposed resolution:** Keep the brand orange for large/decorative use, and introduce **one new token for small text on light surfaces**: `--color-kicker: #a16207` (the existing link yellow-700, ~4.6:1 on white, already part of the palette so no new brand colour is invented). Apply it to the 12px kickers only; leave `#ffa726` for the gradient, hovers, and the wordmark. If Manu insists on `#ffa726`, the alternative is to bump kickers to 14px/700 — still failing AA but documented — and record it as a known deviation in `docs/accessibility.md`.

### 14. No canonical component inventory — the eight analyses propose overlapping, conflicting components

**Missing:** Across the page docs the same thing appears as `project-card` / `app-card` / `feature-card`; `link-card` / `support-card` / `social-tile`; `badge` with five variants but a height-parity bug between `outline` and `amber`; `brand-icon` / `social-icon` / `icon`; `section-head` / `page-head` / `section-heading` / `page-hero` / `page-intro`. Nobody has reconciled them, and the Startseite and Apps pages use _different sizes of the same card_ (minmax 300 vs 420, media 180 vs 200, wordmark 38 vs 44).

**Why it matters:** If page issues are written before this, two people build the same card twice with different APIs, and the "shared" components diverge irreversibly.

**Proposed resolution:** One "Component inventory & API" issue that lands **before** any page issue, producing `docs/components.md` with a single agreed list and signatures. Proposed reconciliation: `SectionHead` (variant `page` | `section`), `ProjectCard` (`density: 'compact' | 'roomy'`, `media: 'pattern' | 'contain' | 'icon' | 'cover'`), `FeatureCard`, `LinkCard` (`tone: 'light' | 'dark'`) covering both the Socials tiles and the Unterstützen cards, `Badge` (fix parity with `ring-1 ring-inset`, not `border`), `BrandIcon`, `ButtonPrimary`, `PillLink`, `ArrowLink`, `Kicker`, plus `SiteHeader`/`SiteFooter`/`LegalPage`. Explicitly: drop the prototype's `active` prop in favour of `routerLinkActive`, and drop the `supportVariant`/`showGithub` toggles.

### 15. No testing strategy, and the scaffold spec will fail on the first commit

**Missing:** `projects/website/src/app/app.spec.ts` asserts `'Hello, website'` against the Angular placeholder template. The moment `app.html` is replaced, `npm test` is red — and the CI design makes `Test` a required check.

**Why it matters:** A required check that is red from day one gets disabled, and then nothing is checked.

**Proposed resolution:** Delete `app.spec.ts` in the first cleanup commit. Per the project conventions ("never test the framework"), write **no** component unit tests for this site. Instead, one "Build output assertions" issue producing `tools/verify-dist.mjs`, run in CI after `npm run build`, asserting: both locales prerendered (`dist/website/browser/index.html` and `en/index.html` exist and contain real content, not a CSR shell); every `index.html` has exactly one `<link rel="canonical">` and `LOCALES.length + 1` hreflang links; `sitemap.xml` URL count equals expected; no `process.env` and no `fonts.googleapis.com` in `dist/**/*.js`/`*.css`; `.htaccess` and `en/.htaccess` present. Optionally a Playwright + axe smoke run over the built directory for the two locales' home pages.

### 16. Repo hygiene for going public — and the repo is not public yet

**Missing:** `gh repo view` reports `"visibility": "PRIVATE"` with an empty `defaultBranchRef` — nothing has been pushed. There is no LICENSE, no CODEOWNERS, no SECURITY.md, no issue templates, no CONTRIBUTING; the README is the untouched Angular CLI scaffold; `.nvmrc` is **untracked** (the CI composite action reads it and would fail); the `design_handoff_website_redesign/` folder is untracked _and_ not gitignored, so `git add -A` would publish the DS bundle, the 130 kB prototype runtime, and the unlicensed `Tahu.ttf` to a public repo.

Also relevant: the org already has a public `.github` repo, but it contains **only** `profile/README.md` — no org-wide community health files. So nothing is inherited today.

**Why it matters:** Publishing the repo is what makes the FTP-credential threat model real, and doing it after 40 commits means rewriting history to remove the font.

**Proposed resolution:** One "Public repo readiness" issue, done **before** the first push: add `MIT` LICENSE (code) with a note that brand assets, logos and key art are _not_ MIT; rewrite `README.md` (what the site is, how to run it, how the deploy works, where the design handoff lives); `CODEOWNERS` = `* @ManuelRauber`; `.gitignore` += `/design_handoff_website_redesign/`, `.DS_Store` already present; `git add .nvmrc`. Put `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `.github/ISSUE_TEMPLATE/` in the **org `.github` repo** instead of here, so `mat`, `flugwacht`, `lehrgrapht` and `homebrew-tap` inherit them too. Enable secret scanning + push protection, Dependabot (npm + github-actions), and private vulnerability reporting at the same time — before any FTP secret exists.

### 17. Nobody defined the milestone/label/DoD structure the issues will live in

**Missing:** The repo has default labels only and **zero milestones**. The work has at least eight natural streams (foundation, shell, pages, i18n, SEO, deploy, migration, hygiene) with hard ordering (foundation → shell → pages; i18n blocks the first green build; migration blocks cutover).

**Proposed resolution:** Create milestones `M1 Foundation` (Tailwind theme, tooling, static build switch, fonts, icons), `M2 Shell` (header/footer/legal layout/focus system/component inventory), `M3 Pages`, `M4 i18n & English copy`, `M5 SEO & metadata`, `M6 Deploy & migration`, `M7 Launch`. Add labels `area:design-fidelity`, `area:a11y`, `area:seo`, `area:i18n`, `area:build`, `area:infra`, `blocked`, `needs-decision`. Definition of Done for a page issue: matches the design values in its `design-*.md` reference, passes `npm run lint` + `format:check` + `verify-dist`, has `:focus-visible` on every interactive element, has German strings marked with stable `@@ids`, and renders correctly at 320/768/1152/1440px.

---

## P2 — real, smaller, still unassigned

### 18. Local development experience

**Missing:** No `.vscode/extensions.json` or `settings.json` (git status shows they were _deleted_), no way to preview the built static output, and Tailwind v4 IntelliSense needs explicit configuration.
**Resolution:** Commit `.vscode/extensions.json` (Angular Language Service, Tailwind CSS IntelliSense, Prettier, EditorConfig) and `.vscode/settings.json` with `"tailwindCSS.experimental.configFile": "projects/website/src/styles.css"` (v4 has no `tailwind.config.js`) and `"files.associations": {"*.css": "tailwindcss"}`. Add scripts: `"start:en": "ng serve --configuration=en"`, `"preview": "npm run build && npx http-server dist/website/browser -p 4300 -c-1"` — the latter is the _only_ way to see both locales and the real `/en/` prefix, since the dev server serves a single locale flat at `/`. Document that in the README so nobody debugs the switcher against `ng serve`.

### 19. Build-only gotchas — one verified correction and one silent failure mode

**Verified by compiling the README's `@theme` block with the installed Tailwind v4:** the `--color-*: initial` wipe is **safe**. `border-transparent` emits a literal `transparent`, `shadow-md` uses literal rgb, `ring-*` falls back to `currentcolor`, `pb-18` resolves via `--spacing`, `tracking-wider` is exactly `0.05em`. No `--color-transparent` entry is needed. Two things that _do_ bite:

- Tailwind v4 Preflight emits `border: 0 solid` — there is **no** default grey border colour. Any `border`/`border-b-2` without an explicit colour utility inherits `currentColor` (i.e. the text colour), so every card border needs `border-neutral-200` spelled out. Put this in the component inventory as a convention.
- Because the palette is wiped, a typo'd or stock class (`text-gray-500`, `bg-neutral-800`) produces **no CSS and no error** — Tailwind silently drops unknown utilities. This is the failure mode stylelint structurally cannot catch (correctly ruled out).
  **Resolution:** Add `eslint-plugin-better-tailwindcss` with `no-unregistered-classes` enabled for `*.html`, pointed at `styles.css`. It is the only thing that turns a silently-dropped class into a build failure.

### 20. GitHub card data — edge cases and a language mismatch

**Missing:** (a) The card body text comes from the repo `description` field, which is **English** on GitHub (`"Preview a Markdown file in your browser…"`, `"A deliberately minimal flight tracker…"`) — so the German page would show English prose in a German paragraph. (b) `Intl.RelativeTimeFormat` is evaluated at _build_ time, so "aktualisiert vor 3 Tagen" drifts until the next build. (c) No behaviour defined for archived/renamed/transferred repos, or for the section when a repo has zero releases _and_ zero tags. (d) The committed `github-data.json` goes stale for local dev.
**Resolution:** Do not render the API `description`; author two translated descriptions per repo as i18n strings and use the API only for volatile fields (version, pushed date, language). Render the date as `<time [attr.datetime]="iso">` with a day-granular relative label; the nightly rebuild caps drift at 24h — state that explicitly in the issue. Make the prebuild script fail loudly on a renamed/404'd repo (it already does for non-2xx), and render "noch kein Release" rather than hiding a card. Note in the README that `github-data.json` in the repo is a dev snapshot, refreshed by CI on every deploy.

### 21. The privacy text must be reconciled with the actual infrastructure

**Missing:** The Datenschutz draft says "keine Cookies, kein Tracking" and has a §3 "Hosting & Server-Logfiles". Post-migration the truth is: Plesk/Apache origin + **Cloudflare as a reverse proxy and processor** (which sets `__cf_bm`/`cf_clearance` under some configurations and processes IPs in the US), self-hosted fonts (good — say so), and no analytics. The badge on the page already says it needs legal review.
**Resolution:** Fold this into the legal-review issue rather than treating the page as pure implementation: name the hosting provider and Cloudflare in §3, confirm an AV-Vertrag / DPA with both, add the standard Cloudflare SCC sentence, and explicitly state that fonts are self-hosted and no third party receives visitor IPs on page load. Keep "Stand: <Monat Jahr>" as a build-time-injected value from a single committed date constant, not a hand-edited string in two languages.

### 22. No 404/error page content, and one legacy path must survive

**Missing:** The SEO research designs the 404 mechanism (route `404` + `**` → same component, `ErrorDocument` per locale) but the _page itself_ has no design, no copy, no links, and no German/English text. Also `/press/index.php` is live and outside the new site's route space.
**Resolution:** One small issue: 404 page reusing the `PageHead` pattern (kicker "FEHLER 404", H1 "SEITE NICHT GEFUNDEN", one lead paragraph, four links to the main routes), `noIndex: true`, prerendered in both locales, and a `curl -I` acceptance check that a miss under `/` and under `/en/` returns HTTP 404 with the right language. Add an explicit `.htaccess` exception preserving `/press/`, or a 301 to a new destination if it is dead.

### 23. Success/measurement is undefined, and "no tracking" constrains the answer

**Missing:** No analytics decision. The site promises no cookies and no tracking, so the usual answer is off the table — but "we cannot measure anything" should be a deliberate choice, not an omission.
**Resolution:** Verify the domain in **Google Search Console and Bing Webmaster Tools via DNS TXT** (survives every redeploy, covers `/en/`) and rely on **Cloudflare Web Analytics** — cookieless, no client-side identifier, and defensible against the privacy claim (it still needs a one-line mention in §3). Submit `https://boundfoxstudios.com/sitemap.xml` once in each. No client-side script beyond Cloudflare's beacon; if even that is unwanted, Cloudflare's server-side zone analytics is enough for a six-page site.

### 24. No performance or link-health gate

**Missing:** Bundle budgets exist (500 kB/1 MB) but there is no Core Web Vitals target and no check that the 20+ external links in the copy still resolve — item 7 shows exactly why that matters.
**Resolution:** Add to `ci.yml`: a Lighthouse CI run against the built static output (`dist/website/browser`) for `/` and `/en/`, asserting Performance ≥ 95, Accessibility = 100, Best Practices ≥ 95, SEO = 100, CLS < 0.05 — realistic for a prerendered static site and it will catch the font-swap regression from item 11. Plus a weekly (not per-PR) `lychee`/`linkinator` job over the built HTML so a dead partner link surfaces without blocking merges.

---

**One thing I would explicitly flag to Manu as a decision, not an issue:** items 1, 5, 9, 10 and 13 are all "the analyses correctly identified a gap and then deferred to you". Each has a defensible default proposed above. If those five are answered in one sitting, everything else is writable as ordinary implementation issues.
