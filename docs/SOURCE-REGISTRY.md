# Editable source registry

PrimeDesign CLI has two explicit modes:

```sh
primedesign add button product-card          # application-owned re-export facades
primedesign add button product-card --source # local editable implementations
primedesign add --all --source
primedesign list --source --json
primedesign search chat
primedesign diff button --json
primedesign doctor
```

Run `primedesign init` inside an existing application first, or use `--cwd`. The default destination is `src/components/ui`. `primedesign.config.json` changes the source and style directories. The CLI never installs dependencies or executes a remote template.

Source mode copies the component's original module, its relative source dependencies and a named facade. Shared modules are deduplicated under `components/ui/prime/<package>/...`; adding multiple components does not generate conflicting copies. Imports of the common React provider point to `@primedesign/react` and commerce store/helper imports point to `@primedesign/commerce` to preserve a single theme context. Relative source imports omit `.js` so consumer bundlers resolve `.tsx` correctly. Keep the listed package dependencies and `@primedesign/css` installed; this is editable component source, not a dependency-free fork of the entire design system.

Every embedded source file has a SHA-256 integrity hash verified before copying. All output paths are checked before any write. Identical source files are skipped, modified files cause an error, `--dry-run` prints intended writes, and `--force` deliberately replaces files. `diff` compares local source with the currently installed CLI's snapshot; it does not merge or download an update. Paths that escape through symlinks are rejected.

`npm run registry:build` generates the CLI's offline manifest and a public registry under the documentation site's `/r/` path. Individual JSON files follow the [Registry Item schema](https://ui.shadcn.com/docs/registry/registry-item-json), including full source content, dependency names and explicit target paths. `registry.json` is the index. Host the docs output before using those URLs in a remote installer; a GitHub repository URL is not a hosted registry endpoint. Consuming this format through third-party installers has not been included in the automated test suite; the native PrimeDesign source CLI is tested with the full catalog and a Next.js production build.

The live documentation also contains a coverage map against the official [component catalog](https://ui.shadcn.com/docs/components). Its checked date is recorded there. It distinguishes existing implementations and narrower equivalents, rather than asserting identical APIs or overall superiority. PrimeDesign's main additions are Persian utilities, commerce workflows and a portable browser/WordPress distribution.
