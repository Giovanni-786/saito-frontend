import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import { lighten } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { applyOrdersSearchAtom, clearOrdersSearchAtom, ordersSearchAtom } from '../../store'

/**
 * Filtros da listagem de atendimentos.
 *
 * O backend tem um único filtro, `busca`, que procura o texto em cliente,
 * veículo, placa, telefone, serviços/peças e observação ao mesmo tempo.
 *
 * A busca só é aplicada ao enviar (Enter ou botão), não a cada tecla — assim
 * não sai uma requisição por letra digitada.
 */
function OrdersFilters() {
  const appliedSearch = useAtomValue(ordersSearchAtom)
  const applySearch = useSetAtom(applyOrdersSearchAtom)
  const clearSearch = useSetAtom(clearOrdersSearchAtom)
  const queryClient = useQueryClient()

  const [search, setSearch] = useState(appliedSearch)

  /** A listagem está buscando? Serve para o loading do botão. */
  const isFetching = useIsFetching({ queryKey: ['atendimentos'] }) > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Mesmo texto de antes não muda a query, então nada seria buscado. Aqui
    // "Buscar" força a ida ao backend para trazer dados atualizados.
    if (search.trim() === appliedSearch) {
      queryClient.invalidateQueries({ queryKey: ['atendimentos'] })
      return
    }

    applySearch(search)
  }

  function handleClear() {
    setSearch('')
    clearSearch()
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
    >
      <TextField
        label="Buscar"
        placeholder="Cliente, veículo, placa, telefone..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        size="small"
        sx={{ minWidth: { sm: 320 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <div className="flex gap-2">
        {/* `loading` do MUI desabilita o botão e troca o ícone pelo spinner
            enquanto a API responde — sem clique duplo disparando outra busca. */}
        <Button
          type="submit"
          variant="contained"
          loading={isFetching}
          loadingPosition="start"
          startIcon={<SearchIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            // Mesma cor do Header (deep-blue); o hover só clareia um pouco.
            bgcolor: 'primary.dark',
            '&:hover': { bgcolor: (theme) => lighten(theme.palette.primary.dark, 0.08) },
            // Carregando, o MUI desabilita o botão e o pinta de cinza. Como a API
            // responde rápido, isso virava uma piscada azul-cinza-azul. Mantendo as
            // cores, só o ícone troca pelo spinner.
            '&.Mui-disabled': { bgcolor: 'primary.dark', color: 'common.white' },
          }}
        >
          Buscar
        </Button>

        {/* Sem filtro aplicado não há o que limpar, então fica desabilitado. */}
        <Button
          type="button"
          variant="outlined"
          onClick={handleClear}
          disabled={!appliedSearch}
          startIcon={<ClearIcon />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Limpar
        </Button>
      </div>
    </form>
  )
}

export default OrdersFilters
