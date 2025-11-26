import { useState } from 'react'
import { useOptions } from '../../context/OptionsContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import OptionTypeToggle from './OptionTypeToggle'
import PremiumCalculator from './PremiumCalculator'
import GradientButton from '../ui/GradientButton'
import { Minus, Plus, Wallet, Info } from 'lucide-react'

function OptionsOrderPanel() {
  const {
    selectedOption,
    selectedType,
    selectedStrike,
    selectedExpiration,
    quantity,
    updateQuantity,
    orderValue,
    spotPrice,
  } = useOptions()

  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuantityChange = (delta) => {
    updateQuantity(quantity + delta)
  }

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || 1
    updateQuantity(value)
  }

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.warning('Please connect your wallet to trade')
      return
    }

    if (!selectedOption) {
      toast.error('Please select an option from the chain')
      return
    }

    setIsSubmitting(true)

    // Simulate order submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success(
      `Bought ${quantity} ${selectedType} option${quantity > 1 ? 's' : ''} at ${selectedStrike}¢ strike`
    )

    setIsSubmitting(false)
  }

  const isCall = selectedType === 'CALL'
  const buttonVariant = isCall ? 'call' : 'put'

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Trade Options</h2>
          {isAuthenticated && user?.balance !== undefined && (
            <div className="flex items-center gap-1.5 text-sm">
              <Wallet size={14} className="text-text-tertiary" />
              <span className="text-text-secondary">${user.balance.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Option Type Toggle */}
        <OptionTypeToggle />

        {/* Selected Option Info */}
        {selectedStrike && selectedExpiration ? (
          <div className="p-3 rounded-lg bg-bg-tertiary/50 border border-glass-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-text-tertiary uppercase tracking-wider mb-1">
                  Selected Contract
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${isCall ? 'badge-call' : 'badge-put'}`}>
                    {selectedType}
                  </span>
                  <span className="text-text-primary font-semibold numeric">
                    {selectedStrike}¢
                  </span>
                  <span className="text-text-tertiary text-sm">
                    {selectedExpiration.label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-tertiary">IV</div>
                <div className="text-accent-purple font-mono">
                  {selectedOption?.iv?.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-bg-tertiary/30 border border-dashed border-glass-border text-center">
            <Info size={20} className="mx-auto mb-2 text-text-tertiary" />
            <p className="text-sm text-text-tertiary">
              Select an option from the chain below
            </p>
          </div>
        )}

        {/* Quantity Selector */}
        <div>
          <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2">
            Quantity (Contracts)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-lg bg-bg-tertiary hover:bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Minus size={18} />
            </button>

            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              min={1}
              max={1000}
              className="flex-1 h-10 px-4 rounded-lg bg-bg-tertiary border border-glass-border text-center text-text-primary font-semibold numeric text-lg focus:border-accent-purple"
            />

            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 1000}
              className="w-10 h-10 rounded-lg bg-bg-tertiary hover:bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Quick quantity buttons */}
          <div className="flex gap-2 mt-2">
            {[1, 5, 10, 25, 100].map((qty) => (
              <button
                key={qty}
                onClick={() => updateQuantity(qty)}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                  quantity === qty
                    ? 'bg-accent-purple text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>
        </div>

        {/* Premium Calculator */}
        <PremiumCalculator />
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t border-glass-border">
        <GradientButton
          variant={buttonVariant}
          size="lg"
          fullWidth
          disabled={!selectedOption || !isAuthenticated}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          {!isAuthenticated
            ? 'Connect Wallet to Trade'
            : !selectedOption
              ? 'Select an Option'
              : `Buy ${selectedType} for $${orderValue?.totalPremium?.toFixed(2) || '0.00'}`
          }
        </GradientButton>

        {selectedOption && (
          <p className="text-center text-xs text-text-tertiary mt-2">
            {selectedExpiration?.daysToExpiry} days until expiration
          </p>
        )}
      </div>
    </div>
  )
}

export default OptionsOrderPanel
