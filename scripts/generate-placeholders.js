import { writeFileSync, mkdirSync, existsSync } from 'fs';

const brands = ['quamtrax', 'applied', 'zoomad', 'cellucor', 'muscletech', 'optimum', 'amix', 'nutrex'];
const stores = ['villanueva', 'marineda', 'lasrosas'];
const photos = ['hero', 'tienda-1', 'tienda-2', 'tienda-3', 'tienda-4', 'tienda-5', 'tienda-6'];

function placeholderSvg(text, w, h, bg = '#4A7BD4') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect fill="${bg}" width="${w}" height="${h}"/>
  <text fill="#fff" font-family="Arial,sans-serif" font-size="${Math.min(w, h) * 0.12}" font-weight="bold" text-anchor="middle" dominant-baseline="central" x="${w / 2}" y="${h / 2}">${text}</text>
</svg>`;
}

for (const brand of brands) {
  writeFileSync(`public/brands/${brand}.png`, placeholderSvg(brand.toUpperCase(), 300, 100, '#1B3A6B'));
  console.log(`Created placeholder: brands/${brand}.png`);
}

for (const store of stores) {
  const dir = `public/photos/${store}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  for (const photo of photos) {
    writeFileSync(`${dir}/${photo}.jpg`, placeholderSvg(`${store}\n${photo}`, 800, 600, '#3B6FC1'));
    console.log(`Created placeholder: photos/${store}/${photo}.jpg`);
  }
}

console.log('\nDone! Replace these placeholders with real images.');
