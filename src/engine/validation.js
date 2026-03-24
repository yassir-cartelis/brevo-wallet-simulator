import { BREVO_SCHEMA } from '../data/brevoSchema.js'

function isTypeValid(value, declaredType, expectedType) {
  if (value === '' || value === null || value === undefined) return true
  const target = expectedType || declaredType
  switch (target) {
    case 'number':
      return !isNaN(Number(value))
    case 'boolean':
      return value === 'true' || value === 'false' || typeof value === 'boolean'
    case 'date': {
      const d = new Date(value)
      return !isNaN(d.getTime())
    }
    case 'string':
      return typeof value === 'string' || typeof value === 'number'
    default:
      return true
  }
}

function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
}

export function validate(siFields, mappings) {
  const siErrors = {}    // fieldId → { type: 'warning'|'error', message }
  const walletErrors = [] // { field, message }
  const walletOk = []     // brevo fields that are correctly mapped

  // Track which Brevo fields are actively mapped
  const mappedBrevoFields = new Set()

  // Passe 1 — SI field level validation
  for (const field of siFields) {
    if (!field.active) continue

    const brevoPath = mappings[field.id]

    if (!brevoPath) {
      siErrors[field.id] = {
        type: 'warning',
        message: 'Ce champ ne sera pas transmis à Brevo'
      }
      continue
    }

    const schema = BREVO_SCHEMA[brevoPath]
    if (!schema) {
      siErrors[field.id] = { type: 'error', message: 'Champ Brevo inconnu' }
      continue
    }

    // Type validation
    if (!isTypeValid(field.value, field.type, schema.type)) {
      siErrors[field.id] = {
        type: 'error',
        message: `Type invalide : attendu ${schema.type}, reçu "${field.value}"`
      }
      continue
    }

    // Email format
    if (schema.format === 'email' && field.value && !isEmailValid(field.value)) {
      siErrors[field.id] = {
        type: 'error',
        message: 'Format email invalide'
      }
      continue
    }

    // Min value
    if (schema.min !== undefined && Number(field.value) < schema.min) {
      siErrors[field.id] = {
        type: 'error',
        message: `Valeur minimum : ${schema.min}`
      }
      continue
    }

    // Empty value warning
    if (field.value === '' || field.value === null || field.value === undefined) {
      siErrors[field.id] = {
        type: 'warning',
        message: 'Valeur vide — le champ sera transmis null'
      }
    }

    mappedBrevoFields.add(brevoPath)
  }

  // Passe 2 — Contrat Brevo : champs requis
  for (const [brevoField, schema] of Object.entries(BREVO_SCHEMA)) {
    if (schema.required && !mappedBrevoFields.has(brevoField)) {
      walletErrors.push({
        field: brevoField,
        message: `Champ requis manquant — ${schema.description}`
      })
    } else if (mappedBrevoFields.has(brevoField)) {
      walletOk.push(brevoField)
    }
  }

  const isBlocking = walletErrors.length > 0 ||
    Object.values(siErrors).some(e => e.type === 'error')

  return { siErrors, walletErrors, walletOk, isBlocking }
}

export function getOrphanCount(siFields, mappings) {
  return siFields.filter(f => f.active && !mappings[f.id]).length
}
