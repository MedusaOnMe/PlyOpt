import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useMarket } from './MarketContext'
import { STRIKE_COUNT, STRIKE_STEP_PERCENT } from '../utils/constants'

const OptionsContext = createContext(null)

// Generate mock expiration dates (next 4 weeks + 2 months)
function generateExpirations() {
  const expirations = []
  const today = new Date()

  // Weekly expirations for next 4 weeks
  for (let i = 1; i <= 4; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + (7 * i))
    // Set to Friday
    const dayOfWeek = date.getDay()
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7
    date.setDate(date.getDate() + daysUntilFriday)

    expirations.push({
      date: date.toISOString().split('T')[0],
      label: formatExpirationLabel(date),
      daysToExpiry: Math.ceil((date - today) / (1000 * 60 * 60 * 24)),
      isWeekly: true,
    })
  }

  // Monthly expirations for next 2 months
  for (let i = 1; i <= 2; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i + 1, 0) // Last day of month
    // Find third Friday
    const firstDay = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const firstFriday = new Date(firstDay)
    firstFriday.setDate(1 + ((5 - firstDay.getDay() + 7) % 7))
    const thirdFriday = new Date(firstFriday)
    thirdFriday.setDate(firstFriday.getDate() + 14)

    expirations.push({
      date: thirdFriday.toISOString().split('T')[0],
      label: formatExpirationLabel(thirdFriday, true),
      daysToExpiry: Math.ceil((thirdFriday - today) / (1000 * 60 * 60 * 24)),
      isWeekly: false,
    })
  }

  return expirations.sort((a, b) => a.daysToExpiry - b.daysToExpiry)
}

function formatExpirationLabel(date, isMonthly = false) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const day = date.getDate()
  return isMonthly ? `${month} ${day} (M)` : `${month} ${day}`
}

// Standard normal CDF approximation (Abramowitz and Stegun)
function normalCDF(x) {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1.0 + sign * y)
}

// Standard normal PDF
function normalPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

// Black-Scholes option pricing
function calculateOptionPrice(spot, strike, daysToExpiry, iv, type) {
  const T = Math.max(daysToExpiry / 365, 0.001)
  const sigma = iv / 100
  const r = 0.05 // Risk-free rate 5%

  // Calculate d1 and d2
  const d1 = (Math.log(spot / strike) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)

  let price
  if (type === 'CALL') {
    price = spot * normalCDF(d1) - strike * Math.exp(-r * T) * normalCDF(d2)
  } else {
    price = strike * Math.exp(-r * T) * normalCDF(-d2) - spot * normalCDF(-d1)
  }

  return Math.max(0.01, Math.round(price * 100) / 100)
}

// Calculate Greeks using Black-Scholes formulas
function calculateGreeks(spot, strike, daysToExpiry, iv, type) {
  const T = Math.max(daysToExpiry / 365, 0.001)
  const sigma = iv / 100
  const r = 0.05

  const d1 = (Math.log(spot / strike) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)

  // Delta
  let delta
  if (type === 'CALL') {
    delta = normalCDF(d1)
  } else {
    delta = normalCDF(d1) - 1
  }

  // Gamma (same for calls and puts)
  const gamma = normalPDF(d1) / (spot * sigma * Math.sqrt(T))

  // Theta (per day)
  let theta
  const term1 = -(spot * normalPDF(d1) * sigma) / (2 * Math.sqrt(T))
  if (type === 'CALL') {
    theta = (term1 - r * strike * Math.exp(-r * T) * normalCDF(d2)) / 365
  } else {
    theta = (term1 + r * strike * Math.exp(-r * T) * normalCDF(-d2)) / 365
  }

  // Vega (per 1% change in IV)
  const vega = spot * Math.sqrt(T) * normalPDF(d1) / 100

  return {
    delta: Math.round(delta * 100) / 100,
    gamma: Math.round(gamma * 1000) / 1000,
    theta: Math.round(theta * 100) / 100,
    vega: Math.round(vega * 100) / 100,
  }
}

// Generate strike prices centered around current price
function generateStrikes(spotPrice, count = STRIKE_COUNT) {
  const strikes = []
  const step = spotPrice * STRIKE_STEP_PERCENT
  const centerIndex = Math.floor(count / 2)

  for (let i = 0; i < count; i++) {
    const offset = i - centerIndex
    const strike = spotPrice + (offset * step)
    strikes.push(Math.round(strike * 100) / 100)
  }

  return strikes
}

// Seeded random number generator for deterministic values
function seededRandom(seed) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

