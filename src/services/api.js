import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL: API_URL })

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('antima_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → logout
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('antima_admin_token')
      localStorage.removeItem('antima_admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
