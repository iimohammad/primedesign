'use client';
import { Icon } from '@primedesign/icons';
import {
  formatCardNumber,
  formatMoney,
  formatNumber,
  isValidCardNumber,
  isValidIban,
  isValidMobile,
  isValidNationalId,
  isValidPostalCode,
  normalizeMobile,
  numberToWords,
  PROVINCES,
  searchText,
  toEnDigits,
  toFaDigits,
} from '@primedesign/persian';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Dialog } from './overlays.js';
import {
  Button,
  Checkbox,
  Field,
  IconButton,
  Input,
  Select,
  type InputProps,
} from './primitives.js';
import { useLabels, usePrime } from './provider.js';
import { useControllable } from './utils.js';
export interface Option {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
export interface ComboboxProps {
  label: string;
  options: readonly Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: ReactNode;
  name?: string;
  onSearchChange?: (query: string) => void;
  filter?: boolean;
  clearable?: boolean;
  required?: boolean;
}
export function Combobox({
  label,
  options,
  value,
  defaultValue = '',
  onValueChange,
  placeholder,
  disabled,
  loading,
  error,
  name,
  onSearchChange,
  filter = true,
  clearable,
  required,
}: ComboboxProps) {
  const [selected, setSelected] = useControllable(value, defaultValue, onValueChange),
    [query, setQuery] = useState(''),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1),
    id = useId(),
    wrap = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null),
    l = useLabels(
      { empty: 'نتیجه‌ای پیدا نشد', loading: 'در حال جست‌وجو', clear: 'پاک کردن' },
      { empty: 'No results', loading: 'Searching', clear: 'Clear' },
    );
  const chosen = options.find((o) => o.value === selected),
    shown = filter
      ? options.filter((o) => searchText(o.label).includes(searchText(query)))
      : options;
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [open]);
  useEffect(() => {
    setActive(-1);
  }, [query]);
  const choose = (o: Option) => {
    if (o.disabled) return;
    setSelected(o.value);
    setOpen(false);
    setQuery('');
    input.current?.focus();
  };
  return (
    <div ref={wrap} className="pd-combobox">
      <Input
        ref={input}
        label={label}
        error={error}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
        autoComplete="off"
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        value={open ? query : (chosen?.label ?? '')}
        startAdornment={<Icon name="search" size={18} />}
        endAdornment={
          clearable && selected ? (
            <IconButton
              icon="close"
              label={l.clear}
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                setSelected('');
                setQuery('');
                input.current?.focus();
              }}
            />
          ) : (
            <Icon name="chevronDown" size={16} />
          )
        }
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          onSearchChange?.(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            setQuery('');
            e.stopPropagation();
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
            const available = shown.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
            const at = available.indexOf(active);
            setActive(
              available[
                (at + (e.key === 'ArrowDown' ? 1 : -1) + available.length) % available.length
              ] ?? -1,
            );
          } else if (e.key === 'Enter' && open && active >= 0) {
            e.preventDefault();
            choose(shown[active]);
          }
        }}
        onBlur={(e) => {
          if (!wrap.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
            setQuery('');
          }
        }}
      />
      {name && <input type="hidden" name={name} value={selected} disabled={disabled} />}
      <ul
        className="pd-options"
        id={`${id}-list`}
        role="listbox"
        aria-label={label}
        hidden={!open}
        aria-busy={loading || undefined}
      >
        {loading ? (
          <li role="presentation" className="pd-options-empty">
            {l.loading}
          </li>
        ) : shown.length ? (
          shown.map((o, i) => (
            <li
              id={`${id}-${i}`}
              role="option"
              key={o.value}
              aria-selected={o.value === selected}
              aria-disabled={o.disabled || undefined}
              data-active={active === i || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
              onPointerMove={() => !o.disabled && setActive(i)}
            >
              <span>
                {o.label}
                {o.description && <small>{o.description}</small>}
              </span>
              {o.value === selected && <Icon name="check" size={16} />}
            </li>
          ))
        ) : (
          <li role="presentation" className="pd-options-empty">
            {l.empty}
          </li>
        )}
      </ul>
    </div>
  );
}
export function MultiSelect({
  label,
  options,
  value,
  onValueChange,
  max,
  disabled,
  name,
}: {
  label: string;
  options: readonly Option[];
  value: string[];
  onValueChange: (v: string[]) => void;
  max?: number;
  disabled?: boolean;
  name?: string;
}) {
  const [query, setQuery] = useState(''),
    l = useLabels('جست‌وجو', 'Search');
  return (
    <fieldset className="pd-multiselect" disabled={disabled}>
      <legend className="pd-label">{label}</legend>
      <Input
        aria-label={l}
        placeholder={l}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        startAdornment={<Icon name="search" />}
      />
      <div className="pd-multiselect-options">
        {options
          .filter((o) => searchText(o.label).includes(searchText(query)))
          .map((o) => (
            <Checkbox
              key={o.value}
              label={o.label}
              checked={value.includes(o.value)}
              disabled={
                o.disabled || (!value.includes(o.value) && max !== undefined && value.length >= max)
              }
              onChange={() =>
                onValueChange(
                  value.includes(o.value)
                    ? value.filter((v) => v !== o.value)
                    : [...value, o.value],
                )
              }
            />
          ))}
      </div>
      {name &&
        value.map((v) => <input key={v} type="hidden" name={name} value={v} disabled={disabled} />)}
    </fieldset>
  );
}
export function TagInput({
  label,
  value,
  onValueChange,
  placeholder,
  max,
  disabled,
}: {
  label: string;
  value: string[];
  onValueChange: (v: string[]) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
}) {
  const [text, setText] = useState(''),
    remove = useLabels('حذف', 'Remove');
  const add = () => {
    const next = text.trim();
    if (next && !value.includes(next) && (max === undefined || value.length < max)) {
      onValueChange([...value, next]);
      setText('');
    }
  };
  return (
    <Field label={label}>
      <div className="pd-tag-input">
        {value.map((v) => (
          <span className="pd-tag" key={v}>
            {v}
            <button
              type="button"
              disabled={disabled}
              aria-label={`${remove} ${v}`}
              onClick={() => onValueChange(value.filter((x) => x !== v))}
            >
              <Icon name="close" size={14} />
            </button>
          </span>
        ))}
        <input
          aria-label={label}
          value={text}
          disabled={disabled || (max !== undefined && value.length >= max)}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            } else if (e.key === 'Backspace' && !text) onValueChange(value.slice(0, -1));
          }}
          onBlur={add}
        />
      </div>
    </Field>
  );
}
export function NumberInput({
  label,
  value,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  name,
  disabled,
}: {
  label: string;
  value: number;
  onValueChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  name?: string;
  disabled?: boolean;
}) {
  const l = useLabels({ minus: 'کاهش', plus: 'افزایش' }, { minus: 'Decrease', plus: 'Increase' });
  const set = (n: number) => {
    if (Number.isFinite(n)) onValueChange(Math.min(max, Math.max(min, n)));
  };
  return (
    <Input
      label={label}
      type="number"
      name={name}
      value={value}
      min={Number.isFinite(min) ? min : undefined}
      max={Number.isFinite(max) ? max : undefined}
      step={step}
      disabled={disabled}
      onChange={(e) => set(e.target.valueAsNumber)}
      startAdornment={
        <IconButton
          icon="minus"
          label={`${l.minus} ${label}`}
          variant="ghost"
          size="sm"
          disabled={disabled || value <= min}
          onClick={() => set(value - step)}
        />
      }
      endAdornment={
        <IconButton
          icon="plus"
          label={`${l.plus} ${label}`}
          variant="ghost"
          size="sm"
          disabled={disabled || value >= max}
          onClick={() => set(value + step)}
        />
      }
    />
  );
}
export function Slider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  name,
}: {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  name?: string;
}) {
  const id = useId(),
    { locale } = usePrime();
  return (
    <Field
      htmlFor={id}
      label={
        <>
          {label}
          <span className="pd-field-value">{formatNumber(value, {}, locale)}</span>
        </>
      }
    >
      <input
        id={id}
        className="pd-slider"
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        name={name}
        onChange={(e) => onValueChange(e.target.valueAsNumber)}
      />
    </Field>
  );
}
export function Rating({
  value,
  max = 5,
  onValueChange,
  label,
  readonly = false,
}: {
  value: number;
  max?: number;
  onValueChange?: (v: number) => void;
  label: string;
  readonly?: boolean;
}) {
  const name = useId();
  return readonly ? (
    <span className="pd-rating" role="img" aria-label={`${label}: ${value} / ${max}`}>
      <Icon name="star" fill="currentColor" size={16} />
      <span>{value.toFixed(1)}</span>
    </span>
  ) : (
    <fieldset className="pd-rating-input">
      <legend className="pd-label">{label}</legend>
      {Array.from({ length: max }, (_, i) => (
        <label key={i} data-selected={value >= i + 1 || undefined}>
          <input
            type="radio"
            name={name}
            aria-label={`${i + 1} / ${max}`}
            value={i + 1}
            checked={value === i + 1}
            onChange={() => onValueChange?.(i + 1)}
          />
          <Icon name="star" fill={value >= i + 1 ? 'currentColor' : 'none'} />
        </label>
      ))}
    </fieldset>
  );
}
export function ChipGroup({
  label,
  options,
  value,
  onValueChange,
  multiple = true,
}: {
  label: string;
  options: Option[];
  value: string[];
  onValueChange: (v: string[]) => void;
  multiple?: boolean;
}) {
  return (
    <div className="pd-chip-group" role="group" aria-label={label}>
      {options.map((o) => (
        <Button
          key={o.value}
          variant={value.includes(o.value) ? 'soft' : 'outline'}
          size="sm"
          aria-pressed={value.includes(o.value)}
          disabled={o.disabled}
          onClick={() =>
            onValueChange(
              value.includes(o.value)
                ? value.filter((v) => v !== o.value)
                : multiple
                  ? [...value, o.value]
                  : [o.value],
            )
          }
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}
export function OtpInput({
  label,
  value,
  onValueChange,
  length = 6,
  name,
  disabled,
  autoFocus,
  onComplete,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  length?: number;
  name?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (v: string) => void;
}) {
  const { digits } = usePrime();
  return (
    <Input
      label={label}
      name={name}
      disabled={disabled}
      autoFocus={autoFocus}
      dir="ltr"
      autoComplete="one-time-code"
      inputMode="numeric"
      maxLength={length}
      className="pd-otp"
      value={digits === 'fa' ? toFaDigits(value) : value}
      onChange={(e) => {
        const n = toEnDigits(e.target.value).replace(/\D/g, '').slice(0, length);
        onValueChange(n);
        if (n.length === length) onComplete?.(n);
      }}
    />
  );
}
export type PersianInputKind = 'mobile' | 'nationalId' | 'card' | 'iban' | 'postalCode';
export interface PersianInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  kind: PersianInputKind;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, valid: boolean) => void;
}
export function PersianInput({
  kind,
  value,
  defaultValue = '',
  onValueChange,
  name,
  disabled,
  error,
  onBlur,
  ...p
}: PersianInputProps) {
  const [raw, setRaw] = useControllable(value, defaultValue),
    [touched, setTouched] = useState(false),
    { digits } = usePrime();
  const l = useLabels(
    {
      mobile: 'شماره موبایل معتبر نیست.',
      nationalId: 'کد ملی معتبر نیست.',
      card: 'شماره کارت معتبر نیست.',
      iban: 'شماره شبا معتبر نیست.',
      postalCode: 'کد پستی معتبر نیست.',
    },
    {
      mobile: 'Invalid mobile number.',
      nationalId: 'Invalid national ID.',
      card: 'Invalid card number.',
      iban: 'Invalid IBAN.',
      postalCode: 'Invalid postal code.',
    },
  );
  const valid = {
    mobile: isValidMobile,
    nationalId: isValidNationalId,
    card: isValidCardNumber,
    iban: isValidIban,
    postalCode: isValidPostalCode,
  }[kind](raw);
  let shown = kind === 'card' ? formatCardNumber(raw) : raw;
  if (digits === 'fa' && kind !== 'iban') shown = toFaDigits(shown);
  return (
    <>
      <Input
        {...p}
        disabled={disabled}
        error={error ?? (touched && raw && !valid ? l[kind] : undefined)}
        inputMode={kind === 'iban' ? 'text' : 'numeric'}
        dir="ltr"
        autoComplete={kind === 'mobile' ? 'tel-national' : kind === 'card' ? 'cc-number' : 'off'}
        value={shown}
        onChange={(e) => {
          let next = toEnDigits(e.target.value);
          next =
            kind === 'iban'
              ? next
                  .replace(/[^a-z\d]/gi, '')
                  .toUpperCase()
                  .slice(0, 26)
              : kind === 'mobile'
                ? normalizeMobile(next).slice(0, 11)
                : next.replace(/\D/g, '').slice(0, kind === 'card' ? 16 : 10);
          setRaw(next);
          onValueChange?.(
            next,
            {
              mobile: isValidMobile,
              nationalId: isValidNationalId,
              card: isValidCardNumber,
              iban: isValidIban,
              postalCode: isValidPostalCode,
            }[kind](next),
          );
        }}
        onBlur={(e) => {
          setTouched(true);
          onBlur?.(e);
        }}
      />
      {name && <input type="hidden" name={name} value={raw} disabled={disabled} />}
    </>
  );
}
export const MobileInput = (p: Omit<PersianInputProps, 'kind'>) => (
  <PersianInput kind="mobile" {...p} />
);
export const NationalIdInput = (p: Omit<PersianInputProps, 'kind'>) => (
  <PersianInput kind="nationalId" {...p} />
);
export const CardNumberInput = (p: Omit<PersianInputProps, 'kind'>) => (
  <PersianInput kind="card" {...p} />
);
export const IbanInput = (p: Omit<PersianInputProps, 'kind'>) => (
  <PersianInput kind="iban" {...p} />
);
export const PostalCodeInput = (p: Omit<PersianInputProps, 'kind'>) => (
  <PersianInput kind="postalCode" {...p} />
);
export function ProvinceSelect(p: Omit<Parameters<typeof Select>[0], 'options'>) {
  return <Select options={PROVINCES.map((p) => ({ label: p, value: p }))} {...p} />;
}
export function PriceInput({
  value,
  onValueChange,
  label,
  name,
  disabled,
  ...p
}: Omit<InputProps, 'value' | 'onChange' | 'defaultValue'> & {
  value: number;
  onValueChange: (v: number) => void;
  label: string;
}) {
  const { locale } = usePrime();
  return (
    <>
      <Input
        {...p}
        label={label}
        disabled={disabled}
        inputMode="numeric"
        dir="ltr"
        value={formatNumber(value, {}, locale)}
        description={
          locale === 'fa-IR' ? `${numberToWords(value)} تومان` : formatMoney(value, 'IRT', locale)
        }
        onChange={(e) => {
          const n = Number(toEnDigits(e.target.value).replace(/[^\d]/g, ''));
          if (Number.isSafeInteger(n)) onValueChange(n);
        }}
      />
      {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
    </>
  );
}
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  onSelect: () => void;
}
export function CommandPalette({
  open,
  onOpenChange,
  items,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: CommandItem[];
  title?: string;
}) {
  const [query, setQuery] = useState(''),
    [active, setActive] = useState(0),
    fallback = useLabels('جست‌وجو و فرمان‌ها', 'Search and commands'),
    empty = useLabels('نتیجه‌ای پیدا نشد', 'No results'),
    id = useId(),
    shown = items.filter((i) =>
      searchText(i.label + ' ' + (i.description ?? '')).includes(searchText(query)),
    );
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title ?? fallback}>
      <Input
        autoFocus
        aria-label={title ?? fallback}
        role="combobox"
        aria-expanded="true"
        aria-controls={`${id}-list`}
        aria-activedescendant={shown[active] ? `${id}-${active}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        startAdornment={<Icon name="search" />}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) =>
              Math.max(0, Math.min(shown.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))),
            );
          }
          if (e.key === 'Enter' && shown[active]) {
            e.preventDefault();
            shown[active].onSelect();
            onOpenChange(false);
          }
        }}
      />
      <ul
        className="pd-command-list"
        role="listbox"
        id={`${id}-list`}
        aria-label={title ?? fallback}
      >
        {shown.map((i, index) => (
          <li
            id={`${id}-${index}`}
            role="option"
            aria-selected={index === active}
            key={i.id}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              i.onSelect();
              onOpenChange(false);
            }}
          >
            {i.icon}
            <span>
              {i.label}
              {i.description && <small>{i.description}</small>}
            </span>
          </li>
        ))}
      </ul>
      {!shown.length && <p>{empty}</p>}
    </Dialog>
  );
}
