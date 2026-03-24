import React, { useState } from 'react'
import WalletCard from './WalletCard.jsx'
import { BREVO_SCHEMA } from '../data/brevoSchema.js'

function JsonViewer({ data, label, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const json = JSON.stringify(data, null, 2)

  return (
    <div className="json-viewer">
      <div className="json-viewer__header" onClick={() => setExpanded(!expanded)}>
        <span className="json-viewer__label">{label}</span>
        <span className="json-viewer__toggle">{expanded ? '▾' : '▸'}</span>
      </div>
      {expanded && (
        <pre className="json-viewer__body mono">
          <JsonHighlight json={json} />
        </pre>
      )}
    </div>
  )
}

function JsonHighlight({ json }) {
  const highlighted = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (-?\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-bool">$1</span>')
    .replace(/: null/g, ': <span class="json-null">null</span>')

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
}

function ValidationPanel({ validationResult, mappings, siFields }) {
  const { walletErrors = [], walletOk = [] } = validationResult || {}
  const hasErrors = walletErrors.length > 0

  // Separate standard schema fields from custom ones
  const standardOk = walletOk.filter(f => BREVO_SCHEMA[f])
  const customOk = walletOk.filter(f => !BREVO_SCHEMA[f])

  return (
    <div className="validation-panel">
      <div className="validation-panel__header">
        <span className="validation-panel__title">Validation contrat Brevo</span>
        {hasErrors
          ? <span className="badge badge--error">{walletErrors.length} erreur{walletErrors.length > 1 ? 's' : ''}</span>
          : <span className="badge badge--success">✓ Contrat valide</span>
        }
      </div>

      <div className="validation-panel__fields">
        {/* Required fields */}
        {Object.entries(BREVO_SCHEMA)
          .filter(([, s]) => s.required)
          .map(([field]) => {
            const isMapped = walletOk.includes(field)
            const isError = walletErrors.some(e => e.field === field)
            return (
              <div key={field} className={`vf-row ${isError ? 'vf-row--error' : isMapped ? 'vf-row--ok' : ''}`}>
                <span className={`vf-status ${isError ? 'vf-status--error' : isMapped ? 'vf-status--ok' : 'vf-status--idle'}`}>
                  {isError ? '✕' : isMapped ? '✓' : '○'}
                </span>
                <span className="vf-name mono">{field}</span>
                <span className="vf-tag vf-tag--required">requis</span>
                {isError && <span className="vf-error-msg">manquant</span>}
              </div>
            )
          })
        }

        {/* Optional mapped standard fields */}
        {standardOk.filter(f => !BREVO_SCHEMA[f]?.required).map(field => (
          <div key={field} className="vf-row vf-row--ok">
            <span className="vf-status vf-status--ok">✓</span>
            <span className="vf-name mono">{field}</span>
          </div>
        ))}

        {/* Custom mapped fields */}
        {customOk.map(field => (
          <div key={field} className="vf-row vf-row--custom">
            <span className="vf-status vf-status--ok">✓</span>
            <span className="vf-name mono">{field}</span>
            <span className="vf-tag vf-tag--custom">custom</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WalletPanel({
  walletData,
  payload,
  cardConfig,
  onCardConfigChange,
  validationResult,
  appState,
  lastResponse,
  siFields,
  mappings,
  fieldMeta
}) {
  const [cardVisible, setCardVisible] = useState(true)
  const [showConfig, setShowConfig] = useState(false)
  const animating = appState === 'sending' || appState === 'success'
  const isError = appState === 'error'

  return (
    <div className="panel wallet-panel">
      <div className="panel__header">
        <div className="panel__header-left">
          <div className="panel__badge panel__badge--brevo">BREVO WALLET</div>
          <div className="panel__title">Rendu en temps réel</div>
        </div>
        <div className="panel__header-right">
          <button
            className={`icon-btn ${showConfig ? 'icon-btn--active' : ''}`}
            onClick={() => setShowConfig(!showConfig)}
            title="Configurer la carte"
          >
            ⚙
          </button>
          <button
            className={`icon-btn ${!cardVisible ? 'icon-btn--active' : ''}`}
            onClick={() => setCardVisible(!cardVisible)}
            title={cardVisible ? 'Masquer la carte' : 'Afficher la carte'}
          >
            {cardVisible ? '◉' : '○'}
          </button>
        </div>
      </div>

      <div className="panel__body">
        {/* Card config */}
        {showConfig && (
          <div className="card-config">
            <div className="card-config__row">
              <label className="card-config__label">Couleur</label>
              <div className="card-config__color-picker">
                {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0b5fff', '#8b5cf6', '#ec4899', '#14b8a6'].map(c => (
                  <button
                    key={c}
                    className={`color-dot ${cardConfig.color === c ? 'color-dot--active' : ''}`}
                    style={{ background: c }}
                    onClick={() => onCardConfigChange({ ...cardConfig, color: c })}
                  />
                ))}
                <input
                  type="color"
                  className="color-input"
                  value={cardConfig.color}
                  onChange={e => onCardConfigChange({ ...cardConfig, color: e.target.value })}
                  title="Couleur personnalisée"
                />
              </div>
            </div>
            <div className="card-config__row">
              <label className="card-config__label">Marque</label>
              <input
                className="si-input"
                placeholder="Nom de la marque"
                value={cardConfig.brandName}
                onChange={e => onCardConfigChange({ ...cardConfig, brandName: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Card */}
        {cardVisible && (
          <div className="wallet-card-wrapper">
            <WalletCard
              walletData={walletData}
              cardConfig={cardConfig}
              animating={animating}
              fieldMeta={fieldMeta}
            />
            {appState === 'success' && (
              <div className="wallet-card-badge wallet-card-badge--success">✓ Mise à jour reçue</div>
            )}
            {isError && (
              <div className="wallet-card-badge wallet-card-badge--error">✕ Payload rejeté</div>
            )}
          </div>
        )}

        {/* Validation */}
        <ValidationPanel
          validationResult={validationResult}
          mappings={mappings}
          siFields={siFields}
        />

        {/* Payload preview */}
        {Object.keys(payload).length > 0 && (
          <JsonViewer data={payload} label="Payload qui sera envoyé" defaultExpanded={true} />
        )}

        {/* Last response */}
        {lastResponse && (
          <JsonViewer
            data={lastResponse}
            label={`Réponse simulée — ${lastResponse.code || 200}`}
            defaultExpanded={false}
          />
        )}
      </div>
    </div>
  )
}
