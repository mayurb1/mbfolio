import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'

const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  loading = false,
  disabled = false,
  className = "",
  error = false,
  getOptionLabel = (option) => option.label || option.name,
  getOptionValue = (option) => option.value || option._id,
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get selected options for display
  const selectedOptions = options.filter(option =>
    value.includes(getOptionValue(option))
  )

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  const handleToggleOption = (option) => {
    const optionValue = getOptionValue(option)
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    
    onChange(newValue)
  }

  const handleRemoveOption = (optionValue, e) => {
    e.stopPropagation()
    const newValue = value.filter(v => v !== optionValue)
    onChange(newValue)
  }

  const handleToggleDropdown = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen)
    }
  }

  const handleClearAll = (e) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main select button */}
      <button
        type="button"
        onClick={handleToggleDropdown}
        disabled={disabled || loading}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between min-h-[40px] ${
          error
            ? 'border-red-300 dark:border-red-600'
            : 'border-slate-300 dark:border-slate-600'
        } ${
          disabled || loading
            ? 'bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-50'
            : 'bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-500'
        } text-slate-900 dark:text-white`}
      >
        <div className="flex-1 flex flex-wrap gap-1 min-h-[24px]">
          {loading ? (
            <span className="text-slate-500 dark:text-slate-400">Loading...</span>
          ) : selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={getOptionValue(option)}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {getOptionLabel(option)}
                <button
                  type="button"
                  onClick={(e) => handleRemoveOption(getOptionValue(option), e)}
                  className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedOptions.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && !loading && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const optionValue = getOptionValue(option)
                const isSelected = value.includes(optionValue)
                
                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => handleToggleOption(option)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <span className="flex-1">{getOptionLabel(option)}</span>
                    {/* Show additional info if available */}
                    {option.category && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {option.category}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer with selection count */}
          {selectedOptions.length > 0 && (
            <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{selectedOptions.length} selected</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelect