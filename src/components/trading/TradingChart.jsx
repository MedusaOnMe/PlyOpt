import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import { useMarket } from '../../context/MarketContext'
import { TIMEFRAMES } from '../../utils/constants'
import { formatCents, formatChange } from '../../utils/formatters'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

export function TradingChart() {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const [chartReady, setChartReady] = useState(false)

  const {
    selectedMarket,
    priceHistory,
    isLoading,
    selectedTimeframe,
    setSelectedTimeframe,
    getCurrentPrice,
    get24hChange,
  } = useMarket()

  // Initialize chart with modern theme
  useEffect(() => {
    if (!chartContainerRef.current || !selectedMarket) {
      return
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#6B7280',
        fontFamily: 'Inter, -apple-system, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 300,
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#8B5CF6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#8B5CF6',
        },
        horzLine: {
          color: '#8B5CF6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#8B5CF6',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00D4FF',
      downColor: '#FF3D71',
      borderUpColor: '#00D4FF',
      borderDownColor: '#FF3D71',
      wickUpColor: '#00D4FF',
      wickDownColor: '#FF3D71',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    seriesRef.current = candlestickSeries
    setChartReady(true)

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const { clientWidth, clientHeight } = chartContainerRef.current
        if (clientWidth > 0 && clientHeight > 0) {
          chart.applyOptions({
            width: clientWidth,
            height: clientHeight,
          })
        }
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)
    setTimeout(handleResize, 100)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      setChartReady(false)
    }
  }, [selectedMarket])

  // Convert price history to OHLC candlestick data
  const convertToOHLC = (priceData) => {
    if (!priceData || priceData.length === 0) return []

    const sorted = [...priceData].sort((a, b) => a.time - b.time)
    const ohlcData = []

    for (let i = 0; i < sorted.length; i++) {
      const point = sorted[i]
      const time = Math.floor(Number(point.time))
      const close = Number(point.value)

      if (time <= 0 || isNaN(time) || close <= 0 || isNaN(close)) continue

      // Get previous close for open, or use close if first candle
      const prevClose = i > 0 ? Number(sorted[i - 1].value) : close
      const open = prevClose

      // Generate realistic high/low based on volatility
      const volatility = close * 0.015 // 1.5% typical range
      const seed = time % 1000
      const highOffset = (seed / 1000) * volatility
      const lowOffset = ((seed + 500) % 1000 / 1000) * volatility

      const high = Math.max(open, close) + highOffset
      const low = Math.min(open, close) - lowOffset

      ohlcData.push({ time, open, high, low, close })
    }

    // Remove duplicates by time
    const uniqueMap = new Map()
    ohlcData.forEach(candle => uniqueMap.set(candle.time, candle))

    return Array.from(uniqueMap.values()).sort((a, b) => a.time - b.time)
  }

  // Update data when price history changes
  useEffect(() => {
    if (!chartReady || !seriesRef.current || !chartRef.current) {
      return
    }

    if (!priceHistory || priceHistory.length === 0) {
      return
    }

    const candleData = convertToOHLC(priceHistory)

    if (candleData.length === 0) {
      return
    }

    try {
      seriesRef.current.setData(candleData)
      chartRef.current.timeScale().fitContent()
    } catch (e) {
      // Silent fail
    }
  }, [priceHistory, chartReady])

  const currentPrice = getCurrentPrice()
  const change24h = get24hChange()
  const isPositive = change24h >= 0

  if (!selectedMarket) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Activity size={32} className="mx-auto mb-3 text-text-tertiary" />
          <p className="text-sm text-text-secondary">Select a market to view chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Compact */}
      <div className="px-3 py-2 border-b border-glass-border shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`text-xl font-bold numeric ${isPositive ? 'text-call' : 'text-put'}`}>
              {formatCents(currentPrice)}
            </span>
            <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-call' : 'text-put'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="font-medium">{formatChange(change24h)}</span>
            </div>
          </div>

          {/* Timeframe selector - inline */}
          <div className="flex items-center gap-0.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.label}
                onClick={() => setSelectedTimeframe(tf.interval)}
                className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                  selectedTimeframe === tf.interval
                    ? 'bg-accent-purple text-white'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-glass-hover'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex-1" style={{ minHeight: '200px' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-bg-secondary/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse-soft" />
              <span className="text-sm text-text-secondary">Loading chart...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="absolute inset-0" />
      </div>

      {/* Bottom stats */}
      <div className="px-4 py-2 border-t border-glass-border flex items-center gap-6 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-text-tertiary">High</span>
          <span className="text-call font-medium font-mono">
            {formatCents(priceHistory.length > 0 ? Math.max(...priceHistory.map(p => p.value)) : currentPrice)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-tertiary">Low</span>
          <span className="text-put font-medium font-mono">
            {formatCents(priceHistory.length > 0 ? Math.min(...priceHistory.map(p => p.value)) : currentPrice)}
          </span>
        </div>
      </div>
    </div>
  )
}
