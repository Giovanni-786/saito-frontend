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

/** Formato de erro que o backend devolve. Ajuste conforme o contrato real. */
type ApiErrorBody = {
  message?: string
  error?: string
  code?: string
  errors?: unknown
}

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
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

  const axiosError = error as AxiosError<ApiErrorBody>
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

  const body = response.data
  const message =
    body?.message ?? body?.error ?? `A requisição falhou com status ${response.status}.`

  return new ApiError(
    message,
    response.status,
    body?.code ?? `HTTP_${response.status}`,
    body?.errors,
  )
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
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
