/** Itens por página. Fixo: o grid não oferece troca de tamanho. */
export const PAGE_SIZE = 10
export const ROW_HEIGHT = 52
export const HEADER_HEIGHT = 56
export const FOOTER_HEIGHT = 56

/**
 * Altura fixa de exatamente uma página cheia. Assim o grid ocupa o mesmo
 * espaço durante o loading e com os dados, e a tela não pula quando eles chegam.
 */
export const GRID_HEIGHT = HEADER_HEIGHT + ROW_HEIGHT * PAGE_SIZE + FOOTER_HEIGHT
