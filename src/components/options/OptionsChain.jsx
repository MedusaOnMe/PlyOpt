import { useOptions } from '../../context/OptionsContext'
import ExpirationSelector from './ExpirationSelector'
import OptionsChainRow from './OptionsChainRow'
import { TrendingUp, Activity } from 'lucide-react'

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

  // Calculate chain stats
  const totalCallVolume = optionsChain.reduce((sum, row) => sum + row.call.volume, 0)
  const totalPutVolume = optionsChain.reduce((sum, row) => sum + row.put.volume, 0)
  const totalCallOI = optionsChain.reduce((sum, row) => sum + row.call.openInterest, 0)
  const totalPutOI = optionsChain.reduce((sum, row) => sum + row.put.openInterest, 0)
  const putCallRatio = totalCallVolume > 0 ? (totalPutVolume / totalCallVolume).toFixed(2) : '0.00'

  return (
    <div className="h-full flex flex-col">
      {/* Header with expiration selector */}
      <div className="px-3 py-2 border-b border-glass-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-text-primary">Options Chain</h2>
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-accent-purple" />
              <span className="text-[10px] text-text-tertiary">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="text-text-tertiary">Spot</span>
              <span className="text-accent-purple font-mono font-semibold">{spotPrice}¢</span>
            </div>
            <div className="h-3 w-px bg-glass-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-text-tertiary">P/C</span>
              <span className={`font-mono font-medium ${parseFloat(putCallRatio) > 1 ? 'text-put' : 'text-call'}`}>
                {putCallRatio}
              </span>
            </div>
          </div>
        </div>
        <ExpirationSelector />
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-0 text-[8px] uppercase tracking-wider text-text-tertiary font-medium border-b border-glass-border bg-bg-secondary/50 shrink-0">
        {/* Call Headers - OI, Vol, Δ, γ, Ask, Bid, IV */}
        <div className="grid grid-cols-7 gap-0.5 px-1.5 py-1.5">
          <div className="text-right">OI</div>
          <div className="text-right">Vol</div>
          <div className="text-right text-call">Delta</div>
          <div className="text-right">Gamma</div>
          <div className="text-right text-call">Ask</div>
          <div className="text-right text-call">Bid</div>
          <div className="text-right">IV</div>
        </div>

        {/* Strike Header */}
        <div className="flex items-center justify-center px-2 border-x border-glass-border/50 bg-bg-tertiary/80">
          <span className="font-semibold">Strike</span>
        </div>

        {/* Put Headers - IV, Bid, Ask, γ, Δ, Vol, OI */}
        <div className="grid grid-cols-7 gap-0.5 px-1.5 py-1.5">
          <div className="text-left">IV</div>
          <div className="text-left text-put">Bid</div>
          <div className="text-left text-put">Ask</div>
          <div className="text-left">Gamma</div>
          <div className="text-left text-put">Delta</div>
          <div className="text-left">Vol</div>
          <div className="text-left">OI</div>
        </div>
      </div>

      {/* Options Chain Body */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        {optionsChain.map((row) => (
          <OptionsChainRow key={row.strike} data={row} />
        ))}
      </div>

      {/* Footer with stats */}
      <div className="px-3 py-1.5 border-t border-glass-border bg-bg-secondary/30 shrink-0">
        <div className="flex items-center justify-between text-[9px] text-text-tertiary">
          <div className="flex items-center gap-3">
            <span>{selectedExpiration?.daysToExpiry} DTE</span>
            <span className="text-text-quaternary">|</span>
            <span>Vol: <span className="text-call">{(totalCallVolume/1000).toFixed(1)}K</span> / <span className="text-put">{(totalPutVolume/1000).toFixed(1)}K</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span>OI: <span className="text-call">{(totalCallOI/1000).toFixed(1)}K</span> / <span className="text-put">{(totalPutOI/1000).toFixed(1)}K</span></span>
            <span className="text-text-quaternary">|</span>
            <span className="text-accent-purple">Click to trade</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptionsChain
