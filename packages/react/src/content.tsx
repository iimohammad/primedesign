'use client';
import { useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@primedesign/icons';
import { formatNumber } from '@primedesign/persian';
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  IconButton,
  Input,
  Progress,
  type Tone,
} from './primitives.js';
import { CopyButton } from './misc.js';
import { Rating } from './selection.js';
import { useLabels, usePrime } from './provider.js';
import { cx, useControllable } from './utils.js';
export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  maxHeight?: number;
  className?: string;
}
export function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = false,
  maxHeight = 420,
  className,
}: CodeBlockProps) {
  return (
    <figure className={cx('pd-code-block', className)}>
      <figcaption>
        <span>{filename ?? language}</span>
        <CopyButton value={code} />
      </figcaption>
      <pre dir="ltr" tabIndex={0} style={{ maxHeight }} aria-label={filename ?? `${language} code`}>
        <code>
          {showLineNumbers
            ? code.split('\n').map((line, i) => (
                <span className="pd-code-line" key={i}>
                  <span aria-hidden="true">{i + 1}</span>
                  {line || ' '}
                </span>
              ))
            : code}
        </code>
      </pre>
    </figure>
  );
}
export interface AttachmentProps {
  name: string;
  size?: string;
  url?: string;
  type?: string;
  onRemove?: () => void;
  onDownload?: () => void;
  progress?: number;
  error?: string;
}
export function Attachment({
  name,
  size,
  url,
  type,
  onRemove,
  onDownload,
  progress,
  error,
}: AttachmentProps) {
  const l = useLabels(
    { download: 'دانلود', remove: 'حذف فایل' },
    { download: 'Download', remove: 'Remove attachment' },
  );
  return (
    <div className="pd-attachment">
      <span>
        <Icon name="box" />
      </span>
      <div>
        <strong>{name}</strong>
        <small>{[type, size].filter(Boolean).join(' · ')}</small>
        {progress !== undefined && <Progress label={name} value={progress} />}{' '}
        {error && (
          <small className="pd-error" role="alert">
            {error}
          </small>
        )}
      </div>
      {url ? (
        <a
          className="pd-attachment-download"
          href={url}
          download
          aria-label={`${l.download} ${name}`}
        >
          <Icon name="download" size={16} />
        </a>
      ) : (
        onDownload && (
          <IconButton
            icon="download"
            label={`${l.download} ${name}`}
            variant="ghost"
            size="sm"
            onClick={onDownload}
          />
        )
      )}{' '}
      {onRemove && (
        <IconButton
          icon="close"
          label={`${l.remove} ${name}`}
          variant="ghost"
          size="sm"
          onClick={onRemove}
        />
      )}
    </div>
  );
}
export interface MessageBubbleProps {
  children: ReactNode;
  sender?: string;
  avatar?: string;
  role?: 'user' | 'assistant' | 'system';
  time?: string;
  status?: 'pending' | 'sent' | 'read' | 'error';
  actions?: ReactNode;
  streaming?: boolean;
  className?: string;
}
export function MessageBubble({
  children,
  sender,
  avatar,
  role = 'assistant',
  time,
  status,
  actions,
  streaming,
  className,
}: MessageBubbleProps) {
  const l = useLabels(
    {
      pending: 'در حال ارسال',
      sent: 'ارسال شده',
      read: 'خوانده شده',
      error: 'ارسال نشد',
      streaming: 'در حال دریافت پاسخ',
    },
    {
      pending: 'Sending',
      sent: 'Sent',
      read: 'Read',
      error: 'Not sent',
      streaming: 'Receiving response',
    },
  );
  return (
    <article
      className={cx('pd-bubble', `pd-bubble--${role}`, className)}
      aria-label={sender}
      aria-busy={streaming || undefined}
    >
      {sender && <Avatar name={sender} src={avatar} size="sm" />}
      <div className="pd-bubble-body">
        {sender && <strong className="pd-bubble-sender">{sender}</strong>}
        <div className="pd-bubble-content">
          {children}
          {streaming && (
            <span className="pd-stream-cursor" role="status" aria-label={l.streaming} />
          )}
        </div>
        {(time || status) && (
          <footer>
            {time}
            {status && (
              <span role="img" aria-label={l[status]}>
                <Icon
                  name={status === 'error' ? 'warning' : status === 'pending' ? 'clock' : 'check'}
                  size={12}
                />
              </span>
            )}
          </footer>
        )}
        {actions && <div className="pd-bubble-actions">{actions}</div>}
      </div>
    </article>
  );
}
export function MessageScroller({
  children,
  label,
  height = 440,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { label: string; height?: number | string }) {
  const wrap = useRef<HTMLDivElement>(null),
    content = useRef<HTMLDivElement>(null),
    [atBottom, setAtBottom] = useState(true),
    following = useRef(true),
    scrollLabel = useLabels('رفتن به آخر گفتگو', 'Scroll to latest message');
  const bottom = () => {
    const el = wrap.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
      following.current = true;
      setAtBottom(true);
    }
  };
  useEffect(() => {
    if (following.current) bottom();
  }, [children]);
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !content.current) return;
    const ro = new ResizeObserver(() => {
      if (following.current) bottom();
    });
    ro.observe(content.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div className={cx('pd-message-scroll-wrap', className)}>
      <div
        {...props}
        ref={wrap}
        role="log"
        aria-label={label}
        aria-live="polite"
        aria-relevant="additions text"
        className="pd-message-scroller"
        style={{ height }}
        onScroll={(e) => {
          const el = e.currentTarget,
            near = el.scrollHeight - el.clientHeight - el.scrollTop < 48;
          following.current = near;
          setAtBottom(near);
          props.onScroll?.(e);
        }}
      >
        <div ref={content}>{children}</div>
      </div>
      {!atBottom && (
        <IconButton
          className="pd-scroll-latest"
          icon="chevronDown"
          label={scrollLabel}
          variant="outline"
          onClick={bottom}
        />
      )}
    </div>
  );
}
export interface TraceEntry {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  details?: ReactNode;
}
export function Trace({ items, label }: { items: TraceEntry[]; label: string }) {
  const { locale } = usePrime(),
    l = useLabels(
      { pending: 'در صف', running: 'در حال اجرا', success: 'موفق', error: 'خطا' },
      { pending: 'Pending', running: 'Running', success: 'Success', error: 'Error' },
    );
  return (
    <ol className="pd-trace" aria-label={label}>
      {items.map((item) => (
        <li key={item.id} data-status={item.status}>
          <span className="pd-trace-status">
            <Icon
              name={
                item.status === 'success'
                  ? 'check'
                  : item.status === 'error'
                    ? 'warning'
                    : item.status === 'running'
                      ? 'refresh'
                      : 'clock'
              }
              size={16}
            />
          </span>
          <div>
            {item.details ? (
              <details>
                <summary>
                  {item.title}
                  <Badge
                    tone={
                      item.status === 'error'
                        ? 'danger'
                        : item.status === 'success'
                          ? 'success'
                          : 'neutral'
                    }
                  >
                    {l[item.status]}
                  </Badge>
                </summary>
                {item.details}
              </details>
            ) : (
              <strong>{item.title}</strong>
            )}
            {item.description && <p>{item.description}</p>}
          </div>
          {item.duration !== undefined && (
            <small>{formatNumber(item.duration, { maximumFractionDigits: 1 }, locale)} ms</small>
          )}
        </li>
      ))}
    </ol>
  );
}
export interface Question {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'single' | 'multiple' | 'rating';
  options?: { label: string; value: string }[];
  required?: boolean;
}
export interface QuestionnaireProps {
  questions: Question[];
  onComplete: (answers: Record<string, unknown>) => void | Promise<void>;
  defaultAnswers?: Record<string, unknown>;
  label: string;
}
export function Questionnaire({
  questions,
  onComplete,
  defaultAnswers = {},
  label,
}: QuestionnaireProps) {
  const [answers, setAnswers] = useState(defaultAnswers),
    [step, setStep] = useState(0),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    id = useId(),
    q = questions[step],
    l = useLabels(
      {
        next: 'ادامه',
        back: 'قبلی',
        submit: 'ثبت پاسخ‌ها',
        required: 'لطفاً پاسخ دهید.',
        error: 'ثبت پاسخ انجام نشد.',
      },
      {
        next: 'Continue',
        back: 'Back',
        submit: 'Submit answers',
        required: 'An answer is required.',
        error: 'Could not submit answers.',
      },
    );
  const value = q ? answers[q.id] : undefined,
    valid =
      !q?.required ||
      (Array.isArray(value)
        ? value.length > 0
        : typeof value === 'string'
          ? value.trim().length > 0
          : !!value);
  if (!q) return null;
  const set = (v: unknown) => {
    setAnswers((a) => ({ ...a, [q.id]: v }));
    setError('');
  };
  return (
    <form
      className="pd-questionnaire"
      aria-label={label}
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        if (!valid) {
          setError(l.required);
          return;
        }
        if (step < questions.length - 1) {
          setStep((s) => s + 1);
          return;
        }
        setPending(true);
        setError('');
        try {
          await onComplete(answers);
        } catch (e) {
          setError(e instanceof Error ? e.message : l.error);
        } finally {
          setPending(false);
        }
      }}
    >
      <Progress label={label} value={step + 1} max={questions.length} />
      <div>
        <small>
          {step + 1} / {questions.length}
        </small>
        <h3 id={`${id}-question`}>{q.title}</h3>
        {q.description && <p>{q.description}</p>}
      </div>
      {q.type === 'text' ? (
        <Input
          aria-labelledby={`${id}-question`}
          value={String(value ?? '')}
          onChange={(e) => set(e.target.value)}
        />
      ) : q.type === 'rating' ? (
        <Rating label={q.title} value={Number(value ?? 0)} onValueChange={set} />
      ) : (
        <fieldset aria-labelledby={`${id}-question`}>
          {q.options?.map((o) =>
            q.type === 'multiple' ? (
              <Checkbox
                key={o.value}
                label={o.label}
                checked={Array.isArray(value) && value.includes(o.value)}
                onChange={() =>
                  set(
                    Array.isArray(value)
                      ? value.includes(o.value)
                        ? value.filter((v) => v !== o.value)
                        : [...value, o.value]
                      : [o.value],
                  )
                }
              />
            ) : (
              <label key={o.value} className="pd-check">
                <input
                  type="radio"
                  name={q.id}
                  value={o.value}
                  checked={value === o.value}
                  onChange={() => set(o.value)}
                />
                {o.label}
              </label>
            ),
          )}
        </fieldset>
      )}
      {error && (
        <div role="alert" className="pd-error">
          {error}
        </div>
      )}
      <div className="pd-form-actions">
        <Button
          variant="outline"
          disabled={step === 0 || pending}
          onClick={() => {
            setStep((s) => s - 1);
            setError('');
          }}
        >
          {l.back}
        </Button>
        <Button type="submit" loading={pending}>
          {step === questions.length - 1 ? l.submit : l.next}
        </Button>
      </div>
    </form>
  );
}
