'use client';
import { ProductCard, useCart } from '@primedesign/commerce';
import { DataTable } from '@primedesign/data';
export function Store() {
  const cart = useCart();
  return (
    <>
      <ProductCard
        product={{ id: 'one', title: 'Demo', price: 100, stock: 3 }}
        onAddToCart={(p, q, v) => cart.add(p, q, v)}
      />
      <DataTable
        caption="Orders"
        columns={[{ id: 'name', header: 'Name' }]}
        rows={[{ id: 'one', name: 'Sara' }]}
        getRowId={(r) => r.id}
      />
    </>
  );
}
