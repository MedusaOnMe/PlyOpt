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

    // Create area series with cyan color
    const areaSeries = chart.addAreaSeries({
      lineColor: '#00D4FF',
      topColor: 'rgba(0, 212, 255, 0.2)',
      bottomColor: 'rgba(0, 212, 255, 0.0)',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    seriesRef.current = areaSeries
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

  // Update data when price history changes
  useEffect(() => {
    if (!chartReady || !seriesRef.current || !chartRef.current) {
      return
    }

    if (!priceHistory || priceHistory.length === 0) {
      return
    }

    const dataMap = new Map()
    priceHistory.forEach(point => {
      const time = Math.floor(Number(point.time))
      const value = Number(point.value)
      if (time > 0 && !isNaN(time) && value > 0 && !isNaN(value)) {
        dataMap.set(time, { time, value })
      }
    })

    const data = Array.from(dataMap.values()).sort((a, b) => a.time - b.time)

    if (data.length === 0) {
      return
    }

    try {
      seriesRef.current.setData(data)

      const isPositive = data.length >= 2
        ? data[data.length - 1].value >= data[0].value
        : true

      seriesRef.current.applyOptions({
        lineColor: isPositive ? '#00D4FF' : '#FF3D71',
        topColor: isPositive ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 61, 113, 0.2)',
        bottomColor: isPositive ? 'rgba(0, 212, 255, 0.0)' : 'rgba(255, 61, 113, 0.0)',
      })

      chartRef.current.timeScale().fitContent()
    } catch (e) {
      console.error('[Chart] Error setting data:', e)
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
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-tertiary mb-1 truncate">
              {selectedMarket.question}
            </p>
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-bold numeric ${isPositive ? 'text-call text-glow-call' : 'text-put text-glow-put'}`}>
                {formatCents(currentPrice)}
              </span>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-call' : 'text-put'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-sm font-medium">{formatChange(change24h)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 mt-4">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setSelectedTimeframe(tf.interval)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedTimeframe === tf.interval
                  ? 'bg-accent-purple text-white shadow-glow-purple'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-glass-hover'
              }`}
            >
              {tf.label}
            </button>
          ))}
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
      <div className="px-4 py-3 border-t border-glass-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-text-tertiary">24h High</span>
            <span className="text-call font-medium numeric">
              {formatCents(priceHistory.length > 0 ? Math.max(...priceHistory.map(p => p.value)) : currentPrice)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-tertiary">24h Low</span>
            <span className="text-put font-medium numeric">
              {formatCents(priceHistory.length > 0 ? Math.min(...priceHistory.map(p => p.value)) : currentPrice)}
            </span>
          </div>
        </div>
        <span className="text-text-tertiary">
          {priceHistory.length} data points
        </span>
      </div>
    </div>
  )
}
