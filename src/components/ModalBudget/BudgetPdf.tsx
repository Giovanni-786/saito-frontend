import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { WORKSHOP } from '../../constants/workshop'
import { maskCurrency, maskPhone, maskVehicleYear } from '../../utils/masks'
import PdfField from '../Pdf/PdfField'
import PdfFooter from '../Pdf/PdfFooter'
import PdfHeader from '../Pdf/PdfHeader'
import { COLORS, pdfStyles } from '../Pdf/pdfStyles'
import { isBlankItem, itemTotalCents, productsTotalCents } from './budgetValues'
import type { BudgetFormValues } from './budgetValues'

/** Largura de cada coluna da tabela; somam 100%. */
const COLUMNS = { quantity: '11%', description: '49%', unitPrice: '20%', total: '20%' }

/** Estilos só do orçamento; os comuns aos PDFs vêm de `pdfStyles`. */
const styles = StyleSheet.create({
  table: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 4 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightBlue,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  headCell: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: COLORS.saitoBlue,
    letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.line },
  rowLast: { borderBottomWidth: 0 },
  rowStriped: { backgroundColor: '#f7f9fc' },
  cell: { paddingVertical: 7, paddingHorizontal: 8 },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },

  totals: { marginTop: 14, marginLeft: 'auto', width: '45%' },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  totalsLabel: { color: COLORS.muted },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: COLORS.deepBlue,
    color: COLORS.white,
    borderRadius: 4,
  },
  grandTotalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 10, letterSpacing: 1.5 },
  grandTotalValue: { fontFamily: 'Helvetica-Bold', fontSize: 15 },
})

type BudgetPdfProps = {
  values: BudgetFormValues
  /** Data de emissão em AAAA-MM-DD. */
  issuedAt: string
}

/** Documento de orçamento da oficina, gerado a partir do formulário. */
function BudgetPdf({ values, issuedAt }: BudgetPdfProps) {
  const items = values.items.filter((item) => !isBlankItem(item))
  const productsTotal = productsTotalCents(items)
  const labor = Number(values.labor || 0)
  const vehicleTitle = [values.vehicle.trim(), values.plate].filter(Boolean).join(' ')

  return (
    <Document
      title={`${vehicleTitle} - ${values.customerName.trim()}`}
      author={WORKSHOP.tradeName}
      creator={WORKSHOP.tradeName}
    >
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader issuedAt={issuedAt} showPhone />

        <View style={pdfStyles.body}>
          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>CLIENTE E VEÍCULO</Text>
            <View style={pdfStyles.fields}>
              <PdfField label="Cliente" value={values.customerName.trim()} width="65%" />
              <PdfField label="Fone" value={maskPhone(values.phone)} width="35%" />
              <PdfField label="Veículo" value={values.vehicle.trim()} width="40%" />
              <PdfField label="Modelo" value={values.model.trim()} width="60%" />
              <PdfField label="Placa" value={values.plate} width="25%" />
              <PdfField label="Ano" value={maskVehicleYear(values.year)} width="25%" />
              <PdfField label="Combustível" value={values.fuel} width="50%" />
            </View>
          </View>

          {items.length > 0 && (
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>PRODUTOS E SERVIÇOS</Text>

              <View style={styles.table}>
                {/* `fixed`: se a tabela passar de página, o cabeçalho se repete. */}
                <View style={styles.tableHead} fixed>
                  <Text style={[styles.headCell, styles.center, { width: COLUMNS.quantity }]}>
                    QUANT.
                  </Text>
                  <Text style={[styles.headCell, { width: COLUMNS.description }]}>PRODUTO</Text>
                  <Text style={[styles.headCell, styles.right, { width: COLUMNS.unitPrice }]}>
                    PREÇO UNIT.
                  </Text>
                  <Text style={[styles.headCell, styles.right, { width: COLUMNS.total }]}>
                    SUBTOTAL
                  </Text>
                </View>

                {items.map((item, index) => (
                  <View
                    key={item.id}
                    wrap={false}
                    style={[
                      styles.row,
                      index % 2 === 1 ? styles.rowStriped : {},
                      index === items.length - 1 ? styles.rowLast : {},
                    ]}
                  >
                    <Text style={[styles.cell, styles.center, { width: COLUMNS.quantity }]}>
                      {item.quantity}
                    </Text>
                    <Text style={[styles.cell, { width: COLUMNS.description }]}>
                      {item.description.trim()}
                    </Text>
                    <Text style={[styles.cell, styles.right, { width: COLUMNS.unitPrice }]}>
                      {maskCurrency(item.unitPrice)}
                    </Text>
                    <Text style={[styles.cell, styles.right, { width: COLUMNS.total }]}>
                      {maskCurrency(String(itemTotalCents(item)))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.totals} wrap={false}>
            {items.length > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Produtos</Text>
                <Text>{maskCurrency(String(productsTotal))}</Text>
              </View>
            )}
            {labor > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Mão de obra</Text>
                <Text>{maskCurrency(values.labor)}</Text>
              </View>
            )}
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>
                {maskCurrency(String(productsTotal + labor)) || 'R$ 0,00'}
              </Text>
            </View>
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  )
}

export default BudgetPdf
