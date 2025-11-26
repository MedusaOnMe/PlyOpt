import { useOptions } from '../../context/OptionsContext'
import ExpirationSelector from './ExpirationSelector'
import OptionsChainRow from './OptionsChainRow'
import { TrendingUp } from 'lucide-react'

function OptionsChain() {
  const { optionsChain, spotPrice, selectedExpiration } = useOptions()

  if (!optionsChain.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="text-text-tertiary" size={20} />
          </div>
          <p className="text-text-secondary text-sm">Loading options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with expiration selector */}
      <div className="px-3 py-2 border-b border-glass-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-text-primary">Options Chain</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-tertiary">Spot:</span>
            <span className="text-accent-purple font-mono font-semibold">
              {spotPrice}¢
            </span>
          </div>
        </div>
        <ExpirationSelector />
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_60px_1fr] gap-0 text-[9px] uppercase tracking-wider text-text-tertiary font-medium border-b border-glass-border bg-bg-secondary/50 shrink-0">
        {/* Call Headers */}
        <div className="grid grid-cols-4 gap-1 px-2 py-1.5">
          <div className="text-right">IV</div>
          <div className="text-right text-call">Bid</div>
          <div className="text-right text-call">Ask</div>
          <div className="text-right">Δ</div>
        </div>

        {/* Strike Header */}
        <div className="flex items-center justify-center border-x border-glass-border bg-bg-tertiary">
          <span>Strike</span>
        </div>

        {/* Put Headers */}
        <div className="grid grid-cols-4 gap-1 px-2 py-1.5">
          <div className="text-left">Δ</div>
          <div className="text-left text-put">Bid</div>
          <div className="text-left text-put">Ask</div>
          <div className="text-left">IV</div>
        </div>
      </div>

      {/* Options Chain Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {optionsChain.map((row) => (
          <OptionsChainRow key={row.strike} data={row} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-glass-border bg-bg-secondary/30 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-text-tertiary">
          <span>{selectedExpiration?.daysToExpiry} DTE</span>
          <span>Click to trade</span>
        </div>
      </div>
    </div>
  )
}

export default OptionsChain
