'use client';
import { Icon } from '@primedesign/icons';
import { formatNumber, searchText } from '@primedesign/persian';
import {
  Badge,
  Button,
  Checkbox,
  EmptyState,
  IconButton,
  Input,
  Pagination,
  Select,
  Skeleton,
  cx,
  useLabels,
  usePrime,
} from '@primedesign/react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
export interface Column<T> {
  id: string;
  header: string;
  accessor?: (row: T) => unknown;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  numeric?: boolean;
  width?: number;
  minWidth?: number;
  pin?: 'start' | 'end';
}
export type SortState = { id: string; direction: 'asc' | 'desc' } | null;
export type FilterOperator = 'contains' | 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
export interface ColumnFilter {
  id: string;
  operator: FilterOperator;
  value: string | number;
}
export interface TableState {
  page: number;
  pageSize: number;
  sort: SortState;
  search: string;
  filters: ColumnFilter[];
  hiddenColumns: string[];
  columnOrder: string[];
}
export const defaultTableState: TableState = {
  page: 1,
  pageSize: 10,
  sort: null,
  search: '',
  filters: [],
  hiddenColumns: [],
  columnOrder: [],
};
const cellValue = <T,>(row: T, column: Column<T>) =>
  column.accessor ? column.accessor(row) : (row as Record<string, unknown>)[column.id];
