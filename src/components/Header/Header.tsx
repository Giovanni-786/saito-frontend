import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

type HeaderProps = {
  /** Abre a Sidebar no mobile. No desktop ela já fica visível e o botão some. */
  onMenuClick: () => void
}

/**
 * Header global da aplicação: só a marca e, no mobile, o botão do menu.
 * Renderizado uma vez no Layout, acima de qualquer conteúdo de página.
 * As ações (Novo atendimento, Orçamento, Laudo seguradora e Sair) ficam na Sidebar.
 */
function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-deep-blue">
      <div className="flex h-16 w-full items-center gap-2 px-4 sm:px-6">
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
    </header>
  )
}

export default Header
