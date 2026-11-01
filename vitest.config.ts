import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: Object.fromEntries(
      ['tokens', 'persian', 'icons', 'react', 'forms', 'data', 'commerce', 'blocks'].map((p) => [
        `@primedesign/${p}`,
        resolve(`packages/${p}/src/index.ts`),
      ]),
    ),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
