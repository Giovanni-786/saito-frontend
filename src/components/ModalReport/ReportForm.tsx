import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { maskCpf, normalizeChassis, normalizePlate, onlyDigits } from '../../utils/masks'
import Section from '../FormSection/FormSection'
import { initialValues, validate } from './reportValues'
import type { ReportFormValues } from './reportValues'
import { generateReportPdf } from './generateReportPdf'

type ReportFormProps = {
  /** Chamado ao cancelar. Gerar o PDF não fecha: dá para ajustar e gerar de novo. */
  onClose: () => void
}

/**
 * Formulário do laudo. Não salva nada: só monta o PDF com o que foi
 * preenchido. Os dados da oficina (cabeçalho e responsável) são fixos
 * e vêm de src/constants/workshop.ts.
 *
 * O estado vive aqui dentro: o Dialog desmonta o conteúdo ao fechar, então
 * cada abertura começa com o formulário em branco, sem reset manual.
 */
function ReportForm({ onClose }: ReportFormProps) {
  const [values, setValues] = useState(initialValues)

  /** Erros só aparecem depois da primeira tentativa de gerar, não enquanto digita. */
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validate(values) : {}

  // Mutation mesmo sem API: dá o isPending e o onError no padrão dos outros forms.
  const mutation = useMutation({
    mutationFn: generateReportPdf,
    onSuccess: () => toast.success('PDF do laudo gerado com sucesso.'),
    onError: () => toast.error('Erro inesperado ao gerar o PDF, tente novamente.'),
  })

  function setField(field: keyof ReportFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validate(values)).length > 0) return
    mutation.mutate(values)
  }

  const disabled = mutation.isPending

  return (
    // noValidate: quem valida e escreve as mensagens é o app, não o navegador.
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto my-auto flex w-full max-w-3xl flex-col gap-8 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm text-content-muted">
        Preencha os dados para gerar o PDF do laudo. Campos com * são obrigatórios.
      </p>

      <Section title="Cliente">
        <TextField
          label="Nome"
          value={values.customerName}
          onChange={(event) => setField('customerName', event.target.value)}
          error={!!errors.customerName}
          helperText={errors.customerName}
          autoComplete="off"
          autoFocus
          required
          disabled={disabled}
          className="sm:col-span-6"
        />

        <TextField
          label="CPF"
          value={maskCpf(values.cpf)}
          onChange={(event) => setField('cpf', onlyDigits(event.target.value).slice(0, 11))}
          error={!!errors.cpf}
          helperText={errors.cpf}
          placeholder="000.000.000-00"
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          className="sm:col-span-3"
        />

        <TextField
          label="RG"
          value={values.rg}
          // RG não tem formato único entre estados: só maiúsculas, sem máscara.
          onChange={(event) => setField('rg', event.target.value.toUpperCase().slice(0, 20))}
          placeholder="00.000.000-X"
          disabled={disabled}
          className="sm:col-span-3"
        />

        <TextField
          label="Endereço"
          value={values.address}
          onChange={(event) => setField('address', event.target.value)}
          placeholder="Rua, número, bairro, CEP e cidade"
          disabled={disabled}
          className="sm:col-span-6"
        />
      </Section>

      <Section title="Veículo">
        <TextField
          label="Modelo"
          value={values.vehicleModel}
          onChange={(event) => setField('vehicleModel', event.target.value)}
          error={!!errors.vehicleModel}
          helperText={errors.vehicleModel}
          placeholder="Hyundai/IX35 GL 2017/2018"
          required
          disabled={disabled}
          className="sm:col-span-6"
        />

        <TextField
          label="Placa"
          value={values.plate}
          onChange={(event) => setField('plate', normalizePlate(event.target.value))}
          error={!!errors.plate}
          helperText={errors.plate}
          placeholder="ABC1D23"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { autoCapitalize: 'characters' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Chassi"
          value={values.chassis}
          onChange={(event) => setField('chassis', normalizeChassis(event.target.value))}
          error={!!errors.chassis}
          helperText={errors.chassis}
          placeholder="17 caracteres"
          disabled={disabled}
          slotProps={{ htmlInput: { autoCapitalize: 'characters' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Renavam"
          value={values.renavam}
          onChange={(event) => setField('renavam', onlyDigits(event.target.value).slice(0, 11))}
          error={!!errors.renavam}
          helperText={errors.renavam}
          placeholder="11 dígitos"
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          className="sm:col-span-2"
        />
      </Section>

      <Section title="Diagnóstico">
        <TextField
          label="Data da chegada"
          type="date"
          value={values.arrivalDate}
          onChange={(event) => setField('arrivalDate', event.target.value)}
          error={!!errors.arrivalDate}
          helperText={errors.arrivalDate}
          required
          disabled={disabled}
          slotProps={{ inputLabel: { shrink: true } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Diagnóstico"
          value={values.diagnosis}
          onChange={(event) => setField('diagnosis', event.target.value)}
          error={!!errors.diagnosis}
          helperText={errors.diagnosis}
          placeholder="Avaria nos bicos injetores, feito pedido das peças..."
          required
          multiline
          minRows={4}
          disabled={disabled}
          className="sm:col-span-6"
        />
      </Section>

      <Section title="Previsão">
        <TextField
          label="Desmonte e chegada das peças"
          type="date"
          value={values.partsArrivalDate}
          onChange={(event) => setField('partsArrivalDate', event.target.value)}
          error={!!errors.partsArrivalDate}
          helperText={errors.partsArrivalDate}
          disabled={disabled}
          slotProps={{ inputLabel: { shrink: true } }}
          className="sm:col-span-3"
        />

        <TextField
          label="Veículo pronto"
          type="date"
          value={values.readyDate}
          onChange={(event) => setField('readyDate', event.target.value)}
          error={!!errors.readyDate}
          helperText={errors.readyDate}
          disabled={disabled}
          slotProps={{ inputLabel: { shrink: true } }}
          className="sm:col-span-3"
        />
      </Section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
          loading={disabled}
          loadingPosition="start"
          startIcon={<PictureAsPdfIcon />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {disabled ? 'Gerando PDF...' : 'PDF'}
        </Button>
      </div>
    </form>
  )
}

export default ReportForm
