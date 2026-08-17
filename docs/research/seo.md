## RECOMMENDATION

Everything below was built and verified in a real Angular 22.1.4 lab copy of this repo (`@angular/build` 22.1.4, `@angular/ssr` 22.1.4, `@angular/core` 22.1.2, Node 26). The lab produced 14 prerendered routes across both locales, a 12-URL sitemap with hreflang, generated icons, and per-locale `.htaccess` files.

## 0. Foundation: `outputMode: static` + `@angular/localize` (both locales in ONE build)

This is the load-bearing decision. Angular 22 prerenders **both locales in a single `ng build`** — verified: `Prerendered 14 static routes.`

```bash
npm i @angular/localize
```

`angular.json` (project `website`):

```jsonc
"i18n": {
  "sourceLocale": { "code": "de", "subPath": "" },   // German at /
  "locales": {
    "en": {
      "translation": "projects/website/src/locale/messages.en.xlf",
      "subPath": "en"                                 // English at /en/
    }
  }
},
"architect": { "build": { "options": {
  "browser": "projects/website/src/main.ts",
  "server":  "projects/website/src/main.server.ts",   // still required for prerendering
  "outputMode": "static",                             // no server runtime, no server.mjs
  "localize": true,
  "polyfills": ["@angular/localize/init"],
  "assets": [{ "glob": "**/*", "input": "projects/website/public" }]
  // delete the "ssr" block entirely
}}}
```

`projects/website/tsconfig.app.json`: `"types": ["node", "@angular/localize"]`.

Then delete `projects/website/src/server.ts`, drop `express` + `@types/express` from `package.json`, and drop the `serve:ssr:website` script.

An empty `subPath` **is** legal (schema pattern `^[\w-]*$`) and puts German at the root. Angular then emits per locale, automatically: `<html lang="de|en" dir="ltr">` and `<base href="/">` / `<base href="/en/">`. You never write those yourself.

Output layout (this is what you FTP — upload the contents of `dist/website/browser/`):

```
dist/website/prerendered-routes.json     <- machine-readable route list (see §1)
dist/website/browser/index.html          /            (de)
dist/website/browser/support/index.html  /support/    (de)
dist/website/browser/en/index.html       /en/         (en)
dist/website/browser/en/support/index.html
...
```

## 3. Per-page title/description/canonical/OG/Twitter — route `data` + `TitleStrategy`

There is **no built-in SEO API in Angular 22** (verified against angular.dev v22 docs). The idiomatic hook is a custom `TitleStrategy` — it is a stable API, fires on every navigation _including the prerender pass_, and needs no resolver. Resolvers are the wrong tool here: the data is static.

The trick that removes all duplication: **put `$localize` strings directly in route `data`**. `ng extract-i18n` extracts them (verified — `seo.home.title`, `seo.apps.description`, … all landed in `messages.xlf` alongside template messages), and they get inlined per locale at build time. One route table, two languages, zero parallel structures.

`src/app/seo/site.config.ts`:

```ts
export const SITE = {
  origin: 'https://boundfoxstudios.com',
  name: 'Bound Fox Studios',
  twitter: '@boundfoxstudios',
  defaultImage: '/og/default.png',
} as const;

export interface LocaleConfig {
  readonly code: string;
  readonly hreflang: string;
  readonly subPath: string;
  readonly ogLocale: string;
}

export const LOCALES: readonly LocaleConfig[] = [
  { code: 'de', hreflang: 'de', subPath: '', ogLocale: 'de_DE' },
  { code: 'en', hreflang: 'en', subPath: 'en', ogLocale: 'en_US' },
];

// Which version an unmatched visitor should get. English for an international
// OSS/game audience; switch to LOCALES[0] if German should be the fallback.
export const X_DEFAULT_LOCALE = LOCALES[1];
```

`src/app/seo/seo.types.ts`:

```ts
export interface PageSeo {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}
```

`src/app/seo/seo.service.ts`:

```ts
import { DOCUMENT, Injectable, LOCALE_ID, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LOCALES, SITE, X_DEFAULT_LOCALE } from './site.config';
import { PageSeo } from './seo.types';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly localeId = inject(LOCALE_ID);

  apply(seo: PageSeo, routePath: string): void {
    const locale = LOCALES.find(entry => this.localeId.startsWith(entry.code)) ?? LOCALES[0];
    const canonical = this.absoluteUrl(locale.subPath, routePath);
    const image = new URL(seo.image ?? SITE.defaultImage, SITE.origin).href;

    this.title.setTitle(seo.title);

    this.setNamedTags({
      description: seo.description,
      robots: seo.noIndex ? 'noindex, follow' : 'index, follow',
      'twitter:card': 'summary_large_image',
      'twitter:site': SITE.twitter,
    });

    this.setPropertyTags({
      'og:title': seo.title,
      'og:description': seo.description,
      'og:url': canonical,
      'og:image': image,
      'og:type': seo.type ?? 'website',
      'og:site_name': SITE.name,
      'og:locale': locale.ogLocale,
    });

    // A page that must not be indexed has no canonical identity to declare, and the
    // 404 document is served under arbitrary URLs where a canonical would be a lie.
    if (seo.noIndex) {
      return;
    }

    this.setLink('canonical', canonical);

    for (const entry of LOCALES) {
      this.setAlternate(entry.hreflang, this.absoluteUrl(entry.subPath, routePath));
    }
    this.setAlternate('x-default', this.absoluteUrl(X_DEFAULT_LOCALE.subPath, routePath));
  }

  setJsonLd(identifier: string, data: unknown): void {
    const existing = this.document.head.querySelector<HTMLScriptElement>(
      `script[data-jsonld="${identifier}"]`,
    );
    const script = existing ?? this.document.createElement('script');
    if (!existing) {
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-jsonld', identifier);
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  private absoluteUrl(subPath: string, routePath: string): string {
    const segments = [subPath, routePath].filter(Boolean).join('/');
    return segments ? `${SITE.origin}/${segments}/` : `${SITE.origin}/`;
  }

  private setNamedTags(tags: Record<string, string>): void {
    for (const [name, content] of Object.entries(tags)) {
      this.meta.updateTag({ name, content }, `name='${name}'`);
    }
  }

  private setPropertyTags(tags: Record<string, string>): void {
    for (const [property, content] of Object.entries(tags)) {
      this.meta.updateTag({ property, content }, `property='${property}'`);
    }
  }

  private setLink(rel: string, href: string): void {
    const existing = this.document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    const link = existing ?? this.document.createElement('link');
    if (!existing) {
      link.setAttribute('rel', rel);
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setAlternate(hreflang: string, href: string): void {
    const existing = this.document.head.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${hreflang}"]`,
    );
    const link = existing ?? this.document.createElement('link');
    if (!existing) {
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
```

`src/app/seo/seo-title.strategy.ts`:

```ts
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SeoService } from './seo.service';
import { PageSeo } from './seo.types';

