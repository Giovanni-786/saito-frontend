import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { WORKSHOP } from '../../constants/workshop'
import { formatDate } from '../../utils/formatDate'
import { COLORS, PAGE_PADDING } from './pdfStyles'

const styles = StyleSheet.create({
  // A versão digital do papel timbrado.
  header: {
    backgroundColor: COLORS.deepBlue,
    color: COLORS.white,
    paddingVertical: 26,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tradeName: { fontFamily: 'Helvetica-Bold', fontSize: 22, letterSpacing: 0.5 },
  companyName: { fontSize: 9, marginTop: 4, opacity: 0.85 },
  headerLine: { fontSize: 8.5, marginTop: 2, opacity: 0.75 },
  documentTag: { alignItems: 'flex-end' },
  phone: { fontFamily: 'Helvetica-Bold', fontSize: 11, marginBottom: 4 },
  documentDate: { fontSize: 8.5, opacity: 0.75 },
  accentBar: { height: 4, backgroundColor: COLORS.saitoBlue },
})

type PdfHeaderProps = {
  /** Data de emissão em AAAA-MM-DD. */
  issuedAt: string
  /** Mostra o telefone da oficina em destaque, como no talão de orçamento. */
  showPhone?: boolean
}

/** Faixa azul com os dados da oficina e a data de emissão, no topo dos PDFs. */
function PdfHeader({ issuedAt, showPhone = false }: PdfHeaderProps) {
  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.tradeName}>{WORKSHOP.tradeName.toUpperCase()}</Text>
          <Text style={styles.companyName}>{WORKSHOP.companyName}</Text>
          <Text style={styles.headerLine}>
            CNPJ {WORKSHOP.cnpj} · IE {WORKSHOP.stateRegistration}
          </Text>
          <Text style={styles.headerLine}>
            {WORKSHOP.street} · {WORKSHOP.district} · CEP {WORKSHOP.zipCode} · {WORKSHOP.city}
          </Text>
        </View>

        <View style={styles.documentTag}>
          {showPhone && <Text style={styles.phone}>Fone {WORKSHOP.phone}</Text>}
          <Text style={styles.documentDate}>Emitido em {formatDate(issuedAt)}</Text>
        </View>
      </View>
      <View style={styles.accentBar} />
    </>
  )
}

export default PdfHeader
