import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import { DataGrid } from '@mui/x-data-grid'
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { serviceList } from '../../services/atendimentos'
import { openEditOrderModalAtom, ordersSearchAtom } from '../../store'
import { ApiError } from '../../utils/api'
import { columns } from './columns'
import { GRID_HEIGHT, HEADER_HEIGHT, PAGE_SIZE, ROW_HEIGHT } from './constants'

/**
 * Grid de atendimentos, 10 por página. A paginação é feita no backend: cada
 * troca de página dispara um novo GET /atendimentos.
 *
 * Loading: skeleton no lugar das linhas, tanto na primeira carga quanto na
 * troca de página, busca ou ordenação.
 */
function OrdersGrid() {
  const busca = useAtomValue(ordersSearchAtom)
  const openEdit = useSetAtom(openEditOrderModalAtom)

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
      serviceList(
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
        onRowClick={({ row }) => openEdit(row.id)}
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnResize
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          height: GRID_HEIGHT,
          bgcolor: 'background.paper',
          // Com uma única opção de tamanho, o seletor "Linhas por página" não tem o que escolher.
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': { display: 'none' },
          // A linha inteira abre a edição.
          '& .MuiDataGrid-row': { cursor: 'pointer' },
        }}
      />
    </div>
  )
}

export default OrdersGrid
