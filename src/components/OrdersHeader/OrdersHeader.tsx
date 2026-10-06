import OrdersFilters from '../OrdersFilters/OrdersFilters'

/** Título da listagem de atendimentos com os filtros ao lado. */
function OrdersHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-xl font-semibold tracking-tight text-deep-blue">Atendimentos</h2>
      <OrdersFilters />
    </div>
  )
}

export default OrdersHeader
