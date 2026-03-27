import React from 'react'

const STEPS = [
  {
    number: '01',
    title: 'Authentification OAuth2',
    description: 'Simulez l\'obtention d\'un Bearer token avec vos credentials Captain Wallet.',
    icon: '🔐',
  },
  {
    number: '02',
    title: 'Génération de l\'URL d\'encartement',
    description: 'Construisez l\'URL CTA à intégrer dans vos emails ou SMS pour créer la carte.',
    icon: '🔗',
  },
  {
    number: '03',
    title: 'Mise à jour du pass-owner',
    description: 'Mappez vos champs SI vers le schéma CW et simulez l\'appel PUT API en temps réel.',
    icon: '📲',
  },
]

const CONCEPTS = [
  {
    icon: '📱',
    title: 'Apple Wallet & Google Wallet',
    desc: 'Captain Wallet exploite les wallets natifs des smartphones — aucune app à télécharger pour l\'utilisateur final.',
  },
  {
    icon: '🔄',
    title: 'Technologie PUSH',
    desc: 'Les cartes se mettent à jour instantanément sur le téléphone du client dès que votre SI pousse une mise à jour via API.',
  },
  {
    icon: '🗺️',
    title: 'Mapping SI → CW',
    desc: 'Vos données métier sont transformées en champs Captain Wallet via un schéma précis : root fields, metadatas, counters.',
  },
]

export default function Home({ onStart }) {
  return (
    <div className="home">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="home__hero">
        <div className="home__hero-inner">
          <div className="home__logo">
            <div className="home__logo-dot" />
            <span className="home__logo-cw">Captain Wallet</span>
            <span className="home__logo-sep">by</span>
            <span className="home__logo-brevo">Brevo</span>
            <span className="home__logo-sep">·</span>
            <span className="home__logo-cartelis">Cartelis</span>
          </div>

          <h1 className="home__title">
            Simulez votre intégration<br />
            <span className="home__title-accent">Wallet en 3 étapes</span>
          </h1>

          <p className="home__subtitle">
            Outil de formation interne — configurez vos flux API Captain Wallet,
            testez votre mapping de données et exportez la spécification technique pour vos développeurs.
          </p>

          <button className="btn-cta" onClick={onStart}>
            Démarrer la simulation
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── Ce qu'est Captain Wallet ─────────────────────────────────────────── */}
      <section className="home__section">
        <div className="home__section-inner">
          <h2 className="home__section-title">Captain Wallet, c'est quoi ?</h2>
          <p className="home__section-sub">
            Une solution de dématérialisation de cartes sur les wallets natifs iOS et Android,
            permettant aux marques de maintenir un lien permanent avec leurs clients via leur smartphone.
          </p>

          <div className="home__concepts">
            {CONCEPTS.map((c) => (
              <div key={c.title} className="home__concept-card">
                <div className="home__concept-icon">{c.icon}</div>
                <div className="home__concept-title">{c.title}</div>
                <div className="home__concept-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture simplifiée ──────────────────────────────────────────── */}
      <section className="home__section home__section--alt">
        <div className="home__section-inner">
          <h2 className="home__section-title">Comment ça fonctionne ?</h2>
          <p className="home__section-sub">
            Votre Système d'Information pousse les données vers Captain Wallet via API.
            CW s'occupe du reste : mise à jour de la carte, notification push, gestion des optins.
          </p>

          <div className="home__arch">
            <div className="home__arch-block home__arch-block--si">
              <div className="home__arch-block-icon">🏢</div>
              <div className="home__arch-block-label">Votre SI</div>
              <div className="home__arch-block-sub">Données client, statuts, points...</div>
            </div>
            <div className="home__arch-arrow">
              <div className="home__arch-arrow-line" />
              <div className="home__arch-arrow-label">API REST</div>
            </div>
            <div className="home__arch-block home__arch-block--cw">
              <div className="home__arch-block-icon">⚡</div>
              <div className="home__arch-block-label">Captain Wallet</div>
              <div className="home__arch-block-sub">Traitement & mise à jour</div>
            </div>
            <div className="home__arch-arrow">
              <div className="home__arch-arrow-line" />
              <div className="home__arch-arrow-label">Push natif</div>
            </div>
            <div className="home__arch-block home__arch-block--user">
              <div className="home__arch-block-icon">📱</div>
              <div className="home__arch-block-label">Client final</div>
              <div className="home__arch-block-sub">Apple / Google Wallet</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ce que fait ce simulateur ────────────────────────────────────────── */}
      <section className="home__section">
        <div className="home__section-inner">
          <h2 className="home__section-title">Ce que vous allez simuler</h2>
          <p className="home__section-sub">
            Le simulateur reproduit les 3 étapes clés d'une intégration Captain Wallet,
            dans l'ordre exact où elles se produisent en production.
          </p>

          <div className="home__steps">
            {STEPS.map((step, i) => (
              <div key={step.number} className="home__step">
                <div className="home__step-number">{step.number}</div>
                {i < STEPS.length - 1 && <div className="home__step-connector" />}
                <div className="home__step-icon">{step.icon}</div>
                <div className="home__step-title">{step.title}</div>
                <div className="home__step-desc">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA bas de page ──────────────────────────────────────────────────── */}
      <section className="home__cta-section">
        <div className="home__section-inner home__cta-inner">
          <h2 className="home__cta-title">Prêt à démarrer ?</h2>
          <p className="home__cta-sub">
            Configurez votre projet, simulez les flux et exportez votre spécification technique.
          </p>
          <button className="btn-cta" onClick={onStart}>
            Commencer la simulation
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="home__footer">
        <span>Captain Wallet by Brevo</span>
        <div className="home__footer-dot" />
        <span>Outil interne Cartelis</span>
        <div className="home__footer-dot" />
        <span>Formation & Spécification</span>
      </footer>
    </div>
  )
}
