import { mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { zipSync } from 'fflate';
import { ELEMENT_NAMES } from '../packages/elements/dist/primedesign-elements.js';
const base = 'integrations/wordpress/primedesign';
mkdirSync(base + '/assets', { recursive: true });
copyFileSync(
  'packages/elements/dist/primedesign-elements.umd.cjs',
  base + '/assets/primedesign-elements.js',
);
writeFileSync(base + '/assets/components.json', JSON.stringify(ELEMENT_NAMES));
copyFileSync('LICENSE', base + '/LICENSE');
const files = {};
const add = (directory, prefix) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = directory + '/' + entry.name,
      key = prefix + '/' + entry.name;
    if (entry.isDirectory()) add(path, key);
    else
      files[key] = [
        new Uint8Array(readFileSync(path)),
        { mtime: new Date('2026-01-01T00:00:00Z') },
      ];
  }
};
add(base, 'primedesign');
mkdirSync('downloads', { recursive: true });
writeFileSync('downloads/primedesign-wordpress-0.2.0.zip', zipSync(files, { level: 9 }));
console.log('WordPress plugin ZIP is ready');
