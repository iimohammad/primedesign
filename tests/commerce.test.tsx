import {
  calculateCart,
  cartKey,
  CartProvider,
  cartReducer,
  CartSummary,
  CompareProvider,
  ProductCard,
  useCart,
  useCompare,
  type Product,
} from '@primedesign/commerce';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
const product: Product = {
  id: 'p1',
  title: 'Headphones',
  price: 100,
  originalPrice: 150,
  stock: 3,
  variants: [
    { id: 'black', label: 'Black', stock: 2, price: 120, color: '#111111' },
    { id: 'white', label: 'White', stock: 0, color: '#ffffff' },
  ],
};
describe('cart models', () => {
  it('does not insert zero-quantity fractional additions or nonfinite stock', () => {
    expect(cartReducer([], { type: 'add', product, quantity: 0.3 })).toEqual([]);
    expect(cartReducer([], { type: 'add', product: { ...product, stock: NaN } })).toEqual([]);
  });
  it('merges identical variants, separates distinct variants, clamps inventory', () => {
    let cart = cartReducer([], {
      type: 'add',
      product,
      variant: product.variants![0],
      quantity: 1,
    });
    cart = cartReducer(cart, { type: 'add', product, variant: product.variants![0], quantity: 5 });
    expect(cart[0].quantity).toBe(2);
    cart = cartReducer(cart, { type: 'add', product, quantity: 1 });
    expect(cart).toHaveLength(2);
    expect(calculateCart(cart).subtotal).toBe(340);
  });
  it('ignores invalid or unavailable additions', () => {
    expect(cartReducer([], { type: 'add', product, quantity: NaN })).toEqual([]);
    expect(cartReducer([], { type: 'add', product, variant: product.variants![1] })).toEqual([]);
    expect(cartReducer([], { type: 'add', product, quantity: -4 })).toEqual([]);
  });
  it('removes zero quantities and rejects nonfinite updates', () => {
    const cart = cartReducer([], { type: 'add', product });
    expect(cartReducer(cart, { type: 'quantity', key: cart[0].key, quantity: NaN })).toEqual(cart);
    expect(cartReducer(cart, { type: 'quantity', key: cart[0].key, quantity: 0 })).toEqual([]);
  });
  it('cannot collide between product and variant identifier boundaries', () => {
    expect(cartKey('a:b', 'c')).not.toBe(cartKey('a', 'b:c'));
  });
  it('clamps discounts and negative charges, calculates exact integer totals', () => {
    const cart = cartReducer([], { type: 'add', product, quantity: 2 });
    expect(calculateCart(cart, { discount: 1000, shipping: -50, tax: NaN })).toEqual({
      subtotal: 200,
      discount: 200,
      shipping: 0,
      tax: 0,
      total: 0,
      count: 2,
    });
  });
});
describe('store interactions', () => {
  it('adds selected variants through the application callback', async () => {
    const add = vi.fn();
    render(<ProductCard product={product} onAddToCart={add} />);
    await userEvent.click(screen.getByRole('button', { name: 'افزودن به سبد: Headphones' }));
    expect(add).toHaveBeenCalledWith(product, 1, product.variants![0]);
    expect(screen.getByRole('radio', { name: 'White' })).toBeDisabled();
  });
  it('disables unavailable product actions', () => {
    render(
      <ProductCard
        product={{ ...product, stock: 0, variants: undefined }}
        onAddToCart={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'افزودن به سبد: Headphones' })).toBeDisabled();
  });
  it('shows backend add failures and allows retry', async () => {
    const add = vi
      .fn()
      .mockRejectedValueOnce(new Error('Inventory changed'))
      .mockResolvedValue(undefined);
    render(<ProductCard product={product} onAddToCart={add} />);
    await userEvent.click(screen.getByRole('button', { name: /افزودن به سبد/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Inventory changed');
    await userEvent.click(screen.getByRole('button', { name: /افزودن به سبد/ }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(add).toHaveBeenCalledTimes(2);
  });
  it('connects cards and order summaries to the same cart state', async () => {
    function Store() {
      const cart = useCart();
      return (
        <>
          <ProductCard product={product} onAddToCart={(p, q, v) => cart.add(p, q, v)} />
          <output aria-label="Count">{cart.count}</output>
          <CartSummary items={cart.items} onCheckout={() => {}} />
        </>
      );
    }
    render(
      <CartProvider>
        <Store />
      </CartProvider>,
    );
    expect(screen.getByRole('button', { name: 'ادامهٔ خرید' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /افزودن به سبد/ }));
    expect(screen.getByLabelText('Count')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: 'ادامهٔ خرید' })).not.toBeDisabled();
  });
  it('enforces comparison limits and allows removal', async () => {
    function Demo() {
      const c = useCompare();
      return (
        <>
          <button onClick={() => c.toggle('one')}>One</button>
          <button onClick={() => c.toggle('two')}>Two</button>
          <output>{c.ids.join(',')}</output>
        </>
      );
    }
    render(
      <CompareProvider max={1}>
        <Demo />
      </CompareProvider>,
    );
    await userEvent.click(screen.getByText('One'));
    await userEvent.click(screen.getByText('Two'));
    expect(screen.getByRole('status')).toHaveTextContent('one');
    await userEvent.click(screen.getByText('One'));
    await userEvent.click(screen.getByText('Two'));
    expect(screen.getByRole('status')).toHaveTextContent('two');
  });
});
