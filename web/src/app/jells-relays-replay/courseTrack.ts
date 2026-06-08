import type { FeatureCollection } from 'geojson'

// keeps track of cumulative distance along the course in meters for more efficient position calculation
export interface CoursePoint {
  lng: number
  lat: number
  elevation_m: number | null
  distance_m: number
}

// represents a complete track of a course, including all points and their distances
export interface CourseTrack {
  name: string
  source: string
  total_distance_m: number
  points: CoursePoint[]
}

// converts to geojson for mapbox layers
export function courseTrackToGeoJSON(course: CourseTrack): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: course.name,
          source: course.source,
        },
        geometry: {
          type: 'LineString',
          coordinates: course.points.map((point) => {
            if (point.elevation_m != null) {
              return [point.lng, point.lat, point.elevation_m]
            }
            return [point.lng, point.lat]
          }),
        },
      },
    ],
  }
}

export function interpolatePositionAtDistance(
  course: CourseTrack,
  distanceM: number
): { lng: number; lat: number } | null {
  const { points } = course
  if (points.length === 0) {
    return null
  }

  const clamped = Math.max(0, Math.min(distanceM, course.total_distance_m))

  if (clamped <= points[0].distance_m) {
    return { lng: points[0].lng, lat: points[0].lat }
  }

  const last = points[points.length - 1]
  if (clamped >= last.distance_m) {
    return { lng: last.lng, lat: last.lat }
  }

  let lo = 0
  let hi = points.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    if (points[mid].distance_m <= clamped) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }

  const start = points[lo]
  const end = points[lo + 1]
  const segmentLength = end.distance_m - start.distance_m
  if (segmentLength <= 0) {
    return { lng: start.lng, lat: start.lat }
  }

  const t = (clamped - start.distance_m) / segmentLength
  return {
    lng: start.lng + t * (end.lng - start.lng),
    lat: start.lat + t * (end.lat - start.lat),
  }
}
