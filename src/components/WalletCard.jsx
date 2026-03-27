import React from 'react'

function formatPoints(val) {
  if (val === undefined || val === null || val === '') return null
  return Number(val).toLocaleString('fr-FR')
}

function BarcodeVisual() {
  const pattern = [3,1,2,1,3,2,1,1,2,3,1,2,1,3,1,1,2,3,2,1,3,1,2,1,3]
  return (
    <div className="wallet-barcode">
      {pattern.map((w, i) => (
        <div key={i} className={i % 2 === 0 ? 'barcode-bar' : 'barcode-gap'} style={{ width: `${w * 3}px` }} />
      ))}
    </div>
  )
}

function QRVisual({ token }) {
  const seed = String(token).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffffff, 0)
  const size = 7
  const cells = Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size), col = i % size
    const inTL = row < 3 && col < 3
    const inTR = row < 3 && col >= size - 3
    const inBL = row >= size - 3 && col < 3
    if (inTL || inTR || inBL) {
      const lr = inTL ? row : inTR ? row : row - (size - 3)
      const lc = inTL ? col : inTR ? col - (size - 3) : col
      return (lr === 0 || lr === 2 || lc === 0 || lc === 2) ? true : (lr === 1 && lc === 1)
    }
    return ((seed ^ (i * 6364136223846793005)) & 1) === 1
  })
  return (
    <div className="wallet-qrcode">
      {cells.map((filled, i) => <div key={i} className={`qr-cell ${filled ? 'qr-cell--on' : ''}`} />)}
    </div>
  )
}

// walletData keys expected:
//   firstname, lastname, email
//   metadatas: { status, cardNumber, ... }
//   counters: { points, visits, ... }
//   barcode / qrcode (type field)
export default function WalletCard({ walletData = {}, animating = false }) {
  const firstname = walletData.firstname || ''
  const lastname = walletData.lastname || ''
  const email = walletData.email || ''
  const meta = walletData.metadatas || {}
  const counters = walletData.counters || {}

  const hasName = firstname || lastname
  const points = counters.points

  const isEmpty = !hasName && !email && !points && Object.keys(meta).length === 0

  // Accent color from metadatas if provided
  const accentColor = meta.color || '#6366f1'

  const gradientStyle = {
    background: `linear-gradient(135deg, ${accentColor} 0%, ${darken(accentColor, 30)} 100%)`,
  }

  // Find barcode/qrcode fields
  const barcodeField = Object.entries(walletData).find(([, v]) => v?.__type === 'barcode')
  const qrcodeField = Object.entries(walletData).find(([, v]) => v?.__type === 'qrcode')

  return (
    <div
      className={`wallet-card ${animating ? 'wallet-card--animating' : ''} ${isEmpty ? 'wallet-card--empty' : ''}`}
      style={gradientStyle}
    >
      {isEmpty && (
        <div className="wallet-card__placeholder-msg">
          Activez le toggle 👁 sur vos champs pour les afficher ici
        </div>
      )}

      {/* Header */}
      <div className="wallet-card__header">
        <div className="wallet-card__brand">
          {meta.brand || 'Ma Marque'}
        </div>
        {meta.memberLevel && (
          <div className="wallet-card__level">{meta.memberLevel}</div>
        )}
      </div>

      {/* Holder */}
      {hasName && (
        <div className="wallet-card__holder">
          <div className="wallet-card__name">
            {[firstname, lastname].filter(Boolean).join(' ')}
          </div>
          {email && <div className="wallet-card__email">{email}</div>}
        </div>
      )}

      {/* Points */}
      {points !== undefined && points !== null && points !== '' && (
        <div className="wallet-card__points">
          <div className="wallet-card__points-value">{formatPoints(points)}</div>
          <div className="wallet-card__points-label">points</div>
        </div>
      )}

      {/* Custom metadatas (excluding internal ones) */}
      {Object.entries(meta)
        .filter(([k]) => !['color', 'brand', 'memberLevel'].includes(k))
        .slice(0, 3)
        .map(([k, v]) => (
          <div key={k} className="wallet-card__meta-field">
            <span className="wallet-card__meta-label">{k}</span>
            <span className="wallet-card__meta-value">{String(v)}</span>
          </div>
        ))}

      {/* Other counters (not points) */}
      {Object.entries(counters)
        .filter(([k]) => k !== 'points')
        .map(([k, v]) => (
          <div key={k} className="wallet-card__meta-field">
            <span className="wallet-card__meta-label">{k}</span>
            <span className="wallet-card__meta-value">{String(v)}</span>
          </div>
        ))}

      {/* Barcode / QR */}
      {barcodeField && (
        <div className="wallet-card__code-zone">
          <BarcodeVisual />
        </div>
      )}
      {qrcodeField && (
        <div className="wallet-card__code-zone">
          <QRVisual token={qrcodeField[1]?.value || 'token'} />
        </div>
      )}

      <div className="wallet-card__shine" />
    </div>
  )
}

function darken(hex, amount) {
  try {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, (num >> 16) - amount)
    const g = Math.max(0, ((num >> 8) & 0xff) - amount)
    const b = Math.max(0, (num & 0xff) - amount)
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  } catch {
    return hex
  }
}
