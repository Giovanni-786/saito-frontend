import type { ReactNode } from 'react'

type FormSectionProps = {
  title: string
  children: ReactNode
}

/**
 * Bloco de formulário com título, em grade de 6 colunas (1 no celular).
 * Usado nos formulários que geram PDF, espelhando as seções do documento.
 */
function FormSection({ title, children }: FormSectionProps) {
  return (
    <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <legend className="mb-3 text-sm font-semibold tracking-wide text-deep-blue uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

export default FormSection
