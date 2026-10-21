import { api } from '../utils/api'

/** Anexo de um serviço (AnexoResponseDTO). `caminho` é interno do servidor. */
export type Attachment = {
  id: number
  nome: string
  /** Content-Type do arquivo (ex.: "image/jpeg"). */
  tipo: string
  caminho: string
}

/**
 * Serviço realizado num atendimento (ServicoResponseDTO). Um atendimento tem um ou mais.
 *
 * As colunas aceitam null no banco e há registros importados incompletos, então
 * só `descricao` é garantida. O backend só exige os demais ao gravar.
 */
export type Service = {
  id: number
  descricao: string
  valor: number | null
  /** Data no formato ISO (AAAA-MM-DD), como o LocalDate do backend serializa. */
  data: string | null
  /** Quilometragem do veículo quando o serviço foi feito. */
  km: number | null
  anexos: Attachment[]
}

/**
 * Item de GET /atendimentos. Os nomes vêm do AtendimentoResponseDTO do backend.
 * Como em `Service`, os campos podem vir null em registros importados incompletos.
 */
export type Order = {
  id: number
  cliente: string | null
  veiculo: string | null
  placa: string | null
  telefone: string | null
  observacao: string | null
  servicos: Service[]
  /** Soma dos valores dos serviços, calculada pelo backend. Só na resposta. */
  valorTotal: number
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

/**
 * Serviço enviado em POST e PUT /atendimentos. No PUT, os serviços são casados
 * pelo `id`: com id = atualizado, sem id = criado, fora da lista = excluído
 * (com os anexos).
 */
export type ServiceInput = {
  id?: number
  descricao: string
  valor: number
  data: string
  km: number
  /** Arquivos novos deste serviço, somados aos anexos que ele já tem. */
  files: File[]
  /** Apaga todos os anexos atuais do serviço antes de gravar os `files`. */
  apagarAnexos?: boolean
}

/** Corpo de POST e PUT /atendimentos: o atendimento sem o `id`, que o backend gera. */
export type OrderInput = {
  cliente: string
  veiculo: string
  placa: string
  telefone: string
  observacao: string | null
  servicos: ServiceInput[]
}

/** Lista os atendimentos com busca e paginação. Falhas chegam como ApiError. */
export function serviceList(params: ListOrdersParams, signal?: AbortSignal) {
  return api.get<Page<Order>>('/atendimentos', { params, signal })
}

/** Busca um atendimento pelo id. Falhas chegam como ApiError. */
export function serviceGet(id: number, signal?: AbortSignal) {
  return api.get<Order>(`/atendimentos/${id}`, { signal })
}

/** Limite do backend (spring.servlet.multipart.max-request-size) para uma requisição. */
export const ATTACHMENTS_MAX_BYTES = 100 * 1024 * 1024

/** Upload de até 100MB não cabe nos 30s padrão do cliente. */
const UPLOAD_TIMEOUT_MS = 10 * 60_000

/** "foto.jpg" já usado -> "foto (2).jpg", "foto (3).jpg"... */
function uniqueName(name: string, used: Set<string>) {
  if (!used.has(name)) return name
  const dot = name.lastIndexOf('.')
  const [base, ext] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
  let n = 2
  while (used.has(`${base} (${n})${ext}`)) n++
  return `${base} (${n})${ext}`
}

/**
 * Monta o multipart que o backend espera: parte `dados` com o JSON do
 * atendimento e uma parte `arquivos` por arquivo. Cada serviço lista em
 * `arquivos` os nomes dos seus arquivos, e é por esse nome que o backend os
 * vincula. Por isso o nome precisa ser único na requisição inteira: repetido,
 * ganha um sufixo " (2)".
 */
function toFormData({ servicos, ...order }: OrderInput) {
  const form = new FormData()
  const used = new Set<string>()
  const parts: { file: File; name: string }[] = []

  const dados = {
    ...order,
    servicos: servicos.map(({ files, ...service }) => ({
      ...service,
      // Arquivo vazio o backend descarta, e o nome dele ficaria sem par: erro 400.
      arquivos: files
        .filter((file) => file.size > 0)
        .map((file) => {
          const name = uniqueName(file.name, used)
          used.add(name)
          parts.push({ file, name })
          return name
        }),
    })),
  }

  // Blob com application/json: o @RequestPart("dados") só desserializa assim.
  form.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  for (const { file, name } of parts) form.append('arquivos', file, name)
  return form
}

/** Cadastra um atendimento com seus anexos e devolve o registro criado. Falhas chegam como ApiError. */
export function serviceCreate(body: OrderInput) {
  return api.post<Order, FormData>('/atendimentos', toFormData(body), {
    timeout: UPLOAD_TIMEOUT_MS,
  })
}

/** Exclui um atendimento. Falhas chegam como ApiError. */
export function serviceDelete(id: number) {
  return api.delete(`/atendimentos/${id}`)
}

/** Atualiza um atendimento e devolve o registro salvo. Falhas chegam como ApiError. */
export function serviceUpdate(id: number, body: OrderInput) {
  return api.put<Order, FormData>(`/atendimentos/${id}`, toFormData(body), {
    timeout: UPLOAD_TIMEOUT_MS,
  })
}

/** Baixa o conteúdo de um anexo de um serviço. Falhas chegam como ApiError. */
export function serviceDownloadAttachment(serviceId: number, attachmentId: number) {
  return api.get<Blob>(`/servicos/${serviceId}/anexos/${attachmentId}`, {
    responseType: 'blob',
    timeout: UPLOAD_TIMEOUT_MS,
  })
}

/** Exclui um único anexo de um serviço. Falhas chegam como ApiError. */
export function serviceDeleteAttachment(serviceId: number, attachmentId: number) {
  return api.delete(`/servicos/${serviceId}/anexos/${attachmentId}`)
}