// Generate realistic volume/OI based on moneyness - DETERMINISTIC
function generateVolumeOI(strike, daysToExpiry, moneyness, isCall) {
  // Create seed from strike and expiry for consistent values
  const seed = strike * 1000 + daysToExpiry + (isCall ? 0 : 500)

  // Base values scale with time to expiry (more OI for popular near-term)
  const timeMultiplier = daysToExpiry <= 7 ? 2.5 : daysToExpiry <= 14 ? 1.8 : daysToExpiry <= 30 ? 1.2 : 0.7

  // ATM options have highest activity
  const atmFactor = Math.exp(-Math.pow(moneyness - 1, 2) * 12)

  // Slight bias: calls more active for OTM calls, puts for OTM puts
  const directionalBias = isCall
    ? (moneyness < 1 ? 1.3 : 0.9)  // OTM calls more popular
    : (moneyness > 1 ? 1.3 : 0.9)  // OTM puts more popular

  // Calculate OI first (accumulates over time, larger base)
  const oiMultiplier = atmFactor * directionalBias * timeMultiplier
  const oiVariance = 0.7 + seededRandom(seed) * 0.6 // 0.7 to 1.3
  const openInterest = Math.floor(15000 * oiMultiplier * oiVariance)

  // Volume is typically 5-20% of OI for liquid options
  const volumeRatio = 0.05 + seededRandom(seed + 1) * 0.15 // 5% to 20%
  const volume = Math.floor(openInterest * volumeRatio * (0.8 + seededRandom(seed + 2) * 0.4))

  return {
    volume: Math.max(10, volume),
    openInterest: Math.max(100, openInterest)
  }
}

// Generate full options chain with realistic values
function generateOptionsChain(spotPrice, expiration, baseIV = 55) {
  const strikes = generateStrikes(spotPrice)
  const chain = []

  for (const strike of strikes) {
    const moneyness = spotPrice / strike

    // IV smile/skew - deterministic based on strike
    // Put skew: OTM puts have higher IV (crash protection)
    // Call skew: slight smile for far OTM calls
    const putSkew = moneyness > 1 ? Math.pow(moneyness - 1, 2) * 45 : 0
    const callSkew = moneyness < 1 ? Math.pow(1 - moneyness, 2) * 30 : 0
    const atmBonus = Math.abs(1 - moneyness) < 0.03 ? -2 : 0  // ATM slightly lower IV
    const termStructure = Math.sqrt(30 / Math.max(expiration.daysToExpiry, 1)) * 8 // Higher IV for near-term

    // Use seeded random for IV variance (deterministic)
    const ivSeed = strike * 100 + expiration.daysToExpiry
    const ivVariance = (seededRandom(ivSeed) - 0.5) * 4 // -2 to +2

    const iv = Math.max(20, baseIV + putSkew + callSkew + atmBonus + termStructure + ivVariance)

    const callPrice = calculateOptionPrice(spotPrice, strike, expiration.daysToExpiry, iv, 'CALL')
    const putPrice = calculateOptionPrice(spotPrice, strike, expiration.daysToExpiry, iv, 'PUT')

    const callGreeks = calculateGreeks(spotPrice, strike, expiration.daysToExpiry, iv, 'CALL')
    const putGreeks = calculateGreeks(spotPrice, strike, expiration.daysToExpiry, iv, 'PUT')

    // Bid/ask spread - tighter for liquid ATM, wider for illiquid OTM
    const liquidityFactor = Math.exp(-Math.pow(moneyness - 1, 2) * 10)
    const baseSpread = expiration.daysToExpiry <= 7 ? 0.01 : 0.015 // Tighter spreads for near-term
    const spreadPercent = baseSpread + (1 - liquidityFactor) * 0.05

    // Generate deterministic volume and OI
    const callVolOI = generateVolumeOI(strike, expiration.daysToExpiry, moneyness, true)
    const putVolOI = generateVolumeOI(strike, expiration.daysToExpiry, moneyness, false)

    chain.push({
      strike,
      isATM: Math.abs(moneyness - 1) < 0.02,
      isITM: {
        call: spotPrice > strike,
        put: spotPrice < strike,
      },
      iv: Math.round(iv * 10) / 10,
      call: {
        bid: Math.max(0.01, Math.round((callPrice * (1 - spreadPercent / 2)) * 100) / 100),
        ask: Math.round((callPrice * (1 + spreadPercent / 2)) * 100) / 100,
        last: callPrice,
        ...callVolOI,
        ...callGreeks,
      },
      put: {
        bid: Math.max(0.01, Math.round((putPrice * (1 - spreadPercent / 2)) * 100) / 100),
        ask: Math.round((putPrice * (1 + spreadPercent / 2)) * 100) / 100,
        last: putPrice,
        ...putVolOI,
        ...putGreeks,
      },
    })
  }

  return chain
}

