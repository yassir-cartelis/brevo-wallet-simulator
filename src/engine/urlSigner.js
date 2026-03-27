// Simulated URL signing — pedagogical only, not cryptographically real

function pseudoSHA256(input) {
  // Deterministic pseudo-hash for demo purposes
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  const base = (h >>> 0).toString(16).padStart(8, '0')
  // Extend to 64-char hex string
  return Array.from({ length: 8 }, (_, i) =>
    ((h ^ (i * 0x9e3779b9)) >>> 0).toString(16).padStart(8, '0')
  ).join('')
}

function pseudoAES256(payload, key, iv) {
  // Purely visual simulation — shows what an AES-encrypted param looks like
  const raw = `${payload}|${key}|${iv}`
  const encoded = btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return encoded.slice(0, 44) + '=='
}

export function buildEnrollUrl({
  accountId,
  projectId,
  campaignId,
  userIdentifier,
  channel,
  tag,
  security,
  salt,
  aesKey,
  aesIv,
  environment,
}) {
  const host = environment === 'DEV'
    ? `https://qlf-${accountId || '{accountId}'}.captainwallet.com`
    : `https://${accountId || '{accountId}'}.captainwallet.com`

  const base = `${host}/${projectId || '{projectId}'}/${campaignId || '{campaignId}'}`
  const encoded = encodeURIComponent(userIdentifier || '')

  let params = ''

  if (security === 'sha256') {
    const signature = pseudoSHA256(`${userIdentifier}${salt || ''}`)
    params = `?user[identifier]=${encoded}&signature=${signature}`
  } else if (security === 'aes256') {
    const encrypted = pseudoAES256(userIdentifier, aesKey || '', aesIv || '')
    params = `?data=${encodeURIComponent(encrypted)}`
  } else {
    params = `?user[identifier]=${encoded}`
  }

  if (channel) params += `&channel=${encodeURIComponent(channel)}`
  if (tag) params += `&tag=${encodeURIComponent(tag)}`

  return base + params
}

export function buildPlainUrl({ accountId, projectId, campaignId, userIdentifier, channel, tag, environment }) {
  const host = environment === 'DEV'
    ? `https://qlf-${accountId}.captainwallet.com`
    : `https://${accountId}.captainwallet.com`

  let url = `${host}/${projectId}/${campaignId}?user[identifier]=${encodeURIComponent(userIdentifier)}`
  if (channel) url += `&channel=${encodeURIComponent(channel)}`
  if (tag) url += `&tag=${encodeURIComponent(tag)}`
  return url
}
