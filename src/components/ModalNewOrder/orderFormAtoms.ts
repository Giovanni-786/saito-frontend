import { atom } from 'jotai'
import { splitAtom } from 'jotai/utils'
import type { Attachment, NewOrder, Order } from '../../services/orders'
import {
  detailsFromOrder,
  emptyService,
  initialDetails,
  servicesFromOrder,
  servicesHaveErrors,
  toPayload,
  validateDetails,
} from './newOrderValues'
import type { OrderFormTab, ServiceFormValues } from './newOrderValues'

/**
 * Estado do formulário de atendimento, no nível da feature.
 *
 * O formulário é dividido em abas (Cliente e veículo, Serviços) e só a
 * aba ativa fica montada. Por isso os valores vivem em atoms, e não no state
 * de um componente: trocar de aba não perde o que foi digitado, cada aba lê só
 * o seu pedaço (digitar num serviço não renderiza as outras) e o cabeçalho da
 * modal enxerga o atendimento carregado sem receber props.
 *
 * Os atoms só são usados pela ModalNewOrder, então ficam aqui e não em `src/store`.
 * Cada abertura da modal começa com `initOrderFormAtom`.
 */

export type OrderFormSource = { order: Order; attachments: Attachment[] }

/** Atendimento que está sendo editado e seus anexos salvos. null = cadastro. */
export const orderFormSourceAtom = atom<OrderFormSource | null>(null)

/**
 * Quem preencheu os atoms por último. Cada montagem do form tem o seu token e
 * só mostra os campos quando ele está aqui; antes disso os atoms ainda guardam
 * o atendimento aberto anteriormente.
 */
export const orderFormSessionAtom = atom<object | null>(null)

export const orderFormTabAtom = atom<OrderFormTab>('details')

export const detailsValuesAtom = atom(initialDetails())
export const servicesValuesAtom = atom<ServiceFormValues[]>([])

/** Um atom por serviço: cada card lê e escreve só o seu. */
export const serviceAtomsAtom = splitAtom(servicesValuesAtom, (service) => service.key)

/** Arquivos novos, ainda só no navegador. */
export const newFilesAtom = atom<File[]>([])

/** Anexos salvos que o usuário não removeu. */
export const keptAttachmentsAtom = atom<Attachment[]>([])

/** Erros só aparecem depois da primeira tentativa de salvar, não enquanto digita. */
export const orderFormSubmittedAtom = atom(false)

/* ------------------------------------------------------------------ */
/* Erros por aba (para marcar a aba e, dentro dela, os campos)         */
/* ------------------------------------------------------------------ */

export const detailsErrorsAtom = atom((get) =>
  get(orderFormSubmittedAtom) ? validateDetails(get(detailsValuesAtom)) : {},
)

/**
 * Uma flag por aba. Booleanos, e não um objeto, para a barra de abas só
 * renderizar quando uma aba muda de válida para inválida, e não a cada tecla.
 */
export const tabHasErrorsAtoms = {
  details: atom((get) => Object.keys(get(detailsErrorsAtom)).length > 0),
  services: atom(
    (get) => get(orderFormSubmittedAtom) && servicesHaveErrors(get(servicesValuesAtom)),
  ),
} satisfies Record<OrderFormTab, unknown>

const TAB_ORDER: OrderFormTab[] = ['details', 'services']

/* ------------------------------------------------------------------ */
/* Ações                                                               */
/* ------------------------------------------------------------------ */

/** Prepara o formulário: vazio para cadastro ou preenchido com o atendimento a editar. */
export const initOrderFormAtom = atom(
  null,
  (_get, set, { session, source }: { session: object; source: OrderFormSource | null }) => {
    set(orderFormSessionAtom, session)
    set(orderFormSourceAtom, source)
    set(orderFormTabAtom, 'details')
    set(orderFormSubmittedAtom, false)
    set(newFilesAtom, [])
    set(keptAttachmentsAtom, source?.attachments ?? [])

    if (source) {
      set(detailsValuesAtom, detailsFromOrder(source.order))
      set(servicesValuesAtom, servicesFromOrder(source.order))
    } else {
      set(detailsValuesAtom, initialDetails())
      set(servicesValuesAtom, [emptyService()])
    }
  },
)

export const addServiceAtom = atom(null, (_get, set) => {
  set(servicesValuesAtom, (current) => [...current, emptyService()])
})

export const removeKeptAttachmentAtom = atom(null, (_get, set, attachmentId: number) => {
  set(keptAttachmentsAtom, (current) => current.filter((a) => a.id !== attachmentId))
})

/** O que a mutation precisa para salvar. */
export type OrderFormSubmission = {
  body: NewOrder
  files: File[]
  keptAttachments: Attachment[]
}

/**
 * Tentativa de salvar: liga a exibição dos erros e, se houver algum, leva o
 * usuário para a primeira aba com problema e devolve null. Válido, devolve o
 * payload pronto. Lê os atoms só no clique, sem o form renderizar a cada tecla.
 */
export const submitOrderFormAtom = atom(null, (get, set): OrderFormSubmission | null => {
  set(orderFormSubmittedAtom, true)

  const invalidTab = TAB_ORDER.find((tab) => get(tabHasErrorsAtoms[tab]))
  if (invalidTab) {
    set(orderFormTabAtom, invalidTab)
    return null
  }

  return {
    body: toPayload(get(detailsValuesAtom), get(servicesValuesAtom)),
    files: get(newFilesAtom),
    keptAttachments: get(keptAttachmentsAtom),
  }
})
