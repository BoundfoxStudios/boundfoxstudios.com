import { describe, expect, it } from 'vitest';

import {
  buildSitemapXml,
  contentFingerprint,
  EXPECTED_ALTERNATES,
  extractPage,
  resolveLastmod,
} from './sitemap.lib.mjs';

const alternates = [
  '<link rel="alternate" hreflang="de" href="https://boundfoxstudios.com/support/">',
  '<link rel="alternate" hreflang="en" href="https://boundfoxstudios.com/en/support/">',
  '<link rel="alternate" hreflang="x-default" href="https://boundfoxstudios.com/support/">',
].join('');

const page = ({
  canonical = '<link rel="canonical" href="https://boundfoxstudios.com/support/">',
  robots = '<meta name="robots" content="index, follow">',
  links = alternates,
  body = '<p>Unterstütze uns</p>',
} = {}) =>
  `<!DOCTYPE html><html><head>${robots}${canonical}${links}</head><body>${body}</body></html>`;

describe('extractPage', () => {
  it('skips a page whose robots meta says noindex', () => {
    const result = extractPage(
      page({ robots: '<meta name="robots" content="noindex, follow">', canonical: '', links: '' }),
      '404/index.html',
    );

    expect(result).toBeNull();
  });

  it('throws and names the file when an indexable page has no canonical', () => {
    expect(() => extractPage(page({ canonical: '' }), 'support/index.html')).toThrow(
      /support\/index\.html has no <link rel="canonical">/,
    );
  });

  it('throws when an indexable page has fewer alternates than the locale set', () => {
    const twoAlternates = alternates.replace(
      '<link rel="alternate" hreflang="x-default" href="https://boundfoxstudios.com/support/">',
      '',
    );

    expect(() => extractPage(page({ links: twoAlternates }), 'support/index.html')).toThrow(
      new RegExp(`has 2 rel="alternate" links, expected ${EXPECTED_ALTERNATES}`),
    );
  });

  it('reads the canonical and all three alternates back out', () => {
    const result = extractPage(page(), 'support/index.html');

    expect(result.canonical).toBe('https://boundfoxstudios.com/support/');
    expect(result.alternates.map(alternate => alternate.hreflang)).toEqual([
      'de',
      'en',
      'x-default',
    ]);
  });
});

describe('contentFingerprint', () => {
  it('ignores the relative-time label so an unchanged page does not churn daily', () => {
    const withLabel = label =>
      `<p>1.7.0 · aktualisiert <time datetime="2026-08-06" data-lastmod-ignore>${label}</time></p>`;

    expect(contentFingerprint(withLabel('gestern'))).toBe(
      contentFingerprint(withLabel('vor 3 Tagen')),
    );
  });

  it('still notices a version change next to that label', () => {
    const withVersion = version =>
      `<p>${version} · aktualisiert <time data-lastmod-ignore>heute</time></p>`;

    expect(contentFingerprint(withVersion('1.7.0'))).not.toBe(
      contentFingerprint(withVersion('1.8.0')),
    );
  });

  it('ignores bundle hashes and hydration attributes but keeps JSON-LD', () => {
    const build = hash =>
      `<script src="main-${hash}.js"></script><div ngh="4">x</div>` +
      '<script type="application/ld+json">{"@type":"Organization"}</script>';

    expect(contentFingerprint(build('AAAAAAAA'))).toBe(contentFingerprint(build('BBBBBBBB')));
    expect(contentFingerprint(build('AAAAAAAA'))).toContain('Organization');
  });
});

describe('resolveLastmod', () => {
  it('keeps the previous date when the fingerprint is unchanged', () => {
    const result = resolveLastmod(
      'support/index.html',
      'same',
      { 'support/index.html': { hash: 'same', lastmod: '2026-08-01' } },
      '2026-08-18',
    );

    expect(result).toEqual({ lastmod: '2026-08-01', changed: false });
  });

  it("uses today's date when the fingerprint changed", () => {
    const result = resolveLastmod(
      'support/index.html',
      'new',
      { 'support/index.html': { hash: 'old', lastmod: '2026-08-01' } },
      '2026-08-18',
    );

    expect(result).toEqual({ lastmod: '2026-08-18', changed: true });
  });

  it("uses today's date for a page the database has never seen", () => {
    expect(resolveLastmod('new/index.html', 'hash', {}, '2026-08-18')).toEqual({
      lastmod: '2026-08-18',
      changed: true,
    });
  });
});

describe('buildSitemapXml', () => {
  it('emits the xhtml namespace and one alternate element per hreflang', () => {
    const xml = buildSitemapXml([
      {
        canonical: 'https://boundfoxstudios.com/support/',
        lastmod: '2026-08-18',
        alternates: [
          { hreflang: 'de', href: 'https://boundfoxstudios.com/support/' },
          { hreflang: 'en', href: 'https://boundfoxstudios.com/en/support/' },
          { hreflang: 'x-default', href: 'https://boundfoxstudios.com/support/' },
        ],
      },
    ]);

    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.match(/<xhtml:link/g)).toHaveLength(3);
    expect(xml).toContain('<loc>https://boundfoxstudios.com/support/</loc>');
  });
});
