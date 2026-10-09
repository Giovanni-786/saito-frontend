import type { ReactNode } from 'react'

type PreviewSectionProps = {
  title: string
  children: ReactNode
}

/** Título de seção com a linha embaixo, como o `sectionTitle` dos PDFs. */
function PreviewSection({ title, children }: PreviewSectionProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <h4 className="border-b border-line-strong pb-1 text-[10px] font-bold tracking-[0.15em] text-saito-blue">
        {title}
      </h4>
      {children}
    </section>
  )
}

export default PreviewSection
