import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { buildRedirectsFile, buildRules, HEADER, parseCsv } from './redirects.lib.mjs';

const rows = parseCsv(readFileSync('deploy/legacy-urls.csv', 'utf8'));
const rules = buildRules(rows);
const patternOf = rule => rule.split(' ')[2];

describe('buildRules', () => {
  it('emits one rule per CSV row plus its /en/ mirror', () => {
    expect(rules).toHaveLength(rows.length * 2);

    for (const [index, row] of rows.entries()) {
      expect(patternOf(rules[index * 2 + 1])).toBe(
        patternOf(rules[index * 2]).replace('^/', '^/en/'),
      );
    }
  });

  it('prefixes a locale-scoped target with /en/ and leaves a root-scoped one alone', () => {
    const [games, localizedGames] = buildRules([
      {
        path: '/games/',
        match: 'exact',
        status: '301',
        target: '/apps-and-games/',
        targetScope: 'locale',
      },
    ]);
    const [sitemap, localizedSitemap] = buildRules([
      {
        path: '^/sitemap_index\\.xml$',
        match: 'regex',
        status: '301',
        target: '/sitemap.xml',
        targetScope: 'root',
      },
    ]);

    expect(games).toBe('RedirectMatch 301 ^/games/?$ /apps-and-games/');
    expect(localizedGames).toBe('RedirectMatch 301 ^/en/games/?$ /en/apps-and-games/');
    expect(sitemap).toBe('RedirectMatch 301 ^/sitemap_index\\.xml$ /sitemap.xml');
    expect(localizedSitemap).toBe('RedirectMatch 301 ^/en/sitemap_index\\.xml$ /sitemap.xml');
  });

  it('writes 410 rules without a target and without a trailing space', () => {
    for (const rule of rules.filter(entry => entry.startsWith('RedirectMatch 410'))) {
      expect(rule.split(' ')).toHaveLength(3);
      expect(rule).not.toMatch(/\s$/);
    }
  });

  it('refuses a pattern that cannot be mirrored into /en/', () => {
    expect(() =>
      buildRules([
        { path: 'feed/?$', match: 'regex', status: '410', target: '', targetScope: 'locale' },
      ]),
    ).toThrow(/not anchored/);
  });
});

describe('the shipped map', () => {
  // /press/index.php is live, sits outside the Angular route space and stays served as-is. A rule
  // that swallowed it would take a working page off the site at cutover.
  it('matches neither /press/index.php nor its /en/ mirror', () => {
    for (const path of ['/press/index.php', '/en/press/index.php', '/press/']) {
      const matching = rules.filter(rule => new RegExp(patternOf(rule)).test(path));

      expect(matching, `${path} is matched by ${matching.join(' | ')}`).toHaveLength(0);
    }
  });

  it('covers every legacy URL from SPEC §4 with the status the table specifies', () => {
    const statusFor = path => {
      const rule = rules.find(entry => new RegExp(patternOf(entry)).test(path));

      return rule ? Number(rule.split(' ')[1]) : null;
    };

    const targetFor = path =>
      rules.find(entry => new RegExp(patternOf(entry)).test(path))?.split(' ')[3];

    expect(targetFor('/games/')).toBe('/apps-and-games/');
    expect(targetFor('/en/games/')).toBe('/en/apps-and-games/');
    expect(targetFor('/shops/')).toBe('/support/');
    expect(targetFor('/spreadshop/')).toBe('/support/');
    expect(targetFor('/2d-space-shooter-course/')).toBe('/');
    expect(targetFor('/en/spiele-programmieren-mit-unity-kurs-gratis/')).toBe('/en/');
    expect(targetFor('/founding-boundfox-studios-coaching/')).toBe('/');
    expect(targetFor('/category/company/')).toBe('/');
    expect(targetFor('/tag/founding/')).toBe('/');
    expect(targetFor('/author/manuel-rauber/')).toBe('/');
    expect(targetFor('/post_tag-sitemap.xml')).toBe('/sitemap.xml');
    expect(targetFor('/en/sitemap_index.xml')).toBe('/sitemap.xml');

    for (const path of [
      '/feed/',
      '/comments/feed/',
      '/games/feed/',
      '/en/feed/',
      '/wp-json/',
      '/wp-content/uploads/2021/logo.png',
      '/wp-includes/js/jquery.js',
      '/xmlrpc.php',
      '/en/wp-content/uploads/2021/logo.png',
    ]) {
      expect(statusFor(path), path).toBe(410);
    }
  });

  it('starts with the do-not-edit header and ends with exactly one newline', () => {
    const file = buildRedirectsFile(rows);

    expect(file.startsWith(`${HEADER}\n\n`)).toBe(true);
    expect(file.endsWith('\n')).toBe(true);
    expect(file.endsWith('\n\n')).toBe(false);
  });
});
