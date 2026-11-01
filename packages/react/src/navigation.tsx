'use client';
import { Icon, type IconName } from '@primedesign/icons';
import { formatNumber } from '@primedesign/persian';
import { useId, useRef, useState, type ReactNode } from 'react';
import { Badge, Button, IconButton } from './primitives.js';
import { useLabels, usePrime } from './provider.js';
import { cx, useControllable } from './utils.js';
export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  count?: number;
}
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label,
  variant = 'underline',
}: {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  label: string;
  variant?: 'underline' | 'pills';
}) {
  const [active, setActive] = useControllable(
      value,
      defaultValue ?? items.find((i) => !i.disabled)?.value ?? '',
      onValueChange,
    ),
    id = useId(),
    { dir } = usePrime(),
    refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className={cx('pd-tabs', `pd-tabs--${variant}`)}>
      <div className="pd-tab-list" role="tablist" aria-label={label}>
        {items.map((t, i) => (
          <button
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            key={t.value}
            id={`${id}-${i}-tab`}
            role="tab"
            disabled={t.disabled}
            aria-selected={active === t.value}
            aria-controls={`${id}-${i}-panel`}
            tabIndex={active === t.value ? 0 : -1}
            onClick={() => setActive(t.value)}
            onKeyDown={(e) => {
              let next = i;
              const step = (e.key === 'ArrowRight' ? 1 : -1) * (dir === 'rtl' ? -1 : 1);
              if (e.key === 'Home') next = items.findIndex((x) => !x.disabled);
              else if (e.key === 'End')
                next = items.length - 1 - [...items].reverse().findIndex((x) => !x.disabled);
              else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                do {
                  next = (next + step + items.length) % items.length;
                } while (items[next].disabled && next !== i);
              } else return;
              e.preventDefault();
              if (!items[next].disabled) {
                setActive(items[next].value);
                refs.current[next]?.focus();
              }
            }}
          >
            {t.label}
            {t.count !== undefined && <Badge>{t.count}</Badge>}
          </button>
        ))}
      </div>
      {items.map((t, i) => (
        <div
          key={t.value}
          className="pd-tab-panel"
          role="tabpanel"
          id={`${id}-${i}-panel`}
          aria-labelledby={`${id}-${i}-tab`}
          hidden={active !== t.value}
          tabIndex={0}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (s: string) => void;
}) {
  const id = useId();
  return (
    <div className="pd-segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.value}>
          <input
            type="radio"
            name={id}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
export function Accordion({
  items,
  multiple = false,
}: {
  items: { id: string; title: ReactNode; content: ReactNode }[];
  multiple?: boolean;
}) {
  const [open, setOpen] = useState<string[]>([]),
    id = useId();
  return (
    <div className="pd-accordion">
      {items.map((item, i) => (
        <div key={item.id}>
          <h3>
            <button
              type="button"
              aria-expanded={open.includes(item.id)}
              aria-controls={`${id}-${i}-panel`}
              id={`${id}-${i}-trigger`}
              onClick={() =>
                setOpen((v) =>
                  v.includes(item.id)
                    ? v.filter((x) => x !== item.id)
                    : multiple
                      ? [...v, item.id]
                      : [item.id],
                )
              }
            >
              {item.title}
              <Icon name="chevronDown" />
            </button>
          </h3>
          <div
            id={`${id}-${i}-panel`}
            role="region"
            aria-labelledby={`${id}-${i}-trigger`}
            hidden={!open.includes(item.id)}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
export function Breadcrumb({
  items,
  label,
}: {
  items: { label: string; href?: string }[];
  label?: string;
}) {
  const fallback = useLabels('مسیر صفحه', 'Breadcrumb');
  return (
    <nav className="pd-breadcrumb" aria-label={label ?? fallback}>
      <ol>
        {items.map((x, i) => (
          <li key={i}>
            {x.href && i < items.length - 1 ? (
              <a href={x.href}>{x.label}</a>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined}>{x.label}</span>
            )}
            {i < items.length - 1 && <Icon name="chevronLeft" size={14} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function pageRange(page: number, pages: number): Array<number | 'ellipsis'> {
  if (pages <= 7) return Array.from({ length: Math.max(0, pages) }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const all = [...set].sort((a, b) => a - b),
    out: Array<number | 'ellipsis'> = [];
  all.forEach((p, i) => {
    if (i && p - all[i - 1] > 1) out.push('ellipsis');
    out.push(p);
  });
  return out;
}
export function Pagination({
  page,
  total,
  pageSize = 10,
  onPageChange,
  label,
}: {
  page: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize))),
    current = Math.min(pages, Math.max(1, page)),
    { locale, dir } = usePrime(),
    l = useLabels(
      { nav: 'صفحه‌بندی', next: 'صفحهٔ بعد', prev: 'صفحهٔ قبل', page: 'صفحه' },
      { nav: 'Pagination', next: 'Next page', prev: 'Previous page', page: 'Page' },
    );
  return (
    <nav className="pd-pagination" aria-label={label ?? l.nav}>
      <IconButton
        label={l.prev}
        icon={dir === 'rtl' ? 'chevronRight' : 'chevronLeft'}
        variant="outline"
        size="sm"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      />
      {pageRange(current, pages).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`}>…</span>
        ) : (
          <Button
            key={p}
            variant={p === current ? 'solid' : 'ghost'}
            size="sm"
            aria-label={`${l.page} ${p}`}
            aria-current={p === current ? 'page' : undefined}
            onClick={() => onPageChange(p)}
          >
            {formatNumber(p, {}, locale)}
          </Button>
        ),
      )}
      <IconButton
        label={l.next}
        icon={dir === 'rtl' ? 'chevronLeft' : 'chevronRight'}
        variant="outline"
        size="sm"
        disabled={current === pages}
        onClick={() => onPageChange(current + 1)}
      />
    </nav>
  );
}
export interface SideNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: IconName;
  count?: number;
  children?: SideNavItem[];
}
export function SideNav({
  items,
  active,
  onSelect,
  label,
  collapsed = false,
}: {
  items: SideNavItem[];
  active?: string;
  onSelect?: (id: string) => void;
  label: string;
  collapsed?: boolean;
}) {
  return (
    <nav className={cx('pd-side-nav', collapsed && 'pd-side-nav--collapsed')} aria-label={label}>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.href ? (
              <a
                href={item.href}
                aria-current={active === item.id ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
                onClick={() => onSelect?.(item.id)}
              >
                {item.icon && <Icon name={item.icon} />}
                <span>{item.label}</span>
                {item.count !== undefined && <Badge>{item.count}</Badge>}
              </a>
            ) : (
              <button
                type="button"
                aria-current={active === item.id ? 'page' : undefined}
                aria-label={collapsed ? item.label : undefined}
                onClick={() => onSelect?.(item.id)}
              >
                {item.icon && <Icon name={item.icon} />}
                <span>{item.label}</span>
                {item.count !== undefined && <Badge>{item.count}</Badge>}
              </button>
            )}
            {item.children && !collapsed && (
              <SideNav
                items={item.children}
                active={active}
                onSelect={onSelect}
                label={item.label}
              />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
export function Stepper({
  steps,
  current,
}: {
  steps: { label: string; description?: string }[];
  current: number;
}) {
  const { locale } = usePrime();
  return (
    <ol className="pd-stepper">
      {steps.map((s, i) => (
        <li
          key={i}
          data-state={i < current ? 'done' : i === current ? 'current' : 'upcoming'}
          aria-current={i === current ? 'step' : undefined}
        >
          <span className="pd-step-number">
            {i < current ? <Icon name="check" size={16} /> : formatNumber(i + 1, {}, locale)}
          </span>
          <span>
            <strong>{s.label}</strong>
            {s.description && <small>{s.description}</small>}
          </span>
        </li>
      ))}
    </ol>
  );
}
export function Timeline({
  items,
}: {
  items: {
    id: string;
    title: ReactNode;
    description?: ReactNode;
    date?: ReactNode;
    icon?: ReactNode;
  }[];
}) {
  return (
    <ol className="pd-timeline">
      {items.map((i) => (
        <li key={i.id}>
          <span className="pd-timeline-dot">{i.icon ?? <Icon name="check" size={14} />}</span>
          <div>
            <strong>{i.title}</strong>
            {i.description && <p>{i.description}</p>}
            {i.date && <small>{i.date}</small>}
          </div>
        </li>
      ))}
    </ol>
  );
}
export interface TreeItem {
  id: string;
  label: string;
  children?: TreeItem[];
}
export function TreeView({
  items,
  label,
  onSelect,
}: {
  items: TreeItem[];
  label: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="pd-tree" aria-label={label}>
      {items.map((i) =>
        i.children ? (
          <details key={i.id}>
            <summary>{i.label}</summary>
            <TreeView items={i.children} label={i.label} onSelect={onSelect} />
          </details>
        ) : (
          <Button key={i.id} variant="ghost" size="sm" onClick={() => onSelect?.(i.id)}>
            {i.label}
          </Button>
        ),
      )}
    </div>
  );
}
