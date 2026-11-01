// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
const cli = resolve('packages/cli/bin/primedesign.mjs'),
  directories: string[] = [];
function app() {
  const dir = mkdtempSync(join(tmpdir(), 'primedesign-test-'));
  directories.push(dir);
  writeFileSync(join(dir, 'package.json'), '{}');
  return dir;
}
const run = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [cli, ...args, '--cwd', cwd], { encoding: 'utf8' });
afterEach(() => {
  directories.forEach((d) => rmSync(d, { recursive: true, force: true }));
  directories.length = 0;
});
describe('project CLI', () => {
  it('initializes once and refuses to overwrite', () => {
    const dir = app();
    expect(run(dir, 'init').status).toBe(0);
    expect(existsSync(join(dir, 'primedesign.config.json'))).toBe(true);
    expect(run(dir, 'init').status).toBe(1);
    expect(readFileSync(join(dir, 'src/components/prime-provider.tsx'), 'utf8')).toContain(
      'use client',
    );
  });
  it('adds typed product card and table facades', () => {
    const dir = app();
    run(dir, 'init');
    expect(run(dir, 'add', 'product-card', 'data-table').status).toBe(0);
    expect(readFileSync(join(dir, 'src/components/ui/product-card.tsx'), 'utf8')).toContain(
      'ProductCardProps',
    );
    expect(readFileSync(join(dir, 'src/components/ui/data-table.tsx'), 'utf8')).toContain(
      '@primedesign/data',
    );
  });
  it('does not partially write when a requested component is unknown', () => {
    const dir = app();
    expect(run(dir, 'add', 'button', '../../bad').status).toBe(1);
    expect(existsSync(join(dir, 'src/components/ui/button.tsx'))).toBe(false);
  });
  it('keeps configured output paths inside the application', () => {
    const dir = app();
    writeFileSync(
      join(dir, 'primedesign.config.json'),
      JSON.stringify({ components: '../../outside', styles: 'src/styles' }),
    );
    expect(run(dir, 'add', 'button').status).toBe(1);
  });
  it('supports side-effect-free dry runs', () => {
    const dir = app();
    expect(run(dir, 'init', '--dry-run').status).toBe(0);
    expect(existsSync(join(dir, 'primedesign.config.json'))).toBe(false);
  });
  it('generates validated brand themes', () => {
    const dir = app();
    expect(run(dir, 'theme', '--brand', '#125544', '--radius', '0').status).toBe(0);
    expect(readFileSync(join(dir, 'src/styles/primedesign-theme.css'), 'utf8')).toContain(
      '--pd-radius: 0px',
    );
    expect(run(dir, 'theme', '--force', '--brand', 'bad').status).toBe(1);
  });
});
