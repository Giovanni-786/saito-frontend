import { useQuery } from '@tanstack/react-query'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded'
import { serviceSummary } from '../../services/atendimentos'
import { currencyFormatter } from '../OrdersGrid/columns'
import StatCard from '../StatCard/StatCard'

/**
 * GET /atendimentos/resumo ainda não existe no backend. Enquanto for `false`
 * a query não roda e os cards mostram um traço. Com a rota pronta, basta
 * ligar aqui (e conferir o tipo ResumoAtendimentos).
 */
const SUMMARY_ENDPOINT_READY = false

/** Indicadores da tela de atendimentos: total de atendimentos e faturamento. */
function OrdersSummary() {
  const query = useQuery({
    // Debaixo de ['atendimentos']: criar, editar ou excluir já invalida os totais.
    queryKey: ['atendimentos', 'resumo'],
    queryFn: ({ signal }) => serviceSummary(signal),
    enabled: SUMMARY_ENDPOINT_READY,
    // Indicador não é crítico: se falhar, mostra o traço em vez de insistir.
    retry: false,
  })

  const summary = query.data
  // `isLoading` (e não `isPending`): com a query desligada ela fica pending para sempre.
  const loading = query.isLoading

  return (
    <section aria-label="Resumo" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard
        icon={<AssignmentOutlinedIcon fontSize="small" />}
        label="Total de atendimentos"
        value={summary ? summary.totalAtendimentos.toLocaleString('pt-BR') : null}
        loading={loading}
      />
      <StatCard
        icon={<AttachMoneyRoundedIcon fontSize="small" />}
        label="Faturamento total"
        value={summary ? currencyFormatter.format(summary.faturamentoTotal) : null}
        loading={loading}
      />
    </section>
  )
}

export default OrdersSummary
