import { BREVO_SCHEMA } from '../data/brevoSchema.js'

function coerceValue(value, type) {
  if (value === '' || value === null || value === undefined) return value
  switch (type) {
    case 'number': {
      const n = Number(value)
      return isNaN(n) ? value : n
    }
    case 'boolean':
      return value === 'true' || value === true
    case 'date':
      return value
    default:
      return String(value)
  }
}

function setNestedValue(obj, dotPath, value) {
  const parts = dotPath.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {}
    }
    current = current[parts[i]]
  }
  current[parts[parts.length - 1]] = value
}

export function buildPayload(siFields, mappings) {
  const payload = {}

  for (const field of siFields) {
    if (!field.active) continue
    const brevoPath = mappings[field.id]
    if (!brevoPath) continue

    const schema = BREVO_SCHEMA[brevoPath]
    const coerced = coerceValue(field.value, schema?.type || field.type)
    setNestedValue(payload, brevoPath, coerced)
  }

  return payload
}

export function buildSimulatedResponse(payload, cardId) {
  return {
    success: true,
    data: {
      id: cardId,
      updatedAt: new Date().toISOString(),
      ...payload
    }
  }
}

export function buildErrorResponse(errors) {
  const firstError = errors[0]
  return {
    code: 422,
    message: "Unprocessable Entity",
    details: errors.map(e => ({
      field: e.field,
      message: e.message
    }))
  }
}
