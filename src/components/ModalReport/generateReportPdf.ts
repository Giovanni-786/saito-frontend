import { createElement } from 'react'
import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { downloadBlob } from '../../utils/downloadBlob'
import { today } from '../../utils/today'
import type { ReportFormValues } from './reportValues'

/**
 * Gera o PDF do laudo e baixa o arquivo.
 *
 * O react-pdf e o documento são importados sob demanda: a biblioteca é grande
 * e só é necessária quando alguém clica em "PDF", então não entra no bundle
 * que abre o sistema.
 */
export async function generateReportPdf(values: ReportFormValues) {
  const [{ pdf }, { default: ReportPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./ReportPdf'),
  ])

  const issuedAt = today()

  // O `pdf()` tipa o argumento como o <Document> em si; o ReportPdf é um
  // componente que renderiza um <Document>, o que o react-pdf aceita em runtime.
  const reportDocument = createElement(ReportPdf, {
    values,
    issuedAt,
  }) as ReactElement<DocumentProps>
  const blob = await pdf(reportDocument).toBlob()

  downloadBlob(blob, `laudo-${values.plate}-${issuedAt}.pdf`)
}
