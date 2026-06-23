'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SentimentResult } from '@/lib/types'

interface StoreState {
  watchlist: string[]
  results: Record<string, SentimentResult>
  selectedSymbol: string | null
  isLoading: boolean
  isDetailOpen: boolean
  lastUpdated: number | null
  error: string | null

  addSymbol: (symbol: string) => void
  removeSymbol: (symbol: string) => void
  setResults: (results: SentimentResult[]) => void
  setSelected: (symbol: string | null) => void
  setDetailOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      results: {},
      selectedSymbol: null,
      isLoading: false,
      isDetailOpen: false,
      lastUpdated: null,
      error: null,

      addSymbol: (symbol) => {
        const { watchlist } = get()
        if (!watchlist.includes(symbol)) {
          set({ watchlist: [...watchlist, symbol] })
        }
      },

      removeSymbol: (symbol) => {
        const { watchlist, selectedSymbol } = get()
        set({
          watchlist: watchlist.filter(s => s !== symbol),
          selectedSymbol: selectedSymbol === symbol ? null : selectedSymbol,
        })
      },

      setResults: (results) => {
        const map: Record<string, SentimentResult> = {}
        for (const r of results) {
          map[r.symbol] = r
        }
        set({ results: { ...get().results, ...map }, lastUpdated: Date.now(), error: null })
      },

      setSelected: (symbol) => set({ selectedSymbol: symbol }),
      setDetailOpen: (open) => set({ isDetailOpen: open }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'rawfx-watchlist',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) return { watchlist: [] }
        return persisted as StoreState
      },
      partialize: (state) => ({ watchlist: state.watchlist }),
    },
  ),
)
