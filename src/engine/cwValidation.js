import { CW_ROOT_FIELDS } from '../data/cwSchema.js'

function isEmailValid(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))
}

export function validateCW(siFields, mappings, token) {
  const siErrors = {}
  const payloadErrors = []
  const payloadWarnings = []

  // ── Auth check ────────────────────────────────────────────────────────────
  if (!token) {
    return {
      siErrors,
      payloadErrors: [{
        field: 'auth',
        code: 401,
        message: 'Token manquant — complétez l\'étape Authentification avant d\'envoyer',
      }],
      payloadWarnings,
      isBlocking: true,
      authMissing: true,
    }
  }

  // ── identifier required ───────────────────────────────────────────────────
  const identifierField = siFields.find(f => f.active && mappings[f.id] === 'identifier')
  if (!identifierField || !identifierField.value) {
    payloadErrors.push({
      field: 'identifier',
      code: 422,
      message: 'identifier est requis — le porteur de carte ne peut pas être identifié',
    })
  }

  // ── empty payload warning ─────────────────────────────────────────────────
  const activeMapped = siFields.filter(f => f.active && mappings[f.id])
  if (activeMapped.length === 0) {
    payloadWarnings.push({
      field: 'payload',
      code: 400,
      message: 'Payload vide — aucun champ ne sera mis à jour',
    })
  }

  // ── field-level validation ────────────────────────────────────────────────
  for (const field of siFields) {
    if (!field.active) continue
    const mapping = mappings[field.id]

    if (!mapping) {
      siErrors[field.id] = { type: 'warning', message: 'Non mappé — ce champ ne sera pas transmis' }
      continue
    }

    const schema = CW_ROOT_FIELDS[mapping]

    // Email format
    if (schema?.format === 'email' && field.value && !isEmailValid(field.value)) {
      siErrors[field.id] = { type: 'error', message: 'Format email invalide' }
      continue
    }

    // Empty value warning (only for non-identifier)
    if (mapping !== 'identifier' && (field.value === '' || field.value == null)) {
      siErrors[field.id] = { type: 'warning', message: 'Valeur vide — sera transmis null' }
    }
  }

  const isBlocking =
    payloadErrors.length > 0 ||
    Object.values(siErrors).some(e => e.type === 'error')

  return { siErrors, payloadErrors, payloadWarnings, isBlocking, authMissing: false }
}
