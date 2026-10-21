import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { serviceCreate, serviceDeleteAttachment, serviceUpdate } from '../../services/orders'
import type { Order } from '../../services/orders'
import DetailsTab from './DetailsTab'
import type { OrderFormTab } from './newOrderValues'
import {
  initOrderFormAtom,
  orderFormSessionAtom,
  orderFormTabAtom,
  submitOrderFormAtom,
  tabHasErrorsAtoms,
} from './orderFormAtoms'
import type { OrderFormSubmission } from './orderFormAtoms'
import ServicesTab from './ServicesTab'

type NewOrderFormProps = {
  /** Atendimento a editar. Sem ele, o formulário cadastra um novo. */
  order?: Order
  /** Chamado ao cancelar e depois de salvar com sucesso. */
  onClose: () => void
}

const TABS: { value: OrderFormTab; label: string }[] = [
  { value: 'details', label: 'Cliente e veículo' },
  { value: 'services', label: 'Serviços' },
]

/** Rótulo da aba com um ponto vermelho quando ela tem campo inválido. */
function TabLabel({ tab, label }: { tab: OrderFormTab; label: string }) {
  const hasErrors = useAtomValue(tabHasErrorsAtoms[tab])
  return (
    <span className="flex items-center gap-1.5">
      {label}
      {hasErrors && (
        <>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-danger" />
          <span className="sr-only">(com erros)</span>
        </>
      )}
    </span>
  )
}

/**
 * Formulário de atendimento em abas: cadastra (POST /atendimentos) ou, recebendo
 * `order`, edita (PUT /atendimentos/{id}) com os campos já preenchidos.
 *
 * Os valores vivem nos atoms da feature (orderFormAtoms), preenchidos ao montar.
 * Este componente só cuida das abas e de salvar; cada aba lê e escreve o seu pedaço.
 */
function NewOrderForm({ order, onClose }: NewOrderFormProps) {
  const isEdit = order !== undefined

  const initForm = useSetAtom(initOrderFormAtom)
  const submitForm = useSetAtom(submitOrderFormAtom)
  const [tab, setTab] = useAtom(orderFormTabAtom)

  /** Os atoms guardam o form anterior até o init rodar: as abas só montam depois dele. */
  const [session] = useState(() => ({}))
  const ready = useAtomValue(orderFormSessionAtom) === session
  useEffect(() => {
    initForm({ session, source: order ?? null })
  }, [initForm, session, order])

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ body, removedAttachments }: OrderFormSubmission) => {
      if (!order) return serviceCreate(body)

      // Serviço que perdeu todos os anexos já vai com `apagarAnexos` no PUT; os que
      // perderam só alguns têm os removidos excluídos um a um, depois de salvar.
      const saved = await serviceUpdate(order.id, body)
      await Promise.all(
        removedAttachments.map(({ serviceId, attachmentId }) =>
          serviceDeleteAttachment(serviceId, attachmentId),
        ),
      )
      return saved
    },
    onSuccess: () => {
      // A listagem (e o detalhe, na edição) mudou: refaz tudo que está em cache.
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success(
        isEdit ? 'Atendimento atualizado com sucesso.' : 'Atendimento criado com sucesso.',
      )
      onClose()
    },
    // O form continua aberto e preenchido: basta corrigir ou tentar de novo.
    onError: () => {
      toast.error(
        isEdit
          ? 'Erro inesperado ao atualizar o atendimento, tente novamente.'
          : 'Erro inesperado ao criar um atendimento, tente novamente.',
      )
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Inválido: o atom já levou o usuário para a primeira aba com erro.
    const submission = submitForm()
    if (submission) mutation.mutate(submission)
  }

  const disabled = mutation.isPending

  return (
    // noValidate: quem valida e escreve as mensagens é o app, não o navegador.
    // Corpo rola e o rodapé com as ações fica fixo embaixo do painel.
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <Tabs
        value={tab}
        onChange={(_event, value: OrderFormTab) => setTab(value)}
        variant="fullWidth"
        aria-label="Seções do atendimento"
        sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        {TABS.map(({ value, label }) => (
          <Tab
            key={value}
            value={value}
            label={<TabLabel tab={value} label={label} />}
            id={`order-tab-${value}`}
            aria-controls="order-tabpanel"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>

      <div
        id="order-tabpanel"
        role="tabpanel"
        aria-labelledby={`order-tab-${tab}`}
        className="flex-1 overflow-y-auto px-5 py-6 sm:px-6"
      >
        {ready && tab === 'details' && <DetailsTab disabled={disabled} />}
        {ready && tab === 'services' && <ServicesTab disabled={disabled} />}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-line bg-surface-subtle px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="outlined" size="large" onClick={onClose} disabled={disabled}>
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={disabled}
          startIcon={disabled ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {disabled ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar atendimento'}
        </Button>
      </div>
    </form>
  )
}

export default NewOrderForm
