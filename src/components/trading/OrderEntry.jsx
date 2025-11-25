import { useState, useMemo } from 'react'
import { ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react'
import { useMarket } from '../../context/MarketContext'
import { useAuth } from '../../context/AuthContext'
import { usePositions } from '../../context/PositionContext'
import { useToast } from '../../context/ToastContext'
import { LeverageSlider } from './LeverageSlider'
import { formatCents, formatPrice, calculateLiquidationPrice } from '../../utils/formatters'
import { TRADING_FEE_BPS } from '../../utils/constants'

export function OrderEntry() {
  const { selectedMarket, getCurrentPrice } = useMarket()
  const { user, isAuthenticated } = useAuth()
  const { openPosition } = usePositions()
  const toast = useToast()

  const [side, setSide] = useState('YES')
  const [orderType, setOrderType] = useState('market')
  const [size, setSize] = useState('')
  const [leverage, setLeverage] = useState(5)
  const [limitPrice, setLimitPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const currentPrice = getCurrentPrice()

  const calculations = useMemo(() => {
    const sizeNum = parseFloat(size) || 0
    const entryPrice = orderType === 'limit' ? parseFloat(limitPrice) || currentPrice : currentPrice
    const effectivePrice = side === 'YES' ? entryPrice : 1 - entryPrice

    const margin = sizeNum / leverage
    const shares = sizeNum / effectivePrice
    const potentialProfit = shares - sizeNum
    const fee = sizeNum * (TRADING_FEE_BPS / 10000)
    const liquidationPrice = calculateLiquidationPrice(entryPrice, leverage, side)

    return {
      margin,
      shares,
      potentialProfit,
      fee,
      liquidationPrice,
      roi: sizeNum > 0 ? (potentialProfit / sizeNum) * 100 : 0,
    }
  }, [size, leverage, side, currentPrice, orderType, limitPrice])

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Connect wallet first')
      return
    }

    if (!selectedMarket) {
      toast.error('Select a market')
      return
    }

    const sizeNum = parseFloat(size)
    if (!sizeNum || sizeNum <= 0) {
      toast.error('Enter valid size')
      return
    }

    if (calculations.margin > (user?.balance || 0)) {
      toast.error('Insufficient balance')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const entryPrice = orderType === 'limit' ? parseFloat(limitPrice) || currentPrice : currentPrice
      openPosition(selectedMarket, side, sizeNum, leverage, entryPrice)
      toast.success(`${side} position opened @ ${leverage}x`)
      setSize('')
    } catch (err) {
      toast.error(err.message || 'Failed to open position')
    } finally {
      setLoading(false)
    }
  }

  if (!selectedMarket) {
    return (
      <div className="bg-term-dark border border-term-border h-full flex items-center justify-center">
        <div className="text-xs text-term-text-dim">
          &gt; SELECT_MARKET_
        </div>
      </div>
    )
  }

  return (
    <div className="bg-term-dark border border-term-border overflow-hidden h-full flex flex-col">
      {/* Side selector */}
      <div className="grid grid-cols-2">
        <button
          onClick={() => setSide('YES')}
          className={`py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            side === 'YES'
              ? 'bg-white text-black'
              : 'bg-term-dark text-term-text-dim hover:text-term-text border-b border-term-border'
          }`}
        >
          <ArrowUp className="w-4 h-4" />
          LONG
        </button>
        <button
          onClick={() => setSide('NO')}
          className={`py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            side === 'NO'
              ? 'bg-white text-black'
              : 'bg-term-dark text-term-text-dim hover:text-term-text border-b border-term-border'
          }`}
        >
          <ArrowDown className="w-4 h-4" />
          SHORT
        </button>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-auto">
        {/* Order type */}
        <div className="flex gap-1">
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 text-xs font-medium transition-all border ${
              orderType === 'market'
                ? 'bg-white text-black border-white'
                : 'text-term-text-dim bg-term-dark hover:text-term-text border-term-border'
            }`}
          >
            MARKET
          </button>
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-2 text-xs font-medium transition-all border ${
              orderType === 'limit'
                ? 'bg-white text-black border-white'
                : 'text-term-text-dim bg-term-dark hover:text-term-text border-term-border'
            }`}
          >
            LIMIT
          </button>
        </div>

        {/* Limit price input */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-xs text-term-text-dim uppercase mb-1">
              Limit Price
            </label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={formatCents(currentPrice)}
              step="0.01"
              min="0.01"
              max="0.99"
              className="w-full bg-term-black border border-term-border px-3 py-2 text-sm text-term-text placeholder:text-term-text-dim"
            />
          </div>
        )}

        {/* Size input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-term-text-dim uppercase">Size (USD)</label>
            {isAuthenticated && (
              <span className="text-xs text-term-text-dim">
                BAL: <span className="text-term-text">{formatPrice(user?.balance)}</span>
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-term-text-dim text-sm">$</span>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="0.00"
              className="w-full bg-term-black border border-term-border pl-6 pr-3 py-2 text-sm text-term-text placeholder:text-term-text-dim"
            />
          </div>
          {/* Quick amount buttons */}
          <div className="flex gap-1 mt-1.5">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  if (user?.balance) {
                    setSize(((user.balance * pct) / 100).toFixed(2))
                  }
                }}
                disabled={!isAuthenticated}
                className="flex-1 py-1 text-xs text-term-text-dim hover:text-term-green hover:bg-term-green/10 transition-colors disabled:opacity-30"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Leverage slider */}
        <LeverageSlider value={leverage} onChange={setLeverage} />

        {/* Calculations */}
        <div className="space-y-1.5 pt-2 border-t border-term-border">
          <div className="flex justify-between text-xs">
            <span className="text-term-text-dim">ENTRY</span>
            <span className="text-term-text">
              {formatCents(orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : currentPrice)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-term-text-dim">MARGIN</span>
            <span className="text-term-text">{formatPrice(calculations.margin)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-term-text-dim">SHARES</span>
            <span className="text-term-text">{calculations.shares.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-term-text-dim">PROFIT</span>
            <span className="text-term-green">
              +{formatPrice(calculations.potentialProfit)} ({calculations.roi.toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-term-text-dim">FEE</span>
            <span className="text-term-text">{formatPrice(calculations.fee)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-term-amber flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              LIQ_PRICE
            </span>
            <span className="text-term-red">{formatCents(calculations.liquidationPrice)}</span>
          </div>
        </div>

        {/* Warning for high leverage */}
        {leverage >= 20 && (
          <div className="flex items-start gap-2 p-2 border border-term-amber/30 bg-term-amber/5">
            <AlertTriangle className="w-3 h-3 text-term-amber flex-shrink-0 mt-0.5" />
            <p className="text-xs text-term-amber">
              HIGH LEVERAGE - LIQUIDATION RISK
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !size || parseFloat(size) <= 0}
          className={`w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-30 ${
            side === 'YES'
              ? 'border border-term-green text-term-green hover:bg-term-green hover:text-term-black'
              : 'border border-term-red text-term-red hover:bg-term-red hover:text-term-black'
          }`}
        >
          {loading ? (
            <span className="loading-dots">EXECUTING</span>
          ) : (
            `> ${side === 'YES' ? 'LONG' : 'SHORT'} @ ${leverage}x`
          )}
        </button>

        {!isAuthenticated && (
          <p className="text-xs text-term-text-dim text-center">
            &gt; CONNECT_WALLET
          </p>
        )}
      </div>
    </div>
  )
}
