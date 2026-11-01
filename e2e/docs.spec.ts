import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
test('all documentation sections load without runtime errors or page overflow', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const section of [
    'overview',
    'components',
    'commerce',
    'data',
    'forms',
    'persian',
    'blocks',
    'theme',
    'icons',
    'installation',
  ]) {
    await page.goto(`/#${section}`);
    await expect(page.locator('main h1')).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      )
      .toBe(true);
  }
  expect(errors).toEqual([]);
});
test('product actions update a shared cart with quantity and removal', async ({ page }) => {
  await page.goto('/#commerce');
  await page
    .getByRole('button', { name: 'افزودن به سبد: هدفون بی‌سیم نوا پرو', exact: true })
    .click();
  await expect(page.getByRole('button', { name: /سبد نمونه/ })).toContainText('۱');
  await page.getByRole('button', { name: /سبد نمونه/ }).click();
  const dialog = page.getByRole('dialog', { name: /سبد خرید شما/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /افزایش تعداد/ }).click();
  await expect(dialog.getByRole('spinbutton')).toHaveValue('2');
  await dialog.getByRole('button', { name: /حذف از سبد/ }).click();
  await expect(dialog.getByText('سبد خرید خالی است')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
test('dialog focus is trapped and restored to its opener', async ({ page }) => {
  await page.goto('/#components');
  const opener = page.getByRole('button', { name: 'باز کردن دیالوگ', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'ساخت پروژهٔ جدید' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'نام پروژهٔ جدید' })).toBeFocused();
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  await expect.poll(() => dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});
test('table search and row selection are interactive', async ({ page }) => {
  await page.goto('/#data');
  await page.getByRole('textbox', { name: 'جست‌وجو در جدول' }).fill('نگار');
  const table = page.getByRole('table', { name: 'آخرین سفارش‌ها' });
  await expect(table.locator('tbody tr').first()).toContainText('نگار');
  await page.getByRole('checkbox', { name: 'انتخاب ردیف‌های این صفحه' }).check();
  await expect(page.getByRole('button', { name: 'عملیات گروهی' })).toBeVisible();
  await page.getByRole('button', { name: 'مبلغ', exact: true }).click();
  await expect(table.locator('th[aria-sort=ascending]')).toContainText('مبلغ');
});
test('form validation blocks invalid submissions and exposes conditional fields', async ({
  page,
}) => {
  await page.goto('/#forms');
  await page.getByRole('button', { name: 'ذخیرهٔ اطلاعات' }).click();
  await expect(page.getByText('این فیلد الزامی است.').first()).toBeVisible();
  await page.getByRole('checkbox', { name: 'حساب حقوقی است' }).check();
  await expect(page.getByRole('textbox', { name: 'نام شرکت' })).toBeVisible();
});
test('theme and direction can change without losing navigation', async ({ page }) => {
  await page.goto('/#theme');
  await page.getByRole('button', { name: 'انتخاب رنگ #177864', exact: true }).click();
  await expect(page.locator('.pd-root').first()).toHaveCSS('--pd-brand', '#177864');
  await page.getByRole('radio', { name: 'تیره', exact: true }).check();
  await expect(page.locator('.pd-root').first()).toHaveAttribute('data-pd-theme', 'dark');
  await page.getByRole('button', { name: 'تغییر جهت صفحه' }).click();
  await expect(page.locator('.pd-root').first()).toHaveAttribute('dir', 'ltr');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
    .toBe(true);
});
for (const section of ['overview', 'commerce', 'components', 'data', 'forms', 'persian', 'blocks'])
  test(`accessibility: ${section}`, async ({ page }) => {
    await page.goto(`/#${section}`);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  });
