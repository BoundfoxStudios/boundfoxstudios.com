import { readFile } from 'node:fs/promises';

const SOURCE_FILE = 'projects/website/src/locale/messages.xlf';
const TARGET_FILE = 'projects/website/src/locale/messages.en.xlf';

// `i18nMissingTranslation: "error"` does NOT cover a unit that exists without a `<target>`:
// Angular resolves it to the `<source>` and the build stays green while German ships into /en/.
// Verified by deleting a target and rebuilding — zero errors, German in the emitted HTML. This
// script is therefore the gate, not a second opinion.
const UNIT = /<unit id="([^"]+)">([\s\S]*?)<\/unit>/g;

const prefixArgument = process.argv.find(argument => argument.startsWith('--prefix='));
const prefixes = prefixArgument ? prefixArgument.slice('--prefix='.length).split(',') : null;
const inScope = id => !prefixes || prefixes.some(prefix => id.startsWith(prefix));

const parse = async path => {
  const raw = await readFile(path, 'utf8');
  const units = new Map();

  for (const [, id, body] of raw.matchAll(UNIT)) {
    units.set(id, {
      source: body.match(/<source>([\s\S]*?)<\/source>/)?.[1] ?? '',
      target: body.match(/<target>([\s\S]*?)<\/target>/)?.[1] ?? null,
      state: body.match(/<segment state="([^"]*)"/)?.[1] ?? null,
    });
  }

  return units;
};

const placeholders = value =>
  [...value.matchAll(/<ph id="([^"]*)"/g)].map(match => match[1]).sort();

const source = await parse(SOURCE_FILE);
const target = await parse(TARGET_FILE);
const failures = [];
const fail = (id, message) => failures.push(`${id}: ${message}`);

let checked = 0;

for (const [id, unit] of source) {
  if (!inScope(id)) {
    continue;
  }

  checked++;
  const translation = target.get(id);

  if (!translation) {
    fail(id, `missing from ${TARGET_FILE}`);
    continue;
  }

  if (translation.target === null || translation.target.trim() === '') {
    fail(id, 'has no translation');
    continue;
  }

  if (translation.state === 'initial') {
    fail(id, 'is marked state="initial" — the German source changed after it was translated');
  }

  if (translation.source.trim() !== unit.source.trim()) {
    fail(id, 'source text differs between the two files — re-run npm run i18n:extract');
  }

  const expected = placeholders(unit.source);
  const actual = placeholders(translation.target);

  if (expected.join() !== actual.join()) {
    fail(id, `placeholders differ: source [${expected}] vs target [${actual}]`);
  }

  if (translation.target.includes('→')) {
    fail(id, 'contains → — the arrow is rendered by the component, never translated');
  }
}

for (const id of target.keys()) {
  if (inScope(id) && !source.has(id)) {
    fail(id, `is orphaned — no such unit in ${SOURCE_FILE}`);
  }
}

for (const message of failures) {
  console.log(`FAIL  ${message}`);
}

const scope = prefixes ? `prefixes ${prefixes.join(', ')}` : 'the whole catalogue';
console.log(
  `\n${failures.length ? `${failures.length} problem(s)` : 'all translated'} — ${checked} unit(s) checked across ${scope}`,
);
process.exit(failures.length ? 1 : 0);
