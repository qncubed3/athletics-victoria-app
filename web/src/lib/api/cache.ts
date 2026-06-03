// Simple in-memory cache for slow ResultsHub responses

const store = new Map()

// Default cache time is 10 minutes
const DEFAULT_TTL_MS = 10 * 60 * 1000

// Read a cached value if it is still valid
export function getCached(key) {
  const row = store.get(key)
  if (!row) {
    return null
  }
  if (Date.now() > row.expires) {
    store.delete(key)
    return null
  }
  return row.data
}

// Save a value in the cache
export function setCached(key, data, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, {
    data: data,
    expires: Date.now() + ttlMs,
  })
}
