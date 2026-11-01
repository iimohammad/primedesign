'use client';
import { Icon } from '@primedesign/icons';
import { formatMoney, formatNumber, type MoneyCurrency } from '@primedesign/persian';
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  IconButton,
  Input,
  NumberInput,
  Progress,
  RadioGroup,
  Stepper,
  Timeline,
  useLabels,
  usePrime,
} from '@primedesign/react';
import { useState, type ReactNode } from 'react';
import { calculateCart, itemPrice, itemStock, useCart, type CartItem } from './cart.js';
import { Price, ProductImage, type Product } from './products.js';
export function CartLineItem({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const l = useLabels(
    { remove: 'حذف از سبد', quantity: 'تعداد' },
    { remove: 'Remove from cart', quantity: 'Quantity' },
  );
  return (
    <article className="pd-cart-line">
      <ProductImage src={item.product.image} alt={item.product.title} />
      <div className="pd-cart-line-info">
        <strong>{item.product.title}</strong>
        {item.variant && <small>{item.variant.label}</small>}
        <Price value={itemPrice(item)} currency={item.product.currency} size="sm" />
        <NumberInput
          label={`${l.quantity}: ${item.product.title}`}
          value={item.quantity}
          min={1}
          max={itemStock(item.product, item.variant)}
          onValueChange={onQuantityChange}
        />
      </div>
      <IconButton
        label={`${l.remove}: ${item.product.title}`}
        icon="trash"
        variant="ghost"
        size="sm"
        onClick={onRemove}
      />
    </article>
  );
}
export function CartSummary({
  items,
  shipping = 0,
  discount = 0,
  tax = 0,
  currency = 'IRT',
  onCheckout,
  loading,
  footer,
}: {
  items: CartItem[];
  shipping?: number;
  discount?: number;
  tax?: number;
  currency?: MoneyCurrency;
  onCheckout?: () => void | Promise<void>;
  loading?: boolean;
  footer?: ReactNode;
}) {
  const s = calculateCart(items, { shipping, discount, tax }),
    { locale } = usePrime(),
    l = useLabels(
      {
        title: 'خلاصهٔ سفارش',
        subtotal: 'مبلغ کالاها',
        shipping: 'هزینهٔ ارسال',
        discount: 'تخفیف',
        tax: 'مالیات',
        total: 'مبلغ قابل پرداخت',
        checkout: 'ادامهٔ خرید',
        free: 'رایگان',
        secure: 'پرداخت امن و رمزگذاری‌شده',
      },
      {
        title: 'Order summary',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        discount: 'Discount',
        tax: 'Tax',
        total: 'Total',
        checkout: 'Continue to checkout',
        free: 'Free',
        secure: 'Secure checkout',
      },
    ),
    [pending, setPending] = useState(false),
    [error, setError] = useState('');
  return (
    <Card className="pd-cart-summary">
      <h3>{l.title}</h3>
      <dl>
        <div>
          <dt>{l.subtotal}</dt>
          <dd>{formatMoney(s.subtotal, currency, locale)}</dd>
        </div>
        <div>
          <dt>{l.shipping}</dt>
          <dd>{s.shipping ? formatMoney(s.shipping, currency, locale) : l.free}</dd>
        </div>
        {s.discount > 0 && (
          <div className="pd-text-success">
            <dt>{l.discount}</dt>
            <dd>−{formatMoney(s.discount, currency, locale)}</dd>
          </div>
        )}
        {s.tax > 0 && (
          <div>
            <dt>{l.tax}</dt>
            <dd>{formatMoney(s.tax, currency, locale)}</dd>
          </div>
        )}
        <div className="pd-summary-total">
          <dt>{l.total}</dt>
          <dd>{formatMoney(s.total, currency, locale)}</dd>
        </div>
      </dl>
      {footer}
      {onCheckout && (
        <Button
          fullWidth
          disabled={!items.length}
          loading={loading || pending}
          endIcon={<Icon name="arrowLeft" size={18} />}
          onClick={async () => {
            setPending(true);
            setError('');
            try {
              await onCheckout();
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Checkout failed');
            } finally {
              setPending(false);
            }
          }}
        >
          {l.checkout}
        </Button>
      )}
      {error && (
        <p role="alert" className="pd-error">
          {error}
        </p>
      )}
      <small className="pd-checkout-secure">
        <Icon name="lock" size={14} />
        {l.secure}
      </small>
    </Card>
  );
}
export function CouponInput({
  onApply,
  appliedCode,
  onRemove,
}: {
  onApply: (code: string) => Promise<void> | void;
  appliedCode?: string;
  onRemove?: () => void;
}) {
  const [code, setCode] = useState(''),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    l = useLabels(
      { placeholder: 'کد تخفیف', apply: 'اعمال', remove: 'حذف کد', error: 'کد تخفیف معتبر نیست.' },
      {
        placeholder: 'Coupon code',
        apply: 'Apply',
        remove: 'Remove code',
        error: 'Invalid coupon.',
      },
    );
  if (appliedCode)
    return (
      <div className="pd-coupon-applied">
        <Badge tone="success">{appliedCode}</Badge>
        {onRemove && (
          <IconButton label={l.remove} icon="close" variant="ghost" size="sm" onClick={onRemove} />
        )}
      </div>
    );
  return (
    <form
      className="pd-coupon"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!code.trim() || pending) return;
        setPending(true);
        setError('');
        try {
          await onApply(code.trim());
        } catch (e) {
          setError(e instanceof Error ? e.message : l.error);
        } finally {
          setPending(false);
        }
      }}
    >
      <Input
        aria-label={l.placeholder}
        placeholder={l.placeholder}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        error={error || undefined}
      />
      <Button type="submit" variant="outline" disabled={!code.trim()} loading={pending}>
        {l.apply}
      </Button>
    </form>
  );
}
export function FreeShippingProgress({
  subtotal,
  threshold,
}: {
  subtotal: number;
  threshold: number;
}) {
  const { locale } = usePrime(),
    l = useLabels(
      { achieved: 'ارسال سفارش شما رایگان است!', more: 'تا ارسال رایگان' },
      { achieved: 'Your order ships for free!', more: 'away from free shipping' },
    ),
    remaining = Math.max(0, threshold - subtotal);
  return (
    <div className="pd-shipping-progress">
      <span>
        <Icon name="truck" size={18} />
        {remaining ? `${formatMoney(remaining, 'IRT', locale)} ${l.more}` : l.achieved}
      </span>
      <Progress label={l.more} value={Math.min(subtotal, threshold)} max={Math.max(1, threshold)} />
    </div>
  );
}
export function MiniCart({
  open,
  onOpenChange,
  onCheckout,
  shippingThreshold = 2000000,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCheckout?: () => void;
  shippingThreshold?: number;
}) {
  const cart = useCart(),
    l = useLabels(
      {
        title: 'سبد خرید شما',
        empty: 'سبد خرید خالی است',
        description: 'محصولات دلخواهتان را به سبد اضافه کنید.',
      },
      {
        title: 'Your shopping bag',
        empty: 'Your bag is empty',
        description: 'Add something you love.',
      },
    ),
    { locale } = usePrime();
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={`${l.title} (${formatNumber(cart.count, {}, locale)})`}
      size="md"
    >
      {cart.items.length ? (
        <>
          <FreeShippingProgress subtotal={cart.subtotal} threshold={shippingThreshold} />
          <div className="pd-cart-lines">
            {cart.items.map((item) => (
              <CartLineItem
                key={item.key}
                item={item}
                onQuantityChange={(n) => cart.setQuantity(item.key, n)}
                onRemove={() => cart.remove(item.key)}
              />
            ))}
          </div>
          <CartSummary items={cart.items} onCheckout={onCheckout} />
        </>
      ) : (
        <EmptyState title={l.empty} description={l.description} icon="bag" />
      )}
    </Drawer>
  );
}
export function AddressCard({
  name,
  phone,
  address,
  postalCode,
  selected,
  onSelect,
  onEdit,
}: {
  name: string;
  phone: string;
  address: string;
  postalCode?: string;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
}) {
  const l = useLabels(
    { choose: 'انتخاب نشانی', edit: 'ویرایش', postal: 'کد پستی' },
    { choose: 'Select address', edit: 'Edit', postal: 'Postal code' },
  );
  return (
    <Card className={`pd-address-card${selected ? ' pd-address-selected' : ''}`}>
      <div>
        <strong>{name}</strong>
        {selected && (
          <Badge tone="brand">
            <Icon name="check" size={14} />
          </Badge>
        )}
      </div>
      <p>{address}</p>
      <small dir="ltr">{phone}</small>
      {postalCode && (
        <small>
          {l.postal}: {postalCode}
        </small>
      )}
      <div>
        {onSelect && (
          <Button
            variant={selected ? 'soft' : 'outline'}
            size="sm"
            aria-pressed={!!selected}
            onClick={onSelect}
          >
            {l.choose}
          </Button>
        )}
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            {l.edit}
          </Button>
        )}
      </div>
    </Card>
  );
}
export function ShippingMethodPicker({
  options,
  value,
  onValueChange,
  currency = 'IRT',
}: {
  options: { id: string; label: string; description?: string; price: number }[];
  value: string;
  onValueChange: (v: string) => void;
  currency?: MoneyCurrency;
}) {
  const { locale } = usePrime(),
    label = useLabels('روش ارسال', 'Shipping method');
  return (
    <RadioGroup
      label={label}
      name="shipping-method"
      value={value}
      onChange={onValueChange}
      options={options.map((o) => ({
        value: o.id,
        label: `${o.label} · ${formatMoney(o.price, currency, locale)}`,
        description: o.description,
      }))}
    />
  );
}
export function CheckoutStepper({ current }: { current: number }) {
  const labels = useLabels(
    ['سبد خرید', 'نشانی و ارسال', 'پرداخت', 'تکمیل سفارش'],
    ['Shopping bag', 'Delivery', 'Payment', 'Confirmation'],
  );
  return <Stepper current={current} steps={labels.map((label) => ({ label }))} />;
}
export function OrderCard({
  number,
  date,
  status,
  items,
  total,
  currency = 'IRT',
  onDetails,
}: {
  number: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  items: { title: string; image?: string; quantity: number }[];
  total: number;
  currency?: MoneyCurrency;
  onDetails?: () => void;
}) {
  const { locale } = usePrime(),
    l = useLabels(
      {
        order: 'سفارش',
        details: 'جزئیات سفارش',
        pending: 'در انتظار پرداخت',
        processing: 'در حال پردازش',
        shipped: 'ارسال شده',
        delivered: 'تحویل داده شده',
        canceled: 'لغو شده',
      },
      {
        order: 'Order',
        details: 'Order details',
        pending: 'Pending payment',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        canceled: 'Canceled',
      },
    );
  return (
    <Card className="pd-order-card">
      <header>
        <div>
          <strong>
            {l.order} #{number}
          </strong>
          <small>{date}</small>
        </div>
        <Badge
          tone={
            status === 'delivered'
              ? 'success'
              : status === 'canceled'
                ? 'danger'
                : status === 'pending'
                  ? 'warning'
                  : 'info'
          }
        >
          {l[status]}
        </Badge>
      </header>
      <div className="pd-order-products">
        {items.map((item, i) => (
          <div key={i}>
            <ProductImage src={item.image} alt={item.title} />
            <span>
              {item.title}
              <small>×{formatNumber(item.quantity, {}, locale)}</small>
            </span>
          </div>
        ))}
      </div>
      <footer>
        <strong>{formatMoney(total, currency, locale)}</strong>
        {onDetails && (
          <Button variant="outline" size="sm" onClick={onDetails}>
            {l.details}
          </Button>
        )}
      </footer>
    </Card>
  );
}
export function OrderTracking({
  steps,
}: {
  steps: { id: string; title: string; description?: string; date?: string }[];
}) {
  return <Timeline items={steps} />;
}
export function CompareTable({
  products,
  onRemove,
}: {
  products: Product[];
  onRemove?: (id: string) => void;
}) {
  const { locale } = usePrime(),
    l = useLabels(
      { title: 'مقایسهٔ محصولات', price: 'قیمت', stock: 'موجودی', remove: 'حذف از مقایسه' },
      {
        title: 'Compare products',
        price: 'Price',
        stock: 'Stock',
        remove: 'Remove from comparison',
      },
    );
  const keys = [...new Set(products.flatMap((p) => Object.keys(p.specifications ?? {})))];
  return (
    <div className="pd-compare-scroll" tabIndex={0} aria-label={l.title}>
      <table className="pd-table pd-compare-table">
        <caption>{l.title}</caption>
        <thead>
          <tr>
            <th scope="col">{l.title}</th>
            {products.map((p) => (
              <th scope="col" key={p.id}>
                <ProductImage src={p.image} alt="" />
                <strong>{p.title}</strong>
                {onRemove && (
                  <IconButton
                    label={`${l.remove}: ${p.title}`}
                    icon="close"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(p.id)}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{l.price}</th>
            {products.map((p) => (
              <td key={p.id}>{formatMoney(p.price, p.currency, locale)}</td>
            ))}
          </tr>
          <tr>
            <th scope="row">{l.stock}</th>
            {products.map((p) => (
              <td key={p.id}>{formatNumber(p.stock, {}, locale)}</td>
            ))}
          </tr>
          {keys.map((k) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              {products.map((p) => (
                <td key={p.id}>{p.specifications?.[k] ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
