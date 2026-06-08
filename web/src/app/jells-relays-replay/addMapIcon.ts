import mapboxgl from 'mapbox-gl'
import { getClubLogoUrl } from '@/lib/clubs'
import { squircleClipPath } from './utils/squircleClipPath'

export interface TeamMapMarker {
  teamName: string
  clubCode: string | null
  lng: number | null
  lat: number | null
  cumulativeDistanceM: number | null
}

const MARKER_SIZE = 36
const MARKER_OPACITY = 0.9

// Mapbox drives opacity on the marker root each frame, so visual styling lives on an inner wrapper.
function styleClubIconInner(inner: HTMLElement, img: HTMLImageElement, size: number) {
  const clipPath = squircleClipPath(size)

  img.style.width = '100%'
  img.style.height = '100%'
  img.style.display = 'block'
  img.style.objectFit = 'cover'
  img.style.clipPath = clipPath

  inner.style.width = `${size}px`
  inner.style.height = `${size}px`
  inner.style.clipPath = clipPath
  inner.style.background = 'transparent'
  inner.style.opacity = String(MARKER_OPACITY)
  inner.style.filter = `drop-shadow(0 1px 2px rgba(0, 0, 0, ${MARKER_OPACITY}))`
}

function getClubIconInner(element: HTMLElement): HTMLElement | null {
  return element.firstElementChild instanceof HTMLElement ? element.firstElementChild : null
}

export function addClubIcon(
  map: mapboxgl.Map,
  lngLat: [number, number],
  clubCode: string,
  size = MARKER_SIZE
) {
  const root = document.createElement('div')
  const inner = document.createElement('div')
  const img = document.createElement('img')
  img.src = getClubLogoUrl(clubCode) ?? ''
  img.alt = clubCode
  styleClubIconInner(inner, img, size)
  inner.appendChild(img)
  root.appendChild(inner)

  return new mapboxgl.Marker({ element: root, anchor: 'center' })
    .setLngLat(lngLat)
    .addTo(map)
}

// Reconcile Mapbox markers with the current replay frame: upsert positions, prune stale teams, then paint order.
export function syncTeamMarkers(
  map: mapboxgl.Map,
  markers: Map<string, mapboxgl.Marker>,
  teams: TeamMapMarker[],
  size = MARKER_SIZE
) {
  const active = new Set<string>()
  const positioned = teams.filter(
    (team) => team.lng != null && team.lat != null && team.clubCode
  )

  for (const team of positioned) {
    active.add(team.teamName)
    const lngLat: [number, number] = [team.lng as number, team.lat as number]
    const existing = markers.get(team.teamName)

    if (existing) {
      existing.setLngLat(lngLat)
      const inner = getClubIconInner(existing.getElement())
      const img = inner?.querySelector('img')
      if (inner && img instanceof HTMLImageElement) {
        styleClubIconInner(inner, img, size)
      }
    } else {
      markers.set(team.teamName, addClubIcon(map, lngLat, team.clubCode as string, size))
    }
  }

  for (const key of [...markers.keys()]) {
    if (!active.has(key)) {
      markers.get(key)?.remove()
      markers.delete(key)
    }
  }

  // Later siblings render on top; leaders should sit above teams they have passed.
  const zOrder = [...positioned].sort(
    (a, b) => (a.cumulativeDistanceM ?? 0) - (b.cumulativeDistanceM ?? 0)
  )

  for (const team of zOrder) {
    const marker = markers.get(team.teamName)
    const element = marker?.getElement()
    element?.parentElement?.appendChild(element)
  }
}
