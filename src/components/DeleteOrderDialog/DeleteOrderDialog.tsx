import { useAtomValue, useSetAtom } from 'jotai'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { serviceDelete } from '../../services/atendimentos'
import { closeDeleteOrderDialogAtom, deleteOrderDialogAtom } from '../../store'

/**
 * Confirmação de exclusão de atendimento (DELETE /atendimentos/{id}).
 *
 * Não recebe props: lê o `deleteOrderDialogAtom`, que o botão de lixeira do grid abre.
 */
function DeleteOrderDialog() {
  const { open, order } = useAtomValue(deleteOrderDialogAtom)
  const close = useSetAtom(closeDeleteOrderDialogAtom)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: serviceDelete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['atendimentos'] })
      toast.success('Atendimento excluído com sucesso.')
      close()
    },
    // A modal continua aberta: o usuário decide se tenta de novo ou cancela.
    onError: () => {
      toast.error('Erro inesperado ao excluir o atendimento, tente novamente.')
    },
  })

  const pending = mutation.isPending

  function handleClose() {
    // Fechar no meio da exclusão esconderia o resultado; espera a resposta.
    if (!pending) close()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      // Limpa o erro/estado da tentativa anterior só depois da animação de saída.
      slotProps={{ transition: { onExited: () => mutation.reset() } }}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-order-title"
      aria-describedby="delete-order-description"
    >
      <DialogContent className="flex flex-col items-center pt-8! text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-danger-light">
          <WarningAmberRoundedIcon className="text-danger" sx={{ fontSize: 36 }} />
        </div>

        <DialogTitle id="delete-order-title" className="p-0! text-content" sx={{ fontWeight: 600 }}>
          Excluir atendimento?
        </DialogTitle>

        <DialogContentText id="delete-order-description" sx={{ mt: 1 }}>
          {order && (
            <>
              O atendimento de <strong>{order.cliente}</strong> ({order.placa}) será excluído.{' '}
            </>
          )}
          Tem certeza? Essa ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>

      <DialogActions className="flex-col-reverse gap-3 px-6! pb-6! sm:flex-row">
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={pending}
          fullWidth
          sx={{ m: '0 !important' }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={() => order && mutation.mutate(order.id)}
          disabled={pending || !order}
          fullWidth
          startIcon={pending ? <CircularProgress size={18} color="inherit" /> : undefined}
          sx={{ m: '0 !important' }}
        >
          {pending ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteOrderDialog
