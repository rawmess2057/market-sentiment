'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchFFCalendar, type FFEvent } from '@/lib/forex-factory'

const IMPACT_COLORS: Record<string, string> = {
  High: 'text-[#f43f5e] bg-[#f43f5e]/10',
  Medium: 'text-[#f59e0b] bg-[#f59e0b]/10',
  Holiday: 'text-[#475569] bg-white/5',
}

const COUNTRY_CURRENCY: Record<string, string> = {
  US: 'USD', GB: 'GBP', JP: 'JPY', CH: 'CHF', AU: 'AUD', NZ: 'NZD', CA: 'CAD',
  EU: 'EUR', FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', FI: 'EUR', PT: 'EUR', IE: 'EUR', GR: 'EUR', LU: 'EUR',
  CN: 'CNY',
  USD: 'USD', GBP: 'GBP', JPY: 'JPY', CHF: 'CHF', AUD: 'AUD', NZD: 'NZD',
  CAD: 'CAD', EUR: 'EUR', CNY: 'CNY',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function formatDay(iso: string) {
  const d = new Date(iso)
  return `${DAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const h = d.getUTCHours()
  const m = d.getUTCMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 || 12
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function NewsView() {
  const [events, setEvents] = useState<FFEvent[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    fetchFFCalendar().then(data => { setEvents(data); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const groups: { day: string; events: FFEvent[] }[] = []
  let lastDay = ''
  for (const e of events) {
    const day = formatDay(e.date)
    if (day !== lastDay) {
      groups.push({ day, events: [] })
      lastDay = day
    }
    groups[groups.length - 1].events.push(e)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#f1f5f9]">Calendar</h2>
          <p className="text-xs text-[#475569] mt-0.5">Forex Factory economic events</p>
        </div>
        <button
          onClick={() => { setLoading(true); load() }}
          className="glass rounded-lg px-3 py-1.5 text-xs font-semibold text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/5 transition-all disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </span>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {loading && events.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#14f5c7] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-[#475569]">Loading calendar...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-sm text-[#475569]">No events this week</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-clip">
          {groups.map(g => (
            <div key={g.day}>
              <div className="sticky top-0 z-10 px-4 py-2 text-[10px] font-semibold text-[#475569] uppercase tracking-wider border-b border-white/5 bg-white/5">
                {g.day}
              </div>
              {g.events.map((e, i) => {
                const impactClass = IMPACT_COLORS[e.impact] || 'text-[#475569] bg-white/5'
                return (
                  <div key={i} className="px-4 py-3 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#f1f5f9] truncate mr-2">{e.title}</span>
                      <span className={`shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${impactClass}`}>{e.impact}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#475569]">
                      <span>{formatTime(e.date)}</span>
                      {COUNTRY_CURRENCY[e.country] && (
                        <span className={`text-xs font-semibold ${
                          e.impact === 'High' ? 'text-[#f43f5e]' :
                          e.impact === 'Medium' ? 'text-[#f59e0b]' :
                          'text-[#475569]'
                        }`}>
                          {COUNTRY_CURRENCY[e.country]}
                        </span>
                      )}
                      <span>{e.country}</span>
                      {e.forecast && <span>Forecast: {e.forecast}</span>}
                      {e.previous && <span>Prev: {e.previous}</span>}
                      {e.actual && (
                        <span className="text-[10px] font-semibold text-[#f1f5f9] bg-white/10 px-1.5 py-0.5 rounded">
                          Actual: {e.actual}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
