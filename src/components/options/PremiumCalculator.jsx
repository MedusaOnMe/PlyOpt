import { useOptions } from '../../context/OptionsContext'
import { TrendingUp, TrendingDown, Target } from 'lucide-react'

function PremiumCalculator() {
  const { selectedOption, orderValue, quantity, selectedType } = useOptions()

  if (!selectedOption || !orderValue) {
    return (
      <div className="p-2 rounded-lg bg-bg-tertiary/50 border border-glass-border">
        <div className="text-center text-text-tertiary text-xs py-2">
          Select option to see details
        </div>
      </div>
    )
  }

  const isCall = selectedType === 'CALL'

  return (
    <div className="space-y-2">
      {/* Premium Display */}
      <div className="p-2 rounded-lg bg-bg-tertiary/50 border border-glass-border">
        <div className="flex items-center justify-between">
          <span className="text-text-tertiary text-[10px] uppercase">Premium</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold font-mono ${isCall ? 'text-call' : 'text-put'}`}>
              ${orderValue.premium.toFixed(2)}
            </span>
            <span className="text-text-tertiary text-[10px]">× {quantity}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-glass-border/50">
          <span className="text-text-secondary text-xs">Total</span>
          <span className="text-text-primary font-semibold font-mono text-sm">
            ${orderValue.totalPremium.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Risk/Reward + Breakeven in one row */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="p-2 rounded bg-profit/10 border border-profit/20">
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingUp size={10} className="text-profit" />
            <span className="text-[9px] text-profit uppercase">Max Profit</span>
          </div>
          <div className="text-xs font-semibold text-profit font-mono">
            {orderValue.maxProfit > 0 ? `$${orderValue.maxProfit.toFixed(0)}` : '∞'}
          </div>
        </div>

        <div className="p-2 rounded bg-loss/10 border border-loss/20">
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingDown size={10} className="text-loss" />
            <span className="text-[9px] text-loss uppercase">Max Loss</span>
          </div>
          <div className="text-xs font-semibold text-loss font-mono">
            ${orderValue.maxLoss.toFixed(0)}
          </div>
        </div>

        <div className="p-2 rounded bg-accent-purple/10 border border-accent-purple/20">
          <div className="flex items-center gap-1 mb-0.5">
            <Target size={10} className="text-accent-purple" />
            <span className="text-[9px] text-accent-purple uppercase">Breakeven</span>
          </div>
          <div className="text-xs font-semibold text-accent-purple font-mono">
            {orderValue.breakeven.toFixed(0)}¢
          </div>
        </div>
      </div>

      {/* Greeks inline */}
      {selectedOption.data && (
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-bg-tertiary/30 border border-glass-border">
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-text-tertiary">Greeks:</span>
            <span className={`font-mono ${selectedOption.data.delta >= 0 ? 'text-call' : 'text-put'}`}>
              Δ {selectedOption.data.delta > 0 ? '+' : ''}{selectedOption.data.delta.toFixed(2)}
            </span>
            <span className="font-mono text-text-secondary">
              Γ {selectedOption.data.gamma.toFixed(3)}
            </span>
            <span className="font-mono text-put">
              Θ {selectedOption.data.theta.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PremiumCalculator
