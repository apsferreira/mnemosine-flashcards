import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const AUTH_SSO_URL = `https://auth.institutoitinerante.com.br/auth/login?product=mnemosine&redirect_uri=${encodeURIComponent(
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://flashcards.institutoitinerante.com.br/auth/callback',
)}`

// Layout-route guard: renderiza <Outlet /> se autenticado, redireciona para SSO caso contrário.
// Usar como element em um <Route> pai que agrupa rotas protegidas.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
          aria-label="Carregando"
          role="status"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    window.location.href = AUTH_SSO_URL
    return null
  }

  return <Outlet />
}
