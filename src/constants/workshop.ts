/**
 * Dados fixos da oficina, impressos no cabeçalho, no nome do responsável e no rodapé
 * do PDF de laudo. Vieram do papel timbrado que a oficina usava.
 */
export const WORKSHOP = {
  tradeName: 'Mecânica Saito',
  companyName: 'Tornearia JG Ltda ME',
  cnpj: '54.726.260/0001-78',
  stateRegistration: '209351908118',
  street: 'Rua Marçal de Arruda Campos, 3-41',
  district: 'Vila Lemos',
  city: 'Bauru - SP',
  zipCode: '17063-060',
  /** Quem assina o laudo: o nome vai embaixo da linha de assinatura. */
  responsible: 'José Gilberto Saito de Oliveira',
} as const
