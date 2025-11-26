import { useOptions } from '../../context/OptionsContext'
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react'

function PremiumCalculator() {
  const { selectedOption, orderValue, quantity, selectedType } = useOptions()

  if (!selectedOption || !orderValue) {
    return (
      <div className="p-4 rounded-lg bg-bg-tertiary/50 border border-glass-border">
        <div className="text-center text-text-tertiary text-sm py-4">
          Select an option from the chain to see order details
        </div>
      </div>
    )
  }

  const isCall = selectedType === 'CALL'

  return (
    <div className="space-y-4">
      {/* Premium Display */}
      <div className="p-4 rounded-lg bg-bg-tertiary/50 border border-glass-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-text-tertiary text-xs uppercase tracking-wider">Premium</span>
          <span className="text-text-tertiary text-xs">per contract</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold numeric ${isCall ? 'text-call text-glow-call' : 'text-put text-glow-put'}`}>
            ${orderValue.premium.toFixed(2)}
          </span>
          <span className="text-text-secondary text-sm">× {quantity}</span>
        </div>
        <div className="mt-2 pt-2 border-t border-glass-border">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Total Cost</span>
            <span className="text-text-primary font-semibold numeric">
              ${orderValue.totalPremium.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Risk/Reward Summary */}
      <div className="grid grid-cols-2 gap-3">
        {/* Max Profit */}
        <div className="p-3 rounded-lg bg-profit/10 border border-profit/20">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} className="text-profit" />
            <span className="text-xs text-profit uppercase tracking-wider">Max Profit</span>
          </div>
          <div className="text-lg font-semibold text-profit numeric">
            {orderValue.maxProfit > 0 ? `$${orderValue.maxProfit.toFixed(2)}` : 'Unlimited'}
          </div>
        </div>

        {/* Max Loss */}
        <div className="p-3 rounded-lg bg-loss/10 border border-loss/20">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={14} className="text-loss" />
            <span className="text-xs text-loss uppercase tracking-wider">Max Loss</span>
          </div>
          <div className="text-lg font-semibold text-loss numeric">
            ${orderValue.maxLoss.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Breakeven */}
      <div className="p-3 rounded-lg bg-bg-tertiary/50 border border-glass-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target size={14} className="text-accent-purple" />
            <span className="text-xs text-text-tertiary uppercase tracking-wider">Breakeven</span>
          </div>
          <span className="text-accent-purple font-semibold numeric text-glow-purple">
            {orderValue.breakeven.toFixed(0)}¢
          </span>
        </div>
        <div className="mt-2 text-xs text-text-tertiary">
          {isCall
            ? `Price must exceed ${orderValue.breakeven.toFixed(0)}¢ at expiry to profit`
            : `Price must fall below ${orderValue.breakeven.toFixed(0)}¢ at expiry to profit`
          }
        </div>
      </div>

      {/* Greeks Summary */}
      {selectedOption.data && (
        <div className="p-3 rounded-lg bg-bg-tertiary/30 border border-glass-border">
          <div className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Greeks</div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-[10px] text-text-tertiary">Δ Delta</div>
              <div className={`text-sm font-mono ${selectedOption.data.delta >= 0 ? 'text-call' : 'text-put'}`}>
                {selectedOption.data.delta > 0 ? '+' : ''}{selectedOption.data.delta.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary">Γ Gamma</div>
              <div className="text-sm font-mono text-accent-purple">
                {selectedOption.data.gamma.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary">Θ Theta</div>
              <div className="text-sm font-mono text-put">
                {selectedOption.data.theta.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary">V Vega</div>
              <div className="text-sm font-mono text-accent-purple">
                {selectedOption.data.vega.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PremiumCalculator
