import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { WORKSHOP } from '../../constants/workshop'
import type { Order } from '../../services/orders'
import { formatDate } from '../../utils/formatDate'
import { maskCurrency, maskInteger, maskPhone, normalizePlate, onlyDigits } from '../../utils/masks'
import { breakLongWords } from '../Pdf/breakLongWords'
import PdfField from '../Pdf/PdfField'
import PdfFooter from '../Pdf/PdfFooter'
import PdfHeader from '../Pdf/PdfHeader'
import { COLORS, pdfStyles } from '../Pdf/pdfStyles'
import { chronologicalServices } from './newOrderValues'

const CONTINUATION_TOP = 32

/** Estilos só do histórico de serviços; os comuns aos PDFs vêm de `pdfStyles`. */
const styles = StyleSheet.create({
  // O histórico passa de uma página: as seguintes, sem o cabeçalho, ganham
  // margem no topo. Na primeira, o cabeçalho sobe por cima dela.
  page: { paddingTop: CONTINUATION_TOP },
  headerPullUp: { marginTop: -CONTINUATION_TOP },

  notes: {
    backgroundColor: COLORS.lightBlue,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.saitoBlue,
    borderRadius: 4,
    padding: 10,
  },

  serviceBlock: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    marginBottom: 10,
  },
  serviceHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  serviceTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: COLORS.saitoBlue,
    letterSpacing: 1,
  },
  serviceMeta: { fontSize: 8.5, color: COLORS.muted, marginTop: 2 },
  serviceAmount: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: COLORS.deepBlue },
  serviceBody: { paddingVertical: 8, paddingHorizontal: 10 },
  attachments: { fontSize: 8, color: COLORS.muted, marginTop: 6 },
})

/** Reais da API para o `maskCurrency`, que recebe centavos em texto. */
function formatAmount(value: number | null) {
  // Math.round: 350.1 * 100 dá 35009.99... em ponto flutuante.
  return value === null ? '—' : maskCurrency(String(Math.round(value * 100))) || 'R$ 0,00'
}

type OrderServicesPdfProps = {
  order: Order
  /** Data de emissão em AAAA-MM-DD. */
  issuedAt: string
}

/**
 * Histórico de serviços de um atendimento: dados do cliente e do veículo e um
 * bloco por serviço, do mais recente para o mais antigo, como na aba "Serviços".
 * Campos null (registros importados incompletos) não são impressos.
 */
function OrderServicesPdf({ order, issuedAt }: OrderServicesPdfProps) {
  // Numerados na ordem cronológica (#1 = primeiro) e impressos do mais recente.
  const services = chronologicalServices(order)
    .map((service, index) => ({ service, number: index + 1 }))
    .reverse()

  const plate = normalizePlate(order.placa ?? '')
  const customer = order.cliente?.trim() ?? ''
  const notes = order.observacao?.trim()

  return (
    <Document
      title={[plate, customer].filter(Boolean).join(' - ') || `Atendimento #${order.id}`}
      author={WORKSHOP.tradeName}
      creator={WORKSHOP.tradeName}
    >
      <Page size="A4" style={[pdfStyles.page, styles.page]}>
        <View style={styles.headerPullUp}>
          <PdfHeader issuedAt={issuedAt} showPhone />
        </View>

        <View style={pdfStyles.body}>
          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>CLIENTE E VEÍCULO</Text>
            <View style={pdfStyles.fields}>
              <PdfField label="Cliente" value={customer} width="65%" />
              <PdfField
                label="Telefone"
                value={maskPhone(onlyDigits(order.telefone ?? ''))}
                width="35%"
              />
              <PdfField label="Veículo" value={order.veiculo?.trim() ?? ''} width="65%" />
              <PdfField label="Placa" value={plate} width="35%" />
            </View>
            {notes && (
              <View style={styles.notes}>
                <Text style={pdfStyles.fieldLabel}>Observação</Text>
                <Text hyphenationCallback={breakLongWords}>{notes}</Text>
              </View>
            )}
          </View>

          <View style={pdfStyles.section}>
            {/* minPresenceAhead: o título não fica sozinho no fim da página. */}
            <Text style={pdfStyles.sectionTitle} minPresenceAhead={80}>
              SERVIÇOS REALIZADOS
            </Text>

            {services.map(({ service, number }) => {
              const meta = [
                service.data ? formatDate(service.data) : 'Sem data',
                service.km !== null && `${maskInteger(String(service.km))} km`,
              ]
                .filter(Boolean)
                .join(' · ')
              const attachments = (service.anexos ?? []).map((a) => a.nome)

              return (
                <View key={service.id} style={styles.serviceBlock}>
                  {/* O cabeçalho do bloco nunca fica sem o começo da descrição. */}
                  <View style={styles.serviceHead} wrap={false} minPresenceAhead={30}>
                    <View>
                      <Text style={styles.serviceTitle}>SERVIÇO #{number}</Text>
                      <Text style={styles.serviceMeta}>{meta}</Text>
                    </View>
                    <Text style={styles.serviceAmount}>{formatAmount(service.valor)}</Text>
                  </View>

                  <View style={styles.serviceBody}>
                    <Text hyphenationCallback={breakLongWords}>{service.descricao.trim()}</Text>
                    {attachments.length > 0 && (
                      <Text style={styles.attachments} hyphenationCallback={breakLongWords}>
                        Anexos: {attachments.join(', ')}
                      </Text>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  )
}

export default OrderServicesPdf
