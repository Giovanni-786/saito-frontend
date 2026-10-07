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
import { reportModalAtom, closeReportModalAtom } from '../../store'
import ReportForm from './ReportForm'

type TransitionSlotProps = TransitionProps & {
  children: ReactElement<unknown>
  ref?: Ref<unknown>
}

/** Entrada deslizando de baixo para cima, igual à modal de atendimento. */
function SlideUpTransition(props: TransitionSlotProps) {
  return <Slide direction="up" {...props} />
}

/**
 * Modal fullscreen de laudo. Não recebe props: lê o estado do
 * `reportModalAtom`. Quem abre é o Header (`openReportModalAtom`).
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
      aria-labelledby="modal-report-title"
    >
      <AppBar sx={{ position: 'relative' }} className="bg-deep-blue!">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={close} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
          <Typography id="modal-report-title" sx={{ ml: 2, flex: 1 }} variant="h6" component="h2">
            Laudo
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Coluna flex + my-auto no form: centraliza quando cabe e rola quando não cabe. */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-surface-muted px-4 py-8 sm:px-6">
        <ReportForm onClose={close} />
      </div>
    </Dialog>
  )
}

export default ModalReport
