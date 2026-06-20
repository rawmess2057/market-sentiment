import { SymbolDef } from '@/lib/types'

const FX_MAJORS: SymbolDef[] = [
  { symbol: 'EUR/USD', display: 'EUR/USD', category: 'forex', yahooTicker: 'EURUSD=X' },
  { symbol: 'GBP/USD', display: 'GBP/USD', category: 'forex', yahooTicker: 'GBPUSD=X' },
  { symbol: 'USD/JPY', display: 'USD/JPY', category: 'forex', yahooTicker: 'USDJPY=X' },
  { symbol: 'AUD/USD', display: 'AUD/USD', category: 'forex', yahooTicker: 'AUDUSD=X' },
  { symbol: 'USD/CAD', display: 'USD/CAD', category: 'forex', yahooTicker: 'USDCAD=X' },
  { symbol: 'NZD/USD', display: 'NZD/USD', category: 'forex', yahooTicker: 'NZDUSD=X' },
  { symbol: 'USD/CHF', display: 'USD/CHF', category: 'forex', yahooTicker: 'USDCHF=X' },
]

const FX_CROSSES: SymbolDef[] = [
  { symbol: 'EUR/GBP', display: 'EUR/GBP', category: 'forex', yahooTicker: 'EURGBP=X' },
  { symbol: 'EUR/JPY', display: 'EUR/JPY', category: 'forex', yahooTicker: 'EURJPY=X' },
  { symbol: 'EUR/CHF', display: 'EUR/CHF', category: 'forex', yahooTicker: 'EURCHF=X' },
  { symbol: 'EUR/AUD', display: 'EUR/AUD', category: 'forex', yahooTicker: 'EURAUD=X' },
  { symbol: 'EUR/NZD', display: 'EUR/NZD', category: 'forex', yahooTicker: 'EURNZD=X' },
  { symbol: 'EUR/CAD', display: 'EUR/CAD', category: 'forex', yahooTicker: 'EURCAD=X' },
  { symbol: 'GBP/JPY', display: 'GBP/JPY', category: 'forex', yahooTicker: 'GBPJPY=X' },
  { symbol: 'GBP/CHF', display: 'GBP/CHF', category: 'forex', yahooTicker: 'GBPCHF=X' },
  { symbol: 'GBP/AUD', display: 'GBP/AUD', category: 'forex', yahooTicker: 'GBPAUD=X' },
  { symbol: 'GBP/NZD', display: 'GBP/NZD', category: 'forex', yahooTicker: 'GBPNZD=X' },
  { symbol: 'GBP/CAD', display: 'GBP/CAD', category: 'forex', yahooTicker: 'GBPCAD=X' },
  { symbol: 'AUD/JPY', display: 'AUD/JPY', category: 'forex', yahooTicker: 'AUDJPY=X' },
  { symbol: 'AUD/NZD', display: 'AUD/NZD', category: 'forex', yahooTicker: 'AUDNZD=X' },
  { symbol: 'AUD/CAD', display: 'AUD/CAD', category: 'forex', yahooTicker: 'AUDCAD=X' },
  { symbol: 'NZD/JPY', display: 'NZD/JPY', category: 'forex', yahooTicker: 'NZDJPY=X' },
  { symbol: 'NZD/CAD', display: 'NZD/CAD', category: 'forex', yahooTicker: 'NZDCAD=X' },
  { symbol: 'CHF/JPY', display: 'CHF/JPY', category: 'forex', yahooTicker: 'CHFJPY=X' },
]

