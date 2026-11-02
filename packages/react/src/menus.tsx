'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@primedesign/icons';
import { Button } from './primitives.js';
import { Popover, type MenuAction } from './overlays.js';
import { cx, eventInside, getActiveElement, focusable } from './utils.js';
import { useLabels, usePrime } from './provider.js';
export interface ContextMenuProps {
  label: string;
  children: ReactNode;
  items: MenuAction[];
  className?: string;
}
export function ContextMenu({ label, children, items, className }: ContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null),
    panel = useRef<HTMLDivElement>(null),
    area = useRef<HTMLDivElement>(null),
    id = useId(),
    hint = useLabels(
      'برای باز کردن منو راست‌کلیک کنید یا Shift+F10 را بزنید.',
      'Right click or press Shift+F10 to open the menu.',
    ),
    { dir } = usePrime();
  const close = (restore = false) => {
    setPosition(null);
    if (restore) area.current?.focus();
  };
  useEffect(() => {
    if (!position || !panel.current) return;
    const p = panel.current,
      r = p.getBoundingClientRect(),
      x = Math.max(8, Math.min(position.x, window.innerWidth - r.width - 8)),
      y = Math.max(8, Math.min(position.y, window.innerHeight - r.height - 8));
    if (x !== position.x || y !== position.y) {
      setPosition({ x, y });
      return;
    }
    p.querySelector<HTMLElement>(focusable)?.focus();
    const down = (e: PointerEvent) => {
      if (!eventInside(p, e)) close();
    };
    const scroll = () => close();
    document.addEventListener('pointerdown', down);
    window.addEventListener('resize', scroll);
    return () => {
      document.removeEventListener('pointerdown', down);
      window.removeEventListener('resize', scroll);
    };
  }, [position?.x, position?.y]);
  useEffect(() => {
    const target = area.current;
    if (!target) return;
    const menu = (e: MouseEvent) => {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
        e.preventDefault();
        const r = target.getBoundingClientRect();
        setPosition({ x: dir === 'rtl' ? r.right - 230 : r.left, y: r.top + 20 });
      }
    };
    target.addEventListener('contextmenu', menu);
    target.addEventListener('keydown', key);
    return () => {
      target.removeEventListener('contextmenu', menu);
      target.removeEventListener('keydown', key);
    };
  }, [dir]);
  return (
    <div
      ref={area}
      className={cx('pd-context-area', className)}
      tabIndex={0}
      aria-describedby={`${id}-hint`}
    >
      {children}
      <span className="pd-sr-only" id={`${id}-hint`}>
        {hint}
      </span>
      {position && (
        <div
          ref={panel}
          className="pd-context-menu"
          role="menu"
          aria-label={label}
          style={{ left: position.x, top: position.y }}
          onKeyDown={(e) => {
            const buttons = Array.from(
                e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
              ),
              at = buttons.indexOf(getActiveElement() as HTMLButtonElement);
            if (e.key === 'Escape' || e.key === 'Tab') {
              if (e.key === 'Escape') e.preventDefault();
              e.stopPropagation();
              close(true);
            } else if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
              e.preventDefault();
              buttons[
                e.key === 'Home'
                  ? 0
                  : e.key === 'End'
                    ? buttons.length - 1
                    : (at + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
              ]?.focus();
            }
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={cx('pd-menu-item', item.danger && 'pd-text-danger')}
              onClick={() => {
                item.onSelect();
                close(true);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export interface MenubarMenu {
  id: string;
  label: string;
  items: MenuAction[];
}
export function Menubar({ menus, label }: { menus: MenubarMenu[]; label: string }) {
  const { dir } = usePrime();
  return (
    <div
      className="pd-menubar"
      role="group"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        const triggers = Array.from(
            e.currentTarget.querySelectorAll<HTMLButtonElement>('.pd-popover-trigger'),
          ),
          at = triggers.indexOf(getActiveElement() as HTMLButtonElement);
        if (at < 0) return;
        e.preventDefault();
        triggers[
          (at + (e.key === 'ArrowRight' ? 1 : -1) * (dir === 'rtl' ? -1 : 1) + triggers.length) %
            triggers.length
        ]?.focus();
      }}
    >
      {menus.map((menu) => (
        <MenuDropdown key={menu.id} menu={menu} />
      ))}
    </div>
  );
}
function MenuDropdown({ menu }: { menu: MenubarMenu }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      label={menu.label}
      open={open}
      onOpenChange={setOpen}
      trigger={<span className="pd-menubar-trigger">{menu.label}</span>}
    >
      <div
        className="pd-menu"
        role="menu"
        aria-label={menu.label}
        onKeyDown={(e) => {
          if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
          e.preventDefault();
          const buttons = Array.from(
              e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
            ),
            at = buttons.indexOf(getActiveElement() as HTMLButtonElement);
          buttons[
            e.key === 'Home'
              ? 0
              : e.key === 'End'
                ? buttons.length - 1
                : (at + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
          ]?.focus();
        }}
      >
        {menu.items.map((item) => (
          <button
            type="button"
            role="menuitem"
            key={item.id}
            disabled={item.disabled}
            className={cx('pd-menu-item', item.danger && 'pd-text-danger')}
            onClick={() => {
              item.onSelect();
              setOpen(false);
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </Popover>
  );
}
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  description?: string;
  children?: NavigationItem[];
}
export function NavigationMenu({
  items,
  label,
  active,
}: {
  items: NavigationItem[];
  label: string;
  active?: string;
}) {
  return (
    <nav className="pd-navigation-menu" aria-label={label}>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.children ? (
              <details>
                <summary>
                  {item.label}
                  <Icon name="chevronDown" size={14} />
                </summary>
                <ul>
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <a
                        href={child.href ?? '#'}
                        aria-current={active === child.id ? 'page' : undefined}
                      >
                        <strong>{child.label}</strong>
                        {child.description && <small>{child.description}</small>}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <a href={item.href ?? '#'} aria-current={active === item.id ? 'page' : undefined}>
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
export function HoverCard({
  trigger,
  title,
  children,
  delay = 180,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  const [open, setOpen] = useState(false),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    id = useId();
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <span
      className="pd-hover-card"
      onMouseEnter={() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setOpen(true), delay);
      }}
      onMouseLeave={() => {
        clearTimeout(timer.current);
        setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setOpen(false);
          e.stopPropagation();
        }
      }}
    >
      <button
        type="button"
        className="pd-hover-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      <span id={id} role="region" aria-label={title} className="pd-hover-panel" hidden={!open}>
        {children}
      </span>
    </span>
  );
}
