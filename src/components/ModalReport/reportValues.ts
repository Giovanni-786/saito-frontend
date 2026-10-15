import { today } from '../../utils/today'

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

/** De 3 a 7 letras ou números, em qualquer ordem: aceita placa parcial ou completa. */
const PLATE_PATTERN = /^[A-Z0-9]{3,7}$/

/**
 * O laudo precisa caber em uma página. Medido no PDF com todos os outros campos
 * preenchidos: o quadro do diagnóstico comporta 11 linhas de ~80 caracteres
 * (texto todo em maiúsculas, o pior caso). As margens abaixo deixam folga.
 */
export const DIAGNOSIS_MAX_LENGTH = 800
const DIAGNOSIS_MAX_LINES = 11
const DIAGNOSIS_CHARS_PER_LINE = 75

/** Linhas que o diagnóstico ocupa no PDF: cada quebra de linha começa outra. */
function diagnosisLines(diagnosis: string) {
  return diagnosis
    .trim()
    .split('\n')
    .reduce(
      (total, line) => total + Math.max(1, Math.ceil(line.length / DIAGNOSIS_CHARS_PER_LINE)),
      0,
    )
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
  else if (!PLATE_PATTERN.test(values.plate)) errors.plate = 'Informe ao menos 3 letras ou números.'

  if (values.chassis && values.chassis.length !== 17) errors.chassis = 'O chassi tem 17 caracteres.'
  if (values.renavam && values.renavam.length !== 11) errors.renavam = 'O Renavam tem 11 dígitos.'

  if (!values.arrivalDate) errors.arrivalDate = 'Informe a data da chegada.'
  if (!values.diagnosis.trim()) errors.diagnosis = 'Descreva o diagnóstico.'
  else if (diagnosisLines(values.diagnosis) > DIAGNOSIS_MAX_LINES)
    errors.diagnosis =
      'O diagnóstico não cabe em uma página. Reduza o texto ou as quebras de linha.'

  // Datas em AAAA-MM-DD comparam certo como texto.
  if (values.partsArrivalDate && values.partsArrivalDate < values.arrivalDate)
    errors.partsArrivalDate = 'Não pode ser antes da chegada.'
  if (values.readyDate && values.readyDate < (values.partsArrivalDate || values.arrivalDate))
    errors.readyDate = values.partsArrivalDate
      ? 'Não pode ser antes da chegada das peças.'
      : 'Não pode ser antes da chegada.'

  return errors
}
