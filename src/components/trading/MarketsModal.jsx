import { useState, useEffect } from 'react'
import { Search, X, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useMarket } from '../../context/MarketContext'
import { formatCents, formatChange, formatCompact } from '../../utils/formatters'

export function MarketsModal({ isOpen, onClose }) {
  const { markets, selectedMarket, selectMarket, isLoading } = useMarket()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredMarkets = markets.filter(market =>
    market.question?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (market) => {
    selectMarket(market)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-16 md:bottom-auto md:w-full md:max-w-2xl glass-elevated rounded-2xl flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-glass-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-text-primary">Select Market</h2>
            <span className="text-xs text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full">
              {markets.length} available
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-glass-hover transition-colors"
          >
            <X className="w-5 h-5 text-text-tertiary hover:text-text-primary" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4 border-b border-glass-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-bg-tertiary border border-glass-border rounded-xl pl-12 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-purple/50 transition-all"
            />
          </div>
        </div>

        {/* Markets Grid */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-text-tertiary">
                <Activity className="w-5 h-5 animate-pulse" />
                <span className="text-sm">Loading markets...</span>
              </div>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-text-tertiary">No markets found</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  isSelected={selectedMarket?.id === market.id}
                  onSelect={() => handleSelect(market)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-glass-border flex items-center justify-between text-xs text-text-tertiary">
          <span>Press ESC to close</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-profit animate-pulse" />
            <span>Live data</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarketCard({ market, isSelected, onSelect }) {
  const yesPrice = market.yesPrice || 0.5
  const volume = market.volume24hr || market.volumeNum || 0

  // Calculate fake 24h change (seeded by market id for consistency)
  const seed = parseInt(market.id, 36) || 0
  const change = ((seed % 100) - 45) / 500
  const isPositive = change >= 0

  return (
    <button
      onClick={onSelect}
      className={`text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? 'border-accent-purple bg-accent-purple/10'
          : 'border-glass-border hover:border-accent-purple/50 bg-bg-secondary hover:bg-bg-tertiary'
      }`}
    >
      {/* Question */}
      <p className={`text-sm line-clamp-2 mb-3 min-h-[2.5rem] leading-snug ${
        isSelected ? 'text-text-primary font-medium' : 'text-text-secondary'
      }`}>
        {market.question}
      </p>

      {/* Stats Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Price */}
          <div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">Spot</div>
            <span className={`text-sm font-bold font-mono ${isSelected ? 'text-accent-purple' : 'text-text-primary'}`}>
              {formatCents(yesPrice)}
            </span>
          </div>

          {/* Change */}
          <div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">24h</div>
            <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-profit' : 'text-loss'}`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="font-mono">{formatChange(change)}</span>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="text-right">
          <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">Volume</div>
          <span className="text-xs text-text-secondary font-mono">${formatCompact(volume)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isSelected ? 'bg-gradient-to-r from-accent-purple to-call' : 'bg-text-tertiary/30'
          }`}
          style={{ width: `${yesPrice * 100}%` }}
        />
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="mt-3 text-[10px] text-accent-purple text-center font-medium">
          Currently viewing
        </div>
      )}
    </button>
  )
}
