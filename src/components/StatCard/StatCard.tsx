import type { ReactNode } from 'react'
import Skeleton from '@mui/material/Skeleton'

type StatCardProps = {
  /** Ícone já dimensionado (ex.: `<Icon fontSize="small" />`); a cor vem do selo. */
  icon: ReactNode
  label: string
  /** Valor já formatado. `null` = sem dado, exibe um traço. */
  value: string | null
  /** Enquanto carrega, o valor vira skeleton no mesmo espaço, sem pular a tela. */
  loading?: boolean
}

/**
 * Card de indicador: selo com ícone, rótulo e o número em destaque.
 * Genérico de propósito: serve para total de atendimentos, faturamento ou
 * qualquer outro indicador que venha a existir.
 */
function StatCard({ icon, label, value, loading = false }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-[14px] border border-line bg-surface p-5">
      <div
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-light-blue text-saito-blue"
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] text-content-muted">{label}</span>
        {loading ? (
          <Skeleton width={120} height={32} aria-label={`Carregando ${label.toLowerCase()}`} />
        ) : (
          <span className="truncate text-2xl font-semibold tracking-tight tabular-nums">
            {value ?? '—'}
          </span>
        )}
      </div>
    </div>
  )
}

export default StatCard
