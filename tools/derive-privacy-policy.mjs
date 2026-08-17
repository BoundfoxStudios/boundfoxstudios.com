import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(`${root}/docs/legal/privacy-policy.source.html`, 'utf8');

const body = source.slice(source.indexOf('<h4>Datenschutzerklärung</h4>'));

const sectionStart = (number) => {
  const index = body.indexOf(`<h4>${number}. `);
  if (index === -1) {
    throw new Error(`section ${number} not found`);
  }
  return index;
};

// Drop §6 (Matomo) and §7 (YouTube): everything from the §6 heading up to the §8 heading.
const removedFrom = sectionStart(6);
const removedTo = sectionStart(8);
const removed = body.slice(removedFrom, removedTo);

if (!removed.includes('Matomo') || !removed.includes('YouTube')) {
  throw new Error('the removed range is not the Matomo/YouTube block');
}
if (removed.includes('Rechtsgrundlage der Verarbeitung')) {
  throw new Error('the removed range spills into section 8');
}

let result = body.slice(0, removedFrom) + body.slice(removedTo);

// Renumber the trailing sections 8..12 down to 6..10.
for (const [from, to] of [[8, 6], [9, 7], [10, 8], [11, 9], [12, 10]]) {
  const heading = `<h4>${from}. `;
  if (!result.includes(heading)) {
    throw new Error(`heading ${from} missing before renumbering`);
  }
  result = result.replace(heading, `<h4>${to}. `);
}

// Drop the placeholder phone line; the imprint deliberately omits the number.
const phoneLine = '<p>Tel.: 0151123123123</p>\n';
if (!result.includes(phoneLine)) {
  throw new Error('phone line not found');
}
result = result.replace(phoneLine, '');

const checks = [
  ['Matomo', 0],
  ['YouTube', 0],
  ['0151123123123', 0],
  ['<h4>10. Bestehen einer automatisierten Entscheidungsfindung</h4>', 1],
  ['<h4>6. Rechtsgrundlage der Verarbeitung</h4>', 1],
];
for (const [needle, expected] of checks) {
  const count = result.split(needle).length - 1;
  if (count !== expected) {
    throw new Error(`expected ${expected}x "${needle}", found ${count}`);
  }
}

const header = `<!--
  Privacy policy — the text that ships.

  Derived mechanically from privacy-policy.source.html by tools/../derive-privacy.mjs so the
  wording is provably unchanged. Three deletions, all confirmed by Manu on 2026-08-17:

    - section 6 (Matomo) removed — the site runs no analytics and sets no cookie (SPEC D11)
    - section 7 (YouTube) removed — YouTube is linked, never embedded, so no data reaches Google
      on page load
    - the "Tel.: 0151123123123" line removed — the imprint deliberately omits the number

  Sections 8-12 were renumbered to 6-10. Nothing else was touched: "Manuel Rauber" stays as the
  legal entity throughout, which is correct — "Boundfox Studios" is the public brand, the sole
  proprietorship is the responsible party.

  The markup here is still the generator's. The page renders this content with the site's own
  components; see docs/design/privacy.md for the layout and docs/legal/README.md for how the
  strings are marked.
-->

`;

writeFileSync(`${root}/docs/legal/privacy-policy.final.html`, header + result);

const sections = [...result.matchAll(/<h4>(\d+)\. ([^<]+)<\/h4>/g)].map((match) => `${match[1]}. ${match[2]}`);
console.log(sections.join('\n'));
console.log(`\nwords: ${result.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length}`);
