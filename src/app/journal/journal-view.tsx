'use client'

import { useEffect, useState } from 'react'
import { useJournalStore } from '@/store/journalStore'
import { JournalTrade, classifyResult, getTradeStatus } from '@/lib/journal-types'
import TradeForm from '@/components/TradeForm'
import AnalysisTab from '@/components/AnalysisTab'
import JournalSelector from '@/components/JournalSelector'
import JournalManage from '@/components/JournalManage'
import ImageViewer from '@/components/ImageViewer'
import ConfirmDialog from '@/components/ConfirmDialog'

const defaultTrade: Omit<JournalTrade, 'id'> = {
  includeInAnalysis: true, symbol: '', date: '', time: '', stopLoss: 0, rrSecured: 0,
  durationCandles: null, maxRR: null,
  contextScreenshot: '', validationScreenshot: '', entryScreenshot: '', finalScreenshot: '',
  notes: '', criteria1: false, criteria2: false, criteria3: false, criteria4: false,
  metOverallPlan: false, criteriaNotes: '', news: '', newsNotes: '', models: '', extra: '',
}

export default function JournalView() {
  const { trades, config, activeJournalId, addTrade, updateTrade, deleteTrade, setConfig, importTrades, fetchJournals, loading, _hydrated } = useJournalStore()

  useEffect(() => { fetchJournals() }, [fetchJournals])
  const [tab, setTab] = useState<'entry' | 'analysis' | 'journals'>('entry')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<JournalTrade | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [configExpanded, setConfigExpanded] = useState(false)

  async function handleSave(trade: JournalTrade) {
    if (editingId) {
      await updateTrade(editingId, trade)
    } else {
      await addTrade(trade)
    }
    setFormOpen(false)
    setEditingId(null)
  }

  function handleEdit(t: JournalTrade) {
    setEditingId(t.id)
    setFormOpen(true)
  }

  function handleExportJSON() {
    const blob = new Blob([JSON.stringify(trades, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'rawfx-trades.json'; a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportCSV() {
    const headers = ['Symbol','Date','Time','Status','Stop Loss','RR Secured','Duration','Max RR','Result','Include?']
    const rows = trades.map(t => {
      const res = classifyResult(t.rrSecured)
      const status = getTradeStatus(t)
      return [
        t.symbol, t.date, t.time, status,
        t.stopLoss, t.rrSecured,
        t.durationCandles ?? '', t.maxRR ?? '',
        status === 'running' ? '—' : res === 'win' ? 'Win' : res === 'loss' ? 'Loss' : 'BE',
        t.includeInAnalysis ? 'Yes' : 'No',
      ]
    })
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'rawfx-trades.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportJSON() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        const result = await importTrades(Array.isArray(data) ? data : [data])
        const parts: string[] = []
        if (result.imported > 0) parts.push(`${result.imported} imported`)
        if (result.skipped > 0) parts.push(`${result.skipped} skipped`)
        if (result.failed > 0) parts.push(`${result.failed} failed`)
        alert(`Import complete: ${parts.join(', ') || 'nothing to import'}`)
      } catch { alert('Invalid JSON file') }
    }
    input.click()
  }

  return (
    <div className="flex h-[calc(100vh-49px)] overflow-x-hidden">
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Config Panel */}
        <div className="glass border-b border-white/5 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <JournalSelector />
              {activeJournalId && (
                <span className="text-[10px] text-[#475569]">
                  {trades.length} trade{trades.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleImportJSON} className="text-[10px] font-semibold text-[#475569] hover:text-[#94a3b8] px-2 py-1 rounded glass-hover">Import</button>
              <button onClick={handleExportJSON} className="text-[10px] font-semibold text-[#475569] hover:text-[#94a3b8] px-2 py-1 rounded glass-hover">Export JSON</button>
              <button onClick={handleExportCSV} className="text-[10px] font-semibold text-[#475569] hover:text-[#94a3b8] px-2 py-1 rounded glass-hover">Export CSV</button>
              <button
                onClick={() => setConfigExpanded(!configExpanded)}
                className="text-[#475569] hover:text-[#94a3b8] p-1 rounded glass-hover transition-all"
                title={configExpanded ? 'Collapse' : 'Expand'}
              >
                <svg className={`w-3.5 h-3.5 transition-transform ${configExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {!_hydrated ? (
            <div className="animate-pulse h-[52px] bg-white/[0.03] rounded-lg" />
          ) : (
            <>
              {/* Always visible fields */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <ConfigField label="Balance" value={config.accountBalance} onChange={v => setConfig({ accountBalance: Number(v) })} prefix="$" />
                <ConfigField label="Risk %" value={config.riskPercent} onChange={v => setConfig({ riskPercent: Number(v) })} suffix="%" />
                <ConfigField label="Context TF" value={config.contextTimeframe} onChange={v => setConfig({ contextTimeframe: v })} type="text" />
                <ConfigField label="Validation TF" value={config.validationTimeframe} onChange={v => setConfig({ validationTimeframe: v })} type="text" />
                <ConfigField label="Entry TF" value={config.entryTimeframe} onChange={v => setConfig({ entryTimeframe: v })} type="text" />
                <ConfigField label="Costs (R)" value={config.costsPerTrade} onChange={v => setConfig({ costsPerTrade: Number(v) })} />
              </div>

              {/* Collapsible section */}
              {configExpanded && (
                <div className="mt-3 grid grid-cols-5 gap-3">
                  <ConfigField label="Max Loss %" value={config.maxLossPercent} onChange={v => setConfig({ maxLossPercent: Number(v) })} suffix="%" />
                  {config.criteriaLabels.map((label, i) => (
                    <ConfigField
                      key={i}
                      label={`Criteria ${i + 1}`}
                      value={label}
                      onChange={v => {
                        const next = [...config.criteriaLabels] as [string, string, string, string]
                        next[i] = v
                        setConfig({ criteriaLabels: next })
                      }}
                      type="text"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 pt-3 shrink-0">
          <button
            onClick={() => setTab('entry')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'entry'
                ? 'text-[#14f5c7] border-[#14f5c7]'
                : 'text-[#475569] border-transparent hover:text-[#94a3b8]'
            }`}
          >
            Entry
          </button>
          <button
            onClick={() => setTab('analysis')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'analysis'
                ? 'text-[#14f5c7] border-[#14f5c7]'
                : 'text-[#475569] border-transparent hover:text-[#94a3b8]'
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setTab('journals')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'journals'
                ? 'text-[#14f5c7] border-[#14f5c7]'
                : 'text-[#475569] border-transparent hover:text-[#94a3b8]'
            }`}
          >
            Journals
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {tab === 'journals' ? (
            <JournalManage />
          ) : (
            <div className="flex-1 flex flex-col p-6 pt-4 overflow-hidden min-h-0">
              {tab === 'entry' ? (
                <>
                  {/* Trade Table */}
                  <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <h2 className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                        Trade Journal ({trades.length} entries)
                      </h2>
                      <button
                        onClick={() => { setEditingId(null); setFormOpen(true) }}
                        className="glass rounded-lg px-3 py-1.5 text-xs font-semibold text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/5 transition-all"
                      >
                        + Add Trade
                      </button>
                    </div>

                    {!activeJournalId ? (
                      <div className="glass rounded-xl flex items-center justify-center h-48 text-sm text-[#475569]">
                        No journal selected. Create one in the Journals tab.
                      </div>
                    ) : loading ? (
                      <div className="glass rounded-xl flex items-center justify-center h-48 text-sm text-[#475569]">
                        Loading trades...
                      </div>
                    ) : trades.length === 0 ? (
                      <div className="glass rounded-xl flex items-center justify-center h-48 text-sm text-[#475569]">
                        No trades yet. Click &quot;+ Add Trade&quot; to begin.
                      </div>
                    ) : (
                      <div className="glass rounded-xl flex-1 overflow-auto min-h-0">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider border-b border-white/5 sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                              <th className="text-left py-2.5 px-3 w-16">Incl</th>
                              <th className="text-left py-2.5 px-3 w-20">Symbol</th>
                              <th className="text-left py-2.5 px-3 w-24">Date</th>
                              <th className="text-left py-2.5 px-3 w-16">Time</th>
                              <th className="text-left py-2.5 px-3 w-20">Status</th>
                              <th className="text-right py-2.5 px-3 w-20">SL</th>
                              <th className="text-right py-2.5 px-3 w-20">RR</th>
                              <th className="text-right py-2.5 px-3 w-20">Result</th>
                              <th className="text-right py-2.5 px-3 w-8"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {trades.map(t => {
                              return (
                                <tr key={t.id} onClick={() => setSelectedTrade(t)} className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                                  <td className="py-2.5 px-3">
                                    <span className={`text-xs ${t.includeInAnalysis ? 'text-[#14f5c7]' : 'text-[#475569]'}`}>
                                      {t.includeInAnalysis ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="font-semibold text-[#f1f5f9] text-xs">{t.symbol}</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-xs text-[#94a3b8]">{t.date}</td>
                                  <td className="py-2.5 px-3 text-xs text-[#94a3b8]">{t.time}</td>
                                  <td className="py-2.5 px-3">
                                    {(() => {
                                      const status = getTradeStatus(t)
                                      return (
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase ${
                                          status === 'running' ? 'text-[#14f5c7]' : 'text-[#475569]'
                                        }`}>
                                          {status === 'running' ? (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#14f5c7] animate-pulse" />
                                          ) : (
                                            <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
                                              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                            </svg>
                                          )}
                                          {status}
                                        </span>
                                      )
                                    })()}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-xs text-[#94a3b8]">{t.stopLoss}</td>
                                  <td className={`py-2.5 px-3 text-right text-xs font-semibold ${
                                    t.rrSecured > 0 ? 'text-[#14f5c7]' : t.rrSecured < 0 ? 'text-[#f43f5e]' : 'text-[#94a3b8]'
                                  }`}>
                                    {t.rrSecured.toFixed(2)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {(() => {
                                      const status = getTradeStatus(t)
                                      if (status === 'running') {
                                        return <span className="text-[10px] font-semibold uppercase text-[#475569]">—</span>
                                      }
                                      const res = classifyResult(t.rrSecured)
                                      return (
                                        <span className={`text-[10px] font-semibold uppercase ${
                                          res === 'win' ? 'text-[#14f5c7]' : res === 'loss' ? 'text-[#f43f5e]' : 'text-[#f59e0b]'
                                        }`}>
                                          {res}
                                        </span>
                                      )
                                    })()}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                      <button onClick={e => { e.stopPropagation(); handleEdit(t) }} className="text-[#475569] hover:text-[#94a3b8] transition-colors p-0.5">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button onClick={e => { e.stopPropagation(); setDeleteConfirmId(t.id) }} className="text-[#475569] hover:text-[#f43f5e] transition-colors p-0.5">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <AnalysisTab />
              )}
            </div>
          )}
        </div>

        {/* Trade Form Modal */}
        {formOpen && (
          <TradeForm
            initial={editingId ? trades.find(t => t.id === editingId) ?? defaultTrade : defaultTrade}
            onSave={handleSave}
            onClose={() => { setFormOpen(false); setEditingId(null) }}
            criteriaLabels={config.criteriaLabels}
          />
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteConfirmId !== null}
          title="Delete trade?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => { if (deleteConfirmId) deleteTrade(deleteConfirmId); setDeleteConfirmId(null) }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      </div>

      {/* Trade Detail Panel */}
      {selectedTrade && (
        <TradeDetailPanel trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
      )}
    </div>
  )
}

