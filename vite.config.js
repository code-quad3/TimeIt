/*import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.',
        },
        {
          src: 'public/background.js',
          dest: '.',
        },
        {
          src: 'public/content.js',
          dest: '.',
        },
      ],
    }),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        // Define both entry points here, pointing to the root directory
        popup: 'index.html',
        stats: 'stats.html',
      },
      output: {
        // This ensures the entry files have clean names and are placed correctly
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});  
*/


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.',
        },
      ],
    }),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        // Define all entry points here so Vite can bundle them correctly.
        popup: 'index.html',
        stats: 'stats.html',
        background: 'public/background.js',
        content: 'public/content.js',
      },
      output: {
        // This ensures the entry files have clean names and are placed correctly
        entryFileNames: `[name].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});