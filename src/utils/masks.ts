/**
 * Máscaras de input. Cada campo guarda no estado só o valor cru (dígitos, letras
 * maiúsculas) e usa estas funções para exibir; assim o payload sai sem conversão.
 */

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Remove tudo que não for dígito. */
export function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

/** "14999999999" -> "(14) 99999-9999". Aceita fixo (10 dígitos) e celular (11). */
export function maskPhone(digits: string) {
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`

  const ddd = digits.slice(0, 2)
  const number = digits.slice(2)
  if (number.length <= 4) return `(${ddd}) ${number}`

  // Celular tem 5 dígitos antes do hífen; fixo, 4.
  const split = number.length > 8 ? 5 : 4
  return `(${ddd}) ${number.slice(0, split)}-${number.slice(split)}`
}

/** Placa só com letras e números, em maiúsculas: "abc-1d23" -> "ABC1D23". */
export function normalizePlate(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 7)
}

/** "45122947830" -> "451.229.478-30". Formata conforme digita. */
export function maskCpf(digits: string) {
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

/**
 * Chassi (VIN): 17 letras e números, em maiúsculas. I, O e Q não existem em
 * chassi justamente para não confundir com 1 e 0, então são descartadas.
 */
export function normalizeChassis(value: string) {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .replace(/[IOQ]/g, '')
    .slice(0, 17)
}

/** "85000" -> "85.000". */
export function maskInteger(digits: string) {
  return digits ? Number(digits).toLocaleString('pt-BR') : ''
}

/**
 * Centavos em texto para moeda: "35000" -> "R$ 350,00". Quem digita preenche
 * da direita para a esquerda, como em caixa eletrônico.
 */
export function maskCurrency(cents: string) {
  return cents ? currencyFormatter.format(Number(cents) / 100) : ''
}
