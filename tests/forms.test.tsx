import {
  Form,
  FormField,
  getFieldValue,
  SchemaForm,
  setFieldValue,
  useFieldArray,
  useForm,
  useFormDraft,
  validateFields,
  validators,
} from '@primedesign/forms';
import { Button, Input } from '@primedesign/react';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
describe('form state and validation', () => {
  it('updates nested arrays immutably', () => {
    const original = { members: [{ name: 'Sara' }] },
      next = setFieldValue(original, 'members[0].name', 'Ali');
    expect(getFieldValue(next, 'members.0.name')).toBe('Ali');
    expect(original.members[0].name).toBe('Sara');
  });
  it.each(['__proto__.polluted', 'constructor.prototype.bad', 'a..b'])(
    'rejects unsafe paths %s',
    (path) => expect(() => setFieldValue({}, path, true)).toThrow(),
  );
  it('validates before submitting and exposes a field error', async () => {
    const submit = vi.fn();
    function Demo() {
      const form = useForm({
        defaultValues: { name: '' },
        validate: validateFields({ name: [validators.required('Required')] }),
      });
      return (
        <Form form={form} onSubmit={submit}>
          <FormField name="name">
            {(f) => (
              <Input
                label="Name"
                value={String(f.value)}
                onChange={(e) => f.onChange(e.target.value)}
                error={f.error}
              />
            )}
          </FormField>
          <Button type="submit">Submit</Button>
        </Form>
      );
    }
    render(<Demo />);
    await userEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText('Required')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText('Name'), 'Sara');
    await userEvent.click(screen.getByText('Submit'));
    expect(submit).toHaveBeenCalledWith({ name: 'Sara' });
  });
  it('captures server failures and clears submitting state', async () => {
    function Demo() {
      const form = useForm({ defaultValues: { name: 'Sara' } });
      return (
        <Form
          form={form}
          onSubmit={async () => {
            throw new Error('Server unavailable');
          }}
        >
          <Button type="submit" loading={form.submitting}>
            Save
          </Button>
        </Form>
      );
    }
    render(<Demo />);
    await userEvent.click(screen.getByText('Save'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');
    expect(screen.getByText('Save')).not.toHaveAttribute('aria-busy');
  });
  it('renders and validates conditional schema fields only while visible', async () => {
    const submit = vi.fn();
    render(
      <SchemaForm
        defaultValues={{ company: false, companyName: '' }}
        fields={[
          { name: 'company', label: 'Company account', type: 'checkbox' },
          {
            name: 'companyName',
            label: 'Company name',
            type: 'text',
            visible: (v) => !!v.company,
            rules: [validators.required('Company required')],
          },
        ]}
        onSubmit={submit}
      />,
    );
    await userEvent.click(screen.getByText('ذخیرهٔ اطلاعات'));
    expect(submit).toHaveBeenCalled();
    await userEvent.click(screen.getByLabelText('Company account'));
    await userEvent.click(screen.getByText('ذخیرهٔ اطلاعات'));
    expect(await screen.findByText('Company required')).toBeInTheDocument();
  });
  it('keeps field array identities stable when moving and removing', () => {
    const { result } = renderHook(() => {
      const form = useForm({ defaultValues: { members: [{ name: 'A' }, { name: 'B' }] } });
      return { form, array: useFieldArray({ form, name: 'members' }) };
    });
    const first = result.current.array.fields[0].id;
    act(() => result.current.array.move(0, 1));
    expect(result.current.array.fields[1].id).toBe(first);
    expect(result.current.form.values.members[1].name).toBe('A');
    act(() => result.current.array.remove(0));
    expect(result.current.array.fields[0].id).toBe(first);
  });
  it('guards duplicate async submissions', async () => {
    let resolve!: () => void;
    const submit = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    const { result } = renderHook(() => useForm({ defaultValues: { name: 'A' } }));
    let first!: Promise<void>;
    await act(async () => {
      first = result.current.submit(submit);
      await Promise.resolve();
    });
    await act(async () => {
      await result.current.submit(submit);
    });
    expect(submit).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve();
      await first;
    });
  });
  it('persists only explicitly allowlisted non-secret draft fields', async () => {
    localStorage.clear();
    const { result } = renderHook(() => {
      const form = useForm({ defaultValues: { name: '', password: '', email: '' } });
      useFormDraft({ form, storageKey: 'draft', fields: ['name', 'password'] });
      return form;
    });
    act(() => {
      result.current.setValue('name', 'Sara');
      result.current.setValue('password', 'secret-value');
      result.current.setValue('email', 'private@example.com');
    });
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('draft')!)).toEqual({ name: 'Sara' }),
    );
  });
});
