(function (wp) {
  var el = wp.element.createElement;
  wp.blocks.registerBlockType('primedesign/component', {
    apiVersion: 2,
    title: 'PrimeDesign',
    icon: 'screenoptions',
    category: 'design',
    attributes: {
      component: { type: 'string', default: 'button' },
      props: { type: 'string', default: '{}' },
      content: { type: 'string', default: 'PrimeDesign' },
    },
    edit: function (properties) {
      var attributes = properties.attributes,
        set = properties.setAttributes,
        valid = true;
      try {
        JSON.parse(attributes.props);
      } catch (_) {
        valid = false;
      }
      return el('div', wp.blockEditor.useBlockProps(), [
        el(
          wp.blockEditor.InspectorControls,
          { key: 'controls' },
          el(wp.components.PanelBody, { title: 'PrimeDesign' }, [
            el(wp.components.TextControl, {
              key: 'name',
              label: 'Component (for example: button, product-card, form)',
              value: attributes.component,
              onChange: function (value) {
                set({ component: value });
              },
            }),
            el(wp.components.TextareaControl, {
              key: 'props',
              label: 'JSON properties',
              value: attributes.props,
              onChange: function (value) {
                set({ props: value });
              },
              help: valid
                ? 'Properties are validated and sanitized on the server.'
                : 'Invalid JSON.',
            }),
            el(wp.components.TextareaControl, {
              key: 'content',
              label: 'Content',
              value: attributes.content,
              onChange: function (value) {
                set({ content: value });
              },
            }),
          ]),
        ),
        el(
          'div',
          {
            key: 'preview',
            style: { padding: '20px', border: '1px solid #dce2ed', borderRadius: '12px' },
          },
          [
            el('strong', { key: 'brand' }, 'PrimeDesign · ' + attributes.component),
            el(
              'p',
              { key: 'content' },
              attributes.content || 'Component content is rendered on the frontend.',
            ),
            !valid &&
              el(
                'p',
                { key: 'error', role: 'alert', style: { color: '#b42338' } },
                'Invalid JSON properties.',
              ),
          ],
        ),
      ]);
    },
    save: function () {
      return null;
    },
  });
})(window.wp);
