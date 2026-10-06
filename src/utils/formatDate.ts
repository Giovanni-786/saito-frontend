/**
 * "2026-09-22" -> "22/09/2026". Formatado a partir do texto, sem passar por
 * `new Date`, que interpretaria a data em UTC e poderia voltar um dia.
 */
export function formatDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}
