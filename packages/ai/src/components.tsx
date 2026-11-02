'use client';
import { useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@primedesign/icons';
import { formatNumber } from '@primedesign/persian';
import {
  Alert,
  Attachment,
  Avatar,
  Badge,
  Button,
  Card,
  CodeBlock,
  Collapsible,
  CopyButton,
  Input,
  MessageBubble,
  MessageScroller,
  Popover,
  Progress,
  Select,
  Textarea,
  Trace,
  useLabels,
  usePrime,
  type TraceEntry,
} from '@primedesign/react';
export type RunStatus = 'pending' | 'running' | 'success' | 'error' | 'canceled';
function RunBadge({ status }: { status: RunStatus }) {
  const labels = useLabels(
    {
      pending: 'در صف',
      running: 'در حال اجرا',
      success: 'انجام شد',
      error: 'خطا',
      canceled: 'لغو شد',
    },
    {
      pending: 'Queued',
      running: 'Running',
      success: 'Completed',
      error: 'Error',
      canceled: 'Canceled',
    },
  );
  return (
    <Badge
      tone={
        status === 'success'
          ? 'success'
          : status === 'error'
            ? 'danger'
            : status === 'running'
              ? 'brand'
              : 'neutral'
      }
      dot
    >
      {labels[status]}
    </Badge>
  );
}
function json(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? '';
  } catch {
    return String(value);
  }
}
export interface Source {
  id: string;
  title: string;
  url: string;
  description?: string;
}
export function Sources({ sources, label }: { sources: Source[]; label?: string }) {
  const fallback = useLabels('منابع پاسخ', 'Response sources');
  return (
    <section className="pd-ai-sources" aria-label={label ?? fallback}>
      <strong>
        <Icon name="link" size={15} />
        {label ?? fallback}
      </strong>
      <ol>
        {sources.map((source, i) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              <span>{i + 1}</span>
              <div>
                <strong>{source.title}</strong>
                {source.description && <small>{source.description}</small>}
              </div>
              <Icon name="arrowLeft" size={14} />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
export function InlineCitation({ source, index }: { source: Source; index: number }) {
  return (
    <Popover label={source.title} trigger={<sup className="pd-ai-citation">{index}</sup>}>
      <div className="pd-ai-source-preview">
        <strong>{source.title}</strong>
        {source.description && <p>{source.description}</p>}
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          {source.url}
        </a>
      </div>
    </Popover>
  );
}
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
  time?: string;
  sources?: Source[];
  attachments?: { name: string; url?: string; size?: string }[];
}
export function AIMessage({
  message,
  streaming,
  onFeedback,
}: {
  message: ChatMessage;
  streaming?: boolean;
  onFeedback?: (positive: boolean) => void;
}) {
  const labels = useLabels(
    { assistant: 'دستیار', user: 'شما', good: 'پاسخ مفید بود', bad: 'پاسخ نیاز به اصلاح دارد' },
    {
      assistant: 'Assistant',
      user: 'You',
      good: 'Helpful response',
      bad: 'Response needs improvement',
    },
  );
  return (
    <MessageBubble
      role={message.role}
      sender={message.name ?? (message.role === 'user' ? labels.user : labels.assistant)}
      time={message.time}
      streaming={streaming}
      actions={
        message.role === 'assistant' ? (
          <>
            <CopyButton value={message.content} />
            {onFeedback && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={labels.good}
                  onClick={() => onFeedback(true)}
                >
                  <Icon name="check" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={labels.bad}
                  onClick={() => onFeedback(false)}
                >
                  <Icon name="warning" size={14} />
                </Button>
              </>
            )}
          </>
        ) : undefined
      }
    >
      <div className="pd-ai-message-text">{message.content}</div>
      {message.attachments?.map((a, i) => (
        <Attachment key={i} {...a} />
      ))}
      {!!message.sources?.length && <Sources sources={message.sources} />}
    </MessageBubble>
  );
}
export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  disabled?: boolean;
}
export function ModelSelector({
  models,
  value,
  onValueChange,
  label,
  disabled,
}: {
  models: ModelOption[];
  value: string;
  onValueChange: (id: string) => void;
  label?: string;
  disabled?: boolean;
}) {
  const fallback = useLabels('مدل پاسخ‌گو', 'Response model');
  return (
    <Select
      aria-label={label ?? fallback}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      options={models.map((m) => ({ label: m.name, value: m.id, disabled: m.disabled }))}
    />
  );
}
export interface PromptSubmission {
  text: string;
  files: File[];
  model?: string;
}
export interface PromptInputProps {
  onSubmit: (input: PromptSubmission) => void | Promise<void>;
  onStop?: () => void;
  status?: 'ready' | 'submitted' | 'streaming' | 'error';
  placeholder?: string;
  models?: ModelOption[];
  model?: string;
  onModelChange?: (id: string) => void;
  allowAttachments?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  disabled?: boolean;
}
export function PromptInput({
  onSubmit,
  onStop,
  status = 'ready',
  placeholder,
  models,
  model,
  onModelChange,
  allowAttachments = false,
  maxFiles = 4,
  maxFileSize = 10 * 1024 * 1024,
  disabled,
}: PromptInputProps) {
  const [text, setText] = useState(''),
    [files, setFiles] = useState<File[]>([]),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    fileInput = useRef<HTMLInputElement>(null),
    l = useLabels(
      {
        placeholder: 'پیام خود را بنویسید…',
        send: 'ارسال پیام',
        stop: 'توقف پاسخ',
        attach: 'پیوست فایل',
        error: 'ارسال پیام انجام نشد.',
        size: 'فایل بیش از حد مجاز است.',
        count: 'تعداد فایل‌ها بیش از حد مجاز است.',
      },
      {
        placeholder: 'Write a message…',
        send: 'Send message',
        stop: 'Stop response',
        attach: 'Attach files',
        error: 'Could not send message.',
        size: 'File is too large.',
        count: 'Too many files.',
      },
    ),
    busy = pending || status === 'submitted' || status === 'streaming';
  const submit = async () => {
    if (busy || disabled || (!text.trim() && !files.length)) return;
    setPending(true);
    setError('');
    try {
      await onSubmit({ text: text.trim(), files, model });
      setText('');
      setFiles([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : l.error);
    } finally {
      setPending(false);
    }
  };
  return (
    <form
      className="pd-ai-prompt"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Textarea
        aria-label={l.placeholder}
        placeholder={placeholder ?? l.placeholder}
        rows={3}
        value={text}
        disabled={disabled || busy}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            void submit();
          }
        }}
      />
      {!!files.length && (
        <div className="pd-ai-files">
          {files.map((f, i) => (
            <Attachment
              key={`${f.name}-${i}`}
              name={f.name}
              onRemove={() => setFiles((v) => v.filter((_, index) => index !== i))}
            />
          ))}
        </div>
      )}
      <div className="pd-ai-prompt-toolbar">
        <div>
          {allowAttachments && (
            <>
              <Button
                variant="ghost"
                size="sm"
                aria-label={l.attach}
                disabled={disabled || busy}
                onClick={() => fileInput.current?.click()}
              >
                <Icon name="plus" size={18} />
              </Button>
              <input
                ref={fileInput}
                className="pd-sr-only"
                type="file"
                multiple
                tabIndex={-1}
                aria-label={l.attach}
                onChange={(e) => {
                  const added = Array.from(e.target.files ?? []);
                  if (files.length + added.length > maxFiles) setError(l.count);
                  else if (added.some((f) => f.size > maxFileSize)) setError(l.size);
                  else {
                    setFiles((v) => [...v, ...added]);
                    setError('');
                  }
                  e.target.value = '';
                }}
              />
            </>
          )}
          {models && model && (
            <ModelSelector
              models={models}
              value={model}
              onValueChange={(id) => onModelChange?.(id)}
              disabled={busy}
            />
          )}
        </div>
        {busy && onStop ? (
          <Button variant="outline" size="sm" onClick={onStop} aria-label={l.stop}>
            <Icon name="close" size={16} />
            {l.stop}
          </Button>
        ) : (
          <Button
            type="submit"
            size="sm"
            loading={pending}
            disabled={disabled || busy || (!text.trim() && !files.length)}
            aria-label={l.send}
          >
            <Icon name="arrowLeft" size={16} />
            {l.send}
          </Button>
        )}
      </div>
      {error && (
        <div className="pd-error" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}
export function Suggestions({
  items,
  onSelect,
  label,
}: {
  items: string[];
  onSelect: (text: string) => void;
  label?: string;
}) {
  const fallback = useLabels('پیشنهادهای گفتگو', 'Conversation suggestions');
  return (
    <div className="pd-ai-suggestions" role="group" aria-label={label ?? fallback}>
      {items.map((item) => (
        <Button key={item} size="sm" variant="outline" onClick={() => onSelect(item)}>
          {item}
          <Icon name="plus" size={13} />
        </Button>
      ))}
    </div>
  );
}
export interface ChatProps extends PromptInputProps {
  messages: ChatMessage[];
  title?: string;
  description?: string;
  error?: string;
  suggestions?: string[];
  onSuggestion?: (text: string) => void;
  height?: number;
  onRegenerate?: () => void;
}
export function Chat({
  messages,
  title,
  description,
  error,
  suggestions,
  onSuggestion,
  height = 440,
  onRegenerate,
  ...prompt
}: ChatProps) {
  const l = useLabels(
    { title: 'دستیار هوشمند', empty: 'از کجا شروع کنیم؟', retry: 'تولید دوبارهٔ پاسخ' },
    { title: 'AI assistant', empty: 'Where should we start?', retry: 'Regenerate response' },
  );
  return (
    <Card className="pd-ai-chat">
      <header>
        <span>
          <Icon name="sparkles" />
        </span>
        <div>
          <strong>{title ?? l.title}</strong>
          {description && <small>{description}</small>}
        </div>
        {prompt.models && prompt.model && (
          <Badge tone="brand">{prompt.models.find((m) => m.id === prompt.model)?.name}</Badge>
        )}
      </header>
      <MessageScroller label={title ?? l.title} height={height}>
        {messages.length ? (
          messages.map((message, i) => (
            <AIMessage
              key={message.id}
              message={message}
              streaming={
                prompt.status === 'streaming' &&
                i === messages.length - 1 &&
                message.role === 'assistant'
              }
            />
          ))
        ) : (
          <div className="pd-ai-welcome">
            <Icon name="sparkles" size={34} />
            <h3>{l.empty}</h3>
            {suggestions && (
              <Suggestions items={suggestions} onSelect={(text) => onSuggestion?.(text)} />
            )}
          </div>
        )}
      </MessageScroller>
      {error && <Alert tone="danger">{error}</Alert>}
      {onRegenerate && messages.some((m) => m.role === 'assistant') && (
        <Button
          className="pd-ai-regenerate"
          variant="ghost"
          size="sm"
          disabled={prompt.status === 'streaming'}
          onClick={onRegenerate}
        >
          <Icon name="refresh" size={14} />
          {l.retry}
        </Button>
      )}
      <PromptInput {...prompt} />
    </Card>
  );
}
export function Reasoning({
  summary,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  summary: string;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  return (
    <Collapsible
      title={
        <span>
          <Icon name="sparkles" size={15} /> {summary}
        </span>
      }
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </Collapsible>
  );
}
export function ChainOfThought({ steps, label }: { steps: TraceEntry[]; label: string }) {
  return (
    <Collapsible title={label}>
      <Trace items={steps} label={label} />
    </Collapsible>
  );
}
export interface ToolCallProps {
  name: string;
  status: RunStatus;
  input?: unknown;
  output?: unknown;
  error?: string;
  duration?: number;
}
export function ToolCall({ name, status, input, output, error, duration }: ToolCallProps) {
  const l = useLabels(
    { input: 'ورودی ابزار', output: 'خروجی ابزار' },
    { input: 'Tool input', output: 'Tool output' },
  );
  return (
    <Card className="pd-ai-tool">
      <header>
        <Icon name="code" size={18} />
        <strong>{name}</strong>
        <RunBadge status={status} />
        {duration !== undefined && <small>{duration} ms</small>}
      </header>
      {input !== undefined && (
        <Collapsible title={l.input}>
          <CodeBlock code={json(input)} language="json" />
        </Collapsible>
      )}
      {output !== undefined && (
        <Collapsible title={l.output} defaultOpen={status === 'success'}>
          <CodeBlock code={json(output)} language="json" />
        </Collapsible>
      )}
      {error && <Alert tone="danger">{error}</Alert>}
    </Card>
  );
}
export function Confirmation({
  title,
  description,
  onApprove,
  onReject,
  status = 'pending',
  loading,
}: {
  title: string;
  description?: string;
  onApprove: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
  status?: 'pending' | 'approved' | 'rejected';
  loading?: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    l = useLabels(
      { approve: 'اجازه می‌دهم', reject: 'رد درخواست', approved: 'تأیید شده', rejected: 'رد شده' },
      { approve: 'Approve', reject: 'Reject', approved: 'Approved', rejected: 'Rejected' },
    );
  const act = async (callback: () => void | Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await callback();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card className="pd-ai-confirmation">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {status === 'pending' ? (
        <div>
          <Button size="sm" loading={loading || busy} onClick={() => void act(onApprove)}>
            {l.approve}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || loading}
            onClick={() => void act(onReject)}
          >
            {l.reject}
          </Button>
        </div>
      ) : (
        <Badge tone={status === 'approved' ? 'success' : 'danger'}>{l[status]}</Badge>
      )}
      {error && (
        <div role="alert" className="pd-error">
          {error}
        </div>
      )}
    </Card>
  );
}
export function Checkpoint({
  title,
  description,
  onRestore,
  disabled,
}: {
  title: string;
  description?: string;
  onRestore: () => void | Promise<void>;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    label = useLabels('بازگشت به این نقطه', 'Restore checkpoint');
  return (
    <div className="pd-ai-checkpoint">
      <Icon name="clock" size={17} />
      <div>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
        {error && (
          <small role="alert" className="pd-error">
            {error}
          </small>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        loading={busy}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            await onRestore();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Restore failed');
          } finally {
            setBusy(false);
          }
        }}
      >
        {label}
      </Button>
    </div>
  );
}
export function ContextUsage({
  used,
  limit,
  label,
  details,
}: {
  used: number;
  limit: number;
  label?: string;
  details?: ReactNode;
}) {
  const { locale } = usePrime(),
    fallback = useLabels('مصرف زمینهٔ مدل', 'Model context usage');
  return (
    <div className="pd-ai-context">
      <div>
        <strong>{label ?? fallback}</strong>
        <small>
          {formatNumber(used, {}, locale)} / {formatNumber(limit, {}, locale)}
        </small>
      </div>
      <Progress label={label ?? fallback} value={used} max={limit} />
      {details}
    </div>
  );
}
export interface PlanItem {
  id: string;
  title: string;
  description?: string;
  status: RunStatus;
}
export function Plan({ title, items }: { title: string; items: PlanItem[] }) {
  return (
    <Card className="pd-ai-plan">
      <h3>{title}</h3>
      <ol>
        {items.map((item, i) => (
          <li key={item.id}>
            <span>{i + 1}</span>
            <div>
              <strong>{item.title}</strong>
              {item.description && <small>{item.description}</small>}
            </div>
            <RunBadge status={item.status} />
          </li>
        ))}
      </ol>
    </Card>
  );
}
export function TaskCard({
  title,
  status,
  description,
  progress,
  actions,
}: {
  title: string;
  status: RunStatus;
  description?: string;
  progress?: number;
  actions?: ReactNode;
}) {
  return (
    <Card className="pd-ai-task">
      <header>
        <strong>{title}</strong>
        <RunBadge status={status} />
      </header>
      {description && <p>{description}</p>}
      {progress !== undefined && <Progress label={title} value={progress} />} {actions}
    </Card>
  );
}
export interface QueueItem {
  id: string;
  title: string;
  status: RunStatus;
}
export function Queue({
  items,
  onCancel,
  onRetry,
  label,
}: {
  items: QueueItem[];
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  label: string;
}) {
  const l = useLabels({ cancel: 'لغو', retry: 'تلاش مجدد' }, { cancel: 'Cancel', retry: 'Retry' });
  return (
    <section className="pd-ai-queue" aria-label={label}>
      <h3>{label}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <RunBadge status={item.status} />
            {onCancel && (item.status === 'pending' || item.status === 'running') && (
              <Button size="sm" variant="ghost" onClick={() => onCancel(item.id)}>
                {l.cancel}
              </Button>
            )}
            {onRetry && item.status === 'error' && (
              <Button size="sm" variant="outline" onClick={() => onRetry(item.id)}>
                {l.retry}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
export function Terminal({
  output,
  title = 'Terminal',
  running = false,
}: {
  output: string;
  title?: string;
  running?: boolean;
}) {
  return (
    <div className="pd-ai-terminal">
      <CodeBlock code={output} filename={title} language="text" />
      {running && (
        <Badge tone="brand" dot>
          Running
        </Badge>
      )}
    </div>
  );
}
export function StackTrace({ message, stack }: { message: string; stack: string }) {
  return (
    <div className="pd-ai-stack">
      <Alert title={message} tone="danger" />
      <CodeBlock code={stack} language="text" filename="Stack trace" />
    </div>
  );
}
export function TestResults({
  items,
  label,
}: {
  items: {
    id: string;
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration?: number;
    error?: string;
  }[];
  label: string;
}) {
  const labels = useLabels(
    { passed: 'موفق', failed: 'ناموفق', skipped: 'رد شده' },
    { passed: 'Passed', failed: 'Failed', skipped: 'Skipped' },
  );
  return (
    <Card className="pd-ai-tests">
      <h3>{label}</h3>
      <div>
        {(['passed', 'failed', 'skipped'] as const).map((status) => (
          <Badge
            key={status}
            tone={status === 'passed' ? 'success' : status === 'failed' ? 'danger' : 'neutral'}
          >
            {labels[status]}: {items.filter((i) => i.status === status).length}
          </Badge>
        ))}
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <Icon
              name={
                item.status === 'passed' ? 'check' : item.status === 'failed' ? 'warning' : 'minus'
              }
              size={16}
            />
            <strong>{item.name}</strong>
            <small>{item.duration ?? '—'} ms</small>
            {item.error && <pre>{item.error}</pre>}
          </li>
        ))}
      </ul>
    </Card>
  );
}
export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}
export function FileTree({
  items,
  label,
  onSelect,
  selected,
}: {
  items: FileTreeNode[];
  label: string;
  onSelect?: (id: string) => void;
  selected?: string;
}) {
  return (
    <div className="pd-ai-file-tree" role="group" aria-label={label}>
      {items.map((item) =>
        item.type === 'directory' ? (
          <details key={item.id} open>
            <summary>
              <Icon name="box" size={15} />
              {item.name}
            </summary>
            <FileTree
              items={item.children ?? []}
              label={item.name}
              onSelect={onSelect}
              selected={selected}
            />
          </details>
        ) : (
          <button
            type="button"
            key={item.id}
            aria-pressed={selected === item.id}
            onClick={() => onSelect?.(item.id)}
          >
            <Icon name="code" size={14} />
            {item.name}
          </button>
        ),
      )}
    </div>
  );
}
export function SubagentCard({
  name,
  description,
  status,
  children,
}: {
  name: string;
  description?: string;
  status: RunStatus;
  children?: ReactNode;
}) {
  return (
    <Card className="pd-ai-subagent">
      <header>
        <Avatar name={name} />
        <div>
          <strong>{name}</strong>
          {description && <small>{description}</small>}
        </div>
        <RunBadge status={status} />
      </header>
      {children}
    </Card>
  );
}
