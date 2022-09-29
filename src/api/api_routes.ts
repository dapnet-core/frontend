import { ApiRouteGetPaginated } from './pagination'
import { ApiRouteGet, ApiRoutePost } from './fetch'

/**
 * This file contains type definitions for all calls to our API service
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
  response: {
    count: number
  }
  query: Record<string, never>
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
export type Calls = ApiRouteGetPaginated<CallRowType>

/**
 * POST /auth/users/login
 */
export interface Login extends ApiRoutePost {
  response: {
    permissions: Record<string, string>
    user: Record<string, unknown> // We do not really care about this right now
  }
  body: {
    password: string
    username: string
  }
}
