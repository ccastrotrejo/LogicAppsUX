import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { nodePolyfills as np } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: '~@xyflow/react',
        replacement: '@xyflow/react',
      },
    ],
  },
  plugins: [
    react(),
    NodeGlobalsPolyfillPlugin({
      // process: true,
      buffer: true,
    }),
    np(),
  ],
  server: {
    port: 4200,
    proxy: {
      '/templatesLocalProxy': {
        target: 'https://logicappsux-cdcee2hegtgdhegv.b02.azurefd.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/templatesLocalProxy/, ''),
        secure: false, // Optional: skip SSL validation in dev
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    // process: process,
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
});
