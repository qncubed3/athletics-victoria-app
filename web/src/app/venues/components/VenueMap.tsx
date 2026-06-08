'use client'

import { useEffect, type CSSProperties } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet'
import type { ParsedVenue } from '@/types/events'
import { mapBounds, venueTypeLabel } from '@/utils/venueMap'
import 'leaflet/dist/leaflet.css'

interface VenueMapProps {
  venues: ParsedVenue[]
  selectedCode: string | null
  onSelect: (code: string) => void
  drawerOpen: boolean
}

// default map centre (Melbourne) when we have no venue coords
const DEFAULT_CENTER: [number, number] = [-37.8136, 144.9631]
const DEFAULT_ZOOM = 9

function VenueMarkerTooltip({ venue }: { venue: ParsedVenue }) {
  let meetLabel = `${venue.meetCount} meets`
  if (venue.meetCount === 1) {
    meetLabel = '1 meet'
  }

  return (
    <Tooltip
      className="venue-map-tooltip"
      direction="top"
      offset={[0, -24]}
      opacity={1}
    >
      <div className="px-3 py-2.5">
        <p className="m-0 mb-1 text-[0.9rem] font-semibold leading-[1.3] whitespace-normal break-words text-[var(--text-primary)]">
          {venue.name}
        </p>
        {venue.address && (
          <p className="m-0 mb-1.5 text-[0.8rem] leading-[1.4] text-[var(--text-secondary)]">
            {venue.address}
          </p>
        )}
        <p className="m-0 text-[0.75rem] font-semibold tracking-[0.02em] text-[var(--text-muted)] uppercase">
          {meetLabel} · {venueTypeLabel(venue.type)}
        </p>
      </div>
    </Tooltip>
  )
}

// circle marker with meet count inside
function createMarkerIcon(selected: boolean, meetCount: number) {
  let label = String(meetCount)
  if (meetCount > 99) {
    label = '99+'
  }

  const size = 44
  let markerClass = 'venue-marker'
  if (selected) {
    markerClass = 'venue-marker venue-marker--selected'
  }

  return L.divIcon({
    className: 'venue-marker-leaflet',
    html: `<span class="${markerClass}">
      <span class="venue-marker__halo" aria-hidden="true"></span>
      <span class="venue-marker__core">${label}</span>
    </span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// react-leaflet child that can call map methods (fit bounds, fly to, resize)
function MapController({
  venues,
  selectedCode,
  drawerOpen,
}: {
  venues: ParsedVenue[]
  selectedCode: string | null
  drawerOpen: boolean
}) {
  const map = useMap()

  // zoom out to show all markers when nothing is selected
  useEffect(() => {
    if (selectedCode) {
      return
    }

    const bounds = mapBounds(venues)
    if (!bounds) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      return
    }

    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 })
  }, [map, venues, selectedCode])

  // fly to the venue the user clicked
  useEffect(() => {
    if (!selectedCode) {
      return
    }

    const venue = venues.find((v) => v.code === selectedCode)
    if (!venue) {
      return
    }

    map.flyTo([venue.lat, venue.lng], 13, { duration: 0.55 })
  }, [map, venues, selectedCode])

  // drawer slide changes map width so recalculate size after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()

      if (!selectedCode) {
        return
      }

      const venue = venues.find((v) => v.code === selectedCode)
      if (venue) {
        map.panTo([venue.lat, venue.lng], { animate: true, duration: 0.35 })
      }
    }, 280)

    return () => clearTimeout(timer)
  }, [map, drawerOpen, venues, selectedCode])

  return null
}

export function VenueMap({ venues, selectedCode, onSelect, drawerOpen }: VenueMapProps) {
  return (
    <div
      className="absolute inset-0 max-sm:[--venue-map-tooltip-max-width:min(200px,calc(100vw-96px))]"
      style={{ '--venue-map-tooltip-max-width': '220px' } as CSSProperties}
    >
      <MapContainer
        className="z-0 h-full w-full"
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController
          venues={venues}
          selectedCode={selectedCode}
          drawerOpen={drawerOpen}
        />
        {venues.map((venue) => {
          const isSelected = selectedCode === venue.code

          return (
            <Marker
              key={venue.code}
              position={[venue.lat, venue.lng]}
              icon={createMarkerIcon(isSelected, venue.meetCount)}
              eventHandlers={{
                click: () => onSelect(venue.code),
              }}
            >
              <VenueMarkerTooltip venue={venue} />
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
