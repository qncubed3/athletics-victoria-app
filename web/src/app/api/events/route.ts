import { handleRoute } from '@/lib/api/handleRoute'
import { fetchEvents } from '@/lib/resultshub/events'

export async function GET(request) {
  const season = request.nextUrl.searchParams.get('season') || '2026'
  return handleRoute(() => fetchEvents(season))
}
