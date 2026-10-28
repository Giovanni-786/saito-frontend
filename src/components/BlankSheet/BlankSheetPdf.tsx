import { Document, Page } from '@react-pdf/renderer'
import { WORKSHOP } from '../../constants/workshop'
import PdfHeader from '../Pdf/PdfHeader'
import { pdfStyles } from '../Pdf/pdfStyles'

/**
 * Folha em branco com o papel timbrado da oficina: só o cabeçalho, o resto da
 * página livre para imprimir e preencher à mão. Sem data de emissão, porque a
 * folha pode ser impressa hoje e usada outro dia, e sem rodapé.
 */
function BlankSheetPdf() {
  return (
    <Document title="Folha em branco" author={WORKSHOP.tradeName} creator={WORKSHOP.tradeName}>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader showPhone />
      </Page>
    </Document>
  )
}

export default BlankSheetPdf
