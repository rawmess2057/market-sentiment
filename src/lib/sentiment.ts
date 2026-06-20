import { Candle, SwingPoint, StructureEvent, PhaseResult, PeriodSentiment } from './types'
import { computeEmaStatus, computeChopIndex, computeChange24h, computeRSI, detectDivergence, computeADX, computeMomentumScore } from './indicators'

function detectSwingPoints(candles: Candle[], lookback: number = 3): SwingPoint[] {
  const swings: SwingPoint[] = []
  const len = candles.length
  if (len < lookback * 2 + 1) return swings

  for (let i = lookback; i < len - lookback; i++) {
    const high = candles[i].high
    const low = candles[i].low

    const isSwingHigh = high >= candles[i - 1].high &&
      high >= candles[i - 2].high &&
      high >= candles[i + 1].high &&
      high >= candles[i + 2].high

    const isSwingLow = low <= candles[i - 1].low &&
      low <= candles[i - 2].low &&
      low <= candles[i + 1].low &&
      low <= candles[i + 2].low

    if (isSwingHigh) {
      const prevIdx = swings.length - 1
      if (prevIdx >= 0 && swings[prevIdx].type === 'high') {
        if (high > swings[prevIdx].price) {
          swings[prevIdx] = { index: i, price: high, type: 'high', timestamp: candles[i].timestamp, confirmed: true }
        }
      } else {
        swings.push({ index: i, price: high, type: 'high', timestamp: candles[i].timestamp, confirmed: true })
      }
    }

    if (isSwingLow) {
      const prevIdx = swings.length - 1
      if (prevIdx >= 0 && swings[prevIdx].type === 'low') {
        if (low < swings[prevIdx].price) {
          swings[prevIdx] = { index: i, price: low, type: 'low', timestamp: candles[i].timestamp, confirmed: true }
        }
      } else {
        swings.push({ index: i, price: low, type: 'low', timestamp: candles[i].timestamp, confirmed: true })
      }
    }
  }

  return swings
}

function analyzeStructure(candles: Candle[], swings: SwingPoint[]): {
  bosEvents: StructureEvent[]
  chochEvents: StructureEvent[]
  structureScore: number
  trend: 'bullish' | 'bearish' | 'neutral'
} {
  const bosEvents: StructureEvent[] = []
  const chochEvents: StructureEvent[] = []

  if (swings.length < 4) {
    return { bosEvents, chochEvents, structureScore: 50, trend: 'neutral' }
  }

  // Use the most recent 6 swings (3 pairs) for current structure
  const recent = swings.slice(-6)
  let bullScore = 0
  let bearScore = 0

  // Track sequence for score: HH/HL → +1 bull, LH/LL → +1 bear
  let lastHigh: number | null = null
  let lastLow: number | null = null
  let lastHH: number | null = null
  let lastLL: number | null = null

  for (const s of recent) {
    if (s.type === 'high') {
      if (lastHigh !== null) {
        if (s.price > lastHigh) {
          bullScore += 10  // HH
          lastHH = s.price
        } else {
          bearScore += 8  // LH
        }
      }
      lastHigh = s.price
      // Check CHOCH (bearish): LH after HH, then check for breakdown
      if (lastHH !== null && lastLL !== null && s.price < lastHH) {
        const breakdown = candles.slice(s.index, Math.min(s.index + 5, candles.length)).find(c =>
          c.close < lastLL!
        )
        if (breakdown) {
          bearScore += 20
          chochEvents.push({
            type: 'choch', direction: 'bearish', price: breakdown.close,
            index: s.index, timestamp: s.timestamp,
            description: `CHOCH: Bearish structure break`
          })
        }
      }
    } else {
      if (lastLow !== null) {
        if (s.price < lastLow) {
          bearScore += 10  // LL
          lastLL = s.price
        } else {
          bullScore += 8  // HL
        }
      }
      lastLow = s.price
      // Check CHOCH (bullish): HL after LL, then check for breakout
      if (lastLL !== null && lastHH !== null && s.price > lastLL) {
        const breakout = candles.slice(s.index, Math.min(s.index + 5, candles.length)).find(c =>
          c.close > lastHH!
        )
        if (breakout) {
          bullScore += 20
          chochEvents.push({
            type: 'choch', direction: 'bullish', price: breakout.close,
            index: s.index, timestamp: s.timestamp,
            description: `CHOCH: Bullish structure break`
          })
        }
      }
    }
  }

  // Also check the full swing set for BOS events (structural breaks)
  let lastHighFull: SwingPoint | null = null
  let lastLowFull: SwingPoint | null = null

  for (let i = 0; i < swings.length; i++) {
    const s = swings[i]
    if (s.type === 'high' && lastHighFull) {
      const bodyBreak = candles.slice(lastHighFull.index, s.index + 1).find(c =>
        c.close > lastHighFull!.price
      )
      if (bodyBreak) {
        bosEvents.push({
          type: 'bos', direction: 'bullish', price: s.price,
          index: s.index, timestamp: s.timestamp,
          description: `BOS: Bullish break at ${s.price.toFixed(2)}`
        })
      }
      // Already counted in recent; add extra for BOS confirmation
      if (bodyBreak && recent.includes(s)) bullScore += 8
    }
    if (s.type === 'low' && lastLowFull) {
      const bodyBreak = candles.slice(lastLowFull.index, s.index + 1).find(c =>
        c.close < lastLowFull!.price
      )
      if (bodyBreak) {
        bosEvents.push({
          type: 'bos', direction: 'bearish', price: s.price,
          index: s.index, timestamp: s.timestamp,
          description: `BOS: Bearish break at ${s.price.toFixed(2)}`
        })
      }
      if (bodyBreak && recent.includes(s)) bearScore += 8
    }
    if (s.type === 'high') lastHighFull = s
    if (s.type === 'low') lastLowFull = s
  }

  // Add a range-position component: where is price in the recent range?
  const recentCandles = candles.slice(-20)
  if (recentCandles.length > 5) {
    const highMax = Math.max(...recentCandles.map(c => c.high))
    const lowMin = Math.min(...recentCandles.map(c => c.low))
    const currentPrice = candles[candles.length - 1].close
    const rangePos = (currentPrice - lowMin) / (highMax - lowMin)  // 0-1
    if (rangePos > 0.7) bullScore += 5  // price in top 30% → bullish
    else if (rangePos < 0.3) bearScore += 5  // price in bottom 30% → bearish
  }

  const total = bullScore + bearScore
  const structureScore = total === 0 ? 50 : (bullScore / total) * 100

  let trend: 'bullish' | 'bearish' | 'neutral'
  if (structureScore > 55) trend = 'bullish'
  else if (structureScore < 45) trend = 'bearish'
  else trend = 'neutral'

  return { bosEvents, chochEvents, structureScore, trend }
}

