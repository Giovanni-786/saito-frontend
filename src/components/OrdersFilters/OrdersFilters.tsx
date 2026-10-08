import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import SearchIcon from '@mui/icons-material/Search'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { applyOrdersSearchAtom, clearOrdersSearchAtom, ordersSearchAtom } from '../../store'

/** Espera depois da última tecla antes de buscar. */
const SEARCH_DEBOUNCE_MS = 400

/**
 * Busca da listagem de atendimentos.
 *
 * O backend tem um único filtro, `busca`, que procura o texto em cliente,
 * veículo, placa, telefone, serviços/peças e observação ao mesmo tempo.
 *
 * A busca é aplicada quando a pessoa para de digitar (debounce), não a cada
 * tecla, para não sair uma requisição por letra. Enter busca na hora.
 */
function OrdersFilters() {
  const appliedSearch = useAtomValue(ordersSearchAtom)
  const applySearch = useSetAtom(applyOrdersSearchAtom)
  const clearSearch = useSetAtom(clearOrdersSearchAtom)
  const queryClient = useQueryClient()

  const [search, setSearch] = useState(appliedSearch)

  /**
   * A busca também pode ser limpa de fora (botão do estado vazio). Nesse caso o
   * campo acompanha; quando a mudança veio do próprio debounce, os textos já batem.
   */
  const [lastApplied, setLastApplied] = useState(appliedSearch)
  if (appliedSearch !== lastApplied) {
    setLastApplied(appliedSearch)
    if (appliedSearch !== search.trim()) setSearch(appliedSearch)
  }

  /** A listagem está buscando? Mostra o spinner dentro do campo. */
  const isFetching = useIsFetching({ queryKey: ['atendimentos'] }) > 0

  useEffect(() => {
    const timer = setTimeout(() => applySearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search, applySearch])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Mesmo texto de antes não muda a query, então nada seria buscado. Aqui
    // Enter força a ida ao backend para trazer dados atualizados.
    if (search.trim() === appliedSearch) {
      void queryClient.invalidateQueries({ queryKey: ['atendimentos'] })
      return
    }

    applySearch(search)
  }

  function handleClear() {
    setSearch('')
    clearSearch()
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full sm:max-w-105">
      <TextField
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por cliente, veículo, placa ou serviço"
        fullWidth
        slotProps={{
          htmlInput: {
            'aria-label': 'Buscar atendimentos',
            type: 'search',
            enterKeyHint: 'search',
          },
          input: {
            sx: {
              height: 44,
              // Esconde o "x" nativo do input search: o nosso já faz isso.
              '& input::-webkit-search-cancel-button': { display: 'none' },
            },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (isFetching || search) && (
              <InputAdornment position="end" sx={{ gap: 0.5 }}>
                {isFetching && (
                  <CircularProgress
                    size={16}
                    aria-label="Buscando"
                    sx={{ color: 'text.secondary' }}
                  />
                )}
                {search && (
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={handleClear}
                    aria-label="Limpar busca"
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          },
        }}
      />
    </form>
  )
}

export default OrdersFilters
