import { NextResponse } from 'next/server'
import { handleRoute } from '@/lib/api/handleRoute'
import { compareAthletes } from '@/lib/resultshub/athletes'

export async function GET(request) {
  const name1 = request.nextUrl.searchParams.get('name1')
  const name2 = request.nextUrl.searchParams.get('name2')

  if (!name1 || !name2) {
    return NextResponse.json(
      { error: 'Missing athlete names' },
      { status: 400 }
    )
  }

  return handleRoute(() => compareAthletes(name1, name2))
}
