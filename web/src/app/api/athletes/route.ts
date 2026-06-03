import { handleRoute } from '@/lib/api/handleRoute'
import { fetchAthletes } from '@/lib/resultshub/athletes'

export async function GET() {
  return handleRoute(() => fetchAthletes())
}
