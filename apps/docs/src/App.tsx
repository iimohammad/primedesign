import { PageHeader } from '@primedesign/blocks';
import * as C from '@primedesign/commerce';
import { Sparkline } from '@primedesign/data';
import { Icon, type IconName } from '@primedesign/icons';
import { normalizePersian, toFaDigits } from '@primedesign/persian';
import * as P from '@primedesign/react';
import { type Density, type ThemeMode } from '@primedesign/tokens';
import { useEffect, useState } from 'react';
import api from './api.json';
import { products } from './data.js';
import {
  BlocksDemo,
  Components,
  DataDemo,
  FormsDemo,
  IconsDemo,
  Installation,
  PersianDemo,
  ThemeStudio,
} from './Demos.js';
import { Section } from './Section.js';
import { AdvancedDemo, AIDemo, UniversalDemo, RegistryDemo, CoverageDemo } from './Extensions.js';
const nav = [
  { id: 'overview', label: 'شروع یک تجربهٔ بهتر', icon: 'grid' },
  { id: 'components', label: 'کامپوننت‌ها', icon: 'layers' },
  { id: 'commerce', label: 'فروشگاه و محصول', icon: 'bag', badge: 'جدید' },
  { id: 'advanced', label: 'محیط کار و اجزای پیشرفته', icon: 'box' },
  { id: 'ai', label: 'چت و رابط‌های AI', icon: 'sparkles' },
  { id: 'universal', label: 'HTML و وردپرس', icon: 'globe' },
  { id: 'registry', label: 'رجیستری سورس', icon: 'code' },
  { id: 'coverage', label: 'مقایسهٔ پوشش', icon: 'check' },
  { id: 'data', label: 'جدول و نمودار', icon: 'chart' },
  { id: 'forms', label: 'فرم‌های هوشمند', icon: 'edit' },
  { id: 'persian', label: 'ابزارهای فارسی', icon: 'globe' },
  { id: 'blocks', label: 'بخش‌های آماده', icon: 'box' },
  { id: 'theme', label: 'استودیوی تم', icon: 'sparkles' },
  { id: 'icons', label: 'آیکون‌ها', icon: 'star' },
  { id: 'installation', label: 'نصب و راه‌اندازی', icon: 'code' },
] as const;
type Page = (typeof nav)[number]['id'];
interface Settings {
  brand: string;
  radius: number;
  density: Density;
  theme: ThemeMode;
  dir: 'rtl' | 'ltr';
  fontFamily: string;
}
const defaultSettings: Settings = {
  brand: '#6254df',
  radius: 16,
  density: 'comfortable',
  theme: 'light',
  dir: 'rtl',
  fontFamily: 'Vazirmatn, Tahoma, system-ui, sans-serif',
};
function getPage(): Page {
  const id = location.hash.slice(1);
  return nav.some((n) => n.id === id) ? (id as Page) : 'overview';
}
export function App() {
  const [settings, setSettings] = useState(defaultSettings);
  return (
    <P.PrimeProvider {...settings} locale={settings.dir === 'rtl' ? 'fa-IR' : 'en-US'}>
      <P.ToastProvider>
        <C.CartProvider>
          <C.WishlistProvider>
            <C.CompareProvider>
              <Workspace settings={settings} onSettingsChange={setSettings} />
            </C.CompareProvider>
          </C.WishlistProvider>
        </C.CartProvider>
      </P.ToastProvider>
    </P.PrimeProvider>
  );
}
function Workspace({
  settings,
  onSettingsChange,
}: {
  settings: Settings;
  onSettingsChange: (s: Settings) => void;
}) {
  const [page, setPage] = useState<Page>(getPage),
    [mobileOpen, setMobileOpen] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    cart = C.useCart(),
    [cartOpen, setCartOpen] = useState(false),
    { toast } = P.useToast();
  useEffect(() => {
    const sync = () => {
      setPage(getPage());
      setMobileOpen(false);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', sync);
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('keydown', key);
    };
  }, []);
  const navigate = (id: Page) => {
    location.hash = id;
  };
  const sidebar = (
    <>
      <a className="docs-logo" href="#overview">
        <span>
          <Icon name="layers" size={24} />
        </span>
        <div>
          Prime<span>Design</span>
          <small>ساخت تجربه، به زبان شما</small>
        </div>
      </a>
      <button type="button" className="docs-search" onClick={() => setSearchOpen(true)}>
        <Icon name="search" size={16} />
        <span>دنبال چی می‌گردی؟</span>
        <P.Kbd>⌘ K</P.Kbd>
      </button>
      <span className="docs-nav-label">کتابخانهٔ طراحی</span>
      <nav className="docs-nav" aria-label="بخش‌های مستندات">
        {nav.map((n) => (
          <a key={n.id} href={`#${n.id}`} aria-current={page === n.id ? 'page' : undefined}>
            <Icon name={n.icon} />
            <span>{n.label}</span>
            {'badge' in n && <b>{n.badge}</b>}
          </a>
        ))}
      </nav>
      <div className="docs-sidebar-bottom">
        <span className="docs-version">
          <i />
          نسخهٔ ۰.۲.۰ <P.Badge>MIT</P.Badge>
        </span>
        <a href="https://github.com/iimohammad/primedesign" target="_blank" rel="noreferrer">
          <Icon name="code" size={16} />
          سورس پروژه در گیت‌هاب
          <Icon name="arrowLeft" size={14} />
        </a>
        <div className="docs-brand-note">
          برای ایده‌هایی که
          <br />
          بزرگ‌تر از یک صفحه‌اند.
        </div>
      </div>
    </>
  );
  return (
    <div className="docs-shell">
      <a className="docs-skip" href="#main-content">
        رفتن به محتوا
      </a>
      <aside className="docs-sidebar">{sidebar}</aside>
      <div className="docs-body">
        <header className="docs-topbar">
          <div>
            <P.IconButton
              icon="menu"
              label="باز کردن منوی مستندات"
              variant="ghost"
              className="docs-mobile-menu"
              onClick={() => setMobileOpen(true)}
            />
            <span className="docs-top-title">دیزاین‌سیستم فارسی برای محصولات واقعی</span>
            <span className="docs-top-dot" />
            <small>React · HTML · WordPress</small>
          </div>
          <div>
            <P.IconButton
              icon="globe"
              label="تغییر جهت صفحه"
              variant="ghost"
              size="sm"
              onClick={() =>
                onSettingsChange({ ...settings, dir: settings.dir === 'rtl' ? 'ltr' : 'rtl' })
              }
            />
            <P.IconButton
              icon={settings.theme === 'dark' ? 'sun' : 'moon'}
              label="تغییر تم"
              variant="ghost"
              size="sm"
              onClick={() =>
                onSettingsChange({
                  ...settings,
                  theme: settings.theme === 'dark' ? 'light' : 'dark',
                })
              }
            />
            <span className="docs-top-separator" />
            <P.Button
              variant="outline"
              size="sm"
              startIcon={<Icon name="bag" size={16} />}
              onClick={() => setCartOpen(true)}
            >
              سبد نمونه {cart.count > 0 && <P.Badge tone="brand">{toFaDigits(cart.count)}</P.Badge>}
            </P.Button>
            <a
              className="docs-github"
              href="https://github.com/iimohammad/primedesign"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <Icon name="link" size={13} />
            </a>
          </div>
        </header>
        <main id="main-content" className="docs-main" tabIndex={-1}>
          {page === 'overview' ? (
            <Overview onNavigate={navigate} />
          ) : page === 'commerce' ? (
            <Commerce />
          ) : page === 'components' ? (
            <Components />
          ) : page === 'advanced' ? (
            <AdvancedDemo />
          ) : page === 'ai' ? (
            <AIDemo />
          ) : page === 'universal' ? (
            <UniversalDemo />
          ) : page === 'registry' ? (
            <RegistryDemo />
          ) : page === 'coverage' ? (
            <CoverageDemo />
          ) : page === 'data' ? (
            <DataDemo />
          ) : page === 'forms' ? (
            <FormsDemo />
          ) : page === 'persian' ? (
            <PersianDemo />
          ) : page === 'blocks' ? (
            <BlocksDemo />
          ) : page === 'theme' ? (
            <ThemeStudio settings={settings} onChange={onSettingsChange} />
          ) : page === 'icons' ? (
            <IconsDemo />
          ) : (
            <Installation />
          )}
        </main>
        <footer className="docs-footer">
          <span>
            PrimeDesign <i>©</i> ۲۰۲۶
          </span>
          <span>طراحی یکپارچه، از اولین دکمه تا آخرین سفارش.</span>
          <a href="https://github.com/iimohammad/primedesign">
            ساخته‌شده برای توسعه دادن <Icon name="arrowLeft" size={14} />
          </a>
        </footer>
      </div>
      <P.Drawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title="مستندات"
        placement="start"
        size="sm"
      >
        <div onClick={() => setMobileOpen(false)}>{sidebar}</div>
      </P.Drawer>
      <P.CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="جست‌وجو در پرایم دیزاین"
        items={nav.map((n) => ({
          id: n.id,
          label: n.label,
          icon: <Icon name={n.icon} />,
          onSelect: () => navigate(n.id),
        }))}
      />
      <C.MiniCart
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={() =>
          void toast({
            title: 'این یک سبد نمونه است',
            description: 'برای فروش واقعی، رویداد تسویه را به API سفارش خود وصل کنید.',
            tone: 'info',
          })
        }
      />
    </div>
  );
}
function Overview({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { toast } = P.useToast(),
    cart = C.useCart(),
    wishlist = C.useWishlist();
  return (
    <>
      <div className="overview-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="hero-spark">
              <Icon name="sparkles" size={14} />
            </span>
            از ایده تا محصول، با یک زبان طراحی
          </span>
          <h1>
            جزئیات کوچک.
            <br />
            <span>تجربه‌های بزرگ.</span>
          </h1>
          <p>
            یک دیزاین‌سیستم فارسی برای ساخت رابط‌هایی که
            <br className="desktop-break" /> هم زیبا هستند، هم واقعاً کار می‌کنند.
          </p>
          <div className="hero-actions">
            <P.Button
              size="lg"
              endIcon={<Icon name="arrowLeft" size={18} />}
              onClick={() => onNavigate('components')}
            >
              کشف کامپوننت‌ها
            </P.Button>
            <P.Button
              size="lg"
              variant="outline"
              startIcon={<Icon name="bag" size={18} />}
              onClick={() => onNavigate('commerce')}
            >
              مجموعهٔ فروشگاهی
            </P.Button>
          </div>
          <div className="hero-trust">
            <span>
              <Icon name="check" size={14} />
              راست‌به‌چپ از پایه
            </span>
            <span>
              <Icon name="check" size={14} />
              قابل شخصی‌سازی
            </span>
            <span>
              <Icon name="check" size={14} />
              متن‌باز و مستقل
            </span>
          </div>
        </div>
        <div className="hero-preview">
          <div className="preview-window-bar">
            <span>
              <i />
              <i />
              <i />
            </span>
            <small>your-next-product.tsx</small>
            <Icon name="lock" size={11} />
          </div>
          <div className="preview-canvas">
            <div className="preview-mini-heading">
              <span>کوچک، اما کامل.</span>
              <P.Badge tone="success" dot>
                آمادهٔ ساختن
              </P.Badge>
            </div>
            <div className="preview-products">
              <C.ProductCard
                product={products[0]}
                layout="compact"
                onAddToCart={(p, q, v) => {
                  cart.add(p, q, v);
                  toast({ title: 'به سبد نمونه اضافه شد', tone: 'success' });
                }}
                onWishlistChange={(p) => wishlist.toggle(p.id)}
                wishlisted={wishlist.has(products[0].id)}
              />
              <div className="preview-side">
                <P.StatCard
                  label="فروش این هفته"
                  value="۱۲۸٫۴ م"
                  change={18.6}
                  description="بیشتر از هفتهٔ قبل"
                  icon={<Icon name="chart" size={18} />}
                  sparkline={<Sparkline values={[12, 18, 15, 24, 23, 35, 42]} />}
                />
                <div className="preview-payment">
                  <span>
                    <Icon name="check" size={18} />
                  </span>
                  <div>
                    <strong>پرداخت موفق بود!</strong>
                    <small>یک تجربهٔ خوب دیگر.</small>
                  </div>
                  <Icon name="shield" size={18} />
                </div>
                <div className="preview-chips">
                  <P.AvatarGroup
                    names={[{ name: 'سارا احمدی' }, { name: 'محمد رضایی' }, { name: 'نگار بهشتی' }]}
                  />
                  <span>برای تیم‌های سازنده</span>
                </div>
              </div>
            </div>
          </div>
          <div className="preview-floating">
            <Icon name="layers" size={17} />
            <span>با هر برندی، هماهنگ.</span>
            <div>
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
      <div className="overview-metrics">
        {[
          {
            value: api.filter((a) => a.kind === 'component').length + '+',
            label: 'کامپوننت و بخش آماده',
          },
          { value: '۱۲', label: 'پکیج مستقل' },
          { value: '۵', label: 'چیدمان کارت محصول' },
          { value: 'RTL / LTR', label: 'یک تجربه، دو جهت' },
        ].map((m) => (
          <div key={m.label}>
            <strong dir="ltr">{m.value}</strong>
            <span>{m.label}</span>
          </div>
        ))}
      </div>
      <div className="overview-section-title">
        <div>
          <span className="pd-eyebrow">یک مجموعه، هزار امکان</span>
          <h2>هر چیزی که برای شروع نیاز داری.</h2>
        </div>
        <p>
          از رابط‌های ساده تا پنل‌های پرجزئیات؛
          <br />
          قطعه‌ها آماده‌اند، ایده از تو.
        </p>
      </div>
      <div className="feature-grid">
        {[
          {
            page: 'components',
            icon: 'layers',
            color: 'purple',
            title: 'قطعه‌های خوش‌ساخت',
            description: 'دکمه، ورودی، دیالوگ، منو و ده‌ها جزء با رفتار هماهنگ.',
            chips: ['React', 'TypeScript', 'Accessible'],
          },
          {
            page: 'commerce',
            icon: 'bag',
            color: 'green',
            title: 'برای فروش بیشتر',
            description: 'از کارت محصول و علاقه‌مندی تا سبد خرید و پیگیری سفارش.',
            chips: ['Product cards', 'Cart', 'Checkout'],
          },
          {
            page: 'data',
            icon: 'chart',
            color: 'orange',
            title: 'داده، روشن و خوانا',
            description: 'جدول پیشرفته، فیلتر، خروجی و نمودارهای قابل فهم.',
            chips: ['DataTable', 'Charts', 'Server mode'],
          },
          {
            page: 'theme',
            icon: 'sparkles',
            color: 'blue',
            title: 'با هویت برند خودت',
            description: 'رنگ، فونت، گردی و تراکم را تنظیم کن و نتیجه را ببین.',
            chips: ['Tokens', 'Dark mode', 'Multi-brand'],
          },
        ].map((f) => (
          <button
            key={f.page}
            type="button"
            className={`feature-card feature-card--${f.color}`}
            onClick={() => onNavigate(f.page as Page)}
          >
            <span className="feature-icon">
              <Icon name={f.icon as IconName} size={25} />
            </span>
            <span className="feature-card-arrow">
              <Icon name="arrowLeft" size={17} />
            </span>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
            <div>
              {f.chips.map((c) => (
                <small key={c}>{c}</small>
              ))}
            </div>
          </button>
        ))}
      </div>
      <div className="overview-bottom">
        <div>
          <span className="overview-bottom-icon">
            <Icon name="globe" size={30} />
          </span>
          <div>
            <h3>فارسی، بخشی از معماری است.</h3>
            <p>
              تقویم شمسی، ارقام فارسی، مبلغ، شماره کارت و فرم‌های ایرانی؛ هماهنگ با تمام مجموعه.
            </p>
          </div>
        </div>
        <P.Button
          variant="outline"
          endIcon={<Icon name="arrowLeft" size={16} />}
          onClick={() => onNavigate('persian')}
        >
          دیدن ابزارهای فارسی
        </P.Button>
      </div>
    </>
  );
}
function Commerce() {
  const [layout, setLayout] = useState<C.ProductCardLayout>('default'),
    [query, setQuery] = useState(''),
    [category, setCategory] = useState('همه'),
    [quick, setQuick] = useState<C.Product | null>(null),
    [compareOpen, setCompareOpen] = useState(false),
    cart = C.useCart(),
    wishlist = C.useWishlist(),
    compare = C.useCompare(),
    { toast } = P.useToast();
  const add = (p: C.Product, q: number, v?: C.ProductVariant) => {
    cart.add(p, q, v);
    toast({ title: 'محصول به سبد اضافه شد', description: p.title, tone: 'success' });
  };
  const filtered = products.filter(
    (p) =>
      (category === 'همه' || p.category === category) &&
      normalizePersian(p.title).includes(normalizePersian(query)),
  );
  return (
    <>
      <PageHeader
        eyebrow="COMMERCE COLLECTION"
        title="تجربهٔ خرید، با تمام جزئیات."
        description="کارت‌های فروشگاهی و اجزای سفارش، متصل به یک سبد نمونهٔ واقعی در مرورگر."
        actions={
          <P.Button
            variant="outline"
            startIcon={<Icon name="compare" size={16} />}
            disabled={!compare.ids.length}
            onClick={() => setCompareOpen(true)}
          >
            مقایسهٔ محصولات ({toFaDigits(compare.ids.length)})
          </P.Button>
        }
      />
      <div className="store-promo">
        <C.PromoCard
          eyebrow="یک انتخاب هوشمندانه"
          title="برای روزهای پر از صدا."
          description="کالکشن صوتی را با طراحی هماهنگ و جزئیات کامل نمایش بده."
          image={products[0].image}
          action={
            <P.Button size="sm" onClick={() => setCategory('صوتی')}>
              دیدن محصولات صوتی
              <Icon name="arrowLeft" size={16} />
            </P.Button>
          }
        />
        <C.PromoCard
          tone="dark"
          eyebrow="طراحی برای هر محصول"
          title="هر دسته، یک داستان."
          description="کامپوننت‌های قابل ترکیب، برای فروشگاه خودت."
          image={products[1].image}
        />
      </div>
      <div className="store-categories">
        {[
          { title: 'همه', icon: 'grid' },
          { title: 'صوتی', icon: 'message' },
          { title: 'پوشیدنی', icon: 'clock' },
          { title: 'دوربین', icon: 'eye' },
          { title: 'لوازم جانبی', icon: 'code' },
          { title: 'سبک زندگی', icon: 'bag' },
        ].map((c) => (
          <C.CategoryCard
            key={c.title}
            title={c.title}
            icon={c.icon as IconName}
            count={
              c.title === 'همه'
                ? products.length
                : products.filter((p) => p.category === c.title).length
            }
            onClick={() => setCategory(c.title)}
          />
        ))}
      </div>
      <Section
        title="کارت‌های محصول"
        description="چیدمان را عوض کن؛ رنگ انتخاب کن، مقایسه کن و به سبد اضافه کن."
        code={`<ProductCard\n  product={product}\n  layout="${layout}"\n  onAddToCart={(product, quantity, variant) => cart.add(product, quantity, variant)}\n/>`}
      >
        <div className="store-toolbar">
          <P.SegmentedControl
            label="چیدمان کارت محصول"
            value={layout}
            onChange={(v) => setLayout(v as C.ProductCardLayout)}
            options={[
              { label: 'کلاسیک', value: 'default' },
              { label: 'فشرده', value: 'compact' },
              { label: 'افقی', value: 'horizontal' },
              { label: 'مینیمال', value: 'minimal' },
              { label: 'ویژه', value: 'featured' },
            ]}
          />
          <P.Input
            aria-label="جست‌وجوی محصول"
            placeholder="دنبال چه محصولی هستی؟"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            startAdornment={<Icon name="search" size={17} />}
          />
        </div>
        <div
          className={`store-product-grid ${layout === 'horizontal' ? 'store-product-grid--horizontal' : ''}`}
        >
          {filtered.length ? (
            filtered.map((p) => (
              <C.ProductCard
                key={p.id}
                product={p}
                layout={layout}
                onAddToCart={add}
                onQuickView={setQuick}
                onWishlistChange={(p) => wishlist.toggle(p.id)}
                wishlisted={wishlist.has(p.id)}
                compared={compare.ids.includes(p.id)}
                onCompareChange={(p) => {
                  if (!compare.toggle(p.id))
                    toast({ title: 'حداکثر چهار محصول قابل مقایسه است', tone: 'warning' });
                }}
              />
            ))
          ) : (
            <P.EmptyState title="محصولی پیدا نشد" icon="search" />
          )}
        </div>
      </Section>
      <div className="demo-two-col">
        <Section
          title="سبد و خلاصهٔ سفارش"
          description="تعداد و مبلغ با تغییر سبد نمونه به‌روز می‌شوند."
        >
          <C.CartSummary
            items={cart.items}
            shipping={cart.subtotal >= 2000000 ? 0 : 65000}
            onCheckout={() =>
              void toast({
                title: 'نمونهٔ نمایشی',
                description: 'API سفارش و پرداخت را در محصول خود متصل کنید.',
              })
            }
            footer={<C.FreeShippingProgress subtotal={cart.subtotal} threshold={2000000} />}
          />
        </Section>
        <Section title="کارت سفارش" description="وضعیت، اقلام و مبلغ سفارش در یک نگاه.">
          <C.OrderCard
            number="1042"
            date="۱۰ آبان ۱۴۰۵"
            status="shipped"
            items={[
              { title: products[0].title, image: products[0].image, quantity: 1 },
              { title: products[1].title, image: products[1].image, quantity: 1 },
            ]}
            total={6280000}
            onDetails={() =>
              void toast({
                title: 'سفارش نمونهٔ ۱۰۴۲',
                description: 'برای نمایش جزئیات به مسیر سفارش خود متصل کنید.',
              })
            }
          />
        </Section>
      </div>
      <div className="demo-three-col">
        <C.ReviewCard name="سارا احمدی" rating={4.8} date="۸ آبان ۱۴۰۵" verified>
          کیفیت ساخت عالی و بسته‌بندی خیلی خوب بود. دقیقاً همونی بود که انتظار داشتم.
        </C.ReviewCard>
        <C.AddressCard
          name="محمد بهارلو"
          phone="0912 000 0000"
          address="تهران، نشانی نمونه برای نمایش کارت آدرس"
          postalCode="۱۳۱۳۵۷۹۲۴۶"
          selected
        />
        <C.BrandCard name="NOVA AUDIO" description="طراحی برای شنیدن بهتر" />
      </div>
      <C.QuickView
        product={quick}
        open={!!quick}
        onOpenChange={(v) => !v && setQuick(null)}
        onAddToCart={add}
      />
      <P.Dialog open={compareOpen} onOpenChange={setCompareOpen} title="مقایسهٔ محصولات" size="lg">
        <C.CompareTable
          products={products.filter((p) => compare.ids.includes(p.id))}
          onRemove={(id) => compare.toggle(id)}
        />
      </P.Dialog>
    </>
  );
}
