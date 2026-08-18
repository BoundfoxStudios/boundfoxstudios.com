import { readFile, writeFile } from 'node:fs/promises';

import { buildRedirectsFile, parseCsv } from './redirects.lib.mjs';

const SOURCE = 'deploy/legacy-urls.csv';
const OUTPUT = 'deploy/redirects.htaccess';

const rows = parseCsv(await readFile(SOURCE, 'utf8'));

await writeFile(OUTPUT, buildRedirectsFile(rows), 'utf8');

console.log(`${OUTPUT}: ${rows.length * 2} rules from ${rows.length} rows`);
