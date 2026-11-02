# Validation of 0.2.0

Executed locally on 2026-11-02, using Node.js 24:

| Check                                                    | Result                                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Production build + all workspace typechecks              | Passed                                                                                  |
| Vitest on React 19.3.1                                   | 129 tests passed                                                                        |
| Build, types, Vitest and package checks on React 18.3.1  | 129 tests passed                                                                        |
| Chromium desktop and Pixel 7 viewport                    | 48 browser tests passed                                                                 |
| axe WCAG 2 A/AA and 2.1 AA checks                        | Passed for 11 documentation sections on desktop/mobile                                  |
| Actual packed-package Next.js 16.4.3 production consumer | Passed, including server import of a copied source Button and client source ProductCard |
| Package contents and licenses                            | 12 npm packages verified                                                                |
| PHP syntax                                               | Parsed with PHP 7.4 syntax rules                                                        |
| Browser and WordPress archives                           | Required assets and manifests verified                                                  |
| Formatting                                               | Prettier passed                                                                         |

Browser tests exercise shared custom-element cart state, asynchronous failure, native required validity/FormData/reset, slotted modal focus, date selection, schema rules, scoped themes, pre-definition props, provider JSON, disconnect/reconnect and the WordPress JavaScript adapter with a mocked WooCommerce AJAX response. The source CLI is tested against the entire catalog, file hashes, modified-file protection, diff, unknown input and symlink output boundaries.

The generated inventory contains 194 component exports (including context providers), 188 source registry entries and 181 custom-element tags (including the provider and schema-form alias). Counts describe different APIs and should not be added together.

This environment did not have a live WordPress/WooCommerce installation. PHP activation, theme/plugin interaction, actual cart sessions and tax/currency extensions require staging verification. Vue/Angular/Svelte interoperability uses browser custom-element standards; framework-specific sample builds are not part of the automated suite. No full screen-reader audit or blanket equivalence to another design system is claimed. See [CONTRACTS.md](CONTRACTS.md) and the interactive coverage map for feature limits.
