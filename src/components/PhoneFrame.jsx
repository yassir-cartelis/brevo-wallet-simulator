import React from 'react'

export default function PhoneFrame({ children }) {
  return (
    <div className="phone-frame">
      <div className="phone-frame__shell">
        {/* Side buttons */}
        <div className="phone-frame__btn phone-frame__btn--vol-up" />
        <div className="phone-frame__btn phone-frame__btn--vol-down" />
        <div className="phone-frame__btn phone-frame__btn--power" />

        {/* Screen */}
        <div className="phone-frame__screen">
          {/* Status bar */}
          <div className="phone-frame__status-bar">
            <span className="phone-frame__time">9:41</span>
            <div className="phone-frame__status-icons">
              <span className="phone-frame__signal">▐▐▐</span>
              <span className="phone-frame__battery">▮</span>
            </div>
          </div>

          {/* Wallet header */}
          <div className="phone-frame__wallet-nav">
            <span className="phone-frame__back">‹ Wallet</span>
            <span className="phone-frame__wallet-label">Carte</span>
            <span className="phone-frame__more">•••</span>
          </div>

          {/* Card area */}
          <div className="phone-frame__card-area">
            {children}
          </div>

          {/* Bottom hint */}
          <div className="phone-frame__bottom-hint">
            Appuyez pour plus de détails
          </div>
        </div>

        {/* Home indicator */}
        <div className="phone-frame__home-indicator" />
      </div>
    </div>
  )
}
