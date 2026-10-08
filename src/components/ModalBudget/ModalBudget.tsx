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
import { budgetModalAtom, closeBudgetModalAtom } from '../../store'
import BudgetForm from './BudgetForm'

type TransitionSlotProps = TransitionProps & {
  children: ReactElement<unknown>
  ref?: Ref<unknown>
}

/** Entrada deslizando de baixo para cima, igual às outras modais. */
function SlideUpTransition(props: TransitionSlotProps) {
  return <Slide direction="up" {...props} />
}

/**
 * Modal fullscreen de orçamento. Não recebe props: lê o estado do
 * `budgetModalAtom`. Quem abre é a Sidebar (`openBudgetModalAtom`).
 */
function ModalBudget() {
  const open = useAtomValue(budgetModalAtom)
  const close = useSetAtom(closeBudgetModalAtom)

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={close}
      slots={{ transition: SlideUpTransition }}
      aria-labelledby="modal-budget-title"
    >
      <AppBar sx={{ position: 'relative' }} className="bg-deep-blue!">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={close} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
          <Typography id="modal-budget-title" sx={{ ml: 2, flex: 1 }} variant="h6" component="h2">
            Orçamento
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Coluna flex + my-auto no form: centraliza quando cabe e rola quando não cabe. */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-surface-muted px-4 py-8 sm:px-6">
        <BudgetForm onClose={close} />
      </div>
    </Dialog>
  )
}

export default ModalBudget
