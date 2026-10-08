import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Brand from '../Brand/Brand'

type HeaderProps = {
  /** Abre a Sidebar em gaveta. */
  onMenuClick: () => void
}

/**
 * Barra superior só do mobile: botão do menu e a marca. No desktop a marca
 * fica no topo da Sidebar e as ações de cada tela, no cabeçalho da página.
 */
function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b border-line bg-surface/95 px-2 backdrop-blur md:hidden">
      <IconButton onClick={onMenuClick} aria-label="Abrir menu" sx={{ color: 'text.primary' }}>
        <MenuIcon />
      </IconButton>
      <Brand />
    </header>
  )
}

export default Header
