import type { GridColDef } from '@mui/x-data-grid'
import type { Atendimento } from '../../services/atendimentos'
import { formatDate } from '../../utils/formatDate'

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const columns: GridColDef<Atendimento>[] = [
  {
    field: 'data',
    headerName: 'Data',
    width: 110,
    valueFormatter: (value: string) => formatDate(value),
  },
  { field: 'cliente', headerName: 'Cliente', flex: 1, minWidth: 160 },
  { field: 'veiculo', headerName: 'Veículo', flex: 1, minWidth: 140 },
  { field: 'placa', headerName: 'Placa', width: 110 },
  { field: 'telefone', headerName: 'Telefone', width: 140 },
  {
    field: 'km',
    headerName: 'KM',
    type: 'number',
    width: 100,
    valueFormatter: (value: number) => value.toLocaleString('pt-BR'),
  },
  {
    field: 'valor',
    headerName: 'Valor',
    type: 'number',
    width: 120,
    valueFormatter: (value: number) => currencyFormatter.format(value),
  },
  { field: 'servicosPecas', headerName: 'Serviços / peças', flex: 1.5, minWidth: 200 },
]
