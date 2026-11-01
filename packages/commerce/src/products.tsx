'use client';
import { Icon } from '@primedesign/icons';
import { formatMoney, formatNumber, type MoneyCurrency } from '@primedesign/persian';
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  IconButton,
  Rating,
  Skeleton,
  cx,
  useLabels,
  usePrime,
} from '@primedesign/react';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { itemStock } from './cart.js';
export interface ProductVariant {
  id: string;
  label: string;
  color?: string;
  price?: number;
  stock?: number;
}
export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  images?: { src: string; alt: string }[];
  href?: string;
  price: number;
  originalPrice?: number;
  currency?: MoneyCurrency;
  stock: number;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category?: string;
  badges?: string[];
  variants?: ProductVariant[];
  seller?: string;
  freeShipping?: boolean;
  specifications?: Record<string, string>;
}
export type ProductCardLayout = 'default' | 'compact' | 'horizontal' | 'minimal' | 'featured';
export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <div className={cx('pd-product-image', className)}>
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span role="img" aria-label={alt}>
          <Icon name="box" size={64} />
        </span>
      )}
    </div>
  );
}
export function Price({
  value,
  original,
  currency = 'IRT',
  size = 'md',
}: {
  value: number;
  original?: number;
  currency?: MoneyCurrency;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { locale } = usePrime(),
    l = useLabels(
      { previous: 'قیمت قبل', current: 'قیمت' },
      { previous: 'Previous price', current: 'Price' },
    );
  return (
    <div className={cx('pd-price', `pd-price--${size}`)}>
      {original !== undefined && original > value && (
        <del aria-label={l.previous}>{formatMoney(original, currency, locale)}</del>
      )}
      <strong aria-label={l.current}>{formatMoney(value, currency, locale)}</strong>
    </div>
  );
}
export function DiscountBadge({ price, originalPrice }: { price: number; originalPrice: number }) {
  const { locale } = usePrime(),
    discount = Math.max(0, Math.min(100, Math.round((1 - price / originalPrice) * 100))),
    label = useLabels('تخفیف', 'off');
  return originalPrice > price && originalPrice > 0 ? (
    <Badge tone="danger">
      {formatNumber(discount, {}, locale)}٪ {label}
    </Badge>
  ) : null;
}
export function StockBadge({ stock, lowStock = 5 }: { stock: number; lowStock?: number }) {
  const { locale } = usePrime(),
    l = useLabels(
      { out: 'ناموجود', low: 'عدد باقی مانده', in: 'موجود در انبار' },
      { out: 'Out of stock', low: 'left in stock', in: 'In stock' },
    );
  return (
    <span
      className={cx(
        'pd-stock',
        stock <= 0 ? 'pd-text-danger' : stock <= lowStock ? 'pd-text-warning' : 'pd-text-success',
      )}
    >
      <i />
      {stock <= 0
        ? l.out
        : stock <= lowStock
          ? `${formatNumber(stock, {}, locale)} ${l.low}`
          : l.in}
    </span>
  );
}
export function ColorSwatches({
  variants,
  value,
  onValueChange,
  label,
  disabled,
}: {
  variants: ProductVariant[];
  value: string;
  onValueChange: (id: string) => void;
  label: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="pd-swatches" role="radiogroup" aria-label={label}>
      {variants.map((v) => (
        <label
          key={v.id}
          title={v.label}
          data-selected={value === v.id || undefined}
          data-disabled={v.stock === 0 || undefined}
        >
          <input
            type="radio"
            name={id}
            value={v.id}
            checked={value === v.id}
            aria-label={v.label}
            disabled={disabled || v.stock === 0}
            onChange={() => onValueChange(v.id)}
          />
          <span style={{ background: v.color ?? 'var(--pd-muted)' }}>{!v.color && v.label}</span>
        </label>
      ))}
    </div>
  );
}
export interface ProductCardProps {
  product: Product;
  layout?: ProductCardLayout;
  onAddToCart?: (
    product: Product,
    quantity: number,
    variant?: ProductVariant,
  ) => void | Promise<void>;
  onQuickView?: (product: Product) => void;
  onWishlistChange?: (product: Product) => void;
  wishlisted?: boolean;
  onCompareChange?: (product: Product) => void;
  compared?: boolean;
  className?: string;
}
export function ProductCard({
  product: p,
  layout = 'default',
  onAddToCart,
  onQuickView,
  onWishlistChange,
  wishlisted,
  onCompareChange,
  compared,
  className,
}: ProductCardProps) {
  const [variantId, setVariant] = useState(p.variants?.find((v) => v.stock !== 0)?.id ?? ''),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    variant = p.variants?.find((v) => v.id === variantId),
    price = variant?.price ?? p.price,
    stock = itemStock(p, variant),
    l = useLabels(
      {
        add: 'افزودن به سبد',
        view: 'مشاهدهٔ محصول',
        out: 'ناموجود',
        wishlist: 'علاقه‌مندی',
        compare: 'مقایسه',
        quick: 'نمایش سریع',
        color: 'انتخاب رنگ',
        shipping: 'ارسال رایگان',
        rating: 'امتیاز محصول',
        error: 'افزودن به سبد انجام نشد.',
      },
      {
        add: 'Add to cart',
        view: 'View product',
        out: 'Out of stock',
        wishlist: 'Wishlist',
        compare: 'Compare',
        quick: 'Quick view',
        color: 'Choose color',
        shipping: 'Free shipping',
        rating: 'Product rating',
        error: 'Could not add to cart.',
      },
    ),
    { locale } = usePrime();
  const add = async () => {
    if (!onAddToCart || !stock || pending) return;
    setPending(true);
    setError('');
    try {
      await onAddToCart(p, 1, variant);
    } catch (e) {
      setError(e instanceof Error ? e.message : l.error);
    } finally {
      setPending(false);
    }
  };
  const titleId = useId();
  return (
    <article
      className={cx(
        'pd-product-card',
        `pd-product-card--${layout}`,
        stock === 0 && 'pd-product-card--sold-out',
        className,
      )}
      aria-labelledby={titleId}
    >
      <div className="pd-product-media">
        {p.href ? (
          <a href={p.href} tabIndex={-1} aria-hidden="true">
            <ProductImage src={p.image ?? p.images?.[0]?.src} alt="" />
          </a>
        ) : (
          <ProductImage src={p.image ?? p.images?.[0]?.src} alt={p.title} />
        )}
        <div className="pd-product-badges">
          {p.originalPrice && <DiscountBadge price={price} originalPrice={p.originalPrice} />}{' '}
          {p.badges?.map((b) => (
            <Badge key={b} tone="brand">
              {b}
            </Badge>
          ))}
        </div>
        <div className="pd-product-tools">
          {onWishlistChange && (
            <IconButton
              label={`${l.wishlist}: ${p.title}`}
              icon="heart"
              variant="ghost"
              size="sm"
              aria-pressed={!!wishlisted}
              className={wishlisted ? 'pd-wishlisted' : undefined}
              onClick={() => onWishlistChange(p)}
            />
          )}{' '}
          {onCompareChange && (
            <IconButton
              label={`${l.compare}: ${p.title}`}
              icon="compare"
              variant="ghost"
              size="sm"
              aria-pressed={!!compared}
              onClick={() => onCompareChange(p)}
            />
          )}
        </div>
        {onQuickView && (
          <button type="button" className="pd-product-quick" onClick={() => onQuickView(p)}>
            <Icon name="eye" size={16} />
            {l.quick}
          </button>
        )}
      </div>
      <div className="pd-product-info">
        <div className="pd-product-overline">
          <span>{p.brand ?? p.category}</span>
          {p.rating !== undefined && <Rating label={l.rating} value={p.rating} readonly />}
        </div>
        <h3 id={titleId}>{p.href ? <a href={p.href}>{p.title}</a> : p.title}</h3>
        {p.subtitle && <p className="pd-product-subtitle">{p.subtitle}</p>}
        {layout === 'featured' && p.description && (
          <p className="pd-product-description">{p.description}</p>
        )}
        <div className="pd-product-meta">
          {!!p.variants?.length && (
            <ColorSwatches
              variants={p.variants}
              value={variantId}
              onValueChange={setVariant}
              label={l.color}
            />
          )}{' '}
          {p.reviewCount !== undefined && (
            <small>
              {formatNumber(p.reviewCount, {}, locale)} {locale === 'fa-IR' ? 'دیدگاه' : 'reviews'}
            </small>
          )}
        </div>
        <div className="pd-product-stock-line">
          <StockBadge stock={stock} />
          {p.freeShipping && (
            <span className="pd-free-shipping">
              <Icon name="truck" size={14} />
              {l.shipping}
            </span>
          )}
        </div>
        <div className="pd-product-bottom">
          <Price
            value={price}
            original={p.originalPrice}
            currency={p.currency}
            size={layout === 'featured' ? 'lg' : 'md'}
          />
          {onAddToCart ? (
            <Button
              aria-label={`${l.add}: ${p.title}`}
              size={layout === 'compact' ? 'sm' : 'md'}
              variant={layout === 'featured' ? 'solid' : 'soft'}
              disabled={stock === 0}
              loading={pending}
              startIcon={<Icon name="cart" size={18} />}
              onClick={() => void add()}
            >
              {stock === 0 ? l.out : l.add}
            </Button>
          ) : p.href ? (
            <a className="pd-product-link" href={p.href}>
              {l.view}
              <Icon name="arrowLeft" size={16} />
            </a>
          ) : null}
        </div>
        {error && (
          <p className="pd-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
export function ProductCardSkeleton({ layout = 'default' }: { layout?: ProductCardLayout }) {
  return (
    <div className={cx('pd-product-card', `pd-product-card--${layout}`)} aria-hidden="true">
      <Skeleton className="pd-product-skeleton-image" />
      <div className="pd-product-info">
        <Skeleton style={{ width: '35%' }} />
        <Skeleton style={{ width: '90%', height: 22 }} />
        <Skeleton style={{ width: '65%' }} />
        <Skeleton style={{ height: 40, marginTop: 18 }} />
      </div>
    </div>
  );
}
export function ProductGrid({
  products,
  loading = false,
  columns = 3,
  ...cardProps
}: Omit<ProductCardProps, 'product'> & {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}) {
  const empty = useLabels('محصولی پیدا نشد', 'No products found');
  if (!loading && !products.length) return <EmptyState title={empty} icon="bag" />;
  return (
    <div className={cx('pd-product-grid', `pd-product-grid--${columns}`)}>
      {loading
        ? Array.from({ length: columns }, (_, i) => (
            <ProductCardSkeleton key={i} layout={cardProps.layout} />
          ))
        : products.map((p) => <ProductCard key={p.id} product={p} {...cardProps} />)}
    </div>
  );
}
export function ProductGallery({
  images,
  title,
}: {
  images: { src: string; alt: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0),
    l = useLabels('تصویر محصول', 'Product image');
  return (
    <div className="pd-product-gallery">
      <ProductImage src={images[active]?.src} alt={images[active]?.alt ?? title} />
      {images.length > 1 && (
        <div className="pd-gallery-thumbnails">
          {images.map((image, i) => (
            <button
              type="button"
              key={i}
              aria-label={`${l} ${i + 1}`}
              aria-pressed={active === i}
              onClick={() => setActive(i)}
            >
              <img src={image.src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function QuickView({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAddToCart: NonNullable<ProductCardProps['onAddToCart']>;
}) {
  const l = useLabels('مشاهدهٔ محصول', 'Product details');
  return (
    <Dialog
      open={open && !!product}
      onOpenChange={onOpenChange}
      title={product?.title ?? l}
      size="lg"
    >
      {product && <ProductCard product={product} layout="horizontal" onAddToCart={onAddToCart} />}
    </Dialog>
  );
}
export function CategoryCard({
  title,
  count,
  image,
  icon = 'bag',
  href,
  onClick,
}: {
  title: string;
  count?: number;
  image?: string;
  icon?: Parameters<typeof Icon>[0]['name'];
  href?: string;
  onClick?: () => void;
}) {
  const { locale } = usePrime(),
    label = useLabels('محصول', 'products'),
    body = (
      <>
        <span className="pd-category-art">
          {image ? <img src={image} alt="" /> : <Icon name={icon} size={32} />}
        </span>
        <strong>{title}</strong>
        {count !== undefined && (
          <small>
            {formatNumber(count, {}, locale)} {label}
          </small>
        )}
      </>
    );
  return href ? (
    <a className="pd-category-card" href={href}>
      {body}
    </a>
  ) : (
    <button type="button" className="pd-category-card" onClick={onClick}>
      {body}
    </button>
  );
}
export function PromoCard({
  eyebrow,
  title,
  description,
  action,
  image,
  tone = 'brand',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  image?: string;
  tone?: 'brand' | 'warm' | 'dark';
}) {
  return (
    <section className={cx('pd-promo-card', `pd-promo-card--${tone}`)}>
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {action}
      </div>
      {image && <img src={image} alt="" />}
    </section>
  );
}
export function BrandCard({
  name,
  logo,
  description,
  href,
}: {
  name: string;
  logo?: string;
  description?: string;
  href?: string;
}) {
  const body = (
    <>
      {logo ? <img src={logo} alt="" /> : <Icon name="shield" size={32} />}
      <strong>{name}</strong>
      {description && <small>{description}</small>}
    </>
  );
  return href ? (
    <a className="pd-brand-card" href={href}>
      {body}
    </a>
  ) : (
    <Card className="pd-brand-card">{body}</Card>
  );
}
export function ReviewCard({
  name,
  avatar,
  rating,
  date,
  children,
  verified,
}: {
  name: string;
  avatar?: ReactNode;
  rating: number;
  date?: string;
  children: ReactNode;
  verified?: boolean;
}) {
  const l = useLabels(
    { verified: 'خریدار محصول', rating: 'امتیاز خریدار' },
    { verified: 'Verified buyer', rating: 'Customer rating' },
  );
  return (
    <Card className="pd-review-card">
      <div>
        {avatar}
        <strong>{name}</strong>
        {verified && <Badge tone="success">{l.verified}</Badge>}
        <Rating value={rating} label={l.rating} readonly />
      </div>
      <p>{children}</p>
      {date && <small>{date}</small>}
    </Card>
  );
}
