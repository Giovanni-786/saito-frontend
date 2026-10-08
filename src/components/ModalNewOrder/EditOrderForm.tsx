import { useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { serviceGet } from '../../services/atendimentos'
import NewOrderForm from './NewOrderForm'

type EditOrderFormProps = {
  orderId: number
  onClose: () => void
}

/**
 * Carrega o atendimento (GET /atendimentos/{id}) e só então monta o formulário,
 * que usa os dados como valor inicial dos campos.
 */
function EditOrderForm({ orderId, onClose }: EditOrderFormProps) {
  const query = useQuery({
    queryKey: ['atendimentos', 'detail', orderId],
    queryFn: ({ signal }) => serviceGet(orderId, signal),
    // Sem cache entre aberturas: o form lê os dados só ao montar, então um valor
    // antigo em cache ficaria na tela mesmo depois do refetch trazer o atual.
    gcTime: 0,
  })

  if (query.isPending) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        role="status"
        aria-label="Carregando atendimento"
      >
        <CircularProgress />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="p-5 sm:p-6">
        <Alert
          severity="error"
          role="alert"
          action={
            <Button color="inherit" size="small" onClick={() => void query.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar o atendimento.
        </Alert>
      </div>
    )
  }

  return <NewOrderForm order={query.data} onClose={onClose} />
}

export default EditOrderForm
