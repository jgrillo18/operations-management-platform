import axios from 'axios'

// In development, Vite proxies API calls to the backend.
// In production (Render static site), set VITE_API_URL to the backend URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

export default api
