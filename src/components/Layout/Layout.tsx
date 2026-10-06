import type { ReactNode } from 'react'
import Header from '../Header/Header'
import ModalNewOrder from '../ModalNewOrder/ModalNewOrder'

type LayoutProps = {
  children: ReactNode
}

/**
 * Estrutura comum das telas autenticadas: header no topo, conteúdo centralizado
 * e o modal de novo atendimento, que fica aqui porque quem o abre é o Header.
 */
function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6">
        {children}
      </main>
      <ModalNewOrder />
    </div>
  )
}

export default Layout