const FX_EXOTICS: SymbolDef[] = [
  { symbol: 'USD/TRY', display: 'USD/TRY', category: 'forex', yahooTicker: 'USDTRY=X' },
  { symbol: 'USD/ZAR', display: 'USD/ZAR', category: 'forex', yahooTicker: 'USDZAR=X' },
  { symbol: 'USD/MXN', display: 'USD/MXN', category: 'forex', yahooTicker: 'USDMXN=X' },
  { symbol: 'USD/SGD', display: 'USD/SGD', category: 'forex', yahooTicker: 'USDSGD=X' },
  { symbol: 'USD/HKD', display: 'USD/HKD', category: 'forex', yahooTicker: 'USDHKD=X' },
  { symbol: 'USD/SEK', display: 'USD/SEK', category: 'forex', yahooTicker: 'USDSEK=X' },
  { symbol: 'USD/NOK', display: 'USD/NOK', category: 'forex', yahooTicker: 'USDNOK=X' },
  { symbol: 'USD/DKK', display: 'USD/DKK', category: 'forex', yahooTicker: 'USDDKK=X' },
  { symbol: 'USD/PLN', display: 'USD/PLN', category: 'forex', yahooTicker: 'USDPLN=X' },
  { symbol: 'USD/ILS', display: 'USD/ILS', category: 'forex', yahooTicker: 'USDILS=X' },
  { symbol: 'USD/THB', display: 'USD/THB', category: 'forex', yahooTicker: 'USDTHB=X' },
  { symbol: 'USD/KRW', display: 'USD/KRW', category: 'forex', yahooTicker: 'USDKRW=X' },
  { symbol: 'USD/INR', display: 'USD/INR', category: 'forex', yahooTicker: 'USDINR=X' },
  { symbol: 'USD/BRL', display: 'USD/BRL', category: 'forex', yahooTicker: 'USDBRL=X' },
]

const CRYPTO: SymbolDef[] = [
  { symbol: 'BTC/USD', display: 'BTC/USD', category: 'crypto', yahooTicker: 'BTC-USD' },
  { symbol: 'ETH/USD', display: 'ETH/USD', category: 'crypto', yahooTicker: 'ETH-USD' },
  { symbol: 'SOL/USD', display: 'SOL/USD', category: 'crypto', yahooTicker: 'SOL-USD' },
  { symbol: 'XRP/USD', display: 'XRP/USD', category: 'crypto', yahooTicker: 'XRP-USD' },
  { symbol: 'ADA/USD', display: 'ADA/USD', category: 'crypto', yahooTicker: 'ADA-USD' },
  { symbol: 'DOGE/USD', display: 'DOGE/USD', category: 'crypto', yahooTicker: 'DOGE-USD' },
  { symbol: 'DOT/USD', display: 'DOT/USD', category: 'crypto', yahooTicker: 'DOT-USD' },
  { symbol: 'AVAX/USD', display: 'AVAX/USD', category: 'crypto', yahooTicker: 'AVAX-USD' },
  { symbol: 'LINK/USD', display: 'LINK/USD', category: 'crypto', yahooTicker: 'LINK-USD' },
  { symbol: 'MATIC/USD', display: 'MATIC/USD', category: 'crypto', yahooTicker: 'MATIC-USD' },
  { symbol: 'UNI/USD', display: 'UNI/USD', category: 'crypto', yahooTicker: 'UNI-USD' },
  { symbol: 'ATOM/USD', display: 'ATOM/USD', category: 'crypto', yahooTicker: 'ATOM-USD' },
  { symbol: 'LTC/USD', display: 'LTC/USD', category: 'crypto', yahooTicker: 'LTC-USD' },
  { symbol: 'BCH/USD', display: 'BCH/USD', category: 'crypto', yahooTicker: 'BCH-USD' },
  { symbol: 'XLM/USD', display: 'XLM/USD', category: 'crypto', yahooTicker: 'XLM-USD' },
  { symbol: 'FTM/USD', display: 'FTM/USD', category: 'crypto', yahooTicker: 'FTM-USD' },
  { symbol: 'NEAR/USD', display: 'NEAR/USD', category: 'crypto', yahooTicker: 'NEAR-USD' },
  { symbol: 'APT/USD', display: 'APT/USD', category: 'crypto', yahooTicker: 'APT-USD' },
  { symbol: 'ARB/USD', display: 'ARB/USD', category: 'crypto', yahooTicker: 'ARB-USD' },
  { symbol: 'OP/USD', display: 'OP/USD', category: 'crypto', yahooTicker: 'OP-USD' },
  { symbol: 'SUI/USD', display: 'SUI/USD', category: 'crypto', yahooTicker: 'SUI-USD' },
  { symbol: 'PEPE/USD', display: 'PEPE/USD', category: 'crypto', yahooTicker: 'PEPE-USD' },
  { symbol: 'INJ/USD', display: 'INJ/USD', category: 'crypto', yahooTicker: 'INJ-USD' },
  { symbol: 'TIA/USD', display: 'TIA/USD', category: 'crypto', yahooTicker: 'TIA-USD' },
  { symbol: 'SEI/USD', display: 'SEI/USD', category: 'crypto', yahooTicker: 'SEI-USD' },
  { symbol: 'RUNE/USD', display: 'RUNE/USD', category: 'crypto', yahooTicker: 'RUNE-USD' },
  { symbol: 'FET/USD', display: 'FET/USD', category: 'crypto', yahooTicker: 'FET-USD' },
  { symbol: 'RNDR/USD', display: 'RNDR/USD', category: 'crypto', yahooTicker: 'RNDR-USD' },
  { symbol: 'AAVE/USD', display: 'AAVE/USD', category: 'crypto', yahooTicker: 'AAVE-USD' },
  { symbol: 'MKR/USD', display: 'MKR/USD', category: 'crypto', yahooTicker: 'MKR-USD' },
  { symbol: 'CRV/USD', display: 'CRV/USD', category: 'crypto', yahooTicker: 'CRV-USD' },
  { symbol: 'FLOKI/USD', display: 'FLOKI/USD', category: 'crypto', yahooTicker: 'FLOKI-USD' },
  { symbol: 'BONK/USD', display: 'BONK/USD', category: 'crypto', yahooTicker: 'BONK-USD' },
  { symbol: 'JUP/USD', display: 'JUP/USD', category: 'crypto', yahooTicker: 'JUP-USD' },
  { symbol: 'WIF/USD', display: 'WIF/USD', category: 'crypto', yahooTicker: 'WIF-USD' },
  { symbol: 'STRK/USD', display: 'STRK/USD', category: 'crypto', yahooTicker: 'STRK-USD' },
  { symbol: 'ENA/USD', display: 'ENA/USD', category: 'crypto', yahooTicker: 'ENA-USD' },
  { symbol: 'PENDLE/USD', display: 'PENDLE/USD', category: 'crypto', yahooTicker: 'PENDLE-USD' },
  { symbol: 'TAO/USD', display: 'TAO/USD', category: 'crypto', yahooTicker: 'TAO-USD' },
  { symbol: 'ZRO/USD', display: 'ZRO/USD', category: 'crypto', yahooTicker: 'ZRO-USD' },
]

