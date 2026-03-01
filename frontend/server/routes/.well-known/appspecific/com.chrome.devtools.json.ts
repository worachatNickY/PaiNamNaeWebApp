/**
 * Respond to Chrome DevTools request so Vue Router does not warn "No match found".
 * Returns 204 No Content.
 */
export default defineEventHandler(() => {
  setResponseStatus(204)
  return null
})
