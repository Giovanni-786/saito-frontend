import { api } from '../utils/api'

/** Corpo esperado por POST /auth/login. Os nomes vêm do LoginDTO do backend. */
export type LoginCredentials = {
  email: string
  senha: string
}

/** Resposta de POST /auth/login. `tipo` é sempre "Bearer" hoje. */
export type LoginResponse = {
  token: string
  tipo: string
}

/** Autentica o usuário e devolve o token. Falhas chegam como ApiError. */
export function login(credentials: LoginCredentials) {
  return api.post<LoginResponse, LoginCredentials>('/auth/login', credentials)
}
