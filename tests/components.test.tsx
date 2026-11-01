import * as P from '@primedesign/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
describe('interactive controls', () => {
  it('blocks duplicate loading button clicks while keeping focus', async () => {
    const click = vi.fn();
    render(
      <P.Button loading onClick={click}>
        Pay
      </P.Button>,
    );
    const b = screen.getByRole('button');
    await userEvent.click(b);
    expect(click).not.toHaveBeenCalled();
    expect(b).not.toBeDisabled();
    expect(b).toHaveAttribute('aria-disabled', 'true');
  });
  it('connects field description and errors to the input', () => {
    render(<P.Input label="Email" description="Help" error="Invalid" required />);
    const input = screen.getByLabelText(/Email/);
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Help Invalid');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
  it('toggles checkbox and switch by keyboard', async () => {
    render(
      <>
        <P.Checkbox label="Accept" />
        <P.Switch label="Alerts" />
      </>,
    );
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('checkbox')).toBeChecked();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('switch')).toBeChecked();
  });
  it('navigates enabled tabs in RTL and skips disabled tabs', async () => {
    render(
      <P.Tabs
        label="Tabs"
        items={[
          { value: 'a', label: 'A', content: 'Alpha' },
          { value: 'b', label: 'B', disabled: true, content: 'Beta' },
          { value: 'c', label: 'C', content: 'Gamma' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('tab', { name: 'A' }));
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'C' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Gamma');
  });
  it('filters combobox and selects with arrow keys and Enter', async () => {
    function Demo() {
      const [v, set] = useState('');
      return (
        <P.Combobox
          label="City"
          options={[
            { value: 'tehran', label: 'تهران' },
            { value: 'shiraz', label: 'شیراز' },
          ]}
          value={v}
          onValueChange={set}
          name="city"
        />
      );
    }
    const { container } = render(<Demo />);
    await userEvent.type(screen.getByRole('combobox'), 'شيراز');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('combobox')).toHaveValue('شیراز');
    expect(container.querySelector('input[name=city]')).toHaveValue('shiraz');
  });
  it('does not select disabled combobox options', async () => {
    const change = vi.fn();
    render(
      <P.Combobox
        label="City"
        options={[
          { value: 'a', label: 'Unavailable', disabled: true },
          { value: 'b', label: 'Available' },
        ]}
        onValueChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(change).toHaveBeenCalledWith('b');
  });
  it('adds unique tags and removes with Backspace', async () => {
    function Demo() {
      const [v, set] = useState<string[]>([]);
      return <P.TagInput label="Tags" value={v} onValueChange={set} />;
    }
    render(<Demo />);
    await userEvent.type(screen.getByRole('textbox'), 'React{Enter}React{Enter}');
    expect(screen.getAllByRole('button', { name: /React/ })).toHaveLength(1);
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.keyboard('{Backspace}');
    expect(screen.queryByRole('button', { name: /React/ })).not.toBeInTheDocument();
  });
  it('clamps number controls at stock limit', async () => {
    function Demo() {
      const [v, set] = useState(2);
      return <P.NumberInput label="Quantity" value={v} onValueChange={set} min={1} max={3} />;
    }
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: /افزایش/ }));
    expect(screen.getByRole('spinbutton')).toHaveValue(3);
    expect(screen.getByRole('button', { name: /افزایش/ })).toBeDisabled();
  });
  it('excludes disabled canonical Persian input values from forms', () => {
    const { container } = render(
      <form>
        <P.MobileInput label="Mobile" name="mobile" defaultValue="09123456789" disabled />
      </form>,
    );
    expect(new FormData(container.querySelector('form')!).has('mobile')).toBe(false);
  });
  it('normalizes mobile display and canonical values', async () => {
    const change = vi.fn();
    render(<P.MobileInput label="Mobile" onValueChange={change} />);
    await userEvent.type(screen.getByLabelText('Mobile'), '۰۹۱۲۳۴۵۶۷۸۹');
    expect(change).toHaveBeenLastCalledWith('09123456789', true);
  });
  it('controls accordion expansion', async () => {
    render(
      <P.Accordion
        items={[
          { id: 'a', title: 'Question A', content: 'Answer A' },
          { id: 'b', title: 'Question B', content: 'Answer B' },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Question A' }));
    expect(screen.getByRole('region')).toHaveTextContent('Answer A');
    await userEvent.click(screen.getByRole('button', { name: 'Question B' }));
    expect(screen.getByRole('region')).toHaveTextContent('Answer B');
  });
  it('uses native dialog lifecycle and cancellation state', async () => {
    function Demo() {
      const [open, set] = useState(false);
      return (
        <>
          <P.Button onClick={() => set(true)}>Open</P.Button>
          <P.Dialog open={open} onOpenChange={set} title="Dialog">
            <P.Input label="Name" />
          </P.Dialog>
        </>
      );
    }
    render(<Demo />);
    await userEvent.click(screen.getByText('Open'));
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('keeps toasts isolated between providers', async () => {
    function Show() {
      const { toast } = P.useToast();
      return <button onClick={() => toast({ title: 'Saved', duration: Infinity })}>Show</button>;
    }
    render(
      <>
        <P.ToastProvider>
          <Show />
        </P.ToastProvider>
        <P.ToastProvider>
          <div>Other application</div>
        </P.ToastProvider>
      </>,
    );
    await userEvent.click(screen.getByText('Show'));
    expect(screen.getAllByText('Saved')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'بستن اعلان' }));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });
});
describe('date constraints in every entry path', () => {
  it('disables Today when it is outside min/max', async () => {
    render(<P.DatePicker label="Date" min={new Date(2090, 0, 1)} />);
    await userEvent.click(screen.getByRole('button', { name: 'انتخاب تاریخ' }));
    expect(screen.getByRole('button', { name: 'امروز' })).toBeDisabled();
  });
  it('rejects manually typed disabled dates', async () => {
    const change = vi.fn();
    render(<P.DatePicker label="Date" onValueChange={change} isDateDisabled={() => true} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Date' }), '1405/08/10');
    await userEvent.tab();
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Date' })).toBeInvalid();
  });
  it('normalizes min time when choosing the same date', async () => {
    const change = vi.fn();
    render(<P.DatePicker label="Date" min={new Date(2026, 10, 1, 18)} onValueChange={change} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Date' }), '1405/08/10');
    await userEvent.tab();
    expect(change).toHaveBeenCalledWith(new Date(2026, 10, 1));
  });
  it('disables out-of-range range presets', async () => {
    render(
      <P.DateRangePicker
        label="Range"
        value={{ start: null, end: null }}
        onValueChange={() => {}}
        min={new Date(2090, 0, 1)}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'انتخاب بازه' }));
    expect(screen.getByRole('button', { name: '۷ روز اخیر' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'اعمال بازه' })).toBeDisabled();
  });
});
