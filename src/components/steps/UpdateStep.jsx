import React, { useState, useMemo, useCallback } from 'react'
import { useProject } from '../../context/ProjectContext.jsx'
import InfoBlock from '../InfoBlock.jsx'
import PhoneFrame from '../PhoneFrame.jsx'
import WalletCard from '../WalletCard.jsx'
import { CW_MAPPING_SUGGESTIONS, FIELD_TYPES, getMappingGroup } from '../../data/cwSchema.js'
import { buildCWPayload, buildSuccessResponse, buildErrorResponse } from '../../engine/cwPayloadBuilder.js'
import { validateCW } from '../../engine/cwValidation.js'
import { generateMarkdownSpec } from '../../engine/specGenerator.js'

let fieldCounter = 10

const DEFAULT_FIELDS = [
  { id: 'f1', name: 'identifiant',  type: 'string', value: 'USER-001',    active: true, showOnCard: false },
  { id: 'f2', name: 'marque',       type: 'string', value: 'Mon Enseigne', active: true, showOnCard: true  },
  { id: 'f3', name: 'prenom',       type: 'string', value: 'Marie',        active: true, showOnCard: true  },
  { id: 'f4', name: 'nom',          type: 'string', value: 'Dupont',       active: true, showOnCard: true  },
  { id: 'f5', name: 'nb_points',    type: 'number', value: '1200',         active: true, showOnCard: true  },
]

const DEFAULT_MAPPINGS = {
  f1: 'identifier',
  f2: 'metadatas.brand',
  f3: 'firstname',
  f4: 'lastname',
  f5: 'counters.points',
}

