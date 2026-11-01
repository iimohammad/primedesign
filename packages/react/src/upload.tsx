'use client';
import { Icon } from '@primedesign/icons';
import { formatNumber } from '@primedesign/persian';
import { useEffect, useId, useRef, useState } from 'react';
import { Button, IconButton, Progress } from './primitives.js';
import { useLabels, usePrime } from './provider.js';
import { useLatest } from './utils.js';
export interface UploadContext {
  signal: AbortSignal;
  onProgress: (percent: number) => void;
}
export type Uploader = (file: File, context: UploadContext) => Promise<{ url?: string } | void>;
export interface UploadItem {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'done' | 'error' | 'canceled';
  progress: number;
  error?: string;
  url?: string;
}
export function formatBytes(bytes: number, locale = 'fa-IR'): string {
  const units = locale.startsWith('fa')
    ? ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
    : ['B', 'KB', 'MB', 'GB'];
  let n = bytes,
    i = 0;
  while (n >= 1024 && i < 3) {
    n /= 1024;
    i++;
  }
  return `${formatNumber(n, { maximumFractionDigits: i ? 1 : 0 }, locale)} ${units[i]}`;
}
export function acceptsFile(file: File, accept?: string): boolean {
  return (
    !accept ||
    accept.split(',').some((s) => {
      const a = s.trim().toLowerCase();
      return a.startsWith('.')
        ? file.name.toLowerCase().endsWith(a)
        : a.endsWith('/*')
          ? file.type.toLowerCase().startsWith(a.slice(0, -1))
          : file.type.toLowerCase() === a;
    })
  );
}
/** Transport is supplied by the application; no endpoint or credential is embedded. */
export function FileUpload({
  label,
  uploader,
  accept,
  multiple = true,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 10,
  concurrency = 3,
  disabled,
  onItemsChange,
}: {
  label: string;
  uploader?: Uploader;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  concurrency?: number;
  disabled?: boolean;
  onItemsChange?: (items: UploadItem[]) => void;
}) {
  const [items, setItems] = useState<UploadItem[]>([]),
    [dragging, setDragging] = useState(false),
    [message, setMessage] = useState(''),
    input = useRef<HTMLInputElement>(null),
    controllers = useRef(new Map<string, AbortController>()),
    mounted = useRef(true),
    next = useRef(0),
    id = useId(),
    { locale } = usePrime();
  const l = useLabels(
    {
      drop: 'فایل را اینجا رها کنید',
      browse: 'انتخاب فایل',
      hint: 'یا برای انتخاب کلیک کنید',
      cancel: 'لغو آپلود',
      retry: 'تلاش مجدد',
      remove: 'حذف فایل',
      size: 'حجم فایل بیش از حد مجاز است.',
      type: 'نوع فایل پذیرفته نیست.',
      count: 'تعداد فایل‌ها بیش از حد مجاز است.',
      queued: 'در صف',
      uploading: 'در حال بارگذاری',
      done: 'آماده',
      error: 'خطا',
      canceled: 'لغو شد',
      failed: 'بارگذاری ناموفق بود.',
    },
    {
      drop: 'Drop files here',
      browse: 'Choose files',
      hint: 'or click to browse',
      cancel: 'Cancel upload',
      retry: 'Retry',
      remove: 'Remove file',
      size: 'File is too large.',
      type: 'File type is not accepted.',
      count: 'Too many files.',
      queued: 'Queued',
      uploading: 'Uploading',
      done: 'Ready',
      error: 'Error',
      canceled: 'Canceled',
      failed: 'Upload failed.',
    },
  );
  const onChangeRef = useLatest(onItemsChange);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controllers.current.forEach((c) => c.abort());
      controllers.current.clear();
    };
  }, []);
  useEffect(() => {
    onChangeRef.current?.(items);
  }, [items]);
  useEffect(() => {
    if (!uploader) return;
    const capacity = Math.max(1, concurrency) - controllers.current.size;
    for (const item of items
      .filter((x) => x.status === 'queued' && !controllers.current.has(x.id))
      .slice(0, capacity)) {
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      setItems((v) =>
        v.map((x) => (x.id === item.id ? { ...x, status: 'uploading', progress: 0 } : x)),
      );
      Promise.resolve()
        .then(() =>
          uploader(item.file, {
            signal: controller.signal,
            onProgress: (percent) => {
              if (mounted.current && !controller.signal.aborted)
                setItems((v) =>
                  v.map((x) =>
                    x.id === item.id ? { ...x, progress: Math.max(0, Math.min(100, percent)) } : x,
                  ),
                );
            },
          }),
        )
        .then((result) => {
          if (mounted.current && !controller.signal.aborted)
            setItems((v) =>
              v.map((x) =>
                x.id === item.id ? { ...x, status: 'done', progress: 100, url: result?.url } : x,
              ),
            );
        })
        .catch((e) => {
          if (mounted.current && !controller.signal.aborted)
            setItems((v) =>
              v.map((x) =>
                x.id === item.id
                  ? { ...x, status: 'error', error: e instanceof Error ? e.message : l.failed }
                  : x,
              ),
            );
        })
        .finally(() => {
          controllers.current.delete(item.id);
          if (mounted.current) setItems((v) => [...v]);
        });
    }
  }, [items, uploader, concurrency]);
  const add = (files: FileList | File[]) => {
    if (disabled) return;
    const list = Array.from(files).slice(0, multiple ? undefined : 1),
      valid: UploadItem[] = [];
    const count = multiple ? items.length : 0;
    let error = '';
    for (const file of list) {
      if (count + valid.length >= maxFiles) {
        error = l.count;
        break;
      }
      if (!acceptsFile(file, accept)) {
        error = l.type;
        continue;
      }
      if (file.size > maxSize) {
        error = l.size;
        continue;
      }
      valid.push({
        id: `${id}-${++next.current}`,
        file,
        status: uploader ? 'queued' : 'done',
        progress: uploader ? 0 : 100,
      });
    }
    if (!multiple) controllers.current.forEach((c) => c.abort());
    setItems((v) => (multiple ? [...v, ...valid] : valid));
    setMessage(error);
  };
  return (
    <div className="pd-upload">
      <span className="pd-label" id={`${id}-label`}>
        {label}
      </span>
      <div
        className="pd-dropzone"
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
      >
        <span className="pd-upload-icon">
          <Icon name="upload" size={26} />
        </span>
        <strong>{l.drop}</strong>
        <span>{l.hint}</span>
        <small>
          {accept ?? '*'} · {formatBytes(maxSize, locale)}
        </small>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          {l.browse}
        </Button>
        <input
          ref={input}
          type="file"
          className="pd-sr-only"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      <div role="status" className="pd-error">
        {message}
      </div>
      <ul className="pd-upload-list">
        {items.map((item) => (
          <li key={item.id}>
            <span className="pd-file-icon">
              <Icon name="box" />
            </span>
            <div>
              <strong>{item.file.name}</strong>
              <small>
                {formatBytes(item.file.size, locale)} · {l[item.status]}
              </small>
              {item.status === 'uploading' && (
                <Progress label={item.file.name} value={item.progress} />
              )}{' '}
              {item.error && (
                <span className="pd-error" role="alert">
                  {item.error}
                </span>
              )}
            </div>
            {item.status === 'error' || item.status === 'canceled' ? (
              <IconButton
                icon="refresh"
                label={`${l.retry} ${item.file.name}`}
                variant="ghost"
                size="sm"
                onClick={() =>
                  setItems((v) =>
                    v.map((x) =>
                      x.id === item.id ? { ...x, status: 'queued', error: undefined } : x,
                    ),
                  )
                }
              />
            ) : null}
            {item.status === 'uploading' ? (
              <IconButton
                icon="close"
                label={`${l.cancel} ${item.file.name}`}
                variant="ghost"
                size="sm"
                onClick={() => {
                  controllers.current.get(item.id)?.abort();
                  setItems((v) =>
                    v.map((x) => (x.id === item.id ? { ...x, status: 'canceled' } : x)),
                  );
                }}
              />
            ) : (
              <IconButton
                icon="trash"
                label={`${l.remove} ${item.file.name}`}
                variant="ghost"
                size="sm"
                onClick={() => setItems((v) => v.filter((x) => x.id !== item.id))}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export interface ChunkTransport {
  begin: (file: File, signal: AbortSignal) => Promise<string>;
  uploadPart: (uploadId: string, index: number, chunk: Blob, signal: AbortSignal) => Promise<void>;
  complete: (uploadId: string, file: File, signal: AbortSignal) => Promise<{ url?: string } | void>;
}
/** Retry the same File object to resume acknowledged chunks. Server must authorize every upload/part. */
export function createChunkedUploader(
  transport: ChunkTransport,
  { chunkSize = 5 * 1024 * 1024, retries = 2 }: { chunkSize?: number; retries?: number } = {},
): Uploader {
  if (!Number.isSafeInteger(chunkSize) || chunkSize <= 0)
    throw new RangeError('chunkSize must be positive');
  const sessions = new WeakMap<File, { id: string; done: Set<number> }>();
  return async (file, { signal, onProgress }) => {
    signal.throwIfAborted();
    let session = sessions.get(file);
    if (!session) {
      session = { id: await transport.begin(file, signal), done: new Set() };
      sessions.set(file, session);
    }
    const total = Math.max(1, Math.ceil(file.size / chunkSize));
    for (let index = 0; index < total; index++) {
      signal.throwIfAborted();
      if (!session.done.has(index)) {
        let attempt = 0;
        while (true) {
          try {
            await transport.uploadPart(
              session.id,
              index,
              file.slice(index * chunkSize, (index + 1) * chunkSize),
              signal,
            );
            break;
          } catch (e) {
            signal.throwIfAborted();
            if (attempt++ >= retries) throw e;
          }
        }
        session.done.add(index);
      }
      onProgress(Math.round((session.done.size / total) * 99));
    }
    signal.throwIfAborted();
    const result = await transport.complete(session.id, file, signal);
    sessions.delete(file);
    onProgress(100);
    return result;
  };
}
