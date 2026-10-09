import { atom } from 'jotai'
import type { Order } from '../services/orders'

type DeleteOrderDialogState = {
  open: boolean
  /** Atendimento a excluir. Guardado inteiro para a modal citar cliente e placa. */
  order: Order | null
}

/** Estado global da modal de confirmação de exclusão. O grid abre, a modal fecha. */
export const deleteOrderDialogAtom = atom<DeleteOrderDialogState>({ open: false, order: null })

export const openDeleteOrderDialogAtom = atom(null, (_get, set, order: Order) => {
  set(deleteOrderDialogAtom, { open: true, order })
})

/** Fechar mantém o `order`, para o texto não sumir durante a animação de saída. */
export const closeDeleteOrderDialogAtom = atom(null, (_get, set) => {
  set(deleteOrderDialogAtom, (current) => ({ ...current, open: false }))
})
