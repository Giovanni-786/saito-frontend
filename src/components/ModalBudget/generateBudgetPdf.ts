import { createElement } from 'react'
import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { saveBlob } from '../../utils/download'
import { today } from '../../utils/today'
import type { BudgetFormValues } from './budgetValues'

/**
 * Gera o PDF do orçamento e baixa o arquivo.
 *
 * O react-pdf e o documento são importados sob demanda, como no laudo: a
 * biblioteca é grande e só é necessária quando alguém clica em "PDF".
 */
export async function generateBudgetPdf(values: BudgetFormValues) {
  const [{ pdf }, { default: BudgetPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./BudgetPdf'),
  ])

  const issuedAt = today()

  // O `pdf()` tipa o argumento como o <Document> em si; o BudgetPdf é um
  // componente que renderiza um <Document>, o que o react-pdf aceita em runtime.
  const budgetDocument = createElement(BudgetPdf, {
    values,
    issuedAt,
  }) as ReactElement<DocumentProps>
  const blob = await pdf(budgetDocument).toBlob()

  // Sem placa (comum em orçamento), o arquivo leva o nome do cliente.
  const reference = values.plate || slugify(values.customerName)
  saveBlob(blob, `orcamento-${reference}-${issuedAt}.pdf`)
}

/** "João da Silva" -> "joao-da-silva", seguro para nome de arquivo. */
function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
