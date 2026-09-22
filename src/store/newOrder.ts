import { atom } from 'jotai'

/** A modal de novo atendimento está aberta? Estado global: o Header abre, a modal fecha. */
export const newOrderModalAtom = atom(false)

/** Ações prontas para `useSetAtom` — evitam espalhar `set(atom, true/false)` pelos componentes. */
export const openNewOrderModalAtom = atom(null, (_get, set) => {
  set(newOrderModalAtom, true)
})

export const closeNewOrderModalAtom = atom(null, (_get, set) => {
  set(newOrderModalAtom, false)
})
