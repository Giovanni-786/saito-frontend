/** Hoje em AAAA-MM-DD no fuso local. `toISOString` usaria UTC e poderia voltar um dia. */
export function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
