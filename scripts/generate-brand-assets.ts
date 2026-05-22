import fs from 'fs/promises';
import path from 'path';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';
import { logoPaths, siteBrand } from '../src/config/brand';

const publicDir = path.join(process.cwd(), 'public');

function buildLogoSvg(size: number): string {
  const logoWidth = 160;
  const logoHeight = 60;
  const scale = (size * 0.82) / logoWidth;
  const translateX = (size - logoWidth * scale) / 2;
  const translateY = (size - logoHeight * scale) / 2;

  const paths = logoPaths
    .map(
      pathConfig =>
        `<path d="${pathConfig.d}" stroke-width="${pathConfig.strokeWidth}"${
          'opacity' in pathConfig ? ` opacity="${pathConfig.opacity}"` : ''
        } />`
    )
    .join('');

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${siteBrand.title}">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  <g transform="translate(${translateX} ${translateY}) scale(${scale})" stroke="#111111" stroke-linecap="round" stroke-linejoin="round" fill="none">
    ${paths}
  </g>
</svg>`;
}

async function renderPng(size: number): Promise<Buffer> {
  return sharp(Buffer.from(buildLogoSvg(size))).png().toBuffer();
}

async function writePng(filename: string, size: number) {
  const outputPath = path.join(publicDir, filename);
  await sharp(Buffer.from(buildLogoSvg(size))).png().toFile(outputPath);
  console.log(`generated ${outputPath}`);
}

async function main() {
  await fs.mkdir(publicDir, { recursive: true });

  await writePng('logo.png', 512);
  await writePng('favicon.png', 256);
  await writePng('apple-touch-icon.png', 180);

  const iconBuffers = await Promise.all([16, 32, 48].map(renderPng));
  const ico = await pngToIco(iconBuffers);
  const icoPath = path.join(publicDir, 'favicon.ico');
  await fs.writeFile(icoPath, ico);
  console.log(`generated ${icoPath}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
