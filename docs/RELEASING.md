# Release process

The initial packages are not published to the public npm registry. Publishing is a separate, explicit operation.

1. Update all internal package versions and exact workspace dependency versions together.
2. Add release notes to `CHANGELOG.md`.
3. Run `npm ci`, `npm run format:check`, `npm run check` and `npm run test:e2e`.
4. Run `npm run pack` and smoke-test the tarballs together in a clean consumer project.
5. Inspect `npm pack --dry-run` for each package, source attribution and the bundled font license.
6. Publish to an authorized registry in dependency order: tokens, persian, icons, css, react, forms/data/commerce, blocks, cli. Use an authenticated release identity; do not add tokens to the repository.
7. Tag the tested commit and publish release notes. Run a consumer build against the released versions.

The repository CI does not publish packages, deploy the docs or spend money automatically.
