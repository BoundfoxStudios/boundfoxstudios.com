# Decision Log

Compiled from the per-milestone backlog audit. Everything here is settled and actionable:
an agent implementing an issue reads this file first, then the issue, then the referenced
`docs/design/*.md`. Where this file contradicts a design document, this file wins; where it
contradicts `SPEC.md`, SPEC wins unless a row says explicitly that it corrects SPEC.

---

## For Manu

Thirteen items need you. Everything else in this document is decided and needs no input.

### Repository (blocks M1 and all CI work)

- **Push and go public.** In this order: `git push -u origin main`, `git push origin main:develop`,
  then `gh repo edit BoundfoxStudios/boundfoxstudios.com --visibility public --accept-visibility-change-consequences`.
  Nothing has ever been pushed, so `main`/`develop` do not exist on the remote; secret scanning,
  push protection and private vulnerability reporting all fail with 422/403 while the repo is
  private. The agent takes over immediately afterwards (security features, rulesets, repo
  settings, default branch → `develop`) — those need no push.

### Credentials (blocks M9 and M10)

- **Plesk FTP account.** Create an FTP user for the domain (suggested login `deploy`) whose home
  directory *is* the docroot that serves `https://boundfoxstudios.com` (Plesk default `httpdocs`).
  Store `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` in the GitHub **environment** `production`,
  never as repo secrets. Default if unspecified: `server-dir: /` per SPEC D7; if the account
  cannot be rooted at the docroot, say so and the single change is `server-dir: /httpdocs/`.
- **Cloudflare API token.** My Profile → API Tokens → Custom: permission `Zone → Cache Purge →
  Purge`, resource `Include → Specific zone → boundfoxstudios.com`. Store `CF_API_TOKEN` and the
  zone id (`CF_ZONE_ID`, from the zone Overview) in the same `production` environment. Without
  them the deploy has no purge step and a release is invisible at the edge for hours.

### Panel settings (blocks M9 and M10)

- **Plesk vhost.** Domains → boundfoxstudios.com → Apache & nginx Settings: (a) `AllowOverride All`
  for httpdocs, (b) **untick** "Serve static files directly by nginx". Without (b) Apache never sees
  the request and every `.htaccess` directive (cache headers, 301/410 map, ErrorDocument) is
  silently inert. Also confirm PHP stays enabled for the domain — `/press/index.php` needs it.
- **Cloudflare zone.** SSL/TLS = **Full (strict)**; Always Use HTTPS = On; Minimum TLS 1.2;
  HSTS On with `max-age=31536000`, `includeSubDomains` On, `preload` **Off**, "No-Sniff header" Off;
  Speed → Rocket Loader and HTML minification **Off**. Default for the stray `www` record: keep it
  proxied and add the Redirect Rule in the M9 table (301 to the apex) — say the word if you would
  rather delete the record.
- **Remove the WordPress edge caching.** Speed → Optimization → Automatic Platform Optimization
  **Off**, and delete every WordPress-era Page Rule / Cache Rule (`Cache Everything`, `wp-*`,
  bypass-on-cookie). The old site answers `cf-edge-cache: platform=wordpress`; left in place it
  keeps serving cached WordPress HTML after cutover.
- **Bot protection stays off.** Confirm Bot Fight Mode, Super Bot Fight Mode, Under Attack Mode and
  Managed-Challenge rules are all **off**. Default if you say nothing: off — that is what keeps
  the privacy policy's "ohne Cookies" literally true (no `__cf_bm`, no `cf_clearance`).
- **Origin certificate.** Cloudflare → SSL/TLS → Origin Server → Create Certificate, RSA 2048,
  hostnames `boundfoxstudios.com` and `*.boundfoxstudios.com`, 15 years; paste cert + key into
  Plesk and bind it in Hosting Settings. Full (strict) trusts it, it covers `www`, and there is no
  ACME renewal to fail behind the proxy.
- **bug-a-ball.com.** Switch the domain from forwarding to normal hosting with an empty `httpdocs`,
  then issue a free Let's Encrypt certificate with "Keep websites secured" (auto-renew) and set the
  301 in `.htaccess` with `RewriteCond %{REQUEST_URI} !^/\.well-known/` so ACME survives it. It
  currently serves the Plesk self-signed cert. Keep the domain DNS-only (grey cloud) in Cloudflare.
- **Cutover backup.** Before the docroot is touched: Plesk → Backup & Restore → full backup (files
  + database); paste the backup name and timestamp into the runbook's Rollback section.
- **Search Console and Bing.** Create a **Domain** property for `boundfoxstudios.com` in Search
  Console, add the `google-site-verification=…` TXT record at Cloudflare (name `@`), do the same
  for Bing Webmaster Tools, press Verify in both. Use the Google account that owns the YouTube
  channel and add `info@boundfoxstudios.com` as a second owner. Sitemap submission happens after
  cutover, not now.

### Processor record (internal — blocks nothing)

Both legal texts arrived on 2026-08-17 and ship verbatim from `docs/legal/`, so the text items
that used to block M6 are done: no sign-off round is needed for a text you supplied yourself, and
the address and the VAT number come from that same file. The two answers below feed **only**
`docs/privacy-processors.md`, an internal document — the shipped privacy text names no processor,
because the instruction was to take the supplied wording verbatim. Answer when convenient.

- **Hosting provider name and registered seat**, exactly as in the hosting contract (e.g.
  "Hetzner Online GmbH, Gunzenhausen") — the open cell in the record's hoster row.
- **Two DPA dates.** Cloudflare → Legal/DPA: the acceptance date. Hoster: download the
  AV-Vertrag into `docs/legal/` and note its date. Both go into the prepared table in
  `docs/privacy-processors.md`; the agent fills everything else in.

---

## Decided

### M1 — Foundation

| Issue | Question | Decision |
|---|---|---|
| Repo readiness | LICENSE content | English. First line `Copyright (c) 2026 Boundfox Studios – Manuel Rauber` (legal name from `docs/design/imprint.md`), verbatim MIT body, then the asset carve-out paragraph in *Langtexte* below. |
| Repo readiness | Security features | Reword the three criteria to "enabled after the visibility flip". Once public the agent runs `gh api -X PATCH …/repos/… -f 'security_and_analysis[secret_scanning][status]=enabled' -f 'security_and_analysis[secret_scanning_push_protection][status]=enabled'` and `gh api -X PUT …/private-vulnerability-reporting`. |
| Repo readiness | Community health files | Drop "files exist in `BoundfoxStudios/.github`" (unverifiable from here); replace with "follow-up issue opened in `BoundfoxStudios/.github`". That issue's content: `CODE_OF_CONDUCT.md` = Contributor Covenant 3.0 verbatim, contact `info@boundfoxstudios.com`; `SECURITY.md` = the text in *Langtexte*; `.github/ISSUE_TEMPLATE/` = `bug_report.yml` (what happened, expected, steps, URL, browser/OS), `feature_request.yml` (problem, proposal, alternatives), `config.yml` with `blank_issues_enabled: false`. |
| Repo readiness | README vs SPEC §5 command list | The README documents only commands that exist in `package.json` at that point, plus one sentence: "Weitere Kommandos aus SPEC §5 (`fetch:github`, `i18n:extract`, `verify:dist`) kommen mit M4, M7 und M8 dazu." Criterion in both issues becomes the subset direction: every command named in the README exists as a script in `package.json`. |
| Repo readiness | Dependabot | Add `.github/dependabot.yml`: `version: 2`; npm at `/`, weekly, `open-pull-requests-limit: 5`, `commit-message.prefix: chore`, group `angular` = `["@angular*"]`; github-actions with `directories: ["/", "/.github/actions/prepare-node"]` (composite actions are not scanned via `directory`), weekly, prefix `chore`. |
| Static build switch | "Prerendered N static routes." | Criterion is the regex `/^Prerendered \d+ static routes?\.$/`; at M1 the literal output is `Prerendered 1 static route.` (singular, empty route table) and `dist/website/prerendered-routes.json` lists `/`. |
| bfs prefix rename | Scaffold template ownership | Same commit replaces `app.html` with `<router-outlet />`, deletes `app.css` and its `styleUrl`, drops the unused `title` signal. Criterion: no scaffold markup remains. |
| ESLint setup | Lint-clean tree | No rule downgrades. `main.ts` → `bootstrapApplication(App, appConfig).catch((error: unknown): void => { console.error(error); });`. `main.server.ts` → `const bootstrap = (context: BootstrapContext): Promise<ApplicationRef> => bootstrapApplication(App, config, context);` with `ApplicationRef` from `@angular/core`. |
| ESLint setup | Handoff folder | Fourth `globalIgnores` entry `design_handoff_website_redesign/**` (ESLint does not read `.gitignore`). Criterion: `npx eslint --debug . 2>&1 | grep -c design_handoff` returns 0. |
| ESLint setup | Tailwind guard proof | `text-gray-500` still resolves at M1 (stock palette). Probe with `class="text-brand-nope-500"` in `app.html`, expect `better-tailwindcss/no-unknown-classes`, revert. The `text-gray-500` probe becomes the regression test of the M2 palette wipe. |
| ESLint setup | Plugin version | Pin exactly: `"eslint-plugin-better-tailwindcss": "4.7.0"` (rule was renamed once already). Everything else keeps caret ranges. On a bump, confirm the rule name with `npx eslint --print-config … \| grep better-tailwindcss`. |
| Hooks | lefthook install proof | lefthook never sets `core.hooksPath` (that is husky). Criterion: after `npm ci`, `.git/hooks/pre-commit` and `.git/hooks/commit-msg` exist, are executable and contain `call_lefthook`. |
| Hooks | `.prettierignore` | Six lines: `/dist`, `/.angular`, `package-lock.json`, `/design_handoff_website_redesign`, `/docs`, `/SPEC.md`. `docs/**` and SPEC hold verbatim German copy in tables; reformatting them is a review-hostile diff. Criterion: `npx prettier --check .` exits 0 without touching them. |
| Hooks | Tailwind sort proof | Throwaway `projects/website/src/app/tailwind-probe.html` with `<div class="text-sm flex p-4"></div>`; `npx prettier` must print `<div class="flex p-4 text-sm"></div>`; delete the file. Unsorted output means `tailwindStylesheet` is wrong or the plugin is not last. |
| CI workflow | PR-dependent criteria | Move "a PR into develop runs all four jobs" and "main cannot be merged without four checks" into a post-push checklist. `actionlint` and the `.nvmrc` output check stay as the locally verifiable ones. |
| CI workflow | Branch protection | After the push the agent creates rulesets via `gh api -X POST …/rulesets` for `main` and `develop`: `pull_request` with `required_approving_review_count: 0` (a solo maintainer cannot approve their own PR), `required_status_checks` with contexts `CVE check`, `Lint & format`, `Test`, `Build`, plus `non_fast_forward`, `deletion`, `required_linear_history`; `strict_required_status_checks_policy: true` on `main` only. |
| CI workflow | Repository settings | `gh api -X PATCH …/repos/… -F allow_squash_merge=false -F allow_merge_commit=true -F allow_rebase_merge=true -F delete_branch_on_merge=true` (squash writes the non-conventional PR title onto `main` and would invalidate commitlint-on-history) and `gh api -X PUT …/actions/permissions/workflow -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false`. Default branch → `develop`. |
| Local DX | Preview server | `"http-server": "14.1.1"` as a devDependency, invoked without `npx` so it can never prompt. See the script table in *Conventions*. |
| Local DX | VS Code recommendations | `{"recommendations": ["angular.ng-template", "bradlc.vscode-tailwindcss", "esbenp.prettier-vscode", "editorconfig.editorconfig"]}`. In `settings.json` also `"[tailwindcss]": {"editor.defaultFormatter": "esbenp.prettier-vscode"}` — `files.associations` remaps `*.css` to the `tailwindcss` language and format-on-save dies without it. |
| Local DX | IntelliSense criterion | Not checkable headlessly. Replace with: `.vscode/settings.json` sets `tailwindCSS.experimental.configFile` to `projects/website/src/styles.css`, and that file contains `@import 'tailwindcss'`. Keep the popup check as a manual smoke note. |

### M2 — Design System

