'use client'

import { useEffect, useRef, useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'

/**
 * Inline-editable table cell. Read mode shows the value (optionally via a custom
 * `display` renderer) with a pencil button revealed on hover; clicking it swaps
 * in an input/select/textarea prefilled with the current value.
 *
 * Saving is delegated to `onSave(newValue)` which must return a Promise:
 *   - resolves  -> exit edit mode
 *   - rejects   -> stay in edit mode and show the rejection message inline
 * `validate(newValue)` runs first and short-circuits the save with an inline
 * error when it returns a non-empty string. Unchanged values skip the save.
 *
 * The component tracks its own per-cell saving state so it never depends on the
 * slice's global `loading` flag (which would blank the whole DataTable).
 */
const EditableCell = ({
  value,
  type = 'text',
  options = [],
  display,
  validate,
  onSave,
  inputProps = {},
  ariaLabel = 'value',
}) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current.select) inputRef.current.select()
    }
  }, [editing])

  const startEditing = () => {
    setDraft(value ?? '')
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    setEditing(false)
    setError(null)
  }

  const normalize = (raw) => {
    if (type !== 'number') return typeof raw === 'string' ? raw.trim() : raw
    if (raw === '' || raw === null || raw === undefined) return 0
    return Number(raw)
  }

  const save = async () => {
    if (saving) return
    const next = normalize(draft)

    // No-op when unchanged.
    if (next === value) {
      cancel()
      return
    }

    const validationError = validate ? validate(next) : null
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave(next)
      setEditing(false)
    } catch (err) {
      setError(err?.message || String(err) || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
      return
    }
    if (e.key === 'Enter') {
      // In a textarea, plain Enter inserts a newline; require a modifier to save.
      if (type === 'textarea' && !(e.metaKey || e.ctrlKey)) return
      e.preventDefault()
      save()
    }
  }

  if (!editing) {
    return (
      <div className="group inline-flex items-center gap-1.5 max-w-full">
        <span className="min-w-0">
          {display ? display(value) : (
            <span className="text-sm text-slate-900 dark:text-white">
              {value === '' || value === null || value === undefined ? '—' : value}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={startEditing}
          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100 transition-opacity touch-manipulation flex-shrink-0"
          aria-label={`Edit ${ariaLabel}`}
          title={`Edit ${ariaLabel}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  const inputClass =
    'w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50'

  return (
    <div className="min-w-[140px]">
      <div className="flex items-start gap-1">
        {type === 'select' ? (
          <select
            ref={inputRef}
            value={draft ?? ''}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            className={inputClass}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            ref={inputRef}
            value={draft ?? ''}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            rows={inputProps.rows || 2}
            className={`${inputClass} resize-y`}
            {...inputProps}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={draft ?? ''}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            className={inputClass}
            {...inputProps}
          />
        )}

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1.5 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 touch-manipulation"
            aria-label="Save"
            title="Save (Enter)"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-green-600" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 touch-manipulation"
            aria-label="Cancel"
            title="Cancel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400 whitespace-normal">{error}</p>
      )}
    </div>
  )
}

export default EditableCell
