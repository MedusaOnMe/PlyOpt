import { useMarket } from '../../context/MarketContext'
import { formatCompact, formatDate, formatPercent } from '../../utils/formatters'

export function MarketStats() {
  const { selectedMarket } = useMarket()

  if (!selectedMarket) return null

  const volume = selectedMarket.volumeNum || selectedMarket.volume || 0
  const volume24h = selectedMarket.volume24hr || volume * 0.1
  const liquidity = selectedMarket.liquidityNum || volume * 0.2
  const endDate = selectedMarket.endDate

  // Open interest - 0 for new platform (no real positions yet)
  const openInterest = 0

  // Funding rate - 0 for new platform
  const fundingRate = 0

  const stats = [
    { label: '24H_VOL', value: formatCompact(volume24h), color: 'text-term-cyan' },
    { label: 'OI', value: formatCompact(openInterest), color: 'text-term-green' },
    { label: 'TOTAL_VOL', value: formatCompact(volume), color: 'text-term-text' },
    { label: 'LIQUIDITY', value: formatCompact(liquidity), color: 'text-term-amber' },
    { label: 'FUNDING_8H', value: formatPercent(fundingRate, 4), color: fundingRate >= 0 ? 'text-term-green' : 'text-term-red' },
    { label: 'RESOLUTION', value: endDate ? formatDate(endDate) : 'TBD', color: 'text-term-text-dim' },
  ]

  return (
    <div className="bg-term-dark border border-term-border p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-term-text-dim uppercase tracking-wider">MARKET_STATS</span>
        <FundingCountdown />
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <div key={i}>
            <span className="text-xs text-term-text-dim">{stat.label}</span>
            <p className={`text-sm font-medium ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function FundingCountdown() {
  const now = new Date()
  const hours = now.getUTCHours()
  const nextFunding = Math.ceil(hours / 8) * 8
  const hoursLeft = nextFunding - hours - 1
  const minutesLeft = 60 - now.getUTCMinutes()

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-term-text-dim">NEXT_FUNDING:</span>
      <span className="text-sm text-term-green">
        {String(hoursLeft).padStart(2, '0')}:{String(minutesLeft).padStart(2, '0')}:00
      </span>
    </div>
  )
}
