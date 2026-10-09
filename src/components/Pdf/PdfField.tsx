import { Text, View } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'

type PdfFieldProps = {
  label: string
  value: string
  /** Fração da largura da linha, ex.: '50%'. */
  width: string
}

/** Rótulo pequeno em cima, valor embaixo. Campo vazio não é impresso. */
function PdfField({ label, value, width }: PdfFieldProps) {
  if (!value) return null

  return (
    <View style={[pdfStyles.field, { width }]}>
      <Text style={pdfStyles.fieldLabel}>{label}</Text>
      <Text style={pdfStyles.fieldValue}>{value}</Text>
    </View>
  )
}

export default PdfField
