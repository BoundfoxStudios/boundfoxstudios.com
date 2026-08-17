## RECOMMENDATION
All snippets below were verified by actually building them in a copy of this workspace with the installed toolchain (`@angular/build` 22.1.4, `@angular/cli` 22.1.4, `@angular/localize` 22.1.2). Everything claimed here was observed in real build output, not inferred.

# 1. Install `@angular/localize`

```bash
ng add @angular/localize
```

That schematic (verified in `node_modules/@angular/localize/schematics/ng-add/ng_add_bundle.cjs`) does exactly three things:
- adds `@angular/localize` to **devDependencies** (runtime translation is not used; AOT inlines at build time)
- adds `"@angular/localize/init"` to the build target's `polyfills`
- adds `"@angular/localize"` to `types` in the project tsconfigs

Do it manually if you prefer — pin the version you resolve at the time, `npm view @angular/localize version` (22.1.2 when I checked).

`projects/website/tsconfig.app.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "types": ["node", "@angular/localize"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts"]
}
```

# 2. `angular.json` — complete, copy-pasteable

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "cli": { "packageManager": "npm" },
  "newProjectRoot": "projects",
  "projects": {
    "website": {
      "projectType": "application",
      "schematics": {},
      "root": "projects/website",
      "sourceRoot": "projects/website/src",
      "prefix": "app",
      "i18n": {
        "sourceLocale": {
          "code": "de",
          "subPath": ""
        },
        "locales": {
          "en": {
            "translation": "projects/website/src/locale/messages.en.xlf",
            "subPath": "en"
          }
        }
      },
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "projects/website/src/main.ts",
            "server": "projects/website/src/main.server.ts",
            "tsConfig": "projects/website/tsconfig.app.json",
            "polyfills": ["@angular/localize/init"],
            "outputMode": "static",
            "localize": true,
            "i18nMissingTranslation": "error",
            "i18nDuplicateTranslation": "error",
            "assets": [
              { "glob": "**/*", "input": "projects/website/public" }
            ],
            "styles": ["projects/website/src/styles.css"],
            "security": { "allowedHosts": [] }
          },
          "configurations": {
            "production": {
              "budgets": [
                { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
                { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true,
              "localize": ["de"]
            },
            "en": {
              "localize": ["en"]
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "configurations": {
            "production": { "buildTarget": "website:build:production" },
            "development": { "buildTarget": "website:build:development" },
            "en": { "buildTarget": "website:build:development,en" }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {
          "builder": "@angular/build:extract-i18n",
          "options": {
            "buildTarget": "website:build:development",
            "format": "xlf2",
            "outputPath": "projects/website/src/locale",
            "outFile": "messages.xlf"
          }
        },
        "test": { "builder": "@angular/build:unit-test" }
      }
    }
  }
}
```

**The single most important line is `"sourceLocale": { "code": "de", "subPath": "" }`.** `subPath` sets *both* the output directory name and the `<base href>`. Without it, `subPath` defaults to the locale code and German lands in `browser/de/` with `<base href="/de/">`. The empty string is explicitly allowed (schema pattern `^[\w-]*$`), and `join("", path)` leaves files at the root.

Do **not** use `baseHref` instead of `subPath` — they are mutually exclusive (the CLI throws), `baseHref` leaves the output directory named after the locale code, and `createI18nOptions` logs a warning that `baseHref` "may lead to undefined behavior" whenever a server entry is present.

## What changed vs. your current config
- `"outputMode"`: `"server"` → `"static"`
- **`"server": "projects/website/src/main.server.ts"` must STAY** (see the trap in Risks)
- `"ssr": { "entry": "projects/website/src/server.ts" }` — **removed**
- added `i18n`, `localize`, `polyfills`, `i18nMissingTranslation`, `i18nDuplicateTranslation`

## Files/scripts to delete
- `projects/website/src/server.ts` (the Express host — nothing serves it now)
- the `"serve:ssr:website": "node dist/website/server/server.mjs"` script in `package.json`
- `express` and `@types/express` from dependencies

Keep `main.server.ts`, `app.config.server.ts` and `@angular/ssr` — they are the prerenderer.

# 3. `outputMode: "static"` + localization: one build, both locales

**One `ng build` produces both locales, fully prerendered.** Verified: 5 routes × 2 locales printed `Prerendered 10 static routes.`

The mechanism (`src/builders/application/i18n.js`): the builder bundles once, then for each locale inlines translations and runs the whole post-bundle pipeline — including prerendering — with that locale's `baseHref`. The source comment is literally *"If localization is enabled, prerendering is handled in the inlining process."* Output files are then relocated with `file.path = join(subPath, file.path)`.

Exact observed output layout:

```
dist/website/
├── 3rdpartylicenses.txt          <- NOT deployed
├── prerendered-routes.json       <- NOT deployed (build report)
└── browser/                      <- deploy the CONTENTS of this directory
    ├── index.html                     lang="de"  <base href="/">
    ├── index.csr.html                 lang="de"  <base href="/">   (empty CSR shell)
    ├── main-<HASH>.js
    ├── polyfills-<HASH>.js
    ├── styles-<HASH>.css
    ├── favicon.ico
    ├── socials/index.html
    ├── legal-details-imprint/index.html
    ├── privacy-policy/index.html
    └── en/
        ├── index.html                 lang="en"  <base href="/en/">
        ├── index.csr.html             lang="en"  <base href="/en/">
        ├── main-<HASH>.js             SAME filename as the de one, DIFFERENT content
        ├── polyfills-<HASH>.js
        ├── styles-<HASH>.css
        ├── favicon.ico                (assets are duplicated per locale)
        ├── socials/index.html
        ├── legal-details-imprint/index.html
        └── privacy-policy/index.html
```

Every route becomes `<route>/index.html` (the render worker documents this: *"writes them to `<outputPath>/<route>/index.html`"*). There is **no `server/` directory at all** — `outputMode: static` sets `ignoreServer: true`, so no Node artifacts are emitted.

`<html lang>` and `<base href>` are set automatically and correctly per locale. So is locale data: I verified `{{ d | date:'longDate' }}` → `15. März 2026` / `March 15, 2026`, `{{ n | number }}` → `1.234.567,89` / `1,234,567.89`, `{{ v | currency:'EUR' }}` → `1.234,50 €` / `€1,234.50`. **No `registerLocaleData()` call is needed.**

`redirectTo` routes are prerendered as meta-refresh HTML pages with locale-correct targets (`/legal-details-imprint` in the de tree, `/en/legal-details-imprint` in the en tree). Note this only happens under `static` — `prerender.js` explicitly skips redirects for non-static output modes.

# 4. Translation files: use `xlf2`

Supported *input* parsers (verified in `src/utils/load-translations.js`): `arb`, `json` (SimpleJson), `xlf` (XLIFF 1.2), `xlf2` (XLIFF 2.0), `xmb`/`xtb`.

Use **`xlf2`**. It keeps `<source>` next to `<target>` (so you can see when a translation went stale), and it represents interpolation placeholders and ICU sub-messages properly — the flat `json` format is a bare id→string map and loses that structure.

```bash
# Regenerate the source catalogue (German) after adding/changing marked text
ng extract-i18n website
```

With the `extract-i18n` options above this writes `projects/website/src/locale/messages.xlf` with `srcLang="de"` (it picks the source locale up from `angular.json`).

Extracted shape:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="de">
  <file id="ngi18n" original="ng.template">
    <unit id="page.title">
      <notes><note category="location">projects/website/src/app/pages/page.ts:8,9</note></notes>
      <segment>
        <source>Willkommen bei BoundfoxStudios</source>
      </segment>
    </unit>
  </file>
</xliff>
```

The English file is the same document with `trgLang="en"` and a `<target>` added inside each `<segment>`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="de" trgLang="en">
  <file id="ngi18n" original="ng.template">
    <unit id="page.title">
      <segment>
        <source>Willkommen bei BoundfoxStudios</source>
        <target>Welcome to BoundfoxStudios</target>
      </segment>
    </unit>
  </file>
</xliff>
```

## Keeping the two files in sync
The Angular CLI has **no merge step** — `extract-i18n` overwrites the source catalogue and never touches `messages.en.xlf`. Two workable approaches:

**(a) Let the build be the gate (zero extra dependencies).** `"i18nMissingTranslation": "error"` in the build options turns any untranslated message into a hard build failure, so an un-synced `messages.en.xlf` can never reach production. Verified: a missing unit produced `No translation found for "notFound.title"`, which becomes an error at that setting. Run `ng build` in CI.

**(b) Add a real merge builder.** `ng-extract-i18n-merge` is current and declares `@angular/build: ^20 || ^21 || ^22` as a peer (v3.4.0, published 2026-06). It replaces the `extract-i18n` target, updates the source file *and* merges new/removed units into every target file while preserving existing translations. Recommended once the catalogue grows past a few dozen strings.

Use (a) now, add (b) when it starts to hurt.

# 5. Marking text for translation

## Templates
```html
<!-- always give an explicit, stable id: @@my.id -->
<h1 i18n="@@page.title">Willkommen bei BoundfoxStudios</h1>

<!-- with meaning|description before the id -->
<p i18n="site header|Intro line on the landing page@@page.intro">
  Wir entwickeln Spiele mit {{ engine }} seit {{ year }}.
</p>

<!-- attributes: i18n-<attr>, one per attribute -->
<img src="logo.svg"
     alt="Logo"   i18n-alt="@@page.logoAlt"
     title="Logo" i18n-title="@@page.logoTitle" />

<!-- plurals -->
<p i18n="@@page.games">
  {count, plural, =0 {keine Spiele} =1 {ein Spiel} other {{{ count }} Spiele}}
</p>

<!-- select -->
<p i18n="@@page.select">{gender, select, male {Er} female {Sie} other {Es}} arbeitet hier.</p>
```

Interpolations inside a marked block are extracted as `<ph .../>` placeholders and must be carried over verbatim into the `<target>` — you may reorder them, but not rename or drop them.

## TypeScript
```ts
protected readonly message = $localize`:@@page.tsMessage:Aus TypeScript übersetzt`;

// with meaning and description
protected readonly other = $localize`:site header|Button label@@page.cta:Jetzt spielen`;

// with interpolation
protected readonly greeting = $localize`:@@page.greeting:Hallo ${name}:name:!`;
```
`$localize` is a global — no import — which is why `"types": ["@angular/localize"]` matters.

All of the above were verified end-to-end: the German build rendered `Willkommen bei BoundfoxStudios / Wir entwickeln Spiele mit Unity seit 2019. / 3 Spiele / Sie arbeitet hier.` and the English build rendered `Welcome to BoundfoxStudios / We have been building games with Unity since 2019. / 3 games / She works here.`

# 6. The language switcher

It must be a **plain `<a href>`**, never `routerLink` — the two locales are separate applications with separate bundles, so switching requires a full document load. A leading-slash `href` ignores `<base href="/en/">`, which is exactly what you want.

The interesting part is computing "the equivalent page". Because `<base href>` is locale-specific, **the router's URL is already locale-relative and therefore identical in both locales** (`/socials` in both trees). So the target is just `subPath + routerUrl`.

```ts
// projects/website/src/app/language-switcher.ts
import { Component, LOCALE_ID, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

const LOCALE_SUB_PATHS: Record<string, string> = {
  de: '',
  en: 'en',
};

const LOCALE_LABELS: Record<string, string> = {
  de: 'Deutsch',
  en: 'English',
};

@Component({
  selector: 'app-language-switcher',
  template: `
    @for (locale of otherLocales(); track locale.code) {
      <a [href]="locale.href" [attr.hreflang]="locale.code" rel="alternate">{{ locale.label }}</a>
    }
  `,
})
export class LanguageSwitcher {
  private readonly router = inject(Router);
  private readonly currentLocale = inject(LOCALE_ID);

  private readonly currentPath = computed(
    () => this.router.lastSuccessfulNavigation()?.finalUrl?.toString() ?? '/',
  );

  protected readonly otherLocales = computed(() => {
    const path = this.currentPath();

    return Object.keys(LOCALE_SUB_PATHS)
      .filter((code) => code !== this.currentLocale)
      .map((code) => ({
        code,
        label: LOCALE_LABELS[code],
        href: `/${LOCALE_SUB_PATHS[code]}${path}`.replace(/\/{2,}/g, '/'),
      }));
  });
}
```

Verified in the actual prerendered HTML:

| prerendered file | emitted anchor |
|---|---|
| `index.html` | `<a rel="alternate" href="/en/" hreflang="en">English</a>` |
| `socials/index.html` | `<a rel="alternate" href="/en/socials" hreflang="en">English</a>` |
| `privacy-policy/index.html` | `<a rel="alternate" href="/en/privacy-policy" hreflang="en">English</a>` |
| `en/index.html` | `<a rel="alternate" href="/" hreflang="de">Deutsch</a>` |
| `en/socials/index.html` | `<a rel="alternate" href="/socials" hreflang="de">Deutsch</a>` |
| `en/privacy-policy/index.html` | `<a rel="alternate" href="/privacy-policy" hreflang="de">Deutsch</a>` |

**Use `router.lastSuccessfulNavigation()`, not `router.url`.** This is the sharpest trap I found. `Router.url` is a plain getter, not a signal; under Angular 22's zoneless change detection it is read once at component construction and never re-evaluated, so during prerendering **every page emitted `/`** and every switcher link pointed at the home page. `lastSuccessfulNavigation` *is* a `Signal<Navigation | null>` and produced the correct path on every page. `document.location.pathname` also works during prerendering but includes the `/en/` prefix, so you would have to strip it — more code, no benefit.

The same `computed` gives you SEO alternates for free:
```html
<link rel="alternate" hreflang="de" [href]="deHref()" />
<link rel="alternate" hreflang="en" [href]="enHref()" />
<link rel="alternate" hreflang="x-default" [href]="deHref()" />
```
(Use absolute URLs with your domain for `hreflang` in production.)

# 7. Server routes for a fully static build

`app.routes.server.ts` is **optional** here. I verified that `provideServerRendering()` with no `withRoutes(...)` still prerenders all 10 routes — the builder's route discovery walks the Router config (`discoverRoutes` defaults to `true`).

Keep it anyway, explicit and minimal:

```ts
// projects/website/src/app/app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
```

`app.config.server.ts` stays exactly as it is:
```ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

The `'**'` entry itself is never rendered (prerender skips any route containing `*`); it just assigns `Prerender` mode to everything discovery finds.

**`getPrerenderParams` is only needed for parameterised routes** (`blog/:slug`). Your listed routes are all static, so you need none today. When you do add one, a genuinely useful verified detail: **`getPrerenderParams` is invoked once per locale, and `inject(LOCALE_ID)` inside it returns the correct locale**, so you can prerender different slug sets per language:

```ts
{
  path: 'blog/:slug',
  renderMode: RenderMode.Prerender,
  async getPrerenderParams() {
    const locale = inject(LOCALE_ID);          // 'de' or 'en' — inject synchronously
    const posts = await loadPostsFor(locale);
    return posts.map((post) => ({ slug: post.slug }));
  },
}
```
Observed output: `browser/blog/post-a-de/index.html` and `browser/en/blog/post-a-en/index.html`.

Add a 404 route so Apache has something to serve:
```ts
{ path: '404', component: NotFound },
{ path: '**', component: NotFound },
```
This prerenders `404/index.html` and `en/404/index.html`.

# 8. Apache / FTP deployment

Upload the **contents of `dist/website/browser/`** to the document root. `3rdpartylicenses.txt` and `prerendered-routes.json` sit *outside* `browser/` and are not deployed.

**No rewrite rules are needed for routing.** Every route is a real directory containing `index.html`, so stock `DirectoryIndex` handling serves the whole site. That is the whole point of going static.

Root `.htaccess`:
```apache
Options -Indexes -MultiViews
DirectoryIndex index.html

ErrorDocument 404 /404/index.html

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_headers.c>
  # Content-hashed build artifacts are immutable
  <FilesMatch "-[A-Z0-9]{8}\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  # HTML must always revalidate, or a deploy is invisible
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
```

`en/.htaccess` (for a localized 404):
```apache
ErrorDocument 404 /en/404/index.html
```

Apache resolves `ErrorDocument` from the deepest existing directory, so a miss under `/en/…` picks up the English page.

Deploy these two files from a `deploy/` folder in your FTP step — **not** via `projects/website/public/`. I verified that a `.htaccess` placed in `public/` *is* copied (dotfiles are not excluded), but it is copied identically into **both** `browser/` and `browser/en/`, so you cannot express a per-locale `ErrorDocument` that way.

## FINDINGS
ONE `ng build` produces both locales fully prerendered. Verified: 5 routes x 2 locales printed `Prerendered 10 static routes.` The builder bundles once, then per locale inlines translations and re-runs the entire post-bundle pipeline (prerendering included) with that locale's baseHref — source comment in `src/builders/application/i18n.js`: "If localization is enabled, prerendering is handled in the inlining process."
- `subPath` is the correct knob, and `""` is legal. `sourceLocale: { code: "de", subPath: "" }` puts German at the root with `<base href="/">`; `en: { subPath: "en" }` puts English in `en/` with `<base href="/en/">`. The schema pattern is `^[\w-]*$` (empty allowed) and the builder does `file.path = join(subPath, file.path)`, so an empty subPath is a no-op join. Omitting it defaults subPath to the locale code — German would land in `browser/de/`.
- `subPath` and `baseHref` are mutually exclusive — the CLI throws `'i18n.sourceLocale.subPath' and 'i18n.sourceLocale.baseHref' cannot be used together.` `baseHref` also only changes the `<base href>` and leaves the output directory named after the locale code, and `createI18nOptions` warns that it "may lead to undefined behavior" whenever a server entry is present. Use `subPath`.
- Exact verified output layout: `dist/website/browser/` holds the German site at its root (`index.html`, `socials/index.html`, `legal-details-imprint/index.html`, …) and the English site under `browser/en/`. Each route becomes `<route>/index.html` — the render worker documents "writes them to `<outputPath>/<route>/index.html`". There is NO `server/` directory: `outputMode: static` sets `ignoreServer: true`.
- `<html lang>` and `<base href>` are emitted correctly per locale with no work: `<html lang="de" dir="ltr">` + `<base href="/">` and `<html lang="en" dir="ltr">` + `<base href="/en/">`.
- Locale DATA is registered automatically — no `registerLocaleData()`. Verified pipe output: `15. März 2026` vs `March 15, 2026`, `1.234.567,89` vs `1,234,567.89`, `1.234,50 €` vs `€1,234.50`.
- `RenderMode.Prerender` with `getPrerenderParams` is NOT needed for static routes — route discovery handles them. I verified that even `provideServerRendering()` with no `withRoutes(...)` prerenders all 10 routes. A bare `{ path: '**', renderMode: RenderMode.Prerender }` is the right explicit config; the wildcard entry itself is never rendered (prerender skips routes containing `*`), it just assigns the mode to everything discovery finds.
- `getPrerenderParams` runs ONCE PER LOCALE and `inject(LOCALE_ID)` inside it returns the correct locale. Verified with console output `>>> getPrerenderParams called with LOCALE_ID=de` / `=en`, producing `browser/blog/post-a-de/index.html` and `browser/en/blog/post-a-en/index.html`. This lets you prerender different slug sets per language.
- `RenderMode.Server` under `outputMode: static` is a hard build error, reported once per locale: `Route '/socials' is configured with server render mode, but the build 'outputMode' is set to 'static'.` and `Route '/en/socials' …`.
- `redirectTo` routes ARE prerendered under static output, as meta-refresh HTML with locale-correct targets (`/legal-details-imprint` in the de tree, `/en/legal-details-imprint` in the en tree). `prerender.js` skips redirects for every output mode EXCEPT static.
- The language switcher must read `router.lastSuccessfulNavigation()?.finalUrl?.toString()`, NOT `router.url`. `Router.url` is a plain getter, not a signal; under zoneless change detection it is evaluated once at construction, so during prerendering every page emitted `/` and every switcher link pointed at the home page. The signal-based API produced the correct path on every prerendered page.
- Because `<base href>` is locale-specific, the router URL is already locale-relative and IDENTICAL in both locales (`/socials` in both trees). So the cross-locale link is simply `subPath + routerUrl` — no route-path mapping table is needed, which is exactly the situation here since paths stay English in both locales.
- Translation input parsers supported by the builder (`src/utils/load-translations.js`): `arb`, `json` (SimpleJson), `xlf` (XLIFF 1.2), `xlf2` (XLIFF 2.0), `xmb`/`xtb`. `ng extract-i18n --format` additionally accepts `xlif`, `xliff`, `xliff2`, `legacy-migrate`.
- `ng extract-i18n` reads the source locale from `angular.json` and stamps it into the catalogue (`srcLang="de"`). Its options are `--format`, `--output-path`, `--out-file`, `--build-target`, `--i18n-duplicate-translation`.
- The Angular CLI has NO merge step — `extract-i18n` overwrites the source catalogue and never touches target files. Either gate on `"i18nMissingTranslation": "error"` (a missing unit fails the build) or add `ng-extract-i18n-merge` (v3.4.0, published 2026-06, peer `@angular/build: ^20 || ^21 || ^22`).
- `ng add @angular/localize` does exactly three things (read from the ng-add bundle): adds the package to devDependencies, appends `"@angular/localize/init"` to the build target's `polyfills`, and adds `"@angular/localize"` to the tsconfig `types`.
- Apache's `DirectorySlash` 301 from `/socials` to `/socials/` is harmless. I confirmed `/socials/` parses to segments `["socials", ""]` yet still matches the `socials` route rather than the wildcard — an end-to-end request for `/socials/` rendered the page, not the 404 component.
- A `.htaccess` in `projects/website/public/` IS copied (dotfiles are not excluded by the `**/*` glob) but is copied identically into BOTH `browser/` and `browser/en/`, so per-locale `ErrorDocument` cannot be expressed through the asset pipeline.
- Bundle filenames are shared across locales while contents differ (`browser/main-NIOROH2S.js` and `browser/en/main-NIOROH2S.js` are byte-different). The content hash DOES incorporate translation file contents — changing one string in `messages.en.xlf` re-hashed the bundles — so there is no stale-cache correctness bug, but every locale's bundles get renamed whenever any locale's translations change.

## RISKS
THE BIG ONE: removing `"server": "…/main.server.ts"` silently disables ALL prerendering. `normalizeOptions` does `options.prerender = !!options.server` when `outputMode` is set — no error, no warning. I built this: the output was a plain CSR `index.html` per locale with zero prerendered routes, and it looked like a successful build. It is tempting to delete the server entry when "going static" because static implies no server. MITIGATION: keep `server` pointing at `main.server.ts`; delete only `ssr.entry` and `server.ts`. Add a CI assertion that `dist/website/browser/socials/index.html` exists after a build.
- `ng serve` cannot serve both locales. With `localize: true` the dev-server WARNS and silently disables localization (`Localization (`localize` option) has been disabled. The development server only supports localizing a single locale per build.`) — you then develop against untranslated source text with `LOCALE_ID` defaulting to `en-US`, so German date/number formatting silently differs from production. MITIGATION: the `"development": { "localize": ["de"] }` and `"en": { "localize": ["en"] }` configurations above; run `ng serve` for German and `ng serve --configuration=en` for English.
- In `ng serve` the single locale is served FLAT at `/`, not under `/en/` — the dev-server forces `forceI18nFlatOutput = true`. Verified: `ng serve --configuration=en` served the English app at `/` with `<base href="/">`. Consequence: the language switcher renders self-referential links in dev (on the English dev server `/socials` links to `/socials`). This is a dev-only artifact, correct in production. MITIGATION: do not debug the switcher against the dev server — check it in `dist/website/browser/**/index.html` after a real build, or serve `dist/website/browser` with a static file server.
- Setting the `prerender` option alongside `outputMode` is silently ignored, with only a warning: `The "prerender" option is not considered when "outputMode" is specified.` (same for `appShell`). MITIGATION: do not set `prerender` at all — `outputMode: "static"` plus a `server` entry already implies it.
- ICU sub-messages get auto-generated hash ids even when the enclosing block has an explicit `@@id`. My plural and select blocks produced units `2405394560527577599` and `3580618296572647636` alongside `page.plural`/`page.select`. Those hash ids change if you edit the German ICU source, silently orphaning the English translation. MITIGATION: `"i18nMissingTranslation": "error"` turns the orphan into a build failure instead of an untranslated string shipping to production. This is the main reason to set it.
- Assets are duplicated into every locale directory (`favicon.ico` appears in both `browser/` and `browser/en/`), and each locale carries a full copy of the JS/CSS bundles. FTP upload volume is roughly double a single-locale site. MITIGATION: use an FTP client that syncs by timestamp/size (lftp mirror, WinSCP sync) rather than uploading everything; treat `browser/` and `browser/en/` as separate trees.
- Never flatten the two locale directories into one. `browser/main-<HASH>.js` and `browser/en/main-<HASH>.js` share a filename but have different contents (German vs. English strings inlined). Any deploy step that collapses directories, or an FTP tool that dedupes by basename, would serve one locale's bundle to the other. MITIGATION: preserve the directory structure verbatim; the `<base href>` per locale is what keeps the two apart at runtime.
- Hardcoded absolute asset paths in templates (`/assets/logo.png`) resolve against the document root, NOT the locale base href, so the English site would load the German copy of the asset. Relative paths (`assets/logo.png`) resolve against `<base href="/en/">` and pick up the correct per-locale copy. Harmless for locale-independent images, wrong for anything localized (e.g. a German screenshot). MITIGATION: use relative asset paths in templates.
- A genuine 404 under `/en/` will serve the GERMAN error page unless you deploy a second `.htaccess` inside `en/`, and you cannot ship that through `projects/website/public/` because assets are copied identically into both locale directories. MITIGATION: keep `deploy/root.htaccess` and `deploy/en.htaccess` in the repo and upload them as an explicit FTP step, or make a single bilingual 404 page and accept one `ErrorDocument`.
- Deploy ordering can serve a broken site briefly: HTML references hashed bundles, and every locale's bundles are renamed whenever ANY locale's translations change. If HTML uploads before JS, visitors hit 404s on the new bundle names. MITIGATION: upload hashed assets first, HTML last; and set `Cache-Control: no-cache` on `.html` (as in the `.htaccess` above) so a deploy is actually picked up.
- angular-cli issue #31877 produced an infinite meta-refresh loop in `en/index.html` when i18n was combined with `prerender: { routesFile, discoverRoutes: false }`. It is closed (PRs #31910, #31884) and does not apply to this configuration, since `outputMode` ignores the `prerender` option entirely and route discovery stays on. Flagged only so it is not mistaken for a new bug if a stale `prerender` block is left in `angular.json`.
- angular-cli issue #29398: `subPath` uniqueness used to be validated globally, breaking separate per-locale builds that each used `subPath: ""`. Fixed (PR #29422); on 22.1.4 the check applies only to locales inlined in the same build, which is why `sourceLocale.subPath: ""` plus `en.subPath: "en"` validates cleanly here. Two locales sharing a subPath in one build still throws `Locales 'X' and 'Y' cannot have the same subPath`.
