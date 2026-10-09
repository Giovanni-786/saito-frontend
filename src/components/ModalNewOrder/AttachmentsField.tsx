import { useId, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import IconButton from '@mui/material/IconButton'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import VideoFileOutlinedIcon from '@mui/icons-material/VideoFileOutlined'
import { ATTACHMENTS_MAX_BYTES } from '../../services/orders'
import type { Attachment } from '../../services/orders'

type AttachmentsFieldProps = {
  /** Anexos já salvos no atendimento (só na edição). */
  existing: Attachment[]
  /** Arquivos escolhidos agora, ainda não enviados. */
  files: File[]
  onFilesChange: (files: File[]) => void
  onRemoveExisting: (attachmentId: number) => void
  /** Baixa um anexo salvo; a promessa marca o carregamento do botão. */
  onDownloadExisting: (attachment: Attachment) => Promise<void>
  disabled?: boolean
}

/** 1536000 -> "1,5 MB". */
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} KB`
  return `${(bytes / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <ImageOutlinedIcon fontSize="small" />
  if (type.startsWith('video/')) return <VideoFileOutlinedIcon fontSize="small" />
  if (type === 'application/pdf') return <PictureAsPdfOutlinedIcon fontSize="small" />
  return <InsertDriveFileOutlinedIcon fontSize="small" />
}

/** Mesmo arquivo escolhido duas vezes não entra repetido. */
const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`

/**
 * Campo de anexos do atendimento: vários arquivos do computador ou, no celular,
 * da galeria/câmera (o seletor nativo oferece as opções). Também aceita arrastar.
 *
 * O limite de 100MB vale para os arquivos novos, que vão todos numa requisição.
 */
function AttachmentsField({
  existing,
  files,
  onFilesChange,
  onRemoveExisting,
  onDownloadExisting,
  disabled,
}: AttachmentsFieldProps) {
  const inputId = useId()
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  /** Ids dos anexos sendo baixados agora. */
  const [downloading, setDownloading] = useState<number[]>([])

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)

  function addFiles(selected: File[]) {
    const known = new Set(files.map(fileKey))
    const added = selected.filter((file) => !known.has(fileKey(file)))
    const nextTotal = totalBytes + added.reduce((sum, file) => sum + file.size, 0)

    if (nextTotal > ATTACHMENTS_MAX_BYTES) {
      setError(
        `Os anexos passam de ${formatBytes(ATTACHMENTS_MAX_BYTES)}. Remova algum ou escolha arquivos menores.`,
      )
      return
    }
    setError(null)
    onFilesChange([...files, ...added])
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []))
    // Limpa o input para permitir escolher de novo o mesmo arquivo depois de removê-lo.
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    if (!disabled) addFiles(Array.from(event.dataTransfer.files))
  }

  async function download(attachment: Attachment) {
    setDownloading((current) => [...current, attachment.id])
    try {
      await onDownloadExisting(attachment)
    } finally {
      setDownloading((current) => current.filter((id) => id !== attachment.id))
    }
  }

  function removeFile(index: number) {
    setError(null)
    onFilesChange(files.filter((_, i) => i !== index))
  }

  const hasItems = existing.length > 0 || files.length > 0

  return (
    <div className="flex flex-col gap-2 sm:col-span-6">
      <span className="text-sm font-medium text-content-muted">Anexos</span>

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          'flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors',
          dragging
            ? 'border-saito-blue bg-light-blue'
            : 'border-line-strong hover:border-saito-blue',
          disabled ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
      >
        <CloudUploadOutlinedIcon className="text-saito-blue" />
        <span className="text-sm font-medium">Adicionar fotos, vídeos ou documentos</span>
        <span className="text-xs text-content-subtle">
          Clique ou arraste aqui. Até {formatBytes(ATTACHMENTS_MAX_BYTES)} no total.
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          onChange={handleInput}
          disabled={disabled}
          className="sr-only"
        />
      </label>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      {hasItems && (
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
          {existing.map((attachment) => (
            <li
              key={`attachment-${attachment.id}`}
              className="flex items-center gap-3 py-1 pr-1 pl-3"
            >
              <span className="text-content-muted">
                <FileIcon type={attachment.tipo} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{attachment.nome}</span>
              <span className="text-xs text-content-subtle">Salvo</span>
              <IconButton
                size="small"
                onClick={() => void download(attachment)}
                disabled={downloading.includes(attachment.id)}
                aria-label={`Baixar ${attachment.nome}`}
              >
                {downloading.includes(attachment.id) ? (
                  <CircularProgress size={16} />
                ) : (
                  <DownloadRoundedIcon fontSize="small" />
                )}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onRemoveExisting(attachment.id)}
                disabled={disabled}
                aria-label={`Remover ${attachment.nome}`}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </li>
          ))}

          {files.map((file, index) => (
            <li key={fileKey(file)} className="flex items-center gap-3 py-1 pr-1 pl-3">
              <span className="text-saito-blue">
                <FileIcon type={file.type} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
              <span className="text-xs text-content-subtle">{formatBytes(file.size)}</span>
              <IconButton
                size="small"
                onClick={() => removeFile(index)}
                disabled={disabled}
                aria-label={`Remover ${file.name}`}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <span className="text-xs text-content-subtle">
          {formatBytes(totalBytes)} de {formatBytes(ATTACHMENTS_MAX_BYTES)} em arquivos novos
        </span>
      )}
    </div>
  )
}

export default AttachmentsField
