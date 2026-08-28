/**
 * Resolve the version after a successful optimistic-lock update.
 *
 * Older backend instances returned version=0 even after incrementing the
 * database value. Treat any non-advancing response as an old response and
 * advance from the version sent by the client.
 */
export function resolveNextPageVersion(responseVersion, requestedVersion) {
  const requested = Number(requestedVersion || 0)
  const returned = Number(responseVersion)

  if (Number.isFinite(returned) && returned > requested) {
    return returned
  }
  return requested + 1
}
