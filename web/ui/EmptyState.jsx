'use client'

// Shared "no records found" block used by the public sections. The message,
// wrapper padding, and text styling are parameterized so the exact original
// markup is reproduced at each call site.
const EmptyState = ({
  message,
  className = 'text-center py-12',
  textClassName = 'text-text-secondary text-lg',
}) => (
  <div className={className}>
    <p className={textClassName}>{message}</p>
  </div>
)

export default EmptyState
