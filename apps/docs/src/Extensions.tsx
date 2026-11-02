import { useState } from 'react';
import * as P from '@primedesign/react';
import * as B from '@primedesign/blocks';
import * as C from '@primedesign/commerce';
import * as A from '@primedesign/ai';
import { Icon } from '@primedesign/icons';
import { Section } from './Section.js';
import { products } from './data.js';
import registry from './registry.json';
import coverage from './coverage.json';

export function AdvancedDemo() {
  const [selection, setSelection] = useState<string[]>(['code']);
  const [status, setStatus] = useState('آماده');
  const [columns, setColumns] = useState<B.KanbanColumn[]>([
    {
      id: 'todo',
      title: 'برای انجام',
      items: [
        {
          id: 'task',
          title: 'طراحی صفحهٔ محصول',
          description: 'موس، لمس یا انتخاب ستون با کیبورد',
          tags: ['فروشگاه'],
          assignee: 'نگار',
        },
      ],
    },
    { id: 'done', title: 'انجام شده', items: [] },
  ]);
  const cart = C.useCart();
  return (
    <>
      <B.PageHeader
        eyebrow="WORKSPACE & COMMERCE"
        title="قطعه‌های بزرگ‌تر، رفتارهای کامل‌تر."
        description="منوهای کیبوردی، پنل‌های قابل تغییر اندازه، گردش کار و جزئیات محصول."
      />
      <Section
        title="محیط کار قابل تنظیم"
        description="دستگیره را بکشید یا با کلیدهای جهت، Home و End اندازه را تغییر دهید."
      >
        <P.Menubar
          label="منوی ویرایشگر"
          menus={[
            {
              id: 'file',
              label: 'فایل',
              items: [
                { id: 'new', label: 'فایل جدید', onSelect: () => setStatus('فایل جدید انتخاب شد') },
                { id: 'save', label: 'ذخیره', onSelect: () => setStatus('ذخیره انتخاب شد') },
              ],
            },
            {
              id: 'edit',
              label: 'ویرایش',
              items: [{ id: 'copy', label: 'کپی', onSelect: () => setStatus('کپی انتخاب شد') }],
            },
          ]}
        />
        <P.ResizablePanelGroup
          label="پنل‌های ویرایشگر"
          storageKey="prime-docs-panels"
          panels={[
            {
              id: 'files-panel',
              defaultSize: 30,
              minSize: 20,
              content: (
                <A.FileTree
                  label="فایل‌ها"
                  items={[
                    {
                      id: 'src',
                      name: 'src',
                      type: 'directory',
                      children: [
                        { id: 'page', name: 'page.tsx', type: 'file' },
                        { id: 'style', name: 'styles.css', type: 'file' },
                      ],
                    },
                  ]}
                  onSelect={(id) => setStatus(id)}
                />
              ),
            },
            {
              id: 'editor-panel',
              minSize: 30,
              content: (
                <P.CodeBlock
                  filename="page.tsx"
                  language="tsx"
                  showLineNumbers
                  code={
                    'import { Button } from "@primedesign/react";\n\nexport default function Page() {\n  return <Button>شروع کن</Button>;\n}'
                  }
                />
              ),
            },
          ]}
          style={{ minHeight: 260 }}
        />
        <p role="status">{status}</p>
      </Section>
      <div className="demo-two-col">
        <Section title="انتخاب و منوی زمینه">
          <P.ToggleGroup
            label="نمایش محیط کار"
            value={selection}
            onValueChange={setSelection}
            multiple
            items={[
              { value: 'code', label: 'کد' },
              { value: 'preview', label: 'پیش‌نمایش' },
              { value: 'split', label: 'تقسیم‌شده' },
            ]}
          />
          <P.ContextMenu
            label="عملیات قطعه"
            items={[
              { id: 'copy', label: 'کپی قطعه', onSelect: () => setStatus('قطعه کپی شد') },
              { id: 'archive', label: 'بایگانی', onSelect: () => setStatus('قطعه بایگانی شد') },
            ]}
          >
            <div className="extension-context">راست‌کلیک یا Shift+F10</div>
          </P.ContextMenu>
          <P.Collapsible title="تنظیمات پیشرفته">
            <P.Input label="عنوان صفحه" placeholder="عنوان دلخواه" />
          </P.Collapsible>
        </Section>
        <Section title="پرسش‌نامهٔ چندمرحله‌ای">
          <P.Questionnaire
            label="انتخاب پروژه"
            questions={[
              {
                id: 'platform',
                title: 'برای کدام پلتفرم می‌سازید؟',
                type: 'single',
                required: true,
                options: [
                  { label: 'React / Next.js', value: 'react' },
                  { label: 'HTML / WordPress', value: 'html' },
                ],
              },
              { id: 'title', title: 'اسم پروژه چیست؟', type: 'text', required: true },
            ]}
            onComplete={(answers) => setStatus(JSON.stringify(answers))}
          />
        </Section>
      </div>
      <Section
        title="برد کارها"
        description="جابه‌جایی با انتخاب ستون هم قابل انجام است؛ drag تنها مسیر تعامل نیست."
      >
        <B.KanbanBoard
          label="کارهای پروژه"
          columns={columns}
          onMove={(id, from, to) =>
            setColumns((current) => {
              const item = current.find((c) => c.id === from)?.items.find((i) => i.id === id);
              return item
                ? current.map((c) => ({
                    ...c,
                    items:
                      c.id === from
                        ? c.items.filter((i) => i.id !== id)
                        : c.id === to
                          ? [...c.items, item]
                          : c.items,
                  }))
                : current;
            })
          }
        />
      </Section>
      <Section
        title="صفحهٔ جزئیات محصول"
        description="گالری، مدل، موجودی، تعداد و خطای عملیات در یک بخش آماده."
      >
        <C.ProductDetail
          product={products[0]}
          onAddToCart={(p, q, v) => cart.add(p, q, v)}
          shippingInfo="اطلاعات ارسال را از سرویس فروشگاه خود دریافت کنید."
        />
      </Section>
      <div className="demo-two-col">
        <C.SellerCard
          name="فروشگاه نوا"
          description="کارت فروشنده، با امتیاز و نشان تأیید"
          rating={4.7}
          verified
        />
        <C.CouponCard
          code="PRIME20"
          title="کارت کد تخفیف"
          description="اعتبارسنجی تخفیف باید در سرور انجام شود."
        />
      </div>
    </>
  );
}

