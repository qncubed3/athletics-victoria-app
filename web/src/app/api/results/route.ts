import { handleRoute } from '@/lib/api/handleRoute'
import { fetchEventResults } from '@/lib/resultshub/client'

export async function GET(request) {
  const params = request.nextUrl.searchParams
  const season = params.get('season') || '2026'
  const series = params.get('series') || 'xcr'
  const round = params.get('round') || '1'
  const venue = params.get('venue') || 'all'

  return handleRoute(() =>
    fetchEventResults(season, series, round, venue)
  )
}
