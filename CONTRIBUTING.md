# Contributing

Use Node from `.nvmrc`, run `npm ci`, then `npm run build`. Run `npm run dev` for interactive examples.

1. Keep framework-independent utilities in `tokens` or `persian`.
2. Use semantic tokens and CSS logical properties. Scope resets to `.pd-root`.
3. Keep interactive package entry points marked `use client`. Do not introduce import-time DOM access.
4. Type public APIs; keep data fetching, authentication and billing policy in consumers.
5. Add an interaction or regression test for behavior changes. Test disabled, empty, loading, error, RTL and narrow-screen states where relevant.
6. Update examples and regenerate the API reference with `npm run api:build`.
7. Run `npm run format`, `npm run check` and `npm run test:e2e`.

Do not commit generated `dist`, `artifacts`, browser reports, credentials or private font files. Keep compatible peer support for React 18.3 and 19; CI runs both versions.
