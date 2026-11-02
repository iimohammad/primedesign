# React, Next.js, HTML and WordPress

PrimeDesign 0.2 has two delivery paths. Use the React packages in React 18/19 and Next.js. Use `@primedesign/elements` in browser applications that need custom elements: plain HTML, a server template, Vue, Angular, Svelte or WordPress. This is a web design system; it does not supply native iOS, Android or React Native widgets.

The standalone bundle includes React/ReactDOM internally. An HTML or WordPress consumer needs no React installation, npm or build step. CSS, Vazirmatn, tokens and rendering behavior are bundled locally. The complete UMD build favors convenience over minimal download size. React applications should normally use the smaller, tree-shakable React packages instead of loading a second rendering runtime.

## Ready-to-use distributions

The repository contains these versioned files:

- `downloads/primedesign-browser-0.2.0.zip`: HTML demo, classic and ESM browser scripts, component-name catalog, product art and licenses.
- `downloads/primedesign-wordpress-0.2.0.zip`: installable plugin directory, browser runtime, Gutenberg block, shortcodes and WooCommerce adapter.

Regenerate both with `npm ci && npm run build:downloads`. For npm tarballs use `npm run pack`. The packages have not been published to public npm.

## HTML and server templates

Unzip the browser distribution and serve it over HTTP. Everything is relative to the extracted directory.

```html
<script src="./primedesign-elements.js"></script>
<pd-provider locale="fa-IR" dir="rtl" theme="light" brand="#6254df">
  <pd-button id="action" variant="outline">شروع</pd-button>
  <pd-product-card id="product"></pd-product-card>
  <pd-cart-summary></pd-cart-summary>
</pd-provider>
<script>
  document.querySelector('#product').props = {
    product: { id: '1', title: 'هدفون', price: 3490000, stock: 5 },
  };
  document.querySelector('#action').addEventListener('pd-click', (event) => {
    console.log(event.detail);
  });
</script>
```

For ESM: `import { configure, ELEMENT_NAMES } from './primedesign-elements.esm.js'`. Importing in a browser registers the tags once. Importing the bundle in Node does not touch the DOM. Registration is idempotent. All tags are listed in `components.json`; `pd-icon` uses the existing icon names. React-only providers and structural table parts are excluded. For HTML tables, use semantic `table/thead/tr/th/td` with the CSS classes, or use `pd-data-table` with serializable rows/columns.

Component names become kebab-case: `DatePicker` → `pd-date-picker`, `ProductDetail` → `pd-product-detail`, `KanbanBoard` → `pd-kanban-board`. The React API explorer documents their input shapes. Functions and React render props require `.props`; they cannot be represented in JSON attributes.

### Properties, attributes and slots

Scalar attributes use kebab-case: `full-width`, `default-value`, `on` is not a callback. Boolean empty attributes mean true; use `disabled="false"` or remove the attribute for false. Arrays/objects can be assigned as JSON attributes, but `.props` is easier for larger data. `.props = object` replaces the previous property object. The getter includes current local control values. Values assigned before a deferred script loads are recovered during upgrade.

Server templates can put escaped JSON in a direct child:

```html
<pd-product-card>
  <script type="application/json" data-pd-props>
    { "product": { "id": "1", "title": "Example", "price": 100, "stock": 2 } }
  </script>
</pd-product-card>
```

Use your template engine's JSON serializer with HTML-sensitive characters escaped (especially `<` as `\u003c`). Do not concatenate untrusted strings into HTML or scripts. JavaScript listeners belong in your application script.

Unspecified children render through a native default slot. A ReactNode prop can refer to a named HTML slot with `{ "$slot": "name" }`, for example `trigger` or `footer`. Slots preserve native DOM event handlers. They do not turn arbitrary React render-prop functions into serializable templates.

### Events and asynchronous operations

Callbacks become bubbling, composed, cancelable DOM events: `onAddToCart` → `pd-add-to-cart`, `onValueChange` → `pd-value-change`, `onSubmit` → `pd-submit`. The detail contains `component`, `callback`, normalized `args`, and `value` (the first argument). Input events expose the canonical value rather than a React synthetic event; dates use `YYYY-MM-DD`.

```js
product.addEventListener('pd-add-to-cart', (event) => {
  event.detail.skipDefault = true; // server cart replaces the local demonstration cart
  event.detail.respondWith(
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: event.detail.args[0].id, quantity: event.detail.args[1] }),
    }).then((response) => {
      if (!response.ok) throw new Error('Cart update failed');
      return response.json();
    }),
  );
});
```

Call `respondWith` synchronously while handling the event. Its promise drives the component's pending/error state. `preventDefault()` with no response cancels the default. `skipDefault` also prevents a local cart update after an asynchronous server action. An explicit `.props.onAddToCart` function takes ownership of the callback and receives original typed arguments. Optional actions such as checkout, quick view, cancel and download are shown when a callback or `actions` attribute is supplied.

