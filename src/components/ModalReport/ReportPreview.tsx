import type { ReactNode } from 'react'
import { WORKSHOP } from '../../constants/workshop'
import { formatDate } from '../../utils/formatDate'
import { maskCpf } from '../../utils/masks'
import { today } from '../../utils/today'
import type { ReportFormValues } from './reportValues'

type PreviewFieldProps = {
  label: string
  value: string
  /** Texto apagado no lugar de um campo obrigatório ainda vazio. */
  placeholder?: string
  className?: string
}

/**
 * Mesma regra do PDF: campo opcional vazio não aparece. Obrigatório vazio
 * aparece apagado, para mostrar onde o dado vai entrar.
 */
function PreviewField({ label, value, placeholder, className = '' }: PreviewFieldProps) {
  if (!value && !placeholder) return null

  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <span className="text-[9px] tracking-[0.08em] text-content-muted uppercase">{label}</span>
      <span className={`break-words ${value ? '' : 'text-content-subtle italic'}`}>
        {value || placeholder}
      </span>
    </div>
  )
}

function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h4 className="border-b border-line-strong pb-1 text-[10px] font-bold tracking-[0.15em] text-saito-blue">
        {title}
      </h4>
      {children}
    </section>
  )
}

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
    <div
      aria-hidden="true"
      className="flex min-h-[640px] flex-col overflow-hidden rounded-md border border-line bg-white text-[11.5px] leading-normal text-content shadow-[0_12px_32px_rgba(15,42,84,0.10),0_2px_6px_rgba(15,42,84,0.06)]"
    >
      <div className="flex items-start justify-between gap-4 bg-deep-blue px-7 py-5 text-white">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-lg font-bold tracking-wide">
            {WORKSHOP.tradeName.toUpperCase()}
          </span>
          <span className="text-[10px] opacity-85">{WORKSHOP.companyName}</span>
          <span className="text-[9.5px] opacity-75">
            CNPJ {WORKSHOP.cnpj} · IE {WORKSHOP.stateRegistration}
          </span>
          <span className="text-[9.5px] opacity-75">
            {WORKSHOP.street} · {WORKSHOP.district} · {WORKSHOP.city}
          </span>
        </div>
        <span className="shrink-0 text-[9.5px] opacity-75">Emitido em {formatDate(today())}</span>
      </div>
      <div className="h-1 bg-saito-blue" />

      <div className="flex flex-1 flex-col gap-5 px-7 pt-6 pb-4">
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

        <span className="mt-auto border-t border-line-strong pt-1.5 text-[9px] text-content-muted">
          {WORKSHOP.tradeName} · CNPJ {WORKSHOP.cnpj}
        </span>
      </div>
    </div>
  )
}

export default ReportPreview
