import axios from 'axios'
import type { AuthResponse, OTPResponse, User } from '../types/auth'

// Auth-service roda na porta 3010 (separado do Mnemosine na 3004)
const AUTH_BASE_URL = (import.meta.env?.VITE_AUTH_SERVICE_URL as string) || 'http://localhost:3010'

const authApi = axios.create({
  baseURL: `${AUTH_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

authApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const authService = {
  async requestOTP(email: string, channel: 'email' | 'telegram' | 'whatsapp' = 'email'): Promise<OTPResponse> {
    const { data } = await authApi.post<OTPResponse>('/auth/request-otp', { email, channel })
    return data
  },

  async verifyOTP(email: string, code: string): Promise<AuthResponse> {
    const { data } = await authApi.post<AuthResponse>('/auth/verify-otp', { email, code })
    return data
  },

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    const { data } = await authApi.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken })
    return data
  },

  async logout(refreshToken: string): Promise<void> {
    await authApi.post('/auth/logout', { refresh_token: refreshToken })
  },

  async getProfile(): Promise<User> {
    const { data } = await authApi.get<User>('/auth/me')
    return data
  },
}

export default authService
