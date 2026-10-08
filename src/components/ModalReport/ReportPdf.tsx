import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { WORKSHOP } from '../../constants/workshop'
import { formatDate } from '../../utils/formatDate'
import { maskCpf } from '../../utils/masks'
import type { ReportFormValues } from './reportValues'

/**
 * Paleta do sistema (src/index.css). Duplicada aqui porque o react-pdf não lê
 * CSS nem o tema do MUI — mudou a cor lá, mude aqui também.
 */
const COLORS = {
  deepBlue: '#0f2a54',
  saitoBlue: '#1d4ed8',
  lightBlue: '#eaf1fd',
  line: '#cbd1d8',
  text: '#14171a',
  muted: '#5a6472',
  white: '#ffffff',
}

const PAGE_PADDING = 40

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.text,
    paddingBottom: 56,
  },

  // Cabeçalho: a versão digital do papel timbrado.
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
  documentDate: { fontSize: 8.5, opacity: 0.75 },
  accentBar: { height: 4, backgroundColor: COLORS.saitoBlue },

  body: { paddingHorizontal: PAGE_PADDING, paddingTop: 24 },

  section: { marginBottom: 18 },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: COLORS.saitoBlue,
    letterSpacing: 1.5,
    paddingBottom: 5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  fields: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  field: { paddingHorizontal: 6, marginBottom: 9 },
  fieldLabel: {
    fontSize: 7.5,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  fieldValue: { fontSize: 10.5 },

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

type FieldProps = {
  label: string
  value: string
  /** Fração da largura da linha, ex.: '50%'. */
  width: string
}

/** Rótulo pequeno em cima, valor embaixo. Campo vazio não é impresso. */
function Field({ label, value, width }: FieldProps) {
  if (!value) return null

  return (
    <View style={[styles.field, { width }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  )
}

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
      <Page size="A4" style={styles.page}>
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
            <Text style={styles.documentDate}>Emitido em {formatDate(issuedAt)}</Text>
          </View>
        </View>
        <View style={styles.accentBar} />

        <View style={styles.body}>
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>CLIENTE</Text>
            <View style={styles.fields}>
              <Field label="Nome" value={values.customerName.trim()} width="100%" />
              <Field label="CPF" value={maskCpf(values.cpf)} width="50%" />
              <Field label="RG" value={values.rg.trim()} width="50%" />
              <Field label="Endereço" value={values.address.trim()} width="100%" />
            </View>
          </View>

          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>VEÍCULO</Text>
            <View style={styles.fields}>
              <Field label="Modelo" value={values.vehicleModel.trim()} width="100%" />
              <Field label="Placa" value={values.plate} width="25%" />
              <Field label="Chassi" value={values.chassis} width="45%" />
              <Field label="Renavam" value={values.renavam} width="30%" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DIAGNÓSTICO</Text>
            <View style={styles.fields}>
              <Field label="Data da chegada" value={formatDate(values.arrivalDate)} width="100%" />
            </View>
            <View style={styles.diagnosisBox}>
              <Text>{values.diagnosis.trim()}</Text>
            </View>
          </View>

          {hasForecast && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>PREVISÃO</Text>
              <View style={styles.forecastRow}>
                {values.partsArrivalDate && (
                  <View style={styles.forecastCard}>
                    <Text style={styles.fieldLabel}>Desmonte e chegada das peças</Text>
                    <Text style={styles.forecastDate}>{formatDate(values.partsArrivalDate)}</Text>
                  </View>
                )}
                {values.readyDate && (
                  <View style={styles.forecastCard}>
                    <Text style={styles.fieldLabel}>Veículo pronto</Text>
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

        <View style={styles.footer} fixed>
          <Text>
            {WORKSHOP.tradeName} · CNPJ {WORKSHOP.cnpj}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default ReportPdf
