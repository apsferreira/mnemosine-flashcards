import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import { Layout } from './components/Layout/Layout';

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const DecksPage     = lazy(() => import('./pages/decks/DecksPage'));
const StudyPage     = lazy(() => import('./pages/study/StudyPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div
      className="flex items-center justify-center py-20"
      aria-busy="true"
      aria-label="Carregando página"
    >
      <div className="w-6 h-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rota pública: callback SSO — recebe access_token e refresh_token via query string */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Guard: redireciona para o auth-service SSO se não autenticado */}
            <Route element={<ProtectedRoute />}>
              {/* Layout compartilhado para todas as rotas protegidas */}
              <Route element={<Layout />}>
                <Route
                  index
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <DashboardPage />
                    </Suspense>
                  }
                />
                <Route
                  path="decks"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <DecksPage />
                    </Suspense>
                  }
                />
                <Route
                  path="study/:deckId"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <StudyPage />
                    </Suspense>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
