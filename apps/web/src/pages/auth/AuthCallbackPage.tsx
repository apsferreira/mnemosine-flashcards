import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Recebe access_token e refresh_token via query string do auth-service SSO.
// Fluxo: auth.institutoitinerante.com.br → redirect_uri?access_token=...&refresh_token=...
export default function AuthCallbackPage() {
  const { loginWithTokens } = useAuth()
  const navigate = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true })
      return
    }

    loginWithTokens(accessToken, refreshToken)
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/login', { replace: true }))
  // eslint-disable-next-line react-hooks/exhaustive-deps -- executar apenas uma vez no mount (called.current previne dupla execução)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
          aria-label="Autenticando"
          role="status"
        />
        <p className="text-sm text-gray-500">Autenticando...</p>
      </div>
    </div>
  )
}
