'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { addCourseLayer } from '../../addCourseLayer'
import { syncTeamMarkers, type TeamMapMarker } from '../../addMapIcon'
import type { CourseTrack } from '../../courseTrack'

// Mapbox token from environment
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''
const TERRAIN_EXAGGERATION = 6

// Center coordinates for Jells Park
const JELLS_CENTER: [number, number] = [145.1987, -37.896]

export function CourseMap({
  course,
  teamMarkers,
}: {
  course: CourseTrack
  teamMarkers: TeamMapMarker[]
}) {

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const mapLoadedRef = useRef(false)
  const teamMarkersRef = useRef(teamMarkers)

  // Whenever teamMarkers changes, update the ref
  teamMarkersRef.current = teamMarkers

  useEffect(() => {
    // Only continue if there is a token and the container is ready
    if (!TOKEN || !containerRef.current) {
      return
    }

    // Set mapbox access token
    mapboxgl.accessToken = TOKEN

    // Create the map instance
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/standard-satellite',
      config: {
        basemap: {
          showPointOfInterestLabels: false,
        },
      },
      center: JELLS_CENTER,
      zoom: 16,
      pitch: 45,
      maxPitch: 60,
      minPitch: 8,
    })

    mapRef.current = map
    mapLoadedRef.current = false

    // Wait for map to load before adding layers and sources
    map.on('load', () => {
      // Hide 3d objects and points of interest labels
      map.setConfigProperty('basemap', 'show3dObjects', false)
      map.setConfigProperty('basemap', 'showPointOfInterestLabels', false)

      // Add elevation/terrain source for 3D terrain effect
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      })

      // Apply exaggerated terrain
      map.setTerrain({ source: 'mapbox-dem', exaggeration: TERRAIN_EXAGGERATION })

      // Add course line/path to map
      addCourseLayer(map, course)
      mapLoadedRef.current = true

      // Sync team markers on first load
      syncTeamMarkers(map, markersRef.current, teamMarkersRef.current)
    })

    // Cleanup function to remove map and markers on unmount
    return () => {
      // Remove all marker objects from map
      for (const marker of markersRef.current.values()) {
        marker.remove()
      }
      markersRef.current.clear()
      mapLoadedRef.current = false
      mapRef.current = null
      map.remove()
    }
  }, [course])

  useEffect(() => {
    // Update markers whenever teamMarkers changes and map is ready
    const map = mapRef.current
    if (!map || !mapLoadedRef.current) {
      return
    }

    syncTeamMarkers(map, markersRef.current, teamMarkers)
  }, [teamMarkers])

  // Show warning if token is missing
  if (!TOKEN) {
    return (
      <p className="rounded-xl bg-[var(--bg-subtle)] px-5 py-4 text-[0.95rem] text-[var(--text-muted)]">
        Add NEXT_PUBLIC_MAPBOX_TOKEN to web/.env.local to load the map.
      </p>
    )
  }

  // Render the map container
  return (
    <div
      ref={containerRef}
      className="h-full min-h-0 w-full"
    />
  )
}
