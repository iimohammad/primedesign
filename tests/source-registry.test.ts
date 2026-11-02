// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, symlinkSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
const cli = resolve('packages/cli/bin/primedesign.mjs'),
  directories: string[] = [];
function app() {
  const dir = mkdtempSync(join(tmpdir(), 'prime-source-'));
  directories.push(dir);
  writeFileSync(join(dir, 'package.json'), '{}');
  return dir;
}
const run = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [cli, ...args, '--cwd', cwd], { encoding: 'utf8' });
afterEach(() => {
  for (const dir of directories) rmSync(dir, { recursive: true, force: true });
  directories.length = 0;
});
describe('editable source registry', () => {
  it('verifies every source hash, export and local source dependency', () => {
    const registry = JSON.parse(readFileSync('packages/cli/registry/manifest.json', 'utf8')),
      api = JSON.parse(readFileSync('apps/docs/src/api.json', 'utf8'));
    expect(Object.keys(registry.items).length).toBeGreaterThan(170);
    for (const item of Object.values(registry.items) as any[]) {
      expect(api.some((a: any) => a.name === item.exportName && a.kind === 'component')).toBe(true);
      expect(item.files).toContain(item.entry);
      for (const path of item.files) {
        const file = registry.files[path];
        expect(createHash('sha256').update(file.content).digest('hex')).toBe(file.sha256);
        expect(path).not.toContain('..');
        expect(file.content).not.toMatch(/from ['"]\.\/provider\.js['"]/);
      }
      expect(item.facade).toContain(item.exportName);
    }
  });
  it('copies implementation code, preserves modified files and reports diff', () => {
    const dir = app();
    let result = run(dir, 'add', 'button', 'product-card', '--source');
    expect(result.status, result.stderr).toBe(0);
    const implementation = join(dir, 'src/components/ui/prime/react/primitives.tsx');
    expect(readFileSync(implementation, 'utf8')).toContain('function Button');
    expect(run(dir, 'add', 'button', '--source').status).toBe(0);
    writeFileSync(implementation, '// customized\n');
    expect(run(dir, 'add', 'button', '--source').status).toBe(1);
    const diff = run(dir, 'diff', 'button', '--json');
    expect(JSON.parse(diff.stdout).some((file: any) => file.status === 'modified')).toBe(true);
    expect(run(dir, 'add', 'button', '--source', '--force').status).toBe(0);
  });
  it('supports all source items and the new package facades', () => {
    const dir = app(),
      result = run(dir, 'add', '--all', '--source');
    expect(result.status, result.stderr).toBe(0);
    expect(existsSync(join(dir, 'src/components/ui/chat.tsx'))).toBe(true);
    expect(run(dir, 'add', 'context-menu', 'kanban-board', '--force').status).toBe(0);
  });
  it('searches outside an application and rejects empty or inherited names', () => {
    const result = run('/tmp/does-not-exist', 'search', 'chat', '--json');
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).some((item: any) => item.name === 'chat')).toBe(true);
    const dir = app();
    expect(run(dir, 'add', '--source').status).toBe(1);
    expect(run(dir, 'add', 'constructor', '--source').status).toBe(1);
  });
  it('refuses output through a symlink outside the application', () => {
    const dir = app(),
      outside = app();
    symlinkSync(outside, join(dir, 'linked'));
    writeFileSync(
      join(dir, 'primedesign.config.json'),
      JSON.stringify({ components: 'linked/components', styles: 'src/styles' }),
    );
    const result = run(dir, 'add', 'button', '--source');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('symlinks');
    expect(existsSync(join(outside, 'components'))).toBe(false);
  });
});
