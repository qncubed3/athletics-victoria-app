'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet'
import type { ParsedVenue } from '@/types/events'
import { mapBounds } from '@/utils/venueMap'
import 'leaflet/dist/leaflet.css'

interface VenueMapProps {
  venues: ParsedVenue[]
  selectedCode: string | null
  onSelect: (code: string) => void
  drawerOpen: boolean
}

function venueTypeLabel(type: string) {
  return type === 'outOfStad' ? 'Out of stadium' : 'Stadium'
}

function VenueMarkerTooltip({ venue }: { venue: ParsedVenue }) {
  const meetLabel =
    venue.meetCount === 1 ? '1 meet' : `${venue.meetCount} meets`

  return (
    <Tooltip
      className="venue-map-tooltip"
      direction="top"
      offset={[0, -24]}
      opacity={1}
    >
      <div className="venue-map-tooltip__inner">
        <p className="venue-map-tooltip__name">{venue.name}</p>
        {venue.address ? (
          <p className="venue-map-tooltip__address">{venue.address}</p>
        ) : null}
        <p className="venue-map-tooltip__meta">
          {meetLabel} · {venueTypeLabel(venue.type)}
        </p>
      </div>
    </Tooltip>
  )
}

function createMarkerIcon(selected: boolean, meetCount: number) {
  const label = meetCount > 99 ? '99+' : String(meetCount)
  const size = 44

  return L.divIcon({
    className: 'venue-marker-leaflet',
    html: `<span class="venue-marker ${selected ? 'venue-marker--selected' : ''}">
      <span class="venue-marker__halo" aria-hidden="true"></span>
      <span class="venue-marker__core">${label}</span>
    </span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FitBounds({ venues, selectedCode }: { venues: ParsedVenue[]; selectedCode: string | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedCode) {
      return
    }
    const bounds = mapBounds(venues)
    if (!bounds) {
      map.setView([-37.8136, 144.9631], 9)
      return
    }
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 })
  }, [map, venues, selectedCode])

  return null
}

// Pan and zoom to the venue the user picked
function FlyToSelected({
  venues,
  selectedCode,
}: {
  venues: ParsedVenue[]
  selectedCode: string | null
}) {
  const map = useMap()

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

  return null
}

// Refresh map size when the drawer opens or closes, re-center if a venue is selected
function MapLayoutSync({
  drawerOpen,
  venues,
  selectedCode,
}: {
  drawerOpen: boolean
  venues: ParsedVenue[]
  selectedCode: string | null
}) {
  const map = useMap()

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
    <div className="venue-map-wrap">
      <MapContainer
        className="venue-map"
        center={[-37.8136, 144.9631]}
        zoom={9}
        scrollWheelZoom
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapLayoutSync
          drawerOpen={drawerOpen}
          venues={venues}
          selectedCode={selectedCode}
        />
        <FitBounds venues={venues} selectedCode={selectedCode} />
        <FlyToSelected venues={venues} selectedCode={selectedCode} />
        {venues.map((venue) => (
          <Marker
            key={venue.code}
            position={[venue.lat, venue.lng]}
            icon={createMarkerIcon(selectedCode === venue.code, venue.meetCount)}
            eventHandlers={{
              click: () => onSelect(venue.code),
            }}
          >
            <VenueMarkerTooltip venue={venue} />
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
