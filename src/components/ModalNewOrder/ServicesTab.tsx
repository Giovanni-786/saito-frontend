import { useAtom, useSetAtom } from 'jotai'
import Button from '@mui/material/Button'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { addServiceAtom, serviceAtomsAtom } from './orderFormAtoms'
import ServiceCard from './ServiceCard'

/**
 * Aba "Serviços": histórico de serviços do atendimento, do mais recente para o
 * mais antigo. Cada serviço tem os seus anexos.
 */
function ServicesTab({ disabled }: { disabled: boolean }) {
  const [serviceAtoms, dispatch] = useAtom(serviceAtomsAtom)
  const addService = useSetAtom(addServiceAtom)

  const canRemove = serviceAtoms.length > 1

  return (
    <section className="flex flex-col gap-4" aria-labelledby="services-history-title">
      <div className="flex items-center justify-between gap-3">
        <h3 id="services-history-title" className="text-base font-semibold tracking-tight">
          Histórico de serviços
        </h3>
        <Button
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={addService}
          disabled={disabled}
        >
          Adicionar novo serviço
        </Button>
      </div>

      <ul className="flex flex-col gap-4">
        {/* Mais recente no topo; o número segue a ordem cronológica (#1 = primeiro). */}
        {serviceAtoms
          .map((serviceAtom, index) => (
            <ServiceCard
              key={`${serviceAtom}`}
              serviceAtom={serviceAtom}
              number={index + 1}
              onRemove={canRemove ? () => dispatch({ type: 'remove', atom: serviceAtom }) : null}
              disabled={disabled}
            />
          ))
          .reverse()}
      </ul>
    </section>
  )
}

export default ServicesTab
