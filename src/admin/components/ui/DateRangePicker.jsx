import { useState, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

const DateRangePicker = ({ 
  startDate = null, 
  endDate = null, 
  onChange, 
  allowPresent = true,
  className = '',
  error = false,
  disabled = false 
}) => {
  const [startMonth, setStartMonth] = useState('')
  const [startYear, setStartYear] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [endYear, setEndYear] = useState('')
  const [isPresent, setIsPresent] = useState(false)

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i + 10)

  // Initialize values from props
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate)
      setStartMonth(String(start.getMonth() + 1).padStart(2, '0'))
      setStartYear(String(start.getFullYear()))
    }

    if (endDate && endDate.toLowerCase() !== 'present') {
      const end = new Date(endDate)
      setEndMonth(String(end.getMonth() + 1).padStart(2, '0'))
      setEndYear(String(end.getFullYear()))
      setIsPresent(false)
    } else if (endDate && endDate.toLowerCase() === 'present') {
      setIsPresent(true)
      setEndMonth('')
      setEndYear('')
    }
  }, [startDate, endDate])

  // Handle value changes
  const handleChange = () => {
    if (!startMonth || !startYear) {
      onChange(null, null)
      return
    }

    const startDateStr = `${startYear}-${startMonth}-01`
    let endDateStr = null

    if (isPresent) {
      endDateStr = 'Present'
    } else if (endMonth && endYear) {
      endDateStr = `${endYear}-${endMonth}-01`
    }

    onChange(startDateStr, endDateStr)
  }

  useEffect(() => {
    handleChange()
  }, [startMonth, startYear, endMonth, endYear, isPresent])

  const handlePresentChange = (checked) => {
    setIsPresent(checked)
    if (checked) {
      setEndMonth('')
      setEndYear('')
    }
  }

  const formatDisplayValue = () => {
    if (!startMonth || !startYear) return ''
    
    const startMonthName = months.find(m => m.value === startMonth)?.label || startMonth
    const startDisplay = `${startMonthName} ${startYear}`
    
    if (isPresent) {
      return `${startDisplay} – Present`
    }
    
    if (endMonth && endYear) {
      const endMonthName = months.find(m => m.value === endMonth)?.label || endMonth
      return `${startDisplay} – ${endMonthName} ${endYear}`
    }
    
    return startDisplay
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Display Format */}
      <div className={`w-full px-3 py-2 border rounded-md bg-slate-50 dark:bg-slate-800 ${
        error ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
      } text-slate-700 dark:text-slate-300 text-sm`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatDisplayValue() || 'Select date range'}</span>
        </div>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Start Date
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                error ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Month</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                error ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Present Checkbox */}
      {allowPresent && (
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPresent}
              onChange={(e) => handlePresentChange(e.target.checked)}
              disabled={disabled}
              className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Currently ongoing (Present)
            </span>
          </label>
        </div>
      )}

      {/* End Date */}
      {!isPresent && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            End Date
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                disabled={disabled || isPresent}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                  error ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                disabled={disabled || isPresent}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                  error ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker