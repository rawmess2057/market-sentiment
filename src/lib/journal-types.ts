export type TradeResult = 'win' | 'be' | 'loss'
export type TradeStatus = 'running' | 'completed'
export type JournalType = 'BACKTEST' | 'FORWARD' | 'LIVE'

export interface Journal {
  id: string
  userId: string
  name: string
  type: JournalType
  strategy: string
  config: JournalConfig
  createdAt: string
}

export function getTradeStatus(t: { finalScreenshot: string }): TradeStatus {
  return t.finalScreenshot ? 'completed' : 'running'
}

export function classifyResult(rr: number): TradeResult {
  if (rr > 0) return 'win'
  if (rr < 0) return 'loss'
  return 'be'
}

export interface JournalTrade {
  id: string
  includeInAnalysis: boolean
  symbol: string
  date: string
  time: string
  stopLoss: number
  rrSecured: number
  durationCandles: number | null
  maxRR: number | null
  contextScreenshot: string
  validationScreenshot: string
  entryScreenshot: string
  finalScreenshot: string
  notes: string
  criteria1: boolean
  criteria2: boolean
  criteria3: boolean
  criteria4: boolean
  metOverallPlan: boolean
  criteriaNotes: string
  news: string
  newsNotes: string
  models: string
  extra: string
}

export interface JournalConfig {
  accountBalance: number
  riskPercent: number
  contextTimeframe: string
  validationTimeframe: string
  entryTimeframe: string
  costsPerTrade: number
  maxLossPercent: number
  criteriaLabels: [string, string, string, string]
}

export interface JournalStats {
  total: number
  wins: number
  be: number
  losses: number
  winPct: number
  bePct: number
  lossPct: number
  totalRSecured: number
  avgR: number
  avgWinR: number
  avgLossR: number
  avgBeR: number
  ev: number
  profitFactor: number
  maxDdR: number
  maxDdPct: number
  avgDdR: number
  avgDdPct: number
  startingBalance: number
  compoundedBalance: number
  roi: number
  riskOfRuin: number
  avgStopLoss: number
  avgCosts: number
  avgDuration: number | null
}

export function computeStats(trades: JournalTrade[], config: JournalConfig): JournalStats {
  const analyzed = trades.filter(t => t.includeInAnalysis)
  const total = analyzed.length
  if (total === 0) return emptyStats(config)

  const res = (t: JournalTrade) => classifyResult(t.rrSecured)
  const wins = analyzed.filter(t => res(t) === 'win')
  const be = analyzed.filter(t => res(t) === 'be')
  const losses = analyzed.filter(t => res(t) === 'loss')

  const winPct = (wins.length / total) * 100
  const bePct = (be.length / total) * 100
  const lossPct = (losses.length / total) * 100

  const totalRSecured = analyzed.reduce((s, t) => s + t.rrSecured, 0)
  const avgR = totalRSecured / total
  const avgWinR = wins.length ? wins.reduce((s, t) => s + t.rrSecured, 0) / wins.length : 0
  const avgLossR = losses.length ? losses.reduce((s, t) => s + t.rrSecured, 0) / losses.length : 0
  const avgBeR = be.length ? be.reduce((s, t) => s + t.rrSecured, 0) / be.length : 0

  const grossWin = wins.reduce((s, t) => s + t.rrSecured - config.costsPerTrade, 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.rrSecured - config.costsPerTrade, 0))
  const profitFactor = grossLoss === 0 ? (grossWin > 0 ? Infinity : 1) : grossWin / grossLoss
  const ev = totalRSecured / total

  // Drawdown analysis
  const sorted = [...analyzed].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
  let balance = config.accountBalance
  let peak = balance
  let maxDdR = 0
  let maxDdPct = 0
  let ddSum = 0
  let ddCount = 0
  for (const trade of sorted) {
    const riskCash = config.accountBalance * (config.riskPercent / 100)
    const rInCash = (trade.rrSecured - config.costsPerTrade) * riskCash
    balance += rInCash
    const dd = peak - balance
    const ddPct = peak === 0 ? 0 : (dd / peak) * 100
    if (dd > 0) {
      ddSum += ddPct
      ddCount++
    }
    if (dd > maxDdR) maxDdR = dd
    if (ddPct > maxDdPct) maxDdPct = ddPct
    if (balance > peak) peak = balance
  }
  const avgDdPct = ddCount > 0 ? ddSum / ddCount : 0

  // Risk of Ruin
  const winRate = winPct / 100
  const lossRate = lossPct / 100
  const riskOfRuin = (lossRate > 0 && winRate > 0)
    ? Math.pow((1 - winRate) / (1 + (avgWinR > 0 ? avgWinR / Math.abs(avgLossR || 1) : 1)), config.maxLossPercent / (config.riskPercent || 0.5))
    : 0

  const compoundedBalance = balance
  const roi = ((compoundedBalance - config.accountBalance) / config.accountBalance) * 100
  const avgStopLoss = analyzed.reduce((s, t) => s + t.stopLoss, 0) / total
  const durations = analyzed.filter(t => t.durationCandles != null).map(t => t.durationCandles!)
  const avgDuration = durations.length > 0 ? durations.reduce((s, d) => s + d, 0) / durations.length : null

  return {
    total, wins: wins.length, be: be.length, losses: losses.length,
    winPct, bePct, lossPct,
    totalRSecured, avgR, avgWinR, avgLossR, avgBeR,
    ev, profitFactor,
    maxDdR, maxDdPct, avgDdR: maxDdR / Math.max(ddCount, 1), avgDdPct,
    startingBalance: config.accountBalance,
    compoundedBalance, roi, riskOfRuin,
    avgStopLoss, avgCosts: config.costsPerTrade, avgDuration,
  }
}

function emptyStats(config: JournalConfig): JournalStats {
  return {
    total: 0, wins: 0, be: 0, losses: 0,
    winPct: 0, bePct: 0, lossPct: 0,
    totalRSecured: 0, avgR: 0, avgWinR: 0, avgLossR: 0, avgBeR: 0,
    ev: 0, profitFactor: 0,
    maxDdR: 0, maxDdPct: 0, avgDdR: 0, avgDdPct: 0,
    startingBalance: config.accountBalance,
    compoundedBalance: config.accountBalance,
    roi: 0, riskOfRuin: 0,
    avgStopLoss: 0, avgCosts: config.costsPerTrade, avgDuration: null,
  }
}
