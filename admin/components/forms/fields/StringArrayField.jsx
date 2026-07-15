'use client'

import { Field, FieldArray, getIn } from 'formik'
import { Plus, X } from 'lucide-react'
import Button from '../../ui/Button'

// Row input classes copied verbatim from the inline achievement/highlight rows.
const ROW_FIELD_CLASS =
  'flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white'

// FieldArray of plain strings, rendered as a list of rows with an X remove
// button and an "Add" button. Defaults match the text-input achievement rows;
// pass `as="textarea"` (+ the responsive button classes) for the highlight rows.
const StringArrayField = ({
  name,
  label,
  addButtonText,
  placeholder,
  wrapperClassName,
  as,
  rows,
  removeButtonClassName = 'p-2',
  addButtonClassName = 'flex items-center gap-2',
  spanAddText = false,
}) => {
  const fieldClassName = as === 'textarea' ? `${ROW_FIELD_CLASS} resize-none` : ROW_FIELD_CLASS
  const getPlaceholder = index =>
    typeof placeholder === 'function' ? placeholder(index) : placeholder

  return (
    <div className={wrapperClassName}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      <FieldArray name={name}>
        {({ push, remove, form }) => {
          const items = getIn(form.values, name) || []
          return (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Field
                    as={as}
                    name={`${name}.${index}`}
                    rows={rows}
                    className={fieldClassName}
                    placeholder={getPlaceholder(index)}
                  />
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className={removeButtonClassName}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => push('')}
                className={addButtonClassName}
              >
                <Plus size={16} />
                {spanAddText ? <span>{addButtonText}</span> : addButtonText}
              </Button>
            </div>
          )
        }}
      </FieldArray>
    </div>
  )
}

export default StringArrayField
