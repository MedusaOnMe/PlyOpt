import { useOptions } from '../../context/OptionsContext'
import ExpirationSelector from './ExpirationSelector'
import OptionsChainRow from './OptionsChainRow'
import { TrendingUp, TrendingDown } from 'lucide-react'

function OptionsChain() {
  const { optionsChain, spotPrice, selectedExpiration } = useOptions()

  if (!optionsChain.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="text-text-tertiary" size={24} />
          </div>
          <p className="text-text-secondary text-sm">Loading options chain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with expiration selector */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">Options Chain</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-tertiary">Spot:</span>
            <span className="text-accent-purple font-mono font-semibold text-glow-purple">
              {spotPrice}¢
            </span>
          </div>
        </div>
        <ExpirationSelector />
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-0 text-[10px] uppercase tracking-wider text-text-tertiary font-medium border-b border-glass-border bg-bg-secondary/50">
        {/* Call Headers */}
        <div className="grid grid-cols-5 gap-2 px-3 py-2">
          <div className="text-right">Vol</div>
          <div className="text-right">OI</div>
          <div className="text-right text-call">Bid</div>
          <div className="text-right text-call">Ask</div>
          <div className="text-right">Δ</div>
        </div>

        {/* Strike Header */}
        <div className="flex items-center justify-center px-4 border-x border-glass-border bg-bg-tertiary min-w-[80px]">
          <span>Strike</span>
        </div>

        {/* Put Headers */}
        <div className="grid grid-cols-5 gap-2 px-3 py-2">
          <div className="text-left">Δ</div>
          <div className="text-left text-put">Bid</div>
          <div className="text-left text-put">Ask</div>
          <div className="text-left">OI</div>
          <div className="text-left">Vol</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 px-4 py-2 text-[10px] text-text-tertiary border-b border-glass-border bg-bg-secondary/30">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-call" />
          <span>Calls</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-accent-purple/50" />
          <span>ATM Strike</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown size={12} className="text-put" />
          <span>Puts</span>
        </div>
      </div>

      {/* Options Chain Body */}
      <div className="flex-1 overflow-y-auto">
        {optionsChain.map((row) => (
          <OptionsChainRow key={row.strike} data={row} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-glass-border bg-bg-secondary/30">
        <div className="flex items-center justify-between text-[10px] text-text-tertiary">
          <span>
            {selectedExpiration?.daysToExpiry} days to expiration
          </span>
          <span>
            Click any row to trade
          </span>
        </div>
      </div>
    </div>
  )
}

export default OptionsChain