export function AIDemo() {
  const [messages, setMessages] = useState<A.ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'این یک نمونهٔ رابط است. پیام شما در همین مرورگر نمایش داده می‌شود؛ مدل هوش مصنوعی متصل نیست.',
    },
  ]);
  const [confirmation, setConfirmation] = useState('pending');
  return (
    <>
      <B.PageHeader
        eyebrow="AI INTERFACES"
        title="گفت‌وگو، ابزار، وظیفه و منبع."
        description="اجزای رابط مستقل از ارائه‌دهندهٔ مدل؛ کنترل داده، استریم و مجوز عملیات در اختیار برنامهٔ شماست."
      />
      <Section
        title="چت و ورودی پیام"
        description="نمونهٔ محلی: ارسال پیام فقط آن را به فهرست پیام‌ها اضافه می‌کند."
      >
        <A.Chat
          title="دستیار پروژه"
          description="نمونهٔ رابط، بدون اتصال به مدل"
          messages={messages}
          allowAttachments
          onSubmit={(input) =>
            setMessages((m) => [
              ...m,
              {
                id: crypto.randomUUID(),
                role: 'user',
                content: input.text,
                attachments: input.files.map((f) => ({ name: f.name })),
              },
            ])
          }
        />
      </Section>
      <div className="demo-two-col">
        <Section title="برنامه و مصرف زمینه">
          <A.Plan
            title="مراحل ساخت فروشگاه"
            items={[
              { id: 'one', title: 'انتخاب اجزا', status: 'success' },
              { id: 'two', title: 'اتصال API محصول', status: 'running' },
              { id: 'three', title: 'آزمون سفارش', status: 'pending' },
            ]}
          />
          <A.ContextUsage used={3200} limit={16000} />
          <A.Reasoning summary="خلاصهٔ بررسی ارائه‌شده">
            این متن خلاصهٔ قابل انتشارِ برنامه است و باید از دادهٔ خود برنامه تأمین شود.
          </A.Reasoning>
        </Section>
        <Section title="اجرای ابزار و تأیید عملیات">
          <A.ToolCall
            name="catalog.search"
            status="success"
            input={{ query: 'هدفون' }}
            output={{ count: 3 }}
            duration={400}
          />
          <A.Confirmation
            title="ذخیرهٔ تغییرات نمونه"
            description="این دکمه‌ها فقط وضعیت همین نمونه را تغییر می‌دهند."
            onApprove={() => setConfirmation('approved')}
            onReject={() => setConfirmation('rejected')}
          />
          <p role="status">{confirmation}</p>
        </Section>
      </div>
      <Section title="منابع و نتیجهٔ اجرا">
        <A.Sources
          sources={[
            {
              id: 'repo',
              title: 'سورس و مستندات PrimeDesign',
              url: 'https://github.com/iimohammad/primedesign',
              description: 'مرجع API و نمونه‌های اتصال',
            },
          ]}
        />
        <A.TestResults
          label="نتایج نمونه"
          items={[
            { id: 'one', name: 'product-card', status: 'passed', duration: 12 },
            { id: 'two', name: 'checkout API', status: 'skipped' },
          ]}
        />
        <A.Terminal
          title="خروجی نمونه"
          output={'$ npm run build\nBuild output supplied by your application.'}
        />
      </Section>
    </>
  );
}

