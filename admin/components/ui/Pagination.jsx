'use client'

// Default (Categories) styles. Each slot can be overridden per page via the
// `styles` prop so every call site renders exactly as its original inline markup.
const defaultStyles = {
  container:
    'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-6 py-3',
  inner: 'flex flex-col sm:flex-row items-center justify-between gap-4',
  leftGroup: 'flex flex-col sm:flex-row items-center gap-4',
  resultsText: 'text-sm text-slate-700 dark:text-slate-300',
  showLabel: 'text-sm text-slate-600 dark:text-slate-300',
  select:
    'text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  entriesLabel: 'text-sm text-slate-600 dark:text-slate-300',
  controls: 'flex items-center gap-1',
  navButton:
    'px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
  ellipsis: 'px-3 py-1 text-sm text-slate-500 dark:text-slate-300',
  pageButtonBase: 'px-3 py-1 text-sm font-medium rounded-md',
  pageButtonActive: 'bg-blue-600 text-white',
  pageButtonInactive:
    'text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700',
  pageButtonDisabled: 'disabled:opacity-50 disabled:cursor-not-allowed'
}

// Generate page numbers for pagination
const getPageNumbers = (page, totalPages) => {
  const pages = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (page <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      if (totalPages > 6) pages.push('...')
      pages.push(totalPages)
    } else if (page >= totalPages - 3) {
      pages.push(1)
      if (totalPages > 6) pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = page - 1; i <= page + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    }
  }

  return pages
}

const Pagination = ({
  pagination,
  onPageChange,
  onLimitChange,
  loading,
  itemLabel = 'results',
  ariaCurrent = false,
  responsivePrevNext = false,
  styles = {}
}) => {
  if (pagination.totalPages <= 1) return null

  const s = { ...defaultStyles, ...styles }

  return (
    <div className={s.container}>
      <div className={s.inner}>
        <div className={s.leftGroup}>
          <div className={s.resultsText}>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} {itemLabel}
          </div>
          <div className="flex items-center gap-2">
            <span className={s.showLabel}>Show:</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className={s.select}
              disabled={loading}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className={s.entriesLabel}>entries</span>
          </div>
        </div>

        <div className={s.controls}>
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            aria-label="Go to previous page"
            className={s.navButton}
          >
            {responsivePrevNext ? (
              <>
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">‹</span>
              </>
            ) : (
              'Previous'
            )}
          </button>

          {getPageNumbers(pagination.page, pagination.totalPages).map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={s.ellipsis}
                >
                  ...
                </span>
              )
            }

            const isCurrentPage = pageNum === pagination.page
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                aria-label={`Go to page ${pageNum}`}
                aria-current={ariaCurrent && isCurrentPage ? 'page' : undefined}
                className={`${s.pageButtonBase} ${
                  isCurrentPage ? s.pageButtonActive : s.pageButtonInactive
                } ${s.pageButtonDisabled}`}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || loading}
            aria-label="Go to next page"
            className={s.navButton}
          >
            {responsivePrevNext ? (
              <>
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">›</span>
              </>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination
