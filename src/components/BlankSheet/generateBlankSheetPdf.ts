import { createElement } from 'react'
import type { ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import { saveBlob } from '../../utils/download'

/**
 * Gera a folha em branco e baixa o arquivo.
 *
 * O react-pdf e o documento são importados sob demanda, como no laudo: a
 * biblioteca é grande e só é necessária quando alguém pede o PDF.
 */
export async function generateBlankSheetPdf() {
  const [{ pdf }, { default: BlankSheetPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./BlankSheetPdf'),
  ])

  // O `pdf()` tipa o argumento como o <Document> em si; o BlankSheetPdf é um
  // componente que renderiza um <Document>, o que o react-pdf aceita em runtime.
  const sheetDocument = createElement(BlankSheetPdf) as ReactElement<DocumentProps>
  const blob = await pdf(sheetDocument).toBlob()

  saveBlob(blob, 'folha-em-branco.pdf')
}
