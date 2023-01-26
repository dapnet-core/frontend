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
  created_at: string // ISO8601 datetime string
  created_by: string
  data: string
  distribution: {
    transmitter_groups: string[]
    transmitters: string[]
  }
  expires_at: string // ISO8601 datetime string
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
    permissions: Record<string, string> // TODO: Hardcode permissions
    user: Record<string, any> // We do not really care about this right now
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
  changed_on?: string // ISO8601 datetime string
  created_by?: string
  created_on?: string // ISO8601 datetime string
  description: string
  groups: string[]
  owners: string[]
  pagers: Pager[]
  thirdparty: {
    aprs: string[],
    brandmeister: number[],
    ipsc2: number[],
    email: string[]
  },
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
    skip: number
    descending: boolean
    startswith: string
  } | null
}

/**
 * GET /subscribers/:id
 */
export interface SubscriberShow extends ApiRouteGet {
  path: `subscribers/${SubscriberRowType['_id']}`
  response: SubscriberRowType
  query: null
}

/**
 * Expected row type of GET /subscribers
 */
export type TransmitterRowType = {
  changed_by?: string
  changed_on?: string // ISO8601 datetime string
  created_by?: string
  created_on?: string // ISO8601 datetime string
  antenna: {
    agl: number
    direction: number
    gain: number
    type: 'omni' | 'directional'
  }
  aprs_broadcast: boolean
  auth_key: string
  coordinates: [number, number]
  emergency_power?: {
    available: boolean
    duration: number
    infinite: boolean
  }
  enabled: boolean
  frequency?: number
  groups: string[]
  owners: string[]
  power: number
  status: {
    online: boolean // TODO: Why is this always false in the API response??
    addr?: string // IPv4 Address
    connected_since?: string // ISO8601 datetime string
    id?: string
    last_seen?: string // ISO8601 datetime string
    node?: string
    software?: {
      name: string
      version: string
    }
  }
  // 16 booleans in an array
  timeslots: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean]
  usage: 'personal' | 'widerange'
  _id: string
  _rev: string
}

/**
 * GET /transmitters
 */
export interface Transmitters extends ApiRouteGet {
  path: 'transmitters'
  response: {
    offset: number
    rows: readonly TransmitterRowType[]
    total_rows: number
  }
  query: {
    limit: number
    skip: number
    descending: boolean
    startswith: string
  } | null
}
