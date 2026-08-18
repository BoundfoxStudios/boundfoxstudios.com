import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

const PORT = 4399;
const DIST = resolve('dist/website/browser');
const OUTPUT_DIRECTORY = resolve('docs/screenshots/focus');
const HARNESS_URL = `http://127.0.0.1:${PORT}/design-harness/`;

const SURFACES = ['white', 'neutral-100', 'ink', 'gradient'];
const TAB_STOPS_PER_SURFACE = 3;

const EXPECTED_RING = {
  white: 'rgb(23, 23, 23)',
  'neutral-100': 'rgb(23, 23, 23)',
  ink: 'rgb(255, 193, 7)',
  gradient: 'rgb(23, 23, 23)',
};

const waitForServer = async url => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // The server is not listening yet.
    }

    await new Promise(done => setTimeout(done, 100));
  }

  throw new Error(`${url} never became reachable`);
};

const server = spawn(
  resolve('node_modules/.bin/http-server'),
  [DIST, '-p', String(PORT), '-c-1', '-s'],
  { stdio: 'ignore' },
);

const failures = [];

try {
  await waitForServer(HARNESS_URL);

  mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(HARNESS_URL);

  // Focus has to arrive by keyboard: Chromium's :focus-visible heuristic follows the last
  // interaction modality, so a programmatic focus() after any pointer event matches :focus only
  // and the assertion would measure the user-agent ring instead of ours.
  await page.locator('body').press('Tab');

  for (const surface of SURFACES) {
    for (let stop = 0; stop < TAB_STOPS_PER_SURFACE; stop += 1) {
      // `transition-colors` in Tailwind v4 includes `outline-color`, so the ring starts at
      // `currentColor` and reaches `--focus-ring` only after the 150ms transition.
      await page.waitForTimeout(250);

      const style = await page.evaluate(() => {
        const node = document.activeElement;
        const computed = getComputedStyle(node);

        return {
          surface: node.closest('[data-surface]')?.dataset.surface ?? null,
          tag: node.tagName.toLowerCase(),
          color: computed.outlineColor,
          width: computed.outlineWidth,
          offset: computed.outlineOffset,
          matchesFocusVisible: node.matches(':focus-visible'),
        };
      });

      const expected = EXPECTED_RING[surface];
      const problems = [];

      if (style.surface !== surface) {
        problems.push(`focus is on the "${style.surface}" band, expected "${surface}"`);
      }
      if (!style.matchesFocusVisible) {
        problems.push('not :focus-visible');
      }
      if (style.color !== expected) {
        problems.push(`outline-color ${style.color} != ${expected}`);
      }
      if (style.width !== '2px') {
        problems.push(`outline-width ${style.width} != 2px`);
      }
      if (style.offset !== '2px') {
        problems.push(`outline-offset ${style.offset} != 2px`);
      }

      if (problems.length > 0) {
        failures.push(`${surface} stop ${stop + 1} (${style.tag}): ${problems.join(', ')}`);
      } else {
        console.log(
          `ok  ${surface} stop ${stop + 1} (${style.tag})  ${style.color} ${style.width}/${style.offset}`,
        );
      }

      if (stop === 0) {
        await page
          .locator(`[data-surface="${surface}"]`)
          .screenshot({ path: resolve(OUTPUT_DIRECTORY, `${surface}.png`) });
      }

      await page.keyboard.press('Tab');
    }
  }

  // A pointer press must leave no ring — that is the whole point of :focus-visible. It runs last
  // because it flips the modality heuristic for every later focus.
  const clickTarget = page.locator('[data-surface="white"] button').first();
  await clickTarget.click();

  await page.waitForTimeout(250);

  const ringAfterClick = await clickTarget.evaluate(node => ({
    matchesFocusVisible: node.matches(':focus-visible'),
    style: getComputedStyle(node).outlineStyle,
    width: getComputedStyle(node).outlineWidth,
  }));

  if (ringAfterClick.matchesFocusVisible || ringAfterClick.style !== 'none') {
    failures.push(
      `a mouse click left a ring (:focus-visible=${ringAfterClick.matchesFocusVisible}, ` +
        `outline ${ringAfterClick.style} ${ringAfterClick.width})`,
    );
  } else {
    console.log('ok  a mouse click leaves no ring');
  }

  await browser.close();
} finally {
  server.kill();
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }

  process.exit(1);
}

console.log(`Wrote ${SURFACES.length} screenshots to ${OUTPUT_DIRECTORY}`);
