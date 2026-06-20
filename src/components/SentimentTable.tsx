'use client'

import { motion } from 'framer-motion'
import { SentimentResult } from '@/lib/types'
import SentimentBar from './SentimentBar'
import Sparkline from './Sparkline'
import PhaseLabel from './PhaseLabel'

interface Props {
  results: SentimentResult[]
  selected: string | null
  onSelect: (symbol: string) => void
  onRemove: (symbol: string) => void
}

export default function SentimentTable({ results, selected, onSelect, onRemove }: Props) {
  if (results.length === 0) return null

  return (
    <div className="w-full flex-1 overflow-auto min-h-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider border-b border-white/5 sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <th className="text-left py-3 px-3 w-28">Symbol</th>
            <th className="text-left py-3 px-3 w-44">Intraday</th>
            <th className="text-left py-3 px-3 w-44">Daily</th>
            <th className="text-left py-3 px-3 w-24">Trend</th>
            <th className="text-left py-3 px-3 w-24">Phase</th>
            <th className="text-right py-3 px-3 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const isSelected = selected === r.symbol
            const overallBull = r.overallTrend === 'bullish'

            return (
              <motion.tr
                key={r.symbol}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onClick={() => onSelect(r.symbol)}
                className={`border-b border-white/[0.02] cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#a855f7]/5 border-l-2 border-l-[#a855f7]'
                    : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                }`}
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkline
                      data={r.sparklineData}
                      bull={overallBull}
                      width={40}
                      height={20}
                    />
                    <div>
                      <div className="font-semibold text-[#f1f5f9] text-sm">{r.symbol}</div>
                      <div className="text-[11px] text-[#475569]">
                        {r.price.toFixed(2)}
                        <span className={`ml-1 ${r.change24h >= 0 ? 'text-[#14f5c7]' : 'text-[#f43f5e]'}`}>
                          {r.change24h >= 0 ? '+' : ''}{r.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-semibold">
                      <span className="text-[#f43f5e]">{r.intraday.bearPct}%</span>
                      <span className="text-[#14f5c7]">{r.intraday.bullPct}%</span>
                    </div>
                    <SentimentBar bullPct={r.intraday.bullPct} bearPct={r.intraday.bearPct} size="sm" />
                  </div>
                </td>

                <td className="py-3 px-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-semibold">
                      <span className="text-[#f43f5e]">{r.daily.bearPct}%</span>
                      <span className="text-[#14f5c7]">{r.daily.bullPct}%</span>
                    </div>
                    <SentimentBar bullPct={r.daily.bullPct} bearPct={r.daily.bearPct} size="sm" />
                  </div>
                </td>

                <td className="py-3 px-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    r.overallTrend === 'bullish' ? 'text-[#14f5c7]' :
                    r.overallTrend === 'bearish' ? 'text-[#f43f5e]' : 'text-[#94a3b8]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      r.overallTrend === 'bullish' ? 'bg-[#14f5c7]' :
                      r.overallTrend === 'bearish' ? 'bg-[#f43f5e]' : 'bg-[#475569]'
                    }`} />
                    {r.overallTrend === 'bullish' ? 'Bullish' : r.overallTrend === 'bearish' ? 'Bearish' : 'Neutral'}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <PhaseLabel phase={r.daily.phase} size="sm" />
                </td>

                <td className="py-3 px-3 text-right">
                  <button
                    onClick={e => { e.stopPropagation(); onRemove(r.symbol) }}
                    className="text-[#475569] hover:text-[#f43f5e] transition-colors p-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
