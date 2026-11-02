<?php
/**
 * Plugin Name: PrimeDesign
 * Description: Persian-first UI components, source-independent Web Components and WooCommerce product cards.
 * Version: 0.2.0
 * Requires at least: 6.2
 * Requires PHP: 7.4
 * License: MIT
 * Text Domain: primedesign
 */
if (!defined('ABSPATH')) { exit; }
define('PRIMEDESIGN_VERSION', '0.2.0');

function primedesign_register_assets() {
    wp_register_script('primedesign-elements', plugins_url('assets/primedesign-elements.js', __FILE__), array(), PRIMEDESIGN_VERSION, true);
    wp_register_script('primedesign-frontend', plugins_url('frontend.js', __FILE__), array('primedesign-elements'), PRIMEDESIGN_VERSION, true);
    wp_register_script('primedesign-editor', plugins_url('editor.js', __FILE__), array('wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor'), PRIMEDESIGN_VERSION, true);
    register_block_type('primedesign/component', array(
        'editor_script' => 'primedesign-editor',
        'attributes' => array('component' => array('type' => 'string', 'default' => 'button'), 'props' => array('type' => 'string', 'default' => '{}'), 'content' => array('type' => 'string', 'default' => 'PrimeDesign')),
        'render_callback' => 'primedesign_render_block',
    ));
}
add_action('init', 'primedesign_register_assets');