@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(state: RouterStateSnapshot): void {
    const seo = this.resolveSeo(state.root);
    if (!seo) {
      return;
    }
    const routePath = state.url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
    this.seo.apply(seo, routePath);
  }

  private resolveSeo(route: ActivatedRouteSnapshot): PageSeo | undefined {
    let current: ActivatedRouteSnapshot | null = route;
    let found: PageSeo | undefined;
    while (current) {
      found = (current.data['seo'] as PageSeo | undefined) ?? found;
      current = current.firstChild;
    }
    return found;
  }
}
```

`state.url` is already base-href-relative, so the same code yields `/support/` for German and `/en/support/` for English.

`src/app/app.routes.ts`:

```ts
import { Routes } from '@angular/router';
import { PageSeo } from './seo/seo.types';

const seo = (data: PageSeo): { seo: PageSeo } => ({ seo: data });

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.page').then(m => m.HomePage),
    data: seo({
      title: $localize`:@@seo.home.title:Bound Fox Studios – Open-Source-Apps und Spiele`,
      description: $localize`:@@seo.home.description:Bound Fox Studios entwickelt Open-Source-Apps und Spiele.`,
    }),
  },
  {
    path: 'apps-and-games',
    loadComponent: () => import('./pages/apps.page').then(m => m.AppsPage),
    data: seo({
      title: $localize`:@@seo.apps.title:Apps und Spiele – Bound Fox Studios`,
      description: $localize`:@@seo.apps.description:Alle Apps und Spiele von Bound Fox Studios.`,
    }),
  },
  // support, socials, legal-details-imprint, privacy-policy — same shape
  {
    path: '404',
    loadComponent: () => import('./pages/not-found.page').then(m => m.NotFoundPage),
    data: seo({
      title: $localize`:@@seo.notFound.title:Seite nicht gefunden – Bound Fox Studios`,
      description: $localize`:@@seo.notFound.description:Diese Seite existiert nicht.`,
      noIndex: true,
    }),
  },
  {
    path: '**', // same component => hydration matches
    loadComponent: () => import('./pages/not-found.page').then(m => m.NotFoundPage),
    data: seo({
      title: $localize`:@@seo.notFound.title:Seite nicht gefunden – Bound Fox Studios`,
      description: $localize`:@@seo.notFound.description:Diese Seite existiert nicht.`,
      noIndex: true,
    }),
  },
];
```

`src/app/app.config.ts`:

```ts
providers: [
  provideBrowserGlobalErrorListeners(),
  provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
  provideClientHydration(withEventReplay()),
  { provide: TitleStrategy, useClass: SeoTitleStrategy },
],
```

Do **not** set `noIndex` on imprint/privacy — they are legitimate indexable pages; only the 404 is noindex.

**Survives prerendering?** Yes, verified in the emitted HTML. `dist/website/browser/en/apps-and-games/index.html`:

```html
<html
  lang="en"
  dir="ltr"
>
  <head>
    <title>EN: Apps und Spiele – Bound Fox Studios</title>
    <base href="/en/" />
    <meta
      name="description"
      content="…"
    />
    <meta
      name="robots"
      content="index, follow"
    />
    <meta
      name="twitter:card"
      content="summary_large_image"
    />
    <meta
      name="twitter:site"
      content="@boundfoxstudios"
    />
    <meta
      property="og:title"
      …
    />
    <meta
      property="og:url"
      content="https://boundfoxstudios.com/en/apps-and-games/"
    />
    <meta
      property="og:locale"
      content="en_US"
    />
    <link
      rel="canonical"
      href="https://boundfoxstudios.com/en/apps-and-games/"
    />
    <link
      rel="alternate"
      hreflang="de"
      href="https://boundfoxstudios.com/apps-and-games/"
    />
    <link
      rel="alternate"
      hreflang="en"
      href="https://boundfoxstudios.com/en/apps-and-games/"
    />
    <link
      rel="alternate"
      hreflang="x-default"
      href="https://boundfoxstudios.com/en/apps-and-games/"
    />
  </head>
