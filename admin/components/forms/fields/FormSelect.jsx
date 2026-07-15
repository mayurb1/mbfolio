'use client'

import { Field, ErrorMessage, useField } from 'formik'
import { getInputClassName } from './FormField'

const FormSelect = ({
  name,
  label,
  required = false,
  wrapperClassName,
  options,
  children,
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
        as="select"
        name={name}
        className={getInputClassName(hasError)}
        {...rest}
      >
        {options
          ? options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </Field>
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
    </div>
  )
}

export default FormSelect