function detectPhase(candles: Candle[], swings: SwingPoint[], trend: string): PhaseResult {
  if (swings.length < 3) return { phase: 'Neutral', description: 'Insufficient swing data to determine phase' }

  const recentSwings = swings.slice(-6)
  const highs = recentSwings.filter(s => s.type === 'high').map(s => s.price)
  const lows = recentSwings.filter(s => s.type === 'low').map(s => s.price)

  if (highs.length < 2 || lows.length < 2) return { phase: 'Neutral', description: 'Not enough swing points' }

  const lastHigh = highs[highs.length - 1]
  const prevHigh = highs[highs.length - 2]
  const lastLow = lows[lows.length - 1]
  const prevLow = lows[lows.length - 2]

  const bb = (lastLow - prevLow) / prevLow * 100
  const hh = (lastHigh - prevHigh) / prevHigh * 100

  const recentVolatility = candles.slice(-10).reduce((s, c) => s + (c.high - c.low), 0) / 10
  const olderVolatility = candles.slice(-20, -10).reduce((s, c) => s + (c.high - c.low), 0) / 10
  const volShrinking = recentVolatility < olderVolatility * 0.85
  const volExpanding = recentVolatility > olderVolatility * 1.15

  const isBase = Math.abs(bb) < 2 && Math.abs(hh) < 2

  if (trend === 'bullish' && isBase && volShrinking && lows.length >= 3) {
    const olderLow = lows[lows.length - 3]
    if (lows[lows.length - 1] > olderLow) {
      return { phase: 'Accumulation', description: 'Price basing after markdown with higher lows — accumulation underway' }
    }
  }

  if (trend === 'bullish' && hh > 0 && bb >= 0) {
    return { phase: 'Markup', description: `Higher highs (${hh.toFixed(1)}%) with higher lows — impulsive markup phase` }
  }

  if (trend === 'bullish' && isBase && volShrinking && highs.length >= 3) {
    const olderHigh = highs[highs.length - 3]
    if (lastHigh >= olderHigh * 0.98) {
      return { phase: 'Reaccumulation', description: 'Pause in uptrend with tight range — reaccumulation before continuation' }
    }
  }

  if (trend === 'bearish' && isBase && volShrinking && highs.length >= 3) {
    const olderHigh = highs[highs.length - 3]
    if (lastHigh <= olderHigh * 1.02) {
      return { phase: 'Distribution', description: 'Price ranging after markup with lower highs — distribution underway' }
    }
  }

  if (trend === 'bearish' && bb < 0 && hh <= 0) {
    return { phase: 'Markdown', description: `Lower lows (${Math.abs(bb).toFixed(1)}%) with lower highs — impulsive markdown phase` }
  }

  if (trend === 'bearish' && isBase && volShrinking && lows.length >= 3) {
    const olderLow = lows[lows.length - 3]
    if (lastLow <= olderLow * 1.02) {
      return { phase: 'Distribution', description: 'Range-bound after uptrend — distribution to new participants' }
    }
  }

  if (trend === 'neutral') {
    if (volShrinking) return { phase: 'Neutral', description: 'Contracting volatility — market indecision' }
    if (volExpanding) return { phase: 'Neutral', description: 'Expanding volatility — directional move imminent' }
    return { phase: 'Neutral', description: 'No clear structural bias' }
  }

  return { phase: 'Neutral', description: 'Mixed signals across timeframes' }
}

