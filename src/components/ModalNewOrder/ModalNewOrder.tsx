import { useAtomValue, useSetAtom } from 'jotai'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { closeOrderModalAtom, orderModalAtom } from '../../store'
import EditOrderForm from './EditOrderForm'
import NewOrderForm from './NewOrderForm'

/** Largura do painel no desktop. No mobile ele ocupa a tela inteira. */
const DRAWER_WIDTH = 560

/**
 * Painel lateral de atendimento: cadastro ou edição, conforme o `orderId`.
 * Abre pela direita sobre a listagem, que continua à vista ao fundo.
 *
 * Não recebe props: lê o estado do `orderModalAtom`. O cabeçalho da página abre
 * para cadastro (`openNewOrderModalAtom`) e o grid abre para edição
 * (`openEditOrderModalAtom`).
 */
function ModalNewOrder() {
  const { open, orderId } = useAtomValue(orderModalAtom)
  const close = useSetAtom(closeOrderModalAtom)

  const isEdit = orderId !== null

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={close}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'modal-new-order-title',
          sx: {
            width: { xs: '100%', sm: DRAWER_WIDTH },
            boxShadow: '-12px 0 40px rgba(15, 42, 84, 0.18)',
          },
        },
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
          <div className="flex flex-col gap-1">
            <h2 id="modal-new-order-title" className="text-xl font-semibold tracking-tight">
              {isEdit ? 'Editar atendimento' : 'Novo atendimento'}
            </h2>
            <p className="text-sm text-content-muted">
              {isEdit
                ? `Atendimento #${orderId}. Altere os campos e salve.`
                : 'Preencha os dados do serviço realizado.'}
            </p>
          </div>
          <IconButton onClick={close} aria-label="Fechar" sx={{ color: 'text.secondary', mr: -1 }}>
            <CloseRoundedIcon />
          </IconButton>
        </div>

        {isEdit ? (
          // key: trocar de atendimento remonta o form com os dados do novo.
          <EditOrderForm key={orderId} orderId={orderId} onClose={close} />
        ) : (
          <NewOrderForm onClose={close} />
        )}
      </div>
    </Drawer>
  )
}

export default ModalNewOrder
