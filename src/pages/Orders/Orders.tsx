import OrdersGrid from '../../components/OrdersGrid/OrdersGrid'
import OrdersHeader from '../../components/OrdersHeader/OrdersHeader'
import OrdersSummary from '../../components/OrdersSummary/OrdersSummary'

/** Tela de listagem de atendimentos. */
function Orders() {
  return (
    <>
      <OrdersHeader />
      <OrdersSummary />
      <OrdersGrid />
    </>
  )
}

export default Orders
