import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { WORKSHOP } from '../../constants/workshop'
import { formatDate } from '../../utils/formatDate'
import { maskCpf } from '../../utils/masks'
import PdfField from '../Pdf/PdfField'
import PdfFooter from '../Pdf/PdfFooter'
import PdfHeader from '../Pdf/PdfHeader'
import { COLORS, pdfStyles } from '../Pdf/pdfStyles'
import type { ReportFormValues } from './reportValues'

/** Estilos só do laudo; os comuns aos PDFs vêm de `pdfStyles`. */
const styles = StyleSheet.create({
  diagnosisBox: {
    backgroundColor: COLORS.lightBlue,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.saitoBlue,
    borderRadius: 4,
    padding: 12,
  },

  forecastRow: { flexDirection: 'row', gap: 12 },
  forecastCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    padding: 12,
  },
  forecastDate: { fontFamily: 'Helvetica-Bold', fontSize: 14, color: COLORS.deepBlue },

  signature: { width: 230, marginTop: 60, alignItems: 'center' },
  signatureLine: { width: '100%', borderTopWidth: 1, borderTopColor: COLORS.text, marginBottom: 5 },
  signatureName: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, textTransform: 'uppercase' },
})

type ReportPdfProps = {
  values: ReportFormValues
  /** Data de emissão em AAAA-MM-DD. */
  issuedAt: string
}

/** Documento de laudo da oficina, gerado a partir do formulário. */
function ReportPdf({ values, issuedAt }: ReportPdfProps) {
  const hasForecast = Boolean(values.partsArrivalDate || values.readyDate)

  return (
    <Document
      title={`${values.plate} - ${values.customerName.trim()}`}
      author={WORKSHOP.tradeName}
      creator={WORKSHOP.tradeName}
    >
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader issuedAt={issuedAt} />

        <View style={pdfStyles.body}>
          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>CLIENTE</Text>
            <View style={pdfStyles.fields}>
              <PdfField label="Nome" value={values.customerName.trim()} width="100%" />
              <PdfField label="CPF" value={maskCpf(values.cpf)} width="50%" />
              <PdfField label="RG" value={values.rg.trim()} width="50%" />
              <PdfField label="Endereço" value={values.address.trim()} width="100%" />
            </View>
          </View>

          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>VEÍCULO</Text>
            <View style={pdfStyles.fields}>
              <PdfField label="Modelo" value={values.vehicleModel.trim()} width="100%" />
              <PdfField label="Placa" value={values.plate} width="25%" />
              <PdfField label="Chassi" value={values.chassis} width="45%" />
              <PdfField label="Renavam" value={values.renavam} width="30%" />
            </View>
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>DIAGNÓSTICO</Text>
            <View style={pdfStyles.fields}>
              <PdfField
                label="Data da chegada"
                value={formatDate(values.arrivalDate)}
                width="100%"
              />
            </View>
            <View style={styles.diagnosisBox}>
              <Text>{values.diagnosis.trim()}</Text>
            </View>
          </View>

          {hasForecast && (
            <View style={pdfStyles.section} wrap={false}>
              <Text style={pdfStyles.sectionTitle}>PREVISÃO</Text>
              <View style={styles.forecastRow}>
                {values.partsArrivalDate && (
                  <View style={styles.forecastCard}>
                    <Text style={pdfStyles.fieldLabel}>Desmonte e chegada das peças</Text>
                    <Text style={styles.forecastDate}>{formatDate(values.partsArrivalDate)}</Text>
                  </View>
                )}
                {values.readyDate && (
                  <View style={styles.forecastCard}>
                    <Text style={pdfStyles.fieldLabel}>Veículo pronto</Text>
                    <Text style={styles.forecastDate}>{formatDate(values.readyDate)}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Linha para assinar com o nome do responsável embaixo. `wrap={false}`:
              a linha e o nome nunca ficam separados entre páginas. */}
          <View style={styles.signature} wrap={false}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{WORKSHOP.responsible}</Text>
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  )
}

export default ReportPdf
