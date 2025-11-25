// Polymarket API endpoints
// Use proxy in dev, direct URLs in production
const isDev = import.meta.env.DEV
const GAMMA_API = isDev ? '/gamma-api' : 'https://gamma-api.polymarket.com'
const CLOB_API = isDev ? '/clob-api' : 'https://clob.polymarket.com'

// Fetch markets from Gamma API
export async function fetchMarkets(options = {}) {
  const {
    limit = 100,
    offset = 0,
  } = options

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      closed: 'false',
      active: 'true',
    })

    const response = await fetch(`${GAMMA_API}/markets?${params}`)
    if (!response.ok) throw new Error(`Failed to fetch markets: ${response.status}`)

    const data = await response.json()
    console.log('Fetched markets from Polymarket API:', data.length, 'markets')

    // Normalize the data format and filter out markets without token IDs
    const normalized = data.map(normalizeMarket).filter(m => {
      // Must have a question and valid token IDs for CLOB trading
      return m.question && m.tokenIds && m.tokenIds.length > 0 && m.tokenIds[0].length > 10
    })

    // Sort by volume (highest first)
    normalized.sort((a, b) => (b.volumeNum || 0) - (a.volumeNum || 0))

    console.log('Valid markets with token IDs:', normalized.length, '- Top volume:', normalized[0]?.question?.slice(0, 40), '$' + Math.round(normalized[0]?.volumeNum || 0))
    return normalized
  } catch (error) {
    console.error('Error fetching markets:', error)
    // Return mock data as fallback
    return getMockMarkets()
  }
}

// Normalize market data from API to consistent format
function normalizeMarket(market) {
  // Parse outcome prices - it's a JSON string like '["0.05", "0.95"]'
  let yesPrice = 0.5
  let noPrice = 0.5

  if (market.outcomePrices) {
    try {
      // outcomePrices is a JSON string like '["0.05", "0.95"]'
      const parsed = typeof market.outcomePrices === 'string'
        ? JSON.parse(market.outcomePrices)
        : market.outcomePrices

      if (Array.isArray(parsed) && parsed.length >= 2) {
        yesPrice = parseFloat(parsed[0]) || 0.5
        noPrice = parseFloat(parsed[1]) || 0.5
      }
    } catch (e) {
      // Fallback: try splitting by comma if not valid JSON
      if (typeof market.outcomePrices === 'string') {
        const parts = market.outcomePrices.split(',').map(p => parseFloat(p.trim()))
        yesPrice = parts[0] || 0.5
        noPrice = parts[1] || 0.5
      }
    }
  }

  // Debug: log the parsed price
  if (market.question) {
    console.log('Price parsed:', market.question.slice(0, 30), '-> Yes:', yesPrice, 'No:', noPrice)
  }

  // Get token IDs for CLOB API - parse JSON string from Gamma API
  let tokenIds = []
  if (market.clobTokenIds) {
    try {
      // clobTokenIds is a JSON string like '["token1", "token2"]'
      const parsed = typeof market.clobTokenIds === 'string'
        ? JSON.parse(market.clobTokenIds)
        : market.clobTokenIds

      if (Array.isArray(parsed)) {
        tokenIds = parsed.filter(t => t && t.length > 10)
      }

      if (tokenIds.length > 0) {
        console.log('Parsed token ID:', market.question?.slice(0, 40), '->', tokenIds[0]?.slice(0, 30) + '...')
      }
    } catch (e) {
      console.error('Failed to parse clobTokenIds:', market.clobTokenIds, e)
    }
  }

  return {
    id: market.id || market.conditionId || market.slug,
    question: market.question || '',
    slug: market.slug || '',
    conditionId: market.conditionId || '',
    outcomes: market.outcomes || ['Yes', 'No'],
    yesPrice,
    noPrice,
    outcomePrices: [yesPrice, noPrice],
    volume: parseFloat(market.volume) || parseFloat(market.volumeNum) || 0,
    volumeNum: parseFloat(market.volumeNum) || parseFloat(market.volume) || 0,
    volume24hr: parseFloat(market.volume24hr) || 0,
    liquidity: parseFloat(market.liquidity) || parseFloat(market.liquidityNum) || 0,
    liquidityNum: parseFloat(market.liquidityNum) || parseFloat(market.liquidity) || 0,
    bestBid: parseFloat(market.bestBid) || yesPrice - 0.01,
    bestAsk: parseFloat(market.bestAsk) || yesPrice + 0.01,
    tokenIds,
    clobTokenIds: tokenIds,
    endDate: market.endDate || market.endDateIso || null,
    image: market.image || null,
    active: market.active !== false,
  }
}

