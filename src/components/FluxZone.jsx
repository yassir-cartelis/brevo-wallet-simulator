import React, { useEffect, useRef } from 'react'

function PayloadChip({ payload }) {
  const keys = Object.keys(payload)
  if (keys.length === 0) return <span className="flux-chip flux-chip--empty">{ }</span>
  const preview = keys.slice(0, 2).map(k => `${k}: …`).join(', ')
  const more = keys.length > 2 ? ` +${keys.length - 2}` : ''
  return (
    <span className="flux-chip">
      {`{ ${preview}${more} }`}
    </span>
  )
}

export default function FluxZone({ appState, cardId, payload, lastResponse }) {
  const isSending = appState === 'sending'
  const isSuccess = appState === 'success'
  const isError = appState === 'error'
  const isActive = isSending || isSuccess || isError

  const statusCode = isSuccess ? 200 : isError ? 422 : null
  const statusLabel = isSuccess ? 'OK' : isError ? 'Unprocessable Entity' : null

  return (
    <div className="flux-zone">
      {/* Top label */}
      <div className="flux-zone__endpoint">
        <span className="flux-method">PATCH</span>
        <span className="flux-path">/v3/wallet/cards/</span>
        <span className="flux-card-id">{cardId || '{cardId}'}</span>
      </div>

      {/* Animated flow channel */}
      <div className="flux-channel">
        {/* Request arrow (left → right) */}
        <div className={`flux-arrow flux-arrow--right ${isSending ? 'flux-arrow--active' : ''}`}>
          <div className="flux-arrow__track">
            <div className="flux-arrow__beam">
              {isSending && <PayloadChip payload={payload} />}
            </div>
            <div className="flux-arrow__head">›</div>
          </div>
          <div className="flux-arrow__label">Requête</div>
        </div>

        {/* Center status */}
        <div className="flux-status">
          {!isActive && (
            <div className="flux-status__idle">
              <div className="flux-status__dot" />
            </div>
          )}
          {isSending && (
            <div className="flux-status__sending">
              <div className="flux-spinner" />
            </div>
          )}
          {(isSuccess || isError) && (
            <div className={`flux-status__code flux-status__code--${isSuccess ? 'success' : 'error'}`}>
              <div className="flux-status__number">{statusCode}</div>
              <div className="flux-status__text">{statusLabel}</div>
            </div>
          )}
        </div>

        {/* Response arrow (right → left) */}
        <div className={`flux-arrow flux-arrow--left ${(isSuccess || isError) ? 'flux-arrow--active' : ''}`}>
          <div className="flux-arrow__track">
            <div className="flux-arrow__head">‹</div>
            <div className="flux-arrow__beam">
              {isSuccess && (
                <span className="flux-chip flux-chip--success">200 OK</span>
              )}
              {isError && (
                <span className="flux-chip flux-chip--error">422 Error</span>
              )}
            </div>
          </div>
          <div className="flux-arrow__label">Réponse</div>
        </div>
      </div>

      {/* Brevo logo badge */}
      <div className="flux-brevo-badge">
        <div className="flux-brevo-dot" />
        <span>Brevo API</span>
      </div>
    </div>
  )
}
