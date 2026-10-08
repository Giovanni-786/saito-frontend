import { useSetAtom } from 'jotai'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import { openReportModalAtom, openSignOutDialogAtom } from '../../store'

const DRAWER_WIDTH = 240

type SidebarProps = {
  /** Drawer do mobile aberto? No desktop a sidebar fica sempre visível. */
  mobileOpen: boolean
  onMobileClose: () => void
}

/**
 * Menu lateral global. Desktop (md+): fixo à esquerda, abaixo do Header.
 * Mobile: gaveta temporária aberta pelo botão de menu do Header.
 *
 * Os itens só abrem as modais globais via atoms; quem faz o trabalho são o
 * ModalReport e o SignOutDialog.
 */
function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const openReport = useSetAtom(openReportModalAtom)
  const openSignOut = useSetAtom(openSignOutDialogAtom)

  /** No mobile a gaveta fecha antes de abrir a modal, para não ficar por trás dela. */
  function select(action: () => void) {
    onMobileClose()
    action()
  }

  const content = (
    <nav aria-label="Menu principal" className="flex h-full flex-col">
      {/* No mobile a gaveta cobre o Header, então repete a marca no topo. */}
      <div className="flex h-16 items-center bg-deep-blue px-4 md:hidden">
        <span className="text-lg font-semibold tracking-tight text-white">Saito Oficina</span>
      </div>

      <List sx={{ py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => select(openReport)}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
              <DescriptionOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary="Laudo seguradora"
              slotProps={{ primary: { sx: { fontWeight: 500, color: 'primary.dark' } } }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Sair fica no rodapé, longe das ações do dia a dia. */}
      <div className="mt-auto">
        <Divider />
        <List sx={{ py: 1 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => select(openSignOut)}>
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Sair"
                slotProps={{ primary: { sx: { fontWeight: 500, color: 'text.secondary' } } }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </div>
    </nav>
  )

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {content}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          // Por padrão o paper é `fixed` e cobriria o Header; relativo, ele entra
          // no fluxo do Layout e ocupa só a coluna abaixo do Header.
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, position: 'relative' },
        }}
      >
        {content}
      </Drawer>
    </>
  )
}

export default Sidebar
