import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import {
  serviceCreate,
  serviceDeleteAnexo,
  serviceDownloadAnexo,
  serviceUpdate,
} from '../../services/atendimentos'
import type { Anexo, Atendimento, NovoAtendimento } from '../../services/atendimentos'
import { maskCurrency, maskInteger, maskPhone, normalizePlate, onlyDigits } from '../../utils/masks'
import { fromAtendimento, initialValues, toPayload, validate } from './newOrderValues'
import type { NewOrderFormValues } from './newOrderValues'
import { saveBlob } from '../../utils/download'
import AttachmentsField from './AttachmentsField'

type NewOrderFormProps = {
  /** Atendimento a editar. Sem ele, o formulário cadastra um novo. */
  order?: Atendimento
  /** Anexos já salvos do atendimento em edição. */
  anexos?: Anexo[]
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
function NewOrderForm({ order, anexos = [], onClose }: NewOrderFormProps) {
  const isEdit = order !== undefined

  const [values, setValues] = useState(() => (order ? fromAtendimento(order) : initialValues()))
  /** Arquivos novos, ainda só no navegador. */
  const [arquivos, setArquivos] = useState<File[]>([])
  /** Anexos salvos que o usuário não removeu. */
  const [anexosMantidos, setAnexosMantidos] = useState(anexos)

  /** Erros só aparecem depois da primeira tentativa de salvar, não enquanto digita. */
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validate(values) : {}

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (body: NovoAtendimento) => {
      if (!order) return serviceCreate(body, arquivos)

      // Sem nenhum anexo salvo restante, `arquivos` vai como null e o backend
      // limpa tudo de uma vez. Se sobrou algum, remove só os excluídos, um a um.
      const apagarTodos = anexosMantidos.length === 0
      const salvo = await serviceUpdate(order.id, body, arquivos, apagarTodos)
      if (!apagarTodos) {
        const removidos = anexos.filter((a) => !anexosMantidos.some((m) => m.id === a.id))
        await Promise.all(removidos.map((a) => serviceDeleteAnexo(order.id, a.id)))
      }
      return salvo
    },
    onSuccess: () => {
      // A listagem (e o detalhe, na edição) mudou: refaz tudo que está em cache.
      void queryClient.invalidateQueries({ queryKey: ['atendimentos'] })
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

  async function downloadAnexo(anexo: Anexo) {
    if (!order) return
    try {
      saveBlob(await serviceDownloadAnexo(order.id, anexo.id), anexo.nome)
    } catch {
      toast.error(`Não foi possível baixar ${anexo.nome}, tente novamente.`)
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
          value={values.data}
          onChange={(event) => setField('data', event.target.value)}
          error={!!errors.data}
          helperText={errors.data}
          required
          disabled={disabled}
          slotProps={{ inputLabel: { shrink: true } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Cliente"
          value={values.cliente}
          onChange={(event) => setField('cliente', event.target.value)}
          error={!!errors.cliente}
          helperText={errors.cliente}
          autoComplete="off"
          autoFocus
          required
          disabled={disabled}
          className="sm:col-span-4"
        />

        <TextField
          label="Telefone"
          value={maskPhone(values.telefone)}
          onChange={(event) => setField('telefone', onlyDigits(event.target.value).slice(0, 11))}
          error={!!errors.telefone}
          helperText={errors.telefone}
          placeholder="(14) 99999-9999"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'tel' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Veículo"
          value={values.veiculo}
          onChange={(event) => setField('veiculo', event.target.value)}
          error={!!errors.veiculo}
          helperText={errors.veiculo}
          placeholder="Honda Civic"
          required
          disabled={disabled}
          className="sm:col-span-4"
        />

        <TextField
          label="Placa"
          value={values.placa}
          onChange={(event) => setField('placa', normalizePlate(event.target.value))}
          error={!!errors.placa}
          helperText={errors.placa}
          placeholder="ABC1234"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { autoCapitalize: 'characters' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="KM"
          value={maskInteger(values.km)}
          onChange={(event) => setField('km', onlyDigits(event.target.value).slice(0, 7))}
          error={!!errors.km}
          helperText={errors.km}
          placeholder="85.000"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Valor"
          value={maskCurrency(values.valor)}
          onChange={(event) =>
            // Number() tira zeros à esquerda: apagar até "R$ 0,00" esvazia o campo.
            setField('valor', String(Number(onlyDigits(event.target.value).slice(0, 10)) || ''))
          }
          error={!!errors.valor}
          helperText={errors.valor}
          placeholder="R$ 0,00"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Serviços / peças"
          value={values.servicosPecas}
          onChange={(event) => setField('servicosPecas', event.target.value)}
          error={!!errors.servicosPecas}
          helperText={errors.servicosPecas}
          placeholder="Troca de óleo e filtro"
          required
          multiline
          minRows={3}
          disabled={disabled}
          className="sm:col-span-6"
        />

        <TextField
          label="Observação"
          value={values.observacao}
          onChange={(event) => setField('observacao', event.target.value)}
          multiline
          minRows={2}
          disabled={disabled}
          className="sm:col-span-6"
        />

        <AttachmentsField
          existing={anexosMantidos}
          files={arquivos}
          onFilesChange={setArquivos}
          onRemoveExisting={(anexoId) =>
            setAnexosMantidos((current) => current.filter((a) => a.id !== anexoId))
          }
          onDownloadExisting={downloadAnexo}
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
