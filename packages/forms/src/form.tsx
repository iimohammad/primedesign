'use client';
import { isValidMobile } from '@primedesign/persian';
import {
  Button,
  Checkbox,
  Input,
  MobileInput,
  Select,
  Stepper,
  Textarea,
  useLabels,
} from '@primedesign/react';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormHTMLAttributes,
  type ReactNode,
} from 'react';
export type FormErrors = Record<string, string>;
export type Validator<T> = (values: T) => FormErrors | Promise<FormErrors>;
const pathParts = (path: string) => {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  if (parts.some((p) => ['__proto__', 'prototype', 'constructor'].includes(p) || !p))
    throw new Error('Invalid field path');
  return parts;
};
export function getFieldValue(object: unknown, path: string): unknown {
  return pathParts(path).reduce(
    (value, key) => (value as Record<string, unknown> | undefined)?.[key],
    object,
  );
}
export function setFieldValue<T>(object: T, path: string, value: unknown): T {
  const parts = pathParts(path);
  const walk = (current: unknown, index: number): unknown => {
    const key = parts[index],
      copy: Array<unknown> | Record<string, unknown> = Array.isArray(current)
        ? [...current]
        : { ...((current as Record<string, unknown>) ?? {}) };
    (copy as Record<string, unknown>)[key] =
      index === parts.length - 1
        ? value
        : walk(
            (current as Record<string, unknown> | undefined)?.[key] ??
              (/^\d+$/.test(parts[index + 1]) ? [] : {}),
            index + 1,
          );
    return copy;
  };
  return walk(object, 0) as T;
}
export interface FormApi<T> {
  values: T;
  errors: FormErrors;
  touched: Record<string, boolean>;
  dirty: boolean;
  submitting: boolean;
  submitted: boolean;
  setValue: (path: string, value: unknown) => void;
  setTouched: (path: string) => void;
  setErrors: (errors: FormErrors) => void;
  reset: (values?: T) => void;
  validate: () => Promise<FormErrors>;
  submit: (callback: (values: T) => void | Promise<void>) => Promise<void>;
}
export function useForm<T extends Record<string, unknown>>({
  defaultValues,
  validate: validator,
}: {
  defaultValues: T;
  validate?: Validator<T>;
}): FormApi<T> {
  const initial = useRef(defaultValues),
    [values, setValues] = useState(defaultValues),
    [errors, setErrors] = useState<FormErrors>({}),
    [touched, setTouched] = useState<Record<string, boolean>>({}),
    [submitting, setSubmitting] = useState(false),
    [submitted, setSubmitted] = useState(false),
    inFlight = useRef(false),
    validationId = useRef(0);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial.current);
  const validate = async () => {
    const id = ++validationId.current;
    const result = (await validator?.(values)) ?? {};
    if (id === validationId.current) setErrors(result);
    return result;
  };
  return {
    values,
    errors,
    touched,
    dirty,
    submitting,
    submitted,
    setValue: (path, value) => {
      setValues((v) => setFieldValue(v, path, value));
      setErrors((e) => {
        const next = { ...e };
        delete next[path];
        return next;
      });
    },
    setTouched: (path) => setTouched((v) => ({ ...v, [path]: true })),
    setErrors,
    reset: (next = initial.current) => {
      initial.current = next;
      setValues(next);
      setErrors({});
      setTouched({});
      setSubmitted(false);
    },
    validate,
    submit: async (callback) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setSubmitting(true);
      setSubmitted(true);
      try {
        const e = await validate();
        if (!Object.keys(e).length) await callback(values);
      } finally {
        inFlight.current = false;
        setSubmitting(false);
      }
    },
  };
}
const FormContext = createContext<FormApi<Record<string, unknown>> | null>(null);
export function useFormContext<T extends Record<string, unknown>>(): FormApi<T> {
  const context = useContext(FormContext);
  if (!context) throw new Error('Form fields must be inside Form');
  return context as FormApi<T>;
}
export function Form<T extends Record<string, unknown>>({
  form,
  onSubmit,
  children,
  ...p
}: Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  form: FormApi<T>;
  onSubmit: (values: T) => void | Promise<void>;
}) {
  return (
    <FormContext.Provider value={form as FormApi<Record<string, unknown>>}>
      <form
        {...p}
        onSubmit={(e) => {
          e.preventDefault();
          void form.submit(onSubmit).catch((error) =>
            form.setErrors({
              ...form.errors,
              _form: error instanceof Error ? error.message : 'Submission failed',
            }),
          );
        }}
      >
        {children}
        {form.errors._form && (
          <div className="pd-error" role="alert">
            {form.errors._form}
          </div>
        )}
      </form>
    </FormContext.Provider>
  );
}
export function FormField({
  name,
  children,
}: {
  name: string;
  children: (field: {
    name: string;
    value: unknown;
    onChange: (v: unknown) => void;
    onBlur: () => void;
    error?: string;
  }) => ReactNode;
}) {
  const form = useFormContext();
  return (
    <>
      {children({
        name,
        value: getFieldValue(form.values, name),
        onChange: (v) => form.setValue(name, v),
        onBlur: () => form.setTouched(name),
        error: form.touched[name] || form.submitted ? form.errors[name] : undefined,
      })}
    </>
  );
}
export type FieldValidator = (
  value: unknown,
  values: Record<string, unknown>,
) => string | undefined;
export const validators = {
  required:
    (message = 'این فیلد الزامی است.'): FieldValidator =>
    (v) =>
      v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length)
        ? message
        : undefined,
  minLength:
    (min: number, message = `حداقل ${min} نویسه وارد کنید.`): FieldValidator =>
    (v) =>
      String(v ?? '').length < min ? message : undefined,
  maxLength:
    (max: number, message = `حداکثر ${max} نویسه مجاز است.`): FieldValidator =>
    (v) =>
      String(v ?? '').length > max ? message : undefined,
  email:
    (message = 'ایمیل معتبر نیست.'): FieldValidator =>
    (v) =>
      !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) ? undefined : message,
  mobile:
    (message = 'موبایل معتبر نیست.'): FieldValidator =>
    (v) =>
      !v || isValidMobile(String(v)) ? undefined : message,
  range:
    (min: number, max: number, message = 'مقدار خارج از محدوده است.'): FieldValidator =>
    (v) =>
      Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max ? undefined : message,
  matches:
    (field: string, message = 'مقادیر یکسان نیستند.'): FieldValidator =>
    (v, values) =>
      v === getFieldValue(values, field) ? undefined : message,
};
export function validateFields<T extends Record<string, unknown>>(
  rules: Record<string, FieldValidator[]>,
): Validator<T> {
  return (values) => {
    const errors: FormErrors = {};
    for (const [field, checks] of Object.entries(rules)) {
      for (const check of checks) {
        const error = check(getFieldValue(values, field), values);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    }
    return errors;
  };
}
export function useFieldArray<T extends Record<string, unknown>>({
  form,
  name,
}: {
  form: FormApi<T>;
  name: string;
}) {
  const values = (getFieldValue(form.values, name) ?? []) as unknown[],
    next = useRef(0),
    [ids, setIds] = useState(() => values.map(() => `field-${++next.current}`));
  useEffect(() => {
    if (ids.length !== values.length)
      setIds((current) => values.map((_, i) => current[i] ?? `field-${++next.current}`));
  }, [values.length, ids.length]);
  return {
    fields: values.map((value, index) => ({
      id: ids[index] ?? `field-pending-${index}`,
      value,
      index,
    })),
    append: (value: unknown) => {
      form.setValue(name, [...values, value]);
      setIds((v) => [...v, `field-${++next.current}`]);
    },
    remove: (index: number) => {
      form.setValue(
        name,
        values.filter((_, i) => i !== index),
      );
      setIds((v) => v.filter((_, i) => i !== index));
    },
    move: (from: number, to: number) => {
      if (from < 0 || to < 0 || from >= values.length || to >= values.length) return;
      const reorder = <V,>(list: V[]) => {
        const out = [...list];
        out.splice(to, 0, out.splice(from, 1)[0]);
        return out;
      };
      form.setValue(name, reorder(values));
      setIds(reorder);
    },
    update: (index: number, value: unknown) => form.setValue(`${name}.${index}`, value),
  };
}
/** Only explicitly allowlisted non-secret fields are persisted. */
export function useFormDraft<T extends Record<string, unknown>>({
  form,
  storageKey,
  fields,
}: {
  form: FormApi<T>;
  storageKey: string;
  fields: string[];
}) {
  const [ready, setReady] = useState(false),
    key = fields.join('|');
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw) as Record<string, unknown>;
        for (const field of fields) {
          if (/password|secret|token|card|iban/i.test(field)) continue;
          if (Object.prototype.hasOwnProperty.call(data, field)) form.setValue(field, data[field]);
        }
      }
    } catch {}
    setReady(true);
  }, [storageKey, key]);
  useEffect(() => {
    if (!ready || !form.dirty) return;
    try {
      const data = Object.fromEntries(
        fields
          .filter((field) => !/password|secret|token|card|iban/i.test(field))
          .map((field) => [field, getFieldValue(form.values, field)]),
      );
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {}
  }, [form.values, ready, storageKey, key]);
  return {
    clearDraft: () => {
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    },
    ready,
  };
}
export function FormWizard<T extends Record<string, unknown>>({
  form,
  steps,
  onSubmit,
}: {
  form: FormApi<T>;
  steps: { title: string; fields: string[]; content: ReactNode }[];
  onSubmit: (values: T) => void | Promise<void>;
}) {
  const [step, setStep] = useState(0),
    [validating, setValidating] = useState(false),
    l = useLabels(
      { back: 'مرحلهٔ قبل', next: 'مرحلهٔ بعد', submit: 'ثبت نهایی' },
      { back: 'Back', next: 'Continue', submit: 'Submit' },
    );
  return (
    <Form form={form} onSubmit={onSubmit} className="pd-form-wizard">
      <Stepper steps={steps.map((s) => ({ label: s.title }))} current={step} />
      {steps[step]?.content}
      <div className="pd-form-actions">
        <Button
          variant="outline"
          disabled={step === 0 || form.submitting || validating}
          onClick={() => setStep((s) => s - 1)}
        >
          {l.back}
        </Button>
        {step === steps.length - 1 ? (
          <Button type="submit" loading={form.submitting}>
            {l.submit}
          </Button>
        ) : (
          <Button
            loading={validating}
            onClick={async () => {
              setValidating(true);
              try {
                steps[step].fields.forEach(form.setTouched);
                const e = await form.validate();
                if (!steps[step].fields.some((f) => e[f])) setStep((s) => s + 1);
              } finally {
                setValidating(false);
              }
            }}
          >
            {l.next}
          </Button>
        )}
      </div>
    </Form>
  );
}
export interface SchemaField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'mobile';
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  rules?: FieldValidator[];
  visible?: (values: Record<string, unknown>) => boolean;
}
export function SchemaForm({
  fields,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  fields: SchemaField[];
  defaultValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  submitLabel?: string;
}) {
  const fallback = useLabels('ذخیرهٔ اطلاعات', 'Save changes'),
    form = useForm({
      defaultValues,
      validate: (values) => {
        const active = fields.filter((f) => !f.visible || f.visible(values));
        return validateFields(Object.fromEntries(active.map((f) => [f.name, f.rules ?? []])))(
          values,
        );
      },
    });
  return (
    <Form form={form} onSubmit={onSubmit} className="pd-schema-form">
      {fields
        .filter((f) => !f.visible || f.visible(form.values))
        .map((f) => (
          <FormField name={f.name} key={f.name}>
            {(field) => {
              const common = {
                label: f.label,
                name: f.name,
                description: f.description,
                error: field.error,
                onBlur: field.onBlur,
                placeholder: f.placeholder,
              };
              if (f.type === 'checkbox')
                return (
                  <Checkbox
                    {...common}
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                );
              if (f.type === 'textarea')
                return (
                  <Textarea
                    {...common}
                    value={String(field.value ?? '')}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                );
              if (f.type === 'select')
                return (
                  <Select
                    {...common}
                    options={f.options}
                    value={String(field.value ?? '')}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                );
              if (f.type === 'mobile')
                return (
                  <MobileInput
                    {...common}
                    value={String(field.value ?? '')}
                    onValueChange={(v) => field.onChange(v)}
                  />
                );
              return (
                <Input
                  {...common}
                  type={f.type}
                  value={String(field.value ?? '')}
                  onChange={(e) =>
                    field.onChange(f.type === 'number' ? e.target.valueAsNumber : e.target.value)
                  }
                />
              );
            }}
          </FormField>
        ))}
      <Button type="submit" loading={form.submitting}>
        {submitLabel ?? fallback}
      </Button>
    </Form>
  );
}
