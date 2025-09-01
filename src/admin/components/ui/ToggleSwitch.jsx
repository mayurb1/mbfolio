import { useState } from 'react'

const ToggleSwitch = ({ 
  checked = false, 
  onChange, 
  disabled = false, 
  loading = false,
  size = 'md',
  className = '',
  label = '',
  labelPosition = 'right'
}) => {
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    if (disabled || loading || isToggling) return
    
    setIsToggling(true)
    try {
      await onChange(!checked)
    } finally {
      setIsToggling(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          switch: 'h-4 w-7',
          toggle: 'h-3 w-3',
          translate: checked ? 'translate-x-3' : 'translate-x-0.5'
        }
      case 'lg':
        return {
          switch: 'h-7 w-12',
          toggle: 'h-6 w-6',
          translate: checked ? 'translate-x-5' : 'translate-x-0.5'
        }
      default: // md
        return {
          switch: 'h-5 w-9',
          toggle: 'h-4 w-4',
          translate: checked ? 'translate-x-4' : 'translate-x-0.5'
        }
    }
  }

  const { switch: switchClass, toggle: toggleClass, translate } = getSizeClasses()

  const switchElement = (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || loading || isToggling}
      className={`
        relative inline-flex items-center ${switchClass} rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
        ${disabled || loading || isToggling 
          ? 'cursor-not-allowed opacity-50' 
          : 'cursor-pointer'
        }
        ${checked 
          ? 'bg-blue-600 dark:bg-blue-500' 
          : 'bg-slate-200 dark:bg-slate-700'
        }
        ${className}
      `}
      aria-pressed={checked}
      aria-label={label || `Toggle ${checked ? 'off' : 'on'}`}
    >
      <span
        className={`
          inline-block ${toggleClass} rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          ${translate}
        `}
      />
      {(loading || isToggling) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
        </div>
      )}
    </button>
  )

  if (!label) {
    return switchElement
  }

  return (
    <div className={`flex items-center gap-2 ${labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row'}`}>
      {switchElement}
      <label 
        onClick={handleToggle}
        className={`text-sm font-medium text-slate-700 dark:text-slate-300 ${
          disabled || loading || isToggling ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
      >
        {label}
      </label>
    </div>
  )
}

export default ToggleSwitch