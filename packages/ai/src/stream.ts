export interface StreamOptions {
  url: string;
  body: unknown;
  signal: AbortSignal;
  onDelta: (text: string) => void;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  protocol?: 'sse' | 'ndjson';
  extractDelta?: (event: unknown) => string | undefined;
  maxEventBytes?: number;
}
/** Reads application-provided SSE/NDJSON. It never calls a model provider directly. */
export async function streamCompletion({
  url,
  body,
  signal,
  onDelta,
  headers,
  credentials = 'same-origin',
  protocol = 'sse',
  extractDelta,
  maxEventBytes = 1024 * 1024,
}: StreamOptions): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials,
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  if (!response.body) throw new Error('Streaming response is unavailable');
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let buffer = '',
    done = false;
  const parse = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    if (text === '[DONE]') {
      done = true;
      return;
    }
    const value: unknown = JSON.parse(text);
    if (value && typeof value === 'object' && 'error' in value)
      throw new Error(String((value as { error: unknown }).error));
    const delta = extractDelta
      ? extractDelta(value)
      : value && typeof value === 'object' && 'delta' in value
        ? String((value as { delta: unknown }).delta ?? '')
        : undefined;
    if (delta) onDelta(delta);
  };
  const process = () => {
    const delimiter = protocol === 'sse' ? /\r?\n\r?\n/ : /\r?\n/;
    let match: RegExpExecArray | null;
    while ((match = delimiter.exec(buffer))) {
      const block = buffer.slice(0, match.index);
      if (new TextEncoder().encode(block).length > maxEventBytes)
        throw new Error('Stream event exceeds size limit');
      buffer = buffer.slice(match.index + match[0].length);
      if (protocol === 'sse') {
        const data = block
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).replace(/^ /, ''))
          .join('\n');
        if (data) parse(data);
      } else parse(block);
      if (done) break;
    }
  };
  try {
    while (!done) {
      signal.throwIfAborted();
      const chunk = await reader.read();
      if (chunk.done) {
        buffer += decoder.decode();
        if (buffer.trim()) {
          if (protocol === 'sse') buffer += '\n\n';
          else buffer += '\n';
          process();
        }
        break;
      }
      buffer += decoder.decode(chunk.value, { stream: true });
      process();
      if (new TextEncoder().encode(buffer).length > maxEventBytes)
        throw new Error('Stream event exceeds size limit');
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
