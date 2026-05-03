import axios from 'axios'
import { mockCompanies, mockEntries, mockProjects } from '../utils/mockData'

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/**
 * Auto token refresh on 401 (before expiry)
 */
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

(error) => {
  const message =
    error.response?.data?.message ||
    error.message ||
    'Something went wrong while connecting to the server.'

  if (error.response?.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('auth-store')
    // Redirect to login
    window.location.href = '/login'
  }

  return Promise.reject(new Error(message))
}

export const unwrap = async (request) => {
  const response = await request
  return response.data?.data ?? response.data
}

export { mockCompanies, mockEntries, mockProjects }
export default client
