// Format date range for display
export function formatDateRange(startDate, endDate, isOngoing) {
  if (!startDate) return 'No dates specified'

  const start = new Date(startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  })

  if (isOngoing || !endDate) {
    return `${start} – Present`
  }

  const end = new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  })

  return `${start} – ${end}`
}
