import React, { useState } from 'react'

export default function InfoBlock({
  title,
  icon = '💡',
  defaultOpen = false,
  variant = 'info', // info | tip | warning | concept
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`info-block info-block--${variant}`}>
      <button className="info-block__header" onClick={() => setOpen(!open)}>
        <span className="info-block__icon">{icon}</span>
        <span className="info-block__title">{title}</span>
        <span className={`info-block__chevron ${open ? 'info-block__chevron--open' : ''}`}>
          ›
        </span>
      </button>
      {open && (
        <div className="info-block__body">
          {children}
        </div>
      )}
    </div>
  )
}
