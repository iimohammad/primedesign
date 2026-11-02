import ts from 'typescript';
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative, basename } from 'node:path';
import { createHash } from 'node:crypto';
const packages = ['react', 'commerce', 'data', 'forms', 'blocks', 'ai', 'icons'];
const manifest = { version: '0.2.0', items: {}, files: {} };
const publicDirectory = 'apps/docs/public/r';
mkdirSync(publicDirectory, { recursive: true });
mkdirSync('packages/cli/registry', { recursive: true });
const sha = (s) => createHash('sha256').update(s).digest('hex');
function collect(file, seen = new Set()) {
  const absolute = resolve(file);
  if (seen.has(absolute)) return [];
  seen.add(absolute);
  const original = readFileSync(absolute, 'utf8'),
    key = relative(resolve('packages'), absolute).replaceAll('\\', '/'),
    source = ts.createSourceFile(file, original, ts.ScriptTarget.Latest, true),
    files = [key];
  let content = original
    .replace(/from\s+(['"])\.\/provider\.js\1/g, "from '@primedesign/react'")
    .replace(/from\s+(['"])\.\/cart\.js\1/g, "from '@primedesign/commerce'")
    .replace(/(from\s+['"]\.[^'"]+)\.js(['"])/g, '$1$2');
  manifest.files[key] = { content, sha256: sha(content) };
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue;
    const module = statement.moduleSpecifier.text;
    if (!module.startsWith('.') || module === './provider.js' || module === './cart.js') continue;
    const base = resolve(dirname(absolute), module.replace(/\.js$/, ''));
    const candidate = [base + '.tsx', base + '.ts'].find((path) => {
      try {
        readFileSync(path);
        return true;
      } catch {
        return false;
      }
    });
    if (candidate) files.push(...collect(candidate, seen));
  }
  return [...new Set(files)];
}
const api = JSON.parse(readFileSync('apps/docs/src/api.json', 'utf8'));
const publicItems = [];
for (const pkg of packages) {
  const indexPath = `packages/${pkg}/src/index.ts`,
    index = ts.createSourceFile(
      indexPath,
      readFileSync(indexPath, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
  const exports = new Map();
  for (const statement of index.statements)
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause) &&
      !statement.isTypeOnly
    ) {
      for (const name of statement.exportClause.elements)
        exports.set(
          name.name.text,
          resolve(dirname(indexPath), statement.moduleSpecifier.text.replace(/\.js$/, '')),
        );
    }
  if (pkg === 'icons') exports.set('Icon', resolve(indexPath).replace(/\.ts$/, ''));
  for (const item of api.filter(
    (item) => item.package === pkg && item.kind === 'component' && !/Provider$/.test(item.name),
  )) {
    const base = exports.get(item.name);
    if (!base) continue;
    const file = [base + '.tsx', base + '.ts'].find((path) => {
      try {
        readFileSync(path);
        return true;
      } catch {
        return false;
      }
    });
    if (!file) continue;
    const name = item.name
      .replace(/([a-z\d])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
    if (manifest.items[name]) continue;
    const files = collect(file),
      entry = relative(resolve('packages'), file).replaceAll('\\', '/'),
      targetFor = (key) => 'prime/' + key.replace('/src/', '/'),
      entryTarget = targetFor(entry),
      facade = `'use client';\nexport { ${item.name} } from './${entryTarget.replace(/\.tsx?$/, '')}';\n`;
    const dependencies = new Set();
    for (const key of files) {
      for (const match of manifest.files[key].content.matchAll(/from\s+['"]([^.'"][^'"]*)['"]/g)) {
        const module = match[1];
        dependencies.add(
          module.startsWith('@') ? module.split('/').slice(0, 2).join('/') : module.split('/')[0],
        );
      }
    }
    manifest.items[name] = {
      name,
      package: pkg,
      exportName: item.name,
      entry,
      files,
      facade,
      dependencies: [...dependencies],
    };
    const registryItem = {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name,
      type: ['blocks', 'commerce', 'ai'].includes(pkg) ? 'registry:block' : 'registry:ui',
      title: item.name,
      description: `PrimeDesign ${item.name} (${pkg})`,
      dependencies: [...dependencies].map((dep) =>
        dep.startsWith('@primedesign/') ? dep + '@0.2.0' : dep,
      ),
      files: [
        ...files.map((key) => ({
          path: 'registry/' + targetFor(key),
          type: 'registry:component',
          target: 'components/ui/' + targetFor(key),
          content: manifest.files[key].content,
        })),
        {
          path: `registry/${name}.tsx`,
          type: 'registry:ui',
          target: `components/ui/${name}.tsx`,
          content: facade,
        },
      ],
    };
    writeFileSync(`${publicDirectory}/${name}.json`, JSON.stringify(registryItem));
    publicItems.push({
      ...registryItem,
      files: registryItem.files.map(({ content, ...file }) => file),
    });
  }
}
writeFileSync('packages/cli/registry/manifest.json', JSON.stringify(manifest));
writeFileSync(
  `${publicDirectory}/registry.json`,
  JSON.stringify({
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'primedesign',
    homepage: 'https://github.com/iimohammad/primedesign',
    items: publicItems,
  }),
);
writeFileSync(
  'apps/docs/src/registry.json',
  JSON.stringify(
    Object.values(manifest.items).map(({ files, facade, ...item }) => ({
      ...item,
      fileCount: files.length,
    })),
    null,
    2,
  ) + '\n',
);
console.log(
  `Registry: ${Object.keys(manifest.items).length} source items, ${Object.keys(manifest.files).length} shared source files`,
);
