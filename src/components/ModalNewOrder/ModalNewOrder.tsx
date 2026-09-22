import type { ReactElement, Ref } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Slide from '@mui/material/Slide'
import CloseIcon from '@mui/icons-material/Close'
import type { TransitionProps } from '@mui/material/transitions'
import { closeNewOrderModalAtom, newOrderModalAtom } from '../../store'

type TransitionSlotProps = TransitionProps & {
  children: ReactElement<unknown>
  ref?: Ref<unknown>
}

/**
 * Entrada deslizando de baixo para cima.
 * No React 19 a `ref` chega como prop comum, então não precisa do `forwardRef`
 * que aparece no exemplo da documentação do MUI.
 */
function SlideUpTransition(props: TransitionSlotProps) {
  return <Slide direction="up" {...props} />
}

/**
 * Modal fullscreen de novo atendimento.
 *
 * Não recebe props: lê o estado de abertura do `newOrderModalAtom`. Quem abre é
 * o Header; qualquer outro ponto do app pode abrir com `openNewOrderModalAtom`.
 */
function ModalNewOrder() {
  const open = useAtomValue(newOrderModalAtom)
  const close = useSetAtom(closeNewOrderModalAtom)

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={close}
      slots={{ transition: SlideUpTransition }}
      aria-labelledby="modal-new-order-title"
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={close} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
          <Typography
            id="modal-new-order-title"
            sx={{ ml: 2, flex: 1 }}
            variant="h6"
            component="h2"
          >
            Novo atendimento
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Corpo ainda vazio — o formulário do atendimento entra aqui. */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6"></div>
    </Dialog>
  )
}

export default ModalNewOrder
