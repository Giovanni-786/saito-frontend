import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { toast } from 'sonner'
import { onUnauthorized, setAuthToken } from '../utils/api'
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
export const userEmailAtom = atom((get) => {
  const { sub } = readJwtPayload(get(authTokenAtom)) ?? {}
  return typeof sub === 'string' ? sub : null
})

function readJwtPayload(token: string | null) {
  if (!token) return null
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload)) as { sub?: unknown; exp?: unknown }
  } catch {
    return null
  }
}

/** Instante (ms) em que o token expira, pelo `exp` do JWT. Sem `exp` legível = null. */
function readJwtExpiration(token: string | null) {
  const { exp } = readJwtPayload(token) ?? {}
  return typeof exp === 'number' ? exp * 1000 : null
}

/** Guarda o token recebido do /auth/login. */
export const signInAtom = atom(null, (_get, set, token: string) => {
  set(authTokenAtom, token)
})

/** Encerra a sessão. O atom persistido limpa o localStorage sozinho. */
export const signOutAtom = atom(null, (_get, set) => {
  set(authTokenAtom, null)
})

/**
 * Logout forçado: o token expirou ou o backend o recusou. Só age se `token` ainda
 * é o da sessão atual, então vários 401 simultâneos geram um único aviso.
 */
function expireSession(token: string) {
  if (store.get(authTokenAtom) !== token) return
  store.set(signOutAtom)
  toast.warning('Sua sessão expirou. Entre novamente para continuar.')
}

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

// 401 numa requisição autenticada: o backend não aceita mais o token.
onUnauthorized(expireSession)

/* ------------------------------------------------------------------ */
/* Expiração pelo relógio                                              */
/* ------------------------------------------------------------------ */

let expirationTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Encerra a sessão no `exp` do JWT, sem esperar a próxima requisição falhar —
 * senão a tela ficaria parada mostrando dados até o usuário clicar em algo.
 * Um token salvo que já expirou (aba reaberta no dia seguinte) cai na hora.
 */
function scheduleExpiration() {
  clearTimeout(expirationTimer)
  const token = store.get(authTokenAtom)
  const expiresAt = readJwtExpiration(token)
  if (!token || expiresAt === null) return

  // setTimeout estoura acima de ~24,8 dias; nesse caso o 401 do backend cobre.
  const delay = expiresAt - Date.now()
  if (delay > 2 ** 31 - 1) return
  expirationTimer = setTimeout(() => expireSession(token), Math.max(delay, 0))
}

scheduleExpiration()
store.sub(authTokenAtom, scheduleExpiration)
