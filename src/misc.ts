/**
 * Take in any kind of error and return it as a string. Useful for catch clauses.
 * @param e Anything, really
 * @param log Whether to log the error or not
 * @returns A string representing the error
 */
export function errorToString (e: unknown, log = false): string {
  if (typeof e === 'string') {
    if (log) console.error(e)
    return e
  } else if (e instanceof Error) {
    if (log) console.error(e)
    return e.message
  } else {
    console.warn('Unknown error:', e)
    // Debug this type of error and decide how to handle it
    if (process.env.DEV) debugger
    return 'unknown error type'
  }
}
