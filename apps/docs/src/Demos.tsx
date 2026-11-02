import {
  AuthCard,
  ConversationView,
  FileCard,
  InboxLayout,
  NotificationCenter,
  PageHeader,
  PricingCard,
  TicketList,
  type Message,
} from '@primedesign/blocks';
import { BarChart, BarList, DataTable, LineChart, PieChart, type Column } from '@primedesign/data';
import {
  Form,
  FormField,
  FormWizard,
  SchemaForm,
  useFieldArray,
  useForm,
  validateFields,
  validators,
} from '@primedesign/forms';
import { Icon, iconPaths, type IconName } from '@primedesign/icons';
import { formatMoney, toFaDigits } from '@primedesign/persian';
import * as P from '@primedesign/react';
import { createTheme, type Density, type ThemeMode } from '@primedesign/tokens';
import { useMemo, useState } from 'react';
import api from './api.json';
import { initialTickets, orders, type DemoOrder } from './data.js';
import { Section } from './Section.js';
export function Components() {
  const [text, setText] = useState(''),
    [check, setCheck] = useState(true),
    [enabled, setEnabled] = useState(true),
    [open, setOpen] = useState(false),
    [confirm, setConfirm] = useState(false),
    [selected, setSelected] = useState(''),
    [tags, setTags] = useState(['طراحی', 'محصول']),
    [multi, setMulti] = useState(['react']),
    [number, setNumber] = useState(3),
    [slider, setSlider] = useState(45),
    [rating, setRating] = useState(4),
    [otp, setOtp] = useState(''),
    [password, setPassword] = useState(''),
    [color, setColor] = useState('#6254df'),
    { toast } = P.useToast();
  return (
    <>
      <PageHeader
        eyebrow="COMPONENT LIBRARY"
        title="یک زبان مشترک برای تمام رابط‌ها."
        description="نمونه‌های تعاملی را امتحان کن و مشخصات TypeScript هر جزء را پایین صفحه ببین."
      />
      <Section
        title="دکمه‌ها و حالت‌ها"
        code={'<Button variant="solid" startIcon={<Icon name="plus" />}>ساخت مورد جدید</Button>'}
      >
        <div className="demo-row">
          <P.Button
            startIcon={<Icon name="plus" />}
            onClick={() => void toast({ title: 'دکمه کلیک شد', tone: 'success' })}
          >
            ساخت مورد جدید
          </P.Button>
          <P.Button variant="soft">دکمهٔ ملایم</P.Button>
          <P.Button variant="outline">دکمهٔ ثانویه</P.Button>
          <P.Button variant="ghost">دکمهٔ ساده</P.Button>
          <P.Button variant="danger" onClick={() => setConfirm(true)}>
            حذف مورد
          </P.Button>
          <P.Button loading>در حال ذخیره</P.Button>
          <P.Button disabled>غیرفعال</P.Button>
          <P.IconButton label="افزودن نمونه" icon="plus" variant="outline" />
          <P.Tooltip label="توضیح کوتاه و مفید">
            <Icon name="info" />
          </P.Tooltip>
        </div>
      </Section>
      <div className="demo-two-col">
        <Section title="ورودی‌ها و انتخاب‌ها">
          <P.Stack gap={5}>
            <P.Input
              label="نام پروژه"
              placeholder="برای ایده‌ات یک اسم انتخاب کن"
              value={text}
              onChange={(e) => setText(e.target.value)}
              startAdornment={<Icon name="box" />}
            />
            <P.Input
              label="ایمیل"
              type="email"
              placeholder="you@example.com"
              description="برای ارتباط با شما استفاده می‌شود."
            />
            <P.Input
              label="نمونهٔ خطا"
              error="این نام قبلاً انتخاب شده است."
              defaultValue="prime"
            />
            <P.Textarea label="توضیحات" placeholder="کمی بیشتر دربارهٔ پروژه بنویس…" />
            <P.Select
              label="نوع پروژه"
              defaultValue="store"
              options={[
                { value: 'store', label: 'فروشگاه' },
                { value: 'dashboard', label: 'پنل مدیریت' },
                { value: 'app', label: 'اپلیکیشن' },
              ]}
            />
            <P.Checkbox
              label="شرایط استفاده را می‌پذیرم"
              checked={check}
              onChange={(e) => setCheck(e.target.checked)}
              description="می‌توانید این گزینه را با کیبورد هم انتخاب کنید."
            />
            <P.Switch
              label="دریافت اعلان‌ها"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </P.Stack>
        </Section>
        <Section title="جست‌وجو و انتخاب پیشرفته">
          <P.Stack gap={5}>
            <P.Combobox
              label="انتخاب استان"
              options={[
                { value: 'tehran', label: 'تهران' },
                { value: 'shiraz', label: 'شیراز' },
                { value: 'esfahan', label: 'اصفهان' },
                { value: 'rasht', label: 'رشت' },
              ]}
              value={selected}
              onValueChange={setSelected}
              placeholder="یک شهر انتخاب کن"
              clearable
            />
            <P.MultiSelect
              label="تکنولوژی‌های پروژه"
              value={multi}
              onValueChange={setMulti}
              options={[
                { label: 'React', value: 'react' },
                { label: 'Next.js', value: 'next' },
                { label: 'TypeScript', value: 'ts' },
              ]}
            />
            <P.TagInput
              label="برچسب‌ها"
              value={tags}
              onValueChange={setTags}
              placeholder="Enter برای افزودن"
            />
            <P.NumberInput
              label="تعداد اعضا"
              value={number}
              onValueChange={setNumber}
              min={1}
              max={20}
            />
            <P.Slider label="درصد پیشرفت" value={slider} onValueChange={setSlider} />
            <P.Rating label="امتیاز تجربه" value={rating} onValueChange={setRating} />
          </P.Stack>
        </Section>
      </div>
      <Section title="پنجره، منو و اعلان">
        <div className="demo-row">
          <P.Button onClick={() => setOpen(true)}>باز کردن دیالوگ</P.Button>
          <P.DropdownMenu
            label="منوی عملیات نمونه"
            trigger={
              <span className="demo-trigger">
                عملیات <Icon name="chevronDown" size={16} />
              </span>
            }
            items={[
              {
                id: 'edit',
                label: 'ویرایش',
                icon: <Icon name="edit" size={16} />,
                onSelect: () => void toast({ title: 'ویرایش انتخاب شد' }),
              },
              {
                id: 'copy',
                label: 'ساخت کپی',
                icon: <Icon name="copy" size={16} />,
                onSelect: () => void toast({ title: 'ساخت کپی انتخاب شد' }),
              },
              { id: 'delete', label: 'حذف', danger: true, onSelect: () => setConfirm(true) },
            ]}
          />
          <P.Popover
            label="فیلتر کوتاه"
            trigger={
              <span className="demo-trigger">
                فیلتر شناور <Icon name="filter" size={16} />
              </span>
            }
          >
            <P.Stack gap={3}>
              <P.Checkbox label="فقط موارد فعال" defaultChecked />
              <P.Checkbox label="دارای تخفیف" />
            </P.Stack>
          </P.Popover>
          {(['success', 'info', 'warning', 'danger'] as const).map((t) => (
            <P.Button
              key={t}
              variant="outline"
              onClick={() =>
                void toast({
                  title: {
                    success: 'تغییرات ذخیره شدند',
                    info: 'یک اعلان جدید دارید',
                    warning: 'زمان جلسه رو به پایان است',
                    danger: 'درخواست با خطا مواجه شد',
                  }[t],
                  tone: t,
                })
              }
            >
              {t}
            </P.Button>
          ))}
        </div>
      </Section>
      <div className="demo-two-col">
        <Section title="بازخورد و نمایش وضعیت">
          <P.Stack gap={4}>
            <div className="demo-row">
              {(['brand', 'success', 'warning', 'danger', 'info', 'neutral'] as const).map((t) => (
                <P.Badge key={t} tone={t} dot>
                  {t}
                </P.Badge>
              ))}
            </div>
            <P.Alert tone="success" title="همه چیز آماده است">
              می‌توانید مرحلهٔ بعد را شروع کنید.
            </P.Alert>
            <P.Alert tone="warning" title="یک بررسی کوچک">
              اطلاعات نشانی را قبل از ثبت تأیید کنید.
            </P.Alert>
            <P.Progress label="پیشرفت نمونه" value={slider} />
            <div className="demo-row">
              <P.Avatar name="سارا احمدی" />
              <P.Avatar name="محمد رضایی" size="lg" />
              <P.AvatarGroup
                max={3}
                names={['علی', 'مریم', 'سارا', 'رضا', 'نگار'].map((name) => ({ name }))}
              />
              <P.Spinner />
            </div>
            <P.Skeleton style={{ width: '80%' }} />
            <P.Skeleton style={{ width: '55%' }} />
          </P.Stack>
        </Section>
        <Section title="تب‌ها و محتوای بازشونده">
          <P.Tabs
            label="تب نمونه"
            items={[
              { value: 'info', label: 'مشخصات', content: <p>محتوای تب مشخصات محصول.</p> },
              {
                value: 'reviews',
                label: 'دیدگاه‌ها',
                count: 12,
                content: <p>دیدگاه‌های کاربران در این بخش قرار می‌گیرند.</p>,
              },
              { value: 'disabled', label: 'غیرفعال', disabled: true, content: null },
            ]}
          />
          <P.Accordion
            items={[
              {
                id: 'one',
                title: 'پرایم دیزاین با Next.js کار می‌کند؟',
                content:
                  'بله؛ اجزای تعاملی مرز use client دارند و توکن‌ها و ابزارهای فارسی روی سرور هم قابل استفاده‌اند.',
              },
              {
                id: 'two',
                title: 'می‌توانم فونت برند خودم را بگذارم؟',
                content:
                  'بله؛ فایل فونت دارای مجوز را در پروژهٔ خود قرار بده و fontFamily را تنظیم کن.',
              },
            ]}
          />
        </Section>
      </div>
      <Section title="ورودی‌های کاربردی">
        <div className="demo-three-col">
          <div>
            <P.PasswordInput
              label="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <P.PasswordStrength value={password} />
          </div>
          <P.OtpInput
            label="کد تأیید"
            value={otp}
            onValueChange={setOtp}
            onComplete={() =>
              void toast({ title: 'کد کامل شد؛ تأیید نهایی باید روی سرور انجام شود.' })
            }
          />
          <P.TimeInput
            label="ساعت"
            value={text.includes(':') ? text : '09:30'}
            onValueChange={setText}
          />
          <P.ColorPicker label="انتخاب رنگ" value={color} onValueChange={setColor} />
          <P.CopyButton value="PrimeDesign" />
          <P.InlineEdit
            label="عنوان پروژه"
            value="پروژهٔ نمونه"
            onSave={(v) => void toast({ title: 'عنوان نمونه ذخیره شد', description: v })}
          />
        </div>
      </Section>
      <Section
        title="بارگذاری فایل"
        description="این نمونه فقط انتخاب فایل را نشان می‌دهد. uploader و createChunkedUploader برای اتصال به سرویس خودتان در دسترس‌اند."
      >
        <P.FileUpload label="فایل‌های پروژه" accept="image/*,.pdf" />
      </Section>
      <ApiBrowser />
      <P.Dialog
        open={open}
        onOpenChange={setOpen}
        title="ساخت پروژهٔ جدید"
        description="اطلاعات اصلی را وارد کنید."
        footer={
          <>
            <P.Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </P.Button>
            <P.Button
              onClick={() => {
                setOpen(false);
                toast({ title: 'پروژهٔ نمونه ساخته شد', tone: 'success' });
              }}
            >
              ساخت پروژه
            </P.Button>
          </>
        }
      >
        <P.Input autoFocus label="نام پروژهٔ جدید" placeholder="مثلاً فروشگاه من" />
      </P.Dialog>
      <P.ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="این مورد حذف شود؟"
        description="این عملیات در نمونه فقط یک اعلان نمایش می‌دهد."
        danger
        onConfirm={() => {
          setConfirm(false);
          toast({ title: 'مورد نمونه حذف شد' });
        }}
      />
    </>
  );
}
export function ApiBrowser() {
  const [query, setQuery] = useState(''),
    [pkg, setPkg] = useState('all'),
    filtered = api.filter(
      (a) =>
        (pkg === 'all' || a.package === pkg) && a.name.toLowerCase().includes(query.toLowerCase()),
    );
  return (
    <Section
      title="مرجع API"
      description="این مشخصات از تایپ‌های واقعی سورس استخراج می‌شوند؛ همهٔ exportها قابل جست‌وجو هستند."
    >
      <div className="api-toolbar">
        <P.Input
          aria-label="جست‌وجوی API"
          placeholder="نام کامپوننت یا تابع…"
          dir="ltr"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          startAdornment={<Icon name="search" />}
        />
        <P.Select
          aria-label="انتخاب پکیج"
          value={pkg}
          onChange={(e) => setPkg(e.target.value)}
          options={[
            { value: 'all', label: 'تمام پکیج‌ها' },
            ...Array.from(new Set(api.map((a) => a.package))).map((p) => ({ value: p, label: p })),
          ]}
        />
      </div>
      <div className="api-results">
        {filtered.map((a) => (
          <details key={a.package + a.name} className="api-entry">
            <summary>
              <code>{a.name}</code>
              <small>@primedesign/{a.package}</small>
              <P.Badge tone={a.kind === 'component' ? 'brand' : 'neutral'}>{a.kind}</P.Badge>
            </summary>
            <pre dir="ltr">
              <code>{a.signature}</code>
            </pre>
            {a.props.length > 0 && (
              <div className="api-table-wrap">
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Prop</th>
                      <th>Type</th>
                      <th>Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.props.map((p) => (
                      <tr key={p.name}>
                        <td>
                          <code>{p.name}</code>
                        </td>
                        <td dir="ltr">
                          <code>{p.type}</code>
                        </td>
                        <td>{p.required ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </details>
        ))}
      </div>
    </Section>
  );
}
export function DataDemo() {
  const [selected, setSelected] = useState<string[]>([]),
    [virtual, setVirtual] = useState(false),
    { toast } = P.useToast();
  const columns: Column<DemoOrder>[] = [
    {
      id: 'id',
      header: 'شمارهٔ سفارش',
      sortable: true,
      width: 125,
      pin: 'start',
      render: (r) => <strong>#{toFaDigits(r.id)}</strong>,
    },
    {
      id: 'customer',
      header: 'مشتری',
      sortable: true,
      filterable: true,
      width: 200,
      render: (r) => (
        <div className="table-person">
          <P.Avatar name={r.customer} size="sm" />
          <span>
            <strong>{r.customer}</strong>
            <small>{r.email}</small>
          </span>
        </div>
      ),
    },
    { id: 'product', header: 'محصول', filterable: true, width: 220 },
    {
      id: 'amount',
      header: 'مبلغ',
      sortable: true,
      numeric: true,
      width: 170,
      render: (r) => formatMoney(r.amount),
    },
    {
      id: 'status',
      header: 'وضعیت',
      filterable: true,
      width: 150,
      render: (r) => (
        <P.Badge
          tone={
            r.status === 'پرداخت شده'
              ? 'success'
              : r.status === 'لغو شده'
                ? 'danger'
                : r.status === 'ارسال شده'
                  ? 'info'
                  : 'warning'
          }
          dot
        >
          {r.status}
        </P.Badge>
      ),
    },
    { id: 'date', header: 'تاریخ', sortable: true, width: 130 },
  ];
  const large = useMemo(
    () =>
      Array.from({ length: 10000 }, (_, i) => ({
        ...orders[i % orders.length],
        id: String(1000 + i),
      })),
    [],
  );
  return (
    <>
      <PageHeader
        eyebrow="DATA & ANALYTICS"
        title="اطلاعات زیاد، تصمیم‌های روشن."
        description="جست‌وجوی فارسی، فیلتر ستون، انتخاب گروهی، مرتب‌سازی، تغییر عرض و ترتیب ستون‌ها و خروجی امن CSV."
      />
      <P.Grid min={180}>
        <P.StatCard
          label="فروش کل"
          value="۱۲۸٫۴ میلیون"
          change={18.6}
          icon={<Icon name="chart" />}
        />
        <P.StatCard label="سفارش‌ها" value="۱۳۷" change={12.2} icon={<Icon name="bag" />} />
        <P.StatCard
          label="میانگین سفارش"
          value="۳٫۲ میلیون"
          change={7.4}
          icon={<Icon name="creditCard" />}
        />
        <P.StatCard label="نرخ بازگشت" value="۲٫۱٪" change={-1.3} icon={<Icon name="refresh" />} />
      </P.Grid>
      <div className="data-chart-grid">
        <LineChart
          title="روند فروش هفته"
          data={[
            { label: 'شنبه', value: 18 },
            { label: 'یکشنبه', value: 24 },
            { label: 'دوشنبه', value: 19 },
            { label: 'سه‌شنبه', value: 31 },
            { label: 'چهارشنبه', value: 28 },
            { label: 'پنجشنبه', value: 42 },
            { label: 'جمعه', value: 38 },
          ]}
        />
        <PieChart
          title="وضعیت سفارش‌ها"
          data={[
            { label: 'پرداخت شده', value: 62 },
            { label: 'در حال پردازش', value: 34 },
            { label: 'ارسال شده', value: 29 },
            { label: 'لغو شده', value: 12 },
          ]}
        />
      </div>
      <div className="data-table-demo">
        <div className="demo-row">
          <P.Switch
            label="آزمایش اسکرول مجازی با ۱۰٬۰۰۰ ردیف"
            checked={virtual}
            onChange={(e) => {
              setVirtual(e.target.checked);
              setSelected([]);
            }}
          />
          <P.Badge>دادهٔ نمونه</P.Badge>
        </div>
        <DataTable
          key={String(virtual)}
          caption={virtual ? 'آزمایش ۱۰٬۰۰۰ ردیف' : 'آخرین سفارش‌ها'}
          description="فیلترها و تنظیمات را امتحان کنید؛ داده‌ها نمایشی هستند."
          rows={virtual ? large : orders}
          columns={columns}
          getRowId={(r) => r.id}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          defaultState={{ pageSize: virtual ? 10000 : 10 }}
          virtualized={virtual}
          height={440}
          bulkActions={(ids) => (
            <P.Button
              size="sm"
              variant="outline"
              onClick={() => void toast({ title: `${toFaDigits(ids.length)} سفارش انتخاب شد` })}
            >
              عملیات گروهی
            </P.Button>
          )}
          rowActions={(r) => (
            <P.IconButton
              icon="more"
              label={`عملیات سفارش ${r.id}`}
              variant="ghost"
              size="sm"
              onClick={() => void toast({ title: `سفارش ${toFaDigits(r.id)}` })}
            />
          )}
          renderExpanded={
            virtual
              ? undefined
              : (r) => (
                  <p>
                    سفارش {r.id} برای {r.customer} — {r.product}
                  </p>
                )
          }
        />
      </div>
      <Section
        title="اتصال به دادهٔ سرور"
        description="در serverSide جست‌وجو، مرتب‌سازی و صفحه‌بندی محلی انجام نمی‌شود؛ وضعیت را به API خود بفرستید."
        code={
          '<DataTable\n  rows={response.results}\n  columns={columns}\n  getRowId={row => row.id}\n  caption="Orders"\n  serverSide\n  rowCount={response.count}\n  state={query}\n  onStateChange={setQuery}\n  loading={isLoading}\n/>'
        }
      >
        <P.Alert tone="info" title="قرارداد روشن با بک‌اند">
          پارامترهای state را در لایهٔ سرویس به API جنگو یا هر سرویس دیگری نگاشت کنید. برای دادهٔ
          سرور، onExport را به خروجی کامل سرور وصل کنید.
        </P.Alert>
      </Section>
      <div className="demo-two-col">
        <BarChart
          title="سود و زیان نمونه"
          data={[
            { label: 'فروردین', value: 18 },
            { label: 'اردیبهشت', value: -7 },
            { label: 'خرداد', value: 24 },
            { label: 'تیر', value: 32 },
          ]}
        />
        <BarList
          title="پرفروش‌ترین دسته‌ها"
          data={[
            { label: 'صوتی', value: 128 },
            { label: 'پوشیدنی', value: 92 },
            { label: 'لوازم جانبی', value: 78 },
            { label: 'سبک زندگی', value: 53 },
          ]}
        />
      </div>
    </>
  );
}
function ArrayForm() {
  const form = useForm({ defaultValues: { members: [{ name: 'سارا', role: 'طراح' }] } }),
    array = useFieldArray({ form, name: 'members' }),
    { toast } = P.useToast();
  return (
    <Form
      form={form}
      onSubmit={(v) =>
        void toast({ title: 'اعضای نمونه ذخیره شدند', description: JSON.stringify(v) })
      }
    >
      <P.Stack gap={4}>
        {array.fields.map((f) => (
          <div className="array-row" key={f.id}>
            <FormField name={`members.${f.index}.name`}>
              {(p) => (
                <P.Input
                  label={`نام عضو ${f.index + 1}`}
                  value={String(p.value ?? '')}
                  onChange={(e) => p.onChange(e.target.value)}
                />
              )}
            </FormField>
            <FormField name={`members.${f.index}.role`}>
              {(p) => (
                <P.Input
                  label="نقش"
                  value={String(p.value ?? '')}
                  onChange={(e) => p.onChange(e.target.value)}
                />
              )}
            </FormField>
            <P.IconButton
              label={`حذف عضو ${f.index + 1}`}
              icon="trash"
              variant="ghost"
              onClick={() => array.remove(f.index)}
            />
          </div>
        ))}
        <div className="demo-row">
          <P.Button
            variant="outline"
            size="sm"
            startIcon={<Icon name="plus" size={16} />}
            onClick={() => array.append({ name: '', role: '' })}
          >
            افزودن عضو
          </P.Button>
          <P.Button type="submit" size="sm">
            ذخیرهٔ اعضا
          </P.Button>
        </div>
      </P.Stack>
    </Form>
  );
}
export function FormsDemo() {
  const { toast } = P.useToast(),
    form = useForm({
      defaultValues: { name: '', mobile: '', city: 'تهران' },
      validate: validateFields({
        name: [validators.required()],
        mobile: [validators.required(), validators.mobile()],
      }),
    });
  return (
    <>
      <PageHeader
        eyebrow="FORMS & WORKFLOWS"
        title="فرم‌هایی که همراه کاربرند."
        description="اعتبارسنجی، فیلدهای شرطی، مراحل، آرایه‌ها و خطاهای سرور، با یک قرارداد مشترک."
      />
      <div className="demo-two-col">
        <Section
          title="فرم مبتنی بر Schema"
          description="حالت حقوقی را فعال کن تا فیلد شرکت نمایش داده شود."
        >
          <SchemaForm
            defaultValues={{ name: '', email: '', mobile: '', company: false, companyName: '' }}
            fields={[
              {
                name: 'name',
                label: 'نام و نام خانوادگی',
                type: 'text',
                placeholder: 'نام کامل',
                rules: [validators.required()],
              },
              {
                name: 'email',
                label: 'ایمیل',
                type: 'email',
                rules: [validators.required(), validators.email()],
              },
              {
                name: 'mobile',
                label: 'موبایل',
                type: 'mobile',
                rules: [validators.required(), validators.mobile()],
              },
              { name: 'company', label: 'حساب حقوقی است', type: 'checkbox' },
              {
                name: 'companyName',
                label: 'نام شرکت',
                type: 'text',
                visible: (v) => !!v.company,
                rules: [validators.required()],
              },
            ]}
            onSubmit={() =>
              void toast({ title: 'فرم نمونه با موفقیت اعتبارسنجی شد', tone: 'success' })
            }
          />
        </Section>
        <Section
          title="فرم چندمرحله‌ای"
          description="تا اطلاعات هر مرحله معتبر نباشد، مرحلهٔ بعد باز نمی‌شود."
        >
          <FormWizard
            form={form}
            steps={[
              {
                title: 'اطلاعات فردی',
                fields: ['name'],
                content: (
                  <FormField name="name">
                    {(f) => (
                      <P.Input
                        label="نام کامل"
                        value={String(f.value ?? '')}
                        onChange={(e) => f.onChange(e.target.value)}
                        onBlur={f.onBlur}
                        error={f.error}
                      />
                    )}
                  </FormField>
                ),
              },
              {
                title: 'اطلاعات تماس',
                fields: ['mobile'],
                content: (
                  <FormField name="mobile">
                    {(f) => (
                      <P.MobileInput
                        label="شمارهٔ موبایل"
                        value={String(f.value ?? '')}
                        onValueChange={(v) => f.onChange(v)}
                        onBlur={f.onBlur}
                        error={f.error}
                      />
                    )}
                  </FormField>
                ),
              },
              {
                title: 'تأیید',
                fields: [],
                content: (
                  <P.Alert tone="success" title="آمادهٔ ثبت">
                    {String(form.values.name)} · {String(form.values.mobile)}
                  </P.Alert>
                ),
              },
            ]}
            onSubmit={() => void toast({ title: 'اطلاعات نمونه ثبت شد', tone: 'success' })}
          />
        </Section>
      </div>
      <Section
        title="فیلدهای تکرارشونده"
        description="ردیف اضافه و حذف کن؛ هر ردیف شناسهٔ پایدار دارد."
      >
        <ArrayForm />
      </Section>
      <Section
        title="خطاهای سرور و پیش‌نویس"
        code={
          'const form = useForm({ defaultValues, validate });\n\n// Map the Django API error shape at your service boundary.\nform.setErrors({ mobile: "این شماره قبلاً ثبت شده است." });\n\n// Persist only explicitly selected non-sensitive fields.\nuseFormDraft({ form, storageKey: "profile-draft", fields: ["name", "city"] });'
        }
      >
        <P.Alert tone="info" title="حریم خصوصی پیش‌نویس">
          فقط فیلدهای مشخص‌شده ذخیره می‌شوند. رمز، توکن و داده‌های بانکی را در پیش‌نویس مرورگر نگه
          ندارید.
        </P.Alert>
      </Section>
    </>
  );
}
export function PersianDemo() {
  const [date, setDate] = useState<Date | null>(null),
    [range, setRange] = useState<P.DateRange>({ start: null, end: null }),
    [month, setMonth] = useState({ year: 1405, month: 8 }),
    [price, setPrice] = useState(1250000),
    [mobile, setMobile] = useState(''),
    [nid, setNid] = useState(''),
    [card, setCard] = useState(''),
    [iban, setIban] = useState(''),
    [postal, setPostal] = useState('');
  return (
    <>
      <PageHeader
        eyebrow="PERSIAN FIRST"
        title="فارسی، از پایهٔ طراحی."
        description="مقدار نمایشی فارسی است؛ مقدار ارسالی فرم و API استاندارد و قابل پردازش باقی می‌ماند."
      />
      <div className="demo-three-col">
        <Section title="انتخاب تاریخ شمسی">
          <P.DatePicker label="تاریخ مورد نظر" value={date} onValueChange={setDate} name="date" />
          <p className="demo-note">
            جمعه‌های غیرفعال و min/max در Calendar، تایپ دستی و میان‌برها رعایت می‌شوند.
          </p>
        </Section>
        <Section title="بازهٔ تاریخ">
          <P.DateRangePicker label="بازهٔ گزارش" value={range} onValueChange={setRange} />
        </Section>
        <Section title="انتخاب ماه">
          <P.MonthPicker label="ماه گزارش" value={month} onValueChange={setMonth} />
        </Section>
      </div>
      <Section title="ورودی‌های بومی">
        <div className="demo-three-col">
          <P.MobileInput
            label="شمارهٔ موبایل"
            value={mobile}
            onValueChange={setMobile}
            description="+98 و ارقام فارسی هم پذیرفته می‌شوند."
          />
          <P.NationalIdInput label="کد ملی" value={nid} onValueChange={setNid} />
          <P.CardNumberInput label="شمارهٔ کارت" value={card} onValueChange={setCard} />
          <P.IbanInput label="شمارهٔ شبا" value={iban} onValueChange={setIban} />
          <P.PostalCodeInput label="کد پستی" value={postal} onValueChange={setPostal} />
          <P.ProvinceSelect label="استان" defaultValue="تهران" />
          <P.PriceInput label="مبلغ" value={price} onValueChange={setPrice} />
        </div>
      </Section>
      <Section
        title="ابزارهای مستقل از React"
        code={
          'import { formatMoney, parseJalali, toISODate, normalizePersian } from "@primedesign/persian";\n\nformatMoney(1250000); // ۱٬۲۵۰٬۰۰۰ تومان\nconst date = parseJalali("۱۴۰۵/۰۸/۱۰");\nconst apiValue = date ? toISODate(date) : null;\nnormalizePersian("كاربري"); // کاربری'
        }
      >
        <P.Alert tone="info" title="اعتبارسنجی سمت سرور هم لازم است">
          ابزارهای ورودی، ساختار مقدار را بررسی می‌کنند؛ مالکیت شماره، موجود بودن حساب و قوانین
          کسب‌وکار را سرور تأیید می‌کند.
        </P.Alert>
      </Section>
    </>
  );
}
export function BlocksDemo() {
  const [ticket, setTicket] = useState('1042'),
    [messages, setMessages] = useState<Message[]>([
      {
        id: '1',
        sender: 'سارا احمدی',
        text: 'سلام، برای اتصال فروشگاهم به پنل راهنمایی می‌خواستم.',
        time: '۱۰:۲۴',
      },
      {
        id: '2',
        sender: 'پشتیبانی',
        text: 'سلام سارا، خوشحال می‌شیم کمکتون کنیم. لطفاً نام پلتفرم فروشگاهتون رو بفرستید.',
        time: '۱۰:۲۶',
        own: true,
        status: 'read',
      },
      {
        id: '3',
        sender: 'سارا احمدی',
        text: 'فروشگاه من با Next.js ساخته شده. می‌خواهم سبد خرید هم هماهنگ باشد.',
        time: '۱۰:۲۷',
      },
    ]),
    [notifications, setNotifications] = useState([
      {
        id: '1',
        title: 'سفارش جدید ثبت شد',
        description: 'سفارش شمارهٔ ۱۰۴۲ منتظر پردازش است.',
        date: '۱۰ دقیقه پیش',
        read: false,
      },
      {
        id: '2',
        title: 'نسخهٔ جدید آماده است',
        description: 'اجزای فروشگاهی به مجموعه اضافه شده‌اند.',
        date: 'امروز',
        read: false,
      },
      {
        id: '3',
        title: 'خوش آمدید',
        description: 'پروژهٔ نمونهٔ شما ساخته شد.',
        date: 'دیروز',
        read: true,
      },
    ]),
    { toast } = P.useToast();
  return (
    <>
      <PageHeader
        eyebrow="PRODUCT BLOCKS"
        title="قطعه‌ها کنار هم، یک محصول کامل."
        description="بخش‌های آمادهٔ قابل اتصال به داده‌ها و سرویس‌های خودتان."
      />
      <Section
        title="تیکت و صندوق پیام"
        description="یک گفتگو را انتخاب کن و پیام نمونه بفرست؛ این نمونه به سرویس خارجی متصل نیست."
      >
        <InboxLayout
          showConversation={!!ticket}
          onBack={() => setTicket('')}
          list={<TicketList tickets={initialTickets} selected={ticket} onSelect={setTicket} />}
          conversation={
            ticket ? (
              <ConversationView
                title={initialTickets.find((t) => t.id === ticket)?.title ?? 'گفتگو'}
                subtitle={`تیکت #${ticket} · پشتیبانی آنلاین`}
                messages={messages}
                onSend={(text) =>
                  setMessages((v) => [
                    ...v,
                    {
                      id: String(Date.now()),
                      sender: 'شما',
                      text,
                      time: 'اکنون',
                      own: true,
                      status: 'sent',
                    },
                  ])
                }
                actions={
                  <P.Badge tone="success" dot>
                    باز
                  </P.Badge>
                }
              />
            ) : (
              <P.EmptyState title="یک گفتگو انتخاب کنید" icon="message" />
            )
          }
        />
      </Section>
      <div className="demo-two-col">
        <NotificationCenter
          items={notifications}
          onRead={(id) =>
            setNotifications((v) => v.map((n) => (n.id === id ? { ...n, read: true } : n)))
          }
          onReadAll={() => setNotifications((v) => v.map((n) => ({ ...n, read: true })))}
        />
        <Section title="فایل‌های پروژه">
          <P.Grid min={130}>
            <FileCard
              name="راهنمای برند.pdf"
              size="۲٫۴ مگابایت"
              type="PDF"
              onDownload={() =>
                void toast({ title: 'فایل نمونه است؛ لینک دانلود را خودتان متصل کنید.' })
              }
            />
            <FileCard name="کامپوننت‌ها.fig" size="۸٫۱ مگابایت" type="Figma" />
          </P.Grid>
        </Section>
      </div>
      <Section title="کارت پلن و اشتراک">
        <P.Grid min={220}>
          {[
            {
              title: 'شروع',
              price: 0,
              features: [
                { label: 'کامپوننت‌های پایه', included: true },
                { label: 'تم اختصاصی', included: false },
              ],
            },
            {
              title: 'حرفه‌ای',
              price: 490000,
              features: [
                { label: 'تمام کامپوننت‌ها', included: true },
                { label: 'تم اختصاصی', included: true },
              ],
            },
            {
              title: 'تیمی',
              price: 1290000,
              features: [
                { label: 'فضای مشترک تیم', included: true },
                { label: 'پشتیبانی اختصاصی', included: true },
              ],
            },
          ].map((p, i) => (
            <PricingCard
              key={p.title}
              {...p}
              period="ماه"
              highlighted={i === 1}
              description="محتوای نمونه برای نمایش کارت"
              action={
                <P.Button
                  fullWidth
                  variant={i === 1 ? 'solid' : 'outline'}
                  onClick={() => void toast({ title: 'پلن نمونه انتخاب شد', description: p.title })}
                >
                  انتخاب پلن
                </P.Button>
              }
            />
          ))}
        </P.Grid>
      </Section>
      <Section
        title="ورود و احراز هویت"
        description="فقط رابط فرم؛ احراز هویت باید به سرویس شما متصل شود."
      >
        <AuthCard
          title="خوش برگشتی."
          description="برای ادامه وارد حساب کاربری‌ات شو."
          logo={<Icon name="layers" size={32} />}
          onSubmit={() => void toast({ title: 'فرم نمونه دریافت شد؛ سرویس احراز هویت متصل نیست.' })}
        />
      </Section>
    </>
  );
}
export interface StudioSettings {
  brand: string;
  radius: number;
  density: Density;
  theme: ThemeMode;
  dir: 'rtl' | 'ltr';
  fontFamily: string;
}
export function ThemeStudio({
  settings,
  onChange,
}: {
  settings: StudioSettings;
  onChange: (s: StudioSettings) => void;
}) {
  const css = createTheme({
    brand: settings.brand,
    radius: settings.radius,
    density: settings.density,
    fontFamily: settings.fontFamily,
  });
  return (
    <>
      <PageHeader
        eyebrow="THEME STUDIO"
        title="همین قطعه‌ها، با امضای برند تو."
        description="تغییرات را زنده در تمام مستندات ببین و توکن‌های CSS را بردار."
      />
      <div className="theme-studio">
        <Section title="کنترل‌های هویت بصری">
          <P.Stack gap={6}>
            <P.ColorPicker
              label="رنگ برند"
              value={settings.brand}
              onValueChange={(brand) => onChange({ ...settings, brand })}
            />
            <div className="theme-presets">
              {['#6254df', '#177864', '#bd4b3c', '#1556a2', '#9b4275', '#8a5d16'].map((brand) => (
                <button
                  type="button"
                  key={brand}
                  style={{ background: brand }}
                  aria-label={`انتخاب رنگ ${brand}`}
                  aria-pressed={brand === settings.brand}
                  onClick={() => onChange({ ...settings, brand })}
                />
              ))}
            </div>
            <P.Slider
              label="گردی گوشه‌ها"
              min={0}
              max={32}
              value={settings.radius}
              onValueChange={(radius) => onChange({ ...settings, radius })}
            />
            <P.Select
              label="تراکم"
              value={settings.density}
              onChange={(e) => onChange({ ...settings, density: e.target.value as Density })}
              options={[
                { value: 'comfortable', label: 'راحت' },
                { value: 'compact', label: 'فشرده' },
              ]}
            />
            <P.Select
              label="فونت"
              value={settings.fontFamily}
              onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
              options={[
                {
                  value: 'Vazirmatn, Tahoma, system-ui, sans-serif',
                  label: 'وزیرمتن — همراه پروژه',
                },
                { value: 'Tahoma, sans-serif', label: 'Tahoma' },
                {
                  value: '"Yekan Bakh", Vazirmatn, sans-serif',
                  label: 'یکان‌بخ — فایل دارای مجوز خودتان',
                },
              ]}
            />
            <P.SegmentedControl
              label="حالت نمایش"
              value={settings.theme}
              onChange={(v) => onChange({ ...settings, theme: v as ThemeMode })}
              options={[
                { value: 'light', label: 'روشن' },
                { value: 'dark', label: 'تیره' },
                { value: 'system', label: 'سیستم' },
              ]}
            />
            <P.Button
              variant="outline"
              onClick={() =>
                onChange({
                  brand: '#6254df',
                  radius: 16,
                  density: 'comfortable',
                  theme: 'light',
                  dir: 'rtl',
                  fontFamily: 'Vazirmatn, Tahoma, system-ui, sans-serif',
                })
              }
            >
              بازنشانی تنظیمات
            </P.Button>
          </P.Stack>
        </Section>
        <div>
          <Section title="پیش‌نمایش زنده">
            <P.PrimeProvider {...settings}>
              <P.Stack gap={5}>
                <div className="demo-row">
                  <P.Button>دکمهٔ اصلی</P.Button>
                  <P.Button variant="soft">ملایم</P.Button>
                  <P.Button variant="outline">ثانویه</P.Button>
                </div>
                <P.Input label="نام برند" placeholder="یک اسم به‌یادماندنی" />
                <P.Alert tone="success" title="همه چیز هماهنگ است">
                  یک هویت بصری، برای تمام تجربه.
                </P.Alert>
                <P.Progress label="پیشرفت" value={65} />
                <CPreview />
              </P.Stack>
            </P.PrimeProvider>
          </Section>
          <Section title="خروجی CSS" code={css}>
            <p className="demo-note">
              رنگ متن روی دکمه با مقایسهٔ کنتراست انتخاب می‌شود. پس از سفارشی‌سازی، ترکیب‌های نهایی
              محصولتان را هم بررسی کنید.
            </p>
          </Section>
        </div>
      </div>
    </>
  );
}
function CPreview() {
  return (
    <P.Card>
      <P.CardBody>
        <div className="demo-row">
          <P.Avatar name="محمد بهارلو" />
          <div>
            <strong>پرایم دیزاین</strong>
            <p className="demo-note">یک تجربهٔ مشترک، برای همهٔ محصولات</p>
          </div>
          <P.Badge tone="brand">حرفه‌ای</P.Badge>
        </div>
      </P.CardBody>
    </P.Card>
  );
}
export function IconsDemo() {
  const [query, setQuery] = useState(''),
    { toast } = P.useToast();
  const names = (Object.keys(iconPaths) as IconName[]).filter((n) =>
    n.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="ICON LIBRARY"
        title="جزئیات ساده، معنای روشن."
        description={`${toFaDigits(Object.keys(iconPaths).length)} آیکون SVG سبک و قابل تغییر؛ مستقل از سرویس‌های خارجی.`}
      />
      <P.Input
        aria-label="جست‌وجوی آیکون"
        placeholder="Search icons…"
        dir="ltr"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        startAdornment={<Icon name="search" />}
      />
      <div className="icons-grid">
        {names.map((name) => (
          <button
            type="button"
            key={name}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`<Icon name="${name}" />`);
                toast({ title: 'کد آیکون کپی شد', description: name, tone: 'success' });
              } catch {
                toast({ title: 'کد آیکون', description: `<Icon name="${name}" />` });
              }
            }}
          >
            <Icon name={name} size={26} />
            <code>{name}</code>
          </button>
        ))}
      </div>
      <Section
        title="استفاده"
        code={
          'import { Icon } from "@primedesign/icons";\n\n<Icon name="bag" size={24} />\n<Icon name="shield" label="پرداخت امن" />'
        }
      >
        <p className="demo-note">
          آیکون تزئینی به‌صورت پیش‌فرض از صفحه‌خوان پنهان است؛ برای آیکون مستقل label بدهید.
        </p>
      </Section>
    </>
  );
}
export function Installation() {
  return (
    <>
      <PageHeader
        eyebrow="GETTING STARTED"
        title="از اینجا شروع کن."
        description="پکیج‌ها در این ریپو ساخته و بسته‌بندی می‌شوند؛ انتشار عمومی npm هنوز انجام نشده است."
      />
      <Section
        title="اجرای مستندات در محیط توسعه"
        code={
          'git clone https://github.com/iimohammad/primedesign.git\ncd primedesign\nnpm ci\nnpm run build\nnpm run dev'
        }
      >
        <P.Alert tone="info" title="پیش‌نیاز">
          Node.js ۲۲ یا بالاتر؛ نسخهٔ توسعه در فایل .nvmrc مشخص است.
        </P.Alert>
      </Section>
      <Section
        title="استفاده در یک پروژهٔ دیگر"
        code={
          '# Inside primedesign\nnpm run pack\n\n# Inside your application; install ALL local package tarballs together.\nnpm install /absolute/path/to/primedesign/artifacts/*.tgz'
        }
      >
        <p className="demo-note">
          بسته‌ها برای نصب محلی آماده‌اند. پس از انتشار نسخه‌ها در رجیستری خودتان، می‌توانید از نام
          پکیج‌ها برای نصب استفاده کنید.
        </p>
      </Section>
      <Section
        title="راه‌اندازی React و Next.js"
        code={
          '// app/layout.tsx\nimport "@primedesign/css";\nimport { Providers } from "./providers";\n\nexport default function Layout({ children }) {\n  return <html lang="fa" dir="rtl"><body><Providers>{children}</Providers></body></html>;\n}\n\n// app/providers.tsx\n"use client";\nimport { PrimeProvider, ToastProvider } from "@primedesign/react";\nimport { CartProvider } from "@primedesign/commerce";\n\nexport function Providers({ children }) {\n  return <PrimeProvider locale="fa-IR" brand="#6254df">\n    <ToastProvider><CartProvider>{children}</CartProvider></ToastProvider>\n  </PrimeProvider>;\n}'
        }
      >
        <p className="demo-note">
          وارد کردن React package از Server Component مجاز است؛ مرزهای کلاینت در خروجی حفظ می‌شوند.
          توکن‌ها و ابزارهای فارسی بدون Provider هم قابل استفاده‌اند.
        </p>
      </Section>
      <Section
        title="CLI پروژه"
        code={
          '# After building / packing the workspace\nnode packages/cli/bin/primedesign.mjs init --cwd /path/to/app\nnode packages/cli/bin/primedesign.mjs add button product-card --source --cwd /path/to/app\nnode packages/cli/bin/primedesign.mjs list'
        }
      >
        <p className="demo-note">
          CLI فایل تنظیمات، واسط‌ها یا با --source خود پیاده‌سازی قابل ویرایش را می‌سازد؛ فایل موجود
          را بدون --force بازنویسی نمی‌کند و هیچ اسکریپت دانلودی اجرا نمی‌کند.
        </p>
      </Section>
      <Section
        title="کیفیت و انتشار"
        code={
          'npm run check         # build, types, unit tests, package checks\nnpm run test:e2e      # browser interaction + accessibility\nnpm run format:check\n\n# Inspect tarballs before publishing to your registry.\nnpm run pack'
        }
      >
        <P.Alert tone="success" title="استقلال از بک‌اند">
          UI به Django، سرویس پرداخت، سرویس آپلود یا احراز هویت خاصی وابسته نیست. این اتصال‌ها از
          طریق callback و adapterهای خودتان انجام می‌شوند.
        </P.Alert>
      </Section>
    </>
  );
}
