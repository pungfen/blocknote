import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

import Dts from 'vite-plugin-dts'
import Tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Veaury from 'veaury/vite/index'

export default defineConfig({
  build: {
    lib: {
      entry: ['src/index.ts'],
      formats: ['es']
    },
    rolldownOptions: {
      external: ['vue']
    }
  },
  plugins: [
    Veaury({ type: 'vue' }),
    Dts({ tsconfigPath: 'tsconfig.build.json', outDir: 'dist' }),
    Tailwindcss(),
    AutoImport({ imports: ['vue'] }),
    Components()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000
  }
})
