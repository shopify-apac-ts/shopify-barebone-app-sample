import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

process.env.VITE_SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || ''

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000
  },
  plugins: [react()],
  envPrefix: ['VITE_', 'SHOPIFY_'],
  resolve: {
    alias: {
      '@shopify/polaris': path.resolve(__dirname, 'src/shims/polaris.jsx'),
      '@shopify/app-bridge-react': path.resolve(__dirname, 'src/shims/app-bridge-react.jsx'),
      '@shopify/app-bridge/actions': path.resolve(__dirname, 'src/shims/app-bridge-actions.js'),
      '@shopify/app-bridge-utils': path.resolve(__dirname, 'src/shims/app-bridge-utils.js'),
      '@shopify/polaris-icons': path.resolve(__dirname, 'src/shims/polaris-icons.js'),
    },
  },
  define: {
    "API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY)
  },
})
