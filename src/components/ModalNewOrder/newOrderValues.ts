import type { NewOrder, Order } from '../../services/orders'

/**
 * Estado do formulário. Tudo texto, como o input entrega; `phone` e `mileage` só
 * com dígitos e `amount` em centavos, para as máscaras não irem para o payload.
 */
export type NewOrderFormValues = {
  date: string
  customer: string
  vehicle: string
  plate: string
  phone: string
  mileage: string
  amount: string
  servicesParts: string
  notes: string
}

export type NewOrderFormErrors = Partial<Record<keyof NewOrderFormValues, string>>

/** Placa antiga (ABC1234) ou Mercosul (ABC1D23). */
const PLATE_PATTERN = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/

/** Hoje em AAAA-MM-DD no fuso local. `toISOString` usaria UTC e poderia voltar um dia. */
function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function initialValues(): NewOrderFormValues {
  return {
    date: today(),
    customer: '',
    vehicle: '',
    plate: '',
    phone: '',
    mileage: '',
    amount: '',
    servicesParts: '',
    notes: '',
  }
}

/** Preenche o formulário de edição com o atendimento vindo de GET /atendimentos/{id}. */
export function fromOrder(order: Order): NewOrderFormValues {
  return {
    date: order.data,
    customer: order.cliente,
    vehicle: order.veiculo,
    plate: order.placa,
    phone: order.telefone,
    mileage: String(order.km),
    // Math.round: 350.1 * 100 dá 35009.99... em ponto flutuante.
    amount: String(Math.round(order.valor * 100)),
    servicesParts: order.servicosPecas ?? '',
    notes: order.observacao ?? '',
  }
}

/** Devolve só os campos com erro; objeto vazio = formulário válido. */
export function validate(values: NewOrderFormValues): NewOrderFormErrors {
  const errors: NewOrderFormErrors = {}

  if (!values.date) errors.date = 'Informe a data.'
  if (!values.customer.trim()) errors.customer = 'Informe o cliente.'
  if (!values.vehicle.trim()) errors.vehicle = 'Informe o veículo.'

  if (!values.plate) errors.plate = 'Informe a placa.'
  else if (!PLATE_PATTERN.test(values.plate)) errors.plate = 'Placa inválida. Ex.: ABC1234.'

  if (!values.phone) errors.phone = 'Informe o telefone.'
  else if (values.phone.length < 10) errors.phone = 'Telefone incompleto.'

  if (!values.mileage) errors.mileage = 'Informe a quilometragem.'
  if (!values.amount) errors.amount = 'Informe o valor.'
  if (!values.servicesParts.trim()) errors.servicesParts = 'Descreva os serviços e peças.'

  return errors
}

/** Converte o estado do formulário no corpo de POST /atendimentos. */
export function toPayload(values: NewOrderFormValues): NewOrder {
  return {
    data: values.date,
    cliente: values.customer.trim(),
    veiculo: values.vehicle.trim(),
    placa: values.plate,
    telefone: values.phone,
    km: Number(values.mileage),
    valor: Number(values.amount) / 100,
    servicosPecas: values.servicesParts.trim(),
    // Observação é opcional: vazia vai como null, como o backend devolve.
    observacao: values.notes.trim() || null,
  }
}
