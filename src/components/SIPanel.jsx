import React, { useState } from 'react'
import { BREVO_FIELD_OPTIONS, FIELD_TYPES, BREVO_SCHEMA } from '../data/brevoSchema.js'

let fieldCounter = 3

function isCustomField(brevoPath) {
  return brevoPath && !BREVO_SCHEMA[brevoPath]
}

function FieldRow({ field, mapping, error, onChange, onMappingChange, onRemove }) {
  const errorType = error?.type
  const errorMsg = error?.message
  const mappingIsCustom = isCustomField(mapping)
  const isCodeType = field.type === 'barcode' || field.type === 'qrcode'

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
            className={`si-input si-input--value ${errorType === 'error' ? 'si-input--invalid' : ''} ${isCodeType ? 'si-input--mono' : ''}`}
            placeholder={isCodeType ? 'token / valeur test' : 'valeur de test'}
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
        <div className="si-field__mapping-combo">
          <input
            list={`brevo-fields-${field.id}`}
            className={`si-input si-input--mapping ${!mapping ? 'si-input--empty' : ''} ${mappingIsCustom ? 'si-input--custom' : ''}`}
            placeholder="Champ Brevo — ex: data.status"
            value={mapping || ''}
            onChange={e => onMappingChange(field.id, e.target.value || null)}
            disabled={!field.active}
            autoComplete="off"
          />
          <datalist id={`brevo-fields-${field.id}`}>
            {BREVO_FIELD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.description}{opt.required ? ' (requis)' : ''}
              </option>
            ))}
          </datalist>
        </div>
        {mapping && (
          <span className={`si-field__mapping-badge ${mappingIsCustom ? 'si-field__mapping-badge--custom' : 'si-field__mapping-badge--schema'}`}>
            {mappingIsCustom ? 'custom' : BREVO_FIELD_OPTIONS.find(o => o.value === mapping)?.type || ''}
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

  const { siErrors = {} } = validationResult || {}
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