| Issue | Question | Decision |
|---|---|---|
| Theme tokens | `@theme` contents | Twelve colours **plus** `--shadow-accent: 0 10px 15px -3px rgb(255 193 7 / .3), 0 4px 6px -4px rgb(255 193 7 / .3);` (verbatim from `home.md` §1.4 — `shadow-accent` emits no CSS otherwise) **plus** four font families: `--font-display`, `--font-sans`, `--font-script`, `--font-mono: monospace`. Tailwind's default mono stack survives the colour wipe and is not the design's bare `monospace`. |
| Theme tokens | Global base layer | Written here, once, directly after `@theme` (M6 must not re-add it): `@layer base { body { color: var(--color-neutral-700); } a { color: var(--color-link); text-decoration: none; transition: color 150ms cubic-bezier(0.4,0,0.2,1); } a:hover { color: var(--color-orange); } }`. Preflight already zeroes the body margin; white is the UA default; `--default-font-family` resolves to `--font-sans`. |
| Theme tokens | Off-scale values | No further tokens. Use arbitrary values at the usage site: `text-[28px]`, `text-[44px]`, `max-w-[480px]`, `max-w-[560px]`, `max-w-[620px]`, `max-w-[760px]`. Record the rule in `docs/components.md`. |
| Fonts | Where the binaries come from | `tools/generate-fonts.mjs`, exposed as `npm run fonts:generate`, devDependency `subset-font` (harfbuzz WASM, emits woff2 — no Python toolchain). Sources: `raw.githubusercontent.com/google/fonts/main/ofl/bebasneue/BebasNeue-Regular.ttf`, `.../barlow/Barlow-Regular.ttf`, `.../barlow/Barlow-Bold.ttf`; Tahu is copied from the handoff to `projects/website/branding/fonts/Tahu.ttf` (tracked) first. Also fetch both `OFL.txt` into `docs/licenses/`. |
| Fonts | Output names and subsets | `projects/website/public/fonts/{bebas-neue-400,barlow-400,barlow-700,tahu-400}.woff2`, committed. Barlow = Google's latin range. Bebas text subset `ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ0123456789 &§©·–—→/.,:!?'()-+%`. Tahu text subset `Danke!Thanks`. |
| Fonts | Fallback metrics | `@font-face { font-family: 'Bebas Neue Fallback'; src: local('Arial'); size-adjust: 76.72%; ascent-override: 117.32%; descent-override: 39.11%; line-gap-override: 0%; }`; Barlow 400 → `96.68% / 103.43% / 20.69% / 0%`; Barlow 700 → `99.60% / 100.41% / 20.08% / 0%` (computed from `@capsizecss/metrics` against Arial). Stacks: `'Bebas Neue', 'Bebas Neue Fallback', sans-serif` · `'Barlow', 'Barlow Fallback', sans-serif` · `'Tahu', cursive`. Tahu gets **no** fallback face (one 44px word, no metrics source); amend that AC to "each of the three text faces". |
| Fonts | CLS criterion | `tools/verify-font-cls.mjs` with Playwright chromium: serve `dist/website/browser`, abort `**/bebas-neue-400.woff2`, await `document.fonts.ready`, sum `layout-shift` entries with `hadRecentInput === false`, fail above 0.05, for `/` and `/en/`. If chromium cannot be installed, the substitute criterion is that the three fallback faces carry exactly the override values above and are referenced from the `@theme` stacks — state in the PR which path ran. |
| Image pipeline | `icon.svg` | Does not exist and is not created. `projects/website/branding/` holds exactly `fox-head.png` (600×600), `bug-a-ball.svg`, `icon.png` (a copy of `fox-head.png`, the M8 icon source) and `og-logo.png` (a copy of the handoff `logo-lockup.png`). Record in `docs/components.md` that no vector mark exists. |
| Image pipeline | WebP vs PNG fallback | Fox head: WebP only, no `<picture>`, no custom loader, no `ngSrcset`. `npm run images:generate` writes `fox-head-{32,40,64,80}.webp` to `projects/website/public/images/`; header uses `ngSrc="images/fox-head-64.webp" width="32" height="32" priority`, footer `images/fox-head-80.webp` at 40×40 (2× file at 1× box). The 32/40 files exist for M8. |
| Image pipeline | SVG sizing | Attributes carry the intrinsic ratio, CSS does the sizing: `flugwacht-wordmark.svg` → `width="231" height="42"` plus `h-auto w-[56%] max-w-[300px]` on `/` and `h-auto w-[62%] max-w-[280px]` on `/apps-and-games/`; `mat-dark.svg` → `112×112` on `/`, `104×104` on `/apps-and-games/`. Both copied verbatim into `public/images/` and referenced relatively. Record the four numbers in `docs/components.md`. |
| Brand icon | Consumer sizes | 20 (footer), **22** (dark Support chips, Ko-fi/Patreon), 24 (light Support chips), 32 (Socials tiles). `size = input(24)`. Colour from outside via `currentColor`. |
| Focus system | Class names and CSS | `@layer base { :root { --focus-ring: #171717; } }`, `@utility surface-dark { --focus-ring: #ffc107; }`, `@utility focus-ring { &:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; } }`. `focus-ring` goes on every interactive element; `surface-dark` on the header band, footer band, Socials tiles and dark Support chips. `:root` lives in `@layer base`, not `@theme`. |
| Focus system | Screenshot/measurement criteria | Commit `docs/screenshots/focus/{white,neutral-100,ink,gradient}.png` (Playwright) and record the ratios in `docs/accessibility.md`: `#171717` on `#ffffff` 17.9:1, on `#f5f5f5` 16.4:1, on the gradient 14.7:1 (`#ffeb3b` end) and 9.2:1 (`#ffa726` end); `#ffc107` on `#171717` 11.0:1. All clear 3:1. |
| Focus system | Harness page | One shared harness: `projects/website/src/app/pages/design-harness/`, route `design-harness`, `RenderMode.Prerender`, `<meta name="robots" content="noindex">`, excluded from the sitemap generator. The last M2 PR (UI primitives) deletes it; criterion `grep -rn design-harness projects` is empty. |
| Component inventory | Badge variants | Ship `variant: 'amber' \| 'outline'` only. `yellow`/`orange`/`dark` are dropped (they occur nowhere in the six pages); record that in `docs/components.md`. |
| UI primitives | Badge height | 22px is unreachable with `text-xs` + `py-0.5` (that is 20px); the design's 22 is the surrounding line box. Criterion becomes parity: both variants render 20px, verified side by side. `outline` uses `ring-1 ring-inset ring-neutral-400`, never a border, because a border would make it 22px and break the meta-row alignment. |
| Key art crops | Master and rectangle | Master is tracked: `projects/website/branding/bug-a-ball.svg`. Rasterise at `density: 144` (2050×2052), crop `{ left: 0, top: 342, width: 2050, height: 1024 }` as a named constant, then `.resize(1200, 600)` and `.resize(840, 420)`. Encode `webp({ quality: 82 })` and `jpeg({ quality: 82, progressive: true, mozjpeg: true })`. Assert `stats.entropy > 1` after rasterising to catch a blank frame. |
| Key art crops | Filenames | `bug-a-ball-feature-1200x600.{webp,jpg}` and `bug-a-ball-card-840x420.{webp,jpg}` in `public/images/`, committed, so `ng build` never depends on sharp. Both are rendered through `<picture>` with the WebP source and the JPEG `<img>` fallback. |

### M3 — Shell

| Issue | Question | Decision |
|---|---|---|
| i18n setup | Red CI until M7 | In the same PR, the CI `build` job runs `npm run build -- --i18n-missing-translation=warning` (npm forwards the flag to `ng build`, the `prebuild` hook still fires). M7's sync-check issue removes the flag. `i18nMissingTranslation: "error"` stays in `angular.json` untouched — that is what makes the M7 flip a real gate. |
| i18n setup | Initial `messages.en.xlf` | Commit exactly: XML declaration, `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="de" trgLang="en">`, one empty `<file id="ngi18n" original="ng.template"></file>`. An empty catalogue is valid input; the builder only errors on units that exist in the source. |
| i18n setup | `tsconfig.spec.json` | `"types": ["vitest/globals", "@angular/localize"]`, otherwise any spec importing a component that uses `$localize` fails to typecheck. The runtime side is already covered (the unit-test builder reuses the build target's polyfills). |
| Header | Brand lockup component | Built here: `projects/website/src/app/ui/brand-lockup/`, selector `bfs-brand-lockup`, OnPush, `markSize = input<32 \| 40>(32)`, `nowrap = input(true)`, `priority = input(false)`. It is never itself a link (the header wraps it in `<a routerLink="/">`, the footer renders it bare). The words `BOUNDFOX`/`STUDIOS` stay unmarked — locale-invariant brand name, which retires the three competing id proposals. |
| Header / footer | Fox head `alt` | `alt=""` on both marks. The adjacent wordmark is real text; a non-empty alt makes it announce twice. Retire `site-header.logo.alt`; no `aria-label` on the logo link. Note the deviation from `site-header.md` §2.3 in `docs/components.md`. |
| Header / footer | Language switcher markup | Current locale: `<span aria-current="true" class="text-yellow">DE</span>` — never a self-link. Other locale: `<a [href] hreflang rel="alternate">EN</a>`. Separator `<span aria-hidden="true">/</span>`. The footer's `Deutsch`/`English` pair follows the identical rule. |
| Header | Locale href computation | `projects/website/src/app/seo/site.config.ts` holds `LOCALES` and `SITE` (created by whichever of the two issues lands first). `projects/website/src/app/seo/locale-links.ts` adds `@Injectable({providedIn:'root'}) LocaleLinks`, injecting `Router` and `LOCALE_ID`, exposing `links = computed(...)` with `href = \`/${subPath}${path}/\`` collapsed via `.replace(/\/{2,}/g, '/')` over `router.lastSuccessfulNavigation()?.finalUrl?.toString() ?? '/'`, plus a `current` flag. Header and footer both consume it; neither computes an href itself. |
| Header vs mobile menu | 375px criterion | The header issue ships nav + switcher visible at every width (wrapping only) and its 375px criterion is checked then. The mobile-menu issue owns the breakpoint: it adds `max-md:hidden` to the nav and switcher, `md:hidden` to the burger, and rewrites the header criterion to "between 768px and ~840px the nav wraps without clipping". Record the hand-over sentence in both issues. |
| Mobile menu | CDK stylesheet | Add `node_modules/@angular/cdk/overlay-prebuilt.css` to `architect.build.options.styles` in `angular.json`, **before** `projects/website/src/styles.css` (Tailwind v4 needs its own `@import` first). Without it `BlockScrollStrategy` has no `.cdk-global-scrollblock` rules. Criterion: `dist/website/browser/styles-*.css` contains `.cdk-global-scrollblock`. |
| Mobile menu | Allowed CDK imports | Criterion becomes "only the `@angular/cdk/overlay`, `@angular/cdk/portal` and `@angular/cdk/a11y` entry points — never the package root". Panel markup lives in `<ng-template #panel>`; open does `overlayRef.attach(new TemplatePortal(this.panel(), this.viewContainerRef))`. Import the standalone `CdkTrapFocus` directive, not `A11yModule`. |
| Mobile menu | Panel geometry and motion | Full-width panel under the 64px header band: `overlay.position().global().top('64px').left('0')`, `width('100%')`; panel classes `w-screen bg-neutral-900 px-6 py-4 flex flex-col gap-1`; nav links stacked full width keeping `px-3 py-2 font-display text-base tracking-wider`; switcher below, separated by `mt-2 border-t border-neutral-600 pt-2`. Backdrop `cdk-overlay-dark-backdrop`. Motion is opacity only: `transition-opacity duration-150 ease-in-out motion-reduce:transition-none`. |
| Mobile menu | Burger and close glyphs | Inline 24×24 SVGs in the template, no dependency: `stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" aria-hidden="true" focusable="false"`, paths `M3 6h18M3 12h18M3 18h18` and `M18 6 6 18M6 6l12 12`. Colour from the button (`text-white hover:text-yellow`, 150ms). |
| Mobile menu | Panel id and name | `<nav id="mobile-menu-panel" [attr.aria-label]>` with the new id `site-header.menu.panel-label`. Toggle carries `aria-expanded`, `aria-controls="mobile-menu-panel"` and the existing open/close labels. Add the new id to `site-header.md` §4 in the same PR. |
| Mobile menu | Breakpoint crossing | Register `window.matchMedia('(min-width: 768px)')` inside `afterNextRender` (prerendering must never touch `window`), close on `change` when `matches`, tear down with `DestroyRef`. Criterion: resizing 375px → 1024px with the menu open closes it and restores scrolling. |
| Mobile menu | Focus tests in jsdom | jsdom cannot run the focus trap (`offsetWidth` is 0). Give the panel `tabindex="-1"` and call `panelElement.focus()` right after `attach()`, keeping `cdkTrapFocus` + `autoCapture` for the cycle and the return hop. The spec asserts three things: focus is inside the panel after open; `Escape` through `overlayRef.keydownEvents()` closes it and returns focus to the toggle; a `NavigationEnd` closes it. "Tab cycles within it" moves to the manual keyboard pass. |
| Mobile menu | No-JS criterion | Replace with: at 375px without JavaScript every route stays reachable because the footer renders all six page links and both locale links in the prerendered HTML; the burger is inert and announces `aria-expanded="false"`. Verify with `grep -c 'href="/support/"' dist/website/browser/index.html`. |
| Footer | `SOCIAL_LINKS` | `projects/website/src/app/data/social-links.ts` — see *Conventions › Shared data*. |
| Footer | Column `aria-labelledby` ids | `footer-pages-title`, `footer-legal-title`, `footer-social-title` on the three title spans. Convention `<component>-<section>-title`, recorded in `docs/components.md` next to `mobile-menu-panel`. |
| Routing | Placeholder page content | Every placeholder page ships an **empty** template and no strings — unmarked German would ship verbatim into `/en/` and `i18nMissingTranslation` cannot catch it. The prerendered page is still real because header, `<main>` and footer render around the outlet. Criterion: `grep -c 'bfs-site-footer' dist/website/browser/support/index.html` is 1. Exception: the 404 page gets its full content in its own issue. |
| Routing | Layout shell | `app.html` becomes `<div class="flex min-h-screen flex-col"><bfs-site-header /><main class="flex-1"><router-outlet /></main><bfs-site-footer /></div>`. Criterion: the footer sits flush at the bottom on `404/index.html` at 1440×900. |
| Routing | Hydration | `provideClientHydration(withEventReplay(), withI18nSupport())` — the burger must survive a tap during the hydration window. No `withIncrementalHydration()` (no deferred blocks). Criterion: a burger click fired before hydration still opens the panel. **`withI18nSupport()` added while building #22.** Without it Angular annotates every component containing an i18n block — the header, the footer and every page — with `ngSkipHydration`, so those subtrees are destroyed and re-rendered on the client instead of hydrated, which also defeats `withEventReplay()` because the clicked node is replaced. Measured: 2–3 annotations per prerendered page before, 0 after, at +2.54 kB raw / +0.63 kB transfer. Criterion: `grep -c ngskiphydration dist/website/browser/404/index.html` is 0. |
| Routing | 404 component path | One component for both the `404` route and the `**` wildcard: `pages/not-found/not-found.ts`, selector `bfs-not-found-page`. No `pages/404/` folder. |
| SEO service | `SITE.twitter` | Dropped, together with the `twitter:site` meta tag — no X account exists in the socials inventory. Keep `twitter:card = summary_large_image`; X reads the rest from the `og:*` tags. Criterion becomes "`description`, `robots`, `twitter:card` and the `og:*` set are present on every page". |
| SEO service | `SITE.defaultImage` | `'/og/default.png'` — the exact path M8 generates. The file deliberately does not exist yet; nothing in the M3 build resolves it (`new URL()` only string-joins). Note the M8 dependency in the issue body. |
| SEO service | `og:url` on noindex pages | Move `og:url` behind the `noIndex` guard, together with canonical and hreflang. A noindex page emits title, description, `robots: noindex, follow`, `twitter:card` and six `og:*` tags (`title`, `description`, `image`, `type`, `site_name`, `locale`). Criterion: every indexable page carries seven `og:*`; `/404/` carries six and no `og:url`, canonical or alternate. Mirror it in the 404 issue and in `verify-dist`. |
| SEO service | Stale identity on client-side navigation | Added while building #21. One document survives every in-app navigation, so `apply()` removes every `link[rel="canonical"]`, every `link[rel="alternate"]` and the `og:url` tag **before** the `noIndex` guard, then appends this page's set. Without it a client-side hop from `/support/` to a missed URL renders `robots: noindex, follow` while still declaring `/support/` as its canonical, its three alternates and its `og:url`. The prerendered HTML is unaffected (each route renders into a fresh document); this is a runtime-only correction and the reason `setLink`/`setAlternate` collapsed into one `appendLink`. Criterion: after a popstate to an arbitrary URL the head holds no canonical, no alternate and no `og:url`, and hopping back restores exactly one of each. |
| 404 page | Language switcher href | Added while building #22. `LocaleLinks` falls back to the locale root (`/`, `/en/`) whenever the active route's `data.seo` carries `noIndex`, instead of mirroring the current path. On a real miss the path form emits `/en/zzqq/xyzzy?q=1/` — a link into the next 404 that also folds the query string into the path, and that makes the hydrated DOM diverge from the once-prerendered `/404/`. Same rule as the SEO service's: a page with no canonical identity has no counterpart to point at. The resolver is shared as `seo/resolve-page-seo.ts`. Criterion: `/404/` emits `href="/en/"` and `/en/404/` emits `href="/"`. |
| 404 page | Link markup | One `<ul class="m-0 flex flex-wrap gap-x-6 gap-y-3 list-none p-0">` of `bfs-arrow-link` items (`text-sm font-bold text-link hover:text-orange`). No `ButtonPrimary` — nothing on a 404 is a primary action. |
| 404 page | Layout values | Reuse the Socials hero geometry verbatim: `<section class="mx-auto max-w-6xl px-6 pt-16 pb-18">` with `bfs-section-head variant="page"`, H1 at `clamp(40px,5.5vw,60px)`, lead as `max-w-[560px] text-lg/relaxed text-pretty`, link list at `mt-8`. No image. |

### M4 — GitHub Data

| Issue | Question | Decision |
|---|---|---|
| Prebuild script | CI build command | The npm `prebuild` hook (`npm run fetch:github`) fires automatically before `npm run build`, so CI keeps running a single `npm run build …` step and never fetches twice. Do **not** append `&& npm run postbuild` anywhere — the `postbuild` hook fires automatically too. |
| Prebuild script | Live-data criteria | Assert shape, not values: `lehrgrapht.latestTag.name` and `mat.latestRelease.tagName` are non-empty strings, `flugwacht.latestRelease` is `null` or an object with `tagName` and `publishedAt`. Keep the concrete numbers only as a dated informational note. |
| Prebuild script | Retry | None. One `fetch` per URL; every non-2xx except the allowed `releases/latest` 404 throws immediately (SPEC §10 — failing loudly is the point). Note in the PR that the research's optional retry is deliberately omitted. |
| Typed accessor | README wording | If the README already covers the three facts, change nothing. Otherwise append one sentence pair to the commands section: the JSON is a committed snapshot so `ng serve` and offline builds work tokenless; CI regenerates it before every build and never commits it back; the nightly deploy caps staleness at 24 h. |
| Repository cards | Card copy is translatable | The three card titles are product names and stay unmarked literals; the three descriptions **are** `$localize` strings (see *Copy*). Fix `home.md` §11.4 in the same PR: add the rows, delete the "not translatable" sentence, and correct the M7 bullet — only version, pushed date and language come from the API. |
| Repository cards | Card order | Fixed authored order LehrGrapht → MAT → Flugwacht, as three authored `<bfs-repository-card>` elements in `repository-cards.html` — never a sorted `@for` over `pushedAt`. |
| Repository cards | Footer message boundary | One message spanning the whole footer so English can reorder it: `<span i18n="@@home.github.card.updated">{{ versionLabel() }} · aktualisiert <time [attr.datetime]="updatedAt()" data-lastmod-ignore>{{ relativeLabel() }}</time></span>`. Update the `home.md` §11.4 row to that full source string. |
| Repository cards | Relative time | `private readonly locale = inject(LOCALE_ID);` (compile-time constant, not a service — the presentational rule stands), `new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' })`. Whole UTC calendar days via `Date.UTC(...)` differences, clamped with `Math.min(0, …)` so clock skew reads `heute`. Always the `'day'` unit, no escalation. "now" is `new Date()` read inside the `computed()`. |
| Repository cards | Milestone dependency | This issue is blocked by M2's theme tokens, UI primitives and component inventory (it consumes wiped-palette classes and `bfs-card`). The prebuild script and the typed accessor stay M1-only, so M4 can still start in parallel. |
| Repository cards | `bfs-card` gaps | Extend the primitive here and record it: add `hasFooter = input(false)` rendering `@if (hasFooter()) { <div class="border-t border-neutral-200 bg-neutral-100 px-6 py-3 text-xs text-neutral-600"><ng-content select="[card-footer]" /></div> }`, wrap the eyebrow in `@if (eyebrow())` so a null value emits no element, and add `headingLevel` defaulting to `3`. |
| Repository cards | Eyebrow content | Render GitHub's single primary `language` verbatim, never composed, never translated (LehrGrapht and MAT both reading `TypeScript` is correct). No second API call. Add a note under `home.md` §5.4 that the composed eyebrows there are design placeholders. |
| Repository cards | In-development badge id | Exactly one spelling repo-wide: source `In Entwicklung`, id `@@common.badge.in-development`, no meaning and no description on any occurrence. In the repository card it is a plain `$localize` string in the version slot, not a `bfs-badge`. The id in the SPEC §7 snippet is illustrative and must not be copied. |
| Repository cards | Grid breakpoint criterion | State it on content width, which the component owns: 3 columns ≥888px, 2 at 584–887px, 1 below. Mount the harness as `<div class="mx-auto max-w-6xl px-6"><bfs-repository-cards /></div>`, which reproduces the §5.3 viewport thresholds (1200→3, 800→2, 500→1). |

### M5 — Pages

| Issue | Question | Decision |
|---|---|---|
| All four pages | Verification while `/en/` is red | German only: `npm run lint`, `npm run preview:de`, open `http://localhost:4300/<route>/`. Drop `npm run build`, `npm run preview` and every `/en/` URL from all four issues — `/en/` verification belongs to M7. Keep `npm run i18n:extract` and the numeric-id grep. Never touch `i18nMissingTranslation`. |
| All four pages | Component reuse | Fill in the stub component M3 created for the route — no second route entry, no second component file. Compose M2 primitives only (`bfs-section-head`, `bfs-project-card`, `bfs-feature-card`, `bfs-link-card`, `bfs-card`, `bfs-badge`, `bfs-kicker`, `bfs-arrow-link`, `bfs-pill-link`, `bfs-button-primary`, `bfs-repository-cards`). Criterion per page: no card, badge, pill, heading-row or button markup is re-implemented in the page template; any gap is fixed in the primitive. |
| All four pages | Viewport criterion | `tools/check-viewports.mjs` (Playwright chromium) against the served German build, exposed as `npm run check:viewports`: for 320/768/1152/1440 assert `document.scrollingElement.scrollWidth <= window.innerWidth` and that the computed `grid-template-columns` track count matches the documented column count. The focus criterion becomes a grep for the `focus-ring` utility on every interactive element. |
| Home / Apps & Games | Wordmark and icon `alt` | Settled while building #26: `images/flugwacht-wordmark.svg` and `images/mat-dark.svg` are **decorative**, `alt=""`. The card's own heading names the product directly below the image, so a non-empty alt makes the card announce its name twice — the same rule already applied to the fox head. Retires `home.projects.flugwacht.image-alt`, `home.projects.mat.image-alt`, `apps-and-games.apps.flugwacht.wordmark-alt` and `apps-and-games.apps.mat.icon-alt`. The attribute is written out, never omitted (C14). |
| Home | External links open in a new tab | Settled while building #26: `bfs-arrow-link` and `bfs-pill-link` get `newTab = input(false)`, and the home page sets it on the five pills and the four card links, per `docs/design/home.md` §4.1. It is opt-in per usage, not a component default, because `docs/design/imprint.md` §5 and `docs/design/privacy.md` §7 ask for the opposite on the legal pages — those keep same-tab in M6. Criterion: every external `<a>` in `dist/website/browser/index.html` carries `target="_blank" rel="noopener noreferrer"`, and no internal `routerLink` does. |
| M5 pages | `tools/check-viewports.mjs` | Landed with #26, the first page issue. Serves `dist/website/browser` from a local `node:http` server, drives chromium at 320/768/1152/1440 and asserts, per route, `scrollWidth <= innerWidth` plus the documented `grid-template-columns` track count per named grid, then that every `main a`/`main button` carries `focus-ring`. A route that is not prerendered yet is reported as `SKIP`; a named grid missing from a route that *does* exist is a failure, never a silent skip. Each further page issue appends its grids to the `GRIDS` table. |
| Home | Heading outline | `h1` Apps & Spiele → 4× `h2` (project-card titles) → `h2` Unterstütze uns → `h2` Zuletzt auf GitHub → 3× `h3` (repository cards). The decorative graph-paper wordmark is `aria-hidden="true"`. |
| Home / Apps & Games | Asset references | Relative paths into `public/images/`: `images/flugwacht-wordmark.svg`, `images/mat-dark.svg`, and the crops through `<picture>` — card 4 on `/` uses `bug-a-ball-card-840x420.*` with `loading="lazy"` and `object-cover`; the Apps & Games feature column uses `bug-a-ball-feature-1200x600.*` with `loading="eager" fetchpriority="high"` inside `relative min-h-[240px] bg-neutral-100`. |
| Apps & Games | Feature-card stacking threshold | Corrected while building #27: the two columns separate at viewport **690px**, not the 688px in `docs/design/apps-and-games.md` §3.3b. The card's own 1px borders sit inside the content width, so `auto-fit` needs `viewport − 48 − 2 ≥ 640`. Measured in chromium: 690 → 2 columns, 689 → 1. |
| Apps & Games | Feature-card track count | `repeat(auto-fit,minmax(min(320px,100%),1fr))` fits **three** 320px tracks into the 1104px content width, and the computed `grid-template-columns` reports `551px 551px 0px`. The third track is collapsed because only two children exist, so the rendered result is the design's two 551px columns. `tools/check-viewports.mjs` therefore counts tracks with a width greater than zero, never the raw list length. |
| M5 pages | Font-swap layout shift | Recorded while building #27, not fixed here: on `/` and `/apps-and-games/` the only layout-shift sources are badges and arrow links moving horizontally when the real Bebas/Barlow replace the fallback (total 2e-5 and 1e-4, both roughly a thousand times below the 0.1 "good" threshold). No image contributes — the key art with explicit `width`/`height` shifts nothing. Tuning the fallback metric overrides belongs to the M8 performance gate (#45). |
| Apps & Games | LehrGrapht wordmark | Decorative, not translatable: `<span aria-hidden="true" translate="no" class="font-display text-[38px] tracking-wide text-neutral-900">LehrGrapht</span>`. Criterion: the card announces its name exactly once. |
| Support | German in the typed arrays | Recorded while building #28: `freeWays` / `financialWays` carry their German through `$localize` tagged templates in `support.ts`, not through template markers. The _Card component_ row above prescribes the typed `SupportWay[]` and the issue forbids five duplicated template blocks, which together leave no template to mark; the same shape already ships in `app.routes.ts` for the `seo.*` ids. Every string keeps its explicit `@@id` and extracts identically. The alternative — five authored `<bfs-link-card>` blocks — is what _Conventions › i18n_ describes, and is deliberately not taken here. |
| Support | Card component | `bfs-link-card` with `tone="light"` (24px padding, 12px gap, `#e5e5e5` → `#ffc107` border on hover, `hover:text-neutral-700`), projecting chip, `h3`, description and CTA. Chip glyph: `bfs-brand-icon` at 24px `text-neutral-900` (free section) and 22px `text-yellow` on the `bg-neutral-900` chip (financial section). Data typed as `readonly SupportWay[]` with `{ id, href, icon, titleText, description, ctaLabel, ariaLabel }`. |
| Socials | One source for the three channel URLs | Added while building #29. `social-links.ts` gains `socialLink(id)`, which returns the entry or throws during prerendering, and the home pills, the home _Alle Repositories_ link and the three free Support cards now read their `href` through it instead of inlining the URL. Without that, `grep -r 'discord.gg' projects/website/src` returned three files and the M8 criterion (_robots + JSON-LD › Catalog files_) could not hold. Ko-fi and Patreon stay literals — they are funding destinations, not social channels, and deliberately absent from `SOCIAL_LINKS`. Criterion unchanged: exactly one file matches `discord.gg`, `youtube.com/c/boundfox` and the bare organisation URL; the per-repository GitHub URLs are separate destinations and stay on their pages. |
| Socials | Tile component and heading | Same `bfs-link-card` with `tone="dark"` (`bg-neutral-900`, `border-neutral-600`, `p-8`, `gap-3.5`, `hover:border-amber`, `surface-dark`), projecting the 32px `text-yellow` icon, heading, description, handle and CTA. The tile name is an `<h2>` (`font-display text-[28px] leading-none tracking-wide text-white m-0`), so the page outline is `h1` → 3× `h2`; the accessible name still comes from the `aria-label` on the `<a>`. Data typed as `readonly SocialChannel[]`. Criterion: Socials tiles and Support cards are the same component, differing only by `tone`. |
| Socials | Handle font | `font-mono` (the `--font-mono: monospace` token from M2), classes `font-mono text-xs leading-[normal] text-neutral-400`. The same token serves the MAT `<span>cat</span>`. |

### M6 — Legal & Content

| Issue | Question | Decision |
|---|---|---|
| Legal layout | Base layer | Already written in M2. Do not re-add it; add the criterion that the mailto link computes to `rgb(161 98 7)` with no `text-decoration` and turns `#ffa726` on hover after 150ms. |
| Legal layout | Vertical rhythm of the new elements | Settled while building #30, matching the _Privacy › Rhythm of the new elements_ row so both pages share one scale: `h1` `m-0 font-display text-[clamp(40px,5.5vw,60px)] leading-none font-normal tracking-wide text-neutral-900`; `h2` `mt-10 mb-3` (first) / `mt-8 mb-3` (rest) at `text-2xl`; `h3` one step down at `mt-6 mb-2 … text-lg`; paragraphs `m-0 text-base leading-relaxed`, and a **consecutive** paragraph inside one section takes `mt-4`. Measured on the shipped imprint at 1280px: H1 → 40 → H2 → 12 → P → 32 → H2 → 12 → P → 16 → P → 32 → H2 → 24 → H3 → 8 → P, no collapsed margins. |
| Legal layout | Text gate scope | `tools/verify-legal-text.mjs` (`npm run verify:legal`, landed with #30) compares the whitespace-normalised text of the `bfs-legal-page` prose wrapper against the `.final` source, per route and per locale. The imprint comparison **drops the `<h1>`** first: `Impressum` is page furniture with a real English target and is not part of `imprint.final.md`. The privacy `<h1>` is the supplied text's own heading and stays in the comparison. A route whose page does not use the legal layout yet reports `SKIP` and is counted in the summary line — never a silent pass. |
| Legal layout | Component shape | One component only, no `LegalSection`: `projects/website/src/app/ui/legal-page/legal-page.ts`, selector `bfs-legal-page`, OnPush, one input `proseLang = input<string \| null>(null)`, template `<section class="mx-auto max-w-[760px] px-6 pt-16 pb-18"><ng-content select="[legalNotice]" /><div [attr.lang]="proseLang()"><ng-content /></div></section>`. No `max-w-legal` token (M2's arbitrary-value rule). Headings and paragraphs stay literal utility strings in the two page templates. Add one row to `docs/components.md`. |
| Imprint | Structure and marking | The page renders `docs/legal/imprint.final.md`: three `<h2>` — `Angaben gemäß § 5 DDG`, `Kontaktdaten`, `Haftungsausschluss` — three `<h3>` under the last one (`Verantwortlichkeit für Inhalte`, `Haftung für Links`, `Urheberrecht`), and the VAT sentence as a headingless paragraph between `Kontaktdaten` and `Haftungsausschluss`. No message chunking: `imprint.title` is the only marked string on the page (*Conventions › i18n*). The design's §4 key table (`imprint.company.*`, `imprint.contact.*`, `imprint.vat.*`, `imprint.content-liability.*`, `imprint.link-liability.*`, `imprint.copyright.*`) is retired in full — its headings are the designer's placeholders and differ from the supplied ones. |
| Imprint | Trailing-space labels | Author the label runs as `E-Mail:&nbsp;` / `Internetadresse:&nbsp;` — Angular's whitespace removal deletes a real trailing space before the link. That is the whole reason now; the prose is unmarked, so there is no XLIFF round trip to survive. |
| Imprint | Header "legal" state | `bfs-site-header` has no `active` input (M3 dropped it deliberately). Criterion becomes: on both legal routes no nav link carries `text-yellow`, `border-yellow` or `aria-current="page"`. **Corrected while building #30:** the grep is `grep -c 'aria-current="page"'`, not a bare `aria-current` — the header and footer language switchers each emit `aria-current="true"` on the current locale (#17, #19), so the bare form returns 2 on every page and can never be 0. Asserted per nav link instead: none of the four carries `text-yellow` or `border-yellow` in its rendered `class`. |
| Imprint | "final wording" gate | `docs/legal/imprint.final.md` **is** the final wording — not `docs/design/imprint.md` §4, which is the designer's placeholder and differs in wording and headings. Criterion: the rendered copy is byte-identical to the source file, including the spaced „§ 5" and „§ 27 a", asserted by `tools/verify-legal-text.mjs` (see *Privacy › Text gate*). Two citations were updated on Manu's instruction and are **decided, not flagged**: `§ 5 TMG` → `§ 5 DDG` (straight substitution — same section, same substance since 14 May 2024), and `§§ 8 bis 10 TMG` **dropped entirely** rather than renumbered. The DDG did not inherit those provisions — Durchleitung, Caching and Hosting are Art. 4–6 DSA now, and DDG §§ 8–10 cover unrelated subject matter, so `§§ 8 bis 10 DDG` would be a wrong citation. `docs/legal/imprint.final.md` carries the reasoning; do not "complete" the liability sentence by adding a section reference. Manu's address/VAT confirmation is no longer a gate at all: the file is his. |
| Both legal pages | Folder names | Folders are named after the page, not the URL: rename M3's stubs to `pages/imprint/` (`imprint.ts`, class `Imprint`, selector `bfs-imprint`) and `pages/privacy-policy/` (`PrivacyPolicy`, `bfs-privacy-policy`); update `loadComponent` paths in the same commit. Route paths are unchanged. |
| Both legal pages | Verification | `npm run lint`; `npm run verify:legal`; `npm run preview:de` for the German page; `npm run preview:draft` when the `/en/` rendering has to be seen before M7. The unconditional both-locale green build is asserted in M7. |
| Both legal pages | Handoff comparison | Reword to "if `design_handoff_website_redesign/` is present locally, compare side by side; otherwise `docs/design/imprint.md` §3 is authoritative", and name the numbers to measure at 1280/768/375px: section width capped at 760px, padding 64/24/72px, H1 60px → 40px, H1→H2 40px, H2→P 12px, P→next H2 32px, body line-height 26px, all headings computed weight 400. On the privacy page the intro paragraphs sit between H1 and the first H2, so measure H1→P 24px and P→first H2 40px there; the comparison is layout only, never copy. |
| Legal layout | H1 hyphenation | Added while building #31. Both legal H1s carry `hyphens-auto break-words`. `Datenschutzerklärung` is 20 characters and measures 396px at the 40px clamp floor, wider than the 327px available at a 375px viewport, so the page overflowed horizontally — no element box was too wide, the text was. `hyphens-auto` lets Chromium break the compound at a soft hyphen (the wrapper is `lang="de"` on `/en/` and the document is German on `/`); `break-words` is the guarantee for a UA without German hyphenation patterns. Criterion: `document.scrollingElement.scrollWidth === innerWidth` at 375px **and** 320px on both legal routes. |
| Legal layout | Furniture inside the wrapper | `tools/verify-legal-text.mjs` strips every element carrying `data-legal-not-in-source` before comparing. Exactly two elements have it: the imprint's `Impressum` H1 and the privacy "Stand" line, both rendered inside the wrapper without being part of the supplied wording. The privacy H1 is deliberately **not** marked — `Datenschutzerklärung` is the supplied text's own first heading. Marking it in the template rather than matching on text keeps the gate working once M7 lands the English targets. |
| Privacy | Generator-credit links | The two links in the closing paragraph ship as supplied, and get `rel="noopener"` like every other prose link on the two legal pages — same tab, per `docs/design/privacy.md` §7. They arrive from the source file with no attributes, so this is a markup addition, not a wording change. |
| Privacy | Responsible-party block | §2's six lines render as **one** paragraph with `<br />`, not six `<p>`. Six paragraphs would each take the `mt-4` consecutive-paragraph gap and spread the address over 16px steps; the source splits them only because the generator did. Both forms normalise to the same text, so the gate is indifferent. |
| Privacy | Lettered sub-sections | The two outer `<ul style="list-style: none">` wrappers in §1 and §5 are dropped entirely and each `<li><h4>` becomes an `h3` + paragraphs, with the letter kept in the heading text (`a) personenbezogene Daten`, one space after the parenthesis — the source's run of spaces is collapsing whitespace). The three inner lists in §5 b), d) and e) are real content and render as `<ul class="mt-4 mb-0 list-disc pl-6 …">`, overriding the generator's `list-style: none`. Criterion: exactly three `<ul>` inside the prose, of 8, 6 and 4 items. |
| Privacy | Page structure | The content is `docs/legal/privacy-policy.final.html`, verbatim: H1 `Datenschutzerklärung`, three intro paragraphs, then ten numbered sections as `<h2>`. The generator's flat `<h4>` levels are markup, not meaning — the eleven lettered definitions in §1 and the nine lettered rights in §5 become `<h3>`, so the outline is h1 → 10× h2 → 20× h3. The two outer `<ul style="list-style: none">` wrappers carry no list semantics (they only hold the lettered blocks) and are dropped; the three real enumerations inside §5 b), d) and e) stay `<ul>`. Letter prefixes keep their letter with the generator's run of spaces collapsed to one (`a) personenbezogene Daten`). §6 and §9 hold two resp. three paragraphs inside a single `<p>`, separated by bare newlines — split them into real `<p>` elements; that is markup, not wording. The closing generator-attribution paragraph and its two external links ship with the text. `docs/design/privacy.md` supplies the **layout only**; its §4 copy table is dead. |
| Privacy | Text gate | `tools/verify-legal-text.mjs` (exposed as `npm run verify:legal`; from M8 on it runs in the CI `build` job next to `verify:dist`) compares the whitespace-normalised text content of the prose wrapper in `privacy-policy/index.html` and `legal-details-imprint/index.html` against `docs/legal/privacy-policy.final.html` and `docs/legal/imprint.final.md`, in both locales — four comparisons, all four must be identical. That replaces every hand-counted copy criterion on these two pages: a dropped sentence, a smart-quote mangled by an editor or an accidental `/en/` divergence all fail loudly. |
| Privacy | Rhythm of the new elements | The design only ever styled H1, one H2 level and a lone paragraph. Extending it: consecutive paragraphs get `mt-4` (16px, `--space-4`), the first paragraph after the H1 `mt-6`; H2 keeps `mt-10 mb-3` (first) / `mt-8 mb-3` (rest) at `font-display text-2xl leading-none tracking-wide text-neutral-900`; H3 is the same treatment one step down, `mt-6 mb-2 … text-lg`; enumerations are `mt-4 list-disc space-y-1 pl-6` with body-scale items. Criterion: H1 → first paragraph 24px, H2 → H2 rhythm unchanged from `docs/design/privacy.md` §3.1, and no heading below H2 uses a font size not in that list. |
| Privacy | Draft badge | Not built at all — the supplied text is final, not a draft. Drop the `privacy.draft-badge` unit and the `bfs-badge` usage, give the H1 `m-0`. Criterion: no badge and no `privacy.draft-badge` id exist. Record the intentional delta to `Datenschutz.dc.html` in the PR. |
| Privacy | "Stand" line | `projects/website/src/app/pages/privacy-policy/privacy-last-updated.ts` exporting `PRIVACY_LAST_UPDATED = '2026-08-17'` — the day the text was supplied. It moves only when the text itself changes, never on a merge date. Template: `<p class="mt-8 text-sm text-neutral-600" i18n="@@privacy.last-updated">Stand: {{ lastUpdated \| date: 'MMMM y' : 'UTC' }}</p>`. The explicit `'UTC'` argument is mandatory — without it the month flips in negative-offset build environments. |
| Privacy | Byte-exact greps | Both old greps are deleted: the supplied text writes `z.B.` without a space and contains no `15–21`. Outside the umlauts its only non-ASCII characters are six em dashes (U+2014) and one `„…“` pair, so the surviving spot check is `grep -c '„betroffene Person“'` = 1 plus zero U+00A0 anywhere on the page. Never re-author `z.B.` as `z.&nbsp;B.` — the wording ships as supplied. The real gate is `npm run verify:legal` in the *Text gate* row. |
| Privacy | Cookie criterion | Split: in M6 assert `npm run build && grep -RIl 'Set-Cookie\|document.cookie' dist/ \|\| echo clean` and the recorded Cloudflare zone settings. The live `curl -sI https://boundfoxstudios.com/ \| grep -i set-cookie` check moves to the M10 post-launch pass (the hostname still serves WordPress during M6). |
| Privacy reconciliation | What is left of the issue | **It no longer touches the public text.** Manu's wording ships verbatim, so nothing is amended, no provider slot is filled, and neither Cloudflare nor the hoster is named on the page — that was the explicit instruction, and `docs/legal/README.md` records it. Measurement stays pre-decided as **none — no beacon, nothing collected in the page** (SPEC D11), which is a statement about the site, not about the policy. Only a future beacon reopens the published text; a new processor alone changes the internal record below. |
| Privacy reconciliation | Processor record | The agent commits `docs/privacy-processors.md` pre-filled: a table (Auftragsverarbeiter, Zweck, Datenkategorien, AV-Vertrag, Akzeptiert am) with the Cloudflare row complete except the date (`https://www.cloudflare.com/cloudflare-customer-dpa/`) and the hoster row awaiting name, link and date, plus a section "Cloudflare-Zone-Einstellungen (Stand YYYY-MM-DD): Bot Fight Mode aus · Managed Challenge nicht verwendet · Web Analytics aus". The file is internal documentation only — nothing in it is published, and no cell in it can change a rendered page. |
| Privacy reconciliation | Definition of done | No sign-off round: Manu supplied the text, so there is nothing to post for confirmation. The issue closes when `docs/privacy-processors.md` is committed (hoster cells named as open, not invented) and the SPEC §12 bullet is ticked. `PRIVACY_LAST_UPDATED` stays at the supply date. |
| Legal pages in English | The decision itself | **Option B**, recorded as SPEC §12 **D10**: German text under `/en/` plus one English notice; only the German version is legally binding. Delete the "Legal pages in English" bullet from "Still open". Canonical and the three hreflang links stay exactly as the `SeoService` emits them. |
| Legal pages in English | Notice DOM | `@if (!isGermanLocale) { <p legalNotice class="m-0 mb-6 text-sm text-neutral-600" i18n="@@legal.german-only-notice">…</p> }` — projected into the `legalNotice` slot, which sits **outside** the `lang`-marked wrapper. Both page components carry `private readonly localeId = inject(LOCALE_ID); protected readonly isGermanLocale = this.localeId.startsWith('de');` and bind `[proseLang]="isGermanLocale ? null : 'de'"`. |
| Legal pages in English | Page furniture vs prose | Only furniture is marked at all, so **every** legal unit gets a real English target: `privacy.title`, `imprint.title`, `privacy.last-updated`, `legal.german-only-notice` and the two `seo.*` pairs. `messages.en.xlf` never contains a byte-identical copy of German prose — the prose is unmarked and renders the same under `/en/` by construction (*Conventions › i18n*). The H1 and the "Stand" line are the only English elements that sit *inside* the `lang="de"` wrapper, so both carry `lang="en"` on their own element; the notice needs none, it is already outside. |
| Legal pages in English | The four English targets | Authored while building #33, with Manu: `imprint.title` → **Legal notice** (not *Imprint*, which reads to native speakers as a publisher's imprint), `privacy.title` → **Privacy Policy**, `privacy.last-updated` → **Last updated: {INTERPOLATION}**, `legal.german-only-notice` → **This page is available in German only. Only the German version is legally binding.** These four are the whole English surface of both legal pages; everything else under `/en/` is the German prose by construction. |
| Legal pages in English | Verification | `npx ng build --configuration en --i18n-missing-translation=warning 2>&1 \| grep 'No translation found' \| grep -E 'imprint\.\|privacy\.\|legal\.'` must print nothing, and each `/en/` legal page must contain the notice exactly once plus a `lang="de"` wrapper. |

### M7 — English Locale

| Issue | Question | Decision |
|---|---|---|
| All translation issues | Verification while units are missing | `npx ng build --i18n-missing-translation=warning 2>&1 \| tee /tmp/i18n.log`, then grep the log for the id prefixes this issue owns (must be empty), then `npm run preview:draft`. In error mode the builder writes **no** output at all, so there would be nothing to open. The plain `npm run build` is asserted only by the last translation issue. |
| Extraction | `messages.en.xlf` shape | Overwrite M3's placeholder. XML declaration + `<xliff … srcLang="de" trgLang="en"><file id="ngi18n" original="ng.template">`, one `<unit id="…"><segment><source>…</source><target>…</target></segment></unit>` per unit, `<notes>` dropped (location notes turn every line move into a translation-file conflict), unit order byte-identical to `messages.xlf`. |
| All translation issues | Coverage criterion | Drop every string count. Coverage is id-prefix based: every unit in `messages.xlf` whose id starts with the prefixes this issue owns has a non-empty `<target>`, proven by the absence of `No translation found` lines for that prefix. |
| Shell | Language labels | Endonyms in both locales: `footer.language.de` = `Deutsch`, `footer.language.en` = `English`, target equals source, alongside `DE`/`EN`, `BOUNDFOX`, `STUDIOS`. |
| Home / Apps & Games | Relative-time label | Already handled by M4's `inject(LOCALE_ID)` formatter. Translate `home.github.card.updated`, and add the tripwire `grep -n 'vor \|gestern\|heute' dist/website/browser/en/index.html` (must print nothing). |
| Home / Apps & Games | "no German text" criterion | Two mechanical checks: (1) `grep -nP '[äöüßÄÖÜ]'` over the two English files prints nothing; (2) a ten-line node script asserts that for every unit whose target differs from its source, the source string does not occur in the English HTML. Reuse it later in `tools/verify-translations.mjs`. |
| Support / Socials | `Danke!` | Target `Thanks!`. Criterion becomes checkable: the target contains no space and is at most 10 characters, so at 44px Tahu it cannot wrap in the 620px lead column. |
| SEO metadata | Source copy | The German source does not exist in the handoff either — it is authored in *Copy* below and translated in the same PR. Titles ≤60 characters, descriptions ≤155, asserted by the same grep. |
| Translation sync | Tooling | Adopt `ng-extract-i18n-merge` (devDependency, so SPEC §10's runtime rule does not apply), recorded as SPEC §12 **D12**. Replace the `extract-i18n` target with builder `ng-extract-i18n-merge:ng-extract-i18n-merge`, options `buildTarget: website:build:development`, `format: xlf2`, `outputPath: projects/website/src/locale`, `sourceFile: messages.xlf`, `targetFiles: ["messages.en.xlf"]`, `newTranslationTargetsBlank: "omit"`, `sort: "stableAppendNew"`, `includeContext: false`. `newTranslationTargetsBlank: "omit"` is load-bearing: the default copies the German source into the new target and would ship German into `/en/` with a green build. |
| Translation sync | The check itself | `"i18n:check": "ng extract-i18n && git diff --exit-code -- projects/website/src/locale && node tools/verify-translations.mjs"`, run as a step of the existing `build` job before the build. `verify-translations.mjs` asserts that no `<segment state="initial">` survives (the stale-after-source-change case) and that every unit has a non-empty `<target>`. Restated criteria: forgotten extraction or orphaned unit → dirty tree; changed German source → `state="initial"`; deleted `<target>` → red build via `i18nMissingTranslation: "error"`. |
| Translation sync | Documentation | A `## Translations` section in `README.md`: mark with an explicit `@@id` → `npm run i18n:extract` → fill the empty `<target>` → commit both files. Include both gotchas: editing a German plural/select renames its generated ICU sub-message id (old unit removed, new one must be refilled), and `/en/` plus the switcher are only visible via `npm run preview`, never `ng serve`. |

### M8 — SEO & Generation

| Issue | Question | Decision |
|---|---|---|
| Sitemap | Testability | Split: `tools/seo/sitemap.lib.mjs` exports `contentFingerprint(html)`, `extractPage(html, filePath)`, `resolveLastmod(key, hash, previousDatabase, today)` and `buildSitemapXml(pages)`; `tools/seo/generate-sitemap.mjs` is a thin CLI. Tests live in `tools/seo/sitemap.lib.spec.mjs` and run through the tools Vitest config (*Conventions*). |
| Sitemap | Daily churning `lastmod` | The relative-time label is marked `data-lastmod-ignore` on its `<time>` (M4) and stripped in `contentFingerprint` with `.replace(/<time[^>]*data-lastmod-ignore[^>]*>[\s\S]*?<\/time>/gi, '')`. The version tag stays inside the fingerprint — a release is a real content change. Criterion: a rebuild with unchanged `github-data.json` but a later system date leaves `tools/seo/lastmod.json` byte-identical (`resolveLastmod` takes `today` as a parameter). |
| Sitemap | Who writes `lastmod.json` in CI | Only `deploy.yml`, after the build: `git diff --quiet tools/seo/lastmod.json \|\| (git commit -am "chore: update lastmod database [skip ci]" && git push)` with `permissions: contents: write` on that job. No other workflow writes it. |
| Sitemap | Alternates count | `const EXPECTED_ALTERNATES = 3;` in `tools/seo/sitemap.lib.mjs` with the comment that it mirrors `LOCALES.length + 1` and that `site.config.ts` is TypeScript and cannot be imported from an `.mjs` script. `tools/verify-dist.mjs` uses the identical constant. |
| Sitemap | Milestone precondition | All seven routes must be registered in `app.routes.ts` with `data.seo` before M8 is verified (page components may still be stubs — the URL count depends on the route table). Every `$localize` string M8 introduces ships with its English unit in the same PR. |
| Finalize dist | `ROOT_ONLY` list | `['robots.txt', 'favicon.ico', 'icon.svg', 'apple-touch-icon.png', 'icons', 'og', '.well-known']` — `og/` was missing and would ship a duplicate nothing references. Tighten the criterion to the positive form: `dist/website/browser/en/` contains only `index.html`, the six route directories, `404/` and `manifest.webmanifest`, asserted in `verify-dist`. |
| Finalize dist | `security.txt` | `Contact: mailto:info@boundfoxstudios.com`, second `Contact:` line pointing at `https://github.com/BoundfoxStudios/boundfoxstudios.com/security/advisories/new`, `Expires:` = build time + 1 year (ISO 8601, seconds, `Z`), `Preferred-Languages: de, en`, `Canonical: https://boundfoxstudios.com/.well-known/security.txt`. No `security@` alias is invented — an unroutable contact is worse than no file. |
| robots + JSON-LD | Catalog files | Created here, consumed by M5's pages — see *Conventions › Shared data*. Criterion: `grep -r 'discord.gg' projects/website/src` returns exactly one hit. |
| robots + JSON-LD | Per-app fields | `@id` = `${SITE.origin}/apps-and-games/#<slug>`; all four are free, so each carries `offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }`. `lehrgrapht`: `SoftwareApplication`, `EducationalApplication`, `Windows, macOS, iPadOS`, url `https://lehrgrapht.de/`, codeRepository `.../lehrgrapht`. `mat`: `SoftwareApplication`, `DeveloperApplication`, `macOS, Linux, Windows`, url = codeRepository = `.../mat`. `flugwacht`: `SoftwareApplication`, `TravelApplication`, `iOS, Android`, url = codeRepository = `.../flugwacht`. `bug-a-ball`: `VideoGame`, `GameApplication`, `iOS, Android`, url `https://bugaball.com/`, no codeRepository. |
| robots + JSON-LD | MAT rich-text description | Add a plain-text sibling id used only by the catalog and the JSON-LD (see *Copy*); the template keeps the marked-up variant with the `<span class="font-mono">cat</span>` placeholder. |
| robots + JSON-LD | schema.org validation | Replace the manual validator step with machine checks in `verify-dist`: every `application/ld+json` block parses, `@context === 'https://schema.org'`, exactly one `Organization` and one `WebSite` per page, and on the two apps pages an `ItemList` of 4 items each carrying `name`, `description`, `url`, `applicationCategory`, `operatingSystem`, `author['@id']` and `offers.price`. The validator.schema.org run is a one-off PR note. |
| Icons + OG | Source of truth | `projects/website/branding/icon.png` (the 600×600 fox head — the largest output is 512, so nothing is upscaled). Drop the `icon.svg` output and its `<link rel="icon" type="image/svg+xml">`, exactly as the research prescribes for the SVG-less case, but keep the `SOURCE_SVG` branch in `generate-icons.mjs` so a future vector drops in with no code change. |
| Icons + OG | `og/default.png` composition | 1200×630 canvas filled `#171717`, `projects/website/branding/og-logo.png` contained at 760px width, centred. No text, no gradient, no per-page variants (`PageSeo.image` covers that later). Generated by the same run and committed. |
| Icons + OG | "no colour outside the token set" | Restate as a check on chosen values, not rendered pixels: the generator's only colour constant is `const BACKGROUND = '#171717';`, and `#171717` is the only hex literal in the `index.html` head block and both `manifest.webmanifest` files. Enforce with a regex in `verify-dist`: any `#[0-9a-f]{6}` that is not `#171717` fails, naming the file. |
| verify-dist | Prerender proof | Assert all three on every prerendered page (14, not just the two home pages): the root tag matches `/<bfs-root[^>]*\sng-server-context="ssg"/`; the markup between `<bfs-root…>` and `</bfs-root>` is ≥500 characters; it contains `</footer>`. The negative test (removing `"server"` from `angular.json`) must fail the first assertion, with the file path in the message. |
| verify-dist | Failure behaviour | Run every assertion, always: one line per assertion (`ok` / `FAIL <name>: <path> — <reason>` / `skip <name>: <why>`), a summary line, then `process.exit(1)` if any failed. Delete the "exits on the first failure" wording. |
| verify-dist | `<loc>` count | Assert both: the count equals `EXPECTED_INDEXABLE_PAGES = 12` (named constant, comment "six routes × two locales; bump when a route is added to `app.routes.ts`") **and** equals the number of `index.html` files whose robots meta lacks `noindex`. |
| verify-dist | 404 exemption | Exempt strictly by path (`404/index.html`, `en/404/index.html`), and make it two-sided: those two must carry `noindex`, zero canonical and zero `rel="alternate"`; every other page must carry `index, follow`, exactly one canonical and exactly three hreflang links. A stray `noindex` on `/privacy-policy/` then fails loudly. |
| Gates | axe runner | `@axe-core/playwright` + Playwright chromium — jsdom cannot evaluate `color-contrast`, which is the whole point. `npm run axe` = `node tools/a11y/run-axe.mjs`: start `http-server` on `dist/website/browser`, walk all 14 prerendered pages, `withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'])`, print `url · rule id · selector` per violation, exit non-zero. |
| Gates | Kicker exception | The `Kicker` component renders `data-a11y-exception="kicker-contrast"` (documented in `docs/components.md`). Two passes per page: A over the whole page with `.disableRules(['color-contrast'])`, B with `.withRules(['color-contrast']).exclude('[data-a11y-exception="kicker-contrast"]')`; fail if the union is non-empty. Deleting the `.exclude(...)` then reproduces exactly one `color-contrast` violation per page. |
| Gates | Lighthouse config | `lighthouserc.cjs`: `collect` with `staticDistDir: 'dist/website/browser'`, explicit `url: ['http://localhost/', 'http://localhost/en/']` (with `staticDistDir` this disables autodiscovery, which otherwise caps at 5 pages), `numberOfRuns: 3`, `chromeFlags: '--no-sandbox'`; `assert` with performance ≥0.95, best-practices ≥0.95, seo = 1, `categories:accessibility: 'off'` (collected, never asserted — SPEC D2), `cumulative-layout-shift` max 0.05; `upload: { target: 'filesystem', outputDir: '.lighthouseci' }` — never `temporary-public-storage`. `npm run lighthouse` = `lhci autorun --config=lighthouserc.cjs`; add `.lighthouseci/` to `.gitignore`. |
| Gates | `docs/accessibility.md` | English, with computed values: `#ffa726` on `#ffffff` = **1.94:1** (L_fg 0.4899, L_bg 1.0); required 4.5:1 at 12px/700; the large-text exemption starts at 18.66px bold, so no size change inside this design reaches AA. Record element, rule id `color-contrast`, excluded selector `[data-a11y-exception="kicker-contrast"]`, reason (SPEC §10/§12 D2), scope (light surfaces only) and the review trigger (kicker moves to a dark surface, or the palette changes). Criterion: the selector in the file and in the axe script are identical. |
| Gates | Jobs or steps | Two **steps** appended to the existing `build` job after `npm run verify:dist`, with `npx playwright install --with-deps chromium` inserted before the axe step. One `npm ci`, one build, one required check (`Build`). |

### M9 — Deploy & Migration

| Issue | Question | Decision |
|---|---|---|
| Apache config | HTML cache header | `<FilesMatch "\.(html\|webmanifest)$">Header set Cache-Control "no-cache"</FilesMatch>` — the literal string `no-cache`, matching SPEC §9 and the acceptance grep. |
| Apache config | mod_rewrite | The root file contains **no** `RewriteEngine` for HTTPS or host canonicalisation — Cloudflare's "Always Use HTTPS" and the www Redirect Rule own those, and a `%{HTTPS}` condition behind Cloudflare's TLS termination is a redirect loop. The generated legacy 301/410 rules are the only rewrite content. |
| Apache config | DirectoryIndex | `DirectoryIndex index.html index.php` (index.html first, so no Angular route can resolve to PHP). Without `index.php` the preserved `/press/` directory returns 403/404 after cutover. Add `curl -sI https://boundfoxstudios.com/press/` (expect 200) to the verification block. |
| Apache config | Who writes `.htaccess` | `tools/copy-deploy-files.mjs` is the single writer. It concatenates `deploy/htaccess-base.conf` + `deploy/redirects.htaccess` into `dist/website/browser/.htaccess`, and writes `dist/website/browser/en/.htaccess` = `ErrorDocument 404 /en/404/index.html` + the `/en/`-mirrored rules. Delete the `LOCALE_SUBPATHS` `.htaccess` loop from `tools/seo/finalize-dist.mjs` (criterion: `grep -r htaccess tools/seo/` returns nothing). It exits non-zero with `dist/website/browser/en missing — run a localized build` rather than creating the directory. |
| Apache config / deploy | Milestone order | M9 lands after M3, M4 and M8 are on `develop`; correct SPEC §13's "Depends on" for M9 to `M1, M3, M4, M8`. |
| Redirect map | Missing slugs | Do not enumerate what nobody wrote down. Prefix rows cover them: `/tag/` → `/`, `/category/` → `/`, `/author/` → `/` (301), plus regex rows `^/sitemap_index\.xml$` and `^/[a-z0-9_-]+-sitemap\.xml$` → `/sitemap.xml`. The three blog posts get exact rows: `/founding-boundfox-studios-coaching/`, `/founding-boundfox-studios-we-are-founded/`, `/founding-boundfox-studios-preparing-business-registration/`. Add `/author/manuel-rauber/` to the §4 legacy table. |
| Redirect map | CSV shape | Columns `path,match,status,target,targetScope` with `match ∈ {exact,prefix,regex}`. `exact` emits `^<path without its trailing slash>/?$`, `prefix` emits `^<path>` verbatim, `regex` emits the pattern as written. Header row required, LF endings, no quoting, no comments. Prefix rows: `/wp-content/`, `/wp-includes/`, `/wp-json/`, `/tag/`, `/category/`, `/author/`. |
| Redirect map | 410 scope | The whole `/wp-content/` prefix returns 410, uploads included (SPEC §4; the new site hosts no legacy media). Feeds are covered by the regex row `/feed/?$` so per-page feeds (`/games/feed/`) are caught too. Apache's default 410 body stays — it is a crawler-facing status, not a page. |
| Redirect map | Deterministic output | Line 1 `# Generated by tools/generate-redirects.mjs from deploy/legacy-urls.csv — do not edit`, line 2 blank, one rule per line in CSV order, each row's `/en/` mirror emitted immediately after its source rule, single spaces between fields, no trailing space on 410 rules, one terminating newline. Add `npm run generate:redirects && git diff --exit-code deploy/redirects.htaccess` to the CI lint job. |
| Deploy workflow | Action pin | `uses: SamKirkland/FTP-Deploy-Action@110f9186c050f71550953127052e77650219c287 # v4.4.0`. |
| Deploy workflow | Upload ordering | Two steps in the same job, same server-dir, different `state-name`. Assets pass: `exclude:` with `**/.git*`, `**/.git*/**`, `**/node_modules/**` (the action's defaults, which a custom list replaces), plus `**/*.html`, `**/.htaccess`, `**/*.xml`, `**/*.txt`. Documents pass: no `exclude`, `state-name: .ftp-deploy-sync-state.html.json`. v4.4.0 has no `include` input, so the second pass re-uploads the assets once on its first run — harmless, they are byte-identical. |
| Deploy workflow | First run must not deploy | Add `workflow_dispatch.inputs.dry-run` (boolean, default false) wired into both FTP steps as `dry-run: ${{ inputs.dry-run \|\| false }}`. M9's acceptance is a green dry-run that authenticates over FTPS, resolves `server-dir` and prints the planned file list. `deploy.yml` stays on `develop` until M10 merges it to `main`, so no trigger can fire early. |
| Cloudflare | `www` | Keep the record proxied and add a Redirect Rule: when `http.host eq "www.boundfoxstudios.com"`, static 301 to `concat("https://boundfoxstudios.com", http.request.uri)`, preserve query string. The edge answers, so stray links keep working and the origin certificate never needs a `www` SAN. Criterion: `curl -sI https://www.boundfoxstudios.com/support` → 301 to `https://boundfoxstudios.com/support`. |
| Cloudflare | Purge step | Last step of the same `deploy` job, `name: Purge Cloudflare cache`, no `continue-on-error` (a silently stale edge is worse than a red run): POST `…/zones/$CF_ZONE_ID/purge_cache` with `{"purge_everything":true}` and grep the response for `"success":true`. Purge-everything is correct for six pages; a prefix purge would miss the hashed bundles. |
| Cloudflare | Where decisions are recorded | Create `docs/infrastructure.md` (committed) with sections: DNS records, Cloudflare settings and their exact values, origin certificate type + expiry, Plesk vhost overrides, FTP account, secret **names** (never values), vanity domains, and the dated `www` decision. The acceptance criterion becomes "docs/infrastructure.md records the settings above". Pre-cutover the edge criteria are `curl -sI … \| grep cf-cache-status` → `DYNAMIC` plus a successful purge call. |
| bug-a-ball.com | Link host in the design docs | SPEC §11.3 overrides the design references: every href is `https://bugaball.com/`. Fix the four cells in `docs/design/home.md` (rows 247, 691) and `docs/design/apps-and-games.md` (rows 594, 646) in this issue's PR, each with the note "Host corrected per SPEC §11.3 — `bug-a-ball.com` serves an invalid certificate". Criterion: no occurrence of `bug-a-ball.com` outside `docs/infrastructure.md`. |
| bug-a-ball.com | Evidence and regression | Record issuer, SAN list, not-after date, auto-renew state and the redirect target in `docs/infrastructure.md`, and add `https://bug-a-ball.com/` to the weekly link-check job's extra URLs so an expired certificate surfaces as a failed weekly run. |

### M10 — Launch

| Issue | Question | Decision |
|---|---|---|
| Cutover | WordPress removal | `docs/runbooks/production-cutover.md` opens with a "Prerequisites (Manu)" section (backup, FTP account, PHP enabled). The agent writes the numbered steps, the removal command (`lftp -u … -e 'rm -rf wp-admin wp-includes wp-content; mrm wp-*.php xmlrpc.php .htaccess; bye'`), the verification block and a run-log table with empty cells Manu fills in. `/press/` and Plesk backups stay untouched — never `dangerous-clean-slate`. |
| Cutover | Upload ordering | Already covered by M9's two FTP steps; the runbook just names them ("assets step, then documents step") instead of describing an ordering the action cannot do by itself. |
| Cutover | Purge | Unconditional, not "if the Cloudflare purge lands" — see the M9 row. Verification after the purge: `curl -sI https://boundfoxstudios.com/ \| grep -i cf-cache-status` shows `MISS` on the first fetch. |
| Cutover | `/press/` | Both forms are checked: `curl -sI https://boundfoxstudios.com/press/` and `.../press/index.php`, expect 200. No legacy rule may match `^/press/` — the rules are anchored on `wp-`, `games/`, `shops/`, `tag/`, `category/`, `author/`, `feed/` and `*-sitemap.xml` only. |
| Search Console | Timing | Split by what is possible when: DNS TXT + verification in both tools can happen any time before cutover; sitemap submission is a numbered step **after** the post-launch pass is green (the URL does not exist before cutover), and the issue closes on "both tools list `https://boundfoxstudios.com/sitemap.xml` with 0 errors and a read date". Replace the coverage criterion with a URL-Inspection spot check on `https://boundfoxstudios.com/en/support/` plus a dated follow-up line (cutover + 14 days) in the runbook. |
| Search Console | Are the TXT values secrets? | No. A verification token only proves control of DNS that its holder already controls, and `dig +short TXT boundfoxstudios.com` exposes it anyway. Commit both values in full, with one line underneath: never in the repo go FTP credentials, the Cloudflare API token and any IndexNow key file. |
| Measurement | The decision itself | **No measurement is added.** No client-side script of any kind, recorded as SPEC §12 **D11**. Cloudflare's zone analytics exist as a byproduct of the CDN and are not part of the site; delete the "Measurement" bullet from "Still open" and fix the §1 cross-reference from "(see §11)" to "(see §12, D11)". Runbook line: traffic numbers come from Cloudflare → Analytics & Logs → Traffic; nothing is collected in the page, deliberately. No application, privacy-copy or translation change. |
| Measurement | Cookie criterion | Origin-response check in the post-launch pass: `curl -sI https://boundfoxstudios.com/ \| grep -i '^set-cookie'` prints nothing, same for `/en/` (verified empty against the live site). Build-side half: `grep -rn 'cloudflareinsights\|beacon.min.js' dist/website/browser \| wc -l` = 0. If a `__cf_bm` ever appears, the fix is Bot Fight Mode off — never a weakening of the cookie-free promise the home page and `seo.privacy-policy.description` make. |
| Link check | lychee config | Commit `lychee.toml`: browser `user_agent`, `max_retries = 3`, `retry_wait_time = 5`, `timeout = 20`, `max_concurrency = 8`, `accept = ["200..=299", "403", "429"]` (Ko-fi, Patreon and YouTube answer datacenter IPs with 403/429), `include_mail = false`, `exclude = ["^https://boundfoxstudios\\.com/"]` (own-origin URLs are asserted by `verify-dist` and would be red before cutover). Pass `--base-url dist/website/browser` and `token: ${{ secrets.GITHUB_TOKEN }}`. Relax the AC to "no *third-party* destination that is reachable may be excluded". |
| Link check | Does the gate fire? | Set `fail: true` explicitly and prove it once before merging: add a canary anchor `https://bugaball.com/__link-check-canary`, dispatch the workflow, confirm red, remove it, re-run green — both run URLs go into the PR description. |
| Link check | "count matches the copy" | Replace the count with a host assertion over `--format json --output lychee-report.json`: a follow-up step greps the report for `github.com`, `discord.gg`, `youtube.com`, `ko-fi.com`, `patreon.com`, `lehrgrapht.de`, `bugaball.com`, `dg-datenschutz.de`, `wbs.legal` and fails with `::error::<host> was never checked` if one is missing. Those nine are the complete external inventory of the copy — the last two are the generator-attribution links at the end of the supplied privacy text. |
| Link check | Schedule | `cron: '0 5 * * 1'` plus `workflow_dispatch`, with the comment: GitHub disables scheduled workflows after 60 days without repository activity; if no weekly run appears, re-enable it in the Actions tab. |
| Post-launch | Sampled legacy URLs | The fixed list (also the cutover issue's "ten sampled legacy URLs"): `/games/` → `/apps-and-games/`, `/spiele-programmieren-mit-unity-kurs-gratis/` → `/`, `/shops/` → `/support/`, `/founding-boundfox-studios-coaching/` → `/`, `/tag/founding/` → `/`, `/author/manuel-rauber/` → `/`, `/feed/` 410, `/wp-json/` 410, `/post_tag-sitemap.xml` → `/sitemap.xml`, `/en/games/` → `/en/apps-and-games/`, `/en/2d-space-shooter-course/` → `/en/`. Each checked with `curl -sI`, each 301 target re-fetched to prove one hop to 200. |
| Post-launch | x-default | German (SPEC D9 beats the research sample): `X_DEFAULT_LOCALE = LOCALES[0]` in `site.config.ts`, the sitemap generator reads the same constant, `verify-dist` asserts that every indexable page's `x-default` href equals its German URL, and production is checked with `curl -s https://boundfoxstudios.com/en/support/ \| grep 'x-default'` → `href="https://boundfoxstudios.com/support/"`. |
| Post-launch | Card freshness | Check the data, not the wording: `gh api repos/BoundfoxStudios/lehrgrapht/tags --jq '.[0].name'` equals the LehrGrapht card version, `gh api repos/BoundfoxStudios/mat/releases/latest --jq .tag_name` equals the MAT version, `gh api repos/BoundfoxStudios/mat --jq .pushed_at` equals that card's `<time datetime>`, `curl -s https://boundfoxstudios.com/ \| grep -c 'In Entwicklung'` = 1. Build freshness is separate: the newest successful `deploy.yml` run is less than 26 hours old. Delete the "no older than the last nightly run" phrasing. |
| Post-launch | Protocol and host checks | Add three lines: `curl -sI http://boundfoxstudios.com/ \| head -1` (301 to https), `curl -sIL --max-redirs 3 https://boundfoxstudios.com/ \| grep -c '^HTTP/'` (exactly 1 — more means a loop), `curl -sI https://www.boundfoxstudios.com/ \| head -1` (301 to the apex, per the M9 Redirect Rule). If a loop appears, the origin condition becomes `RewriteCond %{HTTP:X-Forwarded-Proto} !https` — no human needed. |
| Post-launch | Scheduled-run criterion | Assert the preconditions instead of waiting: the default branch is `develop`, `deploy.yml` exists on it, and that copy contains the `schedule:` block and `ref: main` on the checkout step (the cron always fires from the default branch, so the checkout must pin `main`). Close on a green `workflow_dispatch` run recorded by run id, plus one dated runbook line "first scheduled run to confirm: <cutover + 1> 03:00 UTC". |

---

## Copy

Authoritative German source for every string the design handoff does not contain. English is
authored in M7. Casing follows the *Conventions* rule: natural German case in the source,
`uppercase` applied by CSS. Ids are used verbatim as `i18n="@@<key>"`.

| i18n key | German | Context |
|---|---|---|
| `not-found.kicker` | Fehler 404 | 404 kicker |
| `not-found.title` | Seite nicht gefunden | 404 H1 |
| `not-found.lead` | Diese Seite gibt es nicht mehr oder hat nie existiert. Von hier aus kommst du weiter: | 404 lead |
| `not-found.links.home` | Startseite | 404 link |
| `not-found.links.apps-and-games` | Apps & Spiele | 404 link |
| `not-found.links.support` | Unterstützen | 404 link |
| `not-found.links.socials` | Socials | 404 link |
| `site-header.menu.panel-label` | Menü | Accessible name of the mobile menu panel |
| `footer.language.de` | Deutsch | Footer language switcher, endonym in both locales |
| `footer.language.en` | English | Footer language switcher, endonym in both locales |
| `footer.language.aria-label` | Sprache wählen | `aria-label` of the footer language `<nav>`; replaces `footer.language-list` |
| `seo.home.title` | Boundfox Studios – kostenlose Apps und Spiele | `<title>` for `/` |
| `seo.home.description` | Wir entwickeln Apps und Spiele in Stuttgart — kostenlos, vieles davon Open Source. Schau dir an, woran wir bauen und wie du uns unterstützen kannst. | meta description `/` |
| `seo.apps-and-games.title` | Apps & Spiele – Boundfox Studios | `<title>` |
| `seo.apps-and-games.description` | Alle Apps und Spiele von Boundfox Studios: LehrGrapht, MAT, Flugwacht und Bug-A-Ball — kostenlos, vieles davon Open Source. | meta description |
| `seo.support.title` | Unterstützen – Boundfox Studios | `<title>` |
| `seo.support.description` | So kannst du uns unterstützen: Stars und Pull Requests auf GitHub, Discord, YouTube — oder finanziell über Ko-fi und Patreon. Vieles kostet nichts. | meta description |
| `seo.socials.title` | Socials – Boundfox Studios | `<title>` |
| `seo.socials.description` | Hier findest du uns: GitHub für unsere Open-Source-Projekte, Discord für die Community und YouTube für Tutorials zu Unity, Blender und Gamedev. | meta description |
| `seo.legal-details-imprint.title` | Impressum – Boundfox Studios | `<title>` |
| `seo.legal-details-imprint.description` | Impressum von Boundfox Studios: Anbieterkennzeichnung nach § 5 DDG, Kontakt, Umsatzsteuer-ID sowie Hinweise zu Haftung und Urheberrecht. | meta description |
| `seo.privacy-policy.title` | Datenschutzerklärung – Boundfox Studios | `<title>` |
| `seo.privacy-policy.description` | Datenschutzerklärung von Boundfox Studios: ohne Cookies, ohne Tracking, ohne Analyse-Skripte – und was beim Aufruf der Website trotzdem verarbeitet wird. | meta description |
| `seo.not-found.title` | Seite nicht gefunden – Boundfox Studios | `<title>`, reused by the `**` route |
| `seo.not-found.description` | Diese Seite gibt es nicht mehr oder hat nie existiert. Von hier kommst du zurück zur Startseite, zu den Projekten oder in die Community. | meta description |
| `home.github.lehrgrapht.description` | Mathe-Plotter-Word-AddIn für Lehrkräfte — maßstabsgetreu auf 5×5-mm-Karopapier. | GitHub card body; the title is an unmarked product name |
| `home.github.mat.description` | Markdown-Vorschau im Browser, gerendert wie auf GitHub — direkt aus dem Terminal. | GitHub card body |
| `home.github.flugwacht.description` | Minimaler Flug-Tracker für einzelne, manuell angelegte Flüge — live auf der Karte. | GitHub card body |
| `home.github.card.updated` | {version} · aktualisiert `<time>`{relativeTime}`</time>` | Whole card footer as one message, so English can reorder it |
| `common.badge.available` | Verfügbar | Badge `amber`, only spelling repo-wide |
| `common.badge.in-development` | In Entwicklung | Badge `outline` and the repository-card version fallback, only spelling repo-wide |
| `common.bug-a-ball.key-art-alt` | Bug-A-Ball: eine grinsende grüne Kugel rollt über eine blaue Bahn an rot-weißen Hindernissen vorbei. | Alt text for both crops; retires `home.projects.bug-a-ball.image-alt` and `apps-and-games.games.bug-a-ball.key-art-alt` |
| `home.projects.lehrgrapht.link-aria` | LehrGrapht – zur Website | Card link `aria-label` |
| `home.projects.flugwacht.link-aria` | Flugwacht – zum Repository auf GitHub | Card link `aria-label` |
| `home.projects.mat.link-aria` | MAT – zum Repository auf GitHub | Card link `aria-label` |
| `home.projects.bug-a-ball.link-aria` | Bug-A-Ball – zur Website | Card link `aria-label` |
| `apps-and-games.apps.lehrgrapht.website-aria` | LehrGrapht – zur Website | Link `aria-label` |
| `apps-and-games.apps.lehrgrapht.source-aria` | LehrGrapht – Source Code auf GitHub | Link `aria-label` |
| `apps-and-games.apps.mat.repository-aria` | MAT – zum Repository auf GitHub | Link `aria-label` |
| `apps-and-games.apps.flugwacht.repository-aria` | Flugwacht – zum Repository auf GitHub | Link `aria-label` |
| `apps-and-games.games.bug-a-ball.cta-aria` | Bug-A-Ball – zur Website | CTA `aria-label` |
| `apps-and-games.apps.mat.description-plain` | Markdown-Vorschau direkt aus dem Terminal — gerendert wie auf GitHub, inklusive Mermaid, KaTeX und Syntax-Highlighting. Kein Server, keine Konfiguration: so beiläufig wie cat. | Plain-text sibling for the catalog and JSON-LD; the template keeps the marked-up variant |
| `support.free.github.aria` | GitHub – zur Organisation | Card `aria-label` |
| `support.free.discord.aria` | Discord – Server beitreten | Card `aria-label` |
| `support.free.youtube.aria` | YouTube – Kanal öffnen | Card `aria-label` |
| `support.financial.kofi.aria` | Ko-fi – Kaffee spendieren | Card `aria-label` |
| `support.financial.patreon.aria` | Patreon – Patron werden | Card `aria-label` |
| `socials.channels.github.aria` | GitHub – zur Organisation | Tile `aria-label`; the handle and the arrow are not announced |
| `socials.channels.discord.aria` | Discord – Server beitreten | Tile `aria-label` |
| `socials.channels.youtube.aria` | YouTube – Kanal öffnen | Tile `aria-label` |
| `imprint.title` | Impressum | H1 and the only marked string on the imprint page |
| `privacy.title` | Datenschutzerklärung | H1 and the only marked string inside the privacy prose; the supplied text's own heading |
| `privacy.last-updated` | Stand: {date} | Rendered as `{{ lastUpdated \| date: 'MMMM y' : 'UTC' }}`; page furniture, so it gets a real English target |
| `legal.german-only-notice` | Diese Seite gibt es nur auf Deutsch. Rechtlich verbindlich ist ausschließlich die deutsche Fassung. | Above the H1 on both legal pages, rendered only outside `de` |

### Langtexte

**LICENSE asset carve-out** (English, appended after the verbatim MIT body):

> The MIT license above applies to the source code in this repository only. It grants no rights to
> the Boundfox Studios name, the fox-head mark, logos, wordmarks, key art, screenshots, or any font
> files shipped in `projects/website/public/`. Those assets remain the property of their respective
> owners and may not be copied, redistributed, or modified without prior written permission.

**`SECURITY.md`** (English, in `BoundfoxStudios/.github`):

> Supported versions: only the deployed `main` branch. Report a vulnerability privately through
> GitHub's private vulnerability reporting on the affected repository, or by email to
> info@boundfoxstudios.com. We acknowledge within 5 working days and aim to ship a fix within 30
> days. Please do not open a public issue for security reports.

---

## Conventions

Rules that apply across issues. Each is decided once here; no issue re-decides it.

### Brand and typography

- The brand name is **`Boundfox Studios`** — one word, everywhere: titles, `og:site_name`,
  JSON-LD `Organization.name`, `SITE.name`, footer copyright. The imprint is the authority. Fix
  the two `Bound Fox Studios` mentions in SPEC §1 and every occurrence in `docs/research/seo.md`
  when they are next touched.
- Page titles are `<Page> – Boundfox Studios` with a **spaced en dash** (U+2013), ≤60 characters.
  Meta descriptions ≤155 characters. `aria-label`s follow `<Produkt> – <Aktion>`, same en dash.
- **All display copy is authored in natural German case** and uppercased with the `uppercase`
  utility on the rendering element. The uppercase spellings in `docs/design/*.md` are rendered
  output, not source strings. Bebas Neue is caps-only so nothing changes visually, screen readers
  stop spelling out shouted words, and English translators get sane source strings.
- Product, brand and acronym names (`LehrGrapht`, `MAT`, `Flugwacht`, `Bug-A-Ball`, `GitHub`,
  `Discord`, `YouTube`, `Ko-fi`, `Patreon`, `Boundfox`, `Studios`, `DE`, `EN`) are **unmarked
  literals** with `translate="no"` — no `@@id`. Drop `home.projects.*.title`,
  `apps-and-games.*.title`, `support.*.title`, `common.social.*` and `home.github.*.title` from
  the key maps.
- The `→` glyph is **never** inside a translatable string. Components render
  `{{ label }}<span aria-hidden="true" class="ml-1">→</span>` themselves. Every id's source text
  is the design's string minus the trailing arrow.

### i18n

- Ids are kebab-case and dot-separated, scoped by page or by `common.`:
  `<page>.<section>.<element>`. SEO ids follow the **route path**: `seo.home.*`,
  `seo.apps-and-games.*`, `seo.support.*`, `seo.socials.*`, `seo.legal-details-imprint.*`,
  `seo.privacy-policy.*`, `seo.not-found.*`. Rename the research's camelCase ids on sight.
- One id, one source text, no `meaning`/`description` — `ng extract-i18n` fails when two
  occurrences of an id differ.
- German source lives in templates (`i18n=` / `i18n-<attr>=`), not in TypeScript, unless the
  string is a computed fallback.
- Trailing spaces in label runs are authored as `&nbsp;` — Angular's whitespace removal deletes a
  real trailing space.
- **Legal prose is never marked.** On `/legal-details-imprint/` and `/privacy-policy/` nothing
  inside the text carries an `i18n` attribute — not a heading, not a paragraph, not a list item. Marked are exactly
  eight ids, all page furniture: `privacy.title`, `imprint.title`, `privacy.last-updated`,
  `legal.german-only-notice` and the `seo.privacy-policy.*` / `seo.legal-details-imprint.*` pairs.
  SPEC §12 D10 serves the German text under `/en/`, so marking the prose would mean ninety
  byte-identical units, ninety chances for the two texts to drift apart, and a rewrite on every
  `ng extract-i18n` run; unmarked content is identical in both locales by construction. The prose
  sits inside the `lang="de"` wrapper, the notice outside it. Rationale in `docs/legal/README.md` —
  apply it, do not re-argue it, and do not mark a legal string out of habit.

### Files and naming

- Components: `<name>.ts` + `<name>.html`, no `.component` suffix, no component `.css`
  (Tailwind utilities only), OnPush, signal inputs. Every component under `app/ui/` needs a row in
  `docs/components.md` in the same PR.
- Page folders are named after the **page**, not the URL: `pages/home/`, `pages/apps-and-games/`,
  `pages/support/`, `pages/socials/`, `pages/imprint/`, `pages/privacy-policy/`,
  `pages/not-found/` (the `404` route and the `**` wildcard both load the last one).
- Hand-written DOM ids follow `<component>-<section>-title`; the exceptions are the fixed
  `mobile-menu-panel` and the a11y hook `data-a11y-exception="kicker-contrast"`.
- Images live in `projects/website/public/images/` and are referenced **relatively**
  (`images/…`, never `/images/…` — absolute paths break under `<base href="/en/">`). Names:
  `fox-head-{32,40,64,80}.webp`, `bug-a-ball-card-840x420.{webp,jpg}`,
  `bug-a-ball-feature-1200x600.{webp,jpg}`, `mat-dark.svg`, `flugwacht-wordmark.svg`.
  Uncommitted masters live in `projects/website/branding/` (tracked, never in the handoff folder).
- Internal navigation uses `routerLink` **without** a trailing slash (`routerLink="/support"`;
  `/support/` parses to segments `['support','']` and renders the wildcard route). Trailing slashes
  stay on plain-href output only: canonical, hreflang, sitemap `<loc>`, language switcher.

### Shared data

- `projects/website/src/app/data/social-links.ts` — the single source for GitHub, Discord and
  YouTube: `export interface SocialLink { readonly id: BrandIconName; readonly name: string;
  readonly handle: string; readonly href: string; }` and `SOCIAL_LINKS` in tile order GitHub →
  Discord → YouTube, with `https://github.com/BoundfoxStudios`, `https://discord.gg/tHqNzMT`,
  `https://youtube.com/c/boundfox`. Consumed by the footer, the Socials page and JSON-LD
  `Organization.sameAs`. Page-specific copy stays on the pages.
- `projects/website/src/app/data/apps.ts` — `APPS` in design order LehrGrapht, MAT, Flugwacht,
  Bug-A-Ball, with the JSON-LD fields from the M8 table. Consumed by the Apps & Games page and the
  `ItemList` JSON-LD.
- Add `data/` to the SPEC §6 tree. A handle or channel exists in the head only if it exists in
  `social-links.ts`, so `sameAs` and the meta tags can never disagree.

### Layout and styling

- The container is `mx-auto max-w-6xl px-6` on every section — 1152px outer, 1104px inner, which
  is the design's `--container-max` exactly. Never `max-w-[1200px]`, never a `max-w-legal` token.
- One-off measurements are arbitrary utilities at the usage site (`max-w-[760px]`, `text-[28px]`),
  not new tokens. The `@theme` block holds twelve colours, `--shadow-accent`, and
  `--font-display` / `--font-sans` / `--font-script` / `--font-mono`.
- `focus-ring` goes on every interactive element; `surface-dark` on every dark band, tile or chip.
- Every `border` utility spells out its colour (Preflight emits `border: 0 solid` with no default).

### Scripts

| Script | Command | Window |
|---|---|---|
| `preview` | `npm run build && http-server dist/website/browser -p 4300 -c-1` | M7 onwards — the only way to see `/en/` |
| `preview:de` | `ng build --configuration development && http-server dist/website/browser -p 4300 -c-1` | M3–M6 German verification |
| `build:draft` | `ng build --i18n-missing-translation=warning` | writes both locales with source fallback |
| `preview:draft` | `npm run build:draft && http-server dist/website/browser -p 4300 -c-1` | seeing `/en/` before M7 |

`http-server` is pinned at `14.1.1` and always invoked from `node_modules/.bin` (never `npx`, which
prompts on a TTY). It is also the server the axe run and the Playwright scripts start against — no
hand-written static server. `prebuild` (`npm run fetch:github`) and `postbuild`
(`node tools/seo/finalize-dist.mjs && node tools/seo/generate-sitemap.mjs && node tools/copy-deploy-files.mjs`)
are npm lifecycle hooks: they fire automatically around `npm run build` and are never chained
manually. The i18n gate is toggled with `npm run build -- --i18n-missing-translation=warning`,
never by editing `angular.json`.

### Tests and tooling

- `npm test` = `ng test && vitest run --config vitest.config.mts`. The root `vitest.config.mts`
  has `{ test: { include: ['tools/**/*.spec.mjs'], environment: 'node' } }`; `ng test` only ever
  collects `projects/website/src/**/*.spec.ts`. Build scripts are split into a pure
  `*.lib.mjs` (exported functions, tested) and a thin CLI (file I/O, untested).
- Browser automation is `@playwright/test` + chromium, installed with
  `npx playwright install --with-deps chromium` in CI and `"playwright"` added to `allowScripts`
  in `package.json` (npm 12 blocks unreviewed install scripts, and the browser download would
  otherwise silently never happen). It backs the font-CLS check, the focus screenshots, the
  viewport check and the axe run — one dependency, four consumers.

### SPEC amendments

| Row | Content |
|---|---|
| D10 | Legal pages in English — German text under `/en/` plus one English notice; only the German version is legally binding |
| D11 | Measurement — none; no client-side script of any kind |
| D12 | Translation catalogue tooling — `ng-extract-i18n-merge` with `newTranslationTargetsBlank: "omit"` |

Delete both "Still open" bullets that D10 and D11 answer, fix the §1 cross-reference to
"(see §12, D11)", correct §13's M9 dependency to `M1, M3, M4, M8`, and add `/author/manuel-rauber/`
to the §4 legacy table. §12 must contain exactly one row per D-number, D1 … D12, in ascending order.
