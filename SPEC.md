# Spec: boundfoxstudios.com

Redesign of boundfoxstudios.com as a fully static, prerendered, bilingual Angular site,
built and deployed by GitHub Actions.

> Status: approved. Every decision is settled — §12 holds the twelve that shape the
> architecture, [`docs/decisions.md`](docs/decisions.md) holds the rest down to string ids and
> filenames. The milestones in §13 are the issue backlog. Nothing is left for an implementer
> to invent; what remains is delivery, not decision.

---

## 1. Objective

Replace the current WordPress site with a six-page static site that loads fast, ships no
tracking and no cookies, and can be rebuilt from source at any time. The site is the public
face of Boundfox Studios: it shows what we build, where to find us, and how to support us.

Audience: people who found one of our apps or games (LehrGrapht, MAT, Flugwacht, Bug-A-Ball),
plus anyone landing from GitHub, Discord or YouTube.

Success looks like:

- Six pages in German and English, prerendered to plain HTML, served straight off Apache.
- No runtime dependency on anything: no Node process, no API calls from the browser, no
  third-party font or script requests.
- Release information for our repositories is baked in at build time and refreshed nightly.
- Every push to `main` deploys automatically; a broken build never reaches the server.
- The five existing indexed URLs keep working; everything else on the old site redirects.

### Non-goals

- No blog, no CMS, no comment system.
- No analytics of any kind (see §12, D11).
- No client-side interactivity beyond navigation and the mobile menu.

---

## 2. Tech Stack

| Concern      | Choice                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| Framework    | Angular 22.1 (standalone, signals, zoneless, OnPush)                                                          |
| Language     | TypeScript 6.0, `strict` (TS 6 default), `strictTemplates` (Angular default)                                  |
| Styling      | Tailwind CSS v4 via `@tailwindcss/postcss`, tokens in `@theme`                                                |
| Build        | `@angular/build:application`, `outputMode: "static"`                                                          |
| i18n         | `@angular/localize` (`$localize`), XLIFF 2.0, compile-time inlining                                           |
| Data         | Node prebuild script → committed JSON → statically imported                                                   |
| Tests        | Vitest via `@angular/build:unit-test`                                                                         |
| Lint         | ESLint 10 + `angular-eslint` 22 + `typescript-eslint`                                                         |
| Format       | Prettier 3 + organize-attributes, css-order, tailwindcss plugins                                              |
| Hooks        | lefthook 2 + commitlint (Conventional Commits)                                                                |
| CI/CD        | GitHub Actions → `SamKirkland/FTP-Deploy-Action` → Plesk/Apache                                               |
| Runtime deps | Angular + `@angular/cdk` (overlay and focus trap for the mobile menu). No Octokit, no Express, no UI library. |

Component prefix is `bfs` (`bfs-root`, `bfs-project-card`, …).

---

## 3. Architecture

### 3.1 Static output, both locales in one build

One `ng build` produces both locales, fully prerendered. Verified empirically against
Angular 22.1.4 — details and copy-pasteable config in
[`docs/research/i18n-static-build.md`](docs/research/i18n-static-build.md).

```jsonc
"i18n": {
  "sourceLocale": { "code": "de", "subPath": "" },
  "locales": { "en": { "translation": "projects/website/src/locale/messages.en.xlf", "subPath": "en" } }
}
```

Output:

```
dist/website/browser/            ← upload the CONTENTS of this directory
├── index.html                     lang="de"  <base href="/">
├── support/index.html
├── legal-details-imprint/index.html
└── en/
    ├── index.html                 lang="en"  <base href="/en/">
    └── support/index.html
```

Three traps, all verified, all worth a comment in the code:

1. **`"server": "…/main.server.ts"` must stay in `angular.json`.** The builder does
   `options.prerender = !!options.server`. Remove it and the build still exits 0 — but ships
   an empty client-side shell with nothing prerendered. Only `ssr.entry` and `server.ts` go.
2. **`ng serve` cannot serve both locales.** It silently disables localization and serves a
   single locale flat at `/`. The language switcher can only be verified against a real build.
3. **Assets are duplicated per locale.** Use relative asset paths in templates so `/en/`
   resolves against its own `<base href>`.

