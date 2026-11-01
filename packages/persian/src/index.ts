/** Utilities are side effect free and safe to import from server components. */
export const toEnDigits = (value: unknown): string =>
  String(value ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
export const toFaDigits = (value: unknown): string =>
  toEnDigits(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
export const normalizePersian = (s: string): string =>
  s
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F\u0670ـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
export const searchText = (s: string): string =>
  toEnDigits(normalizePersian(s))
    .toLocaleLowerCase()
    .replace(/[\s\u200c\u200d_-]/g, '');
export function formatNumber(
  n: number,
  options: Intl.NumberFormatOptions = {},
  locale = 'fa-IR',
): string {
  return new Intl.NumberFormat(locale, options).format(n);
}
export type MoneyCurrency = 'IRT' | 'IRR' | 'USD' | 'EUR' | 'AED';
export function formatMoney(n: number, currency: MoneyCurrency = 'IRT', locale = 'fa-IR'): string {
  if (currency === 'IRT')
    return `${formatNumber(n, {}, locale)} ${locale.startsWith('fa') ? 'تومان' : 'toman'}`;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'IRR' ? 0 : 2,
  }).format(n);
}
export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;
export const WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
] as const;
export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}
const jalaliFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone: 'UTC',
});
const parts = (d: Date): JalaliDate => {
  const p = Object.fromEntries(jalaliFormatter.formatToParts(d).map((v) => [v.type, v.value]));
  return { year: Number(p.year), month: Number(p.month), day: Number(p.day) };
};
export function toJalali(d: Date): JalaliDate {
  if (!Number.isFinite(d.getTime())) throw new RangeError('Invalid date');
  return parts(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())));
}
/** ICU/Intl is the calendar authority. Supported input years: 1200–1600. */
export function toGregorian(year: number, month: number, day: number): Date | null {
  if (
    ![year, month, day].every(Number.isInteger) ||
    year < 1200 ||
    year > 1600 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  )
    return null;
  const target = year * 10000 + month * 100 + day;
  let lo = Math.floor(Date.UTC(year + 621, 2, 15) / 86400000),
    hi = Math.floor(Date.UTC(year + 622, 2, 24) / 86400000);
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2),
      d = new Date(mid * 86400000),
      j = parts(d),
      key = j.year * 10000 + j.month * 100 + j.day;
    if (key === target) return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    if (key < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return null;
}
export function jalaliMonthLength(year: number, month: number): number {
  if (month < 1 || month > 12 || !toGregorian(year, month, 1))
    throw new RangeError('Invalid Jalali month');
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return toGregorian(year, 12, 30) ? 30 : 29;
}
export function parseJalali(text: string): Date | null {
  const m = toEnDigits(text)
    .trim()
    .match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  return m ? toGregorian(+m[1], +m[2], +m[3]) : null;
}
export function formatJalali(
  d: Date,
  style: 'numeric' | 'long' = 'numeric',
  digits: 'fa' | 'latin' = 'fa',
): string {
  const j = toJalali(d),
    s =
      style === 'long'
        ? `${j.day} ${JALALI_MONTHS[j.month - 1]} ${j.year}`
        : `${j.year}/${String(j.month).padStart(2, '0')}/${String(j.day).padStart(2, '0')}`;
  return digits === 'fa' ? toFaDigits(s) : s;
}
export function toISODate(d: Date): string {
  if (!Number.isFinite(d.getTime())) throw new RangeError('Invalid date');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function fromISODate(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return toISODate(d) === s ? d : null;
}
export const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const sameDay = (a: Date | null | undefined, b: Date | null | undefined): boolean =>
  !!a && !!b && toISODate(a) === toISODate(b);
export function isDateAllowed(
  d: Date,
  {
    min,
    max,
    isDateDisabled,
  }: { min?: Date; max?: Date; isDateDisabled?: (d: Date) => boolean } = {},
): boolean {
  const x = startOfDay(d).getTime();
  return (
    Number.isFinite(x) &&
    (!min || x >= startOfDay(min).getTime()) &&
    (!max || x <= startOfDay(max).getTime()) &&
    !isDateDisabled?.(d)
  );
}
export function isRangeAllowed(
  start: Date,
  end: Date,
  rules: Parameters<typeof isDateAllowed>[1] = {},
): boolean {
  if (
    startOfDay(start) > startOfDay(end) ||
    !isDateAllowed(start, rules) ||
    !isDateAllowed(end, rules)
  )
    return false;
  if (rules.isDateDisabled) {
    for (let d = startOfDay(start); d <= end; d = addDays(d, 1)) {
      if (rules.isDateDisabled(d)) return false;
    }
  }
  return true;
}
const onlyDigits = (s: string) => toEnDigits(s).replace(/\D/g, '');
export function isValidNationalId(s: string): boolean {
  const n = toEnDigits(s).replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(n) || /^(\d)\1{9}$/.test(n)) return false;
  const r = [...n.slice(0, 9)].reduce((sum, v, i) => sum + Number(v) * (10 - i), 0) % 11;
  return Number(n[9]) === (r < 2 ? r : 11 - r);
}
export function isValidCardNumber(s: string): boolean {
  const n = toEnDigits(s).replace(/[\s-]/g, '');
  return (
    /^\d{16}$/.test(n) &&
    !/^(\d)\1{15}$/.test(n) &&
    [...n].reduce((sum, v, i) => {
      let x = Number(v) * (i % 2 === 0 ? 2 : 1);
      return sum + (x > 9 ? x - 9 : x);
    }, 0) %
      10 ===
      0
  );
}
export const formatCardNumber = (s: string) =>
  onlyDigits(s)
    .slice(0, 16)
    .replace(/(.{4})(?=.)/g, '$1 ');
