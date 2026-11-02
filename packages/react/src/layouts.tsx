'use client';
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Button, IconButton } from './primitives.js';
import { Drawer } from './overlays.js';
import { SideNav, type SideNavItem } from './navigation.js';
import { useLabels, usePrime } from './provider.js';
import { cx, useControllable, useLatest } from './utils.js';
export interface ResizablePanelSpec {
  id: string;
  content: ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}
export interface ResizablePanelGroupProps {
  panels: ResizablePanelSpec[];
  orientation?: 'horizontal' | 'vertical';
  onLayoutChange?: (sizes: number[]) => void;
  storageKey?: string;
  className?: string;
  label: string;
  style?: React.CSSProperties;
}
export function normalizePanelSizes(panels: ResizablePanelSpec[], candidate?: number[]): number[] {
  const defaults = panels.map((p) => p.defaultSize ?? 100 / panels.length);
  const base =
    candidate?.length === panels.length && candidate.every((n) => Number.isFinite(n) && n > 0)
      ? candidate
      : defaults;
  const sum = base.reduce((a, b) => a + b, 0) || 1;
  return base.map((n) => (n / sum) * 100);
}
export function resizePanelPair(
  sizes: number[],
  panels: ResizablePanelSpec[],
  index: number,
  next: number,
): number[] {
  const total = sizes[index] + sizes[index + 1],
    min = Math.max(panels[index].minSize ?? 10, total - (panels[index + 1].maxSize ?? 90)),
    max = Math.min(panels[index].maxSize ?? 90, total - (panels[index + 1].minSize ?? 10));
  if (min > max) return sizes;
  const first = Math.max(min, Math.min(max, next)),
    result = [...sizes];
  result[index] = first;
  result[index + 1] = total - first;
  return result;
}
export function ResizablePanelGroup({
  panels,
  orientation = 'horizontal',
  onLayoutChange,
  storageKey,
  className,
  label,
  style,
}: ResizablePanelGroupProps) {
  const [sizes, setSizes] = useState(() => normalizePanelSizes(panels)),
    container = useRef<HTMLDivElement>(null),
    drag = useRef<{ index: number; point: number; sizes: number[] } | null>(null),
    callback = useLatest(onLayoutChange),
    { dir } = usePrime(),
    resizeLabel = useLabels('تغییر اندازهٔ پنل', 'Resize panel');
  useEffect(() => {
    setSizes(normalizePanelSizes(panels));
    if (storageKey)
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
        if (Array.isArray(saved)) setSizes(normalizePanelSizes(panels, saved));
      } catch {}
  }, [panels.map((p) => p.id).join('|'), storageKey]);
  const commit = (next: number[]) => {
    setSizes(next);
    callback.current?.(next);
    if (storageKey)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const active = drag.current;
      if (!active || !container.current) return;
      const size =
        orientation === 'horizontal'
          ? container.current.clientWidth
          : container.current.clientHeight;
      if (!size) return;
      const delta =
        (((orientation === 'horizontal' ? e.clientX : e.clientY) - active.point) / size) *
        100 *
        (orientation === 'horizontal' && dir === 'rtl' ? -1 : 1);
      commit(
        resizePanelPair(active.sizes, panels, active.index, active.sizes[active.index] + delta),
      );
    };
    const end = () => {
      drag.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [orientation, dir, panels, storageKey]);
  return (
    <div
      ref={container}
      className={cx('pd-resizable', `pd-resizable--${orientation}`, className)}
      style={style}
      role="group"
      aria-label={label}
    >
      {panels.map((panel, index) => (
        <div
          key={panel.id}
          className="pd-resizable-section"
          style={{ flexGrow: sizes[index] ?? 1, flexBasis: 0 }}
        >
          <div id={panel.id} className="pd-resizable-panel">
            {panel.content}
          </div>
          {index < panels.length - 1 && (
            <div
              role="separator"
              tabIndex={0}
              className="pd-resizable-handle"
              aria-label={`${resizeLabel} ${index + 1}`}
              aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
              aria-controls={panel.id}
              aria-valuenow={Math.round(sizes[index] ?? 0)}
              aria-valuemin={panel.minSize ?? 10}
              aria-valuemax={panel.maxSize ?? 90}
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.focus();
                drag.current = {
                  index,
                  point: orientation === 'horizontal' ? e.clientX : e.clientY,
                  sizes: [...sizes],
                };
              }}
              onKeyDown={(e) => {
                const horizontal = orientation === 'horizontal',
                  step = e.shiftKey ? 10 : 2,
                  forward = horizontal ? (dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown',
                  backward = horizontal ? (dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
                let next: number;
                if (e.key === forward) next = sizes[index] + step;
                else if (e.key === backward) next = sizes[index] - step;
                else if (e.key === 'Home') next = panel.minSize ?? 10;
                else if (e.key === 'End') next = panel.maxSize ?? 90;
                else return;
                e.preventDefault();
                commit(resizePanelPair(sizes, panels, index, next));
              }}
            >
              <span />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
export interface SidebarProps {
  label: string;
  items: SideNavItem[];
  active?: string;
  onSelect?: (id: string) => void;
  brand?: ReactNode;
  footer?: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (v: boolean) => void;
  className?: string;
}
export function Sidebar({
  label,
  items,
  active,
  onSelect,
  brand,
  footer,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  mobileOpen = false,
  onMobileOpenChange,
  className,
}: SidebarProps) {
  const [small, setSmall] = useControllable(collapsed, defaultCollapsed, onCollapsedChange),
    l = useLabels(
      { collapse: 'جمع کردن منو', expand: 'باز کردن منو' },
      { collapse: 'Collapse sidebar', expand: 'Expand sidebar' },
    );
  const content = (
    <>
      <div className="pd-sidebar-brand">
        {brand}
        <IconButton
          icon={small ? 'chevronLeft' : 'chevronRight'}
          variant="ghost"
          size="sm"
          label={small ? l.expand : l.collapse}
          onClick={() => setSmall(!small)}
        />
      </div>
      <SideNav
        label={label}
        items={items}
        active={active}
        collapsed={small}
        onSelect={(id) => {
          onSelect?.(id);
          onMobileOpenChange?.(false);
        }}
      />
      {footer && <div className="pd-sidebar-footer">{footer}</div>}
    </>
  );
  return (
    <>
      <aside
        className={cx('pd-sidebar', small && 'pd-sidebar--collapsed', className)}
        aria-label={label}
      >
        {content}
      </aside>
      <Drawer
        open={mobileOpen}
        onOpenChange={(v) => onMobileOpenChange?.(v)}
        title={label}
        placement="start"
        size="sm"
      >
        <SideNav
          label={label}
          items={items}
          active={active}
          onSelect={(id) => {
            onSelect?.(id);
            onMobileOpenChange?.(false);
          }}
        />
      </Drawer>
    </>
  );
}
export function SidebarTrigger({ onClick, label }: { onClick: () => void; label?: string }) {
  const fallback = useLabels('باز کردن منو', 'Open sidebar');
  return <IconButton icon="menu" label={label ?? fallback} variant="ghost" onClick={onClick} />;
}
export function Splitter(props: ResizablePanelGroupProps) {
  return <ResizablePanelGroup {...props} />;
}
