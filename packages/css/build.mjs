import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { tokensCSS } from '@primedesign/tokens';
mkdirSync('dist', { recursive: true });
const require = createRequire(import.meta.url),
  fontDir = dirname(require.resolve('vazirmatn/package.json'));
mkdirSync('dist/fonts', { recursive: true });
copyFileSync(join(fontDir, 'fonts/webfonts/Vazirmatn[wght].woff2'), 'dist/fonts/Vazirmatn.woff2');
copyFileSync(join(fontDir, 'OFL.txt'), 'dist/fonts/OFL.txt');
const fontCSS =
  '@font-face{font-family:Vazirmatn;src:url("./fonts/Vazirmatn.woff2") format("woff2");font-weight:100 900;font-display:swap;}';
writeFileSync('dist/font.css', fontCSS);
const files = ['base', 'components', 'commerce'];
writeFileSync('dist/tokens.css', tokensCSS());
for (const f of files) writeFileSync(`dist/${f}.css`, readFileSync(`src/${f}.css`, 'utf8'));
const css =
  `@layer primedesign.tokens,primedesign.base,primedesign.components,primedesign.commerce;\n@layer primedesign.tokens{${tokensCSS()}}\n` +
  files.map((f) => `@layer primedesign.${f}{${readFileSync(`src/${f}.css`, 'utf8')}}`).join('\n');
writeFileSync('dist/primedesign.css', fontCSS + '\n' + css);
writeFileSync('dist/nofont.css', css);
