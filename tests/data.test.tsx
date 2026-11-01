import {
  BarChart,
  DataTable,
  defaultTableState,
  getTableRows,
  LineChart,
  PieChart,
  toCSV,
  type Column,
} from '@primedesign/data';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
interface Row {
  id: string;
  name: string;
  amount: number;
}
const rows: Row[] = [
  { id: '1', name: 'كاربر تهران', amount: 300 },
  { id: '2', name: 'سارا', amount: 100 },
  { id: '3', name: 'کاربر شیراز', amount: 200 },
];
const columns: Column<Row>[] = [
  { id: 'name', header: 'Name', filterable: true, sortable: true },
  { id: 'amount', header: 'Amount', numeric: true, sortable: true },
];
describe('data models', () => {
  it('normalizes Persian search and applies numeric filters before sorting', () => {
    const model = getTableRows(rows, columns, {
      ...defaultTableState,
      search: 'کاربر',
      filters: [{ id: 'amount', operator: 'gte', value: 200 }],
      sort: { id: 'amount', direction: 'asc' },
    });
    expect(model.map((r) => r.id)).toEqual(['3', '1']);
    expect(rows[0].id).toBe('1');
  });
  it('exports quoted CSV and blocks spreadsheet formula injection', () => {
    const csv = toCSV([{ id: 'x', name: '=HYPERLINK("x")', amount: -100 }], columns);
    expect(csv).toContain('"\'=HYPERLINK(""x"")"');
    expect(csv).toContain('"\'-100"');
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });
});
describe('DataTable interactions', () => {
  it('resets the virtual viewport after search reduces the dataset', async () => {
    const many = Array.from({ length: 1000 }, (_, i) => ({
      id: String(i),
      name: i === 0 ? 'Unique' : 'Row ' + i,
      amount: i,
    }));
    const { container } = render(
      <DataTable
        rows={many}
        columns={columns}
        getRowId={(r) => r.id}
        caption="Virtual search"
        virtualized
        defaultState={{ pageSize: 1000 }}
      />,
    );
    fireEvent.scroll(container.querySelector('.pd-table-scroll')!, { target: { scrollTop: 9000 } });
    await userEvent.type(screen.getByRole('textbox', { name: 'جست‌وجو در جدول' }), 'Unique');
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Unique');
  });
  it('sorts and filters the actual rows', async () => {
    render(<DataTable rows={rows} columns={columns} getRowId={(r) => r.id} caption="Orders" />);
    await userEvent.click(screen.getByRole('button', { name: 'Amount' }));
    const cells = screen.getAllByRole('row').slice(1);
    expect(cells[0]).toHaveTextContent('سارا');
    await userEvent.type(screen.getByRole('textbox', { name: 'جست‌وجو در جدول' }), 'شیراز');
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('کاربر شیراز');
  });
  it('preserves selection from earlier pages when toggling the current page', async () => {
    const onSelected = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        caption="Orders"
        defaultState={{ pageSize: 1 }}
        selectable
        selected={['outside-page']}
        onSelectedChange={onSelected}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'انتخاب ردیف‌های این صفحه' }));
    expect(onSelected).toHaveBeenCalledWith(['outside-page', '1']);
  });
  it('server mode sends state without sorting or slicing server rows', async () => {
    const change = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        caption="Orders"
        serverSide
        rowCount={100}
        onStateChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Amount' }));
    expect(change).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: { id: 'amount', direction: 'asc' } }),
    );
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('كاربر تهران');
    await userEvent.type(screen.getByRole('textbox', { name: 'جست‌وجو در جدول' }), 'missing');
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });
  it('virtualizes a large page while retaining total row metadata', () => {
    const many = Array.from({ length: 10000 }, (_, i) => ({
      id: String(i),
      name: 'Row ' + i,
      amount: i,
    }));
    render(
      <DataTable
        rows={many}
        columns={columns}
        getRowId={(r) => r.id}
        caption="Large"
        virtualized
        defaultState={{ pageSize: 10000 }}
      />,
    );
    expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '10001');
    expect(screen.getAllByRole('row').length).toBeLessThan(35);
  });
  it('does not hide the final visible column', async () => {
    render(<DataTable rows={rows} columns={columns} getRowId={(r) => r.id} caption="Orders" />);
    await userEvent.click(screen.getByText('ستون‌ها'));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Name' }));
    expect(screen.getByRole('checkbox', { name: 'Amount' })).toBeDisabled();
  });
  it('renders an empty state after filtering', async () => {
    render(<DataTable rows={[]} columns={columns} getRowId={(r) => r.id} caption="Orders" />);
    expect(screen.getByText('داده‌ای پیدا نشد')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'خروجی CSV' })).toBeDisabled();
  });
});
describe('chart edge cases', () => {
  it.each([BarChart, LineChart, PieChart])(
    'handles empty datasets without NaN geometry',
    (Component) => {
      const { container } = render(<Component title="Empty" data={[]} />);
      expect(container.innerHTML).not.toContain('NaN');
      expect(screen.getByText('داده‌ای برای نمایش نیست')).toBeInTheDocument();
    },
  );
  it('renders negative values and an accessible data table', () => {
    const { container } = render(
      <BarChart
        title="Profit"
        data={[
          { label: 'Loss', value: -50 },
          { label: 'Profit', value: 100 },
        ]}
      />,
    );
    expect(container.innerHTML).not.toContain('NaN');
    expect(screen.getByRole('table')).toHaveAccessibleName('Profit');
    expect(within(screen.getByRole('table')).getByText('Loss')).toBeInTheDocument();
  });
});
