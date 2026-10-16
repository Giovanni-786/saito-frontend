import logo from '../../assets/logo-saito-recortada.jpeg'

type BrandProps = {
  /** Classes de tamanho da logo (largura/altura). */
  className?: string
}

/**
 * Marca do sistema: logo da Oficina Saito. O JPEG tem fundo branco, e o
 * `mix-blend-multiply` o funde com fundos claros (ex.: o bg-canvas do login).
 */
function Brand({ className = 'h-9 w-auto' }: BrandProps) {
  return <img src={logo} alt="Oficina Saito" className={`mix-blend-multiply ${className}`} />
}

export default Brand
