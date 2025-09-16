import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({ 
  children, 
  className = '', 
  error = false,
  ...props 
}, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`
          w-full px-4 py-3 bg-surface border rounded-lg text-text
          appearance-none cursor-pointer
          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
          transition-colors duration-200
          ${error ? 'border-red-500' : 'border-border'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
        <ChevronDown size={18} className="text-text-secondary" />
      </div>
    </div>
  )
})

Select.displayName = 'Select'

export default Select