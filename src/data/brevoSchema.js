export const BREVO_SCHEMA = {
  "identifier": {
    required: true,
    type: "string",
    description: "Identifiant unique de la carte",
    group: "root",
    example: "CARD-001"
  },
  "holder.firstName": {
    required: false,
    type: "string",
    description: "Prénom du porteur",
    group: "holder",
    example: "Marie"
  },
  "holder.lastName": {
    required: false,
    type: "string",
    description: "Nom du porteur",
    group: "holder",
    example: "Dupont"
  },
  "holder.email": {
    required: false,
    type: "string",
    format: "email",
    description: "Email du porteur",
    group: "holder",
    example: "marie@exemple.fr"
  },
  "data.loyaltyPoints": {
    required: false,
    type: "number",
    min: 0,
    description: "Points de fidélité",
    group: "data",
    example: "1200"
  },
  "data.memberLevel": {
    required: false,
    type: "string",
    description: "Niveau de membership",
    group: "data",
    example: "Gold"
  },
  "data.expiryDate": {
    required: false,
    type: "date",
    description: "Date d'expiration",
    group: "data",
    example: "2027-12-31"
  },
  "data.cardNumber": {
    required: false,
    type: "string",
    description: "Numéro de carte",
    group: "data",
    example: "4242 4242 4242"
  },
  "data.balance": {
    required: false,
    type: "number",
    description: "Solde du compte",
    group: "data",
    example: "250"
  },
  "data.customField1": {
    required: false,
    type: "string",
    description: "Champ personnalisé 1",
    group: "data",
    example: "Valeur custom"
  },
  "data.customField2": {
    required: false,
    type: "string",
    description: "Champ personnalisé 2",
    group: "data",
    example: "Valeur custom"
  }
}

export const BREVO_FIELD_OPTIONS = Object.entries(BREVO_SCHEMA).map(([key, schema]) => ({
  value: key,
  label: key,
  description: schema.description,
  required: schema.required,
  type: schema.type,
  group: schema.group
}))

export const FIELD_TYPES = ["string", "number", "boolean", "date", "barcode", "qrcode"]

export const MEMBER_LEVEL_COLORS = {
  "Bronze": "#cd7f32",
  "Silver": "#a8a9ad",
  "Gold": "#ffd700",
  "Platinum": "#e5e4e2",
  "Diamond": "#b9f2ff"
}
