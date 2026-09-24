import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { listarAtendimentos } from '../../services/atendimentos'
import type { Atendimento } from '../../services/atendimentos'
import { ordersSearchAtom } from '../../store'
import { ApiError } from '../../utils/api'

/** Itens por página. Fixo: o grid não oferece troca de tamanho. */
const PAGE_SIZE = 10

const ROW_HEIGHT = 52
const HEADER_HEIGHT = 56
const FOOTER_HEIGHT = 56

/**
 * Altura fixa de exatamente uma página cheia. Assim o grid ocupa o mesmo
 * espaço durante o loading e com os dados, e a tela não pula quando eles chegam.
 */
const GRID_HEIGHT = HEADER_HEIGHT + ROW_HEIGHT * PAGE_SIZE + FOOTER_HEIGHT

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/**
 * "2026-09-22" -> "22/09/2026". Formatado a partir do texto, sem passar por
 * `new Date`, que interpretaria a data em UTC e poderia voltar um dia.
 */
function formatDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

const columns: GridColDef<Atendimento>[] = [
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

/**
 * Grid de atendimentos, 10 por página. A paginação é feita no backend: cada
 * troca de página dispara um novo GET /atendimentos.
 *
 * Loading: skeleton no lugar das linhas, tanto na primeira carga quanto na
 * troca de página, busca ou ordenação.
 */
function OrdersGrid() {
  const busca = useAtomValue(ordersSearchAtom)

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  })

  /**
   * Busca nova volta para a primeira página: a página 3 do filtro anterior
   * pode nem existir no resultado novo. Ajuste feito durante o render (padrão
   * do React para derivar estado de uma mudança), sem useEffect.
   */
  const [lastBusca, setLastBusca] = useState(busca)
  if (busca !== lastBusca) {
    setLastBusca(busca)
    setPaginationModel((current) => ({ ...current, page: 0 }))
  }

  /** Ordenação feita no backend. Vazio = ordem padrão do banco. */
  const [sortModel, setSortModel] = useState<GridSortModel>([])

  /** Ordem nova também volta para a primeira página, como a busca. */
  function handleSortModelChange(model: GridSortModel) {
    setSortModel(model)
    setPaginationModel((current) => ({ ...current, page: 0 }))
  }

  // O DataGrid gratuito ordena por uma coluna por vez, então só o primeiro item conta.
  const [sortItem] = sortModel
  const sort = sortItem?.sort ? `${sortItem.field},${sortItem.sort}` : undefined

  const query = useQuery({
    queryKey: ['atendimentos', busca, sort, paginationModel],
    queryFn: ({ signal }) =>
      listarAtendimentos(
        {
          // Sem busca/ordem o parâmetro nem vai na URL: o axios descarta `undefined`.
          busca: busca || undefined,
          page: paginationModel.page,
          size: paginationModel.pageSize,
          sort,
        },
        signal,
      ),
    // Mantém a página atual na tela enquanto a próxima carrega, sem piscar vazio.
    placeholderData: keepPreviousData,
    // Atendimentos mudam o tempo todo: toda troca de filtro, ordem ou página vai
    // ao backend. O cache ainda serve para mostrar algo na hora enquanto chega.
    staleTime: 0,
  })

  const errorMessage =
    query.error instanceof ApiError
      ? query.error.message
      : query.error
        ? 'Não foi possível carregar os atendimentos. Tente novamente.'
        : null

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <Alert severity="error" role="alert">
          {errorMessage}
        </Alert>
      )}

      <DataGrid
        rows={query.data?.content ?? []}
        columns={columns}
        rowCount={query.data?.totalElements ?? 0}
        loading={query.isFetching}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[PAGE_SIZE]}
        rowHeight={ROW_HEIGHT}
        columnHeaderHeight={HEADER_HEIGHT}
        slotProps={{
          loadingOverlay: { variant: 'skeleton', noRowsVariant: 'skeleton' },
        }}
        disableRowSelectionOnClick
        disableColumnMenu
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          height: GRID_HEIGHT,
          bgcolor: 'background.paper',
          // Com uma única opção de tamanho, o seletor "Linhas por página" não tem o que escolher.
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': { display: 'none' },
        }}
      />
    </div>
  )
}

export default OrdersGrid