// Get spread (bid/ask) from CLOB API
export async function fetchSpread(tokenId) {
  if (!tokenId || tokenId.startsWith('mock-') || tokenId.length < 10) {
    return null
  }

  const cleanTokenId = String(tokenId).replace(/[\[\]"']/g, '').trim()

  try {
    const response = await fetch(`${CLOB_API}/spread?token_id=${cleanTokenId}`)
    if (!response.ok) throw new Error(`Failed to fetch spread: ${response.status}`)

    const data = await response.json()
    console.log('Fetched spread:', data)
    return {
      bid: parseFloat(data.bid) || null,
      ask: parseFloat(data.ask) || null,
      spread: parseFloat(data.spread) || null,
    }
  } catch (error) {
    console.error('Error fetching spread:', error)
    return null
  }
}

// Get current price (midpoint)
export async function fetchMidpoint(tokenId) {
  if (!tokenId || tokenId.startsWith('mock-')) {
    return null
  }

  try {
    const response = await fetch(`${CLOB_API}/midpoint?token_id=${tokenId}`)
    if (!response.ok) throw new Error('Failed to fetch midpoint')

    const data = await response.json()
    return parseFloat(data.mid) || null
  } catch (error) {
    console.error('Error fetching midpoint:', error)
    return null
  }
}

// Get order book
export async function fetchOrderBook(tokenId, basePrice = 0.5) {
  if (!tokenId || tokenId.startsWith('mock-') || tokenId.length < 10) {
    return getMockOrderBook(basePrice)
  }

  try {
    console.log('Fetching order book for token:', tokenId.slice(0, 40))
    const response = await fetch(`${CLOB_API}/book?token_id=${tokenId}`)
    if (!response.ok) throw new Error(`Failed to fetch order book: ${response.status}`)

    const data = await response.json()
    console.log('Fetched order book:', data.bids?.length, 'bids,', data.asks?.length, 'asks for token', tokenId)

    const bids = (data.bids || []).map(b => ({
      price: parseFloat(b.price) || 0,
      size: parseFloat(b.size) || 0,
    })).filter(b => b.price > 0 && b.size > 0)
      .sort((a, b) => b.price - a.price) // Sort bids highest first

    const asks = (data.asks || []).map(a => ({
      price: parseFloat(a.price) || 0,
      size: parseFloat(a.size) || 0,
    })).filter(a => a.price > 0 && a.size > 0)
      .sort((a, b) => a.price - b.price) // Sort asks lowest first

    // Debug: log top of book
    console.log('Order book top:', {
      topBid: bids[0],
      topAsk: asks[0],
      bidCount: bids.length,
      askCount: asks.length,
    })

    // If empty, return mock using the market's actual price
    if (bids.length === 0 && asks.length === 0) {
      console.log('Empty order book, using mock with base price:', basePrice)
      return getMockOrderBook(basePrice)
    }

    return { bids, asks }
  } catch (error) {
    console.error('Error fetching order book:', error)
    return getMockOrderBook(basePrice)
  }
}

// Get price history for charts
export async function fetchPriceHistory(tokenId, interval = '1d', basePrice = 0.5, fidelity = 60) {
  if (!tokenId || tokenId.startsWith('mock-') || tokenId.length < 10) {
    return getMockPriceHistory(basePrice)
  }

  try {
    console.log('Fetching price history for token:', tokenId.slice(0, 40), 'interval:', interval, 'fidelity:', fidelity)
    const params = new URLSearchParams({
      market: tokenId,
      interval,
      fidelity: fidelity.toString(),
    })

    const response = await fetch(`${CLOB_API}/prices-history?${params}`)
    if (!response.ok) throw new Error(`Failed to fetch price history: ${response.status}`)

    const data = await response.json()
    console.log('Fetched price history:', data.history?.length, 'points for token', tokenId)

    // Map and filter valid data points
    let history = (data.history || [])
      .map(point => ({
        time: typeof point.t === 'number' ? point.t : parseInt(point.t, 10),
        value: parseFloat(point.p) || 0,
      }))
      .filter(p => p.value > 0 && p.time > 0 && !isNaN(p.time))

    // Sort by time ascending (required by lightweight-charts)
    history.sort((a, b) => a.time - b.time)

    // Remove duplicates (keep last value for each timestamp)
    const seen = new Map()
    history.forEach(p => seen.set(p.time, p))
    history = Array.from(seen.values())

    console.log('Processed history:', history.length, 'points, range:', history[0]?.time, '->', history[history.length - 1]?.time)

    if (history.length === 0) {
      console.log('No history data, using mock with base price:', basePrice)
      return getMockPriceHistory(basePrice)
    }

    return history
  } catch (error) {
    console.error('Error fetching price history:', error)
    return getMockPriceHistory(basePrice)
  }
}

// Mock data for fallback
function getMockMarkets() {
  return [
    {
      id: '1',
      question: 'Will Bitcoin reach $150,000 by end of 2025?',
      slug: 'bitcoin-150k-2025',
      conditionId: 'mock-btc-1',
      outcomes: ['Yes', 'No'],
      yesPrice: 0.42,
      noPrice: 0.58,
      outcomePrices: [0.42, 0.58],
      volume: 2500000,
      volumeNum: 2500000,
      volume24hr: 185000,
      liquidity: 450000,
      liquidityNum: 450000,
      bestBid: 0.41,
      bestAsk: 0.43,
      tokenIds: ['mock-token-yes-1', 'mock-token-no-1'],
      clobTokenIds: ['mock-token-yes-1', 'mock-token-no-1'],
      endDate: '2025-12-31T23:59:59Z',
    },
    {
      id: '2',
      question: 'Will Trump win the 2028 Presidential Election?',
      slug: 'trump-2028-president',
      conditionId: 'mock-trump-2',
      outcomes: ['Yes', 'No'],
      yesPrice: 0.35,
      noPrice: 0.65,
      outcomePrices: [0.35, 0.65],
      volume: 8500000,
      volumeNum: 8500000,
      volume24hr: 520000,
      liquidity: 1200000,
      liquidityNum: 1200000,
      bestBid: 0.34,
      bestAsk: 0.36,
      tokenIds: ['mock-token-yes-2', 'mock-token-no-2'],
      clobTokenIds: ['mock-token-yes-2', 'mock-token-no-2'],
      endDate: '2028-11-05T23:59:59Z',
    },
    {
      id: '3',
      question: 'Will Ethereum flip Bitcoin market cap in 2025?',
      slug: 'eth-flip-btc-2025',
      conditionId: 'mock-eth-3',
      outcomes: ['Yes', 'No'],
      yesPrice: 0.12,
      noPrice: 0.88,
      outcomePrices: [0.12, 0.88],
      volume: 1800000,
      volumeNum: 1800000,
      volume24hr: 95000,
      liquidity: 280000,
      liquidityNum: 280000,
      bestBid: 0.11,
      bestAsk: 0.13,
      tokenIds: ['mock-token-yes-3', 'mock-token-no-3'],
      clobTokenIds: ['mock-token-yes-3', 'mock-token-no-3'],
      endDate: '2025-12-31T23:59:59Z',
    },
    {
      id: '4',
      question: 'Will the Fed cut rates in January 2025?',
      slug: 'fed-rate-cut-jan-2025',
      conditionId: 'mock-fed-4',
      outcomes: ['Yes', 'No'],
      yesPrice: 0.08,
      noPrice: 0.92,
      outcomePrices: [0.08, 0.92],
      volume: 3200000,
      volumeNum: 3200000,
      volume24hr: 280000,
      liquidity: 520000,
      liquidityNum: 520000,
      bestBid: 0.07,
      bestAsk: 0.09,
      tokenIds: ['mock-token-yes-4', 'mock-token-no-4'],
      clobTokenIds: ['mock-token-yes-4', 'mock-token-no-4'],
      endDate: '2025-01-31T23:59:59Z',
    },
    {
      id: '5',
      question: 'Will SpaceX successfully land humans on Mars by 2030?',
      slug: 'spacex-mars-2030',
      conditionId: 'mock-spacex-5',
      outcomes: ['Yes', 'No'],
      yesPrice: 0.22,
      noPrice: 0.78,
      outcomePrices: [0.22, 0.78],
      volume: 950000,
      volumeNum: 950000,
      volume24hr: 45000,
      liquidity: 180000,
      liquidityNum: 180000,
      bestBid: 0.21,
      bestAsk: 0.23,
      tokenIds: ['mock-token-yes-5', 'mock-token-no-5'],
      clobTokenIds: ['mock-token-yes-5', 'mock-token-no-5'],
      endDate: '2030-12-31T23:59:59Z',
    },
    {
      id: '6',
      question: 'Will Apple release AR glasses in 2025?',
      slug: 'apple-ar-glasses-2025',
      conditionId: 'mock-apple-6',
      outcomes: ['Yes', 'No'],
      yesPrice: 0.55,
      noPrice: 0.45,
      outcomePrices: [0.55, 0.45],
      volume: 1200000,
      volumeNum: 1200000,
      volume24hr: 78000,
      liquidity: 220000,
      liquidityNum: 220000,
      bestBid: 0.54,
      bestAsk: 0.56,
      tokenIds: ['mock-token-yes-6', 'mock-token-no-6'],
      clobTokenIds: ['mock-token-yes-6', 'mock-token-no-6'],
      endDate: '2025-12-31T23:59:59Z',
    },
    {
      id: '7',
      question: 'Will Solana reach $500 in 2025?',
      slug: 'solana-500-2025',
      conditionId: 'mock-sol-7',
      outcomes: ['Yes', 'No'],
      yesPrice: 0.28,
      noPrice: 0.72,
      outcomePrices: [0.28, 0.72],
      volume: 1650000,
      volumeNum: 1650000,
      volume24hr: 125000,
      liquidity: 310000,
      liquidityNum: 310000,
      bestBid: 0.27,
      bestAsk: 0.29,
      tokenIds: ['mock-token-yes-7', 'mock-token-no-7'],
      clobTokenIds: ['mock-token-yes-7', 'mock-token-no-7'],
      endDate: '2025-12-31T23:59:59Z',
    },
    {
      id: '8',
      question: 'Will there be a US recession in 2025?',
      slug: 'us-recession-2025',
      conditionId: 'mock-recession-8',
      outcomes: ['Yes', 'No'],
      yesPrice: 0.32,
      noPrice: 0.68,
      outcomePrices: [0.32, 0.68],
      volume: 4100000,
      volumeNum: 4100000,
      volume24hr: 195000,
      liquidity: 680000,
      liquidityNum: 680000,
      bestBid: 0.31,
      bestAsk: 0.33,
      tokenIds: ['mock-token-yes-8', 'mock-token-no-8'],
      clobTokenIds: ['mock-token-yes-8', 'mock-token-no-8'],
      endDate: '2025-12-31T23:59:59Z',
    },
  ]
}

// Seeded random for consistent mock data
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function getMockOrderBook(basePrice = 0.5) {
  const bids = []
  const asks = []
  const seed = Math.floor(basePrice * 1000) // Use price as seed for consistency

  for (let i = 0; i < 10; i++) {
    bids.push({
      price: Math.max(0.01, basePrice - (i + 1) * 0.01),
      size: Math.floor(seededRandom(seed + i) * 5000) + 500,
    })
    asks.push({
      price: Math.min(0.99, basePrice + (i + 1) * 0.01),
      size: Math.floor(seededRandom(seed + i + 100) * 5000) + 500,
    })
  }

  return { bids, asks }
}

function getMockPriceHistory(basePrice = 0.5) {
  // Round to nearest hour for consistent timestamps
  const now = Math.floor(Date.now() / 3600000) * 3600
  const history = []
  const seed = Math.floor(basePrice * 1000)

  // Start from a price slightly below current and trend upward
  let price = basePrice * 0.85

  for (let i = 100; i >= 0; i--) {
    // Use seeded random for consistent results
    const change = (seededRandom(seed + i) - 0.45) * 0.015
    price += change

    // Gradually trend toward the current price
    price = price + (basePrice - price) * 0.02

    // Keep within reasonable bounds
    price = Math.max(0.02, Math.min(0.98, price))

    history.push({
      time: now - i * 3600,
      value: price,
    })
  }

  // Ensure last point is close to current price
  if (history.length > 0) {
    history[history.length - 1].value = basePrice
  }

  return history
}