`i18nMissingTranslation: "error"` is set: an untranslated string fails the build. That makes
the English translation a hard dependency of the first green build, not a follow-up.

### 3.2 Build-time GitHub data

The site shows release information for three repositories:

| Repository                   | Source                                                         | Fallback         |
| ---------------------------- | -------------------------------------------------------------- | ---------------- |
| `BoundfoxStudios/lehrgrapht` | latest **tag** (`releases/latest` is 404 — it has no releases) | build fails      |
| `BoundfoxStudios/mat`        | latest **release**                                             | —                |
| `BoundfoxStudios/flugwacht`  | latest **release** (none today)                                | "In Entwicklung" |

**Approach: a Node prebuild script writes `github-data.json`, which the app imports statically.**

This deviates from the LehrGrapht reference (Octokit + `TransferState` inside an app
initializer). That approach was built and measured; it works, but:

- It hits the GitHub API **once per prerendered route plus once** — measured 21 fetch rounds
  for 20 routes. The prebuild script hits it once.
- Octokit forces `allowedCommonJsDependencies` and pushed LehrGrapht's initial budget to
  800 kB. Our budget is 500 kB.
- `process.env` has no esbuild shim. It stays out of the browser bundle only through
  tree-shaking — one accidental component import re-introduces it as a runtime `ReferenceError`.
- On failure the stack trace points into a hashed temp path under `.angular/prerender-root/`.

The prebuild script fails on any non-2xx (except an allowed 404 for a missing release), and a
missing `github-data.json` fails the build with a module-resolution error. Both paths verified.
Full comparison in [`docs/research/build-time-github-data.md`](docs/research/build-time-github-data.md).

`github-data.json` is committed so `ng serve` and offline builds work without a token; CI
regenerates it before every build and does not commit it back.

**Card text does not come from the API.** Repository descriptions on GitHub are English, which
would put English prose into German paragraphs. Titles and descriptions are `$localize` strings;
only version, published date and language come from the API.

### 3.3 SEO

Route `data` carries `$localize`d title and description; a custom `TitleStrategy` applies title,
meta description, canonical, Open Graph, Twitter card and `hreflang` on every navigation —
including the prerender pass. One route table, two languages, no parallel structures. Pattern in
[`docs/research/seo.md`](docs/research/seo.md).

Generated at build time, never hand-maintained: `sitemap.xml` (both locales, with
`xhtml:link rel="alternate"`), `robots.txt`, favicon/app-icon set, JSON-LD (`Organization`,
`WebSite`, one `SoftwareApplication` per app).

### 3.4 Mobile navigation

The design has no mobile menu — the header nav simply wraps. We ship a real burger menu as an
overlay instead, built on **`@angular/cdk`**. It is the site's only stateful, JavaScript-driven
widget, so its behaviour is specified rather than left to implementation:

- Breakpoint: burger below `md` (768px), full nav at and above.
- The panel is a CDK `Overlay` with a `BlockScrollStrategy`, a backdrop, and
  `keydownEvents` wired to close on `Escape`.
- `cdkTrapFocus` with `autoCapture` moves focus into the panel on open; the CDK's
  `FocusTrap` returns focus to the toggle on close.
- Toggle button carries `aria-expanded` and `aria-controls`; the panel has an accessible name.
- A navigation closes the panel.
- Transitions respect `prefers-reduced-motion`.
- The prerendered HTML renders the menu closed and the page fully usable; the toggle becomes
  interactive after hydration.

`@angular/cdk` is the only runtime dependency beyond Angular itself. Import only `Overlay` and
`A11yModule` — the CDK is deeply tree-shakeable, but a blanket import is not. The initial
bundle budget is 500 kB; if the overlay pushes past it, the budget is what gets re-examined,
not the accessibility behaviour.

This is also the one piece of genuine logic on the site, and the only component that earns a
unit test (see §8).

---

## 4. Routes

Route paths are English and **identical in both locales** — Angular's localized build makes the
router URL locale-relative, so the language switcher is `subPath + routerUrl` with no mapping
table. Five of the six already exist on the live site and stay untouched.

