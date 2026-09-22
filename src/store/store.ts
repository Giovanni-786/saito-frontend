import { createStore } from 'jotai'

/**
 * Store único da aplicação.
 *
 * O Jotai funciona sem isto (cai num store global implícito), mas criar o store
 * explicitamente resolve dois problemas: código fora do React — um interceptor
 * do axios, por exemplo — consegue ler e escrever atoms via `store.get`/`store.set`,
 * e nos testes dá para montar um store limpo por caso em vez de herdar estado
 * de um teste anterior.
 *
 * Fora de componentes:
 *   store.get(algumAtom)
 *   store.set(algumAtom, novoValor)
 *   const unsub = store.sub(algumAtom, () => console.log(store.get(algumAtom)))
 */
export const store = createStore()
