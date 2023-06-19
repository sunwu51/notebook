import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {resolve,__dirname} from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve('.')
    }
  }
})
