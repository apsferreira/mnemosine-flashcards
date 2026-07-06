import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

// No Docker, usar o proxy do Vite (/api → api:3004)
// Em produção, VITE_API_URL fica vazio e o IngressRoute roteia /api para o backend
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) ?? ''

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

// Request interceptor — injeta JWT de sessionStorage em toda request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

// Response interceptor — tenta refresh uma vez no 401; redireciona para SSO se falhar
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

const AUTH_SERVICE_URL = (import.meta.env?.VITE_AUTH_SERVICE_URL as string) || 'http://localhost:3010'

function buildSSOUrl(): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://flashcards.institutoitinerante.com.br'
  const redirectUri = encodeURIComponent(`${origin}/auth/callback`)
  return `https://auth.institutoitinerante.com.br/auth/login?product=mnemosine&redirect_uri=${redirectUri}`
}

function clearSession() {
  sessionStorage.removeItem('access_token')
  sessionStorage.removeItem('refresh_token')
  sessionStorage.removeItem('mnemosine_user')
}

function redirectToSSO() {
  clearSession()
  window.location.href = buildSSOUrl()
}

interface RefreshTokenResponse {
  access_token: string
  refresh_token?: string
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        status: error.response?.status,
        url: error.config?.url,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- dados de debug em dev, sem risco
        data: error.response?.data,
      })
    }

    const originalRequest = error.config as RetryableConfig | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = sessionStorage.getItem('refresh_token')

      if (!refreshToken) {
        redirectToSSO()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post<RefreshTokenResponse>(
          `${AUTH_SERVICE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
        )

        const newAccessToken = data.access_token
        sessionStorage.setItem('access_token', newAccessToken)
        if (data.refresh_token) sessionStorage.setItem('refresh_token', data.refresh_token)

        pendingRequests.forEach((cb) => cb(newAccessToken))
        pendingRequests = []

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return api(originalRequest)
      } catch {
        pendingRequests = []
        redirectToSSO()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
