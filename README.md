# PrimeDesign · پرایم دیزاین

یک دیزاین‌سیستم مستقل و فارسی برای ساخت فروشگاه، داشبورد و محصولات دیجیتال با **React و Next.js**؛ شامل CSS مستقل، تم چندبرندی، ابزارهای فارسی، فرم، جدول و مجموعهٔ فروشگاهی.

![CI](https://github.com/iimohammad/primedesign/actions/workflows/ci.yml/badge.svg)

![PrimeDesign preview](docs/images/overview.png)

[مشاهدهٔ تصویر مجموعهٔ فروشگاهی](docs/images/commerce.png)

## اجرا

به Node.js 22 یا بالاتر نیاز دارید؛ `.nvmrc` نسخهٔ توسعه را مشخص می‌کند.

```bash
npm ci
npm run build
npm run dev
```

مستندات تعاملی در آدرس نمایش‌داده‌شده توسط Vite باز می‌شوند. برای پیش‌نمایش خروجی تولیدی:

```bash
npm run preview -w @primedesign/docs -- --host 0.0.0.0
```

## پکیج‌ها

| پکیج                    | مسئولیت                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `@primedesign/tokens`   | توکن‌های معنایی، طیف برند، ساخت تم و محاسبهٔ کنتراست                |
| `@primedesign/css`      | استایل مستقل، Cascade Layers، فونت وزیرمتن و خروجی بدون فونت        |
| `@primedesign/persian`  | تاریخ شمسی، ارقام، پول، جست‌وجوی فارسی و اعتبارسنجی‌های ساختاری     |
| `@primedesign/icons`    | مجموعهٔ SVG با تایپ و نام دسترس‌پذیر                                |
| `@primedesign/react`    | کنترل‌ها، انتخاب‌ها، تقویم، پنجره‌ها، اعلان، ناوبری و آپلود         |
| `@primedesign/forms`    | فرم تایپ‌شده، SchemaForm، مراحل، آرایهٔ فیلدها، خطا و پیش‌نویس      |
| `@primedesign/data`     | جدول پیشرفته، حالت سرور، اسکرول مجازی و نمودارهای دارای معادل جدولی |
| `@primedesign/commerce` | کارت‌ها و رفتار سبد، علاقه‌مندی، مقایسه و سفارش                     |
| `@primedesign/blocks`   | پوستهٔ پنل، تیکت، گفتگو، اعلان، پلن، ورود و فایل                    |
| `@primedesign/cli`      | راه‌اندازی پروژه، تولید facade قابل ویرایش و خروجی تم               |

## مجموعهٔ فروشگاهی

- `ProductCard` با پنج چیدمان `default`, `compact`, `horizontal`, `minimal`, `featured`.
- تصویر و fallback، قیمت قبلی و فعلی، تخفیف، موجودی کم، ناموجود، امتیاز، رنگ و variant.
- رویدادهای افزودن به سبد، علاقه‌مندی، مقایسه و مشاهدهٔ سریع؛ حالت انتظار و خطای درخواست.
- `ProductGrid`, `ProductCardSkeleton`, `ProductGallery`, `QuickView`.
- `CategoryCard`, `PromoCard`, `BrandCard`, `ReviewCard`.
- `CartProvider`, `CartLineItem`, `MiniCart`, `CartSummary`, `CouponInput`, `FreeShippingProgress`.
- `AddressCard`, `ShippingMethodPicker`, `CheckoutStepper`, `OrderCard`, `OrderTracking`, `CompareTable`.

نمونهٔ فروشگاه داخل مستندات، سبد مشترک در حافظهٔ مرورگر دارد. سفارش، پرداخت، احراز هویت و آپلود به سرویس خارجی وصل نیستند؛ adapter و callbackها را در برنامهٔ خودتان متصل کنید. قیمت، موجودی، تخفیف، مالیات و مجوزهای نهایی باید روی سرور دوباره محاسبه و بررسی شوند.

## استفاده در پروژهٔ دیگر

پکیج‌ها هنوز در npm عمومی منتشر نشده‌اند. بسته‌های محلی تمام وابستگی‌های داخلی را با هم نصب کنید:

```bash
# در این ریپو
npm run pack

# در برنامهٔ مصرف‌کننده
npm install /absolute/path/to/primedesign/artifacts/*.tgz
```

```tsx
import '@primedesign/css';
import { PrimeProvider, ToastProvider, Button } from '@primedesign/react';
import { CartProvider, ProductCard, useCart } from '@primedesign/commerce';

function Store({ product }) {
  const cart = useCart();
  return (
    <ProductCard
      product={product}
      onAddToCart={(p, quantity, variant) => cart.add(p, quantity, variant)}
    />
  );
}

export function App({ product }) {
  return (
    <PrimeProvider locale="fa-IR" brand="#6254df" defaultTheme="system">
      <ToastProvider>
        <CartProvider>
          <Store product={product} />
        </CartProvider>
      </ToastProvider>
    </PrimeProvider>
  );
}
```

برای Next.js، CSS را یک بار در `app/layout.tsx` وارد کنید و Providerها را در فایل `app/providers.tsx` با دستور `"use client"` قرار دهید. خروجی پکیج‌های تعاملی دستور کلاینت را حفظ می‌کند؛ `tokens` و `persian` مستقل از React و مناسب استفاده در سرور هستند.

## شخصی‌سازی

```tsx
<PrimeProvider
  locale="fa-IR"
  dir="rtl"
  brand="#177864"
  density="compact"
  radius={12}
  fontFamily='"Yekan Bakh", Vazirmatn, sans-serif'
>
  {children}
</PrimeProvider>
```

برای فونت دارای مجوز خودتان از `@primedesign/css/nofont.css` استفاده کنید و `@font-face` را در برنامهٔ خود تعریف کنید. وزیرمتن همراه پکیج است و فایل مجوز OFL آن هم توزیع می‌شود. یکان‌بخ همراه این ریپو نیست.

CSS کامل در لایه‌های `primedesign.*` قرار دارد؛ CSS بدون لایهٔ برنامهٔ شما اولویت بالاتری دارد. فایل‌های جداگانهٔ `tokens.css`, `base.css`, `components.css`, `commerce.css` هم ارائه می‌شوند. برای استفاده با HTML، کلاس‌ها و CSS قابل استفاده‌اند؛ رفتار تعاملی باید توسط برنامهٔ میزبان پیاده‌سازی شود.

## کیفیت

```bash
npm run check          # build + TypeScript + unit tests + package contents
npm run test:e2e       # Chromium desktop/mobile + axe accessibility checks
npm run format:check
```

قبل از اولین اجرای تست مرورگر: `npx playwright install chromium`.

تست‌ها محدودیت تاریخ در تایپ و میان‌بر، حفظ انتخاب جدول بین صفحات، کنترل موجودی سبد، خطای درخواست، اعتبارسنجی فرم، لغو و ادامهٔ آپلود تکه‌ای، مرز خروجی CLI و کنتراست توکن‌های پیش‌فرض را پوشش می‌دهند. این تست‌ها جای ارزیابی نهایی دسترس‌پذیری محصول شما با محتوای واقعی و فناوری‌های کمکی را نمی‌گیرند.

## مستندات توسعه

- [معماری](docs/ARCHITECTURE.md)
- [راهنمای اتصال به Next.js و Django](docs/INTEGRATION.md)
- [پروژهٔ نمونهٔ Next.js با نصب بسته‌های واقعی](examples/next-app/README.md)
- [قراردادها و محدودیت‌ها](docs/CONTRACTS.md)
- [مشارکت](CONTRIBUTING.md)
- [انتشار نسخه](docs/RELEASING.md)

کد با مجوز MIT منتشر شده است. تصویرهای SVG محصولات، طراحی‌های اصلی همین پروژه و صرفاً برای نمایش کامپوننت‌ها هستند؛ برندها و داده‌های فروشگاه نمونه‌اند.
