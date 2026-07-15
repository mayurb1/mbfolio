'use client'

// Shared error + Retry-button block used by the public sections when a data
// fetch fails. Markup/classes are copied verbatim from the original inline
// blocks; only the wrapper padding and aria-label vary between usages.
const RetryState = ({ error, onRetry, ariaLabel, className = 'text-center py-12' }) => (
  <div className={className}>
    <p className="text-text-secondary text-lg mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-secondary transition-colors duration-200 font-semibold"
      aria-label={ariaLabel}
    >
      Retry
    </button>
  </div>
)

export default RetryState
