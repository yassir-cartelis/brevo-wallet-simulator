import React, { useState, useMemo } from 'react'
import { useProject } from '../../context/ProjectContext.jsx'
import InfoBlock from '../InfoBlock.jsx'
import { buildEnrollUrl } from '../../engine/urlSigner.js'

export default function UrlBuilderStep({ onNext, onBack }) {
  const {
    accountId, projectId, environment,
    userIdentifier, setUserIdentifier,
    isAuthenticated, cardCreated, setCardCreated,
  } = useProject()

  const [campaignId, setCampaignId] = useState('loyalty')
  const [channel, setChannel] = useState('email')
  const [tag, setTag] = useState('newsletter')
  const [security, setSecurity] = useState('none')
  const [salt, setSalt] = useState('')
  const [aesKey, setAesKey] = useState('')
  const [aesIv, setAesIv] = useState('')
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(false)

  const enrollUrl = useMemo(() => buildEnrollUrl({
    accountId, projectId, campaignId, userIdentifier,
    channel, tag, security, salt, aesKey, aesIv, environment,
  }), [accountId, projectId, campaignId, userIdentifier, channel, tag, security, salt, aesKey, aesIv, environment])

  function handleCopy() {
    navigator.clipboard.writeText(enrollUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleCreateCard() {
    setCreating(true)
    await new Promise(r => setTimeout(r, 1200))
    setCreating(false)
    setCardCreated(true)
  }

  return (
    <div className="step-layout step-layout--url">
      {/* ── En-tête ───────────────────────────────────────────────────────── */}
      <div className="step-header">
        <div className="step-badge">Étape 2</div>
        <h2 className="step-title">URL Builder — Encartement</h2>
        <p className="step-subtitle">
          L'encartement est le moment où le client clique sur un lien et sa carte est créée
          dans son Apple ou Google Wallet. Configurez et générez l'URL à intégrer dans vos communications.
        </p>

        {!isAuthenticated && (
          <div className="step-warning">
            ⚠ Complétez d'abord l'étape Authentification pour débloquer toutes les fonctionnalités
            <button className="step-warning__link" onClick={onBack}>← Retour à l'Auth</button>
          </div>
        )}
      </div>

      {/* ── Blocs d'information ───────────────────────────────────────────── */}
      <div className="step-infos">
        <InfoBlock title="Qu'est-ce que l'encartement ?" icon="📲" variant="concept" defaultOpen>
          <p>
            L'encartement est le processus de <strong>création de la carte</strong> dans le wallet
            du client final. Il se déclenche quand l'utilisateur clique sur un CTA (bouton ou lien)
            intégré dans un email, SMS, QR code ou page web.
          </p>
          <p>
            Côté technique : lorsque le client clique l'URL, Captain Wallet identifie le porteur
            grâce au <code>user[identifier]</code>, appelle votre API SI pour récupérer les données
            (GetCustomer), puis génère et installe la carte dans le wallet natif.
          </p>
        </InfoBlock>

        <InfoBlock title="Structure de l'URL et paramètres" icon="🔍" variant="info">
          <p>L'URL d'encartement suit ce format :</p>
          <code className="code-inline">
            https://&#123;accountId&#125;.captainwallet.com/&#123;projectId&#125;/&#123;campaignId&#125;<br />
            ?user[identifier]=&#123;valeur&#125;&channel=email&tag=newsletter
          </code>
          <ul>
            <li><code>accountId</code> — identifiant de votre compte CW</li>
            <li><code>projectId</code> — ex: <code>fr_FR</code></li>
            <li><code>campaignId</code> — point d'entrée configuré dans CW (ex: <code>loyalty</code>)</li>
            <li><code>user[identifier]</code> — l'identifiant unique du porteur (pivot)</li>
            <li><code>channel</code> & <code>tag</code> — tracking de la source (optionnel)</li>
          </ul>
        </InfoBlock>

        <InfoBlock title="Sécurisation de l'URL — SHA256 vs AES256" icon="🛡️" variant="warning">
          <p>
            Pour éviter la fraude (accès à la carte d'un autre utilisateur en modifiant l'identifiant),
            il est recommandé de sécuriser l'URL.
          </p>
          <p><strong>SHA256 + SALT (recommandé)</strong> : On ajoute un paramètre <code>signature</code>
            calculé via <code>SHA256(identifier + SALT)</code>. Simple à implémenter.</p>
          <p><strong>AES-256-CBC</strong> : On chiffre le payload complet. Plus sécurisé si vous
            transmettez plusieurs données sensibles dans l'URL.</p>
          <p>⚠️ Les valeurs des paramètres doivent toujours être <strong>URL encodées</strong>.</p>
        </InfoBlock>

        <InfoBlock title="channel & tag — pourquoi les renseigner ?" icon="📊" variant="tip">
          <p>
            Ces paramètres permettent de <strong>mesurer la performance de l'encartement</strong>
            par canal (email, SMS, QR code, web...) dans le dashboard Captain Wallet.
          </p>
          <p>Exemples de valeurs :</p>
          <ul>
            <li><code>channel=email</code>, <code>tag=newsletter_mars</code></li>
            <li><code>channel=sms</code>, <code>tag=campagne_promo</code></li>
            <li><code>channel=web</code>, <code>tag=compte_client</code></li>
          </ul>
        </InfoBlock>
      </div>

      {/* ── Contenu principal ─────────────────────────────────────────────── */}
      <div className="url-layout">
        {/* Formulaire */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Configuration de l'URL</h3>
          </div>
          <div className="card__body">
            <div className="form-group">
              <label className="form-label">Identifiant porteur (user.identifier) <span className="form-required">*</span></label>
              <input
                className="form-input form-input--mono"
                placeholder="ex: 123456789ABCD"
                value={userIdentifier}
                onChange={e => setUserIdentifier(e.target.value)}
              />
              <p className="form-hint">L'identifiant pivot — doit être unique par porteur dans votre SI</p>
            </div>

            <div className="form-group">
              <label className="form-label">Campaign ID <span className="form-required">*</span></label>
              <input
                className="form-input"
                placeholder="ex: loyalty"
                value={campaignId}
                onChange={e => setCampaignId(e.target.value)}
              />
              <p className="form-hint">Entry point configuré dans la plateforme Captain Wallet</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Channel</label>
                <select className="form-select" value={channel} onChange={e => setChannel(e.target.value)}>
                  <option value="email">email</option>
                  <option value="sms">sms</option>
                  <option value="web">web</option>
                  <option value="qrcode">qrcode</option>
                  <option value="push">push</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tag</label>
                <input
                  className="form-input"
                  placeholder="ex: newsletter"
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sécurisation</label>
              <div className="security-tabs">
                {[
                  { val: 'none',   label: 'Aucune' },
                  { val: 'sha256', label: 'SHA256' },
                  { val: 'aes256', label: 'AES-256' },
                ].map(s => (
                  <button
                    key={s.val}
                    className={`security-tab ${security === s.val ? 'security-tab--active' : ''}`}
                    onClick={() => setSecurity(s.val)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {security === 'sha256' && (
              <div className="form-group">
                <label className="form-label">SALT <span className="form-hint-inline">(fourni par CW)</span></label>
                <input className="form-input form-input--mono" placeholder="ex: LmZJLdph,vra{3L" value={salt} onChange={e => setSalt(e.target.value)} />
              </div>
            )}

            {security === 'aes256' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">KEY</label>
                  <input className="form-input form-input--mono" placeholder="Clé AES-256" value={aesKey} onChange={e => setAesKey(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">IV</label>
                  <input className="form-input form-input--mono" placeholder="Vecteur d'init" value={aesIv} onChange={e => setAesIv(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Résultat */}
        <div className="url-result">
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">URL générée</h3>
              {security !== 'none' && (
                <span className={`badge badge--${security === 'sha256' ? 'info' : 'warning'}`}>
                  {security === 'sha256' ? 'SHA256' : 'AES-256'}
                </span>
              )}
            </div>
            <div className="card__body">
              <div className="url-display">
                <code className="url-display__text">{enrollUrl}</code>
                <button className="url-display__copy" onClick={handleCopy} title="Copier">
                  {copied ? '✓ Copié' : '⎘ Copier'}
                </button>
              </div>
            </div>
          </div>

          {/* CTA Preview */}
          <div className="card card--cta-preview">
            <div className="card__header">
              <h3 className="card__title">Aperçu du CTA</h3>
              <span className="badge badge--neutral">Email client</span>
            </div>
            <div className="card__body">
              <div className="email-preview">
                <div className="email-preview__header">
                  <div className="email-preview__subject">Votre commande est en chemin 📦</div>
                  <div className="email-preview__from">noreply@votremarque.com</div>
                </div>
                <div className="email-preview__body">
                  <p>Bonjour,</p>
                  <p>Votre colis est en cours d'acheminement. Suivez sa livraison en temps réel depuis votre smartphone.</p>
                  <div className="email-preview__cta-wrapper">
                    <a
                      className="email-preview__cta"
                      href={enrollUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.preventDefault()}
                      title="Simulation — ce bouton ne redirige pas"
                    >
                      <span className="email-preview__cta-icon">📲</span>
                      Ajouter à mon Wallet
                    </a>
                    <p className="email-preview__cta-hint">
                      En cliquant sur ce bouton, le client est redirigé vers la landing CW
                      qui génère et installe sa carte dans Apple ou Google Wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de simulation de création */}
          {!cardCreated ? (
            <div className="card card--create">
              <div className="card__body card__body--centered">
                <p className="create-hint">
                  Simulez maintenant le clic du client sur le bouton CTA pour créer la carte
                  et passer à l'étape de mise à jour.
                </p>
                <button
                  className={`btn-primary btn-primary--large ${creating ? 'btn-primary--loading' : ''}`}
                  onClick={handleCreateCard}
                  disabled={creating || !userIdentifier}
                >
                  {creating ? (
                    <><span className="btn-spinner" /> Création de la carte…</>
                  ) : (
                    <>📲 Simuler le clic — Créer la carte</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="card card--success">
              <div className="card__body card__body--centered">
                <div className="success-check">✓</div>
                <p className="success-text">
                  Carte créée pour <strong>{userIdentifier}</strong> !<br />
                  Le pass-owner est maintenant enregistré dans Captain Wallet.
                </p>
                <div className="success-actions">
                  <button className="btn-primary" onClick={onNext}>
                    Passer à la mise à jour →
                  </button>
                  <button className="btn-ghost" onClick={() => setCardCreated(false)}>
                    ↺ Recommencer l'encartement
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
