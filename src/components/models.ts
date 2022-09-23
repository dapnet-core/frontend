import type { QTableProps } from 'quasar'

/**
 * Paginated Reponse over data type T.
 * Returned by https://hexdocs.pm/paginator/Paginator.html
 */
export interface PaginatedResponse<T> {
  entries: readonly T[]
  metadata: {
    after: string | null
    before: string | null
    limit: number
    total_count: number
    total_count_cap_exceeded: boolean
  }
}

/**
 * Function that requests cursor-based paginated data from the server.
 */
export type PaginationHandler<T> = (
  limit: number,
  cursor: { after: string } | { before: string } | 'firstpage' | 'lastpage',
  sorting?: { sortBy: keyof T, descending: boolean },
  filter?: string
) => Promise<PaginatedResponse<T>>

/**
 * Pagination props for DataTable, generic over the data type
 */
export type PaginationProps<T> = Omit<NonNullable<QTableProps['pagination']>, 'sortBy'> & {
  /** Sorting column */
  sortBy?: keyof T
  /** Cursor for all entries that come before the current view */
  before?: string
  /** Cursor for all entries that come after the current view */
  after?: string
  /** Sets the fallback sorting column. If no sorting column is set, this one will be set.
   *  Useful if the server sorts the data even if no sorting is requested by the client,
   *  which often happens in cursor-based pagination
   */
   fallbackSorting?: { sortBy: keyof T, descending: boolean }
}