const STOCKS: SymbolDef[] = [
  // Tech - Mega Cap
  { symbol: 'AAPL', display: 'AAPL', category: 'stock', yahooTicker: 'AAPL' },
  { symbol: 'NVDA', display: 'NVDA', category: 'stock', yahooTicker: 'NVDA' },
  { symbol: 'MSFT', display: 'MSFT', category: 'stock', yahooTicker: 'MSFT' },
  { symbol: 'AMZN', display: 'AMZN', category: 'stock', yahooTicker: 'AMZN' },
  { symbol: 'GOOGL', display: 'GOOGL', category: 'stock', yahooTicker: 'GOOGL' },
  { symbol: 'META', display: 'META', category: 'stock', yahooTicker: 'META' },
  { symbol: 'TSLA', display: 'TSLA', category: 'stock', yahooTicker: 'TSLA' },
  { symbol: 'AVGO', display: 'AVGO', category: 'stock', yahooTicker: 'AVGO' },
  { symbol: 'ORCL', display: 'ORCL', category: 'stock', yahooTicker: 'ORCL' },
  { symbol: 'CRM', display: 'CRM', category: 'stock', yahooTicker: 'CRM' },
  { symbol: 'AMD', display: 'AMD', category: 'stock', yahooTicker: 'AMD' },
  { symbol: 'INTC', display: 'INTC', category: 'stock', yahooTicker: 'INTC' },
  { symbol: 'IBM', display: 'IBM', category: 'stock', yahooTicker: 'IBM' },
  { symbol: 'CSCO', display: 'CSCO', category: 'stock', yahooTicker: 'CSCO' },
  { symbol: 'QCOM', display: 'QCOM', category: 'stock', yahooTicker: 'QCOM' },
  { symbol: 'ADBE', display: 'ADBE', category: 'stock', yahooTicker: 'ADBE' },
  { symbol: 'NFLX', display: 'NFLX', category: 'stock', yahooTicker: 'NFLX' },
  { symbol: 'NOW', display: 'NOW', category: 'stock', yahooTicker: 'NOW' },
  { symbol: 'PLTR', display: 'PLTR', category: 'stock', yahooTicker: 'PLTR' },
  { symbol: 'CRWD', display: 'CRWD', category: 'stock', yahooTicker: 'CRWD' },
  { symbol: 'PANW', display: 'PANW', category: 'stock', yahooTicker: 'PANW' },
  { symbol: 'SNOW', display: 'SNOW', category: 'stock', yahooTicker: 'SNOW' },
  { symbol: 'DDOG', display: 'DDOG', category: 'stock', yahooTicker: 'DDOG' },
  { symbol: 'UBER', display: 'UBER', category: 'stock', yahooTicker: 'UBER' },
  { symbol: 'SQ', display: 'SQ', category: 'stock', yahooTicker: 'SQ' },
  { symbol: 'PYPL', display: 'PYPL', category: 'stock', yahooTicker: 'PYPL' },
  { symbol: 'SHOP', display: 'SHOP', category: 'stock', yahooTicker: 'SHOP' },
  { symbol: 'AMAT', display: 'AMAT', category: 'stock', yahooTicker: 'AMAT' },
  { symbol: 'TSM', display: 'TSM', category: 'stock', yahooTicker: 'TSM' },
  { symbol: 'ASML', display: 'ASML', category: 'stock', yahooTicker: 'ASML' },
  { symbol: 'MRVL', display: 'MRVL', category: 'stock', yahooTicker: 'MRVL' },
  { symbol: 'MU', display: 'MU', category: 'stock', yahooTicker: 'MU' },
  { symbol: 'ARM', display: 'ARM', category: 'stock', yahooTicker: 'ARM' },
  { symbol: 'DASH', display: 'DASH', category: 'stock', yahooTicker: 'DASH' },
  { symbol: 'COIN', display: 'COIN', category: 'stock', yahooTicker: 'COIN' },
  { symbol: 'MSTR', display: 'MSTR', category: 'stock', yahooTicker: 'MSTR' },
  { symbol: 'HOOD', display: 'HOOD', category: 'stock', yahooTicker: 'HOOD' },
  { symbol: 'SNAP', display: 'SNAP', category: 'stock', yahooTicker: 'SNAP' },
  { symbol: 'PINS', display: 'PINS', category: 'stock', yahooTicker: 'PINS' },
  { symbol: 'RBLX', display: 'RBLX', category: 'stock', yahooTicker: 'RBLX' },
  // Consumer
  { symbol: 'WMT', display: 'WMT', category: 'stock', yahooTicker: 'WMT' },
  { symbol: 'COST', display: 'COST', category: 'stock', yahooTicker: 'COST' },
  { symbol: 'HD', display: 'HD', category: 'stock', yahooTicker: 'HD' },
  { symbol: 'MCD', display: 'MCD', category: 'stock', yahooTicker: 'MCD' },
  { symbol: 'DIS', display: 'DIS', category: 'stock', yahooTicker: 'DIS' },
  { symbol: 'SBUX', display: 'SBUX', category: 'stock', yahooTicker: 'SBUX' },
  { symbol: 'NKE', display: 'NKE', category: 'stock', yahooTicker: 'NKE' },
  { symbol: 'TGT', display: 'TGT', category: 'stock', yahooTicker: 'TGT' },
  { symbol: 'CMG', display: 'CMG', category: 'stock', yahooTicker: 'CMG' },
  { symbol: 'KO', display: 'KO', category: 'stock', yahooTicker: 'KO' },
  { symbol: 'PEP', display: 'PEP', category: 'stock', yahooTicker: 'PEP' },
  { symbol: 'PG', display: 'PG', category: 'stock', yahooTicker: 'PG' },
  // Financial
  { symbol: 'JPM', display: 'JPM', category: 'stock', yahooTicker: 'JPM' },
  { symbol: 'V', display: 'V', category: 'stock', yahooTicker: 'V' },
  { symbol: 'MA', display: 'MA', category: 'stock', yahooTicker: 'MA' },
  { symbol: 'BAC', display: 'BAC', category: 'stock', yahooTicker: 'BAC' },
  { symbol: 'GS', display: 'GS', category: 'stock', yahooTicker: 'GS' },
  { symbol: 'BRK-B', display: 'BRK.B', category: 'stock', yahooTicker: 'BRK-B' },
  { symbol: 'AXP', display: 'AXP', category: 'stock', yahooTicker: 'AXP' },
  { symbol: 'SCHW', display: 'SCHW', category: 'stock', yahooTicker: 'SCHW' },
  { symbol: 'MS', display: 'MS', category: 'stock', yahooTicker: 'MS' },
  { symbol: 'BLK', display: 'BLK', category: 'stock', yahooTicker: 'BLK' },
  { symbol: 'C', display: 'C', category: 'stock', yahooTicker: 'C' },
  { symbol: 'WFC', display: 'WFC', category: 'stock', yahooTicker: 'WFC' },
  // Healthcare
  { symbol: 'UNH', display: 'UNH', category: 'stock', yahooTicker: 'UNH' },
  { symbol: 'JNJ', display: 'JNJ', category: 'stock', yahooTicker: 'JNJ' },
  { symbol: 'LLY', display: 'LLY', category: 'stock', yahooTicker: 'LLY' },
  { symbol: 'PFE', display: 'PFE', category: 'stock', yahooTicker: 'PFE' },
  { symbol: 'MRK', display: 'MRK', category: 'stock', yahooTicker: 'MRK' },
  { symbol: 'ABBV', display: 'ABBV', category: 'stock', yahooTicker: 'ABBV' },
  { symbol: 'ISRG', display: 'ISRG', category: 'stock', yahooTicker: 'ISRG' },
  { symbol: 'TMO', display: 'TMO', category: 'stock', yahooTicker: 'TMO' },
  { symbol: 'AMGN', display: 'AMGN', category: 'stock', yahooTicker: 'AMGN' },
  { symbol: 'GILD', display: 'GILD', category: 'stock', yahooTicker: 'GILD' },
  { symbol: 'VRTX', display: 'VRTX', category: 'stock', yahooTicker: 'VRTX' },
  { symbol: 'MRNA', display: 'MRNA', category: 'stock', yahooTicker: 'MRNA' },
  // Energy & Industrial
  { symbol: 'XOM', display: 'XOM', category: 'stock', yahooTicker: 'XOM' },
  { symbol: 'CVX', display: 'CVX', category: 'stock', yahooTicker: 'CVX' },
  { symbol: 'CAT', display: 'CAT', category: 'stock', yahooTicker: 'CAT' },
  { symbol: 'GE', display: 'GE', category: 'stock', yahooTicker: 'GE' },
  { symbol: 'BA', display: 'BA', category: 'stock', yahooTicker: 'BA' },
  { symbol: 'COP', display: 'COP', category: 'stock', yahooTicker: 'COP' },
  { symbol: 'EOG', display: 'EOG', category: 'stock', yahooTicker: 'EOG' },
  { symbol: 'SLB', display: 'SLB', category: 'stock', yahooTicker: 'SLB' },
  { symbol: 'OXY', display: 'OXY', category: 'stock', yahooTicker: 'OXY' },
  { symbol: 'HON', display: 'HON', category: 'stock', yahooTicker: 'HON' },
  { symbol: 'RTX', display: 'RTX', category: 'stock', yahooTicker: 'RTX' },
  { symbol: 'UNP', display: 'UNP', category: 'stock', yahooTicker: 'UNP' },
  { symbol: 'UPS', display: 'UPS', category: 'stock', yahooTicker: 'UPS' },
  { symbol: 'LMT', display: 'LMT', category: 'stock', yahooTicker: 'LMT' },
  // Other reference symbols
  { symbol: 'AMC', display: 'AMC', category: 'stock', yahooTicker: 'AMC' },
  { symbol: 'VT', display: 'VT', category: 'stock', yahooTicker: 'VT' },
]

