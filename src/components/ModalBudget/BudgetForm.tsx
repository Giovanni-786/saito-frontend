import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import {
  maskCurrency,
  maskPhone,
  maskVehicleYear,
  normalizePlate,
  onlyDigits,
} from '../../utils/masks'
import Section from '../FormSection/FormSection'
import {
  FUEL_OPTIONS,
  budgetTotalCents,
  emptyItem,
  initialValues,
  itemTotalCents,
  productsTotalCents,
  validate,
} from './budgetValues'
import type { BudgetFormValues, BudgetItem } from './budgetValues'
import { generateBudgetPdf } from './generateBudgetPdf'

type BudgetFormProps = {
  /** Chamado ao cancelar. Gerar o PDF não fecha: dá para ajustar e gerar de novo. */
  onClose: () => void
}

/** Linhas da tabela visíveis antes de a lista ganhar rolagem. */
const MAX_VISIBLE_ITEMS = 5

type ScalarField = Exclude<keyof BudgetFormValues, 'items'>
type ItemField = Exclude<keyof BudgetItem, 'id'>

/** Moeda digitada da direita para a esquerda, como nos outros forms: só dígitos, em centavos. */
function toCents(value: string) {
  // Number() tira zeros à esquerda: apagar até "R$ 0,00" esvazia o campo.
  return String(Number(onlyDigits(value).slice(0, 10)) || '')
}

/**
 * Formulário do orçamento, com os campos do talão de papel. Não salva nada:
 * só monta o PDF com o que foi preenchido.
 *
 * A tabela de produtos cresce conforme a necessidade (o talão tinha linhas
 * fixas) e o total é calculado na hora — produtos + mão de obra.
 *
 * O estado vive aqui dentro: o Dialog desmonta o conteúdo ao fechar, então
 * cada abertura começa com o formulário em branco, sem reset manual.
 */