</html>
```

`Meta`/`Title`/`DOCUMENT` all work on the server renderer, so everything lands in the static file — no JS needed at crawl time.

## 4. hreflang tags — exact set for this URL scheme

Every page emits all three (self-reference included, as Google requires). Emitted automatically by `SeoService`; e.g. for `/support`:

```html
<link
  rel="alternate"
  hreflang="de"
  href="https://boundfoxstudios.com/support/"
/>
<link
  rel="alternate"
  hreflang="en"
  href="https://boundfoxstudios.com/en/support/"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="https://boundfoxstudios.com/en/support/"
/>
```

Home page:

```html
<link
  rel="alternate"
  hreflang="de"
  href="https://boundfoxstudios.com/"
/>
<link
  rel="alternate"
  hreflang="en"
  href="https://boundfoxstudios.com/en/"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="https://boundfoxstudios.com/en/"
/>
```

Use bare `de` / `en` (not `de-DE`) — you target languages, not regions. Both pages of a pair link to each other **and** to themselves, which is Google's reciprocity requirement. Trailing slashes everywhere, matching what Apache actually serves (`DirectorySlash` 301s `/support` → `/support/`), so canonical == served URL.

## 1. sitemap.xml — generate it from the prerendered HTML, not from a hand-written list

**Angular 22 has nothing built-in for sitemaps.** But it does emit `dist/website/prerendered-routes.json`:

```json
{ "routes": { "/": {}, "/404": {}, "/apps-and-games": {}, "/en": {}, "/en/apps-and-games": {}, … } }
```

(14 entries, locale prefixes included — verified.) That file is a fine input, but the **better** input is the prerendered HTML itself: it already contains the canonical URL, the robots directive and the full hreflang set that the app decided on. Reading those back means the sitemap can never disagree with the pages — no second source of truth, no route list to maintain, and adding a route to `app.routes.ts` is the only edit ever needed.

`tools/seo/generate-sitemap.mjs` (no dependencies):

```js
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const BROWSER_DIR = 'dist/website/browser';
const LASTMOD_DB = 'tools/seo/lastmod.json';

const CANONICAL = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i;
const ROBOTS = /<meta[^>]+name="robots"[^>]+content="([^"]+)"/i;
const ALTERNATE = /<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"/gi;

async function findIndexFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name === 'index.html') {
      found.push(join(entry.parentPath, entry.name));
    }
  }
  return found.sort();
}

// Everything a search engine would notice, minus what changes on every build
// (bundle hashes, inlined critical CSS, hydration annotations). JSON-LD is kept.
function contentFingerprint(html) {
  return html
    .replace(/<script(?![^>]*ld\+json)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<link[^>]*rel="(?:stylesheet|modulepreload|preload)"[^>]*>/gi, '')
    .replace(/<noscript>[\s\S]*?<\/noscript>/gi, '')
    .replace(/\sngh="[^"]*"|\sng-version="[^"]*"|\sng-server-context="[^"]*"/g, '')
    .replace(/\sdata-beasties-container/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readLastmodDatabase() {
  try {
    return JSON.parse(await readFile(LASTMOD_DB, 'utf8'));
  } catch {
    return {};
  }
}

const pages = [];
const lastmodDatabase = await readLastmodDatabase();
const nextLastmodDatabase = {};
const today = new Date().toISOString().slice(0, 10);

for (const file of await findIndexFiles(BROWSER_DIR)) {
  const html = await readFile(file, 'utf8');
  if ((ROBOTS.exec(html)?.[1] ?? '').includes('noindex')) {
    continue;
  }

  const canonical = CANONICAL.exec(html)?.[1];
  if (!canonical) {
    throw new Error(`No canonical URL in ${file} — the SEO strategy did not run for this route.`);
  }

  const alternates = [...html.matchAll(ALTERNATE)].map(([, hreflang, href]) => ({
    hreflang,
    href,
  }));
  const key = relative(BROWSER_DIR, file).split(sep).join('/');
  const hash = createHash('sha256').update(contentFingerprint(html)).digest('hex').slice(0, 16);
  const previous = lastmodDatabase[key];
  const lastmod = previous?.hash === hash ? previous.lastmod : today;

  nextLastmodDatabase[key] = { hash, lastmod };
  pages.push({ canonical, alternates, lastmod, changed: previous?.hash !== hash });
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...pages.map(({ canonical, alternates, lastmod }) =>
    [
      '  <url>',
      `    <loc>${canonical}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      ...alternates.map(
        ({ hreflang, href }) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`,
      ),
      '  </url>',
    ].join('\n'),
  ),
  '</urlset>',
  '',
].join('\n');

const changedUrls = pages.filter(page => page.changed).map(({ canonical }) => canonical);

await writeFile(join(BROWSER_DIR, 'sitemap.xml'), xml);
await writeFile(LASTMOD_DB, `${JSON.stringify(nextLastmodDatabase, null, 2)}\n`);
await writeFile('dist/changed-urls.json', `${JSON.stringify(changedUrls, null, 2)}\n`);

console.log(`sitemap.xml: ${pages.length} URLs, ${changedUrls.length} changed`);
```

Verified output (excerpt) — 12 URLs, 6 pages × 2 locales, 404 excluded:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://boundfoxstudios.com/support/</loc>
    <lastmod>2026-08-17</lastmod>
    <xhtml:link rel="alternate" hreflang="de" href="https://boundfoxstudios.com/support/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://boundfoxstudios.com/en/support/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://boundfoxstudios.com/en/support/"/>
  </url>
  <url>
    <loc>https://boundfoxstudios.com/en/support/</loc>
    <lastmod>2026-08-17</lastmod>
    <xhtml:link rel="alternate" hreflang="de" href="https://boundfoxstudios.com/support/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://boundfoxstudios.com/en/support/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://boundfoxstudios.com/en/support/"/>
  </url>
</urlset>
```

**Honest `lastmod` without any manual work**: `tools/seo/lastmod.json` (committed) stores a content fingerprint per page. Unchanged page → old date kept; changed page → today. Verified: two identical rebuilds produced a byte-identical `lastmod.json`; editing one route's description bumped exactly that one page; a JSON-LD-only edit bumped exactly the two apps pages. This also yields `dist/changed-urls.json` for IndexNow (§8).

The script **throws** if any prerendered page lacks a canonical link — a free build-time guard that catches a route added without `data.seo`.

## 2. robots.txt

`projects/website/public/robots.txt` (Angular copies `public/` verbatim):

```
User-agent: *
Allow: /

Sitemap: https://boundfoxstudios.com/sitemap.xml
```

That is the whole file, and it is the right file. Do not block `/en/` or add per-bot rules: the site has nothing to hide, everything indexable is in the sitemap, and no `Disallow` is needed since Apache serves nothing but the built output. Keep AI crawlers allowed — for an open-source studio, being quotable in AI answers is distribution, not leakage. (If that ever changes, the place to add `User-agent: GPTBot / Disallow: /` is here.)

Angular duplicates `public/` into every locale directory, so a stray `/en/robots.txt` is produced; crawlers only ever read the root one, and the finalize script (§7) deletes it anyway.

## 5. JSON-LD

Emit three things. `Organization` and `WebSite` site-wide from `App`, plus one `ItemList` of `SoftwareApplication` / `VideoGame` on `/apps-and-games`. All are injected through `SeoService.setJsonLd()` and land in the prerendered `<head>` — verified.

Be clear-eyed about payoff: `SoftwareApplication` produces **no rich result** in Google today. It is still worth emitting — it costs one array, it feeds entity/knowledge understanding and AI answer engines, and `sameAs` on `Organization` is the single most useful structured-data field you have for a small studio (knowledge-panel entity resolution).

`src/app/seo/json-ld.ts`:

```ts
import { SITE } from './site.config';
import { SOCIALS } from '../socials.catalog';

export function organizationJsonLd(): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.origin}/#organization`,
    name: SITE.name,
    url: `${SITE.origin}/`,
    logo: `${SITE.origin}/icons/icon-512.png`,
    foundingLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressCountry: 'DE' },
    },
    sameAs: SOCIALS.map(entry => entry.url), // same array that renders /socials
  };
}

