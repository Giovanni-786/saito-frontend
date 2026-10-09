import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import { DataGrid } from '@mui/x-data-grid'
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { serviceList } from '../../services/orders'
import { openEditOrderModalAtom, ordersSearchAtom } from '../../store'
import { ApiError } from '../../utils/api'
import OrdersFilters from '../OrdersFilters/OrdersFilters'
import { columns } from './columns'
import { GRID_HEIGHT, HEADER_HEIGHT, PAGE_SIZE, ROW_HEIGHT } from './constants'
import OrdersCardList from './OrdersCardList'
import OrdersEmptyState from './OrdersEmptyState'

/** Borda entre linhas: mais clara que a do card, para separar sem pesar. */
const ROW_BORDER = '#eef1f5'

/**
 * Listagem de atendimentos dentro de um card, com a busca no topo.
 * 10 por página, com paginação e ordenação feitas no backend: cada troca
 * dispara um novo GET /atendimentos.
 *
 * Desktop (md+): DataGrid. Mobile: lista de cards (OrdersCardList), com a
 * mesma query e paginação.
 *
 * Loading: skeleton no lugar das linhas, tanto na primeira carga quanto na
 * troca de página, busca ou ordenação.
 */
function OrdersGrid() {
  const search = useAtomValue(ordersSearchAtom)
  const openEdit = useSetAtom(openEditOrderModalAtom)
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'), { noSsr: true })

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  })

  /**
   * Busca nova volta para a primeira página: a página 3 do filtro anterior
   * pode nem existir no resultado novo. Ajuste feito durante o render (padrão
   * do React para derivar estado de uma mudança), sem useEffect.
   */
  const [lastSearch, setLastSearch] = useState(search)
  if (search !== lastSearch) {
    setLastSearch(search)
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
    queryKey: ['orders', search, sort, paginationModel],
    queryFn: ({ signal }) =>
      serviceList(
        {
          // Sem busca/ordem o parâmetro nem vai na URL: o axios descarta `undefined`.
          busca: search || undefined,
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

  const total = query.data?.totalElements
  const countLabel =
    total === undefined
      ? null
      : search
        ? `${total} ${total === 1 ? 'resultado' : 'resultados'}`
        : `${total} ${total === 1 ? 'atendimento' : 'atendimentos'}`

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <Alert severity="error" role="alert">
          {errorMessage}
        </Alert>
      )}

      <section
        aria-label="Lista de atendimentos"
        className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(20,23,26,0.04)]"
      >
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <OrdersFilters />
          {countLabel && (
            <span className="text-[13px] text-content-muted tabular-nums" aria-live="polite">
              {countLabel}
            </span>
          )}
        </div>

        {isMobile ? (
          <div className="border-t border-line">
            <OrdersCardList
              rows={query.data?.content ?? []}
              loading={query.isPending}
              page={paginationModel.page}
              totalPages={query.data?.totalPages ?? 0}
              onPageChange={(page) => setPaginationModel((current) => ({ ...current, page }))}
            />
          </div>
        ) : (
          <DataGrid
            rows={query.data?.content ?? []}
            columns={columns}
            rowCount={total ?? 0}
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
            slots={{ noRowsOverlay: OrdersEmptyState, noResultsOverlay: OrdersEmptyState }}
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
              border: 0,
              borderRadius: 0,
              bgcolor: 'background.paper',
              fontSize: 14,
              // Cabeçalho discreto: não compete com os dados.
              '& .MuiDataGrid-columnHeader, & .MuiDataGrid-filler, & .MuiDataGrid-scrollbarFiller':
                { bgcolor: '#fafbfc' },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: 12,
                fontWeight: 500,
                color: 'text.secondary',
                letterSpacing: '0.02em',
              },
              '& .MuiDataGrid-columnSeparator': { display: 'none' },
              '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader': {
                borderColor: ROW_BORDER,
              },
              '& .MuiDataGrid-cell': {
                borderColor: ROW_BORDER,
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-cell--textRight': { justifyContent: 'flex-end' },
              '& .cell-muted': { color: 'text.secondary', fontVariantNumeric: 'tabular-nums' },
              '& .cell-strong': { fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
              // Clique abre a edição; o contorno de foco de célula só polui.
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
                { outline: 'none' },
              '& .MuiDataGrid-row': { cursor: 'pointer', transition: 'background-color .15s' },
              '& .MuiDataGrid-row:hover': { bgcolor: '#f7f9fd' },
              '& .MuiDataGrid-footerContainer': { borderColor: ROW_BORDER, minHeight: 52 },
              // Com uma única opção de tamanho, o seletor "Linhas por página" não tem o que escolher.
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': { display: 'none' },
              // Editar e excluir só aparecem no hover da linha (ou com foco nela).
              // Em telas de toque não há hover, então seguem sempre visíveis.
              '@media (hover: hover)': {
                '& .row-actions': { opacity: 0, transition: 'opacity .15s' },
                '& .MuiDataGrid-row:hover .row-actions, & .MuiDataGrid-row:focus-within .row-actions':
                  { opacity: 1 },
              },
            }}
          />
        )}
      </section>
    </div>
  )
}

export default OrdersGrid