| Route                     | German        | English        | Live today                 |
| ------------------------- | ------------- | -------------- | -------------------------- |
| `/`                       | Startseite    | Home           | ✅ keep                    |
| `/apps-and-games/`        | Apps & Spiele | Apps & Games   | ⚠️ live as `/games/` → 301 |
| `/support/`               | Unterstützen  | Support        | ✅ keep                    |
| `/socials/`               | Socials       | Socials        | ✅ keep                    |
| `/legal-details-imprint/` | Impressum     | Imprint        | ✅ keep                    |
| `/privacy-policy/`        | Datenschutz   | Privacy Policy | ✅ keep                    |
| `/404/`                   | Fehler 404    | Not found      | new, `noindex`             |

English lives under `/en/…` — as it already does today.

All canonical URLs, `hreflang` hrefs, sitemap `<loc>`s and switcher hrefs carry a **trailing
slash**; Apache `DirectorySlash` 301s `/support` → `/support/`, and a redirect hop on every
language switch is avoidable.

### Legacy URL map

The old WordPress site has ~20 public URLs per locale (Yoast sitemap, snapshotted before
cutover). Everything not in the table above needs a rule:

| Old                                                                                                                                    | New                                            | Code |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---- |
| `/games/`                                                                                                                              | `/apps-and-games/`                             | 301  |
| `/courses/`, `/2d-space-shooter-course/`, `/blender-course/`, `/blender-shading-kurs/`, `/spiele-programmieren-mit-unity-kurs-gratis/` | `/`                                            | 301  |
| `/shops/`, `/spreadshop/`                                                                                                              | `/support/`                                    | 301  |
| 3 blog posts, `/category/company/`, 6 `/tag/*`, `/author/manuel-rauber/`                                                               | `/`                                            | 301  |
| `/feed/`, `/comments/feed/`, `/wp-json/`, `/wp-content/`, `/wp-includes/`, `/xmlrpc.php`                                               | —                                              | 410  |
| Yoast sitemaps (`sitemap_index.xml`, `*-sitemap.xml`)                                                                                  | `/sitemap.xml`                                 | 301  |
| `/press/index.php`                                                                                                                     | preserved, not part of the Angular route space | —    |

Each rule is mirrored under `/en/`.

The course and blog content is deliberately not carried over. Those URLs redirect to the home
page rather than 404ing, so their inbound links keep some value — the new site has no closer
equivalent. WordPress infrastructure paths return 410 because they are not content and should
drop out of the index rather than being followed.

There is **no `www` hostname**. The apex is the only valid host; `https://boundfoxstudios.com`
is the canonical origin everywhere. If a `www` DNS record still exists (it currently resolves
and returns HTTP 526), it should either 301 to the apex at Cloudflare or be removed.

---

## 5. Commands

```bash
npm start                 # ng serve — German locale
npm run start:en          # ng serve --configuration=en — English locale, served flat at /
npm run preview           # build + static file server over dist — the ONLY way to see /en/
npm run build             # prebuild fetches GitHub data, then ng build (both locales)
npm run fetch:github      # regenerate projects/website/src/app/generated/github-data.json
npm run i18n:extract      # ng extract-i18n — regenerate messages.xlf after adding strings
npm test                  # ng test (vitest)
npm run lint              # eslint
npm run format            # prettier --write .
npm run format:check      # prettier --check .
npm run verify:dist       # assertions over the built output (see §8)
```

---

## 6. Project Structure

```
SPEC.md                              this file
docs/design/*.md                     per-page implementation reference from the design handoff
docs/research/*.md                   verified technical research backing the decisions here
docs/components.md                   component inventory and API (produced in M2)
design_handoff_website_redesign/     original design references — GITIGNORED, see §10
deploy/                              .htaccess files and the redirect map, uploaded by CI
tools/                               build scripts (fetch-github-data, sitemap, icons, verify-dist)
.github/actions/                     read-node-version-from-nvmrc, prepare-node
.github/workflows/                   ci.yml, deploy.yml
projects/website/
├── public/                          static assets copied verbatim (fonts, images, icons)
└── src/
    ├── locale/messages.xlf          German source catalogue (generated)
    ├── locale/messages.en.xlf       English translations (hand-maintained)
    └── app/
        ├── generated/github-data.json   written by the prebuild script, committed
        ├── data/                        social links and app catalogue, single source
        ├── layout/                      site header, site footer, layout shell
        ├── pages/                       one folder per route
        ├── ui/                          reusable presentational components
        └── seo/                         site config, SeoService, TitleStrategy
```

