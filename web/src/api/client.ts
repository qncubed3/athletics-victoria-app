import type { AthleteResultsResponse, AthletesResponse } from '../types/athlete'
import type { EventsResponse } from '../types/events'

// Same-origin calls to Next.js /api routes
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')

function apiUrl(path, params?) {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : ''
  return `${API_BASE}${path}${qs}`
}

export async function fetchEvents(season) {
  const res = await fetch(apiUrl('/api/events', { season: season }))
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Events API ${res.status}: ${body.slice(0, 120)}`)
  }
  return res.json()
}

export async function fetchAthletes() {
  const res = await fetch(apiUrl('/api/athletes'))
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Athletes API ${res.status}: ${body.slice(0, 120)}`)
  }
  return res.json()
}

export async function fetchAthleteResults(apiName) {
  const res = await fetch(apiUrl('/api/athletes/results', { name: apiName }))
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Athlete results ${res.status}: ${body.slice(0, 120)}`)
  }
  return res.json()
}

export async function fetchAthleteCompare(name1, name2) {
  const res = await fetch(
    apiUrl('/api/athletes/compare', { name1: name1, name2: name2 })
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Athlete compare ${res.status}: ${body.slice(0, 120)}`)
  }
  return res.json()
}
