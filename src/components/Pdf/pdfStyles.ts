import { StyleSheet } from '@react-pdf/renderer'

/**
 * Paleta do sistema (src/index.css). Duplicada aqui porque o react-pdf não lê
 * CSS nem o tema do MUI — mudou a cor lá, mude aqui também.
 */
export const COLORS = {
  deepBlue: '#0f2a54',
  saitoBlue: '#1d4ed8',
  lightBlue: '#eaf1fd',
  line: '#cbd1d8',
  text: '#14171a',
  muted: '#5a6472',
  white: '#ffffff',
}

export const PAGE_PADDING = 40

/** Estilos comuns aos PDFs da oficina (laudo e orçamento). */
export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.text,
    paddingBottom: 56,
  },

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
})