const INDICES: SymbolDef[] = [
  { symbol: 'SPY', display: 'SPY', category: 'index', yahooTicker: 'SPY' },
  { symbol: 'QQQ', display: 'QQQ', category: 'index', yahooTicker: 'QQQ' },
  { symbol: 'IWM', display: 'IWM', category: 'index', yahooTicker: 'IWM' },
  { symbol: 'DIA', display: 'DIA', category: 'index', yahooTicker: 'DIA' },
  { symbol: 'VTI', display: 'VTI', category: 'index', yahooTicker: 'VTI' },
  { symbol: 'VOO', display: 'VOO', category: 'index', yahooTicker: 'VOO' },
  { symbol: 'TLT', display: 'TLT', category: 'index', yahooTicker: 'TLT' },
  { symbol: 'VIX', display: 'VIX', category: 'index', yahooTicker: '^VIX' },
  { symbol: 'SPX', display: 'SPX', category: 'index', yahooTicker: '^GSPC' },
  { symbol: 'NDX', display: 'NDX', category: 'index', yahooTicker: '^NDX' },
  { symbol: 'DJI', display: 'DJI', category: 'index', yahooTicker: '^DJI' },
  { symbol: 'RUT', display: 'RUT', category: 'index', yahooTicker: '^RUT' },
  { symbol: 'FTSE', display: 'FTSE', category: 'index', yahooTicker: '^FTSE' },
  { symbol: 'DAX', display: 'DAX', category: 'index', yahooTicker: '^GDAXI' },
  { symbol: 'NKY', display: 'NKY', category: 'index', yahooTicker: '^N225' },
  { symbol: 'HSI', display: 'HSI', category: 'index', yahooTicker: '^HSI' },
  { symbol: 'AXJO', display: 'AXJO', category: 'index', yahooTicker: '^AXJO' },
  { symbol: 'DXY', display: 'DXY', category: 'index', yahooTicker: 'DX-Y.NYB' },
  { symbol: 'ES1!', display: 'ES1!', category: 'index', yahooTicker: 'ES=F' },
  { symbol: 'NQ1!', display: 'NQ1!', category: 'index', yahooTicker: 'NQ=F' },
]

