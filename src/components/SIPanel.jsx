import React, { useState } from 'react'
import { BREVO_FIELD_OPTIONS, FIELD_TYPES } from '../data/brevoSchema.js'

let fieldCounter = 3

function FieldRow({ field, mapping, error, onChange, onMappingChange, onRemove }) {
  const errorType = error?.type
  const errorMsg = error?.message

  return (
    <div className={`si-field ${errorType === 'error' ? 'si-field--error' : errorType === 'warning' ? 'si-field--warning' : ''}`}>
      <div className="si-field__top">
        <div className="si-field__toggle">
          <button
            className={`toggle ${field.active ? 'toggle--on' : ''}`}
            onClick={() => onChange(field.id, 'active', !field.active)}
            title={field.active ? 'Désactiver' : 'Activer'}
          >
            <span className="toggle__knob" />
          </button>
        </div>

        <div className="si-field__inputs">
          <input
            className="si-input si-input--name"
            placeholder="nom_champ"
            value={field.name}
            onChange={e => onChange(field.id, 'name', e.target.value)}
          />
          <select
            className="si-select si-select--type"
            value={field.type}
            onChange={e => onChange(field.id, 'type', e.target.value)}
          >
            {FIELD_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            className={`si-input si-input--value ${errorType === 'error' ? 'si-input--invalid' : ''}`}
            placeholder="valeur de test"
            value={field.value}
            onChange={e => onChange(field.id, 'value', e.target.value)}
          />
        </div>

        <button
          className="si-field__remove"
          onClick={() => onRemove(field.id)}
          title="Supprimer"
        >
          ×
        </button>
      </div>

      {/* Mapping row */}
      <div className="si-field__mapping">
        <span className="si-field__arrow">↳</span>
        <select
          className={`si-select si-select--mapping ${!mapping ? 'si-select--empty' : ''}`}
          value={mapping || ''}
          onChange={e => onMappingChange(field.id, e.target.value || null)}
          disabled={!field.active}
        >
          <option value="">— Choisir un champ Brevo —</option>
          {BREVO_FIELD_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.value}{opt.required ? ' *' : ''} — {opt.description}
            </option>
          ))}
        </select>
        {mapping && (
          <span className="si-field__mapping-type">
            {BREVO_FIELD_OPTIONS.find(o => o.value === mapping)?.type}
          </span>
        )}
      </div>

      {/* Error/Warning message */}
      {errorMsg && (
        <div className={`si-field__msg si-field__msg--${errorType}`}>
          {errorType === 'error' ? '⚠' : '○'} {errorMsg}
        </div>
      )}
    </div>
  )
}

export default function SIPanel({ siFields, mappings, validationResult, onFieldsChange, onMappingsChange }) {
  const [projectName, setProjectName] = useState('Mon projet')

  function addField() {
    const id = `field_${++fieldCounter}`
    onFieldsChange([...siFields, {
      id,
      name: '',
      type: 'string',
      value: '',
      active: true
    }])
  }

  function updateField(id, key, value) {
    onFieldsChange(siFields.map(f => f.id === id ? { ...f, [key]: value } : f))
  }

  function removeField(id) {
    onFieldsChange(siFields.filter(f => f.id !== id))
    const newMappings = { ...mappings }
    delete newMappings[id]
    onMappingsChange(newMappings)
  }

  function updateMapping(fieldId, brevoPath) {
    onMappingsChange({ ...mappings, [fieldId]: brevoPath })
  }

  const { siErrors = {}, walletErrors = [] } = validationResult || {}
  const orphanCount = siFields.filter(f => f.active && !mappings[f.id]).length
  const errorCount = Object.values(siErrors).filter(e => e.type === 'error').length

  return (
    <div className="panel si-panel">
      <div className="panel__header">
        <div className="panel__header-left">
          <div className="panel__badge panel__badge--si">SI CLIENT</div>
          <div className="panel__title">Source de données</div>
        </div>
        <div className="panel__header-right">
          {errorCount > 0 && (
            <span className="badge badge--error">{errorCount} erreur{errorCount > 1 ? 's' : ''}</span>
          )}
          {orphanCount > 0 && errorCount === 0 && (
            <span className="badge badge--warning">{orphanCount} orphelin{orphanCount > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <div className="panel__body">
        {/* Fields list */}
        <div className="si-fields">
          {siFields.length === 0 && (
            <div className="si-empty">
              <div className="si-empty__icon">⬡</div>
              <div className="si-empty__text">Aucun champ configuré</div>
              <div className="si-empty__sub">Ajoutez les champs que votre SI va envoyer</div>
            </div>
          )}
          {siFields.map(field => (
            <FieldRow
              key={field.id}
              field={field}
              mapping={mappings[field.id]}
              error={siErrors[field.id]}
              onChange={updateField}
              onMappingChange={updateMapping}
              onRemove={removeField}
            />
          ))}
        </div>

        <button className="btn-add-field" onClick={addField}>
          <span>+</span> Ajouter un champ SI
        </button>
      </div>
    </div>
  )
}
