'use client';
import { Icon } from '@primedesign/icons';
import {
  addDays,
  formatJalali,
  formatNumber,
  isDateAllowed,
  isRangeAllowed,
  JALALI_MONTHS,
  jalaliMonthLength,
  parseJalali,
  sameDay,
  startOfDay,
  toGregorian,
  toISODate,
  toJalali,
  WEEKDAYS,
} from '@primedesign/persian';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Dialog } from './overlays.js';
import { Button, IconButton, Input, Select, type InputProps } from './primitives.js';
import { useLabels, usePrime } from './provider.js';
import { useControllable } from './utils.js';
export interface DateRules {
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
}
export interface CalendarProps extends DateRules {
  value?: Date | null;
  onValueChange?: (d: Date) => void;
  defaultMonth?: Date;
  range?: { start: Date | null; end: Date | null };
  autoFocus?: boolean;
  footer?: ReactNode;
}
export function Calendar({
  value,
  onValueChange,
  defaultMonth,
  min,
  max,
  isDateDisabled,
  range,
  autoFocus,
  footer,
}: CalendarProps) {
  const today = startOfDay(new Date()),
    initial = value ?? defaultMonth ?? today,
    [month, setMonth] = useState(() => toJalali(initial)),
    [focused, setFocused] = useState(initial),
    grid = useRef<HTMLTableElement>(null),
    id = useId(),
    { locale, digits, dir } = usePrime(),
    l = useLabels(
      { prev: 'ماه قبل', next: 'ماه بعد', month: 'ماه', year: 'سال' },
      { prev: 'Previous month', next: 'Next month', month: 'Month', year: 'Year' },
    );
  const first = toGregorian(month.year, month.month, 1)!,
    count = jalaliMonthLength(month.year, month.month),
    offset = (first.getDay() + 1) % 7,
    start = addDays(first, -offset),
    rules = { min, max, isDateDisabled };
  useEffect(() => {
    if (value) {
      setMonth(toJalali(value));
      setFocused(value);
    }
  }, [value?.getTime()]);
  useEffect(() => {
    if (autoFocus) grid.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [autoFocus]);
  const shift = (by: number) => {
    let y = month.year,
      m = month.month + by;
    if (m < 1) {
      y--;
      m = 12;
    }
    if (m > 12) {
      y++;
      m = 1;
    }
    if (y >= 1200 && y <= 1600) setMonth({ year: y, month: m, day: 1 });
  };
  const last = addDays(first, count - 1),
    prevDisabled =
      (month.year === 1200 && month.month === 1) || (!!min && first <= startOfDay(min)),
    nextDisabled =
      (month.year === 1600 && month.month === 12) || (!!max && last >= startOfDay(max));
  const focusDay = (d: Date) => {
    const j = toJalali(d);
    if (j.year < 1200 || j.year > 1600) return;
    setFocused(d);
    if (j.year !== month.year || j.month !== month.month) setMonth(j);
    requestAnimationFrame(() =>
      grid.current
        ?.querySelector<HTMLButtonElement>(`button[data-date="${toISODate(d)}"]`)
        ?.focus(),
    );
  };
  const focusedInMonth =
    toJalali(focused).year === month.year && toJalali(focused).month === month.month;
  return (
    <div className="pd-calendar">
      <div className="pd-calendar-head">
        <IconButton
          label={l.prev}
          icon={dir === 'rtl' ? 'chevronRight' : 'chevronLeft'}
          variant="ghost"
          size="sm"
          disabled={prevDisabled}
          onClick={() => shift(-1)}
        />
        <strong aria-live="polite" id={`${id}-title`}>
          {JALALI_MONTHS[month.month - 1]}{' '}
          {formatNumber(month.year, { useGrouping: false }, locale)}
        </strong>
        <IconButton
          label={l.next}
          icon={dir === 'rtl' ? 'chevronLeft' : 'chevronRight'}
          variant="ghost"
          size="sm"
          disabled={nextDisabled}
          onClick={() => shift(1)}
        />
      </div>
      <div className="pd-calendar-selects">
        <Select
          aria-label={l.month}
          value={String(month.month)}
          onChange={(e) => setMonth((m) => ({ ...m, month: Number(e.target.value) }))}
          options={JALALI_MONTHS.map((label, i) => ({ label, value: String(i + 1) }))}
        />
        <Select
          aria-label={l.year}
          value={String(month.year)}
          onChange={(e) => setMonth((m) => ({ ...m, year: Number(e.target.value) }))}
          options={Array.from(
            {
              length:
                Math.min(1600, max ? toJalali(max).year : month.year + 100) -
                Math.max(1200, min ? toJalali(min).year : month.year - 100) +
                1,
            },
            (_, i) => {
              const year = Math.max(1200, min ? toJalali(min).year : month.year - 100) + i;
              return {
                label: formatNumber(year, { useGrouping: false }, locale),
                value: String(year),
              };
            },
          )}
        />
      </div>
      <table ref={grid} role="grid" aria-labelledby={`${id}-title`}>
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" abbr={d}>
                {d.slice(0, 1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil((offset + count) / 7) }, (_, week) => (
            <tr key={week}>
              {Array.from({ length: 7 }, (_, day) => {
                const d = addDays(start, week * 7 + day),
                  j = toJalali(d),
                  outside = j.month !== month.month,
                  allowed = !outside && isDateAllowed(d, rules),
                  selected = sameDay(value, d),
                  inRange =
                    range?.start &&
                    range?.end &&
                    d >= startOfDay(range.start) &&
                    d <= startOfDay(range.end);
                return (
                  <td
                    key={day}
                    role="gridcell"
                    aria-selected={selected || sameDay(range?.start, d) || sameDay(range?.end, d)}
                    data-range={inRange || undefined}
                  >
                    <button
                      type="button"
                      data-date={toISODate(d)}
                      data-outside={outside || undefined}
                      aria-label={formatJalali(d, 'long', digits)}
                      aria-disabled={!allowed || undefined}
                      aria-current={sameDay(d, today) ? 'date' : undefined}
                      tabIndex={
                        !outside && (sameDay(d, focused) || (!focusedInMonth && j.day === 1))
                          ? 0
                          : -1
                      }
                      onFocus={() => setFocused(d)}
                      onClick={() => allowed && onValueChange?.(d)}
                      onKeyDown={(e) => {
                        const move: { [key: string]: number } = {
                          ArrowLeft: dir === 'rtl' ? 1 : -1,
                          ArrowRight: dir === 'rtl' ? -1 : 1,
                          ArrowUp: -7,
                          ArrowDown: 7,
                        };
                        if (move[e.key]) {
                          e.preventDefault();
                          focusDay(addDays(d, move[e.key]));
                        } else if (e.key === 'Home') {
                          e.preventDefault();
                          focusDay(first);
                        } else if (e.key === 'End') {
                          e.preventDefault();
                          focusDay(last);
                        }
                      }}
                    >
                      {digits === 'fa' ? formatNumber(j.day, {}, 'fa-IR') : j.day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {footer && <div className="pd-calendar-footer">{footer}</div>}
    </div>
  );
}
export interface DatePickerProps
  extends
    Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'type'>,
    DateRules {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (v: Date | null) => void;
}
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  isDateDisabled,
  label,
  name,
  disabled,
  readOnly,
  error,
  onBlur,
  ...p
}: DatePickerProps) {
  const [selected, setSelected] = useControllable(value, defaultValue, onValueChange),
    { digits } = usePrime(),
    [text, setText] = useState(selected ? formatJalali(selected, 'numeric', digits) : ''),
    [invalid, setInvalid] = useState(false),
    [open, setOpen] = useState(false),
    input = useRef<HTMLInputElement>(null),
    l = useLabels(
      {
        open: 'انتخاب تاریخ',
        today: 'امروز',
        clear: 'پاک کردن',
        invalid: 'تاریخ نامعتبر یا خارج از محدوده است.',
      },
      {
        open: 'Choose a date',
        today: 'Today',
        clear: 'Clear',
        invalid: 'Invalid or unavailable date.',
      },
    ),
    rules = { min, max, isDateDisabled };
  useEffect(() => {
    setText(selected ? formatJalali(selected, 'numeric', digits) : '');
    setInvalid(false);
    input.current?.setCustomValidity('');
  }, [selected?.getTime(), digits]);
  const commit = (d: Date | null) => {
    if (d && !isDateAllowed(d, rules)) return false;
    setSelected(d);
    setText(d ? formatJalali(d, 'numeric', digits) : '');
    setInvalid(false);
    input.current?.setCustomValidity('');
    return true;
  };
  const validate = () => {
    const d = text.trim() ? parseJalali(text) : null;
    const ok = !text.trim() || (!!d && isDateAllowed(d, rules));
    setInvalid(!ok);
    input.current?.setCustomValidity(ok ? '' : l.invalid);
    if (ok) commit(d);
    return ok;
  };
  return (
    <>
      <Input
        {...p}
        ref={input}
        label={label}
        disabled={disabled}
        readOnly={readOnly}
        dir="ltr"
        value={text}
        placeholder={p.placeholder ?? '۱۴۰۵/۰۸/۱۰'}
        error={error ?? (invalid ? l.invalid : undefined)}
        onChange={(e) => {
          setText(e.target.value);
          const d = parseJalali(e.target.value);
          input.current?.setCustomValidity(
            e.target.value.trim() && (!d || !isDateAllowed(d, rules)) ? l.invalid : '',
          );
        }}
        onBlur={(e) => {
          validate();
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          p.onKeyDown?.(e);
          if (e.key === 'Enter' && !validate()) e.preventDefault();
        }}
        endAdornment={
          <IconButton
            icon="calendar"
            label={l.open}
            size="sm"
            variant="ghost"
            disabled={disabled || readOnly}
            onClick={() => setOpen(true)}
          />
        }
      />
      {name && (
        <input
          type="hidden"
          name={name}
          value={selected ? toISODate(selected) : ''}
          disabled={disabled}
        />
      )}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={typeof label === 'string' ? label : l.open}
        size="sm"
      >
        <Calendar
          value={selected}
          {...rules}
          autoFocus
          onValueChange={(d) => {
            if (commit(d)) setOpen(false);
          }}
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={!isDateAllowed(new Date(), rules)}
                onClick={() => {
                  if (commit(startOfDay(new Date()))) setOpen(false);
                }}
              >
                {l.today}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  commit(null);
                  setOpen(false);
                }}
              >
                {l.clear}
              </Button>
            </>
          }
        />
      </Dialog>
    </>
  );
}
export interface DateRange {
  start: Date | null;
  end: Date | null;
}
export interface DateRangePreset {
  label: string;
  range: (today: Date) => { start: Date; end: Date };
}
export const defaultRangePresets: DateRangePreset[] = [
  { label: '۷ روز اخیر', range: (t) => ({ start: addDays(t, -6), end: t }) },
  { label: '۳۰ روز اخیر', range: (t) => ({ start: addDays(t, -29), end: t }) },
  {
    label: 'این ماه',
    range: (t) => {
      const j = toJalali(t);
      return { start: toGregorian(j.year, j.month, 1)!, end: t };
    },
  },
];
export function DateRangePicker({
  label,
  value,
  onValueChange,
  min,
  max,
  isDateDisabled,
  presets = defaultRangePresets,
  disabled,
  name,
}: {
  label: string;
  value: DateRange;
  onValueChange: (v: DateRange) => void;
  presets?: DateRangePreset[];
  disabled?: boolean;
  name?: string;
} & DateRules) {
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState(value),
    l = useLabels(
      {
        placeholder: 'انتخاب بازه',
        apply: 'اعمال بازه',
        cancel: 'انصراف',
        end: 'تاریخ پایان را انتخاب کنید.',
      },
      {
        placeholder: 'Select range',
        apply: 'Apply range',
        cancel: 'Cancel',
        end: 'Choose the end date.',
      },
    ),
    rules = { min, max, isDateDisabled },
    valid = !!draft.start && !!draft.end && isRangeAllowed(draft.start, draft.end, rules),
    { digits } = usePrime();
  const today = startOfDay(new Date());
  return (
    <>
      <div className="pd-field">
        <span className="pd-label">{label}</span>
        <Button
          variant="outline"
          fullWidth
          disabled={disabled}
          startIcon={<Icon name="calendar" />}
          onClick={() => {
            setDraft(value);
            setOpen(true);
          }}
        >
          {value.start && value.end
            ? `${formatJalali(value.start, 'numeric', digits)} — ${formatJalali(value.end, 'numeric', digits)}`
            : l.placeholder}
        </Button>
      </div>
      {name && (
        <>
          <input
            type="hidden"
            name={`${name}_start`}
            value={value.start ? toISODate(value.start) : ''}
            disabled={disabled}
          />
          <input
            type="hidden"
            name={`${name}_end`}
            value={value.end ? toISODate(value.end) : ''}
            disabled={disabled}
          />
        </>
      )}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={label}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {l.cancel}
            </Button>
            <Button
              disabled={!valid}
              onClick={() => {
                if (valid) {
                  onValueChange(draft);
                  setOpen(false);
                }
              }}
            >
              {l.apply}
            </Button>
          </>
        }
      >
        <div className="pd-range-presets">
          {presets.map((p) => {
            const r = p.range(today);
            return (
              <Button
                key={p.label}
                size="sm"
                variant="soft"
                disabled={!isRangeAllowed(r.start, r.end, rules)}
                onClick={() => setDraft(r)}
              >
                {p.label}
              </Button>
            );
          })}
        </div>
        <Calendar
          value={draft.end ?? draft.start}
          range={draft}
          {...rules}
          autoFocus
          onValueChange={(d) =>
            setDraft(
              !draft.start || draft.end
                ? { start: d, end: null }
                : d < draft.start
                  ? { start: d, end: draft.start }
                  : { start: draft.start, end: d },
            )
          }
        />
        <p className="pd-description" aria-live="polite">
          {draft.start && !draft.end
            ? l.end
            : draft.start && draft.end
              ? `${formatJalali(draft.start)} — ${formatJalali(draft.end)}`
              : ''}
        </p>
      </Dialog>
    </>
  );
}
export function MonthPicker({
  label,
  value,
  onValueChange,
  minYear = 1300,
  maxYear = 1500,
}: {
  label: string;
  value: { year: number; month: number };
  onValueChange: (v: { year: number; month: number }) => void;
  minYear?: number;
  maxYear?: number;
}) {
  const { locale } = usePrime();
  return (
    <fieldset className="pd-month-picker">
      <legend className="pd-label">{label}</legend>
      <Select
        aria-label={locale === 'fa-IR' ? 'سال' : 'Year'}
        value={String(value.year)}
        onChange={(e) => onValueChange({ ...value, year: Number(e.target.value) })}
        options={Array.from({ length: Math.max(0, maxYear - minYear + 1) }, (_, i) => ({
          value: String(minYear + i),
          label: formatNumber(minYear + i, { useGrouping: false }, locale),
        }))}
      />
      <div>
        {JALALI_MONTHS.map((m, i) => (
          <Button
            key={m}
            variant={value.month === i + 1 ? 'solid' : 'ghost'}
            aria-pressed={value.month === i + 1}
            onClick={() => onValueChange({ ...value, month: i + 1 })}
          >
            {m}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}
