'use client'

import { useEffect, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { DEFAULT_WATCHLIST } from '@/constants/symbols'
import { SentimentResult } from '@/lib/types'
import SearchBar from './SearchBar'
import SentimentTable from './SentimentTable'


export default function Dashboard() {
  const {
    watchlist, results, selectedSymbol, isLoading, lastUpdated, error,
    addSymbol, removeSymbol, setResults, setSelected, setLoading, setError,
  } = useStore()

  const hasWatchlist = watchlist.length > 0

  // Initialize watchlist
  useEffect(() => {
    if (watchlist.length === 0 && DEFAULT_WATCHLIST.length > 0) {
      DEFAULT_WATCHLIST.forEach(s => addSymbol(s))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAll = useCallback(async () => {
    if (watchlist.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: watchlist }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResults(data.results)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sentiment data')
    } finally {
      setLoading(false)
    }
  }, [watchlist, setResults, setLoading, setError])

  // Initial fetch on watchlist ready
  useEffect(() => {
    if (hasWatchlist) fetchAll()
  }, [hasWatchlist])

  // Re-fetch when watchlist changes (symbol added/removed), and auto-refresh
  useEffect(() => {
    if (!hasWatchlist) return
    const interval = setInterval(fetchAll, 60_000)
    return () => clearInterval(interval)
  }, [hasWatchlist])

  function handleSymbolAdd(symbol: string) {
    addSymbol(symbol)
  }

  const resultArray = watchlist
    .map(s => results[s])
    .filter((r): r is SentimentResult => r != null)

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="glass border-b border-white/5 px-6 py-3.5 flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-[#f1f5f9] tracking-tight">
              <span className="text-[#14f5c7]">Raw</span>FX
            </h1>
            <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
              Institutional Sentiment
            </span>
          </div>

          <SearchBar onSelect={handleSymbolAdd} />

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 text-xs text-[#475569]">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-[#f59e0b] animate-pulse' : 'bg-[#14f5c7]'}`} />
              {isLoading ? 'Updating...' : lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--'}
            </div>

            <button
              onClick={fetchAll}
              disabled={isLoading}
              className="glass rounded-lg px-3 py-1.5 text-xs font-semibold text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/5 transition-all disabled:opacity-40"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Refresh
                </span>
              ) : (
                'Refresh'
              )}
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-3 px-4 py-2 bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded-lg text-xs text-[#f43f5e]">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 flex flex-col p-6 pt-4 overflow-hidden min-h-0">
          {isLoading && resultArray.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-shimmer rounded-xl h-14" />
              ))}
            </div>
          ) : resultArray.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-sm text-[#475569]">
              No symbols loaded. Search and add symbols to begin.
            </div>
          ) : (
            <div className="glass rounded-xl flex-1 flex flex-col min-h-0 overflow-clip">
              <SentimentTable
                results={resultArray}
                selected={selectedSymbol}
                onSelect={setSelected}
                onRemove={removeSymbol}
              />
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 text-[10px] text-[#475569] text-center">
            Auto-refreshes every 60s · Data: Yahoo Finance
          </div>
        </div>
      </div>

    </div>
  )
}
