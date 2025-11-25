import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import { useMarket } from '../../context/MarketContext'
import { TIMEFRAMES } from '../../utils/constants'
import { formatCents, formatChange } from '../../utils/formatters'
import { ChartSkeleton } from '../ui/Skeleton'

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

  const [chartType, setChartType] = useState('area') // 'area' or 'candle'

  // Initialize chart - depends on selectedMarket because the container isn't rendered without it
  useEffect(() => {
    if (!chartContainerRef.current || !selectedMarket) {
      console.log('[Chart] Container not ready:', { hasContainer: !!chartContainerRef.current, hasMarket: !!selectedMarket })
      return
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#161b22' },
        textColor: '#8b949e',
      },
      grid: {
        vertLines: { color: '#21262d' },
        horzLines: { color: '#21262d' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 300,
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#58a6ff',
          width: 1,
          style: 2,
          labelBackgroundColor: '#58a6ff',
        },
        horzLine: {
          color: '#58a6ff',
          width: 1,
          style: 2,
          labelBackgroundColor: '#58a6ff',
        },
      },
      rightPriceScale: {
        borderColor: '#30363d',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#30363d',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    // Create area series
    const areaSeries = chart.addAreaSeries({
      lineColor: '#00d26a',
      topColor: 'rgba(0, 210, 106, 0.4)',
      bottomColor: 'rgba(0, 210, 106, 0.0)',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    seriesRef.current = areaSeries

    console.log('[Chart] Initialized with dimensions:', {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    })

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

    // Use ResizeObserver for better resize detection
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)

    // Initial resize after mount
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
      console.log('[Chart] Waiting for chart to be ready...', { chartReady })
      return
    }

    if (!priceHistory || priceHistory.length === 0) {
      console.log('[Chart] No price history data')
      return
    }

    // Prepare and validate data for lightweight-charts
    // Must be sorted by time ascending with unique timestamps
    const dataMap = new Map()
    priceHistory.forEach(point => {
      const time = Math.floor(Number(point.time))
      const value = Number(point.value)
      if (time > 0 && !isNaN(time) && value > 0 && !isNaN(value)) {
        dataMap.set(time, { time, value })
      }
    })

    const data = Array.from(dataMap.values()).sort((a, b) => a.time - b.time)

    console.log('[Chart] Setting data:', data.length, 'points')

    if (data.length === 0) {
      console.log('[Chart] No valid data points after processing')
      return
    }

    try {
      seriesRef.current.setData(data)

      // Update line color based on trend
      const isPositive = data.length >= 2
        ? data[data.length - 1].value >= data[0].value
        : true

      seriesRef.current.applyOptions({
        lineColor: isPositive ? '#00d26a' : '#ff3b69',
        topColor: isPositive ? 'rgba(0, 210, 106, 0.4)' : 'rgba(255, 59, 105, 0.4)',
        bottomColor: isPositive ? 'rgba(0, 210, 106, 0.0)' : 'rgba(255, 59, 105, 0.0)',
      })

      // Fit content
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
      <div className="bg-secondary rounded-lg border border-border p-6">
        <div className="text-center text-text-secondary">
          Select a market to view the chart
        </div>
      </div>
    )
  }

  return (
    <div className="bg-secondary rounded-lg border border-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm text-text-secondary mb-1">
              {selectedMarket.question}
            </h2>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-text-primary">
                {formatCents(currentPrice)}
              </span>
              <span className={`text-sm font-medium ${
                isPositive ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {formatChange(change24h)}
              </span>
            </div>
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                chartType === 'area'
                  ? 'bg-accent-blue/20 text-accent-blue'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('candle')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                chartType === 'candle'
                  ? 'bg-accent-blue/20 text-accent-blue'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Candles
            </button>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-2 mt-4">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setSelectedTimeframe(tf.interval)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedTimeframe === tf.interval
                  ? 'bg-tertiary text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-tertiary/50'
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
          <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center z-10">
            <div className="text-text-secondary">Loading...</div>
          </div>
        )}
        <div ref={chartContainerRef} className="absolute inset-0" />
      </div>

      {/* Bottom stats */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-4">
          <span>
            High: <span className="text-accent-green font-medium">
              {formatCents(priceHistory.length > 0 ? Math.max(...priceHistory.map(p => p.value)) : currentPrice)}
            </span>
          </span>
          <span>
            Low: <span className="text-accent-red font-medium">
              {formatCents(priceHistory.length > 0 ? Math.min(...priceHistory.map(p => p.value)) : currentPrice)}
            </span>
          </span>
        </div>
        <span>
          Data points: {priceHistory.length}
        </span>
      </div>
    </div>
  )
}
