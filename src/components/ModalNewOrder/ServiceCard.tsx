import { useAtom, useAtomValue } from 'jotai'
import type { PrimitiveAtom } from 'jotai'
import { toast } from 'sonner'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import { serviceDownloadAttachment } from '../../services/orders'
import type { Attachment } from '../../services/orders'
import { saveBlob } from '../../utils/download'
import { maskCurrency, maskInteger, onlyDigits } from '../../utils/masks'
import AttachmentsField from './AttachmentsField'
import { validateService } from './newOrderValues'
import type { ServiceFormValues, ServiceTextField } from './newOrderValues'
import { newFilesTotalBytesAtom, orderFormSubmittedAtom } from './orderFormAtoms'

type ServiceCardProps = {
  /** Atom deste serviço, vindo do `serviceAtomsAtom`. */
  serviceAtom: PrimitiveAtom<ServiceFormValues>
  /** Posição na ordem cronológica, começando em 1. */
  number: number
  /** null quando é o único serviço: o atendimento precisa de ao menos um. */
  onRemove: (() => void) | null
  disabled: boolean
}

/** Um serviço do atendimento: data, quilometragem, valor, descrição e anexos. */
function ServiceCard({ serviceAtom, number, onRemove, disabled }: ServiceCardProps) {
  const [values, setValues] = useAtom(serviceAtom)
  const submitted = useAtomValue(orderFormSubmittedAtom)
  const errors = submitted ? validateService(values) : {}
  const newFilesTotalBytes = useAtomValue(newFilesTotalBytesAtom)
  const ownBytes = values.files.reduce((sum, file) => sum + file.size, 0)

  function setField(field: ServiceTextField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function downloadAttachment(attachment: Attachment) {
    // Só anexos salvos aparecem para baixar, e eles só existem em serviço salvo.
    if (values.id === null) return
    try {
      saveBlob(await serviceDownloadAttachment(values.id, attachment.id), attachment.nome)
    } catch {
      toast.error(`Não foi possível baixar ${attachment.nome}, tente novamente.`)
    }
  }

  const title = `Serviço #${number}`

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold tracking-tight">
          {title} · <span className="tabular-nums">{maskCurrency(values.amount) || 'R$ 0,00'}</span>
        </span>
        {onRemove && (
          <IconButton
            size="small"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Excluir ${title}`}
            sx={{ color: 'error.main', mr: -0.5 }}
          >
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <TextField
          label="Data do serviço"
          type="date"
          value={values.date}
          onChange={(event) => setField('date', event.target.value)}
          error={!!errors.date}
          helperText={errors.date}
          required
          disabled={disabled}
          slotProps={{ inputLabel: { shrink: true } }}
          className="col-span-2 sm:col-span-1"
        />

        <TextField
          label="Quilometragem"
          value={maskInteger(values.mileage)}
          onChange={(event) => setField('mileage', onlyDigits(event.target.value).slice(0, 7))}
          error={!!errors.mileage}
          helperText={errors.mileage}
          placeholder="85.000"
          required
          disabled={disabled}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
        />

        <TextField
          label="Valor do serviço"
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
        />

        <TextField
          label="Descrição do serviço realizado"
          value={values.description}
          onChange={(event) => setField('description', event.target.value)}
          error={!!errors.description}
          helperText={errors.description}
          placeholder="Troca de óleo e filtro"
          required
          multiline
          minRows={2}
          disabled={disabled}
          className="col-span-2 sm:col-span-3"
        />
      </div>

      <AttachmentsField
        existing={values.attachments}
        files={values.files}
        onFilesChange={(files) => setValues((current) => ({ ...current, files }))}
        onRemoveExisting={(attachmentId) =>
          setValues((current) => ({
            ...current,
            attachments: current.attachments.filter((a) => a.id !== attachmentId),
          }))
        }
        onDownloadExisting={downloadAttachment}
        usedBytesElsewhere={newFilesTotalBytes - ownBytes}
        disabled={disabled}
      />
    </li>
  )
}

export default ServiceCard