function computeConviction(
  structureScore: number,
  momentumScore: number,
  emaScore: number,
  flowScore: number,
  adx: number,
  chop: number,
  trend: string,
  timeframe: 'intraday' | 'daily',
): 'high' | 'medium' | 'low' {
  if (trend === 'neutral') return 'low'

  const chopLimit = timeframe === 'daily' ? 0.6 : 0.5
  if (chop > chopLimit) return 'low'
  if (adx < 18) return 'low'

  const combined = structureScore * 0.50 + momentumScore * 0.25 + emaScore * 0.10 + flowScore * 0.15

  if (adx > 30 && combined > 48) return 'high'
  if (combined > 46) return 'high'
  if (combined > 34) return 'medium'
  return 'low'
}

function computeCandleFlowScore(candles: Candle[]): number {
  if (candles.length < 10) return 50

  const recent = candles.slice(-10)
  let bullBody = 0
  let bearBody = 0
  let bullWick = 0
  let bearWick = 0
  let bullCount = 0
  let bearCount = 0
  let bigBull = 0
  let bigBear = 0

  for (const c of recent) {
    const body = Math.abs(c.close - c.open)
    const totalRange = c.high - c.low
    if (totalRange === 0) continue

    const upperWick = c.high - Math.max(c.close, c.open)
    const lowerWick = Math.min(c.close, c.open) - c.low
    const bodyRatio = body / totalRange

    if (c.close > c.open) {
      bullCount++
      bullBody += bodyRatio
      bullWick += upperWick > 0 ? lowerWick / (lowerWick + upperWick) : 1
      if (bodyRatio > 0.6) bigBull++
    } else {
      bearCount++
      bearBody += bodyRatio
      bearWick += lowerWick > 0 ? upperWick / (lowerWick + upperWick) : 1
      if (bodyRatio > 0.6) bigBear++
    }
  }

  const avgBullBody = bullCount > 0 ? bullBody / bullCount : 0.5
  const avgBearBody = bearCount > 0 ? bearBody / bearCount : 0.5
  const avgBullWick = bullCount > 0 ? bullWick / bullCount : 0.5
  const avgBearWick = bearCount > 0 ? bearWick / bearCount : 0.5
  const total = recent.length
  const bullRatio = bullCount / total
  const bearRatio = bearCount / total

  // Bull conviction: many bullish candles + big bodies + lower wick dominance
  const bullFlow = bullRatio * 40 + avgBullBody * 25 + avgBullWick * 20 + (bigBull / total) * 15
  const bearFlow = bearRatio * 40 + avgBearBody * 25 + avgBearWick * 20 + (bigBear / total) * 15

  const totalFlow = bullFlow + bearFlow
  return totalFlow === 0 ? 50 : (bullFlow / totalFlow) * 100
}

