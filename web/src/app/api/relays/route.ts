import { handleRoute } from '@/lib/api/handleRoute'
import { getRelayResults } from '@/lib/resultshub/relays'

export async function GET(request) {
  const params = request.nextUrl.searchParams
  const season = params.get('season') || '2026'
  const series = params.get('series') || 'xcr'
  const round = params.get('round') || '2'
  const venue = params.get('venue') || 'all'
  const club = params.get('club') || undefined

  return handleRoute(() =>
    getRelayResults(season, series, round, venue, club)
  )
}
