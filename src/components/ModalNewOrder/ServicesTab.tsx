import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import Button from '@mui/material/Button'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { serviceDownloadAttachment } from '../../services/orders'
import type { Attachment } from '../../services/orders'
import { saveBlob } from '../../utils/download'
import AttachmentsField from './AttachmentsField'
import {
  addServiceAtom,
  keptAttachmentsAtom,
  newFilesAtom,
  orderFormSourceAtom,
  removeKeptAttachmentAtom,
  serviceAtomsAtom,
} from './orderFormAtoms'
import ServiceCard from './ServiceCard'

/**
 * Aba "Serviços": histórico de serviços do atendimento, do mais recente para o
 * mais antigo, e os anexos (que são do atendimento, não de um serviço).
 */
function ServicesTab({ disabled }: { disabled: boolean }) {
  const [serviceAtoms, dispatch] = useAtom(serviceAtomsAtom)
  const addService = useSetAtom(addServiceAtom)

  const source = useAtomValue(orderFormSourceAtom)
  const [files, setFiles] = useAtom(newFilesAtom)
  const keptAttachments = useAtomValue(keptAttachmentsAtom)
  const removeKeptAttachment = useSetAtom(removeKeptAttachmentAtom)

  async function downloadAttachment(attachment: Attachment) {
    if (!source) return
    try {
      saveBlob(await serviceDownloadAttachment(source.order.id, attachment.id), attachment.nome)
    } catch {
      toast.error(`Não foi possível baixar ${attachment.nome}, tente novamente.`)
    }
  }

  const canRemove = serviceAtoms.length > 1

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4" aria-labelledby="services-history-title">
        <div className="flex items-center justify-between gap-3">
          <h3 id="services-history-title" className="text-base font-semibold tracking-tight">
            Histórico de serviços
          </h3>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={addService}
            disabled={disabled}
          >
            Adicionar novo serviço
          </Button>
        </div>

        <ul className="flex flex-col gap-4">
          {/* Mais recente no topo; o número segue a ordem cronológica (#1 = primeiro). */}
          {serviceAtoms
            .map((serviceAtom, index) => (
              <ServiceCard
                key={`${serviceAtom}`}
                serviceAtom={serviceAtom}
                number={index + 1}
                onRemove={canRemove ? () => dispatch({ type: 'remove', atom: serviceAtom }) : null}
                disabled={disabled}
              />
            ))
            .reverse()}
        </ul>
      </section>

      <AttachmentsField
        existing={keptAttachments}
        files={files}
        onFilesChange={setFiles}
        onRemoveExisting={removeKeptAttachment}
        onDownloadExisting={downloadAttachment}
        disabled={disabled}
      />
    </div>
  )
}

export default ServicesTab
