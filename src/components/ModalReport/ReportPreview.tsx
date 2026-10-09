import { WORKSHOP } from '../../constants/workshop'
import { formatDate } from '../../utils/formatDate'
import { maskCpf } from '../../utils/masks'
import PreviewField from '../PdfPreview/PreviewField'
import PreviewPage from '../PdfPreview/PreviewPage'
import PreviewSection from '../PdfPreview/PreviewSection'
import type { ReportFormValues } from './reportValues'

type ReportPreviewProps = {
  values: ReportFormValues
}

/**
 * Pré-visualização do laudo em HTML, atualizada a cada tecla. Espelha o
 * layout do ReportPdf (cabeçalho timbrado, seções, previsão e responsável);
 * mudou o PDF, ajuste aqui também.
 */
function ReportPreview({ values }: ReportPreviewProps) {
  const hasForecast = Boolean(values.partsArrivalDate || values.readyDate)

  return (
    <PreviewPage>
      <PreviewSection title="CLIENTE">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <PreviewField
            label="Nome"
            value={values.customerName.trim()}
            placeholder="Nome do cliente"
            className="col-span-2"
          />
          <PreviewField label="CPF" value={maskCpf(values.cpf)} />
          <PreviewField label="RG" value={values.rg.trim()} />
          <PreviewField label="Endereço" value={values.address.trim()} className="col-span-2" />
        </div>
      </PreviewSection>

      <PreviewSection title="VEÍCULO">
        <div className="grid grid-cols-[1fr_1.8fr_1.2fr] gap-x-3 gap-y-2">
          <PreviewField
            label="Modelo"
            value={values.vehicleModel.trim()}
            placeholder="Modelo do veículo"
            className="col-span-3"
          />
          <PreviewField label="Placa" value={values.plate} placeholder="ABC1D23" />
          <PreviewField label="Chassi" value={values.chassis} />
          <PreviewField label="Renavam" value={values.renavam} />
        </div>
      </PreviewSection>

      <PreviewSection title="DIAGNÓSTICO">
        <PreviewField
          label="Data da chegada"
          value={values.arrivalDate ? formatDate(values.arrivalDate) : ''}
          placeholder="dd/mm/aaaa"
        />
        <p
          className={`rounded border-l-[3px] border-saito-blue bg-light-blue p-3 whitespace-pre-wrap ${values.diagnosis.trim() ? '' : 'text-content-subtle italic'}`}
        >
          {values.diagnosis.trim() || 'O diagnóstico aparece aqui.'}
        </p>
      </PreviewSection>

      {hasForecast && (
        <PreviewSection title="PREVISÃO">
          <div className="flex gap-3">
            {values.partsArrivalDate && (
              <div className="flex flex-1 flex-col gap-0.5 rounded-md border border-line-strong p-3">
                <span className="text-[9px] tracking-[0.08em] text-content-muted uppercase">
                  Desmonte e chegada das peças
                </span>
                <span className="text-[15px] font-bold text-deep-blue">
                  {formatDate(values.partsArrivalDate)}
                </span>
              </div>
            )}
            {values.readyDate && (
              <div className="flex flex-1 flex-col gap-0.5 rounded-md border border-line-strong p-3">
                <span className="text-[9px] tracking-[0.08em] text-content-muted uppercase">
                  Veículo pronto
                </span>
                <span className="text-[15px] font-bold text-deep-blue">
                  {formatDate(values.readyDate)}
                </span>
              </div>
            )}
          </div>
        </PreviewSection>
      )}

      <div className="mt-10 flex w-56 flex-col items-center gap-1">
        <span className="w-full border-t border-content" />
        <span className="text-[10.5px] font-bold uppercase">{WORKSHOP.responsible}</span>
      </div>
    </PreviewPage>
  )
}

export default ReportPreview
