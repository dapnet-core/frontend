import { globalStore } from 'stores/global-store'

/**
 * Abstract definition of GET request to our api service
 *
 * Extend it and overwrite 'path', 'response' and 'query'
 */
export type ApiRouteGet = {
  method: 'GET'
  /** Allowed paths this request can be send to. Should always be a literal type */
  path: string
  /** Expected response type of this request */
  response: unknown
  /**
   * URL Query parameters that are send with this request. Set to `null` if no params are allowed
   *
   * SAFETY: Don't actually pass in a symbol as value, it likely won't work; Still have to allow it to satisfy type constraints
   */
  query: Record<string, string | number | boolean | symbol> | null
}

/**
 * Abstract definition of POST request to our api service
 *
 * Extend it and overwrite 'path', 'response' and 'body'
 */
export type ApiRoutePost = {
  method: 'POST'
  /** Allowed paths this request can be send to. Should always be a literal type */
  path: string
  /** Expected response type of this request */
  response: unknown
  /** Type of the body send with this request. Set to `null` if no data is allowed */
  body: Record<string, unknown> | null
}

/**
 * Send data to the given route using POST
 * @param route the route, relative to the API url
 * @param useAuth optional, whether to send the auth token with the request
 * @param data optional
 * @returns A promise of the given ResponseType that will error if the request failed
 */
export function postJson<R extends ApiRoutePost> (route: R['path'], data: R['body'] = null, useAuth = true) {
  const store = globalStore()
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  // FIXME: Use JWT instead of basic auth
  if (useAuth && store.auth) {
    headers.append('Authorization', 'Basic ' + store.auth.token)
  }

  const url = `${process.env.apiServer}/${route}`

  let body = ""
  if (data) {
    body = JSON.stringify(data)
    headers.append('Content-Type', 'application/json;charset=UTF-8')
    headers.append('Content-Length', body.length.toString())
  }

  return fetch(url, {
    method: 'POST',
    headers,
    body
  }).then(res => {
    if (res.ok) return res.json() as Promise<R['response']>
    throw new Error(res.statusText)
  })
}

/**
 * Fetch data from the given route using GET
 * @param route the route, relative to the API url
 * @param useAuth optional, whether to send the auth token with the request
 * @param data optional, passed as query string in the URL
 * @returns A promise of the given ResponseType that will error if the request failed
 */
export function getJson<R extends ApiRouteGet> (route: R['path'], data: R['query'] = null, useAuth = true) {
  const store = globalStore()
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  // FIXME: Use JWT instead of basic auth
  if (useAuth && store.auth) {
    headers.append('Authorization', 'Basic ' + store.auth.token)
  }

  let url = `${process.env.apiServer}/${route}`
  if (data) {
    url += '?'
    // SAFETY: see https://github.com/microsoft/TypeScript/issues/32951
    url += new URLSearchParams(data as Record<string, string>).toString()
  }

  return fetch(url, {
    method: 'GET',
    headers
  }).then(res => {
    if (res.ok) return res.json() as Promise<R['response']>
    throw new Error(res.statusText)
  })
}
