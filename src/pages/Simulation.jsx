import React, { useState } from 'react'
import { useProject } from '../context/ProjectContext.jsx'
import AuthStep from '../components/steps/AuthStep.jsx'
import UrlBuilderStep from '../components/steps/UrlBuilderStep.jsx'
import UpdateStep from '../components/steps/UpdateStep.jsx'

const STEPS = [
  { id: 1, key: 'auth',       label: 'Authentification', icon: '🔐', desc: 'OAuth2 token' },
  { id: 2, key: 'url',        label: 'URL Builder',       icon: '🔗', desc: 'Encartement' },
  { id: 3, key: 'update',     label: 'Mise à jour',       icon: '📲', desc: 'Update pass-owner' },
]

export default function Simulation({ onHome }) {
  const [currentStep, setCurrentStep] = useState(1)
  const { isAuthenticated, cardCreated, projectName, setProjectName } = useProject()
  const [editingName, setEditingName] = useState(false)

  function stepStatus(stepId) {
    if (stepId === 1) return isAuthenticated ? 'done' : 'active'
    if (stepId === 2) return cardCreated ? 'done' : isAuthenticated ? 'active' : 'locked'
    if (stepId === 3) return cardCreated ? 'active' : 'locked'
    return 'pending'
  }

  return (
    <div className="simulation">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="sim-header">
        <div className="sim-header__left">
          <button className="sim-header__back" onClick={onHome} title="Retour à l'accueil">
            ← Accueil
          </button>
          <div className="sim-header__logo">
            <div className="sim-header__dot" />
            <span>Captain Wallet</span>
            <span className="sim-header__sep">/</span>
            <span className="sim-header__sub">Simulateur</span>
          </div>
        </div>

        <div className="sim-header__center">
          {editingName ? (
            <input
              className="sim-header__project-input"
              value={projectName}
              autoFocus
              onChange={e => setProjectName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
            />
          ) : (
            <button className="sim-header__project" onClick={() => setEditingName(true)}>
              {projectName}
              <span className="sim-header__edit">✎</span>
            </button>
          )}
        </div>

        <div className="sim-header__right">
          <div className={`sim-header__auth-badge ${isAuthenticated ? 'sim-header__auth-badge--ok' : ''}`}>
            {isAuthenticated ? '● Connecté' : '○ Non connecté'}
          </div>
        </div>
      </header>

      {/* ── Stepper ────────────────────────────────────────────────────────── */}
      <nav className="stepper">
        {STEPS.map((step, i) => {
          const status = stepStatus(step.id)
          const isActive = currentStep === step.id
          return (
            <React.Fragment key={step.id}>
              <button
                className={`stepper__step ${isActive ? 'stepper__step--active' : ''} stepper__step--${status}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="stepper__bubble">
                  {status === 'done' ? '✓' : step.icon}
                </div>
                <div className="stepper__info">
                  <div className="stepper__label">{step.label}</div>
                  <div className="stepper__desc">{step.desc}</div>
                </div>
                {status === 'locked' && <span className="stepper__lock">🔒</span>}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`stepper__connector ${stepStatus(step.id) === 'done' ? 'stepper__connector--done' : ''}`} />
              )}
            </React.Fragment>
          )
        })}
      </nav>

      {/* ── Step content ───────────────────────────────────────────────────── */}
      <main className="sim-main">
        {currentStep === 1 && (
          <AuthStep onNext={() => setCurrentStep(2)} />
        )}
        {currentStep === 2 && (
          <UrlBuilderStep
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <UpdateStep onBack={() => setCurrentStep(2)} />
        )}
      </main>
    </div>
  )
}
