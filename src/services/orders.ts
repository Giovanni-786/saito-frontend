import { api } from '../utils/api'

/** Item de GET /atendimentos. Os nomes vêm do AtendimentoResponseDTO do backend. */
export type Order = {
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
export type ListOrdersParams = {
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
export type NewOrder = Omit<Order, 'id'>

/** Lista os atendimentos com busca e paginação. Falhas chegam como ApiError. */
export function serviceList(params: ListOrdersParams, signal?: AbortSignal) {
  return api.get<Page<Order>>('/atendimentos', { params, signal })
}

/** Busca um atendimento pelo id. Falhas chegam como ApiError. */
export function serviceGet(id: number, signal?: AbortSignal) {
  return api.get<Order>(`/atendimentos/${id}`, { signal })
}

/** Anexo de um atendimento (AnexoResponseDTO). `caminho` é interno do servidor. */
export type Attachment = {
  id: number
  nome: string
  /** Content-Type do arquivo (ex.: "image/jpeg"). */
  tipo: string
  caminho: string
}

/** Limite do backend (spring.servlet.multipart.max-request-size) para uma requisição. */
export const ATTACHMENTS_MAX_BYTES = 100 * 1024 * 1024

/** Upload de até 100MB não cabe nos 30s padrão do cliente. */
const UPLOAD_TIMEOUT_MS = 10 * 60_000

/**
 * Monta o multipart que o backend espera: parte `dados` com o JSON do
 * atendimento e uma parte `arquivos` por arquivo. `clearAttachments` manda
 * `arquivos=null`, que remove os anexos atuais antes de gravar os novos.
 */
function toFormData(body: NewOrder, files: File[], clearAttachments = false) {
  const form = new FormData()
  // Blob com application/json: o @RequestPart("dados") só desserializa assim.
  form.append('dados', new Blob([JSON.stringify(body)], { type: 'application/json' }))
  if (clearAttachments) form.append('arquivos', 'null')
  for (const file of files) form.append('arquivos', file)
  return form
}

/** Cadastra um atendimento com seus anexos e devolve o registro criado. Falhas chegam como ApiError. */
export function serviceCreate(body: NewOrder, files: File[] = []) {
  return api.post<Order, FormData>('/atendimentos', toFormData(body, files), {
    timeout: UPLOAD_TIMEOUT_MS,
  })
}

/** Exclui um atendimento. Falhas chegam como ApiError. */
export function serviceDelete(id: number) {
  return api.delete(`/atendimentos/${id}`)
}

/**
 * Atualiza um atendimento e devolve o registro salvo. `files` são somados aos
 * anexos atuais; com `clearAttachments` os atuais são removidos antes. Falhas chegam como ApiError.
 */
export function serviceUpdate(
  id: number,
  body: NewOrder,
  files: File[] = [],
  clearAttachments = false,
) {
  return api.put<Order, FormData>(
    `/atendimentos/${id}`,
    toFormData(body, files, clearAttachments),
    { timeout: UPLOAD_TIMEOUT_MS },
  )
}

/** Lista os anexos de um atendimento. Falhas chegam como ApiError. */
export function serviceListAttachments(id: number, signal?: AbortSignal) {
  return api.get<Attachment[]>(`/atendimentos/${id}/anexos`, { signal })
}

/** Baixa o conteúdo de um anexo. Falhas chegam como ApiError. */
export function serviceDownloadAttachment(id: number, attachmentId: number) {
  return api.get<Blob>(`/atendimentos/${id}/anexos/${attachmentId}`, {
    responseType: 'blob',
    timeout: UPLOAD_TIMEOUT_MS,
  })
}

/** Exclui um único anexo do atendimento. Falhas chegam como ApiError. */
export function serviceDeleteAttachment(id: number, attachmentId: number) {
  return api.delete(`/atendimentos/${id}/anexos/${attachmentId}`)
}

/** Resposta de GET /atendimentos/faturamento: soma do valor de todos os atendimentos. */
export type Revenue = {
  total: number
}

/** Faturamento total dos atendimentos. Falhas chegam como ApiError. */
export function serviceRevenue(signal?: AbortSignal) {
  return api.get<Revenue>('/atendimentos/faturamento', { signal })
}