export function webSiteJsonLd(): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.origin}/#website`,
    url: `${SITE.origin}/`,
    name: SITE.name,
    publisher: { '@id': `${SITE.origin}/#organization` },
    inLanguage: ['de', 'en'],
  };
}
```

`src/app/app.ts`:

```ts
export class App {
  constructor() {
    const seo = inject(SeoService);
    seo.setJsonLd('organization', organizationJsonLd());
    seo.setJsonLd('website', webSiteJsonLd());
  }
}
```

`src/app/apps.catalog.ts` — **one array drives both the rendered page and the JSON-LD**:

```ts
export interface AppEntry {
  slug: string;
  name: string;
  kind: 'SoftwareApplication' | 'VideoGame';
  category: string; // 'GameApplication' | 'ProductivityApplication' | …
  operatingSystems: string[];
  description: string;
  url: string;
  repository?: string;
  price?: string; // '0' for free
}

export const APPS: readonly AppEntry[] = [/* … */];
```

`src/app/pages/apps.page.ts`:

```ts
export class AppsPage {
  protected readonly apps = APPS; // rendered in the template

  constructor() {
    inject(SeoService).setJsonLd('apps', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: APPS.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': entry.kind,
          '@id': `${SITE.origin}/#${entry.slug}`,
          name: entry.name,
          description: entry.description,
          url: entry.url,
          applicationCategory: entry.category,
          operatingSystem: entry.operatingSystems.join(', '),
          author: { '@id': `${SITE.origin}/#organization` },
          ...(entry.repository ? { codeRepository: entry.repository } : {}),
          ...(entry.price !== undefined
            ? { offers: { '@type': 'Offer', price: entry.price, priceCurrency: 'EUR' } }
            : {}),
        },
      })),
    });
  }
}
```

Verified emitted output on `/apps-and-games/`:

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "SoftwareApplication",
        "@id": "https://boundfoxstudios.com/#foxy-notes",
        "name": "Foxy Notes",
        "description": "Open-source note taking.",
        "url": "…/apps-and-games/#foxy-notes",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "iOS, Android",
        "author": { "@id": "https://boundfoxstudios.com/#organization" },
        "codeRepository": "https://github.com/boundfoxstudios/foxy-notes",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" }
      }
    }
  ]
}
```

Skip `BreadcrumbList` (a flat six-page site has no breadcrumbs to describe) and skip `FAQPage` (Google removed FAQ rich results in May 2026).

## 6. Favicons / icons / manifest — generated at build time

The 2026 minimal complete set is four artifacts plus the manifest: `favicon.ico` (32+48 — Google wants multiples of 48px), `icon.svg` (theme-adaptive, scales), `apple-touch-icon.png` 180×180 **opaque** (iOS ignores `rel=icon` and composites transparency onto black), and 192/512 PNGs plus a maskable 512 for Android/PWA.

```bash
npm i -D sharp png-to-ico     # sharp 0.35.3, png-to-ico 3.0.2
```

Source of truth: `projects/website/branding/icon.svg` (preferred — sharp rasterizes SVG, and only a vector source can produce `icon.svg`). A `branding/icon.png` at ≥1024px is used as fallback if no SVG exists; in that case drop the `icon.svg` `<link>`.

