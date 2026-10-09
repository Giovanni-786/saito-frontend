import type { ReactNode } from 'react'

type FormSectionProps = {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}

/**
 * Card de formulário com ícone, título e descrição, e os campos numa grade de
 * 6 colunas (1 no celular). Usado nos formulários que geram PDF (laudo e
 * orçamento), espelhando as seções do documento.
 */
function FormSection({ title, description, icon, children }: FormSectionProps) {
  return (
    <fieldset className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden="true" className="mb-5 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-light-blue text-saito-blue">
          {icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold tracking-tight">{title}</span>
          <span className="text-[13px] text-content-muted">{description}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">{children}</div>
    </fieldset>
  )
}

export default FormSection
