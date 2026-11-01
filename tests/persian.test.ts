import * as P from '@primedesign/persian';
import { brandScale, contrastRatio, createTheme, semanticTokens } from '@primedesign/tokens';
import { describe, expect, it } from 'vitest';
describe('Persian normalization', () => {
  it('rejects letters mixed into checksum identifiers', () => {
    expect(P.isValidNationalId('abc0013542419')).toBe(false);
    expect(P.isValidCardNumber('abc4111111111111111')).toBe(false);
    expect(P.isValidPostalCode('abc1313579246')).toBe(false);
  });
  it.each([
    ['۱۲۳۴۵', '12345'],
    ['١٢٣٤٥', '12345'],
    ['+۹۸ ۹۱۲', '+98 912'],
  ])('normalizes %s', (input, output) => expect(P.toEnDigits(input)).toBe(output));
  it('normalizes Arabic letters and diacritics for search', () => {
    expect(P.normalizePersian('  كاربري   فارسي ')).toBe('کاربری فارسی');
    expect(P.searchText('سی‌ و سه-پل')).toBe(P.searchText('سی و سه پل'));
  });
  it('formats money and words', () => {
    expect(P.formatMoney(1250000)).toContain('تومان');
    expect(P.numberToWords(1250000)).toBe('یک میلیون و دویست و پنجاه هزار');
    expect(P.numberToWords(-23)).toBe('منفی بیست و سه');
    expect(P.numberToWords(0)).toBe('صفر');
    expect(() => P.numberToWords(NaN)).toThrow();
  });
  it.each(['09123456789', '+98 912 345 6789', '00989123456789', '9123456789', '۰۹۱۲۳۴۵۶۷۸۹'])(
    'accepts mobile %s',
    (value) => expect(P.isValidMobile(value)).toBe(true),
  );
  it.each(['1234', '08123456789', '091234567890', '0912abc5678'])('rejects mobile %s', (value) =>
    expect(P.isValidMobile(value)).toBe(false),
  );
  it('validates national ID checksum and rejects repeated digits', () => {
    expect(P.isValidNationalId('0013542419')).toBe(true);
    expect(P.isValidNationalId('0013542418')).toBe(false);
    expect(P.isValidNationalId('1111111111')).toBe(false);
  });
  it('validates card checksum and grouping', () => {
    expect(P.isValidCardNumber('4111 1111 1111 1111')).toBe(true);
    expect(P.isValidCardNumber('4111111111111112')).toBe(false);
    expect(P.isValidCardNumber('0000000000000000')).toBe(false);
    expect(P.formatCardNumber('۶۰۳۷۹۹۱۲۳۴')).toBe('6037 9912 34');
  });
  it('checks IBAN modulo 97', () => {
    const bban = '0170000000123456789001',
      check = 98n - (BigInt(bban + '182700') % 97n),
      iban = 'IR' + String(check).padStart(2, '0') + bban;
    expect(P.isValidIban(iban)).toBe(true);
    expect(P.isValidIban(iban.slice(0, -1) + '9')).toBe(false);
  });
  it('includes all provinces', () => expect(new Set(P.PROVINCES).size).toBe(31));
});
describe('Jalali dates and date restrictions', () => {
  it.each([
    [1403, 1, 1, '2024-03-20'],
    [1403, 12, 30, '2025-03-20'],
    [1404, 1, 1, '2025-03-21'],
    [1405, 8, 10, '2026-11-01'],
  ] as const)('converts %i/%i/%i', (y, m, d, iso) => {
    const date = P.toGregorian(y, m, d)!;
    expect(P.toISODate(date)).toBe(iso);
    expect(P.toJalali(date)).toEqual({ year: y, month: m, day: d });
  });
  it('round trips sampled days across the supported range using Intl', () => {
    for (let year = 1200; year <= 1600; year += 5) {
      for (let month = 1; month <= 12; month++) {
        const date = P.toGregorian(year, month, 15)!;
        expect(P.toJalali(date)).toEqual({ year, month, day: 15 });
      }
    }
  });
  it.each(['۱۴۰۴/۱۲/۳۰', '1405/13/01', '1405/07/31', '1199/01/01', '1601/01/01', 'nonsense'])(
    'rejects invalid date %s',
    (value) => expect(P.parseJalali(value)).toBeNull(),
  );
  it('parses Persian digits and preserves local calendar day', () => {
    const d = P.parseJalali('۱۴۰۵/۰۸/۱۰')!;
    expect(P.formatJalali(d)).toBe('۱۴۰۵/۰۸/۱۰');
    expect(P.fromISODate('2026-02-30')).toBeNull();
    expect(P.toISODate(d)).toBe('2026-11-01');
  });
  it('normalizes min/max times to date-only comparisons', () => {
    const d = new Date(2026, 10, 1);
    expect(P.isDateAllowed(d, { min: new Date(2026, 10, 1, 18) })).toBe(true);
    expect(P.isDateAllowed(d, { max: new Date(2026, 9, 31, 23) })).toBe(false);
  });
  it('rejects ranges crossing a disabled date', () => {
    const start = new Date(2026, 10, 1),
      end = new Date(2026, 10, 5);
    expect(P.isRangeAllowed(start, end, { isDateDisabled: (d) => d.getDate() === 3 })).toBe(false);
    expect(P.isRangeAllowed(end, start)).toBe(false);
    expect(P.isRangeAllowed(start, end)).toBe(true);
  });
});
describe('theme generation', () => {
  it('generates isolated theme variables', () => {
    const css = createTheme({
      brand: '#ffcc00',
      selector: '.store',
      radius: 0,
      density: 'compact',
    });
    expect(css).toContain('.store');
    expect(css).toContain('--pd-radius: 0px');
    expect(css).toContain('--pd-on-brand: #101725');
    expect(Object.keys(brandScale('#6254df'))).toHaveLength(11);
  });
  it.each([
    { brand: 'red' },
    { brand: '#fff' },
    { selector: 'body{display:none}' },
    { fontFamily: 'x; color:red' },
    { radius: -1 },
    { radius: Infinity },
  ])('rejects invalid theme %j', (options) => expect(() => createTheme(options)).toThrow());
  it('checks default semantic text and input contrast', () => {
    for (const t of Object.values(semanticTokens)) {
      expect(contrastRatio(t.text, t.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.secondary, t.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.inputBorder, t.surface)).toBeGreaterThanOrEqual(3);
    }
  });
});
