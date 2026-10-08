import { atom } from 'jotai'

/** A modal de laudo está aberta? Estado global: a Sidebar abre, a modal fecha. */
export const reportModalAtom = atom(false)

/** Ações prontas para `useSetAtom` — evitam espalhar `set(atom, true/false)` pelos componentes. */
export const openReportModalAtom = atom(null, (_get, set) => {
  set(reportModalAtom, true)
})

export const closeReportModalAtom = atom(null, (_get, set) => {
  set(reportModalAtom, false)
})