`tools/seo/generate-icons.mjs`:

```js
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const SOURCE_SVG = 'projects/website/branding/icon.svg';
const SOURCE_PNG = 'projects/website/branding/icon.png';
const PUBLIC_DIR = 'projects/website/public';
const BACKGROUND = '#0f1115';

const exists = async path =>
  access(path)
    .then(() => true)
    .catch(() => false);
const source = (await exists(SOURCE_SVG)) ? SOURCE_SVG : SOURCE_PNG;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

// Composited onto an explicit canvas rather than resize+extend, because sharp
// applies its operations in a fixed order that would flatten before extending.
const render = async (size, { padding = 0, background = TRANSPARENT } = {}) => {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(source, { density: 512 })
    .resize(inner, inner, { fit: 'contain', background: TRANSPARENT })
    .png()
    .toBuffer();

  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
};

await mkdir(join(PUBLIC_DIR, 'icons'), { recursive: true });

const [ico32, ico48, appleTouch, icon192, icon512, maskable512] = await Promise.all([
  render(32),
  render(48),
  render(180, { background: BACKGROUND }), // must be opaque
  render(192),
  render(512),
  render(512, { padding: 0.1, background: BACKGROUND }), // maskable safe zone
]);

await Promise.all([
  writeFile(join(PUBLIC_DIR, 'favicon.ico'), await pngToIco([ico32, ico48])),
  writeFile(join(PUBLIC_DIR, 'apple-touch-icon.png'), appleTouch),
  writeFile(join(PUBLIC_DIR, 'icons/icon-192.png'), icon192),
  writeFile(join(PUBLIC_DIR, 'icons/icon-512.png'), icon512),
  writeFile(join(PUBLIC_DIR, 'icons/maskable-512.png'), maskable512),
]);

if (source === SOURCE_SVG) {
  const { readFile } = await import('node:fs/promises');
  await writeFile(join(PUBLIC_DIR, 'icon.svg'), await readFile(SOURCE_SVG));
}

console.log(`icons generated from ${source}`);
```

Verified: `favicon.ico` header `00 00 01 00 02 00` → 2 images at 32 and 48; `apple-touch-icon.png` 180×180 opaque; `maskable-512.png` 512×512 opaque with 10% safe zone; `icon-192/512` transparent.

Run it via `npm run generate:icons` when the logo changes and commit the results (icons are branding, not per-build churn — keeping them out of the build keeps `ng build` dependency-free and reproducible).

`projects/website/src/index.html`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <base href="/" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />

    <link
      rel="icon"
      href="/favicon.ico"
      sizes="48x48"
    />
    <link
      rel="icon"
      href="/icon.svg"
      type="image/svg+xml"
    />
    <link
      rel="apple-touch-icon"
      href="/apple-touch-icon.png"
    />
    <link
      rel="manifest"
      href="manifest.webmanifest"
    />
    <meta
      name="theme-color"
      content="#0f1115"
    />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

Note the deliberate asymmetry, verified in the output: icons use **absolute** paths (one copy at the root, shared by both locales), the manifest uses a **relative** path so `<base href="/en/">` resolves it to `/en/manifest.webmanifest` — the locale-specific manifest written by the finalize script (correct `lang`, `start_url`, `scope`).

## 7. 404 on Apache with no server runtime, plus the full `.htaccess`

The 404 page is just another prerendered route. `path: '404'` produces `/404/index.html` and `/en/404/index.html`; the `**` route maps to the **same component**, so when the client boots at `/typo` the DOM matches what was prerendered and hydration is clean. Apache serves the file with a real 404 status via `ErrorDocument`, and per-locale branding comes from a second `.htaccess` inside `/en/` — `ErrorDocument` is per-directory, and `/en/` is the deepest existing directory for any `/en/**` miss.

