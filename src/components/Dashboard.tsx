'use client'

import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { UNIQUE_SYMBOLS } from '@/constants/symbols'
import SearchBar from './SearchBar'
import SentimentTable from './SentimentTable'

const BATCH_SIZE = 5
const BATCH_DELAY = 2000

export default function Dashboard() {
  const {
    watchlist, results, selectedSymbol, isLoading, lastUpdated, error,
    addSymbol, removeSymbol, setResults, setSelected, setLoading, setError,
  } = useStore()

  const hasWatchlist = watchlist.length > 0
  const fetchingRef = useRef(false)
  const [ready, setReady] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const fetchBatch = useCallback(async (symbols: string[]) => {
    try {
      const res = await fetch('/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.results) setResults(data.results)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sentiment data')
    }
  }, [setResults, setError])

  const fetchAll = useCallback(async () => {
    if (watchlist.length === 0 || fetchingRef.current) return
    fetchingRef.current = true
    setLoading(true)
    setError(null)

    for (let i = 0; i < watchlist.length; i += BATCH_SIZE) {
      const batch = watchlist.slice(i, i + BATCH_SIZE)
      await fetchBatch(batch)
      if (i + BATCH_SIZE < watchlist.length) {
        if (i + BATCH_SIZE >= 10) {
          await new Promise(r => setTimeout(r, BATCH_DELAY))
        }
      }
    }

    fetchingRef.current = false
    setLoading(false)
  }, [watchlist, fetchBatch, setLoading, setError])

  useEffect(() => {
    // Already hydrated from localStorage — skip initial population
    if (watchlist.length > 0) {
      setReady(true)
      return
    }

    // Phase 1: load hardcoded symbols (skip crypto — live API handles them)
    for (const s of UNIQUE_SYMBOLS) {
      if (s.category === 'crypto') continue
      addSymbol(s.symbol)
    }

    // Phase 2: fetch crypto list
    fetch('/api/symbols/crypto')
      .then(r => r.json())
      .then(data => {
        if (data.symbols && Array.isArray(data.symbols)) {
          for (const s of data.symbols) {
            addSymbol(s.symbol)
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setReady(true)
      })
  }, [])

  useEffect(() => {
    if (!ready || !hasWatchlist) return
    fetchAll()
  }, [ready, hasWatchlist])

  const resultArray = watchlist
    .map(s => results[s])
    .filter((r): r is NonNullable<typeof r> => r != null)

  const filteredResults = useMemo(() => {
    if (!searchQuery) return resultArray
    const q = searchQuery.toLowerCase()
    return resultArray.filter(r => r.symbol.toLowerCase().includes(q))
  }, [resultArray, searchQuery])

  return (
    <div className="flex h-[calc(100vh-49px)]">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="glass border-b border-white/5 px-6 py-3.5 flex items-center gap-4 shrink-0">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 text-xs text-[#475569]">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-[#f59e0b] animate-pulse' : 'bg-[#14f5c7]'}`} />
              {isLoading
                ? `Loading ${resultArray.length}/${watchlist.length}...`
                : lastUpdated
                  ? `${watchlist.length} symbols · ${new Date(lastUpdated).toLocaleTimeString()}`
                  : '--'}
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
                  Loading...
                </span>
              ) : (
                'Refresh All'
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

        {/* Content */}
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
          ) : filteredResults.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-sm text-[#475569]">
              No symbols match "{searchQuery}"
            </div>
          ) : (
            <div className="glass rounded-xl flex-1 flex flex-col min-h-0 overflow-clip">
              <SentimentTable
                results={filteredResults}
                selected={selectedSymbol}
                onSelect={setSelected}
                onRemove={removeSymbol}
              />
            </div>
          )}

          <div className="mt-4 text-[10px] text-[#475569] text-center">
            {isLoading
              ? `Fetching ${resultArray.length}/${watchlist.length} symbols...`
              : searchQuery
                ? `${filteredResults.length}/${resultArray.length} symbols · filtered`
                : `${resultArray.length} symbols loaded · Data: Yahoo Finance`}
          </div>
        </div>
      </div>
    </div>
  )
}
