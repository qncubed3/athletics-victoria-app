import type { AthleteSearchEntry, AthleteSuggestion, RegistryAthlete } from '../types/athlete'

const CACHE_KEY = 'athsvic-athletes-index-v1'

export function buildSearchIndex(athletes: RegistryAthlete[]): AthleteSearchEntry[] {
  return athletes.map((a) => {
    const first = a.FirstName.toLowerCase()
    const last = a.LastName.toLowerCase()
    return {
      id: a.AthleteId,
      displayName: `${a.FirstName} ${a.LastName}`,
      club: a.Affiliation,
      apiName: `${a.LastName},${a.FirstName}`,
      first,
      last,
      searchText: `${first} ${last} ${last} ${first} ${last},${first}`,
    }
  })
}

export function readCachedIndex(): AthleteSearchEntry[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AthleteSearchEntry[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

export function writeCachedIndex(index: AthleteSearchEntry[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(index))
  } catch {
    // quota or private mode — ignore
  }
}

export function filterIndex(
  index: AthleteSearchEntry[],
  query: string,
  limit = 10
): AthleteSuggestion[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const matches: AthleteSuggestion[] = []

  for (const entry of index) {
    const prefixHit = entry.first.startsWith(q) || entry.last.startsWith(q)
    const containsHit = !prefixHit && entry.searchText.includes(q)
    if (!prefixHit && !containsHit) continue

    matches.push({
      id: entry.id,
      displayName: entry.displayName,
      club: entry.club,
      apiName: entry.apiName,
    })
    if (matches.length >= limit) break
  }

  return matches
}
