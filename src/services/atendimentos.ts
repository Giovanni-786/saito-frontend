import { api } from '../utils/api'

/** Item de GET /atendimentos. Os nomes vêm do AtendimentoResponseDTO do backend. */
export type Atendimento = {
  id: number
  /** Data no formato ISO (AAAA-MM-DD), como o LocalDate do backend serializa. */
  data: string
  cliente: string
  veiculo: string
  placa: string
  telefone: string
  km: number
  valor: number
  servicosPecas: string | null
  observacao: string | null
}

/** Query string aceita por GET /atendimentos. `page` começa em 0. */
export type ListarAtendimentosParams = {
  busca?: string
  page: number
  size: number
  /** Formato do Spring: "campo,asc" ou "campo,desc" (ex.: "cliente,asc"). */
  sort?: string
}

/** Resposta paginada do Spring (Page<T>). Só os campos que a UI usa. */
export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

/** Corpo de POST /atendimentos: o atendimento sem o `id`, que o backend gera. */
export type NovoAtendimento = Omit<Atendimento, 'id'>

/** Lista os atendimentos com busca e paginação. Falhas chegam como ApiError. */
export function serviceList(params: ListarAtendimentosParams, signal?: AbortSignal) {
  return api.get<Page<Atendimento>>('/atendimentos', { params, signal })
}

/** Busca um atendimento pelo id. Falhas chegam como ApiError. */
export function serviceGet(id: number, signal?: AbortSignal) {
  return api.get<Atendimento>(`/atendimentos/${id}`, { signal })
}

/** Cadastra um atendimento e devolve o registro criado. Falhas chegam como ApiError. */
export function serviceCreate(body: NovoAtendimento) {
  return api.post<Atendimento, NovoAtendimento>('/atendimentos', body)
}

/** Exclui um atendimento. Falhas chegam como ApiError. */
export function serviceDelete(id: number) {
  return api.delete(`/atendimentos/${id}`)
}

/** Atualiza um atendimento e devolve o registro salvo. Falhas chegam como ApiError. */
export function serviceUpdate(id: number, body: NovoAtendimento) {
  return api.put<Atendimento, NovoAtendimento>(`/atendimentos/${id}`, body)
}

/**
 * Resposta de GET /atendimentos/resumo.
 *
 * A rota ainda não existe no backend: nome e campos são uma proposta. Quando
 * ela for criada, ajuste aqui conforme o DTO real e ligue o
 * SUMMARY_ENDPOINT_READY no OrdersSummary.
 */
export type ResumoAtendimentos = {
  totalAtendimentos: number
  faturamentoTotal: number
}

/** Totais de atendimentos e faturamento. Falhas chegam como ApiError. */
export function serviceSummary(signal?: AbortSignal) {
  return api.get<ResumoAtendimentos>('/atendimentos/resumo', { signal })
}
