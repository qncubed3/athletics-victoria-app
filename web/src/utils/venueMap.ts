import type { ParsedMeet, ParsedVenue, SeasonVenue } from '../types/events'

const LAT_RE = /!3d(-?\d+\.?\d*)/
const LNG_RE = /!2d(-?\d+\.?\d*)/

export function parseMapRefCoords(mapRef: string | null): { lat: number; lng: number } | null {
  if (!mapRef) return null
  const latMatch = mapRef.match(LAT_RE)
  const lngMatch = mapRef.match(LNG_RE)
  if (!latMatch || !lngMatch) return null
  const lat = parseFloat(latMatch[1])
  const lng = parseFloat(lngMatch[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

function venueDisplayName(venue: SeasonVenue) {
  return [venue.name1, venue.name2].filter(Boolean).join(' ')
}

function venueAddress(venue: SeasonVenue) {
  return [venue.address1, venue.address2].filter(Boolean).join(', ')
}

export function buildVenueMap(
  venues: SeasonVenue[],
  meets: ParsedMeet[],
  venueTypeFilter: string
): { mapped: ParsedVenue[]; unmappedMeets: ParsedMeet[] } {
  const meetsByVenue = new Map<string, ParsedMeet[]>()
  for (const meet of meets) {
    const list = meetsByVenue.get(meet.venue) ?? []
    list.push(meet)
    meetsByVenue.set(meet.venue, list)
  }

  const venueByCode = new Map(venues.map((v) => [v.code, v]))
  const mapped: ParsedVenue[] = []

  for (const [code, venueMeets] of meetsByVenue) {
    const venue = venueByCode.get(code)
    if (!venue) continue
    if (venueTypeFilter !== 'all' && venue.type !== venueTypeFilter) continue

    const coords = parseMapRefCoords(venue.mapRef)
    if (!coords) continue

    mapped.push({
      code,
      type: venue.type,
      name: venueDisplayName(venue),
      address: venueAddress(venue),
      lat: coords.lat,
      lng: coords.lng,
      meetCount: venueMeets.length,
      meets: venueMeets.sort((a, b) => a.date.localeCompare(b.date)),
    })
  }

  mapped.sort((a, b) => b.meetCount - a.meetCount || a.name.localeCompare(b.name))

  const unmappedMeets = meets.filter((m) => {
    const venue = venueByCode.get(m.venue)
    if (!venue) return true
    return !parseMapRefCoords(venue.mapRef)
  })

  return { mapped, unmappedMeets }
}

// human-readable venue type from ResultsHub code
export function venueTypeLabel(type: string) {
  if (type === 'outOfStad') {
    return 'Out of stadium'
  }
  return 'Stadium'
}

// link that opens the venue in google maps
export function googleMapsVenueUrl(venue: Pick<ParsedVenue, 'lat' | 'lng' | 'name' | 'address'>) {
  const query = venue.address
    ? `${venue.name}, ${venue.address}`
    : `${venue.lat},${venue.lng}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function mapBounds(venues: ParsedVenue[]): [[number, number], [number, number]] | null {
  if (venues.length === 0) return null
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  for (const v of venues) {
    minLat = Math.min(minLat, v.lat)
    maxLat = Math.max(maxLat, v.lat)
    minLng = Math.min(minLng, v.lng)
    maxLng = Math.max(maxLng, v.lng)
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ]
}
