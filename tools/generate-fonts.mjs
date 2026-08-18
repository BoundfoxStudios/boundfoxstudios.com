import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import subsetFont from 'subset-font';

const OUTPUT_DIRECTORY = resolve('projects/website/public/fonts');
const LICENSE_DIRECTORY = resolve('docs/licenses');
const TAHU_MASTER = resolve('projects/website/branding/fonts/Tahu.ttf');

const GOOGLE_FONTS_RAW = 'https://raw.githubusercontent.com/google/fonts/main/ofl';

// Google's own `latin` unicode-range for the two text faces, expanded to the characters
// harfbuzz needs — subset-font takes text, not ranges.
const LATIN_RANGES = [
  [0x0000, 0x00ff],
  [0x0131, 0x0131],
  [0x0152, 0x0153],
  [0x02bb, 0x02bc],
  [0x02c6, 0x02c6],
  [0x02da, 0x02da],
  [0x02dc, 0x02dc],
  [0x2000, 0x206f],
  [0x20ac, 0x20ac],
  [0x2122, 0x2122],
  [0x2191, 0x2191],
  [0x2193, 0x2193],
  [0x2212, 0x2212],
  [0x2215, 0x2215],
  [0xfeff, 0xfeff],
  [0xfffd, 0xfffd],
];

const latinText = LATIN_RANGES.flatMap(([from, to]) =>
  Array.from({ length: to - from + 1 }, (_, offset) => String.fromCodePoint(from + offset)),
).join('');

// Bebas Neue renders uppercase display copy only; see docs/licenses/fonts.md.
const BEBAS_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ0123456789 &§©·–—→/.,:!?'()-+%";
const TAHU_TEXT = 'Danke!Thanks';

const FACES = [
  {
    output: 'bebas-neue-400.woff2',
    source: `${GOOGLE_FONTS_RAW}/bebasneue/BebasNeue-Regular.ttf`,
    text: BEBAS_TEXT,
  },
  {
    output: 'barlow-400.woff2',
    source: `${GOOGLE_FONTS_RAW}/barlow/Barlow-Regular.ttf`,
    text: latinText,
  },
  {
    output: 'barlow-700.woff2',
    source: `${GOOGLE_FONTS_RAW}/barlow/Barlow-Bold.ttf`,
    text: latinText,
  },
  { output: 'tahu-400.woff2', master: TAHU_MASTER, text: TAHU_TEXT },
];

const LICENSES = [
  { output: 'bebas-neue-OFL.txt', source: `${GOOGLE_FONTS_RAW}/bebasneue/OFL.txt` },
  { output: 'barlow-OFL.txt', source: `${GOOGLE_FONTS_RAW}/barlow/OFL.txt` },
];

const download = async url => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
mkdirSync(LICENSE_DIRECTORY, { recursive: true });

for (const face of FACES) {
  const master = face.master ? readFileSync(face.master) : await download(face.source);
  const subset = await subsetFont(master, face.text, { targetFormat: 'woff2' });
  const outputPath = resolve(OUTPUT_DIRECTORY, face.output);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, subset);

  console.log(`${face.output}  ${master.length} → ${subset.length} bytes`);
}

for (const license of LICENSES) {
  writeFileSync(resolve(LICENSE_DIRECTORY, license.output), await download(license.source));
  console.log(`${license.output}`);
}
