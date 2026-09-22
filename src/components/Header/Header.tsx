import { useSetAtom } from 'jotai'
import { openNewOrderModalAtom } from '../../store'

/**
 * Header global da aplicação: marca à esquerda, ação principal à direita.
 * Renderizado uma vez no App, acima de qualquer conteúdo de página.
 */
function Header() {
  const openNewOrder = useSetAtom(openNewOrderModalAtom)

  return (
    <header className="bg-deep-blue">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <span className="text-lg font-semibold tracking-tight text-white">Saito Oficina</span>

        <button
          type="button"
          onClick={openNewOrder}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-saito-blue shadow-sm transition-colors hover:bg-light-blue focus-visible:outline-white"
        >
          {/* O "+" é decorativo: o texto do botão já diz a ação para leitores de tela. */}
          <span aria-hidden="true" className="text-base leading-none">
            +
          </span>
          Novo atendimento
        </button>
      </div>
    </header>
  )
}

export default Header
