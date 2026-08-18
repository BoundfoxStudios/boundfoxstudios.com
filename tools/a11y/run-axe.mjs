import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

import { serveStaticDirectory } from '../static-server.mjs';

const DIST = 'dist/website/browser';
const PORT = 4398;
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// The accepted contrast deviations, recorded in docs/accessibility.md: `#ffa726` on a light
// surface measures 1.94:1 and is a brand colour that does not change (SPEC §12 D2). Listed one by
// one rather than as `[data-a11y-exception]`, so a new marker has to be added here — and to the
// document — before it excuses anything.
const CONTRAST_EXCEPTIONS = [
  '[data-a11y-exception="kicker-contrast"]',
  '[data-a11y-exception="script-accent-contrast"]',
];

const prerenderedPages = async directory => {
  const pages = [];

  for (const entry of await readdir(directory, { withFileTypes: true, recursive: true })) {
    if (entry.name === 'index.html') {
      const path = relative(directory, join(entry.parentPath, entry.name)).replaceAll('\\', '/');

      pages.push(`/${path.replace(/index\.html$/, '')}`);
    }
  }

  return pages.sort();
};

const server = await serveStaticDirectory(DIST, PORT);
const browser = await chromium.launch();
const violations = [];
const routes = await prerenderedPages(DIST);

// One page per pass: @axe-core/playwright refuses to run a second builder against a page it has
// already analysed. The context is explicit because the runner opens a second page of its own to
// assemble the result, which a context created implicitly by `browser.newPage()` forbids.
const analyse = async (route, configure) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'networkidle' });

  const result = await configure(new AxeBuilder({ page })).analyze();
  await context.close();

  return result;
};

for (const route of routes) {
  // Two passes rather than one: a single run excluding the kicker would also hide every other
  // finding inside it.
  const everythingElse = await analyse(route, builder =>
    builder.withTags(TAGS).disableRules(['color-contrast']),
  );
  const contrast = await analyse(route, builder =>
    CONTRAST_EXCEPTIONS.reduce(
      (configured, selector) => configured.exclude(selector),
      builder.withRules(['color-contrast']),
    ),
  );

  const found = [...everythingElse.violations, ...contrast.violations];

  for (const violation of found) {
    for (const node of violation.nodes) {
      violations.push(`${route} · ${violation.id} · ${node.target.join(' ')}`);
    }
  }

  console.log(`${found.length ? 'FAIL' : 'ok  '}  ${route}`);
}

await browser.close();
server.close();

if (violations.length) {
  console.log(`\n${violations.length} violation(s):`);

  for (const violation of violations) {
    console.log(`  ${violation}`);
  }
}

console.log(
  `\n${routes.length} page(s) checked — ${violations.length ? `${violations.length} violation(s)` : 'no violations'}`,
);
process.exit(violations.length ? 1 : 0);
