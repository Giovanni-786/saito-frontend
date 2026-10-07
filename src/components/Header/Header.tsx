import { useSetAtom } from 'jotai'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { openNewOrderModalAtom } from '../../store'

type HeaderProps = {
  /** Abre a Sidebar no mobile. No desktop ela já fica visível e o botão some. */
  onMenuClick: () => void
}

/**
 * Header global da aplicação: marca à esquerda, ação principal à direita.
 * Renderizado uma vez no Layout, acima de qualquer conteúdo de página.
 * Laudo e Sair ficam na Sidebar.
 */
function Header({ onMenuClick }: HeaderProps) {
  const openNewOrder = useSetAtom(openNewOrderModalAtom)

  return (
    <header className="bg-deep-blue">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <IconButton
            edge="start"
            onClick={onMenuClick}
            aria-label="Abrir menu"
            sx={{ color: 'common.white', display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <span className="text-lg font-semibold tracking-tight text-white">Saito Oficina</span>
        </div>

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
