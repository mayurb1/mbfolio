'use client'

import { useState } from 'react'
import { Field, ErrorMessage, useField } from 'formik'
import { Eye, EyeOff } from 'lucide-react'
import { getInputClassName } from './FormField'

// Password input with the "relative" wrapper + absolute eye toggle button.
// For the <Formik> render-prop (context) forms. The `srLabel` prop drives the
// aria-label ("Show <srLabel>" / "Hide <srLabel>"); `children` renders after the
// error message (e.g. the password requirements hint).
const PasswordField = ({
  name,
  label,
  placeholder,
  required = false,
  srLabel,
  iconClassName = 'h-5 w-5 text-slate-500 hover:text-slate-600',
  wrapperClassName,
  children,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [, meta] = useField(name)
  const hasError = meta.touched && meta.error
  const ariaTarget = srLabel || label

  return (
    <div className={wrapperClassName}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}{required ? ' *' : ''}
        </label>
      )}
      <div className="relative">
        <Field
          type={showPassword ? 'text' : 'password'}
          name={name}
          className={getInputClassName(hasError, { extraLayout: 'pr-10 ' })}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? `Hide ${ariaTarget}` : `Show ${ariaTarget}`}
        >
          {showPassword ? (
            <EyeOff className={iconClassName} />
          ) : (
            <Eye className={iconClassName} />
          )}
        </button>
      </div>
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
      {children}
    </div>
  )
}

export default PasswordField
