(function () {
  var config = window.PrimeDesignWordPress || {};
  if (window.PrimeDesign && window.PrimeDesign.configure)
    window.PrimeDesign.configure(config.settings || {});
  document.addEventListener('pd-add-to-cart', function (event) {
    var detail = event.detail;
    var product = detail && detail.args && detail.args[0];
    if (!product || !product.woocommerceType) return;
    event.preventDefault();
    detail.skipDefault = true;
    if (product.woocommerceType !== 'simple') {
      window.location.assign(product.href);
      return;
    }
    var body = new URLSearchParams({
      action: 'primedesign_add_to_cart',
      nonce: config.nonce || '',
      product_id: String(product.id),
      quantity: String(detail.args[1] || 1),
    });
    detail.respondWith(
      fetch(config.ajaxUrl, { method: 'POST', credentials: 'same-origin', body: body })
        .then(function (response) {
          return response.json();
        })
        .then(function (result) {
          if (!result.success)
            throw new Error((result.data && result.data.message) || 'Cart update failed.');
          document.dispatchEvent(
            new CustomEvent('primedesign:woocommerce-cart-updated', { detail: result.data }),
          );
          if (window.jQuery) window.jQuery(document.body).trigger('wc_fragment_refresh');
          return result.data;
        }),
    );
  });
})();
