'use client';
import { getActiveElement, eventInside, composedQuery, composedContains } from './utils.js';
import { Icon } from '@primedesign/icons';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Button, IconButton, type Tone } from './primitives.js';
import { useLabels, usePrime } from './provider.js';
import { cx, focusable, useControllable, useLatest } from './utils.js';
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  placement?: 'center' | 'start' | 'end' | 'bottom';
  dismissible?: boolean;
  className?: string;
}
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  placement = 'center',
  dismissible = true,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLElement | null>(null),
    id = useId(),
    onChange = useLatest(onOpenChange),
    label = useLabels('بستن پنجره', 'Close dialog');
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = getActiveElement() as HTMLElement;
      d.showModal();
      composedQuery(d, '[data-pd-autofocus], [autofocus]')[0]?.focus();
    } else if (!open && d.open) {
      d.close();
      opener.current?.focus();
    }
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const elements = composedQuery(d, focusable).filter(
        (el) => !el.closest('[hidden]') && el.getClientRects().length > 0,
      );
      const first = elements[0],
        last = elements.at(-1);
      if (!first) {
        e.preventDefault();
        d.focus();
        return;
      }
      if (e.shiftKey && getActiveElement() === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && getActiveElement() === last) {
        e.preventDefault();
        first.focus();
      }
    };
    d.addEventListener('keydown', handle);
    return () => d.removeEventListener('keydown', handle);
  }, []);
  return (
    <dialog
      ref={ref}
      className={cx('pd-dialog', `pd-dialog--${size}`, `pd-dialog--${placement}`, className)}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onChange.current(false);
      }}
      onClose={() => onChange.current(false)}
      onClick={(e) => {
        if (!dismissible || e.target !== ref.current) return;
        const r = ref.current.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
          onChange.current(false);
      }}
    >
      <div className="pd-dialog-head">
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          {description && <p id={`${id}-desc`}>{description}</p>}
        </div>
        {dismissible && (
          <IconButton
            label={label}
            icon="close"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          />
        )}
      </div>
      <div className="pd-dialog-body">{children}</div>
      {footer && <div className="pd-dialog-footer">{footer}</div>}
    </dialog>
  );
}
export function Drawer(p: DialogProps) {
  return <Dialog {...p} placement={p.placement ?? 'end'} />;
}
export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  label: string;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  align?: 'start' | 'end';
  className?: string;
}
export function Popover({
  trigger,
  children,
  label,
  open: controlled,
  onOpenChange,
  align = 'start',
  className,
}: PopoverProps) {
  const [open, setOpen] = useControllable(controlled, false, onOpenChange),
    [pos, setPos] = useState<CSSProperties>({}),
    anchor = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null),
    wrap = useRef<HTMLSpanElement>(null),
    id = useId();
  const { dir } = usePrime();
  useEffect(() => {
    if (!open) return;
    const place = () => {
      if (!anchor.current || !panel.current) return;
      const a = anchor.current.getBoundingClientRect(),
        p = panel.current.getBoundingClientRect();
      let left = (align === 'start') === (dir === 'ltr') ? a.left : a.right - p.width;
      left = Math.max(8, Math.min(left, window.innerWidth - p.width - 8));
      const top =
        a.bottom + p.height + 8 > window.innerHeight
          ? Math.max(8, a.top - p.height - 8)
          : a.bottom + 6;
      setPos({ left, top, maxHeight: Math.max(120, window.innerHeight - 16) });
    };
    place();
    if (panel.current) composedQuery(panel.current, focusable)[0]?.focus();
    const down = (e: PointerEvent) => {
      if (!eventInside(wrap.current, e)) setOpen(false);
    };
    document.addEventListener('pointerdown', down);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('pointerdown', down);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, align, dir]);
  return (
    <span ref={wrap} className="pd-popover-anchor">
      <button
        ref={anchor}
        className="pd-popover-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={label}
          ref={panel}
          className={cx('pd-popover', className)}
          style={pos}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setOpen(false);
              anchor.current?.focus();
            }
          }}
          onBlur={(e) => {
            if (e.relatedTarget && !composedContains(wrap.current, e.relatedTarget as Node))
              setOpen(false);
          }}
        >
          {children}
        </div>
      )}
    </span>
  );
}
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  return (
    <span
      className="pd-tooltip-wrap"
      tabIndex={0}
      aria-describedby={id}
      onFocus={() => setDismissed(false)}
      onMouseEnter={() => setDismissed(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setDismissed(true);
          e.stopPropagation();
        }
      }}
    >
      {children}
      <span role="tooltip" id={id} className="pd-tooltip" hidden={dismissed}>
        {label}
      </span>
    </span>
  );
}
export interface MenuAction {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect: () => void;
}
export function DropdownMenu({
  trigger,
  label,
  items,
}: {
  trigger: ReactNode;
  label: string;
  items: MenuAction[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover trigger={trigger} label={label} open={open} onOpenChange={setOpen}>
      <div
        className="pd-menu"
        role="menu"
        aria-label={label}
        onKeyDown={(e) => {
          const list = Array.from(
            e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
          );
          const i = list.indexOf(getActiveElement() as HTMLButtonElement);
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
            e.preventDefault();
            list[
              e.key === 'Home'
                ? 0
                : e.key === 'End'
                  ? list.length - 1
                  : (i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length
            ]?.focus();
          }
        }}
      >
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            role="menuitem"
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
export interface ToastOptions {
  title: string;
  description?: string;
  tone?: Tone;
  duration?: number;
  action?: { label: string; onClick: () => void };
}
interface ToastRecord extends ToastOptions {
  id: number;
}
const ToastContext = createContext<{
  toast: (o: ToastOptions) => number;
  dismiss: (id: number) => void;
}>({
  toast: () => {
    throw new Error('Wrap your app in ToastProvider');
  },
  dismiss: () => {},
});
function ToastItem({ item, dismiss }: { item: ToastRecord; dismiss: () => void }) {
  const remaining = useRef(item.duration ?? 5000),
    start = useRef(0),
    [paused, setPaused] = useState(false),
    closeLabel = useLabels('بستن اعلان', 'Dismiss notification');
  useEffect(() => {
    if (paused || remaining.current === Infinity) return;
    start.current = Date.now();
    const timer = setTimeout(dismiss, Math.max(0, remaining.current));
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - start.current;
    };
  }, [paused, dismiss]);
  return (
    <div
      className={cx('pd-toast', `pd-tone-${item.tone ?? 'info'}`)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <Icon
        name={item.tone === 'success' ? 'check' : item.tone === 'danger' ? 'warning' : 'info'}
      />
      <div>
        <strong>{item.title}</strong>
        {item.description && <p>{item.description}</p>}
        {item.action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              item.action!.onClick();
              dismiss();
            }}
          >
            {item.action.label}
          </Button>
        )}
      </div>
      <IconButton label={closeLabel} icon="close" variant="ghost" size="sm" onClick={dismiss} />
    </div>
  );
}
export function ToastProvider({ children, max = 5 }: { children: ReactNode; max?: number }) {
  const [items, setItems] = useState<ToastRecord[]>([]),
    next = useRef(0);
  const dismiss = (id: number) => setItems((v) => v.filter((x) => x.id !== id));
  const toast = (o: ToastOptions) => {
    const id = ++next.current;
    setItems((v) => [...v, { ...o, id }].slice(-max));
    return id;
  };
  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pd-toaster" aria-live="polite" aria-relevant="additions">
        <div className="pd-toast-list">
          {items.map((item) => (
            <ToastItem key={item.id} item={item} dismiss={() => dismiss(item.id)} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  danger,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  danger?: boolean;
  loading?: boolean;
}) {
  const labels = useLabels(
    { cancel: 'انصراف', confirm: 'تأیید' },
    { cancel: 'Cancel', confirm: 'Confirm' },
  );
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {labels.cancel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'solid'}
            loading={loading}
            onClick={() => void onConfirm()}
          >
            {labels.confirm}
          </Button>
        </>
      }
    >
      {description}
    </Dialog>
  );
}
