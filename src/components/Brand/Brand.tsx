import BuildRoundedIcon from '@mui/icons-material/BuildRounded'

type BrandProps = {
  /** Mostra "Mecânica Saito" abaixo do nome. */
  withSubtitle?: boolean
}

/** Marca do sistema: selo azul-escuro com a chave e o nome ao lado. */
function Brand({ withSubtitle = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-deep-blue text-white">
        <BuildRoundedIcon sx={{ fontSize: 18 }} aria-hidden="true" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[15px] font-bold tracking-tight text-deep-blue">Saito Oficina</span>
        {withSubtitle && <span className="text-xs text-content-muted">Mecânica Saito</span>}
      </div>
    </div>
  )
}

export default Brand