export function UniversalDemo() {
  return (
    <>
      <B.PageHeader
        eyebrow="ONE SYSTEM · MANY FRONTENDS"
        title="از Next.js تا یک فایل HTML."
        description="دو ورودی رسمی: پکیج‌های React و یک بستهٔ مرورگر شامل Web Components، استایل، فونت و runtime."
      />
      <div className="extension-platforms">
        {[
          'React 18 / 19',
          'Next.js App Router',
          'HTML / JavaScript',
          'WordPress / WooCommerce',
          'Vue / Svelte / Angular',
        ].map((text) => (
          <P.Card key={text}>
            <Icon name="check" />
            <strong dir="ltr">{text}</strong>
          </P.Card>
        ))}
      </div>
      <Section
        title="نسخهٔ HTML زنده"
        description="این صفحه داخل iframe مستقل باز می‌شود و به React اپ مستندات وابسته نیست."
      >
        <a className="pd-link" href="./standalone/index.html" target="_blank" rel="noreferrer">
          باز کردن نسخهٔ مستقل ↗
        </a>
        <iframe
          className="extension-html-preview"
          src="./standalone/index.html"
          title="نسخهٔ مستقل HTML پرایم دیزاین"
          loading="lazy"
        />
      </Section>
      <Section title="استفاده بدون ابزار build">
        <P.CodeBlock
          filename="index.html"
          language="html"
          code={
            '<script src="./primedesign-elements.js"></script>\n<pd-provider locale="fa-IR" theme="light">\n  <pd-button variant="outline">شروع کن</pd-button>\n  <pd-product-card id="product"></pd-product-card>\n</pd-provider>\n<script>\n  document.querySelector("#product").props = {\n    product: { id: "1", title: "هدفون", price: 100, stock: 5 }\n  };\n  document.addEventListener("pd-add-to-cart", event => {\n    console.log(event.detail.args);\n  });\n</script>'
          }
        />
      </Section>
      <Section
        title="وردپرس و ووکامرس"
        description="فایل نصب در پوشهٔ downloads ریپو ساخته می‌شود. شورت‌کد عمومی، بلوک Gutenberg و کارت محصول متصل به سبد WooCommerce در افزونه وجود دارد."
      >
        <P.CodeBlock
          language="text"
          filename="WordPress shortcodes"
          code={
            '[primedesign component="button" props=\'{"variant":"outline"}\']شروع کن[/primedesign]\n\n[primedesign_products limit="6" layout="compact"]'
          }
        />
        <P.Alert tone="info" title="دامنهٔ اتصال ووکامرس">
          محصول ساده با AJAX به سبد سرور اضافه می‌شود. برای محصول متغیر، گروهی یا خارجی، انتخاب
          نهایی در صفحهٔ محصول ووکامرس انجام می‌شود.
        </P.Alert>
        <p>
          نسخهٔ مرورگر runtime داخلی React را همراه دارد. در پروژهٔ React، پکیج‌های مستقیم React
          انتخاب سبک‌تری هستند. صحت اجرای افزونه روی نصب واقعی وردپرس باید در محیط میزبان بررسی شود.
        </p>
      </Section>
    </>
  );
}

