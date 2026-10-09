import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import {
  serviceCreate,
  serviceDeleteAttachment,
  serviceDownloadAttachment,
  serviceUpdate,
} from '../../services/orders'
import type { Attachment, NewOrder, Order } from '../../services/orders'
import { maskCurrency, maskInteger, maskPhone, normalizePlate, onlyDigits } from '../../utils/masks'
import { fromOrder, initialValues, toPayload, validate } from './newOrderValues'
import type { NewOrderFormValues } from './newOrderValues'
import { saveBlob } from '../../utils/download'
import AttachmentsField from './AttachmentsField'

type NewOrderFormProps = {
  /** Atendimento a editar. Sem ele, o formulário cadastra um novo. */
  order?: Order
  /** Anexos já salvos do atendimento em edição. */
  attachments?: Attachment[]
  /** Chamado ao cancelar e depois de salvar com sucesso. */
  onClose: () => void
}

/**
 * Formulário de atendimento: cadastra (POST /atendimentos) ou, recebendo
 * `order`, edita (PUT /atendimentos/{id}) com os campos já preenchidos.
 *
 * O estado vive aqui dentro: o Drawer desmonta o conteúdo ao fechar, então
 * cada abertura começa com o formulário limpo, sem reset manual.
 */
function NewOrderForm({ order, attachments = [], onClose }: NewOrderFormProps) {
  const isEdit = order !== undefined

  const [values, setValues] = useState(() => (order ? fromOrder(order) : initialValues()))
  /** Arquivos novos, ainda só no navegador. */
  const [files, setFiles] = useState<File[]>([])
  /** Anexos salvos que o usuário não removeu. */
  const [keptAttachments, setKeptAttachments] = useState(attachments)

  /** Erros só aparecem depois da primeira tentativa de salvar, não enquanto digita. */
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validate(values) : {}

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (body: NewOrder) => {
      if (!order) return serviceCreate(body, files)

      // Sem nenhum anexo salvo restante, a parte `arquivos` vai como null e o backend
      // limpa tudo de uma vez. Se sobrou algum, remove só os excluídos, um a um.
      const clearAll = keptAttachments.length === 0
      const saved = await serviceUpdate(order.id, body, files, clearAll)
      if (!clearAll) {
        const removed = attachments.filter((a) => !keptAttachments.some((m) => m.id === a.id))
        await Promise.all(removed.map((a) => serviceDeleteAttachment(order.id, a.id)))
      }
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

  async function downloadAttachment(attachment: Attachment) {
    if (!order) return
    try {
      saveBlob(await serviceDownloadAttachment(order.id, attachment.id), attachment.nome)
    } catch {
      toast.error(`Não foi possível baixar ${attachment.nome}, tente novamente.`)
    }
  }

  function setField(field: keyof NewOrderFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validate(values)).length > 0) return
    mutation.mutate(toPayload(values))
  }

  const disabled = mutation.isPending

  return (
    // noValidate: quem valida e escreve as mensagens é o app, não o navegador.
    // Corpo rola e o rodapé com as ações fica fixo embaixo do painel.
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="grid flex-1 grid-cols-1 content-start gap-4 overflow-y-auto px-5 py-6 sm:grid-cols-6 sm:px-6">
        <TextField
          label="Data"
          type="date"
          value={values.date}
          onChange={(event) => setField('date', event.target.value)}
          error={!!errors.date}
          helperText={errors.date}
          required
          disabled={disabled}
          slotProps={{ inputLabel: { shrink: true } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Cliente"
          value={values.customer}
          onChange={(event) => setField('customer', event.target.value)}
          error={!!errors.customer}
          helperText={errors.customer}
          autoComplete="off"
          autoFocus
          required
          disabled={disabled}
          className="sm:col-span-4"
        />

        <TextField
          label="Telefone"
          value={maskPhone(values.phone)}
          onChange={(event) => setField('phone', onlyDigits(event.target.value).slice(0, 11))}
          error={!!errors.phone}
          helperText={errors.phone}
          placeholder="(14) 99999-9999"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'tel' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Veículo"
          value={values.vehicle}
          onChange={(event) => setField('vehicle', event.target.value)}
          error={!!errors.vehicle}
          helperText={errors.vehicle}
          placeholder="Honda Civic"
          required
          disabled={disabled}
          className="sm:col-span-4"
        />

        <TextField
          label="Placa"
          value={values.plate}
          onChange={(event) => setField('plate', normalizePlate(event.target.value))}
          error={!!errors.plate}
          helperText={errors.plate}
          placeholder="ABC1234"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { autoCapitalize: 'characters' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="KM"
          value={maskInteger(values.mileage)}
          onChange={(event) => setField('mileage', onlyDigits(event.target.value).slice(0, 7))}
          error={!!errors.mileage}
          helperText={errors.mileage}
          placeholder="85.000"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Valor"
          value={maskCurrency(values.amount)}
          onChange={(event) =>
            // Number() tira zeros à esquerda: apagar até "R$ 0,00" esvazia o campo.
            setField('amount', String(Number(onlyDigits(event.target.value).slice(0, 10)) || ''))
          }
          error={!!errors.amount}
          helperText={errors.amount}
          placeholder="R$ 0,00"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Serviços / peças"
          value={values.servicesParts}
          onChange={(event) => setField('servicesParts', event.target.value)}
          error={!!errors.servicesParts}
          helperText={errors.servicesParts}
          placeholder="Troca de óleo e filtro"
          required
          multiline
          minRows={3}
          disabled={disabled}
          className="sm:col-span-6"
        />

        <TextField
          label="Observação"
          value={values.notes}
          onChange={(event) => setField('notes', event.target.value)}
          multiline
          minRows={2}
          disabled={disabled}
          className="sm:col-span-6"
        />

        <AttachmentsField
          existing={keptAttachments}
          files={files}
          onFilesChange={setFiles}
          onRemoveExisting={(attachmentId) =>
            setKeptAttachments((current) => current.filter((a) => a.id !== attachmentId))
          }
          onDownloadExisting={downloadAttachment}
          disabled={disabled}
        />
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
