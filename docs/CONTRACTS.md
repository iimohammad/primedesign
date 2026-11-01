# Public behavior and limits

- React 18.3 / 19, ESM, modern browsers with native dialog, CSS logical properties and color-mix support. This is a web library; it does not provide React Native components.
- `PrimeProvider` defaults to Persian/RTL. `locale="en-US"` selects English labels and Latin numerals. `ar` supports RTL and Intl formatting; built-in component translations currently fall back to English. Supply application copy yourself for complete Arabic localization.
- `Calendar`, `DatePicker` and `DateRangePicker` always display the Jalali calendar. They are not Gregorian calendar selectors. `digits` changes numeral display. Month names remain Persian.
- Product price, originalPrice and variant price must be finite non-negative money amounts. Stock must be a finite non-negative integer. A variant with omitted stock inherits product stock. Server checkout remains authoritative.
- `CartProvider`, `WishlistProvider`, `CompareProvider` are controlled application islands, with in-memory state and initial values; they do not synchronize tabs or users. Do not reuse a provider instance across tenants.
- `ProductCard` only displays an add action when `onAddToCart` is supplied; pending/error states follow the returned promise. Currency is supplied by the product; mixed-currency baskets are not supported.
- Table page numbers start at 1. `rowCount` is required for accurate server pagination. `onExport` should be supplied in server mode to export the complete server result. Without it the UI exports the currently loaded rows.
- Virtualization assumes fixed `rowHeight`; long content is truncated in table cells. Expandable rows use the nonvirtual path to avoid incorrect spacer geometry. Consumer-supplied row IDs must be unique and stable.
- Column resizing is an accessible range input and can be changed with arrow keys. Column ordering uses the column settings buttons; drag-and-drop reordering is not implemented.
- Default numeric filters are substring text inputs. Numeric comparison operators are available through `TableState.filters`; applications can provide their own filter editor via `toolbar`.
- `TreeView` is a nested native disclosure list, not an ARIA tree widget. Charts provide equivalent data tables, not a full chart analytics engine.
- `PasswordStrength` is visual feedback, not a password policy or security estimator. Apply your actual policy on the server.
- CSS complete bundle includes scoped resets, but semantic tokens default on `:root`. Import individual files or apply explicit providers when embedding in an existing app.
- CLI `add` generates typed re-export facades. It does not copy third-party source or install npm dependencies automatically. Use `--dry-run` for inspection and `--force` only when replacement is intended.
- Native modal dialogs use the browser top layer. Popovers stay inside their provider subtree to preserve theme and locale; a transformed/containing ancestor can alter fixed positioning. Avoid transformed overlay ancestors in app layouts.
- Themes choose button foreground by contrast; arbitrary custom color combinations and consumer CSS need their own accessibility audit. No blanket WCAG certification is claimed.
