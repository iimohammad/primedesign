'use client';
import { Icon } from '@primedesign/icons';
import { formatNumber, formatRelativeTime, toEnDigits } from '@primedesign/persian';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Button, Card, IconButton, Input, Progress, type InputProps } from './primitives.js';
import { useLabels, usePrime } from './provider.js';
import { cx } from './utils.js';
export function PasswordInput({ label, ...p }: InputProps) {
  const [visible, setVisible] = useState(false),
    l = useLabels(
      { show: 'نمایش رمز', hide: 'پنهان کردن رمز' },
      { show: 'Show password', hide: 'Hide password' },
    );
  return (
    <Input
      {...p}
      label={label}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <IconButton
          label={visible ? l.hide : l.show}
          icon="eye"
          variant="ghost"
          size="sm"
          aria-pressed={visible}
          disabled={p.disabled}
          onClick={() => setVisible((v) => !v)}
        />
      }
    />
  );
}
export function PasswordStrength({ value }: { value: string }) {
  const l = useLabels(
      { label: 'قدرت رمز عبور', levels: ['وارد نشده', 'ضعیف', 'متوسط', 'خوب', 'قوی'] },
      { label: 'Password strength', levels: ['Empty', 'Weak', 'Fair', 'Good', 'Strong'] },
    ),
    score = value
      ? Number(value.length >= 8) +
        Number(value.length >= 12) +
        Number(/[a-z]/.test(value) && /[A-Z]/.test(value)) +
        Number(/\d/.test(value) && /[^a-z\d]/i.test(value))
      : 0;
  return (
    <div className="pd-password-strength">
      <Progress label={l.label} value={score} max={4} />
      <small>{l.levels[value ? Math.max(1, score) : 0]}</small>
    </div>
  );
}
export function TimeInput({
  value,
  onValueChange,
  ...p
}: Omit<InputProps, 'value' | 'onChange' | 'type'> & {
  value: string;
  onValueChange: (s: string) => void;
}) {
  return (
    <Input
      {...p}
      type="time"
      value={toEnDigits(value)}
      onChange={(e) => onValueChange(e.target.value)}
    />
  );
}
export function CopyButton({
  value,
  label,
  onError,
}: {
  value: string;
  label?: string;
  onError?: (e: unknown) => void;
}) {
  const [copied, setCopied] = useState(false),
    l = useLabels({ copy: 'کپی', done: 'کپی شد' }, { copy: 'Copy', done: 'Copied' });
  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);
  return (
    <Button
      variant="outline"
      size="sm"
      startIcon={<Icon name={copied ? 'check' : 'copy'} size={16} />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch (e) {
          onError?.(e);
        }
      }}
    >
      <span role="status">{copied ? l.done : (label ?? l.copy)}</span>
    </Button>
  );
}
export function StatCard({
  label,
  value,
  change,
  description,
  icon,
  sparkline,
}: {
  label: string;
  value: ReactNode;
  change?: number;
  description?: string;
  icon?: ReactNode;
  sparkline?: ReactNode;
}) {
  const { locale } = usePrime();
  return (
    <Card className="pd-stat">
      <div className="pd-stat-label">
        {label}
        {icon && <span>{icon}</span>}
      </div>
      <strong className="pd-stat-value">{value}</strong>
      <div className="pd-stat-foot">
        {change !== undefined && (
          <span
            className={cx('pd-stat-change', change >= 0 ? 'pd-text-success' : 'pd-text-danger')}
          >
            {change > 0 ? '+' : ''}
            {formatNumber(change, {}, locale)}٪
          </span>
        )}
        {description && <small>{description}</small>}
      </div>
      {sparkline}
    </Card>
  );
}
export function RelativeTime({ date, refresh = 60000 }: { date: Date; refresh?: number }) {
  const [now, setNow] = useState<Date | null>(null),
    { locale } = usePrime();
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), Math.max(1000, refresh));
    return () => clearInterval(id);
  }, [refresh]);
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString(locale)}>
      {now ? formatRelativeTime(date, now, locale) : date.toLocaleDateString(locale)}
    </time>
  );
}
export function Countdown({
  until,
  label,
  onComplete,
}: {
  until: Date;
  label: string;
  onComplete?: () => void;
}) {
  const [left, setLeft] = useState<number | null>(null),
    { locale } = usePrime();
  useEffect(() => {
    let completed = false;
    const tick = () => {
      const delta = Math.max(0, Math.ceil((until.getTime() - Date.now()) / 1000));
      setLeft(delta);
      if (delta === 0 && !completed) {
        completed = true;
        onComplete?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until.getTime(), onComplete]);
  const parts =
    left === null
      ? []
      : [
          Math.floor(left / 86400),
          Math.floor(left / 3600) % 24,
          Math.floor(left / 60) % 60,
          left % 60,
        ];
  return (
    <span className="pd-countdown" role="timer" aria-label={label} dir="ltr">
      {parts.length
        ? parts
            .map((n) => formatNumber(n, { minimumIntegerDigits: 2, useGrouping: false }, locale))
            .join(' : ')
        : '—'}
    </span>
  );
}
export function ColorPicker({
  value,
  onValueChange,
  label,
}: {
  value: string;
  onValueChange: (color: string) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div className="pd-color-picker">
      <label className="pd-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} type="color" value={value} onChange={(e) => onValueChange(e.target.value)} />
      <code>{value}</code>
    </div>
  );
}
export function Carousel({ items, label }: { items: ReactNode[]; label: string }) {
  const [active, setActive] = useState(0),
    { dir } = usePrime(),
    l = useLabels(
      { next: 'مورد بعد', prev: 'مورد قبل' },
      { next: 'Next slide', prev: 'Previous slide' },
    );
  if (!items.length) return null;
  return (
    <section className="pd-carousel" aria-label={label} aria-roledescription="carousel">
      <div aria-live="polite">{items[active % items.length]}</div>
      <div className="pd-carousel-controls">
        <IconButton
          icon={dir === 'rtl' ? 'chevronRight' : 'chevronLeft'}
          variant="outline"
          size="sm"
          label={l.prev}
          onClick={() => setActive((i) => (i - 1 + items.length) % items.length)}
        />
        <span>
          {active + 1} / {items.length}
        </span>
        <IconButton
          icon={dir === 'rtl' ? 'chevronLeft' : 'chevronRight'}
          variant="outline"
          size="sm"
          label={l.next}
          onClick={() => setActive((i) => (i + 1) % items.length)}
        />
      </div>
    </section>
  );
}
export function InlineEdit({
  value,
  onSave,
  label,
}: {
  value: string;
  onSave: (v: string) => void | Promise<void>;
  label: string;
}) {
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(value),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    l = useLabels(
      { save: 'ذخیره', cancel: 'انصراف', edit: 'ویرایش', error: 'ذخیره انجام نشد.' },
      { save: 'Save', cancel: 'Cancel', edit: 'Edit', error: 'Could not save.' },
    );
  return editing ? (
    <form
      className="pd-inline-edit"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError('');
        try {
          await onSave(draft);
          setEditing(false);
        } catch (e) {
          setError(e instanceof Error ? e.message : l.error);
        } finally {
          setPending(false);
        }
      }}
    >
      <Input
        autoFocus
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        error={error || undefined}
      />
      <Button type="submit" size="sm" loading={pending}>
        {l.save}
      </Button>
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => setEditing(false)}>
        {l.cancel}
      </Button>
    </form>
  ) : (
    <Button
      variant="ghost"
      endIcon={<Icon name="edit" size={14} />}
      aria-label={`${l.edit}: ${label}`}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
    >
      {value || label}
    </Button>
  );
}
