import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  pageCount = 1,
  pageIndex = 0,
  pageSize = 10,
  onPaginationChange,
  onSortingChange,
  sorting = [],
  manualPagination = false,
  manualSorting = false,
  showPagination = true,
  emptyMessage = 'No data found'
}) => {
  const memoizedData = useMemo(() => data, [data])
  const memoizedColumns = useMemo(() => columns, [columns])

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    manualSorting,
    pageCount,
    state: {
      pagination: {
        pageIndex,
        pageSize
      },
      sorting
    },
    onPaginationChange,
    onSortingChange,
    enableSortingRemoval: false
  })

  const getSortingIcon = (isSorted) => {
    if (isSorted === 'asc') return <ChevronUp className="w-4 h-4" />
    if (isSorted === 'desc') return <ChevronDown className="w-4 h-4" />
    return <ChevronsUpDown className="w-4 h-4 opacity-50" />
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {loading ? (
        <div className="p-6 sm:p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="p-6 sm:p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {/* Table - Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      const isActionsColumn = header.column.id === 'actions'
                      return (
                        <th
                          key={header.id}
                          className={`px-4 xl:px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                            isActionsColumn ? 'text-right w-48 min-w-[180px]' : 'text-left'
                          }`}
                          style={header.column.columnDef.size ? { width: header.column.columnDef.size } : undefined}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={`flex items-center gap-2 ${
                                isActionsColumn ? 'justify-end' : 'justify-start'
                              } ${
                                header.column.getCanSort() ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200' : ''
                              }`}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && getSortingIcon(header.column.getIsSorted())}
                            </div>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    {row.getVisibleCells().map(cell => {
                      const isActionsColumn = cell.column.id === 'actions'
                      return (
                        <td 
                          key={cell.id} 
                          className={`px-4 xl:px-6 py-4 ${isActionsColumn ? 'text-right' : 'whitespace-nowrap'}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card Layout - Mobile/Tablet */}
          <div className="lg:hidden">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {table.getRowModel().rows.map(row => (
                <div key={row.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const header = table.getHeaderGroups()[0].headers[cellIndex]
                    const isActionsColumn = header.column.id === 'actions'
                    
                    return (
                      <div key={cell.id} className={`flex ${isActionsColumn ? 'justify-between items-center' : 'justify-between items-start'} py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-b-0`}>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex-shrink-0 mr-4">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </dt>
                        <dd className={`text-sm text-slate-900 dark:text-white ${isActionsColumn ? 'flex-shrink-0' : 'text-right flex-1'}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </dd>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {showPagination && pageCount > 1 && (
            <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Results info */}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 text-center sm:text-left">
                  Showing {pageIndex * pageSize + 1} to{' '}
                  {Math.min((pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)} of{' '}
                  {table.getFilteredRowModel().rows.length} results
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <span className="hidden sm:inline">First</span>
                    <span className="sm:hidden">1</span>
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">‹</span>
                  </button>
                  
                  <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    <span className="hidden sm:inline">Page </span>{pageIndex + 1}<span className="hidden sm:inline"> of </span><span className="sm:hidden">/</span>{pageCount}
                  </span>
                  
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">›</span>
                  </button>
                  <button
                    onClick={() => table.setPageIndex(pageCount - 1)}
                    disabled={!table.getCanNextPage()}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <span className="hidden sm:inline">Last</span>
                    <span className="sm:hidden">{pageCount}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DataTable