// Mirrors LOCALES.length + 1 from projects/website/src/app/seo/site.config.ts. That file is
// TypeScript and cannot be imported from an .mjs build script, so the number is duplicated here
// and asserted per page rather than trusted.
export const EXPECTED_ALTERNATES = 3;

const CANONICAL = /<link[^>]*rel="canonical"[^>]*>/i;
const ROBOTS = /<meta[^>]*name="robots"[^>]*>/i;
const ALTERNATE = /<link[^>]*rel="alternate"[^>]*>/gi;
const HREF = /href="([^"]*)"/i;
const HREFLANG = /hreflang="([^"]*)"/i;
const CONTENT = /content="([^"]*)"/i;

export function contentFingerprint(html) {
  return (
    html
      // The relative-time label is rewritten on every build; `data-lastmod-ignore` marks it so a
      // page does not report a content change just because "yesterday" became "2 days ago". The
      // version tag next to it stays in — a release is a real change.
      .replace(/<time[^>]*data-lastmod-ignore[^>]*>[\s\S]*?<\/time>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<link[^>]*rel="(?:preload|modulepreload|stylesheet)"[^>]*>/gi, '')
      .replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/\s(?:ngh|ng-version|ng-server-context|jsaction)="[^"]*"/gi, '')
      .replace(/-[A-Z0-9]{8}\.(?:js|css)/g, '.$1')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export function extractPage(html, filePath) {
  const robots = html.match(ROBOTS)?.[0].match(CONTENT)?.[1] ?? '';

  if (robots.includes('noindex')) {
    return null;
  }

  const canonical = html.match(CANONICAL)?.[0].match(HREF)?.[1];

  if (!canonical) {
    throw new Error(
      `${filePath} has no <link rel="canonical"> — a route was added without data.seo, or its SEO ` +
        `strings were not applied.`,
    );
  }

  const alternates = [...html.matchAll(ALTERNATE)].map(match => ({
    hreflang: match[0].match(HREFLANG)?.[1],
    href: match[0].match(HREF)?.[1],
  }));

  if (alternates.length !== EXPECTED_ALTERNATES) {
    throw new Error(
      `${filePath} has ${alternates.length} rel="alternate" links, expected ${EXPECTED_ALTERNATES} ` +
        `(de, en, x-default). The extraction is coupled to the attribute order the SeoService emits.`,
    );
  }

  return { filePath, canonical, alternates, fingerprint: contentFingerprint(html) };
}

export function resolveLastmod(key, hash, previousDatabase, today) {
  const previous = previousDatabase[key];

  return previous && previous.hash === hash
    ? { lastmod: previous.lastmod, changed: false }
    : { lastmod: today, changed: true };
}

const escapeXml = value =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildSitemapXml(pages) {
  const urls = pages
    .map(page => {
      const alternates = page.alternates
        .map(
          alternate =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}"/>`,
        )
        .join('\n');

      return `  <url>\n    <loc>${escapeXml(page.canonical)}</loc>\n    <lastmod>${page.lastmod}</lastmod>\n${alternates}\n  </url>`;
    })
    .join('\n');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    `${urls}\n` +
    '</urlset>\n'
  );
}
