import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { setAuthToken } from '../utils/api'
import { store } from './store'

/** Chave do localStorage. Prefixada para não colidir com outras apps no mesmo host. */
const TOKEN_STORAGE_KEY = 'saito:auth-token'

/**
 * Token JWT da sessão.
 *
 * Fica no localStorage para o login sobreviver a um refresh (o token do backend
 * dura 24h). `getOnInit: true` faz o valor salvo já estar disponível na primeira
 * renderização — sem isso a app piscaria a tela de login antes de se reconhecer.
 */
export const authTokenAtom = atomWithStorage<string | null>(TOKEN_STORAGE_KEY, null, undefined, {
  getOnInit: true,
})

/** Derivado só-leitura: quem só quer saber "estou logado?" usa este. */
export const isAuthenticatedAtom = atom((get) => get(authTokenAtom) !== null)

/**
 * E-mail do usuário logado, lido do `sub` do JWT. Só para exibição na Sidebar:
 * quem valida o token é o backend. Token ilegível = null, e a tela usa um texto padrão.
 */
export const userEmailAtom = atom((get) => readJwtSubject(get(authTokenAtom)))

function readJwtSubject(token: string | null) {
  if (!token) return null
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { sub } = JSON.parse(atob(payload)) as { sub?: unknown }
    return typeof sub === 'string' ? sub : null
  } catch {
    return null
  }
}

/** Guarda o token recebido do /auth/login. */
export const signInAtom = atom(null, (_get, set, token: string) => {
  set(authTokenAtom, token)
})

/** Encerra a sessão. O atom persistido limpa o localStorage sozinho. */
export const signOutAtom = atom(null, (_get, set) => {
  set(authTokenAtom, null)
})

/* ------------------------------------------------------------------ */
/* Sincronização com o axios                                           */
/* ------------------------------------------------------------------ */

/**
 * O interceptor do axios vive fora do React, então não consegue usar hooks.
 * Aqui o token é empurrado para ele na carga do módulo (cobrindo o refresh de
 * página) e a cada mudança do atom (login e logout).
 */
function syncTokenWithHttpClient() {
  setAuthToken(store.get(authTokenAtom))
}

syncTokenWithHttpClient()
store.sub(authTokenAtom, syncTokenWithHttpClient)
