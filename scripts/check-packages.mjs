import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
let count = 0;
for (const name of readdirSync('packages')) {
  const cwd = `packages/${name}`,
    pkg = JSON.parse(readFileSync(`${cwd}/package.json`, 'utf8'));
  const pack = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd, encoding: 'utf8' }),
  )[0];
  if (!pack.files.some((f) => f.path === 'LICENSE'))
    throw new Error(`${name}: license missing from package`);
  if (!pack.files.some((f) => f.path === 'README.md')) throw new Error(`${name}: README missing`);
  if (name !== 'css' && name !== 'cli') {
    if (!pack.files.some((f) => f.path === 'dist/index.d.ts'))
      throw new Error(`${name}: type declarations missing`);
    if (!existsSync(`${cwd}/dist/index.js`)) throw new Error(`${name}: JavaScript missing`);
    if (
      ['react', 'forms', 'data', 'commerce', 'blocks'].includes(name) &&
      !readFileSync(`${cwd}/dist/index.js`, 'utf8').includes('use client')
    )
      throw new Error(`${name}: Next.js client directive missing`);
    if (
      ['react', 'forms', 'data', 'commerce', 'blocks'].includes(name) &&
      /^export \*/m.test(readFileSync(`${cwd}/dist/index.js`, 'utf8'))
    )
      throw new Error(`${name}: wildcard exports are unsupported at a Next.js client boundary`);
  }
  if (name === 'css' && !pack.files.some((f) => f.path === 'dist/fonts/OFL.txt'))
    throw new Error('Font license missing');
  if (pack.files.some((f) => /node_modules|\.env$|test-results/.test(f.path)))
    throw new Error(`${name}: unexpected files`);
  console.log(`${pkg.name}: ${pack.files.length} files, ${Math.round(pack.size / 1024)} KB packed`);
  count++;
}
console.log(`${count} packages verified`);
