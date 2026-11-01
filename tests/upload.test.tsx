import {
  acceptsFile,
  createChunkedUploader,
  FileUpload,
  type UploadContext,
} from '@primedesign/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
describe('upload transport', () => {
  it('accepts MIME families and extensions case-insensitively', () => {
    const file = new File(['x'], 'REPORT.PDF', { type: 'application/pdf' });
    expect(acceptsFile(file, '.pdf')).toBe(true);
    expect(acceptsFile(file, 'image/*')).toBe(false);
    expect(acceptsFile(new File(['x'], 'a.png', { type: 'image/png' }), 'image/*')).toBe(true);
  });
  it('uploads chunks once, resumes acknowledged parts, completes after retry', async () => {
    const file = new File(['abcdefghij'], 'file.txt'),
      begin = vi.fn().mockResolvedValue('upload-1'),
      uploadPart = vi.fn().mockImplementation(async (_id, index) => {
        if (index === 1 && uploadPart.mock.calls.length === 2) throw new Error('temporary');
      }),
      complete = vi.fn().mockResolvedValue({ url: '/files/file.txt' }),
      uploader = createChunkedUploader(
        { begin, uploadPart, complete },
        { chunkSize: 4, retries: 0 },
      ),
      context = { signal: new AbortController().signal, onProgress: vi.fn() };
    await expect(uploader(file, context)).rejects.toThrow('temporary');
    await expect(uploader(file, context)).resolves.toEqual({ url: '/files/file.txt' });
    expect(begin).toHaveBeenCalledTimes(1);
    expect(uploadPart.mock.calls.map((c) => c[1])).toEqual([0, 1, 1, 2]);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(context.onProgress).toHaveBeenLastCalledWith(100);
  });
  it('aborts before starting transport', async () => {
    const begin = vi.fn(),
      controller = new AbortController();
    controller.abort();
    const uploader = createChunkedUploader({ begin, uploadPart: vi.fn(), complete: vi.fn() });
    await expect(
      uploader(new File(['x'], 'x'), { signal: controller.signal, onProgress: () => {} }),
    ).rejects.toThrow();
    expect(begin).not.toHaveBeenCalled();
  });
  it('rejects invalid chunk sizes', () =>
    expect(() =>
      createChunkedUploader(
        { begin: vi.fn(), uploadPart: vi.fn(), complete: vi.fn() },
        { chunkSize: 0 },
      ),
    ).toThrow());
});
describe('upload queue', () => {
  it('rejects oversized and disallowed files before transport', async () => {
    const uploader = vi.fn(),
      { container } = render(
        <FileUpload label="Upload" uploader={uploader} accept=".pdf" maxSize={2} />,
      );
    fireEvent.change(container.querySelector('input[type=file]')!, {
      target: { files: [new File(['large'], 'file.pdf')] },
    });
    expect(await screen.findByText('حجم فایل بیش از حد مجاز است.')).toBeInTheDocument();
    expect(uploader).not.toHaveBeenCalled();
  });
  it('supports cancellation without a late completion changing status', async () => {
    let context!: UploadContext, resolve!: (v: void) => void;
    const uploader = vi.fn((_file, ctx) => {
        context = ctx;
        return new Promise<void>((r) => {
          resolve = r;
        });
      }),
      { container } = render(<FileUpload label="Upload" uploader={uploader} />);
    fireEvent.change(container.querySelector('input[type=file]')!, {
      target: { files: [new File(['x'], 'a.txt')] },
    });
    await waitFor(() => expect(uploader).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByRole('button', { name: 'لغو آپلود a.txt' }));
    expect(context.signal.aborted).toBe(true);
    resolve();
    expect(await screen.findByRole('button', { name: 'تلاش مجدد a.txt' })).toBeInTheDocument();
  });
  it('limits concurrent requests and drains the next queued item', async () => {
    const resolvers: Array<() => void> = [],
      uploader = vi.fn(() => new Promise<void>((resolve) => resolvers.push(resolve))),
      { container } = render(<FileUpload label="Upload" uploader={uploader} concurrency={1} />);
    fireEvent.change(container.querySelector('input[type=file]')!, {
      target: { files: [new File(['x'], 'a.txt'), new File(['x'], 'b.txt')] },
    });
    await waitFor(() => expect(uploader).toHaveBeenCalledTimes(1));
    resolvers[0]();
    await waitFor(() => expect(uploader).toHaveBeenCalledTimes(2));
    resolvers[1]();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /لغو آپلود/ })).not.toBeInTheDocument(),
    );
  });
});
