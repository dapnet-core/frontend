import type { QTableProps } from 'quasar'
import { getJson, ApiRouteGet } from './fetch'

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
 * Api route for paginated GET request to the server
 *
 * Invariants (not enforced by types atm):
 * - 'query.after', 'query.before' or neither are set
 * - 'query.sortBy' and 'query.desc' or neither are set
 */
export interface ApiRouteGetPaginated<T> extends ApiRouteGet {
  response: PaginatedResponse<T>
  query: {
    limit: number
    filter?: string
    after?: string
    before?: string
    sortBy?: keyof T
    desc?: '0' | '1'
  }
}

/**
 * Generic pagination handler of an ApiRouteGetPaginated R
 * @param route The path of the route to call
 */
export function loadPaginatedData<T, R extends ApiRouteGetPaginated<T>> (route: string): PaginationHandler<T> {
  return async (limit, cursor, sorting, filter) => {
    let args: R['query'] = { limit }
    if (typeof cursor === 'object') {
      // Sets either 'before' or 'after'
      args = { ...args, ...cursor }
    } else if (cursor === 'lastpage') {
      throw Error('Not yet implemented!')
    } // else it's 'firstpage', which is the default and doesn't need any args

    if (sorting) {
      args.sortBy = sorting.sortBy
      args.desc = sorting.descending ? '1' : '0'
    }

    if (filter) {
      args.filter = filter
    }

    return getJson<R>(route, true, args)
  }
}

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
  /**
   * Sets the fallback sorting column. If no sorting column is set, this one will be set.
   * Useful if the server sorts the data even if no sorting is requested by the client,
   * which often happens in cursor-based pagination
   */
   fallbackSorting?: { sortBy: keyof T, descending: boolean }
}
