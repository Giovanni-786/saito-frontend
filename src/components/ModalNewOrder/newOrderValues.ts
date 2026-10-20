import type { NewOrder, Order, Service } from '../../services/orders'
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
  date: string
  mileage: string
  amount: string
  description: string
}

export type OrderFormTab = 'details' | 'services'

export type DetailsFormErrors = Partial<Record<keyof DetailsFormValues, string>>
export type ServiceFormErrors = Partial<Record<Exclude<keyof ServiceFormValues, 'key'>, string>>

/** De 3 a 7 letras ou números, em qualquer ordem: aceita placa parcial ou completa. */
const PLATE_PATTERN = /^[A-Z0-9]{3,7}$/

let nextServiceKey = 0
const newServiceKey = () => `service-${++nextServiceKey}`

export function initialDetails(): DetailsFormValues {
  return { customer: '', phone: '', vehicle: '', plate: '', notes: '' }
}

/** Serviço em branco, com a data de hoje. */
export function emptyService(): ServiceFormValues {
  return { key: newServiceKey(), date: today(), mileage: '', amount: '', description: '' }
}

/* ------------------------------------------------------------------ */
/* Atendimento da API -> formulário                                    */
/* ------------------------------------------------------------------ */

export function detailsFromOrder(order: Order): DetailsFormValues {
  return {
    customer: order.cliente,
    phone: order.telefone,
    vehicle: order.veiculo,
    plate: order.placa,
    notes: order.observacao ?? '',
  }
}

/** Do mais antigo para o mais recente: a posição vira o número do serviço (#1, #2...). */
export function servicesFromOrder(order: Order): ServiceFormValues[] {
  return [...order.servicos]
    .sort((a, b) => a.data.localeCompare(b.data) || a.km - b.km)
    .map((service) => ({
      key: newServiceKey(),
      date: service.data,
      mileage: String(service.km),
      // Math.round: 350.1 * 100 dá 35009.99... em ponto flutuante.
      amount: String(Math.round(service.valor * 100)),
      description: service.descricao,
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

function toServicePayload(values: ServiceFormValues): Service {
  return {
    descricao: values.description.trim(),
    valor: Number(values.amount) / 100,
    data: values.date,
    km: Number(values.mileage),
  }
}

export function toPayload(details: DetailsFormValues, services: ServiceFormValues[]): NewOrder {
  return {
    cliente: details.customer.trim(),
    telefone: details.phone,
    // Observação é opcional: vazia vai como null, como o backend devolve.
    observacao: details.notes.trim() || null,
    veiculo: details.vehicle.trim(),
    placa: details.plate,
    servicos: services.map(toServicePayload),
  }
}
