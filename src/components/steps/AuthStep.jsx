import React, { useState, useRef } from 'react'
import { useProject } from '../../context/ProjectContext.jsx'
import InfoBlock from '../InfoBlock.jsx'

export default function AuthStep({ onNext }) {
  const {
    accountId, setAccountId,
    projectId, setProjectId,
    environment, setEnvironment,
    clientId, setClientId,
    clientSecret, setClientSecret,
    token, isAuthenticated,
    simulateAuth,
    tokenEndpoint,
  } = useProject()

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [showSecret, setShowSecret] = useState(false)
  const successRef = useRef(null)

  async function handleAuth() {
    if (!accountId || !projectId) return
    setLoading(true)
    setResponse(null)
    await new Promise(r => setTimeout(r, 900))
    const t = simulateAuth()
    setResponse({
      token_type: 'Bearer',
      expires_in: 3600,
      access_token: t,
    })
    setLoading(false)
    setTimeout(() => successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  const requestPayload = {
    client_id: clientId || '[votre client_id]',
    client_secret: clientSecret ? '••••••••' : '[votre client_secret]',
    grant_type: 'client_credentials',
    scope: 'pass-owner webhooks',
  }

  const canSubmit = accountId && projectId

  return (
    <div className="step-layout step-layout--auth">
      {/* ── En-tête de l'étape ────────────────────────────────────────────── */}
      <div className="step-header">
        <div className="step-badge">Étape 1</div>
        <h2 className="step-title">Authentification OAuth2</h2>
        <p className="step-subtitle">
          Avant tout appel API, Captain Wallet exige un token d'authentification.
          Configurez votre environnement et vos credentials pour simuler l'obtention du token.
        </p>
      </div>

      {/* ── Blocs d'information ───────────────────────────────────────────── */}
      <div className="step-infos">
        <InfoBlock title="Pourquoi s'authentifier ?" icon="🔐" variant="concept">
          <p>
            L'API Captain Wallet est protégée par le standard <strong>OAuth 2.0</strong>.
            Chaque requête (mise à jour de carte, anonymisation...) doit inclure un
            <code>Authorization: Bearer {'{token}'}</code> dans ses headers.
          </p>
          <p>
            Sans token valide, l'API renvoie une erreur <strong>401 Unauthorized</strong>
            et la requête est rejetée. C'est la première chose à configurer dans votre intégration.
          </p>
        </InfoBlock>

        <InfoBlock title="Comment fonctionne OAuth2 client_credentials ?" icon="⚙️" variant="info">
          <p>
            Le flux <strong>client_credentials</strong> est utilisé pour des communications
            machine-à-machine (votre SI → CW API), sans intervention de l'utilisateur final.
          </p>
          <ol>
            <li>Votre SI envoie un <code>POST /oauth/token</code> avec <code>client_id</code> et <code>client_secret</code></li>
            <li>CW répond avec un <code>access_token</code> (Bearer JWT)</li>
            <li>Ce token est inclus dans tous les appels suivants pendant <strong>3600 secondes</strong></li>
            <li>À expiration, votre SI demande un nouveau token (le mettre en cache !)</li>
          </ol>
        </InfoBlock>

        <InfoBlock title="Client ID & Client Secret" icon="🗝️" variant="tip">
          <p>
            Ces identifiants sont fournis par Captain Wallet lors de l'onboarding du projet.
            Ils sont disponibles dans la plateforme CW sous <strong>Project settings → API credentials</strong>.
          </p>
          <p>
            ⚠️ Le <code>client_secret</code> ne doit jamais être exposé côté client (navigateur, app mobile).
            Il doit rester côté serveur dans votre SI.
          </p>
          <p>
            Dans ce simulateur, ces champs sont optionnels — le token est simulé localement.
          </p>
        </InfoBlock>

        <InfoBlock title="DEV vs PROD — quand utiliser chaque environnement ?" icon="🌍" variant="tip">
          <p><strong>DEV (pré-production)</strong> : <code>https://qlf-api.captainwallet.com</code></p>
          <p>À utiliser pendant la phase d'intégration et de recette. Les cartes créées ne sont pas réelles.</p>
          <p><strong>PROD (production)</strong> : <code>https://api.captainwallet.com</code></p>
          <p>À utiliser uniquement après validation complète de la recette avec Captain Wallet.</p>
        </InfoBlock>
      </div>

      {/* ── Contenu principal ─────────────────────────────────────────────── */}
      <div className="auth-layout">
        {/* Formulaire */}
        <div className="auth-form card">
          <div className="card__header">
            <h3 className="card__title">Configuration du projet</h3>
          </div>
          <div className="card__body">
            <div className="form-group">
              <label className="form-label">Environnement</label>
              <div className="env-toggle">
                <button
                  className={`env-toggle__btn ${environment === 'DEV' ? 'env-toggle__btn--active' : ''}`}
                  onClick={() => setEnvironment('DEV')}
                >
                  DEV
                </button>
                <button
                  className={`env-toggle__btn ${environment === 'PROD' ? 'env-toggle__btn--active' : ''}`}
                  onClick={() => setEnvironment('PROD')}
                >
                  PROD
                </button>
              </div>
              <p className="form-hint">
                {environment === 'DEV'
                  ? 'qlf-api.captainwallet.com — environnement de recette'
                  : 'api.captainwallet.com — environnement de production'}
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Account ID <span className="form-required">*</span></label>
                <input
                  className="form-input"
                  placeholder="ex: colissimo"
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Project ID <span className="form-required">*</span></label>
                <input
                  className="form-input"
                  placeholder="ex: fr_FR"
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Client ID <span className="form-optional">(optionnel)</span></label>
              <input
                className="form-input form-input--mono"
                placeholder="[TBD — fourni par Captain Wallet]"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Client Secret <span className="form-optional">(optionnel)</span></label>
              <div className="form-input-row">
                <input
                  className="form-input form-input--mono"
                  type={showSecret ? 'text' : 'password'}
                  placeholder="[TBD — fourni par voie sécurisée]"
                  value={clientSecret}
                  onChange={e => setClientSecret(e.target.value)}
                />
                <button className="form-eye" onClick={() => setShowSecret(s => !s)}>
                  {showSecret ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              className={`btn-primary btn-primary--full ${loading ? 'btn-primary--loading' : ''}`}
              onClick={handleAuth}
              disabled={!canSubmit || loading}
            >
              {loading ? (
                <><span className="btn-spinner" /> Obtention du token…</>
              ) : isAuthenticated ? (
                '↺ Renouveler le token'
              ) : (
                '🔐 Obtenir un token'
              )}
            </button>

            {!canSubmit && (
              <p className="form-hint form-hint--warn">
                ⚠ Renseignez l'Account ID et le Project ID pour continuer
              </p>
            )}
          </div>
        </div>

        {/* Requête / Réponse simulée */}
        <div className="auth-simulation">
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Requête simulée</h3>
              <span className="badge badge--method">POST</span>
            </div>
            <div className="card__body">
              <div className="code-block">
                <div className="code-block__url">
                  <span className="code-method">POST</span>
                  <span className="code-url">{tokenEndpoint}</span>
                </div>
                <div className="code-block__headers">
                  <span className="code-key">Content-Type:</span> <span className="code-val">application/json</span><br />
                  <span className="code-key">Accept:</span> <span className="code-val">application/json</span>
                </div>
                <pre className="code-block__body">{JSON.stringify(requestPayload, null, 2)}</pre>
              </div>
            </div>
          </div>

          <div className={`card ${response ? 'card--response' : ''}`}>
            <div className="card__header">
              <h3 className="card__title">Réponse</h3>
              {response && <span className="badge badge--success">200 OK</span>}
            </div>
            <div className="card__body">
              {!response && !loading && (
                <div className="empty-state">
                  <span className="empty-state__icon">⏳</span>
                  <span className="empty-state__text">En attente de la requête…</span>
                </div>
              )}
              {loading && (
                <div className="empty-state">
                  <span className="btn-spinner btn-spinner--lg" />
                  <span className="empty-state__text">Authentification en cours…</span>
                </div>
              )}
              {response && !loading && (
                <pre className="code-block__body code-block__body--success">
                  {JSON.stringify(response, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <div className="auth-success" ref={successRef}>
              <div className="auth-success__icon">✓</div>
              <div className="auth-success__text">
                <strong>Token obtenu avec succès</strong>
                <span>Vous pouvez maintenant passer à l'étape suivante</span>
              </div>
              <button className="btn-primary" onClick={onNext}>
                Étape suivante →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
