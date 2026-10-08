import type { MouseEvent } from 'react'
import { useSetAtom } from 'jotai'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { Atendimento } from '../../services/atendimentos'
import { openDeleteOrderDialogAtom } from '../../store'

type DeleteOrderButtonProps = {
  order: Atendimento
}

/** Lixeira da linha: só abre a confirmação, quem exclui é a DeleteOrderDialog. */
function DeleteOrderButton({ order }: DeleteOrderButtonProps) {
  const openDelete = useSetAtom(openDeleteOrderDialogAtom)

  function handleClick(event: MouseEvent) {
    // Sem isso o clique sobe para a linha e abre a edição junto.
    event.stopPropagation()
    openDelete(order)
  }

  return (
    <Tooltip title="Excluir">
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="Excluir atendimento"
        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.light' } }}
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

export default DeleteOrderButton
