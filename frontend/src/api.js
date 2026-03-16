import axios from 'axios'

// Requests go to the same origin — Vite proxy routes them to the backend.
// Set VITE_BACKEND_URL in docker-compose or .env to override the proxy target.
const api = axios.create({ baseURL: '' })

export default api
