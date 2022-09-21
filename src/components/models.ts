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

// TODO: generic typing
export type PaginationProps = QTableProps['pagination'] & {
  /** Cursor for all entries that come before the current view */
  before?: string
  /** Cursor for all entries that come after the current view */
  after?: string
}
