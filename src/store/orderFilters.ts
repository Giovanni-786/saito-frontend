import { atom } from 'jotai'

/**
 * Texto da busca aplicada na listagem de atendimentos. Estado global: o
 * OrdersFilters escreve, o OrdersGrid lê e manda como `busca` para a API.
 * Vazio = sem filtro.
 */
export const ordersSearchAtom = atom('')

/** Aplica uma busca nova. Espaços nas pontas não contam como filtro. */
export const applyOrdersSearchAtom = atom(null, (_get, set, search: string) => {
  set(ordersSearchAtom, search.trim())
})

export const clearOrdersSearchAtom = atom(null, (_get, set) => {
  set(ordersSearchAtom, '')
})
