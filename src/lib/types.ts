export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface SwingPoint {
  index: number
  price: number
  type: 'high' | 'low'
  timestamp: number
  confirmed: boolean
}

export interface StructureEvent {
  type: 'bos' | 'choch'
  direction: 'bullish' | 'bearish'
  price: number
  index: number
  timestamp: number
  description: string
}

export interface PhaseResult {
  phase: 'Accumulation' | 'Reaccumulation' | 'Markup' | 'Distribution' | 'Markdown' | 'Neutral'
  description: string
}

export interface PeriodSentiment {
  bullPct: number
  bearPct: number
  trend: 'bullish' | 'bearish' | 'neutral'
  conviction: 'high' | 'medium' | 'low'
  phase: PhaseResult
  chop: number
  structureScore: number
  emaScore: number
  momentumScore: number
  adx: number
  swingHighs: { price: number; index: number; timestamp: number }[]
  swingLows: { price: number; index: number; timestamp: number }[]
  bosEvents: StructureEvent[]
  chochEvents: StructureEvent[]
  emaStatus: 'bullish' | 'bearish' | 'mixed'
  lastPrice: number
  change24h: number
}

export interface SentimentResult {
  symbol: string
  intraday: PeriodSentiment
  daily: PeriodSentiment
  overallTrend: 'bullish' | 'bearish' | 'neutral'
  overallConviction: 'high' | 'medium' | 'low'
  price: number
  change24h: number
  sparklineData: number[]
  lastUpdated: number
}

export interface SymbolDef {
  symbol: string
  display: string
  category: 'forex' | 'crypto' | 'stock' | 'index' | 'commodity'
  yahooTicker: string
}
