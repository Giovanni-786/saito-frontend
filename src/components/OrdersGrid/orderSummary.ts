import type { Order } from '../../services/orders'

/**
 * Data do serviço mais recente: a listagem mostra uma linha por atendimento,
 * mesmo ele tendo vários serviços. Nenhum serviço com data = null.
 */
export function latestServiceDate(order: Order) {
  return order.servicos.reduce<string | null>(
    (latest, { data }) => (data !== null && (latest === null || data > latest) ? data : latest),
    null,
  )
}
