import { useSetAtom } from 'jotai'
import { openNewOrderModalAtom, signOutAtom } from '../../store'

/**
 * Header global da aplicação: marca à esquerda, ação principal à direita.
 * Renderizado uma vez no Layout, acima de qualquer conteúdo de página.
 */
function Header() {
  const openNewOrder = useSetAtom(openNewOrderModalAtom)
  const signOut = useSetAtom(signOutAtom)

  return (
    <header className="bg-deep-blue">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <span className="text-lg font-semibold tracking-tight text-white">Saito Oficina</span>

        <div className="flex shrink-0 items-center gap-2">
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

          {/* Encerrar a sessão limpa o token; o RequireAuth manda para o /login. */}
          <button
            type="button"
            onClick={signOut}
            className="inline-flex shrink-0 items-center rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-white"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
