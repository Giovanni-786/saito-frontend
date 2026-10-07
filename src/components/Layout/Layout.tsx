import { useState } from 'react'
import type { ReactNode } from 'react'
import DeleteOrderDialog from '../DeleteOrderDialog/DeleteOrderDialog'
import Header from '../Header/Header'
import ModalNewOrder from '../ModalNewOrder/ModalNewOrder'
import ModalReport from '../ModalReport/ModalReport'
import Sidebar from '../Sidebar/Sidebar'
import SignOutDialog from '../SignOutDialog/SignOutDialog'

type LayoutProps = {
  children: ReactNode
}

/**
 * Estrutura comum das telas autenticadas: header no topo, sidebar à esquerda,
 * conteúdo centralizado e as modais globais (atendimento, laudo, exclusão e
 * saída), abertas por atoms a partir do Header, da Sidebar e do grid.
 */
function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
        {/* min-w-0: sem isso o DataGrid empurra a coluna e estoura a largura da tela. */}
        <main className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
      <ModalNewOrder />
      <ModalReport />
      <DeleteOrderDialog />
      <SignOutDialog />
    </div>
  )
}

export default Layout
