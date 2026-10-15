import axios from 'axios'
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Erro normalizado da API. Tudo que sai deste módulo e falha vira um ApiError,
 * então a UI nunca precisa saber que por baixo existe axios.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** Erro de rede, DNS, CORS ou servidor fora do ar — nenhuma resposta chegou. */
  get isNetworkError() {
    return this.code === 'NETWORK' || this.code === 'TIMEOUT'
  }

  /** Requisição abortada de propósito; normalmente não deve virar mensagem na tela. */
  get isCanceled() {
    return this.code === 'CANCELED'
  }

  /** 401/403: sessão expirada ou sem permissão. */
  get isAuthError() {
    return this.status === 401 || this.status === 403
  }
}

/**
 * Formato de erro do backend (ErroResponseDTO). `erro` é só o reason phrase do
 * HTTP ("Unauthorized"), então não serve como mensagem para o usuário.
 */
type ApiErrorBody = {
  mensagem?: string
  campos?: unknown
}

type ErrorBody = {
  message?: string
  details?: unknown
}

/**
 * Lê o motivo da falha. O backend responde JSON com `mensagem`; proxies na frente
 * dele (ex.: o limite de requisições que devolve 429) podem responder texto puro
 * ou uma página HTML, que não deve ir parar na tela.
 */
function readErrorBody(data: unknown): ErrorBody {
  if (typeof data === 'string') {
    const text = data.trim()
    return text && !text.startsWith('<') && text.length <= 200 ? { message: text } : {}
  }
  if (!data || typeof data !== 'object') return {}

  const { mensagem, campos } = data as ApiErrorBody
  return {
    message: typeof mensagem === 'string' && mensagem ? mensagem : undefined,
    details: campos,
  }
}

/** "Retry-After: 120" -> "em 2 minutos". Só o formato em segundos; datas HTTP são ignoradas. */
function retryAfterHint(value: unknown) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  if (seconds < 60) return ` em ${Math.ceil(seconds)} segundos`
  const minutes = Math.ceil(seconds / 60)
  return ` em ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
}

/** Mensagem para quando a resposta não diz o motivo: explica pelo status. */
function statusMessage(status: number, retryAfter: unknown) {
  switch (status) {
    case 400:
      return 'Os dados enviados são inválidos. Revise e tente novamente.'
    case 401:
      return 'Sua sessão expirou ou as credenciais são inválidas. Entre novamente.'
    case 403:
      return 'Você não tem permissão para fazer isso.'
    case 404:
      return 'O recurso solicitado não foi encontrado.'
    case 408:
      return 'O servidor demorou demais para responder. Tente novamente.'
    case 413:
      return 'O arquivo enviado é grande demais.'
    case 429:
      return `Muitas tentativas em pouco tempo. Aguarde e tente novamente${retryAfterHint(retryAfter) || ' em alguns instantes'}.`
    case 502:
    case 503:
    case 504:
      return 'O servidor está indisponível no momento. Tente novamente em alguns instantes.'
  }
  if (status >= 500) return 'Erro interno no servidor. Tente novamente em alguns instantes.'
  return `A requisição falhou (erro ${status}).`
}

// `||` e não `??`: no build Docker a variável chega como string vazia quando não é informada.
const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const TIMEOUT_MS = 30_000

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { Accept: 'application/json' },
})

/* ------------------------------------------------------------------ */
/* Autenticação                                                        */
/* ------------------------------------------------------------------ */

let authToken: string | null = null

/** Define (ou limpa, passando null) o Bearer token enviado em toda requisição. */
export function setAuthToken(token: string | null) {
  authToken = token
}

http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.set('Authorization', `Bearer ${authToken}`)
  }
  return config
})

type UnauthorizedHandler = (rejectedToken: string) => void

let unauthorizedHandler: UnauthorizedHandler | null = null

/**
 * Registra quem reage a um 401 numa requisição autenticada (token expirado ou
 * inválido). Recebe o token recusado para não derrubar uma sessão nova caso a
 * resposta chegue depois de um novo login.
 */
export function onUnauthorized(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler
}

/** Token que a requisição levou, ou null se ela saiu sem Authorization (ex.: /auth/login). */
function sentToken(config: AxiosRequestConfig | undefined) {
  const header = config?.headers?.Authorization
  return typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null
}

/* ------------------------------------------------------------------ */
/* Normalização de erros                                               */
/* ------------------------------------------------------------------ */

function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError(
      error instanceof Error ? error.message : 'Erro inesperado.',
      0,
      'UNKNOWN',
      error,
    )
  }

  const axiosError = error as AxiosError<ApiErrorBody | string>
  const response = axiosError.response

  // Requisição cancelada (React Query aborta ao desmontar ou refazer a query).
  if (axios.isCancel(axiosError)) {
    return new ApiError('Requisição cancelada.', 0, 'CANCELED')
  }

  if (!response) {
    const timedOut = axiosError.code === 'ECONNABORTED'
    return new ApiError(
      timedOut ? 'A requisição demorou demais.' : 'Não foi possível conectar ao servidor.',
      0,
      timedOut ? 'TIMEOUT' : 'NETWORK',
    )
  }

  const body = readErrorBody(response.data)
  const message = body.message ?? statusMessage(response.status, response.headers['retry-after'])

  return new ApiError(message, response.status, `HTTP_${response.status}`, body.details)
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Só 401: o backend devolve 403 para "sem permissão", que não deve encerrar a sessão.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const token = sentToken(error.config)
      if (token) unauthorizedHandler?.(token)
    }
    return Promise.reject(toApiError(error))
  },
)

/* ------------------------------------------------------------------ */
/* Helpers tipados                                                     */
/* ------------------------------------------------------------------ */

const unwrap = <T>(response: AxiosResponse<T>): T => response.data

/**
 * Cliente da API. Cada método já devolve o `data` da resposta, então em vez de
 * `const { data } = await http.get(...)` você escreve `const user = await api.get<User>(...)`.
 *
 * Sempre repasse o `signal` que o React Query entrega no queryFn — é o que faz
 * a requisição ser cancelada quando o componente desmonta.
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => http.get<T>(url, config).then(unwrap),

  post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    http.post<T>(url, body, config).then(unwrap),

  put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    http.put<T>(url, body, config).then(unwrap),

  patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    http.patch<T>(url, body, config).then(unwrap),

  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    http.delete<T>(url, config).then(unwrap),
}