export function isValidIban(s: string): boolean {
  const n = toEnDigits(s).replace(/\s/g, '').toUpperCase();
  if (!/^IR\d{24}$/.test(n)) return false;
  return BigInt(n.slice(4) + '1827' + n.slice(2, 4)) % 97n === 1n;
}
export function normalizeMobile(s: string): string {
  let n = toEnDigits(s).replace(/[\s()+-]/g, '');
  if (n.startsWith('0098')) n = '0' + n.slice(4);
  else if (n.startsWith('98')) n = '0' + n.slice(2);
  else if (/^9\d{9}$/.test(n)) n = '0' + n;
  return n;
}
export const isValidMobile = (s: string) => /^09\d{9}$/.test(normalizeMobile(s));
export const isValidPostalCode = (s: string) =>
  /^[13-9]{5}\d{5}$/.test(toEnDigits(s).replace(/[\s-]/g, '')) &&
  !/^(\d)\1{9}$/.test(onlyDigits(s));
export const PROVINCES = [
  'آذربایجان شرقی',
  'آذربایجان غربی',
  'اردبیل',
  'اصفهان',
  'البرز',
  'ایلام',
  'بوشهر',
  'تهران',
  'چهارمحال و بختیاری',
  'خراسان جنوبی',
  'خراسان رضوی',
  'خراسان شمالی',
  'خوزستان',
  'زنجان',
  'سمنان',
  'سیستان و بلوچستان',
  'فارس',
  'قزوین',
  'قم',
  'کردستان',
  'کرمان',
  'کرمانشاه',
  'کهگیلویه و بویراحمد',
  'گلستان',
  'گیلان',
  'لرستان',
  'مازندران',
  'مرکزی',
  'هرمزگان',
  'همدان',
  'یزد',
] as const;
const units = [
  '',
  'یک',
  'دو',
  'سه',
  'چهار',
  'پنج',
  'شش',
  'هفت',
  'هشت',
  'نه',
  'ده',
  'یازده',
  'دوازده',
  'سیزده',
  'چهارده',
  'پانزده',
  'شانزده',
  'هفده',
  'هجده',
  'نوزده',
];
const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'],
  hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
export function numberToWords(n: number): string {
  if (!Number.isSafeInteger(n)) throw new RangeError('Expected a safe integer');
  if (n === 0) return 'صفر';
  if (n < 0) return 'منفی ' + numberToWords(-n);
  const chunk = (x: number): string =>
    [
      hundreds[Math.floor(x / 100)],
      x % 100 < 20
        ? units[x % 100]
        : [tens[Math.floor((x % 100) / 10)], units[x % 10]].filter(Boolean).join(' و '),
    ]
      .filter(Boolean)
      .join(' و ');
  const groups: string[] = [];
  let i = 0;
  while (n) {
    const x = n % 1000;
    if (x)
      groups.unshift(
        [chunk(x), ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون', 'کوادریلیون'][i]]
          .filter(Boolean)
          .join(' '),
      );
    n = Math.floor(n / 1000);
    i++;
  }
  return groups.join(' و ');
}
export function formatRelativeTime(date: Date, now = new Date(), locale = 'fa-IR'): string {
  const delta = (date.getTime() - now.getTime()) / 1000;
  for (const [s, u] of [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
    [1, 'second'],
  ] as const) {
    if (Math.abs(delta) >= s || s === 1)
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
        Math.round(delta / s),
        u,
      );
  }
  return '';
}
