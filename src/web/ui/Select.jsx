import { ChevronDown } from 'lucide-react'

const Select = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  children,
  className = '',
  label,
  required = false,
}) => {
  return (
    <div className="relative">
      {label && (
        <label htmlFor={id || name} className="sr-only">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full appearance-none pr-10 pl-3 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-sm ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <ChevronDown size={18} className="text-text-secondary" />
      </div>
    </div>
  )
}

export default Select
