import type { Attachment, Order, OrderInput, ServiceInput } from '../../services/orders'
import { normalizePlate, onlyDigits } from '../../utils/masks'
import { today } from '../../utils/today'

/*
 * Estado do formulário, dividido como as abas da modal. Tudo texto, como o input
 * entrega; `phone` e `mileage` só com dígitos e `amount` em centavos, para as
 * máscaras não irem para o payload.
 */

/** Aba "Cliente e veículo". `notes` é a observação do atendimento. */
export type DetailsFormValues = {
  customer: string
  phone: string
  vehicle: string
  plate: string
  notes: string
}

/** Um card da aba "Serviços". */
export type ServiceFormValues = {
  /** Identidade só do front, para a lista do React e o splitAtom. Não vai para a API. */
  key: string
  /** Id no backend. null = serviço novo, ainda não salvo. */
  id: number | null
  date: string
  mileage: string
  amount: string
  description: string
  /** Anexos já salvos que o usuário não removeu. */
  attachments: Attachment[]
  /** Arquivos novos, ainda só no navegador. */
  files: File[]
}

/** Campos de texto do serviço: os que o usuário digita e que têm validação. */
export type ServiceTextField = 'date' | 'mileage' | 'amount' | 'description'

export type OrderFormTab = 'details' | 'services'

export type DetailsFormErrors = Partial<Record<keyof DetailsFormValues, string>>
export type ServiceFormErrors = Partial<Record<ServiceTextField, string>>

/** De 3 a 7 letras ou números, em qualquer ordem: aceita placa parcial ou completa. */
const PLATE_PATTERN = /^[A-Z0-9]{3,7}$/

let nextServiceKey = 0
const newServiceKey = () => `service-${++nextServiceKey}`

export function initialDetails(): DetailsFormValues {
  return { customer: '', phone: '', vehicle: '', plate: '', notes: '' }
}

/** Serviço em branco, com a data de hoje. */
export function emptyService(): ServiceFormValues {
  return {
    key: newServiceKey(),
    id: null,
    date: today(),
    mileage: '',
    amount: '',
    description: '',
    attachments: [],
    files: [],
  }
}

/* ------------------------------------------------------------------ */
/* Atendimento da API -> formulário                                    */
/* ------------------------------------------------------------------ */

/**
 * Campo null (registro importado incompleto) abre vazio, e a validação pede o
 * preenchimento ao salvar. Telefone e placa passam pelas mesmas normalizações
 * da digitação, porque registros importados podem vir com máscara ("(14) 9...").
 */
export function detailsFromOrder(order: Order): DetailsFormValues {
  return {
    customer: order.cliente ?? '',
    phone: onlyDigits(order.telefone ?? '').slice(0, 11),
    vehicle: order.veiculo ?? '',
    plate: normalizePlate(order.placa ?? ''),
    notes: order.observacao ?? '',
  }
}

/**
 * Do mais antigo para o mais recente: a posição vira o número do serviço (#1, #2...).
 * Sem data ou km, o serviço vai para o começo. Campos null abrem vazios, como em
 * `detailsFromOrder`.
 */
export function servicesFromOrder(order: Order): ServiceFormValues[] {
  return [...order.servicos]
    .sort((a, b) => (a.data ?? '').localeCompare(b.data ?? '') || (a.km ?? 0) - (b.km ?? 0))
    .map((service) => ({
      key: newServiceKey(),
      id: service.id,
      date: service.data ?? '',
      mileage: service.km === null ? '' : String(service.km),
      // Math.round: 350.1 * 100 dá 35009.99... em ponto flutuante.
      amount: service.valor === null ? '' : String(Math.round(service.valor * 100)),
      description: service.descricao,
      attachments: service.anexos ?? [],
      files: [],
    }))
}

/* ------------------------------------------------------------------ */
/* Validação: objeto vazio = seção válida                              */
/* ------------------------------------------------------------------ */

export function validateDetails(values: DetailsFormValues): DetailsFormErrors {
  const errors: DetailsFormErrors = {}
  if (!values.customer.trim()) errors.customer = 'Informe o cliente.'
  if (!values.phone) errors.phone = 'Informe o telefone.'
  else if (values.phone.length < 10) errors.phone = 'Telefone incompleto.'
  if (!values.vehicle.trim()) errors.vehicle = 'Informe o veículo.'
  if (!values.plate) errors.plate = 'Informe a placa.'
  else if (!PLATE_PATTERN.test(values.plate)) errors.plate = 'Informe ao menos 3 letras ou números.'
  return errors
}

export function validateService(values: ServiceFormValues): ServiceFormErrors {
  const errors: ServiceFormErrors = {}
  if (!values.date) errors.date = 'Informe a data.'
  if (!values.mileage) errors.mileage = 'Informe a quilometragem.'
  if (!values.amount) errors.amount = 'Informe o valor.'
  if (!values.description.trim()) errors.description = 'Descreva o serviço realizado.'
  return errors
}

/** O backend recusa atendimento sem serviço (400), então a lista vazia também é erro. */
export function servicesHaveErrors(services: ServiceFormValues[]) {
  return (
    services.length === 0 ||
    services.some((service) => Object.keys(validateService(service)).length > 0)
  )
}

/* ------------------------------------------------------------------ */
/* Formulário -> corpo de POST/PUT /atendimentos                       */
/* ------------------------------------------------------------------ */

/** Anexo salvo que o usuário removeu de um serviço que continua existindo. */
export type RemovedAttachment = { serviceId: number; attachmentId: number }

/**
 * Converte o formulário no corpo de POST/PUT /atendimentos. `original` é o
 * atendimento carregado (null no cadastro) e serve para saber quais anexos
 * salvos o usuário removeu de cada serviço:
 * - removeu todos: `apagarAnexos`, e o backend limpa o serviço numa tacada só;
 * - removeu alguns: eles voltam em `removedAttachments`, para excluir um a um.
 * Anexos de um serviço excluído somem com ele, sem pedido à parte.
 */
export function toPayload(
  details: DetailsFormValues,
  services: ServiceFormValues[],
  original: Order | null,
): { body: OrderInput; removedAttachments: RemovedAttachment[] } {
  const savedAttachments = new Map(original?.servicos.map((s) => [s.id, s.anexos ?? []]))
  const removedAttachments: RemovedAttachment[] = []

  const servicos = services.map((values): ServiceInput => {
    const service: ServiceInput = {
      descricao: values.description.trim(),
      valor: Number(values.amount) / 100,
      data: values.date,
      km: Number(values.mileage),
      files: values.files,
    }
    if (values.id === null) return service

    const serviceId = values.id
    const removed = (savedAttachments.get(serviceId) ?? []).filter(
      (saved) => !values.attachments.some((kept) => kept.id === saved.id),
    )
    if (removed.length > 0 && values.attachments.length === 0) {
      return { ...service, id: serviceId, apagarAnexos: true }
    }
    removedAttachments.push(...removed.map((a) => ({ serviceId, attachmentId: a.id })))
    return { ...service, id: serviceId }
  })

  return {
    body: {
      cliente: details.customer.trim(),
      telefone: details.phone,
      // Observação é opcional: vazia vai como null, como o backend devolve.
      observacao: details.notes.trim() || null,
      veiculo: details.vehicle.trim(),
      placa: details.plate,
      servicos,
    },
    removedAttachments,
  }
}
