import ts from 'typescript';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const packages = ['tokens', 'persian', 'icons', 'react', 'forms', 'data', 'commerce', 'blocks'];
const roots = packages.map((p) => resolve(`packages/${p}/src/index.ts`));
const program = ts.createProgram(roots, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
  }),
  checker = program.getTypeChecker(),
  api = [];
for (let i = 0; i < packages.length; i++) {
  const source = program.getSourceFile(roots[i]),
    module = checker.getSymbolAtLocation(source);
  if (!module) continue;
  for (const entry of checker.getExportsOfModule(module)) {
    const symbol = entry.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(entry) : entry;
    if (!(symbol.flags & ts.SymbolFlags.Value)) continue;
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (!declaration) continue;
    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration),
      call = type.getCallSignatures()[0],
      name = entry.getName(),
      kind = call ? (/^[A-Z]/.test(name) ? 'component' : 'function') : 'constant';
    const parameter = call?.parameters[0],
      parameterType = parameter ? checker.getTypeOfSymbolAtLocation(parameter, declaration) : null;
    const props =
      kind === 'component' && parameterType
        ? parameterType
            .getProperties()
            .filter((p) =>
              p.declarations?.some((d) => d.getSourceFile().fileName.includes('/packages/')),
            )
            .map((p) => ({
              name: p.name,
              type: checker
                .typeToString(
                  checker.getTypeOfSymbolAtLocation(p, declaration),
                  undefined,
                  ts.TypeFormatFlags.NoTruncation,
                )
                .slice(0, 400),
              required: !(p.flags & ts.SymbolFlags.Optional),
            }))
        : [];
    api.push({
      package: packages[i],
      name,
      kind,
      signature: call
        ? `${name}${checker.signatureToString(call, undefined, ts.TypeFormatFlags.NoTruncation)}`
        : `${name}: ${checker.typeToString(type).slice(0, 800)}`,
      props,
    });
  }
}
api.sort((a, b) => a.package.localeCompare(b.package) || a.name.localeCompare(b.name));
writeFileSync('apps/docs/src/api.json', JSON.stringify(api, null, 2) + '\n');
console.log(
  `API: ${api.length} runtime exports, ${api.filter((a) => a.kind === 'component').length} components`,
);
