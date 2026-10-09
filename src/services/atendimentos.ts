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

/** Anexo de um atendimento (AnexoResponseDTO). `caminho` é interno do servidor. */
export type Anexo = {
  id: number
  nome: string
  /** Content-Type do arquivo (ex.: "image/jpeg"). */
  tipo: string
  caminho: string
}

/** Limite do backend (spring.servlet.multipart.max-request-size) para uma requisição. */
export const ANEXOS_MAX_BYTES = 100 * 1024 * 1024

/** Upload de até 100MB não cabe nos 30s padrão do cliente. */
const UPLOAD_TIMEOUT_MS = 10 * 60_000

/**
 * Monta o multipart que o backend espera: parte `dados` com o JSON do
 * atendimento e uma parte `arquivos` por arquivo. `apagarAnexos` manda
 * `arquivos=null`, que remove os anexos atuais antes de gravar os novos.
 */
function toFormData(body: NovoAtendimento, arquivos: File[], apagarAnexos = false) {
  const form = new FormData()
  // Blob com application/json: o @RequestPart("dados") só desserializa assim.
  form.append('dados', new Blob([JSON.stringify(body)], { type: 'application/json' }))
  if (apagarAnexos) form.append('arquivos', 'null')
  for (const arquivo of arquivos) form.append('arquivos', arquivo)
  return form
}

/** Cadastra um atendimento com seus anexos e devolve o registro criado. Falhas chegam como ApiError. */
export function serviceCreate(body: NovoAtendimento, arquivos: File[] = []) {
  return api.post<Atendimento, FormData>('/atendimentos', toFormData(body, arquivos), {
    timeout: UPLOAD_TIMEOUT_MS,
  })
}

/** Exclui um atendimento. Falhas chegam como ApiError. */
export function serviceDelete(id: number) {
  return api.delete(`/atendimentos/${id}`)
}

/**
 * Atualiza um atendimento e devolve o registro salvo. `arquivos` são somados aos
 * anexos atuais; com `apagarAnexos` os atuais são removidos antes. Falhas chegam como ApiError.
 */
export function serviceUpdate(
  id: number,
  body: NovoAtendimento,
  arquivos: File[] = [],
  apagarAnexos = false,
) {
  return api.put<Atendimento, FormData>(
    `/atendimentos/${id}`,
    toFormData(body, arquivos, apagarAnexos),
    { timeout: UPLOAD_TIMEOUT_MS },
  )
}

/** Lista os anexos de um atendimento. Falhas chegam como ApiError. */
export function serviceListAnexos(id: number, signal?: AbortSignal) {
  return api.get<Anexo[]>(`/atendimentos/${id}/anexos`, { signal })
}

/** Baixa o conteúdo de um anexo. Falhas chegam como ApiError. */
export function serviceDownloadAnexo(id: number, anexoId: number) {
  return api.get<Blob>(`/atendimentos/${id}/anexos/${anexoId}`, {
    responseType: 'blob',
    timeout: UPLOAD_TIMEOUT_MS,
  })
}

/** Exclui um único anexo do atendimento. Falhas chegam como ApiError. */
export function serviceDeleteAnexo(id: number, anexoId: number) {
  return api.delete(`/atendimentos/${id}/anexos/${anexoId}`)
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
