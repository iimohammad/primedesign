// Next.js client boundaries require statically named exports, not export *.
import ts from 'typescript';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
for (const pkg of ['react', 'forms', 'data', 'commerce', 'blocks']) {
  const directory = `packages/${pkg}/src`;
  const lines = ["'use client';"];
  for (const filename of readdirSync(directory).filter(
    (f) => /\.tsx?$/.test(f) && f !== 'index.ts' && f !== 'utils.ts',
  )) {
    const source = ts.createSourceFile(
      filename,
      readFileSync(`${directory}/${filename}`, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const values = [],
      types = [];
    for (const statement of source.statements) {
      if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
        continue;
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations)
          if (ts.isIdentifier(declaration.name)) values.push(declaration.name.text);
      } else if (
        ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isEnumDeclaration(statement)
      ) {
        if (statement.name) values.push(statement.name.text);
      } else if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement))
        types.push(statement.name.text);
    }
    const path = './' + filename.replace(/\.tsx?$/, '.js');
    if (values.length) lines.push(`export { ${values.join(', ')} } from '${path}';`);
    if (types.length) lines.push(`export type { ${types.join(', ')} } from '${path}';`);
  }
  if (pkg === 'react') lines.push("export { cx } from './utils.js';");
  writeFileSync(`${directory}/index.ts`, lines.join('\n') + '\n');
}
