import { globalStore } from 'stores/global-store'

/**
 * Fetch data from the given route
 * @param route the route, relative to the API url
 * @param method optional, either GET or POST
 * @param useAuth optional, whether to send the auth token with the request
 * @returns A promise of the given ResponseType that will error if the request failed
 */
export function fetchJson<ResponseType> (route: string, method: 'GET' | 'POST' = 'GET', useAuth = true) {
  const store = globalStore()
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  // FIXME: Use JWT instead of basic auth
  if (useAuth && store.auth) {
    headers.append('Authorization', 'Basic ' + store.auth.token)
  }

  return fetch(`${process.env.apiServer}/${route}`, {
    method,
    headers
  }).then(res => {
    if (res.ok) return res.json() as Promise<ResponseType>
    throw new Error(res.statusText)
  })
}
