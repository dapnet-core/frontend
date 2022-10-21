import { ApiRouteGetPaginated } from './pagination'
import { ApiRouteGet, ApiRoutePost } from './fetch'

/**
 * This file contains type definitions for all calls to our API service
 *
 * These types heavily constraint the api fetch calls, making sure any change to the api, if
 * applied here will result in type errors if something broke.
 */

/**
 * GET /calls/_count
 * GET /transmitters/_count
 * GET /users/_count
 * GET /rubrics/_count
 * GET /subscribers/_count
 * GET /nodes/_count
 * GET /transmitters/_my_count
 * GET /rubrics/_my_count
 * GET /subscribers/_my_count
 * GET /nodes/_my_count
 */
export interface Count extends ApiRouteGet {
  path: 'calls/_count'
      | 'transmitters/_count'
      | 'users/_count'
      | 'rubrics/_count'
      | 'subscribers/_count'
      | 'nodes/_count'
      | 'transmitters/_my_count'
      | 'rubrics/_my_count'
      | 'subscribers/_my_count'
      | 'nodes/_my_count'
  response: {
    count: number
  }
  query: null
}

/**
 * Expected row type of GET '/calls'
 */
export interface CallRowType extends Record<string, unknown> {
  created_at: string // DateTime
  created_by: string
  data: string
  distribution: {
    transmitter_groups: string[]
    transmitters: string[]
  }
  expires_at: string // DateTime
  id: string // UUID V1
  local: boolean
  origin: string
  priority: number
  recipients: {
    subscriber_groups: string[]
    subscribers: string[]
  }
}

/**
 * GET /calls
 */
export type Calls = ApiRouteGetPaginated<CallRowType, 'calls'>

/**
 * POST /auth/users/login
 */
export interface Login extends ApiRoutePost {
  path: 'auth/users/login'
  response: {
    permissions: Record<string, string>
    user: Record<string, unknown> // We do not really care about this right now
  }
  body: {
    password: string
    username: string
  }
}

export type Pager = {
  enabled: boolean
  function: number
  name: string
  ric: number
  type: string
}

/**
 * Expected row type of GET /subscribers
 */
export type SubscriberRowType = {
  changed_by?: string
  changed_on?: string // UTC date string
  created_by?: string
  created_on?: string // UTC date string
  description: string
  groups: string[]
  owners: string[]
  pagers: Pager[]
  // TODO: Improve typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thirdparty: Record<string, any[]>
  _id: string
  _rev: string
}

/**
 * GET /subscribers
 */
export interface Subscribers extends ApiRouteGet {
  path: 'subscribers'
  response: {
    offset: number
    rows: readonly SubscriberRowType[]
    total_rows: number
  }
  query: {
    limit: number
    offset: number
    descending: boolean
    startswith: string
  } | null
}
