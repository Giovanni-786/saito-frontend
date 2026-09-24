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

/** Lista os atendimentos com busca e paginação. Falhas chegam como ApiError. */
export function listarAtendimentos(params: ListarAtendimentosParams, signal?: AbortSignal) {
  return api.get<Page<Atendimento>>('/atendimentos', { params, signal })
}