export function getTableRows<T>(
  rows: T[],
  columns: Column<T>[],
  state: TableState,
  locale = 'fa-IR',
): T[] {
  let out = rows.filter((row) => {
    if (
      state.search &&
      !columns.some((c) =>
        searchText(String(cellValue(row, c) ?? '')).includes(searchText(state.search)),
      )
    )
      return false;
    return state.filters.every((f) => {
      const column = columns.find((c) => c.id === f.id);
      if (!column) return true;
      const value = cellValue(row, column);
      if (f.operator === 'contains')
        return searchText(String(value ?? '')).includes(searchText(String(f.value)));
      if (f.operator === 'eq')
        return searchText(String(value ?? '')) === searchText(String(f.value));
      const a = Number(value),
        b = Number(f.value);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      return f.operator === 'gt'
        ? a > b
        : f.operator === 'gte'
          ? a >= b
          : f.operator === 'lt'
            ? a < b
            : a <= b;
    });
  });
  if (state.sort) {
    const column = columns.find((c) => c.id === state.sort!.id);
    if (column) {
      const factor = state.sort.direction === 'asc' ? 1 : -1;
      out = [...out].sort((a, b) => {
        const x = cellValue(a, column),
          y = cellValue(b, column);
        return (
          factor *
          (typeof x === 'number' && typeof y === 'number'
            ? x - y
            : String(x ?? '').localeCompare(String(y ?? ''), locale, { numeric: true }))
        );
      });
    }
  }
  return out;
}
/** CSV cells starting with spreadsheet formulas are escaped before export. */
export function toCSV<T>(rows: T[], columns: Column<T>[]): string {
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return (
    '\uFEFF' +
    [
      columns.map((c) => cell(c.header)).join(','),
      ...rows.map((r) => columns.map((c) => cell(cellValue(r, c))).join(',')),
    ].join('\r\n')
  );
}
export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  caption: string;
  description?: string;
  state?: Partial<TableState>;
  defaultState?: Partial<TableState>;
  onStateChange?: (s: TableState) => void;
  serverSide?: boolean;
  rowCount?: number;
  loading?: boolean;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  bulkActions?: (ids: string[]) => ReactNode;
  rowActions?: (row: T) => ReactNode;
  renderExpanded?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  toolbar?: ReactNode;
  exportable?: boolean;
  onExport?: (rows: T[]) => void;
  virtualized?: boolean;
  height?: number;
  rowHeight?: number;
  className?: string;
}
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  description,
  state,
  defaultState,
  onStateChange,
  serverSide,
  rowCount,
  loading,
  selectable,
  selected,
  onSelectedChange,
  bulkActions,
  rowActions,
  renderExpanded,
  onRowClick,
  empty,
  toolbar,
  exportable = true,
  onExport,
  virtualized = false,
  height = 480,
  rowHeight = 56,
  className,
}: DataTableProps<T>) {
  const [inner, setInner] = useState<TableState>({ ...defaultTableState, ...defaultState }),
    [selection, setSelection] = useState<string[]>([]),
    [widths, setWidths] = useState<Record<string, number>>({}),
    [expanded, setExpanded] = useState<string[]>([]),
    [scroll, setScroll] = useState(0),
    wrapper = useRef<HTMLDivElement>(null),
    s = { ...inner, ...state },
    sel = selected ?? selection,
    { locale } = usePrime();
  const l = useLabels(
    {
      search: 'جست‌وجو در جدول',
      columns: 'ستون‌ها',
      export: 'خروجی CSV',
      selectAll: 'انتخاب ردیف‌های این صفحه',
      selectRow: 'انتخاب ردیف',
      empty: 'داده‌ای پیدا نشد',
      emptyText: 'عبارت جست‌وجو یا فیلترها را تغییر دهید.',
      rows: 'ردیف',
      selected: 'انتخاب شده',
      pageSize: 'تعداد در صفحه',
      actions: 'عملیات',
      expand: 'جزئیات ردیف',
      resize: 'تغییر عرض ستون',
      move: 'جابه‌جایی ستون',
      filter: 'فیلتر',
      clear: 'حذف فیلترها',
      loading: 'در حال بارگذاری',
    },
    {
      search: 'Search table',
      columns: 'Columns',
      export: 'Export CSV',
      selectAll: 'Select page rows',
      selectRow: 'Select row',
      empty: 'No records found',
      emptyText: 'Try a different search or filter.',
      rows: 'rows',
      selected: 'selected',
      pageSize: 'Rows per page',
      actions: 'Actions',
      expand: 'Expand row',
      resize: 'Resize column',
      move: 'Move column',
      filter: 'Filter',
      clear: 'Clear filters',
      loading: 'Loading',
    },
  );
  const update = (patch: Partial<TableState>) => {
    const next = { ...s, ...patch };
    setInner(next);
    onStateChange?.(next);
  };
  const setSelected = (ids: string[]) => {
    if (selected === undefined) setSelection(ids);
    onSelectedChange?.(ids);
  };
  const processed = useMemo(
    () => (serverSide ? rows : getTableRows(rows, columns, s, locale)),
    [
      rows,
      columns,
      s.search,
      JSON.stringify(s.filters),
      JSON.stringify(s.sort),
      serverSide,
      locale,
    ],
  );
  const count = serverSide ? (rowCount ?? rows.length) : processed.length,
    page = Math.max(1, Math.min(s.page, Math.max(1, Math.ceil(count / s.pageSize)))),
    paged = serverSide ? processed : processed.slice((page - 1) * s.pageSize, page * s.pageSize);
  const ordered = [...columns].sort((a, b) => {
      const i = s.columnOrder.indexOf(a.id),
        j = s.columnOrder.indexOf(b.id);
      return (
        (i < 0 ? columns.indexOf(a) + columns.length : i) -
        (j < 0 ? columns.indexOf(b) + columns.length : j)
      );
    }),
    visible = ordered.filter((c) => !s.hiddenColumns.includes(c.id));
  const ids = paged.map(getRowId),
    all = ids.length > 0 && ids.every((id) => sel.includes(id)),
    some = !all && ids.some((id) => sel.includes(id));
  const virtual = virtualized && !renderExpanded,
    start = virtual
      ? Math.min(
          Math.max(0, paged.length - 1),
          Math.max(0, Math.floor(Math.max(0, scroll - 56) / rowHeight) - 5),
        )
      : 0,
    end = virtual
      ? Math.min(paged.length, start + Math.ceil(height / rowHeight) + 10)
      : paged.length,
    shown = paged.slice(start, end),
    extra = (selectable ? 1 : 0) + (renderExpanded ? 1 : 0) + (rowActions ? 1 : 0),
    colspan = visible.length + extra;
  useEffect(() => {
    setScroll(0);
    wrapper.current?.scrollTo({ top: 0 });
  }, [s.page, s.pageSize, s.search, JSON.stringify(s.filters)]);
  const columnStyle = (c: Column<T>): CSSProperties => {
    const width = widths[c.id] ?? c.width ?? 160;
    const pinned = visible.filter((x) => x.pin === c.pin),
      position = pinned.indexOf(c),
      offset = pinned
        .slice(c.pin === 'start' ? 0 : position + 1, c.pin === 'start' ? position : undefined)
        .reduce((n, x) => n + (widths[x.id] ?? x.width ?? 160), 0);
    return {
      width,
      minWidth: c.minWidth ?? 100,
      ...(c.pin
        ? {
            position: 'sticky',
            zIndex: 2,
            background: 'var(--pd-surface)',
            [c.pin === 'start' ? 'insetInlineStart' : 'insetInlineEnd']:
              offset +
              (c.pin === 'start' ? ((selectable ? 1 : 0) + (renderExpanded ? 1 : 0)) * 44 : 0),
          }
        : {}),
    };
  };
  const exportRows = () => {
    if (onExport) {
      onExport(processed);
      return;
    }
    const blob = new Blob([toCSV(processed, visible)], { type: 'text/csv;charset=utf-8' }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'primedesign-export.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const moveColumn = (id: string, by: number) => {
    const order = ordered.map((c) => c.id),
      at = order.indexOf(id),
      to = at + by;
    if (to < 0 || to >= order.length) return;
    [order[at], order[to]] = [order[to], order[at]];
    update({ columnOrder: order });
  };
  return (
    <section className={cx('pd-data-table', className)}>
      <div className="pd-table-title">
        <div>
          <h3>{caption}</h3>
          {description && <p>{description}</p>}
        </div>
        <Badge>
          {formatNumber(count, {}, locale)} {l.rows}
        </Badge>
      </div>
      <div className="pd-table-toolbar">
        <Input
          aria-label={l.search}
          placeholder={l.search}
          startAdornment={<Icon name="search" size={18} />}
          value={s.search}
          onChange={(e) => update({ search: e.target.value, page: 1 })}
        />
        <div>
          {toolbar}
          <details className="pd-column-picker">
            <summary>
              <Icon name="filter" size={16} />
              {l.columns}
            </summary>
            <div>
              {ordered.map((c, i) => (
                <div key={c.id}>
                  <Checkbox
                    label={c.header}
                    checked={!s.hiddenColumns.includes(c.id)}
                    disabled={visible.length === 1 && !s.hiddenColumns.includes(c.id)}
                    onChange={() =>
                      update({
                        hiddenColumns: s.hiddenColumns.includes(c.id)
                          ? s.hiddenColumns.filter((id) => id !== c.id)
                          : [...s.hiddenColumns, c.id],
                      })
                    }
                  />
                  <IconButton
                    icon="chevronUp"
                    label={`${l.move} ${c.header}`}
                    variant="ghost"
                    size="sm"
                    disabled={i === 0}
                    onClick={() => moveColumn(c.id, -1)}
                  />
                  <IconButton
                    icon="chevronDown"
                    label={`${l.move} ${c.header}`}
                    variant="ghost"
                    size="sm"
                    disabled={i === ordered.length - 1}
                    onClick={() => moveColumn(c.id, 1)}
                  />
                </div>
              ))}
            </div>
          </details>
          {exportable && (
            <Button
              variant="outline"
              size="sm"
              startIcon={<Icon name="download" size={16} />}
              disabled={loading || !processed.length}
              onClick={exportRows}
            >
              {l.export}
            </Button>
          )}
        </div>
      </div>
      {columns.some((c) => c.filterable) && (
        <div className="pd-table-filters">
          {columns
            .filter((c) => c.filterable)
            .map((c) => (
              <Input
                key={c.id}
                aria-label={`${l.filter} ${c.header}`}
                placeholder={`${l.filter}: ${c.header}`}
                value={String(s.filters.find((f) => f.id === c.id)?.value ?? '')}
                onChange={(e) =>
                  update({
                    page: 1,
                    filters: [
                      ...s.filters.filter((f) => f.id !== c.id),
                      ...(e.target.value
                        ? [{ id: c.id, operator: 'contains' as const, value: e.target.value }]
                        : []),
                    ],
                  })
                }
              />
            ))}
          {!!s.filters.length && (
            <Button variant="ghost" size="sm" onClick={() => update({ filters: [], page: 1 })}>
              {l.clear}
            </Button>
          )}
        </div>
      )}
      {!!sel.length && (
        <div className="pd-table-bulk">
          <strong>
            {formatNumber(sel.length, {}, locale)} {l.selected}
          </strong>
          {bulkActions?.(sel)}
        </div>
      )}
      <div
        ref={wrapper}
        className="pd-table-scroll"
        style={{ maxHeight: height }}
        tabIndex={0}
        aria-label={caption}
        onScroll={(e) => setScroll(e.currentTarget.scrollTop)}
      >
        <table className="pd-table" aria-busy={loading || undefined} aria-rowcount={count + 1}>
          <caption className="pd-sr-only">{caption}</caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="pd-table-check">
                  <Checkbox
                    label={<span className="pd-sr-only">{l.selectAll}</span>}
                    checked={all}
                    indeterminate={some}
                    disabled={loading || !ids.length}
                    onChange={() =>
                      setSelected(
                        all
                          ? sel.filter((id) => !ids.includes(id))
                          : [...new Set([...sel, ...ids])],
                      )
                    }
                  />
                </th>
              )}
              {renderExpanded && (
                <th scope="col">
                  <span className="pd-sr-only">{l.expand}</span>
                </th>
              )}
              {visible.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  style={columnStyle(c)}
                  aria-sort={
                    c.sortable
                      ? s.sort?.id === c.id
                        ? s.sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                >
                  <span>
                    {c.sortable ? (
                      <button
                        type="button"
                        className="pd-table-sort"
                        onClick={() =>
                          update({
                            sort: {
                              id: c.id,
                              direction:
                                s.sort?.id === c.id && s.sort.direction === 'asc' ? 'desc' : 'asc',
                            },
                            page: 1,
                          })
                        }
                      >
                        {c.header}
                        <Icon name="sort" size={14} />
                      </button>
                    ) : (
                      c.header
                    )}
                  </span>
                  <input
                    type="range"
                    className="pd-column-resize"
                    aria-label={`${l.resize} ${c.header}`}
                    min={c.minWidth ?? 100}
                    max={600}
                    value={widths[c.id] ?? c.width ?? 160}
                    onChange={(e) => setWidths((v) => ({ ...v, [c.id]: e.target.valueAsNumber }))}
                  />
                </th>
              ))}
              {rowActions && <th scope="col">{l.actions}</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {Array.from({ length: colspan }, (_, j) => (
                    <td key={j}>
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))
            ) : !shown.length ? (
              <tr>
                <td colSpan={colspan}>
                  {empty ?? <EmptyState title={l.empty} description={l.emptyText} icon="search" />}
                </td>
              </tr>
            ) : (
              <>
                {virtual && start > 0 && (
                  <tr aria-hidden="true">
                    <td
                      colSpan={colspan}
                      style={{ height: start * rowHeight, padding: 0, border: 0 }}
                    />
                  </tr>
                )}
                {shown.map((row, index) => {
                  const id = getRowId(row);
                  return (
                    <TableRows
                      key={id}
                      row={row}
                      id={id}
                      columns={visible}
                      columnStyle={columnStyle}
                      rowIndex={start + index + 2}
                      selected={sel.includes(id)}
                      selectable={selectable}
                      onSelect={() =>
                        setSelected(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id])
                      }
                      selectLabel={`${l.selectRow} ${id}`}
                      expanded={expanded.includes(id)}
                      onExpand={() =>
                        setExpanded((v) =>
                          v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
                        )
                      }
                      expandLabel={l.expand}
                      renderExpanded={renderExpanded}
                      rowActions={rowActions}
                      onRowClick={onRowClick}
                      rowHeight={virtual ? rowHeight : undefined}
                      colspan={colspan}
                    />
                  );
                })}
                {virtual && end < paged.length && (
                  <tr aria-hidden="true">
                    <td
                      colSpan={colspan}
                      style={{ height: (paged.length - end) * rowHeight, padding: 0, border: 0 }}
                    />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      {loading && (
        <span className="pd-sr-only" role="status">
          {l.loading}
        </span>
      )}
      <div className="pd-table-footer">
        <Select
          aria-label={l.pageSize}
          value={String(s.pageSize)}
          onChange={(e) => update({ pageSize: Number(e.target.value), page: 1 })}
          options={[...new Set([10, 25, 50, 100, s.pageSize])]
            .sort((a, b) => a - b)
            .map((n) => ({ value: String(n), label: `${formatNumber(n, {}, locale)} ${l.rows}` }))}
        />
        <Pagination
          page={page}
          total={count}
          pageSize={s.pageSize}
          onPageChange={(p) => {
            update({ page: p });
            wrapper.current?.scrollTo({ top: 0 });
          }}
        />
      </div>
    </section>
  );
}
function TableRows<T>({
  row,
  id,
  columns,
  columnStyle,
  rowIndex,
  selected,
  selectable,
  onSelect,
  selectLabel,
  expanded,
  onExpand,
  expandLabel,
  renderExpanded,
  rowActions,
  onRowClick,
  rowHeight,
  colspan,
}: {
  row: T;
  id: string;
  columns: Column<T>[];
  columnStyle: (c: Column<T>) => CSSProperties;
  rowIndex: number;
  selected: boolean;
  selectable?: boolean;
  onSelect: () => void;
  selectLabel: string;
  expanded: boolean;
  onExpand: () => void;
  expandLabel: string;
  renderExpanded?: (row: T) => ReactNode;
  rowActions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  rowHeight?: number;
  colspan: number;
}) {
  return (
    <>
      <tr
        aria-rowindex={rowIndex}
        data-selected={selected || undefined}
        style={{ height: rowHeight }}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button,a,input,select,label,textarea'))
            onRowClick?.(row);
        }}
      >
        {selectable && (
          <td className="pd-table-check">
            <Checkbox
              label={<span className="pd-sr-only">{selectLabel}</span>}
              checked={selected}
              onChange={onSelect}
            />
          </td>
        )}
        {renderExpanded && (
          <td>
            <IconButton
              icon={expanded ? 'chevronUp' : 'chevronDown'}
              label={`${expandLabel} ${id}`}
              variant="ghost"
              size="sm"
              aria-expanded={expanded}
              onClick={onExpand}
            />
          </td>
        )}
        {columns.map((c) => (
          <td
            key={c.id}
            style={{
              ...columnStyle(c),
              ...(rowHeight ? { height: rowHeight, paddingBlock: 0 } : {}),
            }}
            className={c.numeric ? 'pd-table-numeric' : undefined}
          >
            {c.render ? c.render(row) : String(cellValue(row, c) ?? '')}
          </td>
        ))}
        {rowActions && <td>{rowActions(row)}</td>}
      </tr>
      {renderExpanded && expanded && (
        <tr>
          <td colSpan={colspan} className="pd-table-expanded">
            {renderExpanded(row)}
          </td>
        </tr>
      )}
    </>
  );
}