function BudgetForm({ onClose }: BudgetFormProps) {
  const [values, setValues] = useState(initialValues)

  /** Linha recém-adicionada recebe o foco no campo de produto. */
  const [focusItemId, setFocusItemId] = useState<string | null>(null)

  /** Erros só aparecem depois da primeira tentativa de gerar, não enquanto digita. */
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validate(values) : {}

  // Mutation mesmo sem API: dá o isPending e o onError no padrão dos outros forms.
  const mutation = useMutation({
    mutationFn: generateBudgetPdf,
    onSuccess: () => toast.success('PDF do orçamento gerado com sucesso.'),
    onError: () => toast.error('Erro inesperado ao gerar o PDF, tente novamente.'),
  })

  function setField(field: ScalarField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function setItemField(id: string, field: ItemField, value: string) {
    setValues((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  function addItem() {
    const item = emptyItem()
    setFocusItemId(item.id)
    setValues((current) => ({ ...current, items: [...current.items, item] }))
  }

  function removeItem(id: string) {
    setValues((current) => {
      const items = current.items.filter((item) => item.id !== id)
      // A tabela nunca fica sem linha: remover a última deixa uma em branco.
      return { ...current, items: items.length > 0 ? items : [emptyItem()] }
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validate(values)).length > 0) return
    mutation.mutate(values)
  }

  const disabled = mutation.isPending
  const productsTotal = productsTotalCents(values.items)
  const total = budgetTotalCents(values)

  return (
    // noValidate: quem valida e escreve as mensagens é o app, não o navegador.
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto my-auto flex w-full max-w-4xl flex-col gap-8 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm text-content-muted">
        Preencha os dados para gerar o PDF do orçamento. Campos com * são obrigatórios.
      </p>

      <Section title="Cliente e veículo">
        <TextField
          label="Cliente"
          value={values.customerName}
          onChange={(event) => setField('customerName', event.target.value)}
          error={!!errors.customerName}
          helperText={errors.customerName}
          autoComplete="off"
          autoFocus
          required
          disabled={disabled}
          className="sm:col-span-4"
        />

        <TextField
          label="Fone"
          value={maskPhone(values.phone)}
          onChange={(event) => setField('phone', onlyDigits(event.target.value).slice(0, 11))}
          error={!!errors.phone}
          helperText={errors.phone}
          placeholder="(14) 99999-9999"
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
          placeholder="Hyundai"
          required
          disabled={disabled}
          className="sm:col-span-3"
        />

        <TextField
          label="Modelo"
          value={values.model}
          onChange={(event) => setField('model', event.target.value)}
          placeholder="IX35 GL"
          disabled={disabled}
          className="sm:col-span-3"
        />

        <TextField
          label="Placa"
          value={values.plate}
          onChange={(event) => setField('plate', normalizePlate(event.target.value))}
          error={!!errors.plate}
          helperText={errors.plate}
          placeholder="ABC1D23"
          disabled={disabled}
          slotProps={{ htmlInput: { autoCapitalize: 'characters' } }}
          className="sm:col-span-2"
        />

        <TextField
          label="Ano"
          value={maskVehicleYear(values.year)}
          onChange={(event) => setField('year', onlyDigits(event.target.value).slice(0, 8))}
          error={!!errors.year}
          helperText={errors.year}
          placeholder="2017/2018"
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          className="sm:col-span-2"
        />

        <TextField
          select
          label="Combustível"
          value={values.fuel}
          onChange={(event) => setField('fuel', event.target.value)}
          disabled={disabled}
          className="sm:col-span-2"
        >
          <MenuItem value="">
            <em>Não informado</em>
          </MenuItem>
          {FUEL_OPTIONS.map((fuel) => (
            <MenuItem key={fuel} value={fuel}>
              {fuel}
            </MenuItem>
          ))}
        </TextField>
      </Section>

      <Section title="Produtos e serviços">
        <div className="flex flex-col gap-3 sm:col-span-6">
          {/* Cabeçalho da tabela: some no celular, onde cada linha vira um cartão. */}
          <div className="hidden grid-cols-12 gap-3 px-1 text-xs font-semibold tracking-wide text-content-muted uppercase sm:grid">
            <span className="col-span-2">Quant.</span>
            <span className="col-span-5">Produto</span>
            <span className="col-span-2">Preço unit.</span>
            <span className="col-span-2 text-right">Subtotal</span>
          </div>

          {/* Até 5 linhas a lista cresce com a página; a partir da 6ª ganha rolagem
              própria, e o cabeçalho, o "Adicionar item" e os totais seguem visíveis.
              O pt-2 dá espaço para o rótulo flutuante da primeira linha não ser cortado. */}
          <div
            className={
              values.items.length > MAX_VISIBLE_ITEMS
                ? 'flex max-h-[41rem] flex-col gap-3 overflow-y-auto pt-2 pr-1 sm:max-h-[16.5rem]'
                : 'flex flex-col gap-3 pt-2'
            }
          >
            {values.items.map((item, index) => {
              const itemErrors = errors.items?.[item.id] ?? {}

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-start gap-3 rounded-xl border border-line p-3 sm:rounded-none sm:border-0 sm:p-0"
                >
                  <TextField
                    label="Quant."
                    value={item.quantity}
                    onChange={(event) =>
                      setItemField(item.id, 'quantity', onlyDigits(event.target.value).slice(0, 4))
                    }
                    error={!!itemErrors.quantity}
                    size="small"
                    disabled={disabled}
                    slotProps={{
                      htmlInput: {
                        inputMode: 'numeric',
                        'aria-label': `Quantidade do item ${index + 1}`,
                      },
                    }}
                    className="col-span-3 sm:col-span-2"
                  />

                  <TextField
                    label="Produto"
                    value={item.description}
                    onChange={(event) => setItemField(item.id, 'description', event.target.value)}
                    error={!!itemErrors.description}
                    helperText={itemErrors.description}
                    placeholder="Filtro de óleo"
                    size="small"
                    autoFocus={item.id === focusItemId}
                    disabled={disabled}
                    className="col-span-9 sm:col-span-5"
                  />

                  <TextField
                    label="Preço unit."
                    value={maskCurrency(item.unitPrice)}
                    onChange={(event) =>
                      setItemField(item.id, 'unitPrice', toCents(event.target.value))
                    }
                    error={!!itemErrors.unitPrice}
                    helperText={itemErrors.unitPrice}
                    placeholder="R$ 0,00"
                    size="small"
                    disabled={disabled}
                    slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                    className="col-span-5 sm:col-span-2"
                  />

                  <span
                    className="col-span-5 self-center text-right text-sm font-semibold text-deep-blue tabular-nums sm:col-span-2"
                    aria-label={`Subtotal do item ${index + 1}`}
                  >
                    {maskCurrency(String(itemTotalCents(item))) || 'R$ 0,00'}
                  </span>

                  {/* Mesma lixeira do grid. O span segura o Tooltip quando o botão
                      está desabilitado (gerando o PDF), que o MUI não aceita direto. */}
                  <Tooltip title="Excluir">
                    <span className="col-span-2 justify-self-end sm:col-span-1">
                      <IconButton
                        onClick={() => removeItem(item.id)}
                        disabled={disabled}
                        aria-label={`Excluir item ${index + 1}`}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              )
            })}
          </div>

          <Button
            type="button"
            variant="text"
            onClick={addItem}
            disabled={disabled}
            startIcon={<AddIcon />}
            sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
          >
            Adicionar item
          </Button>
        </div>
      </Section>

      <Section title="Valores">
        <TextField
          label="Mão de obra"
          value={maskCurrency(values.labor)}
          onChange={(event) => setField('labor', toCents(event.target.value))}
          placeholder="R$ 0,00"
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          className="self-start sm:col-span-3"
        />

        {/* Resumo calculado: atualiza a cada tecla, sem precisar gerar o PDF. */}
        <div className="flex flex-col gap-1 rounded-xl bg-surface-muted p-4 sm:col-span-3">
          <div className="flex justify-between text-sm text-content-muted">
            <span>Produtos</span>
            <span className="tabular-nums">{maskCurrency(String(productsTotal)) || 'R$ 0,00'}</span>
          </div>
          <div className="flex justify-between text-sm text-content-muted">
            <span>Mão de obra</span>
            <span className="tabular-nums">{maskCurrency(values.labor) || 'R$ 0,00'}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-2 text-deep-blue">
            <span className="text-sm font-semibold tracking-wide uppercase">Total</span>
            <span className="text-2xl font-semibold tabular-nums">
              {maskCurrency(String(total)) || 'R$ 0,00'}
            </span>
          </div>
        </div>
      </Section>

      {errors.general && (
        <Alert severity="error" role="alert">
          {errors.general}
        </Alert>
      )}

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

export default BudgetForm
