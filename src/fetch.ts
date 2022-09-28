import { globalStore } from 'stores/global-store'

/**
 * Fetch data from the given route
 * @param route the route, relative to the API url
 * @param method optional, either GET or POST
 * @param useAuth optional, whether to send the auth token with the request
 * @param data optional, will either be passed as query string or body depending on the method
 * @returns A promise of the given ResponseType that will error if the request failed
 */
export function fetchJson<ResponseType> (route: string, method: 'GET' | 'POST' = 'GET', useAuth = true, data?: Record<string, string>) {
  const store = globalStore()
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  // FIXME: Use JWT instead of basic auth
  if (useAuth && store.auth) {
    headers.append('Authorization', 'Basic ' + store.auth.token)
  }

  let url = `${process.env.apiServer}/${route}`
  if (data && method === 'GET') {
    url += '?'
    url += new URLSearchParams(data).toString()
  }

  let body
  if (data && method === 'POST') {
    body = JSON.stringify(data)
    headers.append('Content-Type', 'application/json;charset=UTF-8')
    headers.append('Content-Length', body.length.toString())
  }

  return fetch(url, {
    method,
    headers,
    body
  }).then(res => {
    if (res.ok) return res.json() as Promise<ResponseType>
    throw new Error(res.statusText)
  })
}
