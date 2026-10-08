import { atom } from 'jotai'

/** A confirmação de saída está aberta? Estado global: a Sidebar abre, a modal fecha. */
export const signOutDialogAtom = atom(false)

/** Ações prontas para `useSetAtom` — evitam espalhar `set(atom, true/false)` pelos componentes. */
export const openSignOutDialogAtom = atom(null, (_get, set) => {
  set(signOutDialogAtom, true)
})

export const closeSignOutDialogAtom = atom(null, (_get, set) => {
  set(signOutDialogAtom, false)
})
