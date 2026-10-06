import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { serviceCreate, serviceUpdate } from '../../services/atendimentos'
import type { Atendimento, NovoAtendimento } from '../../services/atendimentos'
import { maskCurrency, maskInteger, maskPhone, normalizePlate, onlyDigits } from '../../utils/masks'
import { fromAtendimento, initialValues, toPayload, validate } from './newOrderValues'
import type { NewOrderFormValues } from './newOrderValues'

type NewOrderFormProps = {
  /** Atendimento a editar. Sem ele, o formulário cadastra um novo. */
  order?: Atendimento
  /** Chamado ao cancelar e depois de salvar com sucesso. */
  onClose: () => void
}

/**
 * Formulário de atendimento: cadastra (POST /atendimentos) ou, recebendo
 * `order`, edita (PUT /atendimentos/{id}) com os campos já preenchidos.
 *
 * O estado vive aqui dentro: o Dialog desmonta o conteúdo ao fechar, então
 * cada abertura começa com o formulário limpo, sem reset manual.
 */
function NewOrderForm({ order, onClose }: NewOrderFormProps) {
  const isEdit = order !== undefined

  const [values, setValues] = useState(() => (order ? fromAtendimento(order) : initialValues()))

  /** Erros só aparecem depois da primeira tentativa de salvar, não enquanto digita. */
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validate(values) : {}

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: NovoAtendimento) =>
      order ? serviceUpdate(order.id, body) : serviceCreate(body),
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
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto my-auto w-full max-w-3xl rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8"
    >
      <p className="mb-6 text-sm text-content-muted">
        Preencha os dados do atendimento. Campos com * são obrigatórios.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6">
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
          className="md:col-span-2"
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
          className="md:col-span-4"
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
          className="md:col-span-2"
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
          className="md:col-span-2"
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
          className="md:col-span-2"
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
          className="md:col-span-3"
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
          className="md:col-span-3"
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
          className="sm:col-span-2 md:col-span-6"
        />

        <TextField
          label="Observação"
          value={values.observacao}
          onChange={(event) => setField('observacao', event.target.value)}
          multiline
          minRows={2}
          disabled={disabled}
          className="sm:col-span-2 md:col-span-6"
        />
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outlined"
          size="large"
          onClick={onClose}
          disabled={disabled}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={disabled}
          startIcon={disabled ? <CircularProgress size={18} color="inherit" /> : undefined}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {disabled ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Salvar atendimento'}
        </Button>
      </div>
    </form>
  )
}

export default NewOrderForm
