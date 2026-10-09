type PreviewFieldProps = {
  label: string
  value: string
  /** Texto apagado no lugar de um campo obrigatório ainda vazio. */
  placeholder?: string
  className?: string
}

/**
 * Mesma regra do PdfField: campo opcional vazio não aparece. Obrigatório vazio
 * aparece apagado, para mostrar onde o dado vai entrar.
 */
function PreviewField({ label, value, placeholder, className = '' }: PreviewFieldProps) {
  if (!value && !placeholder) return null

  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${className}`}>
      <span className="text-[9px] tracking-[0.08em] text-content-muted uppercase">{label}</span>
      <span className={`wrap-break-word ${value ? '' : 'text-content-subtle italic'}`}>
        {value || placeholder}
      </span>
    </div>
  )
}

export default PreviewField
