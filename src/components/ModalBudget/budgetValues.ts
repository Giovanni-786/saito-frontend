/**
 * Estado do formulário de orçamento. Mesmos campos do talão de papel que a
 * oficina usava: cliente e veículo em cima, tabela de quantidade, produto e
 * preço no meio, mão de obra e total embaixo.
 *
 * Tudo texto, como o input entrega; telefone e ano só com dígitos, e valores
 * em centavos, para as máscaras ficarem só na exibição e a conta ser exata.
 */
export type BudgetItem = {
  /** Chave estável da linha, para o React não misturar linhas ao remover. */
  id: string
  quantity: string
  description: string
  /** Preço unitário em centavos. */
  unitPrice: string
}

export type BudgetFormValues = {
  customerName: string
  phone: string
  vehicle: string
  model: string
  plate: string
  year: string
  fuel: string
  items: BudgetItem[]
  /** Mão de obra em centavos. */
  labor: string
}

type ItemErrors = Partial<Record<'quantity' | 'description' | 'unitPrice', string>>

export type BudgetFormErrors = Partial<
  Record<'customerName' | 'phone' | 'vehicle' | 'plate' | 'year', string>
> & {
  /** Erros por linha da tabela, pela `id` do item. */
  items?: Record<string, ItemErrors>
  /** Erro do orçamento como um todo (ex.: nada para cobrar). */
  general?: string
}

export const FUEL_OPTIONS = [
  'Gasolina',
  'Etanol',
  'Flex',
  'Diesel',
  'GNV',
  'Híbrido',
  'Elétrico',
] as const

/** Placa antiga (ABC1234) ou Mercosul (ABC1D23). */
const PLATE_PATTERN = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/

export function emptyItem(): BudgetItem {
  return { id: crypto.randomUUID(), quantity: '1', description: '', unitPrice: '' }
}

export function initialValues(): BudgetFormValues {
  return {
    customerName: '',
    phone: '',
    vehicle: '',
    model: '',
    plate: '',
    year: '',
    fuel: '',
    items: [emptyItem()],
    labor: '',
  }
}

/** Linha sem produto nem preço: não entra no PDF nem na validação. */
export function isBlankItem(item: BudgetItem) {
  return !item.description.trim() && !item.unitPrice
}

/** Quantidade × preço unitário, em centavos. */
export function itemTotalCents(item: BudgetItem) {
  return Number(item.quantity || 0) * Number(item.unitPrice || 0)
}

/** Soma das peças e produtos, em centavos. */
export function productsTotalCents(items: BudgetItem[]) {
  return items.reduce((sum, item) => sum + itemTotalCents(item), 0)
}

/** Total do orçamento (produtos + mão de obra), em centavos. */
export function budgetTotalCents(values: BudgetFormValues) {
  return productsTotalCents(values.items) + Number(values.labor || 0)
}

/**
 * Devolve só os campos com erro; objeto vazio = formulário válido.
 *
 * Obrigatório é o mínimo para o orçamento fazer sentido: para quem, qual
 * veículo e alguma coisa a cobrar. Os demais campos aparecem no PDF só se
 * preenchidos, mas quando preenchidos precisam estar completos.
 */
export function validate(values: BudgetFormValues): BudgetFormErrors {
  const errors: BudgetFormErrors = {}

  if (!values.customerName.trim()) errors.customerName = 'Informe o cliente.'
  if (values.phone && values.phone.length < 10) errors.phone = 'Telefone incompleto.'

  if (!values.vehicle.trim()) errors.vehicle = 'Informe o veículo.'
  if (values.plate && !PLATE_PATTERN.test(values.plate))
    errors.plate = 'Placa inválida. Ex.: ABC1234.'
  if (values.year && values.year.length !== 4 && values.year.length !== 8)
    errors.year = 'Use 2018 ou 2017/2018.'

  const itemErrors: Record<string, ItemErrors> = {}
  for (const item of values.items) {
    if (isBlankItem(item)) continue

    const error: ItemErrors = {}
    if (!Number(item.quantity)) error.quantity = 'Informe a quantidade.'
    if (!item.description.trim()) error.description = 'Informe o produto ou serviço.'
    if (!item.unitPrice) error.unitPrice = 'Informe o preço.'
    if (Object.keys(error).length > 0) itemErrors[item.id] = error
  }
  if (Object.keys(itemErrors).length > 0) errors.items = itemErrors

  const hasItems = values.items.some((item) => !isBlankItem(item))
  if (!hasItems && !values.labor) errors.general = 'Adicione ao menos um item ou a mão de obra.'

  return errors
}