`pd-ready` fires after the initial render. `pd-error` reports an isolated component render error. Callback errors are handled by components that provide asynchronous error UI; a general button callback is the host application's responsibility.

### Forms and scoped state

Named form controls participate in a surrounding native form through ElementInternals, including required validity, FormData and reset. A hidden-field fallback supplies values in browsers without form association; native custom-element constraint validation requires ElementInternals. Canonical date values use ISO local dates. Do not wrap a component that already renders a form (`pd-form`, `pd-prompt-input`, `pd-settings-panel`) inside another form.

`pd-form` maps to `SchemaForm`. Serializable validation rules include strings such as `required`, `email`, and descriptors such as `{ "type": "minLength", "args": [3] }`. `visibleWhen: { field: 'business', equals: true }` supports conditional fields. Validation is UI feedback; validate again on the server.

Each `pd-provider` owns one shared cart/wishlist/compare/theme/locale scope. Components without a provider share a document scope. Separate providers isolate data. Removing a whole provider destroys its in-memory stores; persistence belongs to your application. Native light-DOM content inside a provider receives its theme variables too. Shadow DOM isolates component styles; use documented CSS variables and slots for customization, not outside descendant CSS selectors. Custom fonts in the browser build can be configured with `font-family` and a host-provided `@font-face`.

## React and Next.js

See [INTEGRATION.md](INTEGRATION.md) and the real [Next consumer](../examples/next-app). Import CSS once in `app/layout.tsx`; put context providers in a `"use client"` file. All interactive package entry points retain named client exports. `tokens` and `persian` remain server-safe. No `ssr: false` wrapper is needed for the direct React packages.

The browser entry is for client-side rendering. If a Next project deliberately embeds custom elements, load the classic script with `next/script` after interaction and assign `.props` in a client component after the ref is ready. The direct React API gives stronger prop types, SSR integration and a smaller bundle.

## Other frameworks

The browser bundle is the supported interoperability layer; there are no separately maintained native Vue/Angular/Svelte implementations.

| Frontend                       | Integration                                                                                                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Django / Laravel / Rails / PHP | Render the HTML tags and escaped JSON; load the local browser script once.                                                                                        |
| Vue 3                          | Configure `compilerOptions.isCustomElement = tag => tag.startsWith('pd-')`; assign complex data to the element's `.props` through a ref; listen to `pd-*` events. |
| Angular                        | Add `CUSTOM_ELEMENTS_SCHEMA` to the consuming component/module; bind `[props]` or assign via `ElementRef`; handle `(pd-submit)`.                                  |
| Svelte                         | Use native custom element markup; assign `.props` via a bound element reference and native event listeners.                                                       |
| Static generator               | Copy the script, use tags in output HTML, and initialize data in an application script.                                                                           |

Use modern browsers with native dialog, Shadow DOM, custom elements, CSS logical properties and color-mix. The full browser build injects inline style elements and embeds font data; configure your site's CSP accordingly or use the React/CSS path where your build controls stylesheet delivery. Internet Explorer is not supported.

## WordPress

1. In Plugins → Add New → Upload Plugin, upload `primedesign-wordpress-0.2.0.zip` and activate it.
2. Insert the **PrimeDesign** block in Gutenberg. It lets an editor choose a component name, JSON props and sanitized child content. It is a generic configuration editor, not a visual builder for every component.
3. Or use a shortcode:

```text
[primedesign component="button" props='{"variant":"outline"}']شروع[/primedesign]
[primedesign component="input" props='{"label":"نام","name":"customer"}'][/primedesign]
[primedesign_products ids="12,34" limit="6" columns="3" layout="compact"]
```

Only registered tags are accepted. Props are recursively sanitized; inline callbacks and dangerous property names are dropped. JSON is encoded with HTML-sensitive characters escaped. Inner content passes WordPress sanitization before nested shortcodes are expanded. Bundle assets enqueue only when a component renders.

With WooCommerce active, the product shortcode reads published products, current display prices, stock, sale prices, images and links. Simple products use nonce-protected server AJAX and WooCommerce validation/cart APIs. Variable, grouped and external products navigate to their WooCommerce product page. This plugin does not implement variant selection, checkout, payments or a separate order database. Existing WooCommerce cart fragments receive a refresh event; integrations can listen for `primedesign:woocommerce-cart-updated`.

Customize defaults with the `primedesign_settings` filter. The plugin declares WordPress 6.2+ / PHP 7.4+. Automated checks parse PHP syntax at that minimum version, inspect distributions and exercise the browser adapter with a mocked WooCommerce endpoint. A live WordPress/WooCommerce installation was not available in this development environment; validate plugin activation, your theme/CSP, taxes, currency extensions and cart sessions on staging before deploying to a store.
