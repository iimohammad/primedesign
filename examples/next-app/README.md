# Next.js consumer example

From the repository root:

```bash
npm ci
npm run pack
npm install --prefix examples/next-app
npm run build --prefix examples/next-app
npm run dev --prefix examples/next-app
```

This installs the real local npm tarballs and exercises CSS assets, server-safe Persian utilities, a server import of Button, client providers, ProductCard and DataTable. It does not rely on source aliases or workspace symlinks.
