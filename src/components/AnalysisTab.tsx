'use client'

import { useMemo, useState } from 'react'
import { useJournalStore } from '@/store/journalStore'
import { JournalTrade, JournalConfig, classifyResult } from '@/lib/journal-types'

export default function AnalysisTab() {
  const { trades, config, getStats } = useJournalStore()
  const stats = useMemo(() => getStats(), [trades, config, getStats])
  const analyzed = useMemo(() => trades.filter(t => t.includeInAnalysis), [trades])

  if (analyzed.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-[#475569]">
        No trades in journal yet. Go to Journal to add trades.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto min-h-0 space-y-2">
      {/* Config Summary */}
      <div className="glass rounded-xl p-2">
        <p className="text-[9px] font-semibold text-[#475569] uppercase tracking-wider mb-1">Account Config</p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-1 text-[10px]">
          <div><span className="text-[#475569]">Balance: </span><span className="text-[#f1f5f9]">${config.accountBalance.toLocaleString()}</span></div>
          <div><span className="text-[#475569]">Risk: </span><span className="text-[#f1f5f9]">{config.riskPercent}%</span></div>
          <div><span className="text-[#475569]">Context TF: </span><span className="text-[#f1f5f9]">{config.contextTimeframe}</span></div>
          <div><span className="text-[#475569]">Validation TF: </span><span className="text-[#f1f5f9]">{config.validationTimeframe}</span></div>
          <div><span className="text-[#475569]">Entry TF: </span><span className="text-[#f1f5f9]">{config.entryTimeframe}</span></div>
          <div><span className="text-[#475569]">Costs: </span><span className="text-[#f1f5f9]">{config.costsPerTrade}R</span></div>

          <div><span className="text-[#475569]">Max Loss: </span><span className="text-[#f1f5f9]">{config.maxLossPercent}%</span></div>
          <div><span className="text-[#475569]">Trades: </span><span className="text-[#f1f5f9]">{stats.total}</span></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
        <BigStat label="Trades" value={stats.total.toString()} />
        <BigStat label="Win Rate" value={stats.winPct.toFixed(1)} suffix="%" color={stats.winPct >= 50 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'} />
        <BigStat label="PF" value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)} color={(stats.profitFactor >= 1 || stats.profitFactor === Infinity) ? 'text-[#14f5c7]' : 'text-[#f43f5e]'} />
        <BigStat label="Avg R" value={stats.avgR.toFixed(2)} color={stats.avgR >= 0 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'} />
        <BigStat label="EV" value={stats.ev.toFixed(2)} color={stats.ev >= 0 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'} />
        <BigStat label="ROI" value={stats.roi.toFixed(1)} suffix="%" color={stats.roi >= 0 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'} />
        <BigStat label="Max DD" value={stats.maxDdPct.toFixed(1)} suffix="%" color="text-[#f43f5e]" />
        <BigStat label="RoR" value={stats.riskOfRuin < 0.01 ? '<1%' : (stats.riskOfRuin * 100).toFixed(1) + '%'} color={stats.riskOfRuin < 0.1 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'} />
      </div>

      {/* Win/BE/Loss Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <PieChartCard wins={stats.wins} be={stats.be} losses={stats.losses} total={stats.total} avgWinR={stats.avgWinR} avgLossR={stats.avgLossR} />
        <div className="lg:col-span-2">
          <CalendarHeatmap trades={analyzed} />
        </div>
      </div>

      {/* Equity Curve */}
      <EquityCurve trades={analyzed} config={config} />

      {/* Detail Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <PerformanceTables trades={analyzed} />
        <DrawdownAnalysis trades={analyzed} config={config} />
      </div>
    </div>
  )
}

/* ===== Pie Chart ===== */
function PieChartCard({ wins, be, losses, total, avgWinR, avgLossR }: { wins: number; be: number; losses: number; total: number; avgWinR: number; avgLossR: number }) {
  if (total === 0) return (
    <div className="glass rounded-xl p-2 flex items-center justify-center min-h-[160px]">
      <p className="text-[10px] text-[#475569]">No data</p>
    </div>
  )

  const angleTo = (pct: number) => (pct / 100) * 360
  const wPct = (wins / total) * 100
  const bPct = (be / total) * 100
  const lPct = (losses / total) * 100

  const wAngle = angleTo(wPct)
  const bAngle = angleTo(bPct)
  const lAngle = angleTo(lPct)

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`
  }
  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  let accum = 0
  const slices: { path: string; color: string; label: string }[] = []

  if (wPct > 0) {
    slices.push({ path: describeArc(100, 100, 90, accum, accum + wAngle), color: '#14f5c7', label: 'Win' })
    accum += wAngle
  }
  if (bPct > 0) {
    slices.push({ path: describeArc(100, 100, 90, accum, accum + bAngle), color: '#f59e0b', label: 'BE' })
    accum += bAngle
  }
  if (lPct > 0) {
    slices.push({ path: describeArc(100, 100, 90, accum, accum + lAngle), color: '#f43f5e', label: 'Loss' })
  }

  return (
    <div className="glass rounded-xl p-3">
      <h3 className="text-[9px] font-semibold text-[#475569] uppercase tracking-wider mb-2">Win / BE / Loss</h3>
      <div className="flex items-center gap-3">
        <svg width="140" height="140" viewBox="0 0 200 200">
          {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity="0.85" />)}
          <circle cx="100" cy="100" r="45" fill="var(--bg-secondary)" />
          <text x="100" y="95" textAnchor="middle" fill="#f1f5f9" fontSize="22" fontWeight="bold">{total}</text>
          <text x="100" y="115" textAnchor="middle" fill="#475569" fontSize="10">trades</text>
        </svg>
        <div className="space-y-1">
          <Legend color="#14f5c7" label="Win" value={`${wins} (${wPct.toFixed(1)}%)`} />
          <Legend color="#f59e0b" label="BE" value={`${be} (${bPct.toFixed(1)}%)`} />
          <Legend color="#f43f5e" label="Loss" value={`${losses} (${lPct.toFixed(1)}%)`} />
            <div className="pt-1 text-[9px] text-[#475569]">
              <p>Avg Win: +{avgWinR.toFixed(2)}R</p>
              <p>Avg Loss: {avgLossR.toFixed(2)}R</p>
            </div>
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-[#94a3b8]">{label}</span>
      <span className="text-xs font-semibold text-[#f1f5f9]">{value}</span>
    </div>
  )
}

/* ===== Calendar Heatmap ===== */
function CalendarHeatmap({ trades }: { trades: JournalTrade[] }) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const tradeMap = useMemo(() => {
    const map: Record<string, JournalTrade[]> = {}
    for (const t of trades) {
      const key = t.date
      if (!map[key]) map[key] = []
      map[key].push(t)
    }
    return map
  }, [trades])

  function getColor(dateStr: string) {
    const dayTrades = tradeMap[dateStr]
    if (!dayTrades || dayTrades.length === 0) return ''
    const hasWin = dayTrades.some(t => classifyResult(t.rrSecured) === 'win')
    const hasLoss = dayTrades.some(t => classifyResult(t.rrSecured) === 'loss')
    if (hasWin && !hasLoss) return 'bg-[#14f5c7]/30'
    if (hasLoss && !hasWin) return 'bg-[#f43f5e]/30'
    return 'bg-[#f59e0b]/30'
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[9px] font-semibold text-[#475569] uppercase tracking-wider">Calendar</h3>
        <div className="flex items-center gap-1.5">
          <button onClick={() => { if (month === 0) { setYear(y => y-1); setMonth(11) } else setMonth(m => m-1) }} className="text-[#475569] hover:text-[#94a3b8] p-0.5 text-[10px]">&lt;</button>
          <span className="text-[10px] font-semibold text-[#f1f5f9]">{months[month]} {year}</span>
          <button onClick={() => { if (month === 11) { setYear(y => y+1); setMonth(0) } else setMonth(m => m+1) }} className="text-[#475569] hover:text-[#94a3b8] p-0.5 text-[10px]">&gt;</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {days.map(d => <div key={d} className="text-[8px] text-[#475569] text-center font-semibold py-0.5">{d}</div>)}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayTrades = tradeMap[dateStr]
          const color = getColor(dateStr)
          return (
            <div
              key={day}
              className={`w-7 h-7 rounded text-[9px] font-semibold flex items-center justify-center ${color || (dayTrades ? 'bg-[#a855f7]/20' : 'hover:bg-white/[0.02]')} ${dayTrades ? 'text-[#f1f5f9]' : 'text-[#475569]'}`}
              title={dayTrades ? `${dayTrades.length} trade(s) - Avg R: ${(dayTrades.reduce((s,t) => s+t.rrSecured,0)/dayTrades.length).toFixed(2)}` : undefined}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ===== Performance Tables ===== */
function PerformanceTables({ trades }: { trades: JournalTrade[] }) {
  const byDayOfWeek = useMemo(() => {
    const map: Record<string, { trades: JournalTrade[]; r: number }> = {}
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    for (const t of trades) {
      const d = new Date(t.date)
      const dayName = days[d.getDay()]
      if (!map[dayName]) map[dayName] = { trades: [], r: 0 }
      map[dayName].trades.push(t)
      map[dayName].r += t.rrSecured
    }
    return Object.entries(map)
      .map(([day, data]) => ({ day, trades: data.trades.length, r: data.r, avgR: data.r / data.trades.length }))
      .sort((a, b) => ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(a.day) - ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(b.day))
  }, [trades])

  const byMonth = useMemo(() => {
    const map: Record<string, { trades: JournalTrade[]; r: number }> = {}
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    for (const t of trades) {
      const m = new Date(t.date).getMonth()
      const name = months[m]
      if (!map[name]) map[name] = { trades: [], r: 0 }
      map[name].trades.push(t)
      map[name].r += t.rrSecured
    }
    return Object.entries(map).map(([month, data]) => ({ month, trades: data.trades.length, r: data.r, avgR: data.r / data.trades.length }))
  }, [trades])

  return (
    <div className="space-y-3">
      {/* By Day of Week */}
      <div className="glass rounded-xl p-3">
        <h3 className="text-[9px] font-semibold text-[#475569] uppercase tracking-wider mb-1">By Day of Week</h3>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-[9px] text-[#475569] border-b border-white/5">
              <th className="text-left py-1">Day</th>
              <th className="text-right py-1">Trades</th>
              <th className="text-right py-1">Total R</th>
              <th className="text-right py-1">Avg R</th>
            </tr>
          </thead>
          <tbody>
            {byDayOfWeek.map(d => (
              <tr key={d.day} className="border-b border-white/[0.02]">
                <td className="py-1 text-[#94a3b8]">{d.day}</td>
                <td className="py-1 text-right text-[#f1f5f9]">{d.trades}</td>
                <td className={`py-1 text-right font-semibold ${d.r >= 0 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'}`}>{d.r.toFixed(2)}</td>
                <td className={`py-1 text-right font-semibold ${d.avgR >= 0 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'}`}>{d.avgR.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* By Month */}
      <div className="glass rounded-xl p-3">
        <h3 className="text-[9px] font-semibold text-[#475569] uppercase tracking-wider mb-1">By Month</h3>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-[9px] text-[#475569] border-b border-white/5">
              <th className="text-left py-1">Month</th>
              <th className="text-right py-1">Trades</th>
              <th className="text-right py-1">Total R</th>
              <th className="text-right py-1">Avg R</th>
            </tr>
          </thead>
          <tbody>
            {byMonth.map(m => (
              <tr key={m.month} className="border-b border-white/[0.02]">
                <td className="py-1 text-[#94a3b8]">{m.month}</td>
                <td className="py-1 text-right text-[#f1f5f9]">{m.trades}</td>
                <td className={`py-1 text-right font-semibold ${m.r >= 0 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'}`}>{m.r.toFixed(2)}</td>
                <td className={`py-1 text-right font-semibold ${m.avgR >= 0 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'}`}>{m.avgR.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ===== Equity Curve ===== */
function EquityCurve({ trades, config }: { trades: JournalTrade[]; config: JournalConfig }) {
  const curves = useMemo(() => {
    const sorted = [...trades].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    const initial = config.accountBalance
    const riskPct = config.riskPercent / 100

    const toPt = (bal: number) => Math.round(bal * 100) / 100

    const fixed: { date: string; balance: number }[] = [{ date: '', balance: initial }]
    let fixedBal = initial
    const comp: { date: string; balance: number }[] = [{ date: '', balance: initial }]
    let compBal = initial

    for (const t of sorted) {
      const fixedRiskCash = initial * riskPct
      const pnlFixed = (t.rrSecured - config.costsPerTrade) * fixedRiskCash
      fixedBal += pnlFixed
      fixed.push({ date: t.date, balance: toPt(fixedBal) })

      const compRiskCash = compBal * riskPct
      const pnlComp = (t.rrSecured - config.costsPerTrade) * compRiskCash
      compBal += pnlComp
      comp.push({ date: t.date, balance: toPt(compBal) })
    }

    return { fixed, comp }
  }, [trades, config])

  const allPoints = [...curves.fixed, ...curves.comp]
  if (allPoints.length < 3) return null

  const minBal = Math.min(...allPoints.map(p => p.balance))
  const maxBal = Math.max(...allPoints.map(p => p.balance))
  const range = maxBal - minBal || 1
  const w = 700
  const h = 140
  const pad = { top: 12, right: 12, bottom: 20, left: 50 }

  function x(i: number) { return pad.left + (i / (curves.fixed.length - 1)) * (w - pad.left - pad.right) }
  function y(b: number) { return pad.top + (1 - (b - minBal) / range) * (h - pad.top - pad.bottom) }

  const fixedPath = curves.fixed.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.balance)}`).join(' ')
  const compPath = curves.comp.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.balance)}`).join(' ')

  const startBal = curves.fixed[0].balance
  const fixedEnd = curves.fixed[curves.fixed.length - 1].balance
  const compEnd = curves.comp[curves.comp.length - 1].balance
  const fixedUp = fixedEnd >= startBal
  const compUp = compEnd >= startBal

  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[9px] font-semibold text-[#475569] uppercase tracking-wider">Equity Curve</h3>
        <div className="flex items-center gap-4 text-[9px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 rounded bg-[#38bdf8]" />
            <span className="text-[#475569]">Fixed: <span className={fixedUp ? 'text-[#38bdf8]' : 'text-[#f43f5e]'}>${fixedEnd.toLocaleString()}</span></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 rounded bg-[#14f5c7]" />
            <span className="text-[#475569]">Comp: <span className={compUp ? 'text-[#14f5c7]' : 'text-[#f43f5e]'}>${compEnd.toLocaleString()}</span></span>
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const yy = pad.top + (1 - f) * (h - pad.top - pad.bottom)
          const val = minBal + f * range
          return (
            <g key={f}>
              <line x1={pad.left} y1={yy} x2={w - pad.right} y2={yy} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x={pad.left - 6} y={yy + 2} textAnchor="end" fill="#475569" fontSize="8">
                ${(val / 1000).toFixed(0)}k
              </text>
            </g>
          )
        })}
        <path d={fixedPath} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={compPath} fill="none" stroke="#14f5c7" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(0)} cy={y(startBal)} r="2" fill="#94a3b8" />
      </svg>
    </div>
  )
}

/* ===== Drawdown Analysis ===== */
function DrawdownAnalysis({ trades, config }: { trades: JournalTrade[]; config: JournalConfig }) {
  const { drawdowns } = useMemo(() => {
    const sorted = [...trades].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    let balance = config.accountBalance
    let peak = balance
    let trough = balance
    const ddPeriods: { start: string; end: string; ddPct: number; ddR: number }[] = []
    let ddStart = ''
    let inDD = false
    const riskPct = config.riskPercent / 100

    for (const t of sorted) {
      const riskCash = config.accountBalance * riskPct
      balance += (t.rrSecured - config.costsPerTrade) * riskCash

      if (balance > peak) {
        if (inDD) {
          const ddR = peak - trough
          ddPeriods.push({ start: ddStart, end: t.date, ddPct: (ddR / peak) * 100, ddR })
          inDD = false
        }
        peak = balance
        trough = balance
      } else {
        if (!inDD) { ddStart = t.date; inDD = true }
        if (balance < trough) trough = balance
      }
    }
    if (inDD) {
      const ddR = peak - trough
      ddPeriods.push({ start: ddStart, end: 'Present', ddPct: (ddR / peak) * 100, ddR })
    }

    return { drawdowns: ddPeriods.slice(-10).reverse() }
  }, [trades, config])

  return (
    <div className="glass rounded-xl p-3">
      <h3 className="text-[9px] font-semibold text-[#475569] uppercase tracking-wider mb-1">Drawdown Periods</h3>
      {drawdowns.length === 0 ? (
        <p className="text-[10px] text-[#475569]">No drawdown periods</p>
      ) : (
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-[9px] text-[#475569] border-b border-white/5">
              <th className="text-left py-1">Start</th>
              <th className="text-left py-1">End</th>
              <th className="text-right py-1">DD %</th>
              <th className="text-right py-1">DD (R)</th>
            </tr>
          </thead>
          <tbody>
            {drawdowns.map((dd, i) => (
              <tr key={i} className="border-b border-white/[0.02]">
                <td className="py-1 text-[#94a3b8]">{dd.start}</td>
                <td className="py-1 text-[#94a3b8]">{dd.end}</td>
                <td className="py-1 text-right text-[#f43f5e] font-semibold">{dd.ddPct.toFixed(2)}%</td>
                <td className="py-1 text-right text-[#f43f5e] font-semibold">{dd.ddR.toFixed(2)}R</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ===== Stat Card ===== */
function BigStat({ label, value, suffix, color }: { label: string; value: string; suffix?: string; color?: string }) {
  return (
    <div className="glass rounded-xl p-2">
      <p className="text-[8px] font-semibold text-[#475569] uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold ${color || 'text-[#f1f5f9]'}`}>{value}{suffix || ''}</p>
    </div>
  )
}
