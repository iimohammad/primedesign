=== PrimeDesign ===
Contributors: iimohammad
Tags: design-system, rtl, woocommerce, components
Requires at least: 6.2
Requires PHP: 7.4
Stable tag: 0.2.0
License: MIT

== Description ==
Use PrimeDesign Web Components in WordPress without installing a React application.
Includes a dynamic Gutenberg block and shortcodes. The bundled rendering runtime is self-contained.

== Installation ==
Build the plugin ZIP with npm run wordpress:build after npm run build. Upload the generated ZIP in WordPress Plugins > Add New > Upload Plugin, then activate.

== Usage ==
[primedesign component="button" props='{"variant":"solid"}']ثبت سفارش[/primedesign]
[primedesign component="input" props='{"label":"نام شما","name":"name","required":true}']
[primedesign component="provider" props='{"brand":"#177864","locale":"fa-IR"}']...[/primedesign]
[primedesign_products limit="6" columns="3" layout="default"]

The WooCommerce shortcode requires WooCommerce and renders real published products. Simple products can be added through WooCommerce cart validation. Variable/grouped/external products navigate to the product page for their options. Checkout, taxes and inventory remain controlled by WooCommerce.

All other components are presentation UI with pd-* events for application integration. Do not put passwords, tokens or private server data in shortcode JSON. The plugin does not connect to an AI provider.
