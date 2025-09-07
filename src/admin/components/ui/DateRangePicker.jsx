import { useState, useEffect } from 'react'
import { Calendar, AlertCircle } from 'lucide-react'

const DateRangePicker = ({ 
  startDate = null, 
  endDate = null, 
  onChange, 
  allowPresent = true,
  className = '',
  error = false,
  disabled = false 
}) => {
  const [startDateValue, setStartDateValue] = useState('')
  const [endDateValue, setEndDateValue] = useState('')
  const [isPresent, setIsPresent] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return ''
    if (typeof dateStr === 'string' && dateStr.toLowerCase() === 'present') return ''
    
    try {
      let date
      if (dateStr.includes('-')) {
        // ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
        date = new Date(dateStr)
      } else {
        // Text format: "January 2023"
        const parts = dateStr.split(' ')
        if (parts.length >= 2) {
          const monthName = parts[0]
          const year = parseInt(parts[parts.length - 1])
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                            'july', 'august', 'september', 'october', 'november', 'december']
          const monthIndex = monthNames.findIndex(m => m === monthName.toLowerCase())
          if (monthIndex >= 0) {
            date = new Date(year, monthIndex, 1)
          } else {
            date = new Date(dateStr)
          }
        } else {
          date = new Date(dateStr)
        }
      }
      
      if (isNaN(date.getTime())) return ''
      
      // Format as YYYY-MM-DD for input[type="date"]
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch {
      return ''
    }
  }

  // Validation function
  const validateDateRange = (startDate, endDate) => {
    if (!startDate) return ''
    
    const start = new Date(startDate)
    const current = new Date()
    current.setHours(0, 0, 0, 0) // Reset time for accurate comparison
    
    // Check if start date is in the future
    if (start > current) {
      return 'Start date cannot be in the future'
    }
    
    if (!endDate || isPresent) return ''
    
    const end = new Date(endDate)
    
    // Check if end date is before start date
    if (end < start) {
      return 'End date must be after start date'
    }
    
    // Check if end date is in the future
    if (end > current) {
      return 'End date cannot be in the future'
    }
    
    return ''
  }

  // Initialize values from props
  useEffect(() => {
    setStartDateValue(formatDateForInput(startDate))
    
    if (endDate) {
      if (typeof endDate === 'string' && endDate.toLowerCase() === 'present') {
        setIsPresent(true)
        setEndDateValue('')
      } else {
        setIsPresent(false)
        setEndDateValue(formatDateForInput(endDate))
      }
    }
  }, [startDate, endDate])

  // Handle value changes with validation
  const handleChange = (newStartDate, newEndDate, newIsPresent) => {
    setValidationError('')
    
    if (!newStartDate) {
      onChange(null, null)
      return
    }

    let endDateStr = null
    if (newIsPresent) {
      endDateStr = 'Present'
    } else if (newEndDate) {
      endDateStr = newEndDate
    }

    // Validate date range
    const validation = validateDateRange(newStartDate, newEndDate)
    if (validation) {
      setValidationError(validation)
      return
    }

    onChange(newStartDate, endDateStr)
  }

  const handleStartDateChange = (e) => {
    const value = e.target.value
    setStartDateValue(value)
    handleChange(value, endDateValue, isPresent)
  }

  const handleEndDateChange = (e) => {
    const value = e.target.value
    setEndDateValue(value)
    handleChange(startDateValue, value, isPresent)
  }

  const handlePresentChange = (checked) => {
    setIsPresent(checked)
    if (checked) {
      setEndDateValue('')
      setValidationError('')
    }
    handleChange(startDateValue, checked ? '' : endDateValue, checked)
  }

  const formatDisplayValue = () => {
    if (!startDateValue) return ''
    
    const startDate = new Date(startDateValue)
    const startDisplay = startDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
    
    if (isPresent) {
      return `${startDisplay} – Present`
    }
    
    if (endDateValue) {
      const endDate = new Date(endDateValue)
      const endDisplay = endDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
      return `${startDisplay} – ${endDisplay}`
    }
    
    return startDisplay
  }

  const hasError = error || validationError
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Display Format */}
      <div className={`w-full px-3 py-2 border rounded-md transition-colors ${
        hasError 
          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10' 
          : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500'
      } text-slate-700 dark:text-slate-300 text-sm`}>
        <div className="flex items-center gap-2">
          <Calendar className={`w-4 h-4 ${hasError ? 'text-red-400' : 'text-slate-400'}`} />
          <span className={hasError ? 'text-red-600 dark:text-red-400' : ''}>
            {formatDisplayValue() || 'Select date range'}
          </span>
          {hasError && <AlertCircle className="w-4 h-4 text-red-400 ml-auto" />}
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Start Date */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Start Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            value={startDateValue}
            onChange={handleStartDateChange}
            disabled={disabled}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              hasError ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400 dark:hover:border-slate-500`}
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Present Checkbox */}
      {allowPresent && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3 border border-slate-200 dark:border-slate-700">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPresent}
              onChange={(e) => handlePresentChange(e.target.checked)}
              disabled={disabled}
              className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Currently ongoing (Present)
            </span>
          </label>
          {isPresent && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              This position/education is currently active
            </p>
          )}
        </div>
      )}

      {/* End Date */}
      {!isPresent && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDateValue}
              onChange={handleEndDateChange}
              disabled={disabled || isPresent}
              min={startDateValue || undefined} // End date must be after start date
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                hasError ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400 dark:hover:border-slate-500`}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Leave empty if no specific end date
          </p>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker