import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BROWSER_DIR = 'dist/website/browser';
const LOCALES = [
  { code: 'de', subPath: '' },
  { code: 'en', subPath: 'en' },
];

// Angular copies every file in `public/` — dotfiles included — into each locale directory. These
// belong to the site root only: crawlers and the OS icon pickers never read a localized copy.
const ROOT_ONLY = [
  'robots.txt',
  '.htaccess',
  'app-ads.txt',
  'favicon.ico',
  'icon.svg',
  'apple-touch-icon.png',
  'app-icons',
  'og',
  '.well-known',
];

const localeDirectories = LOCALES.filter(locale => locale.subPath).map(locale =>
  join(BROWSER_DIR, locale.subPath),
);

for (const directory of localeDirectories) {
  try {
    await readdir(directory);
  } catch {
    console.error(`${directory} missing — run a localized build`);
    process.exit(1);
  }
}

for (const directory of localeDirectories) {
  for (const entry of ROOT_ONLY) {
    await rm(join(directory, entry), { recursive: true, force: true });
  }
}

for (const entry of await readdir(BROWSER_DIR, { withFileTypes: true, recursive: true })) {
  if (entry.name === 'index.csr.html') {
    await rm(join(entry.parentPath, entry.name), { force: true });
  }
}

const manifest = ({ code, subPath }) => {
  const root = subPath ? `/${subPath}/` : '/';

  return {
    id: root,
    name: 'Boundfox Studios',
    short_name: 'Boundfox',
    lang: code,
    start_url: root,
    scope: root,
    display: 'minimal-ui',
    background_color: '#171717',
    theme_color: '#171717',
    icons: [
      { src: '/app-icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/app-icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/app-icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
};

for (const locale of LOCALES) {
  await writeFile(
    join(BROWSER_DIR, locale.subPath, 'manifest.webmanifest'),
    `${JSON.stringify(manifest(locale), null, 2)}\n`,
    'utf8',
  );
}

// `ErrorDocument` is per-directory, and `/en/` is the deepest existing directory for any `/en/**`
// miss, so this one line is what makes a miss under /en/ render the English 404 page.
await writeFile(
  join(BROWSER_DIR, 'en', '.htaccess'),
  'ErrorDocument 404 /en/404/index.html\n',
  'utf8',
);

// RFC 9116 requires `Expires`, and a stale date reads as an abandoned disclosure programme — which
// is why the file is written on every build instead of by hand.
const expires = new Date();
expires.setUTCFullYear(expires.getUTCFullYear() + 1);

await mkdir(join(BROWSER_DIR, '.well-known'), { recursive: true });
await writeFile(
  join(BROWSER_DIR, '.well-known', 'security.txt'),
  [
    'Contact: mailto:info@boundfoxstudios.com',
    'Contact: https://github.com/BoundfoxStudios/boundfoxstudios.com/security/advisories/new',
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
    'Preferred-Languages: de, en',
    'Canonical: https://boundfoxstudios.com/.well-known/security.txt',
    '',
  ].join('\n'),
  'utf8',
);

console.log(
  `dist finalized: ${LOCALES.length} manifests, security.txt expires ${expires.toISOString().slice(0, 10)}`,
);
