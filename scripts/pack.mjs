import { mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const destination = resolve('artifacts');
mkdirSync(destination, { recursive: true });
for (const name of readdirSync('packages'))
  execFileSync('npm', ['pack', '--pack-destination', destination], {
    cwd: `packages/${name}`,
    stdio: 'inherit',
  });
