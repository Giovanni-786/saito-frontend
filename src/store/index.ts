/**
 * Ponto único de importação do estado global:
 *   import { store, newOrderModalAtom } from './store'
 *
 * Cada domínio de estado ganha seu próprio arquivo nesta pasta e é reexportado aqui.
 *
 * Formatos de atom disponíveis:
 *   atom(valorInicial)                    -> primitivo, use com useAtom
 *   atom((get) => ...)                    -> derivado só-leitura, use com useAtomValue
 *   atom(null, (get, set) => ...)         -> ação de escrita, use com useSetAtom
 *   atomWithStorage('chave', inicial, undefined, { getOnInit: true })  -> persiste no localStorage
 */
export { store } from './store'
export * from './newOrder'
