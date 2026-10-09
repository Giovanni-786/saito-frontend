import { atom } from 'jotai'

type OrderModalState = {
  open: boolean
  /** null = cadastro de um novo atendimento; número = edição do atendimento com esse id. */
  orderId: number | null
}

/**
 * Estado global da modal de atendimento. A Sidebar abre para cadastro, o grid
 * abre para edição e a própria modal fecha.
 */
export const orderModalAtom = atom<OrderModalState>({ open: false, orderId: null })

/** Ações prontas para `useSetAtom` — evitam espalhar `set(atom, ...)` pelos componentes. */
export const openNewOrderModalAtom = atom(null, (_get, set) => {
  set(orderModalAtom, { open: true, orderId: null })
})

export const openEditOrderModalAtom = atom(null, (_get, set, orderId: number) => {
  set(orderModalAtom, { open: true, orderId })
})

/**
 * Fechar mantém o `orderId`: durante a animação de saída a modal continua
 * mostrando o mesmo título e conteúdo, sem piscar "Novo atendimento".
 */
export const closeOrderModalAtom = atom(null, (_get, set) => {
  set(orderModalAtom, (current) => ({ ...current, open: false }))
})
