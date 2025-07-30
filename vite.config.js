import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {viteStaticCopy} from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()
    ,tailwindcss(),
    viteStaticCopy({
      targets:[{
        src: 'public/manifest.json',
        dest: '.',
         src: 'public/background.js',
          dest: '.', // copies to `build/`
      
       src: 'public/content.js',
          dest: '.', // copies to `build/`
      } 


      ],
    })
  ],
  build: {
    outDir:'build',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
