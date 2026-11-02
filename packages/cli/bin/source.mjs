import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const manifestPath = new URL('../registry/manifest.json', import.meta.url);
export function loadRegistry() {
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    throw new Error(
      'Source registry is missing. Run npm run build in the repository before packing the CLI.',
    );
  }
}
export function sourceOutputs(names, config) {
  const registry = loadRegistry(),
    outputs = new Map();
  for (const name of names) {
    const item = Object.hasOwn(registry.items, name) ? registry.items[name] : undefined;
    if (!item) throw new Error(`Unknown source component: ${name}`);
    for (const path of item.files) {
      const file = registry.files[path];
      if (!file || createHash('sha256').update(file.content).digest('hex') !== file.sha256)
        throw new Error(`Registry integrity check failed: ${path}`);
      outputs.set(`${config.components}/prime/${path.replace('/src/', '/')}`, file.content);
    }
    outputs.set(`${config.components}/${name}.tsx`, item.facade);
  }
  return [...outputs];
}
export function sourceDiff(names, config, safePath) {
  return sourceOutputs(names, config).map(([path, content]) => {
    const absolute = safePath(path);
    return {
      path,
      status: !existsSync(absolute)
        ? 'missing'
        : readFileSync(absolute, 'utf8') === content
          ? 'current'
          : 'modified',
    };
  });
}
