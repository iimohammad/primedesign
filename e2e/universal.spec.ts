import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
const url = '/standalone/index.html';
test('HTML components share cart state and report asynchronous failures', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url);
  const product = page.locator('#product'),
    summary = page.locator('#summary');
  await expect(product.getByRole('heading', { name: 'هدفون نوا پرو' })).toBeVisible();
  await expect(summary.locator('.pd-summary-total')).toContainText('۰ تومان');
  await page.evaluate(() =>
    document.querySelector('#product')!.addEventListener(
      'pd-add-to-cart',
      (event) => {
        (event as CustomEvent).detail.respondWith(
          Promise.reject(new Error('Inventory service unavailable')),
        );
      },
      { once: true },
    ),
  );
  await product.getByRole('button', { name: 'افزودن به سبد: هدفون نوا پرو' }).click();
  await expect(product.getByRole('alert')).toHaveText('Inventory service unavailable');
  await expect(summary.locator('.pd-summary-total')).toContainText('۰ تومان');
  await product.getByRole('button', { name: 'افزودن به سبد: هدفون نوا پرو' }).click();
  await expect(summary.locator('.pd-summary-total')).toContainText('۳٬۴۹۰٬۰۰۰');
  await expect(page.locator('#events')).toContainText('pd-add-to-cart');
  expect(errors).toEqual([]);
});
test('HTML fields participate in native required validation, FormData and reset', async ({
  page,
}) => {
  await page.goto(url);
  const form = page.locator('#native-form'),
    input = form.getByRole('textbox', { name: 'نام شما' });
  await form.getByRole('button', { name: 'ثبت فرم' }).click();
  await expect(page.locator('#form-result')).toHaveText('');
  await expect.poll(() => form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(false);
  await input.fill('مینا');
  await page
    .locator('pd-input[name=customer]')
    .evaluate((el) => el.classList.add('customer-field'));
  await expect(input).toHaveValue('مینا');
  await form.getByRole('button', { name: 'ثبت فرم' }).click();
  await expect(page.locator('#form-result')).toContainText('مینا');
  expect(await form.evaluate((el: HTMLFormElement) => new FormData(el).get('customer'))).toBe(
    'مینا',
  );
  await form.evaluate((el: HTMLFormElement) => el.reset());
  await expect(input).toHaveValue('');
});
test('slotted modal focus is trapped and returns to the custom element opener', async ({
  page,
}) => {
  await page.goto(url);
  const opener = page.locator('#open-dialog').getByRole('button');
  await opener.click();
  const dialog = page.locator('#dialog').getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#dialog input')).toBeFocused();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => {
        let a: Element | null = document.activeElement;
        while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
        return (
          !!a &&
          (a.closest('pd-dialog')?.id === 'dialog' ||
            a.getRootNode() == document.querySelector('#dialog')!.shadowRoot)
        );
      }),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});