const COMMODITIES: SymbolDef[] = [
  { symbol: 'XAU/USD', display: 'XAU/USD', category: 'commodity', yahooTicker: 'GC=F' },
  { symbol: 'XAG/USD', display: 'XAG/USD', category: 'commodity', yahooTicker: 'SI=F' },
  { symbol: 'USOIL', display: 'USOIL', category: 'commodity', yahooTicker: 'CL=F' },
  { symbol: 'UKOIL', display: 'UKOIL', category: 'commodity', yahooTicker: 'BZ=F' },
  { symbol: 'GLD', display: 'GLD', category: 'commodity', yahooTicker: 'GLD' },
  { symbol: 'SLV', display: 'SLV', category: 'commodity', yahooTicker: 'SLV' },
  { symbol: 'USO', display: 'USO', category: 'commodity', yahooTicker: 'USO' },
  { symbol: 'UNG', display: 'UNG', category: 'commodity', yahooTicker: 'UNG' },
  { symbol: 'COPX', display: 'COPX', category: 'commodity', yahooTicker: 'COPX' },
  { symbol: 'URA', display: 'URA', category: 'commodity', yahooTicker: 'URA' },
]

export const SYMBOLS: SymbolDef[] = [
  ...FX_MAJORS,
  ...FX_CROSSES,
  ...FX_EXOTICS,
  ...CRYPTO,
  ...STOCKS,
  ...INDICES,
  ...COMMODITIES,
]

