import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
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

// Simple Black-Scholes approximation for options pricing
function calculateOptionPrice(spot, strike, daysToExpiry, iv, type) {
  const T = daysToExpiry / 365
  const sigma = iv / 100

  // Simplified calculation
  const moneyness = spot / strike
  const timeValue = sigma * Math.sqrt(T) * spot * 0.4

  let intrinsicValue = 0
  if (type === 'CALL') {
    intrinsicValue = Math.max(0, spot - strike)
  } else {
    intrinsicValue = Math.max(0, strike - spot)
  }

  // Add some randomness for realism
  const noise = (Math.random() - 0.5) * 0.02 * spot

  const price = Math.max(0.01, intrinsicValue + timeValue + noise)
  return Math.round(price * 100) / 100
}

// Calculate Greeks (simplified)
function calculateGreeks(spot, strike, daysToExpiry, iv, type, premium) {
  const T = Math.max(daysToExpiry / 365, 0.001)
  const moneyness = spot / strike

  // Delta (simplified)
  let delta
  if (type === 'CALL') {
    delta = 0.5 + 0.5 * Math.tanh((moneyness - 1) * 5 / Math.sqrt(T))
  } else {
    delta = -0.5 + 0.5 * Math.tanh((moneyness - 1) * 5 / Math.sqrt(T))
  }

  // Gamma (peak at ATM)
  const gamma = 0.3 * Math.exp(-Math.pow(moneyness - 1, 2) * 20) / Math.sqrt(T)

  // Theta (time decay, always negative for long options)
  const theta = -(premium * 0.1 / Math.sqrt(T)) / 365

  // Vega (sensitivity to IV)
  const vega = spot * Math.sqrt(T) * 0.01 * Math.exp(-Math.pow(moneyness - 1, 2) * 10)

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

// Generate full options chain
function generateOptionsChain(spotPrice, expiration, baseIV = 45) {
  const strikes = generateStrikes(spotPrice)
  const chain = []

  for (const strike of strikes) {
    const moneyness = spotPrice / strike
    // IV smile: higher IV for OTM options
    const ivAdjustment = Math.abs(1 - moneyness) * 20
    const iv = baseIV + ivAdjustment + (Math.random() - 0.5) * 5

    const callPrice = calculateOptionPrice(spotPrice, strike, expiration.daysToExpiry, iv, 'CALL')
    const putPrice = calculateOptionPrice(spotPrice, strike, expiration.daysToExpiry, iv, 'PUT')

    const callGreeks = calculateGreeks(spotPrice, strike, expiration.daysToExpiry, iv, 'CALL', callPrice)
    const putGreeks = calculateGreeks(spotPrice, strike, expiration.daysToExpiry, iv, 'PUT', putPrice)

    // Generate bid/ask spread (wider for OTM)
    const spreadPercent = 0.02 + Math.abs(1 - moneyness) * 0.03

    chain.push({
      strike,
      isATM: Math.abs(moneyness - 1) < 0.03,
      isITM: {
        call: spotPrice > strike,
        put: spotPrice < strike,
      },
      iv: Math.round(iv * 10) / 10,
      call: {
        bid: Math.round((callPrice * (1 - spreadPercent / 2)) * 100) / 100,
        ask: Math.round((callPrice * (1 + spreadPercent / 2)) * 100) / 100,
        last: callPrice,
        volume: Math.floor(Math.random() * 5000) + 100,
        openInterest: Math.floor(Math.random() * 20000) + 500,
        ...callGreeks,
      },
      put: {
        bid: Math.round((putPrice * (1 - spreadPercent / 2)) * 100) / 100,
        ask: Math.round((putPrice * (1 + spreadPercent / 2)) * 100) / 100,
        last: putPrice,
        volume: Math.floor(Math.random() * 5000) + 100,
        openInterest: Math.floor(Math.random() * 20000) + 500,
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
  const [quantity, setQuantity] = useState(1)

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

  // Calculate order value
  const orderValue = useMemo(() => {
    if (!selectedOption) return null

    const premium = selectedOption.data.ask
    const totalPremium = premium * quantity
    const maxProfit = selectedType === 'CALL'
      ? (100 - selectedStrike - premium) * quantity  // Max profit for call
      : (selectedStrike - premium) * quantity         // Max profit for put
    const maxLoss = totalPremium
    const breakeven = selectedType === 'CALL'
      ? selectedStrike + premium
      : selectedStrike - premium

    return {
      premium,
      totalPremium: Math.round(totalPremium * 100) / 100,
      maxProfit: Math.round(maxProfit * 100) / 100,
      maxLoss: Math.round(maxLoss * 100) / 100,
      breakeven: Math.round(breakeven * 100) / 100,
    }
  }, [selectedOption, quantity, selectedType, selectedStrike])

  // Select a strike from the chain
  const selectStrike = useCallback((strike) => {
    setSelectedStrike(strike)
  }, [])

  // Select option type
  const selectType = useCallback((type) => {
    setSelectedType(type)
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
    selectedOption,
    quantity,
    orderValue,

    // Actions
    selectExpiration,
    selectStrike,
    selectType,
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
