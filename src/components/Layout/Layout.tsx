import type { ReactNode } from 'react'
import DeleteOrderDialog from '../DeleteOrderDialog/DeleteOrderDialog'
import Header from '../Header/Header'
import ModalNewOrder from '../ModalNewOrder/ModalNewOrder'

type LayoutProps = {
  children: ReactNode
}

/**
 * Estrutura comum das telas autenticadas: header no topo, conteúdo centralizado
 * e as modais globais de atendimento (cadastro/edição e exclusão), abertas por
 * atoms a partir do Header e do grid.
 */
function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6">
        {children}
      </main>
      <ModalNewOrder />
      <DeleteOrderDialog />
    </div>
  )
}

export default Layout