---

## 7. Code Style

Prettier and ESLint own formatting and correctness; the rules below are what they cannot check.

- **No comments** unless they say something the code cannot: a workaround, a non-obvious
  edge case, a deliberate decision against the obvious. The three traps in §3.1 are exactly
  the kind of thing that earns one.
- **No abbreviations in identifiers.** `index`, not `i`. `repository`, not `repo`.
- German is the source language and lives in the templates. Every translatable string gets an
  explicit, stable id: `i18n="@@home.projects.kicker"`.
- Signals throughout: `input()`, `output()`, `computed()`, `linkedSignal()`. No decorators for
  inputs, no `ngOnChanges`.
- Presentational components take inputs and render; they do not inject services.
- Tailwind v4 wipes the stock palette, so **a mistyped utility class silently produces no CSS
  and no error**. `eslint-plugin-better-tailwindcss` with `no-unregistered-classes` is what
  turns that into a build failure.
- Preflight in v4 emits `border: 0 solid` with no default border colour — every `border`
  utility needs its colour spelled out (`border-neutral-200`).

```ts
@Component({
  selector: 'bfs-project-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-card.html',
})
export class ProjectCard {
  readonly title = input.required<string>();
  readonly platforms = input.required<string>();
  readonly release = input<ReleaseInfo | null>(null);

  protected readonly versionLabel = computed(
    () => this.release()?.tagName ?? $localize`:@@project-card.in-development:In Entwicklung`,
  );
}
```

---

## 8. Testing Strategy

This is a static content site. Component unit tests here would test Angular, not us — the
project conventions forbid that. So:

- **No component unit tests.** `projects/website/src/app/app.spec.ts` (the scaffold spec
  asserting `'Hello, website'`) is deleted in the first cleanup commit; it goes red the moment
  the template changes.
- **Unit tests only for real logic.** Three candidates: the mobile menu's focus trap and
  Escape/navigation close behaviour (§3.4), the sitemap generator, and the redirect-map
  generator.
- **The build is the test.** `ng build` runs the AOT compiler with `strictTemplates`; a separate
  `tsc --noEmit` job would be a slower, weaker duplicate. `i18nMissingTranslation: "error"`
  turns a missing translation into a build failure.
