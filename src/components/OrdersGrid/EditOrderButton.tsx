import type { MouseEvent } from 'react'
import { useSetAtom } from 'jotai'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { openEditOrderModalAtom } from '../../store'

type EditOrderButtonProps = {
  orderId: number
}

/**
 * Ícone de edição da linha. Faz o mesmo que clicar na linha, mas é alcançável
 * pelo teclado e deixa a ação visível para quem não sabe que a linha é clicável.
 */
function EditOrderButton({ orderId }: EditOrderButtonProps) {
  const openEdit = useSetAtom(openEditOrderModalAtom)

  function handleClick(event: MouseEvent) {
    // Sem isso o clique sobe para a linha e abre a modal de novo.
    event.stopPropagation()
    openEdit(orderId)
  }

  return (
    <Tooltip title="Editar">
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="Editar atendimento"
        sx={{
          color: 'text.secondary',
          '&:hover': { color: 'primary.main', bgcolor: 'primary.light' },
        }}
      >
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

export default EditOrderButton
