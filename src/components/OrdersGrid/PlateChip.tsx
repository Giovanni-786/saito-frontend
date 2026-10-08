type PlateChipProps = {
  plate: string
}

/** Placa em fonte mono dentro de uma moldura, lembrando a placa de verdade. */
function PlateChip({ plate }: PlateChipProps) {
  return (
    <span className="inline-flex h-6.5 items-center rounded-md border border-line-strong bg-surface px-2 font-mono text-[12.5px] font-semibold tracking-[0.06em] text-deep-blue">
      {plate}
    </span>
  )
}

export default PlateChip