export function RegistryDemo() {
  const [query, setQuery] = useState('');
  const items = registry.filter((item) =>
    (item.name + ' ' + item.package).includes(query.toLowerCase()),
  );
  return (
    <>
      <B.PageHeader
        eyebrow="SOURCE REGISTRY"
        title="سورس اجزا، داخل پروژهٔ خودت."
        description="کپی سورس با وابستگی‌های محلی، محافظت از تغییرات، بررسی اختلاف و خروجی استاندارد JSON."
      />
      <Section
        title={`${registry.length} ورودی سورس`}
        description="حالت معمولی facade می‌سازد؛ --source پیاده‌سازی قابل ویرایش را کپی می‌کند. CSS و توکن‌ها همچنان بسته‌های مشترک هستند."
      >
        <P.CodeBlock
          language="bash"
          code={
            'primedesign init\nprimedesign add button product-card --source\nprimedesign search chat\nprimedesign diff product-card\nprimedesign doctor\nprimedesign list --source --json'
          }
        />
        <P.Input
          label="جست‌وجو در رجیستری"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="product · chat · sidebar"
        />
        <div className="extension-registry">
          {items.map((item) => (
            <a key={item.name} href={`./r/${item.name}.json`} target="_blank" rel="noreferrer">
              <strong>{item.exportName}</strong>
              <code>@primedesign/{item.package}</code>
              <small>{item.fileCount} فایل منبع</small>
            </a>
          ))}
        </div>
      </Section>
      <Section title="رجیستری عمومی">
        <p>
          خروجی <a href="./r/registry.json">registry.json</a> و فایل هر جزء مطابق قالب Registry Item
          تولید می‌شود. پس از انتشار سایت مستندات، URL هر فایل را می‌توان در ابزارهای سازگار استفاده
          کرد. CLI خود PrimeDesign برای حالت سورس به دانلود شبکه وابسته نیست.
        </p>
      </Section>
    </>
  );
}

export function CoverageDemo() {
  const [query, setQuery] = useState('');
  return (
    <>
      <B.PageHeader
        eyebrow="COVERAGE, WITH LIMITS"
        title="مقایسهٔ قابل بررسی با shadcn."
        description="وجود یک نام به معنی برابری تمام API و رفتارها نیست. این فهرست معادل‌ها، تفاوت‌ها و محدودیت‌ها را مشخص می‌کند."
      />
      <Section
        title="نقشهٔ پوشش"
        description="مرجع: فهرست رسمی Components و AI Elements در ui.shadcn.com، بررسی‌شده در ۲ نوامبر ۲۰۲۶."
      >
        <P.Input label="جست‌وجوی پوشش" value={query} onChange={(e) => setQuery(e.target.value)} />
        <P.Table>
          <P.TableCaption>معادل‌های PrimeDesign و تفاوت‌های رفتاری</P.TableCaption>
          <P.TableHeader>
            <P.TableRow>
              <P.TableHead>مرجع</P.TableHead>
              <P.TableHead>PrimeDesign</P.TableHead>
              <P.TableHead>توضیح</P.TableHead>
            </P.TableRow>
          </P.TableHeader>
          <P.TableBody>
            {coverage
              .filter((row) =>
                (row.reference + ' ' + row.components.join(' '))
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((row) => (
                <P.TableRow key={row.reference}>
                  <P.TableCell>{row.reference}</P.TableCell>
                  <P.TableCell>
                    <code>{row.components.join(', ')}</code>
                    <br />
                    <P.Badge tone={row.partial ? 'warning' : 'success'}>
                      {row.partial ? 'پوشش محدود' : 'پیاده‌سازی موجود'}
                    </P.Badge>
                  </P.TableCell>
                  <P.TableCell>{row.note}</P.TableCell>
                </P.TableRow>
              ))}
          </P.TableBody>
        </P.Table>
      </Section>
      <P.Alert tone="info" title="معیار کامل‌تر بودن">
        این پروژه اجزای فارسی، فروشگاهی و خروجی HTML/WordPress را کنار UI پایه ارائه می‌کند. برتری
        کلی نسبت به اکوسیستم shadcn ادعا نمی‌شود؛ تست رفتار، دسترس‌پذیری و نیاز محصول معیار انتخاب
        است.
      </P.Alert>
    </>
  );
}
