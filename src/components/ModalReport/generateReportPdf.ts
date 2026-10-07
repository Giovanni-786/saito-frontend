import { createElement } from 'react'
import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReportFormValues } from './reportValues'
import { today } from './reportValues'

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

/** Dispara o download pelo navegador e libera a URL temporária em seguida. */
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  // Revogar na mesma hora pode cancelar o download em alguns navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
