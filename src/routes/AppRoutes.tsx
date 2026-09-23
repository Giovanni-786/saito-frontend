import { useAtomValue } from 'jotai'
import { Navigate, Route, Routes } from 'react-router'
import App from '../App'
import Login from '../pages/Login/Login'
import RequireAuth from './RequireAuth'
import { isAuthenticatedAtom } from '../store'

/**
 * Mapa de rotas da aplicação.
 *
 * `/login` é a única rota pública. Todo o resto fica abaixo do RequireAuth.
 */
function AppRoutes() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  return (
    <Routes>
      {/* Quem já está logado não tem por que ver a tela de login de novo. */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<App />} />
      </Route>

      {/* Qualquer URL desconhecida volta para a raiz, que por sua vez decide
          entre o app e o login conforme a sessão. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
