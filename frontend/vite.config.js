import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      'socket.io-client': path.resolve(__dirname, '../node_modules/socket.io-client')
    }
  }
})
