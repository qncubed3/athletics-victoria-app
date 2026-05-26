import type { AthleteResultsResponse, AthletesResponse } from '../types/athlete'

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function apiUrl(path: string, params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : ''
  return `${API_BASE}${path}${qs}`
}

export async function fetchAthletes(): Promise<AthletesResponse> {
  const res = await fetch(apiUrl('/api/athletes'))
  if (!res.ok) {
    throw new Error(`Athletes API ${res.status}`)
  }
  return res.json()
}

export async function fetchAthleteResults(
  apiName: string
): Promise<AthleteResultsResponse> {
  const res = await fetch(
    apiUrl('/api/athletes/results', { name: apiName })
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Athlete results ${res.status}: ${body.slice(0, 120)}`)
  }
  return res.json()
}
