import type { GridColDef } from '@mui/x-data-grid'
import type { Order } from '../../services/orders'
import { formatDate } from '../../utils/formatDate'
import { maskPhone, onlyDigits } from '../../utils/masks'
import DeleteOrderButton from './DeleteOrderButton'
import EditOrderButton from './EditOrderButton'
import { latestServiceDate } from './orderSummary'
import PlateChip from './PlateChip'

export const columns: GridColDef<Order>[] = [
  {
    // A data vem dos serviços do atendimento: o backend não ordena por ela.
    field: 'data',
    headerName: 'Data',
    width: 112,
    sortable: false,
    valueGetter: (_value, row) => latestServiceDate(row),
    valueFormatter: (value: string | null) => (value ? formatDate(value) : ''),
    cellClassName: 'cell-muted',
  },
  {
    field: 'cliente',
    headerName: 'Cliente',
    flex: 1.4,
    minWidth: 190,
    // O telefone vai embaixo do nome: libera uma coluna e agrupa o contato.
    renderCell: ({ row }) => (
      <div className="flex min-w-0 flex-col justify-center gap-0.5 leading-tight">
        <span className="truncate font-semibold">{row.cliente}</span>
        <span className="text-[12.5px] text-content-muted tabular-nums">
          {maskPhone(onlyDigits(row.telefone))}
        </span>
      </div>
    ),
  },
  { field: 'veiculo', headerName: 'Veículo', flex: 1.2, minWidth: 160 },
  {
    field: 'placa',
    headerName: 'Placa',
    width: 116,
    renderCell: ({ value }) => <PlateChip plate={value} />,
  },
  {
    field: 'actions',
    headerName: 'Ações',
    // O título existe para leitores de tela; visualmente a coluna não tem cabeçalho.
    renderHeader: () => <span className="sr-only">Ações</span>,
    width: 92,
    sortable: false,
    align: 'right',
    renderCell: ({ row }) => (
      <div className="row-actions flex h-full items-center justify-end gap-0.5">
        <EditOrderButton orderId={row.id} />
        <DeleteOrderButton order={row} />
      </div>
    ),
  },
]
