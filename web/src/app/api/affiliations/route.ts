import { handleRoute } from '@/lib/api/handleRoute'
import { fetchAffiliations } from '@/lib/resultshub/affiliations'

export async function GET() {
  return handleRoute(() => fetchAffiliations())
}