export function computePeriodData(candles: Candle[], timeframe: 'intraday' | 'daily' = 'intraday'): PeriodSentiment {
  const swings = detectSwingPoints(candles)
  const rsiValues = computeRSI(candles)
  const divergences = detectDivergence(candles, swings, rsiValues)

  const { bosEvents, chochEvents, structureScore, trend } = analyzeStructure(candles, swings)
  const { status: emaStatus, score: emaScore } = computeEmaStatus(candles)
  const momentumScore = computeMomentumScore(candles)
  const chop = computeChopIndex(candles)
  const { adx } = computeADX(candles)
  const phase = detectPhase(candles, swings, trend)
  const change24h = computeChange24h(candles)

  // Candle flow analysis (buying/selling pressure from wick positions)
  const flowScore = computeCandleFlowScore(candles)

  // Blend: structure (50%) + momentum (25%) + EMA (10%) + candleFlow (15%)
  let finalRaw = structureScore * 0.50 + momentumScore * 0.25 + emaScore * 0.10 + flowScore * 0.15

  // Strong trend multiplier: when structure is decisive, amplify further
  if (structureScore < 25) {
    finalRaw = 50 - (50 - finalRaw) * 1.2
  } else if (structureScore > 75) {
    finalRaw = 50 + (finalRaw - 50) * 1.2
  }

  // ADX boost: strong trends amplify
  if (adx > 22) {
    const adxBoost = Math.min((adx - 22) * 0.6, 15)
    if (trend === 'bullish') finalRaw += adxBoost
    else if (trend === 'bearish') finalRaw -= adxBoost
  }

  // Divergence boost/penalty
  for (const div of divergences) {
    const divStrength = div.strength === 'strong' ? 12 : 6
    switch (div.type) {
      case 'regular_bullish': finalRaw += divStrength; break
      case 'regular_bearish': finalRaw -= divStrength; break
      case 'hidden_bullish': finalRaw += divStrength * 0.6; break
      case 'hidden_bearish': finalRaw -= divStrength * 0.6; break
    }
  }

  // Chop dampener
  const chopLimit = timeframe === 'daily' ? 0.6 : 0.5
  if (chop > chopLimit) {
    const dampen = Math.min((chop - chopLimit) * 2, 1)
    finalRaw = 50 + (finalRaw - 50) * (1 - dampen)
  }

  finalRaw = Math.max(0, Math.min(100, finalRaw))

  // Exponential amplification to match reference extremes
  const normalized = (finalRaw - 50) / 50
  const sign = normalized >= 0 ? 1 : -1
  const amplified = sign * Math.pow(Math.abs(normalized), 0.35)
  const amplifiedRaw = 50 + amplified * 50

  let bullPct: number
  let bearPct: number
  if (amplifiedRaw >= 50) {
    bullPct = Math.round(((amplifiedRaw - 50) / 50) * 100)
    bearPct = 100 - bullPct
  } else {
    bearPct = Math.round(((50 - amplifiedRaw) / 50) * 100)
    bullPct = 100 - bearPct
  }
  bullPct = Math.max(0, Math.min(100, bullPct))
  bearPct = Math.max(0, Math.min(100, bearPct))

  const conviction = computeConviction(structureScore, momentumScore, emaScore, flowScore, adx, chop, trend, timeframe)

  const lastPrice = candles.length > 0 ? candles[candles.length - 1].close : 0

  const swingHighs = swings.filter(s => s.type === 'high').map(s => ({
    price: s.price, index: s.index, timestamp: s.timestamp
  }))
  const swingLows = swings.filter(s => s.type === 'low').map(s => ({
    price: s.price, index: s.index, timestamp: s.timestamp
  }))

  return {
    bullPct,
    bearPct,
    trend,
    conviction,
    phase,
    chop: Math.round(chop * 100) / 100,
    structureScore: Math.round(structureScore * 100) / 100,
    emaScore: Math.round(emaScore * 100) / 100,
    momentumScore: Math.round(momentumScore * 100) / 100,
    adx: Math.round(adx * 10) / 10,
    swingHighs,
    swingLows,
    bosEvents,
    chochEvents,
    emaStatus,
    lastPrice,
    change24h,
  }
}

export function mergeTimeframes(intraday: PeriodSentiment, daily: PeriodSentiment): {
  overallTrend: 'bullish' | 'bearish' | 'neutral'
  overallConviction: 'high' | 'medium' | 'low'
} {
  const intraWeight = 0.4
  const dailyWeight = 0.6

  const intraBull = intraday.bullPct / 100
  const dailyBull = daily.bullPct / 100
  const weightedBull = intraBull * intraWeight + dailyBull * dailyWeight

  let overallTrend: 'bullish' | 'bearish' | 'neutral'
  if (weightedBull > 0.6) overallTrend = 'bullish'
  else if (weightedBull < 0.4) overallTrend = 'bearish'
  else overallTrend = 'neutral'

  const convScores = { high: 3, medium: 2, low: 1 }
  const avgConv = (convScores[intraday.conviction] + convScores[daily.conviction]) / 2
  let overallConviction: 'high' | 'medium' | 'low'
  if (avgConv >= 2.5) overallConviction = 'high'
  else if (avgConv >= 1.5) overallConviction = 'medium'
  else overallConviction = 'low'

  return { overallTrend, overallConviction }
}
