import { NextResponse } from 'next/server'
import { handleRoute } from '@/lib/api/handleRoute'
import { fetchAthleteResults } from '@/lib/resultshub/athletes'

export async function GET(request) {
  const name = request.nextUrl.searchParams.get('name')
  if (!name) {
    return NextResponse.json(
      { error: 'Missing required query parameter: name' },
      { status: 400 }
    )
  }
  return handleRoute(() => fetchAthleteResults(name))
}
