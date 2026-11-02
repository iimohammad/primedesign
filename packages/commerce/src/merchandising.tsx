'use client';
import { useState, type ReactNode } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CopyButton,
  NumberInput,
  Rating,
  Tabs,
  useLabels,
  usePrime,
} from '@primedesign/react';
import { Icon } from '@primedesign/icons';
import { formatMoney } from '@primedesign/persian';
import {
  ColorSwatches,
  Price,
  ProductGallery,
  ProductImage,
  StockBadge,
  type Product,
  type ProductCardProps,
} from './products.js';
import { itemStock } from './cart.js';
export function ProductDetail({
  product,
  onAddToCart,
  description,
  shippingInfo,
}: {
  product: Product;
  onAddToCart: NonNullable<ProductCardProps['onAddToCart']>;
  description?: ReactNode;
  shippingInfo?: ReactNode;
}) {
  const [variantId, setVariant] = useState(product.variants?.find((v) => v.stock !== 0)?.id ?? ''),
    [quantity, setQuantity] = useState(1),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    variant = product.variants?.find((v) => v.id === variantId),
    stock = itemStock(product, variant),
    l = useLabels(
      {
        add: 'افزودن به سبد خرید',
        quantity: 'تعداد',
        variant: 'انتخاب مدل',
        description: 'توضیحات',
        specs: 'مشخصات',
        shipping: 'ارسال',
      },
      {
        add: 'Add to shopping bag',
        quantity: 'Quantity',
        variant: 'Choose variant',
        description: 'Description',
        specs: 'Specifications',
        shipping: 'Delivery',
      },
    );
  return (
    <section className="pd-product-detail">
      <ProductGallery
        title={product.title}
        images={
          product.images ?? (product.image ? [{ src: product.image, alt: product.title }] : [])
        }
      />
      <div>
        <small>{product.brand}</small>
        <h2>{product.title}</h2>
        {product.rating !== undefined && (
          <Rating label={product.title} value={product.rating} readonly />
        )}
        <p>{product.description}</p>
        <Price
          value={variant?.price ?? product.price}
          original={product.originalPrice}
          currency={product.currency}
          size="lg"
        />
        <StockBadge stock={stock} />
        {product.variants && (
          <ColorSwatches
            label={l.variant}
            variants={product.variants}
            value={variantId}
            onValueChange={(id) => {
              setVariant(id);
              setQuantity(1);
            }}
          />
        )}
        <NumberInput
          label={l.quantity}
          value={quantity}
          onValueChange={setQuantity}
          min={1}
          max={Math.max(1, stock)}
          disabled={!stock}
        />
        <Button
          fullWidth
          disabled={!stock}
          loading={pending}
          startIcon={<Icon name="cart" />}
          onClick={async () => {
            setPending(true);
            setError('');
            try {
              await onAddToCart(product, quantity, variant);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not add product');
            } finally {
              setPending(false);
            }
          }}
        >
          {l.add}
        </Button>
        {error && (
          <div role="alert" className="pd-error">
            {error}
          </div>
        )}
      </div>
      <div className="pd-product-detail-tabs">
        <Tabs
          label={product.title}
          items={[
            {
              value: 'description',
              label: l.description,
              content: description ?? product.description,
            },
            {
              value: 'specs',
              label: l.specs,
              content: (
                <dl className="pd-specification-list">
                  {Object.entries(product.specifications ?? {}).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ),
            },
            { value: 'shipping', label: l.shipping, content: shippingInfo ?? '—' },
          ]}
        />
      </div>
    </section>
  );
}
export function BundleCard({
  title,
  products,
  price,
  onAddBundle,
}: {
  title: string;
  products: Product[];
  price: number;
  onAddBundle: (products: Product[]) => void | Promise<void>;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    subtotal = products.reduce((sum, p) => sum + p.price, 0),
    l = useLabels(
      { add: 'افزودن بسته به سبد', saving: 'صرفه‌جویی' },
      { add: 'Add bundle to cart', saving: 'You save' },
    ),
    { locale } = usePrime();
  return (
    <Card className="pd-bundle-card">
      <h3>{title}</h3>
      <div className="pd-bundle-products">
        {products.map((p, i) => (
          <div key={p.id}>
            {i > 0 && <Icon name="plus" size={16} />}
            <ProductImage src={p.image} alt={p.title} />
            <small>{p.title}</small>
          </div>
        ))}
      </div>
      <Price value={price} original={subtotal} currency={products[0]?.currency} />
      {price < subtotal && (
        <Badge tone="success">
          {l.saving}: {formatMoney(subtotal - price, products[0]?.currency, locale)}
        </Badge>
      )}
      <Button
        fullWidth
        disabled={!products.length || products.some((p) => p.stock <= 0)}
        loading={pending}
        onClick={async () => {
          setPending(true);
          setError('');
          try {
            await onAddBundle(products);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not add bundle');
          } finally {
            setPending(false);
          }
        }}
      >
        {l.add}
      </Button>
      {error && (
        <p className="pd-error" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
export function SellerCard({
  name,
  logo,
  rating,
  description,
  verified,
  action,
}: {
  name: string;
  logo?: string;
  rating?: number;
  description?: string;
  verified?: boolean;
  action?: ReactNode;
}) {
  const verifiedLabel = useLabels('فروشندهٔ تأیید شده', 'Verified seller');
  return (
    <Card className="pd-seller-card">
      <Avatar name={name} src={logo} size="lg" />
      <div>
        <strong>{name}</strong>
        {verified && (
          <Badge tone="success">
            <Icon name="shield" size={13} />
            {verifiedLabel}
          </Badge>
        )}
        {description && <p>{description}</p>}
        {rating !== undefined && <Rating label={name} value={rating} readonly />}
      </div>
      {action}
    </Card>
  );
}
export function CouponCard({
  code,
  title,
  description,
  expires,
}: {
  code: string;
  title: string;
  description?: string;
  expires?: string;
}) {
  return (
    <Card className="pd-coupon-card">
      <span>
        <Icon name="tag" size={26} />
      </span>
      <div>
        <strong>{title}</strong>
        {description && <p>{description}</p>}
        {expires && <small>{expires}</small>}
      </div>
      <div>
        <code>{code}</code>
        <CopyButton value={code} />
      </div>
    </Card>
  );
}
