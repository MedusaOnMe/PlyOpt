import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { fetchMarkets, fetchOrderBook, fetchPriceHistory } from '../api/polymarket'
import { subscribeToMarket } from '../api/websocket'
import { TIMEFRAMES } from '../utils/constants'

const MarketContext = createContext(null)

export function MarketProvider({ children }) {
  const [markets, setMarkets] = useState([])
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] })
  const [priceHistory, setPriceHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d')

  // Fetch markets on mount
  useEffect(() => {
    loadMarkets()
  }, [])

  // Fetch order book and price history when market changes
  useEffect(() => {
    if (selectedMarket) {
      loadMarketData(selectedMarket)
    }
  }, [selectedMarket, selectedTimeframe])

  // Auto-refresh price data every 30 seconds (reduced since we have WebSocket)
  useEffect(() => {
    if (!selectedMarket) return

    const interval = setInterval(() => {
      loadMarketData(selectedMarket, true)
    }, 30000)

    return () => clearInterval(interval)
  }, [selectedMarket])

  // Subscribe to real-time WebSocket updates
  useEffect(() => {
    if (!selectedMarket) return

    const tokenId = selectedMarket.tokenIds?.[0] || selectedMarket.clobTokenIds?.[0]
    if (!tokenId || tokenId.startsWith('mock-')) return

    const unsubscribe = subscribeToMarket(
      tokenId,
      (newPrice) => {
        setSelectedMarket(prev => prev ? { ...prev, yesPrice: newPrice } : prev)
      },
      (newBook) => {
        if (newBook.bids?.length > 0 || newBook.asks?.length > 0) {
          setOrderBook(newBook)
        }
      }
    )

    return () => {
      unsubscribe()
    }
  }, [selectedMarket?.id])

  const loadMarkets = async () => {
    setIsLoading(true)
    try {
      const data = await fetchMarkets({ limit: 100 })
      setMarkets(data)

      // Select first market by default
      if (data.length > 0 && !selectedMarket) {
        setSelectedMarket(data[0])
      }
    } catch (error) {
      console.error('Failed to load markets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMarketData = async (market, silent = false) => {
    if (!silent) setIsLoading(true)

    try {
      // Get the first token ID for order book and price history
      const tokenId = market.tokenIds?.[0] || market.clobTokenIds?.[0] || market.conditionId
      // Use the real price from the market for fallback mock data
      const basePrice = market.yesPrice || 0.5
      // Get fidelity from the selected timeframe
      const timeframeConfig = TIMEFRAMES.find(tf => tf.interval === selectedTimeframe) || TIMEFRAMES[2]
      const fidelity = timeframeConfig.fidelity

      console.log('Loading market data for:', market.question?.slice(0, 40), 'tokenId:', tokenId?.slice(0, 20), 'basePrice:', basePrice, 'fidelity:', fidelity)

      const [bookData, historyData] = await Promise.all([
        fetchOrderBook(tokenId, basePrice),
        fetchPriceHistory(tokenId, selectedTimeframe, basePrice, fidelity),
      ])

      setOrderBook(bookData)
      setPriceHistory(historyData)
    } catch (error) {
      console.error('Failed to load market data:', error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const selectMarket = (market) => {
    setSelectedMarket(market)
  }

  const getCurrentPrice = () => {
    if (!selectedMarket) return 0.5
    // Use the pre-parsed yesPrice from normalized data
    return selectedMarket.yesPrice || 0.5
  }

  const get24hChange = () => {
    // Calculate from price history
    if (priceHistory.length < 2) return 0
    const oldPrice = priceHistory[0].value
    const newPrice = priceHistory[priceHistory.length - 1].value
    if (!oldPrice || oldPrice === 0) return 0
    return (newPrice - oldPrice) / oldPrice
  }

  const value = {
    markets,
    selectedMarket,
    orderBook,
    priceHistory,
    isLoading,
    selectedTimeframe,
    setSelectedTimeframe,
    selectMarket,
    getCurrentPrice,
    get24hChange,
    refreshMarkets: loadMarkets,
  }

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket() {
  const context = useContext(MarketContext)
  if (!context) {
    throw new Error('useMarket must be used within MarketProvider')
  }
  return context
}
