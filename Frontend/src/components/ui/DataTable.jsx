import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, Filter } from 'lucide-react'
import Button from './Button'
import Input from './Input'

export default function DataTable({
  columns = [],
  data = [],
  onSort = null,
  sortBy = null,
  sortDir = 'asc',
  onFilter = null,
  searchPlaceholder = 'Search...',
  isLoading = false,
  isEmpty = false,
  emptyText = 'No data',
  onRowClick = null,
  rowClassName = '',
  headerClassName = '',
  containerClassName = '',
  pagination = null,
  onPaginationChange = null,
}) {
  return (
    <div className={`space-y-4 ${containerClassName}`}>
      {/* Toolbar */}
      {(onFilter || searchPlaceholder) && (
        <div className="flex items-center justify-between gap-3">
          {onFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFilter}
              className="gap-2 rounded-lg border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full">
          <thead>
            <tr className={`border-b border-white/10 bg-white/5 ${headerClassName}`}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300 ${
                    col.sortable ? 'cursor-pointer hover:bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  </div>
                </td>
              </tr>
            ) : isEmpty || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-white/5 hover:bg-white/10 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${rowClassName}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-slate-300">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && onPaginationChange && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {pagination.startIndex + 1} to {Math.min(pagination.endIndex, pagination.total)} of{' '}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginationChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="gap-2 rounded-lg border-white/10 bg-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 px-3">
              <span className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginationChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="gap-2 rounded-lg border-white/10 bg-white/5"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
