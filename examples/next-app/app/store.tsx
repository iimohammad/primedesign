'use client';
import { useCart } from '@primedesign/commerce';
import { ProductCard } from '../src/components/ui/product-card';
import { PromptInput } from '@primedesign/ai';
import { DataTable } from '@primedesign/data';
export function Store() {
  const cart = useCart();
  return (
    <>
      <ProductCard
        product={{ id: 'one', title: 'Demo', price: 100, stock: 3 }}
        onAddToCart={(p, q, v) => cart.add(p, q, v)}
      />
      <PromptInput
        onSubmit={async (input) => {
          console.log(input.text);
        }}
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
