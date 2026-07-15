'use client'

import { Field, ErrorMessage, useField } from 'formik'

// Centralized input className logic. Copied verbatim from the inline forms so
// the rendered class strings are byte-identical.
//   - base:      FormField / FormSelect
//   - extraLayout inserts a token right after "py-2 " (e.g. "pr-10 " for password inputs)
//   - extraTail  appends to the end (e.g. " resize-none" for textareas)
export const getInputClassName = (hasError, { extraLayout = '', extraTail = '' } = {}) =>
  `w-full px-3 py-2 ${extraLayout}border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    hasError
      ? 'border-red-300 dark:border-red-600'
      : 'border-slate-300 dark:border-slate-600'
  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white${extraTail}`

const FormField = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  wrapperClassName,
  ...rest
}) => {
  const [, meta] = useField(name)
  const hasError = meta.touched && meta.error

  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}{required ? ' *' : ''}
        </label>
      )}
      <Field
        type={type}
        name={name}
        className={getInputClassName(hasError)}
        placeholder={placeholder}
        {...rest}
      />
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
    </div>
  )
}

export default FormField
