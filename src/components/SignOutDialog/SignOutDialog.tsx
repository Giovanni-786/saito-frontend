import { useAtomValue, useSetAtom } from 'jotai'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { closeSignOutDialogAtom, signOutAtom, signOutDialogAtom } from '../../store'

/**
 * Confirmação antes de encerrar a sessão, no mesmo formato da de exclusão.
 *
 * Não recebe props: lê o `signOutDialogAtom`, que o botão "Sair" do Header abre.
 * Sair não chama a API (só limpa o token), então não há estado de carregamento.
 */
function SignOutDialog() {
  const open = useAtomValue(signOutDialogAtom)
  const close = useSetAtom(closeSignOutDialogAtom)
  const signOut = useSetAtom(signOutAtom)

  function handleConfirm() {
    // Fecha antes: sem token o RequireAuth manda para o /login e desmonta o Layout,
    // e na próxima sessão a modal não pode reaparecer aberta.
    close()
    signOut()
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="xs"
      fullWidth
      aria-labelledby="sign-out-title"
      aria-describedby="sign-out-description"
    >
      <DialogContent className="flex flex-col items-center pt-8! text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-light-blue">
          <LogoutRoundedIcon className="text-saito-blue" sx={{ fontSize: 34 }} />
        </div>

        <DialogTitle id="sign-out-title" className="p-0! text-deep-blue" sx={{ fontWeight: 600 }}>
          Sair do sistema?
        </DialogTitle>

        <DialogContentText id="sign-out-description" sx={{ mt: 1 }}>
          Sua sessão será encerrada e será preciso entrar de novo para acessar os atendimentos.
        </DialogContentText>
      </DialogContent>

      <DialogActions className="flex-col-reverse gap-3 px-6! pb-6! sm:flex-row">
        <Button
          variant="outlined"
          onClick={close}
          fullWidth
          sx={{ textTransform: 'none', fontWeight: 600, m: '0 !important' }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleConfirm}
          fullWidth
          sx={{ textTransform: 'none', fontWeight: 600, m: '0 !important' }}
        >
          Sair
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SignOutDialog
