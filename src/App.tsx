import Header from './components/Header/Header'
import ModalNewOrder from './components/ModalNewOrder/ModalNewOrder'
import OrdersFilters from './components/OrdersFilters/OrdersFilters'
import OrdersGrid from './components/OrdersGrid/OrdersGrid'

function App() {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-deep-blue">Atendimentos</h2>
          <OrdersFilters />
        </div>
        <OrdersGrid />
      </main>
      <ModalNewOrder />
    </div>
  )
}

export default App
