'use client';
import { PrimeProvider, ToastProvider } from '@primedesign/react';
import { CartProvider } from '@primedesign/commerce';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrimeProvider>
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
      </ToastProvider>
    </PrimeProvider>
  );
}
