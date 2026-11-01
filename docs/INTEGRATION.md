# Integrating Next.js and Django

## Next.js App Router

```tsx
// app/layout.tsx (server)
import '@primedesign/css';
import { Providers } from './providers';
export default function Layout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/providers.tsx
('use client');
import { PrimeProvider, ToastProvider } from '@primedesign/react';
import { CartProvider } from '@primedesign/commerce';
export function Providers({ children }) {
  return (
    <PrimeProvider defaultTheme="system">
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </PrimeProvider>
  );
}
```

Fetch serializable product data on the server and pass it to a client component. Callbacks such as `onAddToCart` belong in that client component. Prefer ISO date strings across the server/client boundary and convert them using `fromISODate` before passing `Date` props. `tokens` and `persian` can be imported on either side.

## Django table adapter

```ts
function toQuery(state) {
  const params = new URLSearchParams({
    page: String(state.page),
    page_size: String(state.pageSize),
    search: state.search,
  });
  if (state.sort)
    params.set('ordering', `${state.sort.direction === 'desc' ? '-' : ''}${state.sort.id}`);
  for (const filter of state.filters) params.set(filter.id, String(filter.value));
  return params;
}
```

This is an adapter example, not a universal Django contract. Whitelist ordering/filter fields server-side. Abort superseded fetches; show server errors and pass `rowCount` from the API. A controlled `state` plus `onStateChange` keeps URL search params, filters and pagination reproducible.

## Product and cart contract

Supply integer money amounts in the selected currency. `IRT` values are tomans; do not silently mix tomans and rials. Send only product ID, variant ID, quantity and coupon intent to the checkout API. The server must price the basket, recheck stock, apply discounts and taxes, authorize the user and create payment sessions. Client totals are display estimates.

All products in one CartSummary must share a currency; if you support multiple currencies, maintain separate baskets or convert on the server first.

## Upload adapter

Implement `Uploader(file, { signal, onProgress })` for your own authenticated API. For multipart uploads, implement `begin`, `uploadPart`, and `complete` and pass them to `createChunkedUploader`. Use server-generated opaque upload IDs, validate tenant ownership of every part, enforce content/size limits server-side and perform server-side cleanup of abandoned sessions.

Cancellation aborts the supplied signal. Resume is in-memory for the same File instance; surviving page reloads requires an application-specific resumable upload service and file identity verification.

## Forms

`useForm` accepts sync/async validation. `Form` catches submission failures and displays a form-level error. Map server field errors with `setErrors`; avoid showing private backend exception details. For drafts, explicitly allowlist non-sensitive fields through `useFormDraft` and clear the draft after successful submission.
