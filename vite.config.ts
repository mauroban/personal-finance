import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tauri-apps/plugin-dialog': path.resolve(__dirname, './src/stubs/tauri-plugin-dialog.ts'),
      '@tauri-apps/plugin-fs': path.resolve(__dirname, './src/stubs/tauri-plugin-fs.ts'),
    },
  },
  build: {
    rollupOptions: {
      // Suppress warnings for Tauri plugins (they're dynamically imported and optional)
      onwarn(warning, warn) {
        // Ignore warnings about unresolved Tauri imports
        if (warning.code === 'UNRESOLVED_IMPORT' &&
            (warning.message?.includes('@tauri-apps/plugin-dialog') ||
             warning.message?.includes('@tauri-apps/plugin-fs'))) {
          return
        }
        warn(warning)
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
