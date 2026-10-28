import { createElement } from 'react'
import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import type { Order } from '../../services/orders'
import { saveBlob } from '../../utils/download'
import { normalizePlate } from '../../utils/masks'
import { today } from '../../utils/today'

/**
 * Gera o PDF com os serviços do atendimento e baixa o arquivo.
 *
 * O react-pdf e o documento são importados sob demanda, como no laudo: a
 * biblioteca é grande e só é necessária quando alguém clica em "Exportar".
 */
export async function generateOrderServicesPdf(order: Order) {
  const [{ pdf }, { default: OrderServicesPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./OrderServicesPdf'),
  ])

  const issuedAt = today()

  // O `pdf()` tipa o argumento como o <Document> em si; o OrderServicesPdf é um
  // componente que renderiza um <Document>, o que o react-pdf aceita em runtime.
  const servicesDocument = createElement(OrderServicesPdf, {
    order,
    issuedAt,
  }) as ReactElement<DocumentProps>
  const blob = await pdf(servicesDocument).toBlob()

  // Registro importado pode não ter placa: o arquivo leva o número do atendimento.
  const reference = normalizePlate(order.placa ?? '') || `atendimento-${order.id}`
  saveBlob(blob, `servicos-${reference}-${issuedAt}.pdf`)
}