`projects/website/public/.htaccess` (root — copied automatically; dotfiles **are** picked up by Angular's `**/*` asset glob, verified):

```apache
Options -Indexes -MultiViews
DirectorySlash On
DirectoryIndex index.html
AddDefaultCharset utf-8
ServerSignature Off

ErrorDocument 404 /404/index.html

<IfModule mod_rewrite.c>
  RewriteEngine On

  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://boundfoxstudios.com%{REQUEST_URI} [R=301,L]

  RewriteCond %{HTTP_HOST} !^boundfoxstudios\.com$ [NC]
  RewriteRule ^ https://boundfoxstudios.com%{REQUEST_URI} [R=301,L]

  RewriteCond %{THE_REQUEST} \s/+(.*/)?index\.html[\s?] [NC]
  RewriteRule ^(.*/)?index\.html$ /%1 [R=301,L]
</IfModule>

<IfModule mod_mime.c>
  AddType application/manifest+json      webmanifest
  AddType image/svg+xml                  svg svgz
  AddType application/xml                xml
  AddType text/plain                     txt
  AddCharset utf-8 .html .css .js .json .webmanifest .xml .txt .svg
</IfModule>

<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/css text/xml \
    application/javascript application/json application/xml application/manifest+json \
    image/svg+xml application/rss+xml
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml \
    application/javascript application/json application/xml application/manifest+json \
    image/svg+xml application/rss+xml
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" env=HTTPS
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set Permissions-Policy "geolocation=(), camera=(), microphone=(), interest-cohort=()"
  Header always unset X-Powered-By

  <FilesMatch "\.(js|css|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  <FilesMatch "\.(png|jpg|jpeg|webp|avif|svg|ico)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>

  <FilesMatch "\.(html|webmanifest)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>

  <FilesMatch "\.(xml|txt)$">
    Header set Cache-Control "public, max-age=3600"
  </FilesMatch>
</IfModule>

<FilesMatch "^\.ht">
  Require all denied
</FilesMatch>
```

`immutable` for JS/CSS is safe because `outputHashing: "all"` is already on in the production configuration. HTML is `must-revalidate` so an FTP deploy is visible immediately. `-MultiViews` matters: without it Apache content-negotiation can answer `/support` with something unexpected. The deny block is narrowed to `^\.ht` on purpose so `/.well-known/security.txt` stays reachable.

`tools/seo/finalize-dist.mjs` — undoes Angular's per-locale asset duplication, writes the per-locale manifests and the `/en/.htaccess`, and regenerates `security.txt`:

```js
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BROWSER_DIR = 'dist/website/browser';
const LOCALE_SUBPATHS = ['en'];

// Angular copies every file in `public/` into each locale directory. These belong
// to the site root only, so the localized copies are removed after the build.
const ROOT_ONLY = [
  'robots.txt',
  'favicon.ico',
  'icon.svg',
  'apple-touch-icon.png',
  'icons',
  '.well-known',
];

for (const subPath of LOCALE_SUBPATHS) {
  for (const entry of ROOT_ONLY) {
    await rm(join(BROWSER_DIR, subPath, entry), { recursive: true, force: true });
  }
}

for (const entry of await readdir(BROWSER_DIR, { withFileTypes: true, recursive: true })) {
  if (entry.name === 'index.csr.html') {
    await rm(join(entry.parentPath, entry.name), { force: true });
  }
}

const manifest = (locale, subPath, name) => ({
  id: subPath ? `/${subPath}/` : '/',
  name,
  short_name: 'Bound Fox',
  lang: locale,
  start_url: subPath ? `/${subPath}/` : '/',
  scope: subPath ? `/${subPath}/` : '/',
  display: 'minimal-ui',
  background_color: '#0f1115',
  theme_color: '#0f1115',
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
});

await writeFile(
  join(BROWSER_DIR, 'manifest.webmanifest'),
  `${JSON.stringify(manifest('de', '', 'Bound Fox Studios'), null, 2)}\n`,
);
await writeFile(
  join(BROWSER_DIR, 'en', 'manifest.webmanifest'),
  `${JSON.stringify(manifest('en', 'en', 'Bound Fox Studios'), null, 2)}\n`,
);

for (const subPath of LOCALE_SUBPATHS) {
  await writeFile(
    join(BROWSER_DIR, subPath, '.htaccess'),
    `ErrorDocument 404 /${subPath}/404/index.html\n`,
  );
}

// RFC 9116 requires an Expires date, and an expired file reads as an abandoned
// disclosure programme — so it is regenerated on every deploy instead of by hand.
const expires = new Date();
expires.setUTCFullYear(expires.getUTCFullYear() + 1);

await mkdir(join(BROWSER_DIR, '.well-known'), { recursive: true });
await writeFile(
  join(BROWSER_DIR, '.well-known', 'security.txt'),
  [
    'Contact: mailto:security@boundfoxstudios.com',
    'Contact: https://github.com/boundfoxstudios',
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
    'Preferred-Languages: de, en',
    'Canonical: https://boundfoxstudios.com/.well-known/security.txt',
    '',
  ].join('\n'),
);

console.log('dist finalized');
```

`package.json`:

```json
"scripts": {
  "build": "ng build",
  "postbuild": "node tools/seo/finalize-dist.mjs && node tools/seo/generate-sitemap.mjs",
  "generate:icons": "node tools/seo/generate-icons.mjs",
  "i18n:extract": "ng extract-i18n --output-path projects/website/src/locale --format xlf"
}
```

npm runs `postbuild` automatically after `build` — do **not** also chain it inside `build` (I did that by accident in the lab and it ran twice).

Verified final upload tree:

```
.htaccess                  .well-known/security.txt   robots.txt   sitemap.xml
index.html                 404/index.html             apps-and-games/index.html
support/index.html         socials/index.html         legal-details-imprint/index.html
privacy-policy/index.html  manifest.webmanifest
favicon.ico  icon.svg  apple-touch-icon.png  icons/{icon-192,icon-512,maskable-512}.png
en/.htaccess  en/index.html  en/404/index.html  en/…/index.html  en/manifest.webmanifest
```

## 8. What else earns its place

**Yes — IndexNow.** Bing stopped accepting sitemap pings; IndexNow replaced them, and Google never adopted it. `dist/changed-urls.json` already contains exactly the URLs whose content changed, so the notification is precise instead of a blanket resubmit. Put a random 32-char key in `projects/website/public/<key>.txt` containing the key itself, then post-deploy:

```js
// tools/seo/index-now.mjs
import { readFile } from 'node:fs/promises';
const key = process.env.INDEXNOW_KEY;
const urlList = JSON.parse(await readFile('dist/changed-urls.json', 'utf8'));
if (!key || urlList.length === 0) process.exit(0);

const response = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: 'boundfoxstudios.com',
    key,
    keyLocation: `https://boundfoxstudios.com/${key}.txt`,
    urlList,
  }),
});
console.log(`IndexNow: ${urlList.length} URLs -> ${response.status}`);
```

**Yes — security.txt** (`/.well-known/security.txt`, generated above). An open-source studio gets unsolicited security reports; RFC 9116 gives them somewhere to land. The reason to generate rather than hand-write it is precisely the `Expires` field: a stale one signals an abandoned programme, and every deploy silently refreshes it.

**Yes — Search Console + Bing Webmaster Tools verification via DNS TXT**, not an HTML file. DNS verification survives every redeploy and every FTP mishap, and it covers the whole domain including `/en/`. Submit `https://boundfoxstudios.com/sitemap.xml` once in each; both locales are in that one file.

