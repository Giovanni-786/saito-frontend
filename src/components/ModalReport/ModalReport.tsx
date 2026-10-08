import type { ReactElement, Ref } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { TransitionProps } from '@mui/material/transitions'
import { reportModalAtom, closeReportModalAtom } from '../../store'
import ReportForm from './ReportForm'

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
 * Modal fullscreen de laudo: barra branca no topo, formulário com
 * pré-visualização ao lado e ações num rodapé fixo (ReportForm).
 *
 * Não recebe props: lê o estado do `reportModalAtom`. Quem abre é a Sidebar
 * (`openReportModalAtom`).
 */
function ModalReport() {
  const open = useAtomValue(reportModalAtom)
  const close = useSetAtom(closeReportModalAtom)

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={close}
      slots={{ transition: SlideUpTransition }}
      slotProps={{ paper: { sx: { borderRadius: 0 } } }}
      aria-labelledby="modal-report-title"
    >
      <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-3 sm:px-6 lg:px-8">
        <IconButton onClick={close} aria-label="Fechar" sx={{ color: 'text.secondary' }}>
          <CloseRoundedIcon />
        </IconButton>
        <div className="flex min-w-0 flex-col leading-tight">
          <h2 id="modal-report-title" className="text-[17px] font-semibold tracking-tight">
            Novo laudo
          </h2>
          <p className="truncate text-[13px] text-content-muted">
            Preencha os dados e confira a pré-visualização antes de gerar o PDF.
          </p>
        </div>
      </header>

      <ReportForm onClose={close} />
    </Dialog>
  )
}

export default ModalReport
