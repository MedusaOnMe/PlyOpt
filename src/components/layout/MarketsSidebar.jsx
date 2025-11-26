import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, Activity, Star, Clock, ChevronRight, BarChart2 } from 'lucide-react'
import { useMarket } from '../../context/MarketContext'
import { formatCents, formatChange, formatCompact } from '../../utils/formatters'

export function MarketsSidebar() {
  const { markets, selectedMarket, selectMarket, isLoading } = useMarket()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'trending', 'watchlist'

  const filteredMarkets = markets.filter(market =>
    market.question?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort by volume for trending
  const sortedMarkets = filter === 'trending'
    ? [...filteredMarkets].sort((a, b) => (b.volume24hr || b.volumeNum || 0) - (a.volume24hr || a.volumeNum || 0))
    : filteredMarkets

  return (
    <aside className="w-72 glass-solid flex flex-col h-full border-r border-glass-border">
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <BarChart2 size={16} className="text-accent-purple" />
            Markets
          </h2>
          <span className="text-xs text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full">
            {markets.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-tertiary border border-glass-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mt-3">
          <FilterTab
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            icon={<Clock size={12} />}
            label="All"
          />
          <FilterTab
            active={filter === 'trending'}
            onClick={() => setFilter('trending')}
            icon={<TrendingUp size={12} />}
            label="Hot"
          />
          <FilterTab
            active={filter === 'watchlist'}
            onClick={() => setFilter('watchlist')}
            icon={<Star size={12} />}
            label="Saved"
          />
        </div>
      </div>

      {/* Market list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-text-tertiary">
              <Activity className="w-4 h-4 animate-pulse" />
              Loading markets...
            </div>
          </div>
        ) : sortedMarkets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-text-tertiary">No markets found</p>
          </div>
        ) : (
          <div className="py-2">
            {sortedMarkets.map((market) => (
              <MarketItem
                key={market.id}
                market={market}
                isSelected={selectedMarket?.id === market.id}
                onSelect={() => selectMarket(market)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="p-3 border-t border-glass-border bg-bg-secondary/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-tertiary">
            <div className="w-2 h-2 rounded-full bg-profit animate-pulse" />
            <span>Live</span>
          </div>
          <span className="text-text-tertiary">
            {sortedMarkets.length} results
          </span>
        </div>
      </div>
    </aside>
  )
}

function FilterTab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
        active
          ? 'bg-accent-purple/20 text-accent-purple'
          : 'text-text-tertiary hover:text-text-secondary hover:bg-glass-hover'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function MarketItem({ market, isSelected, onSelect }) {
  const yesPrice = market.yesPrice || 0.5
  const volume = market.volume24hr || market.volumeNum || 0

  // Calculate fake 24h change (seeded by market id for consistency)
  const seed = parseInt(market.id, 36) || 0
  const change = ((seed % 100) - 45) / 500
  const isPositive = change >= 0

  return (
    <button
      onClick={onSelect}
      className={`w-full px-4 py-3 text-left transition-all relative group ${
        isSelected
          ? 'bg-accent-purple/10'
          : 'hover:bg-glass-hover'
      }`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-purple rounded-r-full" />
      )}

      {/* Market question */}
      <p className={`text-sm line-clamp-2 mb-2 leading-snug ${
        isSelected ? 'text-text-primary font-medium' : 'text-text-secondary group-hover:text-text-primary'
      }`}>
        {market.question}
      </p>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Price */}
          <div className="flex items-center gap-1">
            <span className={`text-sm font-bold font-mono ${
              isSelected ? 'text-accent-purple' : 'text-text-primary'
            }`}>
              {formatCents(yesPrice)}
            </span>
          </div>

          {/* Change */}
          <div className={`flex items-center gap-0.5 text-xs ${
            isPositive ? 'text-profit' : 'text-loss'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="font-mono">{formatChange(change)}</span>
          </div>
        </div>

        {/* Volume */}
        <span className="text-xs text-text-tertiary font-mono">
          ${formatCompact(volume)}
        </span>
      </div>

      {/* Probability bar */}
      <div className="mt-2 h-1 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isSelected
              ? 'bg-gradient-to-r from-accent-purple to-call'
              : 'bg-text-tertiary/30'
          }`}
          style={{ width: `${yesPrice * 100}%` }}
        />
      </div>

      {/* Hover arrow */}
      <ChevronRight className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all ${
        isSelected
          ? 'text-accent-purple opacity-100'
          : 'text-text-tertiary opacity-0 group-hover:opacity-100'
      }`} />
    </button>
  )
}

export default MarketsSidebar
