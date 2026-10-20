import type { Order } from '../../services/orders'

/**
 * Data do serviço mais recente: a listagem mostra uma linha por atendimento,
 * mesmo ele tendo vários serviços. Sem serviço = null.
 */
export function latestServiceDate(order: Order) {
  return order.servicos.reduce<string | null>(
    (latest, service) => (latest === null || service.data > latest ? service.data : latest),
    null,
  )
}
