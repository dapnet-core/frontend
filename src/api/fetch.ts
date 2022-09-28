import { globalStore } from 'stores/global-store'

export type ApiRouteGet = {
  method: 'GET'
  response: unknown
  query: Record<string, string | number | symbol>
}

export type ApiRoutePost = {
  method: 'POST'
  response: unknown
  body: Record<string, unknown>
}

/**
 * Send data to the given route using POST
 * @param route the route, relative to the API url
 * @param useAuth optional, whether to send the auth token with the request
 * @param data optional
 * @returns A promise of the given ResponseType that will error if the request failed
 */
export function postJson<R extends ApiRoutePost> (route: string, useAuth = true, data?: R['body']) {
  const store = globalStore()
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  // FIXME: Use JWT instead of basic auth
  if (useAuth && store.auth) {
    headers.append('Authorization', 'Basic ' + store.auth.token)
  }

  const url = `${process.env.apiServer}/${route}`

  let body
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
export function getJson<R extends ApiRouteGet> (route: string, useAuth = true, data?: R['query']) {
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
