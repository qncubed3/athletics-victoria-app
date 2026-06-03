import { handleRoute } from '@/lib/api/handleRoute'
import { fetchNews } from '@/lib/resultshub/events'

export async function GET(request) {
  const params = request.nextUrl.searchParams
  const season = params.get('season') || '2026'
  const series = params.get('series') || undefined
  return handleRoute(() => fetchNews(season, series))
}
