import { maskCurrency, maskPhone, maskVehicleYear } from '../../utils/masks'
import PreviewField from '../PdfPreview/PreviewField'
import PreviewPage from '../PdfPreview/PreviewPage'
import PreviewSection from '../PdfPreview/PreviewSection'
import { isBlankItem, itemTotalCents, productsTotalCents } from './budgetValues'
import type { BudgetFormValues } from './budgetValues'

/** Mesmas proporções das colunas do BudgetPdf (11% / 49% / 20% / 20%). */
const TABLE_COLUMNS = 'grid grid-cols-[11fr_49fr_20fr_20fr]'

type BudgetPreviewProps = {
  values: BudgetFormValues
}

/**
 * Pré-visualização do orçamento em HTML, atualizada a cada tecla. Espelha o
 * layout do BudgetPdf (cabeçalho com telefone, cliente e veículo, tabela de
 * itens e totais); mudou o PDF, ajuste aqui também.
 *
 * Diferença proposital: sem itens, o PDF omite a tabela, mas aqui ela aparece
 * com um aviso apagado, para mostrar onde os itens vão entrar.
 */
function BudgetPreview({ values }: BudgetPreviewProps) {
  const items = values.items.filter((item) => !isBlankItem(item))
  const productsTotal = productsTotalCents(items)
  const labor = Number(values.labor || 0)

  return (
    <PreviewPage showPhone>
      <PreviewSection title="CLIENTE E VEÍCULO">
        <div className="grid grid-cols-20 gap-x-3 gap-y-2">
          <PreviewField
            label="Cliente"
            value={values.customerName.trim()}
            placeholder="Nome do cliente"
            className="col-span-13"
          />
          <PreviewField label="Fone" value={maskPhone(values.phone)} className="col-span-7" />
          <PreviewField
            label="Veículo"
            value={values.vehicle.trim()}
            placeholder="Veículo"
            className="col-span-8"
          />
          <PreviewField label="Modelo" value={values.model.trim()} className="col-span-12" />
          <PreviewField label="Placa" value={values.plate} className="col-span-5" />
          <PreviewField label="Ano" value={maskVehicleYear(values.year)} className="col-span-5" />
          <PreviewField label="Combustível" value={values.fuel} className="col-span-10" />
        </div>
      </PreviewSection>

      <PreviewSection title="PRODUTOS E SERVIÇOS">
        <div className="overflow-hidden rounded border border-line-strong">
          <div
            className={`${TABLE_COLUMNS} border-b border-line-strong bg-light-blue text-[8.5px] font-bold tracking-[0.08em] text-saito-blue`}
          >
            <span className="px-2 py-1.5 text-center">QUANT.</span>
            <span className="px-2 py-1.5">PRODUTO</span>
            <span className="px-2 py-1.5 text-right">PREÇO UNIT.</span>
            <span className="px-2 py-1.5 text-right">SUBTOTAL</span>
          </div>

          {items.length === 0 ? (
            <p className="px-2 py-3 text-center text-content-subtle italic">
              Os itens aparecem aqui.
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`${TABLE_COLUMNS} border-b border-line-strong last:border-b-0 ${index % 2 === 1 ? 'bg-[#f7f9fc]' : ''}`}
              >
                <span className="px-2 py-1.5 text-center tabular-nums">{item.quantity}</span>
                <span className="px-2 py-1.5 wrap-break-word">{item.description.trim()}</span>
                <span className="px-2 py-1.5 text-right tabular-nums">
                  {maskCurrency(item.unitPrice)}
                </span>
                <span className="px-2 py-1.5 text-right tabular-nums">
                  {maskCurrency(String(itemTotalCents(item)))}
                </span>
              </div>
            ))
          )}
        </div>
      </PreviewSection>

      <div className="ml-auto flex w-[45%] min-w-52 flex-col whitespace-nowrap">
        {items.length > 0 && (
          <div className="flex justify-between border-b border-line-strong px-2.5 py-1.5">
            <span className="text-content-muted">Produtos</span>
            <span className="tabular-nums">{maskCurrency(String(productsTotal))}</span>
          </div>
        )}
        {labor > 0 && (
          <div className="flex justify-between border-b border-line-strong px-2.5 py-1.5">
            <span className="text-content-muted">Mão de obra</span>
            <span className="tabular-nums">{maskCurrency(values.labor)}</span>
          </div>
        )}
        <div className="mt-1.5 flex items-center justify-between gap-3 rounded bg-deep-blue px-2.5 py-2 text-white">
          <span className="text-[11px] font-bold tracking-[0.15em]">TOTAL</span>
          <span className="text-[16px] font-bold tabular-nums">
            {maskCurrency(String(productsTotal + labor)) || 'R$ 0,00'}
          </span>
        </div>
      </div>
    </PreviewPage>
  )
}

export default BudgetPreview
