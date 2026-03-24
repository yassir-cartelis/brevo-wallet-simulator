import React, { useState, useMemo, useCallback } from 'react'
import SIPanel from './components/SIPanel.jsx'
import FluxZone from './components/FluxZone.jsx'
import WalletPanel from './components/WalletPanel.jsx'
import LogPanel from './components/LogPanel.jsx'
import { validate } from './engine/validation.js'
import { buildPayload, buildSimulatedResponse, buildErrorResponse } from './engine/mappingEngine.js'
import { BREVO_SCHEMA } from './data/brevoSchema.js'
import './App.css'

const DEFAULT_FIELDS = [
  { id: 'field_1', name: 'identifiant', type: 'string', value: 'CARD-001', active: true },
  { id: 'field_2', name: 'prenom', type: 'string', value: 'Marie', active: true },
  { id: 'field_3', name: 'nb_points', type: 'number', value: '1200', active: true },
]

const DEFAULT_MAPPINGS = {
  field_1: 'identifier',
  field_2: 'holder.firstName',
  field_3: 'data.loyaltyPoints',
}

let logCounter = 0

export default function App() {
  const [siFields, setSiFields] = useState(DEFAULT_FIELDS)
  const [mappings, setMappings] = useState(DEFAULT_MAPPINGS)
  const [cardConfig, setCardConfig] = useState({ color: '#6366f1', brandName: 'Ma Marque' })
  const [appState, setAppState] = useState('idle') // idle | sending | success | error
  const [logs, setLogs] = useState([])
  const [walletData, setWalletData] = useState(null)
  const [lastResponse, setLastResponse] = useState(null)
  const [cardId, setCardId] = useState('card_42')
  const [projectName, setProjectName] = useState('Mon projet')
  const [editingCardId, setEditingCardId] = useState(false)
  const [editingProject, setEditingProject] = useState(false)

  // Derived: validation + payload, computed live
  const validationResult = useMemo(
    () => validate(siFields, mappings),
    [siFields, mappings]
  )

  const payload = useMemo(
    () => buildPayload(siFields, mappings),
    [siFields, mappings]
  )

  const canSend = !validationResult.isBlocking && appState !== 'sending'

  const handleSend = useCallback(async () => {
    if (!canSend) return

    setAppState('sending')

    // Simulate network latency
    await new Promise(r => setTimeout(r, 600))

    const hasErrors = validationResult.walletErrors.length > 0

    if (hasErrors) {
      const errorResponse = buildErrorResponse(validationResult.walletErrors)
      setLastResponse(errorResponse)
      setAppState('error')

      addLog({
        status: 422,
        endpoint: `/v3/wallet/cards/${cardId}`,
        request: payload,
        response: errorResponse,
        fieldCount: siFields.filter(f => f.active).length
      })

      await new Promise(r => setTimeout(r, 2000))
      setAppState('idle')
    } else {
      const successResponse = buildSimulatedResponse(payload, cardId)
      setLastResponse(successResponse)
      setWalletData(payload)
      setAppState('success')

      addLog({
        status: 200,
        endpoint: `/v3/wallet/cards/${cardId}`,
        request: payload,
        response: successResponse,
        fieldCount: siFields.filter(f => f.active).length
      })

      await new Promise(r => setTimeout(r, 2500))
      setAppState('idle')
    }
  }, [canSend, payload, cardId, siFields, validationResult])

  function addLog(entry) {
    setLogs(prev => [...prev, {
      id: ++logCounter,
      timestamp: new Date().toISOString(),
      ...entry
    }])
  }

  function handleExport() {
    const contract = {
      contract_version: '1.0',
      generated_at: new Date().toISOString(),
      project: projectName,
      flux: 'UPDATE_SI_TO_WALLET',
      endpoint: `PATCH /v3/wallet/cards/${cardId}`,
      si_fields: siFields
        .filter(f => f.active && mappings[f.id])
        .map(f => ({
          si_field: f.name,
          type: f.type,
          maps_to: mappings[f.id],
          example_value: f.value
        })),
      orphan_fields: siFields
        .filter(f => f.active && !mappings[f.id])
        .map(f => ({ si_field: f.name, type: f.type, note: 'Non transmis — aucun mapping défini' })),
      sample_payload: payload,
      validation_rules: Object.entries(BREVO_SCHEMA).map(([field, schema]) => ({
        field,
        required: schema.required,
        type: schema.type,
        ...(schema.format ? { format: schema.format } : {}),
        ...(schema.min !== undefined ? { min: schema.min } : {}),
        description: schema.description
      }))
    }

    const blob = new Blob([JSON.stringify(contract, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contrat-wallet-${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const { isBlocking, walletErrors, siErrors } = validationResult
  const errorCount = walletErrors.length + Object.values(siErrors).filter(e => e.type === 'error').length
  const warningCount = Object.values(siErrors).filter(e => e.type === 'warning').length

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__left">
          <div className="app-logo">
            <div className="app-logo__dot" />
            <span className="app-logo__text">Brevo</span>
            <span className="app-logo__sep">/</span>
            <span className="app-logo__sub">Wallet Simulator</span>
          </div>

          {editingProject ? (
            <input
              className="header-input"
              value={projectName}
              autoFocus
              onChange={e => setProjectName(e.target.value)}
              onBlur={() => setEditingProject(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingProject(false)}
            />
          ) : (
            <button
              className="header-project"
              onClick={() => setEditingProject(true)}
              title="Modifier le nom du projet"
            >
              {projectName}
              <span className="header-project__edit">✎</span>
            </button>
          )}
        </div>

        <div className="app-header__center">
          <div className="header-endpoint">
            <span className="endpoint-method">PATCH</span>
            <span className="endpoint-path">/v3/wallet/cards/</span>
            {editingCardId ? (
              <input
                className="endpoint-input"
                value={cardId}
                autoFocus
                onChange={e => setCardId(e.target.value)}
                onBlur={() => setEditingCardId(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingCardId(false)}
              />
            ) : (
              <button
                className="endpoint-cardid"
                onClick={() => setEditingCardId(true)}
                title="Modifier le cardId"
              >
                {cardId}
                <span className="endpoint-cardid__edit">✎</span>
              </button>
            )}
          </div>
        </div>

        <div className="app-header__right">
          {/* Status indicators */}
          <div className="header-status">
            {errorCount > 0 && (
              <span className="status-pill status-pill--error">
                ✕ {errorCount} erreur{errorCount > 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && errorCount === 0 && (
              <span className="status-pill status-pill--warning">
                ○ {warningCount} warning{warningCount > 1 ? 's' : ''}
              </span>
            )}
            {errorCount === 0 && warningCount === 0 && siFields.some(f => f.active) && (
              <span className="status-pill status-pill--success">
                ✓ Prêt
              </span>
            )}
          </div>

          <button
            className="btn-export"
            onClick={handleExport}
            disabled={Object.keys(payload).length === 0}
            title="Exporter le contrat d'interface en JSON"
          >
            ↓ Exporter contrat
          </button>

          <button
            className={`btn-send ${!canSend ? 'btn-send--disabled' : ''} ${appState === 'sending' ? 'btn-send--sending' : ''}`}
            onClick={handleSend}
            disabled={!canSend}
            title={isBlocking ? 'Corrigez les erreurs avant d\'envoyer' : 'Envoyer la mise à jour simulée'}
          >
            {appState === 'sending' ? (
              <><span className="btn-spinner" /> Envoi…</>
            ) : (
              '▶ Envoyer la mise à jour'
            )}
          </button>
        </div>
      </header>

      {/* Main 3-panel layout */}
      <main className="app-main">
        <SIPanel
          siFields={siFields}
          mappings={mappings}
          validationResult={validationResult}
          onFieldsChange={setSiFields}
          onMappingsChange={setMappings}
        />

        <FluxZone
          appState={appState}
          cardId={cardId}
          payload={payload}
          lastResponse={lastResponse}
        />

        <WalletPanel
          walletData={walletData}
          payload={payload}
          cardConfig={cardConfig}
          onCardConfigChange={setCardConfig}
          validationResult={validationResult}
          appState={appState}
          lastResponse={lastResponse}
          siFields={siFields}
          mappings={mappings}
        />
      </main>

      {/* Log panel */}
      <LogPanel logs={logs} />
    </div>
  )
}
