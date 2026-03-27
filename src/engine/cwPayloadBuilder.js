export function buildCWPayload(siFields, mappings) {
  const rootFields = {}
  const metadatas = {}
  const countersMap = {}

  for (const field of siFields) {
    if (!field.active) continue
    const mapping = mappings[field.id]
    if (!mapping) continue

    const value = coerceValue(field.value, field.type)

    if (mapping.startsWith('metadatas.')) {
      const key = mapping.slice('metadatas.'.length)
      if (key) metadatas[key] = value
    } else if (mapping.startsWith('counters.')) {
      const identifier = mapping.slice('counters.'.length)
      if (identifier) countersMap[identifier] = String(value ?? '')
    } else {
      // root field
      rootFields[mapping] = value
    }
  }

  const payload = { ...rootFields }

  if (Object.keys(metadatas).length > 0) {
    payload.metadatas = metadatas
  }

  if (Object.keys(countersMap).length > 0) {
    payload.counters = Object.entries(countersMap).map(([identifier, value]) => ({
      identifier,
      value,
    }))
  }

  return payload
}

function coerceValue(value, type) {
  if (value === '' || value === null || value === undefined) return value
  switch (type) {
    case 'number': {
      const n = Number(value)
      return isNaN(n) ? value : n
    }
    case 'boolean':
      return value === 'true' || value === true
    default:
      return String(value)
  }
}

export function buildSuccessResponse(payload, userIdentifier) {
  return {
    status: 200,
    body: {
      identifier: userIdentifier || payload.identifier || 'unknown',
      updatedAt: new Date().toISOString(),
      ...payload,
    },
  }
}

export function buildErrorResponse(code, message, details = []) {
  return {
    status: code,
    body: {
      code,
      message,
      details,
    },
  }
}