function primedesign_enqueue() {
    wp_enqueue_script('primedesign-frontend');
    static $configured = false;
    if (!$configured) {
        $settings = array('locale' => strpos(determine_locale(), 'fa') === 0 ? 'fa-IR' : 'en-US', 'dir' => is_rtl() ? 'rtl' : 'ltr', 'defaultTheme' => 'light');
        $settings = apply_filters('primedesign_settings', $settings);
        wp_add_inline_script('primedesign-frontend', 'window.PrimeDesignWordPress=' . wp_json_encode(array('settings' => $settings, 'ajaxUrl' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('primedesign-cart'), 'cartUrl' => function_exists('wc_get_cart_url') ? wc_get_cart_url() : '')) . ';', 'before');
        $configured = true;
    }
}
function primedesign_component_names() {
    static $names = null;
    if ($names === null) {
        $path = plugin_dir_path(__FILE__) . 'assets/components.json';
        $decoded = file_exists($path) ? json_decode(file_get_contents($path), true) : array('pd-button', 'pd-product-card', 'pd-provider', 'pd-form');
        $names = is_array($decoded) ? $decoded : array();
    }
    return $names;
}
function primedesign_sanitize_props($value, $key = '', $depth = 0) {
    if ($depth > 16) { return null; }
    if (is_array($value)) {
        $result = array();
        foreach ($value as $child_key => $child) {
            if (in_array($child_key, array('__proto__', 'prototype', 'constructor', 'dangerouslySetInnerHTML'), true) || preg_match('/^on[A-Z]/', (string) $child_key)) { continue; }
            $result[$child_key] = primedesign_sanitize_props($child, (string) $child_key, $depth + 1);
        }
        return $result;
    }
    if (is_string($value)) {
        if (in_array($key, array('href', 'src', 'url', 'image'), true)) { return esc_url_raw($value, array('http', 'https')); }
        return sanitize_textarea_field($value);
    }
    return is_scalar($value) || $value === null ? $value : null;
}
function primedesign_render_component($component, $props = array(), $content = '') {
    $tag = 'pd-' . sanitize_key($component);
    if (!in_array($tag, primedesign_component_names(), true)) { return ''; }
    primedesign_enqueue();
    $json = wp_json_encode(primedesign_sanitize_props($props), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $inner = do_shortcode(wp_kses_post($content));
    return '<' . $tag . '><script type="application/json" data-pd-props>' . $json . '</script>' . $inner . '</' . $tag . '>';
}
function primedesign_shortcode($attributes, $content = '') {
    $attributes = shortcode_atts(array('component' => 'button', 'props' => '{}'), $attributes, 'primedesign');
    $props = json_decode(html_entity_decode($attributes['props'], ENT_QUOTES, 'UTF-8'), true);
    if (!is_array($props)) { return ''; }
    return primedesign_render_component($attributes['component'], $props, $content);
}
add_shortcode('primedesign', 'primedesign_shortcode');
function primedesign_render_block($attributes) {
    $props = json_decode(isset($attributes['props']) ? $attributes['props'] : '{}', true);
    if (!is_array($props)) { return ''; }
    return primedesign_render_component(isset($attributes['component']) ? $attributes['component'] : 'button', $props, isset($attributes['content']) ? $attributes['content'] : '');
}

function primedesign_woocommerce_products($attributes) {
    if (!function_exists('wc_get_products')) { return ''; }
    $attributes = shortcode_atts(array('ids' => '', 'limit' => 6, 'columns' => 3, 'layout' => 'default'), $attributes, 'primedesign_products');
    $args = array('status' => 'publish', 'limit' => min(48, max(1, absint($attributes['limit']))), 'orderby' => 'date', 'order' => 'DESC');
    if ($attributes['ids']) { $args['include'] = array_filter(array_map('absint', explode(',', $attributes['ids']))); }
    $columns = min(4, max(1, absint($attributes['columns'])));
    $currency = get_woocommerce_currency();
    $output = '<div class="primedesign-woocommerce-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,max(240px,calc((100% - ' . (($columns - 1) * 20) . 'px) / ' . $columns . '))),1fr));gap:20px">';
    foreach (wc_get_products($args) as $product) {
        $price = (float) wc_get_price_to_display($product);
        $props = array('product' => array(
            'id' => (string) $product->get_id(), 'title' => $product->get_name(), 'price' => $price,
            'currency' => $currency,
            'stock' => $product->is_in_stock() ? ($product->managing_stock() ? max(0, (int) $product->get_stock_quantity()) : 99) : 0,
            'href' => get_permalink($product->get_id()), 'image' => wp_get_attachment_image_url($product->get_image_id(), 'woocommerce_thumbnail') ?: '',
            'rating' => (float) $product->get_average_rating(), 'reviewCount' => $product->get_review_count(),
            'woocommerceType' => $product->get_type(),
        ), 'layout' => in_array($attributes['layout'], array('default', 'compact', 'horizontal', 'minimal', 'featured'), true) ? $attributes['layout'] : 'default');
        if ($product->is_on_sale()) { $props['product']['originalPrice'] = (float) wc_get_price_to_display($product, array('price' => $product->get_regular_price())); }
        $output .= primedesign_render_component('product-card', $props);
    }
    return $output . '</div>';
}
add_shortcode('primedesign_products', 'primedesign_woocommerce_products');
function primedesign_add_to_cart() {
    check_ajax_referer('primedesign-cart', 'nonce');
    if (!function_exists('WC')) { wp_send_json_error(array('message' => 'WooCommerce is unavailable.'), 400); }
    if ((isset($_POST['product_id']) && !is_scalar($_POST['product_id'])) || (isset($_POST['quantity']) && !is_scalar($_POST['quantity']))) { wp_send_json_error(array('message' => 'Invalid cart request.'), 400); }
    $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;
    $quantity = isset($_POST['quantity']) ? min(99, max(1, absint($_POST['quantity']))) : 1;
    $product = wc_get_product($product_id);
    if (!$product || !$product->is_type('simple') || !$product->is_purchasable() || !$product->is_in_stock()) { wp_send_json_error(array('message' => 'This product cannot be added to the cart.'), 400); }
    if (null === WC()->cart && function_exists('wc_load_cart')) { wc_load_cart(); }
    $allowed = apply_filters('woocommerce_add_to_cart_validation', true, $product_id, $quantity);
    $key = $allowed ? WC()->cart->add_to_cart($product_id, $quantity) : false;
    if (!$key) { wp_send_json_error(array('message' => 'The cart could not be updated. Check product inventory.'), 400); }
    wp_send_json_success(array('count' => WC()->cart->get_cart_contents_count(), 'cartUrl' => wc_get_cart_url()));
}
add_action('wp_ajax_primedesign_add_to_cart', 'primedesign_add_to_cart');
add_action('wp_ajax_nopriv_primedesign_add_to_cart', 'primedesign_add_to_cart');
