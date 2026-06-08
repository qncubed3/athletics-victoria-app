import type mapboxgl from 'mapbox-gl'
import type { CourseTrack } from './courseTrack'
import { courseTrackToGeoJSON } from './courseTrack'

export function addCourseLayer(map: mapboxgl.Map, course: CourseTrack) {
  const geojson = courseTrackToGeoJSON(course)

  // add a source for the course
  map.addSource('course', { type: 'geojson', data: geojson })
  // add a layer for the course
  map.addLayer({
    id: 'course-line',
    type: 'line',
    source: 'course',
    paint: {
      'line-color': '#e85d04',
      // thicker line as you zoom in
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        12,
        2,
        16,
        6,
        19,
        12,
      ],
    },
  })

  const minLng = Math.min(...course.points.map((point) => point.lng))
  const minLat = Math.min(...course.points.map((point) => point.lat))
  const maxLng = Math.max(...course.points.map((point) => point.lng))
  const maxLat = Math.max(...course.points.map((point) => point.lat))

  // fit the map to the course
  map.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    { padding: 80, pitch: 45, duration: 1000 }
  )
}
