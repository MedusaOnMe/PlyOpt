import { useState } from 'react'
import { useOptions } from '../../context/OptionsContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import OptionTypeToggle from './OptionTypeToggle'
import PremiumCalculator from './PremiumCalculator'
import GradientButton from '../ui/GradientButton'
import { Minus, Plus, Wallet, ArrowUpCircle, ArrowDownCircle, AlertTriangle } from 'lucide-react'

function OptionsOrderPanel() {
  const {
    selectedOption,
    selectedType,
    selectedStrike,
    selectedExpiration,
    positionDirection,
    selectDirection,
    quantity,
    updateQuantity,
    orderValue,
  } = useOptions()

  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if selected option has liquidity
  const isOptionAvailable = selectedOption?.data?.available ?? false

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

    if (!isOptionAvailable) {
      toast.error('This option has no liquidity - no writers available')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const action = positionDirection === 'BUY' ? 'Bought' : 'Sold'
    toast.success(`${action} ${quantity} ${selectedType} at ${selectedStrike}¢`)
    setIsSubmitting(false)
  }

  const isCall = selectedType === 'CALL'
  const isBuying = positionDirection === 'BUY'
  const buttonVariant = isCall ? 'call' : 'put'

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-glass-border flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-text-primary">Trade Options</h2>
        {isAuthenticated && user?.balance !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            <Wallet size={12} className="text-text-tertiary" />
            <span className="text-text-secondary font-mono">${user.balance.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Buy/Sell Toggle */}
        <div className="flex rounded-lg bg-bg-tertiary p-0.5">
          <button
            onClick={() => selectDirection('BUY')}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md
              font-semibold text-xs transition-all duration-200
              ${isBuying
                ? 'bg-call text-bg-primary shadow-glow-call'
                : 'text-text-secondary hover:text-call hover:bg-call/10'
              }
            `}
          >
            <ArrowUpCircle size={14} />
            <span>BUY</span>
          </button>

          <button
            onClick={() => selectDirection('SELL')}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md
              font-semibold text-xs transition-all duration-200
              ${!isBuying
                ? 'bg-put text-bg-primary shadow-glow-put'
                : 'text-text-secondary hover:text-put hover:bg-put/10'
              }
            `}
          >
            <ArrowDownCircle size={14} />
            <span>SELL</span>
          </button>
        </div>

        {/* Option Type Toggle */}
        <OptionTypeToggle />

        {/* Selected Option Info */}
        {selectedStrike && selectedExpiration ? (
          <div className={`p-2 rounded-lg border ${isOptionAvailable ? 'bg-bg-tertiary/50 border-glass-border' : 'bg-loss/10 border-loss/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isBuying ? 'bg-call/20 text-call' : 'bg-put/20 text-put'}`}>
                  {positionDirection}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isCall ? 'bg-call/20 text-call' : 'bg-put/20 text-put'}`}>
                  {selectedType}
                </span>
                <span className="text-text-primary font-semibold font-mono text-sm">
                  {selectedStrike}¢
                </span>
                <span className="text-text-tertiary text-xs">
                  {selectedExpiration.label}
                </span>
              </div>
              <span className="text-accent-purple font-mono text-xs">
                IV {selectedOption?.iv?.toFixed(0)}%
              </span>
            </div>
            {/* Write Option Prompt */}
            {!isOptionAvailable && (
              <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-accent-purple/10 to-accent-cyan/10 border border-accent-purple/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold text-accent-purple bg-accent-purple/20 px-1.5 py-0.5 rounded">
                    NEW MARKET
                  </span>
                  <span className="text-[10px] font-semibold text-text-primary">Be the first writer!</span>
                </div>
                <p className="text-[9px] text-text-secondary leading-relaxed">
                  No one has written this option yet. Sell to open a position and earn premium as the market maker.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-bg-tertiary/30 border border-dashed border-glass-border text-center">
            <p className="text-xs text-text-tertiary">Select option from chain</p>
          </div>
        )}

        {/* Quantity Selector */}
        <div>
          <label className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1.5">
            Contracts
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded bg-bg-tertiary hover:bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50 transition-all"
            >
              <Minus size={14} />
            </button>

            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              min={1}
              max={1000}
              className="flex-1 h-8 px-2 rounded bg-bg-tertiary border border-glass-border text-center text-text-primary font-semibold font-mono text-sm focus:border-accent-purple"
            />

            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 1000}
              className="w-8 h-8 rounded bg-bg-tertiary hover:bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50 transition-all"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Quick quantity buttons */}
          <div className="flex gap-1 mt-1.5">
            {[1, 5, 10, 25, 100].map((qty) => (
              <button
                key={qty}
                onClick={() => updateQuantity(qty)}
                className={`flex-1 py-1 rounded text-[10px] font-medium transition-all ${
                  quantity === qty
                    ? 'bg-accent-purple text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated'
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
      <div className="p-3 border-t border-glass-border shrink-0">
        <GradientButton
          variant={!isOptionAvailable && selectedOption ? 'outline' : (isBuying ? 'call' : 'put')}
          size="md"
          fullWidth
          disabled={!selectedOption || !isAuthenticated || (isBuying && !isOptionAvailable)}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          {!isAuthenticated
            ? 'Connect Wallet'
            : !selectedOption
              ? 'Select Option'
              : !isOptionAvailable
                ? isBuying
                  ? 'No Sellers — Cannot Buy'
                  : `Write ${selectedType} — Create Liquidity`
                : isBuying
                  ? `Buy ${selectedType} — Pay $${orderValue?.totalPremium?.toFixed(2) || '0'}`
                  : `Sell ${selectedType} — Receive $${orderValue?.totalPremium?.toFixed(2) || '0'}`
          }
        </GradientButton>

        {/* Risk Warning for Selling */}
        {!isBuying && selectedOption && (
          <p className="text-[9px] text-put/80 text-center mt-2">
            {isOptionAvailable
              ? 'Writing options has unlimited loss potential. Margin required.'
              : 'Be the first to write this option. You set the price.'}
          </p>
        )}
      </div>
    </div>
  )
}

export default OptionsOrderPanel
