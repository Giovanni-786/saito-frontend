import type { GridColDef } from '@mui/x-data-grid'
import type { Atendimento } from '../../services/atendimentos'
import { formatDate } from '../../utils/formatDate'
import { maskPhone, onlyDigits } from '../../utils/masks'
import DeleteOrderButton from './DeleteOrderButton'
import EditOrderButton from './EditOrderButton'
import PlateChip from './PlateChip'

export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const columns: GridColDef<Atendimento>[] = [
  {
    field: 'data',
    headerName: 'Data',
    width: 112,
    valueFormatter: (value: string) => formatDate(value),
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
    field: 'km',
    headerName: 'KM',
    type: 'number',
    width: 100,
    valueFormatter: (value: number) => value.toLocaleString('pt-BR'),
    cellClassName: 'cell-muted',
  },
  {
    field: 'servicosPecas',
    headerName: 'Serviços / peças',
    flex: 1.7,
    minWidth: 200,
    sortable: false,
    renderCell: ({ value }) => (
      <span className="truncate" title={value ?? undefined}>
        {value}
      </span>
    ),
  },
  {
    field: 'valor',
    headerName: 'Valor',
    type: 'number',
    width: 124,
    valueFormatter: (value: number) => currencyFormatter.format(value),
    cellClassName: 'cell-strong',
  },
  {
    field: 'acoes',
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
