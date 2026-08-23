import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const BRANDING_DIR = 'projects/website/branding';
const PUBLIC_DIR = 'projects/website/public';
const SOURCE_SVG = join(BRANDING_DIR, 'icon.svg');
const SOURCE_PNG = join(BRANDING_DIR, 'icon.png');
const OG_SOURCE = join(BRANDING_DIR, 'og-logo.png');

// `--color-neutral-900`, the design's ink token. Opaque outputs need a colour and this is the only
// one the token set offers for a dark surface.
const BACKGROUND = '#171717';
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const exists = async path =>
  access(path).then(
    () => true,
    () => false,
  );

const hasVectorSource = await exists(SOURCE_SVG);
const source = hasVectorSource ? SOURCE_SVG : SOURCE_PNG;

// A second pass, because sharp applies its operations in a fixed internal order and flattens
// before compositing: chained onto the same pipeline, `.flatten()` runs against the empty canvas
// and the pasted RGBA logo puts the alpha channel straight back.
const flatten = buffer =>
  sharp(buffer).flatten({ background: BACKGROUND }).png({ compressionLevel: 9 }).toBuffer();

// Composited onto an explicit canvas rather than resize + extend + flatten: sharp applies its
// operations in a fixed internal order and flattens before extending, so the naive chain leaves
// transparent padding around an icon that has to be opaque.
const renderIcon = async (size, { padding = 0, background = TRANSPARENT } = {}) => {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(source, { density: 512 })
    .resize(inner, inner, { fit: 'contain', background: TRANSPARENT })
    .png()
    .toBuffer();

  const canvas = await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  return background === TRANSPARENT ? canvas : flatten(canvas);
};

const renderOpenGraphImage = async () => {
  const logo = await sharp(OG_SOURCE).resize({ width: 760 }).png().toBuffer();
  const canvas = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: BACKGROUND },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  return flatten(canvas);
};

await mkdir(join(PUBLIC_DIR, 'app-icons'), { recursive: true });
await mkdir(join(PUBLIC_DIR, 'og'), { recursive: true });

const [ico32, ico48, appleTouch, icon192, icon512, maskable512, openGraph] = await Promise.all([
  renderIcon(32),
  renderIcon(48),
  renderIcon(180, { background: BACKGROUND }),
  renderIcon(192),
  renderIcon(512),
  renderIcon(512, { padding: 0.1, background: BACKGROUND }),
  renderOpenGraphImage(),
]);

await Promise.all([
  writeFile(join(PUBLIC_DIR, 'favicon.ico'), await pngToIco([ico32, ico48])),
  writeFile(join(PUBLIC_DIR, 'apple-touch-icon.png'), appleTouch),
  writeFile(join(PUBLIC_DIR, 'app-icons/icon-192.png'), icon192),
  writeFile(join(PUBLIC_DIR, 'app-icons/icon-512.png'), icon512),
  writeFile(join(PUBLIC_DIR, 'app-icons/maskable-512.png'), maskable512),
  writeFile(join(PUBLIC_DIR, 'og/default.png'), openGraph),
]);

// Only a vector source can produce `icon.svg`; with the PNG fallback the `<link rel="icon"
// type="image/svg+xml">` in index.html is dropped instead of pointing at a rasterized stand-in.
if (hasVectorSource) {
  await writeFile(join(PUBLIC_DIR, 'icon.svg'), await readFile(SOURCE_SVG));
}

console.log(`icons and og/default.png generated from ${source}`);
