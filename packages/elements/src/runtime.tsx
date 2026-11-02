import React, {
  Component,
  createElement,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { createPortal, flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import * as UI from '@primedesign/react';
import * as Commerce from '@primedesign/commerce';
import * as Data from '@primedesign/data';
import * as Forms from '@primedesign/forms';
import * as Blocks from '@primedesign/blocks';
import * as AI from '@primedesign/ai';
import * as Icons from '@primedesign/icons';
import { brandScale, contrastRatio } from '@primedesign/tokens';
import { fromISODate, toISODate } from '@primedesign/persian';
import css from '../../css/dist/primedesign.css?inline';
import { contracts } from './contracts.js';

export type ElementProps = Record<string, unknown>;
export interface PrimeEventDetail {
  component: string;
  callback: string;
  args: unknown[];
  value: unknown;
  respondWith: (promise: Promise<unknown>) => void;
  skipDefault?: boolean;
}
interface Definition {
  name: string;
  component: ComponentType<any>;
}
const kebab = (name: string) =>
  name
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
const excluded = new Set([
  'PrimeProvider',
  'ToastProvider',
  'CartProvider',
  'WishlistProvider',
  'CompareProvider',
  'Form',
  'FormField',
  'DirectionProvider',
  'Table',
  'TableHeader',
  'TableBody',
  'TableRow',
  'TableHead',
  'TableCell',
  'TableCaption',
]);
const definitions: Record<string, Definition> = {};
for (const module of [UI, Commerce, Data, Forms, Blocks, AI, Icons])
  for (const [name, component] of Object.entries(module)) {
    if (
      !/^[A-Z]/.test(name) ||
      excluded.has(name) ||
      !(
        typeof component === 'function' ||
        (typeof component === 'object' && component && '$$typeof' in component)
      )
    )
      continue;
    const tag = 'pd-' + kebab(name);
    if (!definitions[tag]) definitions[tag] = { name, component: component as ComponentType<any> };
  }
// The HTML form uses a serializable schema; React render-prop helpers stay in the React package.
definitions['pd-form'] = { name: 'SchemaForm', component: Forms.SchemaForm as ComponentType<any> };
export const ELEMENT_NAMES = Object.freeze(['pd-provider', ...Object.keys(definitions).sort()]);
const ElementBase = (
  typeof HTMLElement === 'undefined' ? class {} : HTMLElement
) as typeof HTMLElement;
const coordinators = new WeakMap<object, Coordinator>();
const activeCoordinators = new Set<Coordinator>();
let defaultSettings: Partial<UI.PrimeProviderProps> = {};
export function configure(settings: Partial<UI.PrimeProviderProps>) {
  defaultSettings = { ...defaultSettings, ...settings };
  for (const coordinator of activeCoordinators) coordinator.render();
}
const installedStyles = new WeakSet<Document>();
function installStyles(document: Document) {
  if (installedStyles.has(document)) return;
  const style = document.createElement('style');
  style.dataset.primedesign = '';
  style.textContent = css;
  document.head.append(style);
  installedStyles.add(document);
}
function parseValue(value: string): unknown {
  if (value === '') return true;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {}
  }
  return value;
}
function attributes(element: HTMLElement): ElementProps {
  const result: ElementProps = {};
  for (const attribute of element.attributes) {
    if (
      ['id', 'class', 'style', 'slot', 'data-pd-theme'].includes(attribute.name) ||
      attribute.name.startsWith('aria-') ||
      attribute.name.startsWith('data-')
    )
      continue;
    result[attribute.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = parseValue(
      attribute.value,
    );
  }
  return result;
}
function providerSettings(element?: HTMLElement): Partial<UI.PrimeProviderProps> {
  const p = element
    ? { ...defaultSettings, ...attributes(element), ...(element as PrimeProviderElement).props }
    : { ...defaultSettings };
  if (typeof p.theme !== 'string' && typeof p.defaultTheme !== 'string') p.defaultTheme = 'light';
  if (p.brand !== undefined && !/^#[a-f\d]{6}$/i.test(String(p.brand))) delete p.brand;
  if (p.theme !== undefined && !['light', 'dark', 'system'].includes(String(p.theme)))
    delete p.theme;
  if (p.defaultTheme !== undefined && !['light', 'dark', 'system'].includes(String(p.defaultTheme)))
    delete p.defaultTheme;
  if (
    p.radius !== undefined &&
    (!Number.isFinite(Number(p.radius)) || Number(p.radius) < 0 || Number(p.radius) > 40)
  )
    delete p.radius;
  if (p.dir !== undefined && !['rtl', 'ltr'].includes(String(p.dir))) delete p.dir;
  return p as Partial<UI.PrimeProviderProps>;
}
function reactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reactValue);
  if (
    value &&
    typeof value === 'object' &&
    !(value instanceof Date) &&
    !(typeof File !== 'undefined' && value instanceof File)
  ) {
    if ('$slot' in value)
      return createElement('slot', { name: String((value as { $slot: unknown }).$slot) });
    if (React.isValidElement(value)) return value;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, reactValue(v)]));
  }
  return value;
}
function normalizeProps(name: string, props: ElementProps): ElementProps {
  const next = { ...props };
  if (
    [
      'DatePicker',
      'Calendar',
      'MonthPicker',
      'DateRangePicker',
      'Countdown',
      'RelativeTime',
    ].includes(name)
  ) {
    for (const key of ['min', 'max', 'value', 'defaultValue', 'defaultMonth', 'date', 'until']) {
      if (typeof next[key] === 'string')
        next[key] = fromISODate(next[key] as string) ?? new Date(next[key] as string);
    }
    if (name === 'DateRangePicker' && next.value && typeof next.value === 'object') {
      const range = next.value as { start: unknown; end: unknown };
      next.value = {
        start: typeof range.start === 'string' ? fromISODate(range.start) : range.start,
        end: typeof range.end === 'string' ? fromISODate(range.end) : range.end,
      };
    }
  }
  if (['SchemaForm'].includes(name) && Array.isArray(next.fields)) {
    next.fields = next.fields.map((field: any) => ({
      ...field,
      rules: Array.isArray(field.rules)
        ? field.rules
            .map((rule: unknown) =>
              typeof rule === 'string' && rule in Forms.validators
                ? (Forms.validators as any)[rule]()
                : typeof rule === 'object' && rule && 'type' in rule
                  ? (Forms.validators as any)[String((rule as any).type)]?.(
                      ...((rule as any).args ?? []),
                    )
                  : rule,
            )
            .filter((rule: unknown) => typeof rule === 'function')
        : [],
      visible: field.visibleWhen
        ? (values: ElementProps) =>
            Forms.getFieldValue(values, field.visibleWhen.field) === field.visibleWhen.equals
        : field.visible,
    }));
  }
  return reactValue(next) as ElementProps;
}
const commonCallbacks = [
  'onClick',
  'onChange',
  'onValueChange',
  'onOpenChange',
  'onPressedChange',
  'onCollapsedChange',
  'onSelectedChange',
  'onPageChange',
  'onStateChange',
  'onSubmit',
  'onSend',
  'onStop',
  'onModelChange',
  'onComplete',
  'onSelect',
  'onSearchChange',
  'onClear',
  'onClose',
  'onConfirm',
  'onApprove',
  'onReject',
  'onRestore',
  'onCancel',
  'onRetry',
  'onRemove',
  'onDownload',
  'onCheckout',
  'onApply',
  'onItemsChange',
  'onFilesChange',
  'onFeedback',
  'onRegenerate',
  'onLayoutChange',
  'onQuantityChange',
  'onAddToCart',
  'onWishlistChange',
  'onCompareChange',
  'onQuickView',
  'onAddBundle',
  'onMove',
  'onRoleChange',
  'onInvite',
  'onSave',
];
function serialValue(value: unknown): unknown {
  if (value instanceof Date) return toISODate(value);
  if (value && typeof value === 'object' && 'target' in value) {
    const target = (value as any).target;
    return target?.type === 'checkbox' ? target.checked : target?.value;
  }
  return value;
}
class Boundary extends Component<
  { host: PrimeElement; children: ReactNode; version: number },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  componentDidCatch(error: Error) {
    this.props.host.dispatchEvent(
      new CustomEvent('pd-error', {
        detail: { message: error.message },
        bubbles: true,
        composed: true,
      }),
    );
  }
  componentDidUpdate(previous: Readonly<{ version: number }>) {
    if (previous.version !== this.props.version && this.state.error) this.setState({ error: null });
  }
  render() {
    return this.state.error ? (
      <div role="alert" className="pd-error">
        {this.state.error}
      </div>
    ) : (
      this.props.children
    );
  }
}
function Widget({ host, definition }: { host: PrimeElement; definition: Definition }) {
  const prime = UI.usePrime(),
    cart = Commerce.useCart(),
    wishlist = Commerce.useWishlist(),
    compare = Commerce.useCompare(),
    props = normalizeProps(definition.name, host.readProps()),
    originalProps = { ...props };
  const call = (callback: string, args: unknown[]) => {
    const original = originalProps[callback],
      normalized = args.map(serialValue);
    let response: Promise<unknown> | undefined;
    const detail: PrimeEventDetail = {
      component: definition.name,
      callback,
      args: normalized,
      value: normalized[0],
      respondWith: (promise) => {
        response = Promise.resolve(promise);
      },
    };
    const event = new CustomEvent('pd-' + kebab(callback.slice(2)), {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    host.dispatchEvent(event);
    if (typeof original === 'function') return original(...args);
    const defaultAction = () => {
      if (detail.skipDefault || (event.defaultPrevented && !response)) return;
      const field = (
        {
          onValueChange: 'value',
          onChange: 'value',
          onOpenChange: 'open',
          onPressedChange: 'pressed',
          onCollapsedChange: 'collapsed',
          onSelectedChange: 'selected',
          onPageChange: 'page',
          onStateChange: 'state',
          onModelChange: 'model',
        } as Record<string, string>
      )[callback];
      if (field)
        host.updateValue(
          callback === 'onChange' &&
            args[0] &&
            typeof args[0] === 'object' &&
            (args[0] as any).target?.type === 'checkbox'
            ? 'checked'
            : field,
          normalized[0],
        );
      if (callback === 'onClick' && definition.name === 'Button' && props.type === 'submit')
        host.closest('form')?.requestSubmit();
      if (callback === 'onClick' && definition.name === 'Button' && props.type === 'reset')
        host.closest('form')?.reset();
      if (callback === 'onAddToCart')
        cart.add(
          args[0] as Commerce.Product,
          args[1] as number,
          args[2] as Commerce.ProductVariant | undefined,
        );
      if (callback === 'onWishlistChange') wishlist.toggle((args[0] as Commerce.Product).id);
      if (callback === 'onCompareChange') compare.toggle((args[0] as Commerce.Product).id);
    };
    if (response)
      return response.then((result) => {
        defaultAction();
        return result;
      });
    return defaultAction();
  };
  for (const callback of commonCallbacks) {
    if (
      [
        'onDownload',
        'onRemove',
        'onApply',
        'onCheckout',
        'onCancel',
        'onRetry',
        'onStop',
        'onRegenerate',
        'onApprove',
        'onReject',
        'onConfirm',
        'onRestore',
        'onQuickView',
      ].includes(callback) &&
      !props[callback] &&
      !host.hasAttribute('actions')
    )
      continue;
    props[callback] = (...args: unknown[]) => call(callback, args);
  }
  if (definition.name === 'ProductCard') {
    const product = props.product as Commerce.Product | undefined;
    if (product) {
      props.wishlisted = wishlist.has(product.id);
      props.compared = compare.ids.includes(product.id);
    }
  }
  if (definition.name === 'DataTable' && !props.getRowId)
    props.getRowId = (row: Record<string, unknown>) => String(row.id);
  if (definition.name === 'CartSummary' || definition.name === 'CartLineItem') {
    if (definition.name === 'CartSummary' && !props.items) props.items = cart.items;
  }
  if (props.children === undefined && contracts[definition.name]?.slot)
    props.children = createElement('slot');
  const complete = !(contracts[definition.name]?.required ?? []).some(
    (key) => props[key] === undefined,
  );
  const style = {
    '--pd-brand': prime.brand,
    '--pd-on-brand':
      contrastRatio(prime.brand, '#ffffff') >= contrastRatio(prime.brand, '#101725')
        ? '#ffffff'
        : '#101725',
    '--pd-radius': `${prime.radius}px`,
    '--pd-font': prime.fontFamily,
    ...Object.fromEntries(
      Object.entries(brandScale(prime.brand)).map(([key, value]) => ['--pd-brand-' + key, value]),
    ),
  } as React.CSSProperties;
  useEffect(() => {
    if (!complete) return;
    host.syncFormValue();
    if (!host.ready) {
      host.ready = true;
      host.dispatchEvent(
        new CustomEvent('pd-ready', {
          detail: { component: definition.name },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }, [host, host.version]);
  if (!complete) return null;
  return (
    <div
      className="pd-root"
      dir={prime.dir}
      lang={prime.locale}
      data-pd-theme={prime.resolvedTheme}
      data-pd-density={prime.density}
      style={style}
    >
      {createElement(definition.component, props)}
    </div>
  );
}
function NativeScope({ owner }: { owner?: HTMLElement }) {
  const prime = UI.usePrime();
  useEffect(() => {
    if (!owner) return;
    owner.dataset.pdTheme = prime.resolvedTheme;
    owner.style.direction = prime.dir;
    owner.style.setProperty('--pd-brand', prime.brand);
    owner.style.setProperty('--pd-radius', prime.radius + 'px');
    owner.style.setProperty('--pd-font', prime.fontFamily);
    owner.style.setProperty(
      '--pd-on-brand',
      contrastRatio(prime.brand, '#ffffff') >= contrastRatio(prime.brand, '#101725')
        ? '#ffffff'
        : '#101725',
    );
    for (const [key, value] of Object.entries(brandScale(prime.brand)))
      owner.style.setProperty('--pd-brand-' + key, value);
  }, [owner, prime]);
  return null;
}
function Runtime({
  entries,
  settings,
  owner,
}: {
  entries: PrimeElement[];
  settings: Partial<UI.PrimeProviderProps>;
  owner?: HTMLElement;
}) {
  return (
    <UI.PrimeProvider {...settings}>
      <NativeScope owner={owner} />
      <UI.ToastProvider>
        <Commerce.CartProvider>
          <Commerce.WishlistProvider>
            <Commerce.CompareProvider>
              {entries.map((host) => {
                const definition = definitions[host.localName];
                return createPortal(
                  <Boundary host={host} version={host.version}>
                    <Widget host={host} definition={definition} />
                  </Boundary>,
                  host.mount!,
                  host.uid,
                );
              })}
            </Commerce.CompareProvider>
          </Commerce.WishlistProvider>
        </Commerce.CartProvider>
      </UI.ToastProvider>
    </UI.PrimeProvider>
  );
}
let nextId = 0;
class Coordinator {
  disposed = false;
  entries = new Set<PrimeElement>();
  root: Root;
  container: HTMLDivElement;
  owner?: PrimeProviderElement;
  constructor(document: Document, owner?: PrimeProviderElement) {
    installStyles(document);
    this.owner = owner;
    this.container = document.createElement('div');
    this.container.dataset.pdRuntime = '';
    this.container.style.display = 'contents';
    (owner ?? document.body).append(this.container);
    this.root = createRoot(this.container);
    activeCoordinators.add(this);
  }
  render() {
    if (this.disposed) return;
    this.root.render(
      <Runtime
        entries={[...this.entries]}
        settings={providerSettings(this.owner)}
        owner={this.owner}
      />,
    );
  }
  add(host: PrimeElement) {
    this.entries.add(host);
    this.render();
  }
  remove(host: PrimeElement) {
    this.entries.delete(host);
    this.render();
  }
  dispose() {
    this.disposed = true;
    this.root.unmount();
    this.container.remove();
    activeCoordinators.delete(this);
  }
}
export class PrimeProviderElement extends ElementBase {
  private value: ElementProps = {};
  private observer?: MutationObserver;
  get props() {
    let inline: ElementProps = {};
    const script = Array.from(this.children ?? []).find((child) =>
      child.matches('script[type="application/json"][data-pd-props]'),
    );
    if (script)
      try {
        inline = JSON.parse(script.textContent ?? '{}');
      } catch {}
    return { ...inline, ...this.value };
  }
  set props(value: ElementProps) {
    this.value = value ?? {};
    coordinators.get(this)?.render();
  }
  connectedCallback() {
    if (Object.hasOwn(this, 'props')) {
      const props = this.props;
      delete (this as any).props;
      this.props = props;
    }
    this.classList.add('pd-root');
    if (!coordinators.has(this)) coordinators.set(this, new Coordinator(this.ownerDocument, this));
    this.observer = new MutationObserver(() => coordinators.get(this)?.render());
    this.observer.observe(this, {
      attributes: true,
      attributeFilter: [
        'brand',
        'theme',
        'default-theme',
        'dir',
        'locale',
        'digits',
        'radius',
        'density',
        'font-family',
      ],
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
    queueMicrotask(() => {
      if (!this.isConnected) {
        coordinators.get(this)?.dispose();
        coordinators.delete(this);
      }
    });
  }
}
export class PrimeElement extends ElementBase {
  static formAssociated = true;
  uid = `pd-element-${++nextId}`;
  version = 0;
  ready = false;
  mount?: HTMLDivElement;
  private value: ElementProps = {};
  private local: ElementProps = {};
  private observer?: MutationObserver;
  private coordinator?: Coordinator;
  private internals?: ElementInternals;
  private fallback?: HTMLInputElement;
  constructor() {
    super();
    if (typeof this.attachInternals === 'function')
      try {
        this.internals = this.attachInternals();
      } catch {}
  }
  get props(): ElementProps {
    return { ...this.readProps() };
  }
  set props(value: ElementProps) {
    this.value = value ?? {};
    this.local = {};
    this.refresh();
  }
  readProps(): ElementProps {
    let inline: ElementProps = {};
    const script = Array.from(this.children ?? []).find((child) =>
      child.matches('script[type="application/json"][data-pd-props]'),
    );
    if (script)
      try {
        inline = JSON.parse(script.textContent ?? '{}');
      } catch {}
    return { ...attributes(this), ...inline, ...this.value, ...this.local };
  }
  updateValue(key: string, value: unknown) {
    this.local = { ...this.local, [key]: value };
    this.refresh();
    this.syncFormValue();
  }
  refresh() {
    this.version++;
    this.coordinator?.render();
  }
  connectedCallback() {
    if (Object.hasOwn(this, 'props')) {
      const props = this.props;
      delete (this as any).props;
      this.props = props;
    }
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' }),
        style = this.ownerDocument.createElement('style');
      style.textContent = css.replaceAll(':root', ':host');
      this.mount = this.ownerDocument.createElement('div');
      shadow.append(style, this.mount);
    }
    const owner = this.closest('pd-provider') as PrimeProviderElement | null;
    if (owner && !coordinators.has(owner))
      coordinators.set(owner, new Coordinator(this.ownerDocument, owner));
    const key = owner ?? this.ownerDocument;
    if (!coordinators.has(key)) coordinators.set(key, new Coordinator(this.ownerDocument));
    const next = coordinators.get(key)!;
    if (this.coordinator && this.coordinator !== next) {
      const old = this.coordinator;
      flushSync(() => old.remove(this));
    }
    this.coordinator = next;
    this.coordinator.add(this);
    this.observer = new MutationObserver((records) => {
      const changed = records.filter(
        (record) =>
          record.target === this &&
          record.attributeName &&
          !['class', 'style', 'id'].includes(record.attributeName) &&
          !record.attributeName.startsWith('data-'),
      );
      if (changed.length) {
        for (const record of changed) {
          const key = record.attributeName!.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          delete this.local[key];
        }
        this.refresh();
      }
    });
    this.observer.observe(this, { attributes: true });
    this.addEventListener('input', this.onInput);
    this.addEventListener('change', this.onInput);
  }
  disconnectedCallback() {
    this.observer?.disconnect();
    this.removeEventListener('input', this.onInput);
    this.removeEventListener('change', this.onInput);
    queueMicrotask(() => {
      if (!this.isConnected) this.coordinator?.remove(this);
    });
  }
  private onInput = () => this.syncFormValue();
  syncFormValue() {
    const props = this.readProps(),
      name = String(props.name ?? '');
    if (!name) return;
    const input = this.shadowRoot?.querySelector<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >('input:not([type=hidden]),select,textarea'),
      hidden = this.shadowRoot?.querySelector<HTMLInputElement>('input[type=hidden]');
    let value: unknown = Object.prototype.hasOwnProperty.call(this.local, 'value')
      ? serialValue(this.local.value)
      : (hidden?.value ?? input?.value ?? props.value ?? '');
    if (
      input instanceof HTMLInputElement &&
      ['checkbox', 'radio'].includes(input.type) &&
      !input.checked
    )
      value = null;
    if (props.disabled) value = null;
    const stringValue =
      value === null ? null : Array.isArray(value) ? JSON.stringify(value) : String(value);
    if (this.internals?.setFormValue) {
      this.internals.setFormValue(stringValue);
      if (input && 'validity' in input)
        this.internals.setValidity(input.validity, input.validationMessage, input);
    } else {
      if (!this.fallback) {
        this.fallback = this.ownerDocument.createElement('input');
        this.fallback.type = 'hidden';
        this.fallback.dataset.pdFormValue = '';
        this.append(this.fallback);
      }
      this.fallback.name = name;
      this.fallback.value = stringValue ?? '';
      this.fallback.disabled = stringValue === null;
    }
  }
  formResetCallback() {
    const original = { ...attributes(this), ...this.value };
    this.local = {
      value:
        original.defaultValue ?? original.value ?? (this.localName.includes('date') ? null : ''),
      checked: original.defaultChecked ?? original.checked ?? false,
    };
    this.refresh();
  }
  formDisabledCallback(disabled: boolean) {
    this.local.disabled = disabled || this.hasAttribute('disabled') || !!this.value.disabled;
    this.refresh();
  }
}
export function defineElements(
  registry: CustomElementRegistry | undefined = typeof customElements !== 'undefined'
    ? customElements
    : undefined,
): void {
  if (!registry) return;
  if (!registry.get('pd-provider')) registry.define('pd-provider', PrimeProviderElement);
  for (const tag of Object.keys(definitions))
    if (!registry.get(tag)) registry.define(tag, class extends PrimeElement {});
}
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') defineElements();
