import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

const cbrProxy = {
  '/cbr': {
    target: 'https://www.cbr-xml-daily.ru',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/cbr/, ''),
  },
};

export default defineConfig({
  plugins: [preact()],
  base: './',
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  server: { proxy: cbrProxy },
  preview: { proxy: cbrProxy },
});
