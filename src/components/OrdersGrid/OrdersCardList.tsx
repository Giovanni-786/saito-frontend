import { useSetAtom } from 'jotai'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import type { Atendimento } from '../../services/atendimentos'
import { openEditOrderModalAtom } from '../../store'
import { formatDate } from '../../utils/formatDate'
import { currencyFormatter } from './columns'
import DeleteOrderButton from './DeleteOrderButton'
import OrdersEmptyState from './OrdersEmptyState'
import PlateChip from './PlateChip'

type OrdersCardListProps = {
  rows: Atendimento[]
  /** Primeira carga, ainda sem nenhuma linha para mostrar. */
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Versão mobile da listagem: um card por atendimento no lugar das colunas
 * do DataGrid, que não cabem numa tela estreita. Mesma query e paginação.
 */
function OrdersCardList({ rows, loading, page, totalPages, onPageChange }: OrdersCardListProps) {
  const openEdit = useSetAtom(openEditOrderModalAtom)

  if (loading) {
    return (
      <ul aria-busy="true" aria-label="Carregando atendimentos" className="divide-y divide-line">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} className="flex flex-col gap-2 px-4 py-4">
            <Skeleton width="55%" height={22} />
            <Skeleton width="80%" />
            <Skeleton width="40%" />
          </li>
        ))}
      </ul>
    )
  }

  if (rows.length === 0) return <OrdersEmptyState />

  return (
    <>
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.id} className="relative">
            {/* O card inteiro abre a edição; a lixeira fica fora do botão, por cima. */}
            <button
              type="button"
              onClick={() => openEdit(row.id)}
              className="flex w-full flex-col gap-2 px-4 py-4 pr-14 text-left transition-colors hover:bg-[#f7f9fd]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-semibold">{row.cliente}</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {currencyFormatter.format(row.valor)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <PlateChip plate={row.placa} />
                <span className="truncate text-content-muted">{row.veiculo}</span>
              </div>
              {row.servicosPecas && (
                <p className="line-clamp-2 text-sm text-[#3d4652]">{row.servicosPecas}</p>
              )}
              <span className="text-xs text-content-muted tabular-nums">
                {formatDate(row.data)} · {row.km.toLocaleString('pt-BR')} km
              </span>
            </button>
            <div className="absolute top-3 right-2">
              <DeleteOrderButton order={row} />
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-between gap-3 border-t border-line px-4 py-3"
        >
          <span className="text-[13px] text-content-muted tabular-nums">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-1.5">
            <IconButton
              aria-label="Página anterior"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              sx={{ border: 1, borderColor: 'divider' }}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Próxima página"
              disabled={page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
              sx={{ border: 1, borderColor: 'divider' }}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </div>
        </nav>
      )}
    </>
  )
}

export default OrdersCardList
