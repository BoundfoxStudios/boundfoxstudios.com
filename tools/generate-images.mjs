import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import sharp from 'sharp';

const SOURCE = resolve('projects/website/branding/fox-head.png');
const OUTPUT_DIRECTORY = resolve('projects/website/public/images');

// 64 and 80 are the 2× files behind the 32px header mark and the 40px footer mark; 32 and 40
// exist for the M8 icon set.
const SIZES = [32, 40, 64, 80];

mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

for (const size of SIZES) {
  const output = resolve(OUTPUT_DIRECTORY, `fox-head-${size}.webp`);

  await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(output);

  console.log(`fox-head-${size}.webp`);
}
