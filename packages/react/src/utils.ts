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
export function getActiveElement(): Element | null {
  let active: Element | null = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}
export function eventInside(container: Node | null, event: Event): boolean {
  return (
    !!container &&
    event.composedPath().some((node) => node instanceof Node && container.contains(node))
  );
}
export function composedContains(container: Node | null, node: Node | null): boolean {
  while (node) {
    if (node === container) return true;
    node =
      node instanceof Element && node.assignedSlot
        ? node.assignedSlot
        : node instanceof ShadowRoot
          ? node.host
          : node.parentNode;
  }
  return false;
}
// Walk the rendered tree, including named slots and nested custom elements.
export function composedQuery(container: Element, selector: string): HTMLElement[] {
  const result: HTMLElement[] = [];
  const visit = (element: Element) => {
    if (element instanceof HTMLElement && element.matches(selector)) result.push(element);
    const children =
      element instanceof HTMLSlotElement
        ? element.assignedElements({ flatten: true })
        : element.shadowRoot
          ? Array.from(element.shadowRoot.children)
          : Array.from(element.children);
    for (const child of children.length ? children : Array.from(element.children)) visit(child);
  };
  for (const child of container.children) visit(child);
  return result;
}
