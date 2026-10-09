import type { ReactElement, Ref } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
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
 * Modal fullscreen de orçamento, no mesmo formato da de laudo: barra branca no
 * topo, formulário em cards e ações num rodapé fixo (BudgetForm).
 *
 * Não recebe props: lê o estado do `budgetModalAtom`. Quem abre é a Sidebar
 * (`openBudgetModalAtom`).
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
      slotProps={{ paper: { sx: { borderRadius: 0 } } }}
      aria-labelledby="modal-budget-title"
    >
      <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-3 sm:px-6 lg:px-8">
        <IconButton onClick={close} aria-label="Fechar" sx={{ color: 'text.secondary' }}>
          <CloseRoundedIcon />
        </IconButton>
        <div className="flex min-w-0 flex-col leading-tight">
          <h2 id="modal-budget-title" className="text-[17px] font-semibold tracking-tight">
            Novo orçamento
          </h2>
          <p className="truncate text-[13px] text-content-muted">
            Preencha os dados e os itens para gerar o PDF do orçamento.
          </p>
        </div>
      </header>

      <BudgetForm onClose={close} />
    </Dialog>
  )
}

export default ModalBudget
