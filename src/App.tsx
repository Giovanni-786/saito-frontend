import Header from './components/Header/Header'
import ModalNewOrder from './components/ModalNewOrder/ModalNewOrder'

function App() {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6"></main>
      <ModalNewOrder />
    </div>
  )
}

export default App