**No — RSS.** Six static pages with no chronological content. A feed nobody can subscribe to meaningfully is maintenance debt. The moment a devlog or release-notes section exists, generate `feed.xml` from that same route/entry array in `postbuild` — the pattern is already in place.

**No — llms.txt.** As of Q1 2026 no major AI vendor consumes it; Google's Gary Illyes stated on the record that Google does not support it and does not plan to, and crawler-log studies show GPTBot/ClaudeBot/PerplexityBot fetch HTML directly and skip the file. Your prerendered HTML plus JSON-LD is already the machine-readable surface that actually gets read.

**No — humans.txt.** Dead convention; the `/socials` page and the GitHub org do the job.

**Worth adding: one OG image, maybe generated.** A single branded 1200×630 `public/og/default.png` covers every page and is what `SITE.defaultImage` points at. Per-page OG images (title text composited onto the brand background) are a natural extension of `generate-icons.mjs` with `sharp` — worth it only once page titles start differing enough to matter; the `PageSeo.image` field is already there for it.

**Worth adding: `@angular/ssr` is still a dependency** even in static mode (it drives prerendering), but `express` and `@types/express` are not — remove them.

## FINDINGS

- Angular 22.1.4 prerenders BOTH locales in a single `ng build` with `outputMode: "static"` + `localize: true` — verified in a lab copy of this repo: `Prerendered 14 static routes.` (7 routes x 2 locales). No separate per-locale build, no server runtime, no `ssr.entry` needed (only `server: main.server.ts`).
- `i18n.sourceLocale.subPath: ""` is legal (angular.json schema pattern `^[\w-]*$`) and puts German at `/` while `locales.en.subPath: "en"` puts English at `/en/`. Angular then emits `<html lang="de|en" dir="ltr">` and `<base href="/">` / `<base href="/en/">` automatically — verified in the output HTML.
- `$localize` tagged strings placed in route `data` ARE extracted by `ng extract-i18n` (verified: `seo.home.title`, `seo.apps.description`, etc. appeared in `messages.xlf` alongside template messages) and are inlined per locale at build time. This is the mechanism that makes localized titles/descriptions need zero parallel data structures.
- Angular 22 has NO built-in sitemap generation and no built-in SEO/meta API. `TitleStrategy` (stable API, `@angular/router`) is the idiomatic hook — it fires during the prerender pass, so `Title`, `Meta` and `DOCUMENT`-created `<link>`/`<script>` tags all end up baked into the static HTML. Verified: title, description, robots, twitter:_, og:_, canonical, 3x hreflang and two JSON-LD blocks all present in `dist/website/browser/**/index.html`.
- `@angular/build` writes `dist/website/prerendered-routes.json` — `{"routes":{"/":{},"/404":{},"/apps-and-games":{},"/en":{},"/en/apps-and-games":{},…}}` — with locale subpaths included. Wildcard (`**`) routes are excluded from it (source: `execute-post-bundle.js` only records `renderMode === Prerender && !route.includes('*')`).
- Reading the prerendered HTML back is a better sitemap source than the route config: canonical URL, robots directive and the full hreflang set are already in each file, so the sitemap physically cannot disagree with the pages. Verified end-to-end: 12 URLs emitted, 404 pages excluded via their `noindex` meta.
- A content-fingerprint manifest (`tools/seo/lastmod.json`, committed) gives honest per-page `lastmod` with zero manual input. Verified: two identical rebuilds produced a byte-identical manifest (0 changed); editing one route description bumped exactly that one page; a JSON-LD-only edit bumped exactly the two `/apps-and-games/` pages. The fingerprint must exclude bundle hashes, inlined critical CSS and hydration attributes, but must KEEP `application/ld+json` scripts.
- Angular copies every file from `public/` into EVERY locale directory — including dotfiles. Verified: `public/.htaccess` and `public/robots.txt` landed at both `/` and `/en/`, as did all icons. Dotfiles ARE matched by the `**/*` asset glob (useful for `.htaccess`, noisy for everything else).
- `<link rel="manifest">` must use a RELATIVE href so `<base href="/en/">` resolves it to the locale-specific manifest; icons should use ABSOLUTE hrefs so both locales share one root copy. Verified in the emitted HTML for both locales.
- The 2026 minimal icon set is favicon.ico (32+48; Google wants multiples of 48px), icon.svg, apple-touch-icon.png 180x180 OPAQUE, and 192/512 + maskable-512 PNGs in a webmanifest. browserconfig.xml, mstile PNGs and Safari pinned-tab SVG are obsolete. Verified generation with sharp 0.35.3 + png-to-ico 3.0.2: ICO header `00 00 01 00 02 00` (2 images, 32 and 48), apple-touch opaque, maskable opaque with 10% safe zone.
- sharp applies operations in a FIXED internal order — `.flatten()` runs before `.extend()`, so resize+extend+flatten silently leaves transparent padding. Compositing onto an explicit `sharp({create:{…}})` canvas is the reliable way to pad and set a background.
- Google requires each hreflang set to be self-referencing and reciprocal, with fully-qualified URLs and ISO 639-1 codes (`de`, `en` — not region-only or made-up codes). In sitemaps the `xmlns:xhtml="http://www.w3.org/1999/xhtml"` namespace is mandatory and every `<url>` repeats the identical full alternate set including itself.
- `SoftwareApplication` structured data triggers NO rich result in Google's Rich Results Test as of 2026 — it validates but displays nothing. FAQ rich results were removed May 2026 and HowTo is gone entirely. The markup is still worth emitting for entity/AI-answer understanding; `Organization.sameAs` is the highest-value field for a small studio.
- Bing no longer accepts sitemap pings and Google retired its `/ping?sitemap=` endpoint in June 2023. IndexNow is the replacement (Bing/Yandex/Seznam; Google tested it in 2021 and never adopted it). The `changed-urls.json` produced by the lastmod fingerprinting feeds it exactly the URLs that actually changed.
- llms.txt is not worth shipping: as of Q1 2026 no major AI vendor (OpenAI, Google, Anthropic, Meta, Mistral) reads it in production, Google's Gary Illyes said on the record Google does not and will not support it, and crawler-log studies show GPTBot/ClaudeBot/PerplexityBot fetch HTML directly and skip the file. Adoption sits around 10% of domains and correlates with nothing.
- npm auto-runs a `postbuild` script after `build` — chaining it explicitly inside `build` as well makes it run twice (observed in the lab).

