import { NextResponse } from 'next/server'

// Run a service function and return JSON, same error style as Django API
export async function handleRoute(serviceFn) {
  try {
    const data = await serviceFn()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const name = err instanceof Error ? err.name : 'Error'

    // Fetch failed or timed out
    if (name === 'TimeoutError' || message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Upstream ResultHub request timed out.' },
        { status: 504 }
      )
    }

    if (name === 'TypeError' && message.includes('fetch')) {
      return NextResponse.json(
        { error: message, type: name },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: message, type: name },
      { status: 500 }
    )
  }
}
