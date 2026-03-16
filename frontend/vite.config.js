import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/requests': { target: backendUrl, changeOrigin: true },
        '/audit':    { target: backendUrl, changeOrigin: true },
        '/health':   { target: backendUrl, changeOrigin: true },
        '/docs':     { target: backendUrl, changeOrigin: true },
        '/openapi.json': { target: backendUrl, changeOrigin: true },
      },
    },
  }
})
