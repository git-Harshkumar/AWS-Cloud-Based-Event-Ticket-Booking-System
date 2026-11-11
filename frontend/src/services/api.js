import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    // If backend wrapped response in { success: true, data: ..., ... }
    // unwrap response.data so components can access data cleanly
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const original = response.data
      const unwrapped = original.data
      if (unwrapped !== null && typeof unwrapped === 'object') {
        if (original.pagination) unwrapped.pagination = original.pagination
        if (original.message) unwrapped.message = original.message
        if (original.success !== undefined) unwrapped.success = original.success
        response.data = unwrapped
        return response
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api