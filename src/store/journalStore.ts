'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { JournalTrade, JournalConfig, JournalStats, Journal, computeStats } from '@/lib/journal-types'

const defaultConfig: JournalConfig = {
  accountBalance: 1_000_000,
  riskPercent: 0.5,
  contextTimeframe: '1h',
  validationTimeframe: '15m',
  entryTimeframe: '5m',
  costsPerTrade: 0.1,
  maxLossPercent: 100,
  criteriaLabels: ['Criteria 1', 'Criteria 2', 'Criteria 3', 'Criteria 4'],
}

interface JournalState {
  journals: Journal[]
  activeJournalId: string | null
  trades: JournalTrade[]
  config: JournalConfig
  loading: boolean
  error: string | null
  _hydrated: boolean

  fetchJournals: () => Promise<void>
  createJournal: (name: string, type: string, strategy: string) => Promise<Journal | null>
  deleteJournal: (id: string) => Promise<void>
  updateJournal: (id: string, data: Partial<Journal>) => Promise<void>
  switchJournal: (id: string) => Promise<void>

  fetchTrades: () => Promise<void>
  addTrade: (trade: JournalTrade) => Promise<void>
  updateTrade: (id: string, trade: Partial<JournalTrade>) => Promise<void>
  deleteTrade: (id: string) => Promise<void>

  setConfig: (partial: Partial<JournalConfig>) => Promise<void>

  importTrades: (trades: JournalTrade[]) => Promise<{ imported: number; skipped: number; failed: number }>
  getStats: () => JournalStats
}