test('HTML tabs, schema rules, date popovers and scoped themes retain their behavior', async ({
  page,
}) => {
  await page.goto(url);
  await page.locator('#tabs').getByRole('tab', { name: 'جزئیات' }).click();
  await expect(page.locator('#tabs').getByRole('tabpanel')).toHaveText('محتوای تب دوم');
  await page
    .locator('#context')
    .getByText('راست‌کلیک یا Shift+F10', { exact: true })
    .click({ button: 'right' });
  await expect(page.locator('#context').getByRole('menu')).toBeVisible();
  await page.locator('#context').getByRole('menuitem', { name: 'کپی' }).click();
  await expect(page.locator('#events')).toHaveText('کپی انتخاب شد');
  await page.locator('#schema').getByRole('button', { name: 'ذخیرهٔ Schema' }).click();
  await expect(page.locator('#schema').getByText('این فیلد الزامی است.').first()).toBeVisible();
  await page.locator('#schema').getByRole('textbox', { name: 'نام در فرم Schema' }).fill('Mina');
  await page.locator('#schema').getByRole('textbox', { name: 'ایمیل' }).fill('mina@example.com');
  await page.locator('#schema').getByRole('button', { name: 'ذخیرهٔ Schema' }).click();
  await expect(page.locator('#events')).toContainText('mina@example.com');
  const date = page.locator('pd-date-picker');
  await date.getByRole('button', { name: 'انتخاب تاریخ' }).click();
  await expect(date.getByRole('grid')).toBeVisible();
  await date.getByRole('grid').getByRole('button').first().click();
  await expect
    .poll(() =>
      page.locator('#native-form').evaluate((el: HTMLFormElement) => new FormData(el).get('date')),
    )
    .toMatch(/^\d{4}-\d{2}-\d{2}$/);
  await page.locator('#theme-button').getByRole('button').click();
  await expect(page.locator('#product .pd-root')).toHaveAttribute('data-pd-theme', 'dark');
  await expect(page.locator('#scope')).toHaveAttribute('data-pd-theme', 'dark');
});
test('properties set before definition survive element upgrade and detached elements reconnect', async ({
  page,
}) => {
  await page.goto('/');
  await page.setContent('<pd-provider id="p"><pd-input id="field"></pd-input></pd-provider>');
  await page.evaluate(() => {
    (document.querySelector('#field') as any).props = {
      label: 'Predefined value',
      value: 'Saved',
      name: 'saved',
    };
    (document.querySelector('#p') as any).props = { locale: 'en-US', brand: '#177864' };
  });
  await page.addScriptTag({ url: 'http://127.0.0.1:4173/standalone/primedesign-elements.js' });
  await expect(page.getByRole('textbox', { name: 'Predefined value' })).toHaveValue('Saved');
  await expect(page.locator('#field .pd-root')).toHaveAttribute('dir', 'ltr');
  await page.evaluate(async () => {
    const field = document.querySelector('#field')!;
    field.remove();
    await new Promise((resolve) => setTimeout(resolve, 10));
    document.querySelector('#p')!.append(field);
  });
  await expect(page.getByRole('textbox', { name: 'Predefined value' })).toHaveValue('Saved');
  await page.evaluate(async () => {
    const provider = document.querySelector('#p')!;
    provider.remove();
    await new Promise((resolve) => setTimeout(resolve, 10));
    document.body.append(provider);
  });
  await expect(page.getByRole('textbox', { name: 'Predefined value' })).toHaveValue('Saved');
});
test('WordPress adapter uses authenticated WooCommerce AJAX and keeps server cart authoritative', async ({
  page,
}) => {
  await page.goto(url);
  let request = '';
  await page.route('**/wp-admin/admin-ajax.php', async (route) => {
    request = route.request().postData() ?? '';
    await route.fulfill({ json: { success: true, data: { count: 2, cartUrl: '/cart/' } } });
  });
  await page.evaluate(() => {
    (window as any).PrimeDesignWordPress = {
      settings: { locale: 'fa-IR' },
      nonce: 'test-nonce',
      ajaxUrl: '/wp-admin/admin-ajax.php',
    };
    const host = document.querySelector('#product') as any;
    host.props = {
      ...host.props,
      product: { ...host.props.product, id: '42', woocommerceType: 'simple' },
    };
    document.addEventListener(
      'primedesign:woocommerce-cart-updated',
      (e) => (document.body.dataset.wooCount = String((e as CustomEvent).detail.count)),
    );
  });
  await page.addScriptTag({ path: resolve('integrations/wordpress/primedesign/frontend.js') });
  await page
    .locator('#product')
    .getByRole('button', { name: 'افزودن به سبد: هدفون نوا پرو' })
    .click();
  await expect(page.locator('body')).toHaveAttribute('data-woo-count', '2');
  expect(new URLSearchParams(request).get('nonce')).toBe('test-nonce');
  expect(new URLSearchParams(request).get('product_id')).toBe('42');
  await expect(page.locator('#summary .pd-summary-total')).toContainText('۰ تومان');
});
for (const section of ['advanced', 'ai', 'registry', 'coverage'])
  test(`accessibility: ${section}`, async ({ page }) => {
    await page.goto('/#' + section);
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

test('server-rendered provider JSON configures nested component scopes', async ({ page }) => {
  await page.goto('/');
  await page.setContent(
    '<pd-provider id="wordpress-scope"><script type="application/json" data-pd-props>{"locale":"en-US","theme":"dark","brand":"#177864"}</script><pd-button>Server button</pd-button></pd-provider>',
  );
  await page.addScriptTag({ url: 'http://127.0.0.1:4173/standalone/primedesign-elements.js' });
  await expect(page.getByRole('button', { name: 'Server button' })).toBeVisible();
  await expect(page.locator('pd-button .pd-root')).toHaveAttribute('data-pd-theme', 'dark');
  await expect(page.locator('pd-button .pd-root')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('pd-button .pd-root')).toHaveCSS('--pd-brand', '#177864');
});