// ── Field Row ──────────────────────────────────────────────────────────────────
function FieldRow({ field, mapping, error, onChange, onMappingChange, onRemove }) {
  const group = getMappingGroup(mapping)
  const errorType = error?.type

  return (
    <div className={`si-field ${errorType === 'error' ? 'si-field--error' : errorType === 'warning' ? 'si-field--warning' : ''}`}>
      <div className="si-field__top">
        {/* Toggle actif */}
        <button
          className={`toggle ${field.active ? 'toggle--on' : ''}`}
          onClick={() => onChange(field.id, 'active', !field.active)}
          title={field.active ? 'Désactiver' : 'Activer'}
        >
          <span className="toggle__knob" />
        </button>

        {/* Nom */}
        <input
          className="si-input si-input--name"
          placeholder="nom_champ"
          value={field.name}
          onChange={e => onChange(field.id, 'name', e.target.value)}
          disabled={!field.active}
        />

        {/* Type */}
        <select
          className="si-select"
          value={field.type}
          onChange={e => onChange(field.id, 'type', e.target.value)}
          disabled={!field.active}
        >
          {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Valeur */}
        <input
          className={`si-input si-input--value ${errorType === 'error' ? 'si-input--invalid' : ''}`}
          placeholder="valeur de test"
          value={field.value}
          onChange={e => onChange(field.id, 'value', e.target.value)}
          disabled={!field.active}
        />

        {/* Show on card */}
        <button
          className={`show-card-toggle ${field.showOnCard && field.active ? 'show-card-toggle--on' : ''}`}
          onClick={() => onChange(field.id, 'showOnCard', !field.showOnCard)}
          title={field.showOnCard ? 'Masquer de la carte' : 'Afficher sur la carte'}
          disabled={!field.active}
        >
          {field.showOnCard && field.active ? '👁' : '🙈'}
        </button>

        {/* Supprimer */}
        <button className="si-field__remove" onClick={() => onRemove(field.id)}>×</button>
      </div>

      {/* Mapping */}
      <div className="si-field__mapping">
        <span className="si-field__arrow">↳</span>
        <input
          list={`cw-fields-${field.id}`}
          className={`si-input si-input--mapping ${!mapping ? 'si-input--empty' : ''} si-input--group-${group || 'none'}`}
          placeholder="Champ CW — ex: metadatas.status"
          value={mapping || ''}
          onChange={e => onMappingChange(field.id, e.target.value || null)}
          disabled={!field.active}
          autoComplete="off"
        />
        <datalist id={`cw-fields-${field.id}`}>
          {CW_MAPPING_SUGGESTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.description}{opt.required ? ' (requis)' : ''}</option>
          ))}
        </datalist>
        {mapping && (
          <span className={`mapping-badge mapping-badge--${group || 'root'}`}>
            {group || 'root'}
          </span>
        )}
      </div>

      {error?.message && (
        <div className={`si-field__msg si-field__msg--${errorType}`}>
          {errorType === 'error' ? '⚠' : '○'} {error.message}
        </div>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function UpdateStep({ onBack }) {
  const { token, isAuthenticated, accountId, projectId, projectName, userIdentifier, updateEndpoint, tokenEndpoint, baseApiUrl, environment } = useProject()

  const [siFields, setSiFields] = useState(DEFAULT_FIELDS)
  const [mappings, setMappings] = useState(DEFAULT_MAPPINGS)
  const [appState, setAppState] = useState('idle') // idle | sending | success | error
  const [lastStatus, setLastStatus] = useState(null) // 'success' | 'error' — persiste après retour idle
  const [lastResponse, setLastResponse] = useState(null)
  const [sentPayload, setSentPayload] = useState(null)
  const [logs, setLogs] = useState([])

  const payload = useMemo(() => buildCWPayload(siFields, mappings), [siFields, mappings])
  const validation = useMemo(() => validateCW(siFields, mappings, token), [siFields, mappings, token])

  const fieldVisibility = useMemo(() => {
    const vis = {}
    siFields.forEach(f => {
      if (f.active && f.showOnCard && mappings[f.id]) {
        vis[mappings[f.id]] = true
      }
    })
    return vis
  }, [siFields, mappings])

  // Build walletData from payload filtered by showOnCard
  const walletDisplayData = useMemo(() => {
    if (!payload) return {}
    const result = {}
    siFields.forEach(f => {
      if (!f.active || !f.showOnCard || !mappings[f.id]) return
      const path = mappings[f.id]
      if (path === 'firstname') result.firstname = f.value
      else if (path === 'lastname') result.lastname = f.value
      else if (path === 'email') result.email = f.value
      else if (path.startsWith('metadatas.')) {
        if (!result.metadatas) result.metadatas = {}
        result.metadatas[path.slice('metadatas.'.length)] = f.value
      } else if (path.startsWith('counters.')) {
        if (!result.counters) result.counters = {}
        result.counters[path.slice('counters.'.length)] = f.value
      }
    })
    return result
  }, [siFields, mappings])

  function addField() {
    const id = `f${++fieldCounter}`
    setSiFields(prev => [...prev, { id, name: '', type: 'string', value: '', active: true, showOnCard: false }])
  }

  function updateField(id, key, value) {
    setSiFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f))
  }

  function removeField(id) {
    setSiFields(prev => prev.filter(f => f.id !== id))
    setMappings(prev => { const m = { ...prev }; delete m[id]; return m })
  }

  function updateMapping(fieldId, path) {
    setMappings(prev => ({ ...prev, [fieldId]: path }))
  }

  const handleSend = useCallback(async () => {
    if (validation.isBlocking || appState === 'sending') return

    setAppState('sending')
    setSentPayload(null)
    setLastResponse(null)
    await new Promise(r => setTimeout(r, 800))

    const payloadToSend = { ...payload }
    setSentPayload(payloadToSend)

    const hasErrors = validation.payloadErrors.length > 0
    let response

    if (hasErrors) {
      const err = validation.payloadErrors[0]
      response = buildErrorResponse(err.code || 422, err.message, validation.payloadErrors)
      setLastResponse(response)
      setLastStatus('error')
      setAppState('error')
      setLogs(prev => [...prev, {
        id: Date.now(), timestamp: new Date().toISOString(),
        method: 'PUT', status: err.code || 422,
        endpoint: updateEndpoint, request: payloadToSend, response,
      }])
      await new Promise(r => setTimeout(r, 2500))
    } else {
      response = buildSuccessResponse(payloadToSend, userIdentifier)
      setLastResponse(response)
      setLastStatus('success')
      setAppState('success')
      setLogs(prev => [...prev, {
        id: Date.now(), timestamp: new Date().toISOString(),
        method: 'PUT', status: 200,
        endpoint: updateEndpoint, request: payloadToSend, response,
      }])
      await new Promise(r => setTimeout(r, 3000))
    }

    setAppState('idle')
  }, [validation, appState, payload, updateEndpoint, userIdentifier])

  const canSend = !validation.isBlocking && appState !== 'sending'

  function handleDownloadSpec() {
    const md = generateMarkdownSpec({
      projectName, accountId, projectId, environment,
      baseApiUrl, tokenEndpoint, updateEndpoint, userIdentifier,
      siFields, mappings, payload,
    })
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spec-wallet-${accountId}-${projectId}-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="step-layout step-layout--update">
      {/* ── En-tête ───────────────────────────────────────────────────────── */}
      <div className="step-header">
        <div className="step-header__top">
          <div className="step-badge">Étape 3</div>
          <button className="btn-spec" onClick={handleDownloadSpec} title="Télécharger la spécification Markdown">
            ↓ Générer la spéc (.md)
          </button>
        </div>
        <h2 className="step-title">Mise à jour du pass-owner</h2>
        <p className="step-subtitle">
          Votre SI pousse les données vers Captain Wallet via un appel <code>PUT</code>.
          Configurez vos champs source, mappez-les vers le schéma CW et simulez l'envoi.
        </p>
        {!isAuthenticated && (
          <div className="step-warning">
            ⚠ Token manquant — retournez à l'étape Auth
            <button className="step-warning__link" onClick={onBack}>← Auth</button>
          </div>
        )}
      </div>

      {/* ── Blocs guide ───────────────────────────────────────────────────── */}
      <div className="step-infos">
        <InfoBlock title="Qu'est-ce qu'un pass-owner ?" icon="👤" variant="concept" defaultOpen>
          <p>
            Dans Captain Wallet, un <strong>pass-owner</strong> représente le porteur de carte —
            c'est l'entité centrale autour de laquelle tout est organisé.
            Chaque pass-owner est identifié par un <code>identifier</code> unique (votre pivot SI→CW).
          </p>
          <p>
            Quand vous mettez à jour un pass-owner, CW met automatiquement à jour
            <strong> toutes les cartes associées</strong> sur les wallets des clients
            (plusieurs appareils possibles).
          </p>
        </InfoBlock>

        <InfoBlock title="Structure du payload — root fields vs metadatas" icon="🗂️" variant="info">
          <p>Le payload se divise en plusieurs zones :</p>
          <ul>
            <li>
              <strong>Champs root</strong> (<code>firstname</code>, <code>lastname</code>, <code>email</code>, <code>store</code>) :
              champs natifs CW, directement reconnus et indexés.
            </li>
            <li>
              <strong>metadatas</strong> : dictionnaire libre de clés/valeurs pour vos données métier
              spécifiques (statut livraison, numéro commande, etc.).
              Mapping : <code>metadatas.nomDuChamp</code>
            </li>
            <li>
              <strong>counters</strong> : compteurs numériques affichés sur la carte
              (points de fidélité, tampons...).
              Mapping : <code>counters.points</code>
            </li>
          </ul>
        </InfoBlock>

        <InfoBlock title="L'icône 👁 — afficher sur la carte" icon="👁" variant="tip">
          <p>
            Le toggle <strong>👁</strong> sur chaque champ contrôle si la valeur est
            rendue visible dans l'aperçu de la carte à droite.
          </p>
          <p>
            Tous les champs mappés sont envoyés dans le payload, mais tous ne sont pas
            forcément visibles sur la carte physique — certains sont des données
            internes (identifiant pivot, référence magasin, etc.).
          </p>
        </InfoBlock>

        <InfoBlock title="Règles de validation et codes d'erreur" icon="⚠️" variant="warning">
          <p>L'API Captain Wallet retourne les codes suivants :</p>
          <ul>
            <li><strong>401 Unauthorized</strong> — Token Bearer manquant ou invalide</li>
            <li><strong>400 Bad Request</strong> — Payload vide ou mal formé</li>
            <li><strong>422 Unprocessable Entity</strong> — Champ requis manquant (<code>identifier</code>) ou format invalide</li>
            <li><strong>200 OK</strong> — Mise à jour réussie, JSON du pass-owner retourné</li>
          </ul>
          <p>
            ⚠️ Les mises à jour ne sont envoyées que pour les pass-owners dont
            <code> optinWallet = true</code> et dont une donnée a changé.
          </p>
        </InfoBlock>
      </div>

      {/* ── Layout 3 colonnes ─────────────────────────────────────────────── */}
      <div className="update-layout">
        {/* ── Colonne gauche : SI Fields ──────────────────────────────────── */}
        <div className="update-col update-col--left">
          <div className="panel">
            <div className="panel__header">
              <div className="panel__header-left">
                <span className="panel__badge panel__badge--si">SI CLIENT</span>
                <span className="panel__title">Champs source</span>
              </div>
              <div className="panel__header-right">
                {Object.values(validation.siErrors).filter(e => e.type === 'error').length > 0 && (
                  <span className="badge badge--error">
                    {Object.values(validation.siErrors).filter(e => e.type === 'error').length} erreur(s)
                  </span>
                )}
              </div>
            </div>
            <div className="panel__body">
              <div className="si-fields-legend">
                <span>Actif</span>
                <span>Nom</span>
                <span>Type</span>
                <span>Valeur test</span>
                <span title="Afficher sur la carte">Carte</span>
              </div>
              <div className="si-fields">
                {siFields.map(field => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    mapping={mappings[field.id]}
                    error={validation.siErrors[field.id]}
                    onChange={updateField}
                    onMappingChange={updateMapping}
                    onRemove={removeField}
                  />
                ))}
              </div>
              <button className="btn-add-field" onClick={addField}>+ Ajouter un champ SI</button>
            </div>
          </div>
        </div>

        {/* ── Colonne centre : Payload + Flux ─────────────────────────────── */}
        <div className="update-col update-col--center">
          <div className="panel">
            <div className="panel__header">
              <span className="panel__badge panel__badge--api">API CW</span>
              <span className="panel__title">Payload construit</span>
            </div>
            <div className="panel__body">
              {/* Endpoint */}
              <div className="endpoint-block">
                <span className="endpoint-method endpoint-method--put">PUT</span>
                <code className="endpoint-url">{updateEndpoint}</code>
              </div>
              <div className="endpoint-auth">
                <span className="endpoint-auth__label">Authorization:</span>
                <span className="endpoint-auth__val">
                  Bearer {token ? `${token.slice(0, 30)}…` : '⚠ token manquant'}
                </span>
              </div>

              {/* Payload live */}
              <div className="payload-preview">
                <div className="payload-preview__label">
                  Payload en cours de construction
                  <span className="payload-preview__count">
                    {siFields.filter(f => f.active && mappings[f.id]).length} champ(s) mappé(s)
                  </span>
                </div>
                <pre className="payload-preview__code">
                  {Object.keys(payload).length > 0
                    ? JSON.stringify(payload, null, 2)
                    : '// Aucun champ mappé'}
                </pre>
              </div>

              {/* Erreurs / warnings */}
              {validation.payloadErrors.length > 0 && (
                <div className="validation-errors">
                  {validation.payloadErrors.map((e, i) => (
                    <div key={i} className="validation-errors__item validation-errors__item--error">
                      ⚠ [{e.code}] {e.message}
                    </div>
                  ))}
                </div>
              )}
              {validation.payloadWarnings.length > 0 && validation.payloadErrors.length === 0 && (
                <div className="validation-errors">
                  {validation.payloadWarnings.map((w, i) => (
                    <div key={i} className="validation-errors__item validation-errors__item--warning">
                      ○ {w.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton send */}
              <button
                className={`btn-send ${!canSend ? 'btn-send--disabled' : ''} ${appState === 'sending' ? 'btn-send--sending' : ''} ${appState === 'success' ? 'btn-send--success' : ''} ${appState === 'error' ? 'btn-send--error' : ''}`}
                onClick={handleSend}
                disabled={!canSend}
              >
                {appState === 'sending' ? (
                  <><span className="btn-spinner" /> Envoi en cours…</>
                ) : appState === 'success' ? (
                  '✓ Mise à jour envoyée'
                ) : appState === 'error' ? (
                  '✕ Erreur — voir la réponse'
                ) : (
                  '▶ Envoyer la mise à jour'
                )}
              </button>

              {/* Animation flux */}
              {appState === 'sending' && (
                <div className="flux-anim">
                  <div className="flux-anim__label">SI Client</div>
                  <div className="flux-anim__line">
                    <div className="flux-anim__dot" />
                  </div>
                  <div className="flux-anim__label">CW API</div>
                </div>
              )}

              {/* Réponse */}
              {lastResponse && appState !== 'sending' && (
                <div className={`response-block response-block--${lastStatus}`}>
                  <div className="response-block__header">
                    <span className={`badge badge--${lastStatus === 'success' ? 'success' : 'error'}`}>
                      {lastResponse.status} {lastStatus === 'success' ? 'OK' : 'Error'}
                    </span>
                    <span className="response-block__endpoint">{updateEndpoint}</span>
                  </div>
                  <div className="response-block__label">
                    {lastStatus === 'success'
                      ? '✓ Voici ce que CW a reçu et retourné :'
                      : '✕ Erreur retournée par l\'API :'}
                  </div>
                  <pre className="payload-preview__code payload-preview__code--response">
                    {JSON.stringify(lastResponse.body, null, 2)}
                  </pre>
                  {sentPayload && lastStatus === 'success' && (
                    <div className="response-block__sent">
                      <div className="response-block__label">Payload envoyé :</div>
                      <pre className="payload-preview__code payload-preview__code--sent">
                        {JSON.stringify(sentPayload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Colonne droite : Téléphone + Carte ──────────────────────────── */}
        <div className="update-col update-col--right">
          <div className="panel panel--phone">
            <div className="panel__header">
              <span className="panel__badge panel__badge--wallet">WALLET</span>
              <span className="panel__title">Aperçu carte</span>
            </div>
            <div className="panel__body panel__body--phone">
              <PhoneFrame>
                <WalletCard
                  walletData={walletDisplayData}
                  animating={appState === 'success'}
                />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </div>

      {/* ── Log panel ────────────────────────────────────────────────────── */}
      {logs.length > 0 && (
        <div className="log-panel">
          <div className="log-panel__header">
            Historique des appels ({logs.length})
          </div>
          <div className="log-panel__entries">
            {[...logs].reverse().map(log => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LogEntry({ log }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`log-entry log-entry--${log.status === 200 ? 'success' : 'error'}`}>
      <button className="log-entry__summary" onClick={() => setOpen(o => !o)}>
        <span className={`log-badge log-badge--${log.status === 200 ? 'success' : 'error'}`}>{log.status}</span>
        <span className="log-method">{log.method}</span>
        <span className="log-endpoint">{log.endpoint}</span>
        <span className="log-time">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
        <span className="log-chevron">{open ? '▾' : '›'}</span>
      </button>
      {open && (
        <div className="log-entry__detail">
          <div className="log-detail-col">
            <div className="log-detail-label">Request</div>
            <pre className="log-detail-code">{JSON.stringify(log.request, null, 2)}</pre>
          </div>
          <div className="log-detail-col">
            <div className="log-detail-label">Response</div>
            <pre className="log-detail-code">{JSON.stringify(log.response?.body ?? log.response, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
