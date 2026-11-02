# @primedesign/cli

Offline project initializer, component facade/source installer, theme generator and source diff/doctor commands.

```sh
primedesign init
primedesign add button product-card --source
primedesign list --source --json
primedesign search chat
primedesign diff button
primedesign doctor
```

Use `--dry-run` to inspect, `--cwd` to select an app and `--force` to intentionally replace modified files. Source mode copies actual PrimeDesign modules and local dependencies, verifies SHA-256 integrity, and protects existing changes and output boundaries. It does not install dependencies. Read the [source registry guide](https://github.com/iimohammad/primedesign/blob/main/docs/SOURCE-REGISTRY.md).

Version 0.2.0 is distributed through repository builds/local tarballs; public npm publication is separate. MIT.
