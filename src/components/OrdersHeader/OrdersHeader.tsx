import { useSetAtom } from 'jotai'
import Button from '@mui/material/Button'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { openNewOrderModalAtom } from '../../store'

/** Cabeçalho da tela de atendimentos: título, descrição e a ação principal. */
function OrdersHeader() {
  const openNewOrder = useSetAtom(openNewOrderModalAtom)

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Atendimentos</h1>
        <p className="text-sm text-content-muted">
          Serviços realizados na oficina. Clique em um atendimento para editar.
        </p>
      </div>

      <Button
        variant="contained"
        size="large"
        onClick={openNewOrder}
        startIcon={<AddRoundedIcon />}
        sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' } }}
      >
        Novo atendimento
      </Button>
    </header>
  )
}

export default OrdersHeader
