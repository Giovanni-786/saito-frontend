import { useAtom, useAtomValue } from 'jotai'
import TextField from '@mui/material/TextField'
import { maskPhone, normalizePlate, onlyDigits } from '../../utils/masks'
import type { DetailsFormValues } from './newOrderValues'
import { detailsErrorsAtom, detailsValuesAtom } from './orderFormAtoms'

/**
 * Aba "Cliente e veículo": dados pessoais, veículo e a observação do atendimento.
 * A quilometragem não fica aqui: ela é de cada serviço.
 */
function DetailsTab({ disabled }: { disabled: boolean }) {
  const [values, setValues] = useAtom(detailsValuesAtom)
  const errors = useAtomValue(detailsErrorsAtom)

  function setField(field: keyof DetailsFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4" aria-labelledby="details-customer-title">
        <h3 id="details-customer-title" className="text-base font-semibold tracking-tight">
          Dados pessoais
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <TextField
            label="Cliente"
            value={values.customer}
            onChange={(event) => setField('customer', event.target.value)}
            error={!!errors.customer}
            helperText={errors.customer}
            autoComplete="off"
            autoFocus
            required
            disabled={disabled}
            className="sm:col-span-4"
          />

          <TextField
            label="Telefone"
            value={maskPhone(values.phone)}
            onChange={(event) => setField('phone', onlyDigits(event.target.value).slice(0, 11))}
            error={!!errors.phone}
            helperText={errors.phone}
            placeholder="(14) 99999-9999"
            required
            disabled={disabled}
            slotProps={{ htmlInput: { inputMode: 'tel' } }}
            className="sm:col-span-2"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="details-vehicle-title">
        <h3 id="details-vehicle-title" className="text-base font-semibold tracking-tight">
          Veículo
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <TextField
            label="Veículo"
            value={values.vehicle}
            onChange={(event) => setField('vehicle', event.target.value)}
            error={!!errors.vehicle}
            helperText={errors.vehicle}
            placeholder="Honda Civic"
            required
            disabled={disabled}
            className="sm:col-span-4"
          />

          <TextField
            label="Placa"
            value={values.plate}
            onChange={(event) => setField('plate', normalizePlate(event.target.value))}
            error={!!errors.plate}
            helperText={errors.plate}
            placeholder="ABC1234"
            required
            disabled={disabled}
            slotProps={{ htmlInput: { autoCapitalize: 'characters' } }}
            className="sm:col-span-2"
          />
        </div>
      </section>

      <TextField
        label="Observação"
        value={values.notes}
        onChange={(event) => setField('notes', event.target.value)}
        multiline
        minRows={3}
        disabled={disabled}
      />
    </div>
  )
}

export default DetailsTab
