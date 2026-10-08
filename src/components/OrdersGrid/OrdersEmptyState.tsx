import { useAtomValue, useSetAtom } from 'jotai'
import Button from '@mui/material/Button'
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import { clearOrdersSearchAtom, openNewOrderModalAtom, ordersSearchAtom } from '../../store'

/**
 * Lista vazia. Com busca aplicada, sugere limpar; sem busca, ainda não há
 * atendimentos, então convida a cadastrar o primeiro.
 */
function OrdersEmptyState() {
  const search = useAtomValue(ordersSearchAtom)
  const clearSearch = useSetAtom(clearOrdersSearchAtom)
  const openNewOrder = useSetAtom(openNewOrderModalAtom)

  const Icon = search ? SearchOffRoundedIcon : AssignmentOutlinedIcon

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 px-5 py-14 text-center">
      <div className="mb-1 flex size-13 items-center justify-center rounded-[14px] bg-light-blue text-saito-blue">
        <Icon aria-hidden="true" />
      </div>
      <span className="text-[15px] font-semibold">
        {search ? 'Nenhum atendimento encontrado' : 'Nenhum atendimento ainda'}
      </span>
      <span className="text-sm text-content-muted">
        {search
          ? 'Tente outro termo ou limpe a busca para ver todos.'
          : 'Cadastre o primeiro atendimento para ele aparecer aqui.'}
      </span>
      <Button variant="outlined" onClick={search ? clearSearch : openNewOrder} sx={{ mt: 1 }}>
        {search ? 'Limpar busca' : 'Novo atendimento'}
      </Button>
    </div>
  )
}

export default OrdersEmptyState
