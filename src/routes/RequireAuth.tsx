import { useAtomValue } from 'jotai'
import { Navigate, Outlet, useLocation } from 'react-router'
import { isAuthenticatedAtom } from '../store'

/**
 * Rota-portão: só deixa passar quem tem token.
 *
 * Usada como rota-pai (`<Route element={<RequireAuth />}>`), então protege tudo
 * que estiver aninhado nela sem precisar repetir a checagem em cada página.
 */
function RequireAuth() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      // Guarda de onde o usuário veio para o login devolvê-lo ao destino certo.
      // `replace` evita que voltar no histórico caia de novo na rota bloqueada.
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    )
  }

  return <Outlet />
}

export default RequireAuth