- **`tools/verify-dist.mjs` runs in CI after every build** and asserts what a type system
  cannot:
  - `dist/website/browser/index.html` and `en/index.html` contain prerendered content, not a
    client-side shell (this is the §3.1 trap #1 tripwire)
  - every `index.html` has exactly one `<link rel="canonical">` and three `hreflang` links
  - `sitemap.xml` URL count matches the route table
  - no `process.env` and no `fonts.googleapis.com` anywhere in `dist/`
  - `.htaccess` and `en/.htaccess` are present
- **Lighthouse CI** over the built output for `/` and `/en/`: Performance ≥ 95,
  Best Practices ≥ 95, SEO = 100, CLS < 0.05. Accessibility cannot be 100 — see below.
- **axe** over the built output with exactly one documented exception: the `color-contrast`
  finding on the orange kicker (§11.6). Any other finding fails the build. The exception lives
  in `docs/accessibility.md` with the measured ratio and the reason, so it stays a decision
  rather than drift.
- **Weekly link check** (`lychee`) over the built HTML — not per PR, so a dead partner link
  surfaces without blocking merges.

---

## 9. Delivery

### Branches

`feature/*` → PR into `develop` → PR `develop` → `main`. Every push to `main` deploys.
`main` is protected: PR required, CI green required, no direct pushes.

### Workflows

- **`ci.yml`** on pull requests into `develop` and `main`: CVE check
  (`OWASP/cve-lite-cli@v1`, fail on critical), lint + format check, test, build + `verify:dist`.
- **`deploy.yml`** on push to `main`, on `schedule` (nightly 03:00 UTC), and on
  `workflow_dispatch`: build with fresh GitHub data, then upload. Concurrency group
  `deploy-production` with `cancel-in-progress: false` — cancelling mid-upload leaves the
  server half-updated and the action's sync state inconsistent.

The nightly job exists so release information stays current without a commit; it caps staleness
of the "updated …" labels at 24 hours.

Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (+ `CF_ZONE_ID`, `CF_API_TOKEN` if the
Cloudflare purge lands). The GitHub data fetch uses the automatic `secrets.GITHUB_TOKEN` — all
three repositories are public, so no PAT and no GitHub App is needed.

### Deployment target

Plesk/Apache behind Cloudflare. Upload order is assets first, HTML last, so a visitor never
gets HTML referencing bundles that are not up yet. HTML is served `Cache-Control: no-cache`;
content-hashed bundles are `immutable`.

---

## 10. Boundaries

**Always**

- Run `npm run lint` and `npm run build` before pushing.
- Give every translatable string a stable explicit `@@id`.
- Use relative asset paths in templates (absolute paths break under `/en/`).
- Reference the matching `docs/design/*.md` in the PR when implementing a page.
- Keep `github-data.json` committed and let CI regenerate it.

**Ask first**

- Adding any runtime dependency beyond Angular and `@angular/cdk` (the budget is 500 kB and
  there is no UI library).
- Changing a route path — five of them are indexed and linked from shipped apps.
- Changing brand colours or introducing a colour outside the token set.
- Anything that touches the production docroot outside the deploy workflow.

**Never**

- Commit secrets. The repo goes public; enable secret scanning and push protection first.
- Change `#ffeb3b`, `#ffc107` or `#ffa726`. They are brand colours, not design tokens up for
  negotiation — including where one of them fails a contrast check (§11.6).
- Call GitHub (or any third party) from the browser at runtime.
- Load fonts or scripts from a third-party origin — the privacy policy asserts we do not.
- Use `dangerous-clean-slate` on the FTP deploy: `/press/` and Plesk backups live in the same
  docroot.
- Add `continue-on-error` or `|| true` to the GitHub data fetch — failing loudly is the point.

---

## 11. Findings that change the plan

Each of these was verified against the live site or the actual files, and each contradicts
something in the design handoff or an earlier assumption.

1. **The live site already has this URL structure.** `/support/`, `/socials/`,
   `/legal-details-imprint/`, `/privacy-policy/`, `/games/` and the `/en/` prefix all return
   200 today. The handoff proposes German slugs (`/unterstuetzen`, `/impressum`); adopting
   them would throw away every existing backlink and force a per-locale route table. The route
   table in §4 keeps what is indexed.
2. **There is no `www` hostname.** `www.boundfoxstudios.com` currently resolves and returns
   HTTP 526; only the apex is valid. Canonical origin is `https://boundfoxstudios.com`, and the
   stray `www` record should 301 to the apex at Cloudflare or be removed.
3. **`https://bug-a-ball.com` has an invalid certificate** (subject `Plesk`), so the primary
   CTA on `/apps-and-games/` currently lands on a browser security interstitial.
   `https://bugaball.com/` works. Every link must point there.
4. **The Bug-A-Ball SVG is not broken.** The handoff says the export lost its styles; it renders
   perfectly. The real problem is that it is square (1025×1026) and both media slots need wide
   crops. This is an art-direction task, not an asset hunt.
5. **Tahu is licensed for commercial use** — dafont lists it as "100% Free" and the author
   states "free 100% for personal use and commercial use". The font binary's embedded
   "All rights reserved" string is stale editor boilerplate. Evidence recorded in
   `docs/licenses/tahu.md`; the font ships self-hosted like the others.
6. **The orange kicker fails WCAG AA and stays anyway.** `#ffa726` on white is ~1.9:1 at 12px
   bold, and the kicker is the first text on all six pages. `#ffa726` is a brand colour and is
   not being changed; no size increase fixes it either (large-text AA needs 3:1). This is a
   deliberate, documented deviation — recorded in `docs/accessibility.md`, excluded by name in
   the axe run, and the reason the Lighthouse accessibility target is not 100 (§8).
7. **There is no focus-visible state anywhere in the design**, and no single ring colour works
   across white, `#f5f5f5`, `#171717` and the yellow→orange gradient — amber on the gradient is
   ~1.1:1, exactly where five clickable pills live.
8. **Cloudflare sits in front of the origin.** `Cache-Control: no-cache` on HTML does not stop
   the edge cache; a deploy can be invisible for hours without a purge step.

---

## 12. Decisions

| #   | Decision                      | Outcome                                                                                                                                                                        |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Build-time data source        | **Prebuild script** (§3.2). One API call, no Octokit, no `process.env` in the bundle                                                                                           |
| D2  | Kicker contrast               | **Keep `#ffa726`.** Brand colour, not negotiable. Documented deviation (§11.6)                                                                                                 |
| D3  | Focus ring                    | **Surface-scoped token**: `#171717` on light surfaces, `#ffc107` on dark, one `focus-visible:outline-2` utility everywhere                                                     |
| D4  | Mobile navigation             | **Burger menu built on `@angular/cdk`**, fully specified in §3.4                                                                                                               |
| D5  | Tahu                          | **Keep it.** Licensed for commercial use, evidence in `docs/licenses/tahu.md`                                                                                                  |
| D6  | Course and blog content       | **Not carried over.** Only the six pages in the handoff. Old URLs 301 to `/` (§4)                                                                                              |
| D7  | FTP target                    | `server-dir: /` — a dedicated FTP account is rooted at the right directory                                                                                                     |
| D8  | Staging                       | **None.** Verification is local via `npm run preview` before merging to `main`                                                                                                 |
| D9  | `x-default` hreflang          | **German** — matches the apex and the primary audience                                                                                                                         |
| D10 | Legal pages in English        | **German text under `/en/`** plus one English notice; only the German version is legally binding                                                                               |
| D11 | Measurement                   | **None.** No client-side script of any kind. Cloudflare's zone analytics exist as a byproduct of the CDN and are not part of the site                                          |
| D12 | Translation catalogue tooling | `ng-extract-i18n-merge` with `newTranslationTargetsBlank: "omit"` — the default copies the German source into new targets and would ship German into `/en/` with a green build |

### Awaiting delivery, not decision

- **Impressum and Datenschutz final texts** — Manu supplies them; they drop into the existing
  i18n ids without touching code.
- **The handover items in [`docs/decisions.md`](docs/decisions.md#for-manu)** — credentials,
  hosting-panel settings and the two data-processing-agreement dates. Everything else in the
  backlog is decided.

---

## 13. Milestones

Build order. Each milestone is independently verifiable.

| #   | Milestone          | Contains                                                                                                                                                               | Depends on     |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| M1  | Foundation         | Public-repo readiness, static build switch, `bfs` prefix, ESLint/Prettier/lefthook/commitlint, CI workflows, `.gitignore` for the handoff folder, delete scaffold spec | —              |
| M2  | Design System      | Tailwind `@theme` tokens, self-hosted fonts, icon and image pipeline, focus system, `docs/components.md` + component library                                           | M1             |
| M3  | Shell              | Header, footer, wrapped-nav polish, routing, i18n setup, language switcher, SEO service + TitleStrategy, 404 page                                                      | M2             |
| M4  | GitHub Data        | Prebuild script, typed accessor, repository cards, fallback behaviour                                                                                                  | M1             |
| M5  | Pages              | Home, Apps & Games, Support, Socials                                                                                                                                   | M3, M4         |
| M6  | Legal & Content    | Imprint, privacy policy, Bug-A-Ball crops, legal review                                                                                                                | M3             |
| M7  | English Locale     | Extraction, translation per page, `i18nMissingTranslation` green                                                                                                       | M5, M6         |
| M8  | SEO & Generation   | sitemap, robots, JSON-LD, favicons, OG images, `verify-dist`, Lighthouse CI                                                                                            | M3             |
| M9  | Deploy & Migration | `.htaccess`, redirect map, FTP deploy, nightly job, Cloudflare/TLS                                                                                                     | M1, M3, M4, M8 |
| M10 | Launch             | Cutover runbook, staging verification, rollback plan, Search Console                                                                                                   | all            |

M4 and M9 can start in parallel with M2/M3. M7 blocks the first green production build, since
a missing translation fails the build.
