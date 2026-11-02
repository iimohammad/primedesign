'use client';
import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react';
import { Icon } from '@primedesign/icons';
import { Button, Input, type ButtonProps, type InputProps } from './primitives.js';
import { PrimeProvider, usePrime } from './provider.js';
import { cx, useControllable } from './utils.js';
export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  function Label({ className, ...props }, ref) {
    return <label ref={ref} className={cx('pd-label', className)} {...props} />;
  },
);
export function AspectRatio({
  ratio = 16 / 9,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ratio?: number }) {
  return (
    <div
      className={cx('pd-aspect-ratio', className)}
      style={{ aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9, ...style }}
      {...props}
    />
  );
}
export function Separator({
  orientation = 'horizontal',
  decorative = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}) {
  return (
    <div
      className={cx('pd-separator', `pd-separator--${orientation}`, className)}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      {...props}
    />
  );
}
export function ScrollArea({
  label,
  height = 280,
  orientation = 'vertical',
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  label: string;
  height?: number | string;
  orientation?: 'horizontal' | 'vertical' | 'both';
}) {
  return (
    <div
      className={cx('pd-scroll-area', className)}
      role="region"
      aria-label={label}
      tabIndex={0}
      style={{
        maxHeight: height,
        overflowX: orientation === 'vertical' ? 'hidden' : 'auto',
        overflowY: orientation === 'horizontal' ? 'hidden' : 'auto',
        ...style,
      }}
      {...props}
    />
  );
}
export interface CollapsibleProps {
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}
export function Collapsible({
  title,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled,
  className,
}: CollapsibleProps) {
  const [expanded, setExpanded] = useControllable(open, defaultOpen, onOpenChange),
    id = useId();
  return (
    <div className={cx('pd-collapsible', className)}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={expanded}
        aria-controls={`${id}-panel`}
        id={`${id}-trigger`}
        onClick={() => setExpanded(!expanded)}
      >
        {title}
        <Icon name="chevronDown" size={16} />
      </button>
      <div id={`${id}-panel`} aria-labelledby={`${id}-trigger`} hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}
export function DirectionProvider({ dir, children }: { dir: 'rtl' | 'ltr'; children: ReactNode }) {
  const p = usePrime();
  return (
    <PrimeProvider {...p} dir={dir} onThemeChange={p.setTheme}>
      {children}
    </PrimeProvider>
  );
}
export interface ToggleProps extends Omit<ButtonProps, 'onChange'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (v: boolean) => void;
}
export function Toggle({
  pressed,
  defaultPressed = false,
  onPressedChange,
  onClick,
  children,
  ...props
}: ToggleProps) {
  const [on, setOn] = useControllable(pressed, defaultPressed, onPressedChange);
  return (
    <Button
      variant={on ? 'soft' : 'outline'}
      {...props}
      aria-pressed={on}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOn(!on);
      }}
    >
      {children}
    </Button>
  );
}
export interface ToggleGroupProps {
  label: string;
  items: { value: string; label: ReactNode; disabled?: boolean }[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (v: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}
export function ToggleGroup({
  label,
  items,
  value,
  defaultValue = [],
  onValueChange,
  multiple = false,
  disabled,
}: ToggleGroupProps) {
  const [selected, setSelected] = useControllable(value, defaultValue, onValueChange),
    { dir } = usePrime();
  const first = items.findIndex((i) => !i.disabled);
  return (
    <div role="group" aria-label={label} className="pd-toggle-group">
      {items.map((item, index) => (
        <Toggle
          key={item.value}
          disabled={disabled || item.disabled}
          pressed={selected.includes(item.value)}
          tabIndex={selected[0] === item.value || (!selected.length && index === first) ? 0 : -1}
          onPressedChange={(on) =>
            setSelected(
              on
                ? multiple
                  ? [...selected, item.value]
                  : [item.value]
                : selected.filter((v) => v !== item.value),
            )
          }
          onKeyDown={(e) => {
            const buttons = Array.from(
                e.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
                  'button:not(:disabled)',
                ),
              ),
              at = buttons.indexOf(e.currentTarget);
            let next: number;
            if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = buttons.length - 1;
            else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft')
              next =
                (at +
                  (e.key === 'ArrowRight' ? 1 : -1) * (dir === 'rtl' ? -1 : 1) +
                  buttons.length) %
                buttons.length;
            else return;
            e.preventDefault();
            buttons[next]?.focus();
          }}
        >
          {item.label}
        </Toggle>
      ))}
    </div>
  );
}
export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead' | 'muted' | 'small' | 'blockquote' | 'code';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'blockquote' | 'code';
}
export function Typography({ variant = 'p', as, className, ...props }: TypographyProps) {
  const tag = as ?? (['lead', 'muted'].includes(variant) ? 'p' : variant);
  return createElement(tag, {
    className: cx('pd-typography', `pd-typography--${variant}`, className),
    ...props,
  });
}
export function Marker({
  children,
  tone = 'brand',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { tone?: 'brand' | 'success' | 'warning' | 'danger' }) {
  return (
    <mark className={cx('pd-marker', `pd-tone-${tone}`, className)} {...props}>
      {children}
    </mark>
  );
}
export function Item({
  leading,
  title,
  description,
  trailing,
  children,
  onClick,
  href,
  className,
}: {
  leading?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      {leading && <span className="pd-item-leading">{leading}</span>}
      <span className="pd-item-copy">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
        {children}
      </span>
      {trailing && <span className="pd-item-trailing">{trailing}</span>}
    </>
  );
  return href ? (
    <a className={cx('pd-item', className)} href={href}>
      {content}
    </a>
  ) : onClick ? (
    <button type="button" className={cx('pd-item', className)} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={cx('pd-item', className)}>{content}</div>
  );
}
export function ItemGroup({
  label,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { label: string }) {
  return (
    <div role="group" aria-label={label} className={cx('pd-item-group', className)} {...props}>
      {children}
    </div>
  );
}
export const InputGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function InputGroup({ className, ...props }, ref) {
    return <div ref={ref} className={cx('pd-input-group', className)} {...props} />;
  },
);
export function InputGroupAddon({
  position = 'start',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { position?: 'start' | 'end' }) {
  return (
    <div
      className={cx('pd-input-group-addon', `pd-input-group-addon--${position}`, className)}
      {...props}
    />
  );
}
export const InputGroupInput = forwardRef<HTMLInputElement, InputProps>(
  function InputGroupInput(props, ref) {
    return <Input ref={ref} {...props} />;
  },
);
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="pd-simple-table-wrap">
      <table className={cx('pd-table', className)} {...props} />
    </div>
  );
}
export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader(p, ref) {
  return <thead ref={ref} {...p} />;
});
export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody(p, ref) {
  return <tbody ref={ref} {...p} />;
});
export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow(p, ref) {
    return <tr ref={ref} {...p} />;
  },
);
export const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  function TableHead(p, ref) {
    return <th ref={ref} scope="col" {...p} />;
  },
);
export const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  function TableCell(p, ref) {
    return <td ref={ref} {...p} />;
  },
);
export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption(p, ref) {
  return <caption ref={ref} {...p} />;
});