function TradeDetailPanel({ trade, onClose }: { trade: JournalTrade; onClose: () => void }) {
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null)
  const tradeStatus = getTradeStatus(trade)
  const labels: [keyof JournalTrade, string][] = [
    ['contextScreenshot', 'Context'],
    ['validationScreenshot', 'Validation'],
    ['entryScreenshot', 'Entry'],
    ['finalScreenshot', 'Final'],
  ]
  const hasScreenshots = labels.some(([key]) => trade[key] as string)

  const result = classifyResult(trade.rrSecured)
  const resultColor = result === 'win' ? 'text-[#14f5c7]' : result === 'loss' ? 'text-[#f43f5e]' : 'text-[#f59e0b]'

  return (
    <div className="w-[500px] border-l border-white/5 bg-[var(--bg-primary)] flex flex-col min-h-0 overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#f1f5f9]">{trade.symbol}</span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase ${
            tradeStatus === 'running' ? 'text-[#14f5c7]' : 'text-[#475569]'
          }`}>
            {tradeStatus === 'running' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#14f5c7] animate-pulse" />
            ) : (
              <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
              </svg>
            )}
            {tradeStatus}
          </span>
          <span className={`text-[10px] font-semibold uppercase ${resultColor}`}>{result}</span>
        </div>
        <button onClick={onClose} className="text-[#475569] hover:text-[#f43f5e] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Screenshots */}
      <div className="flex-1 overflow-auto p-5 space-y-4">
        {!hasScreenshots ? (
          <div className="text-xs text-[#475569] text-center py-8">No screenshots for this trade.</div>
        ) : (
          <div className="space-y-4">
            {labels.map(([key, label]) => {
              const src = trade[key] as string
              if (!src) return null
              return (
                <div key={key}>
                  <p className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">{label}</p>
                  <img
                    src={src}
                    alt={label}
                  className="w-full rounded-lg border border-white/5 object-contain bg-black/20 cursor-pointer"
                    onClick={() => setFullScreenImg(src)}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {fullScreenImg && (
        <ImageViewer src={fullScreenImg} onClose={() => setFullScreenImg(null)} />
      )}
    </div>
  )
}

function ConfigField({ label, value, onChange, prefix, suffix, type = 'number' }: {
  label: string; value: string | number; onChange: (v: string) => void; prefix?: string; suffix?: string; type?: string
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider block mb-1">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-xs text-[#475569]">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent border border-white/5 rounded-lg px-2 py-1 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#a855f7]"
        />
        {suffix && <span className="text-xs text-[#475569]">{suffix}</span>}
      </div>
    </div>
  )
}
