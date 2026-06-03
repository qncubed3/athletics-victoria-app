import { NextResponse } from 'next/server'

// Simple health check for the API
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'athletics-victoria-api',
  })
}
