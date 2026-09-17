import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'

/** Não adianta repetir erro de cliente (400, 404, 422) — a resposta não vai mudar. */
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 'CANCELED') return false
    if (error.status >= 400 && error.status < 500) return false
  }
  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
