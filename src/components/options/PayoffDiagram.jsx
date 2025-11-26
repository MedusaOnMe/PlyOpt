import { useMemo } from 'react'
import { useOptions } from '../../context/OptionsContext'
import { TrendingUp, TrendingDown } from 'lucide-react'

function PayoffDiagram() {
  const { selectedOption, orderValue, selectedType, selectedStrike, spotPrice, quantity } = useOptions()

  const chartData = useMemo(() => {
    if (!selectedOption || !orderValue) return null

    const premium = orderValue.premium * quantity
    const strike = selectedStrike
    const isCall = selectedType === 'CALL'

    const minPrice = Math.max(0, spotPrice * 0.7)
    const maxPrice = spotPrice * 1.3
    const step = (maxPrice - minPrice) / 100

    const points = []
    for (let price = minPrice; price <= maxPrice; price += step) {
      let pnl
      if (isCall) {
        pnl = Math.max(0, price - strike) * quantity - premium
      } else {
        pnl = Math.max(0, strike - price) * quantity - premium
      }
      points.push({ price, pnl })
    }

    const maxPnl = Math.max(...points.map(p => p.pnl))
    const minPnl = Math.min(...points.map(p => p.pnl))
    const pnlRange = maxPnl - minPnl || 1

    return { points, minPrice, maxPrice, maxPnl, minPnl, pnlRange, breakeven: orderValue.breakeven, strike, premium, isCall }
  }, [selectedOption, orderValue, selectedType, selectedStrike, spotPrice, quantity])

  if (!chartData) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-3 py-2 border-b border-glass-border shrink-0">
          <h3 className="text-xs font-semibold text-text-primary">Payoff Diagram</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-text-tertiary text-xs">
            <TrendingUp size={24} className="mx-auto mb-1 opacity-50" />
            <p>Select option to see payoff</p>
          </div>
        </div>
      </div>
    )
  }

  const { points, minPrice, maxPrice, maxPnl, minPnl, pnlRange, breakeven, strike, isCall } = chartData

  // SVG dimensions - wider aspect ratio
  const width = 500
  const height = 160
  const padding = { top: 15, right: 15, bottom: 25, left: 45 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const xScale = (price) => padding.left + ((price - minPrice) / (maxPrice - minPrice)) * chartWidth
  const yScale = (pnl) => padding.top + chartHeight - ((pnl - minPnl) / pnlRange) * chartHeight

  const pathD = points.map((p, i) => {
    const x = xScale(p.price)
    const y = yScale(p.pnl)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  const zeroY = yScale(0)

  const profitPath = points
    .filter(p => p.pnl >= 0)
    .map((p, i, arr) => {
      const x = xScale(p.price)
      const y = yScale(p.pnl)
      if (i === 0) return `M ${x} ${zeroY} L ${x} ${y}`
      if (i === arr.length - 1) return `L ${x} ${y} L ${x} ${zeroY}`
      return `L ${x} ${y}`
    }).join(' ') + ' Z'

  const lossPath = points
    .filter(p => p.pnl < 0)
    .map((p, i, arr) => {
      const x = xScale(p.price)
      const y = yScale(p.pnl)
      if (i === 0) return `M ${x} ${zeroY} L ${x} ${y}`
      if (i === arr.length - 1) return `L ${x} ${y} L ${x} ${zeroY}`
      return `L ${x} ${y}`
    }).join(' ') + ' Z'

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-glass-border flex items-center justify-between shrink-0">
        <h3 className="text-xs font-semibold text-text-primary">Payoff at Expiry</h3>
        <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
          <span className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-accent-purple" /> Strike
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-accent-gold" /> BE
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${isCall ? 'bg-call/20 text-call' : 'bg-put/20 text-put'}`}>
            {selectedType}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-2 min-h-0">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isCall ? '#00D4FF' : '#FF3D71'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isCall ? '#00D4FF' : '#FF3D71'} stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lossGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Zero line */}
          <line x1={padding.left} y1={zeroY} x2={width - padding.right} y2={zeroY} stroke="rgba(255,255,255,0.1)" strokeDasharray="4,4" />

          {/* Fill areas */}
          {profitPath !== ' Z' && <path d={profitPath} fill="url(#profitGradient)" />}
          {lossPath !== ' Z' && <path d={lossPath} fill="url(#lossGradient)" />}

          {/* Payoff line */}
          <path d={pathD} fill="none" stroke={isCall ? '#00D4FF' : '#FF3D71'} strokeWidth="2" strokeLinecap="round" />

          {/* Strike line */}
          <line x1={xScale(strike)} y1={padding.top} x2={xScale(strike)} y2={height - padding.bottom} stroke="#8B5CF6" strokeWidth="1" strokeDasharray="4,4" />
          <text x={xScale(strike)} y={height - padding.bottom + 12} fill="#8B5CF6" fontSize="9" textAnchor="middle">{strike}¢</text>

          {/* Breakeven line */}
          <line x1={xScale(breakeven)} y1={padding.top} x2={xScale(breakeven)} y2={height - padding.bottom} stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
          <text x={xScale(breakeven)} y={padding.top - 4} fill="#F59E0B" fontSize="9" textAnchor="middle">{breakeven.toFixed(0)}¢</text>

          {/* Spot marker */}
          <circle cx={xScale(spotPrice)} cy={zeroY} r="3" fill="#8B5CF6" />
          <text x={xScale(spotPrice)} y={zeroY + 12} fill="#9CA3AF" fontSize="8" textAnchor="middle">Spot</text>

          {/* Y-axis labels */}
          <text x={padding.left - 4} y={yScale(maxPnl)} fill="#10B981" fontSize="9" textAnchor="end" dominantBaseline="middle">+${maxPnl.toFixed(0)}</text>
          <text x={padding.left - 4} y={zeroY} fill="#6B7280" fontSize="9" textAnchor="end" dominantBaseline="middle">$0</text>
          <text x={padding.left - 4} y={yScale(minPnl)} fill="#EF4444" fontSize="9" textAnchor="end" dominantBaseline="middle">-${Math.abs(minPnl).toFixed(0)}</text>

          {/* X-axis labels */}
          <text x={padding.left} y={height - 5} fill="#6B7280" fontSize="8" textAnchor="start">{minPrice.toFixed(0)}¢</text>
          <text x={width - padding.right} y={height - 5} fill="#6B7280" fontSize="8" textAnchor="end">{maxPrice.toFixed(0)}¢</text>
        </svg>
      </div>
    </div>
  )
}

export default PayoffDiagram
