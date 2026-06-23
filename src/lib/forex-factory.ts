export interface FFEvent {
  title: string
  country: string
  date: string
  impact: string
  forecast?: string
  previous?: string
  actual?: string
}

export async function fetchFFCalendar(): Promise<FFEvent[]> {
  try {
    const res = await fetch('/api/calendar')
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
