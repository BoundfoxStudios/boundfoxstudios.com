import { readFile } from 'node:fs/promises';

const DIST = 'dist/website/browser';

// The prose wrapper is the `<div>` the legal layout renders inside its `<section>`; comparing its
// text content — not the whole page — keeps the header, the footer and the English notice out.
const PAGES = [
  {
    route: 'legal-details-imprint',
    source: 'docs/legal/imprint.final.md',
    // Everything below the explanatory table's `---` is the wording that ships.
    extract: raw => raw.split('\n---\n')[1],
  },
  {
    route: 'privacy-policy',
    source: 'docs/legal/privacy-policy.final.html',
    // The file's own first heading is `Datenschutzerklärung`, which the page renders as the
    // translated H1 — `Privacy Policy` under /en/. It is dropped on both sides so the comparison
    // covers exactly the prose that is German in both locales.
    extract: raw => raw.replace(/<h4>[\s\S]*?<\/h4>/, ''),
  },
];

const LOCALES = ['', 'en'];

const normalise = value =>
  value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#64;/g, '@')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const proseOf = html => {
  const section = html.match(/<bfs-legal-page[^>]*>([\s\S]*?)<\/bfs-legal-page>/);

  if (!section) {
    return null;
  }

  // The prose wrapper is the last <div> child of the section; the notice, when present, precedes it.
  const wrapper = section[1].match(/<div(?:\s+lang="[a-z]+")?>([\s\S]*)<\/div>/);

  return wrapper ? wrapper[1] : null;
};

let failures = 0;
let skipped = 0;
const report = (ok, message) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`);

  if (!ok) {
    failures++;
  }
};

for (const page of PAGES) {
  let sourceText;

  try {
    sourceText = normalise(page.extract(await readFile(page.source, 'utf8')));
  } catch {
    console.log(`SKIP  ${page.source} — not present yet`);
    continue;
  }

  for (const locale of LOCALES) {
    const path = `${DIST}/${locale ? `${locale}/` : ''}${page.route}/index.html`;
    let html;

    try {
      html = await readFile(path, 'utf8');
    } catch {
      report(false, `${path} — not prerendered`);
      continue;
    }

    const prose = proseOf(html);

    if (prose === null) {
      // Not a silent pass: the route exists but does not use the legal layout yet.
      console.log(`SKIP  ${path} — no bfs-legal-page yet`);
      skipped++;
      continue;
    }

    // Every translated element inside the wrapper is stripped before comparing: both H1s and the
    // privacy "Stand" line, each marked `data-legal-not-in-source` in its template. The privacy
    // H1 renders `Datenschutzerklärung` under /de/ and `Privacy Policy` under /en/, so it cannot
    // take part in a comparison against a single German source file — that is why the source's
    // own first heading is dropped too.
    const rendered = normalise(
      prose.replace(/<(\w+)[^>]*\sdata-legal-not-in-source[^>]*>[\s\S]*?<\/\1>/gi, ''),
    );

    if (rendered === sourceText) {
      report(true, `${path} — prose identical to ${page.source}`);
      continue;
    }

    const limit = Math.min(rendered.length, sourceText.length);
    let index = 0;

    while (index < limit && rendered[index] === sourceText[index]) {
      index++;
    }

    report(
      false,
      `${path} — prose differs from ${page.source} at character ${index}\n` +
        `        source:   …${sourceText.slice(Math.max(0, index - 40), index + 60)}…\n` +
        `        rendered: …${rendered.slice(Math.max(0, index - 40), index + 60)}…`,
    );
  }
}

console.log(
  `\n${failures ? `${failures} failed` : 'all compared legal texts identical'}${skipped ? `, ${skipped} skipped` : ''}`,
);
process.exit(failures ? 1 : 0);
