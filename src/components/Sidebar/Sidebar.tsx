import type { ReactNode } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { NavLink } from 'react-router'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { openReportModalAtom, openSignOutDialogAtom, userEmailAtom } from '../../store'
import Brand from '../Brand/Brand'

export const SIDEBAR_WIDTH = 248

type SidebarProps = {
  /** Gaveta do mobile aberta? No desktop a sidebar fica sempre visível. */
  mobileOpen: boolean
  onMobileClose: () => void
}

const navItemClass =
  'flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-sm font-medium transition-colors'
const navIdleClass = 'text-content-muted hover:bg-canvas hover:text-content'
const navActiveClass = 'bg-light-blue text-saito-blue'

type NavButtonProps = {
  icon: ReactNode
  label: string
  onClick: () => void
}

/** Item que abre uma modal (Laudo): visual de link, comportamento de botão. */
function NavButton({ icon, label, onClick }: NavButtonProps) {
  return (
    <button type="button" onClick={onClick} className={`${navItemClass} ${navIdleClass}`}>
      {icon}
      {label}
    </button>
  )
}

/**
 * Menu lateral global. Desktop (md+): coluna fixa à esquerda, com a marca no
 * topo e o usuário no rodapé. Mobile: gaveta aberta pelo botão do Header.
 *
 * "Laudo" e "Sair" só abrem as modais globais via atoms; quem faz o trabalho
 * são o ModalReport e o SignOutDialog.
 */
function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const openReport = useSetAtom(openReportModalAtom)
  const openSignOut = useSetAtom(openSignOutDialogAtom)
  const email = useAtomValue(userEmailAtom)

  /** No mobile a gaveta fecha antes de abrir a modal, para não ficar por trás dela. */
  function select(action: () => void) {
    onMobileClose()
    action()
  }

  const content = (
    <div className="flex h-full flex-col gap-6 bg-surface px-4 py-5">
      <div className="px-2">
        <Brand withSubtitle />
      </div>

      <nav aria-label="Menu principal" className="flex flex-col gap-1">
        <span className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-content-subtle uppercase">
          Menu
        </span>
        <NavLink
          to="/"
          end
          onClick={onMobileClose}
          className={({ isActive }) =>
            `${navItemClass} ${isActive ? navActiveClass : navIdleClass}`
          }
        >
          <AssignmentOutlinedIcon sx={{ fontSize: 20 }} aria-hidden="true" />
          Atendimentos
        </NavLink>
        <NavButton
          icon={<DescriptionOutlinedIcon sx={{ fontSize: 20 }} aria-hidden="true" />}
          label="Laudo"
          onClick={() => select(openReport)}
        />
      </nav>

      {/* Usuário e Sair no rodapé, longe das ações do dia a dia. */}
      <div className="mt-auto flex items-center gap-3 rounded-xl border border-line p-3">
        <div
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-light-blue text-sm font-semibold text-saito-blue uppercase"
        >
          {(email ?? 'U').charAt(0)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[13px] font-semibold">{email ?? 'Usuário'}</span>
          <span className="text-xs text-content-muted">Conectado</span>
        </div>
        <Tooltip title="Sair">
          <IconButton
            onClick={() => select(openSignOut)}
            aria-label="Sair"
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: 'primary.light' },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  )

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, borderRight: 0 },
        }}
      >
        {content}
      </Drawer>

      {/* Desktop: sticky na altura da tela, para Sair continuar à mão ao rolar a lista. */}
      <aside
        className="sticky top-0 hidden h-dvh shrink-0 border-r border-line md:block"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {content}
      </aside>
    </>
  )
}

export default Sidebar