## RISKS

- FTP clients frequently skip hidden files by default, which would silently drop `.htaccess`, `/en/.htaccess` and `/.well-known/security.txt` — producing a generic Apache 404, no HTTPS redirect and no caching. Mitigation: enable 'transfer hidden files' in the client (FileZilla: Server > Force showing hidden files; lftp: `mirror --no-symlinks -R` includes dotfiles by default), and verify after the first deploy with `curl -I https://boundfoxstudios.com/nope` (expect 404 + your branded page) and `curl -I http://boundfoxstudios.com/` (expect 301).
- `.htaccess` only works if the vhost allows it. `AllowOverride` must include at least `FileInfo Indexes Limit Options=Indexes,MultiViews` — on most shared hosting it is `All`, but if it is `None` every directive is silently ignored with no error anywhere. Mitigation: after the first upload, check that `curl -I https://boundfoxstudios.com/main-*.js` returns `Cache-Control: …immutable`; if not, ask the host to raise AllowOverride.
- The branded 404 relies on `/404` and the `**` catch-all rendering the SAME component, so the DOM Angular hydrates at `/typo` matches what was prerendered at `/404`. If they ever diverge (different component, or content that depends on the URL), hydration will throw NG0500-class errors in the console for every 404 visit. Mitigation: keep both routes pointing at `NotFoundPage`, and never render the requested path into that page's markup.
- `RewriteCond %{HTTPS} !=on` is wrong behind a TLS-terminating proxy or CDN and causes an infinite redirect loop. Mitigation: if the host terminates TLS upstream, switch the condition to `RewriteCond %{HTTP:X-Forwarded-Proto} !https`. Test with `curl -sI http://boundfoxstudios.com/` before pointing DNS.
- `Strict-Transport-Security` with `preload` is effectively irreversible for two years and will break any future plain-HTTP subdomain. Mitigation: ship it without `preload` first (`max-age=31536000; includeSubDomains`), confirm every subdomain is HTTPS-only, then add `preload` and submit to hstspreload.org deliberately.
- The sitemap script parses HTML with regexes. It is tightly coupled to the exact attribute order Angular's `Meta`/`DOM` APIs emit (`rel` before `href`, `rel="alternate"` before `hreflang`). An Angular upgrade that reorders attributes would silently produce a sitemap with missing alternates rather than an error. Mitigation: the script already throws when a canonical is missing; add a cheap assertion that every indexable page yielded exactly `LOCALES.length + 1` alternates, or swap the regexes for `jsdom` (already a devDependency in this repo).
- `lastmod.json` must be committed and must survive CI. If it is gitignored or the CI checkout is shallow/clean-slate, every deploy will stamp every page with today's date — exactly the untrustworthy `lastmod` signal Google discounts. Mitigation: commit it, and let the postbuild step's diff show up in `git status` as the record of what changed.
- `X_DEFAULT_LOCALE = LOCALES[1]` points x-default at `/en/` while the bare root `/` serves German. This is valid and deliberate (English as the international fallback for an OSS/games audience), but with no server runtime there is no Accept-Language redirect, so a Japanese visitor typing the bare domain still lands on German. Mitigation: accept it, or flip to `LOCALES[0]` so x-default matches what `/` actually serves — but do not add client-side language redirects, which cause soft-404s and cloaking-adjacent behaviour for crawlers.
- Setting `noIndex: true` also suppresses canonical and hreflang for that page (by design). If imprint/privacy are marked noIndex they vanish from the sitemap AND lose their hreflang pairing. Mitigation: reserve `noIndex` for the 404 page only; German Impressum and Datenschutz pages are legitimately indexable and there is no ranking penalty for having them.
- Angular emits `index.csr.html` fallback shells that are meaningless in a fully static deployment; if uploaded they are dead weight and could theoretically be crawled. The finalize script deletes them — but only for files named exactly `index.csr.html`. Mitigation: keep the FTP sync in mirror/delete mode so removed files never linger on the server from an earlier deploy.
- `mod_brotli` is absent on many shared Apache installs, and `AddOutputFilterByType BROTLI_COMPRESS` inside `<IfModule mod_brotli.c>` then silently does nothing — but so does mod_deflate if `mod_filter` is unavailable. Mitigation: verify with `curl -H 'Accept-Encoding: br,gzip' -I https://boundfoxstudios.com/` and check for `Content-Encoding`; if neither module is present, ask the host rather than shipping uncompressed 250 kB bundles.
