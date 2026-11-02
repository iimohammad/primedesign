import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  PrimeProvider,
  ContextMenu,
  ToggleGroup,
  Questionnaire,
  ResizablePanelGroup,
  resizePanelPair,
  CodeBlock,
  DirectionProvider,
  usePrime,
} from '@primedesign/react';
import { KanbanBoard, SettingsPanel } from '@primedesign/blocks';
import { PromptInput, Confirmation, AIMessage } from '@primedesign/ai';

describe('advanced interaction contracts', () => {
  it('preserves unrelated panel sizes and enforces the adjacent pair bounds', () => {
    const panels = [
      { id: 'a', content: null, minSize: 20, maxSize: 50 },
      { id: 'b', content: null, minSize: 30, maxSize: 60 },
      { id: 'c', content: null },
    ];
    expect(resizePanelPair([30, 40, 30], panels, 0, 80)).toEqual([40, 30, 30]);
    expect(resizePanelPair([30, 40, 30], panels, 0, -80)).toEqual([20, 50, 30]);
  });
  it('resizes by keyboard in RTL and persists the layout', () => {
    localStorage.clear();
    render(
      <PrimeProvider dir="rtl">
        <ResizablePanelGroup
          storageKey="test-panel"
          label="Editor"
          panels={[
            { id: 'left', content: 'Files', defaultSize: 40 },
            { id: 'right', content: 'Code', defaultSize: 60 },
          ]}
        />
      </PrimeProvider>,
    );
    const handle = screen.getByRole('separator');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(handle).toHaveAttribute('aria-valuenow', '42');
    expect(JSON.parse(localStorage.getItem('test-panel')!)).toEqual([42, 58]);
    fireEvent.keyDown(handle, { key: 'End' });
    expect(handle).toHaveAttribute('aria-valuenow', '90');
  });
  it('opens context menus by keyboard, skips disabled items and restores focus', async () => {
    const user = userEvent.setup(),
      choose = vi.fn();
    render(
      <ContextMenu
        label="Actions"
        items={[
          { id: 'disabled', label: 'Unavailable', disabled: true, onSelect: vi.fn() },
          { id: 'copy', label: 'Copy', onSelect: choose },
        ]}
      >
        <span>Target</span>
      </ContextMenu>,
    );
    const target = screen.getByText('Target').parentElement!;
    target.focus();
    fireEvent.keyDown(target, { key: 'F10', shiftKey: true });
    const copy = await screen.findByRole('menuitem', { name: 'Copy' });
    expect(copy).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(choose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(target).toHaveFocus();
  });
  it('supports RTL toggle navigation and single selection', async () => {
    const user = userEvent.setup();
    render(
      <PrimeProvider dir="rtl">
        <ToggleGroup
          label="Layout"
          items={[
            { value: 'a', label: 'One' },
            { value: 'b', label: 'Two' },
          ]}
        />
      </PrimeProvider>,
    );
    const one = screen.getByRole('button', { name: 'One' });
    one.focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('blocks blank required answers and retains values after submission failure', async () => {
    const user = userEvent.setup(),
      complete = vi.fn().mockRejectedValue(new Error('Try again'));
    render(
      <Questionnaire
        label="Survey"
        questions={[{ id: 'name', title: 'Name', type: 'text', required: true }]}
        onComplete={complete}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'ثبت پاسخ‌ها' }));
    expect(complete).not.toHaveBeenCalled();
    await user.type(screen.getByRole('textbox'), '   ');
    await user.click(screen.getByRole('button', { name: 'ثبت پاسخ‌ها' }));
    expect(complete).not.toHaveBeenCalled();
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Mina');
    await user.click(screen.getByRole('button', { name: 'ثبت پاسخ‌ها' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again');
    expect(screen.getByRole('textbox')).toHaveValue('Mina');
  });
  it('allows accessible Kanban movement without dragging', async () => {
    const user = userEvent.setup(),
      move = vi.fn();
    render(
      <KanbanBoard
        label="Work"
        columns={[
          { id: 'todo', title: 'Todo', items: [{ id: 't', title: 'Task' }] },
          { id: 'done', title: 'Done', items: [] },
        ]}
        onMove={move}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox'), 'done');
    expect(move).toHaveBeenCalledWith('t', 'todo', 'done');
  });
  it('keeps the brand and theme inside a nested direction provider', () => {
    function Read() {
      const p = usePrime();
      return <output>{p.brand + ' ' + p.dir + ' ' + p.theme}</output>;
    }
    render(
      <PrimeProvider brand="#177864" theme="dark">
        <DirectionProvider dir="ltr">
          <Read />
        </DirectionProvider>
      </PrimeProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('#177864 ltr dark');
  });
  it('renders untrusted code and AI message text without interpreting HTML', () => {
    const text = '<img src=x onerror="alert(1)">';
    const { container } = render(
      <>
        <CodeBlock code={text} />
        <AIMessage message={{ id: 'm', role: 'assistant', content: text }} />
      </>,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain(text);
  });
  it('retains a failed prompt, suppresses duplicate submissions and handles retry', async () => {
    const user = userEvent.setup();
    let reject!: (e: Error) => void;
    const submit = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_, fail) => {
            reject = fail;
          }),
      )
      .mockResolvedValue(undefined);
    render(<PromptInput onSubmit={submit} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    expect(submit).toHaveBeenCalledOnce();
    reject(new Error('Offline'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
    expect(input).toHaveValue('Hello');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(input).toHaveValue(''));
    expect(submit).toHaveBeenCalledTimes(2);
  });
  it('surfaces approval and settings failures without a success message', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Confirmation
          title="Approve"
          onApprove={async () => {
            throw new Error('Denied');
          }}
          onReject={() => {}}
        />
        <SettingsPanel
          title="Settings"
          initialValues={{ name: 'Team', description: '' }}
          onSave={async () => {
            throw new Error('Save failed');
          }}
        />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'اجازه می‌دهم' }));
    expect(await screen.findByText('Denied')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'ذخیرهٔ تغییرات' }));
    expect(await screen.findByText('Save failed')).toBeVisible();
    expect(screen.queryByText('ذخیره شد')).not.toBeInTheDocument();
  });
});
