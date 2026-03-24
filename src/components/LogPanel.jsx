import React, { useState, useRef, useEffect } from 'react'

function LogEntry({ entry }) {
  const [expanded, setExpanded] = useState(false)
  const isSuccess = entry.status === 200
  const ts = new Date(entry.timestamp)
  const timeStr = ts.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className={`log-entry ${expanded ? 'log-entry--expanded' : ''}`}>
      <div className="log-entry__row" onClick={() => setExpanded(!expanded)}>
        <span className="log-time mono">{timeStr}</span>
        <span className="log-method">PATCH</span>
        <span className="log-path mono">{entry.endpoint}</span>
        <span className={`log-status log-status--${isSuccess ? 'success' : 'error'}`}>
          {entry.status}
        </span>
        <span className="log-fields">{entry.fieldCount} champ{entry.fieldCount !== 1 ? 's' : ''}</span>
        <span className="log-toggle">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="log-entry__detail">
          <div className="log-detail-cols">
            <div className="log-detail-col">
              <div className="log-detail-label">Request</div>
              <pre className="log-detail-json mono">{JSON.stringify(entry.request, null, 2)}</pre>
            </div>
            <div className="log-detail-col">
              <div className="log-detail-label">Response</div>
              <pre className={`log-detail-json mono log-detail-json--${isSuccess ? 'success' : 'error'}`}>
                {JSON.stringify(entry.response, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LogPanel({ logs }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    if (logs.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs.length])

  return (
    <div className="log-panel">
      <div className="log-panel__header">
        <span className="log-panel__title">Journal des flux</span>
        <span className="log-panel__count">{logs.length} requête{logs.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="log-panel__body">
        {logs.length === 0 ? (
          <div className="log-empty">
            Aucune simulation lancée — configurez vos champs et cliquez sur <strong>Envoyer</strong>
          </div>
        ) : (
          <>
            {logs.map(entry => (
              <LogEntry key={entry.id} entry={entry} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  )
}