export function OptionsProvider({ children }) {
  const { selectedMarket, getCurrentPrice } = useMarket()

  const [selectedExpiration, setSelectedExpiration] = useState(null)
  const [selectedStrike, setSelectedStrike] = useState(null)
  const [selectedType, setSelectedType] = useState('CALL')
  const [positionDirection, setPositionDirection] = useState('BUY') // BUY or SELL
  const [quantity, setQuantity] = useState(1)
  const hasAutoSelected = useRef(false)

  // Generate expirations
  const expirations = useMemo(() => generateExpirations(), [])

  // Set default expiration
  useEffect(() => {
    if (expirations.length > 0 && !selectedExpiration) {
      setSelectedExpiration(expirations[0])
    }
  }, [expirations, selectedExpiration])

  // Get current underlying price (convert from 0-1 to cents for options)
  const spotPrice = useMemo(() => {
    const price = getCurrentPrice()
    // Convert Polymarket probability (0-1) to cents (0-100)
    return price ? Math.round(price * 100) : 50
  }, [getCurrentPrice])

  // Generate options chain for selected expiration
  const optionsChain = useMemo(() => {
    if (!selectedExpiration || !spotPrice) return []
    return generateOptionsChain(spotPrice, selectedExpiration)
  }, [spotPrice, selectedExpiration])

  // Auto-select ATM strike on load
  useEffect(() => {
    if (optionsChain.length > 0 && !hasAutoSelected.current) {
      hasAutoSelected.current = true
      // Find ATM option or closest to spot
      const atmOption = optionsChain.find(row => row.isATM)
      if (atmOption) {
        setSelectedStrike(atmOption.strike)
      } else {
        // Find closest strike to spot price
        const closest = optionsChain.reduce((prev, curr) =>
          Math.abs(curr.strike - spotPrice) < Math.abs(prev.strike - spotPrice) ? curr : prev
        )
        setSelectedStrike(closest.strike)
      }
    }
  }, [optionsChain, spotPrice])

  // Get selected option details
  const selectedOption = useMemo(() => {
    if (!selectedStrike || !optionsChain.length) return null

    const strikeData = optionsChain.find(row => row.strike === selectedStrike)
    if (!strikeData) return null

    return {
      ...strikeData,
      type: selectedType,
      data: selectedType === 'CALL' ? strikeData.call : strikeData.put,
    }
  }, [optionsChain, selectedStrike, selectedType])

  // Calculate order value based on position direction
  const orderValue = useMemo(() => {
    if (!selectedOption) return null

    const isBuying = positionDirection === 'BUY'
    // Buyers pay ask, sellers receive bid
    const premium = isBuying ? selectedOption.data.ask : selectedOption.data.bid
    const totalPremium = premium * quantity

    let maxProfit, maxLoss, breakeven

    if (isBuying) {
      // Long position: pay premium, limited loss, unlimited/large profit potential
      if (selectedType === 'CALL') {
        maxProfit = (100 - selectedStrike - premium) * quantity
        breakeven = selectedStrike + premium
      } else {
        maxProfit = (selectedStrike - premium) * quantity
        breakeven = selectedStrike - premium
      }
      maxLoss = totalPremium
    } else {
      // Short position: receive premium, limited profit, unlimited/large loss potential
      if (selectedType === 'CALL') {
        maxProfit = totalPremium // Premium received is max profit
        maxLoss = (100 - selectedStrike - premium) * quantity // Unlimited in theory, capped at 100¢
        breakeven = selectedStrike + premium
      } else {
        maxProfit = totalPremium
        maxLoss = (selectedStrike - premium) * quantity
        breakeven = selectedStrike - premium
      }
    }

    return {
      premium,
      totalPremium: Math.round(totalPremium * 100) / 100,
      maxProfit: Math.round(Math.max(0, maxProfit) * 100) / 100,
      maxLoss: Math.round(Math.max(0, maxLoss) * 100) / 100,
      breakeven: Math.round(breakeven * 100) / 100,
      isBuying,
    }
  }, [selectedOption, quantity, selectedType, selectedStrike, positionDirection])

  // Select a strike from the chain
  const selectStrike = useCallback((strike) => {
    setSelectedStrike(strike)
  }, [])

  // Select option type
  const selectType = useCallback((type) => {
    setSelectedType(type)
  }, [])

  // Select position direction (BUY or SELL)
  const selectDirection = useCallback((direction) => {
    setPositionDirection(direction)
  }, [])

  // Change expiration
  const selectExpiration = useCallback((expiration) => {
    setSelectedExpiration(expiration)
    setSelectedStrike(null) // Reset strike when changing expiration
  }, [])

  // Update quantity
  const updateQuantity = useCallback((qty) => {
    setQuantity(Math.max(1, Math.min(1000, qty)))
  }, [])

  const value = {
    // Data
    expirations,
    optionsChain,
    spotPrice,

    // Selection state
    selectedExpiration,
    selectedStrike,
    selectedType,
    positionDirection,
    selectedOption,
    quantity,
    orderValue,

    // Actions
    selectExpiration,
    selectStrike,
    selectType,
    selectDirection,
    updateQuantity,
  }

  return (
    <OptionsContext.Provider value={value}>
      {children}
    </OptionsContext.Provider>
  )
}

export function useOptions() {
  const context = useContext(OptionsContext)
  if (!context) {
    throw new Error('useOptions must be used within an OptionsProvider')
  }
  return context
}

export default OptionsContext
