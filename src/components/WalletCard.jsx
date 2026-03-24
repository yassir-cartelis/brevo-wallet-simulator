import React from 'react'
import { MEMBER_LEVEL_COLORS } from '../data/brevoSchema.js'

function getLevelColor(level) {
  return MEMBER_LEVEL_COLORS[level] || '#6366f1'
}

function formatPoints(pts) {
  if (!pts && pts !== 0) return '—'
  return Number(pts).toLocaleString('fr-FR')
}

function getMemberLevelBadge(level) {
  if (!level) return null
  const color = getLevelColor(level)
  return { label: level, color }
}

export default function WalletCard({ walletData, cardConfig, animating }) {
  const { color = '#6366f1', brandName = 'Ma Marque' } = cardConfig || {}
  const d = walletData?.data || {}
  const h = walletData?.holder || {}
  const identifier = walletData?.identifier

  const levelBadge = getMemberLevelBadge(d.memberLevel)

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)`
  }

  return (
    <div
      className={`wallet-card ${animating ? 'wallet-card--animating' : ''}`}
      style={gradientStyle}
    >
      {/* Card Header */}
      <div className="wallet-card__header">
        <div className="wallet-card__brand">{brandName}</div>
        {levelBadge && (
          <div
            className="wallet-card__level"
            style={{ background: levelBadge.color, color: '#000' }}
          >
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
        {h.email && (
          <div className="wallet-card__email">{h.email}</div>
        )}
      </div>

      {/* Main metric */}
      {d.loyaltyPoints !== undefined && (
        <div className="wallet-card__points">
          <div className="wallet-card__points-value">
            {formatPoints(d.loyaltyPoints)}
          </div>
          <div className="wallet-card__points-label">points</div>
        </div>
      )}

      {/* Footer */}
      <div className="wallet-card__footer">
        <div className="wallet-card__meta">
          {d.cardNumber && (
            <span className="wallet-card__card-number">
              {d.cardNumber}
            </span>
          )}
          {d.balance !== undefined && (
            <span className="wallet-card__balance">
              {Number(d.balance).toFixed(2)} €
            </span>
          )}
        </div>
        <div className="wallet-card__meta-right">
          {d.expiryDate && (
            <span className="wallet-card__expiry">
              Exp. {d.expiryDate}
            </span>
          )}
          {identifier && (
            <span className="wallet-card__id">#{identifier}</span>
          )}
        </div>
      </div>

      {/* Shine overlay */}
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