function journalConfig(j: Journal | null | undefined): JournalConfig {
  return j?.config ?? defaultConfig
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      journals: [],
      activeJournalId: null,
      trades: [],
      config: { ...defaultConfig },
      loading: false,
      error: null,
      _hydrated: false,

      /* ---- Journals ---- */

      fetchJournals: async () => {
        set({ loading: true, error: null })
        try {
          const res = await fetch('/api/journals')
          if (!res.ok) throw new Error('Failed to fetch journals')
          const data = await res.json()
          let journals: Journal[] = data.journals

          if (journals.length === 0) {
            const created = await get().createJournal('Main', 'LIVE', '')
            if (created) journals = [created]
          }

          fetch('/api/trades/adopt-orphans', { method: 'PATCH' }).catch(() => {})

          const { activeJournalId } = get()
          let targetId = activeJournalId
          if (!targetId || !journals.find(j => j.id === targetId)) {
            targetId = journals[0]?.id ?? null
          }

          set({
            journals,
            activeJournalId: targetId,
            config: journalConfig(journals.find(j => j.id === targetId)),
            loading: false,
          })

          if (targetId) get().fetchTrades()
        } catch {
          set({ error: 'Failed to load journals', loading: false })
        }
      },

      createJournal: async (name, type, strategy) => {
        try {
          const res = await fetch('/api/journals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, strategy }),
          })
          if (!res.ok) throw new Error('Failed to create journal')
          const data = await res.json()
          const journal: Journal = data.journal
          set({ journals: [...get().journals, journal] })
          return journal
        } catch {
          set({ error: 'Failed to create journal' })
          return null
        }
      },

      deleteJournal: async (id) => {
        try {
          const res = await fetch(`/api/journals/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed to delete journal')
          const { journals, activeJournalId } = get()
          const next = journals.filter(j => j.id !== id)
          set({ journals: next })
          if (activeJournalId === id) {
            const first = next[0]
            if (first) {
              await get().switchJournal(first.id)
            } else {
              set({ activeJournalId: null, trades: [], config: { ...defaultConfig } })
            }
          }
        } catch {
          set({ error: 'Failed to delete journal' })
        }
      },

      updateJournal: async (id, data) => {
        try {
          const res = await fetch(`/api/journals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (!res.ok) throw new Error('Failed to update journal')
          const result = await res.json()
          const updated: Journal = result.journal
          const { activeJournalId } = get()
          const patch: Partial<JournalState> = {
            journals: get().journals.map(j => (j.id === id ? updated : j)),
          }
          if (id === activeJournalId) {
            patch.config = updated.config
          }
          set(patch)
        } catch {
          set({ error: 'Failed to update journal' })
        }
      },

      switchJournal: async (id) => {
        const { journals } = get()
        const journal = journals.find(j => j.id === id)
        if (!journal) return
        set({ activeJournalId: id, config: journal.config, trades: [], loading: true })
        await get().fetchTrades()
      },

      /* ---- Trades ---- */

      fetchTrades: async () => {
        const { activeJournalId } = get()
        if (!activeJournalId) {
          set({ trades: [], loading: false })
          return
        }

        set({ loading: true, error: null })
        try {
          const res = await fetch(`/api/trades?journalId=${activeJournalId}`)
          if (!res.ok) throw new Error('Failed to fetch trades')
          const data = await res.json()
          set({ trades: data.trades, loading: false })
        } catch {
          set({ error: 'Failed to load trades', loading: false })
        }
      },

      addTrade: async (trade) => {
        const { activeJournalId } = get()
        try {
          const res = await fetch('/api/trades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...trade, journalId: activeJournalId }),
          })
          if (!res.ok) throw new Error('Failed to create trade')
          const data = await res.json()
          set({ trades: [...get().trades, data.trade] })
        } catch {
          set({ error: 'Failed to save trade' })
        }
      },

      updateTrade: async (id, partial) => {
        try {
          const res = await fetch(`/api/trades/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partial),
          })
          if (!res.ok) throw new Error('Failed to update trade')
          const data = await res.json()
          set({
            trades: get().trades.map(t => (t.id === id ? data.trade : t)),
          })
        } catch {
          set({ error: 'Failed to update trade' })
        }
      },

      deleteTrade: async (id) => {
        try {
          const res = await fetch(`/api/trades/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed to delete trade')
          set({ trades: get().trades.filter(t => t.id !== id) })
        } catch {
          set({ error: 'Failed to delete trade' })
        }
      },

      /* ---- Config ---- */

      setConfig: async (partial) => {
        const { activeJournalId, journals } = get()
        if (!activeJournalId) return
        const journal = journals.find(j => j.id === activeJournalId)
        if (!journal) return

        const newConfig: JournalConfig = { ...journal.config, ...partial }
        const updated: Journal = { ...journal, config: newConfig }

        set({
          journals: journals.map(j => (j.id === activeJournalId ? updated : j)),
          config: newConfig,
        })

        await get().updateJournal(activeJournalId, { config: newConfig })
      },

      /* ---- Import ---- */

      importTrades: async (trades) => {
        const { activeJournalId } = get()
        const existing = get().trades
        let imported = 0
        let failed = 0

        for (const raw of trades) {
          const trade = raw as unknown as Record<string, unknown>
          const { userId, journalId, criteria5, id, ...clean } = trade
          try {
            const res = await fetch('/api/trades', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...clean, journalId: activeJournalId }),
            })
            if (res.ok) {
              const data = await res.json()
              existing.push(data.trade)
              imported++
            } else {
              const body = await res.json()
              console.error('[import] POST failed', res.status, body.error)
              failed++
            }
          } catch (err) {
            console.error('[import] fetch error', err)
            failed++
          }
        }

        set({ trades: [...existing] })
        return { imported, skipped: 0, failed }
      },

      /* ---- Stats ---- */

      getStats: () => {
        const { trades, config } = get()
        return computeStats(trades, config)
      },
    }),
    {
      name: 'rawfx-journal-config',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as { config?: { criteriaLabels?: string[] } }
        if (version < 2 && state.config?.criteriaLabels && state.config.criteriaLabels.length > 4) {
          state.config.criteriaLabels = state.config.criteriaLabels.slice(0, 4) as [string, string, string, string]
        }
        return state
      },
      partialize: (state) => ({
        journals: state.journals,
        activeJournalId: state.activeJournalId,
        config: state.config,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<JournalState>
        return {
          ...currentState,
          ...persisted,
          config: { ...defaultConfig, ...(persisted.config || {}) },
          _hydrated: true,
        }
      },
    }
  )
)
