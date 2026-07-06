import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, AuthResponse } from '../types/auth'
import authService from '../services/authService'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, code: string) => Promise<User | null>
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components -- contexto exportado para hooks/useAuth.ts
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_USER_KEY = 'mnemosine_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  const restoreSession = useCallback(() => {
    const token = sessionStorage.getItem('access_token')
    const storedUser = sessionStorage.getItem(SESSION_USER_KEY)
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User)
      } catch {
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')
        sessionStorage.removeItem(SESSION_USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const handleAuthResponse = (response: AuthResponse) => {
    sessionStorage.setItem('access_token', response.access_token)
    sessionStorage.setItem('refresh_token', response.refresh_token)
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(response.user))
    setUser(response.user)
  }

  const login = async (email: string, code: string): Promise<User | null> => {
    const response = await authService.verifyOTP(email, code)
    handleAuthResponse(response)
    return response.user ?? null
  }

  // Usado pelo AuthCallbackPage: tokens chegam via query string do auth-service SSO.
  // O access_token já é válido — basta buscar o perfil com ele, sem refresh desnecessário.
  const loginWithTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
    sessionStorage.setItem('access_token', accessToken)
    sessionStorage.setItem('refresh_token', refreshToken)
    const user = await authService.getProfile()
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user))
    setUser(user)
  }

  const logout = async () => {
    try {
      const refreshToken = sessionStorage.getItem('refresh_token')
      if (refreshToken) await authService.logout(refreshToken)
    } finally {
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
      sessionStorage.removeItem(SESSION_USER_KEY)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, loginWithTokens, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
