import { NextResponse } from 'next/server'

const CACHE_TTL = 30 * 60 * 1000
let cache: { data: unknown[]; ts: number } | null = null

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }
  try {
    const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json')
    if (!res.ok) {
      if (cache) return NextResponse.json(cache.data)
      return NextResponse.json([])
    }
    const data: unknown[] = await res.json()
    const filtered = (data as Array<Record<string, string>>).filter(
      e => e.impact === 'High' || e.impact === 'Medium'
    )
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    cache = { data: filtered, ts: Date.now() }
    return NextResponse.json(filtered)
  } catch {
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json([])
  }
}
