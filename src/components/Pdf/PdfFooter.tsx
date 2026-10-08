import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { WORKSHOP } from '../../constants/workshop'
import { COLORS, PAGE_PADDING } from './pdfStyles'

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 22,
    left: PAGE_PADDING,
    right: PAGE_PADDING,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 6,
    fontSize: 7.5,
    color: COLORS.muted,
  },
})

/** Rodapé fixo no fim de cada página dos PDFs da oficina. */
function PdfFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text>
        {WORKSHOP.tradeName} · CNPJ {WORKSHOP.cnpj}
      </Text>
    </View>
  )
}

export default PdfFooter
