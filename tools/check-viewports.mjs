import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import { chromium } from 'playwright';

import { serveStaticDirectory } from './static-server.mjs';

const DIST = 'dist/website/browser';
const PORT = 4399;
const VIEWPORTS = [320, 768, 1152, 1440];

// Column counts per viewport, from the design documents. A route that is not prerendered yet is
// skipped and reported, so this table can name every M5 page before all of them exist; a grid the
// table names on a route that does exist is a failure, never a silent skip.
const GRIDS = [
  {
    route: '',
    selector: 'bfs-home-page > section:first-of-type > div.grid',
    name: 'home project teaser',
    columns: { 320: 1, 768: 1, 1152: 2, 1440: 2 },
  },
  {
    route: '',
    selector: 'bfs-repository-cards > div',
    name: 'home repository cards',
    columns: { 320: 1, 768: 2, 1152: 3, 1440: 3 },
  },
  {
    route: 'apps-and-games',
    selector: 'bfs-apps-and-games-page div.grid',
    name: 'apps card grid',
    columns: { 320: 1, 768: 2, 1152: 3, 1440: 3 },
  },
  {
    route: 'apps-and-games',
    selector: 'bfs-feature-card article',
    name: 'Bug-A-Ball feature card',
    columns: { 320: 1, 768: 2, 1152: 2, 1440: 2 },
  },
  {
    route: 'support',
    selector: 'bfs-support-page section:nth-of-type(2) div.grid',
    name: 'free support grid',
    columns: { 320: 1, 768: 2, 1152: 3, 1440: 3 },
  },
  {
    route: 'support',
    selector: 'bfs-support-page section:nth-of-type(3) div.grid',
    name: 'financial support grid',
    columns: { 320: 1, 768: 2, 1152: 2, 1440: 2 },
  },
  {
    route: 'socials',
    selector: 'bfs-socials-page div.grid',
    name: 'socials channel grid',
    columns: { 320: 1, 768: 2, 1152: 3, 1440: 3 },
  },
];

const routeExists = async route => {
  try {
    await stat(join(DIST, route, 'index.html'));

    return true;
  } catch {
    return false;
  }
};

const server = await serveStaticDirectory(DIST, PORT);
const browser = await chromium.launch();
const failures = [];
const report = (ok, message) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`);

  if (!ok) {
    failures.push(message);
  }
};

const routes = [...new Set(GRIDS.map(grid => grid.route))];

for (const route of routes) {
  if (!(await routeExists(route))) {
    console.log(`SKIP  /${route} — not prerendered yet`);
    continue;
  }

  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/${route}${route ? '/' : ''}`, {
    waitUntil: 'networkidle',
  });

  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(120);

    const overflow = await page.evaluate(
      () => document.scrollingElement.scrollWidth - window.innerWidth,
    );
    report(overflow <= 0, `/${route} @ ${width}px — no horizontal overflow (${overflow}px over)`);

    for (const grid of GRIDS.filter(entry => entry.route === route)) {
      const tracks = await page.evaluate(selector => {
        const element = document.querySelector(selector);

        if (!element) {
          return null;
        }

        // `auto-fit` collapses tracks it has no item for, and the computed value still lists them
        // as `0px`. Only the tracks that actually carry width are columns the visitor sees.
        return getComputedStyle(element)
          .gridTemplateColumns.split(' ')
          .filter(track => parseFloat(track) > 0).length;
      }, grid.selector);

      if (tracks === null) {
        report(false, `/${route} @ ${width}px — ${grid.name} not found (${grid.selector})`);
        continue;
      }

      report(
        tracks === grid.columns[width],
        `/${route} @ ${width}px — ${grid.name}: ${tracks} column(s), expected ${grid.columns[width]}`,
      );
    }
  }

  // Every interactive element carries the focus-ring utility, either on itself or on the anchor a
  // component renders for it. Checked in the DOM rather than by grepping templates, so a primitive
  // that loses the class is caught at the usage site too.
  const unringed = await page.evaluate(() =>
    [...document.querySelectorAll('main a, main button')]
      .filter(element => !element.classList.contains('focus-ring'))
      .map(element => element.outerHTML.slice(0, 120)),
  );
  report(
    unringed.length === 0,
    `/${route} — every interactive element has focus-ring${unringed.length ? `: ${unringed.join(' | ')}` : ''}`,
  );

  await page.close();
}

await browser.close();
server.close();

console.log(`\n${failures.length ? `${failures.length} failed` : 'all checks passed'}`);
process.exit(failures.length ? 1 : 0);
