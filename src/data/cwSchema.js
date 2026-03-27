// Real Captain Wallet API schema — PUT /v1/{accountId}/{projectId}/pass-owners/{identifier}

export const CW_ROOT_FIELDS = {
  identifier: {
    required: true,
    type: 'string',
    description: 'Identifiant pivot du porteur de carte',
    example: 'USER-001',
    group: 'root',
  },
  newIdentifier: {
    required: false,
    type: 'string',
    description: 'Nouvel identifiant (si changement d\'ID)',
    example: 'USER-002',
    group: 'root',
  },
  firstname: {
    required: false,
    type: 'string',
    description: 'Prénom du porteur',
    example: 'Marie',
    group: 'root',
  },
  lastname: {
    required: false,
    type: 'string',
    description: 'Nom du porteur',
    example: 'Dupont',
    group: 'root',
  },
  email: {
    required: false,
    type: 'string',
    format: 'email',
    description: 'Email du porteur',
    example: 'marie@example.com',
    group: 'root',
  },
  store: {
    required: false,
    type: 'string',
    description: 'Référence magasin',
    example: 'store-paris-01',
    group: 'root',
  },
}

// Mapping suggestions for the datalist (root + common metadatas/counters)
export const CW_MAPPING_SUGGESTIONS = [
  // Root
  { value: 'identifier',    label: 'identifier',    description: 'Identifiant pivot (requis)', group: 'root', required: true },
  { value: 'newIdentifier', label: 'newIdentifier', description: 'Nouvel identifiant', group: 'root', required: false },
  { value: 'firstname',     label: 'firstname',     description: 'Prénom', group: 'root', required: false },
  { value: 'lastname',      label: 'lastname',      description: 'Nom', group: 'root', required: false },
  { value: 'email',         label: 'email',         description: 'Email', group: 'root', required: false },
  { value: 'store',         label: 'store',         description: 'Référence magasin', group: 'root', required: false },
  // metadatas examples
  { value: 'metadatas.brand',          label: 'metadatas.brand',          description: 'Nom de la marque (affiché en haut de la carte)', group: 'metadatas', required: false },
  { value: 'metadatas.status',         label: 'metadatas.status',         description: 'Statut de livraison', group: 'metadatas', required: false },
  { value: 'metadatas.cardNumber',     label: 'metadatas.cardNumber',     description: 'Numéro de carte', group: 'metadatas', required: false },
  { value: 'metadatas.dateLivraison',  label: 'metadatas.dateLivraison',  description: 'Date de livraison', group: 'metadatas', required: false },
  { value: 'metadatas.adresseRetrait', label: 'metadatas.adresseRetrait', description: 'Lieu de retrait', group: 'metadatas', required: false },
  { value: 'metadatas.expediteur',     label: 'metadatas.expediteur',     description: 'Nom de l\'expéditeur', group: 'metadatas', required: false },
  { value: 'metadatas.memberLevel',    label: 'metadatas.memberLevel',    description: 'Niveau de fidélité', group: 'metadatas', required: false },
  // counters examples
  { value: 'counters.points',  label: 'counters.points',  description: 'Compteur : points de fidélité', group: 'counters', required: false },
  { value: 'counters.visits',  label: 'counters.visits',  description: 'Compteur : nombre de visites', group: 'counters', required: false },
  { value: 'counters.stamps',  label: 'counters.stamps',  description: 'Compteur : tampons', group: 'counters', required: false },
]

export const FIELD_TYPES = ['string', 'number', 'boolean', 'date', 'barcode', 'qrcode']

export function getMappingGroup(mapping) {
  if (!mapping) return null
  if (mapping.startsWith('metadatas.')) return 'metadatas'
  if (mapping.startsWith('counters.')) return 'counters'
  if (mapping.startsWith('offers.')) return 'offers'
  return 'root'
}

export function isKnownRootField(mapping) {
  return !!CW_ROOT_FIELDS[mapping]
}
