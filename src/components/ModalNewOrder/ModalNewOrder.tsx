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
import { closeOrderModalAtom, orderModalAtom } from '../../store'
import EditOrderForm from './EditOrderForm'
import NewOrderForm from './NewOrderForm'

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
 * Modal fullscreen de atendimento: cadastro ou edição, conforme o `orderId`.
 *
 * Não recebe props: lê o estado do `orderModalAtom`. O Header abre para cadastro
 * (`openNewOrderModalAtom`) e o grid abre para edição (`openEditOrderModalAtom`).
 */
function ModalNewOrder() {
  const { open, orderId } = useAtomValue(orderModalAtom)
  const close = useSetAtom(closeOrderModalAtom)

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={close}
      slots={{ transition: SlideUpTransition }}
      aria-labelledby="modal-new-order-title"
    >
      <AppBar sx={{ position: 'relative' }} className="bg-deep-blue!">
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
            {orderId === null ? 'Novo atendimento' : 'Editar atendimento'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Coluna flex + my-auto no form: centraliza quando cabe e rola quando não cabe. */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-surface-muted px-4 py-8 sm:px-6">
        {orderId === null ? (
          <NewOrderForm onClose={close} />
        ) : (
          // key: trocar de atendimento remonta o form com os dados do novo.
          <EditOrderForm key={orderId} orderId={orderId} onClose={close} />
        )}
      </div>
    </Dialog>
  )
}

export default ModalNewOrder
