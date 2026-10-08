import { atom } from 'jotai'

/** A modal de orçamento está aberta? Estado global: o Header abre, a modal fecha. */
export const budgetModalAtom = atom(false)

/** Ações prontas para `useSetAtom` — evitam espalhar `set(atom, true/false)` pelos componentes. */
export const openBudgetModalAtom = atom(null, (_get, set) => {
  set(budgetModalAtom, true)
})

export const closeBudgetModalAtom = atom(null, (_get, set) => {
  set(budgetModalAtom, false)
})
