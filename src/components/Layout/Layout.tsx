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
 * Estrutura comum das telas autenticadas: sidebar à esquerda (gaveta no
 * mobile, com o Header para abri-la), conteúdo sobre o fundo `canvas` e as
 * modais globais (atendimento, laudo, exclusão e saída), abertas por atoms.
 */
function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-canvas">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      {/* min-w-0: sem isso o DataGrid empurra a coluna e estoura a largura da tela. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto flex w-full max-w-310 min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 md:py-8 lg:px-10">
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
