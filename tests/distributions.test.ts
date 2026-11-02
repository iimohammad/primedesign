// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import PHPParser from 'php-parser';
import { unzipSync, strFromU8 } from 'fflate';
describe('cross-platform distributions', () => {
  it('parses the WordPress plugin with its minimum PHP syntax version', () => {
    const parser = new PHPParser({ parser: { version: '7.4', suppressErrors: false } });
    const ast = parser.parseCode(
      readFileSync('integrations/wordpress/primedesign/primedesign.php', 'utf8'),
      'primedesign.php',
    );
    expect(ast.errors).toHaveLength(0);
    expect(
      ast.children.some(
        (node: any) => node.kind === 'function' && node.name.name === 'primedesign_add_to_cart',
      ),
    ).toBe(true);
  });
  it('ships a self-contained browser ZIP with local assets', () => {
    const zip = unzipSync(readFileSync('downloads/primedesign-browser-0.2.0.zip'));
    expect(Object.keys(zip)).toContain('primedesign-elements.js');
    expect(Object.keys(zip)).toContain('index.html');
    expect(strFromU8(zip['index.html'])).toContain('./primedesign-elements.js');
    expect(zip['primedesign-elements.js'].length).toBeGreaterThan(100000);
    expect(strFromU8(zip['components.json'])).toContain('pd-product-detail');
  });
  it('maps every coverage reference to an existing component export', () => {
    const coverage = JSON.parse(readFileSync('apps/docs/src/coverage.json', 'utf8')),
      api = JSON.parse(readFileSync('apps/docs/src/api.json', 'utf8'));
    for (const row of coverage)
      for (const component of row.components)
        expect(
          api.some((item: any) => item.name === component),
          component,
        ).toBe(true);
  });
});
it('ships a WordPress plugin directory with all runtime assets', () => {
  const zip = unzipSync(readFileSync('downloads/primedesign-wordpress-0.2.0.zip'));
  for (const name of [
    'primedesign.php',
    'frontend.js',
    'editor.js',
    'assets/primedesign-elements.js',
    'assets/components.json',
    'LICENSE',
  ])
    expect(zip['primedesign/' + name], name).toBeDefined();
  expect(strFromU8(zip['primedesign/primedesign.php'])).toContain('Version: 0.2.0');
  expect(JSON.parse(strFromU8(zip['primedesign/assets/components.json']))).toContain(
    'pd-product-card',
  );
});
