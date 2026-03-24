import React from 'react'
import { MEMBER_LEVEL_COLORS } from '../data/brevoSchema.js'

function getLevelColor(level) {
  return MEMBER_LEVEL_COLORS[level] || '#6366f1'
}

function formatPoints(pts) {
  if (!pts && pts !== 0) return '—'
  return Number(pts).toLocaleString('fr-FR')
}

function truncateToken(token) {
  const s = String(token)
  if (s.length <= 14) return s
  return `${s.slice(0, 6)}···${s.slice(-4)}`
}

function getNestedValue(obj, dotPath) {
  return dotPath.split('.').reduce((acc, key) => acc?.[key], obj)
}

function BarcodeVisual() {
  const pattern = [3,1,2,1,3,2,1,1,2,3,1,2,1,3,1,1,2,3,2,1,3,1,2,1,3]
  return (
    <div className="wallet-barcode">
      {pattern.map((w, i) => (
        <div
          key={i}
          className={i % 2 === 0 ? 'barcode-bar' : 'barcode-gap'}
          style={{ width: `${w * 3}px`, flexShrink: 0 }}
        />
      ))}
    </div>
  )
}

function QRVisual({ token }) {
  const seed = String(token).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffffff, 0)
  const size = 7
  const cells = Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size), col = i % size
    // Finder patterns (top-left, top-right, bottom-left corners)
    const inTopLeft = row < 3 && col < 3
    const inTopRight = row < 3 && col >= size - 3
    const inBottomLeft = row >= size - 3 && col < 3
    if (inTopLeft || inTopRight || inBottomLeft) {
      const lr = inTopLeft ? row : inTopRight ? row : row - (size - 3)
      const lc = inTopLeft ? col : inTopRight ? col - (size - 3) : col
      return (lr === 0 || lr === 2 || lc === 0 || lc === 2) ? true : (lr === 1 && lc === 1)
    }
    return ((seed ^ (i * 6364136223846793005)) & 1) === 1
  })
  return (
    <div className="wallet-qrcode">
      {cells.map((filled, i) => (
        <div key={i} className={`qr-cell ${filled ? 'qr-cell--on' : ''}`} />
      ))}
    </div>
  )
}

export default function WalletCard({ walletData, cardConfig, animating, fieldMeta }) {
  const { color = '#6366f1', brandName = 'Ma Marque' } = cardConfig || {}
  const d = walletData?.data || {}
  const h = walletData?.holder || {}
  const identifier = walletData?.identifier

  const levelBadge = d.memberLevel ? { label: d.memberLevel, color: getLevelColor(d.memberLevel) } : null

  // Find barcode/qrcode mapped fields
  const codeFields = Object.entries(fieldMeta || {}).filter(([, meta]) =>
    meta.type === 'barcode' || meta.type === 'qrcode'
  ).map(([path, meta]) => ({
    path,
    type: meta.type,
    value: getNestedValue(walletData || {}, path)
  })).filter(f => f.value !== undefined && f.value !== null && f.value !== '')

  // Find custom data fields (not standard known ones)
  const knownDataFields = new Set(['loyaltyPoints','memberLevel','expiryDate','cardNumber','balance','customField1','customField2'])
  const customDataFields = Object.entries(d).filter(([k]) => !knownDataFields.has(k) &&
    !codeFields.some(cf => cf.path === `data.${k}`)
  )

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)`
  }

  const hasCodeField = codeFields.length > 0

  return (
    <div
      className={`wallet-card ${animating ? 'wallet-card--animating' : ''} ${hasCodeField ? 'wallet-card--with-code' : ''}`}
      style={gradientStyle}
    >
      {/* Card Header */}
      <div className="wallet-card__header">
        <div className="wallet-card__brand">{brandName}</div>
        {levelBadge && (
          <div className="wallet-card__level" style={{ background: levelBadge.color, color: '#000' }}>
            {levelBadge.label}
          </div>
        )}
      </div>

      {/* Holder */}
      <div className="wallet-card__holder">
        <div className="wallet-card__name">
          {h.firstName || h.lastName
            ? `${h.firstName || ''} ${h.lastName || ''}`.trim()
            : <span className="wallet-card__placeholder">Prénom Nom</span>
          }
        </div>
        {h.email && <div className="wallet-card__email">{h.email}</div>}
      </div>

      {/* Main metric: points (only if no code field taking center) */}
      {d.loyaltyPoints !== undefined && !hasCodeField && (
        <div className="wallet-card__points">
          <div className="wallet-card__points-value">{formatPoints(d.loyaltyPoints)}</div>
          <div className="wallet-card__points-label">points</div>
        </div>
      )}

      {/* Points compact if code present */}
      {d.loyaltyPoints !== undefined && hasCodeField && (
        <div className="wallet-card__points-compact">
          {formatPoints(d.loyaltyPoints)} pts
        </div>
      )}

      {/* Custom data fields (non-standard) */}
      {customDataFields.length > 0 && !hasCodeField && (
        <div className="wallet-card__custom-fields">
          {customDataFields.slice(0, 2).map(([k, v]) => (
            <div key={k} className="wallet-card__custom-field">
              <span className="wallet-card__custom-label">{k}</span>
              <span className="wallet-card__custom-value">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Barcode / QR code zone */}
      {codeFields.map(({ path, type, value }) => (
        <div key={path} className="wallet-card__code-zone">
          {type === 'barcode' ? (
            <>
              <BarcodeVisual />
              <div className="wallet-card__code-token">{truncateToken(value)}</div>
            </>
          ) : (
            <>
              <QRVisual token={value} />
              <div className="wallet-card__code-token">{truncateToken(value)}</div>
            </>
          )}
        </div>
      ))}

      {/* Footer */}
      <div className="wallet-card__footer">
        <div className="wallet-card__meta">
          {d.cardNumber && <span className="wallet-card__card-number">{d.cardNumber}</span>}
          {d.balance !== undefined && <span className="wallet-card__balance">{Number(d.balance).toFixed(2)} €</span>}
        </div>
        <div className="wallet-card__meta-right">
          {d.expiryDate && <span className="wallet-card__expiry">Exp. {d.expiryDate}</span>}
          {identifier && <span className="wallet-card__id">#{identifier}</span>}
        </div>
      </div>

      <div className="wallet-card__shine" />
    </div>
  )
}

function adjustColor(hex, amount) {
  try {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  } catch {
    return hex
  }
}
