import { useQuery } from '@tanstack/react-query'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded'
import { serviceRevenue } from '../../services/orders'
import { currencyFormatter } from '../OrdersGrid/columns'
import StatCard from '../StatCard/StatCard'

/** Indicadores da tela de atendimentos: total de atendimentos e faturamento. */
function OrdersSummary() {
  const revenue = useQuery({
    // Debaixo de ['orders']: criar, editar ou excluir já invalida o total.
    queryKey: ['orders', 'revenue'],
    queryFn: ({ signal }) => serviceRevenue(signal),
    // Indicador não é crítico: se falhar, mostra o traço em vez de insistir.
    retry: false,
  })

  return (
    <section aria-label="Resumo" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* O backend ainda não tem rota com o total de atendimentos: o card fica com o traço. */}
      <StatCard
        icon={<AssignmentOutlinedIcon fontSize="small" />}
        label="Total de atendimentos"
        value={null}
      />
      <StatCard
        icon={<AttachMoneyRoundedIcon fontSize="small" />}
        label="Faturamento total"
        value={revenue.data ? currencyFormatter.format(revenue.data.total) : null}
        loading={revenue.isPending}
      />
    </section>
  )
}

export default OrdersSummary
