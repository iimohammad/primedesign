import { useCallback, useEffect, useRef, useState } from 'react';
export const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (v: T) => void,
): [T, (v: T) => void] {
  const [inner, setInner] = useState(defaultValue);
  return [
    value === undefined ? inner : value,
    useCallback(
      (v: T) => {
        if (value === undefined) setInner(v);
        onChange?.(v);
      },
      [value, onChange],
    ),
  ];
}
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
export const focusable =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]';
