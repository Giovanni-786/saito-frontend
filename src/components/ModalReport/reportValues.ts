/**
 * Estado do formulário de laudo. Mesmos campos do laudo em papel que a
 * oficina usava. Tudo texto, como o input entrega; `cpf` e `renavam` só com
 * dígitos, para as máscaras ficarem só na exibição.
 */
export type ReportFormValues = {
  // Cliente
  customerName: string
  cpf: string
  rg: string
  address: string
  // Veículo
  vehicleModel: string
  plate: string
  chassis: string
  renavam: string
  // Atendimento
  arrivalDate: string
  diagnosis: string
  // Previsão
  partsArrivalDate: string
  readyDate: string
}

export type ReportFormErrors = Partial<Record<keyof ReportFormValues, string>>

/** Placa antiga (ABC1234) ou Mercosul (ABC1D23). */
const PLATE_PATTERN = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/

/** Hoje em AAAA-MM-DD no fuso local. `toISOString` usaria UTC e poderia voltar um dia. */
export function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function initialValues(): ReportFormValues {
  return {
    customerName: '',
    cpf: '',
    rg: '',
    address: '',
    vehicleModel: '',
    plate: '',
    chassis: '',
    renavam: '',
    arrivalDate: today(),
    diagnosis: '',
    partsArrivalDate: '',
    readyDate: '',
  }
}

/**
 * Devolve só os campos com erro; objeto vazio = formulário válido.
 *
 * Obrigatório é o mínimo para o documento fazer sentido (quem, qual carro,
 * quando chegou e o diagnóstico). Os demais aparecem no PDF só se preenchidos,
 * mas quando preenchidos precisam estar completos.
 */
export function validate(values: ReportFormValues): ReportFormErrors {
  const errors: ReportFormErrors = {}

  if (!values.customerName.trim()) errors.customerName = 'Informe o nome do cliente.'
  if (values.cpf && values.cpf.length !== 11) errors.cpf = 'CPF incompleto.'

  if (!values.vehicleModel.trim()) errors.vehicleModel = 'Informe o modelo do veículo.'

  if (!values.plate) errors.plate = 'Informe a placa.'
  else if (!PLATE_PATTERN.test(values.plate)) errors.plate = 'Placa inválida. Ex.: ABC1234.'

  if (values.chassis && values.chassis.length !== 17) errors.chassis = 'O chassi tem 17 caracteres.'
  if (values.renavam && values.renavam.length !== 11) errors.renavam = 'O Renavam tem 11 dígitos.'

  if (!values.arrivalDate) errors.arrivalDate = 'Informe a data da chegada.'
  if (!values.diagnosis.trim()) errors.diagnosis = 'Descreva o diagnóstico.'

  // Datas em AAAA-MM-DD comparam certo como texto.
  if (values.partsArrivalDate && values.partsArrivalDate < values.arrivalDate)
    errors.partsArrivalDate = 'Não pode ser antes da chegada.'
  if (values.readyDate && values.readyDate < (values.partsArrivalDate || values.arrivalDate))
    errors.readyDate = values.partsArrivalDate
      ? 'Não pode ser antes da chegada das peças.'
      : 'Não pode ser antes da chegada.'

  return errors
}
