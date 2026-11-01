'use client';
import { Icon, type IconName } from '@primedesign/icons';
import {
  forwardRef,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { useLabels } from './provider.js';
import { cx } from './utils.js';
export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    size = 'md',
    loading,
    startIcon,
    endIcon,
    fullWidth,
    className,
    disabled,
    children,
    onClick,
    type = 'button',
    ...props
  },
  ref,
) {
  const label = useLabels('در حال انجام', 'Loading');
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'pd-button',
        `pd-button--${variant}`,
        `pd-button--${size}`,
        fullWidth && 'pd-full',
        className,
      )}
      disabled={disabled}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (loading) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {loading ? <span className="pd-spinner" aria-label={label} /> : startIcon}
      {children}
      {endIcon}
    </button>
  );
});
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: IconName;
  label: string;
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, className, ...p },
  ref,
) {
  return (
    <Button ref={ref} className={cx('pd-icon-button', className)} aria-label={label} {...p}>
      <Icon name={icon} />
    </Button>
  );
});
export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
}
export function Field({
  label,
  description,
  error,
  htmlFor,
  required,
  optional,
  className,
  children,
  ...p
}: FieldProps) {
  const optionalLabel = useLabels('اختیاری', 'Optional');
  return (
    <div className={cx('pd-field', className)} {...p}>
      {label && (
        <label className="pd-label" htmlFor={htmlFor}>
          {label}
          {required && (
            <span aria-hidden="true" className="pd-required">
              {' '}
              *
            </span>
          )}
          {optional && <small>{optionalLabel}</small>}
        </label>
      )}
      {children}
      {description && (
        <div id={htmlFor ? `${htmlFor}-description` : undefined} className="pd-description">
          {description}
        </div>
      )}
      {error && (
        <div id={htmlFor ? `${htmlFor}-error` : undefined} className="pd-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  wrapperClassName?: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    description,
    error,
    startAdornment,
    endAdornment,
    id: provided,
    className,
    wrapperClassName,
    required,
    disabled,
    'aria-describedby': describedBy,
    ...p
  },
  ref,
) {
  const uid = useId(),
    id = provided ?? uid;
  return (
    <Field
      htmlFor={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      <div className={cx('pd-input-wrap', !!error && 'pd-invalid', disabled && 'pd-disabled')}>
        {startAdornment && <span className="pd-input-adornment">{startAdornment}</span>}
        <input
          data-pd-autofocus={p.autoFocus || undefined}
          ref={ref}
          id={id}
          className={cx('pd-input', className)}
          required={required}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={
            [describedBy, description && `${id}-description`, error && `${id}-error`]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...p}
        />
        {endAdornment && <span className="pd-input-adornment">{endAdornment}</span>}
      </div>
    </Field>
  );
});
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, description, error, id: provided, className, required, 'aria-describedby': by, ...p },
  ref,
) {
  const uid = useId(),
    id = provided ?? uid;
  return (
    <Field htmlFor={id} label={label} description={description} error={error} required={required}>
      <textarea
        ref={ref}
        id={id}
        required={required}
        className={cx('pd-textarea', className)}
        aria-invalid={!!error || undefined}
        aria-describedby={
          [by, description && `${id}-description`, error && `${id}-error`]
            .filter(Boolean)
            .join(' ') || undefined
        }
        {...p}
      />
    </Field>
  );
});
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  options?: readonly { label: string; value: string; disabled?: boolean }[];
  placeholder?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    description,
    error,
    options,
    placeholder,
    id: provided,
    className,
    required,
    children,
    'aria-describedby': by,
    ...p
  },
  ref,
) {
  const uid = useId(),
    id = provided ?? uid;
  return (
    <Field htmlFor={id} label={label} description={description} error={error} required={required}>
      <div className="pd-select-wrap">
        <select
          ref={ref}
          id={id}
          required={required}
          className={cx('pd-select', className)}
          aria-invalid={!!error || undefined}
          aria-describedby={
            [by, description && `${id}-description`, error && `${id}-error`]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...p}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
          {children}
        </select>
        <Icon name="chevronDown" />
      </div>
    </Field>
  );
});
export interface CheckProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  indeterminate?: boolean;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckProps>(function Checkbox(
  { label, description, error, indeterminate, id: provided, className, ...p },
  ref,
) {
  const uid = useId(),
    id = provided ?? uid;
  return (
    <div className="pd-field">
      <label className={cx('pd-check', className)} htmlFor={id}>
        <input
          type="checkbox"
          ref={(el) => {
            if (el) el.indeterminate = !!indeterminate;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={
            [description && `${id}-description`, error && `${id}-error`]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...p}
        />
        <span>
          <span>{label}</span>
          {description && <small id={`${id}-description`}>{description}</small>}
        </span>
      </label>
      {error && (
        <span className="pd-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
export const Switch = forwardRef<HTMLInputElement, Omit<CheckProps, 'indeterminate'>>(
  function Switch({ label, description, id: provided, className, error, ...p }, ref) {
    const uid = useId(),
      id = provided ?? uid;
    return (
      <div className="pd-field">
        <label className={cx('pd-switch', className)} htmlFor={id}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={id}
            aria-invalid={!!error || undefined}
            aria-describedby={description ? `${id}-description` : undefined}
            {...p}
          />
          <span className="pd-switch-track" aria-hidden="true" />
          <span>
            {label}
            {description && <small id={`${id}-description`}>{description}</small>}
          </span>
        </label>
        {error && (
          <span role="alert" className="pd-error">
            {error}
          </span>
        )}
      </div>
    );
  },
);
export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  options: { label: string; value: string; description?: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="pd-radio-group" disabled={disabled}>
      <legend className="pd-label">{label}</legend>
      {options.map((o) => (
        <label className="pd-check" key={o.value}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>
            {o.label}
            {o.description && <small>{o.description}</small>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
export function Badge({
  tone = 'neutral',
  dot,
  className,
  children,
  ...p
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
  return (
    <span className={cx('pd-badge', `pd-tone-${tone}`, className)} {...p}>
      {dot && <i aria-hidden="true" />}
      {children}
    </span>
  );
}
export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('pd-card', className)} {...p} />;
}
export function CardHeader({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('pd-card-header', className)} {...p} />;
}
export function CardBody({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('pd-card-body', className)} {...p} />;
}
export function CardFooter({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('pd-card-footer', className)} {...p} />;
}
export function Alert({
  tone = 'info',
  title,
  children,
  onClose,
  className,
  ...p
}: Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  tone?: Tone;
  title?: ReactNode;
  onClose?: () => void;
}) {
  const label = useLabels('بستن', 'Close');
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('pd-alert', `pd-tone-${tone}`, className)}
      {...p}
    >
      <Icon name={tone === 'success' ? 'check' : tone === 'warning' ? 'warning' : 'info'} />
      <div>
        {title && <strong>{title}</strong>}
        {children && <div>{children}</div>}
      </div>
      {onClose && (
        <IconButton label={label} icon="close" variant="ghost" size="sm" onClick={onClose} />
      )}
    </div>
  );
}
export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={cx('pd-avatar', `pd-avatar--${size}`, className)} role="img" aria-label={name}>
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((s) => s[0])
          .join('')
      )}
    </span>
  );
}
export function AvatarGroup({
  names,
  max = 4,
}: {
  names: { name: string; src?: string }[];
  max?: number;
}) {
  return (
    <div className="pd-avatar-group">
      {names.slice(0, Math.max(1, max)).map((n, i) => (
        <Avatar key={i} {...n} />
      ))}
      {names.length > max && (
        <span className="pd-avatar pd-avatar--md" aria-label={`${names.length - max} more`}>
          +{names.length - max}
        </span>
      )}
    </div>
  );
}
export function Skeleton({ className, style, ...p }: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-hidden="true" className={cx('pd-skeleton', className)} style={style} {...p} />;
}
export function Spinner({ label }: { label?: string }) {
  const fallback = useLabels('در حال بارگذاری', 'Loading');
  return <span role="status" aria-label={label ?? fallback} className="pd-spinner" />;
}
export function Progress({
  value = 0,
  max = 100,
  label,
  className,
}: {
  value?: number;
  max?: number;
  label: string;
  className?: string;
}) {
  const safeMax = max > 0 ? max : 100,
    v = Math.max(0, Math.min(value, safeMax));
  return (
    <div
      className={cx('pd-progress', className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={safeMax}
    >
      <span style={{ width: `${(v / safeMax) * 100}%` }} />
    </div>
  );
}
export const Meter = Progress;
export function EmptyState({
  title,
  description,
  icon = 'box',
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
}) {
  return (
    <div className="pd-empty">
      <span className="pd-empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
export function Divider({ label }: { label?: string }) {
  return (
    <div className="pd-divider" role="separator">
      {label && <span>{label}</span>}
    </div>
  );
}
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="pd-kbd">{children}</kbd>;
}
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="pd-sr-only">{children}</span>;
}
export function Container({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('pd-container', className)} {...p} />;
}
export function Stack({
  gap = 4,
  direction = 'column',
  className,
  style,
  ...p
}: HTMLAttributes<HTMLDivElement> & { gap?: number; direction?: 'row' | 'column' }) {
  return (
    <div
      className={cx('pd-stack', className)}
      style={{ display: 'flex', flexDirection: direction, gap: `${gap * 0.25}rem`, ...style }}
      {...p}
    />
  );
}
export function Grid({
  min = 240,
  gap = 4,
  className,
  style,
  ...p
}: HTMLAttributes<HTMLDivElement> & { min?: number; gap?: number }) {
  return (
    <div
      className={cx('pd-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,${min}px),1fr))`,
        gap: `${gap * 0.25}rem`,
        ...style,
      }}
      {...p}
    />
  );
}
export const ButtonGroup = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cx('pd-button-group', className)} role="group" {...p} />
);
