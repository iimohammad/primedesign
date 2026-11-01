'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Product, ProductVariant } from './products.js';
export interface CartItem {
  key: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}
export type CartAction =
  | { type: 'add'; product: Product; variant?: ProductVariant; quantity?: number }
  | { type: 'quantity'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' };
export const cartKey = (productId: string, variantId?: string) =>
  JSON.stringify([productId, variantId ?? null]);
export function itemStock(product: Product, variant?: ProductVariant): number {
  const stock = variant?.stock ?? product.stock;
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
}
export function itemPrice(item: CartItem): number {
  return item.variant?.price ?? item.product.price;
}
export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  if (action.type === 'clear') return [];
  if (action.type === 'remove') return items.filter((i) => i.key !== action.key);
  if (action.type === 'quantity') {
    if (!Number.isFinite(action.quantity)) return items;
    return items
      .map((i) =>
        i.key === action.key
          ? {
              ...i,
              quantity: Math.max(
                0,
                Math.min(itemStock(i.product, i.variant), Math.floor(action.quantity)),
              ),
            }
          : i,
      )
      .filter((i) => i.quantity > 0);
  }
  const stock = itemStock(action.product, action.variant),
    amount = action.quantity ?? 1;
  if (!Number.isFinite(amount) || Math.floor(amount) <= 0 || stock === 0) return items;
  const key = cartKey(action.product.id, action.variant?.id),
    existing = items.find((i) => i.key === key),
    quantity = Math.min(stock, (existing?.quantity ?? 0) + Math.floor(amount));
  return existing
    ? items.map((i) =>
        i.key === key ? { ...i, product: action.product, variant: action.variant, quantity } : i,
      )
    : [...items, { key, product: action.product, variant: action.variant, quantity }];
}
export function calculateCart(
  items: CartItem[],
  {
    shipping = 0,
    discount = 0,
    tax = 0,
  }: { shipping?: number; discount?: number; tax?: number } = {},
) {
  const subtotal = items.reduce((sum, i) => sum + itemPrice(i) * i.quantity, 0),
    safeDiscount = Math.max(0, Math.min(subtotal, Number.isFinite(discount) ? discount : 0)),
    safeShipping = Math.max(0, Number.isFinite(shipping) ? shipping : 0),
    safeTax = Math.max(0, Number.isFinite(tax) ? tax : 0);
  return {
    subtotal,
    discount: safeDiscount,
    shipping: safeShipping,
    tax: safeTax,
    total: subtotal - safeDiscount + safeShipping + safeTax,
    count: items.reduce((n, i) => n + i.quantity, 0),
  };
}
interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (p: Product, quantity?: number, variant?: ProductVariant) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({
  children,
  initialItems = [],
  onItemsChange,
}: {
  children: ReactNode;
  initialItems?: CartItem[];
  onItemsChange?: (items: CartItem[]) => void;
}) {
  const [items, setItems] = useState(initialItems);
  const onChangeRef = useRef(onItemsChange);
  useEffect(() => {
    onChangeRef.current = onItemsChange;
  }, [onItemsChange]);
  const dispatch = (action: CartAction) => setItems((v) => cartReducer(v, action));
  useEffect(() => {
    onChangeRef.current?.(items);
  }, [items]);
  const summary = calculateCart(items);
  return (
    <CartContext.Provider
      value={{
        items,
        count: summary.count,
        subtotal: summary.subtotal,
        add: (product, quantity = 1, variant) =>
          dispatch({ type: 'add', product, quantity, variant }),
        setQuantity: (key, quantity) => dispatch({ type: 'quantity', key, quantity }),
        remove: (key) => dispatch({ type: 'remove', key }),
        clear: () => dispatch({ type: 'clear' }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
export function useCart(): CartContextValue {
  const c = useContext(CartContext);
  if (!c) throw new Error('Wrap your store in CartProvider');
  return c;
}
interface WishlistContextValue {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}
const WishlistContext = createContext<WishlistContextValue | null>(null);
export function WishlistProvider({
  children,
  initialIds = [],
  onChange,
}: {
  children: ReactNode;
  initialIds?: string[];
  onChange?: (ids: string[]) => void;
}) {
  const [ids, setIds] = useState(initialIds);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const toggle = (id: string) =>
    setIds((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  useEffect(() => {
    onChangeRef.current?.(ids);
  }, [ids]);
  return (
    <WishlistContext.Provider value={{ ids, toggle, has: (id) => ids.includes(id) }}>
      {children}
    </WishlistContext.Provider>
  );
}
export function useWishlist() {
  const c = useContext(WishlistContext);
  if (!c) throw new Error('Wrap your store in WishlistProvider');
  return c;
}
interface CompareContextValue {
  ids: string[];
  toggle: (id: string) => boolean;
  clear: () => void;
  max: number;
}
const CompareContext = createContext<CompareContextValue | null>(null);
export function CompareProvider({ children, max = 4 }: { children: ReactNode; max?: number }) {
  const [ids, setIds] = useState<string[]>([]);
  const current = useRef(ids);
  return (
    <CompareContext.Provider
      value={{
        ids,
        max,
        toggle: (id) => {
          if (current.current.includes(id)) {
            current.current = current.current.filter((x) => x !== id);
            setIds(current.current);
            return true;
          }
          if (current.current.length >= max) return false;
          current.current = [...current.current, id];
          setIds(current.current);
          return true;
        },
        clear: () => {
          current.current = [];
          setIds([]);
        },
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}
export function useCompare() {
  const c = useContext(CompareContext);
  if (!c) throw new Error('Wrap your store in CompareProvider');
  return c;
}
