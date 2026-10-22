# boundfoxstudios.com

Fully static, prerendered, bilingual Angular site. German at `/`, English at `/en/`, both
produced by a single `ng build`, finished by `npm run postbuild` and published by GitHub Actions
to the `deployment/production` branch, which Plesk on Netcup pulls onto the Apache host.

## Brand facts that are not negotiable

`#ffeb3b`, `#ffc107` and `#ffa726` never change. The orange kicker's contrast failure is an
accepted deviation, not a bug to fix: `tools/a11y/run-axe.mjs` excludes it and the script accent
by name. The brand name is `Boundfox Studios`, one word.

## Traps that have already cost time

- Removing `"server"` from `angular.json` silently disables prerendering. The build still
  exits 0 and ships an empty client-side shell.
- Critical-CSS inlining is off in `angular.json` on purpose. Turned back on, beasties 0.5 drops
  the web-font `@font-face` rules, the header wraps in the fallback font and Lighthouse fails on
  CLS. The `optimization` object form turns every omitted key off, so dropping `scripts` or
  `minify` there silently ships unminified output.
- `ng serve` serves one locale flat at `/`. The `/en/` prefix and the language switcher can
  only be verified against a real build — `npm run preview`.
- Assets are duplicated per locale, so template asset paths must be relative. An absolute
  path makes `/en/` load the German copy.
- Tailwind v4's palette is wiped by `--color-*: initial`, so a mistyped utility produces no
  CSS and no error. That is what `eslint-plugin-better-tailwindcss` is for.
- Application code imports `./generated/github-data.json` and never anything under `tools/`.
  `process.env` has no esbuild shim and becomes a runtime `ReferenceError` in the browser.
- Apache's distro config aliases `/icons/` onto mod_autoindex's own icon directory, so a
  docroot `icons/` folder is unreachable and every file in it answers 404. That is why the app
  icons live in `public/app-icons/`. An `.htaccess` cannot undo it: the alias resolves the
  request into a different filesystem tree, where the docroot's `.htaccess` is never read.
- Link checkers built on `html5gum` (lychee, hyperlink) only ever see the `<head>` of a
  prerendered page. They stop at Angular's inline `ng-event-dispatch-contract` script,
  where `o<n.length` reads as the start of a tag, and then report every page as clean.
  That is why the nightly link check runs linkinator.

## Measurement

- Production page views go to the self-hosted Matomo at `werhettdoneigeguggd.de`, configured
  with: no cookies apart from the objection cookie `mtm_consent_removed`, no browser feature
  detection, no performance timings, no outlink tracking (outbound traffic is visible on the
  target services), only campaign query parameters, 404 titles without query or full referrer.
  Of these, the privacy policy covers only the cookies. Do Not Track and Global Privacy Control
  keep `matomo.js` from loading at all. Changing what the tracker sends is a privacy policy
  change and moves `PRIVACY_LAST_UPDATED`. Until this change the site ran no client-side
  measurement (issue #53).
- Only the production origin tracks, decided at runtime against `SITE.origin` in the
  browser-only `app.config.browser.ts`. CI, preview and production ship the identical build, so a
  build flag was rejected: it would rest on a workflow input.
- The tracker is never written during prerender. CI fails on `matomo.js`, `matomo.php` or `_paq`
  in prerendered HTML, so the privacy prose names no tracker file; the JS bundles contain them on
  purpose. `npm run axe` aborts and fails on any request that leaves the local server, which is
  what proves the inactive path.
- Once loaded, `matomo.js` replaces the `window._paq` array with its own proxy. Every command
  reads `window._paq` at call time; a stored reference silently drops all later page views and
  the opt-out.
- `forgetUserOptOut` exists but must not be used: it calls `setConsentGiven`, which re-enables
  browser feature detection and flushes the hits queued while the visitor was opted out.
  Withdrawing an objection deletes `mtm_consent_removed` instead.
- A stored objection keeps `matomo.js` from loading and is rewritten on every load: Safari caps
  cookies written by script at seven days, so an objection written once would lapse silently.
- `NavigationEnd` fires before the title strategy updates `document.title`. Page views take their
  title from the route's `seo` data.
- A future CSP needs `script-src`, `connect-src` and `img-src` for
  `https://werhettdoneigeguggd.de`.
- Rejected: ngx-matomo-client (peer range pinned to the Angular major, no cookieless or
  feature-detection options), the inline snippet (lands in every prerendered page, previews
  included), a first-party proxy (EasyPrivacy blocks by path, not host).

## Privacy policy: websites, apps and in-game ads

- The privacy policy covers boundfoxstudios.com and bugaball.com (Cloudflare in front of netcup),
  geodart.app and flugwacht.app (netcup only) in 3 a), and the apps in section 5: a) Bug-A-Ball,
  b) Geodart, c) Flugwacht. Section 5 describes the store releases, not the app repos' heads:
  Bug-A-Ball tag `v1.4.1` (its `main`), Geodart 1.0.0 with ads, Flugwacht's `main`. A new
  recipient, SDK or consent change in any of them is a privacy policy change and moves
  `PRIVACY_LAST_UPDATED`.
- Every processing names its legal basis where it is described, and section 8 repeats all of them
  as an overview list; section 10 holds the retention criteria and the objection cookie's lifetime.
  Adding a processing means updating both. Cross references are plain numbers ("Abschnitt 7" =
  rights, "Abschnitt 4 e)" = ads), and nothing tests them, so renumber by hand.
- 3 a) says only boundfoxstudios.com measures reach. bugaball.com is a WordPress site outside this
  repo, where a plugin can add third-party scripts or cookies, so re-check its rendered page
  whenever 3 a) changes.
- Bug-A-Ball has no ad SDK, so 4 e) and section 12 name Geodart only. Do not add Bug-A-Ball back
  there.
- Geodart's in-app Matomo rests on Art. 6 Abs. 1 lit. f DSGVO (cookieless, no identifier), as 5 b)
  says. Do not add consent wording.
- Geodart shows ads through Unity LevelPlay with Unity Ads and the ironSource Exchange, started only
  after the in-game consent dialog. 4 e) describes exactly this setup, so enabling another network
  in LevelPlay is a privacy policy change.
- The sentence that we "können … gemeinsam mit Unity verantwortlich sein" is hedged on purpose
  (CJEU Fashion ID, C-40/17). Never reword it into an exclusion.
- The data list in 4 e) follows Unity's disclosures for the Unity Ads and LevelPlay SDKs. The longer
  list in Unity's player FAQ (IDFV, CPU, GPU, sensor flags) describes the Unity engine, not the ad
  SDKs.
- Unity is not certified under the EU-US Data Privacy Framework (checked on 2026-10-21), so 4 e) and
  5 a) name the Standard Contractual Clauses. Re-check the DPF list before changing that.
- Geodart shows ads after consent, so its copy says "auch offline spielbar", never
  "komplett offline".

## Conventions

Code style, testing, branches, commit messages and pull requests follow the general
conventions. In short: no comments that paraphrase code, no abbreviations in identifiers,
English code and commits, German only in translatable strings. Exception: the legal prose and
`bfs-tracking-opt-out` are German without i18n on purpose and appear under `/en/` inside the
`lang="de"` wrapper.
