import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import { useMarket } from '../../context/MarketContext'
import { TIMEFRAMES } from '../../utils/constants'
import { formatCents, formatChange } from '../../utils/formatters'

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

  // Initialize chart with terminal theme
  useEffect(() => {
    if (!chartContainerRef.current || !selectedMarket) {
      return
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#0a0a0a' },
        textColor: '#606060',
        fontFamily: 'IBM Plex Mono, monospace',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 300,
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#00ff41',
          width: 1,
          style: 2,
          labelBackgroundColor: '#00ff41',
        },
        horzLine: {
          color: '#00ff41',
          width: 1,
          style: 2,
          labelBackgroundColor: '#00ff41',
        },
      },
      rightPriceScale: {
        borderColor: '#2a2a2a',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#2a2a2a',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    // Create area series with terminal green
    const areaSeries = chart.addAreaSeries({
      lineColor: '#00ff41',
      topColor: 'rgba(0, 255, 65, 0.2)',
      bottomColor: 'rgba(0, 255, 65, 0.0)',
      lineWidth: 1,
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
        lineColor: isPositive ? '#00ff41' : '#ff0040',
        topColor: isPositive ? 'rgba(0, 255, 65, 0.2)' : 'rgba(255, 0, 64, 0.2)',
        bottomColor: isPositive ? 'rgba(0, 255, 65, 0.0)' : 'rgba(255, 0, 64, 0.0)',
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
      <div className="bg-term-dark border border-term-border h-full flex items-center justify-center">
        <div className="text-xs text-term-text-dim">
          &gt; SELECT MARKET_
        </div>
      </div>
    )
  }

  return (
    <div className="bg-term-dark border border-term-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-term-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-term-text-dim uppercase tracking-wider mb-1 truncate">
              {selectedMarket.question}
            </p>
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-bold ${isPositive ? 'text-term-green term-glow' : 'text-term-red term-glow-red'}`}>
                {formatCents(currentPrice)}
              </span>
              <span className={`text-base ${isPositive ? 'text-term-green' : 'text-term-red'}`}>
                {formatChange(change24h)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 mt-3">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setSelectedTimeframe(tf.interval)}
              className={`px-2.5 py-1.5 text-xs transition-colors ${
                selectedTimeframe === tf.interval
                  ? 'text-term-green bg-term-green/10'
                  : 'text-term-text-dim hover:text-term-green'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex-1" style={{ minHeight: '250px' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-term-dark/80 flex items-center justify-center z-10">
            <span className="text-xs text-term-text-dim loading-dots">LOADING</span>
          </div>
        )}
        <div ref={chartContainerRef} className="absolute inset-0" />
      </div>

      {/* Bottom stats */}
      <div className="px-3 py-2 border-t border-term-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-term-text-dim">
          <span>
            H: <span className="text-term-green">
              {formatCents(priceHistory.length > 0 ? Math.max(...priceHistory.map(p => p.value)) : currentPrice)}
            </span>
          </span>
          <span>
            L: <span className="text-term-red">
              {formatCents(priceHistory.length > 0 ? Math.min(...priceHistory.map(p => p.value)) : currentPrice)}
            </span>
          </span>
        </div>
        <span className="text-term-text-dim">
          {priceHistory.length} PTS
        </span>
      </div>
    </div>
  )
}
