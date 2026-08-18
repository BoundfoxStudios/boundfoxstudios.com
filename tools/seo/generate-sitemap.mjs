import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { buildSitemapXml, extractPage, resolveLastmod } from './sitemap.lib.mjs';

const DIST = 'dist/website/browser';
const DATABASE = 'tools/seo/lastmod.json';

const walk = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else if (entry.name === 'index.html') {
      files.push(path);
    }
  }

  return files.sort();
};

const readDatabase = async () => {
  try {
    return JSON.parse(await readFile(DATABASE, 'utf8'));
  } catch {
    return {};
  }
};

const previousDatabase = await readDatabase();
// Taken once so every page in one run shares a date, and passed in so the library stays pure.
const today = new Date().toISOString().slice(0, 10);
const database = {};
const pages = [];
const changed = [];

for (const file of await walk(DIST)) {
  const page = extractPage(await readFile(file, 'utf8'), file);

  if (!page) {
    continue;
  }

  const key = relative(DIST, file).replaceAll('\\', '/');
  const { lastmod, changed: isChanged } = resolveLastmod(
    key,
    page.fingerprint,
    previousDatabase,
    today,
  );

  database[key] = { hash: page.fingerprint, lastmod };
  pages.push({ ...page, lastmod });

  if (isChanged) {
    changed.push(page.canonical);
  }
}

await writeFile(join(DIST, 'sitemap.xml'), buildSitemapXml(pages), 'utf8');
await writeFile(DATABASE, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
await writeFile('dist/changed-urls.json', `${JSON.stringify(changed, null, 2)}\n`, 'utf8');

console.log(`sitemap.xml: ${pages.length} URLs, ${changed.length} with a new lastmod`);
