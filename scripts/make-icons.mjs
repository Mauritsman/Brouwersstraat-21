/**
 * Maakt de app-iconen uit één SVG-vlam.
 * Draaien met: node scripts/make-icons.mjs
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const FLAME = `
  <path d="M256 24 L320 152 L376 96 L384 216 L464 176 L416 288
           Q480 368 416 440 Q352 496 256 496 Q160 496 96 440
           Q32 368 96 288 L48 176 L128 216 L136 96 L192 152 Z"
        fill="url(#fire)"/>
  <path d="M256 216 L304 312 Q336 376 288 416 Q256 448 224 416
           Q176 376 208 312 Z"
        fill="#FFF4D6" opacity="0.9"/>
`;

function svg({ size, bg, pad }) {
  const scale = (size - pad * 2) / 512;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="fire" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFC300"/>
        <stop offset="0.5" stop-color="#FF7A00"/>
        <stop offset="1" stop-color="#FF3B00"/>
      </linearGradient>
    </defs>
    ${bg ? `<rect width="${size}" height="${size}" fill="#07060A"/>` : ''}
    <g transform="translate(${pad},${pad}) scale(${scale})">${FLAME}</g>
  </svg>`;
}

const targets = [
  // Webicoon voor het startscherm (PWA)
  { file: 'public/icon-192.png', size: 192, bg: true, pad: 20 },
  { file: 'public/icon-512.png', size: 512, bg: true, pad: 54 },
  // iOS zet zelf de ronde hoeken, dus geen transparantie en weinig marge
  { file: 'public/apple-touch-icon.png', size: 180, bg: true, pad: 18 },
  { file: 'public/favicon.png', size: 48, bg: true, pad: 4 },
  // Voor een latere native build
  { file: 'assets/icon.png', size: 1024, bg: true, pad: 110 },
  { file: 'assets/adaptive-icon.png', size: 1024, bg: false, pad: 210 },
  { file: 'assets/splash.png', size: 1024, bg: true, pad: 320 },
];

mkdirSync('public', { recursive: true });
mkdirSync('assets', { recursive: true });

for (const t of targets) {
  const buf = await sharp(Buffer.from(svg(t))).png().toBuffer();
  writeFileSync(t.file, buf);
  console.log(`${t.file}  ${t.size}x${t.size}  ${(buf.length / 1024).toFixed(1)} kB`);
}
