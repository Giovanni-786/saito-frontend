import type { Atendimento, NovoAtendimento } from '../../services/atendimentos'

/**
 * Estado do formulário. Tudo texto, como o input entrega; `telefone` e `km` só
 * com dígitos e `valor` em centavos, para as máscaras não irem para o payload.
 */
export type NewOrderFormValues = {
  data: string
  cliente: string
  veiculo: string
  placa: string
  telefone: string
  km: string
  valor: string
  servicosPecas: string
  observacao: string
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
    data: today(),
    cliente: '',
    veiculo: '',
    placa: '',
    telefone: '',
    km: '',
    valor: '',
    servicosPecas: '',
    observacao: '',
  }
}

/** Preenche o formulário de edição com o atendimento vindo de GET /atendimentos/{id}. */
export function fromAtendimento(order: Atendimento): NewOrderFormValues {
  return {
    data: order.data,
    cliente: order.cliente,
    veiculo: order.veiculo,
    placa: order.placa,
    telefone: order.telefone,
    km: String(order.km),
    // Math.round: 350.1 * 100 dá 35009.99... em ponto flutuante.
    valor: String(Math.round(order.valor * 100)),
    servicosPecas: order.servicosPecas ?? '',
    observacao: order.observacao ?? '',
  }
}

/** Devolve só os campos com erro; objeto vazio = formulário válido. */
export function validate(values: NewOrderFormValues): NewOrderFormErrors {
  const errors: NewOrderFormErrors = {}

  if (!values.data) errors.data = 'Informe a data.'
  if (!values.cliente.trim()) errors.cliente = 'Informe o cliente.'
  if (!values.veiculo.trim()) errors.veiculo = 'Informe o veículo.'

  if (!values.placa) errors.placa = 'Informe a placa.'
  else if (!PLATE_PATTERN.test(values.placa)) errors.placa = 'Placa inválida. Ex.: ABC1234.'

  if (!values.telefone) errors.telefone = 'Informe o telefone.'
  else if (values.telefone.length < 10) errors.telefone = 'Telefone incompleto.'

  if (!values.km) errors.km = 'Informe a quilometragem.'
  if (!values.valor) errors.valor = 'Informe o valor.'
  if (!values.servicosPecas.trim()) errors.servicosPecas = 'Descreva os serviços e peças.'

  return errors
}

/** Converte o estado do formulário no corpo de POST /atendimentos. */
export function toPayload(values: NewOrderFormValues): NovoAtendimento {
  return {
    data: values.data,
    cliente: values.cliente.trim(),
    veiculo: values.veiculo.trim(),
    placa: values.placa,
    telefone: values.telefone,
    km: Number(values.km),
    valor: Number(values.valor) / 100,
    servicosPecas: values.servicosPecas.trim(),
    // Observação é opcional: vazia vai como null, como o backend devolve.
    observacao: values.observacao.trim() || null,
  }
}
