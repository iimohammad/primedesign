import { mkdirSync, copyFileSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { zipSync, strToU8 } from 'fflate';
import { ELEMENT_NAMES } from '../packages/elements/dist/primedesign-elements.js';
const target = 'apps/docs/public/standalone';
mkdirSync(target + '/products', { recursive: true });
copyFileSync(
  'packages/elements/dist/primedesign-elements.umd.cjs',
  target + '/primedesign-elements.js',
);
copyFileSync(
  'packages/elements/dist/primedesign-elements.js',
  target + '/primedesign-elements.esm.js',
);
copyFileSync('examples/html/index.html', target + '/index.html');
copyFileSync('LICENSE', target + '/LICENSE');
writeFileSync(target + '/components.json', JSON.stringify(ELEMENT_NAMES, null, 2) + '\n');
for (const name of readdirSync('apps/docs/public/products'))
  copyFileSync('apps/docs/public/products/' + name, target + '/products/' + name);
mkdirSync('downloads', { recursive: true });
const files = {};
const add = (directory, prefix = '') => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = directory + '/' + entry.name,
      key = prefix + entry.name;
    if (entry.isDirectory()) add(path, key + '/');
    else
      files[key] = [
        new Uint8Array(readFileSync(path)),
        { mtime: new Date('2026-01-01T00:00:00Z') },
      ];
  }
};
add(target);
writeFileSync('downloads/primedesign-browser-0.2.0.zip', zipSync(files, { level: 9 }));
console.log(`Standalone: ${ELEMENT_NAMES.length} custom element tags`);
