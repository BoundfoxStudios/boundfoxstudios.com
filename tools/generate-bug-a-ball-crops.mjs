import { mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const masterPath = join(root, 'projects/website/branding/bug-a-ball.svg');
const outputDirectory = join(root, 'projects/website/public/images');

const rasterDensity = 144;
const rasterWidth = 2050;
// The master is square and both slots are 2:1, so a single rectangle serves both crops.
const cropRectangle = { left: 0, top: 342, width: 2050, height: 1024 };
const maximumWebpBytes = 150_000;

const crops = [
  { name: 'bug-a-ball-feature-1200x600', width: 1200, height: 600 },
  { name: 'bug-a-ball-card-840x420', width: 840, height: 420 },
];

const master = sharp(masterPath, { density: rasterDensity });
const { width, height } = await master.metadata();

if (width !== rasterWidth) {
  throw new Error(`rasterised master is ${width}px wide, expected ${rasterWidth}px`);
}

if (cropRectangle.top + cropRectangle.height > height) {
  throw new Error(`the crop rectangle does not fit into the ${width}x${height} raster`);
}

const { entropy } = await master.clone().stats();

if (entropy <= 1) {
  throw new Error(`rasterised master has entropy ${entropy}: the frame is blank`);
}

mkdirSync(outputDirectory, { recursive: true });

for (const crop of crops) {
  const cropped = master.clone().extract(cropRectangle).resize(crop.width, crop.height);
  const webpPath = join(outputDirectory, `${crop.name}.webp`);

  await cropped.clone().webp({ quality: 82 }).toFile(webpPath);
  await cropped
    .clone()
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(join(outputDirectory, `${crop.name}.jpg`));

  const { size } = statSync(webpPath);

  if (size > maximumWebpBytes) {
    throw new Error(`${crop.name}.webp is ${size} bytes, over the ${maximumWebpBytes} budget`);
  }

  console.log(`${crop.name}  ${crop.width}x${crop.height}  webp ${size} bytes`);
}
