import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

import { chromium } from 'playwright';

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
];

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const serve = () =>
  new Promise(resolve => {
    const server = createServer(async (request, response) => {
      const path = decodeURIComponent(request.url.split('?')[0]);
      const candidate = join(DIST, path.endsWith('/') ? `${path}index.html` : path);

      try {
        const body = await readFile(candidate);
        response.writeHead(200, {
          'content-type': CONTENT_TYPES[extname(candidate)] ?? 'application/octet-stream',
        });
        response.end(body);
      } catch {
        response.writeHead(404).end('not found');
      }
    });

    server.listen(PORT, '127.0.0.1', () => {
      resolve(server);
    });
  });

const routeExists = async route => {
  try {
    await stat(join(DIST, route, 'index.html'));

    return true;
  } catch {
    return false;
  }
};

const server = await serve();
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

        return element ? getComputedStyle(element).gridTemplateColumns.split(' ').length : null;
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
