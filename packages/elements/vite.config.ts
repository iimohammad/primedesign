import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  resolve: { dedupe: ['react', 'react-dom'] },
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/index.ts',
      name: 'PrimeDesign',
      fileName: (format) =>
        format === 'es' ? 'primedesign-elements.js' : 'primedesign-elements.umd.cjs',
      formats: ['es', 'umd'],
    },
    minify: 'esbuild',
  },
});