// Remove duplicates
export const UNIQUE_SYMBOLS = SYMBOLS.filter(
  (s, i, arr) => arr.findIndex(x => x.symbol === s.symbol) === i
)

export const DEFAULT_WATCHLIST = [
  // All forex majors + crosses
  ...FX_MAJORS.map(s => s.symbol),
  // All crypto
  ...CRYPTO.map(s => s.symbol),
  // Top stocks
  ...STOCKS.filter(s => ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META',
    'AMD', 'AVGO', 'NFLX', 'CRM', 'PLTR', 'CRWD', 'COIN', 'MSTR',
    'AMC', 'VT'].includes(s.symbol)).map(s => s.symbol),
  // Indices + commodities
  ...INDICES.slice(0, 6).map(s => s.symbol),
  ...COMMODITIES.filter(s => ['XAU/USD', 'XAG/USD', 'USOIL', 'UKOIL'].includes(s.symbol)).map(s => s.symbol),
]

export function findSymbol(sym: string): SymbolDef | undefined {
  const upper = sym.toUpperCase()
  return UNIQUE_SYMBOLS.find(
    s => s.symbol === upper || s.yahooTicker.toUpperCase() === upper || s.display.toUpperCase() === upper
  )
}

export function searchSymbols(query: string): SymbolDef[] {
  const q = query.toUpperCase()
  if (!q) return []
  return UNIQUE_SYMBOLS.filter(
    s =>
      s.symbol.toUpperCase().includes(q) ||
      s.display.toUpperCase().includes(q) ||
      s.category.toUpperCase().includes(q)
  ).slice(0, 10)
}
