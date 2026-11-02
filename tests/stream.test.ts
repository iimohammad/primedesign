// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { streamCompletion } from '../packages/ai/src/stream.js';
const encoder = new TextEncoder();
function response(chunks: (string | Uint8Array)[], status = 200) {
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks)
          controller.enqueue(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
        controller.close();
      },
    }),
    { status },
  );
}
afterEach(() => vi.unstubAllGlobals());
describe('application streaming transport', () => {
  it('decodes UTF8 across byte boundaries, ignores comments and stops at DONE', async () => {
    const bytes = encoder.encode(
      'data: {"delta":"سلام"}\r\n\r\ndata: [DONE]\n\ndata: {"delta":"ignored"}\n\n',
    );
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(response([bytes.slice(0, 20), bytes.slice(20, 22), bytes.slice(22)])),
    );
    const delta = vi.fn();
    await streamCompletion({
      url: '/api/chat',
      body: { prompt: 'Hi' },
      signal: new AbortController().signal,
      onDelta: delta,
    });
    expect(delta.mock.calls.flat().join('')).toBe('سلام');
  });
  it('accepts NDJSON trailing lines and a custom extraction function', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(response(['{"token":"a"}\n{"token":', '"b"}'])),
    );
    const delta = vi.fn();
    await streamCompletion({
      url: '/api',
      body: {},
      signal: new AbortController().signal,
      onDelta: delta,
      protocol: 'ndjson',
      extractDelta: (e) => (e as { token: string }).token,
    });
    expect(delta.mock.calls.flat()).toEqual(['a', 'b']);
  });
  it('limits each event while allowing many small events in one chunk', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(['{"delta":"a"}\n'.repeat(50)])));
    const delta = vi.fn();
    await streamCompletion({
      url: '/api',
      body: {},
      signal: new AbortController().signal,
      onDelta: delta,
      protocol: 'ndjson',
      maxEventBytes: 30,
    });
    expect(delta).toHaveBeenCalledTimes(50);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          response(['data: ' + JSON.stringify({ delta: 'x'.repeat(100) }) + '\n\n']),
        ),
    );
    await expect(
      streamCompletion({
        url: '/api',
        body: {},
        signal: new AbortController().signal,
        onDelta: delta,
        maxEventBytes: 30,
      }),
    ).rejects.toThrow('size limit');
  });
  it('rejects failed requests, server stream errors and malformed data', async () => {
    for (const r of [
      response([], 429),
      response(['data: {"error":"Unavailable"}\n\n']),
      response(['data: not-json\n\n']),
    ]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(r));
      await expect(
        streamCompletion({
          url: '/api',
          body: {},
          signal: new AbortController().signal,
          onDelta: vi.fn(),
        }),
      ).rejects.toThrow();
    }
  });
  it('honors cancellation before dispatching deltas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(['data: {"delta":"no"}\n\n'])));
    const controller = new AbortController(),
      delta = vi.fn();
    controller.abort();
    await expect(
      streamCompletion({ url: '/api', body: {}, signal: controller.signal, onDelta: delta }),
    ).rejects.toThrow();
    expect(delta).not.toHaveBeenCalled();
  });
});
